import { useState, useEffect } from "react";
import { Upload, User, FileCheck, ShieldAlert, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FileUploadSubmission from "@/components/FileUploadSubmission";
import { formatDisplayName } from "@/lib/displayUtils";

interface Student {
  id: string;
  full_name: string;
}

type GradingStage = "idle" | "uploading" | "submitted" | "grading" | "graded" | "error";

interface TeacherUploadGradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  assignmentTitle: string;
  assignmentDescription?: string;
  classId: string;
  gradeLevel?: string;
  subject?: string;
  onComplete: () => void;
}

const TeacherUploadGradeDialog = ({
  open,
  onOpenChange,
  assignmentId,
  assignmentTitle,
  assignmentDescription,
  classId,
  gradeLevel = "Middle School",
  subject = "General",
  onComplete,
}: TeacherUploadGradeDialogProps) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<GradingStage>("idle");
  const [stageMessage, setStageMessage] = useState("");

  useEffect(() => {
    if (open && classId) {
      fetchStudents();
    }
  }, [open, classId]);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("id, full_name")
      .eq("class_id", classId)
      .order("full_name");

    if (error) {
      toast({ title: "Error", description: "Failed to load students", variant: "destructive" });
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  };

  const handleFileUploaded = (url: string) => {
    setUploadedFileUrl(url);
  };

  const handleFileRemoved = () => {
    setUploadedFileUrl(null);
  };

  const handleUploadAndGrade = async () => {
    if (!selectedStudentId || !uploadedFileUrl) return;

    try {
      // Stage 1: Create/update submission
      setStage("submitted");
      setStageMessage("Creating submission record...");

      const { data: existingSub } = await supabase
        .from("student_submissions")
        .select("id")
        .eq("assignment_id", assignmentId)
        .eq("student_id", selectedStudentId)
        .single();

      let submissionId: string;

      if (existingSub) {
        await supabase
          .from("student_submissions")
          .update({
            handwriting_image_url: uploadedFileUrl,
            status: "submitted",
            submitted_at: new Date().toISOString(),
          })
          .eq("id", existingSub.id);
        submissionId = existingSub.id;
      } else {
        const { data: newSub, error: insertErr } = await supabase
          .from("student_submissions")
          .insert({
            assignment_id: assignmentId,
            student_id: selectedStudentId,
            handwriting_image_url: uploadedFileUrl,
            status: "submitted",
            submitted_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (insertErr) throw insertErr;
        submissionId = newSub!.id;
      }

      // Stage 2: Trigger AI grading
      setStage("grading");
      setStageMessage("Solvia AI is analyzing the assessment...");

      const rubricText = assignmentDescription || "Grade based on overall quality, accuracy, and completeness.";

      const { data: gradeData, error: gradeError } = await supabase.functions.invoke("grade-submission", {
        body: {
          submissionId,
          subject,
          gradeLevel,
          taskType: "Assessment",
          taskPrompt: assignmentDescription || assignmentTitle || "Complete the assessment.",
          rubricText,
          maxPoints: 100,
        },
      });

      if (gradeError) throw gradeError;
      if (gradeData?.error) throw new Error(gradeData.error);

      // Stage 3: Mark as graded (draft — not released)
      await supabase
        .from("student_submissions")
        .update({ status: "graded" })
        .eq("id", submissionId);

      setStage("graded");
      setStageMessage("AI grading complete! Feedback is saved as draft for your review.");

      toast({
        title: "Grading Complete",
        description: "AI feedback is ready. Review it before releasing to the student.",
      });

      // Auto-close after short delay
      setTimeout(() => {
        resetForm();
        onComplete();
        onOpenChange(false);
      }, 2000);
    } catch (error: any) {
      console.error("Upload & grade error:", error);
      setStage("error");
      setStageMessage(error.message || "Something went wrong. The submission is saved — you can retry grading from the review screen.");
      toast({
        title: "Grading Error",
        description: "The file was uploaded but AI grading encountered an issue. You can grade manually.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedStudentId("");
    setUploadedFileUrl(null);
    setStage("idle");
    setStageMessage("");
  };

  const getProgressValue = () => {
    switch (stage) {
      case "idle": return 0;
      case "uploading": return 20;
      case "submitted": return 40;
      case "grading": return 70;
      case "graded": return 100;
      case "error": return 100;
      default: return 0;
    }
  };

  const isProcessing = stage === "submitted" || stage === "grading";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && !isProcessing) {
        resetForm();
        onOpenChange(false);
      }
    }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Upload & Auto-Grade
          </DialogTitle>
          <DialogDescription>
            Upload a scanned assessment. Solvia AI will automatically grade it and prepare feedback for your review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* FERPA Privacy Reminder */}
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-300 dark:border-amber-700">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">FERPA Privacy Reminder</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Do <strong>not</strong> include student names on scanned assessments. Students should use <strong>nicknames or ID codes only</strong>.
              </p>
            </div>
          </div>

          {/* Assignment Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Assignment: {assignmentTitle}</p>
          </div>

          {/* Student Selection */}
          <div>
            <Label>Select Student</Label>
            <Select
              value={selectedStudentId}
              onValueChange={setSelectedStudentId}
              disabled={loading || isProcessing}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={loading ? "Loading students..." : "Choose a student"} />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {formatDisplayName(student.full_name)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          {!isProcessing && stage !== "graded" && (
            <FileUploadSubmission
              onFileUploaded={handleFileUploaded}
              onFileRemoved={handleFileRemoved}
              bucketName="submissions"
              folderPath={`${assignmentId}/teacher-uploads`}
              label="Upload Scanned Assessment"
              description="Upload a scanned or photographed assessment (PDF or image). Ensure all work is clearly visible."
              maxSizeMB={15}
            />
          )}

          {/* Upload Status */}
          {uploadedFileUrl && stage === "idle" && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <FileCheck className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">
                File ready — click below to start AI grading
              </span>
            </div>
          )}

          {/* Processing Progress */}
          {(isProcessing || stage === "graded" || stage === "error") && (
            <div className="space-y-3 p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                {stage === "graded" ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : stage === "error" ? (
                  <AlertCircle className="w-6 h-6 text-destructive" />
                ) : (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {stage === "graded" ? "Grading Complete" : stage === "error" ? "Error" : "Processing..."}
                  </p>
                  <p className="text-xs text-muted-foreground">{stageMessage}</p>
                </div>
              </div>
              <Progress value={getProgressValue()} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className={stage !== "idle" ? "text-primary font-medium" : ""}>Upload</span>
                <span className={stage === "grading" || stage === "graded" ? "text-primary font-medium" : ""}>AI Grading</span>
                <span className={stage === "graded" ? "text-primary font-medium" : ""}>Draft Ready</span>
              </div>

              {stage === "graded" && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Next step:</strong> Review the AI-generated feedback in the submission details, then release it to the student when ready.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              if (!isProcessing) {
                resetForm();
                onOpenChange(false);
              }
            }}
            disabled={isProcessing}
          >
            {stage === "graded" ? "Close" : "Cancel"}
          </Button>
          {stage === "idle" && (
            <Button
              onClick={handleUploadAndGrade}
              disabled={!selectedStudentId || !uploadedFileUrl}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upload & Grade with AI
            </Button>
          )}
  );
};

export default TeacherUploadGradeDialog;

import { useState, useEffect } from "react";
import { Upload, User, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FileUploadSubmission from "@/components/FileUploadSubmission";
import { formatDisplayName } from "@/lib/displayUtils";

interface Student {
  id: string;
  full_name: string;
}

interface TeacherUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  assignmentTitle: string;
  classId: string;
  onUploadComplete: () => void;
}

const TeacherUploadDialog = ({
  open,
  onOpenChange,
  assignmentId,
  assignmentTitle,
  classId,
  onUploadComplete,
}: TeacherUploadDialogProps) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleFileUploaded = (url: string, fileType: string) => {
    setUploadedFileUrl(url);
    setUploadedFileType(fileType);
  };

  const handleFileRemoved = () => {
    setUploadedFileUrl(null);
    setUploadedFileType(null);
  };

  const handleSubmit = async () => {
    if (!selectedStudentId) {
      toast({ title: "Error", description: "Please select a student", variant: "destructive" });
      return;
    }

    if (!uploadedFileUrl) {
      toast({ title: "Error", description: "Please upload a file", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      // Check if submission already exists
      const { data: existingSubmission } = await supabase
        .from("student_submissions")
        .select("id")
        .eq("assignment_id", assignmentId)
        .eq("student_id", selectedStudentId)
        .single();

      if (existingSubmission) {
        // Update existing submission
        const { error } = await supabase
          .from("student_submissions")
          .update({
            handwriting_image_url: uploadedFileUrl,
            status: "submitted",
            submitted_at: new Date().toISOString(),
          })
          .eq("id", existingSubmission.id);

        if (error) throw error;
      } else {
        // Create new submission
        const { error } = await supabase
          .from("student_submissions")
          .insert({
            assignment_id: assignmentId,
            student_id: selectedStudentId,
            handwriting_image_url: uploadedFileUrl,
            status: "submitted",
            submitted_at: new Date().toISOString(),
          });

        if (error) throw error;
      }

      toast({ 
        title: "Success", 
        description: "Paper test uploaded successfully for grading" 
      });
      
      // Reset form
      setSelectedStudentId("");
      setUploadedFileUrl(null);
      setUploadedFileType(null);
      onUploadComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to save submission", 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedStudentId("");
    setUploadedFileUrl(null);
    setUploadedFileType(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { 
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Paper Test
          </DialogTitle>
          <DialogDescription>
            Upload a scanned or photographed paper test for a student who completed the assignment offline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
              disabled={loading}
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
          <FileUploadSubmission
            onFileUploaded={handleFileUploaded}
            onFileRemoved={handleFileRemoved}
            bucketName="submissions"
            folderPath={`${assignmentId}/teacher-uploads`}
            label="Upload Scanned Test"
            description="Upload the scanned paper test (PDF or image). Make sure all work is clearly visible."
            maxSizeMB={15}
          />

          {/* Upload Status */}
          {uploadedFileUrl && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <FileCheck className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">
                File ready for submission
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedStudentId || !uploadedFileUrl || submitting}
          >
            {submitting ? "Submitting..." : "Submit for Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherUploadDialog;

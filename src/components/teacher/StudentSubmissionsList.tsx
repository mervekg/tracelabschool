import { useState } from "react";
import { ArrowLeft, User, Clock, CheckCircle, AlertCircle, Download, FileText, ExternalLink, Upload, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import TeacherUploadDialog from "./TeacherUploadDialog";
import TeacherUploadGradeDialog from "./TeacherUploadGradeDialog";

interface StudentSubmission {
  id: string;
  student_id: string;
  content: string | null;
  status: string;
  submitted_at: string | null;
  ai_feedback: string | null;
  teacher_feedback: string | null;
  score: number | null;
  handwriting_image_url?: string | null;
  student?: {
    full_name: string;
  };
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  pdf_url?: string | null;
  external_link?: string | null;
  assignment_type?: string | null;
}

interface StudentSubmissionsListProps {
  assignment: Assignment;
  submissions: StudentSubmission[];
  classId: string;
  onBack: () => void;
  onSelectSubmission: (submission: StudentSubmission) => void;
  onRefresh?: () => void;
}

const StudentSubmissionsList = ({ 
  assignment, 
  submissions,
  classId,
  onBack, 
  onSelectSubmission,
  onRefresh,
}: StudentSubmissionsListProps) => {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge variant="default">Submitted</Badge>;
      case "reviewed":
        return <Badge className="bg-green-600">Reviewed</Badge>;
      case "pending":
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="w-4 h-4 text-primary" />;
      case "reviewed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const downloadSubmission = async (submission: StudentSubmission) => {
    const studentName = submission.student?.full_name || "Unknown";
    const content = [];
    
    content.push(`Student: ${studentName}`);
    content.push(`Assignment: ${assignment.title}`);
    content.push(`Status: ${submission.status}`);
    content.push(`Submitted: ${submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : "Not submitted"}`);
    content.push("");
    
    if (submission.content) {
      content.push("=== Student Response ===");
      content.push(submission.content);
      content.push("");
    }
    
    if (submission.ai_feedback) {
      content.push("=== AI Feedback ===");
      content.push(submission.ai_feedback);
      content.push("");
    }
    
    if (submission.teacher_feedback) {
      content.push("=== Teacher Feedback ===");
      content.push(submission.teacher_feedback);
      content.push("");
    }
    
    if (submission.score !== null) {
      content.push(`Score: ${submission.score}`);
    }

    const blob = new Blob([content.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${studentName.replace(/\s+/g, "_")}_${assignment.title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Downloaded", description: `${studentName}'s submission downloaded` });
  };

  const downloadAllSubmissions = async () => {
    if (submissions.length === 0) {
      toast({ title: "No submissions", description: "There are no submissions to download", variant: "destructive" });
      return;
    }

    setDownloading(true);
    
    const allContent: string[] = [];
    allContent.push(`Assignment: ${assignment.title}`);
    allContent.push(`Total Submissions: ${submissions.length}`);
    allContent.push(`Downloaded: ${new Date().toLocaleString()}`);
    allContent.push("=".repeat(50));
    allContent.push("");

    submissions.forEach((submission, index) => {
      const studentName = submission.student?.full_name || "Unknown";
      allContent.push(`--- Submission ${index + 1}: ${studentName} ---`);
      allContent.push(`Status: ${submission.status}`);
      allContent.push(`Submitted: ${submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : "Not submitted"}`);
      
      if (submission.content) {
        allContent.push("");
        allContent.push("Response:");
        allContent.push(submission.content);
      }
      
      if (submission.ai_feedback) {
        allContent.push("");
        allContent.push("AI Feedback:");
        allContent.push(submission.ai_feedback);
      }
      
      if (submission.teacher_feedback) {
        allContent.push("");
        allContent.push("Teacher Feedback:");
        allContent.push(submission.teacher_feedback);
      }
      
      if (submission.score !== null) {
        allContent.push(`Score: ${submission.score}`);
      }
      
      allContent.push("");
      allContent.push("=".repeat(50));
      allContent.push("");
    });

    const blob = new Blob([allContent.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${assignment.title.replace(/\s+/g, "_")}_all_submissions.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setDownloading(false);
    toast({ title: "Downloaded", description: `All ${submissions.length} submissions downloaded` });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h3 className="font-semibold text-lg">{assignment.title}</h3>
            <p className="text-sm text-muted-foreground">
              {submissions.length} student entries
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Upload Paper Test Button */}
          <Button 
            variant="outline" 
            onClick={() => setUploadDialogOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Paper Test
          </Button>
          <Button 
            variant="outline" 
            onClick={downloadAllSubmissions}
            disabled={downloading || submissions.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? "Downloading..." : "Download All"}
          </Button>
        </div>
      </div>

      {/* Teacher Upload Dialog */}
      <TeacherUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        assignmentId={assignment.id}
        assignmentTitle={assignment.title}
        classId={classId}
        onUploadComplete={() => onRefresh?.()}
      />

      {/* FERPA Privacy Notice */}
      <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-300 dark:border-amber-700">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          <strong className="text-amber-800 dark:text-amber-300">FERPA Reminder:</strong> When uploading scanned assessments, ensure no student names appear on the documents. Students should use nicknames or ID codes only.
        </p>
      </div>

      {/* Assignment Details */}
      <Card>
        <CardContent className="p-4 space-y-3">
          {assignment.description && (
            <p className="text-sm text-muted-foreground">{assignment.description}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {assignment.pdf_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={assignment.pdf_url} target="_blank" rel="noopener noreferrer">
                  <FileText className="w-4 h-4 mr-1" />
                  View PDF
                </a>
              </Button>
            )}
            {assignment.external_link && (
              <Button variant="outline" size="sm" asChild>
                <a href={assignment.external_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open Link
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No student entries yet</p>
            <p className="text-sm">Students haven't submitted their work</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {submissions.map((submission) => (
            <Card
              key={submission.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onSelectSubmission(submission)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(submission.status)}
                  <div>
                    <p className="font-medium">
                      {submission.student?.full_name || "Unknown Student"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {submission.submitted_at 
                        ? `Submitted: ${new Date(submission.submitted_at).toLocaleString()}`
                        : "Not submitted"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadSubmission(submission);
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  {submission.score !== null && (
                    <Badge variant="outline">{submission.score} pts</Badge>
                  )}
                  {getStatusBadge(submission.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentSubmissionsList;

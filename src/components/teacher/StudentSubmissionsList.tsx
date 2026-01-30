import { ArrowLeft, User, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StudentSubmission {
  id: string;
  student_id: string;
  content: string | null;
  status: string;
  submitted_at: string | null;
  ai_feedback: string | null;
  teacher_feedback: string | null;
  score: number | null;
  student?: {
    full_name: string;
    email: string;
  };
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
}

interface StudentSubmissionsListProps {
  assignment: Assignment;
  submissions: StudentSubmission[];
  onBack: () => void;
  onSelectSubmission: (submission: StudentSubmission) => void;
}

const StudentSubmissionsList = ({ 
  assignment, 
  submissions, 
  onBack, 
  onSelectSubmission 
}: StudentSubmissionsListProps) => {
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

  return (
    <div className="space-y-4">
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

      {assignment.description && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{assignment.description}</p>
          </CardContent>
        </Card>
      )}

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

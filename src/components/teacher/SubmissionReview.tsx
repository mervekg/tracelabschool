import { useState } from "react";
import {
  ArrowLeft, Bot, User, Save, Sparkles, Download, Send,
  Loader2, FileText, Image, Link as LinkIcon, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAIGrading, type AIGradeResult } from "@/hooks/useAIGrading";

interface StudentSubmission {
  id: string;
  student_id: string;
  content: string | null;
  handwriting_image_url: string | null;
  status: string;
  submitted_at: string | null;
  ai_feedback: string | null;
  teacher_feedback: string | null;
  score: number | null;
  response_text?: string | null;
  file_url?: string | null;
  ai_grade_json?: any;
  overall_grade?: number | null;
  student?: {
    full_name: string;
  };
}

interface SubmissionReviewProps {
  submission: StudentSubmission;
  assignmentTitle?: string;
  assignmentDescription?: string;
  gradeLevel?: string;
  subject?: string;
  rubricId?: string;
  onBack: () => void;
  onUpdate: () => void;
}

const SubmissionReview = ({
  submission,
  assignmentTitle,
  assignmentDescription,
  gradeLevel = "Middle School",
  subject = "General",
  onBack,
  onUpdate,
}: SubmissionReviewProps) => {
  const { toast } = useToast();
  const [teacherFeedback, setTeacherFeedback] = useState(submission.teacher_feedback || "");
  const [saving, setSaving] = useState(false);
  const [acceptAI, setAcceptAI] = useState(true);

  // Parse existing AI grade if available
  const existingGrade = submission.ai_grade_json as AIGradeResult | null;

  const [gradeResult, setGradeResult] = useState<AIGradeResult | null>(existingGrade);
  const [adjustedScores, setAdjustedScores] = useState<Record<string, number>>(() => {
    if (existingGrade?.per_dimension_scores) {
      const scores: Record<string, number> = {};
      existingGrade.per_dimension_scores.forEach((d) => {
        scores[d.dimension] = d.points;
      });
      return scores;
    }
    return {};
  });

  const { gradeSubmission, isGrading } = useAIGrading({
    onSuccess: (result) => {
      setGradeResult(result);
      const scores: Record<string, number> = {};
      result.per_dimension_scores.forEach((d) => {
        scores[d.dimension] = d.points;
      });
      setAdjustedScores(scores);
    },
  });

  // Compute total from adjusted scores
  const totalScore = Object.values(adjustedScores).reduce((a, b) => a + b, 0);
  const maxPoints = gradeResult?.overall?.max_points || 100;
  const percent = maxPoints > 0 ? Math.round((totalScore / maxPoints) * 100) : 0;

  const studentContent = submission.response_text || submission.content || "";
  const hasImage = !!submission.handwriting_image_url;
  const hasFile = !!submission.file_url;

  // Build rubric text from assignment description (simplified — in production fetch real rubric)
  const rubricText = assignmentDescription || "Grade based on overall quality, accuracy, and completeness.";

  const handleRunAIGrading = async () => {
    await gradeSubmission({
      submissionId: submission.id,
      subject,
      gradeLevel,
      taskType: "Assignment",
      taskPrompt: assignmentDescription || assignmentTitle || "Complete the assignment.",
      rubricText,
      maxPoints: 100,
    });
  };

  const handleSave = async (sendToStudent = false) => {
    setSaving(true);

    const finalScore = acceptAI ? totalScore : totalScore;
    const { error } = await supabase
      .from("student_submissions")
      .update({
        teacher_feedback: teacherFeedback || null,
        score: finalScore,
        overall_grade: finalScore,
        status: sendToStudent ? "reviewed" : "graded",
        updated_at: new Date().toISOString(),
      })
      .eq("id", submission.id);

    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: sendToStudent ? "Feedback Sent" : "Saved", description: sendToStudent ? "Feedback sent to student!" : "Progress saved." });
      onUpdate();
    }
  };

  const downloadSubmission = () => {
    const studentName = submission.student?.full_name || "Unknown";
    const lines = [
      `Student: ${studentName}`,
      assignmentTitle ? `Assignment: ${assignmentTitle}` : "",
      `Status: ${submission.status}`,
      `Submitted: ${submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : "N/A"}`,
      "",
      "=== Student Response ===",
      studentContent || "(no text)",
      "",
    ];
    if (gradeResult) {
      lines.push("=== AI Grading ===");
      gradeResult.per_dimension_scores.forEach((d) => {
        lines.push(`${d.dimension}: ${d.points}/${d.max_points} — ${d.teacher_rationale}`);
      });
      lines.push(`\nTotal: ${gradeResult.overall.total_points}/${gradeResult.overall.max_points} (${gradeResult.overall.percent}%)`);
      lines.push(`\nTeacher Summary: ${gradeResult.overall.summary_for_teacher}`);
    }
    if (teacherFeedback) {
      lines.push("\n=== Teacher Feedback ===");
      lines.push(teacherFeedback);
    }

    const blob = new Blob([lines.filter(Boolean).join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${studentName.replace(/\s+/g, "_")}_review.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded" });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h3 className="font-semibold text-lg">
              {submission.student?.full_name || "Unknown Student"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {assignmentTitle} •{" "}
              {submission.status === "reviewed" ? "Released" : submission.status === "graded" ? "Draft — Not Released" : "Pending Review"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadSubmission}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Badge variant={submission.status === "reviewed" || submission.status === "graded" ? "default" : "secondary"}>
            {submission.status}
          </Badge>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* ─── LEFT: Student Work (3/5) ─── */}
        <div className="lg:col-span-3 space-y-4">
          {/* Original work preview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                Student Submission
                <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                  {hasImage && <Badge variant="outline" className="text-xs"><Image className="w-3 h-3 mr-1" />Image</Badge>}
                  {hasFile && <Badge variant="outline" className="text-xs"><FileText className="w-3 h-3 mr-1" />File</Badge>}
                  {!hasImage && !hasFile && <Badge variant="outline" className="text-xs"><LinkIcon className="w-3 h-3 mr-1" />Text</Badge>}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {submission.handwriting_image_url && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Original Handwriting</p>
                  <img
                    src={submission.handwriting_image_url}
                    alt="Student handwriting"
                    className="max-w-full rounded-md border"
                  />
                </div>
              )}
              {submission.file_url && (
                <div className="mb-3">
                  <Button variant="outline" size="sm" asChild>
                    <a href={submission.file_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-1" />
                      View uploaded file
                    </a>
                  </Button>
                </div>
              )}
              {studentContent ? (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    {hasImage || hasFile ? "Normalized Text (OCR)" : "Student Response"}
                  </p>
                  <div className="p-3 bg-muted rounded-md max-h-[400px] overflow-y-auto">
                    <p className="whitespace-pre-wrap text-sm">{studentContent}</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground italic text-sm">
                  No text content yet.{" "}
                  {(hasImage || hasFile) && "Run AI Grading to extract text via OCR."}
                </p>
              )}
              {submission.submitted_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Submitted {new Date(submission.submitted_at).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Teacher Comments */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Your Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={teacherFeedback}
                onChange={(e) => setTeacherFeedback(e.target.value)}
                placeholder="Write your personal feedback for the student..."
                rows={4}
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleSave(false)} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── RIGHT: AI Grading Panel (2/5) ─── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Run AI Grading Button */}
          <Button
            onClick={handleRunAIGrading}
            disabled={isGrading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-primary-foreground h-12 text-base"
          >
            {isGrading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Grading with AI…
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Run AI Grading
              </>
            )}
          </Button>

          {/* Solvia Pre-Analysis */}
          {gradeResult && (
            <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Solvia Pre-Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-3 rounded-lg bg-card border border-border">
                  <p className="font-medium text-sm mb-1">📋 Teacher Summary</p>
                  <p className="text-xs text-muted-foreground">{gradeResult.overall.summary_for_teacher}</p>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <p className="font-medium text-sm mb-1">💬 Student Feedback</p>
                  <p className="text-xs text-muted-foreground">{gradeResult.overall.summary_for_student}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rubric Scores */}
          {gradeResult && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Rubric Scores</CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch checked={acceptAI} onCheckedChange={setAcceptAI} />
                    <span className="text-xs text-muted-foreground">Accept AI</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {gradeResult.per_dimension_scores.map((dim) => (
                  <div key={dim.dimension}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{dim.dimension}</p>
                      <p className="text-sm font-bold tabular-nums">
                        {adjustedScores[dim.dimension] ?? dim.points}/{dim.max_points}
                      </p>
                    </div>
                    <Slider
                      value={[adjustedScores[dim.dimension] ?? dim.points]}
                      max={dim.max_points}
                      step={1}
                      disabled={acceptAI}
                      onValueChange={(val) =>
                        setAdjustedScores((prev) => ({ ...prev, [dim.dimension]: val[0] }))
                      }
                      className="mb-1"
                    />
                    <p className="text-xs text-muted-foreground">{dim.teacher_rationale}</p>
                  </div>
                ))}

                {/* Overall score */}
                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Overall Score</p>
                    <Badge className="text-lg px-3 py-1 bg-primary text-primary-foreground">
                      {totalScore}/{maxPoints} ({percent}%)
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Per-dimension student feedback cards */}
          {gradeResult && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  Dimension Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {gradeResult.per_dimension_scores.map((dim) => (
                  <div key={dim.dimension} className="p-2 rounded-md bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{dim.dimension}</span>
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Level {dim.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{dim.student_feedback}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Empty state before grading */}
          {!gradeResult && !isGrading && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No AI analysis yet</p>
                <p className="text-sm mt-1">
                  Click "Run AI Grading" to analyze the student's work against the rubric.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionReview;

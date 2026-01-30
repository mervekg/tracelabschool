import { useState } from "react";
import { ArrowLeft, Bot, User, Save, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  student?: {
    full_name: string;
    email: string;
  };
}

interface SubmissionReviewProps {
  submission: StudentSubmission;
  assignmentTitle?: string;
  onBack: () => void;
  onUpdate: () => void;
}

const SubmissionReview = ({ submission, assignmentTitle, onBack, onUpdate }: SubmissionReviewProps) => {
  const { toast } = useToast();
  const [teacherFeedback, setTeacherFeedback] = useState(submission.teacher_feedback || "");
  const [score, setScore] = useState(submission.score?.toString() || "");
  const [saving, setSaving] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  const downloadSubmission = () => {
    const studentName = submission.student?.full_name || "Unknown";
    const content = [];
    
    content.push(`Student: ${studentName}`);
    if (assignmentTitle) content.push(`Assignment: ${assignmentTitle}`);
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
    
    if (teacherFeedback) {
      content.push("=== Teacher Feedback ===");
      content.push(teacherFeedback);
      content.push("");
    }
    
    if (score) {
      content.push(`Score: ${score}`);
    }

    const blob = new Blob([content.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${studentName.replace(/\s+/g, "_")}_submission.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Downloaded", description: "Submission downloaded successfully" });
  };

  const handleSave = async () => {
    setSaving(true);
    
    const { error } = await supabase
      .from("student_submissions")
      .update({
        teacher_feedback: teacherFeedback || null,
        score: score ? parseFloat(score) : null,
        status: "reviewed",
      })
      .eq("id", submission.id);

    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Feedback saved!" });
      onUpdate();
    }
  };

  const generateAIFeedback = async () => {
    if (!submission.content && !submission.handwriting_image_url) {
      toast({ 
        title: "No content", 
        description: "Student hasn't submitted any content to analyze", 
        variant: "destructive" 
      });
      return;
    }

    setGeneratingAI(true);

    // For now, we'll use a placeholder. In production, this would call an AI edge function
    try {
      // Simulated AI feedback - replace with actual AI call
      const aiFeedback = `Based on the student's submission, here are my observations:

1. **Strengths**: The student demonstrates understanding of the core concepts.

2. **Areas for Improvement**: Consider providing more detailed explanations and showing work step-by-step.

3. **Suggestions**: Practice similar problems to reinforce understanding.

Note: This is placeholder feedback. Connect to an AI service for real analysis.`;

      const { error } = await supabase
        .from("student_submissions")
        .update({ ai_feedback: aiFeedback })
        .eq("id", submission.id);

      if (error) throw error;

      toast({ title: "Success", description: "AI feedback generated!" });
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-4">
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
              {submission.student?.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadSubmission}>
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          <Badge variant={submission.status === "reviewed" ? "default" : "secondary"}>
            {submission.status}
          </Badge>
        </div>
      </div>

      {/* Student Content */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Student Submission
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submission.handwriting_image_url ? (
            <div className="space-y-2">
              <img 
                src={submission.handwriting_image_url} 
                alt="Student handwriting" 
                className="max-w-full rounded-md border"
              />
            </div>
          ) : submission.content ? (
            <div className="p-3 bg-muted rounded-md">
              <p className="whitespace-pre-wrap">{submission.content}</p>
            </div>
          ) : (
            <p className="text-muted-foreground italic">No content submitted yet</p>
          )}
          {submission.submitted_at && (
            <p className="text-xs text-muted-foreground mt-2">
              Submitted: {new Date(submission.submitted_at).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* AI Feedback */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Generated Feedback
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={generateAIFeedback}
              disabled={generatingAI}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              {generatingAI ? "Generating..." : "Generate AI Feedback"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {submission.ai_feedback ? (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-900">
              <p className="whitespace-pre-wrap text-sm">{submission.ai_feedback}</p>
            </div>
          ) : (
            <p className="text-muted-foreground italic text-sm">
              Click "Generate AI Feedback" to analyze the student's work
            </p>
          )}
        </CardContent>
      </Card>

      {/* Teacher Feedback */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Teacher Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Your Feedback</Label>
            <Textarea
              value={teacherFeedback}
              onChange={(e) => setTeacherFeedback(e.target.value)}
              placeholder="Write your feedback for the student..."
              rows={4}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Score (optional)</Label>
              <Input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="e.g., 85"
                min="0"
                max="100"
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="mt-6">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Feedback"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionReview;

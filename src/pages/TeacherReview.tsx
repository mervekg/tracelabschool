import { ArrowLeft, ThumbsUp, MessageSquare, Save, Send, Download, Sparkles, PenTool, ZoomIn, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TeacherRubricView, type Rubric, type AIGradingResult, type CriterionScore } from "@/components/rubric";

// Mock rubric for demo - in production this would come from the assignment
const mockRubric: Rubric = {
  id: "demo-rubric",
  name: "Paragraph Writing Rubric",
  totalPoints: 100,
  criteria: [
    {
      id: "content",
      name: "Content & Ideas",
      description: "Clear main idea with supporting details",
      weight: 1.0,
      maxScore: 25,
      levels: [
        { level: 4, label: "Excellent", teacherDescription: "Clear, focused main idea with rich, relevant supporting details that enhance the reader's understanding.", studentDescription: "You have a clear main idea with great details!" },
        { level: 3, label: "Good", teacherDescription: "Main idea is present with adequate supporting details, though some may be general.", studentDescription: "Good main idea with some nice details." },
        { level: 2, label: "Developing", teacherDescription: "Main idea is unclear or supporting details are limited or tangential.", studentDescription: "Try to add more details to your main idea." },
        { level: 1, label: "Needs Improvement", teacherDescription: "Main idea is missing or supporting details are absent.", studentDescription: "Remember to include a main idea and details." },
      ],
    },
    {
      id: "organization",
      name: "Organization",
      description: "Logical flow and paragraph structure",
      weight: 1.0,
      maxScore: 25,
      levels: [
        { level: 4, label: "Excellent", teacherDescription: "Strong topic sentence, logical sequence, and effective transitions throughout.", studentDescription: "Your paragraph flows really well from start to finish!" },
        { level: 3, label: "Good", teacherDescription: "Has topic sentence and generally follows logical order with some transitions.", studentDescription: "Good structure with a clear topic sentence." },
        { level: 2, label: "Developing", teacherDescription: "Topic sentence is weak or order is sometimes confusing.", studentDescription: "Work on making your topic sentence stronger." },
        { level: 1, label: "Needs Improvement", teacherDescription: "No clear topic sentence and disorganized ideas.", studentDescription: "Start with a clear topic sentence." },
      ],
    },
    {
      id: "mechanics",
      name: "Mechanics",
      description: "Grammar, punctuation, capitalization",
      weight: 1.0,
      maxScore: 25,
      levels: [
        { level: 4, label: "Excellent", teacherDescription: "Virtually no errors in grammar, punctuation, or capitalization.", studentDescription: "Excellent punctuation and grammar!" },
        { level: 3, label: "Good", teacherDescription: "Few minor errors that don't interfere with meaning.", studentDescription: "Good job with your writing mechanics." },
        { level: 2, label: "Developing", teacherDescription: "Several errors that occasionally interfere with meaning.", studentDescription: "Check your punctuation and capitalization." },
        { level: 1, label: "Needs Improvement", teacherDescription: "Numerous errors that significantly interfere with meaning.", studentDescription: "Practice your punctuation and capital letters." },
      ],
    },
    {
      id: "wordChoice",
      name: "Word Choice",
      description: "Descriptive and appropriate vocabulary",
      weight: 1.0,
      maxScore: 25,
      levels: [
        { level: 4, label: "Excellent", teacherDescription: "Precise, vivid, and engaging word choices that paint a clear picture.", studentDescription: "You used amazing descriptive words!" },
        { level: 3, label: "Good", teacherDescription: "Generally effective word choices with some attempts at descriptive language.", studentDescription: "Nice word choices throughout." },
        { level: 2, label: "Developing", teacherDescription: "Basic vocabulary with few attempts at descriptive language.", studentDescription: "Try using more interesting words." },
        { level: 1, label: "Needs Improvement", teacherDescription: "Limited vocabulary with incorrect word usage.", studentDescription: "Practice using new vocabulary words." },
      ],
    },
  ],
};

// Mock student content
const mockStudentContent = `Once upon a time, there was a curious student named Emma who loved to explore. 
This weekend was extra special because I went to the science museum with my family. 
I saw enormous dinosaur skeletons and sparkling gemstones. My favorite part was the 
planetarium show about outer space. We also had lunch at a delicious Italian restaurant. 
After that, I spent Sunday afternoon reading my new book in the park. It was a wonderful 
weekend full of learning and fun!`;

const TeacherReview = () => {
  const navigate = useNavigate();
  const [acceptAIScoring, setAcceptAIScoring] = useState(true);
  const [isGrading, setIsGrading] = useState(false);
  const [aiGradingResult, setAiGradingResult] = useState<AIGradingResult | null>(null);
  const [scores, setScores] = useState({
    content: 25,
    organization: 18,
    mechanics: 23,
    wordChoice: 22,
  });

  const handleRunAIGrading = async () => {
    setIsGrading(true);
    try {
      const { data, error } = await supabase.functions.invoke("grade-submission", {
        body: {
          studentContent: mockStudentContent,
          rubric: mockRubric,
          gradeLevel: "5th Grade",
          subject: "English Language Arts",
        },
      });

      if (error) throw error;

      setAiGradingResult(data);
      
      // Update scores from AI results
      const newScores = { ...scores };
      data.scores.forEach((score: CriterionScore) => {
        if (score.criterionId === "content") newScores.content = Math.round(score.score);
        if (score.criterionId === "organization") newScores.organization = Math.round(score.score);
        if (score.criterionId === "mechanics") newScores.mechanics = Math.round(score.score);
        if (score.criterionId === "wordChoice") newScores.wordChoice = Math.round(score.score);
      });
      setScores(newScores);
      
      toast.success("AI grading complete!");
    } catch (error: any) {
      console.error("Grading error:", error);
      toast.error(error.message || "Failed to run AI grading");
    } finally {
      setIsGrading(false);
    }
  };

  const handleApprove = () => {
    toast.success("Feedback sent to Emma!");
    setTimeout(() => navigate('/teacher'), 1000);
  };

  const getAIJustification = (criterionId: string): string | null => {
    return aiGradingResult?.scores.find(s => s.criterionId === criterionId)?.aiJustification || null;
  };

  return (
    <div className="min-h-screen paper-texture p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/teacher')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary">Review Student Work</h1>
              <p className="text-sm text-muted-foreground">Emma Rodriguez • Paragraph Writing: My Weekend</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Student Work View (2/3 width) */}
          <Card className="lg:col-span-2 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Student Submission</h2>
              <div className="flex items-center gap-2">
                <Badge className="bg-accent text-accent-foreground">Submitted 2 hours ago</Badge>
                <Button variant="outline" size="sm">
                  <ZoomIn className="w-4 h-4 mr-1" />
                  Zoom
                </Button>
                <Button variant="outline" size="sm">
                  <PenTool className="w-4 h-4 mr-1" />
                  Annotate
                </Button>
              </div>
            </div>

            {/* Main Handwritten Work Display */}
            <div className="lined-paper bg-white p-8 rounded-xl border border-border min-h-[400px] relative">
              <p className="font-handwriting text-lg leading-10 text-foreground/90">
                {mockStudentContent}
              </p>
              
              {/* Teacher Annotation Demo */}
              <div className="absolute top-24 right-12 bg-primary/10 border-2 border-primary rounded-lg p-2 max-w-xs">
                <p className="text-xs font-semibold text-primary">Teacher Note</p>
                <p className="text-xs text-foreground/80">Consider a more direct opening!</p>
              </div>
            </div>

            {/* Page Thumbnails */}
            <div className="flex gap-2">
              <div className="w-20 h-24 rounded border-2 border-primary bg-white lined-paper cursor-pointer">
                <p className="text-center text-xs mt-2 font-semibold text-primary">Page 1</p>
              </div>
              <div className="w-20 h-24 rounded border border-border bg-white lined-paper opacity-50 cursor-pointer hover:opacity-100">
                <p className="text-center text-xs mt-2 text-muted-foreground">Page 2</p>
              </div>
            </div>

            {/* Rubric View (Teacher) */}
            <TeacherRubricView rubric={mockRubric} compact />

            {/* Student Growth Comparison */}
            <Card className="p-4 bg-secondary/30 border-secondary">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Growth Comparison
              </h3>
              <p className="text-sm text-muted-foreground">
                Emma's writing fluency has improved by 23% compared to last month. Average sentence length increased 
                from 8 to 12 words. Handwriting clarity: 94%.
              </p>
            </Card>
          </Card>

          {/* RIGHT: Feedback Panel (1/3 width) */}
          <div className="space-y-4">
            {/* AI Grading Button */}
            <Button 
              onClick={handleRunAIGrading} 
              disabled={isGrading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              {isGrading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Grading with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run AI Grading
                </>
              )}
            </Button>

            {/* AI Pre-Analysis Summary */}
            <Card className="p-6 shadow-card bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-accent-foreground" />
                <h2 className="text-lg font-semibold">TraceLab Pre-Analysis</h2>
              </div>
              <div className="space-y-3 text-sm">
                {aiGradingResult ? (
                  <>
                    <div className="p-3 rounded-lg bg-card border border-border">
                      <p className="font-medium mb-1">✨ Strengths</p>
                      <p className="text-xs text-muted-foreground">
                        {aiGradingResult.feedback.strengths}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-card border border-border">
                      <p className="font-medium mb-1">💡 Improvements</p>
                      <p className="text-xs text-muted-foreground">
                        {aiGradingResult.feedback.improvements}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-card border border-border">
                      <p className="font-medium mb-1">→ Next Step</p>
                      <p className="text-xs text-muted-foreground">
                        {aiGradingResult.feedback.nextStep}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 rounded-lg bg-card border border-border">
                      <p className="font-medium mb-1 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        Content Accuracy
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Clear main idea with details</p>
                        <Badge className="bg-success text-success-foreground">4/4</Badge>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-card border border-border">
                      <p className="font-medium mb-1">Writing Mechanics</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">Excellent punctuation</p>
                        <Badge className="bg-success text-success-foreground">4/4</Badge>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Teacher Rubric Panel */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Rubric Scores</h2>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={acceptAIScoring}
                    onCheckedChange={setAcceptAIScoring}
                  />
                  <span className="text-xs text-muted-foreground">Accept AI</span>
                </div>
              </div>
              <div className="space-y-4">
                {mockRubric.criteria.map((criterion) => {
                  const scoreKey = criterion.id as keyof typeof scores;
                  const justification = getAIJustification(criterion.id);
                  
                  return (
                    <div key={criterion.id}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">{criterion.name}</p>
                        <p className="text-sm font-bold">{scores[scoreKey]}/{criterion.maxScore}</p>
                      </div>
                      <Slider 
                        value={[scores[scoreKey]]} 
                        max={criterion.maxScore} 
                        className="mb-1"
                        onValueChange={(val) => setScores({...scores, [scoreKey]: val[0]})}
                      />
                      <p className="text-xs text-muted-foreground">
                        {justification || criterion.description}
                      </p>
                    </div>
                  );
                })}

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Total Score</p>
                    <Badge className="bg-success text-success-foreground text-lg px-3 py-1">
                      {scores.content + scores.organization + scores.mechanics + scores.wordChoice}/100
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Teacher Comments Composer */}
            <Card className="p-6 shadow-card">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Your Comments
              </h2>
              <Textarea
                placeholder="Add your personal feedback for the student..."
                rows={5}
                className="mb-3"
                defaultValue="Great job on this assignment, Emma! Your descriptive words really brought your weekend to life. Focus on making your opening sentence more direct next time."
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-success to-success/80" onClick={handleApprove}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Feedback
                </Button>
              </div>
            </Card>

            {/* Academic Integrity Check */}
            <Card className="p-4 bg-success/10 border-success/30">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="w-5 h-5 text-success" />
                <p className="font-semibold text-success">Integrity Verified</p>
              </div>
              <p className="text-xs text-foreground/80">
                Handwriting pattern matches student's typical style. Writing time: 12 minutes. No AI-generation detected.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherReview;

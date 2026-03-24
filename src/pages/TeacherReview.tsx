import { ArrowLeft, ThumbsUp, MessageSquare, Save, Send, Download, Sparkles, PenTool, ZoomIn, ZoomOut, CheckCircle2, Loader2, Eye, Layers, Grid3X3, BookOpen, BarChart3, Settings, AlertTriangle, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Rubric, type AIGradingResult, type CriterionScore } from "@/components/rubric";
import SolviaLogo from "@/components/SolviaLogo";

// Mock rubric
const mockRubric: Rubric = {
  id: "demo-rubric",
  name: "Physics Assessment Rubric",
  totalPoints: 100,
  criteria: [
    {
      id: "conceptual",
      name: "Conceptual Understanding",
      description: "Demonstrates understanding of core physics concepts",
      weight: 1.0,
      maxScore: 25,
      levels: [
        { level: 4, label: "Excellent", teacherDescription: "Deep conceptual grasp with connections across topics.", studentDescription: "You really understand the concepts!" },
        { level: 3, label: "Good", teacherDescription: "Solid understanding with minor gaps.", studentDescription: "Good understanding overall." },
        { level: 2, label: "Developing", teacherDescription: "Partial understanding, some misconceptions.", studentDescription: "Keep working on understanding the concepts." },
        { level: 1, label: "Needs Improvement", teacherDescription: "Significant misconceptions present.", studentDescription: "Let's review the basics together." },
      ],
    },
    {
      id: "problemSolving",
      name: "Problem-Solving Steps",
      description: "Clear, logical approach to solving the problem",
      weight: 1.0,
      maxScore: 25,
      levels: [
        { level: 4, label: "Excellent", teacherDescription: "Systematic approach with clear reasoning at each step.", studentDescription: "Your problem-solving approach is excellent!" },
        { level: 3, label: "Good", teacherDescription: "Generally logical approach with minor gaps in reasoning.", studentDescription: "Good problem-solving steps." },
        { level: 2, label: "Developing", teacherDescription: "Some logical steps but missing key reasoning.", studentDescription: "Try to show more of your thinking." },
        { level: 1, label: "Needs Improvement", teacherDescription: "Disorganized or missing problem-solving steps.", studentDescription: "Remember to show your work step by step." },
      ],
    },
    {
      id: "clarity",
      name: "Clarity of Process",
      description: "Work is neat, organized, and easy to follow",
      weight: 1.0,
      maxScore: 25,
      levels: [
        { level: 4, label: "Excellent", teacherDescription: "Exceptionally clear and organized presentation.", studentDescription: "Your work is very clear and organized!" },
        { level: 3, label: "Good", teacherDescription: "Generally clear with minor organization issues.", studentDescription: "Good clarity in your work." },
        { level: 2, label: "Developing", teacherDescription: "Somewhat unclear or hard to follow.", studentDescription: "Try to organize your work more clearly." },
        { level: 1, label: "Needs Improvement", teacherDescription: "Very difficult to follow or understand.", studentDescription: "Let's work on making your work clearer." },
      ],
    },
    {
      id: "notation",
      name: "Notation & Units",
      description: "Correct use of notation, symbols, and units",
      weight: 1.0,
      maxScore: 25,
      levels: [
        { level: 4, label: "Excellent", teacherDescription: "All notation and units are correct and consistent.", studentDescription: "Perfect use of notation and units!" },
        { level: 3, label: "Good", teacherDescription: "Minor notation/unit errors that don't affect meaning.", studentDescription: "Good job with notation and units." },
        { level: 2, label: "Developing", teacherDescription: "Several notation/unit errors.", studentDescription: "Remember to always include your units." },
        { level: 1, label: "Needs Improvement", teacherDescription: "Widespread notation and unit errors.", studentDescription: "Practice writing units with every answer." },
      ],
    },
  ],
};

// Mock students for sidebar
const mockStudents = [
  { id: "1", name: "Aisha K.", initials: "AK", score: 82, color: "bg-primary" },
  { id: "2", name: "Sofia R.", initials: "SR", score: 91, color: "bg-secondary" },
  { id: "3", name: "Noah W.", initials: "NW", score: 84, color: "bg-secondary" },
  { id: "4", name: "Layla P.", initials: "LP", score: 77, color: "bg-warning" },
  { id: "5", name: "James M.", initials: "JM", score: 68, color: "bg-destructive" },
  { id: "6", name: "Emma H.", initials: "EH", score: 63, color: "bg-destructive" },
  { id: "7", name: "Tom D.", initials: "TD", score: 55, color: "bg-destructive" },
  { id: "8", name: "Marcus O.", initials: "MO", score: 72, color: "bg-warning" },
];

const getScoreColor = (score: number) => {
  if (score >= 85) return "text-secondary";
  if (score >= 70) return "text-primary";
  if (score >= 60) return "text-warning";
  return "text-destructive";
};

const getScoreDot = (score: number) => {
  if (score >= 85) return "bg-secondary";
  if (score >= 70) return "bg-primary";
  if (score >= 60) return "bg-warning";
  return "bg-destructive";
};

const TeacherReview = () => {
  const navigate = useNavigate();
  const [acceptAIScoring, setAcceptAIScoring] = useState(true);
  const [isGrading, setIsGrading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState("1");
  const [aiGradingResult, setAiGradingResult] = useState<AIGradingResult | null>(null);
  const [scores, setScores] = useState({
    conceptual: 22,
    problemSolving: 23,
    clarity: 19,
    notation: 16,
  });

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  const handleRunAIGrading = async () => {
    setIsGrading(true);
    try {
      const { data, error } = await supabase.functions.invoke("grade-submission", {
        body: {
          studentContent: "x = v₀t + ½at²\nx = (12)(5) + ½(-2)(5)²\nx = 60 + ½(-2)(25)\nx = 60 + (-25)\nx = 35 m",
          rubric: mockRubric,
          gradeLevel: "11th Grade",
          subject: "Physics",
        },
      });

      if (error) throw error;
      setAiGradingResult(data);

      const newScores = { ...scores };
      data.scores.forEach((score: CriterionScore) => {
        if (score.criterionId in newScores) {
          (newScores as any)[score.criterionId] = Math.round(score.score);
        }
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
    toast.success("Feedback sent to student!");
    setTimeout(() => navigate('/teacher'), 1000);
  };

  const sidebarNavItems = [
    { icon: BookOpen, label: "Student Work", count: 24 },
    { icon: BarChart3, label: "Class Analytics" },
    { icon: Layers, label: "Reasoning Map" },
    { icon: Settings, label: "Rubric Settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <SolviaLogo size="sm" linkTo="/teacher" />
          <Badge variant="outline" className="text-xs font-mono uppercase tracking-wider border-primary/30 text-primary">
            Lab
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground font-mono uppercase tracking-wider">
          <span>Physics 301</span>
          <span className="mx-1">›</span>
          <span>Unit 4</span>
          <span className="mx-1">·</span>
          <span>Kinematics</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge variant="outline" className="border-secondary/50 text-secondary gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            Analyzing
          </Badge>
          <Button variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/10">
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleApprove}>
            <Send className="w-4 h-4 mr-1.5" />
            Return Work
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className="w-56 border-r border-border bg-card flex flex-col shrink-0">
          {/* Workspace Nav */}
          <div className="p-3 border-b border-border">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Workspace</p>
            <nav className="space-y-0.5">
              {sidebarNavItems.map((item, i) => (
                <button
                  key={item.label}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
                    i === 0 ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.count && (
                    <Badge variant="secondary" className="ml-auto text-xs h-5 px-1.5">
                      {item.count}
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Students List */}
          <div className="p-3 flex-1 overflow-hidden flex flex-col">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Students</p>
            <ScrollArea className="flex-1">
              <div className="space-y-0.5 pr-2">
                {mockStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-md transition-colors ${
                      selectedStudent === student.id
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full ${student.color} flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0`}>
                      {student.initials}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.score}% reasoning</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${getScoreDot(student.score)}`} />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </aside>

        {/* CENTER — STUDENT WORK VIEWER */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Viewer Toolbar */}
          <div className="h-11 border-b border-border bg-card/50 flex items-center px-4 gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground mr-2">Viewer</span>
            <div className="flex items-center gap-1">
              <Button variant="default" size="icon" className="h-8 w-8">
                <Eye className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <PenTool className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Save className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="w-px h-5 bg-border mx-1" />
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ZoomOut className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ZoomIn className="w-3.5 h-3.5" />
              </Button>
            </div>
            <span className="text-xs text-muted-foreground font-mono ml-1">100%</span>
            <div className="w-px h-5 bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Grid3X3 className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Student Work Content */}
          <ScrollArea className="flex-1 bg-muted/30">
            <div className="p-8 flex justify-center">
              <div className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-card overflow-hidden">
                {/* Assignment Header */}
                <div className="p-6 border-b border-border">
                  <p className="text-xs font-mono uppercase tracking-wider text-primary mb-2">
                    Physics 301 · Unit 4 Assessment · Question 2
                  </p>
                  <h2 className="text-xl font-bold text-foreground">
                    Kinematics — Displacement from v–t graph
                  </h2>
                </div>

                {/* Student Work */}
                <div className="p-6 space-y-6">
                  {/* Step 1 */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground italic">Step 1 — Identify correct kinematic equation:</p>
                    <p className="font-mono text-lg font-semibold">x = v₀t + ½at²</p>
                    <div className="flex justify-end">
                      <Badge className="bg-secondary/20 text-secondary border border-secondary/30 text-xs font-mono uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5" />
                        Correct Formula
                      </Badge>
                    </div>
                  </div>

                  {/* Calculation Steps */}
                  <div className="space-y-1 font-mono text-sm">
                    <p>x = (12)(5) + ½(-2)(5)²</p>
                    <p>x = 60 + ½(-2)(25)</p>
                    <p>x = 60 + (-25)</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold border-b-2 border-foreground inline-block pb-0.5">x = 35 m</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>check units:</span>
                        <span>m/s · s = m ✓</span>
                      </div>
                    </div>
                    <div className="flex justify-end mt-2">
                      <Badge className="bg-warning/20 text-warning border border-warning/30 text-xs font-mono uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning mr-1.5" />
                        Notation Gap
                      </Badge>
                    </div>
                  </div>

                  {/* Step 2 — Verification */}
                  <div className="space-y-2 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground italic">Step 2 — Verify using v–t graph (area method):</p>
                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-24 bg-background rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                          [v–t graph sketch]
                        </div>
                        <div className="text-sm space-y-1">
                          <p className="text-xs text-muted-foreground italic">Step 3 — Direction:</p>
                          <p className="font-medium">Positive (+35m) →</p>
                          <p className="text-xs text-muted-foreground">displacement is forward.</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Area = 35 m ✓</p>
                    </div>
                    <div className="flex justify-end">
                      <Badge className="bg-secondary/20 text-secondary border border-secondary/30 text-xs font-mono uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5" />
                        Self-Verification
                      </Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm text-secondary font-medium italic">Both methods agree. Answer: x = +35 m</p>
                  </div>

                  {/* Student Name */}
                  <p className="text-xs text-muted-foreground pt-4">Aisha K. — Physics 301</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </main>

        {/* RIGHT PANEL — SOLVIA ANALYSIS */}
        <aside className="w-80 border-l border-border bg-card flex flex-col shrink-0 overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-5 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Solvia Analysis</h2>
                <Badge variant="outline" className="text-[10px] font-mono uppercase border-secondary/40 text-secondary">
                  Live
                </Badge>
              </div>

              {/* AI Grading Button */}
              <Button
                onClick={handleRunAIGrading}
                disabled={isGrading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                size="lg"
              >
                {isGrading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Run AI Grading
                  </>
                )}
              </Button>

              {/* Overall Score Circle */}
              <div className="flex items-start gap-4">
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="6"
                      strokeDasharray={`${(totalScore / 100) * 264} 264`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{totalScore}</span>
                    <span className="text-[10px] text-muted-foreground">/100</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Strong Reasoning</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    Clear verifiable thinking. Self-checking behavior detected. Minor notation gap.
                  </p>
                </div>
              </div>

              {/* Reasoning Dimensions */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-primary mb-3">Reasoning Dimensions</p>
                <div className="space-y-3">
                  {mockRubric.criteria.map((criterion) => {
                    const scoreKey = criterion.id as keyof typeof scores;
                    const pct = Math.round((scores[scoreKey] / criterion.maxScore) * 100);
                    return (
                      <div key={criterion.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm">{criterion.name}</p>
                          <p className={`text-sm font-mono font-bold ${getScoreColor(pct)}`}>{pct}%</p>
                        </div>
                        <Progress value={pct} className="h-1" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Insights */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-primary mb-3">AI Insights</p>
                <div className="space-y-3">
                  {aiGradingResult ? (
                    <>
                      <div className="p-3 rounded-lg border border-border space-y-1.5">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold">{aiGradingResult.feedback.strengths?.split('.')[0]}.</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{aiGradingResult.feedback.strengths}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border border-border space-y-1.5">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold">Area for improvement.</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{aiGradingResult.feedback.improvements}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 rounded-lg border border-border space-y-1.5">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm"><span className="font-semibold">Self-verification detected.</span> Student verified via v–t area method independently — strong metacognitive behavior.</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border border-border space-y-1.5">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm"><span className="font-semibold">Correct formula recall.</span> Kinematic equation selected and applied without prompting.</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border border-border space-y-1.5">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm"><span className="font-semibold">Notation gap.</span> Units written informally in scratch area. Missing from final boxed answer line.</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Rubric Score Adjustments */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-primary">Score Adjustments</p>
                  <div className="flex items-center gap-2">
                    <Switch checked={acceptAIScoring} onCheckedChange={setAcceptAIScoring} />
                    <span className="text-[10px] text-muted-foreground">Accept AI</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {mockRubric.criteria.map((criterion) => {
                    const scoreKey = criterion.id as keyof typeof scores;
                    return (
                      <div key={criterion.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-medium">{criterion.name}</p>
                          <p className="text-xs font-mono font-bold">{scores[scoreKey]}/{criterion.maxScore}</p>
                        </div>
                        <Slider
                          value={[scores[scoreKey]]}
                          max={criterion.maxScore}
                          className="mb-1"
                          onValueChange={(val) => setScores({ ...scores, [scoreKey]: val[0] })}
                        />
                      </div>
                    );
                  })}
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <p className="text-sm font-semibold">Total</p>
                    <Badge className="bg-primary text-primary-foreground font-mono text-base px-3 py-1">
                      {totalScore}/100
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Teacher Comments */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-primary mb-2">Teacher Comments</p>
                <Textarea
                  placeholder="Add feedback for the student..."
                  rows={4}
                  className="text-sm"
                  defaultValue=""
                />
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save
                  </Button>
                  <Button size="sm" className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={handleApprove}>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Send
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-border text-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Solvia Lab · Prototype v0.1
                </p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  AI supports · Teacher decides
                </p>
              </div>
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
};

export default TeacherReview;

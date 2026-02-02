import { ArrowLeft, ThumbsUp, MessageSquare, Save, Send, Download, Sparkles, PenTool, ZoomIn, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

const TeacherReview = () => {
  const navigate = useNavigate();
  const [acceptAIScoring, setAcceptAIScoring] = useState(true);
  const [scores, setScores] = useState({
    content: 25,
    organization: 18,
    mechanics: 23,
    wordChoice: 22,
  });

  const handleApprove = () => {
    toast.success("Feedback sent to Emma!");
    setTimeout(() => navigate('/teacher'), 1000);
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
            <div className="lined-paper bg-white p-8 rounded-xl border border-border min-h-[600px] relative">
              <p className="font-handwriting text-lg leading-10 text-foreground/90">
                Once upon a time, there was a curious student named Emma who loved to explore. 
                This weekend was extra special because I went to the science museum with my family. 
                I saw enormous dinosaur skeletons and sparkling gemstones. My favorite part was the 
                planetarium show about outer space. We also had lunch at a delicious Italian restaurant. 
                After that, I spent Sunday afternoon reading my new book in the park. It was a wonderful 
                weekend full of learning and fun!
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
            {/* AI Pre-Analysis Summary */}
            <Card className="p-6 shadow-card bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-accent-foreground" />
                <h2 className="text-lg font-semibold">TraceLab Pre-Analysis</h2>
              </div>
              <div className="space-y-3 text-sm">
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
                <div className="p-3 rounded-lg bg-card border border-border">
                  <p className="font-medium mb-1">✨ Strengths</p>
                  <p className="text-xs text-muted-foreground">
                    Excellent descriptive vocabulary. Perfect punctuation throughout.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-card border border-border">
                  <p className="font-medium mb-1">💡 Suggestions</p>
                  <p className="text-xs text-muted-foreground">
                    Strengthen topic sentence. Vary sentence starters for better flow.
                  </p>
                </div>
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
                  <span className="text-xs text-muted-foreground">Accept TraceLab</span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Content & Ideas</p>
                    <p className="text-sm font-bold">{scores.content}/25</p>
                  </div>
                  <Slider 
                    value={[scores.content]} 
                    max={25} 
                    className="mb-1"
                    onValueChange={(val) => setScores({...scores, content: val[0]})}
                  />
                  <p className="text-xs text-muted-foreground">Clear main idea with details</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Organization</p>
                    <p className="text-sm font-bold">{scores.organization}/25</p>
                  </div>
                  <Slider 
                    value={[scores.organization]} 
                    max={25} 
                    className="mb-1"
                    onValueChange={(val) => setScores({...scores, organization: val[0]})}
                  />
                  <p className="text-xs text-muted-foreground">Topic sentence needs work</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Mechanics</p>
                    <p className="text-sm font-bold">{scores.mechanics}/25</p>
                  </div>
                  <Slider 
                    value={[scores.mechanics]} 
                    max={25} 
                    className="mb-1"
                    onValueChange={(val) => setScores({...scores, mechanics: val[0]})}
                  />
                  <p className="text-xs text-muted-foreground">Excellent punctuation</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Word Choice</p>
                    <p className="text-sm font-bold">{scores.wordChoice}/25</p>
                  </div>
                  <Slider 
                    value={[scores.wordChoice]} 
                    max={25} 
                    className="mb-1"
                    onValueChange={(val) => setScores({...scores, wordChoice: val[0]})}
                  />
                  <p className="text-xs text-muted-foreground">Great descriptive words!</p>
                </div>

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

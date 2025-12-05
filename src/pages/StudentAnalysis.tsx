import { Sparkles, CheckCircle2, AlertCircle, ArrowRight, MessageSquare, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LearnionLogo from "@/components/LearnionLogo";

const StudentAnalysis = () => {
  const navigate = useNavigate();

  const handleSendToTeacher = () => {
    toast.success("Work sent to teacher for final review!");
    setTimeout(() => navigate('/student'), 1000);
  };

  return (
    <div className="min-h-screen paper-texture p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LearnionLogo size="sm" showText={false} />
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Analysis Complete</h1>
              <p className="text-sm text-muted-foreground">Paragraph Writing: My Weekend</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-accent to-primary text-white text-lg px-4 py-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Ready for Review
          </Badge>
        </div>

        {/* AI Processing Card */}
        <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30 shadow-card">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-accent/20">
              <Sparkles className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Your Work Has Been Analyzed</h2>
              <p className="text-foreground/90">
                Great effort, Emma! Your writing shows strong descriptive vocabulary and proper punctuation. 
                I've highlighted areas where you can improve to make your paragraph even stronger.
              </p>
            </div>
          </div>
        </Card>

        {/* Your Submitted Work with Highlights */}
        <Card className="p-6 shadow-card">
          <h2 className="text-2xl font-semibold mb-4">Your Work with Highlights</h2>
          <div className="lined-paper bg-white p-8 rounded-xl border border-border min-h-[400px]">
            <div className="font-handwriting text-lg leading-10">
              <span className="bg-warning/20 border-b-2 border-warning cursor-pointer" title="Topic Sentence - Consider making this more direct">
                Once upon a time, there was a curious student named Emma who loved to explore.
              </span>{" "}
              This weekend was extra special because I went to the science museum with my family. 
              I saw enormous dinosaur skeletons and sparkling gemstones. My favorite part was the 
              planetarium show about outer space. We also had lunch at a delicious Italian restaurant. 
              <span className="bg-accent/20 border-b-2 border-accent cursor-pointer" title="Sentence Variety - Try starting with a different phrase">
                After that, I spent Sunday afternoon reading my new book in the park.
              </span>{" "}
              <span className="bg-success/20 border-b-2 border-success cursor-pointer" title="Great conclusion!">
                It was a wonderful weekend full of learning and fun!
              </span>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex gap-4 mt-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-warning/30 border border-warning rounded" />
              <span className="text-xs text-muted-foreground">Needs Improvement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-accent/30 border border-accent rounded" />
              <span className="text-xs text-muted-foreground">Could Be Better</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-success/30 border border-success rounded" />
              <span className="text-xs text-muted-foreground">Excellent!</span>
            </div>
          </div>
        </Card>

        {/* AI Tags & Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Grammar & Writing Tags */}
          <Card className="p-6 shadow-card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-accent-foreground" />
              Writing Mechanics
            </h2>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-success flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Punctuation
                  </p>
                  <Badge className="bg-success text-success-foreground">Perfect</Badge>
                </div>
                <p className="text-xs text-muted-foreground">All sentences end correctly</p>
              </div>

              <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-success flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Capitalization
                  </p>
                  <Badge className="bg-success text-success-foreground">Perfect</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Proper capitalization throughout</p>
              </div>

              <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-warning-foreground flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Sentence Variety
                  </p>
                  <Badge className="bg-warning text-warning-foreground">Needs Work</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Many sentences start with "I" - try varying your openings</p>
              </div>

              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-accent-foreground flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Topic Sentence
                  </p>
                  <Badge className="bg-accent text-accent-foreground">Could Improve</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Opening is creative but not direct enough for this assignment</p>
              </div>
            </div>
          </Card>

          {/* Content Analysis */}
          <Card className="p-6 shadow-card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Content Quality
            </h2>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                <p className="font-semibold text-success mb-1">Descriptive Words</p>
                <p className="text-xs text-muted-foreground">
                  Excellent use of "enormous," "sparkling," "delicious," "wonderful"
                </p>
              </div>

              <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                <p className="font-semibold text-success mb-1">Supporting Details</p>
                <p className="text-xs text-muted-foreground">
                  Clear examples: museum visit, restaurant, reading in park
                </p>
              </div>

              <div className="p-3 rounded-xl bg-success/10 border border-success/20">
                <p className="font-semibold text-success mb-1">Paragraph Structure</p>
                <p className="text-xs text-muted-foreground">
                  Good flow from beginning to end with proper conclusion
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Suggestions */}
        <Card className="p-6 shadow-card bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Suggestions for Improvement
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
              <span className="text-lg">1️⃣</span>
              <div>
                <p className="font-semibold mb-1">Make your topic sentence more direct</p>
                <p className="text-sm text-muted-foreground">
                  Instead of: "Once upon a time, there was a curious student..."
                  <br />
                  Try: "My weekend was filled with exciting adventures at the science museum."
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
              <span className="text-lg">2️⃣</span>
              <div>
                <p className="font-semibold mb-1">Vary your sentence starters</p>
                <p className="text-sm text-muted-foreground">
                  Use transition words like "First," "Next," "Finally," or "During the afternoon"
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
              <span className="text-lg">3️⃣</span>
              <div>
                <p className="font-semibold mb-1">Keep up the great descriptive language!</p>
                <p className="text-sm text-muted-foreground">
                  Your use of adjectives like "enormous" and "sparkling" really brings your writing to life
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Rubric-Based Score Preview */}
        <Card className="p-6 shadow-card">
          <h2 className="text-2xl font-semibold mb-4">Rubric Score Preview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center">
              <p className="text-3xl font-bold text-success mb-1">25/25</p>
              <p className="text-sm text-muted-foreground">Content & Ideas</p>
            </div>
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 text-center">
              <p className="text-3xl font-bold text-warning-foreground mb-1">18/25</p>
              <p className="text-sm text-muted-foreground">Organization</p>
            </div>
            <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center">
              <p className="text-3xl font-bold text-success mb-1">23/25</p>
              <p className="text-sm text-muted-foreground">Mechanics</p>
            </div>
            <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center">
              <p className="text-3xl font-bold text-success mb-1">22/25</p>
              <p className="text-sm text-muted-foreground">Word Choice</p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-accent/10 border border-accent/20 text-center">
            <p className="text-sm text-muted-foreground mb-1">Estimated Total Score</p>
            <p className="text-4xl font-bold text-accent-foreground">88/100</p>
            <p className="text-xs text-muted-foreground mt-2">Your teacher will review and finalize this score</p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" size="lg" onClick={() => navigate('/student/workspace')}>
            <RefreshCw className="w-5 h-5 mr-2" />
            Revise & Resubmit
          </Button>
          <Button size="lg" onClick={handleSendToTeacher}>
            <MessageSquare className="w-5 h-5 mr-2" />
            Ask for Clarification
          </Button>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-success to-success/80"
            onClick={handleSendToTeacher}
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Send to Teacher
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalysis;

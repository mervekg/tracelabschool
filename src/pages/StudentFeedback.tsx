import { ThumbsUp, Lightbulb, AlertCircle, CheckCircle2, MessageSquare, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const StudentFeedback = () => {
  return (
    <div className="min-h-screen paper-texture p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">Assignment Feedback</h1>
            <p className="text-sm text-muted-foreground">Paragraph Writing: My Weekend</p>
          </div>
          <Badge className="bg-success text-success-foreground text-lg px-4 py-2">
            88/100
          </Badge>
        </div>

        {/* Overall Feedback */}
        <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/30 shadow-card">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-success/20">
              <ThumbsUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Great Job, Emma!</h2>
              <p className="text-foreground/90">
                Your paragraph shows excellent use of descriptive words and you included all required elements. 
                Let's work on improving your topic sentence and adding more variety to your sentence structure.
              </p>
            </div>
          </div>
        </Card>

        {/* Rubric Breakdown */}
        <Card className="p-6 shadow-card">
          <h2 className="text-2xl font-semibold mb-4">Rubric Breakdown</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <div>
                  <p className="font-semibold">Content & Ideas</p>
                  <p className="text-sm text-muted-foreground">Clear main idea with supporting details</p>
                </div>
              </div>
              <Badge className="bg-success text-success-foreground">25/25</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-warning-foreground" />
                <div>
                  <p className="font-semibold">Organization</p>
                  <p className="text-sm text-muted-foreground">Topic sentence could be stronger</p>
                </div>
              </div>
              <Badge className="bg-warning text-warning-foreground">18/25</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <div>
                  <p className="font-semibold">Writing Mechanics</p>
                  <p className="text-sm text-muted-foreground">Good punctuation and capitalization</p>
                </div>
              </div>
              <Badge className="bg-success text-success-foreground">23/25</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <div>
                  <p className="font-semibold">Word Choice</p>
                  <p className="text-sm text-muted-foreground">Excellent descriptive language!</p>
                </div>
              </div>
              <Badge className="bg-success text-success-foreground">22/25</Badge>
            </div>
          </div>
        </Card>

        {/* Detailed Feedback */}
        <Card className="p-6 shadow-card">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-warning-foreground" />
            How to Improve
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <h3 className="font-semibold text-accent-foreground mb-2">💡 Strengthen Your Topic Sentence</h3>
              <p className="text-sm text-foreground/80 mb-2">
                Your current opening: "Once upon a time, there was a curious student..."
              </p>
              <p className="text-sm text-foreground/80 mb-2">
                Try something more direct like: "My weekend was filled with exciting adventures and new discoveries."
              </p>
              <p className="text-xs text-muted-foreground italic">
                A strong topic sentence tells the reader exactly what your paragraph will be about!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <h3 className="font-semibold text-accent-foreground mb-2">✨ Vary Your Sentence Structure</h3>
              <p className="text-sm text-foreground/80">
                You used many sentences starting with "I went..." or "I saw...". Try mixing in some sentences that start with 
                descriptive phrases or time words like "After lunch," or "During the afternoon,"
              </p>
            </div>

            <div className="p-4 rounded-xl bg-success/10 border border-success/20">
              <h3 className="font-semibold text-success mb-2">🌟 What You Did Great</h3>
              <p className="text-sm text-foreground/80">
                • Excellent use of descriptive words like "sparkling," "enormous," and "delicious"
                <br />• Perfect punctuation throughout
                <br />• All sentences were complete with proper capitalization
              </p>
            </div>
          </div>
        </Card>

        {/* Your Submitted Work */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Your Submitted Work</h2>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
          <div className="lined-paper bg-white p-6 rounded-xl border border-border min-h-[300px]">
            <p className="font-handwriting text-lg leading-8">
              Once upon a time, there was a curious student named Emma who loved to explore. 
              This weekend was extra special because I went to the science museum with my family. 
              I saw enormous dinosaur skeletons and sparkling gemstones. My favorite part was the 
              planetarium show about outer space. We also had lunch at a delicious Italian restaurant. 
              After that, I spent Sunday afternoon reading my new book in the park. It was a wonderful 
              weekend full of learning and fun!
            </p>
          </div>
        </Card>

        {/* Reply to Feedback */}
        <Card className="p-6 shadow-card">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Reply to Your Teacher
          </h2>
          <Textarea
            placeholder="Ask a question or share your thoughts about the feedback..."
            className="mb-3"
            rows={4}
          />
          <div className="flex gap-2">
            <Button>Send Message</Button>
            <Button variant="outline">Fix & Resubmit</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentFeedback;

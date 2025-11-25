import { useState } from "react";
import { Undo2, Redo2, Save, Send, Plus, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const StudentWorkspace = () => {
  const navigate = useNavigate();
  const [writingTime, setWritingTime] = useState(12); // minutes
  const [handwrittenText, setHandwrittenText] = useState("Once upon a time, there was a curious student named Emma who loved to explore...");

  const handleSubmit = () => {
    toast.success("Assignment submitted! Your teacher will review it soon.");
    setTimeout(() => {
      navigate('/student/feedback');
    }, 1500);
  };

  return (
    <div className="min-h-screen paper-texture p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">Paragraph Writing: My Weekend</h1>
            <p className="text-sm text-muted-foreground">ELA • Due Tomorrow</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              {writingTime} min
            </Badge>
          </div>
        </div>

        {/* Instructions */}
        <Card className="p-4 bg-secondary/50 border-secondary">
          <h3 className="font-semibold text-secondary-foreground mb-2">Instructions</h3>
          <p className="text-sm text-secondary-foreground/80">
            Write a paragraph (5-7 sentences) about your weekend. Remember to include:
            <br />• A clear topic sentence
            <br />• Supporting details with descriptive words
            <br />• A concluding sentence
            <br />• Proper punctuation and capitalization
          </p>
        </Card>

        {/* Toolbar */}
        <Card className="p-3 shadow-paper">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <Redo2 className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border mx-2" />
              <Button variant="ghost" size="sm" className="hover:bg-muted">
                <Plus className="w-4 h-4 mr-1" />
                Add Page
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hover:bg-muted">
                <Save className="w-4 h-4 mr-1" />
                Save Draft
              </Button>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-primary to-primary/80 hover:opacity-90"
                onClick={handleSubmit}
              >
                <Send className="w-4 h-4 mr-1" />
                Submit Work
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Writing Canvas */}
        <Card className="p-0 shadow-card overflow-hidden">
          {/* Paper Header */}
          <div className="p-4 border-b border-border bg-card">
            <p className="font-handwriting text-sm text-muted-foreground">Emma Rodriguez • Grade 5 • Page 1</p>
          </div>

          {/* Lined Paper Writing Area */}
          <div className="lined-paper bg-white p-8 min-h-[500px]">
            <Textarea
              value={handwrittenText}
              onChange={(e) => setHandwrittenText(e.target.value)}
              className="w-full min-h-[450px] font-handwriting text-lg leading-8 bg-transparent border-none focus-visible:ring-0 resize-none"
              placeholder="Start writing here..."
              style={{ lineHeight: '32px' }}
            />
          </div>
        </Card>

        {/* AI Assistant Hint (Optional) */}
        <Card className="p-4 bg-accent/10 border-accent/30">
          <p className="text-sm text-accent-foreground">
            💡 <strong>Writing Tip:</strong> Try to use transition words like "first," "next," and "finally" to connect your ideas!
          </p>
        </Card>
      </div>
    </div>
  );
};

export default StudentWorkspace;

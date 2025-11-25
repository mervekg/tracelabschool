import { useState } from "react";
import { Undo2, Redo2, Save, Send, Plus, Timer, Palette, PenTool, Eraser, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

const StudentWorkspace = () => {
  const navigate = useNavigate();
  const [writingTime, setWritingTime] = useState(12);
  const [handwrittenText, setHandwrittenText] = useState("Once upon a time, there was a curious student named Emma who loved to explore...");
  const [penColor, setPenColor] = useState("#000000");
  const [penThickness, setPenThickness] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleSubmit = () => {
    toast.success("Submitting for AI analysis...");
    setTimeout(() => {
      navigate('/student/analysis');
    }, 1500);
  };

  const colors = ["#000000", "#2563eb", "#dc2626", "#16a34a", "#9333ea"];

  return (
    <div className="min-h-screen paper-texture">
      {/* Top Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Paragraph Writing: My Weekend</h1>
            <p className="text-sm text-muted-foreground">ELA • Due Tomorrow</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
              <Timer className="w-4 h-4" />
              {writingTime} min
            </Badge>
            <Button variant="outline" size="sm" className="hover:bg-muted">
              <Save className="w-4 h-4 mr-1" />
              Save Draft
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-100px)]">
        {/* Main Writing Canvas - 80% width */}
        <div className="flex-1 flex flex-col p-6 gap-4">
          {/* Enhanced Toolbar */}
          <Card className="p-3 shadow-paper">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Undo/Redo */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="hover:bg-muted">
                    <Undo2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:bg-muted">
                    <Redo2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="w-px h-6 bg-border" />

                {/* Pen Tool */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="bg-primary/10 hover:bg-primary/20">
                    <PenTool className="w-4 h-4 text-primary" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover:bg-muted">
                    <Eraser className="w-4 h-4" />
                  </Button>
                </div>

                <div className="w-px h-6 bg-border" />

                {/* Pen Colors */}
                <div className="flex items-center gap-1">
                  <Palette className="w-4 h-4 text-muted-foreground mr-1" />
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setPenColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        penColor === color ? "border-primary scale-110" : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="w-px h-6 bg-border" />

                {/* Pen Thickness */}
                <div className="flex items-center gap-2 w-32">
                  <span className="text-xs text-muted-foreground">Thickness</span>
                  <Slider
                    value={[penThickness]}
                    onValueChange={(val) => setPenThickness(val[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="w-20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="hover:bg-muted">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Page
                </Button>
              </div>
            </div>
          </Card>

          {/* Massive Writing Canvas */}
          <Card className="flex-1 shadow-card overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Paper Header */}
              <div className="p-4 border-b border-border bg-card">
                <p className="font-handwriting text-sm text-muted-foreground">
                  Emma Rodriguez • Grade 5 • Page {currentPage} of {totalPages}
                </p>
              </div>

              {/* Lined Paper Writing Area - Takes up most space */}
              <div className="flex-1 lined-paper bg-white p-8 overflow-y-auto">
                <Textarea
                  value={handwrittenText}
                  onChange={(e) => setHandwrittenText(e.target.value)}
                  className="w-full h-full min-h-[600px] font-handwriting text-xl leading-10 bg-transparent border-none focus-visible:ring-0 resize-none"
                  placeholder="Start writing here..."
                  style={{ lineHeight: '40px' }}
                />
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-success to-success/80 hover:opacity-90 shadow-lg px-8"
              onClick={handleSubmit}
            >
              <Send className="w-5 h-5 mr-2" />
              Submit for Analysis
            </Button>
          </div>
        </div>

        {/* Right Sidebar - Page Thumbnails (20% width) */}
        <div className="w-64 border-l border-border bg-card/30 p-4 overflow-y-auto">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Pages</h3>
          <div className="space-y-3">
            {[1, 2].map((page) => (
              <Card 
                key={page}
                className={`p-3 cursor-pointer transition-all ${
                  currentPage === page 
                    ? "border-primary shadow-md" 
                    : "hover:border-accent"
                }`}
                onClick={() => setCurrentPage(page)}
              >
                <div className="aspect-[8.5/11] bg-white lined-paper rounded border border-border mb-2">
                  <div className="p-2">
                    <p className="font-handwriting text-[8px] leading-tight opacity-60">
                      {handwrittenText.substring(0, 100)}...
                    </p>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">Page {page}</p>
              </Card>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setTotalPages(totalPages + 1)}
            >
              <Plus className="w-4 h-4 mr-1" />
              New Page
            </Button>
          </div>

          {/* Instructions Card */}
          <Card className="p-3 bg-accent/10 border-accent/30 mt-4">
            <h4 className="text-xs font-semibold text-accent-foreground mb-2">Instructions</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Write 5-7 sentences about your weekend. Include:
              <br />• Topic sentence
              <br />• Descriptive words
              <br />• Conclusion
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentWorkspace;

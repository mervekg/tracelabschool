import { useState, useRef } from "react";
import { Undo2, Redo2, Save, Send, Plus, Timer, Palette, PenTool, Eraser, Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const StudentWorkspace = () => {
  const navigate = useNavigate();
  const [writingTime, setWritingTime] = useState(12);
  const [handwrittenText, setHandwrittenText] = useState("Once upon a time, there was a curious student named Emma who loved to explore...");
  const [penColor, setPenColor] = useState("#000000");
  const [penThickness, setPenThickness] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [focusMode, setFocusMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechToTextEnabled, setSpeechToTextEnabled] = useState(true); // Set by school accommodation
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSubmit = () => {
    toast.success("Submitting for AI analysis...");
    setTimeout(() => {
      navigate('/student/analysis');
    }, 1500);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording... Speak clearly");
    } catch (error) {
      toast.error("Could not access microphone");
      console.error(error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Processing your speech...");
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        // Note: In production, this would call the Supabase edge function
        // Example: supabase.functions.invoke('speech-to-text', { body: { audio: base64Audio }})
        // For demo, we'll simulate the response
        
        // Simulated transcription for demo purposes
        setTimeout(() => {
          const simulatedText = "This is a sample transcribed text from speech.";
          setHandwrittenText(prev => prev + " " + simulatedText);
          toast.success("Text added from speech!");
        }, 1500);
        
        /* Production implementation:
        const response = await fetch('/functions/v1/speech-to-text', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`
          },
          body: JSON.stringify({ audio: base64Audio })
        });

        if (response.ok) {
          const { text } = await response.json();
          setHandwrittenText(prev => prev + " " + text);
          toast.success("Text added from speech!");
        } else {
          toast.error("Transcription failed. Please try again.");
        }
        */
      };
    } catch (error) {
      toast.error("Failed to process audio");
      console.error(error);
    }
  };

  const colors = ["#000000", "#2563eb", "#dc2626", "#16a34a", "#9333ea"];

  return (
    <div className="min-h-screen paper-texture">
      {/* Top Header */}
      <div className={`border-b border-border bg-card/50 backdrop-blur p-4 transition-all duration-300 ${focusMode ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Paragraph Writing: My Weekend</h1>
            <p className="text-sm text-muted-foreground">ELA • Due Tomorrow</p>
          </div>
          <div className="flex items-center gap-3">
            {speechToTextEnabled && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-accent/10 border border-accent/30">
                <Volume2 className="w-4 h-4 text-accent-foreground" />
                <span className="text-xs text-accent-foreground">Speech-to-Text ON</span>
              </div>
            )}
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
          <Card className={`p-3 shadow-paper transition-all duration-300 ${focusMode ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
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

              <div className="flex items-center gap-3">
                {/* Speech to Text Button */}
                {speechToTextEnabled && (
                  <Button 
                    variant={isRecording ? "destructive" : "outline"}
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={isRecording ? "animate-pulse" : ""}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-4 h-4 mr-1" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-1" />
                        Dictate
                      </>
                    )}
                  </Button>
                )}
                
                <div className="w-px h-6 bg-border" />
                
                <Button variant="ghost" size="sm" className="hover:bg-muted">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Page
                </Button>
              </div>
            </div>
          </Card>

          {/* Massive Writing Canvas */}
          <Card className="flex-1 shadow-card overflow-hidden relative">
            {/* Focus Mode Indicator */}
            {focusMode && (
              <div className="absolute top-4 right-4 z-10 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                Focus Mode
              </div>
            )}
            
            <div className="h-full flex flex-col">
              {/* Paper Header */}
              <div className="p-4 border-b border-border bg-card">
                <div className="flex items-center justify-between">
                  <p className="font-handwriting text-sm text-muted-foreground">
                    Emma Rodriguez • Grade 5 • Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Focus Mode</span>
                    <Switch
                      checked={focusMode}
                      onCheckedChange={setFocusMode}
                    />
                  </div>
                </div>
              </div>

              {/* Lined Paper Writing Area - Takes up most space */}
              <div className="flex-1 lined-paper bg-white p-8 overflow-y-auto">
                <Textarea
                  value={handwrittenText}
                  onChange={(e) => setHandwrittenText(e.target.value)}
                  onFocus={() => setFocusMode(true)}
                  className="w-full h-full min-h-[600px] font-handwriting text-xl leading-10 bg-transparent border-none focus-visible:ring-0 resize-none"
                  placeholder="Start writing here... (Click to enable focus mode)"
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
        <div className={`w-64 border-l border-border bg-card/30 p-4 overflow-y-auto transition-all duration-300 ${focusMode ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
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

          {/* Accommodation Info */}
          {speechToTextEnabled && (
            <Card className="p-3 bg-success/10 border-success/30 mt-4">
              <h4 className="text-xs font-semibold text-success mb-2 flex items-center gap-1">
                <Mic className="w-3 h-3" />
                Speech-to-Text Active
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click the "Dictate" button to speak your writing. Approved accommodation by school.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentWorkspace;

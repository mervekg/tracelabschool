import { useState, useRef } from "react";
import { Undo2, Redo2, Save, Send, Plus, Timer, Palette, PenTool, Eraser, Mic, MicOff, Volume2, Zap, MessageSquare, ScanText } from "lucide-react";
import { HandwritingCanvas, HandwritingCanvasRef } from "@/components/HandwritingCanvas";
import { LockdownMode } from "@/components/LockdownMode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";

const StudentWorkspace = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [writingTime, setWritingTime] = useState(12);
  const [penColor, setPenColor] = useState("#000000");
  const [penThickness, setPenThickness] = useState(2);
  const [isEraser, setIsEraser] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [focusMode, setFocusMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechToTextEnabled, setSpeechToTextEnabled] = useState(true); // Set by school accommodation
  const [focusModeAutoOn, setFocusModeAutoOn] = useState(true); // Set by accommodation
  const [teacherComment, setTeacherComment] = useState("");
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [recognizedText, setRecognizedText] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [lockdownEnabled, setLockdownEnabled] = useState(true); // Set by teacher per assignment
  const [violationCount, setViolationCount] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HandwritingCanvasRef>(null);

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
        // For demo purposes, showing a sample
        setTimeout(() => {
          toast.success("Speech-to-text would be added here!");
        }, 1500);
        
        /* Production implementation:
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speech-to-text`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({ audio: base64Audio })
        });

        if (response.ok) {
          const { text } = await response.json();
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

  const recognizeHandwriting = async () => {
    try {
      setIsRecognizing(true);
      toast.info("Analyzing handwriting...");

      const canvas = canvasRef.current;
      if (!canvas) {
        toast.error("Canvas not found");
        setIsRecognizing(false);
        return;
      }

      // Get canvas image data
      const imageData = canvas.getImageData();

      // For demo purposes, simulate recognition
      setTimeout(() => {
        setRecognizedText("Once upon a time, there was a curious student named Emma who loved to explore new ideas and discover amazing things in the world of learning.");
        toast.success("Handwriting converted to text!");
        setIsRecognizing(false);
      }, 2000);

      /* Production implementation:
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handwriting-recognition`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({ image: imageData })
      });

      if (response.ok) {
        const { text } = await response.json();
        setRecognizedText(text);
        toast.success("Handwriting converted to text!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Recognition failed. Please try again.");
      }
      setIsRecognizing(false);
      */
    } catch (error) {
      toast.error("Failed to recognize handwriting");
      console.error(error);
      setIsRecognizing(false);
    }
  };

  const colors = ["#000000", "#2563eb", "#dc2626", "#16a34a", "#9333ea"];

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleRedo = () => {
    canvasRef.current?.redo();
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    toast.success("Canvas cleared!");
  };

  // Auto-activate focus mode if accommodation is set
  const handleCanvasFocus = () => {
    if (focusModeAutoOn && !focusMode) {
      setFocusMode(true);
      toast.info("Focus Mode activated", { duration: 2000 });
    }
  };

  const handleLockdownViolation = (violationType: string) => {
    setViolationCount(prev => prev + 1);
    // In production, this would log to database for teacher review
    console.log(`Lockdown violation recorded: ${violationType}`, {
      student: "Emma Rodriguez",
      assignment: "Paragraph Writing: My Weekend",
      timestamp: new Date().toISOString(),
      violationType,
      violationNumber: violationCount + 1
    });
  };

  return (
    <div className="min-h-screen paper-texture">
      {/* Lockdown Mode Handler */}
      <LockdownMode
        isEnabled={lockdownEnabled}
        assignmentName="Paragraph Writing: My Weekend"
        onViolation={handleLockdownViolation}
      />
      
      {/* Focus Mode Overlay Animation */}
      {focusMode && (
        <>
          {/* Breathing glow animation */}
          <div className="fixed inset-0 pointer-events-none z-40">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-pulse" 
                 style={{ animationDuration: '3s' }} />
          </div>
          
          {/* Tooltip */}
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
            <Card className="p-3 bg-primary text-primary-foreground shadow-lg border-primary">
              <p className="text-sm font-medium">✨ You are now in Focus Mode. Let your thinking flow.</p>
            </Card>
          </div>
        </>
      )}
      {/* Top Header */}
      <div className={`border-b border-border bg-card/50 backdrop-blur p-2 sm:p-4 transition-all duration-300 ${focusMode ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-primary">Paragraph Writing: My Weekend</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">ELA • Due Tomorrow</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {speechToTextEnabled && !isMobile && (
              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-accent/10 border border-accent/30">
                <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-accent-foreground" />
                <span className="text-xs text-accent-foreground">Speech-to-Text</span>
              </div>
            )}
            <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
              <Timer className="w-3 h-3 sm:w-4 sm:h-4" />
              {writingTime} min
            </Badge>
            {!isMobile && (
              <Button variant="outline" size="sm" className="hover:bg-muted">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)]">
        {/* Main Writing Canvas */}
        <div className="flex-1 flex flex-col p-2 sm:p-4 lg:p-6 gap-2 sm:gap-4">
          {/* Instructions Card - Mobile Only, Above Canvas */}
          {isMobile && (
            <Card className={`p-3 bg-accent/10 border-accent/30 transition-all duration-300 ${focusMode ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
              <h4 className="text-xs font-semibold text-accent-foreground mb-2">Instructions</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Write 5-7 sentences about your weekend. Include: Topic sentence, Descriptive words, Conclusion
              </p>
            </Card>
          )}

          {/* Enhanced Toolbar */}
          <Card className={`p-2 sm:p-3 shadow-paper transition-all duration-300 ${focusMode ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                {/* Undo/Redo */}
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-muted h-8 w-8 sm:h-10 sm:w-10"
                    onClick={handleUndo}
                  >
                    <Undo2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-muted h-8 w-8 sm:h-10 sm:w-10"
                    onClick={handleRedo}
                  >
                    <Redo2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>

                {!isMobile && <div className="w-px h-6 bg-border" />}

                {/* Pen Tool */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 sm:h-10 sm:w-10 ${!isEraser ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-muted'}`}
                    onClick={() => setIsEraser(false)}
                  >
                    <PenTool className={`w-3 h-3 sm:w-4 sm:h-4 ${!isEraser ? 'text-primary' : ''}`} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-8 w-8 sm:h-10 sm:w-10 ${isEraser ? 'bg-destructive/10 hover:bg-destructive/20' : 'hover:bg-muted'}`}
                    onClick={() => setIsEraser(true)}
                  >
                    <Eraser className={`w-3 h-3 sm:w-4 sm:h-4 ${isEraser ? 'text-destructive' : ''}`} />
                  </Button>
                </div>

                {!isMobile && <div className="w-px h-6 bg-border" />}

                {/* Pen Colors */}
                <div className="flex items-center gap-1">
                  {!isMobile && <Palette className="w-4 h-4 text-muted-foreground mr-1" />}
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setPenColor(color)}
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all ${
                        penColor === color ? "border-primary scale-110" : "border-border"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                {!isMobile && (
                  <>
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
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
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
                        <MicOff className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Stop</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Dictate</span>
                      </>
                    )}
                  </Button>
                )}
                
                {/* Handwriting Recognition Button */}
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={recognizeHandwriting}
                  disabled={isRecognizing}
                  className={isRecognizing ? "animate-pulse" : ""}
                >
                  <ScanText className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                  <span className="hidden sm:inline">
                    {isRecognizing ? "Analyzing..." : "Convert"}
                  </span>
                </Button>
                
                {!isMobile && <div className="w-px h-6 bg-border" />}
                
                {!isMobile && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-muted"
                      onClick={handleClear}
                    >
                      Clear
                    </Button>
                    <Button variant="ghost" size="sm" className="hover:bg-muted">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Page
                    </Button>
                  </>
                )}
                
                {isMobile && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="hover:bg-muted"
                  >
                    Pages ({currentPage}/{totalPages})
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Massive Writing Canvas - HANDWRITING ONLY */}
          <Card className="flex-1 shadow-card overflow-hidden relative transition-all duration-500">
            {/* Focus Mode Indicator */}
            {focusMode && (
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-primary/90 text-primary-foreground px-2 py-1 sm:px-3 rounded-full text-xs font-semibold shadow-lg animate-fade-in">
                Focus Mode
              </div>
            )}
            
            {/* Focus ring animation */}
            {focusMode && (
              <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 rounded-lg ring-2 ring-primary/30 animate-pulse" 
                     style={{ animationDuration: '2s' }} />
              </div>
            )}
            
            <div className="h-full flex flex-col relative z-10">
              {/* Paper Header */}
              <div className="p-2 sm:p-4 border-b border-border bg-card">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="font-handwriting text-xs sm:text-sm text-muted-foreground">
                    Emma Rodriguez • Grade 5 • Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Focus Mode</span>
                    <Switch
                      checked={focusMode}
                      onCheckedChange={(checked) => {
                        setFocusMode(checked);
                        if (!checked) {
                          toast.info("Focus Mode paused", { duration: 2000 });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Real Handwriting Canvas with Touch Support */}
              <div 
                className="flex-1 bg-white overflow-hidden"
                onClick={handleCanvasFocus}
              >
                <HandwritingCanvas
                  ref={canvasRef}
                  penColor={penColor}
                  penThickness={penThickness}
                  isEraser={isEraser}
                />
              </div>
            </div>
          </Card>

          {/* Recognized Text Display */}
          {recognizedText && !focusMode && (
            <Card className="p-3 sm:p-4 bg-accent/10 border-accent/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ScanText className="w-4 h-4 text-accent-foreground" />
                  <h3 className="text-sm font-semibold text-accent-foreground">Converted Text (For Accessibility)</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(recognizedText);
                    toast.success("Text copied to clipboard!");
                  }}
                >
                  Copy
                </Button>
              </div>
              <div className="p-3 bg-background rounded-md max-h-[200px] overflow-y-auto">
                <p className="text-sm text-foreground whitespace-pre-wrap">{recognizedText}</p>
              </div>
            </Card>
          )}

          {/* Comment to Teacher - Separate Typed Section */}
          {!focusMode && (
            <Card className="p-3 sm:p-4 bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Optional: Comment to Teacher</h3>
              </div>
              <Textarea
                value={teacherComment}
                onChange={(e) => setTeacherComment(e.target.value)}
                className="w-full min-h-[80px] text-sm bg-background"
                placeholder="Type any questions or notes for your teacher here..."
              />
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button 
              size={isMobile ? "default" : "lg"}
              className="bg-gradient-to-r from-success to-success/80 hover:opacity-90 shadow-lg px-6 sm:px-8 w-full sm:w-auto"
              onClick={handleSubmit}
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Submit for Analysis
            </Button>
          </div>
        </div>

        {/* Right Sidebar - Page Thumbnails (Desktop) or Modal (Mobile) */}
        {(!isMobile || showSidebar) && (
          <div className={`${
            isMobile 
              ? 'fixed inset-0 z-50 bg-background/95 backdrop-blur-sm p-4' 
              : 'w-64 border-l border-border bg-card/30 p-4'
          } overflow-y-auto transition-all duration-300 ${focusMode ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
            {isMobile && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Pages</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowSidebar(false)}>
                  Close
                </Button>
              </div>
            )}
            {!isMobile && <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Pages</h3>}
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
                      Page preview...
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

          {/* Instructions Card - Desktop Only */}
          {!isMobile && (
            <Card className="p-3 bg-accent/10 border-accent/30 mt-4">
            <h4 className="text-xs font-semibold text-accent-foreground mb-2">Instructions</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Write 5-7 sentences about your weekend. Include:
                <br />• Topic sentence
                <br />• Descriptive words
                <br />• Conclusion
              </p>
            </Card>
          )}

          {/* Accommodation Info */}
          {speechToTextEnabled && (
            <Card className="p-3 bg-success/10 border-success/30 mt-4 animate-fade-in">
              <h4 className="text-xs font-semibold text-success mb-2 flex items-center gap-1">
                <Mic className="w-3 h-3" />
                Speech-to-Text Active
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Click the "Dictate" button to speak your writing. Approved accommodation by school.
              </p>
            </Card>
          )}

          {focusModeAutoOn && (
            <Card className="p-3 bg-primary/10 border-primary/30 mt-4 animate-fade-in">
              <h4 className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Focus Mode Auto-On
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Focus mode will automatically activate when you start writing.
              </p>
            </Card>
          )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentWorkspace;

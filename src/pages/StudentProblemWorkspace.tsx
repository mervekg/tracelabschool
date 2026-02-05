import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import StudentLayout from "@/components/student/StudentLayout";
import QuestionPanel from "@/components/workspace/QuestionPanel";
import CanvasToolbar from "@/components/workspace/CanvasToolbar";
import ShapesPanel from "@/components/workspace/ShapesPanel";
import { ProblemCanvas, ProblemCanvasRef, ToolType, BackgroundType } from "@/components/workspace/ProblemCanvas";
import SubmissionInputTabs from "@/components/student/SubmissionInputTabs";
import { Card } from "@/components/ui/card";

// Mock question for demo
const mockQuestion = {
  id: "q1",
  number: 1,
  text: "A ball is thrown vertically upward with an initial velocity of 20 m/s. Calculate: (a) the maximum height reached, (b) the time taken to reach the maximum height, and (c) the total time in the air. Show all your work, including diagrams and formulas used. (Assume g = 10 m/s²)",
  subject: "Physics",
  points: 25,
};

const StudentProblemWorkspace = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const canvasRef = useRef<ProblemCanvasRef>(null);

  // Tool state
  const [tool, setTool] = useState<ToolType>("pen");
  const [penColor, setPenColor] = useState("#1e3a5f");
  const [penThickness, setPenThickness] = useState(4);
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("grid");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // File upload state
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<string | null>(null);
  const [submissionMode, setSubmissionMode] = useState<"handwriting" | "upload">("handwriting");

  const handleUndo = () => canvasRef.current?.undo();
  const handleRedo = () => canvasRef.current?.redo();
  const handleClear = () => {
    if (confirm("Are you sure you want to clear your work?")) {
      canvasRef.current?.clear();
    }
  };

  const handleAddShape = (shapeType: ToolType) => {
    canvasRef.current?.addShape(shapeType);
    setTool("select");
  };

  const handleFileUploaded = (url: string, fileType: string) => {
    setUploadedFileUrl(url);
    setUploadedFileType(fileType);
    setSubmissionMode("upload");
  };

  const handleFileRemoved = () => {
    setUploadedFileUrl(null);
    setUploadedFileType(null);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Save based on submission mode
      if (submissionMode === "upload" && uploadedFileUrl) {
        console.log("Draft saved with file:", uploadedFileUrl);
      } else {
        const imageData = canvasRef.current?.getImageData();
        if (!imageData) throw new Error("No canvas data");
        console.log("Draft saved:", imageData.substring(0, 100) + "...");
      }
      toast.success("Draft saved!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!confirm("Are you ready to submit your answer? Make sure you've shown all your work.")) {
      return;
    }

    setIsSubmitting(true);
    try {
      let imageData: string | null = null;
      let fileUrl: string | null = null;

      if (submissionMode === "upload" && uploadedFileUrl) {
        fileUrl = uploadedFileUrl;
      } else {
        imageData = canvasRef.current?.getImageData() || null;
        if (!imageData) throw new Error("No canvas data");
      }

      // Call the analyze-solution edge function
      const { data, error } = await supabase.functions.invoke("analyze-solution", {
        body: {
          imageData: imageData || fileUrl,
          questionText: mockQuestion.text,
          subject: mockQuestion.subject,
          gradeLevel: "High School",
          isFileUpload: submissionMode === "upload",
        },
      });

      if (error) throw error;

      console.log("Analysis result:", data);
      toast.success("Work submitted successfully! Your teacher will review it soon.");
      
      // Navigate back or to results
      setTimeout(() => navigate("/student"), 1500);
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  // Canvas content for the tabs component
  const canvasContent = (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex justify-center">
        <CanvasToolbar
          tool={tool}
          setTool={setTool}
          penColor={penColor}
          setPenColor={setPenColor}
          penThickness={penThickness}
          setPenThickness={setPenThickness}
          backgroundType={backgroundType}
          setBackgroundType={setBackgroundType}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
        />
      </div>

      {/* Canvas with Shapes Panel */}
      <div className="flex gap-3 h-[400px] md:h-[500px]">
        {/* Main Canvas */}
        <div className="flex-1 rounded-lg border border-border shadow-sm overflow-hidden">
          <ProblemCanvas
            ref={canvasRef}
            penColor={penColor}
            penThickness={penThickness}
            tool={tool}
            backgroundType={backgroundType}
          />
        </div>

        {/* Shapes Panel */}
        <div className="shrink-0 hidden md:block">
          <ShapesPanel onAddShape={handleAddShape} />
        </div>
      </div>
    </div>
  );

  return (
    <StudentLayout>
      <div className="h-[calc(100vh-64px)] flex flex-col bg-background overflow-y-auto">
        {/* Question Panel - Fixed top ~20% */}
        <div className="shrink-0">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">Problem Solving</h1>
          </div>
          <QuestionPanel
            questionNumber={mockQuestion.number}
            questionText={mockQuestion.text}
            subject={mockQuestion.subject}
            points={mockQuestion.points}
          />
        </div>

        {/* Workspace Area with Tabs */}
        <div className="flex-1 flex flex-col p-4 min-h-0">
          {/* Submission Input Tabs: Handwriting vs Upload */}
          <SubmissionInputTabs
            canvasContent={canvasContent}
            onFileUploaded={handleFileUploaded}
            onFileRemoved={handleFileRemoved}
            assignmentId={mockQuestion.id}
            uploadLabel="Upload your work"
            uploadDescription="Take a photo of your paper test or upload a scanned PDF/image."
            className="flex-1"
          />

          {/* Submit Actions */}
          <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {submissionMode === "upload" && uploadedFileUrl
                ? "File ready for submission"
                : "Show all your work, including diagrams, formulas, and calculations."}
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={handleSaveDraft} 
                disabled={isSaving}
                className="flex-1 sm:flex-none"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Draft
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || (submissionMode === "upload" && !uploadedFileUrl)}
                className="bg-gradient-to-r from-primary to-primary/80 flex-1 sm:flex-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Answer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentProblemWorkspace;

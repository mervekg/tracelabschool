import { ArrowLeft, Plus, Save, Trash2, Copy, Settings, Upload, Sparkles, FileText, Loader2, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RubricCategory {
  name: string;
  maxScore: number;
  description: string;
  criteria?: {
    excellent: string;
    good: string;
    developing: string;
    needs_improvement: string;
  };
}

interface AIQuestion {
  id: string;
  question: string;
  type: "text" | "multiselect";
  options?: string[];
}

const RubricBuilder = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [rubricName, setRubricName] = useState("ELA Paragraph Writing Rubric");
  const [categories, setCategories] = useState<RubricCategory[]>([
    { name: "Content & Ideas", maxScore: 25, description: "Clear main idea with supporting details" },
    { name: "Organization", maxScore: 25, description: "Logical flow and paragraph structure" },
    { name: "Mechanics", maxScore: 25, description: "Grammar, punctuation, capitalization" },
    { name: "Word Choice", maxScore: 25, description: "Descriptive and appropriate vocabulary" },
  ]);

  // AI Generation state
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiStep, setAiStep] = useState<"upload" | "questions" | "generating" | "complete">("upload");
  const [gradeLevel, setGradeLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [assignmentContent, setAssignmentContent] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [aiNotes, setAiNotes] = useState("");

  const handleSave = () => {
    toast.success("Rubric saved successfully!");
    setTimeout(() => navigate('/teacher'), 1000);
  };

  const addCategory = () => {
    setCategories([...categories, { name: "New Category", maxScore: 10, description: "" }]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);

    // Handle text-based files
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      const text = await file.text();
      setAssignmentContent(text);
      toast.success(`Loaded ${file.name}`);
      return;
    }

    // For PDFs and other documents, we'd need to parse them
    // For now, just acknowledge the upload and let the teacher paste content
    if (file.type === "application/pdf") {
      toast.info("PDF uploaded. Please also paste the assignment text for best results.");
    }
  };

  const startAIGeneration = async () => {
    if (!gradeLevel || !subject) {
      toast.error("Please select grade level and subject");
      return;
    }

    setIsLoading(true);
    setAiStep("generating");

    try {
      // If we have assignment content, first get clarifying questions
      if (assignmentContent.trim()) {
        const { data, error } = await supabase.functions.invoke("generate-rubric", {
          body: {
            assignmentContent,
            gradeLevel,
            subject,
            questionType: "initial",
          },
        });

        if (error) throw error;

        if (data.type === "questions" && data.data?.questions?.length > 0) {
          setAiQuestions(data.data.questions);
          setAiStep("questions");
          setIsLoading(false);
          return;
        }
      }

      // If no content or no questions, generate directly
      await generateRubric();
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast.error(error.message || "Failed to start AI generation");
      setAiStep("upload");
      setIsLoading(false);
    }
  };

  const generateRubric = async () => {
    setIsLoading(true);
    setAiStep("generating");

    try {
      const { data, error } = await supabase.functions.invoke("generate-rubric", {
        body: {
          assignmentContent,
          gradeLevel,
          subject,
          customInstructions,
          questionType: "followup",
          previousAnswers: questionAnswers,
        },
      });

      if (error) throw error;

      if (data.type === "rubric" && data.data) {
        const rubric = data.data;
        setRubricName(rubric.name || `${subject} Rubric`);
        setCategories(
          rubric.categories.map((cat: any) => ({
            name: cat.name,
            maxScore: cat.maxScore,
            description: cat.description,
            criteria: cat.criteria,
          }))
        );
        setAiNotes(rubric.notes || "");
        setAiStep("complete");
        toast.success("Rubric generated successfully!");
        
        // Close dialog after brief delay
        setTimeout(() => {
          setShowAIDialog(false);
          resetAIState();
        }, 1500);
      }
    } catch (error: any) {
      console.error("Rubric generation error:", error);
      toast.error(error.message || "Failed to generate rubric");
      setAiStep("upload");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAIState = () => {
    setAiStep("upload");
    setAiQuestions([]);
    setQuestionAnswers({});
    setIsLoading(false);
  };

  const openAIDialog = () => {
    resetAIState();
    setShowAIDialog(true);
  };

  const presetRubrics = [
    { name: "ELA Paragraph", icon: "📝", categories: 4 },
    { name: "Math Multi-Step", icon: "🔢", categories: 5 },
    { name: "Science CER", icon: "🔬", categories: 3 },
    { name: "Creative Writing", icon: "✍️", categories: 6 },
  ];

  const gradeLevels = [
    "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade",
    "6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade", "11th Grade", "12th Grade",
    "College/University"
  ];

  const subjects = [
    "English Language Arts", "Mathematics", "Science", "Social Studies", "History",
    "Art", "Music", "Physical Education", "World Languages", "Computer Science", "Other"
  ];

  return (
    <div className="min-h-screen paper-texture p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/teacher')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary">Rubric Builder</h1>
              <p className="text-sm text-muted-foreground">Create custom rubrics for your assignments</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save as Template
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-primary to-primary/80">
              <Save className="w-4 h-4 mr-2" />
              Save & Use
            </Button>
          </div>
        </div>

        {/* AI Generation Card */}
        <Card className="p-6 shadow-card bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border-violet-200 dark:border-violet-800">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">AI Rubric Generator</h2>
                <p className="text-sm text-muted-foreground">
                  Upload your worksheet or assignment and let AI create a grade-appropriate rubric
                </p>
              </div>
            </div>
            <Button onClick={openAIDialog} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
              <Upload className="w-4 h-4 mr-2" />
              Generate with AI
            </Button>
          </div>
        </Card>

        {/* AI Notes (if generated) */}
        {aiNotes && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>AI Notes:</strong> {aiNotes}
            </p>
          </Card>
        )}

        {/* Preset Templates */}
        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-semibold mb-4">Quick Start Templates</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {presetRubrics.map((preset, index) => (
              <Card 
                key={index}
                className="p-4 text-center cursor-pointer hover:shadow-paper transition-all border-2 hover:border-primary"
              >
                <div className="text-3xl mb-2">{preset.icon}</div>
                <p className="font-semibold text-sm mb-1">{preset.name}</p>
                <Badge variant="outline" className="text-xs">{preset.categories} categories</Badge>
              </Card>
            ))}
          </div>
        </Card>

        {/* Rubric Name */}
        <Card className="p-6 shadow-card">
          <h2 className="text-xl font-semibold mb-4">Rubric Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Rubric Name</label>
              <Input 
                value={rubricName}
                onChange={(e) => setRubricName(e.target.value)}
                placeholder="Enter rubric name..."
                className="text-lg font-semibold"
              />
            </div>
          </div>
        </Card>

        {/* Categories */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Rubric Categories</h2>
            <Button onClick={addCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
          
          <div className="space-y-4">
            {categories.map((category, index) => (
              <Card key={index} className="p-4 bg-muted/30">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Category Name</label>
                        <Input 
                          value={category.name}
                          onChange={(e) => {
                            const newCategories = [...categories];
                            newCategories[index].name = e.target.value;
                            setCategories(newCategories);
                          }}
                          placeholder="e.g., Content & Ideas"
                        />
                      </div>
                      <div className="w-32">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Points</label>
                        <Input 
                          type="number"
                          value={category.maxScore}
                          onChange={(e) => {
                            const newCategories = [...categories];
                            newCategories[index].maxScore = parseInt(e.target.value) || 0;
                            setCategories(newCategories);
                          }}
                          placeholder="25"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                      <Textarea
                        value={category.description}
                        onChange={(e) => {
                          const newCategories = [...categories];
                          newCategories[index].description = e.target.value;
                          setCategories(newCategories);
                        }}
                        placeholder="Describe what this category measures..."
                        rows={2}
                      />
                    </div>
                    {/* Show detailed criteria if AI generated */}
                    {category.criteria && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Object.entries(category.criteria).map(([level, desc]) => (
                          <div key={level} className="p-2 rounded bg-background text-xs">
                            <span className="font-semibold capitalize">{level.replace("_", " ")}:</span>
                            <p className="text-muted-foreground mt-1">{desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="hover:bg-accent"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="hover:bg-destructive/10"
                      onClick={() => removeCategory(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Total Score */}
          <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/30">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-primary">Total Points</p>
              <p className="text-2xl font-bold text-primary">
                {categories.reduce((sum, cat) => sum + cat.maxScore, 0)}
              </p>
            </div>
          </div>
        </Card>

        {/* AI Alignment Settings */}
        <Card className="p-6 shadow-card bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-accent-foreground" />
            AI Alignment Settings
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            TraceLab AI will automatically analyze student work based on your rubric categories and provide 
            initial scoring suggestions. You can always override these suggestions.
          </p>
          <div className="flex gap-4">
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configure AI Weighting
            </Button>
          </div>
        </Card>
      </div>

      {/* AI Generation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              AI Rubric Generator
            </DialogTitle>
          </DialogHeader>

          {aiStep === "upload" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Grade Level *</Label>
                  <Select value={gradeLevel} onValueChange={setGradeLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeLevels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject *</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Upload Assignment (optional)</Label>
                <div 
                  className="mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadedFileName ? (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <FileText className="w-5 h-5" />
                      <span>{uploadedFileName}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload worksheet or assignment file
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports TXT, MD, PDF, DOC files
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <Label>Or paste assignment content</Label>
                <Textarea
                  value={assignmentContent}
                  onChange={(e) => setAssignmentContent(e.target.value)}
                  placeholder="Paste your worksheet questions, assignment instructions, or learning objectives here..."
                  rows={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Additional instructions (optional)</Label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Any specific requirements or focus areas for the rubric..."
                  rows={2}
                  className="mt-2"
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAIDialog(false)}>Cancel</Button>
                <Button onClick={startAIGeneration} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4 mr-2" />
                      Continue
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}

          {aiStep === "questions" && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Please answer these questions to help create a better rubric:
              </p>
              
              {aiQuestions.map((q) => (
                <div key={q.id}>
                  <Label>{q.question}</Label>
                  {q.type === "multiselect" && q.options ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {q.options.map((opt) => (
                        <Badge
                          key={opt}
                          variant={questionAnswers[q.id]?.includes(opt) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const current = questionAnswers[q.id] || "";
                            const opts = current.split(", ").filter(Boolean);
                            const newOpts = opts.includes(opt)
                              ? opts.filter(o => o !== opt)
                              : [...opts, opt];
                            setQuestionAnswers({ ...questionAnswers, [q.id]: newOpts.join(", ") });
                          }}
                        >
                          {opt}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <Textarea
                      value={questionAnswers[q.id] || ""}
                      onChange={(e) => setQuestionAnswers({ ...questionAnswers, [q.id]: e.target.value })}
                      placeholder="Your answer..."
                      rows={2}
                      className="mt-2"
                    />
                  )}
                </div>
              ))}

              <DialogFooter>
                <Button variant="outline" onClick={() => setAiStep("upload")}>Back</Button>
                <Button onClick={generateRubric} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Rubric
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}

          {aiStep === "generating" && (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-violet-500 mb-4" />
              <p className="text-lg font-medium">Generating your rubric...</p>
              <p className="text-sm text-muted-foreground mt-2">
                Creating grade-appropriate criteria for {gradeLevel} {subject}
              </p>
            </div>
          )}

          {aiStep === "complete" && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-lg font-medium text-green-600 dark:text-green-400">Rubric Generated!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your rubric has been created. You can now edit and customize it.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RubricBuilder;

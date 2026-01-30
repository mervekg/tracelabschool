import { useState, useEffect } from "react";
import { Plus, Trash2, Sparkles, Loader2, GripVertical, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface RubricCategory {
  id?: string;
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

export interface Rubric {
  id?: string;
  name: string;
  categories: RubricCategory[];
  totalPoints: number;
  notes?: string;
}

interface RubricEditorProps {
  classId: string;
  gradeLevel: string;
  subject: string;
  skills?: { skill_code: string; skill_name: string; description?: string }[];
  assignmentContent?: string;
  onSave: (rubric: Rubric) => void;
  onCancel: () => void;
  initialRubric?: Rubric | null;
}

interface AIQuestion {
  id: string;
  question: string;
  type: "text" | "multiselect";
  options?: string[];
}

const RubricEditor = ({
  classId,
  gradeLevel,
  subject,
  skills = [],
  assignmentContent = "",
  onSave,
  onCancel,
  initialRubric,
}: RubricEditorProps) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [rubricName, setRubricName] = useState(initialRubric?.name || "");
  const [categories, setCategories] = useState<RubricCategory[]>(
    initialRubric?.categories || [
      { name: "Content & Ideas", maxScore: 25, description: "" },
      { name: "Organization", maxScore: 25, description: "" },
      { name: "Mechanics", maxScore: 25, description: "" },
      { name: "Effort", maxScore: 25, description: "" },
    ]
  );
  const [notes, setNotes] = useState(initialRubric?.notes || "");

  // AI generation state
  const [aiStep, setAiStep] = useState<"config" | "questions" | "generating" | "done">("config");
  const [aiQuestions, setAiQuestions] = useState<AIQuestion[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [customInstructions, setCustomInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const gradeLevels = [
    "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade",
    "6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade", "11th Grade", "12th Grade",
  ];

  const totalPoints = categories.reduce((sum, cat) => sum + cat.maxScore, 0);

  const addCategory = () => {
    setCategories([...categories, { name: "New Category", maxScore: 10, description: "" }]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategory = (index: number, updates: Partial<RubricCategory>) => {
    const newCategories = [...categories];
    newCategories[index] = { ...newCategories[index], ...updates };
    setCategories(newCategories);
  };

  const handleSave = () => {
    if (!rubricName.trim()) {
      toast({ title: "Error", description: "Please enter a rubric name", variant: "destructive" });
      return;
    }
    if (categories.length === 0) {
      toast({ title: "Error", description: "Please add at least one category", variant: "destructive" });
      return;
    }

    onSave({
      name: rubricName,
      categories,
      totalPoints,
      notes,
    });
  };

  const startAIGeneration = async () => {
    setIsLoading(true);
    setAiStep("generating");

    try {
      // Build skills context
      const skillsContext = skills.length > 0
        ? `\n\nClass Skills/Standards (TEKs):\n${skills.map(s => `- ${s.skill_code}: ${s.skill_name}${s.description ? ` - ${s.description}` : ""}`).join("\n")}`
        : "";

      const { data, error } = await supabase.functions.invoke("generate-rubric", {
        body: {
          assignmentContent: assignmentContent + skillsContext,
          gradeLevel,
          subject,
          customInstructions,
          questionType: "initial",
        },
      });

      if (error) throw error;

      if (data.type === "questions" && data.data?.questions?.length > 0) {
        setAiQuestions(data.data.questions);
        setAiStep("questions");
      } else {
        await generateRubricFromAnswers();
      }
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast({ title: "Error", description: error.message || "Failed to start AI generation", variant: "destructive" });
      setAiStep("config");
    } finally {
      setIsLoading(false);
    }
  };

  const generateRubricFromAnswers = async () => {
    setIsLoading(true);
    setAiStep("generating");

    try {
      const skillsContext = skills.length > 0
        ? `\n\nClass Skills/Standards (TEKs):\n${skills.map(s => `- ${s.skill_code}: ${s.skill_name}${s.description ? ` - ${s.description}` : ""}`).join("\n")}`
        : "";

      const { data, error } = await supabase.functions.invoke("generate-rubric", {
        body: {
          assignmentContent: assignmentContent + skillsContext,
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
        setNotes(rubric.notes || "");
        setAiStep("done");
        toast({ title: "Success", description: "Rubric generated! You can now edit it." });
      }
    } catch (error: any) {
      console.error("Rubric generation error:", error);
      toast({ title: "Error", description: error.message || "Failed to generate rubric", variant: "destructive" });
      setAiStep("config");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as "manual" | "ai")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Creation</TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Generation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4 mt-4">
          {aiStep === "config" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800">
                <p className="text-sm text-violet-700 dark:text-violet-300">
                  AI will generate a rubric based on the assignment content, grade level ({gradeLevel}),
                  subject ({subject}), and any skills/TEKs you've added to this class.
                </p>
              </div>

              {skills.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Skills/TEKs that will be considered:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {skills.map((skill) => (
                      <Badge key={skill.skill_code} variant="secondary" className="text-xs">
                        {skill.skill_code}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label>Additional Instructions (optional)</Label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="E.g., Focus on paragraph structure, weight grammar heavily, include creativity..."
                  rows={3}
                />
              </div>

              <Button
                onClick={startAIGeneration}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Rubric with AI
                  </>
                )}
              </Button>
            </div>
          )}

          {aiStep === "questions" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please answer these questions to help generate a better rubric:
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
                            const arr = current.split(", ").filter(Boolean);
                            if (arr.includes(opt)) {
                              setQuestionAnswers({ ...questionAnswers, [q.id]: arr.filter((x) => x !== opt).join(", ") });
                            } else {
                              setQuestionAnswers({ ...questionAnswers, [q.id]: [...arr, opt].join(", ") });
                            }
                          }}
                        >
                          {opt}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <Input
                      value={questionAnswers[q.id] || ""}
                      onChange={(e) => setQuestionAnswers({ ...questionAnswers, [q.id]: e.target.value })}
                      className="mt-1"
                    />
                  )}
                </div>
              ))}
              <Button onClick={generateRubricFromAnswers} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Rubric...
                  </>
                ) : (
                  "Generate Rubric"
                )}
              </Button>
            </div>
          )}

          {aiStep === "generating" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Generating your rubric...</p>
            </div>
          )}

          {aiStep === "done" && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                ✓ AI rubric generated! Edit the categories below as needed.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Create your rubric manually by adding and configuring categories below.
          </p>
        </TabsContent>
      </Tabs>

      {/* Rubric Editor (shown in both modes after AI generates) */}
      {(mode === "manual" || aiStep === "done") && (
        <div className="space-y-4">
          <div>
            <Label>Rubric Name</Label>
            <Input
              value={rubricName}
              onChange={(e) => setRubricName(e.target.value)}
              placeholder="e.g., Essay Writing Rubric"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Categories</Label>
              <Button size="sm" variant="outline" onClick={addCategory}>
                <Plus className="w-4 h-4 mr-1" />
                Add Category
              </Button>
            </div>

            {categories.map((category, index) => (
              <Card key={index}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <div className="col-span-2">
                        <Input
                          value={category.name}
                          onChange={(e) => updateCategory(index, { name: e.target.value })}
                          placeholder="Category name"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          value={category.maxScore}
                          onChange={(e) => updateCategory(index, { maxScore: parseInt(e.target.value) || 0 })}
                          placeholder="Points"
                        />
                      </div>
                      <div className="flex items-center justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => removeCategory(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Textarea
                    value={category.description}
                    onChange={(e) => updateCategory(index, { description: e.target.value })}
                    placeholder="Description of what this category measures..."
                    rows={2}
                    className="text-sm"
                  />
                  {category.criteria && (
                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      {Object.entries(category.criteria).map(([level, desc]) => (
                        <div key={level} className="p-2 rounded bg-muted">
                          <span className="font-semibold capitalize">{level.replace("_", " ")}:</span>
                          <p className="text-muted-foreground mt-1">{desc}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center justify-between">
              <span className="font-medium">Total Points</span>
              <span className="text-xl font-bold text-primary">{totalPoints}</span>
            </div>
          </div>

          {notes && (
            <div className="p-3 rounded-lg bg-muted">
              <Label className="text-xs text-muted-foreground">AI Notes</Label>
              <p className="text-sm mt-1">{notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={(mode === "ai" && aiStep !== "done") || categories.length === 0}>
          <Save className="w-4 h-4 mr-2" />
          Save Rubric
        </Button>
      </div>
    </div>
  );
};

export default RubricEditor;

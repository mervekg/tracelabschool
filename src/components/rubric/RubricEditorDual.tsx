import { useState } from "react";
import { Plus, Trash2, Sparkles, Loader2, Save, ChevronDown, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Rubric, RubricCriterion, RubricCriterionLevel } from "./RubricTypes";

interface RubricEditorDualProps {
  classId: string;
  gradeLevel: string;
  subject: string;
  skills?: { skill_code: string; skill_name: string; description?: string }[];
  assignmentContent?: string;
  onSave: (rubric: Rubric) => void;
  onCancel: () => void;
  initialRubric?: Rubric | null;
}

const defaultLevels = (): RubricCriterionLevel[] => [
  { level: 4, label: "Excellent", teacherDescription: "", studentDescription: "" },
  { level: 3, label: "Good", teacherDescription: "", studentDescription: "" },
  { level: 2, label: "Developing", teacherDescription: "", studentDescription: "" },
  { level: 1, label: "Needs Improvement", teacherDescription: "", studentDescription: "" },
];

const createDefaultCriterion = (): RubricCriterion => ({
  id: crypto.randomUUID(),
  name: "New Criterion",
  description: "",
  weight: 1.0,
  maxScore: 25,
  levels: defaultLevels(),
});

const RubricEditorDual = ({
  classId,
  gradeLevel,
  subject,
  skills = [],
  assignmentContent = "",
  onSave,
  onCancel,
  initialRubric,
}: RubricEditorDualProps) => {
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [rubricName, setRubricName] = useState(initialRubric?.name || "");
  const [criteria, setCriteria] = useState<RubricCriterion[]>(
    initialRubric?.criteria || [
      { ...createDefaultCriterion(), id: "1", name: "Content & Ideas", maxScore: 25 },
      { ...createDefaultCriterion(), id: "2", name: "Organization", maxScore: 25 },
      { ...createDefaultCriterion(), id: "3", name: "Mechanics", maxScore: 25 },
      { ...createDefaultCriterion(), id: "4", name: "Effort", maxScore: 25 },
    ]
  );
  const [notes, setNotes] = useState(initialRubric?.notes || "");
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set());
  
  // AI state
  const [isLoading, setIsLoading] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");

  const totalPoints = criteria.reduce((sum, c) => sum + c.maxScore, 0);

  const toggleCriterion = (id: string) => {
    const newExpanded = new Set(expandedCriteria);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCriteria(newExpanded);
  };

  const addCriterion = () => {
    setCriteria([...criteria, createDefaultCriterion()]);
  };

  const removeCriterion = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  const updateCriterion = (id: string, updates: Partial<RubricCriterion>) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const updateLevel = (criterionId: string, level: number, field: "teacherDescription" | "studentDescription", value: string) => {
    setCriteria(criteria.map(c => {
      if (c.id !== criterionId) return c;
      return {
        ...c,
        levels: c.levels.map(l => l.level === level ? { ...l, [field]: value } : l),
      };
    }));
  };

  const handleSave = () => {
    if (!rubricName.trim()) {
      toast.error("Please enter a rubric name");
      return;
    }
    if (criteria.length === 0) {
      toast.error("Please add at least one criterion");
      return;
    }

    onSave({
      id: initialRubric?.id || crypto.randomUUID(),
      name: rubricName,
      criteria,
      totalPoints,
      notes,
      classId,
    });
  };

  const generateWithAI = async () => {
    setIsLoading(true);
    try {
      const skillsContext = skills.length > 0
        ? `\n\nClass Skills/Standards:\n${skills.map(s => `- ${s.skill_code}: ${s.skill_name}`).join("\n")}`
        : "";

      const { data, error } = await supabase.functions.invoke("generate-rubric", {
        body: {
          assignmentContent: assignmentContent + skillsContext,
          gradeLevel,
          subject,
          customInstructions,
          questionType: "followup",
        },
      });

      if (error) throw error;

      if (data.type === "rubric" && data.data) {
        const rubric = data.data;
        setRubricName(rubric.name || `${subject} Rubric`);
        
        // Map AI response to our criteria format with dual descriptions
        const newCriteria: RubricCriterion[] = rubric.categories.map((cat: any) => ({
          id: crypto.randomUUID(),
          name: cat.name,
          description: cat.description || "",
          weight: cat.weight || 1.0,
          maxScore: cat.maxScore,
          levels: [
            {
              level: 4,
              label: "Excellent",
              teacherDescription: typeof cat.criteria?.excellent === 'object' 
                ? cat.criteria.excellent.teacher_description 
                : cat.criteria?.excellent || "",
              studentDescription: typeof cat.criteria?.excellent === 'object' 
                ? cat.criteria.excellent.student_description 
                : cat.criteria?.excellent || "",
            },
            {
              level: 3,
              label: "Good",
              teacherDescription: typeof cat.criteria?.good === 'object' 
                ? cat.criteria.good.teacher_description 
                : cat.criteria?.good || "",
              studentDescription: typeof cat.criteria?.good === 'object' 
                ? cat.criteria.good.student_description 
                : cat.criteria?.good || "",
            },
            {
              level: 2,
              label: "Developing",
              teacherDescription: typeof cat.criteria?.developing === 'object' 
                ? cat.criteria.developing.teacher_description 
                : cat.criteria?.developing || "",
              studentDescription: typeof cat.criteria?.developing === 'object' 
                ? cat.criteria.developing.student_description 
                : cat.criteria?.developing || "",
            },
            {
              level: 1,
              label: "Needs Improvement",
              teacherDescription: typeof cat.criteria?.needs_improvement === 'object' 
                ? cat.criteria.needs_improvement.teacher_description 
                : cat.criteria?.needs_improvement || "",
              studentDescription: typeof cat.criteria?.needs_improvement === 'object' 
                ? cat.criteria.needs_improvement.student_description 
                : cat.criteria?.needs_improvement || "",
            },
          ],
        }));

        setCriteria(newCriteria);
        setNotes(rubric.notes || "");
        setMode("manual"); // Switch to manual for editing
        toast.success("Rubric generated! Review and edit the criteria.");
      }
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast.error(error.message || "Failed to generate rubric");
    } finally {
      setIsLoading(false);
    }
  };

  const levelColors: Record<number, string> = {
    4: "border-success/50 bg-success/5",
    3: "border-primary/50 bg-primary/5",
    2: "border-warning/50 bg-warning/5",
    1: "border-muted-foreground/50 bg-muted/30",
  };

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as "manual" | "ai")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Manual Creation</TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Generation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-4 mt-4">
          <div className="p-4 rounded-lg bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800">
            <p className="text-sm text-violet-700 dark:text-violet-300 mb-3">
              AI will generate both teacher and student descriptions for each criterion, 
              based on {gradeLevel} {subject} standards.
            </p>
            <Textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Optional: Add specific instructions (e.g., 'Focus on paragraph structure', 'Include creativity criterion')"
              rows={2}
            />
          </div>
          <Button
            onClick={generateWithAI}
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
                Generate Rubric
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Create your rubric with dual views: detailed descriptions for teachers/AI and simplified versions for students.
          </p>
        </TabsContent>
      </Tabs>

      {/* Rubric Editor */}
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
            <Label>Criteria ({criteria.length})</Label>
            <Button size="sm" variant="outline" onClick={addCriterion}>
              <Plus className="w-4 h-4 mr-1" />
              Add Criterion
            </Button>
          </div>

          {criteria.map((criterion) => (
            <Collapsible
              key={criterion.id}
              open={expandedCriteria.has(criterion.id)}
              onOpenChange={() => toggleCriterion(criterion.id)}
            >
              <Card>
                <CardContent className="p-4">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedCriteria.has(criterion.id) ? "rotate-180" : ""
                          }`}
                        />
                        <span className="font-medium">{criterion.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {criterion.weight !== 1 && (
                          <Badge variant="outline" className="text-xs">
                            <Scale className="w-3 h-3 mr-1" />
                            {criterion.weight}x
                          </Badge>
                        )}
                        <Badge variant="secondary">{criterion.maxScore} pts</Badge>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-4 space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <Label className="text-xs">Criterion Name</Label>
                        <Input
                          value={criterion.name}
                          onChange={(e) => updateCriterion(criterion.id, { name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Max Points</Label>
                        <Input
                          type="number"
                          value={criterion.maxScore}
                          onChange={(e) => updateCriterion(criterion.id, { maxScore: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={criterion.description}
                        onChange={(e) => updateCriterion(criterion.id, { description: e.target.value })}
                        placeholder="What does this criterion measure?"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Weight</Label>
                      <div className="flex items-center gap-3">
                        <Slider
                          value={[criterion.weight]}
                          min={0.5}
                          max={2}
                          step={0.25}
                          onValueChange={([v]) => updateCriterion(criterion.id, { weight: v })}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium w-12">{criterion.weight}x</span>
                      </div>
                    </div>

                    {/* Level Descriptions */}
                    <div className="space-y-3">
                      <Label className="text-xs">Level Descriptions (Teacher & Student Views)</Label>
                      {criterion.levels.map((level) => (
                        <div key={level.level} className={`p-3 rounded-lg border ${levelColors[level.level]}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              Level {level.level}: {level.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              ({Math.round((level.level / 4) * criterion.maxScore)} pts)
                            </span>
                          </div>
                          <div className="grid gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">Teacher/AI View (detailed)</Label>
                              <Textarea
                                value={level.teacherDescription}
                                onChange={(e) => updateLevel(criterion.id, level.level, "teacherDescription", e.target.value)}
                                placeholder="Detailed description for grading..."
                                rows={2}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Student View (simplified)</Label>
                              <Input
                                value={level.studentDescription}
                                onChange={(e) => updateLevel(criterion.id, level.level, "studentDescription", e.target.value)}
                                placeholder="One clear sentence for students..."
                                className="text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => removeCriterion(criterion.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove Criterion
                    </Button>
                  </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>
          ))}
        </div>

        {/* Total Points */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total Points</span>
            <span className="text-xl font-bold text-primary">{totalPoints}</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label>Notes (optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes about this rubric..."
            rows={2}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={criteria.length === 0}>
          <Save className="w-4 h-4 mr-2" />
          Save Rubric
        </Button>
      </div>
    </div>
  );
};

export default RubricEditorDual;

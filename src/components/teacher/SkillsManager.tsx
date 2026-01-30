import { useState, useEffect } from "react";
import { Plus, Trash2, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Skill {
  id: string;
  skill_code: string;
  skill_name: string;
  description: string | null;
  created_at: string;
}

interface SkillsManagerProps {
  classId: string;
}

const SkillsManager = ({ classId }: SkillsManagerProps) => {
  const { toast } = useToast();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [skillCode, setSkillCode] = useState("");
  const [skillName, setSkillName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchSkills();
  }, [classId]);

  const fetchSkills = async () => {
    const { data, error } = await supabase
      .from("class_skills")
      .select("*")
      .eq("class_id", classId)
      .order("skill_code");

    if (error) {
      toast({ title: "Error", description: "Failed to load skills", variant: "destructive" });
    } else {
      setSkills(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setSkillCode("");
    setSkillName("");
    setDescription("");
  };

  const handleAdd = async () => {
    if (!skillCode.trim() || !skillName.trim()) {
      toast({ title: "Error", description: "Code and name are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("class_skills").insert({
      class_id: classId,
      skill_code: skillCode.trim(),
      skill_name: skillName.trim(),
      description: description.trim() || null,
    });

    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Skill added!" });
      resetForm();
      setAddOpen(false);
      fetchSkills();
    }
  };

  const handleDelete = async (skillId: string) => {
    const { error } = await supabase.from("class_skills").delete().eq("id", skillId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Skill removed" });
      fetchSkills();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Skills & Standards (TEKs)</h3>
          <p className="text-sm text-muted-foreground">
            Add skills or standards that apply to this class. AI will use these when generating rubrics.
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Skill / Standard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Skill Code *</Label>
                <Input
                  value={skillCode}
                  onChange={(e) => setSkillCode(e.target.value)}
                  placeholder="e.g., TEKS 3.1A, CCSS.ELA-LITERACY.W.5.2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the standard code (e.g., TEK number, Common Core standard)
                </p>
              </div>
              <div>
                <Label>Skill Name *</Label>
                <Input
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g., Write informative texts"
                />
              </div>
              <div>
                <Label>Description (optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full description of the skill or standard..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={saving}>
                {saving ? "Adding..." : "Add Skill"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {skills.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No skills or standards added yet</p>
            <p className="text-sm">Add skills to help AI generate better rubrics</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {skills.map((skill) => (
            <Card key={skill.id}>
              <CardContent className="p-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      {skill.skill_code}
                    </Badge>
                    <span className="font-medium">{skill.skill_name}</span>
                  </div>
                  {skill.description && (
                    <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(skill.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="p-4 rounded-lg bg-muted/50 border">
        <h4 className="font-medium text-sm mb-2">💡 How Skills Help</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• AI considers these skills when generating rubrics for assignments</li>
          <li>• Rubric categories will align with your defined standards</li>
          <li>• Feedback will reference specific skills when grading</li>
        </ul>
      </div>
    </div>
  );
};

export default SkillsManager;

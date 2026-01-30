import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Geography",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Art",
  "Music",
  "Physical Education",
  "Foreign Language",
  "Social Studies",
  "Other",
];

const GRADE_LEVELS = [
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
  "University",
];

const COLORS = [
  { value: "#6366f1", label: "Indigo", bg: "bg-indigo-100" },
  { value: "#3b82f6", label: "Blue", bg: "bg-blue-100" },
  { value: "#22c55e", label: "Green", bg: "bg-green-100" },
  { value: "#a855f7", label: "Purple", bg: "bg-purple-100" },
  { value: "#f59e0b", label: "Amber", bg: "bg-amber-100" },
  { value: "#06b6d4", label: "Cyan", bg: "bg-cyan-100" },
  { value: "#ec4899", label: "Pink", bg: "bg-pink-100" },
  { value: "#ef4444", label: "Red", bg: "bg-red-100" },
];

interface CreateClassDialogProps {
  onClassCreated: () => void;
  teacherLastName: string;
}

const CreateClassDialog = ({ onClassCreated, teacherLastName }: CreateClassDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [section, setSection] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [color, setColor] = useState("#6366f1");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalSubject = subject === "Other" ? customSubject : subject;
    
    if (!finalSubject || !section || !gradeLevel) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a class",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const className = `${finalSubject}_${teacherLastName}_${section}`;

    const { error } = await supabase.from("classes").insert({
      teacher_id: user.id,
      name: className,
      subject: finalSubject,
      section,
      grade_level: gradeLevel,
      color,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Class created successfully!",
      });
      setOpen(false);
      resetForm();
      onClassCreated();
    }

    setLoading(false);
  };

  const resetForm = () => {
    setSubject("");
    setCustomSubject("");
    setSection("");
    setGradeLevel("");
    setColor("#6366f1");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background">
        <DialogHeader>
          <DialogTitle>Create New Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class-subject">Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger id="class-subject" className="bg-background">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {SUBJECTS.map((subj) => (
                  <SelectItem key={subj} value={subj}>
                    {subj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {subject === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="custom-subject">Custom Subject Name</Label>
              <Input
                id="custom-subject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Enter subject name"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="section">Section</Label>
            <Input
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g., 6A, 7B, Period 3"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-grade">Grade Level</Label>
            <Select value={gradeLevel} onValueChange={setGradeLevel}>
              <SelectTrigger id="class-grade" className="bg-background">
                <SelectValue placeholder="Select grade level" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {GRADE_LEVELS.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c.value ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Class name preview:</p>
            <p className="font-medium">
              {subject === "Other" ? customSubject || "[Subject]" : subject || "[Subject]"}_{teacherLastName}_{section || "[Section]"}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassDialog;

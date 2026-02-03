import { useState, useEffect } from "react";
import { Plus, FileText, Calendar, ChevronRight, Upload, Link, MessageSquare, Sparkles, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RubricEditor, { Rubric } from "./RubricEditor";
import AssignmentChecklist from "./AssignmentChecklist";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  created_at: string;
  submission_count?: number;
  pdf_url?: string | null;
  external_link?: string | null;
  assignment_type?: string | null;
  has_rubric?: boolean;
}

interface Skill {
  skill_code: string;
  skill_name: string;
  description?: string;
}

interface AssignmentsListProps {
  classId: string;
  assignments: Assignment[];
  gradeLevel: string;
  subject: string;
  onRefresh: () => void;
  onSelectAssignment: (assignment: Assignment) => void;
}

const AssignmentsList = ({ classId, assignments, gradeLevel, subject, onRefresh, onSelectAssignment }: AssignmentsListProps) => {
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [assignmentType, setAssignmentType] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Rubric state
  const [includeRubric, setIncludeRubric] = useState(false);
  const [showRubricEditor, setShowRubricEditor] = useState(false);
  const [rubric, setRubric] = useState<Rubric | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    fetchSkills();
  }, [classId]);

  const fetchSkills = async () => {
    const { data } = await supabase
      .from("class_skills")
      .select("skill_code, skill_name, description")
      .eq("class_id", classId);
    setSkills(data || []);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setExternalLink("");
    setPdfFile(null);
    setAssignmentType("standard");
    setIncludeRubric(false);
    setRubric(null);
    setShowRubricEditor(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({ title: "Error", description: "Please upload a PDF file", variant: "destructive" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "Error", description: "File size must be less than 10MB", variant: "destructive" });
        return;
      }
      setPdfFile(file);
    }
  };

  const uploadPdf = async (): Promise<string | null> => {
    if (!pdfFile) return null;
    
    setUploading(true);
    const fileName = `${classId}/${Date.now()}-${pdfFile.name}`;
    
    const { error } = await supabase.storage
      .from("assignments")
      .upload(fileName, pdfFile);
    
    setUploading(false);
    
    if (error) {
      toast({ title: "Upload Error", description: error.message, variant: "destructive" });
      return null;
    }
    
    const { data: urlData } = supabase.storage
      .from("assignments")
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  };

  const saveRubricToDatabase = async (assignmentId: string, rubricData: Rubric) => {
    // Insert the rubric
    const { data: rubricRow, error: rubricError } = await supabase
      .from("rubrics")
      .insert({
        assignment_id: assignmentId,
        class_id: classId,
        name: rubricData.name,
        total_points: rubricData.totalPoints,
        notes: rubricData.notes || null,
      })
      .select()
      .single();

    if (rubricError) {
      console.error("Error saving rubric:", rubricError);
      return;
    }

    // Insert categories
    const categoriesData = rubricData.categories.map((cat, index) => ({
      rubric_id: rubricRow.id,
      name: cat.name,
      max_score: cat.maxScore,
      description: cat.description || null,
      criteria_excellent: cat.criteria?.excellent || null,
      criteria_good: cat.criteria?.good || null,
      criteria_developing: cat.criteria?.developing || null,
      criteria_needs_improvement: cat.criteria?.needs_improvement || null,
      sort_order: index,
    }));

    await supabase.from("rubric_categories").insert(categoriesData);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    if (includeRubric && !rubric) {
      toast({ title: "Error", description: "Please create a rubric or disable the rubric option", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    let pdfUrl: string | null = null;
    if (pdfFile) {
      pdfUrl = await uploadPdf();
      if (!pdfUrl && pdfFile) {
        setLoading(false);
        return;
      }
    }

    const { data: assignmentData, error } = await supabase.from("assignments").insert({
      class_id: classId,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      pdf_url: pdfUrl,
      external_link: externalLink.trim() || null,
      assignment_type: assignmentType,
    }).select().single();

    if (error) {
      setLoading(false);
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    // Save rubric if included
    if (includeRubric && rubric && assignmentData) {
      await saveRubricToDatabase(assignmentData.id, rubric);
    }

    setLoading(false);
    toast({ title: "Success", description: "Assignment created!" + (rubric ? " Rubric saved." : "") });
    resetForm();
    setCreateOpen(false);
    onRefresh();
  };

  const getAssignmentIcon = (type?: string | null) => {
    switch (type) {
      case "discussion":
        return <MessageSquare className="w-5 h-5 text-primary" />;
      default:
        return <FileText className="w-5 h-5 text-primary" />;
    }
  };

  const getAssignmentBadge = (assignment: Assignment) => {
    if (assignment.pdf_url) {
      return <Badge variant="outline" className="text-xs"><Upload className="w-3 h-3 mr-1" />PDF</Badge>;
    }
    if (assignment.external_link) {
      return <Badge variant="outline" className="text-xs"><Link className="w-3 h-3 mr-1" />Link</Badge>;
    }
    if (assignment.assignment_type === "discussion") {
      return <Badge variant="outline" className="text-xs"><MessageSquare className="w-3 h-3 mr-1" />Discussion</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Assignment</DialogTitle>
            </DialogHeader>
            
            <Tabs value={assignmentType} onValueChange={setAssignmentType}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="standard">Standard</TabsTrigger>
                <TabsTrigger value="link">Link</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>

              <div className="space-y-4 mt-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Chapter 5 Practice Problems"
                  />
                </div>

                <TabsContent value="standard" className="mt-0 space-y-4">
                  <div>
                    <Label>Description (optional)</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Instructions for students..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Upload PDF (optional)</Label>
                    <div className="mt-1">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      {pdfFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Selected: {pdfFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="link" className="mt-0 space-y-4">
                  <div>
                    <Label>Description (optional)</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Instructions for students..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>External Link</Label>
                    <Input
                      value={externalLink}
                      onChange={(e) => setExternalLink(e.target.value)}
                      placeholder="https://docs.google.com/document/..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Google Docs, Slides, Sheets, or any external link
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="discussion" className="mt-0 space-y-4">
                  <div>
                    <Label>Discussion Questions</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter your discussion questions here. Students will handwrite or draw their responses..."
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Students will respond with handwriting or drawings. Responses are saved as PDF.
                    </p>
                  </div>
                </TabsContent>

                <div>
                  <Label>Due Date (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                {/* Rubric Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-muted-foreground" />
                      <Label htmlFor="include-rubric" className="cursor-pointer">Include Rubric</Label>
                    </div>
                    <Switch
                      id="include-rubric"
                      checked={includeRubric}
                      onCheckedChange={setIncludeRubric}
                    />
                  </div>
                  {includeRubric && (
                    <div className="mt-3">
                      {rubric ? (
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{rubric.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {rubric.categories.length} categories • {rubric.totalPoints} points
                              </p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => setShowRubricEditor(true)}>
                              Edit
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setShowRubricEditor(true)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Create Manually
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/30"
                            onClick={() => setShowRubricEditor(true)}
                          >
                            <Sparkles className="w-4 h-4 mr-1" />
                            Generate with AI
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Pre-Publish Checklist */}
                <AssignmentChecklist
                  title={title}
                  description={description}
                  dueDate={dueDate}
                  assignmentType={assignmentType}
                  externalLink={externalLink}
                  pdfFile={pdfFile}
                  includeRubric={includeRubric}
                  rubricCreated={rubric !== null}
                />
              </div>
            </Tabs>

            {/* Rubric Editor Dialog */}
            <Dialog open={showRubricEditor} onOpenChange={setShowRubricEditor}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {rubric ? "Edit Rubric" : "Create Rubric"}
                  </DialogTitle>
                </DialogHeader>
                <RubricEditor
                  classId={classId}
                  gradeLevel={gradeLevel}
                  subject={subject}
                  skills={skills}
                  assignmentContent={description + (title ? ` - ${title}` : "")}
                  initialRubric={rubric}
                  onSave={(newRubric) => {
                    setRubric(newRubric);
                    setShowRubricEditor(false);
                  }}
                  onCancel={() => setShowRubricEditor(false)}
                />
              </DialogContent>
            </Dialog>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={loading || uploading}>
                {uploading ? "Uploading..." : loading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No assignments yet</p>
            <p className="text-sm">Create your first assignment to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {assignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onSelectAssignment(assignment)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getAssignmentIcon(assignment.assignment_type)}
                  <div>
                    <p className="font-medium">{assignment.title}</p>
                    <div className="flex items-center gap-2">
                      {assignment.due_date && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getAssignmentBadge(assignment)}
                  {assignment.submission_count !== undefined && (
                    <Badge variant="secondary">
                      {assignment.submission_count} submissions
                    </Badge>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentsList;

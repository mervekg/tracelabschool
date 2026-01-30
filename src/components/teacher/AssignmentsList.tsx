import { useState } from "react";
import { Plus, FileText, Calendar, ChevronRight, Upload, Link, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
}

interface AssignmentsListProps {
  classId: string;
  assignments: Assignment[];
  onRefresh: () => void;
  onSelectAssignment: (assignment: Assignment) => void;
}

const AssignmentsList = ({ classId, assignments, onRefresh, onSelectAssignment }: AssignmentsListProps) => {
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setExternalLink("");
    setPdfFile(null);
    setAssignmentType("standard");
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

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
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

    const { error } = await supabase.from("assignments").insert({
      class_id: classId,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      pdf_url: pdfUrl,
      external_link: externalLink.trim() || null,
      assignment_type: assignmentType,
    });

    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Assignment created!" });
      resetForm();
      setCreateOpen(false);
      onRefresh();
    }
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
              </div>
            </Tabs>

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

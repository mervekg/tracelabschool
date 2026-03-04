import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, FileText, UserCircle, ArrowLeft, Plus, Upload, Key, Copy, Check, Trash2, BookOpen, Link, QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TeacherLayout from "@/components/teacher/TeacherLayout";
import AssignmentsList from "@/components/teacher/AssignmentsList";
import StudentSubmissionsList from "@/components/teacher/StudentSubmissionsList";
import SubmissionReview from "@/components/teacher/SubmissionReview";
import SkillsManager from "@/components/teacher/SkillsManager";
import StudentInviteDialog from "@/components/StudentInviteDialog";
import CreateTestStudentDialog from "@/components/teacher/CreateTestStudentDialog";
import CourseKPICards from "@/components/teacher/CourseKPICards";

interface Student {
  id: string;
  class_id: string;
  user_id: string | null;
  full_name: string;
  status: string;
  enrolled_at: string;
}

interface Parent {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  student_id: string | null;
}

interface ClassInfo {
  id: string;
  name: string;
  subject: string;
  section: string;
  grade_level: string;
}

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

interface StudentSubmission {
  id: string;
  student_id: string;
  content: string | null;
  handwriting_image_url: string | null;
  status: string;
  submitted_at: string | null;
  ai_feedback: string | null;
  teacher_feedback: string | null;
  score: number | null;
  student?: {
    full_name: string;
  };
}

const TeacherClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // KPI stats for this class
  const [classKPIs, setClassKPIs] = useState({
    pendingReviews: 0,
    avgScore: 0,
    violationCount: 0,
  });
  
  // Assignment drill-down state
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  
  // Add student dialog
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  
  // Add parent dialog
  const [addParentOpen, setAddParentOpen] = useState(false);
  const [newParentName, setNewParentName] = useState("");
  const [newParentEmail, setNewParentEmail] = useState("");
  const [newParentPhone, setNewParentPhone] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  
  // CSV upload
  const [csvUploadOpen, setCsvUploadOpen] = useState(false);
  
  // Parent invite dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedStudentForInvite, setSelectedStudentForInvite] = useState<Student | null>(null);

  useEffect(() => {
    if (classId) {
      fetchClassData();
    }
  }, [classId]);

  const fetchClassData = async () => {
    if (!classId) return;

    // Fetch class info
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("*")
      .eq("id", classId)
      .single();

    if (classError) {
      toast({ title: "Error", description: "Failed to load class", variant: "destructive" });
      navigate("/teacher");
      return;
    }

    setClassInfo(classData);

    // Fetch students - only select fields needed for display (excludes email for privacy)
    const { data: studentsData } = await supabase
      .from("students")
      .select("id, class_id, user_id, full_name, status, enrolled_at")
      .eq("class_id", classId)
      .order("full_name");

    setStudents(studentsData || []);

    // Fetch parents
    const { data: parentsData } = await supabase
      .from("parents")
      .select("*")
      .eq("class_id", classId)
      .order("full_name");

    setParents(parentsData || []);

    // Fetch assignments with submission counts
    const { data: assignmentsData } = await supabase
      .from("assignments")
      .select("*")
      .eq("class_id", classId)
      .order("created_at", { ascending: false });

    // Get submission counts and stats for each assignment
    if (assignmentsData) {
      const assignmentIds = assignmentsData.map(a => a.id);
      
      // Fetch all submissions for this class's assignments
      const { data: allSubmissions } = await supabase
        .from("student_submissions")
        .select("assignment_id, status, score")
        .in("assignment_id", assignmentIds);
      
      // Calculate KPIs
      let pendingCount = 0;
      let totalScore = 0;
      let gradedCount = 0;
      
      allSubmissions?.forEach(sub => {
        if (sub.status === "pending" || sub.status === "submitted") {
          pendingCount++;
        }
        if (sub.status === "graded" && sub.score !== null) {
          totalScore += Number(sub.score);
          gradedCount++;
        }
      });
      
      setClassKPIs({
        pendingReviews: pendingCount,
        avgScore: gradedCount > 0 ? Math.round(totalScore / gradedCount) : 0,
        violationCount: 0, // Will be added when violations table exists
      });

      const assignmentsWithCounts = await Promise.all(
        assignmentsData.map(async (assignment) => {
          const { count } = await supabase
            .from("student_submissions")
            .select("*", { count: "exact", head: true })
            .eq("assignment_id", assignment.id);
          return { ...assignment, submission_count: count || 0 };
        })
      );
      setAssignments(assignmentsWithCounts);
    }

    // Fetch join code
    const { data: codeData } = await supabase
      .from("class_join_codes")
      .select("code")
      .eq("class_id", classId)
      .single();

    setJoinCode(codeData?.code || null);
    setLoading(false);
  };

  const fetchSubmissionsForAssignment = async (assignmentId: string) => {
    const { data } = await supabase
      .from("student_submissions")
      .select("*")
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false });

    // Enrich with student info
    if (data) {
      const enrichedSubmissions = await Promise.all(
        data.map(async (sub) => {
          const student = students.find((s) => s.id === sub.student_id);
          return {
            ...sub,
            student: student ? { full_name: student.full_name } : undefined,
          };
        })
      );
      setSubmissions(enrichedSubmissions);
    }
  };

  const handleSelectAssignment = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSelectedSubmission(null);
    await fetchSubmissionsForAssignment(assignment.id);
  };

  const handleBackToAssignments = () => {
    setSelectedAssignment(null);
    setSubmissions([]);
  };

  const handleSelectSubmission = (submission: StudentSubmission) => {
    setSelectedSubmission(submission);
  };

  const handleBackToSubmissions = () => {
    setSelectedSubmission(null);
  };

  const handleSubmissionUpdate = async () => {
    if (selectedAssignment) {
      await fetchSubmissionsForAssignment(selectedAssignment.id);
      // Re-fetch to get updated submission
      const updatedSub = submissions.find((s) => s.id === selectedSubmission?.id);
      if (updatedSub) {
        setSelectedSubmission(updatedSub);
      }
    }
  };

  const generateJoinCode = async () => {
    if (!classId) return;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { error } = await supabase
      .from("class_join_codes")
      .upsert({
        class_id: classId,
        code,
      }, { onConflict: "class_id" });

    if (error) {
      toast({ title: "Error", description: "Failed to generate code", variant: "destructive" });
    } else {
      setJoinCode(code);
      toast({ title: "Success", description: "Join code generated!" });
    }
  };

  const copyJoinCode = () => {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getJoinLink = () => {
    if (!joinCode) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/join/${joinCode}`;
  };

  const copyJoinLink = () => {
    const link = getJoinLink();
    if (link) {
      navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const addStudent = async () => {
    if (!classId || !newStudentName || !newStudentEmail) return;

    const { error } = await supabase
      .from("students")
      .insert({
        class_id: classId,
        full_name: newStudentName,
        email: newStudentEmail,
        status: "active",
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Student added!" });
      setNewStudentName("");
      setNewStudentEmail("");
      setAddStudentOpen(false);
      fetchClassData();
    }
  };

  const removeStudent = async (studentId: string) => {
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", studentId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Student removed" });
      fetchClassData();
    }
  };

  const addParent = async () => {
    if (!classId || !newParentName || !newParentEmail) return;

    const { error } = await supabase
      .from("parents")
      .insert({
        class_id: classId,
        full_name: newParentName,
        email: newParentEmail,
        phone: newParentPhone || null,
        student_id: selectedStudentId || null,
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Parent added!" });
      setNewParentName("");
      setNewParentEmail("");
      setNewParentPhone("");
      setSelectedStudentId("");
      setAddParentOpen(false);
      fetchClassData();
    }
  };

  const removeParent = async (parentId: string) => {
    const { error } = await supabase
      .from("parents")
      .delete()
      .eq("id", parentId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Parent removed" });
      fetchClassData();
    }
  };

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !classId) return;

    const text = await file.text();
    const lines = text.split("\n").filter(line => line.trim());
    const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
    
    const nameIdx = headers.findIndex(h => h.includes("name"));
    const emailIdx = headers.findIndex(h => h.includes("email"));
    const phoneIdx = headers.findIndex(h => h.includes("phone"));

    if (nameIdx === -1 || emailIdx === -1) {
      toast({ title: "Error", description: "CSV must have 'name' and 'email' columns", variant: "destructive" });
      return;
    }

    const parentsToAdd = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
      if (values[nameIdx] && values[emailIdx]) {
        parentsToAdd.push({
          class_id: classId,
          full_name: values[nameIdx],
          email: values[emailIdx],
          phone: phoneIdx !== -1 ? values[phoneIdx] || null : null,
        });
      }
    }

    if (parentsToAdd.length === 0) {
      toast({ title: "Error", description: "No valid parent records found", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("parents")
      .insert(parentsToAdd);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `${parentsToAdd.length} parents imported!` });
      setCsvUploadOpen(false);
      fetchClassData();
    }
  };

  if (loading) {
    return (
      <TeacherLayout showSearch={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout showSearch={false}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/teacher")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{classInfo?.name}</h1>
            <p className="text-muted-foreground">
              {classInfo?.subject} • {classInfo?.grade_level} • {classInfo?.section}
            </p>
          </div>
        </div>

        {/* KPI Cards for this course */}
        <CourseKPICards
          classId={classId || ""}
          pendingReviews={classKPIs.pendingReviews}
          studentCount={students.length}
          avgScore={classKPIs.avgScore}
          violationCount={classKPIs.violationCount}
        />

        {/* Join Code & Link Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Join Code Section */}
              <div className="flex items-center gap-3 flex-1">
                <Key className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">Class Join Code</p>
                  {joinCode ? (
                    <p className="font-mono text-lg font-bold tracking-wider">{joinCode}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No code generated</p>
                  )}
                </div>
                {joinCode && (
                  <Button variant="outline" size="sm" onClick={copyJoinCode} className="shrink-0">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="ml-1 hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                  </Button>
                )}
              </div>

              {/* Divider */}
              {joinCode && (
                <div className="hidden md:block w-px h-12 bg-border" />
              )}

              {/* Join Link Section */}
              {joinCode && (
                <div className="flex items-center gap-3 flex-1">
                  <Link className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">Join Link</p>
                    <p className="text-sm font-medium truncate">{getJoinLink()}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyJoinLink} className="shrink-0">
                    {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span className="ml-1 hidden sm:inline">{linkCopied ? "Copied" : "Copy"}</span>
                  </Button>
                </div>
              )}

              {/* Generate Button */}
              <Button size="sm" onClick={generateJoinCode} className="shrink-0">
                {joinCode ? "Regenerate" : "Generate Code"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="parents" className="flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              Parents
            </TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <div className="flex justify-end gap-2">
              <CreateTestStudentDialog 
                classId={classId!} 
                className={classInfo?.name || "this class"}
                onCreated={fetchClassData}
              />
              <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Student</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                        placeholder="john@school.edu"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddStudentOpen(false)}>Cancel</Button>
                    <Button onClick={addStudent}>Add Student</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Invite Parent</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No students enrolled yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell className="text-muted-foreground">#{index + 1}</TableCell>
                        <TableCell>
                          <Badge variant={student.status === "active" ? "default" : "secondary"}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(student.enrolled_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudentForInvite(student);
                                setInviteDialogOpen(true);
                              }}
                              className="gap-1"
                            >
                              <QrCode className="w-3 h-3" />
                              Show QR
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const inviteLink = `${window.location.origin}/parent/join/P${student.id.slice(0, 6).toUpperCase()}`;
                                navigator.clipboard.writeText(inviteLink);
                              }}
                              className="gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              Copy link
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeStudent(student.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            {selectedSubmission && selectedAssignment ? (
              <SubmissionReview
                submission={selectedSubmission}
                assignmentTitle={selectedAssignment.title}
                assignmentDescription={selectedAssignment.description || ""}
                gradeLevel={classInfo?.grade_level || "Middle School"}
                subject={classInfo?.subject || "General"}
                onBack={handleBackToSubmissions}
                onUpdate={handleSubmissionUpdate}
              />
            ) : selectedAssignment ? (
              <StudentSubmissionsList
                assignment={selectedAssignment}
                submissions={submissions}
                classId={classId!}
                onBack={handleBackToAssignments}
                onSelectSubmission={handleSelectSubmission}
                onRefresh={fetchClassData}
              />
            ) : (
              <AssignmentsList
                classId={classId!}
                assignments={assignments}
                gradeLevel={classInfo?.grade_level || ""}
                subject={classInfo?.subject || ""}
                onRefresh={fetchClassData}
                onSelectAssignment={handleSelectAssignment}
              />
            )}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-4">
            <SkillsManager classId={classId!} />
          </TabsContent>

          {/* Parents Tab */}
          <TabsContent value="parents" className="space-y-4">
            <div className="flex justify-end gap-2">
              <Dialog open={csvUploadOpen} onOpenChange={setCsvUploadOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Parent Contacts</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Upload a CSV file with columns: <strong>name</strong>, <strong>email</strong>, and optionally <strong>phone</strong>
                    </p>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                    />
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={addParentOpen} onOpenChange={setAddParentOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Parent
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Parent Contact</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={newParentName}
                        onChange={(e) => setNewParentName(e.target.value)}
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newParentEmail}
                        onChange={(e) => setNewParentEmail(e.target.value)}
                        placeholder="jane@email.com"
                      />
                    </div>
                    <div>
                      <Label>Phone (optional)</Label>
                      <Input
                        value={newParentPhone}
                        onChange={(e) => setNewParentPhone(e.target.value)}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div>
                      <Label>Link to Student (optional)</Label>
                      <select
                        className="w-full h-10 px-3 border rounded-md bg-background"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                      >
                        <option value="">-- Select Student --</option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>{s.full_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddParentOpen(false)}>Cancel</Button>
                    <Button onClick={addParent}>Add Parent</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Linked Student</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No parent contacts yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    parents.map((parent) => (
                      <TableRow key={parent.id}>
                        <TableCell className="font-medium">{parent.full_name}</TableCell>
                        <TableCell>{parent.email}</TableCell>
                        <TableCell>{parent.phone || "-"}</TableCell>
                        <TableCell>
                          {parent.student_id
                            ? students.find((s) => s.id === parent.student_id)?.full_name || "-"
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeParent(parent.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Student Invite Dialog */}
        {selectedStudentForInvite && (
          <StudentInviteDialog
            open={inviteDialogOpen}
            onOpenChange={(open) => {
              setInviteDialogOpen(open);
              if (!open) setSelectedStudentForInvite(null);
            }}
            studentName={selectedStudentForInvite.full_name}
            studentId={selectedStudentForInvite.id}
          />
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherClassDetail;

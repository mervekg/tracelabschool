import { ArrowLeft, Plus, Clock, Mic, Eye, FileText, Zap, Users, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

const TeacherAccommodations = () => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const students = [
    {
      id: 1,
      name: "Emma Rodriguez",
      photo: "👧",
      accommodations: ["Speech-to-Text", "Extended Time"],
      requestStatus: "Approved",
      iep: true,
      section504: false,
    },
    {
      id: 2,
      name: "Marcus Chen",
      photo: "👦",
      accommodations: ["Focus Mode Auto-On"],
      requestStatus: "Pending",
      iep: false,
      section504: true,
    },
    {
      id: 3,
      name: "Sofia Martinez",
      photo: "👧",
      accommodations: ["Simplified Feedback", "Extra Attempts"],
      requestStatus: "Approved",
      iep: true,
      section504: false,
    },
    {
      id: 4,
      name: "James Wilson",
      photo: "👦",
      accommodations: [],
      requestStatus: null,
      iep: false,
      section504: false,
    },
  ];

  const availableAccommodations = [
    { id: "speech-to-text", name: "Speech-to-Text", icon: Mic, desc: "Voice dictation support" },
    { id: "extended-time", name: "Extended Time", icon: Clock, desc: "50% additional time on assignments" },
    { id: "focus-mode", name: "Focus Mode Auto-On", icon: Zap, desc: "Automatic focus mode activation" },
    { id: "simplified-feedback", name: "Simplified Feedback", icon: FileText, desc: "Clear, concise language" },
    { id: "extra-attempts", name: "Extra Attempts", icon: Plus, desc: "Additional revision opportunities" },
    { id: "enlarged-text", name: "Enlarged Text", icon: Eye, desc: "Larger font sizes" },
  ];

  const handleSubmitRequest = () => {
    toast.success("Accommodation request submitted for admin approval!");
    setShowRequestDialog(false);
  };

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <div className="min-h-screen paper-texture p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/teacher')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary">Accommodation Manager</h1>
              <p className="text-sm text-muted-foreground">Manage student learning supports</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/80">
            <Users className="w-4 h-4 mr-2" />
            View by Accommodation
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <p className="text-sm text-muted-foreground mb-1">Total Students</p>
            <p className="text-3xl font-bold text-primary">{students.length}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
            <p className="text-sm text-muted-foreground mb-1">Pending Requests</p>
            <p className="text-3xl font-bold text-warning-foreground">
              {students.filter(s => s.requestStatus === "Pending").length}
            </p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/30">
            <p className="text-sm text-muted-foreground mb-1">IEP Students</p>
            <p className="text-3xl font-bold text-success">
              {students.filter(s => s.iep).length}
            </p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
            <p className="text-sm text-muted-foreground mb-1">504 Plans</p>
            <p className="text-3xl font-bold text-accent-foreground">
              {students.filter(s => s.section504).length}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List */}
          <Card className="lg:col-span-2 p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Student List</h2>
              <Input placeholder="Search students..." className="w-64" />
            </div>
            
            <div className="space-y-3">
              {students.map((student) => (
                <Card
                  key={student.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-paper ${
                    selectedStudent === student.id ? "border-primary shadow-md" : ""
                  }`}
                  onClick={() => setSelectedStudent(student.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl">{student.photo}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{student.name}</h3>
                          {student.iep && (
                            <Badge variant="outline" className="text-xs">IEP</Badge>
                          )}
                          {student.section504 && (
                            <Badge variant="outline" className="text-xs">504</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {student.accommodations.length > 0 ? (
                            student.accommodations.map((acc, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {acc}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No accommodations</span>
                          )}
                        </div>
                        {student.requestStatus && (
                          <Badge
                            className={
                              student.requestStatus === "Approved"
                                ? "bg-success text-success-foreground"
                                : student.requestStatus === "Pending"
                                ? "bg-warning text-warning-foreground"
                                : "bg-destructive text-destructive-foreground"
                            }
                          >
                            {student.requestStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* Student Detail Panel */}
          <div className="space-y-4">
            {selectedStudentData ? (
              <>
                <Card className="p-6 shadow-card">
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-2">{selectedStudentData.photo}</div>
                    <h3 className="text-xl font-semibold">{selectedStudentData.name}</h3>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      {selectedStudentData.iep && (
                        <Badge className="bg-primary text-primary-foreground">IEP</Badge>
                      )}
                      {selectedStudentData.section504 && (
                        <Badge className="bg-accent text-accent-foreground">504</Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground">Active Accommodations</h4>
                    {selectedStudentData.accommodations.length > 0 ? (
                      selectedStudentData.accommodations.map((acc, idx) => {
                        const accData = availableAccommodations.find(a => a.name === acc);
                        const Icon = accData?.icon || FileText;
                        return (
                          <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="w-4 h-4 text-primary" />
                              <p className="font-semibold text-sm">{acc}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{accData?.desc}</p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">No accommodations assigned</p>
                    )}
                  </div>
                </Card>

                <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-primary to-primary/80">
                      <Plus className="w-4 h-4 mr-2" />
                      Request Accommodation Change
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Request Accommodation for {selectedStudentData.name}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Accommodation Type</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select accommodation..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableAccommodations.map((acc) => (
                              <SelectItem key={acc.id} value={acc.id}>
                                {acc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Action</label>
                        <Select defaultValue="add">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="add">Add Accommodation</SelectItem>
                            <SelectItem value="remove">Remove Accommodation</SelectItem>
                            <SelectItem value="modify">Modify Accommodation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Duration</label>
                        <Select defaultValue="long-term">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short-term">Short-term (1 month)</SelectItem>
                            <SelectItem value="semester">This Semester</SelectItem>
                            <SelectItem value="long-term">Long-term (School Year)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Reason for Request</label>
                        <Textarea
                          placeholder="Explain why this accommodation is needed..."
                          rows={4}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Evidence / Observations</label>
                        <Textarea
                          placeholder="Provide specific examples or observations..."
                          rows={4}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Additional Notes (Optional)</label>
                        <Textarea
                          placeholder="Any additional context..."
                          rows={2}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmitRequest} className="bg-gradient-to-r from-primary to-primary/80">
                        Submit Request
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <Card className="p-6 shadow-card">
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select a student to view accommodations
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAccommodations;

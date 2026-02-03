import { CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";

const AdminAccommodationApprovals = () => {
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'deny' | 'info'>('approve');

  const pendingRequests = [
    {
      id: 1,
      student: { name: "Marcus Chen", photo: "👦", iep: false, section504: true },
      teacher: "Ms. Johnson",
      accommodation: "Speech-to-Text",
      action: "Add",
      dateSubmitted: "2 hours ago",
      reason: "Student struggles with writing fluency but excels verbally",
      evidence: "Marcus consistently scores higher on verbal assessments. Writing samples show difficulty organizing thoughts on paper.",
      duration: "This Semester",
      priority: "medium",
    },
    {
      id: 2,
      student: { name: "Emma Rodriguez", photo: "👧", iep: true, section504: false },
      teacher: "Ms. Johnson",
      accommodation: "Extended Time",
      action: "Modify",
      dateSubmitted: "1 day ago",
      reason: "Current 30% extension not sufficient, requesting 50%",
      evidence: "Emma consistently requires additional time and shows significant improvement when given more time. IEP team recommends increase.",
      duration: "Long-term (School Year)",
      priority: "high",
    },
    {
      id: 3,
      student: { name: "James Wilson", photo: "👦", iep: false, section504: false },
      teacher: "Mr. Thompson",
      accommodation: "Focus Mode Auto-On",
      action: "Add",
      dateSubmitted: "3 days ago",
      reason: "Student has difficulty maintaining attention during longer writing tasks",
      evidence: "Parent reports ADHD diagnosis. Student shows marked improvement with structured environment and minimal distractions.",
      duration: "Long-term (School Year)",
      priority: "high",
    },
  ];

  const handleApprove = () => {
    toast.success("Accommodation request approved! Student and teacher notified.");
    setShowReviewDialog(false);
  };

  const handleDeny = () => {
    toast.info("Accommodation request denied. Teacher will be notified with explanation.");
    setShowReviewDialog(false);
  };

  const handleAskForInfo = () => {
    toast.info("Request sent to teacher for additional information.");
    setShowReviewDialog(false);
  };

  const selectedRequestData = pendingRequests.find(r => r.id === selectedRequest);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-primary">Accommodation Approvals</h1>
            <p className="text-sm text-muted-foreground">Review and approve accommodation requests</p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
              <p className="text-sm text-muted-foreground mb-1">Pending Requests</p>
              <p className="text-3xl font-bold text-warning-foreground">{pendingRequests.length}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30">
              <p className="text-sm text-muted-foreground mb-1">High Priority</p>
              <p className="text-3xl font-bold text-destructive">
                {pendingRequests.filter(r => r.priority === "high").length}
              </p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/30">
              <p className="text-sm text-muted-foreground mb-1">Approved This Week</p>
              <p className="text-3xl font-bold text-success">12</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
              <p className="text-sm text-muted-foreground mb-1">Avg Response Time</p>
              <p className="text-3xl font-bold text-accent-foreground">1.2d</p>
            </Card>
          </div>

          {/* Pending Requests Queue */}
          <Card className="p-6 shadow-card">
            <h2 className="text-2xl font-semibold mb-4">Pending Requests Queue</h2>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <Card
                  key={request.id}
                  className={`p-4 hover:shadow-paper transition-all cursor-pointer ${
                    selectedRequest === request.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedRequest(request.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl">{request.student.photo}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{request.student.name}</h3>
                          {request.student.iep && (
                            <Badge variant="outline" className="text-xs">IEP</Badge>
                          )}
                          {request.student.section504 && (
                            <Badge variant="outline" className="text-xs">504</Badge>
                          )}
                          {request.priority === "high" && (
                            <Badge className="bg-destructive text-destructive-foreground text-xs">
                              High Priority
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Accommodation</p>
                            <p className="text-sm font-semibold">{request.accommodation}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Action</p>
                            <Badge variant="secondary" className="text-xs">{request.action}</Badge>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Requested By</p>
                            <p className="text-sm">{request.teacher}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Submitted</p>
                            <p className="text-sm">{request.dateSubmitted}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{request.reason}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={showReviewDialog && selectedRequest === request.id} onOpenChange={setShowReviewDialog}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest(request.id);
                            }}
                          >
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Review Accommodation Request</DialogTitle>
                          </DialogHeader>
                          
                          {selectedRequestData && (
                            <div className="space-y-6 py-4">
                              {/* Student Info */}
                              <Card className="p-4 bg-muted/30">
                                <div className="flex items-center gap-3">
                                  <div className="text-4xl">{selectedRequestData.student.photo}</div>
                                  <div>
                                    <h3 className="text-lg font-semibold">{selectedRequestData.student.name}</h3>
                                    <div className="flex gap-2 mt-1">
                                      {selectedRequestData.student.iep && (
                                        <Badge className="bg-primary text-primary-foreground">IEP</Badge>
                                      )}
                                      {selectedRequestData.student.section504 && (
                                        <Badge className="bg-accent text-accent-foreground">504</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Card>

                              {/* Request Details */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Accommodation</p>
                                  <p className="font-semibold">{selectedRequestData.accommodation}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Action</p>
                                  <Badge variant="secondary">{selectedRequestData.action}</Badge>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Requested By</p>
                                  <p className="font-semibold">{selectedRequestData.teacher}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Duration</p>
                                  <p className="font-semibold">{selectedRequestData.duration}</p>
                                </div>
                              </div>

                              {/* Reason */}
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Reason for Request</p>
                                <Card className="p-4 bg-card">
                                  <p className="text-sm">{selectedRequestData.reason}</p>
                                </Card>
                              </div>

                              {/* Evidence */}
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Evidence / Observations</p>
                                <Card className="p-4 bg-card">
                                  <p className="text-sm">{selectedRequestData.evidence}</p>
                                </Card>
                              </div>

                              {/* Student History */}
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Student History</p>
                                <Card className="p-4 bg-accent/10 border-accent/30">
                                  <div className="space-y-2">
                                    <p className="text-sm">
                                      <strong>Current Accommodations:</strong> Extended Time (30%)
                                    </p>
                                    <p className="text-sm">
                                      <strong>Previous Requests:</strong> 2 approved, 0 denied
                                    </p>
                                    <p className="text-sm">
                                      <strong>Academic Performance:</strong> Above average with accommodations
                                    </p>
                                  </div>
                                </Card>
                              </div>

                              {/* Admin Decision */}
                              <div>
                                <p className="text-sm font-medium text-muted-foreground mb-2">Admin Notes (Optional)</p>
                                <Textarea
                                  placeholder="Add any notes or conditions for approval..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          )}

                          <DialogFooter className="gap-2">
                            <Button 
                              variant="outline"
                              onClick={() => {
                                setReviewAction('info');
                                handleAskForInfo();
                              }}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Ask for More Info
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => {
                                setReviewAction('deny');
                                handleDeny();
                              }}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Deny Request
                            </Button>
                            <Button 
                              className="bg-gradient-to-r from-success to-success/80"
                              onClick={() => {
                                setReviewAction('approve');
                                handleApprove();
                              }}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve Request
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAccommodationApprovals;

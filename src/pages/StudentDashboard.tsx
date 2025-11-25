import { BookOpen, FileText, MessageSquare, TrendingUp, Award, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const assignments = [
    { id: 1, title: "Fraction Word Problems", subject: "Math", due: "Today", status: "pending" },
    { id: 2, title: "Paragraph Writing: My Weekend", subject: "ELA", due: "Tomorrow", status: "in-progress" },
    { id: 3, title: "Plant Life Cycle Diagram", subject: "Science", due: "Friday", status: "pending" },
  ];

  const recentFeedback = [
    { id: 1, assignment: "Multiplication Practice", score: 92, feedback: "Great work on showing your steps!" },
    { id: 2, assignment: "Story Writing", score: 88, feedback: "Excellent use of descriptive words!" },
  ];

  return (
    <div className="min-h-screen paper-texture p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Welcome back, Emma!</h1>
            <p className="text-muted-foreground">Let's continue your learning journey</p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="p-3 bg-gradient-to-br from-warning/20 to-warning/10 border-warning/30">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-warning-foreground" />
                <div>
                  <p className="text-2xl font-bold text-warning-foreground">12</p>
                  <p className="text-xs text-muted-foreground">Day Writing Streak 🔥</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Feedback Notifications */}
        <Card className="p-4 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-accent-foreground" />
              <div>
                <p className="font-semibold text-accent-foreground">New Feedback Waiting for You!</p>
                <p className="text-sm text-muted-foreground">Your teacher reviewed "Paragraph Writing" and "Fraction Problems"</p>
              </div>
            </div>
            <Button onClick={() => navigate('/student/feedback')}>View Now</Button>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 paper-texture shadow-paper hover:shadow-card transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Active Tasks</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 paper-texture shadow-paper hover:shadow-card transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-success/20 to-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 paper-texture shadow-paper hover:shadow-card transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10">
                <MessageSquare className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-xs text-muted-foreground">New Feedback</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 paper-texture shadow-paper hover:shadow-card transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10">
                <Clock className="w-5 h-5 text-warning-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">2.5h</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Today's Learning */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignments */}
          <Card className="lg:col-span-2 p-6 paper-texture shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Today's Assignments
              </h2>
            </div>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-4 rounded-xl bg-card border border-border hover:shadow-paper transition-all cursor-pointer"
                  onClick={() => navigate('/student/workspace')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={assignment.status === "in-progress" ? "default" : "secondary"}>
                        {assignment.status === "in-progress" ? "In Progress" : "Not Started"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">Due: {assignment.due}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Feedback */}
          <Card className="p-6 paper-texture shadow-card">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-accent-foreground" />
              Recent Feedback
            </h2>
            <div className="space-y-4">
              {recentFeedback.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 cursor-pointer hover:shadow-paper transition-all"
                  onClick={() => navigate('/student/feedback')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">{item.assignment}</p>
                    <Badge className="bg-success text-success-foreground">{item.score}%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.feedback}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 paper-texture shadow-card">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              className="h-auto flex-col gap-3 p-8 bg-gradient-to-br from-primary to-primary/80 hover:opacity-90 transition-all shadow-lg"
              onClick={() => navigate('/student/workspace')}
            >
              <FileText className="w-10 h-10 text-primary-foreground" />
              <span className="text-base font-semibold text-primary-foreground">Start Assignment</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-6 hover:bg-success/5 hover:border-success transition-all"
            >
              <BookOpen className="w-8 h-8 text-success" />
              <span className="text-sm font-medium">My Notebook</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-6 hover:bg-accent/5 hover:border-accent transition-all"
              onClick={() => navigate('/student/feedback')}
            >
              <MessageSquare className="w-8 h-8 text-accent-foreground" />
              <span className="text-sm font-medium">View Feedback</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-6 hover:bg-warning/5 hover:border-warning transition-all"
            >
              <TrendingUp className="w-8 h-8 text-warning-foreground" />
              <span className="text-sm font-medium">My Progress</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;

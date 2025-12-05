import { Users, FileCheck, AlertCircle, TrendingUp, BookOpen, Calendar, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import LearnionLogo from "@/components/LearnionLogo";

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const pendingReviews = [
    { student: "Emma Rodriguez", assignment: "Paragraph Writing", submitted: "2 hours ago", priority: "normal" },
    { student: "Marcus Chen", assignment: "Fraction Problems", submitted: "4 hours ago", priority: "urgent" },
    { student: "Sofia Martinez", assignment: "Plant Life Cycle", submitted: "1 day ago", priority: "normal" },
  ];

  const classStats = {
    totalStudents: 24,
    avgScore: 87,
    pendingReviews: 8,
    completionRate: 92,
  };

  return (
    <div className="min-h-screen paper-texture p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LearnionLogo size="lg" showText={false} />
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Teacher Dashboard</h1>
              <p className="text-muted-foreground">Grade 5 - Section A</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => navigate('/teacher/accommodations')}
            >
              Accommodations
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/teacher/violation-reports')}
              className="border-destructive/50 hover:bg-destructive/10"
            >
              <Shield className="w-4 h-4 mr-2" />
              Violations
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/teacher/assignment-settings')}
              className="border-destructive/50 hover:bg-destructive/10"
            >
              <Shield className="w-4 h-4 mr-2" />
              Lockdown
            </Button>
            <Button className="bg-gradient-to-r from-primary to-primary/80">
              <Calendar className="w-4 h-4 mr-2" />
              Today's Schedule
            </Button>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Submissions to Review</p>
                <p className="text-3xl font-bold text-warning-foreground">{classStats.pendingReviews}</p>
                <p className="text-xs text-muted-foreground mt-1">2 urgent</p>
              </div>
              <FileCheck className="w-10 h-10 text-warning-foreground opacity-20" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Needs Revision</p>
                <p className="text-3xl font-bold text-accent-foreground">3</p>
                <p className="text-xs text-muted-foreground mt-1">Awaiting resubmit</p>
              </div>
              <AlertCircle className="w-10 h-10 text-accent-foreground opacity-20" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Class Writing Growth</p>
                <p className="text-3xl font-bold text-success">+15%</p>
                <p className="text-xs text-muted-foreground mt-1">Past 30 days</p>
              </div>
              <TrendingUp className="w-10 h-10 text-success opacity-20" />
            </div>
          </Card>

          <Card 
            className="p-4 bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30 cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate('/teacher/violation-reports')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Lockdown Violations</p>
                <p className="text-3xl font-bold text-destructive">7</p>
                <p className="text-xs text-muted-foreground mt-1">3 students flagged</p>
              </div>
              <Shield className="w-10 h-10 text-destructive opacity-20" />
            </div>
          </Card>
        </div>

        {/* Class Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 paper-texture shadow-paper hover:shadow-card transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                <p className="text-3xl font-bold text-foreground">{classStats.totalStudents}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 paper-texture shadow-paper hover:shadow-card transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Score</p>
                <p className="text-3xl font-bold text-foreground">{classStats.avgScore}%</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-success/20 to-success/10">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-6 paper-texture shadow-paper hover:shadow-card transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Reviews</p>
                <p className="text-3xl font-bold text-foreground">{classStats.pendingReviews}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10">
                <FileCheck className="w-6 h-6 text-warning-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-6 paper-texture shadow-paper hover:shadow-card transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-foreground">{classStats.completionRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10">
                <BookOpen className="w-6 h-6 text-accent-foreground" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Reviews */}
          <Card className="lg:col-span-2 p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                <FileCheck className="w-6 h-6 text-primary" />
                Pending Reviews
              </h2>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            <div className="space-y-3">
              {pendingReviews.map((review, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-card border border-border hover:shadow-paper transition-all cursor-pointer"
                  onClick={() => navigate('/teacher/review')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{review.student}</h3>
                        {review.priority === "urgent" && (
                          <Badge variant="destructive" className="text-xs">Urgent</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{review.assignment}</p>
                      <p className="text-xs text-muted-foreground">Submitted {review.submitted}</p>
                    </div>
                    <Button size="sm" variant="outline">Review</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Class Alerts */}
          <Card className="p-6 shadow-card">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-warning-foreground" />
              Alerts
            </h2>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-warning/10 border border-warning/30">
                <p className="text-sm font-semibold text-warning-foreground mb-1">Low Engagement</p>
                <p className="text-xs text-foreground/80">Marcus Chen hasn't submitted work in 3 days</p>
              </div>
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/30">
                <p className="text-sm font-semibold text-accent-foreground mb-1">Writing Fluency</p>
                <p className="text-xs text-foreground/80">Sofia Martinez showing improvement in sentence structure</p>
              </div>
              <div className="p-3 rounded-xl bg-success/10 border border-success/30">
                <p className="text-sm font-semibold text-success mb-1">Class Achievement</p>
                <p className="text-xs text-foreground/80">18 students completed all weekly assignments!</p>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="p-6 shadow-card bg-gradient-to-br from-accent/5 to-primary/5 border-primary/20">
          <h2 className="text-2xl font-semibold mb-4">AI Class Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="text-sm font-semibold mb-2">Writing Trends</p>
              <p className="text-xs text-muted-foreground">
                Class showing 15% improvement in paragraph organization over the past month
              </p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="text-sm font-semibold mb-2">Common Errors</p>
              <p className="text-xs text-muted-foreground">
                Most students need support with topic sentences and transition words
              </p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="text-sm font-semibold mb-2">Strengths</p>
              <p className="text-xs text-muted-foreground">
                Excellent progress in descriptive vocabulary and punctuation accuracy
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;

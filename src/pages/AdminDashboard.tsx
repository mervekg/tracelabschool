import { Users, TrendingUp, Shield, BookOpen, BarChart3, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import LearnionLogo from "@/components/LearnionLogo";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const schoolStats = {
    totalStudents: 486,
    totalTeachers: 28,
    avgScore: 85,
    integrityScore: 98,
  };

  const integrityAlerts = [
    { student: "Student A", grade: "7th", issue: "Unusual writing pattern", severity: "medium" },
    { student: "Student B", grade: "6th", issue: "Submission time anomaly", severity: "low" },
  ];

  return (
    <div className="min-h-screen paper-texture p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LearnionLogo size="lg" showText={false} />
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Lincoln Elementary School</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Export Reports</Button>
            <Button className="bg-gradient-to-r from-primary to-primary/80">Manage Users</Button>
          </div>
        </div>

        {/* School-Wide Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 paper-texture shadow-paper hover:shadow-card transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                <p className="text-3xl font-bold text-foreground">{schoolStats.totalStudents}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6 paper-texture shadow-paper hover:shadow-card transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Teachers</p>
                <p className="text-3xl font-bold text-foreground">{schoolStats.totalTeachers}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10">
                <BookOpen className="w-6 h-6 text-accent-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-6 paper-texture shadow-paper hover:shadow-card transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Score</p>
                <p className="text-3xl font-bold text-foreground">{schoolStats.avgScore}%</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-success/20 to-success/10">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-6 paper-texture shadow-paper hover:shadow-card transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Integrity Score</p>
                <p className="text-3xl font-bold text-foreground">{schoolStats.integrityScore}%</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-success/20 to-success/10">
                <Shield className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Academic Performance */}
          <Card className="lg:col-span-2 p-6 shadow-card">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              School-Wide Performance
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">Writing & Literacy</p>
                  <Badge className="bg-success text-success-foreground">+12%</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success rounded-full h-2" style={{ width: '87%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">87% proficiency (↑ from 75%)</p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">Math Reasoning</p>
                  <Badge className="bg-success text-success-foreground">+8%</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success rounded-full h-2" style={{ width: '83%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">83% proficiency (↑ from 75%)</p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">Science CER</p>
                  <Badge className="bg-success text-success-foreground">+15%</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-success rounded-full h-2" style={{ width: '79%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">79% proficiency (↑ from 64%)</p>
              </div>
            </div>
          </Card>

          {/* Integrity Alerts */}
          <Card className="p-6 shadow-card">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-warning-foreground" />
              Integrity Monitor
            </h2>
            <div className="space-y-3">
              {integrityAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl border ${
                    alert.severity === "medium"
                      ? "bg-warning/10 border-warning/30"
                      : "bg-muted border-border"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-sm">{alert.student}</p>
                    <Badge
                      variant={alert.severity === "medium" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{alert.grade}</p>
                  <p className="text-xs text-foreground/80">{alert.issue}</p>
                </div>
              ))}
              <div className="p-3 rounded-xl bg-success/10 border border-success/30 text-center">
                <p className="text-sm font-semibold text-success">98% Verified</p>
                <p className="text-xs text-foreground/80 mt-1">All other submissions authenticated</p>
              </div>
            </div>
          </Card>
        </div>

        {/* AI-Powered Insights */}
        <Card className="p-6 shadow-card bg-gradient-to-br from-accent/10 to-primary/10 border-primary/20">
          <h2 className="text-2xl font-semibold mb-4">AI System Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="font-semibold mb-2">Curriculum Alignment</p>
              <p className="text-sm text-muted-foreground">
                92% of assessments aligned with state standards. ELA standards coverage: 96%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="font-semibold mb-2">Teacher Effectiveness</p>
              <p className="text-sm text-muted-foreground">
                Average feedback quality score: 94%. Response time improved by 35%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="font-semibold mb-2">Student Growth</p>
              <p className="text-sm text-muted-foreground">
                78% of students showing measurable improvement in writing over 3 months
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto flex-col gap-2 p-6" onClick={() => navigate('/admin/accommodation-approvals')}>
            <Users className="w-8 h-8 text-primary" />
            <span className="text-sm font-medium">Accommodation Approvals</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 p-6">
            <Users className="w-8 h-8 text-primary" />
            <span className="text-sm font-medium">Manage Users</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 p-6">
            <BookOpen className="w-8 h-8 text-accent-foreground" />
            <span className="text-sm font-medium">Curriculum</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 p-6">
            <BarChart3 className="w-8 h-8 text-success" />
            <span className="text-sm font-medium">Analytics</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col gap-2 p-6">
            <Shield className="w-8 h-8 text-warning-foreground" />
            <span className="text-sm font-medium">Security</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

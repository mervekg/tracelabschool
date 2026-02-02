import { User, TrendingUp, Calendar, MessageSquare, Award, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import TraceLabLogo from "@/components/TraceLabLogo";

const ParentDashboard = () => {
  const childProgress = {
    name: "Emma Rodriguez",
    grade: "5th Grade",
    avgScore: 88,
    assignments: { completed: 42, total: 45 },
    streak: 12,
    strengths: ["Descriptive Writing", "Math Problem Solving", "Science Reasoning"],
    areasToImprove: ["Topic Sentences", "Sentence Variety"],
  };

  const recentWork = [
    { title: "Paragraph Writing: My Weekend", subject: "ELA", score: 88, date: "Today" },
    { title: "Fraction Word Problems", subject: "Math", score: 92, date: "Yesterday" },
    { title: "Plant Life Cycle", subject: "Science", score: 95, date: "3 days ago" },
  ];

  return (
    <div className="min-h-screen paper-texture p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TraceLabLogo size="lg" showText={false} />
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Parent Portal</h1>
              <p className="text-muted-foreground">Welcome back! Here's {childProgress.name}'s progress</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-primary to-primary/80">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message Teacher
          </Button>
        </div>

        {/* Child Overview */}
        <Card className="p-6 shadow-card bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{childProgress.name}</h2>
                <p className="text-muted-foreground">{childProgress.grade} • Section A</p>
              </div>
            </div>
            <Badge className="bg-warning text-warning-foreground flex items-center gap-1 px-3 py-1">
              <Award className="w-4 h-4" />
              {childProgress.streak} Day Streak
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">Average Score</p>
              <p className="text-3xl font-bold text-success">{childProgress.avgScore}%</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">Assignments</p>
              <p className="text-3xl font-bold text-primary">
                {childProgress.assignments.completed}/{childProgress.assignments.total}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="text-sm text-muted-foreground mb-1">Engagement</p>
              <p className="text-3xl font-bold text-accent-foreground">Excellent</p>
            </div>
          </div>
        </Card>

        {/* Progress & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card className="p-6 shadow-card">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-success" />
              Strengths
            </h2>
            <div className="space-y-2">
              {childProgress.strengths.map((strength, index) => (
                <div key={index} className="p-3 rounded-xl bg-success/10 border border-success/20">
                  <p className="text-sm font-medium text-success-foreground">{strength}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Areas to Improve */}
          <Card className="p-6 shadow-card">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-accent-foreground" />
              Areas to Support
            </h2>
            <div className="space-y-2">
              {childProgress.areasToImprove.map((area, index) => (
                <div key={index} className="p-3 rounded-xl bg-accent/10 border border-accent/20">
                  <p className="text-sm font-medium text-accent-foreground">{area}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              💡 Try practicing transition words together at home!
            </p>
          </Card>
        </div>

        {/* Recent Work */}
        <Card className="p-6 shadow-card">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Recent Work
          </h2>
          <div className="space-y-3">
            {recentWork.map((work, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-card border border-border hover:shadow-paper transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{work.title}</h3>
                    <p className="text-sm text-muted-foreground">{work.subject} • {work.date}</p>
                  </div>
                  <Badge className="bg-success text-success-foreground">{work.score}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* What Your Child is Working On Today */}
        <Card className="p-6 shadow-card bg-gradient-to-br from-accent/10 to-primary/10 border-primary/20">
          <h2 className="text-2xl font-semibold mb-3">Today's Learning</h2>
          <p className="text-foreground/90 mb-4">
            Emma is working on <strong>fraction word problems</strong> in Math and continuing her 
            paragraph writing practice. She's making great progress with descriptive language!
          </p>
          <div className="flex gap-4">
            <Button variant="outline">View Full Schedule</Button>
            <Button variant="outline" onClick={() => window.location.href = '/parent/portfolio'}>
              View Complete Portfolio
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ParentDashboard;

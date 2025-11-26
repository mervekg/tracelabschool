import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Clock, 
  User,
  Download,
  Filter,
  Search,
  ChevronDown,
  Eye,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface Violation {
  id: string;
  studentName: string;
  studentId: string;
  assignmentName: string;
  violationType: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
  details: string;
}

const TeacherViolationReports = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStudent, setFilterStudent] = useState("all");

  // Mock violation data - In production, this would come from database
  const violations: Violation[] = [
    {
      id: "1",
      studentName: "Emma Rodriguez",
      studentId: "student_001",
      assignmentName: "Paragraph Writing: My Weekend",
      violationType: "Tab Switch Detected",
      timestamp: "2024-01-15T14:23:45Z",
      severity: "medium",
      details: "Student switched to another browser tab for 12 seconds"
    },
    {
      id: "2",
      studentName: "Emma Rodriguez",
      studentId: "student_001",
      assignmentName: "Paragraph Writing: My Weekend",
      violationType: "Exited Fullscreen",
      timestamp: "2024-01-15T14:25:12Z",
      severity: "high",
      details: "Student exited fullscreen mode using ESC key"
    },
    {
      id: "3",
      studentName: "Marcus Chen",
      studentId: "student_002",
      assignmentName: "Math Problem Set #5",
      violationType: "Tab Switch Detected",
      timestamp: "2024-01-15T14:28:33Z",
      severity: "medium",
      details: "Student switched to another browser tab for 8 seconds"
    },
    {
      id: "4",
      studentName: "Emma Rodriguez",
      studentId: "student_001",
      assignmentName: "Paragraph Writing: My Weekend",
      violationType: "Keyboard Shortcut Attempt",
      timestamp: "2024-01-15T14:30:05Z",
      severity: "low",
      details: "Attempted to use Ctrl+T (blocked)"
    },
    {
      id: "5",
      studentName: "Sofia Martinez",
      studentId: "student_003",
      assignmentName: "Science Quiz: Photosynthesis",
      violationType: "Tab Switch Detected",
      timestamp: "2024-01-15T15:12:18Z",
      severity: "high",
      details: "Student switched to another browser tab for 45 seconds"
    },
    {
      id: "6",
      studentName: "Marcus Chen",
      studentId: "student_002",
      assignmentName: "Math Problem Set #5",
      violationType: "Navigation Attempt",
      timestamp: "2024-01-15T14:35:22Z",
      severity: "medium",
      details: "Attempted to use browser back button (blocked)"
    },
    {
      id: "7",
      studentName: "Sofia Martinez",
      studentId: "student_003",
      assignmentName: "Science Quiz: Photosynthesis",
      violationType: "Exited Fullscreen",
      timestamp: "2024-01-15T15:15:40Z",
      severity: "high",
      details: "Student exited fullscreen mode"
    },
  ];

  // Calculate statistics
  const stats = {
    totalViolations: violations.length,
    uniqueStudents: new Set(violations.map(v => v.studentId)).size,
    highSeverity: violations.filter(v => v.severity === "high").length,
    mediumSeverity: violations.filter(v => v.severity === "medium").length,
    lowSeverity: violations.filter(v => v.severity === "low").length,
  };

  // Group violations by student
  const violationsByStudent = violations.reduce((acc, violation) => {
    if (!acc[violation.studentId]) {
      acc[violation.studentId] = {
        studentName: violation.studentName,
        violations: [],
        count: 0,
      };
    }
    acc[violation.studentId].violations.push(violation);
    acc[violation.studentId].count++;
    return acc;
  }, {} as Record<string, { studentName: string; violations: Violation[]; count: number }>);

  // Filter violations
  const filteredViolations = violations.filter(violation => {
    const matchesSearch = violation.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         violation.assignmentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === "all" || violation.severity === filterSeverity;
    const matchesStudent = filterStudent === "all" || violation.studentId === filterStudent;
    return matchesSearch && matchesSeverity && matchesStudent;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-muted text-muted-foreground";
      default: return "bg-muted";
    }
  };

  const getViolationIcon = (type: string) => {
    switch (type) {
      case "Tab Switch Detected": return "🔄";
      case "Exited Fullscreen": return "🚪";
      case "Keyboard Shortcut Attempt": return "⌨️";
      case "Navigation Attempt": return "🧭";
      default: return "⚠️";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExportReport = () => {
    // In production, this would generate a CSV/PDF report
    const csvContent = [
      ["Student", "Assignment", "Violation Type", "Timestamp", "Severity", "Details"],
      ...violations.map(v => [
        v.studentName,
        v.assignmentName,
        v.violationType,
        v.timestamp,
        v.severity,
        v.details
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `violation-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-8 h-8 text-destructive" />
              <h1 className="text-3xl font-bold text-primary">Lockdown Violation Reports</h1>
            </div>
            <p className="text-muted-foreground">Monitor and analyze student integrity during assessments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" onClick={() => navigate('/teacher/assignment-settings')}>
              <Shield className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => navigate('/teacher')}>
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border-destructive/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Violations</p>
                <p className="text-3xl font-bold text-destructive">{stats.totalViolations}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-destructive opacity-20" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Students with Violations</p>
                <p className="text-3xl font-bold">{stats.uniqueStudents}</p>
              </div>
              <User className="w-10 h-10 text-primary opacity-20" />
            </div>
          </Card>

          <Card className="p-4 bg-destructive/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">High Severity</p>
                <p className="text-3xl font-bold text-destructive">{stats.highSeverity}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-destructive opacity-20" />
            </div>
          </Card>

          <Card className="p-4 bg-warning/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Medium Severity</p>
                <p className="text-3xl font-bold text-warning-foreground">{stats.mediumSeverity}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-warning-foreground opacity-20" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by student or assignment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStudent} onValueChange={setFilterStudent}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {Object.entries(violationsByStudent).map(([id, data]) => (
                  <SelectItem key={id} value={id}>
                    {data.studentName} ({data.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Tabs: All Violations vs By Student */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="all">All Violations</TabsTrigger>
            <TabsTrigger value="students">By Student</TabsTrigger>
          </TabsList>

          {/* All Violations Tab */}
          <TabsContent value="all" className="space-y-3">
            {filteredViolations.length === 0 ? (
              <Card className="p-8 text-center">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No violations found</p>
              </Card>
            ) : (
              filteredViolations.map((violation) => (
                <Card key={violation.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl mt-1">{getViolationIcon(violation.violationType)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-foreground">{violation.studentName}</h3>
                          <Badge className={getSeverityColor(violation.severity)}>
                            {violation.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {violation.assignmentName}
                        </p>
                        <p className="text-sm font-medium text-destructive">
                          {violation.violationType}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {violation.details}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground md:flex-col md:items-end">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimestamp(violation.timestamp)}</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          {/* By Student Tab */}
          <TabsContent value="students" className="space-y-4">
            {Object.entries(violationsByStudent).map(([studentId, data]) => (
              <Card key={studentId} className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{data.studentName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {data.count} violation{data.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  {data.violations.map((violation) => (
                    <div key={violation.id} className="flex items-start justify-between gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getViolationIcon(violation.violationType)}</span>
                          <p className="text-sm font-medium">{violation.violationType}</p>
                          <Badge className={`${getSeverityColor(violation.severity)} text-xs`}>
                            {violation.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground ml-7">
                          {violation.assignmentName}
                        </p>
                        <p className="text-xs text-muted-foreground ml-7 mt-1">
                          {violation.details}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(violation.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Pattern Analysis */}
        <Card className="p-6 bg-accent/5 border-accent/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-foreground" />
            Pattern Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Most Common Violations</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tab Switching</span>
                  <Badge variant="outline">4 occurrences</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Exiting Fullscreen</span>
                  <Badge variant="outline">2 occurrences</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Keyboard Shortcuts</span>
                  <Badge variant="outline">1 occurrence</Badge>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Peak Violation Times</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">2:00 PM - 3:00 PM</span>
                  <Badge variant="outline">5 violations</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">After 30 min mark</span>
                  <Badge variant="outline">High fatigue period</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeacherViolationReports;

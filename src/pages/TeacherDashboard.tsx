import { useState } from "react";
import { Users, FileCheck, AlertCircle, TrendingUp, BookOpen, Calendar, Shield, Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import SolviaLogo from "@/components/SolviaLogo";
import CourseCard from "@/components/CourseCard";

// Mock teacher name - in production this would come from auth/profile
const TEACHER_LAST_NAME = "Gokgol";

interface Course {
  id: string;
  title: string;
  code: string;
  section: string;
  schoolName: string;
  thumbnailUrl?: string;
  isFavorite: boolean;
  color: string;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock courses data - in production this would come from the database
  const [courses, setCourses] = useState<Course[]>([
    {
      id: "1",
      title: "Mathematics",
      code: `Math_${TEACHER_LAST_NAME}_6A`,
      section: "Grade 6 - Section A",
      schoolName: "Lincoln Elementary School",
      thumbnailUrl: "",
      isFavorite: true,
      color: "bg-blue-100",
    },
    {
      id: "2", 
      title: "Science",
      code: `Science_${TEACHER_LAST_NAME}_6B`,
      section: "Grade 6 - Section B",
      schoolName: "Lincoln Elementary School",
      thumbnailUrl: "",
      isFavorite: false,
      color: "bg-green-100",
    },
    {
      id: "3",
      title: "English",
      code: `English_${TEACHER_LAST_NAME}_5A`,
      section: "Grade 5 - Section A", 
      schoolName: "Lincoln Elementary School",
      thumbnailUrl: "",
      isFavorite: true,
      color: "bg-purple-100",
    },
    {
      id: "4",
      title: "History",
      code: `History_${TEACHER_LAST_NAME}_6C`,
      section: "Grade 6 - Section C",
      schoolName: "Lincoln Elementary School",
      thumbnailUrl: "",
      isFavorite: false,
      color: "bg-amber-100",
    },
    {
      id: "5",
      title: "Physics",
      code: `Physics_${TEACHER_LAST_NAME}_7A`,
      section: "Grade 7 - Section A",
      schoolName: "Lincoln Elementary School",
      thumbnailUrl: "",
      isFavorite: false,
      color: "bg-cyan-100",
    },
    {
      id: "6",
      title: "Chemistry",
      code: `Chemistry_${TEACHER_LAST_NAME}_7B`,
      section: "Grade 7 - Section B",
      schoolName: "Lincoln Elementary School",
      thumbnailUrl: "",
      isFavorite: false,
      color: "bg-pink-100",
    },
  ]);

  const handleThumbnailChange = (courseId: string, url: string) => {
    setCourses(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, thumbnailUrl: url }
          : course
      )
    );
  };

  const handleFavoriteToggle = (courseId: string) => {
    setCourses(prev =>
      prev.map(course =>
        course.id === courseId
          ? { ...course, isFavorite: !course.isFavorite }
          : course
      )
    );
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const classStats = {
    totalStudents: 24,
    avgScore: 87,
    pendingReviews: 8,
    completionRate: 92,
  };

  return (
    <div className="min-h-screen paper-texture">
      {/* Top Navigation Bar */}
      <header className="bg-background border-b border-border px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <SolviaLogo size="md" showText={true} />
            <nav className="hidden md:flex items-center gap-4">
              <Button variant="ghost" className="font-medium">Courses</Button>
              <Button variant="ghost" className="text-muted-foreground">Groups</Button>
              <Button variant="ghost" className="text-muted-foreground">Resources</Button>
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
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
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Reviews</p>
                <p className="text-2xl font-bold text-warning-foreground">{classStats.pendingReviews}</p>
              </div>
              <FileCheck className="w-8 h-8 text-warning-foreground opacity-30" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Students</p>
                <p className="text-2xl font-bold text-primary">{classStats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-primary opacity-30" />
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Score</p>
                <p className="text-2xl font-bold text-success">{classStats.avgScore}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-success opacity-30" />
            </div>
          </Card>

          <Card 
            className="p-4 bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/30 cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate('/teacher/violation-reports')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Violations</p>
                <p className="text-2xl font-bold text-destructive">7</p>
              </div>
              <Shield className="w-8 h-8 text-destructive opacity-30" />
            </div>
          </Card>
        </div>

        {/* Courses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">My Courses</h2>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                code={course.code}
                section={course.section}
                schoolName={course.schoolName}
                thumbnailUrl={course.thumbnailUrl}
                isFavorite={course.isFavorite}
                color={course.color}
                onThumbnailChange={handleThumbnailChange}
                onFavoriteToggle={handleFavoriteToggle}
                onClick={() => navigate('/teacher/review')}
              />
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No courses found matching "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="p-6 shadow-card bg-gradient-to-br from-accent/5 to-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate('/teacher/assignment-settings')}>
              <Calendar className="w-4 h-4 mr-2" />
              Assignment Settings
            </Button>
            <Button variant="outline" onClick={() => navigate('/teacher/rubric-builder')}>
              <FileCheck className="w-4 h-4 mr-2" />
              Rubric Builder
            </Button>
            <Button variant="outline" onClick={() => navigate('/teacher/review')}>
              <AlertCircle className="w-4 h-4 mr-2" />
              Review Submissions
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;

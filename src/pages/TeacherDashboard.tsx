import { useState, useEffect } from "react";
import { BookOpen, Calendar, FileCheck, AlertCircle, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import CourseCard from "@/components/CourseCard";
import CreateClassDialog from "@/components/CreateClassDialog";
import { supabase } from "@/integrations/supabase/client";
import TeacherLayout from "@/components/teacher/TeacherLayout";

interface Course {
  id: string;
  title: string;
  code: string;
  section: string;
  gradeLevel: string;
  thumbnailUrl?: string;
  isFavorite: boolean;
  color: string;
  studentCount: number;
  pendingReviewCount: number;
  violationCount: number;
  avgScore: number;
}

interface ClassStats {
  totalStudents: number;
  avgScore: number;
  pendingReviews: number;
  violationCount: number;
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [teacherLastName, setTeacherLastName] = useState("Teacher");
  const [loading, setLoading] = useState(true);
  const [classStats, setClassStats] = useState<ClassStats>({
    totalStudents: 0,
    avgScore: 0,
    pendingReviews: 0,
    violationCount: 0,
  });

  const fetchClasses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch teacher's last name from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (profile?.full_name) {
      const nameParts = profile.full_name.split(" ");
      setTeacherLastName(nameParts[nameParts.length - 1] || "Teacher");
    } else {
      const emailName = user.email?.split("@")[0] || "Teacher";
      setTeacherLastName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
    }

    // Fetch classes
    const { data: classes, error } = await supabase
      .from("classes")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching classes:", error);
      setLoading(false);
      return;
    }

    if (!classes || classes.length === 0) {
      setCourses([]);
      setLoading(false);
      return;
    }

    const classIds = classes.map(c => c.id);

    // Fetch student counts per class
    const { data: studentCounts } = await supabase
      .from("students")
      .select("class_id")
      .in("class_id", classIds);

    const studentCountMap: Record<string, number> = {};
    studentCounts?.forEach(s => {
      studentCountMap[s.class_id] = (studentCountMap[s.class_id] || 0) + 1;
    });

    // Fetch assignments for these classes to get pending submissions
    const { data: assignments } = await supabase
      .from("assignments")
      .select("id, class_id")
      .in("class_id", classIds);

    const assignmentIds = assignments?.map(a => a.id) || [];
    const assignmentClassMap: Record<string, string> = {};
    assignments?.forEach(a => {
      assignmentClassMap[a.id] = a.class_id;
    });

    // Fetch pending submissions and graded submissions for avg score
    let pendingCountMap: Record<string, number> = {};
    let scoresByClass: Record<string, { total: number; count: number }> = {};
    
    if (assignmentIds.length > 0) {
      const { data: submissions } = await supabase
        .from("student_submissions")
        .select("assignment_id, status, score")
        .in("assignment_id", assignmentIds);

      submissions?.forEach(s => {
        const classId = assignmentClassMap[s.assignment_id];
        if (classId) {
          // Count pending reviews
          if (s.status === "pending" || s.status === "submitted") {
            pendingCountMap[classId] = (pendingCountMap[classId] || 0) + 1;
          }
          // Calculate avg score from graded submissions
          if (s.status === "graded" && s.score !== null) {
            if (!scoresByClass[classId]) {
              scoresByClass[classId] = { total: 0, count: 0 };
            }
            scoresByClass[classId].total += Number(s.score);
            scoresByClass[classId].count += 1;
          }
        }
      });
    }

    // Build courses with real counts
    const coursesWithStats = classes.map(c => {
      const classScores = scoresByClass[c.id];
      const avgScore = classScores && classScores.count > 0 
        ? Math.round(classScores.total / classScores.count) 
        : 0;
      
      return {
        id: c.id,
        title: c.subject,
        code: c.name,
        section: c.section,
        gradeLevel: c.grade_level,
        thumbnailUrl: c.thumbnail_url || "",
        isFavorite: c.is_favorite || false,
        color: c.color || "#6366f1",
        studentCount: studentCountMap[c.id] || 0,
        pendingReviewCount: pendingCountMap[c.id] || 0,
        violationCount: 0, // Will be added when violations table exists
        avgScore,
      };
    });

    setCourses(coursesWithStats);

    // Calculate aggregate stats
    const totalStudents = Object.values(studentCountMap).reduce((a, b) => a + b, 0);
    const totalPending = Object.values(pendingCountMap).reduce((a, b) => a + b, 0);
    
    // Calculate overall avg score
    const allScores = Object.values(scoresByClass);
    const totalScore = allScores.reduce((a, b) => a + b.total, 0);
    const totalCount = allScores.reduce((a, b) => a + b.count, 0);
    const overallAvg = totalCount > 0 ? Math.round(totalScore / totalCount) : 0;

    setClassStats({
      totalStudents,
      avgScore: overallAvg,
      pendingReviews: totalPending,
      violationCount: 0,
    });

    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleThumbnailChange = async (courseId: string, url: string) => {
    const { error } = await supabase
      .from("classes")
      .update({ thumbnail_url: url })
      .eq("id", courseId);

    if (!error) {
      setCourses(prev => 
        prev.map(course => 
          course.id === courseId 
            ? { ...course, thumbnailUrl: url }
            : course
        )
      );
    }
  };

  const handleFavoriteToggle = async (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    const { error } = await supabase
      .from("classes")
      .update({ is_favorite: !course.isFavorite })
      .eq("id", courseId);

    if (!error) {
      setCourses(prev =>
        prev.map(c =>
          c.id === courseId
            ? { ...c, isFavorite: !c.isFavorite }
            : c
        )
      );
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TeacherLayout 
      searchQuery={searchQuery} 
      onSearchChange={setSearchQuery}
      showSearch={true}
    >
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Simple Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Courses */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-3xl font-bold text-foreground">{courses.length}</p>
              </div>
            </div>
          </Card>

          {/* Today's Overview */}
          <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent/20">
                <Calendar className="w-6 h-6 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Today's Overview</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm">
                    <span className="font-bold text-foreground">{classStats.totalStudents}</span>
                    <span className="text-muted-foreground"> students</span>
                  </span>
                  <span className="text-sm">
                    <span className="font-bold text-warning">{classStats.pendingReviews}</span>
                    <span className="text-muted-foreground"> pending reviews</span>
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Courses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">My Courses</h2>
            <CreateClassDialog 
              onClassCreated={fetchClasses} 
              teacherLastName={teacherLastName}
            />
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  code={course.code}
                  section={`${course.gradeLevel} - ${course.section}`}
                  schoolName=""
                  thumbnailUrl={course.thumbnailUrl}
                  isFavorite={course.isFavorite}
                  color={course.color}
                  studentCount={course.studentCount}
                  violationCount={course.violationCount}
                  pendingReviewCount={course.pendingReviewCount}
                  avgScore={course.avgScore}
                  onThumbnailChange={handleThumbnailChange}
                  onFavoriteToggle={handleFavoriteToggle}
                  onClick={() => navigate(`/teacher/class/${course.id}`)}
                />
              ))}
            </div>
          )}

          {!loading && filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? `No courses found matching "${searchQuery}"` : "No courses yet. Click 'Add Course' to create your first class!"}
              </p>
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
    </TeacherLayout>
  );
};

export default TeacherDashboard;

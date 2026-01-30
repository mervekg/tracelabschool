import { useState, useEffect } from "react";
import { Users, FileCheck, AlertCircle, TrendingUp, BookOpen, Calendar, Shield } from "lucide-react";
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
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [teacherLastName, setTeacherLastName] = useState("Teacher");
  const [loading, setLoading] = useState(true);

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
      // Try to get from email
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
    } else if (classes) {
      setCourses(classes.map(c => ({
        id: c.id,
        title: c.subject,
        code: c.name,
        section: c.section,
        gradeLevel: c.grade_level,
        thumbnailUrl: c.thumbnail_url || "",
        isFavorite: c.is_favorite || false,
        color: c.color || "#6366f1",
      })));
    }
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

  const classStats = {
    totalStudents: 24,
    avgScore: 87,
    pendingReviews: 8,
    completionRate: 92,
  };

  return (
    <TeacherLayout 
      searchQuery={searchQuery} 
      onSearchChange={setSearchQuery}
      showSearch={true}
    >
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

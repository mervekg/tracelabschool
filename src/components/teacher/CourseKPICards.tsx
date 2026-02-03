import { FileCheck, Users, TrendingUp, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface CourseKPICardsProps {
  classId: string;
  pendingReviews: number;
  studentCount: number;
  avgScore: number;
  violationCount: number;
}

const CourseKPICards = ({
  classId,
  pendingReviews,
  studentCount,
  avgScore,
  violationCount,
}: CourseKPICardsProps) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Pending Reviews */}
      <Card 
        className="p-4 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20 cursor-pointer hover:shadow-md transition-all"
        onClick={() => navigate('/teacher/review')}
      >
        <p className="text-sm text-muted-foreground mb-1">Pending Reviews</p>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-foreground">{pendingReviews}</p>
          <FileCheck className="w-6 h-6 text-muted-foreground/30" />
        </div>
      </Card>

      {/* Total Students */}
      <Card className="p-4 bg-gradient-to-br from-muted/50 to-muted/30 border-border">
        <p className="text-sm text-muted-foreground mb-1">Students</p>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-foreground">{studentCount}</p>
          <Users className="w-6 h-6 text-muted-foreground/30" />
        </div>
      </Card>

      {/* Avg Score */}
      <Card 
        className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/20 cursor-pointer hover:shadow-md transition-all"
        onClick={() => navigate('/teacher/review')}
      >
        <p className="text-sm text-muted-foreground mb-1">Avg Score</p>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-success">{avgScore > 0 ? `${avgScore}%` : "—"}</p>
          <TrendingUp className="w-6 h-6 text-muted-foreground/30" />
        </div>
      </Card>

      {/* Violations */}
      <Card 
        className="p-4 bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20 cursor-pointer hover:shadow-md transition-all"
        onClick={() => navigate('/teacher/violation-reports')}
      >
        <p className="text-sm text-muted-foreground mb-1">Violations</p>
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-foreground">{violationCount}</p>
          <Shield className="w-6 h-6 text-muted-foreground/30" />
        </div>
      </Card>
    </div>
  );
};

export default CourseKPICards;

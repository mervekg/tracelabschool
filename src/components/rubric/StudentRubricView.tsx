import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, CircleDot, Target } from "lucide-react";
import type { Rubric, RubricCriterion, AIGradingResult, CriterionScore } from "./RubricTypes";

interface StudentRubricViewProps {
  rubric: Rubric;
  gradingResult?: AIGradingResult | null;
  showAllLevels?: boolean;
}

const StudentRubricView = ({ 
  rubric, 
  gradingResult, 
  showAllLevels = false 
}: StudentRubricViewProps) => {
  const getScoreForCriterion = (criterionId: string): CriterionScore | undefined => {
    return gradingResult?.scores.find(s => s.criterionId === criterionId);
  };

  const levelLabels: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
    4: { label: "Excellent", color: "text-success", icon: <CheckCircle2 className="w-4 h-4 text-success" /> },
    3: { label: "Good", color: "text-primary", icon: <CheckCircle2 className="w-4 h-4 text-primary" /> },
    2: { label: "Developing", color: "text-warning", icon: <CircleDot className="w-4 h-4 text-warning" /> },
    1: { label: "Needs Work", color: "text-muted-foreground", icon: <CircleDot className="w-4 h-4 text-muted-foreground" /> },
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            How You'll Be Graded
          </CardTitle>
          <Badge className="bg-primary/10 text-primary">{rubric.totalPoints} points</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rubric.criteria.map((criterion) => {
          const score = getScoreForCriterion(criterion.id);
          const excellentLevel = criterion.levels.find(l => l.level === 4);
          const developingLevel = criterion.levels.find(l => l.level === 2);

          return (
            <div
              key={criterion.id}
              className={`p-4 rounded-lg border ${
                score ? "bg-muted/30 border-primary/30" : "bg-muted/20 border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{criterion.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {criterion.maxScore} pts
                  </Badge>
                </div>
                {score && (
                  <div className="flex items-center gap-1.5">
                    {levelLabels[score.levelAwarded].icon}
                    <span className={`text-sm font-medium ${levelLabels[score.levelAwarded].color}`}>
                      {score.score}/{score.maxScore}
                    </span>
                  </div>
                )}
              </div>

              {criterion.description && (
                <p className="text-sm text-muted-foreground mb-3">{criterion.description}</p>
              )}

              {/* Show AI justification if graded */}
              {score?.aiJustification && (
                <div className="mb-3 p-2 rounded bg-primary/5 border border-primary/20">
                  <p className="text-sm text-foreground">{score.aiJustification}</p>
                </div>
              )}

              {/* Level descriptions - show top and one lower level */}
              <div className="space-y-2">
                {showAllLevels ? (
                  criterion.levels.map((level) => (
                    <div
                      key={level.level}
                      className={`flex items-start gap-2 p-2 rounded text-sm ${
                        score?.levelAwarded === level.level
                          ? "bg-primary/10 border border-primary/30"
                          : "bg-background"
                      }`}
                    >
                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 ${
                          score?.levelAwarded === level.level
                            ? "bg-primary text-primary-foreground"
                            : ""
                        }`}
                      >
                        {level.label}
                      </Badge>
                      <p className="text-muted-foreground">{level.studentDescription}</p>
                    </div>
                  ))
                ) : (
                  <>
                    {/* Excellent level */}
                    {excellentLevel && (
                      <div
                        className={`flex items-start gap-2 p-2 rounded text-sm ${
                          score?.levelAwarded === 4 ? "bg-success/10 border border-success/30" : "bg-success/5"
                        }`}
                      >
                        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30 shrink-0">
                          Excellent
                        </Badge>
                        <p className="text-muted-foreground">{excellentLevel.studentDescription}</p>
                      </div>
                    )}
                    {/* Developing level as reference */}
                    {developingLevel && (
                      <div
                        className={`flex items-start gap-2 p-2 rounded text-sm ${
                          score?.levelAwarded === 2 ? "bg-warning/10 border border-warning/30" : "bg-muted/30"
                        }`}
                      >
                        <Badge variant="outline" className="text-xs shrink-0">
                          Developing
                        </Badge>
                        <p className="text-muted-foreground">{developingLevel.studentDescription}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Overall feedback if graded */}
        {gradingResult && (
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Your Score</h4>
              <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                {gradingResult.overallPoints}/{gradingResult.totalPoints}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium text-success">✓ What you did well:</span>{" "}
                {gradingResult.feedback.strengths}
              </p>
              <p>
                <span className="font-medium text-warning">↗ What to improve:</span>{" "}
                {gradingResult.feedback.improvements}
              </p>
              <p>
                <span className="font-medium text-primary">→ Next step:</span>{" "}
                {gradingResult.feedback.nextStep}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentRubricView;

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Scale, FileText } from "lucide-react";
import { useState } from "react";
import type { Rubric, RubricCriterion } from "./RubricTypes";

interface TeacherRubricViewProps {
  rubric: Rubric;
  showWeights?: boolean;
  compact?: boolean;
}

const TeacherRubricView = ({ rubric, showWeights = true, compact = false }: TeacherRubricViewProps) => {
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set());

  const toggleCriterion = (id: string) => {
    const newExpanded = new Set(expandedCriteria);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCriteria(newExpanded);
  };

  const levelColors: Record<number, string> = {
    4: "bg-success/10 text-success border-success/30",
    3: "bg-primary/10 text-primary border-primary/30",
    2: "bg-warning/10 text-warning border-warning/30",
    1: "bg-destructive/10 text-destructive border-destructive/30",
  };

  if (compact) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {rubric.name}
            </CardTitle>
            <Badge variant="outline">{rubric.totalPoints} pts</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1">
            {rubric.criteria.map((criterion) => (
              <Badge key={criterion.id} variant="secondary" className="text-xs">
                {criterion.name} ({criterion.maxScore}pts)
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {rubric.name}
          </CardTitle>
          <Badge className="bg-primary/10 text-primary border-primary/30 text-sm">
            {rubric.totalPoints} Total Points
          </Badge>
        </div>
        {rubric.notes && (
          <p className="text-sm text-muted-foreground mt-2">{rubric.notes}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {rubric.criteria.map((criterion) => (
          <Collapsible
            key={criterion.id}
            open={expandedCriteria.has(criterion.id)}
            onOpenChange={() => toggleCriterion(criterion.id)}
          >
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedCriteria.has(criterion.id) ? "rotate-180" : ""
                    }`}
                  />
                  <div className="text-left">
                    <p className="font-medium">{criterion.name}</p>
                    {criterion.description && (
                      <p className="text-xs text-muted-foreground">{criterion.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {showWeights && criterion.weight !== 1 && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Scale className="w-3 h-3" />
                      {criterion.weight}x
                    </Badge>
                  )}
                  <Badge variant="secondary">{criterion.maxScore} pts</Badge>
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Level</TableHead>
                    <TableHead>Teacher/AI Description</TableHead>
                    <TableHead className="w-[80px]">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criterion.levels.map((level) => (
                    <TableRow key={level.level} className={levelColors[level.level]}>
                      <TableCell className="font-medium">
                        <Badge
                          variant="outline"
                          className={levelColors[level.level]}
                        >
                          {level.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {level.teacherDescription || <span className="text-muted-foreground italic">No description</span>}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {Math.round((level.level / 4) * criterion.maxScore)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
};

export default TeacherRubricView;

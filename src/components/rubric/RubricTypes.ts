// Shared rubric types for teacher and student views

export interface RubricCriterionLevel {
  level: number; // 1-4 (1 = needs improvement, 4 = excellent)
  label: string; // "Excellent", "Good", "Developing", "Needs Improvement"
  teacherDescription: string; // Detailed description for teachers/AI
  studentDescription: string; // Simplified description for students
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // Weighting factor (1.0 = normal)
  maxScore: number;
  levels: RubricCriterionLevel[];
}

export interface Rubric {
  id: string;
  name: string;
  totalPoints: number;
  criteria: RubricCriterion[];
  notes?: string;
  isTemplate?: boolean;
  classId?: string;
  assignmentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CriterionScore {
  criterionId: string;
  criterionName: string;
  levelAwarded: number; // 1-4
  score: number; // Actual points earned
  maxScore: number;
  aiJustification: string; // One-sentence explanation
}

export interface AIGradingResult {
  scores: CriterionScore[];
  overallGrade: number; // Weighted total as percentage
  overallPoints: number; // Actual points earned
  totalPoints: number; // Maximum possible points
  feedback: {
    strengths: string;
    improvements: string;
    nextStep: string;
  };
  gradedAt: string;
}

// Convert database rubric to frontend format
export function mapDatabaseRubricToRubric(
  dbRubric: any,
  dbCategories: any[]
): Rubric {
  return {
    id: dbRubric.id,
    name: dbRubric.name,
    totalPoints: dbRubric.total_points,
    notes: dbRubric.notes,
    isTemplate: dbRubric.is_template,
    classId: dbRubric.class_id,
    assignmentId: dbRubric.assignment_id,
    createdAt: dbRubric.created_at,
    updatedAt: dbRubric.updated_at,
    criteria: dbCategories.map((cat, index) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description || "",
      weight: cat.weight || 1.0,
      maxScore: cat.max_score,
      levels: [
        {
          level: 4,
          label: "Excellent",
          teacherDescription: cat.criteria_excellent || "",
          studentDescription: cat.student_criteria_excellent || cat.criteria_excellent || "",
        },
        {
          level: 3,
          label: "Good",
          teacherDescription: cat.criteria_good || "",
          studentDescription: cat.student_criteria_good || cat.criteria_good || "",
        },
        {
          level: 2,
          label: "Developing",
          teacherDescription: cat.criteria_developing || "",
          studentDescription: cat.student_criteria_developing || cat.criteria_developing || "",
        },
        {
          level: 1,
          label: "Needs Improvement",
          teacherDescription: cat.criteria_needs_improvement || "",
          studentDescription: cat.student_criteria_needs_improvement || cat.criteria_needs_improvement || "",
        },
      ],
    })),
  };
}

// Convert frontend rubric to database format for saving
export function mapRubricToDatabaseFormat(rubric: Rubric) {
  return {
    rubric: {
      name: rubric.name,
      total_points: rubric.totalPoints,
      notes: rubric.notes,
      is_template: rubric.isTemplate,
      class_id: rubric.classId,
      assignment_id: rubric.assignmentId,
    },
    categories: rubric.criteria.map((criterion, index) => ({
      name: criterion.name,
      description: criterion.description,
      max_score: criterion.maxScore,
      weight: criterion.weight,
      sort_order: index,
      criteria_excellent: criterion.levels.find(l => l.level === 4)?.teacherDescription || "",
      criteria_good: criterion.levels.find(l => l.level === 3)?.teacherDescription || "",
      criteria_developing: criterion.levels.find(l => l.level === 2)?.teacherDescription || "",
      criteria_needs_improvement: criterion.levels.find(l => l.level === 1)?.teacherDescription || "",
      student_criteria_excellent: criterion.levels.find(l => l.level === 4)?.studentDescription || "",
      student_criteria_good: criterion.levels.find(l => l.level === 3)?.studentDescription || "",
      student_criteria_developing: criterion.levels.find(l => l.level === 2)?.studentDescription || "",
      student_criteria_needs_improvement: criterion.levels.find(l => l.level === 1)?.studentDescription || "",
    })),
  };
}

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DimensionScore {
  dimension: string;
  level: string;
  points: number;
  max_points: number;
  teacher_rationale: string;
  student_feedback: string;
}

export interface AIGradeResult {
  per_dimension_scores: DimensionScore[];
  overall: {
    total_points: number;
    max_points: number;
    percent: number;
    summary_for_teacher: string;
    summary_for_student: string;
  };
}

interface GradeSubmissionParams {
  submissionId: string;
  subject: string;
  gradeLevel: string;
  taskType: string;
  taskPrompt: string;
  rubricText: string;
  markScheme?: string;
  maxPoints: number;
}

interface UseAIGradingOptions {
  onSuccess?: (result: AIGradeResult) => void;
  onError?: (error: Error) => void;
}

export function useAIGrading(options: UseAIGradingOptions = {}) {
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState<AIGradeResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const gradeSubmission = useCallback(
    async (params: GradeSubmissionParams) => {
      setIsGrading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("grade-submission", {
          body: params,
        });

        if (fnError) throw fnError;
        if (data?.error) throw new Error(data.error);

        const result = data as AIGradeResult;
        setGradingResult(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown grading error");
        setError(error);
        options.onError?.(error);
        toast.error(error.message);
        return null;
      } finally {
        setIsGrading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setGradingResult(null);
    setError(null);
  }, []);

  return {
    gradeSubmission,
    isGrading,
    gradingResult,
    error,
    reset,
  };
}

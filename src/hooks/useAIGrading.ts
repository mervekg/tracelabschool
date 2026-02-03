import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Rubric, AIGradingResult } from "@/components/rubric/RubricTypes";
import { toast } from "sonner";

interface UseAIGradingOptions {
  onSuccess?: (result: AIGradingResult) => void;
  onError?: (error: Error) => void;
}

export function useAIGrading(options: UseAIGradingOptions = {}) {
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState<AIGradingResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const gradeSubmission = useCallback(
    async ({
      submissionId,
      studentContent,
      rubric,
      gradeLevel,
      subject,
    }: {
      submissionId?: string;
      studentContent: string;
      rubric: Rubric;
      gradeLevel: string;
      subject: string;
    }) => {
      setIsGrading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke("grade-submission", {
          body: {
            submissionId,
            studentContent,
            rubric,
            gradeLevel,
            subject,
          },
        });

        if (fnError) throw fnError;

        setGradingResult(data);
        options.onSuccess?.(data);
        return data;
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

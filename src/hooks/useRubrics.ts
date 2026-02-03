import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mapDatabaseRubricToRubric, mapRubricToDatabaseFormat, type Rubric } from "@/components/rubric/RubricTypes";
import { toast } from "sonner";

interface UseRubricsOptions {
  classId?: string;
  assignmentId?: string;
  includeTemplates?: boolean;
}

export function useRubrics(options: UseRubricsOptions = {}) {
  const { classId, assignmentId, includeTemplates = true } = options;
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRubrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from("rubrics").select("*");

      // Build filter conditions
      const conditions: string[] = [];
      if (classId) conditions.push(`class_id.eq.${classId}`);
      if (assignmentId) conditions.push(`assignment_id.eq.${assignmentId}`);
      if (includeTemplates) conditions.push("is_template.eq.true");

      if (conditions.length > 0) {
        query = query.or(conditions.join(","));
      }

      const { data: rubricData, error: rubricError } = await query.order("created_at", { ascending: false });

      if (rubricError) throw rubricError;

      // Fetch categories for each rubric
      const rubricsWithCategories = await Promise.all(
        (rubricData || []).map(async (rubric) => {
          const { data: categories } = await supabase
            .from("rubric_categories")
            .select("*")
            .eq("rubric_id", rubric.id)
            .order("sort_order");

          return mapDatabaseRubricToRubric(rubric, categories || []);
        })
      );

      setRubrics(rubricsWithCategories);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch rubrics");
      setError(error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [classId, assignmentId, includeTemplates]);

  const fetchRubricById = useCallback(async (rubricId: string): Promise<Rubric | null> => {
    try {
      const { data: rubric, error: rubricError } = await supabase
        .from("rubrics")
        .select("*")
        .eq("id", rubricId)
        .single();

      if (rubricError) throw rubricError;

      const { data: categories } = await supabase
        .from("rubric_categories")
        .select("*")
        .eq("rubric_id", rubric.id)
        .order("sort_order");

      return mapDatabaseRubricToRubric(rubric, categories || []);
    } catch (err) {
      console.error("Error fetching rubric:", err);
      return null;
    }
  }, []);

  const saveRubric = useCallback(async (rubric: Rubric): Promise<Rubric | null> => {
    try {
      const { rubric: rubricData, categories } = mapRubricToDatabaseFormat(rubric);

      // Insert or update rubric
      const { data: savedRubric, error: rubricError } = rubric.id
        ? await supabase
            .from("rubrics")
            .update({ ...rubricData, updated_at: new Date().toISOString() })
            .eq("id", rubric.id)
            .select()
            .single()
        : await supabase.from("rubrics").insert(rubricData).select().single();

      if (rubricError) throw rubricError;

      // Delete existing categories and insert new ones
      if (rubric.id) {
        await supabase.from("rubric_categories").delete().eq("rubric_id", rubric.id);
      }

      const { error: categoriesError } = await supabase.from("rubric_categories").insert(
        categories.map((cat) => ({
          ...cat,
          rubric_id: savedRubric.id,
        }))
      );

      if (categoriesError) throw categoriesError;

      toast.success("Rubric saved successfully");
      
      // Refetch to get updated data
      await fetchRubrics();
      
      return await fetchRubricById(savedRubric.id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to save rubric");
      toast.error(error.message);
      return null;
    }
  }, [fetchRubrics, fetchRubricById]);

  const deleteRubric = useCallback(async (rubricId: string): Promise<boolean> => {
    try {
      // Delete categories first
      await supabase.from("rubric_categories").delete().eq("rubric_id", rubricId);

      // Delete rubric
      const { error } = await supabase.from("rubrics").delete().eq("id", rubricId);

      if (error) throw error;

      toast.success("Rubric deleted");
      await fetchRubrics();
      return true;
    } catch (err) {
      toast.error("Failed to delete rubric");
      return false;
    }
  }, [fetchRubrics]);

  useEffect(() => {
    if (classId || assignmentId || includeTemplates) {
      fetchRubrics();
    }
  }, [fetchRubrics]);

  return {
    rubrics,
    isLoading,
    error,
    fetchRubrics,
    fetchRubricById,
    saveRubric,
    deleteRubric,
  };
}

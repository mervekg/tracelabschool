-- Add student-facing descriptions and weights to rubric_categories
ALTER TABLE public.rubric_categories 
ADD COLUMN IF NOT EXISTS student_criteria_excellent text,
ADD COLUMN IF NOT EXISTS student_criteria_good text,
ADD COLUMN IF NOT EXISTS student_criteria_developing text,
ADD COLUMN IF NOT EXISTS student_criteria_needs_improvement text,
ADD COLUMN IF NOT EXISTS weight numeric DEFAULT 1.0;

-- Add comment for clarity
COMMENT ON COLUMN public.rubric_categories.criteria_excellent IS 'Teacher/AI view - detailed description';
COMMENT ON COLUMN public.rubric_categories.student_criteria_excellent IS 'Student view - simplified description';
COMMENT ON COLUMN public.rubric_categories.weight IS 'Weighting factor for grading calculations';

-- Add rubric_id column to assignments table to link assignments to rubrics
ALTER TABLE public.assignments
ADD COLUMN IF NOT EXISTS rubric_id uuid REFERENCES public.rubrics(id);

-- Add AI grading results to student_submissions
ALTER TABLE public.student_submissions
ADD COLUMN IF NOT EXISTS ai_scores jsonb,
ADD COLUMN IF NOT EXISTS overall_grade numeric,
ADD COLUMN IF NOT EXISTS grading_completed_at timestamp with time zone;

-- Create index for faster rubric lookups on assignments
CREATE INDEX IF NOT EXISTS idx_assignments_rubric_id ON public.assignments(rubric_id);
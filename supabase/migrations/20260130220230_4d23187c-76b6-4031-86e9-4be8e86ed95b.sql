-- Create rubrics table
CREATE TABLE public.rubrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 100,
  notes TEXT,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rubric categories table
CREATE TABLE public.rubric_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rubric_id UUID NOT NULL REFERENCES public.rubrics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  max_score INTEGER NOT NULL DEFAULT 25,
  description TEXT,
  criteria_excellent TEXT,
  criteria_good TEXT,
  criteria_developing TEXT,
  criteria_needs_improvement TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create class skills/TEKs table
CREATE TABLE public.class_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  skill_code TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubric_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_skills ENABLE ROW LEVEL SECURITY;

-- Rubrics policies (teachers can manage rubrics for their assignments/classes)
CREATE POLICY "Teachers can view rubrics for their classes"
  ON public.rubrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = rubrics.class_id AND classes.teacher_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM assignments 
      JOIN classes ON classes.id = assignments.class_id 
      WHERE assignments.id = rubrics.assignment_id AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can create rubrics for their classes"
  ON public.rubrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = rubrics.class_id AND classes.teacher_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM assignments 
      JOIN classes ON classes.id = assignments.class_id 
      WHERE assignments.id = rubrics.assignment_id AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update rubrics for their classes"
  ON public.rubrics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = rubrics.class_id AND classes.teacher_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM assignments 
      JOIN classes ON classes.id = assignments.class_id 
      WHERE assignments.id = rubrics.assignment_id AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete rubrics for their classes"
  ON public.rubrics FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM classes WHERE classes.id = rubrics.class_id AND classes.teacher_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM assignments 
      JOIN classes ON classes.id = assignments.class_id 
      WHERE assignments.id = rubrics.assignment_id AND classes.teacher_id = auth.uid()
    )
  );

-- Rubric categories policies
CREATE POLICY "Teachers can view rubric categories"
  ON public.rubric_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rubrics
      LEFT JOIN classes ON classes.id = rubrics.class_id
      LEFT JOIN assignments ON assignments.id = rubrics.assignment_id
      LEFT JOIN classes c2 ON c2.id = assignments.class_id
      WHERE rubrics.id = rubric_categories.rubric_id 
        AND (classes.teacher_id = auth.uid() OR c2.teacher_id = auth.uid())
    )
  );

CREATE POLICY "Teachers can manage rubric categories"
  ON public.rubric_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM rubrics
      LEFT JOIN classes ON classes.id = rubrics.class_id
      LEFT JOIN assignments ON assignments.id = rubrics.assignment_id
      LEFT JOIN classes c2 ON c2.id = assignments.class_id
      WHERE rubrics.id = rubric_categories.rubric_id 
        AND (classes.teacher_id = auth.uid() OR c2.teacher_id = auth.uid())
    )
  );

-- Class skills policies
CREATE POLICY "Teachers can view skills for their classes"
  ON public.class_skills FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_skills.class_id AND classes.teacher_id = auth.uid())
  );

CREATE POLICY "Teachers can create skills for their classes"
  ON public.class_skills FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_skills.class_id AND classes.teacher_id = auth.uid())
  );

CREATE POLICY "Teachers can update skills for their classes"
  ON public.class_skills FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_skills.class_id AND classes.teacher_id = auth.uid())
  );

CREATE POLICY "Teachers can delete skills for their classes"
  ON public.class_skills FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_skills.class_id AND classes.teacher_id = auth.uid())
  );

-- Add trigger for updated_at
CREATE TRIGGER update_rubrics_updated_at
  BEFORE UPDATE ON public.rubrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student submissions table
CREATE TABLE public.student_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  content TEXT,
  handwriting_image_url TEXT,
  ai_feedback TEXT,
  teacher_feedback TEXT,
  score NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for assignments
CREATE POLICY "Teachers can view assignments in their classes"
ON public.assignments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.teacher_id = auth.uid()
));

CREATE POLICY "Teachers can create assignments in their classes"
ON public.assignments FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.teacher_id = auth.uid()
));

CREATE POLICY "Teachers can update assignments in their classes"
ON public.assignments FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.teacher_id = auth.uid()
));

CREATE POLICY "Teachers can delete assignments in their classes"
ON public.assignments FOR DELETE
USING (EXISTS (
  SELECT 1 FROM classes WHERE classes.id = assignments.class_id AND classes.teacher_id = auth.uid()
));

-- RLS policies for student submissions
CREATE POLICY "Teachers can view submissions in their classes"
ON public.student_submissions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM assignments
  JOIN classes ON classes.id = assignments.class_id
  WHERE assignments.id = student_submissions.assignment_id AND classes.teacher_id = auth.uid()
));

CREATE POLICY "Teachers can update submissions in their classes"
ON public.student_submissions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM assignments
  JOIN classes ON classes.id = assignments.class_id
  WHERE assignments.id = student_submissions.assignment_id AND classes.teacher_id = auth.uid()
));

-- Triggers for updated_at
CREATE TRIGGER update_assignments_updated_at
BEFORE UPDATE ON public.assignments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_submissions_updated_at
BEFORE UPDATE ON public.student_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

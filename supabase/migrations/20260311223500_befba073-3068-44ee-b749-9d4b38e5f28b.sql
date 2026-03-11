CREATE POLICY "Students can view assignments in their classes"
ON public.assignments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.students
    WHERE students.class_id = assignments.class_id
      AND students.user_id = auth.uid()
      AND students.status = 'active'
  )
);
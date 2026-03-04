-- Add missing RLS policies: students can insert and view their own submissions
CREATE POLICY "Students can insert their own submissions"
ON public.student_submissions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM students
    WHERE students.id = student_submissions.student_id
      AND students.user_id = auth.uid()
  )
);

CREATE POLICY "Students can view their own submissions"
ON public.student_submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM students
    WHERE students.id = student_submissions.student_id
      AND students.user_id = auth.uid()
  )
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON public.student_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.student_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.student_submissions(status);
CREATE INDEX IF NOT EXISTS idx_notifications_student_unread ON public.notifications(student_id, read) WHERE read = false
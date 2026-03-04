
-- Add response_text and file_url columns to student_submissions
ALTER TABLE public.student_submissions 
  ADD COLUMN IF NOT EXISTS response_text text,
  ADD COLUMN IF NOT EXISTS file_url text,
  ADD COLUMN IF NOT EXISTS ai_grade_json jsonb;

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  assignment_id uuid REFERENCES public.assignments(id) ON DELETE SET NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Students can only view their own notifications (via user_id on students table)
CREATE POLICY "Students can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.id = notifications.student_id
        AND students.user_id = auth.uid()
    )
  );

-- Students can update (mark as read) their own notifications
CREATE POLICY "Students can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.id = notifications.student_id
        AND students.user_id = auth.uid()
    )
  );

-- Teachers can insert notifications for students in their classes
CREATE POLICY "Teachers can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students
      JOIN public.classes ON classes.id = students.class_id
      WHERE students.id = notifications.student_id
        AND classes.teacher_id = auth.uid()
    )
  );

-- Service role / edge functions can also insert (via service role key)
-- Index for fast lookups
CREATE INDEX idx_notifications_student_id ON public.notifications(student_id);
CREATE INDEX idx_notifications_read ON public.notifications(student_id, read);
CREATE INDEX idx_student_submissions_response_text ON public.student_submissions(id) WHERE response_text IS NOT NULL;

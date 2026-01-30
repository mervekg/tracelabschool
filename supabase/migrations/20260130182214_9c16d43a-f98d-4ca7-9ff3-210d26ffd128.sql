-- Create students table for class enrollment
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  UNIQUE(class_id, email)
);

-- Create class join codes table
CREATE TABLE public.class_join_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create parents table for contact management
CREATE TABLE public.parents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID,
  recipient_email TEXT,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_email_sent BOOLEAN NOT NULL DEFAULT false,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_join_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Students policies
CREATE POLICY "Teachers can view students in their classes"
ON public.students FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = students.class_id
    AND classes.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can add students to their classes"
ON public.students FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = students.class_id
    AND classes.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update students in their classes"
ON public.students FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = students.class_id
    AND classes.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can delete students from their classes"
ON public.students FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = students.class_id
    AND classes.teacher_id = auth.uid()
  )
);

-- Join codes policies
CREATE POLICY "Teachers can view join codes for their classes"
ON public.class_join_codes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = class_join_codes.class_id
    AND classes.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can create join codes for their classes"
ON public.class_join_codes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = class_join_codes.class_id
    AND classes.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update join codes for their classes"
ON public.class_join_codes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = class_join_codes.class_id
    AND classes.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can delete join codes for their classes"
ON public.class_join_codes FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = class_join_codes.class_id
    AND classes.teacher_id = auth.uid()
  )
);

-- Parents policies
CREATE POLICY "Teachers can view parents in their classes"
ON public.parents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = parents.class_id
    AND classes.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can add parents to their classes"
ON public.parents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = parents.class_id
    AND classes.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update parents in their classes"
ON public.parents FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = parents.class_id
    AND classes.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can delete parents from their classes"
ON public.parents FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.classes
    WHERE classes.id = parents.class_id
    AND classes.teacher_id = auth.uid()
  )
);

-- Messages policies
CREATE POLICY "Users can view their own messages"
ON public.messages FOR SELECT
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_parents_updated_at
  BEFORE UPDATE ON public.parents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
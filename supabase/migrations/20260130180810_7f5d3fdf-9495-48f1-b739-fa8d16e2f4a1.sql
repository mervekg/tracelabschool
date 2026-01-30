-- Create teacher_profiles table for additional teacher information
CREATE TABLE public.teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  custom_subject TEXT,
  grade_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for teacher_profiles
CREATE POLICY "Teachers can view their own profile"
ON public.teacher_profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can insert their own profile"
ON public.teacher_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can update their own profile"
ON public.teacher_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  section TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  thumbnail_url TEXT,
  color TEXT DEFAULT '#6366f1',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- RLS policies for classes
CREATE POLICY "Teachers can view their own classes"
ON public.classes
FOR SELECT
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can create classes"
ON public.classes
FOR INSERT
WITH CHECK (auth.uid() = teacher_id AND public.has_role(auth.uid(), 'teacher'));

CREATE POLICY "Teachers can update their own classes"
ON public.classes
FOR UPDATE
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own classes"
ON public.classes
FOR DELETE
USING (auth.uid() = teacher_id);

-- Trigger for updated_at on teacher_profiles
CREATE TRIGGER update_teacher_profiles_updated_at
BEFORE UPDATE ON public.teacher_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on classes
CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
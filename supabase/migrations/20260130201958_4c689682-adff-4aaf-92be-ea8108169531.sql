-- Add columns to assignments for PDF and external links
ALTER TABLE public.assignments 
ADD COLUMN pdf_url text,
ADD COLUMN external_link text,
ADD COLUMN assignment_type text DEFAULT 'standard';

-- Create storage bucket for assignment PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignments', 'assignments', true);

-- Storage policies for assignment files
CREATE POLICY "Teachers can upload assignment files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assignments' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

CREATE POLICY "Anyone can view assignment files"
ON storage.objects FOR SELECT
USING (bucket_id = 'assignments');

CREATE POLICY "Teachers can delete their assignment files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'assignments' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

-- Create storage bucket for student submissions (for downloadable PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('submissions', 'submissions', false);

-- Storage policies for submissions
CREATE POLICY "Teachers can view submissions in their classes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'submissions'
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

CREATE POLICY "Students can upload their submissions"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'submissions'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
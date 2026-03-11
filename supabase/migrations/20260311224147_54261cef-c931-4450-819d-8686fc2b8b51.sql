
-- 1. Fix has_role: Add caller validation so non-admins can only check their own roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow checking own roles, unless caller is admin
  IF _user_id != auth.uid() THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
      RETURN false;
    END IF;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- 2. Make assignments bucket private
UPDATE storage.buckets SET public = false WHERE id = 'assignments';

-- 3. Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view assignment files" ON storage.objects;

-- 4. Teachers can view all assignment files
CREATE POLICY "Teachers can view assignment files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'assignments'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'teacher'
  )
);

-- 5. Students can view assignment files for their enrolled classes
CREATE POLICY "Students can view their class assignment files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'assignments'
  AND EXISTS (
    SELECT 1 FROM public.students s
    JOIN public.classes c ON c.id = s.class_id
    JOIN public.assignments a ON a.class_id = c.id
    WHERE s.user_id = auth.uid()
    AND s.status = 'active'
    AND a.pdf_url LIKE '%' || storage.objects.name || '%'
  )
);

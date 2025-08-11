
-- Drop the existing policy that allows all authenticated users to view waitlist
DROP POLICY IF EXISTS "Allow authenticated users to view waitlist" ON public.waitlist;

-- Create a new policy that only allows admin users to view waitlist entries
CREATE POLICY "Only admin users can view waitlist" 
ON public.waitlist 
FOR SELECT 
TO authenticated 
USING (public.is_admin_user());

-- Also restrict UPDATE and DELETE operations to admin users only
-- (currently these are blocked, but let's make it explicit)
CREATE POLICY "Only admin users can update waitlist" 
ON public.waitlist 
FOR UPDATE 
TO authenticated 
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Only admin users can delete waitlist" 
ON public.waitlist 
FOR DELETE 
TO authenticated 
USING (public.is_admin_user());

-- Keep the existing INSERT policy for public signups unchanged
-- "Allow public waitlist signups" policy remains as is

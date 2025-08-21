
-- Ensure RLS is enabled on user_activity table
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to recreate them cleanly
DROP POLICY IF EXISTS "Users can view their own user activity" ON public.user_activity;
DROP POLICY IF EXISTS "Users can insert their own user activity" ON public.user_activity;

-- Create secure RLS policies for user_activity table
CREATE POLICY "Users can view own user activity"
ON public.user_activity
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own user activity"
ON public.user_activity
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Explicitly deny all access to anonymous users
CREATE POLICY "Deny anonymous access to user activity"
ON public.user_activity
FOR ALL
TO anon
USING (false);

-- Verify no public access exists
REVOKE ALL ON public.user_activity FROM anon;
REVOKE ALL ON public.user_activity FROM public;

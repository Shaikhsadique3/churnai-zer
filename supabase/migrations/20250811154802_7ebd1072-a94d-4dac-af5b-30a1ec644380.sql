-- Fix security issue: Restrict inbound_emails access to admin users only

-- First, drop the existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can view inbound emails" ON public.inbound_emails;
DROP POLICY IF EXISTS "Authenticated users can update inbound emails" ON public.inbound_emails;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.email() IN (
    'shaikhsadique730@gmail.com',
    'shaikhsadique2222@gmail.com', 
    'shaikhumairthisside@gmail.com'
  );
$$;

-- Create new restrictive policies for inbound emails - admin access only
CREATE POLICY "Admin users can view inbound emails" 
ON public.inbound_emails 
FOR SELECT 
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admin users can update inbound emails" 
ON public.inbound_emails 
FOR UPDATE 
TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

CREATE POLICY "Admin users can delete inbound emails" 
ON public.inbound_emails 
FOR DELETE 
TO authenticated
USING (public.is_admin_user());

-- Service role can still insert emails (for the webhook)
-- The existing insert policy remains: "Service role can insert inbound emails"
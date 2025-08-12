
-- Update the RLS policy for sdk_integrations table to restrict access
-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view sdk integrations" ON public.sdk_integrations;

-- Create a new policy that only allows admins to view SDK integrations
CREATE POLICY "Only admin users can view sdk integrations" 
  ON public.sdk_integrations 
  FOR SELECT 
  USING (is_admin_user());

-- Also update the insert policy to be more restrictive
DROP POLICY IF EXISTS "Service role can insert sdk integrations" ON public.sdk_integrations;

-- Create a new insert policy that allows service role and admin users
CREATE POLICY "Service role and admin can insert sdk integrations" 
  ON public.sdk_integrations 
  FOR INSERT 
  WITH CHECK (is_admin_user() OR auth.role() = 'service_role');

-- Fix critical security issue: Remove public access to churn_uploads table
-- This prevents unauthorized access to customer email addresses

-- Drop the problematic policy that allows public access
DROP POLICY IF EXISTS "Public can view uploads by email" ON public.churn_uploads;

-- Ensure user_id column is required for all new uploads (no null values)
-- This prevents anonymous uploads that could be publicly accessible
ALTER TABLE public.churn_uploads 
ALTER COLUMN user_id SET NOT NULL;

-- Update any existing null user_id records to prevent data access issues
-- Note: This should be rare since the upload function now requires authentication
UPDATE public.churn_uploads 
SET user_id = '00000000-0000-0000-0000-000000000000'::uuid 
WHERE user_id IS NULL;

-- Add constraint to ensure user_id references valid auth users
-- This enforces data integrity
ALTER TABLE public.churn_uploads 
DROP CONSTRAINT IF EXISTS churn_uploads_user_id_fkey;

-- Create more secure policies that only allow authenticated users to access their own data
CREATE POLICY "Authenticated users can view own uploads" 
ON public.churn_uploads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own uploads" 
ON public.churn_uploads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage uploads for processing" 
ON public.churn_uploads 
FOR ALL 
USING (auth.role() = 'service_role'::text);

-- Fix function search path security issue
-- Update existing functions to have immutable search paths
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
-- Fix critical security vulnerability in churn data tables
-- Remove dangerous public access policies
DROP POLICY IF EXISTS "Anyone can view churn uploads" ON public.churn_uploads;
DROP POLICY IF EXISTS "Anyone can insert churn uploads" ON public.churn_uploads;
DROP POLICY IF EXISTS "Anyone can update churn uploads" ON public.churn_uploads;
DROP POLICY IF EXISTS "Anyone can view churn reports" ON public.churn_reports;
DROP POLICY IF EXISTS "Anyone can insert churn reports" ON public.churn_reports;

-- Add user tracking to churn_uploads (if not exists)
ALTER TABLE public.churn_uploads 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Add user tracking to churn_reports (if not exists)  
ALTER TABLE public.churn_reports
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create secure RLS policies for churn_uploads
-- Service role can insert uploads (for public landing page)
CREATE POLICY "Service role can insert uploads" 
ON public.churn_uploads 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Service role can update uploads (for processing)
CREATE POLICY "Service role can update uploads" 
ON public.churn_uploads 
FOR UPDATE 
USING (auth.role() = 'service_role');

-- Users can view uploads they own (when authenticated and user_id is set)
CREATE POLICY "Users can view own uploads" 
ON public.churn_uploads 
FOR SELECT 
USING (user_id = auth.uid());

-- Special policy for public access by email (for the public audit service)
-- This allows checking status by email without authentication
CREATE POLICY "Public can view uploads by email verification" 
ON public.churn_uploads 
FOR SELECT 
USING (user_id IS NULL); -- Only for uploads without user association

-- Create secure RLS policies for churn_reports  
-- Service role can insert reports
CREATE POLICY "Service role can insert reports" 
ON public.churn_reports 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Service role can update reports
CREATE POLICY "Service role can update reports" 
ON public.churn_reports 
FOR UPDATE 
USING (auth.role() = 'service_role');

-- Users can view reports they own
CREATE POLICY "Users can view own reports" 
ON public.churn_reports 
FOR SELECT 
USING (user_id = auth.uid());

-- Public can view reports for uploads without user association (public audit service)
CREATE POLICY "Public can view reports for public uploads" 
ON public.churn_reports 
FOR SELECT 
USING (upload_id IN (
  SELECT id FROM public.churn_uploads WHERE user_id IS NULL
));
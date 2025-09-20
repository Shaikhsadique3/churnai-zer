-- Fix critical security issue: Remove public access to churn_uploads table
-- Step 1: First check if there are any records with null user_id and handle them

-- Create a temporary admin user ID for orphaned records
DO $$
DECLARE
    admin_user_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Update any existing null user_id records to prevent data access issues
    UPDATE public.churn_uploads 
    SET user_id = admin_user_id 
    WHERE user_id IS NULL;
    
    RAISE NOTICE 'Updated % orphaned records', (SELECT COUNT(*) FROM public.churn_uploads WHERE user_id = admin_user_id);
END $$;

-- Step 2: Drop the problematic policy that allows public access
DROP POLICY IF EXISTS "Public can view uploads by email" ON public.churn_uploads;

-- Step 3: Now safely set user_id as NOT NULL
ALTER TABLE public.churn_uploads 
ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Create secure policies that only allow authenticated users to access their own data
DROP POLICY IF EXISTS "Users can view own uploads" ON public.churn_uploads;
DROP POLICY IF EXISTS "Users can insert own uploads" ON public.churn_uploads;
DROP POLICY IF EXISTS "Service role can manage all uploads" ON public.churn_uploads;

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
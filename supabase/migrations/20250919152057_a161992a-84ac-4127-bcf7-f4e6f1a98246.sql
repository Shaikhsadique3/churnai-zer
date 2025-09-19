-- Ensure churn_uploads table has user_id column and proper RLS policies
DO $$ 
BEGIN
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'churn_uploads' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.churn_uploads ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Update RLS policies for churn_uploads
DROP POLICY IF EXISTS "Public can view uploads by email verification" ON public.churn_uploads;
DROP POLICY IF EXISTS "Service role can insert uploads" ON public.churn_uploads;
DROP POLICY IF EXISTS "Service role can update uploads" ON public.churn_uploads;
DROP POLICY IF EXISTS "Users can view own uploads" ON public.churn_uploads;

-- Create new RLS policies
CREATE POLICY "Users can view own uploads" ON public.churn_uploads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads" ON public.churn_uploads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all uploads" ON public.churn_uploads
    FOR ALL USING (auth.role() = 'service_role');

-- Public access for non-authenticated uploads (needed for the upload flow)
CREATE POLICY "Public can view uploads by email" ON public.churn_uploads
    FOR SELECT USING (user_id IS NULL);
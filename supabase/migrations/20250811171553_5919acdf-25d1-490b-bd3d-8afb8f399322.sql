
-- Add a new column for encrypted API keys
ALTER TABLE public.integration_test_results 
ADD COLUMN encrypted_api_key text;

-- Update existing records to encrypt the API keys using the existing encryption function
UPDATE public.integration_test_results 
SET encrypted_api_key = public.encrypt_sensitive_data(api_key)
WHERE api_key IS NOT NULL;

-- Drop the plain text API key column (after data migration)
ALTER TABLE public.integration_test_results 
DROP COLUMN api_key;

-- Rename the encrypted column to api_key for backward compatibility
ALTER TABLE public.integration_test_results 
RENAME COLUMN encrypted_api_key TO api_key;

-- Update the RLS policies to be more restrictive (founder_id should match auth.uid())
DROP POLICY IF EXISTS "Users can insert their own integration test results" ON public.integration_test_results;
DROP POLICY IF EXISTS "Users can view their own integration test results" ON public.integration_test_results;

-- Create new restrictive policies
CREATE POLICY "Users can insert their own integration test results" 
ON public.integration_test_results 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Users can view their own integration test results" 
ON public.integration_test_results 
FOR SELECT 
TO authenticated 
USING (auth.uid() = founder_id);

-- Add policy for updates (in case needed)
CREATE POLICY "Users can update their own integration test results" 
ON public.integration_test_results 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = founder_id)
WITH CHECK (auth.uid() = founder_id);

-- Create index for better performance on founder_id queries
CREATE INDEX IF NOT EXISTS idx_integration_test_results_founder_id ON public.integration_test_results(founder_id);

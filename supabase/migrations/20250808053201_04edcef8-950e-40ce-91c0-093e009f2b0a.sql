-- Create table to store integration test results
CREATE TABLE IF NOT EXISTS public.integration_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL,
  domain TEXT NOT NULL,
  api_key TEXT NOT NULL,
  churn_score NUMERIC,
  risk_level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.integration_test_results ENABLE ROW LEVEL SECURITY;

-- Policies: only owners can insert/select their own results
CREATE POLICY "Users can insert their own integration test results"
ON public.integration_test_results
FOR INSERT
WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Users can view their own integration test results"
ON public.integration_test_results
FOR SELECT
USING (auth.uid() = founder_id);

-- Update updated_at automatically
CREATE TRIGGER update_integration_test_results_updated_at
BEFORE UPDATE ON public.integration_test_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_integration_results_founder ON public.integration_test_results (founder_id);
CREATE INDEX IF NOT EXISTS idx_integration_results_created_at ON public.integration_test_results (created_at DESC);

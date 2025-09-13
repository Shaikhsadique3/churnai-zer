-- Create churn_reports table for storing generated reports
CREATE TABLE IF NOT EXISTS public.churn_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  analysis_id UUID REFERENCES public.churn_analysis_results(id),
  upload_id UUID, -- Reference to churn_uploads
  report_name TEXT NOT NULL,
  pdf_file_path TEXT NOT NULL,
  report_url TEXT,
  ai_insights TEXT,
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'generating',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on churn_reports
ALTER TABLE public.churn_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for churn_reports
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

-- Public can view reports for public uploads (churn audit service)
CREATE POLICY "Public can view reports for public uploads" 
ON public.churn_reports 
FOR SELECT 
USING (upload_id IN (
  SELECT id FROM public.churn_uploads WHERE user_id IS NULL
));

-- Create churn_payments table for tracking full report purchases
CREATE TABLE IF NOT EXISTS public.churn_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID NOT NULL REFERENCES public.churn_uploads(id),
  email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 99.00,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_provider TEXT NOT NULL DEFAULT 'stripe',
  payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'created', -- created, processing, paid, failed, cancelled
  checkout_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on churn_payments
ALTER TABLE public.churn_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for churn_payments
-- Service role can manage payments
CREATE POLICY "Service role can insert payments" 
ON public.churn_payments 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update payments" 
ON public.churn_payments 
FOR UPDATE 
USING (auth.role() = 'service_role');

-- Public can view payments for their upload by email
CREATE POLICY "Public can view payments by upload" 
ON public.churn_payments 
FOR SELECT 
USING (upload_id IN (
  SELECT id FROM public.churn_uploads WHERE user_id IS NULL
));
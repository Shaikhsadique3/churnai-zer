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
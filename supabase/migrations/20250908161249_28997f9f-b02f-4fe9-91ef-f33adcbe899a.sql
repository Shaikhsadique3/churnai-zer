-- Fix security vulnerability in churn_payments table
-- Remove overly permissive policies
DROP POLICY IF EXISTS "Anyone can view churn payments" ON public.churn_payments;
DROP POLICY IF EXISTS "Anyone can insert churn payments" ON public.churn_payments;
DROP POLICY IF EXISTS "Anyone can update churn payments" ON public.churn_payments;

-- Add user_id column to track payment ownership
ALTER TABLE public.churn_payments 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create secure RLS policies
-- Only service role can insert payments (for webhook processing)
CREATE POLICY "Service role can insert payments" 
ON public.churn_payments 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Users can only view their own payments  
CREATE POLICY "Users can view own payments" 
ON public.churn_payments 
FOR SELECT 
USING (user_id = auth.uid());

-- Only service role can update payment status (for webhook processing)
CREATE POLICY "Service role can update payments" 
ON public.churn_payments 
FOR UPDATE 
USING (auth.role() = 'service_role');

-- Create integrations table for tracking SDK integration checks
CREATE TABLE public.integrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website text NOT NULL,
  user_id text NOT NULL,
  api_key text NOT NULL,
  founder_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'fail')),
  checked_at timestamp with time zone NOT NULL DEFAULT now(),
  error_message text,
  trace_id uuid DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Founders can view their own integrations" 
  ON public.integrations 
  FOR SELECT 
  USING (auth.uid() = founder_id);

CREATE POLICY "Allow insertion of integration checks" 
  ON public.integrations 
  FOR INSERT 
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_integrations_founder_id ON public.integrations(founder_id);
CREATE INDEX idx_integrations_website ON public.integrations(website);
CREATE INDEX idx_integrations_checked_at ON public.integrations(checked_at DESC);

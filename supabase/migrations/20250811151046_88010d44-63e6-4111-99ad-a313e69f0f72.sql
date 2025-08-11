
-- Create table for SDK integrations logging
CREATE TABLE IF NOT EXISTS public.sdk_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  website TEXT NOT NULL,
  user_id TEXT NOT NULL,
  trace_id UUID NOT NULL DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  api_key_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.sdk_integrations ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to insert records
CREATE POLICY "Service role can insert sdk integrations" 
  ON public.sdk_integrations 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for authenticated users to view their own integrations
CREATE POLICY "Users can view sdk integrations" 
  ON public.sdk_integrations 
  FOR SELECT 
  USING (true);

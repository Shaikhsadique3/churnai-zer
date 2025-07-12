-- Add CRM webhook fields to integration_settings table
ALTER TABLE public.integration_settings 
ADD COLUMN IF NOT EXISTS crm_webhook_url TEXT,
ADD COLUMN IF NOT EXISTS crm_api_key TEXT,
ADD COLUMN IF NOT EXISTS is_crm_connected BOOLEAN DEFAULT false;

-- Create crm_logs table for tracking webhook requests
CREATE TABLE public.crm_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  webhook_url TEXT NOT NULL,
  request_payload JSONB,
  response_status INTEGER,
  response_body TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_test BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.crm_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own CRM logs" 
ON public.crm_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own CRM logs" 
ON public.crm_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_crm_logs_user_id ON public.crm_logs(user_id);
CREATE INDEX idx_crm_logs_created_at ON public.crm_logs(created_at);
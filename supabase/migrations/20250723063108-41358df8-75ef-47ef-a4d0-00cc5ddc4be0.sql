-- Add webhook functionality to playbooks table
ALTER TABLE public.playbooks 
ADD COLUMN webhook_url TEXT,
ADD COLUMN webhook_enabled BOOLEAN DEFAULT false,
ADD COLUMN webhook_trigger_conditions JSONB DEFAULT '{"churn_score_threshold": 0.75}'::jsonb;

-- Add webhook logs table for tracking webhook calls
CREATE TABLE public.webhook_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  playbook_id UUID REFERENCES public.playbooks(id),
  webhook_url TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  target_user_id TEXT NOT NULL
);

-- Enable RLS on webhook_logs
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for webhook_logs
CREATE POLICY "Users can view their own webhook logs" 
ON public.webhook_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own webhook logs" 
ON public.webhook_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_webhook_logs_user_id ON public.webhook_logs(user_id);
CREATE INDEX idx_webhook_logs_triggered_at ON public.webhook_logs(triggered_at);
CREATE INDEX idx_playbooks_webhook_enabled ON public.playbooks(webhook_enabled) WHERE webhook_enabled = true;
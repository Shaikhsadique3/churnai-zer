-- Create email_logs table for tracking AI-generated emails
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  playbook_id UUID NULL,
  target_email TEXT NOT NULL,
  target_user_id TEXT NULL,
  template_id TEXT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT NULL,
  email_data JSONB NULL DEFAULT '{}'::jsonb,
  sent_at TIMESTAMP WITH TIME ZONE NULL,
  opened_at TIMESTAMP WITH TIME ZONE NULL,
  clicked_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- New fields for AI Email Campaigns
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  psychology_style TEXT NULL,
  ai_generated BOOLEAN DEFAULT true,
  scheduled_for TIMESTAMP WITH TIME ZONE NULL
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own email logs" 
ON public.email_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email logs" 
ON public.email_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email logs" 
ON public.email_logs 
FOR UPDATE 
USING (auth.uid() = user_id);
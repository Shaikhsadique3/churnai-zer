-- Create churn_trigger_logs table for tracking automated playbook triggers
CREATE TABLE IF NOT EXISTS public.churn_trigger_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_user_id text NOT NULL,
  playbook_name text NOT NULL DEFAULT 'Winback Sequence',
  churn_score numeric NOT NULL,
  trigger_reason text,
  action_taken text NOT NULL,
  triggered_at timestamp with time zone NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT true,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.churn_trigger_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for churn_trigger_logs
CREATE POLICY "Users can view their own churn trigger logs" 
ON public.churn_trigger_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own churn trigger logs" 
ON public.churn_trigger_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_churn_trigger_logs_user_id ON public.churn_trigger_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_churn_trigger_logs_triggered_at ON public.churn_trigger_logs(triggered_at);
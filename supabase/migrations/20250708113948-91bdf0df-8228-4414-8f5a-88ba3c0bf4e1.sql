-- Create playbook_logs table for tracking when playbooks are triggered
CREATE TABLE public.playbook_logs (
  log_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playbook_id UUID REFERENCES public.playbooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action_taken TEXT NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playbook_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for playbook_logs
CREATE POLICY "Users can view their own playbook logs" 
ON public.playbook_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_playbook_logs_user_id ON public.playbook_logs(user_id);
CREATE INDEX idx_playbook_logs_triggered_at ON public.playbook_logs(triggered_at DESC);
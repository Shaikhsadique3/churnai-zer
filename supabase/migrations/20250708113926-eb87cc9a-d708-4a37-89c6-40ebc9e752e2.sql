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

-- Set up cron job to run playbook processing every 6 hours
SELECT cron.schedule(
  'process-playbooks-every-6h',
  '0 */6 * * *', -- every 6 hours
  $$
  SELECT
    net.http_post(
        url:='https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1/process-playbooks',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Ymt5ZHBnamFzd213cnVlZ3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODg1MTEsImV4cCI6MjA1OTg2NDUxMX0.09ZDj0fLWEEh3oi0Bwcen_xr2Gyw2aAyCerGfMsHNfE"}'::jsonb,
        body:='{"time": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);

-- Set up cron job to run action execution every hour
SELECT cron.schedule(
  'execute-playbook-actions-hourly',
  '0 * * * *', -- every hour
  $$
  SELECT
    net.http_post(
        url:='https://ntbkydpgjaswmwruegyl.supabase.co/functions/v1/execute-playbook-actions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Ymt5ZHBnamFzd213cnVlZ3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyODg1MTEsImV4cCI6MjA1OTg2NDUxMX0.09ZDj0fLWEEh3oi0Bwcen_xr2Gyw2aAyCerGfMsHNfE"}'::jsonb,
        body:='{"time": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);
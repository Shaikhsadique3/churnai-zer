-- Create table for tracking SDK health and API pings
CREATE TABLE IF NOT EXISTS public.sdk_health_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  api_key_id UUID,
  ping_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_time_ms INTEGER,
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  request_data JSONB,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sdk_health_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for SDK health logs
CREATE POLICY "Users can view their own SDK health logs" 
ON public.sdk_health_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SDK health logs" 
ON public.sdk_health_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX idx_sdk_health_logs_user_id_timestamp ON public.sdk_health_logs(user_id, ping_timestamp DESC);
CREATE INDEX idx_sdk_health_logs_status ON public.sdk_health_logs(status);

-- Update user_data table to add source tracking if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_data' AND column_name = 'source') THEN
    ALTER TABLE public.user_data ADD COLUMN source TEXT DEFAULT 'manual';
  END IF;
END $$;
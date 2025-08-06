-- Create user_activity table for tracking user events
CREATE TABLE public.user_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  event TEXT NOT NULL,
  monthly_revenue NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- Create policies for user_activity
CREATE POLICY "Users can insert their own user activity" 
ON public.user_activity 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view their own user activity" 
ON public.user_activity 
FOR SELECT 
USING (auth.uid() = owner_id);

-- Create recovery_logs table
CREATE TABLE public.recovery_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  recovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recovery_reason TEXT NOT NULL,
  revenue_saved NUMERIC DEFAULT 0,
  owner_id UUID NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.recovery_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for recovery_logs
CREATE POLICY "Users can insert their own recovery logs" 
ON public.recovery_logs 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can view their own recovery logs" 
ON public.recovery_logs 
FOR SELECT 
USING (auth.uid() = owner_id);

-- Create status enum
CREATE TYPE user_prediction_status AS ENUM ('at_risk', 'recovered');

-- Add status column to user_data table
ALTER TABLE public.user_data 
ADD COLUMN status user_prediction_status DEFAULT 'at_risk',
ADD COLUMN recovered_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance
CREATE INDEX idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX idx_user_activity_event ON public.user_activity(event);
CREATE INDEX idx_recovery_logs_user_id ON public.recovery_logs(user_id);
CREATE INDEX idx_user_data_status ON public.user_data(status);
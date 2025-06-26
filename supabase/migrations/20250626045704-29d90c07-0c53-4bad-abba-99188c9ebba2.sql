
-- Create enum for risk levels
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');

-- Create enum for plan types
CREATE TYPE plan_type AS ENUM ('Free', 'Pro', 'Enterprise');

-- Create user_data table to store customer metrics and churn predictions
CREATE TABLE public.user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT NOT NULL,
  plan plan_type DEFAULT 'Free',
  usage INTEGER DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE,
  churn_score DECIMAL(3,2) DEFAULT 0.00,
  risk_level risk_level DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(owner_id, user_id)
);

-- Create api_keys table for authentication
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  key TEXT NOT NULL UNIQUE,
  name TEXT DEFAULT 'Default API Key',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create csv_uploads table for tracking uploads
CREATE TABLE public.csv_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  rows_processed INTEGER DEFAULT 0,
  rows_failed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create weekly_reports table for email tracking
CREATE TABLE public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_date DATE NOT NULL,
  high_risk_count INTEGER DEFAULT 0,
  medium_risk_count INTEGER DEFAULT 0,
  low_risk_count INTEGER DEFAULT 0,
  email_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csv_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_data
CREATE POLICY "Users can view their own user data" ON public.user_data
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own user data" ON public.user_data
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own user data" ON public.user_data
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own user data" ON public.user_data
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS policies for api_keys
CREATE POLICY "Users can view their own api keys" ON public.api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own api keys" ON public.api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own api keys" ON public.api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own api keys" ON public.api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for csv_uploads
CREATE POLICY "Users can view their own csv uploads" ON public.csv_uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own csv uploads" ON public.csv_uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for weekly_reports
CREATE POLICY "Users can view their own weekly reports" ON public.weekly_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly reports" ON public.weekly_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to generate API keys
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'cg_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to create default API key for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_api_key()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.api_keys (user_id, key, name)
  VALUES (NEW.id, generate_api_key(), 'Default API Key');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create API key for new users
CREATE TRIGGER on_auth_user_created_api_key
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_api_key();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_data updated_at
CREATE TRIGGER update_user_data_updated_at
  BEFORE UPDATE ON public.user_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

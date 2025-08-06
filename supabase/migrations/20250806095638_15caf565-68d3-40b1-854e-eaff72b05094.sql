-- Create founder_profile table for onboarding data
CREATE TABLE public.founder_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Company Details
  company_name TEXT NOT NULL,
  company_website TEXT,
  industry TEXT NOT NULL,
  company_size TEXT NOT NULL,
  founded_year INTEGER,
  location TEXT NOT NULL,
  
  -- Product & Revenue Model
  product_description TEXT NOT NULL,
  target_market TEXT NOT NULL,
  revenue_model TEXT NOT NULL,
  monthly_revenue NUMERIC DEFAULT 0,
  pricing_model TEXT NOT NULL,
  main_competitors TEXT,
  
  -- Retention & Churn Insights
  current_churn_rate NUMERIC,
  biggest_retention_challenge TEXT,
  existing_retention_tools TEXT,
  success_metrics TEXT,
  
  -- Metadata
  onboarding_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.founder_profile ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own founder profile" 
ON public.founder_profile 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own founder profile" 
ON public.founder_profile 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own founder profile" 
ON public.founder_profile 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_founder_profile_updated_at
BEFORE UPDATE ON public.founder_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
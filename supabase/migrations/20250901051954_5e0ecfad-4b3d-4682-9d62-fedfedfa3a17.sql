-- Add tables for retention analytics
CREATE TABLE public.retention_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  upload_id UUID,
  feature_name TEXT NOT NULL,
  retention_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  revenue_contribution NUMERIC(10,2) NOT NULL DEFAULT 0,
  user_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.churn_reason_clusters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  upload_id UUID,
  cluster_name TEXT NOT NULL,
  reason_examples TEXT[],
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  user_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.retention_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churn_reason_clusters ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own retention analytics" 
ON public.retention_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own retention analytics" 
ON public.retention_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own churn clusters" 
ON public.churn_reason_clusters 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own churn clusters" 
ON public.churn_reason_clusters 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_retention_analytics_user_id ON public.retention_analytics(user_id);
CREATE INDEX idx_churn_reason_clusters_user_id ON public.churn_reason_clusters(user_id);
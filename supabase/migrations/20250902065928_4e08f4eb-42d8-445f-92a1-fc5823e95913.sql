-- Create feature_events table for the Feature Adoption Dashboard
CREATE TABLE public.feature_events (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  plan TEXT,
  metadata JSONB,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.feature_events ENABLE ROW LEVEL SECURITY;

-- Create policies for feature_events
CREATE POLICY "Users can view their own feature events" 
ON public.feature_events 
FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own feature events" 
ON public.feature_events 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own feature events" 
ON public.feature_events 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own feature events" 
ON public.feature_events 
FOR DELETE 
USING (auth.uid() = owner_id);

-- Update existing profiles table to include company_name if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'company_name') THEN
        ALTER TABLE public.profiles ADD COLUMN company_name TEXT;
    END IF;
END $$;
-- Add user_stage field to user_data table
ALTER TABLE public.user_data 
ADD COLUMN user_stage TEXT DEFAULT 'unknown';

-- Add understanding_score field to user_data table  
ALTER TABLE public.user_data 
ADD COLUMN understanding_score INTEGER DEFAULT 0;

-- Add days_until_mature field to user_data table
ALTER TABLE public.user_data 
ADD COLUMN days_until_mature INTEGER DEFAULT 0;

-- Add action_recommended field to user_data table
ALTER TABLE public.user_data 
ADD COLUMN action_recommended TEXT DEFAULT '';

-- Create index for better performance on user_stage queries
CREATE INDEX idx_user_data_user_stage ON public.user_data(user_stage);
CREATE INDEX idx_user_data_understanding_score ON public.user_data(understanding_score);
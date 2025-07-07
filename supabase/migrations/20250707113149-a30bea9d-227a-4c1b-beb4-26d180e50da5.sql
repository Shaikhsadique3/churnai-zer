-- Add churn_reason column to user_data table to support AI model v5
ALTER TABLE public.user_data 
ADD COLUMN churn_reason TEXT;
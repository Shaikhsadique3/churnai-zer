-- Fix integer type issue for monetary fields in user_data table
-- The error shows "29.99" can't be inserted into an integer field
-- This is likely a monthly_revenue or similar monetary field

-- Check if there are any integer columns that should be numeric for monetary values
-- Based on the error, we need to change any monetary integer fields to numeric

-- Add a monthly_revenue column if it doesn't exist, or modify existing integer monetary fields
DO $$
BEGIN
    -- Try to add monthly_revenue column as numeric if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_data' AND column_name = 'monthly_revenue') THEN
        ALTER TABLE user_data ADD COLUMN monthly_revenue NUMERIC DEFAULT 0;
    END IF;
    
    -- If monthly_revenue exists but is integer, change it to numeric
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_data' 
               AND column_name = 'monthly_revenue' 
               AND data_type = 'integer') THEN
        ALTER TABLE user_data ALTER COLUMN monthly_revenue TYPE NUMERIC USING monthly_revenue::numeric;
    END IF;
END $$;
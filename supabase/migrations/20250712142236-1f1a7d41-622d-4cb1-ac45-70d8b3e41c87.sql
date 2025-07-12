-- Add missing SMTP columns to integration_settings table
ALTER TABLE public.integration_settings 
ADD COLUMN IF NOT EXISTS smtp_host TEXT,
ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 587,
ADD COLUMN IF NOT EXISTS smtp_username TEXT,
ADD COLUMN IF NOT EXISTS smtp_password TEXT;
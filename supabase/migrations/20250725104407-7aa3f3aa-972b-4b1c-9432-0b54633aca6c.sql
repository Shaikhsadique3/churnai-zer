-- Fix the generate_api_key function to use correct PostgreSQL extensions
-- First enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update the generate_api_key function to use the correct function name
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN 'cg_' || encode(gen_random_bytes(32), 'hex');
END;
$function$;

-- Now insert API key for the specific user who doesn't have one
INSERT INTO public.api_keys (user_id, key, name)
SELECT 'cf174eee-8c06-447f-bc87-18bbf85de0ca', generate_api_key(), 'Default API Key'
WHERE NOT EXISTS (
  SELECT 1 FROM public.api_keys 
  WHERE user_id = 'cf174eee-8c06-447f-bc87-18bbf85de0ca'
);

-- Also handle any other users who might not have API keys
INSERT INTO public.api_keys (user_id, key, name)
SELECT id, generate_api_key(), 'Default API Key'
FROM auth.users
WHERE id NOT IN (SELECT DISTINCT user_id FROM public.api_keys WHERE user_id IS NOT NULL);
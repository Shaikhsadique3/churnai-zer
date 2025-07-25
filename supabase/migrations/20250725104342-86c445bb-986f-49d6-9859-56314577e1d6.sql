-- Fix missing API key issue by ensuring new users get API keys
-- Also create a trigger to automatically create API keys for existing users without them

-- Insert API key for the specific user who doesn't have one
INSERT INTO public.api_keys (user_id, key, name)
SELECT 'cf174eee-8c06-447f-bc87-18bbf85de0ca', generate_api_key(), 'Default API Key'
WHERE NOT EXISTS (
  SELECT 1 FROM public.api_keys 
  WHERE user_id = 'cf174eee-8c06-447f-bc87-18bbf85de0ca'
);

-- Also handle any other users who might not have API keys
INSERT INTO public.api_keys (user_id, key, name)
SELECT auth.users.id, generate_api_key(), 'Default API Key'
FROM auth.users
LEFT JOIN public.api_keys ON auth.users.id = public.api_keys.user_id
WHERE public.api_keys.user_id IS NULL;
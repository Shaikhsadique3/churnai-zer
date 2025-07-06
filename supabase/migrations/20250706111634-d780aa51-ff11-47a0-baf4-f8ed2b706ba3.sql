-- Update the generate_api_key function to use built-in random functions
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN 'cg_' || 
         substr(md5(random()::text || clock_timestamp()::text), 1, 32) ||
         substr(md5(random()::text || clock_timestamp()::text), 1, 32);
END;
$$;

-- Create API keys for any existing users who don't have them
INSERT INTO public.api_keys (user_id, key, name)
SELECT 
  au.id,
  generate_api_key(),
  'Default API Key'
FROM auth.users au
LEFT JOIN public.api_keys ak ON au.id = ak.user_id
WHERE ak.user_id IS NULL;

-- Recreate the trigger function to be more robust and handle all signup methods
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert into profiles table (ignore conflicts)
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert into api_keys table (ignore conflicts)  
  INSERT INTO public.api_keys (user_id, key, name)
  VALUES (NEW.id, generate_api_key(), 'Default API Key')
  ON CONFLICT (user_id, name) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to fire after user creation for ALL signup methods
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
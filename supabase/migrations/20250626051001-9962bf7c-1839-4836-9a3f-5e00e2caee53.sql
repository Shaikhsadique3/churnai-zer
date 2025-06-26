
-- Ensure the generate_api_key function exists
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'cg_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger function exists
CREATE OR REPLACE FUNCTION public.handle_new_user_api_key()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.api_keys (user_id, key, name)
  VALUES (NEW.id, generate_api_key(), 'Default API Key');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created_api_key ON auth.users;
CREATE TRIGGER on_auth_user_created_api_key
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_api_key();

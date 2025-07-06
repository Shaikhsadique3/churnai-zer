-- Fix Function Search Path Mutable security warnings
-- Set explicit search_path for all functions to prevent injection attacks

-- Fix generate_api_key function
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN 'cg_' || encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert into api_keys table
  INSERT INTO public.api_keys (user_id, key, name)
  VALUES (NEW.id, generate_api_key(), 'Default API Key')
  ON CONFLICT (user_id, name) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Fix handle_new_user_api_key function
CREATE OR REPLACE FUNCTION public.handle_new_user_api_key()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.api_keys (user_id, key, name)
  VALUES (NEW.id, generate_api_key(), 'Default API Key');
  RETURN NEW;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_customer_metrics function
CREATE OR REPLACE FUNCTION public.update_customer_metrics()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
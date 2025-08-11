-- Create a function to hash API keys securely
CREATE OR REPLACE FUNCTION public.hash_api_key(api_key TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Use SHA-256 to hash the API key with a salt
  RETURN encode(digest(api_key || 'churnaizer_salt_2024', 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add hashed_key column to api_keys table
ALTER TABLE public.api_keys ADD COLUMN hashed_key TEXT;

-- Migrate existing plaintext keys to hashed versions
UPDATE public.api_keys 
SET hashed_key = public.hash_api_key(key)
WHERE hashed_key IS NULL;

-- Make hashed_key required and add unique constraint
ALTER TABLE public.api_keys 
ALTER COLUMN hashed_key SET NOT NULL,
ADD CONSTRAINT api_keys_hashed_key_unique UNIQUE (hashed_key);

-- Create index on hashed_key for performance
CREATE INDEX idx_api_keys_hashed_key ON public.api_keys(hashed_key);

-- Update generate_api_key function to return both key and hash
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_key TEXT;
  key_hash TEXT;
BEGIN
  new_key := 'cg_' || substr(md5(random()::text || clock_timestamp()::text), 1, 32);
  key_hash := public.hash_api_key(new_key);
  
  RETURN jsonb_build_object(
    'key', new_key,
    'hashed_key', key_hash
  );
END;
$$;

-- Create secure validation function
CREATE OR REPLACE FUNCTION public.validate_api_key(input_key TEXT)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_uuid uuid;
BEGIN
  SELECT user_id INTO user_uuid 
  FROM public.api_keys 
  WHERE hashed_key = public.hash_api_key(input_key) 
    AND is_active = true;
  
  RETURN user_uuid;
END;
$$;
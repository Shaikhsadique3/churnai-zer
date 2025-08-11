
-- Insert the API key that's being used in your HTML test
INSERT INTO public.api_keys (key, user_id, is_active, name)
VALUES (
  'cg_261f34e9bdd5de338ee994e8f99d7809', 
  'b098705b-0a4f-426a-acb7-2f1a9e40e98d', 
  true,
  'Test Integration Key'
)
ON CONFLICT (key) DO UPDATE SET 
  is_active = true,
  updated_at = now();

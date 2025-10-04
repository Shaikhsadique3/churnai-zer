-- =====================================================
-- CHURNAIZER SECURITY FIXES
-- Addresses: Role-based access, NULL user_id, search_path vulnerabilities
-- =====================================================

-- 1. CREATE ROLE MANAGEMENT SYSTEM
-- =====================================================

-- Create app_role enum for role-based access control
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Migrate existing admin users to roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email IN (
  'shaikhsadique730@gmail.com',
  'shaikhsadique2222@gmail.com', 
  'shaikhumairthisside@gmail.com'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Update is_admin_user function to use roles table
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;


-- 2. FIX CHURN_UPLOADS NULL USER_ID ISSUE
-- =====================================================

-- Delete orphaned test uploads with NULL user_id
-- These are legacy test records that cannot be properly secured
DELETE FROM public.churn_uploads WHERE user_id IS NULL;

-- Make user_id NOT NULL to enforce data ownership
ALTER TABLE public.churn_uploads 
  ALTER COLUMN user_id SET NOT NULL;

-- Drop the insecure public access policy
DROP POLICY IF EXISTS "Public can view uploads by email" ON public.churn_uploads;

-- Ensure only authenticated users can manage their own uploads
DROP POLICY IF EXISTS "Users can insert own uploads" ON public.churn_uploads;
DROP POLICY IF EXISTS "Users can view own uploads" ON public.churn_uploads;

CREATE POLICY "Users can insert their own uploads"
ON public.churn_uploads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own uploads"
ON public.churn_uploads
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads"
ON public.churn_uploads
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);


-- 3. FIX SEARCH_PATH VULNERABILITIES IN ALL FUNCTIONS
-- =====================================================

-- Update all trigger functions to include SET search_path = public

CREATE OR REPLACE FUNCTION public.update_founder_preferences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create default Free plan subscription
  INSERT INTO user_subscriptions (user_id, plan_id, status, billing_cycle)
  SELECT NEW.id, sp.id, 'active', 'monthly'
  FROM subscription_plans sp
  WHERE sp.slug = 'free';
  
  -- Initialize credits for Free plan
  INSERT INTO user_credits (user_id, credits_available, credits_limit)
  VALUES (NEW.id, 500, 500);
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.hash_api_key(api_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(digest(api_key || 'churnaizer_salt_2024', 'sha256'), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.notify_high_risk_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'at_risk' THEN
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
            NEW.owner_id,
            'High-Risk User Detected',
            'User ' || NEW.user_id || ' has been flagged as high risk.',
            'risk'
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_preferences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_api_key(input_key TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid UUID;
BEGIN
  SELECT user_id INTO user_uuid 
  FROM public.api_keys 
  WHERE hashed_key = public.hash_api_key(input_key) 
    AND is_active = true;
  
  RETURN user_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_recovery_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'recovered' AND OLD.status = 'at_risk' THEN
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
            NEW.owner_id,
            'User Recovered',
            'User ' || NEW.user_id || ' has recovered.',
            'recovery'
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_email_sent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        NEW.user_id,
        'Retention Email Sent',
        'An email was sent to ' || COALESCE(NEW.target_email, 'Unknown user') || '.',
        'email'
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_cancel_guard_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_cancel_guard_experiments_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF data IS NULL OR data = '' THEN
    RETURN NULL;
  END IF;
  
  RETURN encode(
    digest(data || auth.uid()::text || 'encryption_salt_2024', 'sha256'), 
    'hex'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_encrypted_credential(stored_encrypted TEXT, input_plain TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF stored_encrypted IS NULL OR input_plain IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN stored_encrypted = encode(
    digest(input_plain || auth.uid()::text || 'encryption_salt_2024', 'sha256'), 
    'hex'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.log_integration_settings_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO integration_settings_audit (
    user_id,
    action,
    changed_fields,
    changed_at
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    TG_OP,
    CASE 
      WHEN TG_OP = 'UPDATE' THEN 
        jsonb_build_object(
          'old_email_provider', OLD.email_provider,
          'new_email_provider', NEW.email_provider,
          'old_sender_email', OLD.sender_email,
          'new_sender_email', NEW.sender_email,
          'credentials_updated', (
            OLD.email_api_key IS DISTINCT FROM NEW.email_api_key OR
            OLD.smtp_password IS DISTINCT FROM NEW.smtp_password OR
            OLD.crm_api_key IS DISTINCT FROM NEW.crm_api_key
          )
        )
      WHEN TG_OP = 'INSERT' THEN
        jsonb_build_object(
          'email_provider', NEW.email_provider,
          'sender_email', NEW.sender_email,
          'has_credentials', (
            NEW.email_api_key IS NOT NULL OR 
            NEW.smtp_password IS NOT NULL OR
            NEW.crm_api_key IS NOT NULL
          )
        )
      ELSE jsonb_build_object('action', TG_OP)
    END,
    now()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.deduct_user_credits(user_uuid UUID, credits_to_deduct INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits_available INTO current_credits
  FROM user_credits
  WHERE user_id = user_uuid;
  
  IF current_credits >= credits_to_deduct THEN
    UPDATE user_credits
    SET 
      credits_available = credits_available - credits_to_deduct,
      credits_used = credits_used + credits_to_deduct,
      updated_at = now()
    WHERE user_id = user_uuid;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_monthly_credits()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_credits uc
  SET 
    credits_available = uc.credits_limit,
    credits_used = 0,
    reset_date = (date_trunc('month', now()) + interval '1 month'),
    updated_at = now()
  WHERE uc.reset_date <= now();
END;
$$;

CREATE OR REPLACE FUNCTION public.update_waitlist_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_customer_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
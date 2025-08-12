
-- Create subscription plans table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  credits_per_month INTEGER NOT NULL,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  lemon_squeezy_subscription_id TEXT,
  lemon_squeezy_order_id TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, expired, past_due
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  is_test_mode BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create credits tracking table
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  credits_available INTEGER NOT NULL DEFAULT 500,
  credits_used INTEGER NOT NULL DEFAULT 0,
  credits_limit INTEGER NOT NULL DEFAULT 500,
  reset_date TIMESTAMP WITH TIME ZONE DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payment transactions table for test mode tracking
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lemon_squeezy_order_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL, -- pending, completed, failed, refunded
  plan_id UUID REFERENCES subscription_plans(id),
  is_test_mode BOOLEAN DEFAULT true,
  transaction_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, credits_per_month, features) VALUES
('Free', 'free', 0.00, 0.00, 500, '["Basic churn prediction", "Email alerts", "CSV upload", "Community support"]'),
('Pro', 'pro', 49.00, 490.00, 3000, '["Advanced churn prediction", "Custom email templates", "API access", "Priority support", "Advanced analytics"]'),
('Growth', 'growth', 149.00, 1490.00, 8000, '["Enterprise churn prediction", "Unlimited custom templates", "Advanced API access", "Phone support", "Custom integrations", "Team collaboration"]');

-- Enable RLS on all tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans FOR SELECT USING (true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_credits
CREATE POLICY "Users can view their own credits" ON user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own credits" ON user_credits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own credits" ON user_credits FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for payment_transactions
CREATE POLICY "Users can view their own transactions" ON payment_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON payment_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to initialize user credits when they sign up
CREATE OR REPLACE FUNCTION initialize_user_credits()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to initialize credits on user signup
CREATE TRIGGER on_user_created_initialize_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_credits();

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_user_credits(user_uuid UUID, credits_to_deduct INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current available credits
  SELECT credits_available INTO current_credits
  FROM user_credits
  WHERE user_id = user_uuid;
  
  -- Check if user has enough credits
  IF current_credits >= credits_to_deduct THEN
    -- Deduct credits
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly credits
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS void AS $$
BEGIN
  UPDATE user_credits uc
  SET 
    credits_available = uc.credits_limit,
    credits_used = 0,
    reset_date = (date_trunc('month', now()) + interval '1 month'),
    updated_at = now()
  WHERE uc.reset_date <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

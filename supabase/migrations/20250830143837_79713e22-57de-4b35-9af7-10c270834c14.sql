-- Cancel Guard Schema: Projects, Offers, Decisions, Events, Coupons, Settings

-- Projects table for tracking client projects
CREATE TABLE public.cancel_guard_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  api_key_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Offers table for cancel alternatives
CREATE TABLE public.cancel_guard_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  offer_type TEXT NOT NULL CHECK (offer_type IN ('pause', 'downgrade', 'discount', 'concierge', 'feedback')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Decisions table for tracking user choices
CREATE TABLE public.cancel_guard_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  customer_id TEXT,
  offer_shown UUID,
  decision TEXT NOT NULL CHECK (decision IN ('accepted', 'declined', 'canceled')),
  decision_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Events table for analytics
CREATE TABLE public.cancel_guard_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Coupons table for discount offers
CREATE TABLE public.cancel_guard_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Settings table for project configurations
CREATE TABLE public.cancel_guard_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL UNIQUE,
  modal_config JSONB NOT NULL DEFAULT '{}',
  domain_allowlist TEXT[] DEFAULT '{}',
  webhook_url TEXT,
  analytics_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.cancel_guard_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancel_guard_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancel_guard_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancel_guard_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancel_guard_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancel_guard_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can manage their own projects"
ON public.cancel_guard_projects
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for offers
CREATE POLICY "Users can manage offers for their projects"
ON public.cancel_guard_offers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cancel_guard_projects p 
    WHERE p.id = cancel_guard_offers.project_id 
    AND p.user_id = auth.uid()
  )
);

-- RLS Policies for decisions
CREATE POLICY "Users can view decisions for their projects"
ON public.cancel_guard_decisions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cancel_guard_projects p 
    WHERE p.id = cancel_guard_decisions.project_id 
    AND p.user_id = auth.uid()
  )
);

-- RLS Policies for events
CREATE POLICY "Users can view events for their projects"
ON public.cancel_guard_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cancel_guard_projects p 
    WHERE p.id = cancel_guard_events.project_id 
    AND p.user_id = auth.uid()
  )
);

-- RLS Policies for coupons
CREATE POLICY "Users can manage coupons for their projects"
ON public.cancel_guard_coupons
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cancel_guard_projects p 
    WHERE p.id = cancel_guard_coupons.project_id 
    AND p.user_id = auth.uid()
  )
);

-- RLS Policies for settings
CREATE POLICY "Users can manage settings for their projects"
ON public.cancel_guard_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.cancel_guard_projects p 
    WHERE p.id = cancel_guard_settings.project_id 
    AND p.user_id = auth.uid()
  )
);

-- Indexes for performance
CREATE INDEX idx_cancel_guard_projects_user_id ON public.cancel_guard_projects(user_id);
CREATE INDEX idx_cancel_guard_offers_project_id ON public.cancel_guard_offers(project_id);
CREATE INDEX idx_cancel_guard_decisions_project_id ON public.cancel_guard_decisions(project_id);
CREATE INDEX idx_cancel_guard_events_project_id ON public.cancel_guard_events(project_id);
CREATE INDEX idx_cancel_guard_coupons_project_id ON public.cancel_guard_coupons(project_id);
CREATE INDEX idx_cancel_guard_settings_project_id ON public.cancel_guard_settings(project_id);

-- Foreign key constraints
ALTER TABLE public.cancel_guard_offers 
ADD CONSTRAINT fk_offers_project 
FOREIGN KEY (project_id) REFERENCES public.cancel_guard_projects(id) ON DELETE CASCADE;

ALTER TABLE public.cancel_guard_decisions 
ADD CONSTRAINT fk_decisions_project 
FOREIGN KEY (project_id) REFERENCES public.cancel_guard_projects(id) ON DELETE CASCADE;

ALTER TABLE public.cancel_guard_events 
ADD CONSTRAINT fk_events_project 
FOREIGN KEY (project_id) REFERENCES public.cancel_guard_projects(id) ON DELETE CASCADE;

ALTER TABLE public.cancel_guard_coupons 
ADD CONSTRAINT fk_coupons_project 
FOREIGN KEY (project_id) REFERENCES public.cancel_guard_projects(id) ON DELETE CASCADE;

ALTER TABLE public.cancel_guard_settings 
ADD CONSTRAINT fk_settings_project 
FOREIGN KEY (project_id) REFERENCES public.cancel_guard_projects(id) ON DELETE CASCADE;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_cancel_guard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cancel_guard_projects_updated_at
BEFORE UPDATE ON public.cancel_guard_projects
FOR EACH ROW EXECUTE FUNCTION public.update_cancel_guard_updated_at();

CREATE TRIGGER update_cancel_guard_offers_updated_at
BEFORE UPDATE ON public.cancel_guard_offers
FOR EACH ROW EXECUTE FUNCTION public.update_cancel_guard_updated_at();

CREATE TRIGGER update_cancel_guard_settings_updated_at
BEFORE UPDATE ON public.cancel_guard_settings
FOR EACH ROW EXECUTE FUNCTION public.update_cancel_guard_updated_at();

-- Seed data
INSERT INTO public.cancel_guard_projects (user_id, name, domain, api_key_hash, settings) VALUES
((SELECT auth.uid()), 'Demo Project', 'example.com', encode(digest('demo_key_123' || 'churnaizer_salt_2024', 'sha256'), 'hex'), '{"modal_theme": "modern", "delay_ms": 500}');

INSERT INTO public.cancel_guard_offers (project_id, offer_type, title, description, config, priority) VALUES
((SELECT id FROM public.cancel_guard_projects WHERE name = 'Demo Project' LIMIT 1), 'pause', 'Pause Your Account', 'Take a break and come back anytime', '{"duration_months": 3}', 1),
((SELECT id FROM public.cancel_guard_projects WHERE name = 'Demo Project' LIMIT 1), 'discount', '50% Off Next 3 Months', 'Stay with us at half price', '{"discount_percent": 50, "duration_months": 3}', 2),
((SELECT id FROM public.cancel_guard_projects WHERE name = 'Demo Project' LIMIT 1), 'downgrade', 'Switch to Basic Plan', 'Keep essential features at lower cost', '{"target_plan": "basic"}', 3),
((SELECT id FROM public.cancel_guard_projects WHERE name = 'Demo Project' LIMIT 1), 'concierge', 'Talk to Our Team', 'Let us help you get more value', '{"calendar_link": "https://calendly.com/demo"}', 4),
((SELECT id FROM public.cancel_guard_projects WHERE name = 'Demo Project' LIMIT 1), 'feedback', 'Tell Us Why', 'Help us improve for everyone', '{"survey_url": "https://forms.gle/demo"}', 5);

INSERT INTO public.cancel_guard_coupons (project_id, code, discount_type, discount_value, expires_at, max_uses) VALUES
((SELECT id FROM public.cancel_guard_projects WHERE name = 'Demo Project' LIMIT 1), 'STAY50', 'percentage', 50, now() + interval '30 days', 100);

INSERT INTO public.cancel_guard_settings (project_id, modal_config, domain_allowlist) VALUES
((SELECT id FROM public.cancel_guard_projects WHERE name = 'Demo Project' LIMIT 1), '{"title": "Wait! Before you go...", "subtitle": "We have something special for you"}', ARRAY['example.com', 'demo.example.com']);
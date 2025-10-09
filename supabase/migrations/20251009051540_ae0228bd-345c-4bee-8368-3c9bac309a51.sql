-- Drop old tables
DROP TABLE IF EXISTS generated_emails CASCADE;
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS uploads CASCADE;

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 1.0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  max_score INTEGER NOT NULL DEFAULT 5,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create audits table
CREATE TABLE public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  overall_score NUMERIC,
  status TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create answers table
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value >= 1 AND value <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(audit_id, question_id)
);

-- Create category_results table
CREATE TABLE public.category_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(audit_id, category_id)
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for questions (public read, admin write)
CREATE POLICY "Anyone can view questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Admins can manage questions" ON public.questions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for audits
CREATE POLICY "Users can view own audits" ON public.audits FOR SELECT USING (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can create audits" ON public.audits FOR INSERT WITH CHECK (
  auth.uid() = user_id OR user_id IS NULL
);
CREATE POLICY "Users can update own audits" ON public.audits FOR UPDATE USING (
  auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')
);

-- RLS Policies for answers
CREATE POLICY "Users can view own answers" ON public.answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.audits WHERE id = audit_id AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "Users can create own answers" ON public.answers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.audits WHERE id = audit_id AND (user_id = auth.uid() OR user_id IS NULL))
);
CREATE POLICY "Users can update own answers" ON public.answers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.audits WHERE id = audit_id AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);

-- RLS Policies for category_results
CREATE POLICY "Users can view own category results" ON public.category_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.audits WHERE id = audit_id AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin')))
);
CREATE POLICY "Users can create own category results" ON public.category_results FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.audits WHERE id = audit_id AND (user_id = auth.uid() OR user_id IS NULL))
);

-- Insert default categories
INSERT INTO public.categories (title, weight, description) VALUES
  ('Onboarding & Activation', 1.2, 'How well do you activate new users?'),
  ('Customer Engagement', 1.0, 'How engaged are your customers?'),
  ('Product Feedback & Experience', 0.9, 'How well do you collect and act on feedback?'),
  ('Retention Marketing', 1.1, 'How effective is your retention marketing?'),
  ('Customer Success Process', 1.0, 'How structured is your customer success?');

-- Insert default questions
INSERT INTO public.questions (category_id, prompt, order_index)
SELECT c.id, q.prompt, q.order_index
FROM public.categories c
CROSS JOIN (
  SELECT 'Do new users reach their first success within 24–48 hours?' as prompt, 1 as order_index, 'Onboarding & Activation' as category
  UNION ALL SELECT 'Do you track Time-to-First-Value (TTFV)?', 2, 'Onboarding & Activation'
  UNION ALL SELECT 'Is there a guided onboarding or checklist?', 3, 'Onboarding & Activation'
  UNION ALL SELECT 'Are activation emails personalized and time-based?', 4, 'Onboarding & Activation'
  UNION ALL SELECT 'Do you collect usage data to trigger retention campaigns?', 5, 'Customer Engagement'
  UNION ALL SELECT 'Are customers reminded of unused features or value?', 6, 'Customer Engagement'
  UNION ALL SELECT 'Do you have a monthly customer touchpoint (email, call, or community)?', 7, 'Customer Engagement'
  UNION ALL SELECT 'Do you measure engagement by cohort or plan?', 8, 'Customer Engagement'
  UNION ALL SELECT 'Do you survey users before they churn?', 9, 'Product Feedback & Experience'
  UNION ALL SELECT 'Is product feedback categorized and acted upon regularly?', 10, 'Product Feedback & Experience'
  UNION ALL SELECT 'Are support tickets tracked for recurring issues?', 11, 'Product Feedback & Experience'
  UNION ALL SELECT 'Do you send renewal reminders or win-back campaigns?', 12, 'Retention Marketing'
  UNION ALL SELECT 'Do you offer annual plans or loyalty rewards?', 13, 'Retention Marketing'
  UNION ALL SELECT 'Do you use case studies or testimonials to increase perceived value?', 14, 'Retention Marketing'
  UNION ALL SELECT 'Is there a clear owner for retention in your team?', 15, 'Customer Success Process'
  UNION ALL SELECT 'Are at-risk customers identified and contacted proactively?', 16, 'Customer Success Process'
  UNION ALL SELECT 'Do you have retention KPIs beyond "churn rate"?', 17, 'Customer Success Process'
) q
WHERE c.title = q.category;

-- Create indexes
CREATE INDEX idx_questions_category ON public.questions(category_id);
CREATE INDEX idx_answers_audit ON public.answers(audit_id);
CREATE INDEX idx_category_results_audit ON public.category_results(audit_id);
CREATE INDEX idx_audits_user ON public.audits(user_id);
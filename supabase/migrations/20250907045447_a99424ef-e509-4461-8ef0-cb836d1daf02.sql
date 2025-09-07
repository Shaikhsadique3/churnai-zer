-- Create churn audit uploads table
CREATE TABLE public.churn_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  filename TEXT NOT NULL,
  csv_url TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'done', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create churn audit reports table  
CREATE TABLE public.churn_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID NOT NULL REFERENCES public.churn_uploads(id),
  type TEXT NOT NULL CHECK (type IN ('free', 'full')),
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create churn audit payments table
CREATE TABLE public.churn_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID NOT NULL REFERENCES public.churn_uploads(id),
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed')),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  checkout_id TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.churn_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churn_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churn_payments ENABLE ROW LEVEL SECURITY;

-- Public policies for uploads (no auth required)
CREATE POLICY "Anyone can insert churn uploads" ON public.churn_uploads FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view churn uploads" ON public.churn_uploads FOR SELECT USING (true);
CREATE POLICY "Anyone can update churn uploads" ON public.churn_uploads FOR UPDATE USING (true);

-- Public policies for reports
CREATE POLICY "Anyone can insert churn reports" ON public.churn_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view churn reports" ON public.churn_reports FOR SELECT USING (true);

-- Public policies for payments
CREATE POLICY "Anyone can insert churn payments" ON public.churn_payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view churn payments" ON public.churn_payments FOR SELECT USING (true);
CREATE POLICY "Anyone can update churn payments" ON public.churn_payments FOR UPDATE USING (true);
-- Create uploads table
CREATE TABLE public.uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  filename TEXT NOT NULL,
  csv_url TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table  
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID NOT NULL REFERENCES public.uploads(id),
  type TEXT NOT NULL CHECK (type IN ('free', 'full')),
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upload_id UUID NOT NULL REFERENCES public.uploads(id),
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed')),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  checkout_id TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CSV uploads storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('csv-uploads', 'csv-uploads', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false);

-- Enable RLS
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Public policies for uploads (no auth required)
CREATE POLICY "Anyone can insert uploads" ON public.uploads FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view uploads" ON public.uploads FOR SELECT USING (true);
CREATE POLICY "Anyone can update uploads" ON public.uploads FOR UPDATE USING (true);

-- Public policies for reports
CREATE POLICY "Anyone can insert reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view reports" ON public.reports FOR SELECT USING (true);

-- Public policies for payments
CREATE POLICY "Anyone can insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Anyone can update payments" ON public.payments FOR UPDATE USING (true);

-- Storage policies
CREATE POLICY "Anyone can upload CSV files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'csv-uploads');
CREATE POLICY "Anyone can view CSV files" ON storage.objects FOR SELECT USING (bucket_id = 'csv-uploads');

CREATE POLICY "Anyone can upload reports" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'reports');
CREATE POLICY "Anyone can view reports" ON storage.objects FOR SELECT USING (bucket_id = 'reports');
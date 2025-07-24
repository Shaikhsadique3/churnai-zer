-- Create waitlist table for storing waitlist signups
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_sent BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public inserts (for waitlist signup)
CREATE POLICY "Allow public waitlist signups" 
ON public.waitlist 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Create policy to allow users to view all waitlist entries (for admin purposes)
CREATE POLICY "Allow authenticated users to view waitlist" 
ON public.waitlist 
FOR SELECT 
TO authenticated 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
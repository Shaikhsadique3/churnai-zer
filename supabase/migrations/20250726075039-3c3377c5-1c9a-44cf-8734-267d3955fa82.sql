-- Create inbound_emails table for capturing incoming emails
CREATE TABLE public.inbound_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT,
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'normal',
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.inbound_emails ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to view all inbound emails
-- Note: This assumes admin users have a specific role or can be identified
-- For now, allowing authenticated users to read (you may want to restrict this further)
CREATE POLICY "Authenticated users can view inbound emails" 
ON public.inbound_emails 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create policy for system to insert inbound emails (via service role)
CREATE POLICY "Service role can insert inbound emails" 
ON public.inbound_emails 
FOR INSERT 
WITH CHECK (true);

-- Create policy for authenticated users to update read status
CREATE POLICY "Authenticated users can update inbound emails" 
ON public.inbound_emails 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX idx_inbound_emails_received_at ON public.inbound_emails(received_at DESC);
CREATE INDEX idx_inbound_emails_from_email ON public.inbound_emails(from_email);
CREATE INDEX idx_inbound_emails_is_read ON public.inbound_emails(is_read);
-- Create smtp_providers table for storing SMTP configurations
CREATE TABLE public.smtp_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider_name TEXT,
  smtp_host TEXT NOT NULL,
  smtp_port INTEGER NOT NULL DEFAULT 587,
  smtp_username TEXT NOT NULL,
  smtp_password_encrypted TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  test_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.smtp_providers ENABLE ROW LEVEL SECURITY;

-- Create policies for smtp_providers
CREATE POLICY "Users can create their own SMTP providers" 
ON public.smtp_providers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own SMTP providers" 
ON public.smtp_providers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own SMTP providers" 
ON public.smtp_providers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SMTP providers" 
ON public.smtp_providers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_smtp_providers_updated_at
BEFORE UPDATE ON public.smtp_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
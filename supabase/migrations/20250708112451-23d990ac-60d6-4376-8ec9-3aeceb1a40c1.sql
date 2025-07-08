-- Create playbooks table
CREATE TABLE public.playbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;

-- Create policies for playbooks
CREATE POLICY "Users can view their own playbooks" 
ON public.playbooks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playbooks" 
ON public.playbooks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playbooks" 
ON public.playbooks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playbooks" 
ON public.playbooks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create action queue table
CREATE TABLE public.playbook_actions_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_user_id TEXT NOT NULL,
  playbook_id UUID REFERENCES public.playbooks(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL DEFAULT 0,
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  execute_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  executed_at TIMESTAMP WITH TIME ZONE NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playbook_actions_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for action queue
CREATE POLICY "Users can view their own action queue" 
ON public.playbook_actions_queue 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own action queue" 
ON public.playbook_actions_queue 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create audit log table
CREATE TABLE public.playbook_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_user_id TEXT NOT NULL,
  playbook_id UUID REFERENCES public.playbooks(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL,
  error_message TEXT NULL,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playbook_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for audit log
CREATE POLICY "Users can view their own audit log" 
ON public.playbook_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_playbooks_user_id_active ON public.playbooks(user_id, is_active);
CREATE INDEX idx_actions_queue_execute_at ON public.playbook_actions_queue(execute_at, status);
CREATE INDEX idx_actions_queue_user_target ON public.playbook_actions_queue(user_id, target_user_id);
CREATE INDEX idx_audit_log_user_id ON public.playbook_audit_log(user_id);

-- Create trigger for updated_at on playbooks
CREATE TRIGGER update_playbooks_updated_at
BEFORE UPDATE ON public.playbooks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
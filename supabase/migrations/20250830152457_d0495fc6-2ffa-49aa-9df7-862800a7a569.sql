-- Create A/B Testing tables for Cancel Guard
CREATE TABLE IF NOT EXISTS cancel_guard_experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  traffic_split_a INTEGER NOT NULL DEFAULT 10,
  traffic_split_b INTEGER NOT NULL DEFAULT 90,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config_a JSONB NOT NULL DEFAULT '{}',
  config_b JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add experiment group to decisions table
ALTER TABLE cancel_guard_decisions 
ADD COLUMN IF NOT EXISTS experiment_group TEXT CHECK (experiment_group IN ('A', 'B', 'control'));

-- Add experiment tracking to events table
ALTER TABLE cancel_guard_events 
ADD COLUMN IF NOT EXISTS experiment_group TEXT CHECK (experiment_group IN ('A', 'B', 'control'));

-- Create RLS policies for experiments
ALTER TABLE cancel_guard_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage experiments for their projects" 
ON cancel_guard_experiments 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM cancel_guard_projects p 
  WHERE p.id = cancel_guard_experiments.project_id 
  AND p.user_id = auth.uid()
));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_cancel_guard_experiments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cancel_guard_experiments_updated_at
  BEFORE UPDATE ON cancel_guard_experiments
  FOR EACH ROW
  EXECUTE FUNCTION update_cancel_guard_experiments_updated_at();

-- Insert default experiment for existing projects
INSERT INTO cancel_guard_experiments (project_id, name, description, config_a, config_b)
SELECT 
  id,
  'Default A/B Test',
  'Testing modal appearance and offer selection',
  '{"variant": "A", "modal_style": "standard", "offer_priority": "discount_first"}',
  '{"variant": "B", "modal_style": "premium", "offer_priority": "concierge_first"}'
FROM cancel_guard_projects
WHERE NOT EXISTS (
  SELECT 1 FROM cancel_guard_experiments 
  WHERE project_id = cancel_guard_projects.id
);
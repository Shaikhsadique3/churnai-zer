-- Add indexes for better search/filter performance
CREATE INDEX IF NOT EXISTS idx_user_data_search ON user_data USING gin(to_tsvector('english', user_id));
CREATE INDEX IF NOT EXISTS idx_user_data_risk_level ON user_data(risk_level);
CREATE INDEX IF NOT EXISTS idx_user_data_plan ON user_data(plan);
CREATE INDEX IF NOT EXISTS idx_user_data_owner_id ON user_data(owner_id);

-- Add bulk operations support
ALTER TABLE csv_uploads ADD COLUMN IF NOT EXISTS export_data jsonb;
ALTER TABLE user_data ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;
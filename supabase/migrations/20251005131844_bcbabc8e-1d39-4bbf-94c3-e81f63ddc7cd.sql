-- Clean database schema for new SaaS app

-- Drop old tables if they exist (clean slate)
DROP TABLE IF EXISTS churn_trigger_logs CASCADE;
DROP TABLE IF EXISTS churn_analysis_results CASCADE;
DROP TABLE IF EXISTS integration_test_results CASCADE;
DROP TABLE IF EXISTS feature_events CASCADE;
DROP TABLE IF EXISTS content_exports CASCADE;
DROP TABLE IF EXISTS churn_uploads CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS playbook_actions_queue CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS user_activity CASCADE;
DROP TABLE IF EXISTS user_data CASCADE;
DROP TABLE IF EXISTS brand_assets CASCADE;
DROP TABLE IF EXISTS retention_analytics CASCADE;
DROP TABLE IF EXISTS churn_reason_clusters CASCADE;
DROP TABLE IF EXISTS playbook_logs CASCADE;
DROP TABLE IF EXISTS recovery_logs CASCADE;
DROP TABLE IF EXISTS inbound_emails CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS csv_uploads CASCADE;
DROP TABLE IF EXISTS churn_predictions CASCADE;

-- Create clean tables for new SaaS app

-- Table: uploads (stores CSV + USP file metadata)
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  csv_filename TEXT NOT NULL,
  usp_filename TEXT,
  csv_url TEXT NOT NULL,
  usp_text TEXT,
  website_link TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Table: predictions (stores churn prediction results)
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  customer_id TEXT NOT NULL,
  monthly_revenue NUMERIC,
  churn_score NUMERIC NOT NULL,
  churn_probability NUMERIC NOT NULL,
  risk_level TEXT NOT NULL,
  churn_reason TEXT NOT NULL,
  shap_explanation JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table: generated_emails (stores AI-generated retention emails)
CREATE TABLE generated_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  customer_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  cta_text TEXT NOT NULL,
  cta_link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies for uploads
CREATE POLICY "Users can insert their own uploads"
ON uploads FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own uploads"
ON uploads FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads"
ON uploads FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for predictions
CREATE POLICY "Users can insert their own predictions"
ON predictions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own predictions"
ON predictions FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for generated_emails
CREATE POLICY "Users can insert their own emails"
ON generated_emails FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own emails"
ON generated_emails FOR SELECT
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_predictions_upload_id ON predictions(upload_id);
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_generated_emails_prediction_id ON generated_emails(prediction_id);
CREATE INDEX idx_generated_emails_user_id ON generated_emails(user_id);
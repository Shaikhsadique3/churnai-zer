-- Add audit mode tracking and accuracy to audits table
ALTER TABLE audits
ADD COLUMN IF NOT EXISTS audit_mode text DEFAULT 'question' CHECK (audit_mode IN ('question', 'data', 'merged')),
ADD COLUMN IF NOT EXISTS accuracy numeric DEFAULT 60,
ADD COLUMN IF NOT EXISTS csv_data jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS data_metrics_count integer DEFAULT 0;
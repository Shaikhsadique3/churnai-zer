-- 1. Create enum type for notification type
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('risk', 'recovery', 'email');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type notification_type NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- 3. Enable Row-Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy - Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
    ON notifications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 5. Trigger: New high-risk user detected
CREATE OR REPLACE FUNCTION notify_high_risk_user()
RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'at_risk' THEN
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
            NEW.owner_id,
            'High-Risk User Detected',
            'User ' || NEW.user_id || ' has been flagged as high risk.',
            'risk'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_high_risk ON user_data;
CREATE TRIGGER trg_notify_high_risk
AFTER INSERT ON user_data
FOR EACH ROW EXECUTE FUNCTION notify_high_risk_user();

-- 6. Trigger: Recovery event
CREATE OR REPLACE FUNCTION notify_recovery_event()
RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'recovered' AND OLD.status = 'at_risk' THEN
        INSERT INTO notifications (user_id, title, message, type)
        VALUES (
            NEW.owner_id,
            'User Recovered',
            'User ' || NEW.user_id || ' has recovered.',
            'recovery'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_recovery ON user_data;
CREATE TRIGGER trg_notify_recovery
AFTER UPDATE ON user_data
FOR EACH ROW EXECUTE FUNCTION notify_recovery_event();

-- 7. Trigger: New email sent
CREATE OR REPLACE FUNCTION notify_email_sent()
RETURNS trigger AS $$
BEGIN
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
        NEW.user_id,
        'Retention Email Sent',
        'An email was sent to ' || COALESCE(NEW.target_email, 'Unknown user') || '.',
        'email'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_email_sent ON email_logs;
CREATE TRIGGER trg_notify_email_sent
AFTER INSERT ON email_logs
FOR EACH ROW EXECUTE FUNCTION notify_email_sent();
-- Fix security warnings by setting search_path for all functions
CREATE OR REPLACE FUNCTION notify_high_risk_user()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION notify_recovery_event()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION notify_email_sent()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;
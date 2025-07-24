-- Fix security issue: Set search_path for the function
CREATE OR REPLACE FUNCTION update_existing_user_insights()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    user_record RECORD;
    dynamic_reason TEXT;
    recommended_action TEXT;
    new_understanding_score INTEGER;
    reasons TEXT[];
    actions TEXT[];
BEGIN
    -- Loop through all user_data records
    FOR user_record IN 
        SELECT * FROM user_data 
        WHERE churn_reason IN ('Assessment based on activity patterns and engagement metrics', 'Basic assessment based on activity patterns')
        OR action_recommended IN ('Risk assessment based on user behavior analysis', 'Initial risk assessment complete')
    LOOP
        -- Reset arrays
        reasons := ARRAY[]::TEXT[];
        actions := ARRAY[]::TEXT[];
        new_understanding_score := 85; -- Base score
        
        -- Generate dynamic reason based on user behavior
        IF user_record.usage < 3 THEN
            reasons := array_append(reasons, 'Very low login activity (under 3 times)');
            actions := array_append(actions, 'Send re-engagement email campaign');
            new_understanding_score := new_understanding_score - 20;
        ELSIF user_record.usage < 8 THEN
            reasons := array_append(reasons, 'Below average engagement');
            new_understanding_score := new_understanding_score - 10;
        END IF;
        
        IF user_record.plan = 'Free' THEN
            reasons := array_append(reasons, 'Free plan user with no revenue conversion');
            actions := array_append(actions, 'Offer upgrade incentives and onboarding');
            new_understanding_score := new_understanding_score - 5;
        END IF;
        
        IF user_record.last_login < NOW() - INTERVAL '60 days' THEN
            reasons := array_append(reasons, 'Long time since last login');
            actions := array_append(actions, 'Prioritize customer success outreach');
            new_understanding_score := new_understanding_score - 15;
        END IF;
        
        -- Set final values
        IF array_length(reasons, 1) > 0 THEN
            dynamic_reason := array_to_string(reasons, '; ');
            recommended_action := array_to_string(actions, '; ');
        ELSE
            dynamic_reason := 'User showing healthy engagement patterns';
            recommended_action := 'Continue standard engagement strategy';
        END IF;
        
        -- Ensure score stays within bounds
        new_understanding_score := GREATEST(LEAST(new_understanding_score, 100), 30);
        
        -- Update the record
        UPDATE user_data 
        SET 
            churn_reason = dynamic_reason,
            action_recommended = recommended_action,
            understanding_score = new_understanding_score,
            updated_at = NOW()
        WHERE id = user_record.id;
        
    END LOOP;
    
    RAISE NOTICE 'Updated insights for existing user records';
END;
$$;
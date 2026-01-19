-- Automation for Abuse Detection
-- Daily check for suspicious users based on Trust Score and Report count

CREATE OR REPLACE FUNCTION check_abuse_risks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    r RECORD;
    v_report_count INTEGER;
    v_trust_score INTEGER;
BEGIN
    FOR r IN SELECT id, email FROM users WHERE deleted_at IS NULL LOOP
        -- Get report count
        SELECT COUNT(*) INTO v_report_count 
        FROM reports 
        WHERE reported_user_id = r.id AND status IN ('pending', 'investigating', 'resolved');
        
        -- Get trust score
        SELECT total_score INTO v_trust_score FROM calculate_trust_score(r.id);
        
        -- Flag suspicious users
        -- Logic: If Trust Score < 20 AND Reports > 3 -> Possible Abuse
        IF v_trust_score < 20 AND v_report_count > 3 THEN
             -- Add to moderation warnings if not exists for 'auto_flag'
             INSERT INTO user_moderation_warnings (user_id, warning_type, warning_level, details)
             SELECT r.id, 'other', 2, 'Auto-detected: Low Trust Score + High Report Count'
             WHERE NOT EXISTS (
                 SELECT 1 FROM user_moderation_warnings 
                 WHERE user_id = r.id AND warning_type = 'other' AND created_at > NOW() - INTERVAL '1 day'
             );
        END IF;
    END LOOP;
END;
$$;

-- Schedule this via pg_cron (if available) or call from Edge Function
-- Example: SELECT cron.schedule('0 4 * * *', $$SELECT check_abuse_risks()$$);

-- GDPR Compliance: Audit Logs Table
-- Created: 2025-12-08
-- Purpose: Track all GDPR data export requests for compliance
--
-- GDPR Requirements Met:
-- - Article 30: Records of processing activities
-- - Demonstrates accountability and transparency
-- - Provides audit trail for regulatory compliance

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_action CHECK (action IN (
    'gdpr_data_export',
    'gdpr_data_deletion',
    'account_created',
    'account_deleted',
    'privacy_settings_updated',
    'consent_updated',
    'data_access_request',
    'data_rectification',
    'data_restriction',
    'data_objection'
  ))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
  ON public.audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
  ON public.audit_logs(action);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action 
  ON public.audit_logs(user_id, action);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
  ON public.audit_logs(created_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created 
  ON public.audit_logs(user_id, created_at DESC);

-- GIN index for JSONB details column
CREATE INDEX IF NOT EXISTS idx_audit_logs_details 
  ON public.audit_logs USING GIN (details);

-- Comments for documentation
COMMENT ON TABLE public.audit_logs IS 
  'GDPR compliance audit trail for all data processing activities';

COMMENT ON COLUMN public.audit_logs.user_id IS 
  'User whose data was accessed/processed';

COMMENT ON COLUMN public.audit_logs.action IS 
  'Type of GDPR-related action performed';

COMMENT ON COLUMN public.audit_logs.details IS 
  'Additional context about the action (JSON format)';

COMMENT ON COLUMN public.audit_logs.ip_address IS 
  'IP address of the request (for security)';

COMMENT ON COLUMN public.audit_logs.user_agent IS 
  'User agent string of the request';

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: Users can read their own audit logs
CREATE POLICY "Users can read own audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy 2: Service role can insert audit logs
-- (Edge functions use service role for logging)
CREATE POLICY "Service role can insert audit logs"
  ON public.audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS Policy 3: No updates allowed (immutable audit trail)
CREATE POLICY "Audit logs are immutable"
  ON public.audit_logs
  FOR UPDATE
  USING (false);

-- RLS Policy 4: No deletes allowed (except CASCADE from user deletion)
CREATE POLICY "Audit logs cannot be deleted manually"
  ON public.audit_logs
  FOR DELETE
  USING (false);

-- Grant permissions
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT INSERT ON public.audit_logs TO service_role;
GRANT SELECT ON public.audit_logs TO service_role;

-- Create a function to automatically log user registration
CREATE OR REPLACE FUNCTION public.log_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, details)
  VALUES (
    NEW.id,
    'account_created',
    jsonb_build_object(
      'email', NEW.email,
      'created_at', NEW.created_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log new user registrations
DROP TRIGGER IF EXISTS trigger_log_user_registration ON auth.users;
CREATE TRIGGER trigger_log_user_registration
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_user_registration();

-- Create a view for GDPR compliance officers
CREATE OR REPLACE VIEW public.gdpr_audit_summary AS
SELECT 
  DATE_TRUNC('day', created_at) AS date,
  action,
  COUNT(*) AS total_actions,
  COUNT(DISTINCT user_id) AS unique_users
FROM public.audit_logs
WHERE action LIKE 'gdpr_%'
GROUP BY DATE_TRUNC('day', created_at), action
ORDER BY date DESC, total_actions DESC;

COMMENT ON VIEW public.gdpr_audit_summary IS 
  'Summary of GDPR-related actions for compliance reporting';

-- Grant view access to service role only (for admin dashboards)
GRANT SELECT ON public.gdpr_audit_summary TO service_role;

-- Create a function to get user's audit trail
CREATE OR REPLACE FUNCTION public.get_user_audit_trail(
  target_user_id UUID,
  action_filter TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  action TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  -- Only allow users to see their own audit trail
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: Can only view own audit trail';
  END IF;

  RETURN QUERY
  SELECT 
    al.id,
    al.action,
    al.details,
    al.ip_address,
    al.created_at
  FROM public.audit_logs al
  WHERE al.user_id = target_user_id
    AND (action_filter IS NULL OR al.action = action_filter)
  ORDER BY al.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_audit_trail IS 
  'Allows users to retrieve their own audit trail (GDPR transparency)';

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_audit_trail TO authenticated;

-- Insert initial migration record
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.audit_logs 
    WHERE action = 'account_created' 
    LIMIT 1
  ) THEN
    -- Log this migration
    INSERT INTO public.audit_logs (
      user_id, 
      action, 
      details
    )
    SELECT 
      id,
      'account_created',
      jsonb_build_object(
        'email', email,
        'migrated', true,
        'migration_date', NOW()
      )
    FROM auth.users
    WHERE created_at < NOW();
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ GDPR Audit Logs table created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Features enabled:';
  RAISE NOTICE '- Immutable audit trail for GDPR compliance';
  RAISE NOTICE '- RLS policies for data security';
  RAISE NOTICE '- Automatic logging of user registrations';
  RAISE NOTICE '- Summary view for compliance reporting';
  RAISE NOTICE '- User-accessible audit trail function';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Deploy export-user-data edge function';
  RAISE NOTICE '2. Test data export with a real user';
  RAISE NOTICE '3. Verify audit logs are being created';
END $$;

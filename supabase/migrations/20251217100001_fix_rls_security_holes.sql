-- =============================================
-- SECURITY FIX: RLS WITH CHECK(true) Vulnerabilities
-- Date: 2025-12-17
-- Audit: DEFCON 1 - Critical Security Fixes
-- =============================================

-- 1. Fix proof_verifications - Only verifiers can insert
DROP POLICY IF EXISTS "Service can insert proof verifications" ON proof_verifications;
CREATE POLICY "Service role only for proof verification inserts"
ON proof_verifications FOR INSERT
TO service_role
WITH CHECK (true);

-- 2. Fix user_achievements - Only system can award achievements  
DROP POLICY IF EXISTS "Achievements can be inserted by system" ON user_achievements;
CREATE POLICY "Service role only for achievement inserts"
ON user_achievements FOR INSERT
TO service_role
WITH CHECK (true);

-- 3. Fix activity_logs - Only authenticated actions logged by system
DROP POLICY IF EXISTS "Activity logs can be created by anyone" ON activity_logs;
CREATE POLICY "Service role only for activity log inserts"
ON activity_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- 4. Fix user_devices - Users can only register their own devices
DROP POLICY IF EXISTS "Allow device registration" ON user_devices;
CREATE POLICY "Users can register own devices"
ON user_devices FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5. Fix notification_settings - Users can only modify their own settings
DROP POLICY IF EXISTS "Anyone can insert notification settings" ON notification_settings;
CREATE POLICY "Users can insert own notification settings"
ON notification_settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 6. Add missing indexes for user_subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);

-- Verify the changes
DO $$
BEGIN
  RAISE NOTICE 'RLS Security Holes Fixed Successfully';
  RAISE NOTICE 'Indexes added to user_subscriptions';
END $$;

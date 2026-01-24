-- Migration: Fix Subscription Tier Names and Pricing
-- Description: Align subscription tiers with mobile app (basic/premium/platinum)
-- Issues Fixed:
--   1. Tier name mismatch (free→basic, starter→premium, pro→platinum)
--   2. Currency mismatch (USD→TRY for Turkey market)
--   3. Price alignment with mobile app
--   4. Remove 'vip' tier (VIP is now separate admin system)
--   5. Update features to match mobile app exactly

-- ==============================================================
-- 1. UPDATE EXISTING TIERS TO NEW NAMING
-- ==============================================================

-- Rename 'free' → 'basic'
UPDATE subscription_plans 
SET id = 'basic',
    name = 'Basic',
    price = 0,
    interval = 'month',
    features = jsonb_build_array(
      '3 moments per month',
      '20 messages per day', 
      '1 gift per month',
      '10 saved moments',
      '5 photos per moment',
      'Community access',
      '15% withdrawal commission'
    ),
    color = '#6B7280',
    icon = 'star-four-points',
    is_popular = false,
    is_active = true
WHERE id = 'free';

-- If 'free' doesn't exist, insert 'basic'
INSERT INTO subscription_plans (id, name, price, interval, features, is_popular, color, icon, is_active)
SELECT 'basic', 'Basic', 0, 'month',
  jsonb_build_array(
    '3 moments per month',
    '20 messages per day',
    '1 gift per month',
    '10 saved moments',
    '5 photos per moment',
    'Community access',
    '15% withdrawal commission'
  ),
  false, '#6B7280', 'star-four-points', true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE id IN ('free', 'basic'));

-- Rename 'starter' → 'premium'
UPDATE subscription_plans
SET id = 'premium',
    name = 'Premium',
    price = 249.99, -- TRY monthly
    interval = 'month',
    features = jsonb_build_array(
      '15 moments per month',
      'Unlimited messages',
      '10 gifts per month',
      '50 saved moments',
      '10 photos per moment',
      '₺50 LVND monthly gift',
      '10% withdrawal commission',
      '+25 TrustScore monthly',
      'Silver Pro badge',
      '1.5x TrustGarden speed',
      '5% LVND purchase discount',
      'Email support'
    ),
    color = '#3B82F6',
    icon = 'star',
    is_popular = true,
    is_active = true
WHERE id = 'starter';

-- If 'starter' doesn't exist, insert 'premium'
INSERT INTO subscription_plans (id, name, price, interval, features, is_popular, color, icon, is_active)
SELECT 'premium', 'Premium', 249.99, 'month',
  jsonb_build_array(
    '15 moments per month',
    'Unlimited messages',
    '10 gifts per month',
    '50 saved moments',
    '10 photos per moment',
    '₺50 LVND monthly gift',
    '10% withdrawal commission',
    '+25 TrustScore monthly',
    'Silver Pro badge',
    '1.5x TrustGarden speed',
    '5% LVND purchase discount',
    'Email support'
  ),
  true, '#3B82F6', 'star', true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE id IN ('starter', 'premium'));

-- Rename 'pro' → 'platinum'  
UPDATE subscription_plans
SET id = 'platinum',
    name = 'Platinum',
    price = 749.99, -- TRY monthly
    interval = 'month',
    features = jsonb_build_array(
      'Unlimited moments',
      'Unlimited messages',
      'Unlimited gifts',
      'Unlimited saved moments',
      '20 photos per moment',
      '₺150 LVND monthly gift',
      '5% withdrawal commission',
      '+100 TrustScore monthly',
      'Gold Elite badge',
      '3x TrustGarden speed',
      '10% LVND purchase discount',
      '24/7 VIP support',
      'Priority verification',
      'Featured profile'
    ),
    color = '#F59E0B',
    icon = 'crown',
    is_popular = false,
    is_active = true
WHERE id = 'pro';

-- If 'pro' doesn't exist, insert 'platinum'
INSERT INTO subscription_plans (id, name, price, interval, features, is_popular, color, icon, is_active)
SELECT 'platinum', 'Platinum', 749.99, 'month',
  jsonb_build_array(
    'Unlimited moments',
    'Unlimited messages',
    'Unlimited gifts',
    'Unlimited saved moments',
    '20 photos per moment',
    '₺150 LVND monthly gift',
    '5% withdrawal commission',
    '+100 TrustScore monthly',
    'Gold Elite badge',
    '3x TrustGarden speed',
    '10% LVND purchase discount',
    '24/7 VIP support',
    'Priority verification',
    'Featured profile'
  ),
  false, '#F59E0B', 'crown', true
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE id IN ('pro', 'platinum'));

-- ==============================================================
-- 2. MIGRATE EXISTING USER SUBSCRIPTIONS
-- ==============================================================

-- Update user_subscriptions references
UPDATE user_subscriptions SET plan_id = 'basic' WHERE plan_id = 'free';
UPDATE user_subscriptions SET plan_id = 'premium' WHERE plan_id = 'starter';
UPDATE user_subscriptions SET plan_id = 'platinum' WHERE plan_id = 'pro';

-- Deprecate 'vip' tier subscriptions (VIP is now admin-granted status)
-- Move all 'vip' subscriptions to 'platinum'
UPDATE user_subscriptions SET plan_id = 'platinum' WHERE plan_id = 'vip';

-- ==============================================================
-- 3. CLEAN UP OLD TIERS
-- ==============================================================

-- Deactivate old tier IDs (don't delete to preserve history)
UPDATE subscription_plans SET is_active = false WHERE id IN ('free', 'starter', 'pro', 'vip');

-- ==============================================================
-- 4. ADD CURRENCY FIELD FOR MULTI-CURRENCY SUPPORT (Future)
-- ==============================================================

-- Add currency column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='subscription_plans' AND column_name='currency') THEN
        ALTER TABLE subscription_plans ADD COLUMN currency TEXT DEFAULT 'TRY';
    END IF;
END $$;

-- Set currency for new tiers
UPDATE subscription_plans SET currency = 'TRY' WHERE id IN ('basic', 'premium', 'platinum');

-- ==============================================================
-- 5. ADD TIER METADATA (Limits)
-- ==============================================================

-- Add limits column for tier enforcement
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='subscription_plans' AND column_name='limits') THEN
        ALTER TABLE subscription_plans ADD COLUMN limits JSONB DEFAULT '{}';
    END IF;
END $$;

-- Set limits for each tier (for server-side enforcement)
UPDATE subscription_plans 
SET limits = jsonb_build_object(
  'momentsPerMonth', 3,
  'messagesPerDay', 20,
  'giftsPerMonth', 1,
  'savedMoments', 10,
  'photosPerMoment', 5,
  'withdrawalCommission', 0.15
)
WHERE id = 'basic';

UPDATE subscription_plans
SET limits = jsonb_build_object(
  'momentsPerMonth', 15,
  'messagesPerDay', 999999,
  'giftsPerMonth', 10,
  'savedMoments', 50,
  'photosPerMoment', 10,
  'withdrawalCommission', 0.10
)
WHERE id = 'premium';

UPDATE subscription_plans
SET limits = jsonb_build_object(
  'momentsPerMonth', 999999,
  'messagesPerDay', 999999,
  'giftsPerMonth', 999999,
  'savedMoments', 999999,
  'photosPerMoment', 20,
  'withdrawalCommission', 0.05
)
WHERE id = 'platinum';

-- ==============================================================
-- COMMENT
-- ==============================================================

COMMENT ON TABLE subscription_plans IS 'Subscription tiers: basic (free), premium (₺249.99/mo), platinum (₺749.99/mo). VIP is separate admin system.';
COMMENT ON COLUMN subscription_plans.limits IS 'Tier limits for server-side enforcement (momentsPerMonth, messagesPerDay, etc.)';

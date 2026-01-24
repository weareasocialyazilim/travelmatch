-- Migration: Fix Subscription Tier Names and Pricing
-- Description: Align subscription tiers with mobile app (basic/premium/platinum)
-- Issues Fixed:
--   1. Tier name mismatch (free→basic, starter→premium, pro→platinum)
--   2. Currency mismatch (USD→TRY for Turkey market)
--   3. Price alignment with mobile app
--   4. Remove 'vip' tier (VIP is now separate admin system)
--   5. Update features to match mobile app exactly

DO $$ 
BEGIN

  -- 1. BASIC (was free)
  IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE id = 'basic') THEN
     INSERT INTO subscription_plans (id, name, price, interval, features, color, icon, is_popular, is_active)
     VALUES ('basic', 'Basic', 0, 'month', 
       jsonb_build_array(
        '3 moments per month',
        '20 messages per day', 
        '1 gift per month',
        '10 saved moments',
        '5 photos per moment',
        'Community access',
        '15% withdrawal commission'
       ), '#6B7280', 'star-four-points', false, true);
  END IF;
  
  -- Update references
  UPDATE user_limits SET plan_id = 'basic' WHERE plan_id = 'free';
  UPDATE user_subscriptions SET plan_id = 'basic' WHERE plan_id = 'free';
  
  -- Delete old if exists
  DELETE FROM subscription_plans WHERE id = 'free';

  -- 2. PREMIUM (was starter)
  IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE id = 'premium') THEN
     INSERT INTO subscription_plans (id, name, price, interval, features, color, icon, is_popular, is_active)
     VALUES ('premium', 'Premium', 249.99, 'month', 
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
      ), '#3B82F6', 'star', true, true);
  END IF;

  UPDATE user_limits SET plan_id = 'premium' WHERE plan_id = 'starter';
  UPDATE user_subscriptions SET plan_id = 'premium' WHERE plan_id = 'starter';
  DELETE FROM subscription_plans WHERE id = 'starter';

  -- 3. PLATINUM (was pro)
  IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE id = 'platinum') THEN
     INSERT INTO subscription_plans (id, name, price, interval, features, color, icon, is_popular, is_active)
     VALUES ('platinum', 'Platinum', 749.99, 'month', 
      jsonb_build_array(
        'Unlimited moments',
        'Unlimited messages',
        'Unlimited gifts',
        'Unlimited saved moments',
        '20 photos per moment',
        '₺150 LVND monthly gift',
        '5% withdrawal commission',
        '+50 TrustScore monthly',
        'Gold Pro badge',
        '2x TrustGarden speed',
        '10% LVND purchase discount',
        'Priority support',
        'Verified Tick'
       ), '#A855F7', 'crown', false, true);
  END IF;
  
  UPDATE user_limits SET plan_id = 'platinum' WHERE plan_id = 'pro';
  UPDATE user_subscriptions SET plan_id = 'platinum' WHERE plan_id = 'pro';
  DELETE FROM subscription_plans WHERE id = 'pro';
  
  -- 4. VIP (cleanup)
  UPDATE user_limits SET plan_id = 'platinum' WHERE plan_id = 'vip';
  UPDATE user_subscriptions SET plan_id = 'platinum' WHERE plan_id = 'vip';
  DELETE FROM subscription_plans WHERE id = 'vip';

END $$;

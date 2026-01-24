-- Migration: Fix VIP Auto-Subscription Trigger
-- Description: VIP users should get 'platinum' tier (not 'premium')
-- Previous Issue: VIP trigger used 'premium' which doesn't match mobile app tiers

-- ==============================================================
-- UPDATE VIP TRIGGER FUNCTION
-- ==============================================================

CREATE OR REPLACE FUNCTION handle_vip_change_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- ON GRANT (INSERT)
    IF (TG_OP = 'INSERT') THEN
         -- Upsert subscription to PLATINUM (Highest Tier)
         -- VIP users get platinum tier automatically
         UPDATE public.user_subscriptions 
         SET plan_id = 'platinum', 
             status = 'active', 
             updated_at = NOW(),
             provider = 'platform' -- VIP is platform-granted
         WHERE user_id = NEW.user_id;

         IF NOT FOUND THEN
             INSERT INTO public.user_subscriptions (
               user_id, plan_id, status, provider, 
               current_period_start, current_period_end,
               created_at, updated_at
             )
             VALUES (
               NEW.user_id, 'platinum', 'active', 'platform',
               NOW(), NOW() + INTERVAL '1 year', -- VIP gets 1 year
               NOW(), NOW()
             );
         END IF;

    -- ON REVOKE (DELETE)
    ELSIF (TG_OP = 'DELETE') THEN
         -- Revert subscription to BASIC (Free Tier)
         UPDATE public.user_subscriptions
         SET plan_id = 'basic',
             status = 'active',
             provider = 'platform',
             updated_at = NOW()
         WHERE user_id = OLD.user_id;
         
         -- If user had no subscription, create basic tier
         IF NOT FOUND THEN
             INSERT INTO public.user_subscriptions (
               user_id, plan_id, status, provider,
               created_at, updated_at
             )
             VALUES (
               OLD.user_id, 'basic', 'active', 'platform',
               NOW(), NOW()
             );
         END IF;
    END IF;
    
    RETURN NULL; -- After trigger, return value ignored
END;
$$;

-- Recreate trigger (in case it doesn't exist)
DROP TRIGGER IF EXISTS trg_vip_subscription_update ON public.vip_users;
CREATE TRIGGER trg_vip_subscription_update
    AFTER INSERT OR DELETE ON public.vip_users
    FOR EACH ROW
    EXECUTE FUNCTION handle_vip_change_subscription();

-- ==============================================================
-- COMMENT
-- ==============================================================

COMMENT ON FUNCTION handle_vip_change_subscription() IS 'Auto-upgrades VIP users to platinum tier (highest). Reverts to basic on VIP removal.';

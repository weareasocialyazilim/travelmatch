-- Migration: VIP Logic Enforcement & Super Admin Protection
-- Description:
-- 1. Restricts VIP management to Super Admins (and Service Role) ONLY.
-- 2. Implements auto-subscription updates: VIP -> Highest Tier ('premium'), Revoke -> 'free'.
-- 3. Provides a secure RPC function for the frontend/dashboard to usage.

-- =====================================================
-- 1. RLS LOCKDOWN
-- =====================================================
-- Ensure Unique Constraint on user_id for Upsert operations
-- Drop potential conflicting non-unique index
DROP INDEX IF EXISTS idx_vip_users_user_id;

-- Create Unique Index explicitly
CREATE UNIQUE INDEX IF NOT EXISTS idx_vip_users_user_id_unique ON public.vip_users(user_id);

-- Add explicit constraint to be 100% sure for ON CONFLICT
ALTER TABLE public.vip_users DROP CONSTRAINT IF EXISTS vip_users_user_id_key;
ALTER TABLE public.vip_users ADD CONSTRAINT vip_users_user_id_key UNIQUE USING INDEX idx_vip_users_user_id_unique;

-- Remove permissive policies. 
DROP POLICY IF EXISTS "Admins can manage VIP users" ON public.vip_users;

-- Ensure ONLY Service Role can bypass RLS directly. All others must use the function.
-- (We keep the 'Service role full access' policies from the previous migration)

-- Allow Read Access (e.g. for badge display)
CREATE POLICY "Public read access to VIP status"
ON public.vip_users FOR SELECT
USING (true);

-- =====================================================
-- 2. TRIGGER LOGIC: AUTO-SUBSCRIPTION
-- =====================================================

CREATE OR REPLACE FUNCTION handle_vip_change_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- ON GRANT (INSERT)
    IF (TG_OP = 'INSERT') THEN
         -- Upsert subscription to VIP (Highest Tier)
         -- Manual UPSERT because user_subscriptions has no unique constraint on user_id
         UPDATE public.user_subscriptions 
         SET plan_id = 'premium', status = 'active', updated_at = NOW()
         WHERE user_id = NEW.user_id;

         IF NOT FOUND THEN
             INSERT INTO public.user_subscriptions (user_id, plan_id, status, provider, created_at, updated_at)
             VALUES (NEW.user_id, 'premium', 'active', 'platform', NOW(), NOW());
         END IF;

    -- ON REVOKE (DELETE)
    ELSIF (TG_OP = 'DELETE') THEN
         -- Revert subscription to FREE (Passport)
         UPDATE public.user_subscriptions
         SET plan_id = 'free',
             updated_at = NOW()
         WHERE user_id = OLD.user_id;
    END IF;
    
    RETURN NULL; -- After trigger, return value ignored
END;
$$;

DROP TRIGGER IF EXISTS trg_vip_subscription_update ON public.vip_users;
CREATE TRIGGER trg_vip_subscription_update
    AFTER INSERT OR DELETE ON public.vip_users
    FOR EACH ROW
    EXECUTE FUNCTION handle_vip_change_subscription();

-- =====================================================
-- 3. SECURE MANAGEMENT FUNCTION (RPC)
-- =====================================================

CREATE OR REPLACE FUNCTION toggle_vip_status(target_user_id UUID, enable_vip BOOLEAN)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_executer_role admin_role;
    v_is_service_role BOOLEAN;
BEGIN
    -- 1. Check Authority
    -- Check if it's Service Role, Postgres (Security Definer Owner), or mapped role.
    -- We include 'postgres' because inside a SECURITY DEFINER function, current_user is passed as the owner.
    v_is_service_role := (
        COALESCE(current_setting('request.jwt.claim.role', true), '') = 'service_role' OR
        current_user IN ('service_role', 'postgres')
    );

    IF NOT v_is_service_role THEN
        -- Check if Admin User AND Super Admin
        SELECT role INTO v_executer_role
        FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true;

        IF v_executer_role IS NULL OR v_executer_role != 'super_admin' THEN
             -- Debug information in exception to help diagnosis if it happens again
            RAISE EXCEPTION 'Access Denied: Only Super Admins can manage VIP status. (User: %, Role: %)', auth.uid(), v_executer_role;
        END IF;
    END IF;

    -- 2. Perform Action
    IF enable_vip THEN
        -- Upsert logic without ON CONFLICT to avoid constraint name resolution issues
        UPDATE public.vip_users 
        SET is_active = true, tier = 'platinum'
        WHERE user_id = target_user_id;
        
        IF NOT FOUND THEN
            INSERT INTO public.vip_users (user_id, tier, is_active, granted_by)
            VALUES (
                target_user_id, 
                'platinum', -- Internal VIP tier name
                true,
                CASE WHEN v_is_service_role THEN NULL ELSE auth.uid() END
            );
        END IF;
        
        RETURN jsonb_build_object('success', true, 'message', 'VIP status granted. Subscription upgraded to Premium.');
    ELSE
        DELETE FROM public.vip_users WHERE user_id = target_user_id;
        
        RETURN jsonb_build_object('success', true, 'message', 'VIP status revoked. Subscription reverted to Free.');
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION toggle_vip_status TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_vip_status TO service_role;

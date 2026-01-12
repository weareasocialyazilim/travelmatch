-- ============================================
-- Referral System Migration
-- Version: 1.0.0
-- Date: January 2026
-- ============================================

-- Referral Codes Table
CREATE TABLE IF NOT EXISTS public.referral_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(10) UNIQUE NOT NULL,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_active boolean DEFAULT true,
    usage_count integer DEFAULT 0,
    max_uses integer DEFAULT NULL, -- NULL = unlimited
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Referral Rewards Table
CREATE TABLE IF NOT EXISTS public.referral_rewards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    referred_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    referral_code varchar(10) NOT NULL,
    reward_amount numeric(12,2) NOT NULL DEFAULT 50.00,
    reward_currency varchar(3) NOT NULL DEFAULT 'TRY',
    status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'credited', 'expired')),
    credited_at timestamptz DEFAULT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    -- Ensure one referral per user
    UNIQUE(referred_user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON public.referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer_id ON public.referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referred_user_id ON public.referral_rewards(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_status ON public.referral_rewards(status);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
CREATE POLICY "Users can view their own referral codes"
    ON public.referral_codes FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own referral codes"
    ON public.referral_codes FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view active codes for validation"
    ON public.referral_codes FOR SELECT
    TO authenticated
    USING (is_active = true);

-- RLS Policies for referral_rewards
CREATE POLICY "Users can view rewards they gave or received"
    ON public.referral_rewards FOR SELECT
    TO authenticated
    USING (referrer_id = auth.uid() OR referred_user_id = auth.uid());

CREATE POLICY "System can create referral rewards"
    ON public.referral_rewards FOR INSERT
    TO authenticated
    WITH CHECK (referred_user_id = auth.uid());

-- Function to credit referral bonus to wallet
CREATE OR REPLACE FUNCTION public.credit_referral_bonus(
    p_user_id uuid,
    p_amount numeric,
    p_currency varchar DEFAULT 'TRY',
    p_description text DEFAULT 'Davet bonusu'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update user's wallet balance
    UPDATE public.users
    SET
        balance = COALESCE(balance, 0) + p_amount,
        updated_at = now()
    WHERE id = p_user_id;

    -- Create transaction record
    INSERT INTO public.transactions (
        user_id,
        type,
        amount,
        currency,
        status,
        description,
        created_at
    ) VALUES (
        p_user_id,
        'referral_bonus',
        p_amount,
        p_currency,
        'completed',
        p_description,
        now()
    );

    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.credit_referral_bonus TO authenticated;

-- Updated at trigger for referral_codes
CREATE TRIGGER set_updated_at_referral_codes
    BEFORE UPDATE ON public.referral_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Updated at trigger for referral_rewards
CREATE TRIGGER set_updated_at_referral_rewards
    BEFORE UPDATE ON public.referral_rewards
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Add referral_bonus to transactions type enum if not exists
DO $$
BEGIN
    -- Check if transactions table has a type column with enum
    -- If it's a varchar, we don't need to alter anything
    -- This is a safe no-op if the type is already supported
    NULL;
END $$;

COMMENT ON TABLE public.referral_codes IS 'User referral codes for invite system';
COMMENT ON TABLE public.referral_rewards IS 'Tracks referral rewards between users';
COMMENT ON FUNCTION public.credit_referral_bonus IS 'Credits referral bonus to user wallet';

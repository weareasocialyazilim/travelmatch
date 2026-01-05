-- Add Subscriptions Tables

-- ============================================
-- SUBSCRIPTION PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY, -- 'free', 'starter', 'pro', 'vip'
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  interval TEXT CHECK (interval IN ('month', 'year')),
  features JSONB DEFAULT '[]',
  is_popular BOOLEAN DEFAULT FALSE,
  color TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- USER SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES subscription_plans(id),
  status TEXT CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  provider TEXT DEFAULT 'stripe', -- or 'apple', 'google'
  provider_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add RLS Policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Plans are readable by everyone
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Plans are viewable by everyone' AND tablename = 'subscription_plans'
    ) THEN
        CREATE POLICY "Plans are viewable by everyone" ON subscription_plans FOR SELECT USING (true);
    END IF;
END $$;

-- Users can view their own subscriptions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own subscriptions' AND tablename = 'user_subscriptions'
    ) THEN
        CREATE POLICY "Users can view own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- Insert Default Plans (matching constants/plans.ts)
INSERT INTO subscription_plans (id, name, price, interval, features, is_popular, color, icon) VALUES
('free', 'Free', 0, 'month', '["3 gestures per month", "Basic proof verification", "Community access", "Profile with Trust Score"]', false, '#666666', 'gift'),
('starter', 'Starter', 10, 'month', '["10 gestures per month", "Priority proof verification", "Advanced analytics", "Badge & recognition", "Email support"]', false, '#FF385C', 'rocket'),
('pro', 'Pro', 25, 'month', '["Unlimited gestures", "Instant verification", "Premium analytics", "Featured profile", "Priority support", "API access", "Custom branding"]', true, '#7B61FF', 'star'),
('vip', 'VIP', 50, 'month', '["All Pro features", "Dedicated account manager", "White-label solution", "Custom integrations", "Enterprise support", "Exclusive events access", "Partnership opportunities"]', false, '#FFB800', 'crown')
ON CONFLICT (id) DO NOTHING;

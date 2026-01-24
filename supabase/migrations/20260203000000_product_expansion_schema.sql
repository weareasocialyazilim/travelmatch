-- Migration: 20260203000000_product_expansion_schema.sql
-- Description: Core tables for Lovendo 2026 Product Expansion (Follows, Drops, Offers, Inbound Settings)

-- ============================================
-- 1. USER FOLLOWS
-- ============================================
CREATE TABLE IF NOT EXISTS user_follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT different_users CHECK (follower_id != following_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- RLS
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- Anyone can see who follows whom (or restricted to counts? Keep strict initially)
-- Let's allow users to see their own graph + public counts mostly.
-- For now: public read to support "Followers" lists if needed, or refine later.
CREATE POLICY "Public read follows" ON user_follows
  FOR SELECT TO authenticated USING (true); -- Optimize later if privacy needed

CREATE POLICY "Users can follow" ON user_follows
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON user_follows
  FOR DELETE TO authenticated USING (auth.uid() = follower_id);


-- ============================================
-- 2. INBOUND SETTINGS (Creator Controls)
-- ============================================
CREATE TABLE IF NOT EXISTS inbound_settings (
  owner_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- settings schema example: { "followers_only": boolean, "min_tier": int, "daily_cap": int, "city_allowlist": [] }
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE inbound_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own settings" ON inbound_settings
  FOR SELECT TO authenticated USING (auth.uid() = owner_id);

-- System or Owner can update
CREATE POLICY "Users update own settings" ON inbound_settings
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
  
CREATE POLICY "Users insert own settings" ON inbound_settings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

-- Service role/Admin access
CREATE POLICY "Admin full access settings" ON inbound_settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);


-- ============================================
-- 3. CREATOR DROPS
-- ============================================
CREATE TABLE IF NOT EXISTS creator_drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  city TEXT NOT NULL, -- normalized city name or ID
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'ended', 'paused')),
  rules JSONB DEFAULT '{}'::jsonb, -- e.g. { "min_tier": 2, "vip_only": true }
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_drops_city_status ON creator_drops(city, status);
CREATE INDEX IF NOT EXISTS idx_creator_drops_creator ON creator_drops(creator_id);

-- RLS
ALTER TABLE creator_drops ENABLE ROW LEVEL SECURITY;

-- Public can see LIVE drops
CREATE POLICY "Public view live drops" ON creator_drops
  FOR SELECT TO authenticated USING (status = 'live');

-- Creator can see all their drops
CREATE POLICY "Creator view own drops" ON creator_drops
  FOR SELECT TO authenticated USING (auth.uid() = creator_id);

-- Creator can insert/update own drops
CREATE POLICY "Creator manage own drops" ON creator_drops
  FOR ALL TO authenticated USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);


-- ============================================
-- 4. DROP MOMENT TEMPLATES
-- ============================================
CREATE TABLE IF NOT EXISTS drop_moment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id UUID NOT NULL REFERENCES creator_drops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_window JSONB, -- { "start": "18:00", "end": "22:00" } or specific dates
  location_hint JSONB, -- { "lat": ..., "lng": ..., "radius": ... }
  min_tier INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drop_templates_drop_id ON drop_moment_templates(drop_id);

-- RLS
ALTER TABLE drop_moment_templates ENABLE ROW LEVEL SECURITY;

-- Inherits visibility from drops largely, but let's make it explicit
CREATE POLICY "Public view templates of live drops" ON drop_moment_templates
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM creator_drops d 
      WHERE d.id = drop_moment_templates.drop_id AND d.status = 'live'
    )
  );

CREATE POLICY "Creator view manage templates" ON drop_moment_templates
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM creator_drops d 
      WHERE d.id = drop_moment_templates.drop_id AND d.creator_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM creator_drops d 
      WHERE d.id = drop_moment_templates.drop_id AND d.creator_id = auth.uid()
    )
  );


-- ============================================
-- 5. OFFER REQUESTS (Offer-as-Request)
-- ============================================
CREATE TABLE IF NOT EXISTS offer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Context (Optional: could be a Direct Offer or via Drop)
  drop_id UUID REFERENCES creator_drops(id) ON DELETE SET NULL,
  moment_template_id UUID REFERENCES drop_moment_templates(id) ON DELETE SET NULL,
  
  -- Offer Details
  amount_credits INT NOT NULL CHECK (amount_credits > 0),
  currency TEXT DEFAULT 'LVND', -- Consumable Credit Unit
  message TEXT, -- validated length in UI + Constraint? 
  
  -- State
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  
  -- Anti-abuse / Context
  metadata JSONB DEFAULT '{}'::jsonb, -- { "risk_score": 0.5, "device_id": "..." }
  
  CONSTRAINT sender_not_receiver CHECK (sender_id != receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_offer_requests_sender ON offer_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_offer_requests_receiver_status ON offer_requests(receiver_id, status);

-- RLS
ALTER TABLE offer_requests ENABLE ROW LEVEL SECURITY;

-- Sender can view own
CREATE POLICY "Sender view own" ON offer_requests
  FOR SELECT TO authenticated USING (auth.uid() = sender_id);

-- Receiver can view own
CREATE POLICY "Receiver view own" ON offer_requests
  FOR SELECT TO authenticated USING (auth.uid() = receiver_id);

-- Insert: Sender can insert (Additional gating checks usually done in RPC/After trigger, but basic RLS here)
CREATE POLICY "Sender insert" ON offer_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- Update: 
-- - Receiver can ACCEPT/DECLINE
-- - Sender can CANCEL (if pending)
-- Complex logic is better handled via RPC often, but standard RLS for simple updates:
CREATE POLICY "Receiver update status" ON offer_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id AND (status IN ('accepted', 'declined')));

CREATE POLICY "Sender cancel" ON offer_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = sender_id AND status = 'pending')
  WITH CHECK (auth.uid() = sender_id AND status = 'cancelled');


-- ============================================
-- 6. TRIGGER FOR UPDATED_AT
-- ============================================
CREATE TRIGGER update_inbound_settings_updated_at
  BEFORE UPDATE ON inbound_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creator_drops_updated_at
  BEFORE UPDATE ON creator_drops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offer_requests_updated_at
  BEFORE UPDATE ON offer_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

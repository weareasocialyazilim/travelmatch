-- ============================================================================
-- LOVENDO OPTIMIZED DATABASE SCHEMA
-- v1.0.0 - Clean Architecture for Production
-- ============================================================================
-- Bu dosya: Ideal schema yapısını gösterir
-- Uygulama: Migration squash sonrası referans olarak kullanılabilir
-- ============================================================================

-- ============================================================================
-- SECTION 1: CORE TABLES (Auth & Users)
-- ============================================================================

-- Profiles - Linked to auth.users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'platinum')),
  trust_score DECIMAL(3,2) DEFAULT 5.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = (SELECT auth.uid()));

CREATE POLICY "Public can view profiles" ON public.profiles
  FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_profiles_subscription ON public.profiles(subscription_tier);
CREATE INDEX idx_profiles_trust_score ON public.profiles(trust_score DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- SECTION 2: MOMENTS (Core Business)
-- ============================================================================

CREATE TABLE public.moments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'TRY',
  location_name TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  image_url TEXT,
  image_cloudflare_id TEXT,
  image_blur_hash TEXT,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'sold')),
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view published moments" ON public.moments
  FOR SELECT USING (status = 'published');

CREATE POLICY "Owners can manage own moments" ON public.moments
  FOR ALL USING (user_id = (SELECT auth.uid()));

-- Indexes (PostGIS for location-based queries)
CREATE INDEX idx_moments_user ON public.moments(user_id);
CREATE INDEX idx_moments_status ON public.moments(status);
CREATE INDEX idx_moments_price ON public.moments(price);
CREATE INDEX idx_moments_created ON public.moments(created_at DESC);

-- PostGIS index (if using geography)
CREATE INDEX idx_moments_geo ON public.moments USING GIST (ST_MakePoint(latitude, longitude));

CREATE TRIGGER update_moments_updated_at
  BEFORE UPDATE ON public.moments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- SECTION 3: CONVERSATIONS & MESSAGES
-- ============================================================================

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID REFERENCES public.moments(id) ON DELETE CASCADE,
  request_id UUID,  -- Optional linked request
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_status TEXT DEFAULT 'pending' CHECK (creator_status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  creator_message TEXT,
  traveler_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  traveler_status TEXT CHECK (traveler_status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  traveler_message TEXT,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'TRY',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled', 'disputed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view conversations" ON public.conversations
  FOR SELECT USING (
    creator_id = (SELECT auth.uid())
    OR traveler_id = (SELECT auth.uid())
  );

CREATE POLICY "Participants can manage conversations" ON public.conversations
  FOR ALL USING (
    creator_id = (SELECT auth.uid())
    OR traveler_id = (SELECT auth.uid())
  );

CREATE INDEX idx_conversations_moment ON public.conversations(moment_id);
CREATE INDEX idx_conversations_creator ON public.conversations(creator_id);
CREATE INDEX idx_conversations_traveler ON public.conversations(traveler_id);
CREATE INDEX idx_conversations_status ON public.conversations(status);

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation participants can view messages" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id
      AND (creator_id = (SELECT auth.uid()) OR traveler_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Participants can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id
      AND (creator_id = (SELECT auth.uid()) OR traveler_id = (SELECT auth.uid()))
    )
  );

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created ON public.messages(created_at);

-- ============================================================================
-- SECTION 4: PAYMENTS & ESCROW
-- ============================================================================

CREATE TABLE public.escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  platform_fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'held', 'released', 'refunded', 'disputed')),
  payment_method TEXT,
  payment_id TEXT,
  hold_expires_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view escrow" ON public.escrow_transactions
  FOR SELECT USING (
    payer_id = (SELECT auth.uid())
    OR payee_id = (SELECT auth.uid())
  );

CREATE POLICY "Service role manages escrow" ON public.escrow_transactions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_escrow_conversation ON public.escrow_transactions(conversation_id);
CREATE INDEX idx_escrow_payer ON public.escrow_transactions(payer_id);
CREATE INDEX idx_escrow_payee ON public.escrow_transactions(payee_id);
CREATE INDEX idx_escrow_status ON public.escrow_transactions(status);

CREATE TRIGGER update_escrow_updated_at
  BEFORE UPDATE ON public.escrow_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- SECTION 5: REVIEWS & THANK YOUS
-- ============================================================================

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id UUID NOT NULL REFERENCES public.moments(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  type TEXT DEFAULT 'review' CHECK (type IN ('review', 'thank_you', 'complaint')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Participants can manage reviews" ON public.reviews
  FOR ALL USING (
    reviewer_id = (SELECT auth.uid())
    OR reviewed_id = (SELECT auth.uid())
  );

CREATE INDEX idx_reviews_moment ON public.reviews(moment_id);
CREATE INDEX idx_reviews_reviewer ON public.reviews(reviewer_id);
CREATE INDEX idx_reviews_ratings ON public.reviews(rating DESC);

-- ============================================================================
-- SECTION 6: REPORTING & ANALYTICS
-- ============================================================================

-- No direct writes from app - populated by triggers/background jobs
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage analytics" ON public.analytics_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_analytics_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_user ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_created ON public.analytics_events(created_at DESC);

-- ============================================================================
-- SECTION 7: SYSTEM TABLES (Admin)
-- ============================================================================

CREATE TABLE public.system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages config" ON public.system_config
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- SECTION 8: FUNCTIONS (Secure Pattern)
-- ============================================================================

-- Helper to get current user safely
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'pg_catalog', 'public'
AS $$
BEGIN
  RETURN (SELECT auth.uid());
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$;

-- Generic audit function
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_event_type TEXT,
  p_user_id UUID,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'pg_catalog', 'public'
AS $$
BEGIN
  INSERT INTO public.analytics_events (event_type, user_id, resource_type, resource_id, metadata)
  VALUES (p_event_type, p_user_id, p_resource_type, p_resource_id, p_metadata);
END;
$$;

-- ============================================================================
-- SECTION 9: SUMMARY
-- ============================================================================
/*
Tables with RLS: 8
Tables without RLS: 0 (except system tables)
Security Definer Functions: 2 (current_user_id, log_audit_event)
Performance Optimized: Indexes on all FK and common query columns
*/

-- Verification query:
/*
SELECT 'Tables with RLS' as check_type, COUNT(*) as count FROM pg_tables
WHERE schemaname = 'public'
AND EXISTS (SELECT 1 FROM pg_policies WHERE tablename = pg_tables.tablename)
UNION ALL
SELECT 'Tables without RLS' as check_type, COUNT(*) as count FROM pg_tables
WHERE schemaname = 'public'
AND NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = pg_tables.tablename)
AND tablename NOT LIKE 'pg_%'
AND tablename NOT LIKE 'supabase_%';
*/

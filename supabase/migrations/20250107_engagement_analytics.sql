-- Engagement & Analytics Database Schema
-- Migration: 20250107_engagement_analytics.sql
-- Purpose: Viral loops, gamification, referrals, analytics

-- ============================================
-- VIRAL LOOP & REFERRAL TABLES
-- ============================================

-- Viral events tracking
CREATE TABLE IF NOT EXISTS viral_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'moment_created', 'match_made', 'trip_completed', etc.
  metadata JSONB DEFAULT '{}',
  trigger_shown BOOLEAN DEFAULT false,
  trigger_timing TEXT, -- 'immediate', 'delayed', 'optimal'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_viral_events_user ON viral_events(user_id);
CREATE INDEX idx_viral_events_type ON viral_events(event_type);
CREATE INDEX idx_viral_events_created ON viral_events(created_at);

-- Referral links
CREATE TABLE IF NOT EXISTS referral_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL, -- 'moment_created', 'match_made', etc.
  metadata JSONB DEFAULT '{}',
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referral_links_user ON referral_links(user_id);
CREATE INDEX idx_referral_links_code ON referral_links(referral_code);

-- Referral conversions
CREATE TABLE IF NOT EXISTS referral_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  source TEXT NOT NULL,
  converted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_referral_conversions_referrer ON referral_conversions(referrer_id);
CREATE INDEX idx_referral_conversions_referee ON referral_conversions(referee_id);
CREATE INDEX idx_referral_conversions_date ON referral_conversions(converted_at);

-- User viral metrics (aggregated)
CREATE TABLE IF NOT EXISTS user_viral_metrics (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  k_factor DECIMAL(10, 4) DEFAULT 0,
  viral_cycle_time INTEGER DEFAULT 0, -- hours
  invite_conversion_rate DECIMAL(10, 4) DEFAULT 0,
  share_rate DECIMAL(10, 4) DEFAULT 0,
  viral_growth_rate DECIMAL(10, 4) DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled viral triggers
CREATE TABLE IF NOT EXISTS scheduled_viral_triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trigger_event TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scheduled_triggers_user ON scheduled_viral_triggers(user_id);
CREATE INDEX idx_scheduled_triggers_time ON scheduled_viral_triggers(scheduled_for);

-- ============================================
-- GAMIFICATION & REWARDS
-- ============================================

-- User engagement metrics
CREATE TABLE IF NOT EXISTS user_engagement_metrics (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  moments_created INTEGER DEFAULT 0,
  matches_made INTEGER DEFAULT 0,
  trips_completed INTEGER DEFAULT 0,
  gifts_sent INTEGER DEFAULT 0,
  referrals_converted INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  avg_sessions_per_week DECIMAL(10, 2) DEFAULT 0,
  last_session_at TIMESTAMPTZ,
  is_premium BOOLEAN DEFAULT false,
  user_level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reward grants log
CREATE TABLE IF NOT EXISTS reward_grants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL, -- 'credits', 'premium_days', 'badge', 'boost', 'unlock'
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  granted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reward_grants_user ON reward_grants(user_id);
CREATE INDEX idx_reward_grants_type ON reward_grants(reward_type);
CREATE INDEX idx_reward_grants_date ON reward_grants(granted_at);

-- Engagement challenges
CREATE TABLE IF NOT EXISTS engagement_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target INTEGER NOT NULL, -- e.g., 10 moments, 5 matches
  reward JSONB NOT NULL, -- { type, amount, description }
  active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User challenge progress
CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES engagement_challenges(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

CREATE INDEX idx_user_challenge_progress_user ON user_challenge_progress(user_id);
CREATE INDEX idx_user_challenge_progress_challenge ON user_challenge_progress(challenge_id);

-- ============================================
-- SOCIAL FEATURES
-- ============================================

-- User connections (friendships)
CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

CREATE INDEX idx_user_connections_user ON user_connections(user_id);
CREATE INDEX idx_user_connections_connected ON user_connections(connected_user_id);
CREATE INDEX idx_user_connections_status ON user_connections(status);

-- User activity feed
CREATE TABLE IF NOT EXISTS user_activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'moment_created', 'match_made', etc.
  metadata JSONB DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'friends', -- 'public', 'friends', 'private'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_feed_user ON user_activity_feed(user_id);
CREATE INDEX idx_activity_feed_type ON user_activity_feed(activity_type);
CREATE INDEX idx_activity_feed_created ON user_activity_feed(created_at DESC);

-- ============================================
-- ANALYTICS TABLES
-- ============================================

-- User sessions for engagement tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_start TIMESTAMPTZ NOT NULL,
  session_end TIMESTAMPTZ,
  duration_seconds INTEGER,
  pages_viewed INTEGER DEFAULT 0,
  actions_taken INTEGER DEFAULT 0,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  platform TEXT, -- 'ios', 'android', 'web'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_start ON user_sessions(session_start);

-- Daily metrics snapshots
CREATE TABLE IF NOT EXISTS daily_metrics (
  date DATE PRIMARY KEY,
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  dau INTEGER DEFAULT 0,
  mau INTEGER DEFAULT 0,
  moments_created INTEGER DEFAULT 0,
  matches_made INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue tracking
CREATE TABLE IF NOT EXISTS revenue_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'subscription', 'gift_purchase', 'boost', etc.
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_revenue_events_user ON revenue_events(user_id);
CREATE INDEX idx_revenue_events_type ON revenue_events(event_type);
CREATE INDEX idx_revenue_events_date ON revenue_events(created_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE viral_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_viral_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY viral_events_user_policy ON viral_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY referral_links_user_policy ON referral_links
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_engagement_metrics_policy ON user_engagement_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY reward_grants_user_policy ON reward_grants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_challenge_progress_policy ON user_challenge_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_connections_policy ON user_connections
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

CREATE POLICY user_activity_feed_visibility ON user_activity_feed
  FOR SELECT USING (
    visibility = 'public' OR
    (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM user_connections
      WHERE (user_id = auth.uid() AND connected_user_id = user_activity_feed.user_id)
         OR (connected_user_id = auth.uid() AND user_id = user_activity_feed.user_id)
      AND status = 'accepted'
    )) OR
    auth.uid() = user_id
  );

CREATE POLICY user_sessions_policy ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY viral_events_service_policy ON viral_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY referral_conversions_service_policy ON referral_conversions
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Calculate viral cycle time
CREATE OR REPLACE FUNCTION calculate_viral_cycle_time(time_window_days INTEGER)
RETURNS TABLE (avg_cycle_time DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT AVG(EXTRACT(EPOCH FROM (rl.created_at - u.created_at)) / 3600)::DECIMAL
  FROM referral_links rl
  JOIN users u ON rl.user_id = u.id
  WHERE rl.created_at >= NOW() - (time_window_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Calculate session metrics
CREATE OR REPLACE FUNCTION calculate_session_metrics(start_date TIMESTAMPTZ)
RETURNS TABLE (
  avg_duration INTEGER,
  avg_sessions DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG(duration_seconds)::INTEGER as avg_duration,
    (COUNT(*)::DECIMAL / COUNT(DISTINCT user_id)) as avg_sessions
  FROM user_sessions
  WHERE session_start >= start_date;
END;
$$ LANGUAGE plpgsql;

-- Calculate revenue metrics
CREATE OR REPLACE FUNCTION calculate_revenue_metrics(start_date TIMESTAMPTZ)
RETURNS TABLE (mrr DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT SUM(amount)::DECIMAL as mrr
  FROM revenue_events
  WHERE event_type = 'subscription'
    AND created_at >= start_date
    AND created_at < start_date + INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

-- Get daily user growth
CREATE OR REPLACE FUNCTION get_daily_user_growth(start_date TIMESTAMPTZ, days INTEGER)
RETURNS TABLE (
  date DATE,
  new_users INTEGER,
  total_users INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE dates AS (
    SELECT start_date::DATE as date
    UNION ALL
    SELECT (date + INTERVAL '1 day')::DATE
    FROM dates
    WHERE date < (start_date + (days || ' days')::INTERVAL)::DATE
  )
  SELECT
    d.date,
    COUNT(u.id)::INTEGER as new_users,
    (SELECT COUNT(*)::INTEGER FROM users WHERE created_at::DATE <= d.date) as total_users
  FROM dates d
  LEFT JOIN users u ON u.created_at::DATE = d.date
  GROUP BY d.date
  ORDER BY d.date;
END;
$$ LANGUAGE plpgsql;

-- Calculate retention rate
CREATE OR REPLACE FUNCTION calculate_retention_rate(days INTEGER)
RETURNS TABLE (retention_rate DECIMAL) AS $$
BEGIN
  RETURN QUERY
  WITH cohort AS (
    SELECT id, created_at::DATE as signup_date
    FROM users
    WHERE created_at >= NOW() - (days || ' days')::INTERVAL
  ),
  retained AS (
    SELECT c.id
    FROM cohort c
    WHERE EXISTS (
      SELECT 1 FROM user_sessions us
      WHERE us.user_id = c.id
        AND us.session_start >= c.signup_date + INTERVAL '7 days'
    )
  )
  SELECT (COUNT(r.id)::DECIMAL / NULLIF(COUNT(c.id), 0))::DECIMAL as retention_rate
  FROM cohort c
  LEFT JOIN retained r ON c.id = r.id;
END;
$$ LANGUAGE plpgsql;

-- Calculate LTV (Lifetime Value)
CREATE OR REPLACE FUNCTION calculate_ltv()
RETURNS TABLE (ltv DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT AVG(user_revenue)::DECIMAL as ltv
  FROM (
    SELECT user_id, SUM(amount) as user_revenue
    FROM revenue_events
    GROUP BY user_id
  ) user_revenues;
END;
$$ LANGUAGE plpgsql;

-- Calculate CAC (Customer Acquisition Cost)
CREATE OR REPLACE FUNCTION calculate_cac(days INTEGER)
RETURNS TABLE (cac DECIMAL) AS $$
BEGIN
  RETURN QUERY
  WITH marketing_spend AS (
    SELECT SUM(amount) as total_spend
    FROM revenue_events
    WHERE event_type = 'marketing'
      AND created_at >= NOW() - (days || ' days')::INTERVAL
  ),
  new_users AS (
    SELECT COUNT(*) as count
    FROM users
    WHERE created_at >= NOW() - (days || ' days')::INTERVAL
  )
  SELECT (ms.total_spend / NULLIF(nu.count, 0))::DECIMAL as cac
  FROM marketing_spend ms, new_users nu;
END;
$$ LANGUAGE plpgsql;

-- Get revenue breakdown
CREATE OR REPLACE FUNCTION get_revenue_breakdown(start_date TIMESTAMPTZ)
RETURNS TABLE (
  source TEXT,
  amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT event_type as source, SUM(amount)::DECIMAL as amount
  FROM revenue_events
  WHERE created_at >= start_date
  GROUP BY event_type
  ORDER BY amount DESC;
END;
$$ LANGUAGE plpgsql;

-- Get cohort retention
CREATE OR REPLACE FUNCTION get_cohort_retention(start_date TIMESTAMPTZ)
RETURNS TABLE (
  cohort_month TEXT,
  day INTEGER,
  retention_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH cohorts AS (
    SELECT
      id as user_id,
      TO_CHAR(created_at, 'YYYY-MM') as cohort,
      created_at
    FROM users
    WHERE created_at >= start_date
  ),
  retention AS (
    SELECT
      c.cohort,
      EXTRACT(DAY FROM us.session_start - c.created_at)::INTEGER as day,
      COUNT(DISTINCT c.user_id)::DECIMAL / (
        SELECT COUNT(*) FROM cohorts WHERE cohort = c.cohort
      ) as rate
    FROM cohorts c
    JOIN user_sessions us ON us.user_id = c.user_id
    GROUP BY c.cohort, day
  )
  SELECT cohort as cohort_month, day, rate as retention_rate
  FROM retention
  ORDER BY cohort, day;
END;
$$ LANGUAGE plpgsql;

-- Get feature usage heatmap
CREATE OR REPLACE FUNCTION get_feature_usage_heatmap(start_date TIMESTAMPTZ)
RETURNS TABLE (
  feature TEXT,
  hour INTEGER,
  usage_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    activity_type as feature,
    EXTRACT(HOUR FROM created_at)::INTEGER as hour,
    COUNT(*)::INTEGER as usage_count
  FROM user_activity_feed
  WHERE created_at >= start_date
  GROUP BY activity_type, hour
  ORDER BY feature, hour;
END;
$$ LANGUAGE plpgsql;

-- Calculate engagement funnel
CREATE OR REPLACE FUNCTION calculate_engagement_funnel()
RETURNS TABLE (
  step_name TEXT,
  user_count INTEGER,
  avg_time_to_next INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH funnel_steps AS (
    SELECT 'Signup' as step, COUNT(*)::INTEGER as users, 0 as avg_time
    FROM users
    UNION ALL
    SELECT 'Profile Complete', COUNT(*)::INTEGER, 
      AVG(EXTRACT(EPOCH FROM (updated_at - created_at)))::INTEGER
    FROM users WHERE profile_complete = true
    UNION ALL
    SELECT 'First Moment', COUNT(DISTINCT user_id)::INTEGER,
      AVG(EXTRACT(EPOCH FROM (m.created_at - u.created_at)))::INTEGER
    FROM moments m JOIN users u ON m.user_id = u.id
    UNION ALL
    SELECT 'First Match', COUNT(DISTINCT user_id)::INTEGER,
      AVG(EXTRACT(EPOCH FROM (mt.created_at - u.created_at)))::INTEGER
    FROM matches mt JOIN users u ON mt.user_id = u.id
    UNION ALL
    SELECT 'First Message', COUNT(DISTINCT sender_id)::INTEGER,
      AVG(EXTRACT(EPOCH FROM (msg.created_at - u.created_at)))::INTEGER
    FROM messages msg JOIN users u ON msg.sender_id = u.id
  )
  SELECT step as step_name, users as user_count, avg_time as avg_time_to_next
  FROM funnel_steps;
END;
$$ LANGUAGE plpgsql;

-- Get user segment
CREATE OR REPLACE FUNCTION get_user_segment(
  segment_type TEXT,
  percentile DECIMAL DEFAULT NULL,
  days_inactive INTEGER DEFAULT NULL,
  days_since_signup INTEGER DEFAULT NULL
)
RETURNS TABLE (
  count INTEGER,
  avg_ltv DECIMAL
) AS $$
BEGIN
  IF segment_type = 'power_users' THEN
    RETURN QUERY
    SELECT COUNT(*)::INTEGER, AVG(total_xp)::DECIMAL
    FROM user_engagement_metrics
    WHERE total_xp >= (
      SELECT PERCENTILE_CONT(percentile) WITHIN GROUP (ORDER BY total_xp)
      FROM user_engagement_metrics
    );
  ELSIF segment_type = 'at_risk' THEN
    RETURN QUERY
    SELECT COUNT(*)::INTEGER, 0::DECIMAL
    FROM user_engagement_metrics
    WHERE last_session_at < NOW() - (days_inactive || ' days')::INTERVAL;
  ELSIF segment_type = 'new_users' THEN
    RETURN QUERY
    SELECT COUNT(*)::INTEGER, 0::DECIMAL
    FROM users
    WHERE created_at >= NOW() - (days_since_signup || ' days')::INTERVAL;
  ELSIF segment_type = 'premium' THEN
    RETURN QUERY
    SELECT COUNT(*)::INTEGER, 0::DECIMAL
    FROM user_engagement_metrics
    WHERE is_premium = true;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add user credits (utility function)
CREATE OR REPLACE FUNCTION add_user_credits(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET credits = COALESCE(credits, 0) + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Extend premium (utility function)
CREATE OR REPLACE FUNCTION extend_premium(user_id UUID, days INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET premium_until = COALESCE(
    GREATEST(premium_until, NOW()),
    NOW()
  ) + (days || ' days')::INTERVAL
  WHERE id = user_id;
  
  UPDATE user_engagement_metrics
  SET is_premium = true
  WHERE user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update user engagement metrics on moment creation
CREATE OR REPLACE FUNCTION update_metrics_on_moment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_engagement_metrics (user_id, moments_created, updated_at)
  VALUES (NEW.user_id, 1, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    moments_created = user_engagement_metrics.moments_created + 1,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER moment_created_metrics
  AFTER INSERT ON moments
  FOR EACH ROW
  EXECUTE FUNCTION update_metrics_on_moment();

-- Update user engagement metrics on match
CREATE OR REPLACE FUNCTION update_metrics_on_match()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_engagement_metrics (user_id, matches_made, updated_at)
  VALUES (NEW.user_id, 1, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    matches_made = user_engagement_metrics.matches_made + 1,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER match_created_metrics
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_metrics_on_match();

-- Log activity to feed
CREATE OR REPLACE FUNCTION log_activity_to_feed()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity_feed (user_id, activity_type, metadata, visibility)
  VALUES (
    NEW.user_id,
    TG_TABLE_NAME || '_created',
    jsonb_build_object('id', NEW.id),
    'friends'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER moment_activity_feed
  AFTER INSERT ON moments
  FOR EACH ROW
  EXECUTE FUNCTION log_activity_to_feed();

CREATE TRIGGER match_activity_feed
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION log_activity_to_feed();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Create sample engagement challenges
INSERT INTO engagement_challenges (title, description, target, reward, ends_at) VALUES
  (
    'First Week Warrior',
    'Create 5 moments in your first week',
    5,
    '{"type": "credits", "amount": 100, "description": "100 bonus credits!"}'::jsonb,
    NOW() + INTERVAL '7 days'
  ),
  (
    'Social Butterfly',
    'Make 10 connections this month',
    10,
    '{"type": "premium_days", "amount": 7, "description": "7 days of premium!"}'::jsonb,
    NOW() + INTERVAL '30 days'
  ),
  (
    'Travel Storyteller',
    'Post 20 moments with videos',
    20,
    '{"type": "badge", "amount": 1, "description": "Exclusive Storyteller badge"}'::jsonb,
    NOW() + INTERVAL '60 days'
  )
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_premium ON users(premium_until);
CREATE INDEX IF NOT EXISTS idx_moments_created ON moments(created_at);
CREATE INDEX IF NOT EXISTS idx_matches_created ON matches(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

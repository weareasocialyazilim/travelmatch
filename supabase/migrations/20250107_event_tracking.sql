-- Advanced Event Tracking & Analytics Schema
-- Migration: 20250107_event_tracking.sql
-- Purpose: Custom analytics platform (better than Mixpanel/Amplitude)

-- ============================================
-- CORE EVENT TRACKING
-- ============================================

-- Events table (unlimited storage, full ownership)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  anonymous_id TEXT,
  properties JSONB DEFAULT '{}',
  context JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hyper-optimized indexes for queries
CREATE INDEX idx_events_name ON events(event_name);
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX idx_events_anonymous ON events(anonymous_id) WHERE anonymous_id IS NOT NULL;
CREATE INDEX idx_events_name_user ON events(event_name, user_id);
CREATE INDEX idx_events_name_timestamp ON events(event_name, timestamp DESC);

-- JSONB indexes for property queries
CREATE INDEX idx_events_properties ON events USING GIN (properties);
CREATE INDEX idx_events_context ON events USING GIN (context);

-- Partitioning by month for performance (optional, uncomment when data grows)
-- CREATE TABLE events_2025_01 PARTITION OF events
--   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- ============================================
-- USER PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  traits JSONB DEFAULT '{}',
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  session_count INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_first_seen ON user_profiles(first_seen);
CREATE INDEX idx_user_profiles_last_seen ON user_profiles(last_seen);
CREATE INDEX idx_user_profiles_traits ON user_profiles USING GIN (traits);

-- ============================================
-- COHORTS (User Segmentation)
-- ============================================

CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  definition JSONB NOT NULL, -- Conditions for membership
  user_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cohort_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_id, user_id)
);

CREATE INDEX idx_cohort_memberships_cohort ON cohort_memberships(cohort_id);
CREATE INDEX idx_cohort_memberships_user ON cohort_memberships(user_id);

-- ============================================
-- GROUP ANALYTICS (B2B/Teams)
-- ============================================

CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id TEXT UNIQUE NOT NULL, -- External group ID
  traits JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  traits JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX idx_group_memberships_user ON group_memberships(user_id);

-- ============================================
-- A/B TESTING
-- ============================================

CREATE TABLE IF NOT EXISTS ab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  hypothesis TEXT,
  variants JSONB NOT NULL, -- [{ id, name, weight, config }]
  target_event TEXT NOT NULL, -- Success metric
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  status TEXT DEFAULT 'draft', -- draft, running, paused, completed
  results JSONB, -- Calculated results
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  variant_id TEXT NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(test_id, user_id)
);

CREATE INDEX idx_ab_test_assignments_test ON ab_test_assignments(test_id);
CREATE INDEX idx_ab_test_assignments_user ON ab_test_assignments(user_id);
CREATE INDEX idx_ab_test_assignments_variant ON ab_test_assignments(variant_id);

-- ============================================
-- FUNNEL ANALYSIS
-- ============================================

CREATE TABLE IF NOT EXISTS funnels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL, -- [{ event, properties, withinTime }]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS funnel_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_users INTEGER DEFAULT 0,
  step_results JSONB NOT NULL, -- Per-step metrics
  overall_conversion DECIMAL(10, 4) DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(funnel_id, date)
);

CREATE INDEX idx_funnel_results_funnel ON funnel_results(funnel_id);
CREATE INDEX idx_funnel_results_date ON funnel_results(date DESC);

-- ============================================
-- RETENTION ANALYSIS
-- ============================================

CREATE TABLE IF NOT EXISTS retention_cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_date DATE NOT NULL, -- Signup date
  cohort_size INTEGER DEFAULT 0,
  retention_data JSONB DEFAULT '{}', -- { day1: 0.6, day7: 0.4, day30: 0.2 }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cohort_date)
);

-- ============================================
-- AGGREGATED METRICS (Pre-calculated for speed)
-- ============================================

CREATE TABLE IF NOT EXISTS event_metrics_hourly (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hour TIMESTAMPTZ NOT NULL,
  event_name TEXT NOT NULL,
  event_count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  properties_summary JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hour, event_name)
);

CREATE INDEX idx_event_metrics_hourly_hour ON event_metrics_hourly(hour DESC);
CREATE INDEX idx_event_metrics_hourly_event ON event_metrics_hourly(event_name);

CREATE TABLE IF NOT EXISTS event_metrics_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  event_name TEXT NOT NULL,
  event_count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  properties_summary JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, event_name)
);

CREATE INDEX idx_event_metrics_daily_date ON event_metrics_daily(date DESC);
CREATE INDEX idx_event_metrics_daily_event ON event_metrics_daily(event_name);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY events_service_policy ON events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY user_profiles_service_policy ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own data
CREATE POLICY events_user_policy ON events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_profiles_user_policy ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Increment user event count
CREATE OR REPLACE FUNCTION increment_user_event_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_profiles (user_id, total_events, last_seen)
  VALUES (user_id, 1, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_events = user_profiles.total_events + 1,
    last_seen = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate event metrics (hourly aggregation)
CREATE OR REPLACE FUNCTION aggregate_events_hourly()
RETURNS VOID AS $$
DECLARE
  last_hour TIMESTAMPTZ;
BEGIN
  last_hour := DATE_TRUNC('hour', NOW() - INTERVAL '1 hour');
  
  INSERT INTO event_metrics_hourly (hour, event_name, event_count, unique_users)
  SELECT
    last_hour,
    event_name,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users
  FROM events
  WHERE timestamp >= last_hour
    AND timestamp < last_hour + INTERVAL '1 hour'
  GROUP BY event_name
  ON CONFLICT (hour, event_name)
  DO UPDATE SET
    event_count = EXCLUDED.event_count,
    unique_users = EXCLUDED.unique_users;
END;
$$ LANGUAGE plpgsql;

-- Calculate daily aggregations
CREATE OR REPLACE FUNCTION aggregate_events_daily()
RETURNS VOID AS $$
DECLARE
  yesterday DATE;
BEGIN
  yesterday := CURRENT_DATE - INTERVAL '1 day';
  
  INSERT INTO event_metrics_daily (date, event_name, event_count, unique_users)
  SELECT
    yesterday,
    event_name,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users
  FROM events
  WHERE timestamp::DATE = yesterday
  GROUP BY event_name
  ON CONFLICT (date, event_name)
  DO UPDATE SET
    event_count = EXCLUDED.event_count,
    unique_users = EXCLUDED.unique_users;
END;
$$ LANGUAGE plpgsql;

-- Get event timeline
CREATE OR REPLACE FUNCTION get_event_timeline(
  p_event_name TEXT,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_interval TEXT DEFAULT 'day'
)
RETURNS TABLE (
  period TIMESTAMPTZ,
  event_count BIGINT,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC(p_interval, timestamp) as period,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users
  FROM events
  WHERE event_name = p_event_name
    AND timestamp >= p_start_date
    AND timestamp <= p_end_date
  GROUP BY period
  ORDER BY period;
END;
$$ LANGUAGE plpgsql;

-- Calculate retention
CREATE OR REPLACE FUNCTION calculate_retention_cohort(p_cohort_date DATE)
RETURNS JSONB AS $$
DECLARE
  cohort_users UUID[];
  retention_data JSONB;
  day_intervals INTEGER[] := ARRAY[1, 7, 14, 30, 60, 90];
  day_interval INTEGER;
  retained_count INTEGER;
  total_count INTEGER;
BEGIN
  -- Get users who signed up on cohort date
  SELECT ARRAY_AGG(id) INTO cohort_users
  FROM users
  WHERE created_at::DATE = p_cohort_date;
  
  total_count := COALESCE(ARRAY_LENGTH(cohort_users, 1), 0);
  
  IF total_count = 0 THEN
    RETURN '{}'::JSONB;
  END IF;
  
  retention_data := '{}'::JSONB;
  
  -- Calculate retention for each day interval
  FOREACH day_interval IN ARRAY day_intervals
  LOOP
    SELECT COUNT(DISTINCT user_id) INTO retained_count
    FROM events
    WHERE user_id = ANY(cohort_users)
      AND timestamp::DATE = p_cohort_date + day_interval
      AND timestamp::DATE > p_cohort_date;
    
    retention_data := retention_data || 
      jsonb_build_object(
        'day' || day_interval::TEXT,
        ROUND((retained_count::DECIMAL / total_count), 4)
      );
  END LOOP;
  
  RETURN retention_data;
END;
$$ LANGUAGE plpgsql;

-- Get top events
CREATE OR REPLACE FUNCTION get_top_events(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  event_name TEXT,
  event_count BIGINT,
  unique_users BIGINT,
  avg_per_user DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.event_name,
    COUNT(*) as event_count,
    COUNT(DISTINCT e.user_id) as unique_users,
    ROUND((COUNT(*)::DECIMAL / NULLIF(COUNT(DISTINCT e.user_id), 0)), 2) as avg_per_user
  FROM events e
  WHERE e.timestamp >= p_start_date
    AND e.timestamp <= p_end_date
  GROUP BY e.event_name
  ORDER BY event_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Property analysis
CREATE OR REPLACE FUNCTION analyze_event_property(
  p_event_name TEXT,
  p_property_key TEXT,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  property_value TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (properties ->> p_property_key) as property_value,
    COUNT(*) as count
  FROM events
  WHERE event_name = p_event_name
    AND timestamp >= p_start_date
    AND timestamp <= p_end_date
    AND properties ? p_property_key
  GROUP BY property_value
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- User event history
CREATE OR REPLACE FUNCTION get_user_event_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  event_name TEXT,
  properties JSONB,
  timestamp TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.event_name,
    e.properties,
    e.timestamp
  FROM events e
  WHERE e.user_id = p_user_id
  ORDER BY e.timestamp DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update user profile on event
CREATE OR REPLACE FUNCTION update_user_profile_on_event()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO user_profiles (user_id, first_seen, last_seen, total_events)
    VALUES (NEW.user_id, NEW.timestamp, NEW.timestamp, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET
      last_seen = NEW.timestamp,
      total_events = user_profiles.total_events + 1,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_update_profile
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile_on_event();

-- ============================================
-- SCHEDULED JOBS (Run via cron/workers)
-- ============================================

-- Hourly aggregation (run every hour)
-- SELECT aggregate_events_hourly();

-- Daily aggregation (run at midnight)
-- SELECT aggregate_events_daily();

-- Retention calculation (run daily for yesterday's cohort)
-- INSERT INTO retention_cohorts (cohort_date, cohort_size, retention_data)
-- SELECT
--   CURRENT_DATE - 1,
--   COUNT(*),
--   calculate_retention_cohort(CURRENT_DATE - 1)
-- FROM users
-- WHERE created_at::DATE = CURRENT_DATE - 1;

-- ============================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================

-- Vacuum settings for high-write table
ALTER TABLE events SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE events SET (autovacuum_analyze_scale_factor = 0.02);

-- Statistics for query planner
ALTER TABLE events ALTER COLUMN event_name SET STATISTICS 1000;
ALTER TABLE events ALTER COLUMN user_id SET STATISTICS 1000;

-- ============================================
-- SAMPLE QUERIES (Common analytics patterns)
-- ============================================

-- DAU (Daily Active Users)
-- SELECT COUNT(DISTINCT user_id) as dau
-- FROM events
-- WHERE timestamp >= CURRENT_DATE;

-- MAU (Monthly Active Users)
-- SELECT COUNT(DISTINCT user_id) as mau
-- FROM events
-- WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days';

-- Event count by hour (today)
-- SELECT
--   DATE_TRUNC('hour', timestamp) as hour,
--   COUNT(*) as events
-- FROM events
-- WHERE timestamp >= CURRENT_DATE
-- GROUP BY hour
-- ORDER BY hour;

-- Top users by event count
-- SELECT
--   user_id,
--   COUNT(*) as event_count
-- FROM events
-- WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
-- GROUP BY user_id
-- ORDER BY event_count DESC
-- LIMIT 100;

-- Conversion rate (signup to purchase)
-- WITH signups AS (
--   SELECT DISTINCT user_id
--   FROM events
--   WHERE event_name = 'signup'
--     AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
-- ),
-- purchases AS (
--   SELECT DISTINCT user_id
--   FROM events
--   WHERE event_name = 'purchase'
--     AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
-- )
-- SELECT
--   COUNT(DISTINCT s.user_id) as total_signups,
--   COUNT(DISTINCT p.user_id) as total_purchases,
--   ROUND((COUNT(DISTINCT p.user_id)::DECIMAL / COUNT(DISTINCT s.user_id)) * 100, 2) as conversion_rate
-- FROM signups s
-- LEFT JOIN purchases p ON s.user_id = p.user_id;

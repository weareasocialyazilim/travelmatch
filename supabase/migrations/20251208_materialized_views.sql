-- ============================================
-- MATERIALIZED VIEWS FOR MOMENTS + PROFILES
-- Date: December 8, 2025
-- Purpose: Optimize frequently-joined queries
-- ============================================

-- ============================================
-- MATERIALIZED VIEW 1: MOMENTS WITH USER INFO
-- Most common query: Moments feed with profile data
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_moments_with_profiles AS
SELECT 
  -- Moment fields
  m.id as moment_id,
  m.user_id,
  m.title,
  m.description,
  m.type,
  m.status,
  m.location as moment_location,
  m.image_url,
  m.price_amount,
  m.price_currency,
  m.created_at as moment_created_at,
  
  -- Profile fields
  p.name as user_name,
  p.avatar_url as user_avatar,
  p.role as user_role,
  p.kyc_status,
  p.bio as user_bio,
  p.location as user_location,
  p.trust_score,
  p.is_verified,
  
  -- Computed fields
  CASE 
    WHEN m.created_at > NOW() - INTERVAL '24 hours' THEN true 
    ELSE false 
  END as is_new,
  
  CASE 
    WHEN p.is_verified = true AND p.trust_score >= 80 THEN true 
    ELSE false 
  END as is_trusted_user,
  
  -- Search optimization
  to_tsvector('english', 
    coalesce(m.title, '') || ' ' || 
    coalesce(m.description, '') || ' ' || 
    coalesce(p.name, '')
  ) as search_vector

FROM moments m
INNER JOIN profiles p ON m.user_id = p.id
WHERE m.status = 'active'
  AND p.kyc_status != 'Banned';

-- Indexes on materialized view
CREATE UNIQUE INDEX idx_mv_moments_profiles_moment_id 
ON mv_moments_with_profiles(moment_id);

CREATE INDEX idx_mv_moments_profiles_user 
ON mv_moments_with_profiles(user_id, moment_created_at DESC);

CREATE INDEX idx_mv_moments_profiles_type 
ON mv_moments_with_profiles(type, moment_created_at DESC);

CREATE INDEX idx_mv_moments_profiles_price 
ON mv_moments_with_profiles(price_amount, price_currency);

CREATE INDEX idx_mv_moments_profiles_verified 
ON mv_moments_with_profiles(is_verified, trust_score DESC);

CREATE INDEX idx_mv_moments_profiles_new 
ON mv_moments_with_profiles(is_new, moment_created_at DESC) 
WHERE is_new = true;

CREATE INDEX idx_mv_moments_profiles_search 
ON mv_moments_with_profiles USING GIN(search_vector);

CREATE INDEX idx_mv_moments_profiles_location 
ON mv_moments_with_profiles USING GIST(moment_location);

-- Comment
COMMENT ON MATERIALIZED VIEW mv_moments_with_profiles IS 
'Optimized moments feed with pre-joined profile data. Refresh every 5 minutes.';

-- ============================================
-- MATERIALIZED VIEW 2: USER PROFILES WITH STATS
-- Profile pages with aggregated data
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_profiles_with_stats AS
SELECT 
  -- Profile fields
  p.id as user_id,
  p.email,
  p.name,
  p.avatar_url,
  p.role,
  p.kyc_status,
  p.bio,
  p.location,
  p.trust_score,
  p.is_verified,
  p.created_at,
  p.updated_at,
  
  -- Moment statistics
  COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'active') as active_moments_count,
  COUNT(DISTINCT m.id) FILTER (WHERE m.status = 'completed') as completed_moments_count,
  COUNT(DISTINCT m.id) as total_moments_count,
  
  -- Transaction statistics
  COUNT(DISTINCT t.id) FILTER (WHERE t.sender_id = p.id) as sent_transactions_count,
  COUNT(DISTINCT t.id) FILTER (WHERE t.receiver_id = p.id) as received_transactions_count,
  COALESCE(SUM(t.amount) FILTER (WHERE t.receiver_id = p.id AND t.status = 'completed'), 0) as total_received_amount,
  
  -- Proof statistics
  COUNT(DISTINCT pr.id) FILTER (WHERE pr.status = 'verified') as verified_proofs_count,
  AVG(pr.ai_score) FILTER (WHERE pr.status = 'verified') as avg_ai_score,
  AVG(pr.community_score) FILTER (WHERE pr.status = 'verified') as avg_community_score,
  
  -- Match statistics
  COUNT(DISTINCT ma.id) as total_matches_count,
  
  -- Activity metrics
  GREATEST(
    COALESCE(MAX(m.created_at), p.created_at),
    COALESCE(MAX(t.created_at), p.created_at),
    p.updated_at
  ) as last_activity_at,
  
  -- Reputation score (computed)
  (
    COALESCE(p.trust_score, 0) * 0.4 +
    COALESCE(COUNT(DISTINCT pr.id) FILTER (WHERE pr.status = 'verified'), 0) * 5 +
    COALESCE(AVG(pr.community_score) FILTER (WHERE pr.status = 'verified'), 0) * 0.3 +
    CASE WHEN p.is_verified THEN 20 ELSE 0 END
  )::numeric(10,2) as reputation_score

FROM profiles p
LEFT JOIN moments m ON p.id = m.user_id
LEFT JOIN transactions t ON p.id = t.sender_id OR p.id = t.receiver_id
LEFT JOIN proofs pr ON p.id = pr.user_id
LEFT JOIN matches ma ON p.id = ma.user_id
WHERE p.kyc_status != 'Banned'
GROUP BY p.id, p.email, p.name, p.avatar_url, p.role, p.kyc_status, 
         p.bio, p.location, p.trust_score, p.is_verified, p.created_at, p.updated_at;

-- Indexes on profiles stats view
CREATE UNIQUE INDEX idx_mv_profiles_stats_user_id 
ON mv_profiles_with_stats(user_id);

CREATE INDEX idx_mv_profiles_stats_verified 
ON mv_profiles_with_stats(is_verified, trust_score DESC);

CREATE INDEX idx_mv_profiles_stats_reputation 
ON mv_profiles_with_stats(reputation_score DESC);

CREATE INDEX idx_mv_profiles_stats_active_moments 
ON mv_profiles_with_stats(active_moments_count DESC);

CREATE INDEX idx_mv_profiles_stats_last_activity 
ON mv_profiles_with_stats(last_activity_at DESC);

CREATE INDEX idx_mv_profiles_stats_location 
ON mv_profiles_with_stats USING GIST(location);

COMMENT ON MATERIALIZED VIEW mv_profiles_with_stats IS 
'User profiles with aggregated statistics. Refresh every 15 minutes.';

-- ============================================
-- MATERIALIZED VIEW 3: DISCOVERY FEED
-- Optimized for swipe/discovery interface
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_discovery_feed AS
SELECT 
  p.id as user_id,
  p.name,
  p.avatar_url,
  p.bio,
  p.role,
  p.location,
  p.trust_score,
  p.is_verified,
  
  -- Current trip (if any)
  t.id as current_trip_id,
  t.destination as current_destination,
  t.start_date as trip_start_date,
  t.end_date as trip_end_date,
  
  -- User stats
  COUNT(DISTINCT m.id) as moments_count,
  COUNT(DISTINCT pr.id) FILTER (WHERE pr.status = 'verified') as verified_proofs_count,
  
  -- Photos (array)
  ARRAY_AGG(DISTINCT m.image_url) FILTER (WHERE m.image_url IS NOT NULL) as photo_urls,
  
  -- Interests (from moments types)
  ARRAY_AGG(DISTINCT m.type) FILTER (WHERE m.type IS NOT NULL) as interests,
  
  -- Reputation
  (p.trust_score + COUNT(DISTINCT pr.id) FILTER (WHERE pr.status = 'verified') * 2)::numeric as discovery_score

FROM profiles p
LEFT JOIN trips t ON p.id = t.user_id 
  AND t.status = 'active' 
  AND t.start_date <= NOW() + INTERVAL '30 days'
  AND t.end_date >= NOW()
LEFT JOIN moments m ON p.id = m.user_id AND m.status = 'active'
LEFT JOIN proofs pr ON p.id = pr.user_id
WHERE p.is_verified = true 
  AND p.kyc_status = 'Verified'
  AND p.updated_at > NOW() - INTERVAL '90 days' -- Active users only
GROUP BY p.id, p.name, p.avatar_url, p.bio, p.role, p.location, 
         p.trust_score, p.is_verified, t.id, t.destination, t.start_date, t.end_date;

-- Indexes on discovery feed
CREATE UNIQUE INDEX idx_mv_discovery_user_id 
ON mv_discovery_feed(user_id);

CREATE INDEX idx_mv_discovery_score 
ON mv_discovery_feed(discovery_score DESC);

CREATE INDEX idx_mv_discovery_location 
ON mv_discovery_feed USING GIST(location);

CREATE INDEX idx_mv_discovery_trip_dates 
ON mv_discovery_feed(trip_start_date, trip_end_date) 
WHERE current_trip_id IS NOT NULL;

CREATE INDEX idx_mv_discovery_verified 
ON mv_discovery_feed(is_verified, trust_score DESC) 
WHERE is_verified = true;

COMMENT ON MATERIALIZED VIEW mv_discovery_feed IS 
'Optimized discovery feed for matching. Refresh every 10 minutes.';

-- ============================================
-- MATERIALIZED VIEW 4: CONVERSATIONS WITH LAST MESSAGE
-- Inbox/conversations list optimization
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS mv_conversations_with_messages AS
SELECT 
  c.id as conversation_id,
  c.participant_ids,
  c.created_at as conversation_created_at,
  c.updated_at as conversation_updated_at,
  
  -- Last message
  m_last.id as last_message_id,
  m_last.sender_id as last_message_sender_id,
  m_last.content as last_message_content,
  m_last.created_at as last_message_at,
  m_last.is_read as last_message_read,
  
  -- Unread counts (per participant)
  jsonb_object_agg(
    part_id::text,
    (
      SELECT COUNT(*)
      FROM messages m2
      WHERE m2.conversation_id = c.id
        AND m2.is_read = false
        AND m2.sender_id != part_id
    )
  ) as unread_counts,
  
  -- Participant info
  jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'avatar_url', p.avatar_url,
      'is_verified', p.is_verified
    )
  ) as participants

FROM conversations c
CROSS JOIN LATERAL unnest(c.participant_ids) as part_id
LEFT JOIN profiles p ON p.id = part_id
LEFT JOIN LATERAL (
  SELECT *
  FROM messages m
  WHERE m.conversation_id = c.id
  ORDER BY m.created_at DESC
  LIMIT 1
) m_last ON true
GROUP BY c.id, c.participant_ids, c.created_at, c.updated_at,
         m_last.id, m_last.sender_id, m_last.content, m_last.created_at, m_last.is_read;

-- Indexes
CREATE UNIQUE INDEX idx_mv_conversations_id 
ON mv_conversations_with_messages(conversation_id);

CREATE INDEX idx_mv_conversations_updated 
ON mv_conversations_with_messages(conversation_updated_at DESC);

CREATE INDEX idx_mv_conversations_last_message 
ON mv_conversations_with_messages(last_message_at DESC);

CREATE INDEX idx_mv_conversations_participants 
ON mv_conversations_with_messages USING GIN(participant_ids);

COMMENT ON MATERIALIZED VIEW mv_conversations_with_messages IS 
'Conversations with last message and unread counts. Refresh every 1 minute.';

-- ============================================
-- REFRESH FUNCTIONS
-- ============================================

-- Refresh moments with profiles
CREATE OR REPLACE FUNCTION refresh_mv_moments_with_profiles()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_moments_with_profiles;
END;
$$ LANGUAGE plpgsql;

-- Refresh profiles with stats
CREATE OR REPLACE FUNCTION refresh_mv_profiles_with_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_profiles_with_stats;
END;
$$ LANGUAGE plpgsql;

-- Refresh discovery feed
CREATE OR REPLACE FUNCTION refresh_mv_discovery_feed()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_discovery_feed;
END;
$$ LANGUAGE plpgsql;

-- Refresh conversations
CREATE OR REPLACE FUNCTION refresh_mv_conversations_with_messages()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_conversations_with_messages;
END;
$$ LANGUAGE plpgsql;

-- Refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
  PERFORM refresh_mv_moments_with_profiles();
  PERFORM refresh_mv_profiles_with_stats();
  PERFORM refresh_mv_discovery_feed();
  PERFORM refresh_mv_conversations_with_messages();
  
  RAISE NOTICE 'All materialized views refreshed successfully';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SCHEDULED REFRESH (pg_cron)
-- ============================================

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule: Moments with profiles (every 5 minutes)
SELECT cron.schedule(
  'refresh-moments-profiles',
  '*/5 * * * *',
  $$SELECT refresh_mv_moments_with_profiles()$$
);

-- Schedule: Profiles with stats (every 15 minutes)
SELECT cron.schedule(
  'refresh-profiles-stats',
  '*/15 * * * *',
  $$SELECT refresh_mv_profiles_with_stats()$$
);

-- Schedule: Discovery feed (every 10 minutes)
SELECT cron.schedule(
  'refresh-discovery-feed',
  '*/10 * * * *',
  $$SELECT refresh_mv_discovery_feed()$$
);

-- Schedule: Conversations (every 1 minute)
SELECT cron.schedule(
  'refresh-conversations',
  '* * * * *',
  $$SELECT refresh_mv_conversations_with_messages()$$
);

-- ============================================
-- TRIGGERS FOR REAL-TIME UPDATES
-- ============================================

-- Trigger to refresh on moment insert/update
CREATE OR REPLACE FUNCTION trigger_refresh_moments_view()
RETURNS trigger AS $$
BEGIN
  -- Refresh in background (non-blocking)
  PERFORM pg_notify('refresh_moments_view', NEW.id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_moment_change
AFTER INSERT OR UPDATE ON moments
FOR EACH ROW
EXECUTE FUNCTION trigger_refresh_moments_view();

-- Trigger to refresh on profile update
CREATE OR REPLACE FUNCTION trigger_refresh_profiles_view()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('refresh_profiles_view', NEW.id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_profile_change
AFTER INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_refresh_profiles_view();

-- ============================================
-- MONITORING & STATISTICS
-- ============================================

-- View to monitor materialized view freshness
CREATE OR REPLACE VIEW mv_refresh_stats AS
SELECT 
  schemaname,
  matviewname,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size,
  (SELECT MAX(created_at) FROM mv_moments_with_profiles) as last_data_timestamp,
  NOW() - (SELECT MAX(created_at) FROM mv_moments_with_profiles) as data_age
FROM pg_matviews
WHERE schemaname = 'public'
ORDER BY matviewname;

-- Check materialized view usage
CREATE OR REPLACE VIEW mv_usage_stats AS
SELECT 
  schemaname,
  matviewname,
  idx_scan as index_scans,
  seq_scan as sequential_scans,
  idx_scan + seq_scan as total_scans,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as total_size
FROM pg_stat_user_tables
WHERE relname LIKE 'mv_%'
ORDER BY total_scans DESC;

-- ============================================
-- USAGE EXAMPLES
-- ============================================

/*
-- Get moments feed with profiles (FAST)
SELECT * FROM mv_moments_with_profiles
WHERE type = 'coffee'
ORDER BY moment_created_at DESC
LIMIT 20;

-- Get user profile with stats (FAST)
SELECT * FROM mv_profiles_with_stats
WHERE user_id = 'user-uuid-here';

-- Discovery feed (FAST)
SELECT * FROM mv_discovery_feed
WHERE is_verified = true
ORDER BY discovery_score DESC
LIMIT 50;

-- Conversations list (FAST)
SELECT * FROM mv_conversations_with_messages
WHERE 'user-uuid-here' = ANY(participant_ids)
ORDER BY last_message_at DESC;

-- Manual refresh if needed
SELECT refresh_all_materialized_views();

-- Check freshness
SELECT * FROM mv_refresh_stats;
*/

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION refresh_all_materialized_views IS 
'Manually refresh all materialized views. Use sparingly.';

COMMENT ON FUNCTION refresh_mv_moments_with_profiles IS 
'Refresh moments with profiles view. Called every 5 minutes by cron.';

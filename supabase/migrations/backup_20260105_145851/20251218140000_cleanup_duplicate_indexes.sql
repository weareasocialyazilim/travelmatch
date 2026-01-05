-- =====================================================
-- DUPLICATE INDEX CLEANUP
-- Created: 2024-12-18
-- Purpose: Remove redundant indexes flagged by advisor
-- =====================================================

-- Drop duplicate index on processed_webhook_events
-- idx_processed_webhook_events_event_id already covers this
DROP INDEX IF EXISTS idx_webhook_events_event_id;

-- Drop duplicate partial index on reports.status
-- idx_reports_status already covers status column
-- idx_reports_status_created covers status + created_at
DROP INDEX IF EXISTS idx_reports_pending;

-- Note: These indexes were redundant:
-- 1. idx_webhook_events_event_id = exact duplicate of idx_processed_webhook_events_event_id
-- 2. idx_reports_pending (WHERE status='pending') = subset of idx_reports_status

-- =====================================================
-- VERIFICATION COMMENTS
-- =====================================================
-- GIST index verified present: idx_moments_coordinates USING gist (coordinates)
-- Cron jobs verified (4 active):
--   1. refund-expired-escrow: SELECT refund_expired_escrow()
--   2. cleanup_feed_delta: SELECT cleanup_old_feed_delta()
--   3. cleanup_deep_link_events: SELECT cleanup_old_deep_link_events()
--   4. cleanup_rate_limits: SELECT cleanup_rate_limits()
-- Junction sync triggers verified (3 active):
--   1. sync_participant_ids_on_junction_change
--   2. sync_junction_on_participant_ids_change
--   3. populate_junction_on_new_conversation

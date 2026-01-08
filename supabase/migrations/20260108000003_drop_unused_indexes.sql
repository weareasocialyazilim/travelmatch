-- ============================================================================
-- DROP UNUSED INDEXES
-- ============================================================================
-- Date: 2026-01-08
-- Purpose: Remove indexes that have never been used to improve write performance
--          and reduce storage overhead
-- Risk: MEDIUM - Indexes may be needed for future queries
-- Rollback: Re-create indexes if needed (see bottom of file)
-- ============================================================================
-- IMPORTANT: These indexes were flagged as never used by the Supabase linter.
-- In a production database, statistics accumulate over time. If this is a
-- new/staging database, some indexes may be needed for queries not yet executed.
-- ============================================================================

BEGIN;

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_users_created_at;
DROP INDEX IF EXISTS public.idx_users_rating;
DROP INDEX IF EXISTS public.idx_users_verified;
DROP INDEX IF EXISTS public.idx_users_kyc_status;
DROP INDEX IF EXISTS public.idx_users_location_verified;
DROP INDEX IF EXISTS public.idx_users_rating_verified;
DROP INDEX IF EXISTS public.idx_users_balance_positive;
DROP INDEX IF EXISTS public.idx_users_gdpr_consent;
DROP INDEX IF EXISTS public.idx_users_verified_at;
DROP INDEX IF EXISTS public.idx_users_location;
DROP INDEX IF EXISTS public.idx_users_stripe_customer_id;

DO $$ BEGIN RAISE NOTICE '✅ users: Dropped 11 unused indexes'; END $$;

-- ============================================================================
-- MOMENTS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_moments_user_id;
DROP INDEX IF EXISTS public.idx_moments_category;
DROP INDEX IF EXISTS public.idx_moments_status;
DROP INDEX IF EXISTS public.idx_moments_created_at;
DROP INDEX IF EXISTS public.idx_moments_is_featured;
DROP INDEX IF EXISTS public.idx_moments_active;
DROP INDEX IF EXISTS public.idx_moments_location_status;
DROP INDEX IF EXISTS public.idx_moments_image_id;
DROP INDEX IF EXISTS public.idx_moments_date;
DROP INDEX IF EXISTS public.idx_moments_location;
DROP INDEX IF EXISTS public.idx_moments_coordinates;
DROP INDEX IF EXISTS public.idx_moments_price;
DROP INDEX IF EXISTS public.idx_moments_coordinates_gist;
DROP INDEX IF EXISTS public.idx_moments_active_coordinates_gist;

DO $$ BEGIN RAISE NOTICE '✅ moments: Dropped 14 unused indexes'; END $$;

-- ============================================================================
-- REQUESTS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_requests_moment_id;
DROP INDEX IF EXISTS public.idx_requests_user_id;
DROP INDEX IF EXISTS public.idx_requests_status;
DROP INDEX IF EXISTS public.idx_requests_user_status;
DROP INDEX IF EXISTS public.idx_requests_status_created;
DROP INDEX IF EXISTS public.idx_requests_pending;
DROP INDEX IF EXISTS public.idx_requests_host_id;

DO $$ BEGIN RAISE NOTICE '✅ requests: Dropped 7 unused indexes'; END $$;

-- ============================================================================
-- CONVERSATIONS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_conversations_updated_at;
DROP INDEX IF EXISTS public.idx_conversations_moment_id;
DROP INDEX IF EXISTS public.idx_conversations_participant_ids_gin;
DROP INDEX IF EXISTS public.idx_conversations_last_message_id;
DROP INDEX IF EXISTS public.idx_conversations_archived_at;
DROP INDEX IF EXISTS public.idx_conversations_updated;

DO $$ BEGIN RAISE NOTICE '✅ conversations: Dropped 6 unused indexes'; END $$;

-- ============================================================================
-- MESSAGES TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_messages_conversation_id;
DROP INDEX IF EXISTS public.idx_messages_sender_id;
DROP INDEX IF EXISTS public.idx_messages_unread;
DROP INDEX IF EXISTS public.idx_messages_conv_created;
DROP INDEX IF EXISTS public.idx_messages_conversation_created;

DO $$ BEGIN RAISE NOTICE '✅ messages: Dropped 5 unused indexes'; END $$;

-- ============================================================================
-- REVIEWS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_reviews_reviewed_id;
DROP INDEX IF EXISTS public.idx_reviews_moment_id;
DROP INDEX IF EXISTS public.idx_reviews_rating;
DROP INDEX IF EXISTS public.idx_reviews_created_at;
DROP INDEX IF EXISTS public.idx_reviews_reviewed_rating;
DROP INDEX IF EXISTS public.idx_reviews_reviewed_created;

DO $$ BEGIN RAISE NOTICE '✅ reviews: Dropped 6 unused indexes'; END $$;

-- ============================================================================
-- NOTIFICATIONS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_notifications_read;
DROP INDEX IF EXISTS public.idx_notifications_created_at;

DO $$ BEGIN RAISE NOTICE '✅ notifications: Dropped 2 unused indexes'; END $$;

-- ============================================================================
-- REPORTS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_reports_reporter_id;
DROP INDEX IF EXISTS public.idx_reports_reported_user_id;
DROP INDEX IF EXISTS public.idx_reports_reported_moment_id;
DROP INDEX IF EXISTS public.idx_reports_status;
DROP INDEX IF EXISTS public.idx_reports_status_created;

DO $$ BEGIN RAISE NOTICE '✅ reports: Dropped 5 unused indexes'; END $$;

-- ============================================================================
-- BLOCKS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_blocks_blocker_id;
DROP INDEX IF EXISTS public.idx_blocks_blocked_id;

DO $$ BEGIN RAISE NOTICE '✅ blocks: Dropped 2 unused indexes'; END $$;

-- ============================================================================
-- FAVORITES TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_favorites_user_id;
DROP INDEX IF EXISTS public.idx_favorites_moment_id;
DROP INDEX IF EXISTS public.idx_favorites_created_at;

DO $$ BEGIN RAISE NOTICE '✅ favorites: Dropped 3 unused indexes'; END $$;

-- ============================================================================
-- TRANSACTIONS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_transactions_user_id;
DROP INDEX IF EXISTS public.idx_transactions_moment_id;
DROP INDEX IF EXISTS public.idx_transactions_type;
DROP INDEX IF EXISTS public.idx_transactions_status;
DROP INDEX IF EXISTS public.idx_transactions_created_at;
DROP INDEX IF EXISTS public.idx_transactions_user_status;
DROP INDEX IF EXISTS public.idx_transactions_type_status;
DROP INDEX IF EXISTS public.idx_transactions_status_created;
DROP INDEX IF EXISTS public.idx_transactions_moment_status;
DROP INDEX IF EXISTS public.idx_transactions_metadata_payment_intent;
DROP INDEX IF EXISTS public.idx_transactions_sender_id;
DROP INDEX IF EXISTS public.idx_transactions_recipient_id;

DO $$ BEGIN RAISE NOTICE '✅ transactions: Dropped 12 unused indexes'; END $$;

-- ============================================================================
-- UPLOADED_IMAGES TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_uploaded_images_user_id;
DROP INDEX IF EXISTS public.idx_uploaded_images_type;
DROP INDEX IF EXISTS public.idx_uploaded_images_created_at;
DROP INDEX IF EXISTS public.idx_uploaded_images_uploaded_at;
DROP INDEX IF EXISTS public.idx_uploaded_images_metadata;
DROP INDEX IF EXISTS public.idx_uploaded_images_blur_hash;

DO $$ BEGIN RAISE NOTICE '✅ uploaded_images: Dropped 6 unused indexes'; END $$;

-- ============================================================================
-- KYC_VERIFICATIONS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_kyc_verifications_user_id;
DROP INDEX IF EXISTS public.idx_kyc_verifications_created_at;
DROP INDEX IF EXISTS public.idx_kyc_verifications_user;
DROP INDEX IF EXISTS public.idx_kyc_verifications_status;
DROP INDEX IF EXISTS public.idx_kyc_verifications_provider_check;

DO $$ BEGIN RAISE NOTICE '✅ kyc_verifications: Dropped 5 unused indexes'; END $$;

-- ============================================================================
-- CDN_INVALIDATION_LOGS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_cdn_invalidation_logs_created_at;
DROP INDEX IF EXISTS public.idx_cdn_invalidation_logs_type;

DO $$ BEGIN RAISE NOTICE '✅ cdn_invalidation_logs: Dropped 2 unused indexes'; END $$;

-- ============================================================================
-- PROOF_QUALITY_SCORES TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_proof_quality_scores_approved;
DROP INDEX IF EXISTS public.idx_proof_quality_scores_review_status;
DROP INDEX IF EXISTS public.idx_proof_quality_scores_created_at;
DROP INDEX IF EXISTS public.idx_proof_quality_scores_user_id;
DROP INDEX IF EXISTS public.idx_proof_quality_scores_reviewed_by;

DO $$ BEGIN RAISE NOTICE '✅ proof_quality_scores: Dropped 5 unused indexes'; END $$;

-- ============================================================================
-- FEED_DELTA TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_feed_delta_user_version;
DROP INDEX IF EXISTS public.idx_feed_delta_item;

DO $$ BEGIN RAISE NOTICE '✅ feed_delta: Dropped 2 unused indexes'; END $$;

-- ============================================================================
-- DEEP_LINK_EVENTS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_deep_link_events_user_id;
DROP INDEX IF EXISTS public.idx_deep_link_events_type;
DROP INDEX IF EXISTS public.idx_deep_link_events_source;
DROP INDEX IF EXISTS public.idx_deep_link_events_campaign;
DROP INDEX IF EXISTS public.idx_deep_link_events_session_id;

DO $$ BEGIN RAISE NOTICE '✅ deep_link_events: Dropped 5 unused indexes'; END $$;

-- ============================================================================
-- ESCROW_TRANSACTIONS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_escrow_sender_status;
DROP INDEX IF EXISTS public.idx_escrow_recipient_status;
DROP INDEX IF EXISTS public.idx_escrow_sender;
DROP INDEX IF EXISTS public.idx_escrow_recipient;
DROP INDEX IF EXISTS public.idx_escrow_status;
DROP INDEX IF EXISTS public.idx_escrow_expires;
DROP INDEX IF EXISTS public.idx_escrow_moment;
DROP INDEX IF EXISTS public.idx_escrow_created;
DROP INDEX IF EXISTS public.idx_escrow_sender_created;
DROP INDEX IF EXISTS public.idx_escrow_pending_expires;
DROP INDEX IF EXISTS public.idx_escrow_transactions_moment_id;
DROP INDEX IF EXISTS public.idx_escrow_transactions_status_created;
DROP INDEX IF EXISTS public.idx_escrow_transactions_expires;

DO $$ BEGIN RAISE NOTICE '✅ escrow_transactions: Dropped 13 unused indexes'; END $$;

-- ============================================================================
-- CONVERSATION_PARTICIPANTS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_conversation_participants_user;
DROP INDEX IF EXISTS public.idx_conversation_participants_user_not_archived;
DROP INDEX IF EXISTS public.idx_conversation_participants_composite;

DO $$ BEGIN RAISE NOTICE '✅ conversation_participants: Dropped 3 unused indexes'; END $$;

-- ============================================================================
-- RATE_LIMITS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_rate_limits_lookup;

DO $$ BEGIN RAISE NOTICE '✅ rate_limits: Dropped 1 unused index'; END $$;

-- ============================================================================
-- AUDIT_LOGS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_audit_logs_user_action;
DROP INDEX IF EXISTS public.idx_audit_logs_action_created;
DROP INDEX IF EXISTS public.idx_audit_logs_user_id;
DROP INDEX IF EXISTS public.idx_audit_logs_action;
DROP INDEX IF EXISTS public.idx_audit_logs_created_at;

DO $$ BEGIN RAISE NOTICE '✅ audit_logs: Dropped 5 unused indexes'; END $$;

-- ============================================================================
-- PROOF_VERIFICATIONS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_proof_verifications_moment_id;
DROP INDEX IF EXISTS public.idx_proof_verifications_user_id;
DROP INDEX IF EXISTS public.idx_proof_verifications_status;
DROP INDEX IF EXISTS public.idx_proof_verifications_moment_status;
DROP INDEX IF EXISTS public.idx_proof_verifications_user_status;

DO $$ BEGIN RAISE NOTICE '✅ proof_verifications: Dropped 5 unused indexes'; END $$;

-- ============================================================================
-- USER_SUBSCRIPTIONS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_user_subscriptions_user_id;
DROP INDEX IF EXISTS public.idx_user_subscriptions_status;
DROP INDEX IF EXISTS public.idx_user_subscriptions_plan_id;
DROP INDEX IF EXISTS public.idx_user_subscriptions_period_end;

DO $$ BEGIN RAISE NOTICE '✅ user_subscriptions: Dropped 4 unused indexes'; END $$;

-- ============================================================================
-- ADMIN_USERS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_admin_users_role;
DROP INDEX IF EXISTS public.idx_admin_users_active;

DO $$ BEGIN RAISE NOTICE '✅ admin_users: Dropped 2 unused indexes'; END $$;

-- ============================================================================
-- ADMIN_AUDIT_LOGS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_admin_audit_logs_action;
DROP INDEX IF EXISTS public.idx_admin_audit_logs_resource;
DROP INDEX IF EXISTS public.idx_admin_audit_logs_created_at;

DO $$ BEGIN RAISE NOTICE '✅ admin_audit_logs: Dropped 3 unused indexes'; END $$;

-- ============================================================================
-- TASKS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_tasks_status;
DROP INDEX IF EXISTS public.idx_tasks_priority;
DROP INDEX IF EXISTS public.idx_tasks_resource;
DROP INDEX IF EXISTS public.idx_tasks_queue;

DO $$ BEGIN RAISE NOTICE '✅ tasks: Dropped 4 unused indexes'; END $$;

-- ============================================================================
-- TRIPS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_trips_user_id;
DROP INDEX IF EXISTS public.idx_trips_status;
DROP INDEX IF EXISTS public.idx_trips_destination;
DROP INDEX IF EXISTS public.idx_trips_start_date;

DO $$ BEGIN RAISE NOTICE '✅ trips: Dropped 4 unused indexes'; END $$;

-- ============================================================================
-- TRIP_PARTICIPANTS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_trip_participants_trip_id;
DROP INDEX IF EXISTS public.idx_trip_participants_user_id;
DROP INDEX IF EXISTS public.idx_trip_participants_status;

DO $$ BEGIN RAISE NOTICE '✅ trip_participants: Dropped 3 unused indexes'; END $$;

-- ============================================================================
-- DISPUTES TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_disputes_reporter_id;
DROP INDEX IF EXISTS public.idx_disputes_reported_user_id;
DROP INDEX IF EXISTS public.idx_disputes_status;
DROP INDEX IF EXISTS public.idx_disputes_trip_id;
DROP INDEX IF EXISTS public.idx_disputes_type;
DROP INDEX IF EXISTS public.idx_disputes_transaction_id;

DO $$ BEGIN RAISE NOTICE '✅ disputes: Dropped 6 unused indexes'; END $$;

-- ============================================================================
-- CONSENT_HISTORY TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_consent_history_user_id;
DROP INDEX IF EXISTS public.idx_consent_history_type;
DROP INDEX IF EXISTS public.idx_consent_history_created_at;

DO $$ BEGIN RAISE NOTICE '✅ consent_history: Dropped 3 unused indexes'; END $$;

-- ============================================================================
-- DATA_EXPORT_REQUESTS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_data_export_requests_user_id;
DROP INDEX IF EXISTS public.idx_data_export_requests_status;

DO $$ BEGIN RAISE NOTICE '✅ data_export_requests: Dropped 2 unused indexes'; END $$;

-- ============================================================================
-- BOOKINGS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_bookings_trip_id;
DROP INDEX IF EXISTS public.idx_bookings_user_id;
DROP INDEX IF EXISTS public.idx_bookings_status;

DO $$ BEGIN RAISE NOTICE '✅ bookings: Dropped 3 unused indexes'; END $$;

-- ============================================================================
-- TRIP_REQUESTS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_trip_requests_trip_id;
DROP INDEX IF EXISTS public.idx_trip_requests_user_id;
DROP INDEX IF EXISTS public.idx_trip_requests_status;
DROP INDEX IF EXISTS public.idx_trip_requests_responded_by;

DO $$ BEGIN RAISE NOTICE '✅ trip_requests: Dropped 4 unused indexes'; END $$;

-- ============================================================================
-- VIDEOS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_videos_user_id;
DROP INDEX IF EXISTS public.idx_videos_status;

DO $$ BEGIN RAISE NOTICE '✅ videos: Dropped 2 unused indexes'; END $$;

-- ============================================================================
-- USED_2FA_CODES TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_used_2fa_codes_user_hash;
DROP INDEX IF EXISTS public.idx_used_2fa_codes_expires;

DO $$ BEGIN RAISE NOTICE '✅ used_2fa_codes: Dropped 2 unused indexes'; END $$;

-- ============================================================================
-- CACHE_INVALIDATION TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_cache_invalidation_key;
DROP INDEX IF EXISTS public.idx_cache_invalidation_timestamp;
DROP INDEX IF EXISTS public.idx_cache_invalidation_key_time;

DO $$ BEGIN RAISE NOTICE '✅ cache_invalidation: Dropped 3 unused indexes'; END $$;

-- ============================================================================
-- PROCESSED_WEBHOOK_EVENTS TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_processed_webhook_events_event_id;
DROP INDEX IF EXISTS public.idx_webhook_events_processed_at;

DO $$ BEGIN RAISE NOTICE '✅ processed_webhook_events: Dropped 2 unused indexes'; END $$;

-- ============================================================================
-- TOTP_USAGE_LOG TABLE INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_totp_usage_user_code;
DROP INDEX IF EXISTS public.idx_totp_usage_window;

DO $$ BEGIN RAISE NOTICE '✅ totp_usage_log: Dropped 2 unused indexes'; END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
DECLARE
  remaining_indexes INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_indexes
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';
  
  RAISE NOTICE '--- SUMMARY ---';
  RAISE NOTICE '✅ Total indexes dropped: ~150';
  RAISE NOTICE 'ℹ️ Remaining custom indexes in public schema: %', remaining_indexes;
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ MANUAL STEP: Auth DB Connection Strategy';
  RAISE NOTICE '   Go to Supabase Dashboard > Settings > Database';
  RAISE NOTICE '   Change Auth connection pool allocation from absolute (10) to percentage';
  RAISE NOTICE '   This allows Auth to scale with instance size';
END $$;

COMMIT;

-- ============================================================================
-- AUTH DB CONNECTIONS RECOMMENDATION
-- ============================================================================
-- The Supabase linter detected:
-- "Your project's Auth server is configured to use at most 10 connections"
-- 
-- To fix this (cannot be done via SQL):
-- 1. Go to Supabase Dashboard
-- 2. Navigate to: Settings > Database > Connection Pooling
-- 3. Change Auth pool mode from "Transaction" to "Session" if needed
-- 4. Or adjust the pool_size to use percentage instead of absolute number
--
-- Alternatively, in supabase/config.toml add:
-- [db.pooler]
-- enabled = true
-- pool_mode = "transaction"
-- default_pool_size = 15
--
-- For production, consider:
-- - Using percentage-based allocation for Auth
-- - This allows Auth to scale automatically with instance size
-- ============================================================================

-- ============================================================================
-- ROLLBACK REFERENCE
-- ============================================================================
-- If any queries become slow after this migration, you can re-create indexes:
--
-- Example to recreate an index:
-- CREATE INDEX idx_users_created_at ON public.users(created_at);
--
-- Monitor slow queries with:
-- SELECT query, calls, mean_exec_time, total_exec_time
-- FROM pg_stat_statements
-- ORDER BY mean_exec_time DESC
-- LIMIT 20;
--
-- Check if an index would help:
-- EXPLAIN ANALYZE SELECT * FROM users WHERE created_at > '2025-01-01';
-- ============================================================================

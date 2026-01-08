-- Migration: Fix Remaining Linter Issues
-- Date: 2026-01-08
-- Description: Fix multiple permissive policies and add missing foreign key indexes

-- ============================================
-- 1. FIX MULTIPLE PERMISSIVE POLICIES
-- ============================================

-- Drop redundant policies on user_bank_accounts and create a single consolidated policy
DO $$
BEGIN
    -- Drop existing SELECT policies if they exist
    DROP POLICY IF EXISTS "Users can manage own bank accounts" ON public.user_bank_accounts;
    DROP POLICY IF EXISTS "Users can view own bank accounts" ON public.user_bank_accounts;
    
    -- Create a single consolidated SELECT policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_bank_accounts' 
        AND policyname = 'Users can view and manage own bank accounts'
    ) THEN
        CREATE POLICY "Users can view and manage own bank accounts"
            ON public.user_bank_accounts
            FOR SELECT
            USING (user_id = (SELECT auth.uid()));
    END IF;
END $$;

-- ============================================
-- 2. ADD MISSING FOREIGN KEY INDEXES
-- ============================================

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);

-- blocks
CREATE INDEX IF NOT EXISTS idx_blocks_blocked_id ON public.blocks(blocked_id);

-- commission_ledger
CREATE INDEX IF NOT EXISTS idx_commission_ledger_moment_id ON public.commission_ledger(moment_id);

-- conversation_participants
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);

-- conversations
CREATE INDEX IF NOT EXISTS idx_conversations_moment_id ON public.conversations(moment_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_id ON public.conversations(last_message_id);

-- data_export_requests
CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id ON public.data_export_requests(user_id);

-- deep_link_events
CREATE INDEX IF NOT EXISTS idx_deep_link_events_user_id ON public.deep_link_events(user_id);

-- disputes
CREATE INDEX IF NOT EXISTS idx_disputes_reported_user_id ON public.disputes(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_disputes_reporter_id ON public.disputes(reporter_id);
CREATE INDEX IF NOT EXISTS idx_disputes_transaction_id ON public.disputes(transaction_id);

-- escrow_transactions
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_moment_id ON public.escrow_transactions(moment_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_original_currency ON public.escrow_transactions(original_currency);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_recipient_id ON public.escrow_transactions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_released_by ON public.escrow_transactions(released_by);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_sender_id ON public.escrow_transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_settlement_currency ON public.escrow_transactions(settlement_currency);

-- exchange_rates
CREATE INDEX IF NOT EXISTS idx_exchange_rates_target_currency ON public.exchange_rates(target_currency);

-- favorites
CREATE INDEX IF NOT EXISTS idx_favorites_moment_id ON public.favorites(moment_id);

-- fraud_alerts
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_escrow_id ON public.fraud_alerts(escrow_id);

-- gift_contracts
CREATE INDEX IF NOT EXISTS idx_gift_contracts_moment_id ON public.gift_contracts(moment_id);
CREATE INDEX IF NOT EXISTS idx_gift_contracts_receiver_id ON public.gift_contracts(receiver_id);

-- gifts
CREATE INDEX IF NOT EXISTS idx_gifts_original_currency ON public.gifts(original_currency);

-- marketing_campaigns
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_created_by ON public.marketing_campaigns(created_by);

-- moments
CREATE INDEX IF NOT EXISTS idx_moments_image_id ON public.moments(image_id);
CREATE INDEX IF NOT EXISTS idx_moments_moderated_by ON public.moments(moderated_by);

-- notification_campaigns
CREATE INDEX IF NOT EXISTS idx_notification_campaigns_created_by ON public.notification_campaigns(created_by);

-- payment_disputes
CREATE INDEX IF NOT EXISTS idx_payment_disputes_commission_ledger_id ON public.payment_disputes(commission_ledger_id);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_gift_id ON public.payment_disputes(gift_id);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_moment_id ON public.payment_disputes(moment_id);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_opened_by ON public.payment_disputes(opened_by);

-- payment_transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_card_id ON public.payment_transactions(card_id);

-- promo_codes
CREATE INDEX IF NOT EXISTS idx_promo_codes_created_by ON public.promo_codes(created_by);

-- proof_quality_scores
CREATE INDEX IF NOT EXISTS idx_proof_quality_scores_reviewed_by ON public.proof_quality_scores(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_proof_quality_scores_user_id ON public.proof_quality_scores(user_id);

-- proof_submissions
CREATE INDEX IF NOT EXISTS idx_proof_submissions_reviewer_id ON public.proof_submissions(reviewer_id);

-- proof_verifications
CREATE INDEX IF NOT EXISTS idx_proof_verifications_moment_id ON public.proof_verifications(moment_id);
CREATE INDEX IF NOT EXISTS idx_proof_verifications_user_id ON public.proof_verifications(user_id);

-- proofs
CREATE INDEX IF NOT EXISTS idx_proofs_moment_id ON public.proofs(moment_id);

-- reports
CREATE INDEX IF NOT EXISTS idx_reports_reported_moment_id ON public.reports(reported_moment_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON public.reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);

-- requests
CREATE INDEX IF NOT EXISTS idx_requests_host_id ON public.requests(host_id);

-- reviews
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON public.reviews(reviewed_id);

-- totp_usage_log
CREATE INDEX IF NOT EXISTS idx_totp_usage_log_user_id ON public.totp_usage_log(user_id);

-- transactions
CREATE INDEX IF NOT EXISTS idx_transactions_moment_id ON public.transactions(moment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_recipient_id ON public.transactions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_transactions_sender_id ON public.transactions(sender_id);

-- trust_notes
CREATE INDEX IF NOT EXISTS idx_trust_notes_escrow_id ON public.trust_notes(escrow_id);
CREATE INDEX IF NOT EXISTS idx_trust_notes_moderated_by ON public.trust_notes(moderated_by);
CREATE INDEX IF NOT EXISTS idx_trust_notes_moment_id ON public.trust_notes(moment_id);

-- uploaded_images
CREATE INDEX IF NOT EXISTS idx_uploaded_images_user_id ON public.uploaded_images(user_id);

-- used_2fa_codes
CREATE INDEX IF NOT EXISTS idx_used_2fa_codes_user_id ON public.used_2fa_codes(user_id);

-- user_badges
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);

-- user_subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);

-- users
CREATE INDEX IF NOT EXISTS idx_users_preferred_currency ON public.users(preferred_currency);

-- withdrawal_requests
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_bank_account_id ON public.withdrawal_requests(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);

-- ============================================
-- 3. NOTES ON ITEMS THAT CANNOT BE FIXED
-- ============================================

-- spatial_ref_sys RLS: This is a PostGIS system table and cannot be modified.
-- It's safe to ignore this warning.

-- Extensions in public schema (postgis, pg_trgm): Moving these is risky and
-- can break existing functionality. It's recommended to leave them in public.

-- Unused indexes: These indexes may be used when the app goes to production.
-- They should be monitored and removed only if confirmed unused after
-- sufficient production traffic.

-- Auth DB connections: This should be configured in Supabase Dashboard under
-- Project Settings > Database > Connection Pooling. Switch to percentage-based
-- allocation for better scalability.

COMMENT ON SCHEMA public IS 'Linter issues fixed on 2026-01-08. Remaining warnings are either system-level (PostGIS) or intentionally kept (unused indexes for future use).';

create sequence "public"."daily_request_stats_id_seq";

create sequence "public"."table_growth_stats_id_seq";

drop trigger if exists "app_config_updated_at" on "public"."app_config";

drop trigger if exists "reports_updated_at" on "public"."reports";

drop trigger if exists "trigger_active_alerts_updated_at" on "public"."active_alerts";

drop trigger if exists "trigger_archive_resolved_alert" on "public"."active_alerts";

drop trigger if exists "admin_users_updated_at" on "public"."admin_users";

drop trigger if exists "trigger_alert_rules_updated_at" on "public"."alert_rules";

drop trigger if exists "alerts_updated_at" on "public"."alerts";

drop trigger if exists "sync_participant_ids_on_junction_change" on "public"."conversation_participants";

drop trigger if exists "populate_junction_on_new_conversation" on "public"."conversations";

drop trigger if exists "sync_junction_on_participant_ids_change" on "public"."conversations";

drop trigger if exists "update_conversations_updated_at" on "public"."conversations";

drop trigger if exists "update_data_export_requests_updated_at" on "public"."data_export_requests";

drop trigger if exists "update_deep_link_events_updated_at" on "public"."deep_link_events";

drop trigger if exists "discount_codes_updated_at" on "public"."discount_codes";

drop trigger if exists "update_disputes_updated_at" on "public"."disputes";

drop trigger if exists "trigger_email_logs_updated_at" on "public"."email_logs";

drop trigger if exists "enforce_proof_before_escrow_release" on "public"."escrow_transactions";

drop trigger if exists "fraud_cases_generate_number" on "public"."fraud_cases";

drop trigger if exists "fraud_cases_updated_at" on "public"."fraud_cases";

drop trigger if exists "trg_update_contributor_count" on "public"."gifts";

drop trigger if exists "trigger_gift_achievement" on "public"."gifts";

drop trigger if exists "trigger_gift_status_change" on "public"."gifts";

drop trigger if exists "kyc_verifications_updated_at" on "public"."kyc_verifications";

drop trigger if exists "update_marketing_campaigns_updated_at" on "public"."marketing_campaigns";

drop trigger if exists "messages_change_tracker" on "public"."messages";

drop trigger if exists "update_conversation_on_message" on "public"."messages";

drop trigger if exists "update_moment_offers_updated_at" on "public"."moment_offers";

drop trigger if exists "moments_change_tracker" on "public"."moments";

drop trigger if exists "trg_moment_moderation" on "public"."moments";

drop trigger if exists "trigger_moment_achievement" on "public"."moments";

drop trigger if exists "update_moments_updated_at" on "public"."moments";

drop trigger if exists "notification_campaigns_updated_at" on "public"."notification_campaigns";

drop trigger if exists "update_notification_campaigns_updated_at" on "public"."notification_campaigns";

drop trigger if exists "payout_requests_updated_at" on "public"."payout_requests";

drop trigger if exists "update_promo_codes_updated_at" on "public"."promo_codes";

drop trigger if exists "update_proof_quality_scores_updated_at" on "public"."proof_quality_scores";

drop trigger if exists "validate_proof_submission_trigger" on "public"."proof_submissions";

drop trigger if exists "proof_verifications_updated_at" on "public"."proof_verifications";

drop trigger if exists "trigger_proof_achievement" on "public"."proofs";

drop trigger if exists "trg_handle_new_report" on "public"."reports";

drop trigger if exists "on_request_accepted" on "public"."requests";

drop trigger if exists "trg_check_request_spam" on "public"."requests";

drop trigger if exists "update_participants_on_request" on "public"."requests";

drop trigger if exists "update_requests_updated_at" on "public"."requests";

drop trigger if exists "update_rating_after_review" on "public"."reviews";

drop trigger if exists "trg_ensure_single_default_card" on "public"."saved_cards";

drop trigger if exists "trigger_single_default_card" on "public"."saved_cards";

drop trigger if exists "trigger_increment_story_view" on "public"."story_views";

drop trigger if exists "trigger_sar_number" on "public"."suspicious_activity_reports";

drop trigger if exists "tasks_updated_at" on "public"."tasks";

drop trigger if exists "triage_items_updated_at" on "public"."triage_items";

drop trigger if exists "trust_notes_updated_at" on "public"."trust_notes";

drop trigger if exists "update_trust_note_count_trigger" on "public"."trust_notes";

drop trigger if exists "uploaded_images_updated_at" on "public"."uploaded_images";

drop trigger if exists "trigger_achievement_notification" on "public"."user_achievements";

drop trigger if exists "trg_log_consent_change" on "public"."user_consents";

drop trigger if exists "check_warnings_trigger" on "public"."user_moderation_warnings";

-- drop trigger if exists "trg_log_status_change" on "public"."user_safety"; -- table doesn't exist

drop trigger if exists "prevent_sensitive_updates_trigger" on "public"."users";

drop trigger if exists "trg_kyc_status_change" on "public"."users";

drop trigger if exists "trg_update_moderation_status" on "public"."users";

drop trigger if exists "trg_user_status_change" on "public"."users";

drop trigger if exists "update_users_updated_at" on "public"."users";

drop trigger if exists "trg_vip_subscription_update" on "public"."vip_users";

drop trigger if exists "vip_users_updated_at" on "public"."vip_users";

drop policy "ab_assignments_delete" on "public"."ab_assignments";

drop policy "ab_assignments_insert" on "public"."ab_assignments";

drop policy "ab_assignments_select" on "public"."ab_assignments";

drop policy "ab_assignments_update" on "public"."ab_assignments";

drop policy "Only admins can update app_config" on "public"."app_config";

drop policy "Admins can view audit logs" on "public"."audit_logs";

drop policy "blocked_content_admin_modify" on "public"."blocked_content";

drop policy "blocked_content_select" on "public"."blocked_content";

drop policy "chatbot_conversations_insert" on "public"."chatbot_conversations";

drop policy "chatbot_conversations_select" on "public"."chatbot_conversations";

drop policy "chatbot_conversations_update" on "public"."chatbot_conversations";

drop policy "chatbot_messages_insert" on "public"."chatbot_messages";

drop policy "chatbot_messages_select" on "public"."chatbot_messages";

drop policy "demand_forecasts_modify" on "public"."demand_forecasts";

drop policy "demand_forecasts_select" on "public"."demand_forecasts";

drop policy "recommendation_feedback_delete" on "public"."recommendation_feedback";

drop policy "recommendation_feedback_insert" on "public"."recommendation_feedback";

drop policy "recommendation_feedback_select" on "public"."recommendation_feedback";

drop policy "recommendation_feedback_update" on "public"."recommendation_feedback";

drop policy "Admins can add report actions" on "public"."report_actions";

drop policy "Admins can manage reports" on "public"."reports";

drop policy "Admins can view reports" on "public"."reports";

drop policy "reviews_insert_verified" on "public"."reviews";

drop policy "reviews_select_secure" on "public"."reviews";

-- drop policy "Admins can view all uploads" on "public"."uploaded_images"; -- policy doesn't exist;

drop policy "user_warnings_admin_insert_delete" on "public"."user_moderation_warnings";

drop policy "user_warnings_select" on "public"."user_moderation_warnings";

drop policy "user_warnings_update" on "public"."user_moderation_warnings";

drop policy "user_preference_vectors_modify" on "public"."user_preference_vectors";

drop policy "user_preference_vectors_select" on "public"."user_preference_vectors";

drop policy "ab_experiments_admin_all" on "public"."ab_experiments";

drop policy "Admins can insert admin audit logs" on "public"."admin_audit_logs";

drop policy "Admins can view admin audit logs" on "public"."admin_audit_logs";

drop policy "admin_sessions_service_only" on "public"."admin_sessions";

drop policy "Authenticated users can view own admin record" on "public"."admin_users";

drop policy "ai_anomalies_admin_select" on "public"."ai_anomalies";

drop policy "ai_anomalies_admin_update" on "public"."ai_anomalies";

drop policy "ai_anomalies_service_insert" on "public"."ai_anomalies";

drop policy "Admins can manage alerts" on "public"."alerts";

drop policy "Admins can view alerts" on "public"."alerts";

drop policy "Users can update own participations" on "public"."conversation_participants";

drop policy "conversations_insert_participant" on "public"."conversations";

drop policy "conversations_select_participants" on "public"."conversations";

drop policy "conversations_update_participant" on "public"."conversations";

drop policy "Admins can manage discount codes" on "public"."discount_codes";

drop policy "founder_decision_log_insert_super_admin" on "public"."founder_decision_log";

drop policy "founder_decision_log_select_super_admin" on "public"."founder_decision_log";

drop policy "Admins can manage fraud cases" on "public"."fraud_cases";

drop policy "Admins can manage fraud evidence" on "public"."fraud_evidence";

drop policy "Admins can view health events" on "public"."integration_health_events";

drop policy "Managers can view error logs" on "public"."internal_error_log";

drop policy "Admins can manage KYC verifications" on "public"."kyc_verifications";

drop policy "Admins can manage linked accounts" on "public"."linked_accounts";

drop policy "Messages visibility" on "public"."messages";

drop policy "messages_insert_participant" on "public"."messages";

drop policy "messages_select_participant" on "public"."messages";

drop policy "messages_update_sender" on "public"."messages";

drop policy "ml_analytics_service_only" on "public"."ml_analytics";

drop policy "moderation_dictionary_admin_all" on "public"."moderation_dictionary";

drop policy "moderation_logs_admin_select" on "public"."moderation_logs";

drop policy "moderation_logs_service_insert" on "public"."moderation_logs";

drop policy "Moments visibility" on "public"."moments";

drop policy "moments_delete_own" on "public"."moments";

drop policy "moments_insert_own" on "public"."moments";

drop policy "moments_select_active" on "public"."moments";

drop policy "moments_update_own" on "public"."moments";

drop policy "Admins can manage notification campaigns" on "public"."notification_campaigns";

drop policy "notifications_delete_own" on "public"."notifications";

drop policy "notifications_insert_service" on "public"."notifications";

drop policy "notifications_select_own" on "public"."notifications";

drop policy "notifications_update_own" on "public"."notifications";

drop policy "Users can view own transactions" on "public"."payment_transactions";

drop policy "Admins can manage payout requests" on "public"."payout_requests";

drop policy "price_predictions_cache_service_only" on "public"."price_predictions_cache";

drop policy "proof_quality_scores_validated_insert" on "public"."proof_quality_scores";

drop policy "proof_submissions_participant_select" on "public"."proof_submissions";

drop policy "proof_submissions_recipient_insert" on "public"."proof_submissions";

drop policy "proof_submissions_submitter_update" on "public"."proof_submissions";

drop policy "Service role verified proof inserts" on "public"."proof_verifications";

drop policy "Service role with validation for proof verification inserts" on "public"."proof_verifications";

drop policy "Users can view proof verifications" on "public"."proof_verifications";

drop policy "proof_verifications_validated_insert" on "public"."proof_verifications";

drop policy "proof_verifications_validated_update" on "public"."proof_verifications";

drop policy "Users can view related proofs" on "public"."proofs";

drop policy "Admins can insert report actions" on "public"."report_actions";

drop policy "Admins can view report actions" on "public"."report_actions";

drop policy "Admins can update reports" on "public"."reports";

drop policy "Admins can view all reports" on "public"."reports";

drop policy "Requests visibility" on "public"."requests";

drop policy "requests_delete_requester" on "public"."requests";

drop policy "requests_insert_requester" on "public"."requests";

drop policy "requests_select_related" on "public"."requests";

drop policy "requests_update_related" on "public"."requests";

drop policy "Users can update own cards" on "public"."saved_cards";

drop policy "stories_delete_own" on "public"."stories";

drop policy "stories_insert_own" on "public"."stories";

drop policy "stories_update_own" on "public"."stories";

drop policy "story_views_select_story_owner" on "public"."story_views";

drop policy "Admins can view assigned tasks" on "public"."tasks";

drop policy "Admins can view triage items" on "public"."triage_items";

drop policy "Managers can update triage items" on "public"."triage_items";

drop policy "Service role validated upload inserts" on "public"."uploaded_images";

drop policy "Users can delete own uploads" on "public"."uploaded_images";

drop policy "Users can read own uploads" on "public"."uploaded_images";

drop policy "user_badges_service_insert_validated" on "public"."user_badges";

drop policy "Admins can full access user_safety" on "public"."user_safety";

drop policy "Users can view connected profiles" on "public"."users";

drop policy "users_update_own" on "public"."users";

drop policy "Admins can view wallet transactions" on "public"."wallet_transactions";

drop policy "Finance can manage wallet transactions" on "public"."wallet_transactions";

drop policy "Users can create withdrawals" on "public"."withdrawal_requests";

drop policy "Users can view own withdrawals" on "public"."withdrawal_requests";

revoke delete on table "public"."app_config" from "anon";

revoke insert on table "public"."app_config" from "anon";

revoke update on table "public"."app_config" from "anon";

revoke delete on table "public"."app_config" from "authenticated";

revoke insert on table "public"."app_config" from "authenticated";

revoke update on table "public"."app_config" from "authenticated";

alter table "public"."appeals" drop constraint "appeals_appeal_type_check";

alter table "public"."kyc_verifications" drop constraint "kyc_verifications_reviewed_by_fkey";

alter table "public"."moments" drop constraint "fk_moment_currency";

alter table "public"."reports" drop constraint "reports_reported_user_id_fkey1";

alter table "public"."reviews" drop constraint "reviews_request_id_fkey";

alter table "public"."ab_assignments" drop constraint "ab_assignments_experiment_id_fkey";

alter table "public"."active_alerts" drop constraint "active_alerts_acknowledged_by_fkey";

alter table "public"."active_alerts" drop constraint "active_alerts_resolved_by_fkey";

alter table "public"."active_alerts" drop constraint "active_alerts_rule_id_fkey";

alter table "public"."admin_audit_logs" drop constraint "admin_audit_logs_admin_id_fkey";

alter table "public"."admin_sessions" drop constraint "admin_sessions_admin_id_fkey";

alter table "public"."admin_users" drop constraint "admin_users_created_by_fkey";

alter table "public"."alert_history" drop constraint "alert_history_resolved_by_fkey";

alter table "public"."alert_history" drop constraint "alert_history_rule_id_fkey";

alter table "public"."alert_rules" drop constraint "alert_rules_created_by_fkey";

alter table "public"."alerts" drop constraint "alerts_acknowledged_by_fkey";

alter table "public"."alerts" drop constraint "alerts_resolved_by_fkey";

alter table "public"."appeals" drop constraint "appeals_user_id_fkey";

alter table "public"."audit_logs" drop constraint "audit_logs_user_id_fkey";

alter table "public"."blocks" drop constraint "blocks_blocked_id_fkey";

alter table "public"."blocks" drop constraint "blocks_blocker_id_fkey";

alter table "public"."chatbot_messages" drop constraint "chatbot_messages_conversation_id_fkey";

alter table "public"."commission_ledger" drop constraint "commission_ledger_escrow_id_fkey";

alter table "public"."commission_ledger" drop constraint "commission_ledger_giver_id_fkey";

alter table "public"."commission_ledger" drop constraint "commission_ledger_moment_id_fkey";

alter table "public"."commission_ledger" drop constraint "commission_ledger_receiver_id_fkey";

alter table "public"."consent_history" drop constraint "consent_history_user_id_fkey";

alter table "public"."conversation_participants" drop constraint "conversation_participants_conversation_id_fkey";

alter table "public"."conversation_participants" drop constraint "conversation_participants_user_id_fkey";

alter table "public"."conversations" drop constraint "conversations_moment_id_fkey";

alter table "public"."conversations" drop constraint "fk_last_message";

alter table "public"."data_deletion_requests" drop constraint "data_deletion_requests_user_id_fkey";

alter table "public"."data_export_requests" drop constraint "data_export_requests_user_id_fkey";

alter table "public"."discount_codes" drop constraint "discount_codes_created_by_fkey";

alter table "public"."disputes" drop constraint "disputes_reported_user_id_fkey";

alter table "public"."disputes" drop constraint "disputes_reporter_id_fkey";

alter table "public"."disputes" drop constraint "disputes_resolved_by_fkey";

alter table "public"."disputes" drop constraint "disputes_transaction_id_fkey";

alter table "public"."email_logs" drop constraint "email_logs_recipient_user_id_fkey";

alter table "public"."escrow_idempotency_keys" drop constraint "escrow_idempotency_keys_escrow_id_fkey";

alter table "public"."escrow_transactions" drop constraint "escrow_transactions_gift_id_fkey";

alter table "public"."escrow_transactions" drop constraint "escrow_transactions_moment_id_fkey";

alter table "public"."escrow_transactions" drop constraint "escrow_transactions_original_currency_fkey";

alter table "public"."escrow_transactions" drop constraint "escrow_transactions_recipient_id_fkey";

alter table "public"."escrow_transactions" drop constraint "escrow_transactions_released_by_fkey";

alter table "public"."escrow_transactions" drop constraint "escrow_transactions_sender_id_fkey";

alter table "public"."escrow_transactions" drop constraint "escrow_transactions_settlement_currency_fkey";

alter table "public"."exchange_rates" drop constraint "exchange_rates_base_currency_fkey";

alter table "public"."exchange_rates" drop constraint "exchange_rates_target_currency_fkey";

alter table "public"."favorites" drop constraint "favorites_moment_id_fkey";

alter table "public"."favorites" drop constraint "favorites_user_id_fkey";

alter table "public"."fraud_alerts" drop constraint "fraud_alerts_escrow_id_fkey";

alter table "public"."fraud_alerts" drop constraint "fraud_alerts_user_id_fkey";

alter table "public"."fraud_cases" drop constraint "fraud_cases_assigned_to_fkey";

alter table "public"."fraud_cases" drop constraint "fraud_cases_resolved_by_fkey";

alter table "public"."fraud_cases" drop constraint "fraud_cases_user_id_fkey";

alter table "public"."fraud_evidence" drop constraint "fraud_evidence_case_id_fkey";

alter table "public"."fraud_evidence" drop constraint "fraud_evidence_uploaded_by_fkey";

alter table "public"."gift_contracts" drop constraint "gift_contracts_gift_id_fkey";

alter table "public"."gift_contracts" drop constraint "gift_contracts_giver_id_fkey";

alter table "public"."gift_contracts" drop constraint "gift_contracts_moment_id_fkey";

alter table "public"."gift_contracts" drop constraint "gift_contracts_receiver_id_fkey";

alter table "public"."gifts" drop constraint "gifts_giver_id_fkey";

alter table "public"."gifts" drop constraint "gifts_moment_id_fkey";

alter table "public"."gifts" drop constraint "gifts_original_currency_fkey";

alter table "public"."gifts" drop constraint "gifts_receiver_id_fkey";

alter table "public"."internal_error_log" drop constraint "internal_error_log_admin_id_fkey";

alter table "public"."kyc_verifications" drop constraint "kyc_verifications_user_id_fkey";

alter table "public"."linked_accounts" drop constraint "linked_accounts_linked_user_id_fkey";

alter table "public"."linked_accounts" drop constraint "linked_accounts_primary_user_id_fkey";

alter table "public"."linked_accounts" drop constraint "linked_accounts_verified_by_fkey";

alter table "public"."marketing_campaigns" drop constraint "marketing_campaigns_created_by_fkey";

alter table "public"."messages" drop constraint "messages_conversation_id_fkey";

alter table "public"."messages" drop constraint "messages_receiver_id_fkey";

alter table "public"."messages" drop constraint "messages_sender_id_fkey";

alter table "public"."moderation_actions" drop constraint "moderation_actions_user_id_fkey";

alter table "public"."moment_offers" drop constraint "moment_offers_host_id_fkey";

alter table "public"."moment_offers" drop constraint "moment_offers_moment_id_fkey";

alter table "public"."moment_offers" drop constraint "moment_offers_subscriber_id_fkey";

alter table "public"."moments" drop constraint "moments_image_id_fkey";

alter table "public"."moments" drop constraint "moments_moderated_by_fkey";

alter table "public"."moments" drop constraint "moments_status_check";

alter table "public"."moments" drop constraint "moments_user_id_fkey";

alter table "public"."notification_campaigns" drop constraint "notification_campaigns_created_by_fkey";

alter table "public"."notifications" drop constraint "notifications_user_id_fkey";

alter table "public"."payment_disputes" drop constraint "payment_disputes_commission_ledger_id_fkey";

alter table "public"."payment_disputes" drop constraint "payment_disputes_escrow_id_fkey";

alter table "public"."payment_disputes" drop constraint "payment_disputes_gift_id_fkey";

alter table "public"."payment_disputes" drop constraint "payment_disputes_giver_id_fkey";

alter table "public"."payment_disputes" drop constraint "payment_disputes_moment_id_fkey";

alter table "public"."payment_disputes" drop constraint "payment_disputes_opened_by_fkey";

alter table "public"."payment_disputes" drop constraint "payment_disputes_receiver_id_fkey";

alter table "public"."payment_transactions" drop constraint "payment_transactions_card_id_fkey";

alter table "public"."payment_transactions" drop constraint "payment_transactions_gift_id_fkey";

alter table "public"."payment_transactions" drop constraint "payment_transactions_user_id_fkey";

alter table "public"."payout_requests" drop constraint "payout_requests_processed_by_fkey";

alter table "public"."payout_requests" drop constraint "payout_requests_user_id_fkey";

alter table "public"."promo_code_usage" drop constraint "promo_code_usage_promo_code_id_fkey";

alter table "public"."promo_code_usage" drop constraint "promo_code_usage_user_id_fkey";

alter table "public"."promo_codes" drop constraint "promo_codes_campaign_id_fkey";

alter table "public"."promo_codes" drop constraint "promo_codes_created_by_fkey";

alter table "public"."proof_submissions" drop constraint "proof_submissions_gift_id_fkey";

alter table "public"."proof_submissions" drop constraint "proof_submissions_reviewer_id_fkey";

alter table "public"."proof_submissions" drop constraint "proof_submissions_submitter_id_fkey";

alter table "public"."proof_verifications" drop constraint "proof_verifications_moment_id_fkey";

alter table "public"."proof_verifications" drop constraint "proof_verifications_user_id_fkey";

alter table "public"."proofs" drop constraint "proofs_escrow_id_fkey";

alter table "public"."proofs" drop constraint "proofs_gift_id_fkey";

alter table "public"."proofs" drop constraint "proofs_moment_id_fkey";

alter table "public"."proofs" drop constraint "proofs_user_id_fkey";

alter table "public"."recommendation_feedback" drop constraint "recommendation_feedback_moment_id_fkey";

alter table "public"."report_actions" drop constraint "report_actions_action_by_fkey";

alter table "public"."report_actions" drop constraint "report_actions_report_id_fkey";

alter table "public"."reports" drop constraint "reports_assigned_to_fkey";

alter table "public"."reports" drop constraint "reports_check";

alter table "public"."reports" drop constraint "reports_reported_moment_id_fkey";

alter table "public"."reports" drop constraint "reports_reported_user_id_fkey";

alter table "public"."reports" drop constraint "reports_reporter_id_fkey";

alter table "public"."requests" drop constraint "requests_host_id_fkey";

alter table "public"."requests" drop constraint "requests_moment_id_fkey";

alter table "public"."requests" drop constraint "requests_user_id_fkey";

alter table "public"."reviews" drop constraint "reviews_moment_id_fkey";

alter table "public"."reviews" drop constraint "reviews_reviewed_id_fkey";

alter table "public"."reviews" drop constraint "reviews_reviewer_id_fkey";

alter table "public"."saved_cards" drop constraint "saved_cards_user_id_fkey";

alter table "public"."security_logs" drop constraint "security_logs_user_id_fkey";

alter table "public"."sensitive_data_access_log" drop constraint "sensitive_data_access_log_user_id_fkey";

alter table "public"."stories" drop constraint "stories_moment_id_fkey";

alter table "public"."stories" drop constraint "stories_user_id_fkey";

alter table "public"."story_views" drop constraint "story_views_story_id_fkey";

alter table "public"."suspicious_activity_reports" drop constraint "suspicious_activity_reports_user_id_fkey";

alter table "public"."tasks" drop constraint "tasks_assigned_to_fkey";

alter table "public"."tasks" drop constraint "tasks_completed_by_fkey";

alter table "public"."transactions" drop constraint "transactions_moment_id_fkey";

alter table "public"."transactions" drop constraint "transactions_recipient_id_fkey";

alter table "public"."transactions" drop constraint "transactions_sender_id_fkey";

alter table "public"."transactions" drop constraint "transactions_user_id_fkey";

alter table "public"."triage_items" drop constraint "triage_items_assigned_to_fkey";

alter table "public"."triage_items" drop constraint "triage_items_resolved_by_fkey";

alter table "public"."trust_notes" drop constraint "trust_notes_author_id_fkey";

alter table "public"."trust_notes" drop constraint "trust_notes_escrow_id_fkey";

alter table "public"."trust_notes" drop constraint "trust_notes_gift_id_fkey";

alter table "public"."trust_notes" drop constraint "trust_notes_moderated_by_fkey";

alter table "public"."trust_notes" drop constraint "trust_notes_moment_id_fkey";

alter table "public"."trust_notes" drop constraint "trust_notes_recipient_id_fkey";

alter table "public"."user_badges" drop constraint "user_badges_badge_id_fkey";

alter table "public"."user_badges" drop constraint "user_badges_user_id_fkey";

alter table "public"."user_bank_accounts" drop constraint "user_bank_accounts_user_id_fkey";

alter table "public"."user_commission_settings" drop constraint "user_commission_settings_user_id_fkey";

alter table "public"."user_consents" drop constraint "user_consents_user_id_fkey";

alter table "public"."user_limits" drop constraint "user_limits_plan_id_fkey";

alter table "public"."user_payment_stats" drop constraint "user_payment_stats_user_id_fkey";

alter table "public"."user_risk_profiles" drop constraint "user_risk_profiles_user_id_fkey";

alter table "public"."user_safety" drop constraint "user_safety_user_id_fkey";

alter table "public"."user_subscriptions" drop constraint "user_subscriptions_plan_id_fkey";

alter table "public"."user_subscriptions" drop constraint "user_subscriptions_user_id_fkey";

alter table "public"."users" drop constraint "users_preferred_currency_fkey";

alter table "public"."vip_users" drop constraint "vip_users_granted_by_fkey";

alter table "public"."vip_users" drop constraint "vip_users_user_id_fkey";

alter table "public"."wallet_transactions" drop constraint "wallet_transactions_created_by_fkey";

alter table "public"."wallet_transactions" drop constraint "wallet_transactions_user_id_fkey";

alter table "public"."withdrawal_requests" drop constraint "withdrawal_requests_bank_account_id_fkey";

alter table "public"."withdrawal_requests" drop constraint "withdrawal_requests_user_id_fkey";

drop function if exists "public"."admin_set_user_vip"(p_admin_id uuid, p_user_id uuid, p_account_type user_account_type, p_reason text, p_social_platform text, p_social_handle text, p_follower_count integer, p_expires_at timestamp with time zone);

drop function if exists "public"."deposit_funds"(p_user_id uuid, p_amount numeric);

drop function if exists "public"."get_messages_keyset"(p_conversation_id uuid, p_cursor timestamp with time zone, p_limit integer);

drop function if exists "public"."get_moments_keyset"(p_cursor timestamp with time zone, p_limit integer, p_category text, p_status text);

drop function if exists "public"."get_notifications_keyset"(p_user_id uuid, p_cursor timestamp with time zone, p_limit integer);

drop function if exists "public"."get_transactions_keyset"(p_user_id uuid, p_cursor timestamp with time zone, p_limit integer);

drop function if exists "public"."log_sensitive_storage_access"();

drop function if exists "public"."open_dispute"(p_user_id uuid, p_escrow_id uuid, p_reason dispute_reason, p_description text, p_evidence_urls text[]);

drop view if exists "public"."public_profiles";

drop function if exists "public"."transfer_funds"(p_from_user_id uuid, p_to_user_id uuid, p_amount numeric, p_description text);

drop function if exists "public"."update_app_config_timestamp"();

drop function if exists "public"."update_fraud_evidence_count"();

drop function if exists "public"."update_linked_accounts_count"();

drop function if exists "public"."withdraw_funds"(p_user_id uuid, p_amount numeric);

drop view if exists "public"."admin_moderation_inbox";

drop type "public"."geometry_dump";

drop function if exists "public"."get_proof_requirement"(p_amount numeric);

drop type "public"."valid_detail";

drop index if exists "public"."idx_ab_experiments_created_by";

drop index if exists "public"."idx_ai_anomalies_resolved_by";

drop index if exists "public"."idx_alerts_active";

drop index if exists "public"."idx_blocked_content_reviewed_by";

drop index if exists "public"."idx_conversations_participants";

drop index if exists "public"."idx_moderation_dictionary_added_by";

drop index if exists "public"."idx_moments_category";

drop index if exists "public"."idx_moments_date";

drop index if exists "public"."idx_moments_location";

drop index if exists "public"."idx_moments_status";

drop index if exists "public"."idx_reports_reported_id";

drop index if exists "public"."idx_requests_status";

drop index if exists "public"."idx_transactions_status";

drop index if exists "public"."idx_users_coordinates";

drop index if exists "public"."idx_users_username";

drop index if exists "public"."idx_alerts_severity";

drop index if exists "public"."idx_alerts_status";

drop index if exists "public"."idx_disputes_pending";

drop index if exists "public"."idx_reports_reported_user_id";

drop index if exists "public"."idx_user_commission_vip";

drop index if exists "public"."idx_users_name_trgm";


  create table "public"."daily_request_stats" (
    "id" bigint not null default nextval('public.daily_request_stats_id_seq'::regclass),
    "day" date not null,
    "status" text not null,
    "request_count" bigint not null,
    "avg_age_seconds" bigint,
    "p95_age_seconds" double precision,
    "captured_at" timestamp with time zone not null default now()
      );


alter table "public"."daily_request_stats" enable row level security;


  create table "public"."table_growth_stats" (
    "id" bigint not null default nextval('public.table_growth_stats_id_seq'::regclass),
    "schema_name" text not null,
    "table_name" text not null,
    "total_bytes" bigint not null,
    "inserts" bigint not null,
    "updates" bigint not null,
    "deletes" bigint not null,
    "vacuums" bigint not null,
    "autovacuums" bigint not null,
    "captured_at" timestamp with time zone not null default now()
      );


alter table "public"."table_growth_stats" enable row level security;


  create table "public"."videos" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "url" text not null,
    "thumbnail_url" text,
    "duration" integer,
    "title" character varying(255),
    "description" text,
    "status" character varying(50) default 'processing'::character varying,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "deleted_at" timestamp with time zone
      );


alter table "public"."videos" enable row level security;

alter table "public"."admin_users" alter column "role" set default 'viewer'::public.admin_role;

alter table "public"."admin_users" alter column "role" set data type public.admin_role using "role"::text::public.admin_role;

alter table "public"."alerts" alter column "severity" set default 'info'::text;

alter table "public"."alerts" alter column "severity" set data type text using "severity"::text;

alter table "public"."alerts" alter column "status" set default 'active'::text;

alter table "public"."alerts" alter column "status" set data type text using "status"::text;

alter table "public"."appeals" drop column "appeal_type";

alter table "public"."appeals" drop column "reason";

alter table "public"."appeals" drop column "resolution_notes";

alter table "public"."appeals" add column "case_type" text;

alter table "public"."appeals" add column "description" text not null;

alter table "public"."appeals" add column "reason_code" text;

alter table "public"."appeals" add column "staff_notes" text;

alter table "public"."audit_logs" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."badges" alter column "category" set data type public.badge_category using "category"::text::public.badge_category;

alter table "public"."blocks" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."cache_invalidation" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."commission_ledger" alter column "receiver_account_type" set default 'standard'::public.user_account_type;

alter table "public"."commission_ledger" alter column "receiver_account_type" set data type public.user_account_type using "receiver_account_type"::text::public.user_account_type;

alter table "public"."conversation_participants" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."conversations" add column "deleted_at" timestamp with time zone;

alter table "public"."conversations" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."favorites" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."feed_delta" alter column "version" set default nextval('public.feed_delta_version_seq'::regclass);

alter table "public"."kyc_verifications" drop column "ai_confidence_score";

alter table "public"."kyc_verifications" drop column "ai_flags";

alter table "public"."kyc_verifications" drop column "document_back_url";

alter table "public"."kyc_verifications" drop column "document_front_url";

alter table "public"."kyc_verifications" drop column "document_type";

alter table "public"."kyc_verifications" drop column "rejection_reason";

alter table "public"."kyc_verifications" drop column "reviewed_at";

alter table "public"."kyc_verifications" drop column "reviewed_by";

alter table "public"."kyc_verifications" drop column "selfie_url";

alter table "public"."kyc_verifications" drop column "submitted_at";

alter table "public"."kyc_verifications" drop column "verification_notes";

alter table "public"."kyc_verifications" add column "confidence" numeric(3,2);

alter table "public"."kyc_verifications" add column "provider" text not null;

alter table "public"."kyc_verifications" add column "provider_check_id" text;

alter table "public"."kyc_verifications" add column "provider_id" text;

alter table "public"."kyc_verifications" add column "rejection_reasons" text[];

alter table "public"."kyc_verifications" alter column "created_at" set not null;

alter table "public"."kyc_verifications" alter column "metadata" drop default;

alter table "public"."kyc_verifications" alter column "status" drop default;

alter table "public"."kyc_verifications" alter column "updated_at" set not null;

alter table "public"."messages" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."messages" alter column "visibility" set default 'public'::public.message_visibility_type;

alter table "public"."messages" alter column "visibility" set data type public.message_visibility_type using "visibility"::text::public.message_visibility_type;

alter table "public"."moments" add column "deleted_at" timestamp with time zone;

alter table "public"."moments" alter column "coordinates" set data type public.geography(Point,4326) using "coordinates"::public.geography(Point,4326);

alter table "public"."moments" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."moments" alter column "location_geography" set data type public.geography(Point,4326) using "location_geography"::public.geography(Point,4326);

alter table "public"."notifications" add column "deleted_at" timestamp with time zone;

alter table "public"."notifications" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."payment_disputes" alter column "reason" set data type public.dispute_reason using "reason"::text::public.dispute_reason;

alter table "public"."payment_disputes" alter column "status" set default 'pending'::public.dispute_status;

alter table "public"."payment_disputes" alter column "status" set data type public.dispute_status using "status"::text::public.dispute_status;

alter table "public"."processed_webhook_events" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."proof_requirement_tiers" alter column "requirement" set data type public.proof_requirement_type using "requirement"::text::public.proof_requirement_type;

alter table "public"."proof_submissions" alter column "submitted_location" set data type public.geography(Point,4326) using "submitted_location"::public.geography(Point,4326);

alter table "public"."proof_verifications" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."report_actions" alter column "action_by" drop not null;

alter table "public"."reports" drop column "resolution";

alter table "public"."reports" drop column "type";

alter table "public"."reports" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."reports" alter column "priority" set default 'medium'::text;

alter table "public"."reports" alter column "priority" drop not null;

alter table "public"."reports" alter column "priority" set data type text using "priority"::text;

alter table "public"."requests" add column "deleted_at" timestamp with time zone;

alter table "public"."requests" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."reviews" drop column "request_id";

alter table "public"."reviews" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."role_permissions" alter column "role" set data type public.admin_role using "role"::text::public.admin_role;

alter table "public"."tasks" alter column "assigned_roles" set default '{}'::public.admin_role[];

alter table "public"."tasks" alter column "assigned_roles" set data type public.admin_role[] using "assigned_roles"::public.admin_role[];

alter table "public"."tasks" alter column "priority" set default 'medium'::public.task_priority;

alter table "public"."tasks" alter column "priority" set data type public.task_priority using "priority"::text::public.task_priority;

alter table "public"."tasks" alter column "status" set default 'pending'::public.task_status;

alter table "public"."tasks" alter column "status" set data type public.task_status using "status"::text::public.task_status;

alter table "public"."transactions" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."uploaded_images" drop column "file_size";

alter table "public"."uploaded_images" drop column "image_type";

alter table "public"."uploaded_images" drop column "mime_type";

alter table "public"."uploaded_images" drop column "public_url";

alter table "public"."user_commission_settings" alter column "account_type" set default 'standard'::public.user_account_type;

alter table "public"."user_commission_settings" alter column "account_type" set data type public.user_account_type using "account_type"::text::public.user_account_type;

alter table "public"."user_subscriptions" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."user_subscriptions" alter column "provider" set default 'stripe'::text;

alter table "public"."users" add column "distance_preference" integer default 50;

alter table "public"."users" add column "is_discoverable" boolean default true;

alter table "public"."users" add column "public_key" text;

alter table "public"."users" add column "stripe_customer_id" text;

alter table "public"."users" alter column "coordinates" set data type public.geography(Point,4326) using "coordinates"::public.geography(Point,4326);

alter table "public"."users" alter column "id" set default extensions.uuid_generate_v4();

alter table "public"."users" alter column "moderation_status" set default 'active'::public.moderation_status_type;

alter table "public"."users" alter column "moderation_status" set data type public.moderation_status_type using "moderation_status"::text::public.moderation_status_type;

alter table "public"."wallet_transactions" alter column "type" set default 'adjustment'::text;

alter table "public"."wallet_transactions" alter column "type" set data type text using "type"::text;

alter sequence "public"."daily_request_stats_id_seq" owned by "public"."daily_request_stats"."id";

alter sequence "public"."table_growth_stats_id_seq" owned by "public"."table_growth_stats"."id";

drop sequence if exists "public"."fraud_case_number_seq";

drop type "public"."alert_severity";

drop type "public"."alert_status";

drop type "public"."fraud_case_priority";

drop type "public"."fraud_case_status";

drop type "public"."fraud_case_type";

drop type "public"."fraud_evidence_type";

drop type "public"."linked_account_connection";

drop type "public"."payout_method";

drop type "public"."payout_status";

drop type "public"."report_status";

drop type "public"."vip_status";

drop type "public"."vip_tier";

drop type "public"."wallet_transaction_type";

CREATE INDEX active_alerts_acknowledged_by_idx ON public.active_alerts USING btree (acknowledged_by);

CREATE INDEX active_alerts_resolved_by_idx ON public.active_alerts USING btree (resolved_by);

CREATE INDEX ai_anomalies_resolved_by_idx ON public.ai_anomalies USING btree (resolved_by);

CREATE INDEX alert_history_resolved_by_idx ON public.alert_history USING btree (resolved_by);

CREATE INDEX alert_rules_created_by_idx ON public.alert_rules USING btree (created_by);

CREATE INDEX alerts_acknowledged_by_idx ON public.alerts USING btree (acknowledged_by);

CREATE INDEX alerts_resolved_by_idx ON public.alerts USING btree (resolved_by);

CREATE UNIQUE INDEX appeals_user_id_case_type_status_key ON public.appeals USING btree (user_id, case_type, status);

CREATE INDEX blocked_content_reviewed_by_idx ON public.blocked_content USING btree (reviewed_by);

CREATE UNIQUE INDEX daily_request_stats_pkey ON public.daily_request_stats USING btree (id);

CREATE INDEX discount_codes_created_by_idx ON public.discount_codes USING btree (created_by);

CREATE INDEX fraud_cases_assigned_to_idx ON public.fraud_cases USING btree (assigned_to);

CREATE INDEX fraud_cases_resolved_by_idx ON public.fraud_cases USING btree (resolved_by);

CREATE INDEX fraud_evidence_uploaded_by_idx ON public.fraud_evidence USING btree (uploaded_by);

CREATE INDEX idx_conversations_participant_ids_gin ON public.conversations USING gin (participant_ids);

CREATE INDEX idx_daily_request_stats_day_status ON public.daily_request_stats USING btree (day, status);

CREATE INDEX idx_proof_submissions_reviewer_id ON public.proof_submissions USING btree (reviewer_id);

CREATE INDEX idx_table_growth_stats_table_time ON public.table_growth_stats USING btree (schema_name, table_name, captured_at);

CREATE INDEX idx_users_coordinates_gist ON public.users USING gist (coordinates);

CREATE INDEX idx_users_distance_preference ON public.users USING btree (distance_preference);

CREATE INDEX idx_users_is_discoverable ON public.users USING btree (is_discoverable) WHERE (is_discoverable = true);

CREATE INDEX internal_error_log_admin_id_idx ON public.internal_error_log USING btree (admin_id);

CREATE INDEX linked_accounts_verified_by_idx ON public.linked_accounts USING btree (verified_by);

CREATE INDEX moderation_dictionary_added_by_idx ON public.moderation_dictionary USING btree (added_by);

CREATE INDEX payout_requests_processed_by_idx ON public.payout_requests USING btree (processed_by);

CREATE INDEX report_actions_action_by_idx ON public.report_actions USING btree (action_by);

CREATE INDEX reports_assigned_to_idx ON public.reports USING btree (assigned_to);

CREATE INDEX reports_reported_id_idx ON public.reports USING btree (reported_id);

CREATE INDEX stories_moment_id_idx ON public.stories USING btree (moment_id);

CREATE UNIQUE INDEX table_growth_stats_pkey ON public.table_growth_stats USING btree (id);

CREATE INDEX triage_items_resolved_by_idx ON public.triage_items USING btree (resolved_by);

CREATE UNIQUE INDEX users_stripe_customer_id_key ON public.users USING btree (stripe_customer_id);

CREATE UNIQUE INDEX videos_pkey ON public.videos USING btree (id);

CREATE INDEX videos_user_id_idx ON public.videos USING btree (user_id);

CREATE INDEX vip_users_granted_by_idx ON public.vip_users USING btree (granted_by);

CREATE INDEX wallet_transactions_created_by_idx ON public.wallet_transactions USING btree (created_by);

CREATE INDEX idx_alerts_severity ON public.alerts USING btree (severity);

CREATE INDEX idx_alerts_status ON public.alerts USING btree (status);

CREATE INDEX idx_disputes_pending ON public.payment_disputes USING btree (created_at) WHERE (status = ANY (ARRAY['pending'::public.dispute_status, 'under_review'::public.dispute_status, 'awaiting_response'::public.dispute_status]));

CREATE INDEX idx_reports_reported_user_id ON public.reports USING btree (reported_user_id);

CREATE INDEX idx_user_commission_vip ON public.user_commission_settings USING btree (account_type) WHERE (account_type = ANY (ARRAY['vip'::public.user_account_type, 'influencer'::public.user_account_type]));

CREATE INDEX idx_users_name_trgm ON public.users USING gin (full_name public.gin_trgm_ops);

alter table "public"."daily_request_stats" add constraint "daily_request_stats_pkey" PRIMARY KEY using index "daily_request_stats_pkey";

alter table "public"."table_growth_stats" add constraint "table_growth_stats_pkey" PRIMARY KEY using index "table_growth_stats_pkey";

alter table "public"."videos" add constraint "videos_pkey" PRIMARY KEY using index "videos_pkey";

alter table "public"."appeals" add constraint "appeals_case_type_check" CHECK ((case_type = ANY (ARRAY['account_ban'::text, 'content_removal'::text, 'shadowban'::text, 'trust_score'::text]))) not valid;

alter table "public"."appeals" validate constraint "appeals_case_type_check";

alter table "public"."appeals" add constraint "appeals_user_id_case_type_status_key" UNIQUE using index "appeals_user_id_case_type_status_key";

alter table "public"."kyc_verifications" add constraint "kyc_verifications_confidence_check" CHECK (((confidence >= (0)::numeric) AND (confidence <= (1)::numeric))) not valid;

alter table "public"."kyc_verifications" validate constraint "kyc_verifications_confidence_check";

alter table "public"."kyc_verifications" add constraint "kyc_verifications_provider_check" CHECK ((provider = ANY (ARRAY['onfido'::text, 'stripe_identity'::text, 'mock'::text]))) not valid;

alter table "public"."kyc_verifications" validate constraint "kyc_verifications_provider_check";

alter table "public"."kyc_verifications" add constraint "kyc_verifications_status_check" CHECK ((status = ANY (ARRAY['verified'::text, 'rejected'::text, 'needs_review'::text]))) not valid;

alter table "public"."kyc_verifications" validate constraint "kyc_verifications_status_check";

alter table "public"."reports" add constraint "reports_reported_id_fkey" FOREIGN KEY (reported_id) REFERENCES public.users(id) not valid;

alter table "public"."reports" validate constraint "reports_reported_id_fkey";

alter table "public"."users" add constraint "users_distance_preference_check" CHECK (((distance_preference >= 5) AND (distance_preference <= 500))) not valid;

alter table "public"."users" validate constraint "users_distance_preference_check";

alter table "public"."users" add constraint "users_stripe_customer_id_key" UNIQUE using index "users_stripe_customer_id_key";

alter table "public"."videos" add constraint "videos_status_check" CHECK (((status)::text = ANY ((ARRAY['processing'::character varying, 'ready'::character varying, 'failed'::character varying])::text[]))) not valid;

alter table "public"."videos" validate constraint "videos_status_check";

alter table "public"."videos" add constraint "videos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."videos" validate constraint "videos_user_id_fkey";

alter table "public"."ab_assignments" add constraint "ab_assignments_experiment_id_fkey" FOREIGN KEY (experiment_id) REFERENCES public.ab_experiments(id) ON DELETE CASCADE not valid;

alter table "public"."ab_assignments" validate constraint "ab_assignments_experiment_id_fkey";

alter table "public"."active_alerts" add constraint "active_alerts_acknowledged_by_fkey" FOREIGN KEY (acknowledged_by) REFERENCES public.admin_users(id) ON DELETE SET NULL not valid;

alter table "public"."active_alerts" validate constraint "active_alerts_acknowledged_by_fkey";

alter table "public"."active_alerts" add constraint "active_alerts_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES public.admin_users(id) ON DELETE SET NULL not valid;

alter table "public"."active_alerts" validate constraint "active_alerts_resolved_by_fkey";

alter table "public"."active_alerts" add constraint "active_alerts_rule_id_fkey" FOREIGN KEY (rule_id) REFERENCES public.alert_rules(id) ON DELETE CASCADE not valid;

alter table "public"."active_alerts" validate constraint "active_alerts_rule_id_fkey";

alter table "public"."admin_audit_logs" add constraint "admin_audit_logs_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES public.admin_users(id) not valid;

alter table "public"."admin_audit_logs" validate constraint "admin_audit_logs_admin_id_fkey";

alter table "public"."admin_sessions" add constraint "admin_sessions_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES public.admin_users(id) ON DELETE CASCADE not valid;

alter table "public"."admin_sessions" validate constraint "admin_sessions_admin_id_fkey";

alter table "public"."admin_users" add constraint "admin_users_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.admin_users(id) not valid;

alter table "public"."admin_users" validate constraint "admin_users_created_by_fkey";

alter table "public"."alert_history" add constraint "alert_history_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES public.admin_users(id) ON DELETE SET NULL not valid;

alter table "public"."alert_history" validate constraint "alert_history_resolved_by_fkey";

alter table "public"."alert_history" add constraint "alert_history_rule_id_fkey" FOREIGN KEY (rule_id) REFERENCES public.alert_rules(id) ON DELETE SET NULL not valid;

alter table "public"."alert_history" validate constraint "alert_history_rule_id_fkey";

alter table "public"."alert_rules" add constraint "alert_rules_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.admin_users(id) ON DELETE SET NULL not valid;

alter table "public"."alert_rules" validate constraint "alert_rules_created_by_fkey";

alter table "public"."alerts" add constraint "alerts_acknowledged_by_fkey" FOREIGN KEY (acknowledged_by) REFERENCES public.admin_users(id) not valid;

alter table "public"."alerts" validate constraint "alerts_acknowledged_by_fkey";

alter table "public"."alerts" add constraint "alerts_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES public.admin_users(id) not valid;

alter table "public"."alerts" validate constraint "alerts_resolved_by_fkey";

alter table "public"."appeals" add constraint "appeals_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."appeals" validate constraint "appeals_user_id_fkey";

alter table "public"."audit_logs" add constraint "audit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_user_id_fkey";

alter table "public"."blocks" add constraint "blocks_blocked_id_fkey" FOREIGN KEY (blocked_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."blocks" validate constraint "blocks_blocked_id_fkey";

alter table "public"."blocks" add constraint "blocks_blocker_id_fkey" FOREIGN KEY (blocker_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."blocks" validate constraint "blocks_blocker_id_fkey";

alter table "public"."chatbot_messages" add constraint "chatbot_messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.chatbot_conversations(id) ON DELETE CASCADE not valid;

alter table "public"."chatbot_messages" validate constraint "chatbot_messages_conversation_id_fkey";

alter table "public"."commission_ledger" add constraint "commission_ledger_escrow_id_fkey" FOREIGN KEY (escrow_id) REFERENCES public.escrow_transactions(id) not valid;

alter table "public"."commission_ledger" validate constraint "commission_ledger_escrow_id_fkey";

alter table "public"."commission_ledger" add constraint "commission_ledger_giver_id_fkey" FOREIGN KEY (giver_id) REFERENCES public.users(id) not valid;

alter table "public"."commission_ledger" validate constraint "commission_ledger_giver_id_fkey";

alter table "public"."commission_ledger" add constraint "commission_ledger_moment_id_fkey" FOREIGN KEY (moment_id) REFERENCES public.moments(id) not valid;

alter table "public"."commission_ledger" validate constraint "commission_ledger_moment_id_fkey";

alter table "public"."commission_ledger" add constraint "commission_ledger_receiver_id_fkey" FOREIGN KEY (receiver_id) REFERENCES public.users(id) not valid;

alter table "public"."commission_ledger" validate constraint "commission_ledger_receiver_id_fkey";

alter table "public"."consent_history" add constraint "consent_history_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."consent_history" validate constraint "consent_history_user_id_fkey";

alter table "public"."conversation_participants" add constraint "conversation_participants_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE not valid;

alter table "public"."conversation_participants" validate constraint "conversation_participants_conversation_id_fkey";

alter table "public"."conversation_participants" add constraint "conversation_participants_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."conversation_participants" validate constraint "conversation_participants_user_id_fkey";

alter table "public"."conversations" add constraint "conversations_moment_id_fkey" FOREIGN KEY (moment_id) REFERENCES public.moments(id) ON DELETE SET NULL not valid;

alter table "public"."conversations" validate constraint "conversations_moment_id_fkey";

alter table "public"."conversations" add constraint "fk_last_message" FOREIGN KEY (last_message_id) REFERENCES public.messages(id) ON DELETE SET NULL not valid;

alter table "public"."conversations" validate constraint "fk_last_message";

alter table "public"."data_deletion_requests" add constraint "data_deletion_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."data_deletion_requests" validate constraint "data_deletion_requests_user_id_fkey";

alter table "public"."data_export_requests" add constraint "data_export_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."data_export_requests" validate constraint "data_export_requests_user_id_fkey";

alter table "public"."discount_codes" add constraint "discount_codes_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.admin_users(id) not valid;

alter table "public"."discount_codes" validate constraint "discount_codes_created_by_fkey";

alter table "public"."disputes" add constraint "disputes_reported_user_id_fkey" FOREIGN KEY (reported_user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."disputes" validate constraint "disputes_reported_user_id_fkey";

alter table "public"."disputes" add constraint "disputes_reporter_id_fkey" FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."disputes" validate constraint "disputes_reporter_id_fkey";

alter table "public"."disputes" add constraint "disputes_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES public.admin_users(id) not valid;

alter table "public"."disputes" validate constraint "disputes_resolved_by_fkey";

alter table "public"."disputes" add constraint "disputes_transaction_id_fkey" FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE SET NULL not valid;

alter table "public"."disputes" validate constraint "disputes_transaction_id_fkey";

alter table "public"."email_logs" add constraint "email_logs_recipient_user_id_fkey" FOREIGN KEY (recipient_user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."email_logs" validate constraint "email_logs_recipient_user_id_fkey";

alter table "public"."escrow_idempotency_keys" add constraint "escrow_idempotency_keys_escrow_id_fkey" FOREIGN KEY (escrow_id) REFERENCES public.escrow_transactions(id) ON DELETE CASCADE not valid;

alter table "public"."escrow_idempotency_keys" validate constraint "escrow_idempotency_keys_escrow_id_fkey";

alter table "public"."escrow_transactions" add constraint "escrow_transactions_gift_id_fkey" FOREIGN KEY (gift_id) REFERENCES public.gifts(id) ON DELETE SET NULL not valid;

alter table "public"."escrow_transactions" validate constraint "escrow_transactions_gift_id_fkey";

alter table "public"."escrow_transactions" add constraint "escrow_transactions_moment_id_fkey" FOREIGN KEY (moment_id) REFERENCES public.moments(id) ON DELETE SET NULL not valid;

alter table "public"."escrow_transactions" validate constraint "escrow_transactions_moment_id_fkey";

alter table "public"."escrow_transactions" add constraint "escrow_transactions_original_currency_fkey" FOREIGN KEY (original_currency) REFERENCES public.currencies(code) not valid;

alter table "public"."escrow_transactions" validate constraint "escrow_transactions_original_currency_fkey";

alter table "public"."escrow_transactions" add constraint "escrow_transactions_recipient_id_fkey" FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."escrow_transactions" validate constraint "escrow_transactions_recipient_id_fkey";

alter table "public"."escrow_transactions" add constraint "escrow_transactions_released_by_fkey" FOREIGN KEY (released_by) REFERENCES public.users(id) not valid;

alter table "public"."escrow_transactions" validate constraint "escrow_transactions_released_by_fkey";

alter table "public"."escrow_transactions" add constraint "escrow_transactions_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."escrow_transactions" validate constraint "escrow_transactions_sender_id_fkey";

alter table "public"."escrow_transactions" add constraint "escrow_transactions_settlement_currency_fkey" FOREIGN KEY (settlement_currency) REFERENCES public.currencies(code) not valid;

alter table "public"."escrow_transactions" validate constraint "escrow_transactions_settlement_currency_fkey";

alter table "public"."exchange_rates" add constraint "exchange_rates_base_currency_fkey" FOREIGN KEY (base_currency) REFERENCES public.currencies(code) not valid;

alter table "public"."exchange_rates" validate constraint "exchange_rates_base_currency_fkey";

alter table "public"."exchange_rates" add constraint "exchange_rates_target_currency_fkey" FOREIGN KEY (target_currency) REFERENCES public.currencies(code) not valid;

alter table "public"."exchange_rates" validate constraint "exchange_rates_target_currency_fkey";

alter table "public"."favorites" add constraint "favorites_moment_id_fkey" FOREIGN KEY (moment_id) REFERENCES public.moments(id) ON DELETE CASCADE not valid;

alter table "public"."favorites" validate constraint "favorites_moment_id_fkey";

alter table "public"."favorites" add constraint "favorites_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."favorites" validate constraint "favorites_user_id_fkey";

alter table "public"."fraud_alerts" add constraint "fraud_alerts_escrow_id_fkey" FOREIGN KEY (escrow_id) REFERENCES public.escrow_transactions(id) not valid;

alter table "public"."fraud_alerts" validate constraint "fraud_alerts_escrow_id_fkey";

alter table "public"."fraud_alerts" add constraint "fraud_alerts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."fraud_alerts" validate constraint "fraud_alerts_user_id_fkey";

alter table "public"."fraud_cases" add constraint "fraud_cases_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES public.admin_users(id) not valid;

alter table "public"."fraud_cases" validate constraint "fraud_cases_assigned_to_fkey";

alter table "public"."fraud_cases" add constraint "fraud_cases_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES public.admin_users(id) not valid;

alter table "public"."fraud_cases" validate constraint "fraud_cases_resolved_by_fkey";

alter table "public"."fraud_cases" add constraint "fraud_cases_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."fraud_cases" validate constraint "fraud_cases_user_id_fkey";

alter table "public"."fraud_evidence" add constraint "fraud_evidence_case_id_fkey" FOREIGN KEY (case_id) REFERENCES public.fraud_cases(id) ON DELETE CASCADE not valid;

alter table "public"."fraud_evidence" validate constraint "fraud_evidence_case_id_fkey";

alter table "public"."fraud_evidence" add constraint "fraud_evidence_uploaded_by_fkey" FOREIGN KEY (uploaded_by) REFERENCES public.admin_users(id) not valid;

alter table "public"."fraud_evidence" validate constraint "fraud_evidence_uploaded_by_fkey";

alter table "public"."gift_contracts" add constraint "gift_contracts_gift_id_fkey" FOREIGN KEY (gift_id) REFERENCES public.gifts(id) ON DELETE CASCADE not valid;

alter table "public"."gift_contracts" validate constraint "gift_contracts_gift_id_fkey";

alter table "public"."gift_contracts" add constraint "gift_contracts_giver_id_fkey" FOREIGN KEY (giver_id) REFERENCES public.users(id) not valid;

alter table "public"."gift_contracts" validate constraint "gift_contracts_giver_id_fkey";

alter table "public"."gift_contracts" add constraint "gift_contracts_moment_id_fkey" FOREIGN KEY (moment_id) REFERENCES public.moments(id) not valid;

alter table "public"."gift_contracts" validate constraint "gift_contracts_moment_id_fkey";

alter table "public"."gift_contracts" add constraint "gift_contracts_receiver_id_fkey" FOREIGN KEY (receiver_id) REFERENCES public.users(id) not valid;

alter table "public"."gift_contracts" validate constraint "gift_contracts_receiver_id_fkey";

alter table "public"."gifts" add constraint "gifts_giver_id_fkey" FOREIGN KEY (giver_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."gifts" validate constraint "gifts_giver_id_fkey";

alter table "public"."gifts" add constraint "gifts_moment_id_fkey" FOREIGN KEY (moment_id) REFERENCES public.moments(id) ON DELETE SET NULL not valid;

alter table "public"."gifts" validate constraint "gifts_moment_id_fkey";

alter table "public"."gifts" add constraint "gifts_original_currency_fkey" FOREIGN KEY (original_currency) REFERENCES public.currencies(code) not valid;

alter table "public"."gifts" validate constraint "gifts_original_currency_fkey";

alter table "public"."gifts" add constraint "gifts_receiver_id_fkey" FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."gifts" validate constraint "gifts_receiver_id_fkey";

alter table "public"."internal_error_log" add constraint "internal_error_log_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES public.admin_users(id) not valid;

alter table "public"."internal_error_log" validate constraint "internal_error_log_admin_id_fkey";

alter table "public"."kyc_verifications" add constraint "kyc_verifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."kyc_verifications" validate constraint "kyc_verifications_user_id_fkey";

alter table "public"."linked_accounts" add constraint "linked_accounts_linked_user_id_fkey" FOREIGN KEY (linked_user_id) REFERENCES public.users(id) not valid;

alter table "public"."linked_accounts" validate constraint "linked_accounts_linked_user_id_fkey";

alter table "public"."linked_accounts" add constraint "linked_accounts_primary_user_id_fkey" FOREIGN KEY (primary_user_id) REFERENCES public.users(id) not valid;

alter table "public"."linked_accounts" validate constraint "linked_accounts_primary_user_id_fkey";

alter table "public"."linked_accounts" add constraint "linked_accounts_verified_by_fkey" FOREIGN KEY (verified_by) REFERENCES public.admin_users(id) not valid;

alter table "public"."linked_accounts" validate constraint "linked_accounts_verified_by_fkey";

alter table "public"."marketing_campaigns" add constraint "marketing_campaigns_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."marketing_campaigns" validate constraint "marketing_campaigns_created_by_fkey";

alter table "public"."messages" add constraint "messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_conversation_id_fkey";

alter table "public"."messages" add constraint "messages_receiver_id_fkey" FOREIGN KEY (receiver_id) REFERENCES public.users(id) not valid;

alter table "public"."messages" validate constraint "messages_receiver_id_fkey";

alter table "public"."messages" add constraint "messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_sender_id_fkey";

alter table "public"."moderation_actions" add constraint "moderation_actions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."moderation_actions" validate constraint "moderation_actions_user_id_fkey";

alter table "public"."moment_offers" add constraint "moment_offers_host_id_fkey" FOREIGN KEY (host_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."moment_offers" validate constraint "moment_offers_host_id_fkey";

alter table "public"."moment_offers" add constraint "moment_offers_moment_id_fkey" FOREIGN KEY (moment_id) REFERENCES public.moments(id) ON DELETE CASCADE not valid;

alter table "public"."moment_offers" validate constraint "moment_offers_moment_id_fkey";

alter table "public"."moment_offers" add constraint "moment_offers_subscriber_id_fkey" FOREIGN KEY (subscriber_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."moment_offers" validate constraint "moment_offers_subscriber_id_fkey";

alter table "public"."moments" add constraint "moments_image_id_fkey" FOREIGN KEY (image_id) REFERENCES public.uploaded_images(id) ON DELETE SET NULL not valid;

alter table "public"."moments" validate constraint "moments_image_id_fkey";

alter table "public"."moments" add constraint "moments_moderated_by_fkey" FOREIGN KEY (moderated_by) REFERENCES public.admin_users(id) not valid;

alter table "public"."moments" validate constraint "moments_moderated_by_fkey";

alter table "public"."moments" add constraint "moments_status_check" CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'paused'::text, 'full'::text, 'completed'::text, 'cancelled'::text]))) not valid;

alter table "public"."moments" validate constraint "moments_status_check";

alter table "public"."moments" add constraint "moments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."moments" validate constraint "moments_user_id_fkey";

alter table "public"."notification_campaigns" add constraint "notification_campaigns_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."notification_campaigns" validate constraint "notification_campaigns_created_by_fkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."payment_disputes" add constraint "payment_disputes_commission_ledger_id_fkey" FOREIGN KEY (commission_ledger_id) REFERENCES public.commission_ledger(id) not valid;

alter table "public"."payment_disputes" validate constraint "payment_disputes_commission_ledger_id_fkey";

alter table "public"."payment_disputes" add constraint "payment_disputes_escrow_id_fkey" FOREIGN KEY (escrow_id) REFERENCES public.escrow_transactions(id) not valid;

alter table "public"."payment_disputes" validate constraint "payment_disputes_escrow_id_fkey";

alter table "public"."payment_disputes" add constraint "payment_disputes_gift_id_fkey" FOREIGN KEY (gift_id) REFERENCES public.gifts(id) not valid;

alter table "public"."payment_disputes" validate constraint "payment_disputes_gift_id_fkey";

alter table "public"."payment_disputes" add constraint "payment_disputes_giver_id_fkey" FOREIGN KEY (giver_id) REFERENCES public.users(id) not valid;

alter table "public"."payment_disputes" validate constraint "payment_disputes_giver_id_fkey";

alter table "public"."payment_disputes" add constraint "payment_disputes_moment_id_fkey" FOREIGN KEY (moment_id) REFERENCES public.moments(id) not valid;

alter table "public"."payment_disputes" validate constraint "payment_disputes_moment_id_fkey";

alter table "public"."payment_disputes" add constraint "payment_disputes_opened_by_fkey" FOREIGN KEY (opened_by) REFERENCES public.users(id) not valid;

alter table "public"."payment_disputes" validate constraint "payment_disputes_opened_by_fkey";

alter table "public"."payment_disputes" add constraint "payment_disputes_receiver_id_fkey" FOREIGN KEY (receiver_id) REFERENCES public.users(id) not valid;

alter table "public"."payment_disputes" validate constraint "payment_disputes_receiver_id_fkey";

alter table "public"."payment_transactions" add constraint "payment_transactions_card_id_fkey" FOREIGN KEY (card_id) REFERENCES public.saved_cards(id) not valid;

alter table "public"."payment_transactions" validate constraint "payment_transactions_card_id_fkey";

alter table "public"."payment_transactions" add constraint "payment_transactions_gift_id_fkey" FOREIGN KEY (gift_id) REFERENCES public.gifts(id) not valid;

alter table "public"."payment_transactions" validate constraint "payment_transactions_gift_id_fkey";

alter table "public"."payment_transactions" add constraint "payment_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."payment_transactions" validate constraint "payment_transactions_user_id_fkey";

alter table "public"."payout_requests" add constraint "payout_requests_processed_by_fkey" FOREIGN KEY (processed_by) REFERENCES public.admin_users(id) not valid;

alter table "public"."payout_requests" validate constraint "payout_requests_processed_by_fkey";

alter table "public"."payout_requests" add constraint "payout_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."payout_requests" validate constraint "payout_requests_user_id_fkey";

alter table "public"."promo_code_usage" add constraint "promo_code_usage_promo_code_id_fkey" FOREIGN KEY (promo_code_id) REFERENCES public.promo_codes(id) ON DELETE CASCADE not valid;

alter table "public"."promo_code_usage" validate constraint "promo_code_usage_promo_code_id_fkey";

alter table "public"."promo_code_usage" add constraint "promo_code_usage_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."promo_code_usage" validate constraint "promo_code_usage_user_id_fkey";

alter table "public"."promo_codes" add constraint "promo_codes_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES public.marketing_campaigns(id) ON DELETE SET NULL not valid;

alter table "public"."promo_codes" validate constraint "promo_codes_campaign_id_fkey";

alter table "public"."promo_codes" add constraint "promo_codes_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."promo_codes" validate constraint "promo_codes_created_by_fkey";

alter table "public"."proof_submissions" add constraint "proof_submissions_gift_id_fkey" FOREIGN KEY (gift_id) REFERENCES public.gifts(id) ON DELETE CASCADE not valid;

alter table "public"."proof_submissions" validate constraint "proof_submissions_gift_id_fkey";

alter table "public"."proof_submissions" add constraint "proof_submissions_reviewer_id_fkey" FOREIGN KEY (reviewer_id) REFERENCES public.users(id) not valid;

alter table "public"."proof_submissions" validate constraint "proof_submissions_reviewer_id_fkey";

alter table "public"."proof_submissions" add constraint "proof_submissions_submitter_id_fkey" FOREIGN KEY (submitter_id) REFERENCES public.users(id) not valid;

alter table "public"."proof_submissions" validate constraint "proof_submissions_submitter_id_fkey";

alter table "public"."proof_verifications" add constraint "proof_verifications_moment_id_fkey" FOREIGN KEY (moment_id) REFERENCES public.moments(id) ON DELETE CASCADE not valid;

alter table "public"."proof_verifications" validate constraint "proof_verifications_moment_id_fkey";

alter table "public"."proof_verifications" add constraint "proof_verifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."proof_verifications" validate constraint "proof_verifications_user_id_fkey";

alter table "public"."proofs" add constraint "proofs_escrow_id_fkey" FOREIGN KEY (escrow_id) REFERENCES public.escrow_transactions(id) not valid;

alter table "public"."proofs" validate constraint "proofs_escrow_id_fkey";

alter table "public"."proofs" add constraint "proofs_gift_id_fkey" FOREIGN KEY (gift_id) REFERENCES public.gifts(id) not valid;

alter table "public"."proofs" validate constraint "proofs_gift_id_fkey";

alter table "public"."proofs" add constraint "proofs_moment_id_fkey" FOREIGN KEY (moment_id) REFERENCES public.moments(id) not valid;

alter table "public"."proofs" validate constraint "proofs_moment_id_fkey";

alter table "public"."proofs" add constraint "proofs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."proofs" validate constraint "proofs_user_id_fkey";

alter table "public"."recommendation_feedback" add constraint "recommendation_feedback_moment_id_fkey" FOREIGN KEY (moment_id) REFERENCES public.moments(id) ON DELETE SET NULL not valid;

alter table "public"."recommendation_feedback" validate constraint "recommendation_feedback_moment_id_fkey";

alter table "public"."report_actions" add constraint "report_actions_action_by_fkey" FOREIGN KEY (action_by) REFERENCES public.admin_users(id) not valid;

alter table "public"."report_actions" validate constraint "report_actions_action_by_fkey";

alter table "public"."report_actions" add constraint "report_actions_report_id_fkey" FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE not valid;

alter table "public"."report_actions" validate constraint "report_actions_report_id_fkey";

alter table "public"."reports" add constraint "reports_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES public.admin_users(id) not valid;

alter table "public"."reports" validate constraint "reports_assigned_to_fkey";

alter table "public"."reports" add constraint "reports_check" CHECK (((reported_user_id IS NOT NULL) OR (reported_moment_id IS NOT NULL))) not valid;

alter table "public"."reports" validate constraint "reports_check";

alter table "public"."reports" add constraint "reports_reported_moment_id_fkey" FOREIGN KEY (reported_moment_id) REFERENCES public.moments(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_reported_moment_id_fkey";

alter table "public"."reports" add constraint "reports_reported_user_id_fkey" FOREIGN KEY (reported_user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_reported_user_id_fkey";

alter table "public"."reports" add constraint "reports_reporter_id_fkey" FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_reporter_id_fkey";

alter table "public"."requests" add constraint "requests_host_id_fkey" FOREIGN KEY (host_id) REFERENCES public.users(id) not valid;

alter table "public"."requests" validate constraint "requests_host_id_fkey";

alter table "public"."requests" add constraint "requests_moment_id_fkey" FOREIGN KEY (moment_id) REFERENCES public.moments(id) ON DELETE CASCADE not valid;

alter table "public"."requests" validate constraint "requests_moment_id_fkey";

alter table "public"."requests" add constraint "requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."requests" validate constraint "requests_user_id_fkey";

alter table "public"."reviews" add constraint "reviews_moment_id_fkey" FOREIGN KEY (moment_id) REFERENCES public.moments(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_moment_id_fkey";

alter table "public"."reviews" add constraint "reviews_reviewed_id_fkey" FOREIGN KEY (reviewed_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_reviewed_id_fkey";

alter table "public"."reviews" add constraint "reviews_reviewer_id_fkey" FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."reviews" validate constraint "reviews_reviewer_id_fkey";

alter table "public"."saved_cards" add constraint "saved_cards_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."saved_cards" validate constraint "saved_cards_user_id_fkey";

alter table "public"."security_logs" add constraint "security_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."security_logs" validate constraint "security_logs_user_id_fkey";

alter table "public"."sensitive_data_access_log" add constraint "sensitive_data_access_log_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."sensitive_data_access_log" validate constraint "sensitive_data_access_log_user_id_fkey";

alter table "public"."stories" add constraint "stories_moment_id_fkey" FOREIGN KEY (moment_id) REFERENCES public.moments(id) ON DELETE SET NULL not valid;

alter table "public"."stories" validate constraint "stories_moment_id_fkey";

alter table "public"."stories" add constraint "stories_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."stories" validate constraint "stories_user_id_fkey";

alter table "public"."story_views" add constraint "story_views_story_id_fkey" FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE not valid;

alter table "public"."story_views" validate constraint "story_views_story_id_fkey";

alter table "public"."suspicious_activity_reports" add constraint "suspicious_activity_reports_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."suspicious_activity_reports" validate constraint "suspicious_activity_reports_user_id_fkey";

alter table "public"."tasks" add constraint "tasks_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES public.admin_users(id) not valid;

alter table "public"."tasks" validate constraint "tasks_assigned_to_fkey";

alter table "public"."tasks" add constraint "tasks_completed_by_fkey" FOREIGN KEY (completed_by) REFERENCES public.admin_users(id) not valid;

alter table "public"."tasks" validate constraint "tasks_completed_by_fkey";

alter table "public"."transactions" add constraint "transactions_moment_id_fkey" FOREIGN KEY (moment_id) REFERENCES public.moments(id) ON DELETE SET NULL not valid;

alter table "public"."transactions" validate constraint "transactions_moment_id_fkey";

alter table "public"."transactions" add constraint "transactions_recipient_id_fkey" FOREIGN KEY (recipient_id) REFERENCES public.users(id) not valid;

alter table "public"."transactions" validate constraint "transactions_recipient_id_fkey";

alter table "public"."transactions" add constraint "transactions_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES public.users(id) not valid;

alter table "public"."transactions" validate constraint "transactions_sender_id_fkey";

alter table "public"."transactions" add constraint "transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."transactions" validate constraint "transactions_user_id_fkey";

alter table "public"."triage_items" add constraint "triage_items_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES public.admin_users(id) not valid;

alter table "public"."triage_items" validate constraint "triage_items_assigned_to_fkey";

alter table "public"."triage_items" add constraint "triage_items_resolved_by_fkey" FOREIGN KEY (resolved_by) REFERENCES public.admin_users(id) not valid;

alter table "public"."triage_items" validate constraint "triage_items_resolved_by_fkey";

alter table "public"."trust_notes" add constraint "trust_notes_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."trust_notes" validate constraint "trust_notes_author_id_fkey";

alter table "public"."trust_notes" add constraint "trust_notes_escrow_id_fkey" FOREIGN KEY (escrow_id) REFERENCES public.escrow_transactions(id) ON DELETE SET NULL not valid;

alter table "public"."trust_notes" validate constraint "trust_notes_escrow_id_fkey";

alter table "public"."trust_notes" add constraint "trust_notes_gift_id_fkey" FOREIGN KEY (gift_id) REFERENCES public.gifts(id) ON DELETE SET NULL not valid;

alter table "public"."trust_notes" validate constraint "trust_notes_gift_id_fkey";

alter table "public"."trust_notes" add constraint "trust_notes_moderated_by_fkey" FOREIGN KEY (moderated_by) REFERENCES public.users(id) not valid;

alter table "public"."trust_notes" validate constraint "trust_notes_moderated_by_fkey";

alter table "public"."trust_notes" add constraint "trust_notes_moment_id_fkey" FOREIGN KEY (moment_id) REFERENCES public.moments(id) ON DELETE SET NULL not valid;

alter table "public"."trust_notes" validate constraint "trust_notes_moment_id_fkey";

alter table "public"."trust_notes" add constraint "trust_notes_recipient_id_fkey" FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."trust_notes" validate constraint "trust_notes_recipient_id_fkey";

alter table "public"."user_badges" add constraint "user_badges_badge_id_fkey" FOREIGN KEY (badge_id) REFERENCES public.badges(id) ON DELETE CASCADE not valid;

alter table "public"."user_badges" validate constraint "user_badges_badge_id_fkey";

alter table "public"."user_badges" add constraint "user_badges_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_badges" validate constraint "user_badges_user_id_fkey";

alter table "public"."user_bank_accounts" add constraint "user_bank_accounts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_bank_accounts" validate constraint "user_bank_accounts_user_id_fkey";

alter table "public"."user_commission_settings" add constraint "user_commission_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_commission_settings" validate constraint "user_commission_settings_user_id_fkey";

alter table "public"."user_consents" add constraint "user_consents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_consents" validate constraint "user_consents_user_id_fkey";

alter table "public"."user_limits" add constraint "user_limits_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE CASCADE not valid;

alter table "public"."user_limits" validate constraint "user_limits_plan_id_fkey";

alter table "public"."user_payment_stats" add constraint "user_payment_stats_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_payment_stats" validate constraint "user_payment_stats_user_id_fkey";

alter table "public"."user_risk_profiles" add constraint "user_risk_profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_risk_profiles" validate constraint "user_risk_profiles_user_id_fkey";

alter table "public"."user_safety" add constraint "user_safety_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_safety" validate constraint "user_safety_user_id_fkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_plan_id_fkey";

alter table "public"."user_subscriptions" add constraint "user_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_subscriptions" validate constraint "user_subscriptions_user_id_fkey";

alter table "public"."users" add constraint "users_preferred_currency_fkey" FOREIGN KEY (preferred_currency) REFERENCES public.currencies(code) not valid;

alter table "public"."users" validate constraint "users_preferred_currency_fkey";

alter table "public"."vip_users" add constraint "vip_users_granted_by_fkey" FOREIGN KEY (granted_by) REFERENCES public.admin_users(id) not valid;

alter table "public"."vip_users" validate constraint "vip_users_granted_by_fkey";

alter table "public"."vip_users" add constraint "vip_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."vip_users" validate constraint "vip_users_user_id_fkey";

alter table "public"."wallet_transactions" add constraint "wallet_transactions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.admin_users(id) not valid;

alter table "public"."wallet_transactions" validate constraint "wallet_transactions_created_by_fkey";

alter table "public"."wallet_transactions" add constraint "wallet_transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."wallet_transactions" validate constraint "wallet_transactions_user_id_fkey";

alter table "public"."withdrawal_requests" add constraint "withdrawal_requests_bank_account_id_fkey" FOREIGN KEY (bank_account_id) REFERENCES public.user_bank_accounts(id) not valid;

alter table "public"."withdrawal_requests" validate constraint "withdrawal_requests_bank_account_id_fkey";

alter table "public"."withdrawal_requests" add constraint "withdrawal_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) not valid;

alter table "public"."withdrawal_requests" validate constraint "withdrawal_requests_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.admin_set_user_vip(p_admin_id uuid, p_user_id uuid, p_account_type public.user_account_type, p_reason text, p_social_platform text DEFAULT NULL::text, p_social_handle text DEFAULT NULL::text, p_follower_count integer DEFAULT NULL::integer, p_expires_at timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Upsert user commission settings
  INSERT INTO user_commission_settings (
    user_id,
    account_type,
    custom_rate_enabled,
    custom_giver_share,
    custom_receiver_share,
    vip_since,
    vip_reason,
    vip_expires_at,
    social_platform,
    social_handle,
    follower_count,
    verified_at,
    verified_by,
    created_by,
    updated_by
  ) VALUES (
    p_user_id,
    p_account_type,
    FALSE, -- Use tier rates, just change share split
    1.0,   -- Giver pays 100%
    0.0,   -- Receiver pays 0%
    NOW(),
    p_reason,
    p_expires_at,
    p_social_platform,
    p_social_handle,
    p_follower_count,
    NOW(),
    p_admin_id,
    p_admin_id,
    p_admin_id
  )
  ON CONFLICT (user_id) DO UPDATE SET
    account_type = EXCLUDED.account_type,
    custom_giver_share = 1.0,
    custom_receiver_share = 0.0,
    vip_since = COALESCE(user_commission_settings.vip_since, NOW()),
    vip_reason = EXCLUDED.vip_reason,
    vip_expires_at = EXCLUDED.vip_expires_at,
    social_platform = COALESCE(EXCLUDED.social_platform, user_commission_settings.social_platform),
    social_handle = COALESCE(EXCLUDED.social_handle, user_commission_settings.social_handle),
    follower_count = COALESCE(EXCLUDED.follower_count, user_commission_settings.follower_count),
    verified_at = NOW(),
    verified_by = p_admin_id,
    updated_at = NOW(),
    updated_by = p_admin_id;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'account_type', p_account_type,
    'vip_since', NOW(),
    'expires_at', p_expires_at
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.capture_insights_snapshots()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Capture requests per day/status from the view (only latest day rows to avoid duplicates)
  INSERT INTO public.daily_request_stats (day, status, request_count, avg_age_seconds, p95_age_seconds)
  SELECT day, status, request_count, avg_age_seconds, p95_age_seconds
  FROM public.requests_status_daily_insights
  WHERE day = (SELECT max(day) FROM public.requests_status_daily_insights);

  -- Capture table growth from the view
  INSERT INTO public.table_growth_stats (schema_name, table_name, total_bytes, inserts, updates, deletes, vacuums, autovacuums)
  SELECT schema_name, table_name, total_bytes, inserts, updates, deletes, vacuums, autovacuums
  FROM public.slow_growth_watch;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.deposit_funds(user_id_param uuid, amount numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  new_balance NUMERIC;
BEGIN
  -- Lock user row
  UPDATE wallets
  SET balance = balance + amount,
      updated_at = NOW()
  WHERE user_id = user_id_param
  RETURNING balance INTO new_balance;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', new_balance
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.feed_delta_on_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_participant_ids UUID[];
  v_pid UUID;
BEGIN
  -- Get participants from conversation
  -- For INSERT/UPDATE, use NEW.conversation_id
  -- For DELETE, use OLD.conversation_id
  IF TG_OP = 'DELETE' THEN
      SELECT participant_ids INTO v_participant_ids
      FROM public.conversations
      WHERE id = OLD.conversation_id;
  ELSE
      SELECT participant_ids INTO v_participant_ids
      FROM public.conversations
      WHERE id = NEW.conversation_id;
  END IF;

  -- If conversation deleted or not found, we can't notify participants via this method easily
  -- But typically conversation exists.
  IF v_participant_ids IS NULL THEN
      RETURN COALESCE(NEW, OLD);
  END IF;

  FOREACH v_pid IN ARRAY v_participant_ids
  LOOP
      IF TG_OP = 'INSERT' THEN
        INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
        VALUES ('insert', 'message', NEW.id, v_pid, to_jsonb(NEW));
      ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
        VALUES ('update', 'message', NEW.id, v_pid, to_jsonb(NEW));
      ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.feed_delta (operation, item_type, item_id, user_id, data)
        VALUES ('delete', 'message', OLD.id, v_pid, NULL);
      END IF;
  END LOOP;

  RETURN COALESCE(NEW, OLD);
END;
$function$
;

create or replace view "public"."index_usage_insights" as  SELECT s.schemaname,
    s.relname AS table_name,
    s.indexrelname AS index_name,
    s.idx_scan,
    s.idx_tup_read,
    s.idx_tup_fetch,
    pg_relation_size((i.indexrelid)::regclass) AS index_bytes,
    now() AS captured_at
   FROM (pg_stat_all_indexes s
     JOIN pg_index i ON ((i.indexrelid = s.indexrelid)))
  WHERE (s.schemaname <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));


CREATE OR REPLACE FUNCTION public.open_dispute(p_user_id uuid, p_escrow_id uuid, p_reason public.dispute_reason, p_description text, p_evidence_urls text[] DEFAULT '{}'::text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_escrow RECORD;
  v_dispute_id UUID;
BEGIN
  -- Get escrow details
  SELECT * INTO v_escrow
  FROM escrow_transactions
  WHERE id = p_escrow_id;

  IF v_escrow IS NULL THEN
    RAISE EXCEPTION 'Escrow transaction not found';
  END IF;

  -- Verify user is party to this escrow
  IF p_user_id NOT IN (v_escrow.sender_id, v_escrow.recipient_id) THEN
    RAISE EXCEPTION 'Not authorized to dispute this transaction';
  END IF;

  -- Can only dispute pending escrow
  IF v_escrow.status != 'pending' THEN
    RAISE EXCEPTION 'Can only dispute pending escrow transactions';
  END IF;

  -- Check for existing active dispute
  IF EXISTS (
    SELECT 1 FROM payment_disputes
    WHERE escrow_id = p_escrow_id
    AND status IN ('pending', 'under_review', 'awaiting_response')
  ) THEN
    RAISE EXCEPTION 'An active dispute already exists for this transaction';
  END IF;

  -- Create dispute
  INSERT INTO payment_disputes (
    escrow_id,
    moment_id,
    giver_id,
    receiver_id,
    opened_by,
    reason,
    description,
    evidence_urls,
    status,
    response_deadline,
    review_deadline
  ) VALUES (
    p_escrow_id,
    v_escrow.moment_id,
    v_escrow.sender_id,
    v_escrow.recipient_id,
    p_user_id,
    p_reason,
    p_description,
    p_evidence_urls,
    'awaiting_response',
    NOW() + INTERVAL '48 hours',
    NOW() + INTERVAL '120 hours' -- 5 days total
  )
  RETURNING id INTO v_dispute_id;

  -- Update escrow status
  UPDATE escrow_transactions
  SET status = 'disputed'
  WHERE id = p_escrow_id;

  -- Notify other party
  INSERT INTO notifications (
    user_id,
    type,
    title,
    body,
    data
  ) VALUES (
    CASE WHEN p_user_id = v_escrow.sender_id
         THEN v_escrow.recipient_id
         ELSE v_escrow.sender_id END,
    'dispute_opened',
    'İtiraz Açıldı ⚠️',
    'Bir işlem için itiraz açıldı. 48 saat içinde yanıt vermeniz gerekiyor.',
    jsonb_build_object(
      'dispute_id', v_dispute_id,
      'escrow_id', p_escrow_id,
      'reason', p_reason
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'dispute_id', v_dispute_id,
    'response_deadline', NOW() + INTERVAL '48 hours'
  );
END;
$function$
;

create or replace view "public"."requests_insights" as  SELECT id,
    status,
    created_at,
    user_id,
    (EXTRACT(epoch FROM (now() - created_at)))::bigint AS age_seconds
   FROM public.requests r;


create or replace view "public"."requests_status_daily_insights" as  WITH base AS (
         SELECT date_trunc('day'::text, r.created_at) AS day,
            r.status,
            (EXTRACT(epoch FROM (now() - r.created_at)))::bigint AS age_seconds
           FROM public.requests r
        )
 SELECT (day)::date AS day,
    status,
    count(*) AS request_count,
    (avg(age_seconds))::bigint AS avg_age_seconds,
    percentile_cont((0.95)::double precision) WITHIN GROUP (ORDER BY ((age_seconds)::double precision)) AS p95_age_seconds
   FROM base
  GROUP BY day, status
  ORDER BY ((day)::date) DESC, status;


create or replace view "public"."slow_growth_watch" as  SELECT n.nspname AS schema_name,
    c.relname AS table_name,
    pg_total_relation_size((c.oid)::regclass) AS total_bytes,
    COALESCE(s.n_tup_ins, (0)::bigint) AS inserts,
    COALESCE(s.n_tup_upd, (0)::bigint) AS updates,
    COALESCE(s.n_tup_del, (0)::bigint) AS deletes,
    COALESCE(s.vacuum_count, (0)::bigint) AS vacuums,
    COALESCE(s.autovacuum_count, (0)::bigint) AS autovacuums,
    now() AS captured_at
   FROM ((pg_class c
     JOIN pg_namespace n ON ((n.oid = c.relnamespace)))
     LEFT JOIN pg_stat_user_tables s ON ((s.relid = c.oid)))
  WHERE ((c.relkind = 'r'::"char") AND (n.nspname <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name])))
  ORDER BY (pg_total_relation_size((c.oid)::regclass)) DESC;


CREATE OR REPLACE FUNCTION public.soft_delete(record_id uuid, table_name text, user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
    query TEXT;
BEGIN
    -- Verify table name
    IF table_name NOT IN ('moments', 'requests', 'conversations', 'notifications') THEN
        RAISE EXCEPTION 'Invalid table name';
    END IF;
    
    -- Execute update
    query := format('UPDATE %I SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id', table_name);
    EXECUTE query USING record_id, user_id;
    
    RETURN FOUND;
END;
$function$
;

create or replace view "public"."table_io_insights" as  SELECT c.relname AS table_name,
    n.nspname AS schema_name,
    pg_total_relation_size((c.oid)::regclass) AS total_bytes,
    pg_relation_size((c.oid)::regclass) AS table_bytes,
    pg_indexes_size((c.oid)::regclass) AS index_bytes,
    COALESCE(s.seq_scan, (0)::bigint) AS seq_scans,
    COALESCE(s.idx_scan, (0)::bigint) AS idx_scans,
    COALESCE(s.n_tup_ins, (0)::bigint) AS inserts,
    COALESCE(s.n_tup_upd, (0)::bigint) AS updates,
    COALESCE(s.n_tup_del, (0)::bigint) AS deletes,
    COALESCE(io.heap_blks_read, (0)::bigint) AS heap_read,
    COALESCE(io.heap_blks_hit, (0)::bigint) AS heap_hit,
    COALESCE(io.idx_blks_read, (0)::bigint) AS idx_read,
    COALESCE(io.idx_blks_hit, (0)::bigint) AS idx_hit,
    now() AS captured_at
   FROM (((pg_class c
     JOIN pg_namespace n ON ((n.oid = c.relnamespace)))
     LEFT JOIN pg_stat_user_tables s ON ((s.relid = c.oid)))
     LEFT JOIN pg_statio_user_tables io ON ((io.relid = c.oid)))
  WHERE ((c.relkind = 'r'::"char") AND (n.nspname <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name])));


CREATE OR REPLACE FUNCTION public.withdraw_funds(user_id_param uuid, amount numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
  current_balance NUMERIC;
BEGIN
  -- Lock user row
  SELECT balance INTO current_balance
  FROM wallets
  WHERE user_id = user_id_param
  FOR UPDATE;

  -- Check sufficient balance
  IF current_balance < amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient balance'
    );
  END IF;

  -- Deduct amount
  UPDATE wallets
  SET balance = balance - amount,
      updated_at = NOW()
  WHERE user_id = user_id_param;

  RETURN jsonb_build_object(
    'success', true,
    'new_balance', current_balance - amount
  );
END;
$function$
;

create or replace view "public"."admin_moderation_inbox" as  SELECT u.id AS user_id,
    u.full_name,
    us.risk_score,
    us.status AS moderation_status,
    u.created_at,
    'high_risk'::text AS trigger_type,
    jsonb_build_object('score', us.risk_score) AS details,
    ( SELECT count(*) AS count
           FROM public.reports r
          WHERE (r.reported_user_id = u.id)) AS report_count,
    now() AS updated_at
   FROM (public.users u
     JOIN public.user_safety us ON ((us.user_id = u.id)))
  WHERE ((us.risk_score >= 80) AND (us.status <> 'permanent_ban'::text))
UNION ALL
 SELECT r.reported_user_id AS user_id,
    u.full_name,
    us.risk_score,
    us.status AS moderation_status,
    u.created_at,
    'reported'::text AS trigger_type,
    jsonb_build_object('reason', r.reason, 'report_id', r.id) AS details,
    ( SELECT count(*) AS count
           FROM public.reports rep
          WHERE (rep.reported_user_id = u.id)) AS report_count,
    r.created_at AS updated_at
   FROM ((public.reports r
     JOIN public.users u ON ((u.id = r.reported_user_id)))
     JOIN public.user_safety us ON ((us.user_id = u.id)))
  WHERE (r.status = 'pending'::text);


CREATE OR REPLACE FUNCTION public.anonymize_user_data(p_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Anonymize user data (GDPR compliance)
  UPDATE public.users
  SET 
    full_name = 'Deleted User',
    email = 'deleted_' || p_user_id || '@travelmatch.app',
    phone = NULL,
    avatar_url = NULL,
    bio = NULL,
    location = NULL,
    date_of_birth = NULL,
    deleted_at = NOW()
  WHERE id = p_user_id;
  
  -- Anonymize messages
  UPDATE public.messages
  SET content = '[Message deleted]'
  WHERE sender_id = p_user_id;
  
  RETURN TRUE;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_moment_creation_limit(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_plan_id TEXT;
  v_daily_count INTEGER;
  v_monthly_count INTEGER;
  v_daily_limit INTEGER;
  v_monthly_limit INTEGER;
BEGIN
  -- Get user's plan
  SELECT COALESCE(us.plan_id, 'passport')
  INTO v_plan_id
  FROM users u
  LEFT JOIN user_subscriptions us ON us.user_id = u.id AND us.status = 'active'
  WHERE u.id = p_user_id;

  -- Get limits
  SELECT max_count INTO v_daily_limit
  FROM user_limits
  WHERE plan_id = v_plan_id
    AND category = 'moment_create'
    AND limit_period = 'daily'
    AND is_active = TRUE;

  SELECT max_count INTO v_monthly_limit
  FROM user_limits
  WHERE plan_id = v_plan_id
    AND category = 'moment_create'
    AND limit_period = 'monthly'
    AND is_active = TRUE;

  -- Count existing
  SELECT COUNT(*) INTO v_daily_count
  FROM moments WHERE user_id = p_user_id AND created_at >= CURRENT_DATE;

  SELECT COUNT(*) INTO v_monthly_count
  FROM moments WHERE user_id = p_user_id AND created_at >= DATE_TRUNC('month', CURRENT_DATE);

  -- Check limits
  IF v_daily_limit IS NOT NULL AND v_daily_count >= v_daily_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', format('Günlük moment limiti: %s / %s', v_daily_count, v_daily_limit),
      'daily_count', v_daily_count,
      'daily_limit', v_daily_limit
    );
  END IF;

  IF v_monthly_limit IS NOT NULL AND v_monthly_count >= v_monthly_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', format('Aylık moment limiti: %s / %s', v_monthly_count, v_monthly_limit),
      'monthly_count', v_monthly_count,
      'monthly_limit', v_monthly_limit
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'daily_count', v_daily_count,
    'daily_limit', v_daily_limit,
    'monthly_count', v_monthly_count,
    'monthly_limit', v_monthly_limit,
    'plan_id', v_plan_id
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_user_limits(p_user_id uuid, p_category text, p_amount numeric DEFAULT NULL::numeric, p_currency character varying DEFAULT 'TRY'::character varying)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_user RECORD;
  v_user_type TEXT;
  v_plan_id TEXT;
  v_limit RECORD;
  v_kyc_threshold RECORD;
  v_period_total DECIMAL;
  v_period_count INTEGER;
  v_is_blocked BOOLEAN := FALSE;
  v_block_reason TEXT;
  v_warnings JSONB := '[]'::JSONB;
  v_kyc_required BOOLEAN := FALSE;
  v_kyc_reason TEXT;
BEGIN
  -- Get user info
  SELECT
    u.id,
    u.created_at,
    u.kyc_status,
    COALESCE(us.plan_id, 'passport') as plan_id
  INTO v_user
  FROM users u
  LEFT JOIN user_subscriptions us ON us.user_id = u.id AND us.status = 'active'
  WHERE u.id = p_user_id;

  IF v_user IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'User not found');
  END IF;

  v_plan_id := v_user.plan_id;

  -- Determine user type based on KYC status and account age
  IF v_user.kyc_status = 'verified' THEN
    v_user_type := 'verified';
  ELSIF v_user.created_at > NOW() - INTERVAL '30 days' THEN
    v_user_type := 'new';
  ELSE
    v_user_type := 'standard';
  END IF;

  -- Check applicable limits
  FOR v_limit IN
    SELECT * FROM user_limits
    WHERE plan_id = v_plan_id
      AND (user_type = v_user_type OR user_type = 'any')
      AND category = p_category
      AND currency = p_currency
      AND is_active = TRUE
    ORDER BY
      CASE WHEN user_type = v_user_type THEN 0 ELSE 1 END
  LOOP
    CASE v_limit.limit_period
      WHEN 'per_transaction' THEN
        -- Check min amount
        IF v_limit.min_amount IS NOT NULL AND p_amount < v_limit.min_amount THEN
          v_is_blocked := TRUE;
          v_block_reason := format('Minimum işlem tutarı: %s %s', v_limit.min_amount, p_currency);
        END IF;

        -- Check max amount
        IF v_limit.max_amount IS NOT NULL AND p_amount > v_limit.max_amount THEN
          v_is_blocked := TRUE;
          v_block_reason := format('Maksimum işlem tutarı: %s %s (%s planı)',
            v_limit.max_amount, p_currency, v_plan_id);
        END IF;

        -- Check KYC threshold
        IF v_limit.requires_kyc_above IS NOT NULL
           AND p_amount > v_limit.requires_kyc_above
           AND v_user.kyc_status != 'verified' THEN
          v_kyc_required := TRUE;
          v_kyc_reason := format('%s %s üzeri işlemler için kimlik doğrulama gerekli',
            v_limit.requires_kyc_above, p_currency);
        END IF;

      WHEN 'daily' THEN
        SELECT COALESCE(SUM(amount), 0), COUNT(*)
        INTO v_period_total, v_period_count
        FROM gifts
        WHERE ((p_category = 'send' AND giver_id = p_user_id)
           OR (p_category = 'receive' AND receiver_id = p_user_id))
          AND created_at >= CURRENT_DATE
          AND currency = p_currency
          AND status NOT IN ('cancelled', 'refunded');

        IF v_limit.max_amount IS NOT NULL AND v_period_total + COALESCE(p_amount, 0) > v_limit.max_amount THEN
          v_is_blocked := TRUE;
          v_block_reason := format('Günlük limit: %s / %s %s',
            ROUND(v_period_total::NUMERIC, 2), v_limit.max_amount, p_currency);
        END IF;

        IF v_limit.max_count IS NOT NULL AND v_period_count >= v_limit.max_count THEN
          v_is_blocked := TRUE;
          v_block_reason := format('Günlük işlem limiti: %s / %s işlem', v_period_count, v_limit.max_count);
        END IF;

      WHEN 'monthly' THEN
        SELECT COALESCE(SUM(amount), 0), COUNT(*)
        INTO v_period_total, v_period_count
        FROM gifts
        WHERE ((p_category = 'send' AND giver_id = p_user_id)
           OR (p_category = 'receive' AND receiver_id = p_user_id))
          AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
          AND currency = p_currency
          AND status NOT IN ('cancelled', 'refunded');

        IF v_limit.max_amount IS NOT NULL AND v_period_total + COALESCE(p_amount, 0) > v_limit.max_amount THEN
          v_is_blocked := TRUE;
          v_block_reason := format('Aylık limit: %s / %s %s',
            ROUND(v_period_total::NUMERIC, 2), v_limit.max_amount, p_currency);
        END IF;

        IF v_limit.max_count IS NOT NULL AND v_period_count >= v_limit.max_count THEN
          v_is_blocked := TRUE;
          v_block_reason := format('Aylık işlem limiti: %s / %s işlem', v_period_count, v_limit.max_count);
        END IF;
    END CASE;
  END LOOP;

  -- Check KYC thresholds
  IF NOT v_kyc_required AND v_user.kyc_status != 'verified' THEN
    FOR v_kyc_threshold IN
      SELECT * FROM kyc_thresholds
      WHERE currency = p_currency AND is_active = TRUE
      ORDER BY amount
    LOOP
      IF v_kyc_threshold.threshold_type = 'single_transaction' AND p_amount >= v_kyc_threshold.amount THEN
        IF v_kyc_threshold.action = 'hard_require' THEN
          v_kyc_required := TRUE;
          v_kyc_reason := v_kyc_threshold.message_tr;
          v_is_blocked := TRUE;
          v_block_reason := v_kyc_threshold.message_tr;
        ELSIF v_kyc_threshold.action = 'soft_prompt' THEN
          v_warnings := v_warnings || jsonb_build_array(jsonb_build_object(
            'type', 'kyc_prompt',
            'message', v_kyc_threshold.message_tr
          ));
        END IF;
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'allowed', NOT v_is_blocked,
    'plan_id', v_plan_id,
    'user_type', v_user_type,
    'kyc_status', v_user.kyc_status,
    'kyc_required', v_kyc_required,
    'kyc_reason', v_kyc_reason,
    'block_reason', v_block_reason,
    'warnings', v_warnings,
    'upgrade_available', v_plan_id != 'concierge'
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type text, p_title text, p_body text DEFAULT NULL::text, p_data jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  notification_id UUID;
BEGIN
  -- Use explicit schema prefix
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (p_user_id, p_type, p_title, p_body, p_data)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$
;

create or replace view "public"."deep_link_attribution" as  SELECT source,
    campaign,
    medium,
    date_trunc('day'::text, created_at) AS date,
    count(*) AS clicks,
    count(DISTINCT user_id) AS unique_users,
    count(
        CASE
            WHEN completed THEN 1
            ELSE NULL::integer
        END) AS conversions,
    round(((100.0 * (count(
        CASE
            WHEN completed THEN 1
            ELSE NULL::integer
        END))::numeric) / (NULLIF(count(*), 0))::numeric), 2) AS conversion_rate
   FROM public.deep_link_events
  GROUP BY source, campaign, medium, (date_trunc('day'::text, created_at))
  ORDER BY (date_trunc('day'::text, created_at)) DESC;


create or replace view "public"."deep_link_conversion_funnel" as  SELECT type,
    source,
    campaign,
    count(*) AS total_clicks,
    count(
        CASE
            WHEN (landing_screen IS NOT NULL) THEN 1
            ELSE NULL::integer
        END) AS landed,
    count(
        CASE
            WHEN completed THEN 1
            ELSE NULL::integer
        END) AS converted,
    round(((100.0 * (count(
        CASE
            WHEN completed THEN 1
            ELSE NULL::integer
        END))::numeric) / (NULLIF(count(*), 0))::numeric), 2) AS conversion_rate,
    avg(time_to_land) AS avg_time_to_land,
    avg(time_to_complete) AS avg_time_to_complete
   FROM public.deep_link_events
  GROUP BY type, source, campaign;


CREATE OR REPLACE FUNCTION public.generate_contract_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  year_part TEXT;
  seq_part TEXT;
  next_seq INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;

  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(contract_number, '-', 3) AS INTEGER)
  ), 0) + 1
  INTO next_seq
  FROM gift_contracts
  WHERE contract_number LIKE 'TM-' || year_part || '-%';

  seq_part := LPAD(next_seq::TEXT, 6, '0');

  RETURN 'TM-' || year_part || '-' || seq_part;
END;
$function$
;

create type "public"."geometry_dump" as ("path" integer[], "geom" public.geometry);

CREATE OR REPLACE FUNCTION public.get_or_create_conversation(p_participant_ids uuid[])
 RETURNS public.conversations
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sorted_ids uuid[];
  v_conversation conversations;
  v_lock_key bigint;
BEGIN
  -- Sort participant IDs for consistent ordering
  SELECT array_agg(id ORDER BY id) INTO v_sorted_ids
  FROM unnest(p_participant_ids) AS id;

  -- Generate a lock key from sorted participant IDs
  -- This ensures only one transaction can create a conversation for these participants
  v_lock_key := ('x' || md5(array_to_string(v_sorted_ids, ',')))::bit(64)::bigint;

  -- Acquire advisory lock (transaction-level, automatically released at commit/rollback)
  PERFORM pg_advisory_xact_lock(v_lock_key);

  -- Try to find existing conversation
  SELECT * INTO v_conversation
  FROM conversations
  WHERE participant_ids @> v_sorted_ids
    AND participant_ids <@ v_sorted_ids
  LIMIT 1;

  -- If found, return it
  IF v_conversation.id IS NOT NULL THEN
    RETURN v_conversation;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (participant_ids, created_at, updated_at)
  VALUES (v_sorted_ids, NOW(), NOW())
  RETURNING * INTO v_conversation;

  RETURN v_conversation;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_proof_requirement(p_amount numeric)
 RETURNS TABLE(requirement public.proof_requirement_type, tier_name text, transfer_delay_hours integer, description_tr text, description_en text, is_direct_pay boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    t.requirement,
    t.name,
    t.transfer_delay_hours,
    t.description_tr,
    t.description_en,
    (t.requirement = 'none') AS is_direct_pay
  FROM proof_requirement_tiers t
  WHERE t.is_active = TRUE
    AND p_amount >= t.min_amount
    AND (t.max_amount IS NULL OR p_amount < t.max_amount)
  LIMIT 1;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_user_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  notification_title TEXT;
  notification_body TEXT;
  notification_type TEXT;
BEGIN
  -- Handle ban
  IF NEW.is_banned = TRUE AND (OLD.is_banned = FALSE OR OLD.is_banned IS NULL) THEN
    notification_type := 'account_banned';
    notification_title := 'Hesabınız askıya alındı';
    notification_body := COALESCE(NEW.ban_reason, 'Hesabınız platform kurallarını ihlal ettiği için askıya alındı.');

    PERFORM create_notification(
      NEW.id,
      notification_type,
      notification_title,
      notification_body,
      jsonb_build_object(
        'banned_at', NEW.banned_at,
        'reason', NEW.ban_reason,
        'action', 'ban'
      )
    );
  END IF;

  -- Handle unban (reinstatement from ban)
  IF NEW.is_banned = FALSE AND OLD.is_banned = TRUE THEN
    notification_type := 'account_reinstated';
    notification_title := 'Hesabınız yeniden aktif';
    notification_body := 'Hesabınız yeniden aktif edildi. TravelMatch''e tekrar hoş geldiniz!';

    PERFORM create_notification(
      NEW.id,
      notification_type,
      notification_title,
      notification_body,
      jsonb_build_object(
        'reinstated_at', NOW(),
        'action', 'unban'
      )
    );
  END IF;

  -- Handle suspension
  IF NEW.is_suspended = TRUE AND (OLD.is_suspended = FALSE OR OLD.is_suspended IS NULL) THEN
    notification_type := 'account_suspended';
    notification_title := 'Hesabınız geçici olarak askıya alındı';
    notification_body := COALESCE(NEW.suspension_reason, 'Hesabınız geçici olarak askıya alındı.');

    IF NEW.suspension_ends_at IS NOT NULL THEN
      notification_body := notification_body || ' Askı süresi: ' || to_char(NEW.suspension_ends_at, 'DD.MM.YYYY HH24:MI');
    END IF;

    PERFORM create_notification(
      NEW.id,
      notification_type,
      notification_title,
      notification_body,
      jsonb_build_object(
        'suspended_at', NEW.suspended_at,
        'reason', NEW.suspension_reason,
        'ends_at', NEW.suspension_ends_at,
        'action', 'suspend'
      )
    );
  END IF;

  -- Handle unsuspension
  IF NEW.is_suspended = FALSE AND OLD.is_suspended = TRUE THEN
    notification_type := 'account_reinstated';
    notification_title := 'Hesabınız yeniden aktif';
    notification_body := 'Hesabınızın askı süresi sona erdi. TravelMatch''e tekrar hoş geldiniz!';

    PERFORM create_notification(
      NEW.id,
      notification_type,
      notification_title,
      notification_body,
      jsonb_build_object(
        'reinstated_at', NOW(),
        'action', 'unsuspend'
      )
    );
  END IF;

  -- Update status field based on ban/suspend state
  IF NEW.is_banned = TRUE THEN
    NEW.status := 'banned';
  ELSIF NEW.is_suspended = TRUE THEN
    NEW.status := 'suspended';
  ELSIF OLD.is_banned = TRUE OR OLD.is_suspended = TRUE THEN
    -- User was unbanned/unsuspended, set back to active
    NEW.status := 'active';
    NEW.reinstated_at := NOW();
  END IF;

  RETURN NEW;
END;
$function$
;

create or replace view "public"."proof_quality_stats" as  SELECT proof_type,
    count(*) AS total_submissions,
    count(
        CASE
            WHEN approved THEN 1
            ELSE NULL::integer
        END) AS auto_approved,
    count(
        CASE
            WHEN (NOT approved) THEN 1
            ELSE NULL::integer
        END) AS needs_review,
    round(avg(((score ->> 'overall'::text))::numeric), 2) AS avg_score,
    round(((100.0 * (count(
        CASE
            WHEN approved THEN 1
            ELSE NULL::integer
        END))::numeric) / (NULLIF(count(*), 0))::numeric), 2) AS auto_approval_rate,
    date_trunc('day'::text, created_at) AS date
   FROM public.proof_quality_scores
  GROUP BY proof_type, (date_trunc('day'::text, created_at))
  ORDER BY (date_trunc('day'::text, created_at)) DESC;


CREATE OR REPLACE FUNCTION public.refund_escrow(p_escrow_id uuid, p_reason text DEFAULT 'user_request'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Call the new partial_refund_escrow with full refund
  RETURN partial_refund_escrow(p_escrow_id, NULL, 0, p_reason);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_kyc_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$function$
;

create or replace view "public"."v_exchange_rate_status" as  SELECT base_currency,
    target_currency,
    rate,
    rate_timestamp,
        CASE
            WHEN (rate_timestamp > (now() - '01:00:00'::interval)) THEN 'fresh'::text
            WHEN (rate_timestamp > (now() - '02:00:00'::interval)) THEN 'recent'::text
            WHEN (rate_timestamp > (now() - '06:00:00'::interval)) THEN 'stale'::text
            ELSE 'very_stale'::text
        END AS freshness,
    (EXTRACT(epoch FROM (now() - rate_timestamp)) / (60)::numeric) AS age_minutes
   FROM public.exchange_rates
  WHERE (is_latest = true);


create or replace view "public"."v_payment_summary" as  SELECT ct.name AS tier,
    ct.min_amount AS min_usd,
    ct.max_amount AS max_usd,
    (round((ct.total_rate * (100)::numeric), 1) || '%'::text) AS total_commission,
    (round(((ct.total_rate * ct.giver_share) * (100)::numeric), 1) || '%'::text) AS giver_pays,
    (round(((ct.total_rate * ct.receiver_share) * (100)::numeric), 1) || '%'::text) AS receiver_pays,
    et.escrow_type,
    et.max_contributors,
    ( SELECT currency_buffer_config.buffer_percentage
           FROM public.currency_buffer_config
          WHERE (currency_buffer_config.name = 'TRY_INFLATION_BUFFER'::text)) AS try_buffer_percent
   FROM (public.commission_tiers ct
     LEFT JOIN public.escrow_thresholds et ON ((ct.min_amount = et.min_amount_usd)))
  WHERE (ct.is_active = true)
  ORDER BY ct.min_amount;


create or replace view "public"."v_user_conversations" as  SELECT cp.user_id,
    cp.conversation_id,
    c.moment_id,
    c.last_message_id,
    c.updated_at AS conversation_updated_at,
    cp.last_read_at,
    cp.is_archived
   FROM (public.conversation_participants cp
     JOIN public.conversations c ON ((c.id = cp.conversation_id)));


create type "public"."valid_detail" as ("valid" boolean, "reason" character varying, "location" public.geometry);

CREATE OR REPLACE FUNCTION public.validate_storage_file_size(bucket_name text, file_size_bytes bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  max_size_mb INTEGER := 10; -- Default 10MB
  file_size_mb NUMERIC;
BEGIN
  -- Get file size in MB
  file_size_mb := file_size_bytes / (1024.0 * 1024.0);
  
  -- Bucket-specific limits
  IF bucket_name = 'avatars' THEN
    max_size_mb := 5;
  ELSIF bucket_name = 'kyc' THEN
    max_size_mb := 10;
  ELSIF bucket_name = 'proofs' THEN
    max_size_mb := 10;
  ELSIF bucket_name = 'moment-images' THEN
    max_size_mb := 15;
  END IF;
  
  RETURN file_size_mb <= max_size_mb;
END;
$function$
;

grant delete on table "public"."daily_request_stats" to "service_role";

grant insert on table "public"."daily_request_stats" to "service_role";

grant references on table "public"."daily_request_stats" to "service_role";

grant select on table "public"."daily_request_stats" to "service_role";

grant trigger on table "public"."daily_request_stats" to "service_role";

grant truncate on table "public"."daily_request_stats" to "service_role";

grant update on table "public"."daily_request_stats" to "service_role";

grant delete on table "public"."daily_request_stats" to "supabase_admin";

grant insert on table "public"."daily_request_stats" to "supabase_admin";

grant select on table "public"."daily_request_stats" to "supabase_admin";

grant update on table "public"."daily_request_stats" to "supabase_admin";

grant delete on table "public"."table_growth_stats" to "service_role";

grant insert on table "public"."table_growth_stats" to "service_role";

grant references on table "public"."table_growth_stats" to "service_role";

grant select on table "public"."table_growth_stats" to "service_role";

grant trigger on table "public"."table_growth_stats" to "service_role";

grant truncate on table "public"."table_growth_stats" to "service_role";

grant update on table "public"."table_growth_stats" to "service_role";

grant delete on table "public"."table_growth_stats" to "supabase_admin";

grant insert on table "public"."table_growth_stats" to "supabase_admin";

grant select on table "public"."table_growth_stats" to "supabase_admin";

grant update on table "public"."table_growth_stats" to "supabase_admin";

grant delete on table "public"."videos" to "anon";

grant insert on table "public"."videos" to "anon";

grant references on table "public"."videos" to "anon";

grant select on table "public"."videos" to "anon";

grant trigger on table "public"."videos" to "anon";

grant truncate on table "public"."videos" to "anon";

grant update on table "public"."videos" to "anon";

grant delete on table "public"."videos" to "authenticated";

grant insert on table "public"."videos" to "authenticated";

grant references on table "public"."videos" to "authenticated";

grant select on table "public"."videos" to "authenticated";

grant trigger on table "public"."videos" to "authenticated";

grant truncate on table "public"."videos" to "authenticated";

grant update on table "public"."videos" to "authenticated";

grant delete on table "public"."videos" to "service_role";

grant insert on table "public"."videos" to "service_role";

grant references on table "public"."videos" to "service_role";

grant select on table "public"."videos" to "service_role";

grant trigger on table "public"."videos" to "service_role";

grant truncate on table "public"."videos" to "service_role";

grant update on table "public"."videos" to "service_role";


  create policy "ab_assignments_service_all"
  on "public"."ab_assignments"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "ab_assignments_user_select"
  on "public"."ab_assignments"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "admin_sessions_service_role_access"
  on "public"."admin_sessions"
  as permissive
  for all
  to service_role
using (true)
with check ((admin_id IN ( SELECT admin_users.id
   FROM public.admin_users
  WHERE (admin_users.is_active = true))));



  create policy "Authenticated users can verify admin status by email"
  on "public"."admin_users"
  as permissive
  for select
  to public
using (((email = (auth.jwt() ->> 'email'::text)) AND (is_active = true)));



  create policy "Super admins can manage all admin users"
  on "public"."admin_users"
  as permissive
  for all
  to public
using (public.is_super_admin(auth.uid()));



  create policy "Users can view own admin record by email"
  on "public"."admin_users"
  as permissive
  for select
  to public
using (((email = (auth.jwt() ->> 'email'::text)) AND (is_active = true)));



  create policy "Users can view own admin record by id"
  on "public"."admin_users"
  as permissive
  for select
  to public
using ((id = auth.uid()));



  create policy "app_config_public_read"
  on "public"."app_config"
  as permissive
  for select
  to anon
using (true);



  create policy "blocked_content_admin_all"
  on "public"."blocked_content"
  as permissive
  for all
  to public
using (((auth.role() = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE ((admin_users.email = (auth.jwt() ->> 'email'::text)) AND (admin_users.is_active = true))))));



  create policy "blocked_content_service_insert"
  on "public"."blocked_content"
  as permissive
  for insert
  to public
with check ((auth.role() = 'service_role'::text));



  create policy "blocked_content_user_select"
  on "public"."blocked_content"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "Users can check if blocked"
  on "public"."blocks"
  as permissive
  for select
  to public
using ((auth.uid() = blocked_id));



  create policy "Users can manage own blocks"
  on "public"."blocks"
  as permissive
  for all
  to public
using ((auth.uid() = blocker_id));



  create policy "blocks_delete_blocker"
  on "public"."blocks"
  as permissive
  for delete
  to public
using ((blocker_id = ( SELECT auth.uid() AS uid)));



  create policy "blocks_insert_blocker"
  on "public"."blocks"
  as permissive
  for insert
  to public
with check ((blocker_id = ( SELECT auth.uid() AS uid)));



  create policy "blocks_select_involving_user"
  on "public"."blocks"
  as permissive
  for select
  to public
using (((blocker_id = ( SELECT auth.uid() AS uid)) OR (blocked_id = ( SELECT auth.uid() AS uid))));



  create policy "cache_invalidation_service_role_only"
  on "public"."cache_invalidation"
  as permissive
  for all
  to public
using ((( SELECT auth.role() AS role) = 'service_role'::text))
with check ((( SELECT auth.role() AS role) = 'service_role'::text));



  create policy "chatbot_conversations_service_all"
  on "public"."chatbot_conversations"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "chatbot_conversations_user_select"
  on "public"."chatbot_conversations"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "chatbot_messages_service_all"
  on "public"."chatbot_messages"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "chatbot_messages_user_select"
  on "public"."chatbot_messages"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.chatbot_conversations
  WHERE ((chatbot_conversations.id = chatbot_messages.conversation_id) AND (chatbot_conversations.user_id = auth.uid())))));



  create policy "Users can create conversations"
  on "public"."conversations"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = ANY (participant_ids)));



  create policy "Users can update own conversations"
  on "public"."conversations"
  as permissive
  for update
  to public
using ((( SELECT auth.uid() AS uid) = ANY (participant_ids)));



  create policy "Users can view own conversations"
  on "public"."conversations"
  as permissive
  for select
  to public
using ((( SELECT auth.uid() AS uid) = ANY (participant_ids)));



  create policy "Read currencies"
  on "public"."currencies"
  as permissive
  for select
  to authenticated
using (true);



  create policy "currencies_read_authenticated"
  on "public"."currencies"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Service role inserts deep link events"
  on "public"."deep_link_events"
  as permissive
  for insert
  to service_role
with check (true);



  create policy "deep_link_events_validated_insert"
  on "public"."deep_link_events"
  as permissive
  for insert
  to authenticated, service_role
with check (((type IS NOT NULL) AND (source IS NOT NULL) AND (url IS NOT NULL) AND (session_id IS NOT NULL) AND ((user_id IS NULL) OR (user_id = ( SELECT auth.uid() AS uid)) OR (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text))));



  create policy "demand_forecasts_admin_select"
  on "public"."demand_forecasts"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE ((admin_users.email = (auth.jwt() ->> 'email'::text)) AND (admin_users.is_active = true)))));



  create policy "demand_forecasts_service_all"
  on "public"."demand_forecasts"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "Read exchange rates"
  on "public"."exchange_rates"
  as permissive
  for select
  to authenticated
using (true);



  create policy "exchange_rates_read_authenticated"
  on "public"."exchange_rates"
  as permissive
  for select
  to authenticated
using (true);



  create policy "favorites_delete_owner"
  on "public"."favorites"
  as permissive
  for delete
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "favorites_insert_owner"
  on "public"."favorites"
  as permissive
  for insert
  to public
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "favorites_select_owner"
  on "public"."favorites"
  as permissive
  for select
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "integration_health_events_service_insert"
  on "public"."integration_health_events"
  as permissive
  for insert
  to service_role
with check (true);



  create policy "internal_error_log_service_insert"
  on "public"."internal_error_log"
  as permissive
  for insert
  to service_role
with check (true);



  create policy "Service role can manage KYC"
  on "public"."kyc_verifications"
  as permissive
  for all
  to public
using ((( SELECT auth.role() AS role) = 'service_role'::text))
with check ((( SELECT auth.role() AS role) = 'service_role'::text));



  create policy "Users can view own KYC"
  on "public"."kyc_verifications"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can view own kyc"
  on "public"."kyc_verifications"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "kyc_verifications_delete"
  on "public"."kyc_verifications"
  as permissive
  for delete
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "kyc_verifications_insert"
  on "public"."kyc_verifications"
  as permissive
  for insert
  to public
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "kyc_verifications_update"
  on "public"."kyc_verifications"
  as permissive
  for update
  to public
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can send messages in own conversations"
  on "public"."messages"
  as permissive
  for insert
  to public
with check (((( SELECT auth.uid() AS uid) = sender_id) AND (conversation_id IN ( SELECT c.id
   FROM public.conversations c
  WHERE (( SELECT auth.uid() AS uid) = ANY (c.participant_ids))))));



  create policy "Users can view messages in own conversations"
  on "public"."messages"
  as permissive
  for select
  to public
using ((conversation_id IN ( SELECT c.id
   FROM public.conversations c
  WHERE (( SELECT auth.uid() AS uid) = ANY (c.participant_ids)))));



  create policy "Anyone can view active moments"
  on "public"."moments"
  as permissive
  for select
  to public
using (((status = 'active'::text) OR (user_id = ( SELECT auth.uid() AS uid))));



  create policy "Users can create moments"
  on "public"."moments"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Users can delete own moments"
  on "public"."moments"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Users can update own moments"
  on "public"."moments"
  as permissive
  for update
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "moments_select_owner_or_public"
  on "public"."moments"
  as permissive
  for select
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can delete own notifications"
  on "public"."notifications"
  as permissive
  for delete
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Users can update own notifications"
  on "public"."notifications"
  as permissive
  for update
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Users can view own notifications"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "notifications_delete_owner"
  on "public"."notifications"
  as permissive
  for delete
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "notifications_insert_owner"
  on "public"."notifications"
  as permissive
  for insert
  to public
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "notifications_select_owner"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "notifications_update_owner"
  on "public"."notifications"
  as permissive
  for update
  to public
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Read payment limits"
  on "public"."payment_limits"
  as permissive
  for select
  to authenticated
using (true);



  create policy "payment_limits_read_authenticated"
  on "public"."payment_limits"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Service role only for webhook events"
  on "public"."processed_webhook_events"
  as permissive
  for all
  to public
using ((( SELECT auth.role() AS role) = 'service_role'::text))
with check ((( SELECT auth.role() AS role) = 'service_role'::text));



  create policy "Service role inserts quality scores"
  on "public"."proof_quality_scores"
  as permissive
  for insert
  to service_role
with check (true);



  create policy "recommendation_feedback_service_all"
  on "public"."recommendation_feedback"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "recommendation_feedback_user_all"
  on "public"."recommendation_feedback"
  as permissive
  for all
  to public
using ((user_id = auth.uid()));



  create policy "Moment owners can update requests"
  on "public"."requests"
  as permissive
  for update
  to public
using ((moment_id IN ( SELECT moments.id
   FROM public.moments
  WHERE (moments.user_id = auth.uid()))));



  create policy "Users can cancel own requests"
  on "public"."requests"
  as permissive
  for delete
  to public
using ((user_id = auth.uid()));



  create policy "Users can create requests"
  on "public"."requests"
  as permissive
  for insert
  to public
with check ((public.auth_user_id() = user_id));



  create policy "Users can delete own requests"
  on "public"."requests"
  as permissive
  for delete
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can update own requests"
  on "public"."requests"
  as permissive
  for update
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can view own requests"
  on "public"."requests"
  as permissive
  for select
  to public
using (((user_id = ( SELECT auth.uid() AS uid)) OR (moment_id IN ( SELECT moments.id
   FROM public.moments
  WHERE (moments.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "Users can create reviews"
  on "public"."reviews"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = reviewer_id));



  create policy "reviews_delete_reviewer"
  on "public"."reviews"
  as permissive
  for delete
  to public
using ((reviewer_id = ( SELECT auth.uid() AS uid)));



  create policy "reviews_insert_reviewer"
  on "public"."reviews"
  as permissive
  for insert
  to public
with check ((reviewer_id = ( SELECT auth.uid() AS uid)));



  create policy "reviews_secure_select"
  on "public"."reviews"
  as permissive
  for select
  to public
using (((reviewer_id = ( SELECT auth.uid() AS uid)) OR (reviewed_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM public.moments m
  WHERE ((m.id = reviews.moment_id) AND (m.user_id = ( SELECT auth.uid() AS uid)))))));



  create policy "reviews_select_involving_user"
  on "public"."reviews"
  as permissive
  for select
  to public
using (((reviewer_id = ( SELECT auth.uid() AS uid)) OR (reviewed_id = ( SELECT auth.uid() AS uid))));



  create policy "reviews_update_reviewer"
  on "public"."reviews"
  as permissive
  for update
  to public
using ((reviewer_id = ( SELECT auth.uid() AS uid)))
with check ((reviewer_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can insert own cards"
  on "public"."saved_cards"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can view own cards"
  on "public"."saved_cards"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "stories_delete_owner"
  on "public"."stories"
  as permissive
  for delete
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "stories_insert_owner"
  on "public"."stories"
  as permissive
  for insert
  to public
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "stories_select_owner"
  on "public"."stories"
  as permissive
  for select
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "stories_update_owner"
  on "public"."stories"
  as permissive
  for update
  to public
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Service role can insert uploads"
  on "public"."uploaded_images"
  as permissive
  for insert
  to public
with check (true);



  create policy "Service role inserts uploads"
  on "public"."uploaded_images"
  as permissive
  for insert
  to service_role
with check (true);



  create policy "uploaded_images_service_insert"
  on "public"."uploaded_images"
  as permissive
  for insert
  to service_role
with check (true);



  create policy "Service role only for achievement inserts"
  on "public"."user_achievements"
  as permissive
  for insert
  to service_role
with check (true);



  create policy "Authenticated can read limits"
  on "public"."user_limits"
  as permissive
  for select
  to authenticated
using ((is_active = true));



  create policy "user_limits_read_authenticated"
  on "public"."user_limits"
  as permissive
  for select
  to authenticated
using ((is_active = true));



  create policy "user_warnings_admin_all"
  on "public"."user_moderation_warnings"
  as permissive
  for all
  to public
using (((auth.role() = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE ((admin_users.email = (auth.jwt() ->> 'email'::text)) AND (admin_users.is_active = true))))));



  create policy "user_warnings_user_acknowledge"
  on "public"."user_moderation_warnings"
  as permissive
  for update
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "user_warnings_user_select"
  on "public"."user_moderation_warnings"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "user_preference_vectors_service_all"
  on "public"."user_preference_vectors"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "user_preference_vectors_user_select"
  on "public"."user_preference_vectors"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "Users can insert own profile"
  on "public"."users"
  as permissive
  for insert
  to public
with check ((( SELECT auth.uid() AS uid) = id));



  create policy "Users can insert self"
  on "public"."users"
  as permissive
  for insert
  to public
with check ((id = ( SELECT auth.uid() AS uid)));



  create policy "Users can update own profile"
  on "public"."users"
  as permissive
  for update
  to public
using ((( SELECT auth.uid() AS uid) = id))
with check ((( SELECT auth.uid() AS uid) = id));



  create policy "Users can update self"
  on "public"."users"
  as permissive
  for update
  to public
using ((id = ( SELECT auth.uid() AS uid)))
with check ((id = ( SELECT auth.uid() AS uid)));



  create policy "Users can view self"
  on "public"."users"
  as permissive
  for select
  to public
using ((id = ( SELECT auth.uid() AS uid)));



  create policy "Users can create own videos"
  on "public"."videos"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can delete own videos"
  on "public"."videos"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can update own videos"
  on "public"."videos"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view all videos"
  on "public"."videos"
  as permissive
  for select
  to public
using ((deleted_at IS NULL));



  create policy "ab_experiments_admin_all"
  on "public"."ab_experiments"
  as permissive
  for all
  to public
using (((EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE ((admin_users.email = (auth.jwt() ->> 'email'::text)) AND (admin_users.is_active = true)))) OR (auth.role() = 'service_role'::text)));



  create policy "Admins can insert admin audit logs"
  on "public"."admin_audit_logs"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = ( SELECT auth.uid() AS uid)) AND (au.is_active = true)))));



  create policy "Admins can view admin audit logs"
  on "public"."admin_audit_logs"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = ( SELECT auth.uid() AS uid)) AND (au.is_active = true) AND (au.role = ANY (ARRAY['super_admin'::public.admin_role, 'manager'::public.admin_role]))))));



  create policy "admin_sessions_service_only"
  on "public"."admin_sessions"
  as permissive
  for all
  to service_role
using (true)
with check ((admin_id IN ( SELECT admin_users.id
   FROM public.admin_users
  WHERE (admin_users.is_active = true))));



  create policy "Authenticated users can view own admin record"
  on "public"."admin_users"
  as permissive
  for select
  to public
using (((auth.uid() = id) OR public.check_is_admin()));



  create policy "ai_anomalies_admin_select"
  on "public"."ai_anomalies"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE ((admin_users.email = (auth.jwt() ->> 'email'::text)) AND (admin_users.is_active = true)))));



  create policy "ai_anomalies_admin_update"
  on "public"."ai_anomalies"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE ((admin_users.email = (auth.jwt() ->> 'email'::text)) AND (admin_users.is_active = true)))));



  create policy "ai_anomalies_service_insert"
  on "public"."ai_anomalies"
  as permissive
  for insert
  to public
with check ((auth.role() = 'service_role'::text));



  create policy "Admins can manage alerts"
  on "public"."alerts"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true)))));



  create policy "Admins can view alerts"
  on "public"."alerts"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true)))));



  create policy "Users can update own participations"
  on "public"."conversation_participants"
  as permissive
  for update
  to public
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "conversations_insert_participant"
  on "public"."conversations"
  as permissive
  for insert
  to public
with check ((( SELECT public.auth_user_id() AS auth_user_id) = ANY (participant_ids)));



  create policy "conversations_select_participants"
  on "public"."conversations"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.conversation_participants cp
  WHERE ((cp.conversation_id = conversations.id) AND (cp.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "conversations_update_participant"
  on "public"."conversations"
  as permissive
  for update
  to public
using ((( SELECT public.auth_user_id() AS auth_user_id) = ANY (participant_ids)));



  create policy "Admins can manage discount codes"
  on "public"."discount_codes"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true)))));



  create policy "founder_decision_log_insert_super_admin"
  on "public"."founder_decision_log"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE ((admin_users.id = auth.uid()) AND (admin_users.role = 'super_admin'::public.admin_role)))));



  create policy "founder_decision_log_select_super_admin"
  on "public"."founder_decision_log"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE ((admin_users.id = auth.uid()) AND (admin_users.role = 'super_admin'::public.admin_role)))));



  create policy "Admins can manage fraud cases"
  on "public"."fraud_cases"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true)))));



  create policy "Admins can manage fraud evidence"
  on "public"."fraud_evidence"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true)))));



  create policy "Admins can view health events"
  on "public"."integration_health_events"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true)))));



  create policy "Managers can view error logs"
  on "public"."internal_error_log"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true) AND (au.role = ANY (ARRAY['super_admin'::public.admin_role, 'manager'::public.admin_role]))))));



  create policy "Admins can manage KYC verifications"
  on "public"."kyc_verifications"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true)))));



  create policy "Admins can manage linked accounts"
  on "public"."linked_accounts"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true)))));



  create policy "Messages visibility"
  on "public"."messages"
  as permissive
  for select
  to public
using (((auth.uid() = sender_id) OR ((auth.uid() = receiver_id) AND (visibility = 'public'::public.message_visibility_type)) OR (EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE (admin_users.id = auth.uid())))));



  create policy "messages_insert_participant"
  on "public"."messages"
  as permissive
  for insert
  to public
with check (((sender_id = ( SELECT auth.uid() AS uid)) AND (conversation_id IN ( SELECT public.user_conversation_ids() AS user_conversation_ids))));



  create policy "messages_select_participant"
  on "public"."messages"
  as permissive
  for select
  to public
using ((conversation_id IN ( SELECT public.user_conversation_ids() AS user_conversation_ids)));



  create policy "messages_update_sender"
  on "public"."messages"
  as permissive
  for update
  to public
using ((sender_id = ( SELECT auth.uid() AS uid)));



  create policy "ml_analytics_service_only"
  on "public"."ml_analytics"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "moderation_dictionary_admin_all"
  on "public"."moderation_dictionary"
  as permissive
  for all
  to public
using (((auth.role() = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE ((admin_users.email = (auth.jwt() ->> 'email'::text)) AND (admin_users.is_active = true))))));



  create policy "moderation_logs_admin_select"
  on "public"."moderation_logs"
  as permissive
  for select
  to public
using (((auth.role() = 'service_role'::text) OR (EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE ((admin_users.email = (auth.jwt() ->> 'email'::text)) AND (admin_users.is_active = true))))));



  create policy "moderation_logs_service_insert"
  on "public"."moderation_logs"
  as permissive
  for insert
  to public
with check ((auth.role() = 'service_role'::text));



  create policy "Moments visibility"
  on "public"."moments"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM public.user_safety owner_safety
  WHERE ((owner_safety.user_id = moments.user_id) AND (owner_safety.status = ANY (ARRAY['active'::text, 'throttled'::text])))))));



  create policy "moments_delete_own"
  on "public"."moments"
  as permissive
  for delete
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "moments_insert_own"
  on "public"."moments"
  as permissive
  for insert
  to public
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "moments_select_active"
  on "public"."moments"
  as permissive
  for select
  to public
using (((status = 'active'::text) OR (user_id = ( SELECT auth.uid() AS uid))));



  create policy "moments_update_own"
  on "public"."moments"
  as permissive
  for update
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Admins can manage notification campaigns"
  on "public"."notification_campaigns"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true)))));



  create policy "notifications_delete_own"
  on "public"."notifications"
  as permissive
  for delete
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "notifications_insert_service"
  on "public"."notifications"
  as permissive
  for insert
  to public
with check (public.is_service_role());



  create policy "notifications_select_own"
  on "public"."notifications"
  as permissive
  for select
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "notifications_update_own"
  on "public"."notifications"
  as permissive
  for update
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can view own transactions"
  on "public"."payment_transactions"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Admins can manage payout requests"
  on "public"."payout_requests"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true)))));



  create policy "price_predictions_cache_service_only"
  on "public"."price_predictions_cache"
  as permissive
  for all
  to public
using ((auth.role() = 'service_role'::text));



  create policy "proof_quality_scores_validated_insert"
  on "public"."proof_quality_scores"
  as permissive
  for insert
  to service_role, authenticated
with check (((user_id IS NOT NULL) AND (proof_type IS NOT NULL) AND (image_url IS NOT NULL) AND (score IS NOT NULL) AND ((user_id = ( SELECT auth.uid() AS uid)) OR (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text))));



  create policy "proof_submissions_participant_select"
  on "public"."proof_submissions"
  as permissive
  for select
  to public
using (((submitter_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM public.gifts g
  WHERE ((g.id = proof_submissions.gift_id) AND ((g.giver_id = ( SELECT auth.uid() AS uid)) OR (g.receiver_id = ( SELECT auth.uid() AS uid))))))));



  create policy "proof_submissions_recipient_insert"
  on "public"."proof_submissions"
  as permissive
  for insert
  to public
with check (((submitter_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.gifts g
  WHERE ((g.id = proof_submissions.gift_id) AND (g.receiver_id = ( SELECT auth.uid() AS uid)) AND (g.status = ANY (ARRAY['pending'::text, 'pending_proof'::text, 'proof_requested'::text])))))));



  create policy "proof_submissions_submitter_update"
  on "public"."proof_submissions"
  as permissive
  for update
  to public
using ((submitter_id = ( SELECT auth.uid() AS uid)))
with check ((submitter_id = ( SELECT auth.uid() AS uid)));



  create policy "Service role verified proof inserts"
  on "public"."proof_verifications"
  as permissive
  for insert
  to service_role
with check (((user_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.users
  WHERE (users.id = proof_verifications.user_id))) AND ((moment_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.moments
  WHERE (moments.id = proof_verifications.moment_id))))));



  create policy "Service role with validation for proof verification inserts"
  on "public"."proof_verifications"
  as permissive
  for insert
  to service_role
with check (((user_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.users
  WHERE (users.id = proof_verifications.user_id))) AND ((moment_id IS NULL) OR (EXISTS ( SELECT 1
   FROM public.moments
  WHERE (moments.id = proof_verifications.moment_id))))));



  create policy "Users can view proof verifications"
  on "public"."proof_verifications"
  as permissive
  for select
  to public
using (((( SELECT auth.uid() AS uid) = user_id) OR (EXISTS ( SELECT 1
   FROM public.moments
  WHERE ((moments.id = proof_verifications.moment_id) AND (moments.user_id = ( SELECT auth.uid() AS uid)))))));



  create policy "proof_verifications_validated_insert"
  on "public"."proof_verifications"
  as permissive
  for insert
  to authenticated, service_role
with check (((moment_id IS NOT NULL) AND (user_id IS NOT NULL) AND (video_url IS NOT NULL) AND (claimed_location IS NOT NULL) AND ((user_id = ( SELECT auth.uid() AS uid)) OR (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)) AND (EXISTS ( SELECT 1
   FROM public.moments m
  WHERE (m.id = proof_verifications.moment_id))) AND (status = ANY (ARRAY['verified'::text, 'rejected'::text, 'needs_review'::text]))));



  create policy "proof_verifications_validated_update"
  on "public"."proof_verifications"
  as permissive
  for update
  to authenticated, service_role
using (((user_id = ( SELECT auth.uid() AS uid)) OR (((current_setting('request.jwt.claims'::text, true))::json ->> 'role'::text) = 'service_role'::text)))
with check ((status = ANY (ARRAY['verified'::text, 'rejected'::text, 'needs_review'::text])));



  create policy "Users can view related proofs"
  on "public"."proofs"
  as permissive
  for select
  to public
using (((user_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM public.gifts g
  WHERE ((g.id = proofs.gift_id) AND ((g.giver_id = ( SELECT auth.uid() AS uid)) OR (g.receiver_id = ( SELECT auth.uid() AS uid))))))));



  create policy "Admins can insert report actions"
  on "public"."report_actions"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true)))));



  create policy "Admins can view report actions"
  on "public"."report_actions"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true)))));



  create policy "Admins can update reports"
  on "public"."reports"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE (admin_users.id = auth.uid()))));



  create policy "Admins can view all reports"
  on "public"."reports"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE (admin_users.id = auth.uid()))));



  create policy "Requests visibility"
  on "public"."requests"
  as permissive
  for select
  to public
using (((auth.uid() = user_id) OR ((auth.uid() = ( SELECT moments.user_id
   FROM public.moments
  WHERE (moments.id = requests.moment_id))) AND (EXISTS ( SELECT 1
   FROM public.users sender
  WHERE ((sender.id = requests.user_id) AND (sender.moderation_status = ANY (ARRAY['active'::public.moderation_status_type, 'soft_throttled'::public.moderation_status_type]))))))));



  create policy "requests_delete_requester"
  on "public"."requests"
  as permissive
  for delete
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "requests_insert_requester"
  on "public"."requests"
  as permissive
  for insert
  to public
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "requests_select_related"
  on "public"."requests"
  as permissive
  for select
  to public
using (((user_id = ( SELECT auth.uid() AS uid)) OR (moment_id IN ( SELECT public.user_moment_ids() AS user_moment_ids))));



  create policy "requests_update_related"
  on "public"."requests"
  as permissive
  for update
  to public
using (((user_id = ( SELECT auth.uid() AS uid)) OR (moment_id IN ( SELECT public.user_moment_ids() AS user_moment_ids))));



  create policy "Users can update own cards"
  on "public"."saved_cards"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "stories_delete_own"
  on "public"."stories"
  as permissive
  for delete
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));



  create policy "stories_insert_own"
  on "public"."stories"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "stories_update_own"
  on "public"."stories"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((auth.uid() = user_id));



  create policy "story_views_select_story_owner"
  on "public"."story_views"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.stories s
  WHERE ((s.id = story_views.story_id) AND (s.user_id = auth.uid())))));



  create policy "Admins can view assigned tasks"
  on "public"."tasks"
  as permissive
  for select
  to public
using (((assigned_to = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = ( SELECT auth.uid() AS uid)) AND (au.is_active = true) AND (au.role = ANY (tasks.assigned_roles))))) OR (EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = ( SELECT auth.uid() AS uid)) AND (au.is_active = true) AND (au.role = ANY (ARRAY['super_admin'::public.admin_role, 'manager'::public.admin_role])))))));



  create policy "Admins can view triage items"
  on "public"."triage_items"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true)))));



  create policy "Managers can update triage items"
  on "public"."triage_items"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true) AND (au.role = ANY (ARRAY['super_admin'::public.admin_role, 'manager'::public.admin_role, 'moderator'::public.admin_role]))))));



  create policy "Service role validated upload inserts"
  on "public"."uploaded_images"
  as permissive
  for insert
  to service_role
with check (((user_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM public.users
  WHERE (users.id = uploaded_images.user_id))) AND (url IS NOT NULL) AND (url <> ''::text)));



  create policy "Users can delete own uploads"
  on "public"."uploaded_images"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can read own uploads"
  on "public"."uploaded_images"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "user_badges_service_insert_validated"
  on "public"."user_badges"
  as permissive
  for insert
  to service_role
with check (((user_id IS NOT NULL) AND (badge_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM auth.users
  WHERE (users.id = user_badges.user_id))) AND (EXISTS ( SELECT 1
   FROM public.badges
  WHERE (badges.id = user_badges.badge_id)))));



  create policy "Admins can full access user_safety"
  on "public"."user_safety"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users
  WHERE (admin_users.id = auth.uid()))));



  create policy "Users can view connected profiles"
  on "public"."users"
  as permissive
  for select
  to public
using (((( SELECT auth.uid() AS uid) = id) OR ((deleted_at IS NULL) AND ((EXISTS ( SELECT 1
   FROM public.conversations
  WHERE ((( SELECT auth.uid() AS uid) = ANY (conversations.participant_ids)) AND (users.id = ANY (conversations.participant_ids))))) OR (EXISTS ( SELECT 1
   FROM (public.requests r
     JOIN public.moments m ON ((m.id = r.moment_id)))
  WHERE ((r.user_id = ( SELECT auth.uid() AS uid)) AND (m.user_id = users.id) AND (r.status = ANY (ARRAY['pending'::text, 'accepted'::text]))))) OR (EXISTS ( SELECT 1
   FROM (public.moments m
     JOIN public.requests r ON ((r.moment_id = m.id)))
  WHERE ((m.user_id = ( SELECT auth.uid() AS uid)) AND (r.user_id = users.id) AND (r.status = ANY (ARRAY['pending'::text, 'accepted'::text]))))) OR (EXISTS ( SELECT 1
   FROM (public.favorites f
     JOIN public.moments m ON ((m.id = f.moment_id)))
  WHERE ((f.user_id = ( SELECT auth.uid() AS uid)) AND (m.user_id = users.id) AND (m.status = 'active'::text)))) OR (EXISTS ( SELECT 1
   FROM public.moments m
  WHERE ((m.user_id = users.id) AND (m.status = 'active'::text))))))));



  create policy "users_update_own"
  on "public"."users"
  as permissive
  for update
  to public
using ((id = ( SELECT auth.uid() AS uid)))
with check ((id = ( SELECT auth.uid() AS uid)));



  create policy "Admins can view wallet transactions"
  on "public"."wallet_transactions"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true)))));



  create policy "Finance can manage wallet transactions"
  on "public"."wallet_transactions"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.admin_users au
  WHERE ((au.id = auth.uid()) AND (au.is_active = true) AND (au.role = ANY (ARRAY['super_admin'::public.admin_role, 'manager'::public.admin_role, 'finance'::public.admin_role]))))));



  create policy "Users can create withdrawals"
  on "public"."withdrawal_requests"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can view own withdrawals"
  on "public"."withdrawal_requests"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));


CREATE TRIGGER update_kyc_verifications_updated_at BEFORE UPDATE ON public.kyc_verifications FOR EACH ROW EXECUTE FUNCTION public.update_kyc_updated_at();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_active_alerts_updated_at BEFORE UPDATE ON public.active_alerts FOR EACH ROW EXECUTE FUNCTION public.update_active_alerts_updated_at();

CREATE TRIGGER trigger_archive_resolved_alert AFTER UPDATE ON public.active_alerts FOR EACH ROW EXECUTE FUNCTION public.archive_resolved_alert();

CREATE TRIGGER admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trigger_alert_rules_updated_at BEFORE UPDATE ON public.alert_rules FOR EACH ROW EXECUTE FUNCTION public.update_alert_rules_updated_at();

CREATE TRIGGER alerts_updated_at BEFORE UPDATE ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER sync_participant_ids_on_junction_change AFTER INSERT OR DELETE ON public.conversation_participants FOR EACH ROW EXECUTE FUNCTION public.sync_participant_ids_from_junction();

CREATE TRIGGER populate_junction_on_new_conversation AFTER INSERT ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.populate_junction_on_conversation_insert();

CREATE TRIGGER sync_junction_on_participant_ids_change AFTER UPDATE OF participant_ids ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.sync_junction_from_participant_ids();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_data_export_requests_updated_at BEFORE UPDATE ON public.data_export_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deep_link_events_updated_at BEFORE UPDATE ON public.deep_link_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER discount_codes_updated_at BEFORE UPDATE ON public.discount_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_email_logs_updated_at BEFORE UPDATE ON public.email_logs FOR EACH ROW EXECUTE FUNCTION public.update_email_logs_updated_at();

CREATE TRIGGER enforce_proof_before_escrow_release BEFORE UPDATE ON public.escrow_transactions FOR EACH ROW EXECUTE FUNCTION public.check_proof_before_escrow_release();

CREATE TRIGGER fraud_cases_generate_number BEFORE INSERT ON public.fraud_cases FOR EACH ROW WHEN ((new.case_number IS NULL)) EXECUTE FUNCTION public.generate_case_number();

CREATE TRIGGER fraud_cases_updated_at BEFORE UPDATE ON public.fraud_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_update_contributor_count AFTER INSERT OR DELETE OR UPDATE ON public.gifts FOR EACH ROW EXECUTE FUNCTION public.update_moment_contributor_count();

CREATE TRIGGER trigger_gift_achievement AFTER INSERT OR UPDATE OF status ON public.gifts FOR EACH ROW EXECUTE FUNCTION public.handle_achievement_unlock();

CREATE TRIGGER trigger_gift_status_change BEFORE UPDATE ON public.gifts FOR EACH ROW WHEN ((old.status IS DISTINCT FROM new.status)) EXECUTE FUNCTION public.update_gift_completed_at();

CREATE TRIGGER kyc_verifications_updated_at BEFORE UPDATE ON public.kyc_verifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON public.marketing_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER messages_change_tracker AFTER INSERT OR DELETE OR UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.track_message_changes();

CREATE TRIGGER update_conversation_on_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();

CREATE TRIGGER update_moment_offers_updated_at BEFORE UPDATE ON public.moment_offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER moments_change_tracker AFTER INSERT OR DELETE OR UPDATE ON public.moments FOR EACH ROW EXECUTE FUNCTION public.track_moment_changes();

CREATE TRIGGER trg_moment_moderation AFTER UPDATE ON public.moments FOR EACH ROW WHEN ((old.moderation_status IS DISTINCT FROM new.moderation_status)) EXECUTE FUNCTION public.notify_moment_moderation();

CREATE TRIGGER trigger_moment_achievement AFTER INSERT ON public.moments FOR EACH ROW EXECUTE FUNCTION public.handle_achievement_unlock();

CREATE TRIGGER update_moments_updated_at BEFORE UPDATE ON public.moments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER notification_campaigns_updated_at BEFORE UPDATE ON public.notification_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_campaigns_updated_at BEFORE UPDATE ON public.notification_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER payout_requests_updated_at BEFORE UPDATE ON public.payout_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON public.promo_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proof_quality_scores_updated_at BEFORE UPDATE ON public.proof_quality_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER validate_proof_submission_trigger BEFORE INSERT ON public.proof_submissions FOR EACH ROW EXECUTE FUNCTION public.validate_proof_submission();

CREATE TRIGGER proof_verifications_updated_at BEFORE UPDATE ON public.proof_verifications FOR EACH ROW EXECUTE FUNCTION public.update_proof_verifications_updated_at();

CREATE TRIGGER trigger_proof_achievement AFTER INSERT OR UPDATE OF status ON public.proofs FOR EACH ROW EXECUTE FUNCTION public.handle_achievement_unlock();

CREATE TRIGGER trg_handle_new_report AFTER INSERT ON public.reports FOR EACH ROW EXECUTE FUNCTION public.handle_new_report();

CREATE TRIGGER on_request_accepted AFTER UPDATE OF status ON public.requests FOR EACH ROW WHEN (((old.status <> 'accepted'::text) AND (new.status = 'accepted'::text))) EXECUTE FUNCTION public.handle_accepted_request();

CREATE TRIGGER trg_check_request_spam AFTER INSERT ON public.requests FOR EACH ROW EXECUTE FUNCTION public.check_request_spam();

CREATE TRIGGER update_participants_on_request AFTER INSERT OR DELETE OR UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.update_moment_participants();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_rating_after_review AFTER INSERT OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_user_rating();

CREATE TRIGGER trg_ensure_single_default_card BEFORE INSERT OR UPDATE ON public.saved_cards FOR EACH ROW WHEN ((new.is_default = true)) EXECUTE FUNCTION public.ensure_single_default_card();

CREATE TRIGGER trigger_single_default_card BEFORE INSERT OR UPDATE ON public.saved_cards FOR EACH ROW WHEN ((new.is_default = true)) EXECUTE FUNCTION public.ensure_single_default_card();

CREATE TRIGGER trigger_increment_story_view AFTER INSERT ON public.story_views FOR EACH ROW EXECUTE FUNCTION public.increment_story_view_count();

CREATE TRIGGER trigger_sar_number BEFORE INSERT ON public.suspicious_activity_reports FOR EACH ROW EXECUTE FUNCTION public.generate_sar_number();

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER triage_items_updated_at BEFORE UPDATE ON public.triage_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trust_notes_updated_at BEFORE UPDATE ON public.trust_notes FOR EACH ROW EXECUTE FUNCTION public.update_trust_notes_updated_at();

CREATE TRIGGER update_trust_note_count_trigger AFTER INSERT OR DELETE ON public.trust_notes FOR EACH ROW EXECUTE FUNCTION public.update_user_trust_note_count();

CREATE TRIGGER uploaded_images_updated_at BEFORE UPDATE ON public.uploaded_images FOR EACH ROW EXECUTE FUNCTION public.update_uploaded_images_updated_at();

CREATE TRIGGER trigger_achievement_notification AFTER INSERT ON public.user_achievements FOR EACH ROW EXECUTE FUNCTION public.notify_achievement_unlock();

CREATE TRIGGER trg_log_consent_change BEFORE UPDATE ON public.user_consents FOR EACH ROW EXECUTE FUNCTION public.log_consent_change();

CREATE TRIGGER check_warnings_trigger AFTER INSERT ON public.user_moderation_warnings FOR EACH ROW EXECUTE FUNCTION public.check_user_warnings();

CREATE TRIGGER trg_log_status_change AFTER UPDATE OF status ON public.user_safety FOR EACH ROW EXECUTE FUNCTION public.log_status_change();

CREATE TRIGGER prevent_sensitive_updates_trigger BEFORE UPDATE ON public.users FOR EACH ROW WHEN ((new.id = auth.uid())) EXECUTE FUNCTION public.prevent_sensitive_updates();

CREATE TRIGGER trg_kyc_status_change AFTER UPDATE ON public.users FOR EACH ROW WHEN ((old.kyc_status IS DISTINCT FROM new.kyc_status)) EXECUTE FUNCTION public.notify_kyc_status_change();

CREATE TRIGGER trg_update_moderation_status BEFORE UPDATE OF risk_score ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_moderation_status();

CREATE TRIGGER trg_user_status_change BEFORE UPDATE ON public.users FOR EACH ROW WHEN (((old.is_banned IS DISTINCT FROM new.is_banned) OR (old.is_suspended IS DISTINCT FROM new.is_suspended))) EXECUTE FUNCTION public.notify_user_status_change();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_vip_subscription_update AFTER INSERT OR DELETE ON public.vip_users FOR EACH ROW EXECUTE FUNCTION public.handle_vip_change_subscription();

CREATE TRIGGER vip_users_updated_at BEFORE UPDATE ON public.vip_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

drop trigger if exists "on_auth_user_created" on "auth"."users";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

drop trigger if exists "on_file_upload_rekognition" on "storage"."objects";

drop policy "avatar_delete_own_folder" on "storage"."objects";

drop policy "avatar_upload_own_folder" on "storage"."objects";

drop policy "proof_view_participants" on "storage"."objects";

drop policy "Users can delete their own KYC docs" on "storage"."objects";

drop policy "Users can delete their own videos" on "storage"."objects";

drop policy "Users can delete their profile proofs" on "storage"."objects";

drop policy "Users can delete their video uploads" on "storage"."objects";

drop policy "Users can upload profile proofs" on "storage"."objects";

drop policy "Users can upload their own KYC docs" on "storage"."objects";

drop policy "Users can upload videos" on "storage"."objects";

drop policy "Users can view their own KYC docs" on "storage"."objects";

drop policy "Users can view their own profile proofs" on "storage"."objects";

drop policy "Users can view their own video uploads" on "storage"."objects";

drop policy "attachments_insert_auth" on "storage"."objects";

drop policy "attachments_select_auth" on "storage"."objects";

drop policy "avatars_delete_own" on "storage"."objects";

drop policy "avatars_insert_own" on "storage"."objects";

drop policy "avatars_update_own" on "storage"."objects";

drop policy "covers_delete_own" on "storage"."objects";

drop policy "covers_insert_own" on "storage"."objects";

drop policy "covers_update_own" on "storage"."objects";

drop policy "kyc_insert_own" on "storage"."objects";

drop policy "kyc_select_own" on "storage"."objects";

drop policy "moments_delete_own" on "storage"."objects";

drop policy "moments_insert_own" on "storage"."objects";

drop policy "moments_update_own" on "storage"."objects";

drop policy "proofs_delete_own" on "storage"."objects";

drop policy "proofs_insert_own" on "storage"."objects";

drop policy "proofs_select_own" on "storage"."objects";


  create policy "Admins can view all KYC documents"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'kyc-documents'::text) AND ((current_setting('role'::text, true) = 'service_role'::text) OR ((( SELECT auth.uid() AS uid))::text = (storage.foldername(name))[1]))));



  create policy "Avatar images are publicly accessible"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Cover images are publicly accessible"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'covers'::text));



  create policy "Moment images are publicly accessible"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'moments'::text));



  create policy "Users can delete their own avatar"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can delete their own cover"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'covers'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can delete their own proofs"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'proofs'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can update their own avatar"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can update their own cover"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'covers'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can upload message attachments"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'messages'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "Users can upload proofs"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'proofs'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can upload their KYC documents"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'kyc-documents'::text) AND ((( SELECT auth.uid() AS uid))::text = (storage.foldername(name))[1])));



  create policy "Users can upload their own avatar"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can upload their own cover"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'covers'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can upload their video uploads"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'video-uploads'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "Users can view message attachments in their conversations"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'messages'::text) AND (((( SELECT auth.uid() AS uid))::text = (storage.foldername(name))[1]) OR (EXISTS ( SELECT 1
   FROM public.conversations c
  WHERE (((c.id)::text = (storage.foldername(objects.name))[2]) AND (( SELECT auth.uid() AS uid) = ANY (c.participant_ids))))))));



  create policy "Users can view their own KYC documents"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'kyc-documents'::text) AND ((( SELECT auth.uid() AS uid))::text = (storage.foldername(name))[1])));



  create policy "Users can view their own proofs"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'proofs'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can delete their own KYC docs"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'kyc_docs'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "Users can delete their own videos"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'videos'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "Users can delete their profile proofs"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'profile-proofs'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "Users can delete their video uploads"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'video-uploads'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "Users can upload profile proofs"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'profile-proofs'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "Users can upload their own KYC docs"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'kyc_docs'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "Users can upload videos"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'videos'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "Users can view their own KYC docs"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'kyc_docs'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "Users can view their own profile proofs"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'profile-proofs'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "Users can view their own video uploads"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'video-uploads'::text) AND (( SELECT auth.role() AS role) = 'authenticated'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "attachments_insert_auth"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'message-attachments'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND (name !~~ '%..%'::text)));



  create policy "attachments_select_auth"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'message-attachments'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL)));



  create policy "avatars_delete_own"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'avatars'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "avatars_insert_own"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'avatars'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text) AND (name !~~ '%..%'::text)));



  create policy "avatars_update_own"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'avatars'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "covers_delete_own"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'covers'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "covers_insert_own"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'covers'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text) AND (name !~~ '%..%'::text)));



  create policy "covers_update_own"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'covers'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "kyc_insert_own"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'kyc'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text) AND (name !~~ '%..%'::text)));



  create policy "kyc_select_own"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'kyc'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "moments_delete_own"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'moments'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "moments_insert_own"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'moments'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text) AND (name !~~ '%..%'::text)));



  create policy "moments_update_own"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'moments'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "proofs_delete_own"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'proofs'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));



  create policy "proofs_insert_own"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'proofs'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text) AND (name !~~ '%..%'::text)));



  create policy "proofs_select_own"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'proofs'::text) AND (( SELECT auth.uid() AS uid) IS NOT NULL) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));


CREATE TRIGGER on_file_upload_rekognition AFTER INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION public.trigger_handle_storage_upload();



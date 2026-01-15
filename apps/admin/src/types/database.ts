// This file will be auto-generated from Supabase
// For now, we define the basic structure

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          email: string;
          name: string;
          avatar_url: string | null;
          role:
            | 'super_admin'
            | 'manager'
            | 'moderator'
            | 'finance'
            | 'marketing'
            | 'support'
            | 'viewer';
          is_active: boolean;
          requires_2fa: boolean;
          totp_secret: string | null;
          totp_enabled: boolean;
          last_login_at: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          avatar_url?: string | null;
          role?:
            | 'super_admin'
            | 'manager'
            | 'moderator'
            | 'finance'
            | 'marketing'
            | 'support'
            | 'viewer';
          is_active?: boolean;
          requires_2fa?: boolean;
          totp_secret?: string | null;
          totp_enabled?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          avatar_url?: string | null;
          role?:
            | 'super_admin'
            | 'manager'
            | 'moderator'
            | 'finance'
            | 'marketing'
            | 'support'
            | 'viewer';
          is_active?: boolean;
          requires_2fa?: boolean;
          totp_secret?: string | null;
          totp_enabled?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
      };
      admin_sessions: {
        Row: {
          id: string;
          admin_id: string;
          token_hash: string;
          ip_address: string | null;
          user_agent: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          token_hash: string;
          ip_address?: string | null;
          user_agent?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          token_hash?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          expires_at?: string;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          old_value: Json | null;
          new_value: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          old_value?: Json | null;
          new_value?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action?: string;
          resource_type?: string | null;
          resource_id?: string | null;
          old_value?: Json | null;
          new_value?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      role_permissions: {
        Row: {
          id: string;
          role:
            | 'super_admin'
            | 'manager'
            | 'moderator'
            | 'finance'
            | 'marketing'
            | 'support'
            | 'viewer';
          resource: string;
          action: string;
        };
        Insert: {
          id?: string;
          role:
            | 'super_admin'
            | 'manager'
            | 'moderator'
            | 'finance'
            | 'marketing'
            | 'support'
            | 'viewer';
          resource: string;
          action: string;
        };
        Update: {
          id?: string;
          role?:
            | 'super_admin'
            | 'manager'
            | 'moderator'
            | 'finance'
            | 'marketing'
            | 'support'
            | 'viewer';
          resource?: string;
          action?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          type: string;
          title: string;
          description: string | null;
          priority: 'urgent' | 'high' | 'medium' | 'low';
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          resource_type: string;
          resource_id: string;
          assigned_to: string | null;
          assigned_roles: string[];
          due_date: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          completed_by: string | null;
        };
        Insert: {
          id?: string;
          type: string;
          title: string;
          description?: string | null;
          priority?: 'urgent' | 'high' | 'medium' | 'low';
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          resource_type: string;
          resource_id: string;
          assigned_to?: string | null;
          assigned_roles?: string[];
          due_date?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          completed_by?: string | null;
        };
        Update: {
          id?: string;
          type?: string;
          title?: string;
          description?: string | null;
          priority?: 'urgent' | 'high' | 'medium' | 'low';
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          resource_type?: string;
          resource_id?: string;
          assigned_to?: string | null;
          assigned_roles?: string[];
          due_date?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          completed_by?: string | null;
        };
      };
      // Reference to existing app tables (read-only from admin)
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          display_name: string | null;
          avatar_url: string | null;
          status: string;
          kyc_status: string;
          balance: number;
          created_at: string;
        };
        Insert: never;
        Update: {
          status?: string;
          kyc_status?: string;
        };
      };
      // Campaign tables
      notification_campaigns: {
        Row: {
          id: string;
          title: string;
          message: string;
          type: 'push' | 'email' | 'sms' | 'in_app';
          target_audience: Json;
          status:
            | 'draft'
            | 'scheduled'
            | 'sending'
            | 'sent'
            | 'cancelled'
            | 'failed';
          scheduled_at: string | null;
          sent_at: string | null;
          total_recipients: number;
          delivered_count: number;
          opened_count: number;
          clicked_count: number;
          failed_count: number;
          metadata: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          message: string;
          type: 'push' | 'email' | 'sms' | 'in_app';
          target_audience?: Json;
          status?:
            | 'draft'
            | 'scheduled'
            | 'sending'
            | 'sent'
            | 'cancelled'
            | 'failed';
          scheduled_at?: string | null;
          sent_at?: string | null;
          total_recipients?: number;
          delivered_count?: number;
          opened_count?: number;
          clicked_count?: number;
          failed_count?: number;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          message?: string;
          type?: 'push' | 'email' | 'sms' | 'in_app';
          target_audience?: Json;
          status?:
            | 'draft'
            | 'scheduled'
            | 'sending'
            | 'sent'
            | 'cancelled'
            | 'failed';
          scheduled_at?: string | null;
          sent_at?: string | null;
          total_recipients?: number;
          delivered_count?: number;
          opened_count?: number;
          clicked_count?: number;
          failed_count?: number;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      marketing_campaigns: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type:
            | 'promo'
            | 'referral'
            | 'seasonal'
            | 'partnership'
            | 'retention'
            | 'acquisition';
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
          target_audience: Json;
          budget: number;
          spent: number;
          currency: string;
          start_date: string | null;
          end_date: string | null;
          impressions: number;
          clicks: number;
          conversions: number;
          revenue: number;
          banner_url: string | null;
          landing_url: string | null;
          promo_code: string | null;
          discount_type: 'percentage' | 'fixed' | 'free_shipping' | null;
          discount_value: number | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          metadata: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type:
            | 'promo'
            | 'referral'
            | 'seasonal'
            | 'partnership'
            | 'retention'
            | 'acquisition';
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
          target_audience?: Json;
          budget?: number;
          spent?: number;
          currency?: string;
          start_date?: string | null;
          end_date?: string | null;
          impressions?: number;
          clicks?: number;
          conversions?: number;
          revenue?: number;
          banner_url?: string | null;
          landing_url?: string | null;
          promo_code?: string | null;
          discount_type?: 'percentage' | 'fixed' | 'free_shipping' | null;
          discount_value?: number | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          type?:
            | 'promo'
            | 'referral'
            | 'seasonal'
            | 'partnership'
            | 'retention'
            | 'acquisition';
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
          target_audience?: Json;
          budget?: number;
          spent?: number;
          currency?: string;
          start_date?: string | null;
          end_date?: string | null;
          impressions?: number;
          clicks?: number;
          conversions?: number;
          revenue?: number;
          banner_url?: string | null;
          landing_url?: string | null;
          promo_code?: string | null;
          discount_type?: 'percentage' | 'fixed' | 'free_shipping' | null;
          discount_value?: number | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      promo_codes: {
        Row: {
          id: string;
          code: string;
          campaign_id: string | null;
          description: string | null;
          discount_type: 'percentage' | 'fixed' | 'free_shipping';
          discount_value: number;
          min_order_amount: number;
          max_discount_amount: number | null;
          usage_limit: number | null;
          used_count: number;
          per_user_limit: number;
          valid_from: string;
          valid_until: string | null;
          is_active: boolean;
          applicable_to: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          campaign_id?: string | null;
          description?: string | null;
          discount_type: 'percentage' | 'fixed' | 'free_shipping';
          discount_value: number;
          min_order_amount?: number;
          max_discount_amount?: number | null;
          usage_limit?: number | null;
          used_count?: number;
          per_user_limit?: number;
          valid_from?: string;
          valid_until?: string | null;
          is_active?: boolean;
          applicable_to?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          campaign_id?: string | null;
          description?: string | null;
          discount_type?: 'percentage' | 'fixed' | 'free_shipping';
          discount_value?: number;
          min_order_amount?: number;
          max_discount_amount?: number | null;
          usage_limit?: number | null;
          used_count?: number;
          per_user_limit?: number;
          valid_from?: string;
          valid_until?: string | null;
          is_active?: boolean;
          applicable_to?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Moments table for moderation
      moments: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string | null;
          location: Json | null;
          thumbnail_url: string | null;
          start_date: string | null;
          end_date: string | null;
          view_count: number;
          like_count: number;
          status: string | null;
          moderation_status:
            | 'pending_review'
            | 'approved'
            | 'rejected'
            | 'flagged'
            | null;
          moderation_notes: string | null;
          moderated_by: string | null;
          moderated_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: never; // Admin shouldn't create moments
        Update: {
          status?: string | null;
          moderation_status?:
            | 'pending_review'
            | 'approved'
            | 'rejected'
            | 'flagged'
            | null;
          moderation_notes?: string | null;
          moderated_by?: string | null;
          moderated_at?: string | null;
        };
      };

      wallet_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'credit' | 'debit' | 'adjustment';
          amount: number;
          description: string;
          status:
            | 'pending'
            | 'processing'
            | 'completed'
            | 'failed'
            | 'cancelled';
          processed_by: string | null;
          processed_at: string | null;
          failure_reason: string | null;
          kyc_verified: boolean;
          kyc_verified_at: string | null;
          transaction_id: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          user_id: string;
          type: 'credit' | 'debit' | 'adjustment';
          amount: number;
          description: string;
          status?:
            | 'pending'
            | 'processing'
            | 'completed'
            | 'failed'
            | 'cancelled';
          created_by?: string;
        };
        Update: {
          status?:
            | 'pending'
            | 'processing'
            | 'completed'
            | 'failed'
            | 'cancelled';
          processed_by?: string;
          processed_at?: string | null;
          failure_reason?: string | null;
          kyc_verified?: boolean;
          kyc_verified_at?: string;
          transaction_id?: string;
        };
      };

      fraud_cases: {
        Row: {
          id: string;
          suspect_id: string;
          total_amount_involved: number;
          status: string;
          resolution: string | null;
          resolved_at: string | null;
          banned_reason: string | null;
          assigned_to: string | null;
          created_at: string;
        };
        Insert: {
          suspect_id: string;
          total_amount_involved: number;
        };
        Update: {
          status?: string;
          resolution?: string;
          resolved_at?: string;
          banned_reason?: string;
          assigned_to?: string;
        };
      };

      fraud_evidence: {
        Row: {
          id: string;
          case_id: string;
          title: string;
          description: string;
          type:
            | 'screenshot'
            | 'transaction'
            | 'chat_log'
            | 'document'
            | 'ip_log';
          file_url: string | null;
          metadata: Json;
          uploaded_by: string;
          uploaded_at: string;
        };
        Insert: {
          case_id: string;
          title: string;
          description: string;
          type:
            | 'screenshot'
            | 'transaction'
            | 'chat_log'
            | 'document'
            | 'ip_log';
          file_url?: string | null;
          metadata?: Json;
          uploaded_by: string;
          uploaded_at?: string;
        };
        Update: {
          title?: string;
        };
      };
      // Payments table
      payments: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          currency: string;
          status:
            | 'pending'
            | 'processing'
            | 'completed'
            | 'failed'
            | 'refunded';
          type: string;
          payment_method: string | null;
          transaction_id: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          currency?: string;
          status?:
            | 'pending'
            | 'processing'
            | 'completed'
            | 'failed'
            | 'refunded';
          type: string;
          payment_method?: string | null;
          transaction_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          currency?: string;
          status?:
            | 'pending'
            | 'processing'
            | 'completed'
            | 'failed'
            | 'refunded';
          type?: string;
          payment_method?: string | null;
          transaction_id?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Activity logs table
      activity_logs: {
        Row: {
          id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          user_id: string | null;
          admin_id: string | null;
          metadata: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          user_id?: string | null;
          admin_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          user_id?: string | null;
          admin_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      // Escrow transactions table
      escrow_transactions: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          moment_id: string | null;
          amount: number;
          currency: string;
          status: 'pending' | 'released' | 'refunded' | 'expired' | 'disputed';
          expires_at: string | null;
          released_at: string | null;
          released_by: string | null;
          refunded_at: string | null;
          refunded_by: string | null;
          refund_reason: string | null;
          admin_notes: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          moment_id?: string | null;
          amount: number;
          currency?: string;
          status?: 'pending' | 'released' | 'refunded' | 'expired' | 'disputed';
          expires_at?: string | null;
          released_at?: string | null;
          released_by?: string | null;
          refunded_at?: string | null;
          refunded_by?: string | null;
          refund_reason?: string | null;
          admin_notes?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          recipient_id?: string;
          moment_id?: string | null;
          amount?: number;
          currency?: string;
          status?: 'pending' | 'released' | 'refunded' | 'expired' | 'disputed';
          expires_at?: string | null;
          released_at?: string | null;
          released_by?: string | null;
          refunded_at?: string | null;
          refunded_by?: string | null;
          refund_reason?: string | null;
          admin_notes?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Disputes table
      disputes: {
        Row: {
          id: string;
          requester_id: string;
          responder_id: string;
          request_id: string | null;
          reason: string;
          description: string | null;
          priority: 'low' | 'medium' | 'high' | 'urgent';
          status:
            | 'pending'
            | 'under_review'
            | 'resolved'
            | 'closed'
            | 'escalated';
          assigned_to: string | null;
          resolution: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          responder_id: string;
          request_id?: string | null;
          reason: string;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?:
            | 'pending'
            | 'under_review'
            | 'resolved'
            | 'closed'
            | 'escalated';
          assigned_to?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          responder_id?: string;
          request_id?: string | null;
          reason?: string;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          status?:
            | 'pending'
            | 'under_review'
            | 'resolved'
            | 'closed'
            | 'escalated';
          assigned_to?: string | null;
          resolution?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      // KYC submissions table
      kyc_submissions: {
        Row: {
          id: string;
          user_id: string;
          status: 'pending' | 'approved' | 'rejected' | 'verified';
          document_type: string | null;
          document_url: string | null;
          selfie_url: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          notes: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: 'pending' | 'approved' | 'rejected' | 'verified';
          document_type?: string | null;
          document_url?: string | null;
          selfie_url?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          notes?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'verified';
          document_type?: string | null;
          document_url?: string | null;
          selfie_url?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          notes?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Suspicious activity reports table
      suspicious_activity_reports: {
        Row: {
          id: string;
          user_id: string;
          report_type: string;
          triggered_rules: string[];
          risk_score: number;
          total_amount: number | null;
          currency: string;
          status:
            | 'pending'
            | 'under_review'
            | 'cleared'
            | 'confirmed'
            | 'reported';
          assigned_to: string | null;
          investigation_notes: string | null;
          reported_to: string | null;
          reported_at: string | null;
          resolved_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          report_type?: string;
          triggered_rules?: string[];
          risk_score?: number;
          total_amount?: number | null;
          currency?: string;
          status?:
            | 'pending'
            | 'under_review'
            | 'cleared'
            | 'confirmed'
            | 'reported';
          assigned_to?: string | null;
          investigation_notes?: string | null;
          reported_to?: string | null;
          reported_at?: string | null;
          resolved_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          report_type?: string;
          triggered_rules?: string[];
          risk_score?: number;
          total_amount?: number | null;
          currency?: string;
          status?:
            | 'pending'
            | 'under_review'
            | 'cleared'
            | 'confirmed'
            | 'reported';
          assigned_to?: string | null;
          investigation_notes?: string | null;
          reported_to?: string | null;
          reported_at?: string | null;
          resolved_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      // User risk profiles table
      user_risk_profiles: {
        Row: {
          id: string;
          user_id: string;
          risk_level: 'low' | 'medium' | 'high' | 'critical';
          risk_score: number;
          is_blocked: boolean;
          block_reason: string | null;
          blocked_at: string | null;
          last_reviewed_at: string | null;
          reviewed_by: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          risk_level?: 'low' | 'medium' | 'high' | 'critical';
          risk_score?: number;
          is_blocked?: boolean;
          block_reason?: string | null;
          blocked_at?: string | null;
          last_reviewed_at?: string | null;
          reviewed_by?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          risk_level?: 'low' | 'medium' | 'high' | 'critical';
          risk_score?: number;
          is_blocked?: boolean;
          block_reason?: string | null;
          blocked_at?: string | null;
          last_reviewed_at?: string | null;
          reviewed_by?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      // AML thresholds table
      aml_thresholds: {
        Row: {
          id: string;
          name: string;
          currency: string;
          threshold_amount: number;
          risk_score: number;
          is_active: boolean;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          currency?: string;
          threshold_amount: number;
          risk_score?: number;
          is_active?: boolean;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          currency?: string;
          threshold_amount?: number;
          risk_score?: number;
          is_active?: boolean;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Fraud rules table
      fraud_rules: {
        Row: {
          id: string;
          name: string;
          rule_type: string;
          condition: Json;
          risk_score: number;
          is_active: boolean;
          action: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          rule_type: string;
          condition?: Json;
          risk_score?: number;
          is_active?: boolean;
          action?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          rule_type?: string;
          condition?: Json;
          risk_score?: number;
          is_active?: boolean;
          action?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Support tickets table
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          description: string;
          status: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          category: string;
          assigned_to: string | null;
          resolved_at: string | null;
          resolved_by: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          description: string;
          status?: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          category?: string;
          assigned_to?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          description?: string;
          status?: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          category?: string;
          assigned_to?: string | null;
          resolved_at?: string | null;
          resolved_by?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Canned responses table
      canned_responses: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: string;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category?: string;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category?: string;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Wallets table
      payout_requests: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          currency: string;
          status:
            | 'pending'
            | 'approved'
            | 'rejected'
            | 'processed'
            | 'cancelled';
          bank_account: Json | null;
          processed_by: string | null;
          processed_at: string | null;
          transaction_id: string | null;
          failure_reason: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          amount: number;
          currency?: string;
          status?:
            | 'pending'
            | 'approved'
            | 'rejected'
            | 'processed'
            | 'cancelled';
          bank_account?: Json | null;
        };
        Update: {
          status?:
            | 'pending'
            | 'approved'
            | 'rejected'
            | 'processed'
            | 'cancelled';
          processed_by?: string | null;
          processed_at?: string | null;
          transaction_id?: string | null;
          failure_reason?: string | null;
          rejection_reason?: string | null;
        };
      };
      kyc_verifications: {
        Row: {
          id: string;
          user_id: string;
          status: 'pending' | 'approved' | 'rejected';
          document_type: string | null;
          document_images: string[] | null;
          document_data: Json | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          verification_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          status?: 'pending' | 'approved' | 'rejected';
          document_type?: string | null;
        };
        Update: {
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          verification_notes?: string | null;
        };
      };

      wallets: {
        Row: {
          id: string;
          user_id: string;
          available_balance: number;
          balance: number;
          pending_balance: number;
          total_spent: number;
          total_earned: number;
          currency: string;
          is_frozen: boolean;
          frozen_reason: string | null;
          frozen_at: string | null;
          frozen_by: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          available_balance?: number;
          balance?: number;
          pending_balance?: number;
          total_spent?: number;
          total_earned?: number;
          currency?: string;
          is_frozen?: boolean;
          frozen_reason?: string | null;
          frozen_at?: string | null;
          frozen_by?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          available_balance?: number;
          balance?: number;
          pending_balance?: number;
          total_spent?: number;
          total_earned?: number;
          currency?: string;
          is_frozen?: boolean;
          frozen_reason?: string | null;
          frozen_at?: string | null;
          frozen_by?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Transactions table
      transactions: {
        Row: {
          id: string;
          sender_id: string | null;
          receiver_id: string | null;
          user_id: string | null;
          moment_id: string | null;
          amount: number;
          currency: string;
          type:
            | 'gift'
            | 'withdrawal'
            | 'refund'
            | 'deposit'
            | 'subscription'
            | 'boost'
            | 'transfer';
          status:
            | 'pending'
            | 'processing'
            | 'completed'
            | 'failed'
            | 'cancelled';
          description: string | null;
          reference: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sender_id?: string | null;
          receiver_id?: string | null;
          user_id?: string | null;
          moment_id?: string | null;
          amount: number;
          currency?: string;
          type:
            | 'gift'
            | 'withdrawal'
            | 'refund'
            | 'deposit'
            | 'subscription'
            | 'boost'
            | 'transfer';
          status?:
            | 'pending'
            | 'processing'
            | 'completed'
            | 'failed'
            | 'cancelled';
          description?: string | null;
          reference?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string | null;
          receiver_id?: string | null;
          user_id?: string | null;
          moment_id?: string | null;
          amount?: number;
          currency?: string;
          type?:
            | 'gift'
            | 'withdrawal'
            | 'refund'
            | 'deposit'
            | 'subscription'
            | 'boost'
            | 'transfer';
          status?:
            | 'pending'
            | 'processing'
            | 'completed'
            | 'failed'
            | 'cancelled';
          description?: string | null;
          reference?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Feature flags table
      feature_flags: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          enabled: boolean;
          category: string;
          rollout_percentage: number;
          environments: string[];
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          enabled?: boolean;
          category?: string;
          rollout_percentage?: number;
          environments?: string[];
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          enabled?: boolean;
          category?: string;
          rollout_percentage?: number;
          environments?: string[];
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Subscriptions table
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          amount: number;
          currency: string;
          status: 'active' | 'cancelled' | 'expired' | 'paused';
          started_at: string;
          expires_at: string | null;
          cancelled_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan: string;
          amount: number;
          currency?: string;
          status?: 'active' | 'cancelled' | 'expired' | 'paused';
          started_at?: string;
          expires_at?: string | null;
          cancelled_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: string;
          amount?: number;
          currency?: string;
          status?: 'active' | 'cancelled' | 'expired' | 'paused';
          started_at?: string;
          expires_at?: string | null;
          cancelled_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Matches table
      matches: {
        Row: {
          id: string;
          user1_id: string;
          user2_id: string;
          status: 'pending' | 'matched' | 'rejected' | 'unmatched';
          matched_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user1_id: string;
          user2_id: string;
          status?: 'pending' | 'matched' | 'rejected' | 'unmatched';
          matched_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user1_id?: string;
          user2_id?: string;
          status?: 'pending' | 'matched' | 'rejected' | 'unmatched';
          matched_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Reports table
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string;
          reason: string;
          description: string | null;
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          resolved_by: string | null;
          resolved_at: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_user_id: string;
          reason: string;
          description?: string | null;
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          resolved_by?: string | null;
          resolved_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          reported_user_id?: string;
          reason?: string;
          description?: string | null;
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          resolved_by?: string | null;
          resolved_at?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      // User commission settings table (VIP users)
      user_commission_settings: {
        Row: {
          id: string;
          user_id: string;
          tier: 'vip' | 'influencer' | 'partner';
          commission_override: number;
          giver_pays_commission: boolean;
          valid_until: string | null;
          reason: string | null;
          granted_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier: 'vip' | 'influencer' | 'partner';
          commission_override?: number;
          giver_pays_commission?: boolean;
          valid_until?: string | null;
          reason?: string | null;
          granted_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tier?: 'vip' | 'influencer' | 'partner';
          commission_override?: number;
          giver_pays_commission?: boolean;
          valid_until?: string | null;
          reason?: string | null;
          granted_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Users table for admin operations
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          status:
            | 'active'
            | 'suspended'
            | 'banned'
            | 'pending'
            | 'deleted'
            | null;
          is_banned: boolean | null;
          is_suspended: boolean | null;
          banned_at: string | null;
          suspended_at: string | null;
          ban_reason: string | null;
          suspension_reason: string | null;
          banned_by: string | null;
          suspended_by: string | null;
          suspension_ends_at: string | null;
          reinstated_at: string | null;
          kyc_status: string | null;
          verified: boolean | null;
          rating: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: never; // Admin shouldn't create users
        Update: {
          status?:
            | 'active'
            | 'suspended'
            | 'banned'
            | 'pending'
            | 'deleted'
            | null;
          is_banned?: boolean | null;
          is_suspended?: boolean | null;
          banned_at?: string | null;
          suspended_at?: string | null;
          ban_reason?: string | null;
          suspension_reason?: string | null;
          banned_by?: string | null;
          suspended_by?: string | null;
          suspension_ends_at?: string | null;
          reinstated_at?: string | null;
          kyc_status?: string | null;
          verified?: boolean | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      validate_promo_code: {
        Args: {
          p_code: string;
          p_user_id: string;
          p_order_amount?: number;
        };
        Returns: {
          is_valid: boolean;
          promo_code_id: string | null;
          discount_type: string | null;
          discount_value: number | null;
          final_discount: number | null;
          error_message: string | null;
        }[];
      };
      admin_set_user_vip: {
        Args: {
          p_user_id: string;
          p_tier: string;
          p_commission_override: number;
          p_giver_pays_commission: boolean;
          p_valid_until: string | null;
          p_reason: string;
          p_granted_by: string;
        };
        Returns: void;
      };
      admin_process_wallet_transaction: {
        Args: {
          p_user_id: string;
          p_amount: number;
        };
        Returns: void;
      };
    };
    Enums: {
      admin_role:
        | 'super_admin'
        | 'manager'
        | 'moderator'
        | 'finance'
        | 'marketing'
        | 'support'
        | 'viewer';
      task_priority: 'urgent' | 'high' | 'medium' | 'low';
      task_status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
      notification_campaign_type: 'push' | 'email' | 'sms' | 'in_app';
      notification_campaign_status:
        | 'draft'
        | 'scheduled'
        | 'sending'
        | 'sent'
        | 'cancelled'
        | 'failed';
      marketing_campaign_type:
        | 'promo'
        | 'referral'
        | 'seasonal'
        | 'partnership'
        | 'retention'
        | 'acquisition';
      marketing_campaign_status:
        | 'draft'
        | 'active'
        | 'paused'
        | 'completed'
        | 'cancelled';
      moderation_status: 'pending_review' | 'approved' | 'rejected' | 'flagged';
      user_status: 'active' | 'suspended' | 'banned' | 'pending' | 'deleted';
    };
  };
}

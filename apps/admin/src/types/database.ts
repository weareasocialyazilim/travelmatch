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
          user_id: string;
          title: string;
          description: string | null;
          location: string | null;
          images: string[] | null;
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
      // Payments table
      payments: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          currency: string;
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
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
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
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
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
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

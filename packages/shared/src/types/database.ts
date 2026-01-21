/**
 * Supabase Database Types
 *
 * Auto-generated from Supabase schema
 * DO NOT EDIT MANUALLY - Run `pnpm db:generate-types` to regenerate
 *
 * Generated: $(date)
 * Mode: $MODE
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          created_at: string | null;
          id: string;
          ip_address: string | null;
          metadata: Json | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          id?: string;
          ip_address?: string | null;
          metadata?: Json | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      blocks: {
        Row: {
          blocked_id: string;
          blocker_id: string;
          created_at: string | null;
          id: string;
        };
        Insert: {
          blocked_id: string;
          blocker_id: string;
          created_at?: string | null;
          id?: string;
        };
        Update: {
          blocked_id?: string;
          blocker_id?: string;
          created_at?: string | null;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'blocks_blocked_id_fkey';
            columns: ['blocked_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blocks_blocker_id_fkey';
            columns: ['blocker_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      cache_invalidation: {
        Row: {
          cache_key: string;
          id: string;
          invalidated_at: string | null;
        };
        Insert: {
          cache_key: string;
          id?: string;
          invalidated_at?: string | null;
        };
        Update: {
          cache_key?: string;
          id?: string;
          invalidated_at?: string | null;
        };
        Relationships: [];
      };
      // Promo codes for mobile users
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
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      promo_code_usage: {
        Row: {
          id: string;
          promo_code_id: string;
          user_id: string;
          order_id: string | null;
          discount_amount: number;
          used_at: string;
        };
        Insert: {
          id?: string;
          promo_code_id: string;
          user_id: string;
          order_id?: string | null;
          discount_amount: number;
          used_at?: string;
        };
        Update: {
          id?: string;
          promo_code_id?: string;
          user_id?: string;
          order_id?: string | null;
          discount_amount?: number;
          used_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'promo_code_usage_promo_code_id_fkey';
            columns: ['promo_code_id'];
            isOneToOne: false;
            referencedRelation: 'promo_codes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'promo_code_usage_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      cdn_invalidation_logs: {
        Row: {
          created_at: string;
          error: string | null;
          id: string;
          item_ids: string[];
          latency_ms: number | null;
          success: boolean;
          type: string;
          urls: string[];
        };
        Insert: {
          created_at?: string;
          error?: string | null;
          id?: string;
          item_ids: string[];
          latency_ms?: number | null;
          success?: boolean;
          type: string;
          urls: string[];
        };
        Update: {
          created_at?: string;
          error?: string | null;
          id?: string;
          item_ids?: string[];
          latency_ms?: number | null;
          success?: boolean;
          type?: string;
          urls?: string[];
        };
        Relationships: [];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          id: string;
          is_archived: boolean | null;
          joined_at: string | null;
          last_read_at: string | null;
          user_id: string;
        };
        Insert: {
          conversation_id: string;
          id?: string;
          is_archived?: boolean | null;
          joined_at?: string | null;
          last_read_at?: string | null;
          user_id: string;
        };
        Update: {
          conversation_id?: string;
          id?: string;
          is_archived?: boolean | null;
          joined_at?: string | null;
          last_read_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversation_participants_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversation_participants_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      conversations: {
        Row: {
          created_at: string | null;
          id: string;
          last_message_id: string | null;
          migrated_to_junction: boolean | null;
          moment_id: string | null;
          participant_ids: string[];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          last_message_id?: string | null;
          migrated_to_junction?: boolean | null;
          moment_id?: string | null;
          participant_ids: string[];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          last_message_id?: string | null;
          migrated_to_junction?: boolean | null;
          moment_id?: string | null;
          participant_ids?: string[];
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_moment_id_fkey';
            columns: ['moment_id'];
            isOneToOne: false;
            referencedRelation: 'moments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_last_message';
            columns: ['last_message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
        ];
      };
      deep_link_events: {
        Row: {
          campaign: string | null;
          completed: boolean | null;
          completed_at: string | null;
          content: string | null;
          created_at: string | null;
          drop_off_screen: string | null;
          id: string;
          landing_screen: string | null;
          medium: string | null;
          params: Json | null;
          session_id: string;
          source: string;
          target_screen: string | null;
          term: string | null;
          time_to_complete: number | null;
          time_to_land: number | null;
          type: string;
          updated_at: string | null;
          url: string;
          user_id: string | null;
        };
        Insert: {
          campaign?: string | null;
          completed?: boolean | null;
          completed_at?: string | null;
          content?: string | null;
          created_at?: string | null;
          drop_off_screen?: string | null;
          id: string;
          landing_screen?: string | null;
          medium?: string | null;
          params?: Json | null;
          session_id: string;
          source: string;
          target_screen?: string | null;
          term?: string | null;
          time_to_complete?: number | null;
          time_to_land?: number | null;
          type: string;
          updated_at?: string | null;
          url: string;
          user_id?: string | null;
        };
        Update: {
          campaign?: string | null;
          completed?: boolean | null;
          completed_at?: string | null;
          content?: string | null;
          created_at?: string | null;
          drop_off_screen?: string | null;
          id?: string;
          landing_screen?: string | null;
          medium?: string | null;
          params?: Json | null;
          session_id?: string;
          source?: string;
          target_screen?: string | null;
          term?: string | null;
          time_to_complete?: number | null;
          time_to_land?: number | null;
          type?: string;
          updated_at?: string | null;
          url?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      escrow_transactions: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          expires_at: string;
          id: string;
          metadata: Json | null;
          moment_id: string | null;
          proof_submitted: boolean | null;
          proof_verification_date: string | null;
          proof_verified: boolean | null;
          recipient_id: string;
          release_condition: string;
          released_at: string | null;
          sender_id: string;
          status: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          currency?: string;
          expires_at?: string;
          id?: string;
          metadata?: Json | null;
          moment_id?: string | null;
          proof_submitted?: boolean | null;
          proof_verification_date?: string | null;
          proof_verified?: boolean | null;
          recipient_id: string;
          release_condition?: string;
          released_at?: string | null;
          sender_id: string;
          status?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          expires_at?: string;
          id?: string;
          metadata?: Json | null;
          moment_id?: string | null;
          proof_submitted?: boolean | null;
          proof_verification_date?: string | null;
          proof_verified?: boolean | null;
          recipient_id?: string;
          release_condition?: string;
          released_at?: string | null;
          sender_id?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'escrow_transactions_moment_id_fkey';
            columns: ['moment_id'];
            isOneToOne: false;
            referencedRelation: 'moments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'escrow_transactions_recipient_id_fkey';
            columns: ['recipient_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'escrow_transactions_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      favorites: {
        Row: {
          created_at: string | null;
          id: string;
          moment_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          moment_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          moment_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'favorites_moment_id_fkey';
            columns: ['moment_id'];
            isOneToOne: false;
            referencedRelation: 'moments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favorites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      feed_delta: {
        Row: {
          created_at: string;
          data: Json | null;
          item_id: string;
          item_type: string;
          operation: string;
          user_id: string;
          version: number;
        };
        Insert: {
          created_at?: string;
          data?: Json | null;
          item_id: string;
          item_type: string;
          operation: string;
          user_id: string;
          version?: number;
        };
        Update: {
          created_at?: string;
          data?: Json | null;
          item_id?: string;
          item_type?: string;
          operation?: string;
          user_id?: string;
          version?: number;
        };
        Relationships: [];
      };
      kyc_verifications: {
        Row: {
          confidence: number | null;
          created_at: string;
          id: string;
          metadata: Json | null;
          provider: string;
          provider_id: string | null;
          rejection_reasons: string[] | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          confidence?: number | null;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          provider: string;
          provider_id?: string | null;
          rejection_reasons?: string[] | null;
          status: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          confidence?: number | null;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          provider?: string;
          provider_id?: string | null;
          rejection_reasons?: string[] | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string | null;
          id: string;
          metadata: Json | null;
          nonce: string | null; // E2E Encryption nonce
          read_at: string | null;
          sender_id: string;
          sender_public_key: string | null; // E2E Sender's public key
          type: string | null;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          nonce?: string | null; // E2E Encryption nonce
          read_at?: string | null;
          sender_id: string;
          sender_public_key?: string | null; // E2E Sender's public key
          type?: string | null;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          nonce?: string | null; // E2E Encryption nonce
          read_at?: string | null;
          sender_public_key?: string | null; // E2E Sender's public key
          sender_id?: string;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      moments: {
        Row: {
          category: string;
          coordinates: unknown;
          created_at: string | null;
          currency: string | null;
          current_participants: number | null;
          date: string;
          description: string | null;
          duration_hours: number | null;
          id: string;
          image_blur_hash: string | null;
          image_id: string | null;
          images: string[] | null;
          is_featured: boolean | null;
          location: string;
          max_participants: number | null;
          moderation_status:
            | 'pending_review'
            | 'approved'
            | 'rejected'
            | 'flagged'
            | null;
          moderated_by: string | null;
          moderated_at: string | null;
          moderation_notes: string | null;
          price: number | null;
          requirements: string | null;
          status: string | null;
          tags: string[] | null;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          category: string;
          coordinates?: unknown;
          created_at?: string | null;
          currency?: string | null;
          current_participants?: number | null;
          date: string;
          description?: string | null;
          duration_hours?: number | null;
          id?: string;
          image_blur_hash?: string | null;
          image_id?: string | null;
          images?: string[] | null;
          is_featured?: boolean | null;
          location: string;
          max_participants?: number | null;
          moderation_status?:
            | 'pending_review'
            | 'approved'
            | 'rejected'
            | 'flagged'
            | null;
          moderated_by?: string | null;
          moderated_at?: string | null;
          moderation_notes?: string | null;
          price?: number | null;
          requirements?: string | null;
          status?: string | null;
          tags?: string[] | null;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          category?: string;
          coordinates?: unknown;
          created_at?: string | null;
          currency?: string | null;
          current_participants?: number | null;
          date?: string;
          description?: string | null;
          duration_hours?: number | null;
          id?: string;
          image_blur_hash?: string | null;
          image_id?: string | null;
          images?: string[] | null;
          is_featured?: boolean | null;
          location?: string;
          max_participants?: number | null;
          moderation_status?:
            | 'pending_review'
            | 'approved'
            | 'rejected'
            | 'flagged'
            | null;
          moderated_by?: string | null;
          moderated_at?: string | null;
          moderation_notes?: string | null;
          price?: number | null;
          requirements?: string | null;
          status?: string | null;
          tags?: string[] | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'moments_image_id_fkey';
            columns: ['image_id'];
            isOneToOne: false;
            referencedRelation: 'uploaded_images';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'moments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string | null;
          data: Json | null;
          id: string;
          read: boolean | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string | null;
          data?: Json | null;
          id?: string;
          read?: boolean | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string | null;
          data?: Json | null;
          id?: string;
          read?: boolean | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      processed_webhook_events: {
        Row: {
          event_id: string;
          event_type: string;
          id: string;
          metadata: Json | null;
          processed_at: string | null;
        };
        Insert: {
          event_id: string;
          event_type: string;
          id?: string;
          metadata?: Json | null;
          processed_at?: string | null;
        };
        Update: {
          event_id?: string;
          event_type?: string;
          id?: string;
          metadata?: Json | null;
          processed_at?: string | null;
        };
        Relationships: [];
      };
      proof_quality_scores: {
        Row: {
          approved: boolean | null;
          created_at: string | null;
          id: string;
          image_url: string;
          proof_type: string;
          review_notes: string | null;
          review_status: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          score: Json;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          approved?: boolean | null;
          created_at?: string | null;
          id?: string;
          image_url: string;
          proof_type: string;
          review_notes?: string | null;
          review_status?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          score: Json;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          approved?: boolean | null;
          created_at?: string | null;
          id?: string;
          image_url?: string;
          proof_type?: string;
          review_notes?: string | null;
          review_status?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          score?: Json;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      proof_verifications: {
        Row: {
          ai_model: string;
          ai_reasoning: string | null;
          ai_verified: boolean;
          claimed_date: string | null;
          claimed_location: string;
          confidence_score: number;
          created_at: string;
          detected_location: string | null;
          id: string;
          moment_id: string;
          red_flags: Json | null;
          status: string;
          updated_at: string;
          user_id: string;
          video_url: string;
        };
        Insert: {
          ai_model?: string;
          ai_reasoning?: string | null;
          ai_verified: boolean;
          claimed_date?: string | null;
          claimed_location: string;
          confidence_score: number;
          created_at?: string;
          detected_location?: string | null;
          id?: string;
          moment_id: string;
          red_flags?: Json | null;
          status: string;
          updated_at?: string;
          user_id: string;
          video_url: string;
        };
        Update: {
          ai_model?: string;
          ai_reasoning?: string | null;
          ai_verified?: boolean;
          claimed_date?: string | null;
          claimed_location?: string;
          confidence_score?: number;
          created_at?: string;
          detected_location?: string | null;
          id?: string;
          moment_id?: string;
          red_flags?: Json | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
          video_url?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'proof_verifications_moment_id_fkey';
            columns: ['moment_id'];
            isOneToOne: false;
            referencedRelation: 'moments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'proof_verifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      rate_limit_config: {
        Row: {
          created_at: string | null;
          endpoint: string;
          id: string;
          is_active: boolean | null;
          max_requests: number;
          penalty_seconds: number | null;
          updated_at: string | null;
          window_seconds: number;
        };
        Insert: {
          created_at?: string | null;
          endpoint: string;
          id?: string;
          is_active?: boolean | null;
          max_requests?: number;
          penalty_seconds?: number | null;
          updated_at?: string | null;
          window_seconds?: number;
        };
        Update: {
          created_at?: string | null;
          endpoint?: string;
          id?: string;
          is_active?: boolean | null;
          max_requests?: number;
          penalty_seconds?: number | null;
          updated_at?: string | null;
          window_seconds?: number;
        };
        Relationships: [];
      };
      rate_limits: {
        Row: {
          created_at: string | null;
          endpoint: string;
          id: string;
          identifier: string;
          request_count: number | null;
          updated_at: string | null;
          window_start: string;
        };
        Insert: {
          created_at?: string | null;
          endpoint: string;
          id?: string;
          identifier: string;
          request_count?: number | null;
          updated_at?: string | null;
          window_start?: string;
        };
        Update: {
          created_at?: string | null;
          endpoint?: string;
          id?: string;
          identifier?: string;
          request_count?: number | null;
          updated_at?: string | null;
          window_start?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          reason: string;
          reported_moment_id: string | null;
          reported_user_id: string | null;
          reporter_id: string;
          resolved_at: string | null;
          status: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          reason: string;
          reported_moment_id?: string | null;
          reported_user_id?: string | null;
          reporter_id: string;
          resolved_at?: string | null;
          status?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          reason?: string;
          reported_moment_id?: string | null;
          reported_user_id?: string | null;
          reporter_id?: string;
          resolved_at?: string | null;
          status?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_reported_moment_id_fkey';
            columns: ['reported_moment_id'];
            isOneToOne: false;
            referencedRelation: 'moments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_reported_user_id_fkey';
            columns: ['reported_user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      requests: {
        Row: {
          created_at: string | null;
          id: string;
          message: string | null;
          moment_id: string;
          responded_at: string | null;
          status: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          message?: string | null;
          moment_id: string;
          responded_at?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          message?: string | null;
          moment_id?: string;
          responded_at?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'requests_moment_id_fkey';
            columns: ['moment_id'];
            isOneToOne: false;
            referencedRelation: 'moments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'requests_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string | null;
          id: string;
          moment_id: string;
          rating: number;
          reviewed_id: string;
          reviewer_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          moment_id: string;
          rating: number;
          reviewed_id: string;
          reviewer_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string | null;
          id?: string;
          moment_id?: string;
          rating?: number;
          reviewed_id?: string;
          reviewer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_moment_id_fkey';
            columns: ['moment_id'];
            isOneToOne: false;
            referencedRelation: 'moments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_reviewed_id_fkey';
            columns: ['reviewed_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_reviewer_id_fkey';
            columns: ['reviewer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      spatial_ref_sys: {
        Row: {
          auth_name: string | null;
          auth_srid: number | null;
          proj4text: string | null;
          srid: number;
          srtext: string | null;
        };
        Insert: {
          auth_name?: string | null;
          auth_srid?: number | null;
          proj4text?: string | null;
          srid: number;
          srtext?: string | null;
        };
        Update: {
          auth_name?: string | null;
          auth_srid?: number | null;
          proj4text?: string | null;
          srid?: number;
          srtext?: string | null;
        };
        Relationships: [];
      };
      subscription_plans: {
        Row: {
          color: string | null;
          created_at: string | null;
          features: Json | null;
          icon: string | null;
          id: string;
          interval: string | null;
          is_active: boolean | null;
          is_popular: boolean | null;
          name: string;
          price: number;
          updated_at: string | null;
        };
        Insert: {
          color?: string | null;
          created_at?: string | null;
          features?: Json | null;
          icon?: string | null;
          id: string;
          interval?: string | null;
          is_active?: boolean | null;
          is_popular?: boolean | null;
          name: string;
          price: number;
          updated_at?: string | null;
        };
        Update: {
          color?: string | null;
          created_at?: string | null;
          features?: Json | null;
          icon?: string | null;
          id?: string;
          interval?: string | null;
          is_active?: boolean | null;
          is_popular?: boolean | null;
          name?: string;
          price?: number;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          amount: number;
          created_at: string | null;
          currency: string | null;
          description: string | null;
          id: string;
          metadata: Json | null;
          moment_id: string | null;
          status: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          currency?: string | null;
          description?: string | null;
          id?: string;
          metadata?: Json | null;
          moment_id?: string | null;
          status?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          currency?: string | null;
          description?: string | null;
          id?: string;
          metadata?: Json | null;
          moment_id?: string | null;
          status?: string | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transactions_moment_id_fkey';
            columns: ['moment_id'];
            isOneToOne: false;
            referencedRelation: 'moments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      uploaded_images: {
        Row: {
          blur_hash: string | null;
          created_at: string | null;
          filename: string;
          id: string;
          metadata: Json | null;
          type: string;
          updated_at: string | null;
          uploaded_at: string;
          url: string;
          user_id: string;
          variants: string[];
        };
        Insert: {
          blur_hash?: string | null;
          created_at?: string | null;
          filename: string;
          id: string;
          metadata?: Json | null;
          type?: string;
          updated_at?: string | null;
          uploaded_at: string;
          url: string;
          user_id: string;
          variants: string[];
        };
        Update: {
          blur_hash?: string | null;
          created_at?: string | null;
          filename?: string;
          id?: string;
          metadata?: Json | null;
          type?: string;
          updated_at?: string | null;
          uploaded_at?: string;
          url?: string;
          user_id?: string;
          variants?: string[];
        };
        Relationships: [];
      };
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null;
          created_at: string | null;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          plan_id: string | null;
          provider: string | null;
          provider_subscription_id: string | null;
          status: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          cancel_at_period_end?: boolean | null;
          created_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan_id?: string | null;
          provider?: string | null;
          provider_subscription_id?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          cancel_at_period_end?: boolean | null;
          created_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          plan_id?: string | null;
          provider?: string | null;
          provider_subscription_id?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_subscriptions_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'subscription_plans';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_subscriptions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          balance: number | null;
          ban_reason: string | null;
          banned_at: string | null;
          banned_by: string | null;
          bio: string | null;
          created_at: string | null;
          currency: string | null;
          date_of_birth: string | null;
          deleted_at: string | null;
          email: string;
          full_name: string;
          gender: string | null;
          id: string;
          interests: string[] | null;
          is_banned: boolean | null;
          is_suspended: boolean | null;
          kyc_status: string | null;
          languages: string[] | null;
          last_seen_at: string | null;
          location: string | null;
          notification_preferences: Json | null;
          phone: string | null;
          privacy_settings: Json | null;
          public_key: string | null; // E2E Encryption public key
          push_token: string | null;
          rating: number | null;
          reinstated_at: string | null;
          review_count: number | null;
          status:
            | 'active'
            | 'suspended'
            | 'banned'
            | 'pending'
            | 'deleted'
            | null;
          suspended_at: string | null;
          suspended_by: string | null;
          suspension_ends_at: string | null;
          suspension_reason: string | null;
          updated_at: string | null;
          verified: boolean | null;
        };
        Insert: {
          avatar_url?: string | null;
          balance?: number | null;
          ban_reason?: string | null;
          banned_at?: string | null;
          banned_by?: string | null;
          bio?: string | null;
          created_at?: string | null;
          currency?: string | null;
          date_of_birth?: string | null;
          deleted_at?: string | null;
          email: string;
          full_name: string;
          gender?: string | null;
          id?: string;
          interests?: string[] | null;
          is_banned?: boolean | null;
          is_suspended?: boolean | null;
          kyc_status?: string | null;
          languages?: string[] | null;
          last_seen_at?: string | null;
          location?: string | null;
          notification_preferences?: Json | null;
          phone?: string | null;
          privacy_settings?: Json | null;
          public_key?: string | null; // E2E Encryption public key
          push_token?: string | null;
          rating?: number | null;
          reinstated_at?: string | null;
          review_count?: number | null;
          status?:
            | 'active'
            | 'suspended'
            | 'banned'
            | 'pending'
            | 'deleted'
            | null;
          suspended_at?: string | null;
          suspended_by?: string | null;
          suspension_ends_at?: string | null;
          suspension_reason?: string | null;
          updated_at?: string | null;
          verified?: boolean | null;
        };
        Update: {
          avatar_url?: string | null;
          balance?: number | null;
          ban_reason?: string | null;
          banned_at?: string | null;
          banned_by?: string | null;
          bio?: string | null;
          created_at?: string | null;
          currency?: string | null;
          date_of_birth?: string | null;
          deleted_at?: string | null;
          email?: string;
          full_name?: string;
          gender?: string | null;
          id?: string;
          interests?: string[] | null;
          is_banned?: boolean | null;
          is_suspended?: boolean | null;
          kyc_status?: string | null;
          languages?: string[] | null;
          last_seen_at?: string | null;
          location?: string | null;
          notification_preferences?: Json | null;
          phone?: string | null;
          privacy_settings?: Json | null;
          public_key?: string | null; // E2E Encryption public key
          push_token?: string | null;
          rating?: number | null;
          reinstated_at?: string | null;
          review_count?: number | null;
          status?:
            | 'active'
            | 'suspended'
            | 'banned'
            | 'pending'
            | 'deleted'
            | null;
          suspended_at?: string | null;
          suspended_by?: string | null;
          suspension_ends_at?: string | null;
          suspension_reason?: string | null;
          updated_at?: string | null;
          verified?: boolean | null;
        };
        Relationships: [];
      };
    } & {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: unknown;
      };
    };
    Views: {
      deep_link_attribution: {
        Row: {
          campaign: string | null;
          clicks: number | null;
          conversion_rate: number | null;
          conversions: number | null;
          date: string | null;
          medium: string | null;
          source: string | null;
          unique_users: number | null;
        };
        Relationships: [];
      };
      deep_link_conversion_funnel: {
        Row: {
          avg_time_to_complete: number | null;
          avg_time_to_land: number | null;
          campaign: string | null;
          conversion_rate: number | null;
          converted: number | null;
          landed: number | null;
          source: string | null;
          total_clicks: number | null;
          type: string | null;
        };
        Relationships: [];
      };
      geography_columns: {
        Row: {
          coord_dimension: number | null;
          f_geography_column: unknown;
          f_table_catalog: unknown;
          f_table_name: unknown;
          f_table_schema: unknown;
          srid: number | null;
          type: string | null;
        };
        Relationships: [];
      };
      geometry_columns: {
        Row: {
          coord_dimension: number | null;
          f_geometry_column: unknown;
          f_table_catalog: string | null;
          f_table_name: unknown;
          f_table_schema: unknown;
          srid: number | null;
          type: string | null;
        };
        Insert: {
          coord_dimension?: number | null;
          f_geometry_column?: unknown;
          f_table_catalog?: string | null;
          f_table_name?: unknown;
          f_table_schema?: unknown;
          srid?: number | null;
          type?: string | null;
        };
        Update: {
          coord_dimension?: number | null;
          f_geometry_column?: unknown;
          f_table_catalog?: string | null;
          f_table_name?: unknown;
          f_table_schema?: unknown;
          srid?: number | null;
          type?: string | null;
        };
        Relationships: [];
      };
      proof_quality_stats: {
        Row: {
          auto_approval_rate: number | null;
          auto_approved: number | null;
          avg_score: number | null;
          date: string | null;
          needs_review: number | null;
          proof_type: string | null;
          total_submissions: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string };
        Returns: undefined;
      };
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown };
        Returns: unknown;
      };
      _postgis_pgsql_version: { Args: never; Returns: string };
      _postgis_scripts_pgsql_version: { Args: never; Returns: string };
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown };
        Returns: number;
      };
      _postgis_stats: {
        Args: { ''?: string; att_name: string; tbl: unknown };
        Returns: string;
      };
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_dwithin: {
        Args: {
          geog1: unknown;
          geog2: unknown;
          tolerance: number;
          use_spheroid?: boolean;
        };
        Returns: boolean;
      };
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown };
        Returns: number;
      };
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_sortablehash: { Args: { geom: unknown }; Returns: number };
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_voronoi: {
        Args: {
          clip?: unknown;
          g1: unknown;
          return_polygons?: boolean;
          tolerance?: number;
        };
        Returns: unknown;
      };
      _st_within: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      addauth: { Args: { '': string }; Returns: boolean };
      addgeometrycolumn:
        | {
            Args: {
              column_name: string;
              new_dim: number;
              new_srid: number;
              new_type: string;
              schema_name: string;
              table_name: string;
              use_typmod?: boolean;
            };
            Returns: string;
          }
        | {
            Args: {
              column_name: string;
              new_dim: number;
              new_srid: number;
              new_type: string;
              table_name: string;
              use_typmod?: boolean;
            };
            Returns: string;
          }
        | {
            Args: {
              catalog_name: string;
              column_name: string;
              new_dim: number;
              new_srid_in: number;
              new_type: string;
              schema_name: string;
              table_name: string;
              use_typmod?: boolean;
            };
            Returns: string;
          };
      auth_user_id: { Args: never; Returns: string };
      auth_user_role: { Args: never; Returns: string };
      can_view_profile: {
        Args: { p_profile_id: string; p_viewer_id: string };
        Returns: boolean;
      };
      check_rate_limit: {
        Args: { p_endpoint?: string; p_identifier: string };
        Returns: {
          allowed: boolean;
          remaining: number;
          reset_at: string;
          retry_after: number;
        }[];
      };
      cleanup_old_feed_delta: { Args: never; Returns: undefined };
      cleanup_old_payment_records: { Args: never; Returns: undefined };
      cleanup_rate_limits: { Args: never; Returns: number };
      create_escrow_transaction: {
        Args: {
          p_amount: number;
          p_moment_id: string;
          p_recipient_id: string;
          p_release_condition?: string;
          p_sender_id: string;
        };
        Returns: Json;
      };
      create_notification: {
        Args: {
          p_body?: string;
          p_data?: Json;
          p_title: string;
          p_type: string;
          p_user_id: string;
        };
        Returns: string;
      };
      decrement_user_balance: {
        Args: { amount: number; user_id: string };
        Returns: undefined;
      };
      disablelongtransactions: { Args: never; Returns: string };
      dropgeometrycolumn:
        | {
            Args: {
              column_name: string;
              schema_name: string;
              table_name: string;
            };
            Returns: string;
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string;
              column_name: string;
              schema_name: string;
              table_name: string;
            };
            Returns: string;
          };
      dropgeometrytable:
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string;
              schema_name: string;
              table_name: string;
            };
            Returns: string;
          };
      enablelongtransactions: { Args: never; Returns: string };
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      geometry: { Args: { '': string }; Returns: unknown };
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geomfromewkt: { Args: { '': string }; Returns: unknown };
      get_conversation_participants: {
        Args: { conv_id: string };
        Returns: {
          avatar_url: string;
          full_name: string;
          last_read_at: string;
          user_id: string;
        }[];
      };
      get_user_conversations: {
        Args: { usr_id: string };
        Returns: {
          conversation_id: string;
          last_message: string;
          last_message_at: string;
          other_participants: Json;
          unread_count: number;
        }[];
      };
      gettransactionid: { Args: never; Returns: unknown };
      increment_user_balance: {
        Args: { amount: number; user_id: string };
        Returns: undefined;
      };
      invalidate_cdn_manually: {
        Args: { p_ids: string[]; p_type: string };
        Returns: undefined;
      };
      is_admin: { Args: never; Returns: boolean };
      is_conversation_participant: {
        Args: { conv_id: string; usr_id: string };
        Returns: boolean;
      };
      is_service_role: { Args: never; Returns: boolean };
      longtransactionsenabled: { Args: never; Returns: boolean };
      mark_notifications_read: {
        Args: { p_notification_ids?: string[]; p_user_id: string };
        Returns: number;
      };
      populate_geometry_columns:
        | { Args: { use_typmod?: boolean }; Returns: string }
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number };
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string };
        Returns: number;
      };
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string };
        Returns: number;
      };
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string };
        Returns: string;
      };
      postgis_extensions_upgrade: { Args: never; Returns: string };
      postgis_full_version: { Args: never; Returns: string };
      postgis_geos_version: { Args: never; Returns: string };
      postgis_lib_build_date: { Args: never; Returns: string };
      postgis_lib_revision: { Args: never; Returns: string };
      postgis_lib_version: { Args: never; Returns: string };
      postgis_libjson_version: { Args: never; Returns: string };
      postgis_liblwgeom_version: { Args: never; Returns: string };
      postgis_libprotobuf_version: { Args: never; Returns: string };
      postgis_libxml_version: { Args: never; Returns: string };
      postgis_proj_version: { Args: never; Returns: string };
      postgis_scripts_build_date: { Args: never; Returns: string };
      postgis_scripts_installed: { Args: never; Returns: string };
      postgis_scripts_released: { Args: never; Returns: string };
      postgis_svn_version: { Args: never; Returns: string };
      postgis_type_name: {
        Args: {
          coord_dimension: number;
          geomname: string;
          use_new_name?: boolean;
        };
        Returns: string;
      };
      postgis_version: { Args: never; Returns: string };
      postgis_wagyu_version: { Args: never; Returns: string };
      record_rate_limit_violation: {
        Args: {
          p_endpoint: string;
          p_identifier: string;
          p_ip_address?: string;
        };
        Returns: undefined;
      };
      refund_escrow: {
        Args: { p_escrow_id: string; p_reason?: string };
        Returns: Json;
      };
      release_escrow: {
        Args: { p_escrow_id: string; p_verified_by?: string };
        Returns: Json;
      };
      search_moments_nearby: {
        Args: {
          p_category?: string;
          p_latitude: number;
          p_limit?: number;
          p_longitude: number;
          p_radius_km?: number;
        };
        Returns: {
          category: string;
          date: string;
          distance_km: number;
          id: string;
          location: string;
          price: number;
          title: string;
        }[];
      };
      soft_delete_user: { Args: { p_user_id: string }; Returns: boolean };
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown };
            Returns: number;
          };
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { '': string }; Returns: number };
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number };
        Returns: string;
      };
      st_asewkt: { Args: { '': string }; Returns: string };
      st_asgeojson:
        | {
            Args: {
              geom_column?: string;
              maxdecimaldigits?: number;
              pretty_bool?: boolean;
              r: Record<string, unknown>;
            };
            Returns: string;
          }
        | {
            Args: {
              geom: unknown;
              maxdecimaldigits?: number;
              options?: number;
            };
            Returns: string;
          }
        | {
            Args: {
              geog: unknown;
              maxdecimaldigits?: number;
              options?: number;
            };
            Returns: string;
          }
        | { Args: { '': string }; Returns: string };
      st_asgml:
        | {
            Args: {
              geom: unknown;
              maxdecimaldigits?: number;
              options?: number;
            };
            Returns: string;
          }
        | {
            Args: {
              geom: unknown;
              id?: string;
              maxdecimaldigits?: number;
              nprefix?: string;
              options?: number;
              version: number;
            };
            Returns: string;
          }
        | {
            Args: {
              geog: unknown;
              id?: string;
              maxdecimaldigits?: number;
              nprefix?: string;
              options?: number;
              version: number;
            };
            Returns: string;
          }
        | {
            Args: {
              geog: unknown;
              id?: string;
              maxdecimaldigits?: number;
              nprefix?: string;
              options?: number;
            };
            Returns: string;
          }
        | { Args: { '': string }; Returns: string };
      st_askml:
        | {
            Args: {
              geom: unknown;
              maxdecimaldigits?: number;
              nprefix?: string;
            };
            Returns: string;
          }
        | {
            Args: {
              geog: unknown;
              maxdecimaldigits?: number;
              nprefix?: string;
            };
            Returns: string;
          }
        | { Args: { '': string }; Returns: string };
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string };
        Returns: string;
      };
      st_asmarc21: {
        Args: { format?: string; geom: unknown };
        Returns: string;
      };
      st_asmvtgeom: {
        Args: {
          bounds: unknown;
          buffer?: number;
          clip_geom?: boolean;
          extent?: number;
          geom: unknown;
        };
        Returns: unknown;
      };
      st_assvg:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number };
            Returns: string;
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number };
            Returns: string;
          }
        | { Args: { '': string }; Returns: string };
      st_astext: { Args: { '': string }; Returns: string };
      st_astwkb:
        | {
            Args: {
              geom: unknown[];
              ids: number[];
              prec?: number;
              prec_m?: number;
              prec_z?: number;
              with_boxes?: boolean;
              with_sizes?: boolean;
            };
            Returns: string;
          }
        | {
            Args: {
              geom: unknown;
              prec?: number;
              prec_m?: number;
              prec_z?: number;
              with_boxes?: boolean;
              with_sizes?: boolean;
            };
            Returns: string;
          };
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number };
        Returns: string;
      };
      st_azimuth:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number };
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown };
        Returns: unknown;
      };
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number };
            Returns: unknown;
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number };
            Returns: unknown;
          };
      st_centroid: { Args: { '': string }; Returns: unknown };
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown };
        Returns: unknown;
      };
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_collect: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean;
          param_geom: unknown;
          param_pctconvex: number;
        };
        Returns: unknown;
      };
      st_contains: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_coorddim: { Args: { geometry: unknown }; Returns: number };
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number };
        Returns: unknown;
      };
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number };
        Returns: unknown;
      };
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_distance:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean };
            Returns: number;
          };
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number };
            Returns: number;
          };
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_dwithin: {
        Args: {
          geog1: unknown;
          geog2: unknown;
          tolerance: number;
          use_spheroid?: boolean;
        };
        Returns: boolean;
      };
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_expand:
        | {
            Args: {
              dm?: number;
              dx: number;
              dy: number;
              dz?: number;
              geom: unknown;
            };
            Returns: unknown;
          }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number };
            Returns: unknown;
          }
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown };
      st_force3d: {
        Args: { geom: unknown; zvalue?: number };
        Returns: unknown;
      };
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number };
        Returns: unknown;
      };
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number };
        Returns: unknown;
      };
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number };
        Returns: unknown;
      };
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number };
            Returns: unknown;
          };
      st_geogfromtext: { Args: { '': string }; Returns: unknown };
      st_geographyfromtext: { Args: { '': string }; Returns: unknown };
      st_geohash:
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
        | { Args: { geog: unknown; maxchars?: number }; Returns: string };
      st_geomcollfromtext: { Args: { '': string }; Returns: unknown };
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean;
          g: unknown;
          max_iter?: number;
          tolerance?: number;
        };
        Returns: unknown;
      };
      st_geometryfromtext: { Args: { '': string }; Returns: unknown };
      st_geomfromewkt: { Args: { '': string }; Returns: unknown };
      st_geomfromgeojson:
        | { Args: { '': Json }; Returns: unknown }
        | { Args: { '': Json }; Returns: unknown }
        | { Args: { '': string }; Returns: unknown };
      st_geomfromgml: { Args: { '': string }; Returns: unknown };
      st_geomfromkml: { Args: { '': string }; Returns: unknown };
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown };
      st_geomfromtext: { Args: { '': string }; Returns: unknown };
      st_gmltosql: { Args: { '': string }; Returns: unknown };
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean };
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_hexagon: {
        Args: {
          cell_i: number;
          cell_j: number;
          origin?: unknown;
          size: number;
        };
        Returns: unknown;
      };
      st_hexagongrid: {
        Args: { bounds: unknown; size: number };
        Returns: Record<string, unknown>[];
      };
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown };
        Returns: number;
      };
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number };
        Returns: unknown;
      };
      st_intersects:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean };
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown };
        Returns: Database['public']['CompositeTypes']['valid_detail'];
        SetofOptions: {
          from: '*';
          to: 'valid_detail';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { '': string }; Returns: number };
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown };
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown };
        Returns: number;
      };
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string };
        Returns: unknown;
      };
      st_linefromtext: { Args: { '': string }; Returns: unknown };
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown };
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number };
        Returns: unknown;
      };
      st_locatebetween: {
        Args: {
          frommeasure: number;
          geometry: unknown;
          leftrightoffset?: number;
          tomeasure: number;
        };
        Returns: unknown;
      };
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number };
        Returns: unknown;
      };
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_makevalid: {
        Args: { geom: unknown; params: string };
        Returns: unknown;
      };
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number };
        Returns: unknown;
      };
      st_mlinefromtext: { Args: { '': string }; Returns: unknown };
      st_mpointfromtext: { Args: { '': string }; Returns: unknown };
      st_mpolyfromtext: { Args: { '': string }; Returns: unknown };
      st_multilinestringfromtext: { Args: { '': string }; Returns: unknown };
      st_multipointfromtext: { Args: { '': string }; Returns: unknown };
      st_multipolygonfromtext: { Args: { '': string }; Returns: unknown };
      st_node: { Args: { g: unknown }; Returns: unknown };
      st_normalize: { Args: { geom: unknown }; Returns: unknown };
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string };
        Returns: unknown;
      };
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean };
        Returns: number;
      };
      st_pointfromtext: { Args: { '': string }; Returns: unknown };
      st_pointm: {
        Args: {
          mcoordinate: number;
          srid?: number;
          xcoordinate: number;
          ycoordinate: number;
        };
        Returns: unknown;
      };
      st_pointz: {
        Args: {
          srid?: number;
          xcoordinate: number;
          ycoordinate: number;
          zcoordinate: number;
        };
        Returns: unknown;
      };
      st_pointzm: {
        Args: {
          mcoordinate: number;
          srid?: number;
          xcoordinate: number;
          ycoordinate: number;
          zcoordinate: number;
        };
        Returns: unknown;
      };
      st_polyfromtext: { Args: { '': string }; Returns: unknown };
      st_polygonfromtext: { Args: { '': string }; Returns: unknown };
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown };
        Returns: unknown;
      };
      st_quantizecoordinates: {
        Args: {
          g: unknown;
          prec_m?: number;
          prec_x: number;
          prec_y?: number;
          prec_z?: number;
        };
        Returns: unknown;
      };
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number };
        Returns: unknown;
      };
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string };
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number };
        Returns: unknown;
      };
      st_setsrid:
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
        | { Args: { geog: unknown; srid: number }; Returns: unknown };
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number };
        Returns: unknown;
      };
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown };
      st_square: {
        Args: {
          cell_i: number;
          cell_j: number;
          origin?: unknown;
          size: number;
        };
        Returns: unknown;
      };
      st_squaregrid: {
        Args: { bounds: unknown; size: number };
        Returns: Record<string, unknown>[];
      };
      st_srid:
        | { Args: { geom: unknown }; Returns: number }
        | { Args: { geog: unknown }; Returns: number };
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number };
        Returns: unknown[];
      };
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown };
        Returns: unknown;
      };
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number };
        Returns: unknown;
      };
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_tileenvelope: {
        Args: {
          bounds?: unknown;
          margin?: number;
          x: number;
          y: number;
          zoom: number;
        };
        Returns: unknown;
      };
      st_touches: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_transform:
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number };
            Returns: unknown;
          }
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string };
            Returns: unknown;
          };
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown };
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number };
            Returns: unknown;
          };
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown };
      st_wkttosql: { Args: { '': string }; Returns: unknown };
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number };
        Returns: unknown;
      };
      unlockrows: { Args: { '': string }; Returns: number };
      updategeometrysrid: {
        Args: {
          catalogn_name: string;
          column_name: string;
          new_srid_in: number;
          schema_name: string;
          table_name: string;
        };
        Returns: string;
      };
      user_conversation_ids: { Args: never; Returns: string[] };
      user_moment_ids: { Args: never; Returns: string[] };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null;
        geom: unknown;
      };
      valid_detail: {
        valid: boolean | null;
        reason: string | null;
        location: unknown;
      };
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          owner_id: string | null;
          public: boolean | null;
          type: Database['storage']['Enums']['buckettype'];
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string | null;
        };
        Relationships: [];
      };
      buckets_analytics: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          format: string;
          id: string;
          name: string;
          type: Database['storage']['Enums']['buckettype'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          format?: string;
          id?: string;
          name: string;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          format?: string;
          id?: string;
          name?: string;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string;
        };
        Relationships: [];
      };
      buckets_vectors: {
        Row: {
          created_at: string;
          id: string;
          type: Database['storage']['Enums']['buckettype'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id: string;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string;
        };
        Relationships: [];
      };
      iceberg_namespaces: {
        Row: {
          bucket_name: string;
          catalog_id: string;
          created_at: string;
          id: string;
          metadata: Json;
          name: string;
          updated_at: string;
        };
        Insert: {
          bucket_name: string;
          catalog_id: string;
          created_at?: string;
          id?: string;
          metadata?: Json;
          name: string;
          updated_at?: string;
        };
        Update: {
          bucket_name?: string;
          catalog_id?: string;
          created_at?: string;
          id?: string;
          metadata?: Json;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'iceberg_namespaces_catalog_id_fkey';
            columns: ['catalog_id'];
            isOneToOne: false;
            referencedRelation: 'buckets_analytics';
            referencedColumns: ['id'];
          },
        ];
      };
      iceberg_tables: {
        Row: {
          bucket_name: string;
          catalog_id: string;
          created_at: string;
          id: string;
          location: string;
          name: string;
          namespace_id: string;
          remote_table_id: string | null;
          shard_id: string | null;
          shard_key: string | null;
          updated_at: string;
        };
        Insert: {
          bucket_name: string;
          catalog_id: string;
          created_at?: string;
          id?: string;
          location: string;
          name: string;
          namespace_id: string;
          remote_table_id?: string | null;
          shard_id?: string | null;
          shard_key?: string | null;
          updated_at?: string;
        };
        Update: {
          bucket_name?: string;
          catalog_id?: string;
          created_at?: string;
          id?: string;
          location?: string;
          name?: string;
          namespace_id?: string;
          remote_table_id?: string | null;
          shard_id?: string | null;
          shard_key?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'iceberg_tables_catalog_id_fkey';
            columns: ['catalog_id'];
            isOneToOne: false;
            referencedRelation: 'buckets_analytics';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'iceberg_tables_namespace_id_fkey';
            columns: ['namespace_id'];
            isOneToOne: false;
            referencedRelation: 'iceberg_namespaces';
            referencedColumns: ['id'];
          },
        ];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          level: number | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          owner_id: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          user_metadata: Json | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          level?: number | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          level?: number | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      prefixes: {
        Row: {
          bucket_id: string;
          created_at: string | null;
          level: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          bucket_id: string;
          created_at?: string | null;
          level?: number;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          bucket_id?: string;
          created_at?: string | null;
          level?: number;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'prefixes_bucketId_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          in_progress_size: number;
          key: string;
          owner_id: string | null;
          upload_signature: string;
          user_metadata: Json | null;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id: string;
          in_progress_size?: number;
          key: string;
          owner_id?: string | null;
          upload_signature: string;
          user_metadata?: Json | null;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          in_progress_size?: number;
          key?: string;
          owner_id?: string | null;
          upload_signature?: string;
          user_metadata?: Json | null;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string;
          created_at: string;
          etag: string;
          id: string;
          key: string;
          owner_id: string | null;
          part_number: number;
          size: number;
          upload_id: string;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          etag: string;
          id?: string;
          key: string;
          owner_id?: string | null;
          part_number: number;
          size?: number;
          upload_id: string;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          etag?: string;
          id?: string;
          key?: string;
          owner_id?: string | null;
          part_number?: number;
          size?: number;
          upload_id?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_parts_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 's3_multipart_uploads_parts_upload_id_fkey';
            columns: ['upload_id'];
            isOneToOne: false;
            referencedRelation: 's3_multipart_uploads';
            referencedColumns: ['id'];
          },
        ];
      };
      vector_indexes: {
        Row: {
          bucket_id: string;
          created_at: string;
          data_type: string;
          dimension: number;
          distance_metric: string;
          id: string;
          metadata_configuration: Json | null;
          name: string;
          updated_at: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          data_type: string;
          dimension: number;
          distance_metric: string;
          id?: string;
          metadata_configuration?: Json | null;
          name: string;
          updated_at?: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          data_type?: string;
          dimension?: number;
          distance_metric?: string;
          id?: string;
          metadata_configuration?: Json | null;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'vector_indexes_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets_vectors';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string };
        Returns: undefined;
      };
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string };
        Returns: undefined;
      };
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] };
        Returns: undefined;
      };
      delete_prefix: {
        Args: { _bucket_id: string; _name: string };
        Returns: boolean;
      };
      extension: { Args: { name: string }; Returns: string };
      filename: { Args: { name: string }; Returns: string };
      foldername: { Args: { name: string }; Returns: string[] };
      get_level: { Args: { name: string }; Returns: number };
      get_prefix: { Args: { name: string }; Returns: string };
      get_prefixes: { Args: { name: string }; Returns: string[] };
      get_size_by_bucket: {
        Args: never;
        Returns: {
          bucket_id: string;
          size: number;
        }[];
      };
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string;
          delimiter_param: string;
          max_keys?: number;
          next_key_token?: string;
          next_upload_token?: string;
          prefix_param: string;
        };
        Returns: {
          created_at: string;
          id: string;
          key: string;
        }[];
      };
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string;
          delimiter_param: string;
          max_keys?: number;
          next_token?: string;
          prefix_param: string;
          start_after?: string;
        };
        Returns: {
          id: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] };
        Returns: undefined;
      };
      operation: { Args: never; Returns: string };
      search: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_legacy_v1: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_v1_optimised: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_v2: {
        Args: {
          bucket_name: string;
          levels?: number;
          limits?: number;
          prefix: string;
          sort_column?: string;
          sort_column_after?: string;
          sort_order?: string;
          start_after?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          key: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      buckettype: 'STANDARD' | 'ANALYTICS' | 'VECTOR';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
  storage: {
    Enums: {
      buckettype: ['STANDARD', 'ANALYTICS', 'VECTOR'],
    },
  },
} as const;

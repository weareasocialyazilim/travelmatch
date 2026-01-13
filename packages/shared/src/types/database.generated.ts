export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ab_assignments: {
        Row: {
          assigned_at: string | null
          conversion_value: number | null
          converted: boolean | null
          converted_at: string | null
          experiment_id: string
          id: string
          user_id: string
          variant: string
        }
        Insert: {
          assigned_at?: string | null
          conversion_value?: number | null
          converted?: boolean | null
          converted_at?: string | null
          experiment_id: string
          id?: string
          user_id: string
          variant: string
        }
        Update: {
          assigned_at?: string | null
          conversion_value?: number | null
          converted?: boolean | null
          converted_at?: string | null
          experiment_id?: string
          id?: string
          user_id?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_assignments_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "ab_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_experiments: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          ended_at: string | null
          id: string
          metadata: Json | null
          min_sample_size: number | null
          name: string
          started_at: string | null
          statistical_significance: number | null
          status: string
          target_metric: string
          variants: Json
          winner: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          min_sample_size?: number | null
          name: string
          started_at?: string | null
          statistical_significance?: number | null
          status?: string
          target_metric?: string
          variants?: Json
          winner?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          min_sample_size?: number | null
          name?: string
          started_at?: string | null
          statistical_significance?: number | null
          status?: string
          target_metric?: string
          variants?: Json
          winner?: string | null
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          new_value: Json | null
          old_value: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_sessions: {
        Row: {
          admin_id: string
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          token_hash: string
          user_agent: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          token_hash: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          token_hash?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          name: string
          requires_2fa: boolean | null
          role: Database["public"]["Enums"]["admin_role"]
          totp_enabled: boolean | null
          totp_secret: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name: string
          requires_2fa?: boolean | null
          role?: Database["public"]["Enums"]["admin_role"]
          totp_enabled?: boolean | null
          totp_secret?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string
          requires_2fa?: boolean | null
          role?: Database["public"]["Enums"]["admin_role"]
          totp_enabled?: boolean | null
          totp_secret?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_anomalies: {
        Row: {
          details: string | null
          detected_at: string | null
          id: string
          message: string
          metadata: Json | null
          resolution_notes: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          type: string
        }
        Insert: {
          details?: string | null
          detected_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          type: string
        }
        Update: {
          details?: string | null
          detected_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          type?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          resource_id: string | null
          resource_type: string | null
          severity: string
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          status?: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      aml_thresholds: {
        Row: {
          action: string
          amount: number | null
          count_threshold: number | null
          created_at: string | null
          currency: string
          description_en: string | null
          description_tr: string | null
          id: string
          is_active: boolean | null
          risk_score: number | null
          threshold_type: string
          time_window_minutes: number | null
        }
        Insert: {
          action: string
          amount?: number | null
          count_threshold?: number | null
          created_at?: string | null
          currency?: string
          description_en?: string | null
          description_tr?: string | null
          id?: string
          is_active?: boolean | null
          risk_score?: number | null
          threshold_type: string
          time_window_minutes?: number | null
        }
        Update: {
          action?: string
          amount?: number | null
          count_threshold?: number | null
          created_at?: string | null
          currency?: string
          description_en?: string | null
          description_tr?: string | null
          id?: string
          is_active?: boolean | null
          risk_score?: number | null
          threshold_type?: string
          time_window_minutes?: number | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: Database["public"]["Enums"]["badge_category"]
          color: string
          created_at: string | null
          description: string
          description_tr: string
          icon: string
          id: string
          is_active: boolean | null
          name: string
          name_tr: string
          requirement_type: string
          requirement_value: number
          slug: string
          sort_order: number | null
        }
        Insert: {
          category: Database["public"]["Enums"]["badge_category"]
          color?: string
          created_at?: string | null
          description: string
          description_tr: string
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          name_tr: string
          requirement_type: string
          requirement_value: number
          slug: string
          sort_order?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["badge_category"]
          color?: string
          created_at?: string | null
          description?: string
          description_tr?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          name_tr?: string
          requirement_type?: string
          requirement_value?: number
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      blocked_content: {
        Row: {
          appeal_notes: string | null
          appeal_status: string | null
          content_type: string
          created_at: string | null
          id: string
          original_content_encrypted: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          user_id: string
          violation_reasons: string[]
        }
        Insert: {
          appeal_notes?: string | null
          appeal_status?: string | null
          content_type: string
          created_at?: string | null
          id?: string
          original_content_encrypted?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_id: string
          violation_reasons: string[]
        }
        Update: {
          appeal_notes?: string | null
          appeal_status?: string | null
          content_type?: string
          created_at?: string | null
          id?: string
          original_content_encrypted?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_id?: string
          violation_reasons?: string[]
        }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cache_invalidation: {
        Row: {
          cache_key: string
          id: string
          invalidated_at: string | null
        }
        Insert: {
          cache_key: string
          id?: string
          invalidated_at?: string | null
        }
        Update: {
          cache_key?: string
          id?: string
          invalidated_at?: string | null
        }
        Relationships: []
      }
      cdn_invalidation_logs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          item_ids: string[]
          latency_ms: number | null
          success: boolean
          type: string
          urls: string[]
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          item_ids: string[]
          latency_ms?: number | null
          success?: boolean
          type: string
          urls: string[]
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          item_ids?: string[]
          latency_ms?: number | null
          success?: boolean
          type?: string
          urls?: string[]
        }
        Relationships: []
      }
      chatbot_conversations: {
        Row: {
          id: string
          last_message_at: string | null
          metadata: Json | null
          resolved_at: string | null
          satisfaction_rating: number | null
          session_id: string
          started_at: string | null
          state: string | null
          user_id: string
        }
        Insert: {
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          satisfaction_rating?: number | null
          session_id: string
          started_at?: string | null
          state?: string | null
          user_id: string
        }
        Update: {
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          satisfaction_rating?: number | null
          session_id?: string
          started_at?: string | null
          state?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chatbot_messages: {
        Row: {
          confidence: number | null
          content: string
          conversation_id: string
          created_at: string | null
          entities: Json | null
          id: string
          intent: string | null
          role: string
          suggestions: string[] | null
        }
        Insert: {
          confidence?: number | null
          content: string
          conversation_id: string
          created_at?: string | null
          entities?: Json | null
          id?: string
          intent?: string | null
          role: string
          suggestions?: string[] | null
        }
        Update: {
          confidence?: number | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          entities?: Json | null
          id?: string
          intent?: string | null
          role?: string
          suggestions?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chatbot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_ledger: {
        Row: {
          base_amount: number
          collected_at: string | null
          created_at: string | null
          currency: string
          escrow_id: string | null
          gift_id: string | null
          giver_commission: number
          giver_id: string
          giver_pays: number
          id: string
          is_direct_pay: boolean | null
          moment_id: string | null
          paytr_merchant_oid: string | null
          paytr_transfer_id: string | null
          platform_revenue: number
          receiver_account_type: Database["public"]["Enums"]["user_account_type"]
          receiver_commission: number
          receiver_gets: number
          receiver_id: string
          status: string
          tier_name: string
          total_commission: number
          total_rate: number
          transferred_at: string | null
          was_vip_transaction: boolean | null
        }
        Insert: {
          base_amount: number
          collected_at?: string | null
          created_at?: string | null
          currency?: string
          escrow_id?: string | null
          gift_id?: string | null
          giver_commission: number
          giver_id: string
          giver_pays: number
          id?: string
          is_direct_pay?: boolean | null
          moment_id?: string | null
          paytr_merchant_oid?: string | null
          paytr_transfer_id?: string | null
          platform_revenue: number
          receiver_account_type?: Database["public"]["Enums"]["user_account_type"]
          receiver_commission: number
          receiver_gets: number
          receiver_id: string
          status?: string
          tier_name: string
          total_commission: number
          total_rate: number
          transferred_at?: string | null
          was_vip_transaction?: boolean | null
        }
        Update: {
          base_amount?: number
          collected_at?: string | null
          created_at?: string | null
          currency?: string
          escrow_id?: string | null
          gift_id?: string | null
          giver_commission?: number
          giver_id?: string
          giver_pays?: number
          id?: string
          is_direct_pay?: boolean | null
          moment_id?: string | null
          paytr_merchant_oid?: string | null
          paytr_transfer_id?: string | null
          platform_revenue?: number
          receiver_account_type?: Database["public"]["Enums"]["user_account_type"]
          receiver_commission?: number
          receiver_gets?: number
          receiver_id?: string
          status?: string
          tier_name?: string
          total_commission?: number
          total_rate?: number
          transferred_at?: string | null
          was_vip_transaction?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_ledger_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "escrow_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_ledger_giver_id_fkey"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_ledger_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_ledger_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_tiers: {
        Row: {
          created_at: string | null
          giver_share: number
          id: string
          is_active: boolean | null
          max_amount: number | null
          min_amount: number
          name: string
          receiver_share: number
          total_rate: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          giver_share?: number
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          min_amount: number
          name: string
          receiver_share?: number
          total_rate: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          giver_share?: number
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          min_amount?: number
          name?: string
          receiver_share?: number
          total_rate?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      consent_history: {
        Row: {
          consent_given: boolean
          consent_type: string
          consent_version: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_given: boolean
          consent_type: string
          consent_version?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_given?: boolean
          consent_type?: string
          consent_version?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          is_archived: boolean | null
          joined_at: string | null
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_archived?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_archived?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          archived_at: string | null
          created_at: string | null
          id: string
          last_message_id: string | null
          migrated_to_junction: boolean | null
          moment_id: string | null
          participant_ids: string[]
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          id?: string
          last_message_id?: string | null
          migrated_to_junction?: boolean | null
          moment_id?: string | null
          participant_ids: string[]
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          id?: string
          last_message_id?: string | null
          migrated_to_junction?: boolean | null
          moment_id?: string | null
          participant_ids?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_last_message"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      currencies: {
        Row: {
          code: string
          created_at: string | null
          decimal_places: number | null
          display_order: number | null
          is_active: boolean | null
          name: string
          name_tr: string
          symbol: string
        }
        Insert: {
          code: string
          created_at?: string | null
          decimal_places?: number | null
          display_order?: number | null
          is_active?: boolean | null
          name: string
          name_tr: string
          symbol: string
        }
        Update: {
          code?: string
          created_at?: string | null
          decimal_places?: number | null
          display_order?: number | null
          is_active?: boolean | null
          name?: string
          name_tr?: string
          symbol?: string
        }
        Relationships: []
      }
      currency_buffer_config: {
        Row: {
          buffer_percentage: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          buffer_percentage?: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          buffer_percentage?: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      data_deletion_requests: {
        Row: {
          completed_at: string | null
          deadline: string | null
          deleted_data_summary: Json | null
          id: string
          processed_at: string | null
          processed_by: string | null
          processing_notes: string | null
          reason: string | null
          request_type: string
          requested_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          deadline?: string | null
          deleted_data_summary?: Json | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          processing_notes?: string | null
          reason?: string | null
          request_type: string
          requested_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          deadline?: string | null
          deleted_data_summary?: Json | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          processing_notes?: string | null
          reason?: string | null
          request_type?: string
          requested_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_deletion_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      data_export_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          expires_at: string | null
          file_url: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_url?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          expires_at?: string | null
          file_url?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_export_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deep_link_events: {
        Row: {
          campaign: string | null
          completed: boolean | null
          completed_at: string | null
          content: string | null
          created_at: string | null
          drop_off_screen: string | null
          id: string
          landing_screen: string | null
          medium: string | null
          params: Json | null
          session_id: string
          source: string
          target_screen: string | null
          term: string | null
          time_to_complete: number | null
          time_to_land: number | null
          type: string
          updated_at: string | null
          url: string
          user_id: string | null
        }
        Insert: {
          campaign?: string | null
          completed?: boolean | null
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          drop_off_screen?: string | null
          id: string
          landing_screen?: string | null
          medium?: string | null
          params?: Json | null
          session_id: string
          source: string
          target_screen?: string | null
          term?: string | null
          time_to_complete?: number | null
          time_to_land?: number | null
          type: string
          updated_at?: string | null
          url: string
          user_id?: string | null
        }
        Update: {
          campaign?: string | null
          completed?: boolean | null
          completed_at?: string | null
          content?: string | null
          created_at?: string | null
          drop_off_screen?: string | null
          id?: string
          landing_screen?: string | null
          medium?: string | null
          params?: Json | null
          session_id?: string
          source?: string
          target_screen?: string | null
          term?: string | null
          time_to_complete?: number | null
          time_to_land?: number | null
          type?: string
          updated_at?: string | null
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      demand_forecasts: {
        Row: {
          actual_demand: number | null
          category: string
          confidence: number
          created_at: string | null
          factors: Json | null
          forecast_date: string
          id: string
          location: string | null
          model_version: string | null
          predicted_demand: number
        }
        Insert: {
          actual_demand?: number | null
          category: string
          confidence: number
          created_at?: string | null
          factors?: Json | null
          forecast_date: string
          id?: string
          location?: string | null
          model_version?: string | null
          predicted_demand: number
        }
        Update: {
          actual_demand?: number | null
          category?: string
          confidence?: number
          created_at?: string | null
          factors?: Json | null
          forecast_date?: string
          id?: string
          location?: string | null
          model_version?: string | null
          predicted_demand?: number
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_amount: number | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string | null
          description: string | null
          evidence: string[] | null
          id: string
          proof_id: string | null
          reason: string
          reported_user_id: string | null
          reporter_id: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          transaction_id: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          evidence?: string[] | null
          id?: string
          proof_id?: string | null
          reason: string
          reported_user_id?: string | null
          reporter_id: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          transaction_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          evidence?: string[] | null
          id?: string
          proof_id?: string | null
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          transaction_id?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_idempotency_keys: {
        Row: {
          created_at: string
          escrow_id: string
          expires_at: string
          idempotency_key: string
          operation: string
          result: Json
        }
        Insert: {
          created_at?: string
          escrow_id: string
          expires_at?: string
          idempotency_key: string
          operation: string
          result: Json
        }
        Update: {
          created_at?: string
          escrow_id?: string
          expires_at?: string
          idempotency_key?: string
          operation?: string
          result?: Json
        }
        Relationships: [
          {
            foreignKeyName: "escrow_idempotency_keys_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "escrow_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_thresholds: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_tr: string | null
          escrow_type: string
          id: string
          is_active: boolean | null
          max_amount_usd: number | null
          max_contributors: number | null
          min_amount_usd: number
          tier_name: string
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_tr?: string | null
          escrow_type: string
          id?: string
          is_active?: boolean | null
          max_amount_usd?: number | null
          max_contributors?: number | null
          min_amount_usd: number
          tier_name: string
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_tr?: string | null
          escrow_type?: string
          id?: string
          is_active?: boolean | null
          max_amount_usd?: number | null
          max_contributors?: number | null
          min_amount_usd?: number
          tier_name?: string
        }
        Relationships: []
      }
      escrow_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          exchange_rate_used: number | null
          expires_at: string
          gift_id: string | null
          id: string
          metadata: Json | null
          moment_id: string | null
          original_amount: number | null
          original_currency: string | null
          proof_submitted: boolean | null
          proof_verification_date: string | null
          proof_verified: boolean | null
          recipient_id: string
          refund_reason: string | null
          refunded_amount: number | null
          refunded_at: string | null
          release_condition: string
          release_reason: string | null
          released_at: string | null
          released_by: string | null
          sender_id: string
          service_fee_retained: number | null
          settlement_currency: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          exchange_rate_used?: number | null
          expires_at?: string
          gift_id?: string | null
          id?: string
          metadata?: Json | null
          moment_id?: string | null
          original_amount?: number | null
          original_currency?: string | null
          proof_submitted?: boolean | null
          proof_verification_date?: string | null
          proof_verified?: boolean | null
          recipient_id: string
          refund_reason?: string | null
          refunded_amount?: number | null
          refunded_at?: string | null
          release_condition?: string
          release_reason?: string | null
          released_at?: string | null
          released_by?: string | null
          sender_id: string
          service_fee_retained?: number | null
          settlement_currency?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          exchange_rate_used?: number | null
          expires_at?: string
          gift_id?: string | null
          id?: string
          metadata?: Json | null
          moment_id?: string | null
          original_amount?: number | null
          original_currency?: string | null
          proof_submitted?: boolean | null
          proof_verification_date?: string | null
          proof_verified?: boolean | null
          recipient_id?: string
          refund_reason?: string | null
          refunded_amount?: number | null
          refunded_at?: string | null
          release_condition?: string
          release_reason?: string | null
          released_at?: string | null
          released_by?: string | null
          sender_id?: string
          service_fee_retained?: number | null
          settlement_currency?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_transactions_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_transactions_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_transactions_original_currency_fkey"
            columns: ["original_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "escrow_transactions_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_transactions_released_by_fkey"
            columns: ["released_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_transactions_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_transactions_settlement_currency_fkey"
            columns: ["settlement_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          ask_rate: number | null
          base_currency: string
          bid_rate: number | null
          created_at: string | null
          id: string
          is_latest: boolean | null
          mid_rate: number | null
          rate: number
          rate_date: string
          rate_timestamp: string | null
          source: string | null
          target_currency: string
        }
        Insert: {
          ask_rate?: number | null
          base_currency: string
          bid_rate?: number | null
          created_at?: string | null
          id?: string
          is_latest?: boolean | null
          mid_rate?: number | null
          rate: number
          rate_date?: string
          rate_timestamp?: string | null
          source?: string | null
          target_currency: string
        }
        Update: {
          ask_rate?: number | null
          base_currency?: string
          bid_rate?: number | null
          created_at?: string | null
          id?: string
          is_latest?: boolean | null
          mid_rate?: number | null
          rate?: number
          rate_date?: string
          rate_timestamp?: string | null
          source?: string | null
          target_currency?: string
        }
        Relationships: [
          {
            foreignKeyName: "exchange_rates_base_currency_fkey"
            columns: ["base_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "exchange_rates_target_currency_fkey"
            columns: ["target_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          moment_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          moment_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          moment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_delta: {
        Row: {
          created_at: string
          data: Json | null
          item_id: string
          item_type: string
          operation: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          data?: Json | null
          item_id: string
          item_type: string
          operation: string
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          data?: Json | null
          item_id?: string
          item_type?: string
          operation?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      fraud_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          details: Json
          escrow_id: string | null
          id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          details: Json
          escrow_id?: string | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          details?: Json
          escrow_id?: string | null
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "escrow_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_cases: {
        Row: {
          amount_involved: number | null
          assigned_to: string | null
          case_number: string
          created_at: string | null
          description: string | null
          evidence: Json | null
          id: string
          metadata: Json | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_involved?: number | null
          assigned_to?: string | null
          case_number: string
          created_at?: string | null
          description?: string | null
          evidence?: Json | null
          id?: string
          metadata?: Json | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_involved?: number | null
          assigned_to?: string | null
          case_number?: string
          created_at?: string | null
          description?: string | null
          evidence?: Json | null
          id?: string
          metadata?: Json | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_cases_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_cases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_evidence: {
        Row: {
          case_id: string
          content: string | null
          created_at: string | null
          file_url: string | null
          id: string
          metadata: Json | null
          type: string
          uploaded_by: string | null
        }
        Insert: {
          case_id: string
          content?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          type: string
          uploaded_by?: string | null
        }
        Update: {
          case_id?: string
          content?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          type?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fraud_evidence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "fraud_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fraud_evidence_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_rules: {
        Row: {
          action: string
          created_at: string | null
          description_en: string | null
          description_tr: string | null
          id: string
          is_active: boolean | null
          parameters: Json
          risk_score: number | null
          rule_name: string
          rule_type: string
        }
        Insert: {
          action: string
          created_at?: string | null
          description_en?: string | null
          description_tr?: string | null
          id?: string
          is_active?: boolean | null
          parameters: Json
          risk_score?: number | null
          rule_name: string
          rule_type: string
        }
        Update: {
          action?: string
          created_at?: string | null
          description_en?: string | null
          description_tr?: string | null
          id?: string
          is_active?: boolean | null
          parameters?: Json
          risk_score?: number | null
          rule_name?: string
          rule_type?: string
        }
        Relationships: []
      }
      gift_contracts: {
        Row: {
          base_amount: number
          commission_amount: number
          contract_number: string
          contract_pdf_hash: string | null
          contract_pdf_url: string | null
          contract_version: string
          created_at: string | null
          currency: string
          distance_contract_accepted: boolean | null
          distance_contract_accepted_at: string | null
          gift_id: string
          giver_device_id: string | null
          giver_id: string
          giver_ip_address: unknown
          giver_user_agent: string | null
          id: string
          moment_description: string | null
          moment_id: string
          moment_title: string
          pre_info_accepted: boolean | null
          pre_info_accepted_at: string | null
          receiver_id: string
          total_amount: number
          withdrawal_deadline: string | null
          withdrawal_reason: string | null
          withdrawal_used: boolean | null
          withdrawal_used_at: string | null
        }
        Insert: {
          base_amount: number
          commission_amount: number
          contract_number: string
          contract_pdf_hash?: string | null
          contract_pdf_url?: string | null
          contract_version?: string
          created_at?: string | null
          currency?: string
          distance_contract_accepted?: boolean | null
          distance_contract_accepted_at?: string | null
          gift_id: string
          giver_device_id?: string | null
          giver_id: string
          giver_ip_address?: unknown
          giver_user_agent?: string | null
          id?: string
          moment_description?: string | null
          moment_id: string
          moment_title: string
          pre_info_accepted?: boolean | null
          pre_info_accepted_at?: string | null
          receiver_id: string
          total_amount: number
          withdrawal_deadline?: string | null
          withdrawal_reason?: string | null
          withdrawal_used?: boolean | null
          withdrawal_used_at?: string | null
        }
        Update: {
          base_amount?: number
          commission_amount?: number
          contract_number?: string
          contract_pdf_hash?: string | null
          contract_pdf_url?: string | null
          contract_version?: string
          created_at?: string | null
          currency?: string
          distance_contract_accepted?: boolean | null
          distance_contract_accepted_at?: string | null
          gift_id?: string
          giver_device_id?: string | null
          giver_id?: string
          giver_ip_address?: unknown
          giver_user_agent?: string | null
          id?: string
          moment_description?: string | null
          moment_id?: string
          moment_title?: string
          pre_info_accepted?: boolean | null
          pre_info_accepted_at?: string | null
          receiver_id?: string
          total_amount?: number
          withdrawal_deadline?: string | null
          withdrawal_reason?: string | null
          withdrawal_used?: boolean | null
          withdrawal_used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_contracts_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_contracts_giver_id_fkey"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_contracts_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_contracts_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gifts: {
        Row: {
          amount: number
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          currency: string
          direct_pay_transferred_at: string | null
          exchange_rate_date: string | null
          exchange_rate_used: number | null
          giver_id: string
          id: string
          is_direct_pay: boolean | null
          message: string | null
          metadata: Json | null
          moment_id: string | null
          original_amount: number | null
          original_currency: string | null
          proof_requested_by_giver: boolean | null
          proof_requirement: string | null
          receiver_id: string
          status: string
        }
        Insert: {
          amount: number
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          direct_pay_transferred_at?: string | null
          exchange_rate_date?: string | null
          exchange_rate_used?: number | null
          giver_id: string
          id?: string
          is_direct_pay?: boolean | null
          message?: string | null
          metadata?: Json | null
          moment_id?: string | null
          original_amount?: number | null
          original_currency?: string | null
          proof_requested_by_giver?: boolean | null
          proof_requirement?: string | null
          receiver_id: string
          status?: string
        }
        Update: {
          amount?: number
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          direct_pay_transferred_at?: string | null
          exchange_rate_date?: string | null
          exchange_rate_used?: number | null
          giver_id?: string
          id?: string
          is_direct_pay?: boolean | null
          message?: string | null
          metadata?: Json | null
          moment_id?: string | null
          original_amount?: number | null
          original_currency?: string | null
          proof_requested_by_giver?: boolean | null
          proof_requirement?: string | null
          receiver_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "gifts_giver_id_fkey"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gifts_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gifts_original_currency_fkey"
            columns: ["original_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "gifts_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_thresholds: {
        Row: {
          action: string
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          message_en: string | null
          message_tr: string | null
          threshold_type: string
        }
        Insert: {
          action: string
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          message_en?: string | null
          message_tr?: string | null
          threshold_type: string
        }
        Update: {
          action?: string
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          message_en?: string | null
          message_tr?: string | null
          threshold_type?: string
        }
        Relationships: []
      }
      kyc_verifications: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          metadata: Json | null
          provider: string
          provider_check_id: string | null
          provider_id: string | null
          rejection_reasons: string[] | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          provider: string
          provider_check_id?: string | null
          provider_id?: string | null
          rejection_reasons?: string[] | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          provider?: string
          provider_check_id?: string | null
          provider_id?: string | null
          rejection_reasons?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      linked_accounts: {
        Row: {
          confidence_score: number | null
          detected_at: string | null
          id: string
          link_type: string
          linked_user_id: string
          metadata: Json | null
          primary_user_id: string
          status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          confidence_score?: number | null
          detected_at?: string | null
          id?: string
          link_type: string
          linked_user_id: string
          metadata?: Json | null
          primary_user_id: string
          status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          confidence_score?: number | null
          detected_at?: string | null
          id?: string
          link_type?: string
          linked_user_id?: string
          metadata?: Json | null
          primary_user_id?: string
          status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "linked_accounts_linked_user_id_fkey"
            columns: ["linked_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linked_accounts_primary_user_id_fkey"
            columns: ["primary_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "linked_accounts_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          banner_url: string | null
          budget: number | null
          clicks: number | null
          conversions: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          discount_type: string | null
          discount_value: number | null
          end_date: string | null
          id: string
          impressions: number | null
          landing_url: string | null
          metadata: Json | null
          name: string
          promo_code: string | null
          revenue: number | null
          spent: number | null
          start_date: string | null
          status: string
          target_audience: Json | null
          type: string
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          banner_url?: string | null
          budget?: number | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          landing_url?: string | null
          metadata?: Json | null
          name: string
          promo_code?: string | null
          revenue?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string
          target_audience?: Json | null
          type: string
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          banner_url?: string | null
          budget?: number | null
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_date?: string | null
          id?: string
          impressions?: number | null
          landing_url?: string | null
          metadata?: Json | null
          name?: string
          promo_code?: string | null
          revenue?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string
          target_audience?: Json | null
          type?: string
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          read_at: string | null
          sender_id: string
          type: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sender_id: string
          type?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_analytics: {
        Row: {
          cached: boolean | null
          created_at: string | null
          endpoint: string
          error_message: string | null
          id: string
          latency_ms: number
          request_metadata: Json | null
          status_code: number | null
          user_id: string | null
        }
        Insert: {
          cached?: boolean | null
          created_at?: string | null
          endpoint: string
          error_message?: string | null
          id?: string
          latency_ms: number
          request_metadata?: Json | null
          status_code?: number | null
          user_id?: string | null
        }
        Update: {
          cached?: boolean | null
          created_at?: string | null
          endpoint?: string
          error_message?: string | null
          id?: string
          latency_ms?: number
          request_metadata?: Json | null
          status_code?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      moderation_dictionary: {
        Row: {
          added_by: string | null
          category: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_regex: boolean | null
          severity: string
          updated_at: string | null
          word: string
        }
        Insert: {
          added_by?: string | null
          category: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_regex?: boolean | null
          severity: string
          updated_at?: string | null
          word: string
        }
        Update: {
          added_by?: string | null
          category?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_regex?: boolean | null
          severity?: string
          updated_at?: string | null
          word?: string
        }
        Relationships: []
      }
      moderation_logs: {
        Row: {
          action_taken: string
          content_hash: string
          content_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          severity: string
          user_id: string | null
          violations: Json | null
        }
        Insert: {
          action_taken: string
          content_hash: string
          content_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          severity: string
          user_id?: string | null
          violations?: Json | null
        }
        Update: {
          action_taken?: string
          content_hash?: string
          content_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          severity?: string
          user_id?: string | null
          violations?: Json | null
        }
        Relationships: []
      }
      moment_offers: {
        Row: {
          created_at: string
          currency: string
          expires_at: string
          host_id: string
          id: string
          message: string | null
          moment_id: string
          offer_amount: number
          original_amount: number
          responded_at: string | null
          response_message: string | null
          status: string
          subscriber_id: string
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          expires_at?: string
          host_id: string
          id?: string
          message?: string | null
          moment_id: string
          offer_amount: number
          original_amount: number
          responded_at?: string | null
          response_message?: string | null
          status?: string
          subscriber_id: string
          subscription_tier: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          expires_at?: string
          host_id?: string
          id?: string
          message?: string | null
          moment_id?: string
          offer_amount?: number
          original_amount?: number
          responded_at?: string | null
          response_message?: string | null
          status?: string
          subscriber_id?: string
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "moment_offers_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moment_offers_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moment_offers_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      moments: {
        Row: {
          category: string
          coordinates: unknown
          created_at: string | null
          currency: string | null
          current_contributor_count: number | null
          current_participants: number | null
          date: string
          description: string | null
          duration_hours: number | null
          id: string
          image_blur_hash: string | null
          image_id: string | null
          images: string[] | null
          is_featured: boolean | null
          location: string
          location_geography: unknown
          max_contributors: number | null
          max_participants: number | null
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          moderation_status: string | null
          price: number | null
          requirements: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          coordinates?: unknown
          created_at?: string | null
          currency?: string | null
          current_contributor_count?: number | null
          current_participants?: number | null
          date: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          image_blur_hash?: string | null
          image_id?: string | null
          images?: string[] | null
          is_featured?: boolean | null
          location: string
          location_geography?: unknown
          max_contributors?: number | null
          max_participants?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          price?: number | null
          requirements?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          coordinates?: unknown
          created_at?: string | null
          currency?: string | null
          current_contributor_count?: number | null
          current_participants?: number | null
          date?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          image_blur_hash?: string | null
          image_id?: string | null
          images?: string[] | null
          is_featured?: boolean | null
          location?: string
          location_geography?: unknown
          max_contributors?: number | null
          max_participants?: number | null
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          moderation_status?: string | null
          price?: number | null
          requirements?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moments_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "uploaded_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moments_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_campaigns: {
        Row: {
          clicked_count: number | null
          created_at: string | null
          created_by: string | null
          delivered_count: number | null
          failed_count: number | null
          id: string
          message: string
          metadata: Json | null
          opened_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          target_audience: Json | null
          title: string
          total_recipients: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          clicked_count?: number | null
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          message: string
          metadata?: Json | null
          opened_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_audience?: Json | null
          title: string
          total_recipients?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          clicked_count?: number | null
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          message?: string
          metadata?: Json | null
          opened_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_audience?: Json | null
          title?: string
          total_recipients?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          data: Json | null
          id: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_analytics_daily: {
        Row: {
          avg_commission_rate: number | null
          avg_escrow_release_hours: number | null
          avg_proof_verification_hours: number | null
          avg_transaction_amount: number | null
          commission_from_givers: number | null
          commission_from_receivers: number | null
          date: string
          escrow_created: number | null
          escrow_disputed: number | null
          escrow_refunded: number | null
          escrow_released: number | null
          failed_transactions: number | null
          id: string
          successful_transactions: number | null
          total_commission: number | null
          total_gmv: number | null
          total_gmv_eur: number | null
          total_gmv_try: number | null
          total_gmv_usd: number | null
          total_transactions: number | null
          updated_at: string | null
          vip_gmv: number | null
          vip_transactions: number | null
        }
        Insert: {
          avg_commission_rate?: number | null
          avg_escrow_release_hours?: number | null
          avg_proof_verification_hours?: number | null
          avg_transaction_amount?: number | null
          commission_from_givers?: number | null
          commission_from_receivers?: number | null
          date: string
          escrow_created?: number | null
          escrow_disputed?: number | null
          escrow_refunded?: number | null
          escrow_released?: number | null
          failed_transactions?: number | null
          id?: string
          successful_transactions?: number | null
          total_commission?: number | null
          total_gmv?: number | null
          total_gmv_eur?: number | null
          total_gmv_try?: number | null
          total_gmv_usd?: number | null
          total_transactions?: number | null
          updated_at?: string | null
          vip_gmv?: number | null
          vip_transactions?: number | null
        }
        Update: {
          avg_commission_rate?: number | null
          avg_escrow_release_hours?: number | null
          avg_proof_verification_hours?: number | null
          avg_transaction_amount?: number | null
          commission_from_givers?: number | null
          commission_from_receivers?: number | null
          date?: string
          escrow_created?: number | null
          escrow_disputed?: number | null
          escrow_refunded?: number | null
          escrow_released?: number | null
          failed_transactions?: number | null
          id?: string
          successful_transactions?: number | null
          total_commission?: number | null
          total_gmv?: number | null
          total_gmv_eur?: number | null
          total_gmv_try?: number | null
          total_gmv_usd?: number | null
          total_transactions?: number | null
          updated_at?: string | null
          vip_gmv?: number | null
          vip_transactions?: number | null
        }
        Relationships: []
      }
      payment_disputes: {
        Row: {
          commission_ledger_id: string | null
          created_at: string | null
          description: string
          escrow_id: string | null
          evidence_urls: string[] | null
          gift_id: string | null
          giver_id: string
          id: string
          moment_id: string | null
          opened_by: string
          proof_id: string | null
          reason: Database["public"]["Enums"]["dispute_reason"]
          receiver_id: string
          refund_amount: number | null
          resolution_notes: string | null
          resolution_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          response_at: string | null
          response_deadline: string | null
          response_evidence_urls: string[] | null
          response_text: string | null
          review_deadline: string | null
          status: Database["public"]["Enums"]["dispute_status"]
          updated_at: string | null
        }
        Insert: {
          commission_ledger_id?: string | null
          created_at?: string | null
          description: string
          escrow_id?: string | null
          evidence_urls?: string[] | null
          gift_id?: string | null
          giver_id: string
          id?: string
          moment_id?: string | null
          opened_by: string
          proof_id?: string | null
          reason: Database["public"]["Enums"]["dispute_reason"]
          receiver_id: string
          refund_amount?: number | null
          resolution_notes?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          response_at?: string | null
          response_deadline?: string | null
          response_evidence_urls?: string[] | null
          response_text?: string | null
          review_deadline?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string | null
        }
        Update: {
          commission_ledger_id?: string | null
          created_at?: string | null
          description?: string
          escrow_id?: string | null
          evidence_urls?: string[] | null
          gift_id?: string | null
          giver_id?: string
          id?: string
          moment_id?: string | null
          opened_by?: string
          proof_id?: string | null
          reason?: Database["public"]["Enums"]["dispute_reason"]
          receiver_id?: string
          refund_amount?: number | null
          resolution_notes?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          response_at?: string | null
          response_deadline?: string | null
          response_evidence_urls?: string[] | null
          response_text?: string | null
          review_deadline?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_disputes_commission_ledger_id_fkey"
            columns: ["commission_ledger_id"]
            isOneToOne: false
            referencedRelation: "commission_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_disputes_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "escrow_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_disputes_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_disputes_giver_id_fkey"
            columns: ["giver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_disputes_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_disputes_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_disputes_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_limits: {
        Row: {
          applies_to: string
          created_at: string | null
          currency: string
          id: string
          is_active: boolean | null
          limit_type: string
          max_amount: number
          min_amount: number | null
          updated_at: string | null
        }
        Insert: {
          applies_to?: string
          created_at?: string | null
          currency?: string
          id?: string
          is_active?: boolean | null
          limit_type: string
          max_amount: number
          min_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          applies_to?: string
          created_at?: string | null
          currency?: string
          id?: string
          is_active?: boolean | null
          limit_type?: string
          max_amount?: number
          min_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          card_id: string | null
          commission_amount: number | null
          completed_at: string | null
          created_at: string | null
          currency: string
          device_fingerprint: string | null
          error_code: string | null
          error_message: string | null
          gift_id: string | null
          id: string
          ip_address: unknown
          masked_pan: string | null
          net_amount: number | null
          payment_method: string | null
          provider: string
          provider_order_id: string | null
          provider_transaction_id: string
          status: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          amount: number
          card_id?: string | null
          commission_amount?: number | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          device_fingerprint?: string | null
          error_code?: string | null
          error_message?: string | null
          gift_id?: string | null
          id?: string
          ip_address?: unknown
          masked_pan?: string | null
          net_amount?: number | null
          payment_method?: string | null
          provider?: string
          provider_order_id?: string | null
          provider_transaction_id: string
          status?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          card_id?: string | null
          commission_amount?: number | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          device_fingerprint?: string | null
          error_code?: string | null
          error_message?: string | null
          gift_id?: string | null
          id?: string
          ip_address?: unknown
          masked_pan?: string | null
          net_amount?: number | null
          payment_method?: string | null
          provider?: string
          provider_order_id?: string | null
          provider_transaction_id?: string
          status?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "saved_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          amount: number
          bank_details: Json | null
          created_at: string | null
          currency: string | null
          failure_reason: string | null
          id: string
          metadata: Json | null
          notes: string | null
          payout_method: string
          processed_at: string | null
          processed_by: string | null
          status: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          bank_details?: Json | null
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          payout_method?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          bank_details?: Json | null
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          payout_method?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      price_predictions_cache: {
        Row: {
          cache_key: string
          category: string
          confidence: number
          created_at: string | null
          expires_at: string
          factors: Json | null
          id: string
          location: string
          max_price: number
          min_price: number
          predicted_price: number
        }
        Insert: {
          cache_key: string
          category: string
          confidence: number
          created_at?: string | null
          expires_at: string
          factors?: Json | null
          id?: string
          location: string
          max_price: number
          min_price: number
          predicted_price: number
        }
        Update: {
          cache_key?: string
          category?: string
          confidence?: number
          created_at?: string | null
          expires_at?: string
          factors?: Json | null
          id?: string
          location?: string
          max_price?: number
          min_price?: number
          predicted_price?: number
        }
        Relationships: []
      }
      processed_webhook_events: {
        Row: {
          event_id: string
          event_type: string
          id: string
          metadata: Json | null
          processed_at: string | null
        }
        Insert: {
          event_id: string
          event_type: string
          id?: string
          metadata?: Json | null
          processed_at?: string | null
        }
        Update: {
          event_id?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          processed_at?: string | null
        }
        Relationships: []
      }
      promo_code_usage: {
        Row: {
          discount_amount: number
          id: string
          order_id: string | null
          promo_code_id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          discount_amount: number
          id?: string
          order_id?: string | null
          promo_code_id: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          discount_amount?: number
          id?: string
          order_id?: string | null
          promo_code_id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_usage_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          applicable_to: Json | null
          campaign_id: string | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_order_amount: number | null
          per_user_limit: number | null
          updated_at: string | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_to?: Json | null
          campaign_id?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          per_user_limit?: number | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_to?: Json | null
          campaign_id?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_order_amount?: number | null
          per_user_limit?: number | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_quality_scores: {
        Row: {
          approved: boolean | null
          created_at: string | null
          id: string
          image_url: string
          proof_type: string
          review_notes: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          score: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          id?: string
          image_url: string
          proof_type: string
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          id?: string
          image_url?: string
          proof_type?: string
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      proof_requirement_tiers: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_tr: string | null
          id: string
          is_active: boolean | null
          max_amount: number | null
          min_amount: number
          name: string
          requirement: Database["public"]["Enums"]["proof_requirement_type"]
          transfer_delay_hours: number | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_tr?: string | null
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          min_amount: number
          name: string
          requirement: Database["public"]["Enums"]["proof_requirement_type"]
          transfer_delay_hours?: number | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_tr?: string | null
          id?: string
          is_active?: boolean | null
          max_amount?: number | null
          min_amount?: number
          name?: string
          requirement?: Database["public"]["Enums"]["proof_requirement_type"]
          transfer_delay_hours?: number | null
        }
        Relationships: []
      }
      proof_submissions: {
        Row: {
          description: string | null
          gift_id: string
          id: string
          location_accuracy_meters: number | null
          photo_urls: Json
          rejection_reason: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          status: string
          submitted_at: string
          submitted_location: unknown
          submitter_id: string
          video_url: string | null
        }
        Insert: {
          description?: string | null
          gift_id: string
          id?: string
          location_accuracy_meters?: number | null
          photo_urls?: Json
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          submitted_at?: string
          submitted_location?: unknown
          submitter_id: string
          video_url?: string | null
        }
        Update: {
          description?: string | null
          gift_id?: string
          id?: string
          location_accuracy_meters?: number | null
          photo_urls?: Json
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          status?: string
          submitted_at?: string
          submitted_location?: unknown
          submitter_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proof_submissions_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_submissions_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_submissions_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_verifications: {
        Row: {
          ai_model: string
          ai_reasoning: string | null
          ai_verified: boolean
          claimed_date: string | null
          claimed_location: string
          confidence_score: number
          created_at: string
          detected_location: string | null
          id: string
          moment_id: string
          red_flags: Json | null
          status: string
          updated_at: string
          user_id: string
          video_url: string
        }
        Insert: {
          ai_model?: string
          ai_reasoning?: string | null
          ai_verified: boolean
          claimed_date?: string | null
          claimed_location: string
          confidence_score: number
          created_at?: string
          detected_location?: string | null
          id?: string
          moment_id: string
          red_flags?: Json | null
          status: string
          updated_at?: string
          user_id: string
          video_url: string
        }
        Update: {
          ai_model?: string
          ai_reasoning?: string | null
          ai_verified?: boolean
          claimed_date?: string | null
          claimed_location?: string
          confidence_score?: number
          created_at?: string
          detected_location?: string | null
          id?: string
          moment_id?: string
          red_flags?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "proof_verifications_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      proofs: {
        Row: {
          ai_analysis: Json | null
          ai_confidence: number | null
          created_at: string | null
          description: string | null
          escrow_id: string | null
          gift_id: string | null
          id: string
          location_accuracy: number | null
          location_lat: number | null
          location_lng: number | null
          location_verified: boolean | null
          media_urls: string[]
          moment_id: string | null
          status: string
          updated_at: string | null
          user_id: string
          verification_method: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          ai_confidence?: number | null
          created_at?: string | null
          description?: string | null
          escrow_id?: string | null
          gift_id?: string | null
          id?: string
          location_accuracy?: number | null
          location_lat?: number | null
          location_lng?: number | null
          location_verified?: boolean | null
          media_urls?: string[]
          moment_id?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          verification_method?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          ai_confidence?: number | null
          created_at?: string | null
          description?: string | null
          escrow_id?: string | null
          gift_id?: string | null
          id?: string
          location_accuracy?: number | null
          location_lat?: number | null
          location_lng?: number | null
          location_verified?: boolean | null
          media_urls?: string[]
          moment_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          verification_method?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proofs_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "escrow_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proofs_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proofs_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proofs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_config: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          is_active: boolean | null
          max_requests: number
          penalty_seconds: number | null
          updated_at: string | null
          window_seconds: number
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          is_active?: boolean | null
          max_requests?: number
          penalty_seconds?: number | null
          updated_at?: string | null
          window_seconds?: number
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          is_active?: boolean | null
          max_requests?: number
          penalty_seconds?: number | null
          updated_at?: string | null
          window_seconds?: number
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          identifier: string
          request_count: number | null
          updated_at: string | null
          window_start: string
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          identifier: string
          request_count?: number | null
          updated_at?: string | null
          window_start?: string
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number | null
          updated_at?: string | null
          window_start?: string
        }
        Relationships: []
      }
      recommendation_feedback: {
        Row: {
          action: string
          context: Json | null
          created_at: string | null
          id: string
          moment_id: string | null
          position: number | null
          recommendation_type: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          context?: Json | null
          created_at?: string | null
          id?: string
          moment_id?: string | null
          position?: number | null
          recommendation_type: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          context?: Json | null
          created_at?: string | null
          id?: string
          moment_id?: string | null
          position?: number | null
          recommendation_type?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_feedback_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
        ]
      }
      report_actions: {
        Row: {
          action_by: string | null
          action_type: string
          created_at: string | null
          id: string
          notes: string | null
          report_id: string
        }
        Insert: {
          action_by?: string | null
          action_type: string
          created_at?: string | null
          id?: string
          notes?: string | null
          report_id: string
        }
        Update: {
          action_by?: string | null
          action_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_actions_action_by_fkey"
            columns: ["action_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_actions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string | null
          id: string
          priority: string | null
          reason: string
          reported_id: string | null
          reported_moment_id: string | null
          reported_user_id: string | null
          reporter_id: string
          resolved_at: string | null
          status: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          reason: string
          reported_id?: string | null
          reported_moment_id?: string | null
          reported_user_id?: string | null
          reporter_id: string
          resolved_at?: string | null
          status?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          reason?: string
          reported_id?: string | null
          reported_moment_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string
          resolved_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_moment_id_fkey"
            columns: ["reported_moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          created_at: string | null
          host_id: string | null
          id: string
          message: string | null
          moment_id: string
          responded_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          host_id?: string | null
          id?: string
          message?: string | null
          moment_id: string
          responded_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          host_id?: string | null
          id?: string
          message?: string | null
          moment_id?: string
          responded_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          moment_id: string
          rating: number
          reviewed_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          moment_id: string
          rating: number
          reviewed_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          moment_id?: string
          rating?: number
          reviewed_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          action: string
          created_at: string | null
          id: string
          resource: string
          role: Database["public"]["Enums"]["admin_role"]
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          resource: string
          role: Database["public"]["Enums"]["admin_role"]
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          resource?: string
          role?: Database["public"]["Enums"]["admin_role"]
        }
        Relationships: []
      }
      saved_cards: {
        Row: {
          card_bank: string | null
          card_brand: string
          card_family: string | null
          card_holder_name: string
          card_last_four: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_default: boolean | null
          is_verified: boolean | null
          last_used_at: string | null
          paytr_ctoken: string
          paytr_utoken: string
          require_cvv: boolean | null
          use_count: number | null
          user_id: string
        }
        Insert: {
          card_bank?: string | null
          card_brand: string
          card_family?: string | null
          card_holder_name: string
          card_last_four: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          last_used_at?: string | null
          paytr_ctoken: string
          paytr_utoken: string
          require_cvv?: boolean | null
          use_count?: number | null
          user_id: string
        }
        Update: {
          card_bank?: string | null
          card_brand?: string
          card_family?: string | null
          card_holder_name?: string
          card_last_four?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_default?: boolean | null
          is_verified?: boolean | null
          last_used_at?: string | null
          paytr_ctoken?: string
          paytr_utoken?: string
          require_cvv?: boolean | null
          use_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_cards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      security_logs: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          event_details: Json | null
          event_status: string
          event_type: string
          geo_city: string | null
          geo_country: string | null
          id: string
          ip_address: unknown
          risk_factors: string[] | null
          risk_score: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          event_details?: Json | null
          event_status: string
          event_type: string
          geo_city?: string | null
          geo_country?: string | null
          id?: string
          ip_address?: unknown
          risk_factors?: string[] | null
          risk_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          event_details?: Json | null
          event_status?: string
          event_type?: string
          geo_city?: string | null
          geo_country?: string | null
          id?: string
          ip_address?: unknown
          risk_factors?: string[] | null
          risk_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sensitive_data_access_log: {
        Row: {
          action: string
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sensitive_data_access_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_performance_log: {
        Row: {
          created_at: string
          id: string
          keyword: string | null
          metadata: Json | null
          metric_type: string
          source: string | null
          value: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          keyword?: string | null
          metadata?: Json | null
          metric_type: string
          source?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          keyword?: string | null
          metadata?: Json | null
          metric_type?: string
          source?: string | null
          value?: number | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          image_url: string
          is_active: boolean
          moment_id: string | null
          user_id: string
          video_url: string | null
          view_count: number
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          moment_id?: string | null
          user_id: string
          video_url?: string | null
          view_count?: number
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          moment_id?: string | null
          user_id?: string
          video_url?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "stories_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          story_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          color: string | null
          created_at: string | null
          features: Json | null
          icon: string | null
          id: string
          interval: string | null
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          features?: Json | null
          icon?: string | null
          id: string
          interval?: string | null
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          features?: Json | null
          icon?: string | null
          id?: string
          interval?: string | null
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      suspicious_activity_reports: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          currency: string | null
          id: string
          investigation_notes: string | null
          reference_number: string | null
          report_number: string | null
          report_type: string
          reported_at: string | null
          reported_to: string | null
          resolved_at: string | null
          risk_score: number | null
          status: string | null
          total_amount: number | null
          transaction_ids: string[] | null
          triggered_rules: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          investigation_notes?: string | null
          reference_number?: string | null
          report_number?: string | null
          report_type: string
          reported_at?: string | null
          reported_to?: string | null
          resolved_at?: string | null
          risk_score?: number | null
          status?: string | null
          total_amount?: number | null
          transaction_ids?: string[] | null
          triggered_rules?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          investigation_notes?: string | null
          reference_number?: string | null
          report_number?: string | null
          report_type?: string
          reported_at?: string | null
          reported_to?: string | null
          resolved_at?: string | null
          risk_score?: number | null
          status?: string | null
          total_amount?: number | null
          transaction_ids?: string[] | null
          triggered_rules?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suspicious_activity_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_roles: Database["public"]["Enums"]["admin_role"][] | null
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["task_priority"]
          resource_id: string
          resource_type: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          assigned_roles?: Database["public"]["Enums"]["admin_role"][] | null
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["task_priority"]
          resource_id: string
          resource_type: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          assigned_roles?: Database["public"]["Enums"]["admin_role"][] | null
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["task_priority"]
          resource_id?: string
          resource_type?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      totp_usage_log: {
        Row: {
          code_hash: string
          created_at: string
          id: string
          ip_address: unknown
          used_at: string
          user_agent: string | null
          user_id: string
          window_end: string
          window_start: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          id?: string
          ip_address?: unknown
          used_at?: string
          user_agent?: string | null
          user_id: string
          window_end: string
          window_start: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          used_at?: string
          user_agent?: string | null
          user_id?: string
          window_end?: string
          window_start?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          moment_id: string | null
          recipient_id: string | null
          sender_id: string | null
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          moment_id?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          moment_id?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trust_notes: {
        Row: {
          author_id: string
          created_at: string | null
          escrow_id: string | null
          flagged_reason: string | null
          gift_id: string | null
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          is_flagged: boolean | null
          is_public: boolean | null
          moderated_at: string | null
          moderated_by: string | null
          moment_id: string | null
          note: string
          recipient_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          created_at?: string | null
          escrow_id?: string | null
          flagged_reason?: string | null
          gift_id?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_flagged?: boolean | null
          is_public?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moment_id?: string | null
          note: string
          recipient_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          created_at?: string | null
          escrow_id?: string | null
          flagged_reason?: string | null
          gift_id?: string | null
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_flagged?: boolean | null
          is_public?: boolean | null
          moderated_at?: string | null
          moderated_by?: string | null
          moment_id?: string | null
          note?: string
          recipient_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trust_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_notes_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "escrow_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_notes_gift_id_fkey"
            columns: ["gift_id"]
            isOneToOne: false
            referencedRelation: "gifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_notes_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_notes_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_notes_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_images: {
        Row: {
          blur_hash: string | null
          created_at: string | null
          filename: string
          id: string
          metadata: Json | null
          type: string
          updated_at: string | null
          uploaded_at: string
          url: string
          user_id: string
          variants: string[]
        }
        Insert: {
          blur_hash?: string | null
          created_at?: string | null
          filename: string
          id: string
          metadata?: Json | null
          type?: string
          updated_at?: string | null
          uploaded_at: string
          url: string
          user_id: string
          variants: string[]
        }
        Update: {
          blur_hash?: string | null
          created_at?: string | null
          filename?: string
          id?: string
          metadata?: Json | null
          type?: string
          updated_at?: string | null
          uploaded_at?: string
          url?: string
          user_id?: string
          variants?: string[]
        }
        Relationships: []
      }
      used_2fa_codes: {
        Row: {
          code_hash: string
          created_at: string
          expires_at: string
          id: string
          used_at: string
          user_id: string
        }
        Insert: {
          code_hash: string
          created_at?: string
          expires_at: string
          id?: string
          used_at?: string
          user_id: string
        }
        Update: {
          code_hash?: string
          created_at?: string
          expires_at?: string
          id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          metadata: Json | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          metadata?: Json | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          metadata?: Json | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          context: Json | null
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          context?: Json | null
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          context?: Json | null
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bank_accounts: {
        Row: {
          account_holder_name: string
          bank_name: string | null
          created_at: string | null
          iban: string
          iban_hash: string
          id: string
          is_active: boolean | null
          is_default: boolean | null
          is_verified: boolean | null
          updated_at: string | null
          user_id: string
          verification_method: string | null
          verified_at: string | null
        }
        Insert: {
          account_holder_name: string
          bank_name?: string | null
          created_at?: string | null
          iban: string
          iban_hash: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_verified?: boolean | null
          updated_at?: string | null
          user_id: string
          verification_method?: string | null
          verified_at?: string | null
        }
        Update: {
          account_holder_name?: string
          bank_name?: string | null
          created_at?: string | null
          iban?: string
          iban_hash?: string
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_verified?: boolean | null
          updated_at?: string | null
          user_id?: string
          verification_method?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_bank_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_commission_settings: {
        Row: {
          account_type: Database["public"]["Enums"]["user_account_type"]
          created_at: string | null
          created_by: string | null
          custom_giver_share: number | null
          custom_rate_enabled: boolean | null
          custom_receiver_share: number | null
          custom_total_rate: number | null
          escrow_hours: number | null
          fast_release_enabled: boolean | null
          follower_count: number | null
          id: string
          metadata: Json | null
          notes: string | null
          social_handle: string | null
          social_platform: string | null
          updated_at: string | null
          updated_by: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
          vip_expires_at: string | null
          vip_reason: string | null
          vip_since: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["user_account_type"]
          created_at?: string | null
          created_by?: string | null
          custom_giver_share?: number | null
          custom_rate_enabled?: boolean | null
          custom_receiver_share?: number | null
          custom_total_rate?: number | null
          escrow_hours?: number | null
          fast_release_enabled?: boolean | null
          follower_count?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          social_handle?: string | null
          social_platform?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
          vip_expires_at?: string | null
          vip_reason?: string | null
          vip_since?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["user_account_type"]
          created_at?: string | null
          created_by?: string | null
          custom_giver_share?: number | null
          custom_rate_enabled?: boolean | null
          custom_receiver_share?: number | null
          custom_total_rate?: number | null
          escrow_hours?: number | null
          fast_release_enabled?: boolean | null
          follower_count?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          social_handle?: string | null
          social_platform?: string | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
          vip_expires_at?: string | null
          vip_reason?: string | null
          vip_since?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_commission_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_consents: {
        Row: {
          commercial_email_allowed: boolean | null
          commercial_email_allowed_at: string | null
          commercial_push_allowed: boolean | null
          commercial_push_allowed_at: string | null
          commercial_sms_allowed: boolean | null
          commercial_sms_allowed_at: string | null
          consent_device_id: string | null
          consent_ip_address: unknown
          consent_user_agent: string | null
          cookie_analytics: boolean | null
          cookie_essential: boolean | null
          cookie_marketing: boolean | null
          cookie_preferences_set_at: string | null
          created_at: string | null
          id: string
          kvkk_acik_riza_accepted: boolean | null
          kvkk_acik_riza_accepted_at: string | null
          kvkk_acik_riza_version: string | null
          kvkk_aydinlatma_accepted: boolean | null
          kvkk_aydinlatma_accepted_at: string | null
          kvkk_aydinlatma_version: string | null
          privacy_policy_accepted: boolean | null
          privacy_policy_accepted_at: string | null
          privacy_policy_version: string | null
          terms_of_service_accepted: boolean | null
          terms_of_service_accepted_at: string | null
          terms_of_service_version: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          commercial_email_allowed?: boolean | null
          commercial_email_allowed_at?: string | null
          commercial_push_allowed?: boolean | null
          commercial_push_allowed_at?: string | null
          commercial_sms_allowed?: boolean | null
          commercial_sms_allowed_at?: string | null
          consent_device_id?: string | null
          consent_ip_address?: unknown
          consent_user_agent?: string | null
          cookie_analytics?: boolean | null
          cookie_essential?: boolean | null
          cookie_marketing?: boolean | null
          cookie_preferences_set_at?: string | null
          created_at?: string | null
          id?: string
          kvkk_acik_riza_accepted?: boolean | null
          kvkk_acik_riza_accepted_at?: string | null
          kvkk_acik_riza_version?: string | null
          kvkk_aydinlatma_accepted?: boolean | null
          kvkk_aydinlatma_accepted_at?: string | null
          kvkk_aydinlatma_version?: string | null
          privacy_policy_accepted?: boolean | null
          privacy_policy_accepted_at?: string | null
          privacy_policy_version?: string | null
          terms_of_service_accepted?: boolean | null
          terms_of_service_accepted_at?: string | null
          terms_of_service_version?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          commercial_email_allowed?: boolean | null
          commercial_email_allowed_at?: string | null
          commercial_push_allowed?: boolean | null
          commercial_push_allowed_at?: string | null
          commercial_sms_allowed?: boolean | null
          commercial_sms_allowed_at?: string | null
          consent_device_id?: string | null
          consent_ip_address?: unknown
          consent_user_agent?: string | null
          cookie_analytics?: boolean | null
          cookie_essential?: boolean | null
          cookie_marketing?: boolean | null
          cookie_preferences_set_at?: string | null
          created_at?: string | null
          id?: string
          kvkk_acik_riza_accepted?: boolean | null
          kvkk_acik_riza_accepted_at?: string | null
          kvkk_acik_riza_version?: string | null
          kvkk_aydinlatma_accepted?: boolean | null
          kvkk_aydinlatma_accepted_at?: string | null
          kvkk_aydinlatma_version?: string | null
          privacy_policy_accepted?: boolean | null
          privacy_policy_accepted_at?: string | null
          privacy_policy_version?: string | null
          terms_of_service_accepted?: boolean | null
          terms_of_service_accepted_at?: string | null
          terms_of_service_version?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_limits: {
        Row: {
          category: string
          created_at: string | null
          currency: string
          id: string
          is_active: boolean | null
          limit_period: string
          max_amount: number | null
          max_count: number | null
          min_amount: number | null
          plan_id: string | null
          requires_kyc_above: number | null
          user_type: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          currency?: string
          id?: string
          is_active?: boolean | null
          limit_period: string
          max_amount?: number | null
          max_count?: number | null
          min_amount?: number | null
          plan_id?: string | null
          requires_kyc_above?: number | null
          user_type?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          currency?: string
          id?: string
          is_active?: boolean | null
          limit_period?: string
          max_amount?: number | null
          max_count?: number | null
          min_amount?: number | null
          plan_id?: string | null
          requires_kyc_above?: number | null
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_limits_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_moderation_warnings: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          created_at: string | null
          details: string | null
          expires_at: string | null
          id: string
          user_id: string
          warning_level: number
          warning_type: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          created_at?: string | null
          details?: string | null
          expires_at?: string | null
          id?: string
          user_id: string
          warning_level?: number
          warning_type: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          created_at?: string | null
          details?: string | null
          expires_at?: string | null
          id?: string
          user_id?: string
          warning_level?: number
          warning_type?: string
        }
        Relationships: []
      }
      user_payment_stats: {
        Row: {
          avg_gift_amount: number | null
          avg_proof_time_hours: number | null
          avg_receive_amount: number | null
          dispute_win_rate: number | null
          disputed_transactions: number | null
          fast_release_count: number | null
          last_gift_at: string | null
          last_receive_at: string | null
          successful_proofs: number | null
          total_amount_gifted: number | null
          total_amount_received: number | null
          total_commission_deducted: number | null
          total_commission_paid: number | null
          total_gifts_given: number | null
          total_gifts_received: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avg_gift_amount?: number | null
          avg_proof_time_hours?: number | null
          avg_receive_amount?: number | null
          dispute_win_rate?: number | null
          disputed_transactions?: number | null
          fast_release_count?: number | null
          last_gift_at?: string | null
          last_receive_at?: string | null
          successful_proofs?: number | null
          total_amount_gifted?: number | null
          total_amount_received?: number | null
          total_commission_deducted?: number | null
          total_commission_paid?: number | null
          total_gifts_given?: number | null
          total_gifts_received?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avg_gift_amount?: number | null
          avg_proof_time_hours?: number | null
          avg_receive_amount?: number | null
          dispute_win_rate?: number | null
          disputed_transactions?: number | null
          fast_release_count?: number | null
          last_gift_at?: string | null
          last_receive_at?: string | null
          successful_proofs?: number | null
          total_amount_gifted?: number | null
          total_amount_received?: number | null
          total_commission_deducted?: number | null
          total_commission_paid?: number | null
          total_gifts_given?: number | null
          total_gifts_received?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_payment_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preference_vectors: {
        Row: {
          category_preferences: Json | null
          feature_preferences: Json | null
          interaction_history: Json | null
          last_updated: string | null
          location_preferences: Json | null
          price_range: Json | null
          user_id: string
        }
        Insert: {
          category_preferences?: Json | null
          feature_preferences?: Json | null
          interaction_history?: Json | null
          last_updated?: string | null
          location_preferences?: Json | null
          price_range?: Json | null
          user_id: string
        }
        Update: {
          category_preferences?: Json | null
          feature_preferences?: Json | null
          interaction_history?: Json | null
          last_updated?: string | null
          location_preferences?: Json | null
          price_range?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_risk_profiles: {
        Row: {
          block_reason: string | null
          blocked_at: string | null
          created_at: string | null
          flagged_transactions: number | null
          flags: Json | null
          id: string
          is_blocked: boolean | null
          last_reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string | null
          risk_score: number | null
          total_received: number | null
          total_sent: number | null
          total_transactions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          block_reason?: string | null
          blocked_at?: string | null
          created_at?: string | null
          flagged_transactions?: number | null
          flags?: Json | null
          id?: string
          is_blocked?: boolean | null
          last_reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          risk_score?: number | null
          total_received?: number | null
          total_sent?: number | null
          total_transactions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          block_reason?: string | null
          blocked_at?: string | null
          created_at?: string | null
          flagged_transactions?: number | null
          flags?: Json | null
          id?: string
          is_blocked?: boolean | null
          last_reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          risk_score?: number | null
          total_received?: number | null
          total_sent?: number | null
          total_transactions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_risk_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          provider: string | null
          provider_subscription_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          provider?: string | null
          provider_subscription_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          acquisition_source: string | null
          analytics_consent: boolean | null
          avatar_url: string | null
          balance: number | null
          ban_reason: string | null
          banned_at: string | null
          banned_by: string | null
          bio: string | null
          city: string | null
          coordinates: unknown
          created_at: string | null
          currency: string | null
          date_of_birth: string | null
          deleted_at: string | null
          distance_preference: number | null
          email: string
          full_name: string
          gdpr_consent_at: string | null
          gender: string | null
          id: string
          interests: string[] | null
          is_banned: boolean | null
          is_discoverable: boolean | null
          is_suspended: boolean | null
          kyc_scan_ref: string | null
          kyc_status: string | null
          languages: string[] | null
          last_seen_at: string | null
          locale: string | null
          location: string | null
          marketing_consent: boolean | null
          notification_preferences: Json | null
          phone: string | null
          phone_hash: string | null
          phone_masked: string | null
          phone_verified: boolean | null
          phone_verified_at: string | null
          preferred_currency: string | null
          privacy_policy_version: string | null
          privacy_settings: Json | null
          push_token: string | null
          rating: number | null
          reinstated_at: string | null
          review_count: number | null
          status: string | null
          stripe_customer_id: string | null
          suspended_at: string | null
          suspended_by: string | null
          suspension_ends_at: string | null
          suspension_reason: string | null
          tc_hash: string | null
          tc_verified: boolean | null
          tc_verified_at: string | null
          terms_accepted_at: string | null
          trust_note_count: number | null
          trust_score: number | null
          updated_at: string | null
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          acquisition_source?: string | null
          analytics_consent?: boolean | null
          avatar_url?: string | null
          balance?: number | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          bio?: string | null
          city?: string | null
          coordinates?: unknown
          created_at?: string | null
          currency?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          distance_preference?: number | null
          email: string
          full_name: string
          gdpr_consent_at?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          is_banned?: boolean | null
          is_discoverable?: boolean | null
          is_suspended?: boolean | null
          kyc_scan_ref?: string | null
          kyc_status?: string | null
          languages?: string[] | null
          last_seen_at?: string | null
          locale?: string | null
          location?: string | null
          marketing_consent?: boolean | null
          notification_preferences?: Json | null
          phone?: string | null
          phone_hash?: string | null
          phone_masked?: string | null
          phone_verified?: boolean | null
          phone_verified_at?: string | null
          preferred_currency?: string | null
          privacy_policy_version?: string | null
          privacy_settings?: Json | null
          push_token?: string | null
          rating?: number | null
          reinstated_at?: string | null
          review_count?: number | null
          status?: string | null
          stripe_customer_id?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_ends_at?: string | null
          suspension_reason?: string | null
          tc_hash?: string | null
          tc_verified?: boolean | null
          tc_verified_at?: string | null
          terms_accepted_at?: string | null
          trust_note_count?: number | null
          trust_score?: number | null
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          acquisition_source?: string | null
          analytics_consent?: boolean | null
          avatar_url?: string | null
          balance?: number | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          bio?: string | null
          city?: string | null
          coordinates?: unknown
          created_at?: string | null
          currency?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          distance_preference?: number | null
          email?: string
          full_name?: string
          gdpr_consent_at?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          is_banned?: boolean | null
          is_discoverable?: boolean | null
          is_suspended?: boolean | null
          kyc_scan_ref?: string | null
          kyc_status?: string | null
          languages?: string[] | null
          last_seen_at?: string | null
          locale?: string | null
          location?: string | null
          marketing_consent?: boolean | null
          notification_preferences?: Json | null
          phone?: string | null
          phone_hash?: string | null
          phone_masked?: string | null
          phone_verified?: boolean | null
          phone_verified_at?: string | null
          preferred_currency?: string | null
          privacy_policy_version?: string | null
          privacy_settings?: Json | null
          push_token?: string | null
          rating?: number | null
          reinstated_at?: string | null
          review_count?: number | null
          status?: string | null
          stripe_customer_id?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_ends_at?: string | null
          suspension_reason?: string | null
          tc_hash?: string | null
          tc_verified?: boolean | null
          tc_verified_at?: string | null
          terms_accepted_at?: string | null
          trust_note_count?: number | null
          trust_score?: number | null
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_preferred_currency_fkey"
            columns: ["preferred_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      vip_users: {
        Row: {
          benefits: Json | null
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          reason: string | null
          tier: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          benefits?: Json | null
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          reason?: string | null
          tier?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          benefits?: Json | null
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          reason?: string | null
          tier?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vip_users_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vip_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          type?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          amount: number
          bank_account_id: string | null
          completed_at: string | null
          created_at: string | null
          currency: string
          iban_masked: string
          id: string
          processed_at: string | null
          provider: string | null
          provider_transfer_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          iban_masked: string
          id?: string
          processed_at?: string | null
          provider?: string | null
          provider_transfer_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          currency?: string
          iban_masked?: string
          id?: string
          processed_at?: string | null
          provider?: string | null
          provider_transfer_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "user_bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "withdrawal_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      deep_link_attribution: {
        Row: {
          campaign: string | null
          clicks: number | null
          conversion_rate: number | null
          conversions: number | null
          date: string | null
          medium: string | null
          source: string | null
          unique_users: number | null
        }
        Relationships: []
      }
      deep_link_conversion_funnel: {
        Row: {
          avg_time_to_complete: number | null
          avg_time_to_land: number | null
          campaign: string | null
          conversion_rate: number | null
          converted: number | null
          landed: number | null
          source: string | null
          total_clicks: number | null
          type: string | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      proof_quality_stats: {
        Row: {
          auto_approval_rate: number | null
          auto_approved: number | null
          avg_score: number | null
          date: string | null
          needs_review: number | null
          proof_type: string | null
          total_submissions: number | null
        }
        Relationships: []
      }
      v_exchange_rate_status: {
        Row: {
          age_minutes: number | null
          base_currency: string | null
          freshness: string | null
          rate: number | null
          rate_timestamp: string | null
          target_currency: string | null
        }
        Insert: {
          age_minutes?: never
          base_currency?: string | null
          freshness?: never
          rate?: number | null
          rate_timestamp?: string | null
          target_currency?: string | null
        }
        Update: {
          age_minutes?: never
          base_currency?: string | null
          freshness?: never
          rate?: number | null
          rate_timestamp?: string | null
          target_currency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exchange_rates_base_currency_fkey"
            columns: ["base_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "exchange_rates_target_currency_fkey"
            columns: ["target_currency"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["code"]
          },
        ]
      }
      v_payment_summary: {
        Row: {
          escrow_type: string | null
          giver_pays: string | null
          max_contributors: number | null
          max_usd: number | null
          min_usd: number | null
          receiver_pays: string | null
          tier: string | null
          total_commission: string | null
          try_buffer_percent: number | null
        }
        Relationships: []
      }
      v_user_conversations: {
        Row: {
          conversation_id: string | null
          conversation_updated_at: string | null
          is_archived: boolean | null
          last_message_id: string | null
          last_read_at: string | null
          moment_id: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_last_message"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      admin_ban_user: {
        Args: { p_admin_id?: string; p_reason?: string; p_user_id: string }
        Returns: boolean
      }
      admin_moderate_moment: {
        Args: {
          p_admin_id?: string
          p_moment_id: string
          p_notes?: string
          p_status: string
        }
        Returns: boolean
      }
      admin_remove_user_vip: {
        Args: { p_admin_id: string; p_reason?: string; p_user_id: string }
        Returns: Json
      }
      admin_set_user_vip: {
        Args: {
          p_account_type: Database["public"]["Enums"]["user_account_type"]
          p_admin_id: string
          p_expires_at?: string
          p_follower_count?: number
          p_reason: string
          p_social_handle?: string
          p_social_platform?: string
          p_user_id: string
        }
        Returns: Json
      }
      admin_suspend_user: {
        Args: {
          p_admin_id?: string
          p_ends_at?: string
          p_reason?: string
          p_user_id: string
        }
        Returns: boolean
      }
      anonymize_user_data: { Args: { p_user_id: string }; Returns: boolean }
      atomic_transfer: {
        Args: {
          p_amount: number
          p_message?: string
          p_moment_id?: string
          p_recipient_id: string
          p_sender_id: string
        }
        Returns: Json
      }
      auth_user_id: { Args: never; Returns: string }
      auth_user_role: { Args: never; Returns: string }
      auto_refund_expired_escrows: { Args: never; Returns: number }
      auto_release_pending_escrows: { Args: never; Returns: number }
      auto_unsuspend_users: { Args: never; Returns: number }
      calculate_commission: {
        Args: { p_amount: number; p_commission_rate?: number }
        Returns: {
          commission: number
          gross_amount: number
          net_amount: number
          rate: number
        }[]
      }
      calculate_current_vibe: { Args: never; Returns: string }
      calculate_payment_amount: {
        Args: {
          p_amount: number
          p_from_currency: string
          p_to_currency: string
        }
        Returns: {
          converted_amount: number
          exchange_rate: number
          from_currency: string
          original_amount: number
          to_currency: string
        }[]
      }
      calculate_receiver_payout: {
        Args: { p_gift_id: string }
        Returns: {
          base_amount: number
          base_currency: string
          exchange_rate: number
          gift_id: string
          payout_note: string
          receiver_commission: number
          receiver_gets: number
          receiver_gets_try: number
        }[]
      }
      calculate_trust_score: {
        Args: { p_user_id: string }
        Returns: {
          kyc_score: number
          level: string
          level_progress: number
          payment_score: number
          proof_score: number
          social_score: number
          total_score: number
          trust_notes_score: number
        }[]
      }
      calculate_unified_payment: {
        Args: {
          p_amount: number
          p_currency: string
          p_receiver_id: string
          p_sender_id: string
        }
        Returns: {
          base_amount: number
          commission_amount: number
          commission_rate: number
          currency: string
          net_amount: number
        }[]
      }
      can_access_conversation: { Args: { conv_id: string }; Returns: boolean }
      can_view_profile: {
        Args: { p_profile_id: string; p_viewer_id: string }
        Returns: boolean
      }
      check_and_award_badges: { Args: { p_user_id: string }; Returns: number }
      check_moment_creation_limit: {
        Args: { p_user_id: string }
        Returns: Json
      }
      check_rate_limit: {
        Args: { p_endpoint?: string; p_identifier: string }
        Returns: {
          allowed: boolean
          remaining: number
          reset_at: string
          retry_after: number
        }[]
      }
      check_totp_replay: {
        Args: { p_code: string; p_user_id: string }
        Returns: boolean
      }
      check_user_limits: {
        Args: {
          p_amount?: number
          p_category: string
          p_currency?: string
          p_user_id: string
        }
        Returns: Json
      }
      cleanup_expired_2fa_codes: { Args: never; Returns: undefined }
      cleanup_expired_idempotency_keys: { Args: never; Returns: number }
      cleanup_expired_stories: { Args: never; Returns: number }
      cleanup_old_deep_link_events: { Args: never; Returns: number }
      cleanup_old_exchange_rates: { Args: never; Returns: number }
      cleanup_old_feed_delta: { Args: never; Returns: number }
      cleanup_old_ml_analytics: { Args: never; Returns: undefined }
      cleanup_old_moderation_logs: { Args: never; Returns: undefined }
      cleanup_old_payment_records: { Args: never; Returns: undefined }
      cleanup_old_totp_records: { Args: never; Returns: number }
      cleanup_rate_limits: { Args: never; Returns: number }
      convert_currency: {
        Args: {
          p_amount: number
          p_date?: string
          p_from_currency: string
          p_to_currency: string
        }
        Returns: {
          converted_amount: number
          exchange_rate: number
          rate_date: string
        }[]
      }
      convert_to_try_with_buffer: {
        Args: { p_amount: number; p_from_currency: string }
        Returns: {
          buffer_percentage: number
          exchange_rate: number
          is_stale: boolean
          original_amount: number
          original_currency: string
          rate_timestamp: string
          try_amount: number
          try_amount_with_buffer: number
        }[]
      }
      count_old_audit_logs: {
        Args: never
        Returns: {
          older_than_1_year: number
          older_than_2_years: number
          total_count: number
        }[]
      }
      create_escrow_transaction: {
        Args: {
          p_amount: number
          p_moment_id: string
          p_recipient_id: string
          p_release_condition?: string
          p_sender_id: string
        }
        Returns: Json
      }
      create_gift_with_commission: {
        Args: {
          p_amount: number
          p_currency?: string
          p_giver_id: string
          p_moment_id: string
        }
        Returns: Json
      }
      create_gift_with_proof_requirement: {
        Args: {
          p_amount: number
          p_currency?: string
          p_giver_id: string
          p_moment_id: string
          p_proof_deadline_hours?: number
          p_requires_proof?: boolean
        }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_body?: string
          p_data?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      create_trust_note: {
        Args: { p_gift_id: string; p_note: string }
        Returns: string
      }
      current_user_id: { Args: never; Returns: string }
      decrement_user_balance: {
        Args: { amount: number; user_id: string }
        Returns: undefined
      }
      deposit_funds: {
        Args: { amount: number; user_id_param: string }
        Returns: Json
      }
      disablelongtransactions: { Args: never; Returns: string }
      discover_nearby_moments: {
        Args: {
          p_cursor?: string
          p_gender?: string
          p_lat: number
          p_limit?: number
          p_lng: number
          p_max_age?: number
          p_min_age?: number
          p_radius_km?: number
        }
        Returns: {
          created_at: string
          description: string
          distance_km: number
          id: string
          images: string[]
          latitude: number
          longitude: number
          title: string
          user_age: number
          user_avatar: string
          user_gender: string
          user_id: string
          user_name: string
        }[]
      }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      expire_old_moment_offers: { Args: never; Returns: number }
      generate_contract_number: { Args: never; Returns: string }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_active_currencies: {
        Args: never
        Returns: {
          code: string
          name: string
          name_tr: string
          symbol: string
        }[]
      }
      get_admin_analytics_charts: {
        Args: { period_days?: number }
        Returns: Json
      }
      get_conversation_participants: {
        Args: { conv_id: string }
        Returns: {
          avatar_url: string
          full_name: string
          last_read_at: string
          user_id: string
        }[]
      }
      get_detailed_trust_stats: { Args: { p_user_id: string }; Returns: Json }
      get_escrow_duration_hours: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_escrow_tier_for_amount: {
        Args: { p_amount: number; p_currency: string }
        Returns: {
          amount_usd: number
          description_en: string
          description_tr: string
          escrow_type: string
          max_contributors: number
          tier_name: string
        }[]
      }
      get_exchange_rate: {
        Args: {
          p_date?: string
          p_from_currency: string
          p_to_currency: string
        }
        Returns: number
      }
      get_live_exchange_rate: {
        Args: { p_base: string; p_target: string }
        Returns: number
      }
      get_messages_keyset: {
        Args: {
          conversation_id_param: string
          cursor_id?: string
          cursor_timestamp?: string
          page_size?: number
        }
        Returns: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
          status: string
          type: string
        }[]
      }
      get_moment_contributor_count: {
        Args: { p_moment_id: string }
        Returns: number
      }
      get_moment_contributors: { Args: { p_moment_id: string }; Returns: Json }
      get_moment_gifts: {
        Args: { p_moment_id: string }
        Returns: {
          amount: number
          created_at: string
          currency: string
          gift_id: string
          giver_avatar: string
          giver_id: string
          giver_name: string
          status: string
        }[]
      }
      get_moment_payment_info: {
        Args: { p_moment_id: string }
        Returns: {
          currency: string
          gift_count: number
          host_id: string
          moment_id: string
          price: number
          total_gifts: number
        }[]
      }
      get_moment_price_display: {
        Args: { p_moment_id: string }
        Returns: {
          currency: string
          formatted_price: string
          price: number
        }[]
      }
      get_moments_keyset: {
        Args: {
          cursor_id?: string
          cursor_timestamp?: string
          page_size?: number
          status_filter?: string
        }
        Returns: {
          category: string
          created_at: string
          description: string
          host_id: string
          id: string
          image_url: string
          price: number
          status: string
          title: string
        }[]
      }
      get_notifications_keyset: {
        Args: {
          cursor_id?: string
          cursor_timestamp?: string
          page_size?: number
          unread_only?: boolean
          user_id_param: string
        }
        Returns: {
          body: string
          created_at: string
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }[]
      }
      get_or_create_conversation: {
        Args: { p_participant_ids: string[] }
        Returns: {
          archived_at: string | null
          created_at: string | null
          id: string
          last_message_id: string | null
          migrated_to_junction: boolean | null
          moment_id: string | null
          participant_ids: string[]
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "conversations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_proof_requirement: {
        Args: { p_amount: number }
        Returns: {
          description_en: string
          description_tr: string
          is_direct_pay: boolean
          requirement: Database["public"]["Enums"]["proof_requirement_type"]
          tier_name: string
          transfer_delay_hours: number
        }[]
      }
      get_transactions_keyset: {
        Args: {
          cursor_id?: string
          cursor_timestamp?: string
          page_size?: number
          user_id_param: string
        }
        Returns: {
          amount: number
          created_at: string
          currency: string
          description: string
          id: string
          status: string
          type: string
          user_id: string
        }[]
      }
      get_trust_score_distribution: { Args: never; Returns: Json }
      get_user_conversations: {
        Args: { usr_id: string }
        Returns: {
          conversation_id: string
          last_message: string
          last_message_at: string
          other_participants: Json
          unread_count: number
        }[]
      }
      get_user_moderation_status: { Args: { p_user_id: string }; Returns: Json }
      get_user_trust_note_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_user_trust_notes: {
        Args: { p_limit?: number; p_offset?: number; p_user_id: string }
        Returns: {
          author_avatar: string
          author_name: string
          created_at: string
          id: string
          moment_title: string
          note: string
        }[]
      }
      gettransactionid: { Args: never; Returns: unknown }
      hash_iban: { Args: { iban: string; salt?: string }; Returns: string }
      hash_phone: { Args: { phone: string; salt?: string }; Returns: string }
      hash_tc_kimlik: {
        Args: { salt?: string; tc_kimlik: string }
        Returns: string
      }
      increment_promo_code_usage: {
        Args: { promo_id: string }
        Returns: undefined
      }
      increment_user_balance: {
        Args: { amount: number; user_id: string }
        Returns: undefined
      }
      inject_trend_keywords: {
        Args: { p_keywords: string[]; p_source?: string }
        Returns: boolean
      }
      invalidate_cdn_manually: {
        Args: { p_ids: string[]; p_type: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_conversation_participant: {
        Args: { conv_id: string; usr_id: string }
        Returns: boolean
      }
      is_service_role: { Args: never; Returns: boolean }
      is_super_admin: { Args: { check_user_id: string }; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      mark_notifications_read: {
        Args: { p_notification_ids?: string[]; p_user_id: string }
        Returns: number
      }
      mask_card_number: { Args: { card_number: string }; Returns: string }
      mask_iban: { Args: { iban: string }; Returns: string }
      mask_phone: { Args: { phone: string }; Returns: string }
      notify_exchange_rate_update: { Args: never; Returns: undefined }
      open_dispute: {
        Args: {
          p_description: string
          p_escrow_id: string
          p_evidence_urls?: string[]
          p_reason: Database["public"]["Enums"]["dispute_reason"]
          p_user_id: string
        }
        Returns: Json
      }
      open_escrow_dispute: {
        Args: {
          p_disputant_id: string
          p_escrow_id: string
          p_evidence?: Json
          p_reason: string
        }
        Returns: Json
      }
      partial_refund_escrow: {
        Args: {
          p_escrow_id: string
          p_reason?: string
          p_refund_amount?: number
          p_service_fee?: number
        }
        Returns: Json
      }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      process_direct_pay_transfer: {
        Args: { p_gift_id: string; p_paytr_merchant_oid: string }
        Returns: Json
      }
      record_consent: {
        Args: {
          consent_type: string
          consented: boolean
          target_user_id: string
          version?: string
        }
        Returns: undefined
      }
      record_rate_limit_violation: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_ip_address?: string
        }
        Returns: undefined
      }
      record_totp_usage: {
        Args: {
          p_code: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_user_id: string
        }
        Returns: undefined
      }
      refund_escrow:
        | { Args: { p_escrow_id: string; p_reason?: string }; Returns: Json }
        | {
            Args: {
              p_escrow_id: string
              p_idempotency_key?: string
              p_reason?: string
            }
            Returns: Json
          }
      refund_expired_escrow: { Args: never; Returns: number }
      release_escrow:
        | {
            Args: { p_escrow_id: string; p_released_by: string }
            Returns: boolean
          }
        | {
            Args: {
              p_escrow_id: string
              p_idempotency_key?: string
              p_verified_by?: string
            }
            Returns: Json
          }
      resolve_escrow_dispute: {
        Args: {
          p_admin_id: string
          p_escrow_id: string
          p_notes?: string
          p_resolution: string
          p_sender_amount?: number
        }
        Returns: Json
      }
      respond_to_dispute: {
        Args: {
          p_dispute_id: string
          p_evidence_urls?: string[]
          p_response_text: string
          p_user_id: string
        }
        Returns: Json
      }
      search_moments_nearby: {
        Args: {
          p_category?: string
          p_latitude: number
          p_limit?: number
          p_longitude: number
          p_radius_km?: number
        }
        Returns: {
          category: string
          date: string
          distance_km: number
          id: string
          location: string
          price: number
          title: string
        }[]
      }
      send_bulk_thank_you: {
        Args: { p_message?: string; p_moment_id: string }
        Returns: number
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      soft_delete_user: { Args: { p_user_id: string }; Returns: boolean }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      transfer_funds: {
        Args: { amount: number; receiver_id: string; sender_id: string }
        Returns: Json
      }
      unlockrows: { Args: { "": string }; Returns: number }
      update_user_preferences: {
        Args: { p_action: string; p_category: string; p_user_id: string }
        Returns: undefined
      }
      update_wallet_balance: {
        Args: { p_amount: number; p_user_id: string }
        Returns: undefined
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      upsert_exchange_rate: {
        Args: {
          p_base: string
          p_rate: number
          p_source?: string
          p_target: string
        }
        Returns: undefined
      }
      user_conversation_ids: { Args: never; Returns: string[] }
      user_moment_ids: { Args: never; Returns: string[] }
      validate_gift_contribution: {
        Args: { p_giver_id?: string; p_moment_id: string }
        Returns: Json
      }
      validate_promo_code: {
        Args: { p_code: string; p_user_id: string }
        Returns: Json
      }
      validate_storage_file_size: {
        Args: { bucket_name: string; file_size_bytes: number }
        Returns: boolean
      }
      validate_turkish_iban: { Args: { p_iban: string }; Returns: Json }
      verify_proof_and_release: {
        Args: { p_escrow_id: string; p_reason?: string; p_verified_by: string }
        Returns: boolean
      }
      withdraw_funds: {
        Args: { amount: number; user_id_param: string }
        Returns: Json
      }
    }
    Enums: {
      admin_role:
        | "super_admin"
        | "manager"
        | "moderator"
        | "finance"
        | "marketing"
        | "support"
        | "viewer"
      badge_category: "giver" | "receiver" | "trust" | "special"
      dispute_reason:
        | "proof_invalid"
        | "proof_fake"
        | "proof_incomplete"
        | "experience_not_done"
        | "wrong_person"
        | "other"
      dispute_status:
        | "pending"
        | "under_review"
        | "awaiting_response"
        | "resolved_refund"
        | "resolved_partial"
        | "resolved_release"
        | "cancelled"
        | "expired"
      proof_requirement_type: "none" | "optional" | "required"
      task_priority: "urgent" | "high" | "medium" | "low"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      user_account_status:
        | "active"
        | "suspended"
        | "banned"
        | "pending"
        | "deleted"
      user_account_type:
        | "standard"
        | "vip"
        | "influencer"
        | "partner"
        | "exempt"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_level: { Args: { name: string }; Returns: number }
      get_prefix: { Args: { name: string }; Returns: string }
      get_prefixes: { Args: { name: string }; Returns: string[] }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] }
        Returns: undefined
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: [
        "super_admin",
        "manager",
        "moderator",
        "finance",
        "marketing",
        "support",
        "viewer",
      ],
      badge_category: ["giver", "receiver", "trust", "special"],
      dispute_reason: [
        "proof_invalid",
        "proof_fake",
        "proof_incomplete",
        "experience_not_done",
        "wrong_person",
        "other",
      ],
      dispute_status: [
        "pending",
        "under_review",
        "awaiting_response",
        "resolved_refund",
        "resolved_partial",
        "resolved_release",
        "cancelled",
        "expired",
      ],
      proof_requirement_type: ["none", "optional", "required"],
      task_priority: ["urgent", "high", "medium", "low"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      user_account_status: [
        "active",
        "suspended",
        "banned",
        "pending",
        "deleted",
      ],
      user_account_type: ["standard", "vip", "influencer", "partner", "exempt"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const

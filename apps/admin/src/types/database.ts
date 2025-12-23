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
          role: 'super_admin' | 'manager' | 'moderator' | 'finance' | 'marketing' | 'support' | 'viewer';
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
          role?: 'super_admin' | 'manager' | 'moderator' | 'finance' | 'marketing' | 'support' | 'viewer';
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
          role?: 'super_admin' | 'manager' | 'moderator' | 'finance' | 'marketing' | 'support' | 'viewer';
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
          role: 'super_admin' | 'manager' | 'moderator' | 'finance' | 'marketing' | 'support' | 'viewer';
          resource: string;
          action: string;
        };
        Insert: {
          id?: string;
          role: 'super_admin' | 'manager' | 'moderator' | 'finance' | 'marketing' | 'support' | 'viewer';
          resource: string;
          action: string;
        };
        Update: {
          id?: string;
          role?: 'super_admin' | 'manager' | 'moderator' | 'finance' | 'marketing' | 'support' | 'viewer';
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      admin_role: 'super_admin' | 'manager' | 'moderator' | 'finance' | 'marketing' | 'support' | 'viewer';
      task_priority: 'urgent' | 'high' | 'medium' | 'low';
      task_status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    };
  };
}

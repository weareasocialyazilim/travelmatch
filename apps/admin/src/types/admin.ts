// Admin Roles
export type AdminRole =
  | 'super_admin'
  | 'manager'
  | 'moderator'
  | 'finance'
  | 'marketing'
  | 'support'
  | 'viewer';

// Admin User
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: AdminRole;
  is_active: boolean;
  requires_2fa: boolean;
  totp_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
  created_by: string | null;
}

// Session
export interface AdminSession {
  id: string;
  admin_id: string;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: string;
  created_at: string;
}

// Permissions
export interface RolePermission {
  id: string;
  role: AdminRole;
  resource: string;
  action: string;
}

// Resources
export type Resource =
  | 'users'
  | 'moments'
  | 'disputes'
  | 'transactions'
  | 'payouts'
  | 'reports'
  | 'analytics'
  | 'settings'
  | 'admin_users'
  | 'integrations';

// Actions
export type Action = 'view' | 'create' | 'update' | 'delete' | 'export' | 'impersonate';

// Task Queue
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskType =
  | 'kyc_verification'
  | 'payment_approval'
  | 'dispute_review'
  | 'report_review'
  | 'payout_approval'
  | 'content_moderation'
  | 'support_ticket';

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  resource_type: string;
  resource_id: string;
  assigned_to: string | null;
  assigned_roles: AdminRole[];
  due_date: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  completed_by: string | null;
}

// Audit Log
export interface AuditLog {
  id: string;
  admin_id: string;
  admin?: AdminUser;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// App User (from main app)
export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  status: 'active' | 'suspended' | 'banned' | 'pending';
  kyc_status: 'not_started' | 'pending' | 'verified' | 'rejected';
  balance: number;
  total_trips: number;
  rating: number;
  created_at: string;
  last_active_at: string | null;
}

// Moment (from main app)
export interface Moment {
  id: string;
  user_id: string;
  user?: AppUser;
  title: string;
  description: string | null;
  location: string | null;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  moderation_notes: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  created_at: string;
}

// Dispute
export interface Dispute {
  id: string;
  reporter_id: string;
  reporter?: AppUser;
  reported_id: string;
  reported?: AppUser;
  type: 'scam' | 'harassment' | 'inappropriate' | 'spam' | 'other';
  description: string;
  evidence: string[];
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

// Transaction
export interface Transaction {
  id: string;
  user_id: string;
  user?: AppUser;
  type: 'payment' | 'payout' | 'refund' | 'fee';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  stripe_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Payout
export interface Payout {
  id: string;
  user_id: string;
  user?: AppUser;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed';
  bank_account: string | null;
  approved_by: string | null;
  approved_at: string | null;
  processed_at: string | null;
  created_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  urgent_tasks: number;
  pending_tasks: number;
  completed_today: number;
  active_users: number;
  total_revenue: number;
  new_users_today: number;
  pending_kyc: number;
  pending_payouts: number;
  open_disputes: number;
  platform_health: number;
}

// API Response
export interface ApiResponse<T> {
  data: T;
  error: string | null;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

// Filter options
export interface FilterOptions {
  search?: string;
  status?: string;
  role?: AdminRole;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

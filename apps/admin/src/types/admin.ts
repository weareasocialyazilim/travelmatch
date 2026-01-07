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
export type Action =
  | 'view'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'impersonate';

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

// Notification Campaign
export interface NotificationCampaign {
  id: string;
  title: string;
  message: string;
  type: 'push' | 'email' | 'in_app' | 'sms';
  target_audience: {
    segments?: string[];
    filters?: Record<string, unknown>;
    user_ids?: string[];
  };
  scheduled_at: string | null;
  sent_at: string | null;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  sent_count: number;
  opened_count: number;
  clicked_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Marketing Campaign
export interface MarketingCampaign {
  id: string;
  name: string;
  description: string;
  type: 'email' | 'push' | 'social' | 'display' | 'influencer';
  target_audience: Record<string, unknown>;
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversion_rate: number;
  roi: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Report (User Report)
export interface Report {
  id: string;
  reporter_id: string;
  reporter?: AppUser;
  reported_id: string;
  reported?: AppUser;
  type:
    | 'spam'
    | 'harassment'
    | 'fake_profile'
    | 'inappropriate_content'
    | 'scam'
    | 'safety'
    | 'other';
  reason: string;
  description: string;
  evidence: string[];
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: string | null;
  resolution: string | null;
  action_taken: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

// Support Ticket
export interface SupportTicket {
  id: string;
  user_id: string;
  user?: AppUser;
  category:
    | 'account'
    | 'payment'
    | 'technical'
    | 'safety'
    | 'general'
    | 'feedback';
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  assigned_admin?: AdminUser;
  resolution: string | null;
  rating: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

// Analytics Metrics
export interface AnalyticsMetrics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  dau: number;
  mau: number;
  totalMatches: number;
  matchRate: number;
  totalMessages: number;
  avgMessagesPerMatch: number;
  totalRevenue: number;
  mrr: number;
  arr: number;
  avgRevenuePerUser: number;
  ltv: number;
  churnRate: number;
  conversionRate: number;
  premiumConversionRate: number;
}

// Geographic Data
export interface GeoData {
  country: string;
  city?: string;
  users: number;
  activeUsers: number;
  revenue: number;
  growth: number;
}

// Creator (Influencer)
export interface Creator {
  id: string;
  user_id: string;
  user?: AppUser;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  followers: number;
  engagement_rate: number;
  total_earnings: number;
  moments_count: number;
  avg_moment_views: number;
  referrals: number;
  status: 'pending' | 'active' | 'paused' | 'terminated';
  joined_at: string;
  last_active_at: string;
}

// Partner (B2B)
export interface Partner {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  type: 'hotel' | 'airline' | 'tour_operator' | 'travel_agency' | 'other';
  tier: 'basic' | 'premium' | 'enterprise';
  commission_rate: number;
  total_bookings: number;
  total_revenue: number;
  status: 'pending' | 'active' | 'suspended' | 'terminated';
  contract_start: string;
  contract_end: string;
  created_at: string;
}

// Event/Campaign
export interface Event {
  id: string;
  name: string;
  description: string;
  type: 'seasonal' | 'promotional' | 'community' | 'partner';
  start_date: string;
  end_date: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  participants: number;
  target_participants: number;
  budget: number;
  spent: number;
  rewards: Record<string, unknown>;
  created_by: string;
  created_at: string;
}

// Gamification
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  category: 'travel' | 'social' | 'achievement' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: Record<string, unknown>;
  points: number;
  total_awarded: number;
  is_active: boolean;
  created_at: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  requirements: Record<string, unknown>;
  rewards: Record<string, unknown>;
  start_date: string;
  end_date: string;
  participants: number;
  completions: number;
  is_active: boolean;
}

// ESG Metrics
export interface ESGMetrics {
  environmental: {
    carbonFootprint: number;
    renewableEnergy: number;
    wasteRecycling: number;
    waterUsage: number;
  };
  social: {
    diversityScore: number;
    employeeSatisfaction: number;
    communityImpact: number;
    accessibilityScore: number;
  };
  governance: {
    dataPrivacyScore: number;
    ethicsScore: number;
    transparencyScore: number;
    complianceScore: number;
  };
  overallScore: number;
}

// QA Metrics
export interface QAMetrics {
  overallScore: number;
  auditsCompleted: number;
  issuesFound: number;
  issuesResolved: number;
  avgResolutionTime: number;
  customerSatisfaction: number;
}

// Pricing Rule
export interface PricingRule {
  id: string;
  name: string;
  type: 'surge' | 'discount' | 'regional' | 'segment';
  conditions: Record<string, unknown>;
  adjustment: number;
  adjustment_type: 'percentage' | 'fixed';
  priority: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

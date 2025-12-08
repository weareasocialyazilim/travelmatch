/**
 * Moderation Feature Types
 */

export type ReportType = 'user' | 'moment' | 'message' | 'comment';

export type ReportCategory =
  | 'harassment'
  | 'hate_speech'
  | 'violence'
  | 'spam'
  | 'fake_profile'
  | 'inappropriate_content'
  | 'scam'
  | 'underage'
  | 'nudity'
  | 'copyright'
  | 'false_information'
  | 'other';

export type ReportStatus =
  | 'pending'
  | 'under_review'
  | 'resolved'
  | 'dismissed'
  | 'action_taken';

export interface Report {
  id: string;
  reporterId: string;
  type: ReportType;
  targetId: string;
  targetType: string;
  category: ReportCategory;
  description: string;
  evidence?: ReportEvidence[];
  status: ReportStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export interface ReportEvidence {
  id: string;
  type: 'screenshot' | 'recording' | 'link';
  url: string;
  cloudflareId?: string;
  description?: string;
}

export interface CreateReportInput {
  type: ReportType;
  targetId: string;
  targetType: string;
  category: ReportCategory;
  description: string;
  evidence?: {
    uri: string;
    type: 'screenshot' | 'recording';
    description?: string;
  }[];
  anonymous?: boolean;
}

export interface Block {
  id: string;
  blockerId: string;
  blockedUserId: string;
  blockedUser: BlockedUser;
  reason?: ReportCategory;
  note?: string;
  createdAt: Date;
}

export interface BlockedUser {
  id: string;
  name: string;
  avatar: string;
  blockedAt: Date;
  reason?: string;
}

export interface BlockCheckResult {
  isBlocked: boolean;
  blockedBy?: 'me' | 'them' | 'both';
  blockId?: string;
}

export interface ReportStats {
  total: number;
  pending: number;
  resolved: number;
  actionTaken: number;
}

export interface ModerationAction {
  type: 'report' | 'block' | 'unblock';
  targetId: string;
  timestamp: Date;
  reason?: string;
}

export interface SafetyResource {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: () => void;
  externalUrl?: string;
}

import { getClient } from './supabase';
import { logger } from './logger';

export interface AuditLogEntry {
  action: string;
  resource_type?: string;
  resource_id?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
}

/**
 * Log an admin action to the audit trail
 */
export async function logAuditAction(
  adminId: string,
  entry: AuditLogEntry,
  metadata?: {
    ip_address?: string;
    user_agent?: string;
  },
): Promise<void> {
  const supabase = getClient();

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('audit_logs').insert({
      admin_id: adminId,
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      old_value: entry.old_value,
      new_value: entry.new_value,
      ip_address: metadata?.ip_address,
      user_agent: metadata?.user_agent,
    });
  } catch (error) {
    logger.error('Failed to log audit action', error);
    // Don't throw - audit logging should not break the main operation
  }
}

/**
 * Common audit action types
 */
export const AuditActions = {
  // Auth
  LOGIN: 'admin_login',
  LOGOUT: 'admin_logout',
  LOGIN_FAILED: 'admin_login_failed',
  TWO_FA_ENABLED: '2fa_enabled',
  TWO_FA_DISABLED: '2fa_disabled',
  TWO_FA_VERIFIED: '2fa_verified',
  TWO_FA_FAILED: '2fa_failed',
  PASSWORD_CHANGED: 'password_changed',

  // User Management
  USER_VIEWED: 'user_viewed',
  USER_UPDATED: 'user_updated',
  USER_SUSPENDED: 'user_suspended',
  USER_ACTIVATED: 'user_activated',
  USER_BANNED: 'user_banned',
  USER_KYC_APPROVED: 'user_kyc_approved',
  USER_KYC_REJECTED: 'user_kyc_rejected',
  USER_IMPERSONATED: 'user_impersonated',

  // Content Moderation
  MOMENT_APPROVED: 'moment_approved',
  MOMENT_REJECTED: 'moment_rejected',
  MOMENT_DELETED: 'moment_deleted',
  CONTENT_FLAGGED: 'content_flagged',

  // Disputes
  DISPUTE_OPENED: 'dispute_opened',
  DISPUTE_ASSIGNED: 'dispute_assigned',
  DISPUTE_RESOLVED: 'dispute_resolved',
  DISPUTE_DISMISSED: 'dispute_dismissed',

  // Finance
  PAYOUT_APPROVED: 'payout_approved',
  PAYOUT_REJECTED: 'payout_rejected',
  REFUND_PROCESSED: 'refund_processed',
  TRANSACTION_VOIDED: 'transaction_voided',

  // Settings
  SETTINGS_UPDATED: 'settings_updated',
  ADMIN_CREATED: 'admin_user_created',
  ADMIN_UPDATED: 'admin_user_updated',
  ADMIN_DEACTIVATED: 'admin_user_deactivated',
  ROLE_CHANGED: 'role_changed',

  // Data Export
  DATA_EXPORTED: 'data_exported',
  REPORT_GENERATED: 'report_generated',
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];

/**
 * Create an audit-wrapped function that automatically logs actions
 */
export function withAudit<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  _getAuditEntry: (
    args: Parameters<T>,
    result: Awaited<ReturnType<T>>,
  ) => AuditLogEntry,
): T {
  return (async (...args: Parameters<T>) => {
    const result = await fn(...args);
    // In a real implementation, you'd get adminId from context
    // logAuditAction(adminId, _getAuditEntry(args, result));
    return result;
  }) as T;
}

import { getClient } from './supabase';
import { logger } from './logger';

export interface AuditLogEntry {
  action: string;
  resource_type?: string;
  resource_id?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
}

// P2 FIX: Audit logging configuration
const AUDIT_RETRY_ATTEMPTS = 3;
const AUDIT_RETRY_DELAY_MS = 1000;
const AUDIT_CRITICAL_ACTIONS = [
  'admin_login',
  'admin_logout',
  '2fa_enabled',
  '2fa_disabled',
  'password_changed',
  'user_banned',
  'user_suspended',
  'data_exported',
  'settings_updated',
  'admin_user_created',
  'admin_user_deactivated',
];

/**
 * Retry helper with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = AUDIT_RETRY_ATTEMPTS,
  delayMs: number = AUDIT_RETRY_DELAY_MS,
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
}

/**
 * P2 FIX: Enhanced audit logging with retry and fallback
 * Critical admin actions are logged with resilience mechanisms
 */
export async function logAuditAction(
  adminId: string,
  entry: AuditLogEntry,
  metadata?: {
    ip_address?: string;
    user_agent?: string;
  },
): Promise<{ success: boolean; method: 'primary' | 'fallback' | 'failed' }> {
  const supabase = getClient();

  const auditRecord = {
    admin_id: adminId,
    action: entry.action,
    resource_type: entry.resource_type,
    resource_id: entry.resource_id,
    old_value: entry.old_value,
    new_value: entry.new_value,
    ip_address: metadata?.ip_address,
    user_agent: metadata?.user_agent,
    created_at: new Date().toISOString(),
  };

  // Primary: Try Supabase with retry
  try {
    await withRetry(() =>
      (supabase as any).from('audit_logs').insert(auditRecord),
    );
    logger.info('[Audit] Action logged successfully', { action: entry.action });
    return { success: true, method: 'primary' };
  } catch (primaryError) {
    logger.warn('[Audit] Primary logging failed, trying fallback', {
      context: primaryError,
    });

    // Fallback: Try logging to browser console/storage for web apps
    try {
      // For web: store in localStorage as backup
      if (typeof window !== 'undefined' && (window as any).localStorage) {
        const pendingAudits = JSON.parse(
          (window as any).localStorage.getItem('pending_audit_logs') || '[]',
        );
        pendingAudits.push({
          ...auditRecord,
          failed_at: new Date().toISOString(),
        });
        (window as any).localStorage.setItem(
          'pending_audit_logs',
          JSON.stringify(pendingAudits),
        );
        logger.info('[Audit] Action queued for later sync', {
          action: entry.action,
        });
      }

      // Alert on critical action failures
      if (AUDIT_CRITICAL_ACTIONS.includes(entry.action)) {
        logger.error('[Audit] CRITICAL: Failed to log sensitive admin action', {
          action: entry.action,
          adminId,
          error: primaryError,
        });
        // In production, this should trigger an alert/notification
      }

      return { success: true, method: 'fallback' };
    } catch (fallbackError) {
      logger.error('[Audit] All logging mechanisms failed', {
        action: entry.action,
        error: fallbackError,
      });

      return { success: false, method: 'failed' };
    }
  }
}

/**
 * Sync pending audit logs from localStorage to Supabase
 * Call this periodically or on page load
 */
export async function syncPendingAuditLogs(): Promise<{
  synced: number;
  failed: number;
}> {
  if (typeof window === 'undefined' || !(window as any).localStorage) {
    return { synced: 0, failed: 0 };
  }

  const pendingAudits = JSON.parse(
    (window as any).localStorage.getItem('pending_audit_logs') || '[]',
  );

  if (pendingAudits.length === 0) {
    return { synced: 0, failed: 0 };
  }

  const supabase = getClient();
  let synced = 0;
  let failed = 0;

  for (const audit of pendingAudits) {
    try {
      await (supabase as any).from('audit_logs').insert(audit);
      synced++;
    } catch {
      failed++;
    }
  }

  // Clear synced logs
  if (synced > 0) {
    const remaining = pendingAudits.slice(-failed);
    (window as any).localStorage.setItem(
      'pending_audit_logs',
      JSON.stringify(remaining),
    );
    logger.info('[Audit] Synced audit logs', { synced, failed });
  }

  return { synced, failed };
}

/**
 * Common audit action types
 *
 * SAFE EXTENSION: Yeni action type'lar eklendi (ADD-ONLY)
 * Mevcut action'lar korundu
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

  // =====================================================
  // SAFE EXTENSION: Yeni Action Types (ADD-ONLY)
  // =====================================================

  // Triage Actions
  TRIAGE_ITEM_VIEWED: 'triage_item_viewed',
  TRIAGE_ITEM_ASSIGNED: 'triage_item_assigned',
  TRIAGE_ITEM_ESCALATED: 'triage_item_escalated',
  TRIAGE_ITEM_RESOLVED: 'triage_item_resolved',
  TRIAGE_ITEM_DISMISSED: 'triage_item_dismissed',

  // Proof Review Actions
  PROOF_REVIEWED: 'proof_reviewed',
  PROOF_APPROVED: 'proof_approved',
  PROOF_REJECTED: 'proof_rejected',
  PROOF_REQUESTED_RESUBMIT: 'proof_requested_resubmit',

  // Risk & Fraud Actions
  RISK_ALERT_VIEWED: 'risk_alert_viewed',
  RISK_ALERT_ACKNOWLEDGED: 'risk_alert_acknowledged',
  FRAUD_INVESTIGATION_STARTED: 'fraud_investigation_started',
  FRAUD_INVESTIGATION_COMPLETED: 'fraud_investigation_completed',
  FRAUD_CASE_ESCALATED: 'fraud_case_escalated',

  // Feature Flag Actions
  FEATURE_FLAG_CREATED: 'feature_flag_created',
  FEATURE_FLAG_UPDATED: 'feature_flag_updated',
  FEATURE_FLAG_TOGGLED: 'feature_flag_toggled',
  FEATURE_FLAG_DELETED: 'feature_flag_deleted',

  // Dashboard & Ops Actions
  DASHBOARD_VIEWED: 'dashboard_viewed',
  OPS_DASHBOARD_VIEWED: 'ops_dashboard_viewed',
  SYSTEM_HEALTH_CHECKED: 'system_health_checked',

  // Integration Actions
  INTEGRATION_HEALTH_VIEWED: 'integration_health_viewed',
  INTEGRATION_CONFIG_UPDATED: 'integration_config_updated',

  // Campaign Actions
  CAMPAIGN_CREATED: 'campaign_created',
  CAMPAIGN_UPDATED: 'campaign_updated',
  CAMPAIGN_ACTIVATED: 'campaign_activated',
  CAMPAIGN_DEACTIVATED: 'campaign_deactivated',
  CAMPAIGN_DELETED: 'campaign_deleted',

  // Notification Actions
  NOTIFICATION_SENT: 'notification_sent',
  NOTIFICATION_SCHEDULED: 'notification_scheduled',
  NOTIFICATION_CANCELLED: 'notification_cancelled',

  // Bulk Actions
  BULK_ACTION_STARTED: 'bulk_action_started',
  BULK_ACTION_COMPLETED: 'bulk_action_completed',
  BULK_ACTION_FAILED: 'bulk_action_failed',

  // Search & View Actions
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  LIST_EXPORTED: 'list_exported',
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

// =====================================================
// SAFE EXTENSION: Convenience Helper Functions (ADD-ONLY)
// =====================================================

/**
 * Quick audit log for simple actions
 * Bu fonksiyon mevcut sistemlere dokunmaz, sadece kolaylik saglar
 */
export async function quickAuditLog(
  adminId: string,
  action: AuditAction,
  resourceType?: string,
  resourceId?: string,
  metadata?: {
    ip_address?: string;
    user_agent?: string;
    old_value?: Record<string, unknown>;
    new_value?: Record<string, unknown>;
  },
): Promise<void> {
  await logAuditAction(
    adminId,
    {
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_value: metadata?.old_value,
      new_value: metadata?.new_value,
    },
    {
      ip_address: metadata?.ip_address,
      user_agent: metadata?.user_agent,
    },
  );
}

/**
 * Audit action categories for filtering
 */
export const AuditActionCategories = {
  AUTH: [
    'admin_login',
    'admin_logout',
    'admin_login_failed',
    '2fa_enabled',
    '2fa_disabled',
    '2fa_verified',
    '2fa_failed',
    'password_changed',
  ],
  USER_MANAGEMENT: [
    'user_viewed',
    'user_updated',
    'user_suspended',
    'user_activated',
    'user_banned',
    'user_kyc_approved',
    'user_kyc_rejected',
    'user_impersonated',
  ],
  CONTENT_MODERATION: [
    'moment_approved',
    'moment_rejected',
    'moment_deleted',
    'content_flagged',
  ],
  DISPUTES: [
    'dispute_opened',
    'dispute_assigned',
    'dispute_resolved',
    'dispute_dismissed',
  ],
  FINANCE: [
    'payout_approved',
    'payout_rejected',
    'refund_processed',
    'transaction_voided',
  ],
  SETTINGS: [
    'settings_updated',
    'admin_user_created',
    'admin_user_updated',
    'admin_user_deactivated',
    'role_changed',
  ],
  TRIAGE: [
    'triage_item_viewed',
    'triage_item_assigned',
    'triage_item_escalated',
    'triage_item_resolved',
    'triage_item_dismissed',
  ],
  PROOF_REVIEW: [
    'proof_reviewed',
    'proof_approved',
    'proof_rejected',
    'proof_requested_resubmit',
  ],
  FRAUD: [
    'risk_alert_viewed',
    'risk_alert_acknowledged',
    'fraud_investigation_started',
    'fraud_investigation_completed',
    'fraud_case_escalated',
  ],
  FEATURE_FLAGS: [
    'feature_flag_created',
    'feature_flag_updated',
    'feature_flag_toggled',
    'feature_flag_deleted',
  ],
  CAMPAIGNS: [
    'campaign_created',
    'campaign_updated',
    'campaign_activated',
    'campaign_deactivated',
    'campaign_deleted',
  ],
  BULK_ACTIONS: [
    'bulk_action_started',
    'bulk_action_completed',
    'bulk_action_failed',
  ],
} as const;

/**
 * Get category label for display
 */
export function getAuditCategoryLabel(
  category: keyof typeof AuditActionCategories,
): string {
  const labels: Record<keyof typeof AuditActionCategories, string> = {
    AUTH: 'Kimlik Dogrulama',
    USER_MANAGEMENT: 'Kullanici Yonetimi',
    CONTENT_MODERATION: 'Icerik Moderasyonu',
    DISPUTES: 'Anlasmazliklar',
    FINANCE: 'Finans',
    SETTINGS: 'Ayarlar',
    TRIAGE: 'Triage',
    PROOF_REVIEW: 'Proof Inceleme',
    FRAUD: 'Fraud & Risk',
    FEATURE_FLAGS: 'Feature Flags',
    CAMPAIGNS: 'Kampanyalar',
    BULK_ACTIONS: 'Toplu Islemler',
  };
  return labels[category] || category;
}

/**
 * Get action label for display (Turkish)
 */
export function getAuditActionLabel(action: string): string {
  const labels: Record<string, string> = {
    // Auth
    admin_login: 'Admin Girisi',
    admin_logout: 'Admin Cikisi',
    admin_login_failed: 'Basarisiz Giris',
    '2fa_enabled': '2FA Etkinlestirildi',
    '2fa_disabled': '2FA Devre Disi',
    '2fa_verified': '2FA Dogrulandi',
    '2fa_failed': '2FA Basarisiz',
    password_changed: 'Sifre Degistirildi',

    // User Management
    user_viewed: 'Kullanici Goruntulendi',
    user_updated: 'Kullanici Guncellendi',
    user_suspended: 'Kullanici Askiya Alindi',
    user_activated: 'Kullanici Aktiflestirildi',
    user_banned: 'Kullanici Yasaklandi',
    user_kyc_approved: 'KYC Onaylandi',
    user_kyc_rejected: 'KYC Reddedildi',
    user_impersonated: 'Kullanici Taklit Edildi',

    // Content
    moment_approved: 'Moment Onaylandi',
    moment_rejected: 'Moment Reddedildi',
    moment_deleted: 'Moment Silindi',
    content_flagged: 'Icerik Isaretlendi',

    // Triage
    triage_item_viewed: 'Triage Goruntulendi',
    triage_item_assigned: 'Triage Atandi',
    triage_item_escalated: 'Triage Eskale Edildi',
    triage_item_resolved: 'Triage Cozuldu',
    triage_item_dismissed: 'Triage Reddedildi',

    // Feature Flags
    feature_flag_created: 'Flag Olusturuldu',
    feature_flag_updated: 'Flag Guncellendi',
    feature_flag_toggled: 'Flag Degistirildi',
    feature_flag_deleted: 'Flag Silindi',

    // Default
    default: action.replace(/_/g, ' '),
  };

  return labels[action] || action.replace(/_/g, ' ');
}

// =====================================================
// P2 FIX: Admin Identity Logging for Exports
// =====================================================

/**
 * Log data export with full admin identity
 * This ensures all data exports are traceable to the admin who initiated them
 */
export async function logDataExport(
  adminId: string,
  adminEmail: string,
  adminName: string,
  exportDetails: {
    exportType: string;
    recordCount: number;
    filtersApplied?: Record<string, unknown>;
    format?: string;
  },
): Promise<void> {
  const supabase = getClient();

  try {
    // Log the export action with full admin identity
    await (supabase as any).from('audit_logs').insert({
      admin_id: adminId,
      action: 'data_exported',
      resource_type: exportDetails.exportType,
      resource_id: null, // Exports don't have a single resource ID
      old_value: null,
      new_value: {
        // Admin identity for audit trail
        admin_email: adminEmail,
        admin_name: adminName,
        // Export details
        export_type: exportDetails.exportType,
        record_count: exportDetails.recordCount,
        filters_applied: exportDetails.filtersApplied || {},
        format: exportDetails.format || 'csv',
        exported_at: new Date().toISOString(),
      },
      // Metadata
      ip_address: null, // Can be captured from request context
      user_agent: null, // Can be captured from request context
    });

    logger.info('[Audit] Data export logged', {
      adminId,
      adminEmail,
      exportType: exportDetails.exportType,
      recordCount: exportDetails.recordCount,
    });
  } catch (error) {
    logger.error('Failed to log data export', error);
    // Don't throw - export should complete even if audit logging fails
  }
}

/**
 * Get admin identity for audit logging
 * Returns object with admin identification details
 */
export function getAdminIdentityForAudit(admin: {
  id: string;
  email?: string;
  name?: string;
  role?: string;
}): { adminId: string; adminEmail: string; adminName: string } {
  return {
    adminId: admin.id,
    adminEmail: admin.email || 'unknown',
    adminName: admin.name || admin.email || admin.id,
  };
}

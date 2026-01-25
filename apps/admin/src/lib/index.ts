// Supabase client (browser-safe only)
export { createClient, getClient } from './supabase';

// NOTE: Server-only exports should be imported directly:
// - import { createServiceClient } from '@/lib/supabase.server';
// - import { getAdminSession, hasPermission, createAuditLog } from '@/lib/auth';

// Audit logging
export { logAuditAction, AuditActions, withAudit } from './audit';

// Permissions
export { PERMISSIONS } from './permissions';

// Logger
export { logger } from './logger';

// Utilities (selective export to avoid conflicts)
export { cn, debounce, generateId, sleep } from './utils';

// Formatters (selective export to avoid conflicts)
export {
  formatDateTime,
  formatRelativeTime,
  formatPercentage,
  formatFileSize,
  formatDuration,
  formatCompactNumber,
} from './formatters';

// Validators
export * from './validators';

// Constants
export * from './constants';

// API Client
export * from './api-client';

// Export utilities
export * from './export';

// Rate limiting
export * from './rate-limit';

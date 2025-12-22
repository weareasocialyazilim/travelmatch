// Supabase client
export * from './supabase';

// Authentication - includes session-based hasPermission
export {
  getAdminSession,
  hasPermission,
  createAuditLog,
  type AdminSession,
} from './auth';

// Audit logging
export * from './audit';

// Permissions - role-based permission helpers
export {
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  isRoleAtLeast,
  getRoleDisplayName,
  getRoleBadgeColor,
  PERMISSIONS,
} from './permissions';

// Utilities - general helpers
export {
  cn,
  getInitials,
  truncate,
  generateId,
  debounce,
  sleep,
  formatRelativeDate,
  parseError,
} from './utils';

// Formatters - all formatting functions
export * from './formatters';

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

import type { AdminRole, Resource, Action } from '@/types/admin';

/**
 * Permission matrix defining what each role can do
 */
export const PERMISSIONS: Record<AdminRole, Record<Resource, Action[]>> = {
  super_admin: {
    users: ['view', 'create', 'update', 'delete', 'export', 'impersonate'],
    moments: ['view', 'create', 'update', 'delete', 'export'],
    disputes: ['view', 'create', 'update', 'delete', 'export'],
    transactions: ['view', 'create', 'update', 'delete', 'export'],
    payouts: ['view', 'create', 'update', 'delete', 'export'],
    reports: ['view', 'create', 'update', 'delete', 'export'],
    analytics: ['view', 'export'],
    settings: ['view', 'update'],
    admin_users: ['view', 'create', 'update', 'delete'],
    integrations: ['view', 'update'],
    compliance: ['view', 'create', 'update', 'delete', 'export'],
    promos: ['view', 'create', 'update', 'delete', 'export'],
  },
  manager: {
    users: ['view', 'update', 'export', 'impersonate'],
    moments: ['view', 'update', 'export'],
    disputes: ['view', 'update', 'export'],
    transactions: ['view', 'export'],
    payouts: ['view', 'update', 'export'],
    reports: ['view', 'update', 'export'],
    analytics: ['view', 'export'],
    settings: ['view'],
    admin_users: ['view'],
    integrations: ['view'],
    compliance: ['view', 'update', 'export'],
    promos: ['view', 'update', 'export'],
  },
  moderator: {
    users: ['view', 'update'],
    moments: ['view', 'update', 'delete'],
    disputes: ['view', 'update'],
    transactions: ['view'],
    payouts: ['view'],
    reports: ['view', 'update'],
    analytics: ['view'],
    settings: [],
    admin_users: [],
    integrations: [],
    compliance: ['view'],
    promos: ['view'],
  },
  finance: {
    users: ['view'],
    moments: ['view'],
    disputes: ['view'],
    transactions: ['view', 'update', 'export'],
    payouts: ['view', 'update', 'export'],
    reports: ['view'],
    analytics: ['view', 'export'],
    settings: [],
    admin_users: [],
    integrations: [],
    compliance: ['view', 'export'],
    promos: ['view'],
  },
  marketing: {
    users: ['view', 'export'],
    moments: ['view', 'export'],
    disputes: [],
    transactions: ['view'],
    payouts: [],
    reports: ['view'],
    analytics: ['view', 'export'],
    settings: [],
    admin_users: [],
    integrations: [],
    compliance: [],
    promos: ['view', 'create', 'update', 'delete', 'export'],
  },
  support: {
    users: ['view', 'update'],
    moments: ['view'],
    disputes: ['view', 'update'],
    transactions: ['view'],
    payouts: ['view'],
    reports: ['view', 'update'],
    analytics: [],
    settings: [],
    admin_users: [],
    integrations: [],
    compliance: ['view'],
    promos: ['view'],
  },
  viewer: {
    users: ['view'],
    moments: ['view'],
    disputes: ['view'],
    transactions: ['view'],
    payouts: ['view'],
    reports: ['view'],
    analytics: ['view'],
    settings: [],
    admin_users: [],
    integrations: [],
    compliance: ['view'],
    promos: ['view'],
  },
};

/**
 * Check if a role has permission for a specific action on a resource
 */
export function hasPermission(
  role: AdminRole,
  resource: Resource,
  action: Action,
): boolean {
  return PERMISSIONS[role]?.[resource]?.includes(action) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: AdminRole,
  resource: Resource,
  actions: Action[],
): boolean {
  return actions.some((action) => hasPermission(role, resource, action));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(
  role: AdminRole,
  resource: Resource,
  actions: Action[],
): boolean {
  return actions.every((action) => hasPermission(role, resource, action));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(
  role: AdminRole,
): Record<Resource, Action[]> {
  return PERMISSIONS[role];
}

/**
 * Check if a role is at or above a certain level
 */
export function isRoleAtLeast(
  role: AdminRole,
  minimumRole: AdminRole,
): boolean {
  const roleHierarchy: AdminRole[] = [
    'super_admin',
    'manager',
    'moderator',
    'finance',
    'marketing',
    'support',
    'viewer',
  ];

  const roleIndex = roleHierarchy.indexOf(role);
  const minimumIndex = roleHierarchy.indexOf(minimumRole);

  return roleIndex <= minimumIndex;
}

/**
 * Get human-readable role name
 */
export function getRoleDisplayName(role: AdminRole): string {
  const displayNames: Record<AdminRole, string> = {
    super_admin: 'Super Admin',
    manager: 'Manager',
    moderator: 'Moderatör',
    finance: 'Finans',
    marketing: 'Pazarlama',
    support: 'Destek',
    viewer: 'Görüntüleyici',
  };

  return displayNames[role];
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: AdminRole): string {
  const colors: Record<AdminRole, string> = {
    super_admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    manager:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    moderator:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    finance:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    marketing:
      'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    support: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };

  return colors[role];
}

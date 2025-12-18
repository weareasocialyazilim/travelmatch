'use client';

import { useMemo } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import type { AdminRole, Resource, Action } from '@/types/admin';

// Permission matrix
const ROLE_PERMISSIONS: Record<AdminRole, Record<Resource, Action[]>> = {
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
  },
};

export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const permissions = useMemo(() => {
    if (!user) return null;
    return ROLE_PERMISSIONS[user.role];
  }, [user]);

  const can = (resource: Resource, action: Action): boolean => {
    if (!user || !permissions) return false;
    return permissions[resource]?.includes(action) ?? false;
  };

  const canAny = (resource: Resource, actions: Action[]): boolean => {
    return actions.some((action) => can(resource, action));
  };

  const canAll = (resource: Resource, actions: Action[]): boolean => {
    return actions.every((action) => can(resource, action));
  };

  const isRole = (...roles: AdminRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const isSuperAdmin = (): boolean => {
    return isRole('super_admin');
  };

  const isManager = (): boolean => {
    return isRole('super_admin', 'manager');
  };

  return {
    permissions,
    can,
    canAny,
    canAll,
    isRole,
    isSuperAdmin,
    isManager,
    role: user?.role ?? null,
  };
}

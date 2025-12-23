/**
 * Permissions - Comprehensive Tests
 *
 * Tests for permission system:
 * - Role-based access control
 * - Permission checking functions
 * - Role hierarchy
 * - Role display names and badges
 */

import {
  PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  isRoleAtLeast,
  getRoleDisplayName,
  getRoleBadgeColor,
} from '../permissions';
import type { AdminRole, Resource, Action } from '@/types/admin';

describe('Permissions', () => {
  describe('PERMISSIONS constant', () => {
    it('should define permissions for all roles', () => {
      const roles: AdminRole[] = [
        'super_admin',
        'manager',
        'moderator',
        'finance',
        'marketing',
        'support',
        'viewer',
      ];

      roles.forEach((role) => {
        expect(PERMISSIONS[role]).toBeDefined();
        expect(typeof PERMISSIONS[role]).toBe('object');
      });
    });

    it('should define permissions for all resources', () => {
      const resources: Resource[] = [
        'users',
        'moments',
        'disputes',
        'transactions',
        'payouts',
        'reports',
        'analytics',
        'settings',
        'admin_users',
        'integrations',
      ];

      resources.forEach((resource) => {
        expect(PERMISSIONS.super_admin[resource]).toBeDefined();
        expect(Array.isArray(PERMISSIONS.super_admin[resource])).toBe(true);
      });
    });

    it('should give super_admin all permissions', () => {
      const superAdminPerms = PERMISSIONS.super_admin;

      // Check some key permissions
      expect(superAdminPerms.users).toContain('view');
      expect(superAdminPerms.users).toContain('create');
      expect(superAdminPerms.users).toContain('delete');
      expect(superAdminPerms.users).toContain('impersonate');
      expect(superAdminPerms.admin_users).toContain('delete');
      expect(superAdminPerms.settings).toContain('update');
    });

    it('should restrict viewer to view-only access', () => {
      const viewerPerms = PERMISSIONS.viewer;

      expect(viewerPerms.users).toEqual(['view']);
      expect(viewerPerms.moments).toEqual(['view']);
      expect(viewerPerms.settings).toEqual([]);
      expect(viewerPerms.admin_users).toEqual([]);
    });
  });

  describe('hasPermission', () => {
    it('should return true when role has permission', () => {
      expect(hasPermission('super_admin', 'users', 'delete')).toBe(true);
      expect(hasPermission('manager', 'users', 'view')).toBe(true);
      expect(hasPermission('moderator', 'moments', 'update')).toBe(true);
    });

    it('should return false when role lacks permission', () => {
      expect(hasPermission('viewer', 'users', 'delete')).toBe(false);
      expect(hasPermission('moderator', 'settings', 'update')).toBe(false);
      expect(hasPermission('support', 'admin_users', 'create')).toBe(false);
    });

    it('should handle finance role correctly', () => {
      expect(hasPermission('finance', 'transactions', 'view')).toBe(true);
      expect(hasPermission('finance', 'transactions', 'export')).toBe(true);
      expect(hasPermission('finance', 'users', 'delete')).toBe(false);
    });

    it('should handle marketing role correctly', () => {
      expect(hasPermission('marketing', 'analytics', 'view')).toBe(true);
      expect(hasPermission('marketing', 'users', 'export')).toBe(true);
      expect(hasPermission('marketing', 'disputes', 'view')).toBe(false);
    });

    it('should handle support role correctly', () => {
      expect(hasPermission('support', 'users', 'update')).toBe(true);
      expect(hasPermission('support', 'disputes', 'update')).toBe(true);
      expect(hasPermission('support', 'analytics', 'view')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when role has any of the permissions', () => {
      expect(hasAnyPermission('viewer', 'users', ['view', 'create'])).toBe(true);
      expect(hasAnyPermission('moderator', 'moments', ['update', 'delete'])).toBe(true);
    });

    it('should return false when role has none of the permissions', () => {
      expect(hasAnyPermission('viewer', 'users', ['create', 'delete'])).toBe(false);
      expect(hasAnyPermission('support', 'settings', ['view', 'update'])).toBe(false);
    });

    it('should handle empty actions array', () => {
      expect(hasAnyPermission('super_admin', 'users', [])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when role has all permissions', () => {
      expect(hasAllPermissions('super_admin', 'users', ['view', 'create', 'delete'])).toBe(true);
      expect(hasAllPermissions('manager', 'users', ['view', 'update'])).toBe(true);
    });

    it('should return false when role lacks any permission', () => {
      expect(hasAllPermissions('viewer', 'users', ['view', 'create'])).toBe(false);
      expect(hasAllPermissions('moderator', 'moments', ['create', 'update'])).toBe(false);
    });

    it('should handle empty actions array', () => {
      expect(hasAllPermissions('viewer', 'users', [])).toBe(true);
    });
  });

  describe('getRolePermissions', () => {
    it('should return all permissions for a role', () => {
      const superAdminPerms = getRolePermissions('super_admin');
      expect(superAdminPerms).toEqual(PERMISSIONS.super_admin);
    });

    it('should return correct permissions for each role', () => {
      const viewerPerms = getRolePermissions('viewer');
      expect(viewerPerms.users).toEqual(['view']);
      expect(viewerPerms.settings).toEqual([]);
    });
  });

  describe('isRoleAtLeast', () => {
    it('should return true for same role', () => {
      expect(isRoleAtLeast('super_admin', 'super_admin')).toBe(true);
      expect(isRoleAtLeast('manager', 'manager')).toBe(true);
      expect(isRoleAtLeast('viewer', 'viewer')).toBe(true);
    });

    it('should return true for higher roles', () => {
      expect(isRoleAtLeast('super_admin', 'viewer')).toBe(true);
      expect(isRoleAtLeast('super_admin', 'manager')).toBe(true);
      expect(isRoleAtLeast('manager', 'moderator')).toBe(true);
      expect(isRoleAtLeast('manager', 'viewer')).toBe(true);
    });

    it('should return false for lower roles', () => {
      expect(isRoleAtLeast('viewer', 'super_admin')).toBe(false);
      expect(isRoleAtLeast('moderator', 'manager')).toBe(false);
      expect(isRoleAtLeast('support', 'finance')).toBe(false);
    });

    it('should follow correct hierarchy', () => {
      // super_admin > manager > moderator > finance > marketing > support > viewer
      expect(isRoleAtLeast('moderator', 'finance')).toBe(true);
      expect(isRoleAtLeast('finance', 'marketing')).toBe(true);
      expect(isRoleAtLeast('marketing', 'support')).toBe(true);
      expect(isRoleAtLeast('support', 'viewer')).toBe(true);
    });
  });

  describe('getRoleDisplayName', () => {
    it('should return correct display names', () => {
      expect(getRoleDisplayName('super_admin')).toBe('Super Admin');
      expect(getRoleDisplayName('manager')).toBe('Manager');
      expect(getRoleDisplayName('moderator')).toBe('Moderatör');
      expect(getRoleDisplayName('finance')).toBe('Finans');
      expect(getRoleDisplayName('marketing')).toBe('Pazarlama');
      expect(getRoleDisplayName('support')).toBe('Destek');
      expect(getRoleDisplayName('viewer')).toBe('Görüntüleyici');
    });
  });

  describe('getRoleBadgeColor', () => {
    it('should return badge colors for all roles', () => {
      const roles: AdminRole[] = [
        'super_admin',
        'manager',
        'moderator',
        'finance',
        'marketing',
        'support',
        'viewer',
      ];

      roles.forEach((role) => {
        const color = getRoleBadgeColor(role);
        expect(color).toBeDefined();
        expect(typeof color).toBe('string');
        expect(color.length).toBeGreaterThan(0);
      });
    });

    it('should return specific colors for each role', () => {
      expect(getRoleBadgeColor('super_admin')).toContain('red');
      expect(getRoleBadgeColor('manager')).toContain('purple');
      expect(getRoleBadgeColor('moderator')).toContain('blue');
      expect(getRoleBadgeColor('finance')).toContain('green');
      expect(getRoleBadgeColor('marketing')).toContain('orange');
      expect(getRoleBadgeColor('support')).toContain('cyan');
      expect(getRoleBadgeColor('viewer')).toContain('gray');
    });

    it('should include dark mode styles', () => {
      const color = getRoleBadgeColor('super_admin');
      expect(color).toContain('dark:');
    });
  });

  describe('Role Permission Matrix', () => {
    describe('super_admin', () => {
      it('should have impersonate permission', () => {
        expect(hasPermission('super_admin', 'users', 'impersonate')).toBe(true);
      });

      it('should manage admin_users', () => {
        expect(hasPermission('super_admin', 'admin_users', 'create')).toBe(true);
        expect(hasPermission('super_admin', 'admin_users', 'delete')).toBe(true);
      });

      it('should access settings', () => {
        expect(hasPermission('super_admin', 'settings', 'update')).toBe(true);
      });
    });

    describe('manager', () => {
      it('should have impersonate permission', () => {
        expect(hasPermission('manager', 'users', 'impersonate')).toBe(true);
      });

      it('should not manage admin_users', () => {
        expect(hasPermission('manager', 'admin_users', 'create')).toBe(false);
        expect(hasPermission('manager', 'admin_users', 'view')).toBe(true);
      });

      it('should only view settings', () => {
        expect(hasPermission('manager', 'settings', 'view')).toBe(true);
        expect(hasPermission('manager', 'settings', 'update')).toBe(false);
      });
    });

    describe('moderator', () => {
      it('should not have impersonate permission', () => {
        expect(hasPermission('moderator', 'users', 'impersonate')).toBe(false);
      });

      it('should manage moments', () => {
        expect(hasPermission('moderator', 'moments', 'update')).toBe(true);
        expect(hasPermission('moderator', 'moments', 'delete')).toBe(true);
      });

      it('should not access settings or admin_users', () => {
        expect(hasPermission('moderator', 'settings', 'view')).toBe(false);
        expect(hasPermission('moderator', 'admin_users', 'view')).toBe(false);
      });
    });
  });
});

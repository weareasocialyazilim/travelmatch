import { faker } from '@faker-js/faker';

// Types (compatible with admin types)
type AdminRole = 'super_admin' | 'manager' | 'moderator' | 'finance' | 'marketing' | 'support' | 'viewer';
type UserStatus = 'active' | 'suspended' | 'banned' | 'pending';
type KycStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

interface AdminUser {
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

interface AppUser {
  id: string;
  email: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  status: UserStatus;
  kyc_status: KycStatus;
  balance: number;
  total_trips: number;
  rating: number;
  created_at: string;
  last_active_at: string | null;
}

/**
 * Factory for creating mock AdminUser objects
 */
export function createAdminUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    avatar_url: faker.helpers.maybe(() => faker.image.avatar()) ?? null,
    role: faker.helpers.arrayElement<AdminRole>(['super_admin', 'manager', 'moderator', 'finance', 'marketing', 'support', 'viewer']),
    is_active: true,
    requires_2fa: false,
    totp_enabled: false,
    last_login_at: faker.date.recent().toISOString(),
    created_at: faker.date.past().toISOString(),
    created_by: null,
    ...overrides,
  };
}

/**
 * Factory for creating mock AppUser objects
 */
export function createAppUser(overrides: Partial<AppUser> = {}): AppUser {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    full_name: faker.person.fullName(),
    display_name: faker.helpers.maybe(() => faker.internet.userName()) ?? null,
    avatar_url: faker.helpers.maybe(() => faker.image.avatar()) ?? null,
    status: faker.helpers.arrayElement<UserStatus>(['active', 'suspended', 'banned', 'pending']),
    kyc_status: faker.helpers.arrayElement<KycStatus>(['not_started', 'pending', 'verified', 'rejected']),
    balance: faker.number.float({ min: 0, max: 10000, fractionDigits: 2 }),
    total_trips: faker.number.int({ min: 0, max: 100 }),
    rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
    created_at: faker.date.past().toISOString(),
    last_active_at: faker.helpers.maybe(() => faker.date.recent().toISOString()) ?? null,
    ...overrides,
  };
}

/**
 * Factory for creating a list of AdminUsers
 */
export function createAdminUserList(count: number, overrides: Partial<AdminUser> = {}): AdminUser[] {
  return Array.from({ length: count }, () => createAdminUser(overrides));
}

/**
 * Factory for creating a list of AppUsers
 */
export function createAppUserList(count: number, overrides: Partial<AppUser> = {}): AppUser[] {
  return Array.from({ length: count }, () => createAppUser(overrides));
}

/**
 * Factory for creating a verified AppUser
 */
export function createVerifiedUser(overrides: Partial<AppUser> = {}): AppUser {
  return createAppUser({
    status: 'active',
    kyc_status: 'verified',
    ...overrides,
  });
}

/**
 * Factory for creating a super admin user
 */
export function createSuperAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
  return createAdminUser({
    role: 'super_admin',
    is_active: true,
    requires_2fa: true,
    totp_enabled: true,
    ...overrides,
  });
}

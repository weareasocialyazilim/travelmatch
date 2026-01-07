import { faker } from '@faker-js/faker';
import { createAppUser } from './user.factory';

// Types
type MomentStatus = 'pending' | 'approved' | 'rejected';
type DisputeType = 'scam' | 'harassment' | 'inappropriate' | 'spam' | 'other';
type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';
type ReportType =
  | 'spam'
  | 'harassment'
  | 'fake_profile'
  | 'inappropriate_content'
  | 'scam'
  | 'safety'
  | 'other';
type ReportStatus =
  | 'pending'
  | 'reviewing'
  | 'resolved'
  | 'dismissed'
  | 'escalated';
type Priority = 'low' | 'medium' | 'high' | 'critical';

interface AppUser {
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

interface Moment {
  id: string;
  user_id: string;
  user?: AppUser;
  title: string;
  description: string | null;
  location: string | null;
  images: string[];
  status: MomentStatus;
  moderation_notes: string | null;
  moderated_by: string | null;
  moderated_at: string | null;
  created_at: string;
}

interface Dispute {
  id: string;
  reporter_id: string;
  reporter?: AppUser;
  reported_id: string;
  reported?: AppUser;
  type: DisputeType;
  description: string;
  evidence: string[];
  status: DisputeStatus;
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

interface Report {
  id: string;
  reporter_id: string;
  reporter?: AppUser;
  reported_id: string;
  reported?: AppUser;
  type: ReportType;
  reason: string;
  description: string;
  evidence: string[];
  status: ReportStatus;
  priority: Priority;
  assigned_to: string | null;
  resolution: string | null;
  action_taken: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Factory for creating mock Moment objects
 */
export function createMoment(overrides: Partial<Moment> = {}): Moment {
  const userId = faker.string.uuid();
  return {
    id: faker.string.uuid(),
    user_id: userId,
    title: faker.lorem.sentence({ min: 3, max: 8 }),
    description: faker.helpers.maybe(() => faker.lorem.paragraph()) ?? null,
    location: faker.helpers.maybe(() => faker.location.city()) ?? null,
    images: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () =>
      faker.image.url(),
    ),
    status: faker.helpers.arrayElement<MomentStatus>([
      'pending',
      'approved',
      'rejected',
    ]),
    moderation_notes: null,
    moderated_by: null,
    moderated_at: null,
    created_at: faker.date.recent().toISOString(),
    ...overrides,
  };
}

/**
 * Factory for creating a Moment with user data
 */
export function createMomentWithUser(
  overrides: Partial<Moment> = {},
): Moment & { user: AppUser } {
  const user = createAppUser();
  const moment = createMoment({ user_id: user.id, ...overrides });
  return { ...moment, user };
}

/**
 * Factory for creating mock Dispute objects
 */
export function createDispute(overrides: Partial<Dispute> = {}): Dispute {
  return {
    id: faker.string.uuid(),
    reporter_id: faker.string.uuid(),
    reported_id: faker.string.uuid(),
    type: faker.helpers.arrayElement<DisputeType>([
      'scam',
      'harassment',
      'inappropriate',
      'spam',
      'other',
    ]),
    description: faker.lorem.paragraph(),
    evidence: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () =>
      faker.image.url(),
    ),
    status: faker.helpers.arrayElement<DisputeStatus>([
      'open',
      'investigating',
      'resolved',
      'dismissed',
    ]),
    resolution: null,
    resolved_by: null,
    resolved_at: null,
    created_at: faker.date.recent().toISOString(),
    ...overrides,
  };
}

/**
 * Factory for creating mock Report objects
 */
export function createReport(overrides: Partial<Report> = {}): Report {
  return {
    id: faker.string.uuid(),
    reporter_id: faker.string.uuid(),
    reported_id: faker.string.uuid(),
    type: faker.helpers.arrayElement<ReportType>([
      'spam',
      'harassment',
      'fake_profile',
      'inappropriate_content',
      'scam',
      'safety',
      'other',
    ]),
    reason: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    evidence: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () =>
      faker.image.url(),
    ),
    status: faker.helpers.arrayElement<ReportStatus>([
      'pending',
      'reviewing',
      'resolved',
      'dismissed',
      'escalated',
    ]),
    priority: faker.helpers.arrayElement<Priority>([
      'low',
      'medium',
      'high',
      'critical',
    ]),
    assigned_to: null,
    resolution: null,
    action_taken: null,
    resolved_at: null,
    created_at: faker.date.recent().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides,
  };
}

/**
 * Factory for creating a list of Moments
 */
export function createMomentList(
  count: number,
  overrides: Partial<Moment> = {},
): Moment[] {
  return Array.from({ length: count }, () => createMoment(overrides));
}

/**
 * Factory for creating a list of Disputes
 */
export function createDisputeList(
  count: number,
  overrides: Partial<Dispute> = {},
): Dispute[] {
  return Array.from({ length: count }, () => createDispute(overrides));
}

/**
 * Factory for creating a list of Reports
 */
export function createReportList(
  count: number,
  overrides: Partial<Report> = {},
): Report[] {
  return Array.from({ length: count }, () => createReport(overrides));
}

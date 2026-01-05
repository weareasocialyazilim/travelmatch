/**
 * User Adapters
 *
 * Normalizes User-related API responses (snake_case) to canonical types (camelCase)
 */

import type { Role, KYCStatus } from '@travelmatch/shared';

// ============================================
// TYPES
// ============================================

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  fullName?: string;
  name?: string;
  username?: string;
  age?: number;
  avatar_url?: string;
  avatarUrl?: string;
  phone?: string;
  phoneNumber?: string;
  role?: Role;
  type?: string;
  kyc_status?: KYCStatus;
  kycStatus?: KYCStatus;
  isVerified?: boolean;
  bio?: string;
  languages?: string[];
  interests?: string[];
  location?: UserLocation | string;
  member_since?: string;
  memberSince?: string;
  total_gifts_given?: number;
  totalGiftsGiven?: number;
  total_gifts_received?: number;
  totalGiftsReceived?: number;
  trust_score?: number;
  trustScore?: number;
  travelDays?: number;
  visitingUntil?: string;
  lastActive?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

// ============================================
// API TYPES (snake_case from backend)
// ============================================

export interface ApiUserLocation {
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface ApiUser {
  id: string;
  email?: string;
  full_name?: string;
  fullName?: string;
  name?: string;
  username?: string;
  age?: number;
  avatar_url?: string;
  avatarUrl?: string;
  phone?: string;
  phone_number?: string;
  phoneNumber?: string;
  role?: Role;
  type?: string;
  kyc_status?: KYCStatus;
  kycStatus?: KYCStatus;
  is_verified?: boolean;
  isVerified?: boolean;
  bio?: string;
  languages?: string[];
  interests?: string[];
  location?: ApiUserLocation | string;
  member_since?: string;
  memberSince?: string;
  total_gifts_given?: number;
  totalGiftsGiven?: number;
  total_gifts_received?: number;
  totalGiftsReceived?: number;
  trust_score?: number;
  trustScore?: number;
  travel_days?: number;
  travelDays?: number;
  visiting_until?: string;
  visitingUntil?: string;
  last_active?: string;
  lastActive?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

// ============================================
// NORMALIZER FUNCTIONS
// ============================================

/**
 * Normalize user location from API response
 */
export function normalizeUserLocationFromAPI(
  location: ApiUserLocation | string | undefined,
): UserLocation | string | undefined {
  if (!location) return undefined;
  if (typeof location === 'string') return location;

  return {
    latitude: location.latitude ?? location.lat ?? 0,
    longitude: location.longitude ?? location.lng ?? 0,
    address: location.address,
    city: location.city,
    country: location.country,
  };
}

/**
 * Normalize user from API response
 */
export function normalizeUserFromAPI(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    fullName:
      apiUser.fullName ?? apiUser.full_name ?? apiUser.name ?? undefined,
    full_name: apiUser.full_name ?? apiUser.fullName ?? apiUser.name,
    name: apiUser.name ?? apiUser.full_name ?? apiUser.fullName,
    username: apiUser.username,
    age: apiUser.age,
    avatarUrl: apiUser.avatarUrl ?? apiUser.avatar_url ?? undefined,
    avatar_url: apiUser.avatar_url ?? apiUser.avatarUrl,
    phone: apiUser.phone ?? apiUser.phone_number ?? apiUser.phoneNumber,
    phoneNumber: apiUser.phoneNumber ?? apiUser.phone_number ?? apiUser.phone,
    role: apiUser.role,
    type: apiUser.type,
    kycStatus: apiUser.kycStatus ?? apiUser.kyc_status ?? undefined,
    kyc_status: apiUser.kyc_status ?? apiUser.kycStatus,
    isVerified: apiUser.isVerified ?? apiUser.is_verified,
    bio: apiUser.bio,
    languages: apiUser.languages,
    interests: apiUser.interests,
    location: normalizeUserLocationFromAPI(apiUser.location),
    memberSince: apiUser.memberSince ?? apiUser.member_since ?? undefined,
    member_since: apiUser.member_since ?? apiUser.memberSince,
    totalGiftsGiven:
      apiUser.totalGiftsGiven ?? apiUser.total_gifts_given ?? undefined,
    total_gifts_given: apiUser.total_gifts_given ?? apiUser.totalGiftsGiven,
    totalGiftsReceived:
      apiUser.totalGiftsReceived ?? apiUser.total_gifts_received ?? undefined,
    total_gifts_received:
      apiUser.total_gifts_received ?? apiUser.totalGiftsReceived,
    trustScore: apiUser.trustScore ?? apiUser.trust_score ?? undefined,
    trust_score: apiUser.trust_score ?? apiUser.trustScore,
    travelDays: apiUser.travelDays ?? apiUser.travel_days,
    visitingUntil: apiUser.visitingUntil ?? apiUser.visiting_until,
    lastActive: apiUser.lastActive ?? apiUser.last_active,
    createdAt: apiUser.createdAt ?? apiUser.created_at ?? undefined,
    created_at: apiUser.created_at ?? apiUser.createdAt,
    updatedAt: apiUser.updatedAt ?? apiUser.updated_at ?? undefined,
    updated_at: apiUser.updated_at ?? apiUser.updatedAt,
  };
}

/**
 * Normalize array of users from API
 */
export function normalizeUsersFromAPI(apiUsers: ApiUser[]): User[] {
  return apiUsers.map(normalizeUserFromAPI);
}

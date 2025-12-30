export type Role = 'Traveler' | 'Local';

/**
 * @deprecated Use KYCStatusNew for new code. Legacy status kept for backward compatibility.
 */
export type KYCStatus = 'Unverified' | 'Pending' | 'Verified';

/**
 * Unified KYC status matching database schema
 */
export type KYCStatusNew = 'not_started' | 'pending' | 'verified' | 'rejected';

/**
 * User account status
 */
export type UserAccountStatus = 'active' | 'suspended' | 'banned' | 'pending' | 'deleted';

export interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

export interface User {
  id: string;
  name: string;
  username?: string;
  age?: number;
  email?: string;
  phoneNumber?: string;
  photoUrl?: string;
  profilePhoto?: string; // Alternative photo field
  avatar?: string | null;
  avatarUrl?: string | null; // Alternative avatar field
  bio?: string;
  role: Role;
  type?: 'traveler' | 'local';
  /**
   * @deprecated Use kycStatus for new code
   */
  kyc: KYCStatus;
  /**
   * Unified KYC status matching database schema
   */
  kycStatus?: KYCStatusNew;
  /**
   * User account status (active, suspended, banned, etc.)
   */
  status?: UserAccountStatus;
  /**
   * Whether user is banned
   */
  isBanned?: boolean;
  /**
   * Whether user is suspended
   */
  isSuspended?: boolean;
  /**
   * Reason for ban (if banned)
   */
  banReason?: string;
  /**
   * Reason for suspension (if suspended)
   */
  suspensionReason?: string;
  /**
   * When suspension ends (if suspended)
   */
  suspensionEndsAt?: string;
  location: UserLocation | string;
  trustScore?: number | null;
  isVerified?: boolean | null;
  interests?: string[];
  createdAt?: string | null;
  lastActive?: string | null;
  travelDays?: number;
  visitingUntil?: string | null;
}

export interface GiftItem {
  id: string;
  placeId: string;
  placeName: string;
  title: string;
  type: 'coffee' | 'ticket' | 'dinner' | 'other';
  icon?: string;
}

// ProofType and Proof are now exported from domain.ts

// Gesture proof field is typed inline to avoid circular dependency
export interface Gesture {
  id: string;
  giverId: string;
  receiverId: string;
  item: GiftItem;
  amountUSD?: number; // UI'da gösterme
  tier: 'low' | 'mid' | 'high';
  state:
    | 'created'
    | 'awaiting_approval'
    | 'in_escrow'
    | 'proof_pending'
    | 'verified'
    | 'refunded'
    | 'under_review';
  expiresAt: string;
  proof?: {
    id: string;
    type: string;
    mediaUrl?: string;
    status: string;
    createdAt: string;
  };
}

export interface Place {
  id: string;
  name: string;
  address: string;
  distance: string;
  logo?: string;
  lat: number;
  lng: number;
}

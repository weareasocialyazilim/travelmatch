/**
 * Core Types - CANONICAL SOURCE
 * Fundamental domain types used across the application
 * All types use camelCase naming convention
 */

export type Role = 'Traveler' | 'Local';
export type KYCStatus = 'Unverified' | 'Pending' | 'Verified';

/**
 * User location with coordinates
 */
export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

/**
 * Core user entity
 * Represents a user in the TravelMatch ecosystem
 */
export interface User {
  id: string;
  email: string;
  name: string; // Primary name field
  fullName?: string; // Alternative/display name
  username?: string;
  age?: number;
  avatar?: string; // Alias for avatarUrl (backward compatibility)
  avatarUrl?: string; // Canonical avatar field
  phoneNumber?: string; // Canonical phone field
  bio?: string;
  role: Role;
  type?: 'traveler' | 'local'; // Alternative role representation
  kyc?: string; // Alias for kycStatus (backward compatibility)
  kycStatus: KYCStatus; // Canonical KYC field
  isVerified?: boolean; // Derived from KYC status
  languages?: string[];
  interests?: string[];
  location?: UserLocation | string; // Can be structured or simple string
  memberSince?: string;
  totalGiftsGiven?: number;
  totalGiftsReceived?: number;
  trustScore?: number;
  travelDays?: number; // For travelers
  visitingUntil?: string; // For travelers
  lastActive?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Gift item that can be given in a gesture
 */
export interface GiftItem {
  id: string;
  placeId?: string;
  placeName?: string;
  name?: string; // Generic name
  title?: string; // Alternative name field
  emoji?: string;
  icon?: string; // Alternative to emoji
  category?: string;
  type?: 'coffee' | 'ticket' | 'dinner' | 'other';
  typicalPrice?: number;
  description?: string;
}

/**
 * Gesture status representing the lifecycle
 */
export type GestureStatus =
  | 'created'
  | 'pending'
  | 'awaiting_approval'
  | 'in_escrow'
  | 'proof_pending'
  | 'verified'
  | 'completed'
  | 'refunded'
  | 'under_review';

/**
 * Gesture tier for pricing
 */
export type GestureTier = 'low' | 'mid' | 'high';

/**
 * Proof information attached to a gesture
 */
export interface GestureProof {
  id: string;
  type: string;
  mediaUrl?: string;
  status: string;
  createdAt: string;
}

/**
 * Gesture (gift transaction) between users
 */
export interface Gesture {
  id: string;
  momentId?: string; // Associated moment
  giverId: string; // User giving the gift
  receiverId: string; // User receiving the gift
  item?: GiftItem; // Gift item details
  amount?: number; // Amount in USD
  amountUSD?: number; // Alternative amount field
  currency?: string; // Currency code (default: USD)
  tier?: GestureTier; // Price tier
  status: GestureStatus; // Lifecycle status
  state?: GestureStatus; // Alternative status field
  message?: string; // Personal message
  proof?: GestureProof; // Proof of completion
  expiresAt?: string; // Expiration timestamp
  createdAt?: string;
  completedAt?: string;
  updatedAt?: string;
}

/**
 * Physical or virtual place/venue
 */
export interface Place {
  id?: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  distance?: string; // Formatted distance string
  logo?: string; // Venue logo/photo
}

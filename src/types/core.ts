export type Role = 'Traveler' | 'Local';
export type KYCStatus = 'Unverified' | 'Pending' | 'Verified';

export interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

export interface User {
  id: string;
  name: string;
  age?: number;
  email?: string;
  phoneNumber?: string;
  photoUrl?: string;
  avatar?: string;
  bio?: string;
  role: Role;
  type?: 'traveler' | 'local';
  kyc: KYCStatus;
  location: UserLocation | string;
  trustScore?: number;
  isVerified?: boolean;
  interests?: string[];
  createdAt?: string;
  lastActive?: string;
  travelDays?: number;
  visitingUntil?: string;
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

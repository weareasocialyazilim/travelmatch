export type Role = 'Traveler' | 'Local';
export type KYCStatus = 'Unverified' | 'Pending' | 'Verified';

export interface User {
  id: string;
  name: string;
  age?: number;
  photoUrl?: string;
  role: Role;
  kyc: KYCStatus;
  location: { lat: number; lng: number; city?: string };
  trustScore?: number;
}

export interface GiftItem {
  id: string;
  placeId: string;
  placeName: string;
  title: string;
  type: 'coffee' | 'ticket' | 'dinner' | 'other';
  icon?: string;
}

export type ProofType = 'photo' | 'receipt' | 'geo' | 'ticket_qr';

export interface Proof {
  id: string;
  type: ProofType;
  mediaUrl?: string;
  geo?: { lat: number; lng: number };
  status: 'pending' | 'verified' | 'failed';
  createdAt: string;
}

export interface Gesture {
  id: string;
  giverId: string;
  receiverId: string;
  item: GiftItem;
  amountUSD?: number; // UI'da gösterme
  tier: 'low' | 'mid' | 'high';
  state: 'created' | 'awaiting_approval' | 'in_escrow' | 'proof_pending' | 'verified' | 'refunded' | 'under_review';
  expiresAt: string;
  proof?: Proof;
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

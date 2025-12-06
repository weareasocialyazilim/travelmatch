import { User } from './core';

// Re-export User for convenience
export { User };

// ========== Message Types ==========
export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMine: boolean;
  proofId?: string;
}

// ========== Proof Types ==========
export type ProofType =
  | 'photo'
  | 'receipt'
  | 'geo'
  | 'ticket_qr'
  | 'delivery'
  | 'experience'
  | 'micro-kindness'
  | 'verified-experience'
  | 'community-proof';
export type ProofStatus = 'pending' | 'verified' | 'rejected' | 'failed';

export interface ProofLocation {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  name?: string;
}

export interface Proof {
  id: string;
  momentId?: string;
  userId?: string;
  type: ProofType;
  status: ProofStatus;
  images?: string[];
  video?: string;
  mediaUrl?: string;
  location?: ProofLocation | string;
  description?: string;
  verificationStatus?: string;
  aiScore?: number;
  communityScore?: number;
  verifiedAt?: string;
  createdAt: string;
  geo?: { lat: number; lng: number };
  // Extended fields for UI
  title?: string;
  date?: string;
  amount?: number;
  receiver?:
    | {
        name: string;
        avatar: string;
      }
    | string;
  trustScore?: number;
}

// ========== Transaction Types ==========
export type TransactionType = 'gift' | 'withdrawal' | 'refund' | 'deposit';
export type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface TransactionParticipant {
  id: string;
  name: string;
  avatar: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency?: string;
  senderId?: string;
  receiverId?: string;
  momentId?: string;
  proofId?: string;
  paymentMethod?: string;
  description?: string;
  createdAt: string;
  completedAt?: string;
  // UI-specific fields
  title?: string;
  transactionId?: string;
  date?: string;
  giver?: TransactionParticipant;
  receiver?: TransactionParticipant;
}

// ========== ProofStory Types ==========
export interface ProofStoryAuthor {
  id: string;
  name: string;
  avatar: string;
  trustScore: number;
}

export interface ProofStoryStats {
  views?: number;
  likes?: number;
  shares: number;
}

export interface ProofStory {
  id: string;
  proofId: string;
  userId: string;
  type: 'micro-kindness' | 'verified-experience';
  title: string;
  description: string;
  location: ProofLocation;
  images: string[];
  author: ProofStoryAuthor;
  stats: ProofStoryStats;
  createdAt: string;
  date?: string;
}

// ========== GiverSlot Types ==========
export interface GiverInfo {
  id: string;
  name: string;
  avatar: string;
  trustScore: number;
}

export interface GiverSlot {
  id: string;
  position: number;
  giver: GiverInfo;
  amount: number;
  message: string;
  timestamp: string;
}

// ========== Moment Types ==========
export interface MomentLocation {
  name?: string;
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface MomentUser {
  id?: string;
  name: string;
  avatar?: string;
  role?: string;
  type?: 'traveler' | 'local';
  location?: string;
  travelDays?: number;
  isVerified?: boolean;
  visitingUntil?: string;
}

export interface Moment {
  id: string;
  user: MomentUser | User;
  creator?: MomentUser | User; // Alias for user, some APIs return this
  title: string;
  story: string;
  imageUrl: string;
  image?: string;
  price: number;
  location: MomentLocation;
  availability: string;
  place?: string;
  giftCount?: number;
  distance?: string;
  status?: 'active' | 'pending' | 'completed'; // Owner view status
  date?: string; // Display date for moment
  category?: {
    id: string;
    label: string;
    emoji: string;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface MomentData extends Omit<Moment, 'user'> {
  user: MomentUser;
}

export interface SelectedGiver {
  id: string;
  name: string;
  avatar: string;
  amount: number;
}

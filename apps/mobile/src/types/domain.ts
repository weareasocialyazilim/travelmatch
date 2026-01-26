import type { User } from './core';

// User is re-exported from core.ts via index.ts
// Using type import here to avoid duplicate export error

// ========== Message Types ==========
export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string | null;
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
  createdAt: string | null;
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
/**
 * @deprecated Use TransactionStatusUnified for new code
 */
export type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

/**
 * Unified transaction status matching all platforms
 */
export type TransactionStatusUnified =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface TransactionParticipant {
  id: string;
  name: string;
  avatar: string | null;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency?: string | null;
  senderId?: string;
  receiverId?: string;
  momentId?: string;
  proofId?: string;
  paymentMethod?: string;
  description?: string;
  createdAt: string | null;
  completedAt?: string | null;
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
  avatar: string | null;
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
  createdAt: string | null;
  date?: string;
}

// ========== GiverSlot Types ==========
export interface GiverInfo {
  id: string;
  name: string;
  avatar: string | null;
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

/**
 * Moment lifecycle status (owner-controlled)
 */
export type MomentLifecycleStatus =
  | 'draft'
  | 'active'
  | 'full'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'deleted';

/**
 * Moment moderation status (admin-controlled)
 */
export type MomentModerationStatus =
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'flagged';

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
  avatar?: string | null;
  role?: string;
  type?: 'host' | 'local';
  location?: string;
  momentCount?: number;
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
  images?: string[]; // Multiple images support
  price: number;
  currency?: string; // Multi-currency support (TRY, EUR, USD)
  pricePerGuest?: number; // Alternative price field from some APIs
  location: MomentLocation;
  availability: string;
  place?: string;
  giftCount?: number;
  distance?: string;
  /**
   * @deprecated Use lifecycleStatus for new code
   */
  status?: 'active' | 'pending' | 'completed' | 'paused' | 'draft' | 'deleted'; // Owner view status
  /**
   * Moment lifecycle status (owner-controlled)
   */
  lifecycleStatus?: MomentLifecycleStatus;
  /**
   * Moment moderation status (admin-controlled)
   */
  moderationStatus?: MomentModerationStatus;
  /**
   * Reason for moderation action (if rejected/flagged)
   */
  moderationNotes?: string;
  date?: string; // Display date for moment
  completedDate?: string; // For completed moments
  rating?: number; // Rating for completed moments
  requestCount?: number; // Number of requests for active moments
  description?: string; // Full description
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

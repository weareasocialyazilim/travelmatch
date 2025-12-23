/**
 * Domain Types - CANONICAL SOURCE
 * Business domain specific types (Messages, Proofs, Transactions, etc.)
 * All types use camelCase naming convention
 */

/**
 * Chat message between users
 */
export interface Message {
  id: string;
  conversationId?: string;
  senderId: string;
  receiverId?: string;
  text?: string; // Message text content
  content?: string; // Alternative content field
  attachmentUrl?: string;
  timestamp?: string | null;
  isMine?: boolean; // For UI rendering
  read?: boolean;
  proofId?: string;
  createdAt?: string;
}

/**
 * Types of proof that can be submitted
 */
export type ProofType =
  | 'photo'
  | 'receipt'
  | 'geo'
  | 'ticket_qr'
  | 'delivery'
  | 'experience'
  | 'micro-kindness'
  | 'verified-experience'
  | 'community-proof'
  | 'milestone'
  | 'custom';

/**
 * Proof verification status
 */
export type ProofStatus = 'pending' | 'verified' | 'rejected' | 'failed';

/**
 * Geographic location for proof
 */
export interface ProofLocation {
  latitude?: number;
  longitude?: number;
  lat?: number; // Alternative latitude
  lng?: number; // Alternative longitude
  address?: string;
  city?: string;
  country?: string;
  name?: string;
}

/**
 * Proof of gesture completion
 */
export interface Proof {
  id: string;
  momentId?: string;
  userId?: string;
  type: ProofType;
  title?: string;
  description?: string;
  images?: string[]; // Image URLs array
  imageUrls?: string[]; // Alternative images field
  video?: string;
  mediaUrl?: string; // Single media URL
  location?: ProofLocation | string;
  status: ProofStatus;
  verificationMethod?: 'photo' | 'receipt' | 'witness' | 'gps';
  verificationStatus?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  aiScore?: number;
  communityScore?: number;
  trustScore?: number;
  metadata?: Record<string, unknown>;
  geo?: { lat: number; lng: number };
  // UI-specific fields
  date?: string;
  amount?: number;
  receiver?:
    | {
        name: string;
        avatar: string;
      }
    | string;
  createdAt?: string | null;
  updatedAt?: string;
}

/**
 * Transaction types
 */
export type TransactionType = 'gift' | 'withdrawal' | 'refund' | 'deposit';

/**
 * Transaction status
 */
export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

/**
 * Participant in a transaction
 */
export interface TransactionParticipant {
  id: string;
  name: string;
  avatar?: string | null; // Canonical avatar field
  avatarUrl?: string | null; // Alternative avatar field
}

/**
 * Financial transaction
 */
export interface Transaction {
  id: string;
  transactionId?: string; // Alternative ID field
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency?: string | null;
  senderId?: string;
  receiverId?: string;
  fromUser?: TransactionParticipant;
  toUser?: TransactionParticipant;
  giver?: TransactionParticipant; // Alternative sender
  receiver?: TransactionParticipant; // Alternative recipient
  momentId?: string;
  proofId?: string;
  paymentMethod?: string;
  title?: string; // Display title
  description?: string;
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  metadata?: Record<string, unknown>;
  date?: string; // Display date
  createdAt?: string | null;
  completedAt?: string | null;
  failedAt?: string;
  failureReason?: string;
}

/**
 * Proof story author information
 */
export interface ProofStoryAuthor {
  id: string;
  name: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  trustScore?: number;
}

/**
 * Proof story engagement statistics
 */
export interface ProofStoryStats {
  views?: number;
  likes?: number;
  shares?: number;
  comments?: number;
}

/**
 * Proof story (social proof content)
 */
export interface ProofStory {
  id: string;
  proofId: string;
  userId?: string;
  type?: 'micro-kindness' | 'verified-experience';
  author?: ProofStoryAuthor;
  title?: string;
  description?: string;
  content?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  images?: string[];
  location?: ProofLocation;
  stats?: ProofStoryStats;
  date?: string;
  expiresAt?: string;
  createdAt?: string | null;
}

/**
 * Giver information for slots
 */
export interface GiverInfo {
  id: string;
  name: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  amount?: number;
  message?: string;
  trustScore?: number;
}

/**
 * Giver slot in a multi-giver moment
 */
export interface GiverSlot {
  id: string;
  position?: number;
  slotNumber?: number;
  giver?: GiverInfo;
  isFilled?: boolean;
  amount?: number;
  amountContributed?: number;
  message?: string;
  timestamp?: string;
}

/**
 * Moment location information
 */
export interface MomentLocation {
  name?: string;
  city?: string;
  country?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

/**
 * Moment user (simplified user for moment context)
 */
export interface MomentUser {
  id?: string;
  name: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  role?: string;
  type?: 'traveler' | 'local';
  location?: string;
  travelDays?: number;
  isVerified?: boolean;
  visitingUntil?: string;
}

/**
 * Moment category
 */
export interface MomentCategory {
  id: string;
  label: string;
  emoji: string;
}

/**
 * Moment (experience or request)
 */
export interface Moment {
  id: string;
  user?: MomentUser;
  creator?: MomentUser; // Alias for user
  title: string;
  story?: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  images?: string[];
  price: number;
  pricePerGuest?: number;
  location?: MomentLocation;
  place?: string;
  availability?: string;
  giftCount?: number;
  distance?: string;
  status?: 'active' | 'pending' | 'completed' | 'paused' | 'draft' | 'deleted';
  date?: string;
  completedDate?: string;
  rating?: number;
  requestCount?: number;
  category?: MomentCategory;
  dateRange?: {
    start: Date;
    end: Date;
  };
  createdAt?: string;
  updatedAt?: string;
}

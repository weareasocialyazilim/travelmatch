/**
 * Domain Types
 * Business domain specific types (Messages, Proofs, Transactions, etc.)
 */

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  attachment_url?: string;
  read: boolean;
  created_at: string;
}

export type ProofType =
  | 'micro-kindness'
  | 'verified-experience'
  | 'community-proof'
  | 'milestone'
  | 'custom';

export type ProofStatus = 'pending' | 'verified' | 'rejected' | 'failed';

export interface ProofLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface Proof {
  id: string;
  moment_id: string;
  user_id: string;
  type: ProofType;
  title?: string;
  description?: string;
  image_urls: string[];
  location?: ProofLocation;
  status: ProofStatus;
  verification_method?: 'photo' | 'receipt' | 'witness' | 'gps';
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'gift' | 'withdrawal' | 'refund' | 'deposit';
export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface TransactionParticipant {
  id: string;
  name: string;
  avatar_url?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  from_user?: TransactionParticipant;
  to_user?: TransactionParticipant;
  moment_id?: string;
  description?: string;
  stripe_payment_intent_id?: string;
  stripe_transfer_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  completed_at?: string;
  failed_at?: string;
  failure_reason?: string;
}

export interface ProofStoryAuthor {
  id: string;
  name: string;
  avatar_url?: string;
}

export interface ProofStoryStats {
  views: number;
  likes: number;
  comments: number;
}

export interface ProofStory {
  id: string;
  proof_id: string;
  author: ProofStoryAuthor;
  content: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  location?: ProofLocation;
  stats: ProofStoryStats;
  expires_at: string;
  created_at: string;
}

export interface GiverInfo {
  id: string;
  name: string;
  avatar_url?: string;
  amount: number;
  message?: string;
}

export interface GiverSlot {
  id: string;
  slot_number: number;
  giver?: GiverInfo;
  is_filled: boolean;
  amount_contributed: number;
}

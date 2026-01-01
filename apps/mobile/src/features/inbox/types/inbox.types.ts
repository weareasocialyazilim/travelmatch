/**
 * TravelMatch Vibe Room - Inbox Types
 *
 * Type definitions for the dark-themed, glass morphism inbox experience.
 * "Context is King" - Every chat is connected to a Moment.
 */

export type ChatStatus =
  | 'matched' // Active conversation
  | 'offer_received' // Counter offer pending
  | 'offer_sent' // Waiting for response
  | 'pending_payment' // Awaiting payment
  | 'paid' // Payment confirmed
  | 'proof_pending' // Waiting for proof
  | 'completed' // Experience completed
  | 'archived'; // Archived conversation

export type RequestStatus =
  | 'new' // Unread request
  | 'viewed' // Seen but not responded
  | 'negotiating' // In discussion
  | 'accepted' // Request accepted
  | 'declined'; // Request declined

export interface MomentContext {
  id: string;
  title: string;
  image: string;
  emoji?: string;
  category?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isVerified?: boolean;
  isOnline?: boolean;
  trustScore?: number;
}

export interface InboxChat {
  id: string;
  user: ChatUser;
  moment: MomentContext;
  lastMessage: string;
  lastMessageAt: string;
  status: ChatStatus;
  unreadCount: number;
  offerAmount?: number;
  currency?: string;
  isTyping?: boolean;
}

export interface InboxRequest {
  id: string;
  user: ChatUser;
  moment: MomentContext;
  message: string;
  requestedAt: string;
  status: RequestStatus;
  proposedAmount?: number;
  currency?: string;
  expiresAt?: string;
}

export type InboxTab = 'active' | 'requests';

// Status badge configuration
export interface StatusBadgeConfig {
  label: string;
  backgroundColor: string;
  textColor: string;
  icon?: string;
}

export const STATUS_BADGE_CONFIG: Record<ChatStatus, StatusBadgeConfig> = {
  matched: {
    label: 'Active',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    textColor: '#10B981',
  },
  offer_received: {
    label: 'Offer',
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    textColor: '#EC4899',
    icon: 'cash-multiple',
  },
  offer_sent: {
    label: 'Pending',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    textColor: '#F59E0B',
  },
  pending_payment: {
    label: 'Pay Now',
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    textColor: '#F59E0B',
    icon: 'credit-card-outline',
  },
  paid: {
    label: 'Paid',
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    textColor: '#10B981',
    icon: 'check-circle',
  },
  proof_pending: {
    label: 'Proof',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    textColor: '#8B5CF6',
    icon: 'camera-outline',
  },
  completed: {
    label: 'Done',
    backgroundColor: 'rgba(16, 185, 129, 0.4)',
    textColor: '#10B981',
    icon: 'check-all',
  },
  archived: {
    label: 'Archived',
    backgroundColor: 'rgba(120, 113, 108, 0.2)',
    textColor: '#78716C',
  },
};

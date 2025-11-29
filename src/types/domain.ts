/**
 * TravelMatch Domain Types
 * Merkezi type tanımları - tüm uygulama genelinde kullanılır
 */

// ============================================================================
// USER TYPES
// ============================================================================

export type Role = 'Traveler' | 'Local';
export type KYCStatus = 'Unverified' | 'Pending' | 'Verified';

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  age?: number;
  bio?: string;
  username?: string;
  phoneNumber?: string;
  role: Role;
  kyc: KYCStatus;
  location: {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
  };
  trustScore?: number;
  interests?: string[];
  createdAt?: Date;
  isVerified?: boolean;
}

export interface UserProfile extends User {
  stats?: {
    gesturesGiven: number;
    gesturesReceived: number;
    momentsCreated: number;
    trustScore: number;
  };
  membershipTier?: 'free' | 'starter' | 'pro' | 'vip';
}

// ============================================================================
// MOMENT TYPES (Hediye Fırsatı)
// ============================================================================

export interface MomentCategory {
  id: string;
  label: string;
  emoji: string;
}

export interface Moment {
  id: string;
  user: {
    name: string;
    avatar?: string;
    role: 'Traveler' | 'Local';
    isVerified: boolean;
    type: 'traveler' | 'local';
    location: string;
    travelDays?: number;
    visitingUntil?: Date;
  };
  title: string;
  location: {
    name: string;
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  distance: string;
  place?: string;
  availability: string;
  price: number;
  imageUrl?: string;
  image?: string; // Backward compatibility
  giftCount?: number;
  category?: MomentCategory;
  story?: string;
  dateRange?: {
    start: Date;
    end?: Date;
  };
}

// GiftMomentBottomSheet için format
export interface MomentData {
  id: string;
  category?: MomentCategory;
  title: string;
  imageUrl?: string;
  user: {
    name: string;
    avatar?: string;
    type: 'traveler' | 'local';
    location: string;
    travelDays?: number;
    isVerified: boolean;
  };
  location: {
    name: string;
    city: string;
    country: string;
  };
  story?: string;
  dateRange: {
    start: Date;
    end?: Date;
  };
  price: number;
}

// ============================================================================
// PROOF TYPES (Doğrulanmış Jest Kanıtı)
// ============================================================================

export type ProofType =
  | 'photo'
  | 'receipt'
  | 'geo'
  | 'ticket_qr'
  | 'micro-kindness'
  | 'verified-experience'
  | 'community-proof';
export type ProofStatus = 'pending' | 'verified' | 'failed' | 'rejected';

export interface Proof {
  id: string;
  type: ProofType;
  mediaUrl?: string;
  geo?: { lat: number; lng: number };
  status: ProofStatus;
  createdAt: string;
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  amount?: number;
  receiver?: string;
  images?: string[];
  trustScore?: number;
}

export interface File {
  uri: string;
  type: string; // e.g., 'image/jpeg'
  name: string;
}

export interface ProofUpload {
  type: 'photo' | 'video' | 'receipt' | 'location';
  file?: File;
  location?: {
    latitude: number;
    longitude: number;
  };
  details: {
    title: string;
    description: string;
    category: string;
    amount?: number;
  };
}

export interface ProofStory {
  id: string;
  author: string;
  authorName: string;
  authorAvatar: string;
  proofs: Array<{
    id: string;
    type: 'image' | 'video';
    url: string;
    caption?: string;
  }>;
  timestamp: string;
  viewCount: number;
  isVerified: boolean;
}

// ============================================================================
// GESTURE & GIFT TYPES
// ============================================================================

export interface GiftItem {
  id: string;
  placeId: string;
  placeName: string;
  title: string;
  type:
    | 'coffee'
    | 'ticket'
    | 'dinner'
    | 'meal'
    | 'transport'
    | 'experience'
    | 'other';
  icon?: string;
}

export type GestureState =
  | 'created'
  | 'awaiting_approval'
  | 'in_escrow'
  | 'proof_pending'
  | 'verified'
  | 'refunded'
  | 'under_review';

export interface Gesture {
  id: string;
  giverId: string;
  receiverId: string;
  item: GiftItem;
  amountUSD?: number;
  tier: 'low' | 'mid' | 'high';
  state: GestureState;
  expiresAt: string;
  proof?: Proof;
}

export interface GiverSlot {
  id: string;
  position: number;
  giver: {
    id: string;
    name: string;
    avatar: string;
    trustScore: number;
  };
  amount: number;
  message: string;
  timestamp: string;
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export type TransactionType = 'payment' | 'refund' | 'transfer';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  title: string;
  description: string;
  date: string;
  giver?: {
    name: string;
    avatar: string;
  };
  receiver?: {
    name: string;
    avatar: string;
  };
  paymentMethod: string;
  transactionId: string;
  proofId?: string;
}

// ============================================================================
// MESSAGE & CHAT TYPES
// ============================================================================

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  proofId?: string;
  proofPreview?: {
    title: string;
    image: string;
    type: string;
  };
  timestamp: string;
  isMine: boolean;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
}

// ============================================================================
// PLACE & LOCATION TYPES
// ============================================================================

export interface Place {
  id: string;
  name: string;
  address: string;
  distance: string;
  logo?: string;
  lat: number;
  lng: number;
}

export interface Location {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

// ============================================================================
// SUBSCRIPTION & MEMBERSHIP TYPES
// ============================================================================

export type MembershipTier = 'free' | 'starter' | 'pro' | 'vip';

export interface SubscriptionPlan {
  id: MembershipTier;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// NAVIGATION TYPES (AppNavigator ile senkronize)
// ============================================================================

export interface Travel {
  id: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  userId: string;
}

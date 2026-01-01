/**
 * Type Adapters - API Response Normalizers
 *
 * These functions normalize API responses (snake_case) to canonical types (camelCase)
 * This file defines extended types for mobile app that are compatible with shared package.
 *
 * @packageDocumentation
 */

import type {
  Role,
  KYCStatus,
  ProofType,
  ProofStatus,
  TransactionType,
  TransactionStatus,
} from '@travelmatch/shared';

// Re-export base types from shared for external use
export type {
  Role,
  KYCStatus,
  ProofType,
  ProofStatus,
  TransactionType,
  TransactionStatus,
};

/**
 * Extended Mobile App Types
 * These types extend shared package types with additional mobile-specific fields
 */

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  fullName?: string;
  name?: string;
  username?: string;
  age?: number;
  avatar_url?: string;
  avatarUrl?: string;
  phone?: string;
  phoneNumber?: string;
  role?: Role;
  type?: string;
  kyc_status?: KYCStatus;
  kycStatus?: KYCStatus;
  isVerified?: boolean;
  bio?: string;
  languages?: string[];
  interests?: string[];
  location?: UserLocation | string;
  member_since?: string;
  memberSince?: string;
  total_gifts_given?: number;
  totalGiftsGiven?: number;
  total_gifts_received?: number;
  totalGiftsReceived?: number;
  trust_score?: number;
  trustScore?: number;
  travelDays?: number;
  visitingUntil?: string;
  lastActive?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface GiftItem {
  id: string;
  placeId?: string;
  placeName?: string;
  name: string;
  title?: string;
  emoji: string;
  icon?: string;
  category: string;
  type?: 'coffee' | 'ticket' | 'dinner' | 'other';
  typical_price?: number;
  typicalPrice?: number;
  description?: string;
}

export interface Gesture {
  id: string;
  moment_id?: string;
  momentId?: string;
  giver_id?: string;
  giverId?: string;
  receiver_id?: string;
  receiverId?: string;
  item?: GiftItem;
  amount: number;
  amountUSD?: number;
  currency: string;
  tier?: 'low' | 'mid' | 'high';
  status: 'pending' | 'completed' | 'refunded';
  state?: string;
  message?: string;
  proof?: {
    id: string;
    type: string;
    mediaUrl?: string;
    status: string;
    createdAt?: string;
  };
  expiresAt?: string;
  created_at?: string;
  createdAt?: string;
  completed_at?: string;
  completedAt?: string;
  updatedAt?: string;
}

export interface Place {
  id?: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  distance?: string;
  logo?: string;
}

export interface Message {
  id: string;
  conversation_id?: string;
  conversationId?: string;
  sender_id?: string;
  senderId?: string;
  receiver_id?: string;
  receiverId?: string;
  text?: string;
  content: string;
  attachment_url?: string;
  attachmentUrl?: string;
  timestamp?: string | null;
  isMine?: boolean;
  read: boolean;
  proofId?: string;
  created_at?: string;
  createdAt?: string;
}

export interface ProofLocation {
  latitude: number;
  longitude: number;
  lat?: number;
  lng?: number;
  address?: string;
  city?: string;
  country?: string;
  name?: string;
}

export interface Proof {
  id: string;
  momentId?: string;
  moment_id?: string;
  userId?: string;
  user_id?: string;
  type: ProofType | string;
  title?: string;
  description?: string;
  image_urls?: string[];
  images?: string[];
  imageUrls?: string[];
  video?: string;
  mediaUrl?: string;
  location?: ProofLocation;
  status: ProofStatus | string;
  verification_method?: 'photo' | 'receipt' | 'witness' | 'gps';
  verificationMethod?: string;
  verificationStatus?: string;
  verified_by?: string;
  verifiedBy?: string;
  verified_at?: string;
  verifiedAt?: string;
  rejection_reason?: string;
  rejectionReason?: string;
  aiScore?: number;
  communityScore?: number;
  trustScore?: number;
  metadata?: Record<string, unknown>;
  created_at?: string | null;
  createdAt?: string | null;
  updated_at?: string;
  updatedAt?: string;
}

export interface TransactionParticipant {
  id: string;
  name: string;
  avatar?: string;
  avatar_url?: string;
  avatarUrl?: string;
}

export interface Transaction {
  id: string;
  transaction_id?: string;
  transactionId?: string;
  type: TransactionType | string;
  status: TransactionStatus | string;
  amount: number;
  currency?: string | null;
  senderId?: string;
  receiverId?: string;
  from_user?: TransactionParticipant;
  fromUser?: TransactionParticipant;
  to_user?: TransactionParticipant;
  toUser?: TransactionParticipant;
  giver?: TransactionParticipant;
  receiver?: TransactionParticipant;
  moment_id?: string;
  momentId?: string;
  proofId?: string;
  paymentMethod?: string;
  description?: string;
  note?: string;
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  stripe_payment_intent_id?: string;
  stripe_transfer_id?: string;
  metadata?: Record<string, unknown>;
  created_at?: string | null;
  createdAt?: string | null;
  completed_at?: string | null;
  completedAt?: string | null;
  failed_at?: string;
  failedAt?: string;
  failure_reason?: string;
  failureReason?: string;
}

export interface ProofStoryAuthor {
  id: string;
  name: string;
  avatar?: string;
  avatar_url?: string;
  avatarUrl?: string;
  trustScore?: number;
}

export interface ProofStoryStats {
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

export interface ProofStory {
  id: string;
  proof_id?: string;
  proofId?: string;
  userId?: string;
  type?: 'micro-kindness' | 'verified-experience';
  author?: ProofStoryAuthor;
  title?: string;
  description?: string;
  content?: string;
  media_url?: string;
  mediaUrl?: string;
  media_type?: 'image' | 'video';
  mediaType?: 'image' | 'video';
  images?: string[];
  location?: ProofLocation;
  stats?: ProofStoryStats;
  date?: string;
  expires_at?: string;
  expiresAt?: string;
  created_at?: string | null;
  createdAt?: string | null;
}

export interface GiverInfo {
  id: string;
  name: string;
  avatar?: string;
  avatar_url?: string;
  avatarUrl?: string;
  amount?: number;
  message?: string;
  trustScore?: number;
}

export interface GiverSlot {
  id: string;
  slot_number?: number;
  slotNumber?: number;
  position?: number;
  giver?: GiverInfo;
  is_filled?: boolean;
  isFilled?: boolean;
  amount?: number;
  amount_contributed?: number;
  amountContributed?: number;
  message?: string;
  timestamp?: string;
}

export interface MomentLocation {
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  country?: string;
  venue_name?: string;
  name?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface MomentUser {
  id: string;
  full_name?: string;
  name?: string;
  avatar_url?: string;
  avatar?: string;
  avatarUrl?: string;
  role?: Role | string;
  type?: 'traveler' | 'local';
  trust_score?: number;
  trustScore?: number;
  location?: string;
  travelDays?: number;
  travel_days?: number;
  isVerified?: boolean;
  is_verified?: boolean;
  visitingUntil?: string;
  visiting_until?: string;
}

export interface Moment {
  id: string;
  creator_id?: string;
  creatorId?: string;
  title: string;
  description?: string;
  story?: string;
  category?: string | { id: string; label: string; emoji: string };
  location?: MomentLocation;
  start_time?: string;
  startTime?: string;
  startDate?: string;
  end_time?: string;
  endTime?: string;
  endDate?: string;
  max_participants?: number;
  maxParticipants?: number;
  current_participants?: number;
  currentParticipants?: number;
  status?:
    | 'draft'
    | 'active'
    | 'completed'
    | 'cancelled'
    | 'pending'
    | 'paused'
    | 'deleted';
  images?: string[];
  image?: string;
  imageUrl?: string;
  image_url?: string;
  tags?: string[];
  creator?: MomentUser;
  user?: MomentUser;
  distance?: string;
  price?: number;
  pricePerGuest?: number;
  price_per_guest?: number;
  place?: string;
  availability?: string;
  giftCount?: number;
  gift_count?: number;
  date?: string;
  completedDate?: string;
  completed_date?: string;
  rating?: number;
  requestCount?: number;
  request_count?: number;
  dateRange?: { start: Date; end: Date };
  date_range?: string | { start?: string; end?: string };
  isLiked?: boolean;
  isSaved?: boolean;
  likesCount?: number;
  commentsCount?: number;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

/**
 * API response types (snake_case from backend)
 */
export interface ApiUser {
  id: string;
  email?: string;
  full_name?: string;
  name?: string;
  username?: string;
  age?: number;
  avatar_url?: string;
  avatar?: string;
  photo_url?: string;
  profile_photo?: string;
  phone?: string;
  phone_number?: string;
  bio?: string;
  role?: 'Traveler' | 'Local';
  type?: 'traveler' | 'local';
  kyc_status?: 'Unverified' | 'Pending' | 'Verified';
  kyc?: 'Unverified' | 'Pending' | 'Verified';
  is_verified?: boolean;
  languages?: string[];
  interests?: string[];
  location?: ApiUserLocation | string;
  member_since?: string;
  total_gifts_given?: number;
  total_gifts_received?: number;
  trust_score?: number;
  travel_days?: number;
  visiting_until?: string;
  last_active?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiUserLocation {
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  address?: string;
  city?: string;
  country?: string;
}

export interface ApiGesture {
  id: string;
  moment_id?: string;
  giver_id?: string;
  receiver_id?: string;
  item?: { id?: string; name?: string; description?: string; value?: number };
  amount?: number;
  amount_usd?: number;
  currency?: string;
  tier?: 'low' | 'mid' | 'high';
  status?: string;
  state?: string;
  message?: string;
  proof?: ApiProof;
  expires_at?: string;
  created_at?: string;
  completed_at?: string;
  updated_at?: string;
}

export interface ApiMessage {
  id: string;
  conversation_id?: string;
  sender_id: string;
  receiver_id?: string;
  text?: string;
  content?: string;
  attachment_url?: string;
  timestamp?: string | null;
  is_mine?: boolean;
  read?: boolean;
  proof_id?: string;
  created_at?: string;
}

export interface ApiProof {
  id: string;
  moment_id?: string;
  user_id?: string;
  type: string;
  title?: string;
  description?: string;
  image_urls?: string[];
  images?: string[];
  video?: string;
  media_url?: string;
  location?: ApiUserLocation;
  status: string;
  verification_method?: string;
  verification_status?: string;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  ai_score?: number;
  community_score?: number;
  trust_score?: number;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface ApiTransaction {
  id: string;
  transaction_id?: string;
  type: string;
  status: string;
  amount: number;
  currency?: string;
  sender_id?: string;
  receiver_id?: string;
  from_user?: ApiUser;
  to_user?: ApiUser;
  giver?: ApiUser;
  receiver?: ApiUser;
  moment_id?: string;
  proof_id?: string;
  payment_method?: string;
  description?: string;
  stripe_payment_intent_id?: string;
  stripe_transfer_id?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  completed_at?: string;
  failed_at?: string;
  failure_reason?: string;
}

export interface ApiPlace {
  id: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  city?: string;
  country?: string;
  distance?: number;
  logo?: string;
}

export interface ApiGiftItem {
  id: string;
  place_id?: string;
  placeId?: string;
  place_name?: string;
  placeName?: string;
  name?: string;
  title?: string;
  emoji?: string;
  icon?: string;
  category?: string;
  type?: string;
  typical_price?: number;
  typicalPrice?: number;
  description?: string;
}

export interface ApiProofStory {
  id: string;
  proof_id?: string;
  proofId?: string;
  user_id?: string;
  userId?: string;
  type?: string;
  author?: ApiUser;
  title?: string;
  description?: string;
  content?: string;
  media_url?: string;
  mediaUrl?: string;
  media_type?: string;
  mediaType?: string;
  images?: string[];
  location?: ApiUserLocation;
  stats?: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  };
  date?: string;
  expires_at?: string;
  expiresAt?: string;
  created_at?: string;
  createdAt?: string;
}

export interface ApiGiverSlot {
  id: string;
  position?: number;
  slot_number?: number;
  giver?: ApiUser & { amount?: number; message?: string | number };
  is_filled?: boolean;
  isFilled?: boolean;
  amount?: number;
  amount_contributed?: number;
  message?: string;
  timestamp?: string;
}

export interface ApiMomentUser {
  id: string;
  name?: string;
  avatar?: string;
  avatar_url?: string;
  role?: string;
  type?: string;
  location?: string;
  travel_days?: number;
  travelDays?: number;
  is_verified?: boolean;
  isVerified?: boolean;
  visiting_until?: string;
  visitingUntil?: string;
}

export interface ApiMomentLocation {
  name?: string;
  city?: string;
  country?: string;
  coordinates?: {
    lat?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
  };
}

export interface ApiMoment {
  id: string;
  user?: ApiMomentUser;
  creator?: ApiMomentUser;
  title?: string;
  story?: string;
  description?: string;
  image?: string;
  image_url?: string;
  imageUrl?: string;
  images?: string[];
  price?: number;
  price_per_guest?: number;
  pricePerGuest?: number;
  location?: ApiMomentLocation;
  place?: string;
  availability?: string;
  gift_count?: number;
  giftCount?: number;
  distance?: number;
  status?: string;
  date?: string;
  completed_date?: string;
  completedDate?: string;
  rating?: number;
  request_count?: number;
  requestCount?: number;
  category?: { id: string; label: string; emoji: string };
  date_range?: string;
  dateRange?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

/**
 * Normalize user location from API response
 */
export function normalizeUserLocationFromAPI(
  location: ApiUserLocation | string | undefined,
): UserLocation | string | undefined {
  if (!location) return undefined;
  if (typeof location === 'string') return location;

  return {
    latitude: location.latitude ?? location.lat ?? 0,
    longitude: location.longitude ?? location.lng ?? 0,
    address: location.address,
    city: location.city,
    country: location.country,
  };
}

/**
 * Normalize user from API response
 */
export function normalizeUserFromAPI(apiUser: ApiUser): User {
  const location = normalizeUserLocationFromAPI(apiUser.location);

  return {
    id: apiUser.id,
    email: apiUser.email ?? '',
    name: apiUser.name ?? apiUser.full_name ?? '',
    fullName: apiUser.full_name ?? apiUser.name,
    username: apiUser.username,
    age: apiUser.age,
    avatarUrl:
      apiUser.avatar_url ??
      apiUser.avatar ??
      apiUser.photo_url ??
      apiUser.profile_photo,
    phoneNumber: apiUser.phone_number ?? apiUser.phone,
    bio: apiUser.bio,
    role: apiUser.role ?? (apiUser.type === 'traveler' ? 'Traveler' : 'Local'),
    type: apiUser.type,
    kycStatus: (apiUser.kyc_status ??
      apiUser.kyc ??
      'not_started') as KYCStatus,
    isVerified:
      apiUser.is_verified ??
      (apiUser.kyc_status === 'Verified' || apiUser.kyc === 'Verified'),
    languages: apiUser.languages,
    interests: apiUser.interests,
    location: location,
    memberSince: apiUser.member_since,
    totalGiftsGiven: apiUser.total_gifts_given,
    totalGiftsReceived: apiUser.total_gifts_received,
    trustScore: apiUser.trust_score,
    travelDays: apiUser.travel_days,
    visitingUntil: apiUser.visiting_until,
    lastActive: apiUser.last_active,
    createdAt: apiUser.created_at,
    updatedAt: apiUser.updated_at,
  };
}

/**
 * Normalize gift item from API response
 */
export function normalizeGiftItemFromAPI(apiItem: ApiGiftItem): GiftItem {
  const validTypes = ['coffee', 'ticket', 'dinner', 'other'] as const;
  const normalizedType =
    apiItem.type &&
    validTypes.includes(apiItem.type as (typeof validTypes)[number])
      ? (apiItem.type as 'coffee' | 'ticket' | 'dinner' | 'other')
      : undefined;

  return {
    id: apiItem.id,
    placeId: apiItem.place_id ?? apiItem.placeId,
    placeName: apiItem.place_name ?? apiItem.placeName,
    name: apiItem.name ?? apiItem.title ?? 'Unknown Item',
    title: apiItem.title ?? apiItem.name,
    emoji: apiItem.emoji ?? '🎁',
    icon: apiItem.icon,
    category: apiItem.category ?? 'other',
    type: normalizedType,
    typicalPrice: apiItem.typical_price ?? apiItem.typicalPrice,
    description: apiItem.description,
  };
}

/**
 * Normalize gesture from API response
 */
export function normalizeGestureFromAPI(apiGesture: ApiGesture): Gesture {
  return {
    id: apiGesture.id,
    momentId: apiGesture.moment_id,
    giverId: apiGesture.giver_id ?? '',
    receiverId: apiGesture.receiver_id ?? '',
    item:
      apiGesture.item && apiGesture.item.id
        ? normalizeGiftItemFromAPI(apiGesture.item as ApiGiftItem)
        : undefined,
    amount: apiGesture.amount ?? 0,
    amountUSD: apiGesture.amount_usd ?? apiGesture.amount ?? 0,
    currency: apiGesture.currency ?? 'USD',
    tier: apiGesture.tier,
    status: (apiGesture.status ?? apiGesture.state ?? 'pending') as any,
    state: (apiGesture.state ?? apiGesture.status ?? 'pending') as any,
    message: apiGesture.message,
    proof: apiGesture.proof
      ? ({
          id: apiGesture.proof.id,
          type: apiGesture.proof.type ?? '',
          mediaUrl: apiGesture.proof.media_url,
          status: apiGesture.proof.status ?? '',
          createdAt: apiGesture.proof.created_at ?? '',
        } as const)
      : undefined,
    expiresAt: apiGesture.expires_at,
    createdAt: apiGesture.created_at,
    completedAt: apiGesture.completed_at,
    updatedAt: apiGesture.updated_at,
  };
}

/**
 * Normalize place from API response
 */
export function normalizePlaceFromAPI(apiPlace: ApiPlace): Place {
  // Convert numeric distance to formatted string (e.g., "1.5 km")
  const formatDistance = (dist: number | undefined): string | undefined => {
    if (dist === undefined) return undefined;
    if (dist < 1) return `${Math.round(dist * 1000)} m`;
    return `${dist.toFixed(1)} km`;
  };

  return {
    id: apiPlace.id,
    name: apiPlace.name,
    address: apiPlace.address,
    latitude: apiPlace.latitude ?? apiPlace.lat,
    longitude: apiPlace.longitude ?? apiPlace.lng,
    city: apiPlace.city,
    country: apiPlace.country,
    distance: formatDistance(apiPlace.distance),
    logo: apiPlace.logo,
  };
}

/**
 * Normalize message from API response
 */
export function normalizeMessageFromAPI(apiMessage: ApiMessage): Message {
  return {
    id: apiMessage.id,
    conversationId: apiMessage.conversation_id,
    senderId: apiMessage.sender_id,
    receiverId: apiMessage.receiver_id,
    text: apiMessage.text ?? apiMessage.content ?? '',
    content: apiMessage.content ?? apiMessage.text ?? '',
    attachmentUrl: apiMessage.attachment_url,
    timestamp: apiMessage.timestamp,
    isMine: apiMessage.is_mine ?? false,
    read: apiMessage.read ?? false,
    proofId: apiMessage.proof_id,
    createdAt: apiMessage.created_at,
  };
}

/**
 * Normalize proof location from API response
 */
export function normalizeProofLocationFromAPI(
  location: ApiUserLocation | string | undefined,
): ProofLocation | undefined {
  if (!location) return undefined;
  if (typeof location === 'string') {
    // If location is a string, create a minimal ProofLocation with just address
    return {
      latitude: 0,
      longitude: 0,
      lat: 0,
      lng: 0,
      address: location,
      city: undefined,
      country: undefined,
      name: location,
    };
  }

  return {
    latitude: location.latitude ?? location.lat ?? 0,
    longitude: location.longitude ?? location.lng ?? 0,
    lat: location.lat ?? location.latitude,
    lng: location.lng ?? location.longitude,
    address: location.address,
    city: location.city,
    country: location.country,
    name: (location as ApiUserLocation & { name?: string }).name,
  };
}

/**
 * Normalize proof from API response
 */
export function normalizeProofFromAPI(apiProof: ApiProof): Proof {
  return {
    id: apiProof.id,
    momentId: apiProof.moment_id,
    userId: apiProof.user_id,
    type: apiProof.type as any,
    title: apiProof.title,
    description: apiProof.description,
    images: apiProof.image_urls ?? apiProof.images,
    imageUrls: apiProof.images ?? apiProof.image_urls,
    video: apiProof.video,
    mediaUrl: apiProof.media_url,
    location: normalizeProofLocationFromAPI(apiProof.location),
    status: apiProof.status as any,
    verificationMethod: apiProof.verification_method as any,
    verificationStatus: apiProof.verification_status,
    verifiedBy: apiProof.verified_by,
    verifiedAt: apiProof.verified_at,
    rejectionReason: apiProof.rejection_reason,
    aiScore: apiProof.ai_score,
    communityScore: apiProof.community_score,
    trustScore: apiProof.trust_score,
    metadata: apiProof.metadata,
    createdAt: apiProof.created_at ?? null,
    updatedAt: apiProof.updated_at,
  };
}

/**
 * Normalize transaction participant from API response
 */
export function normalizeTransactionParticipantFromAPI(
  participant: Partial<ApiUser> | undefined,
): TransactionParticipant | undefined {
  if (!participant) return undefined;

  return {
    id: participant.id ?? '',
    name: participant.name ?? participant.full_name ?? '',
    avatar: participant.avatar ?? participant.avatar_url,
    avatarUrl: participant.avatar_url ?? participant.avatar,
  };
}

/**
 * Normalize transaction from API response
 */
export function normalizeTransactionFromAPI(
  apiTransaction: ApiTransaction,
): Transaction {
  return {
    id: apiTransaction.id,
    transactionId: apiTransaction.transaction_id ?? apiTransaction.id,
    type: apiTransaction.type as any,
    status: apiTransaction.status as any,
    amount: apiTransaction.amount,
    currency: apiTransaction.currency ?? null,
    senderId: apiTransaction.sender_id,
    receiverId: apiTransaction.receiver_id,
    fromUser: normalizeTransactionParticipantFromAPI(apiTransaction.from_user),
    toUser: normalizeTransactionParticipantFromAPI(apiTransaction.to_user),
    giver: normalizeTransactionParticipantFromAPI(
      apiTransaction.giver ?? apiTransaction.from_user,
    ),
    receiver: normalizeTransactionParticipantFromAPI(
      apiTransaction.receiver ?? apiTransaction.to_user,
    ),
    momentId: apiTransaction.moment_id,
    proofId: apiTransaction.proof_id,
    paymentMethod: apiTransaction.payment_method,
    description: apiTransaction.description,
    stripePaymentIntentId: apiTransaction.stripe_payment_intent_id,
    stripeTransferId: apiTransaction.stripe_transfer_id,
    metadata: apiTransaction.metadata,
    createdAt: apiTransaction.created_at ?? null,
    completedAt: apiTransaction.completed_at ?? null,
    failedAt: apiTransaction.failed_at,
    failureReason: apiTransaction.failure_reason,
  };
}

/**
 * Normalize proof story author from API response
 */
export function normalizeProofStoryAuthorFromAPI(
  author: Partial<ApiUser> | undefined,
): ProofStoryAuthor | undefined {
  if (!author) return undefined;

  return {
    id: author.id ?? '',
    name: author.name ?? author.full_name ?? '',
    avatar: author.avatar ?? author.avatar_url,
    avatarUrl: author.avatar_url ?? author.avatar,
    trustScore: author.trust_score,
  };
}

/**
 * Normalize proof story from API response
 */
export function normalizeProofStoryFromAPI(
  apiStory: ApiProofStory,
): ProofStory {
  // Validate type field
  const validTypes = ['micro-kindness', 'verified-experience'] as const;
  const normalizedType =
    apiStory.type &&
    validTypes.includes(apiStory.type as (typeof validTypes)[number])
      ? (apiStory.type as 'micro-kindness' | 'verified-experience')
      : undefined;

  // Validate media type
  const validMediaTypes = ['image', 'video'] as const;
  const mediaType = apiStory.media_type ?? apiStory.mediaType;
  const normalizedMediaType =
    mediaType &&
    validMediaTypes.includes(mediaType as (typeof validMediaTypes)[number])
      ? (mediaType as 'image' | 'video')
      : undefined;

  return {
    id: apiStory.id,
    proofId: apiStory.proof_id ?? apiStory.proofId ?? apiStory.id,
    userId: apiStory.user_id ?? apiStory.userId,
    type: normalizedType,
    author: normalizeProofStoryAuthorFromAPI(apiStory.author),
    title: apiStory.title,
    description: apiStory.description,
    content: apiStory.content,
    mediaUrl: apiStory.media_url ?? apiStory.mediaUrl,
    mediaType: normalizedMediaType,
    images: apiStory.images,
    location: normalizeProofLocationFromAPI(apiStory.location),
    stats: apiStory.stats
      ? {
          views: apiStory.stats.views,
          likes: apiStory.stats.likes,
          shares: apiStory.stats.shares ?? apiStory.stats.comments,
          comments: apiStory.stats.comments,
        }
      : undefined,
    date: apiStory.date,
    expiresAt: apiStory.expires_at ?? apiStory.expiresAt,
    createdAt: apiStory.created_at ?? apiStory.createdAt ?? null,
  };
}

/**
 * Normalize giver info from API response
 */
export function normalizeGiverInfoFromAPI(
  giver:
    | (Partial<ApiUser> & {
        amount?: number;
        message?: string | number;
        trust_score?: number;
        trustScore?: number;
      })
    | undefined,
): GiverInfo | undefined {
  if (!giver) return undefined;

  return {
    id: giver.id ?? '',
    name: giver.name ?? giver.full_name ?? '',
    avatar: giver.avatar ?? giver.avatar_url,
    avatarUrl: giver.avatar_url ?? giver.avatar,
    amount: giver.amount,
    message:
      typeof giver.message === 'string'
        ? giver.message
        : giver.message?.toString(),
    trustScore: giver.trust_score ?? giver.trustScore,
  };
}

/**
 * Normalize giver slot from API response
 */
export function normalizeGiverSlotFromAPI(apiSlot: ApiGiverSlot): GiverSlot {
  return {
    id: apiSlot.id,
    position: apiSlot.position ?? apiSlot.slot_number,
    slotNumber: apiSlot.slot_number ?? apiSlot.position,
    giver: normalizeGiverInfoFromAPI(apiSlot.giver),
    isFilled: apiSlot.is_filled ?? apiSlot.isFilled ?? !!apiSlot.giver,
    amount: apiSlot.amount ?? apiSlot.amount_contributed,
    amountContributed: apiSlot.amount_contributed ?? apiSlot.amount,
    message: apiSlot.message,
    timestamp: apiSlot.timestamp,
  };
}

/**
 * Normalize moment user from API response
 */
export function normalizeMomentUserFromAPI(
  user: ApiMomentUser | undefined,
): MomentUser | undefined {
  if (!user) return undefined;

  // Validate type field
  const validTypes = ['traveler', 'local'] as const;
  const normalizedType =
    user.type && validTypes.includes(user.type as (typeof validTypes)[number])
      ? (user.type as 'traveler' | 'local')
      : undefined;

  return {
    id: user.id,
    name: user.name ?? '',
    avatar: user.avatar ?? user.avatar_url,
    avatarUrl: user.avatar_url ?? user.avatar,
    role: user.role,
    type: normalizedType,
    location: user.location,
    travelDays: user.travel_days ?? user.travelDays,
    isVerified: user.is_verified ?? user.isVerified,
    visitingUntil: user.visiting_until ?? user.visitingUntil,
  };
}

/**
 * Normalize moment location from API response
 */
export function normalizeMomentLocationFromAPI(
  location: ApiMomentLocation | undefined,
): MomentLocation | undefined {
  if (!location) return undefined;

  // Only include coordinates if both lat and lng are valid numbers
  const lat = location.coordinates?.lat ?? location.coordinates?.latitude;
  const lng = location.coordinates?.lng ?? location.coordinates?.longitude;
  const hasValidCoordinates =
    typeof lat === 'number' && typeof lng === 'number';

  return {
    name: location.name,
    city: location.city,
    country: location.country,
    coordinates: hasValidCoordinates
      ? {
          lat: lat!,
          lng: lng!,
        }
      : undefined,
  };
}

/**
 * Normalize moment from API response
 */
export function normalizeMomentFromAPI(apiMoment: ApiMoment): Moment {
  // Convert numeric distance to formatted string
  const formatDistance = (dist: number | undefined): string | undefined => {
    if (dist === undefined) return undefined;
    if (dist < 1) return `${Math.round(dist * 1000)} m`;
    return `${dist.toFixed(1)} km`;
  };

  // Validate status field
  const validStatuses = [
    'active',
    'pending',
    'completed',
    'paused',
    'draft',
    'deleted',
  ] as const;
  const normalizedStatus =
    apiMoment.status &&
    validStatuses.includes(apiMoment.status as (typeof validStatuses)[number])
      ? (apiMoment.status as
          | 'active'
          | 'pending'
          | 'completed'
          | 'paused'
          | 'draft'
          | 'deleted')
      : undefined;

  // Parse dateRange if it's a string
  const parseDateRange = (
    range: string | { start?: string; end?: string } | undefined,
  ): { start: Date; end: Date } | undefined => {
    if (!range) return undefined;
    if (typeof range === 'string') {
      // Try to parse as JSON or date string
      try {
        const parsed = JSON.parse(range);
        if (parsed.start && parsed.end) {
          return { start: new Date(parsed.start), end: new Date(parsed.end) };
        }
      } catch {
        // Not JSON, might be a single date
        return undefined;
      }
    } else if (range.start && range.end) {
      return { start: new Date(range.start), end: new Date(range.end) };
    }
    return undefined;
  };

  return {
    id: apiMoment.id,
    user: normalizeMomentUserFromAPI(apiMoment.user ?? apiMoment.creator),
    creator: normalizeMomentUserFromAPI(apiMoment.creator ?? apiMoment.user),
    title: apiMoment.title ?? '',
    story: apiMoment.story ?? apiMoment.description,
    description: apiMoment.description ?? apiMoment.story,
    image: apiMoment.image ?? apiMoment.image_url ?? apiMoment.imageUrl,
    imageUrl: apiMoment.image_url ?? apiMoment.imageUrl ?? apiMoment.image,
    images: apiMoment.images,
    price: apiMoment.price ?? apiMoment.price_per_guest ?? 0,
    pricePerGuest:
      apiMoment.price_per_guest ?? apiMoment.pricePerGuest ?? apiMoment.price,
    location: normalizeMomentLocationFromAPI(apiMoment.location),
    place: apiMoment.place,
    availability: apiMoment.availability,
    giftCount: apiMoment.gift_count ?? apiMoment.giftCount,
    distance: formatDistance(apiMoment.distance),
    status: normalizedStatus,
    date: apiMoment.date,
    completedDate: apiMoment.completed_date ?? apiMoment.completedDate,
    rating: apiMoment.rating,
    requestCount: apiMoment.request_count ?? apiMoment.requestCount,
    category: apiMoment.category
      ? {
          id: apiMoment.category.id,
          label: apiMoment.category.label,
          emoji: apiMoment.category.emoji,
        }
      : undefined,
    dateRange: parseDateRange(apiMoment.date_range ?? apiMoment.dateRange),
    createdAt: apiMoment.created_at ?? apiMoment.createdAt,
    updatedAt: apiMoment.updated_at ?? apiMoment.updatedAt,
  };
}

/**
 * Batch normalize functions for arrays
 */
export const normalizeArrayFromAPI = {
  users: (apiUsers: ApiUser[]) => apiUsers.map(normalizeUserFromAPI),
  gestures: (apiGestures: ApiGesture[]) =>
    apiGestures.map(normalizeGestureFromAPI),
  messages: (apiMessages: ApiMessage[]) =>
    apiMessages.map(normalizeMessageFromAPI),
  proofs: (apiProofs: ApiProof[]) => apiProofs.map(normalizeProofFromAPI),
  transactions: (apiTransactions: ApiTransaction[]) =>
    apiTransactions.map(normalizeTransactionFromAPI),
  proofStories: (apiStories: ApiProofStory[]) =>
    apiStories.map(normalizeProofStoryFromAPI),
  giverSlots: (apiSlots: ApiGiverSlot[]) =>
    apiSlots.map(normalizeGiverSlotFromAPI),
  moments: (apiMoments: ApiMoment[]) => apiMoments.map(normalizeMomentFromAPI),
  places: (apiPlaces: ApiPlace[]) => apiPlaces.map(normalizePlaceFromAPI),
};

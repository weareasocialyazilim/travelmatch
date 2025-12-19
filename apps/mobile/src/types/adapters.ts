/**
 * Type Adapters - API Response Normalizers
 *
 * These functions normalize API responses (snake_case) to canonical types (camelCase)
 * from @travelmatch/shared package.
 *
 * @packageDocumentation
 */

import type {
  User,
  UserLocation,
  Gesture,
  GiftItem,
  Place,
  Message,
  Proof,
  ProofLocation,
  Transaction,
  TransactionParticipant,
  ProofStory,
  ProofStoryAuthor,
  GiverSlot,
  GiverInfo,
  Moment,
  MomentUser,
  MomentLocation,
} from '@travelmatch/shared';

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
  location?: any;
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
  item?: any;
  amount?: number;
  amount_usd?: number;
  currency?: string;
  tier?: 'low' | 'mid' | 'high';
  status?: string;
  state?: string;
  message?: string;
  proof?: any;
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
  location?: any;
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
  from_user?: any;
  to_user?: any;
  giver?: any;
  receiver?: any;
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

/**
 * Normalize user location from API response
 */
export function normalizeUserLocationFromAPI(location: ApiUserLocation | string | undefined): UserLocation | string | undefined {
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
    avatarUrl: apiUser.avatar_url ?? apiUser.avatar ?? apiUser.photo_url ?? apiUser.profile_photo,
    phoneNumber: apiUser.phone_number ?? apiUser.phone,
    bio: apiUser.bio,
    role: apiUser.role ?? (apiUser.type === 'traveler' ? 'Traveler' : 'Local'),
    type: apiUser.type,
    kycStatus: apiUser.kyc_status ?? apiUser.kyc ?? 'Unverified',
    isVerified: apiUser.is_verified ?? (apiUser.kyc_status === 'Verified' || apiUser.kyc === 'Verified'),
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
export function normalizeGiftItemFromAPI(apiItem: any): GiftItem {
  return {
    id: apiItem.id,
    placeId: apiItem.place_id ?? apiItem.placeId,
    placeName: apiItem.place_name ?? apiItem.placeName,
    name: apiItem.name ?? apiItem.title,
    title: apiItem.title ?? apiItem.name,
    emoji: apiItem.emoji,
    icon: apiItem.icon,
    category: apiItem.category,
    type: apiItem.type,
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
    item: apiGesture.item ? normalizeGiftItemFromAPI(apiGesture.item) : undefined,
    amount: apiGesture.amount,
    amountUSD: apiGesture.amount_usd ?? apiGesture.amount,
    currency: apiGesture.currency ?? 'USD',
    tier: apiGesture.tier,
    status: (apiGesture.status ?? apiGesture.state ?? 'pending') as any,
    state: (apiGesture.state ?? apiGesture.status ?? 'pending') as any,
    message: apiGesture.message,
    proof: apiGesture.proof ? {
      id: apiGesture.proof.id,
      type: apiGesture.proof.type,
      mediaUrl: apiGesture.proof.media_url ?? apiGesture.proof.mediaUrl,
      status: apiGesture.proof.status,
      createdAt: apiGesture.proof.created_at ?? apiGesture.proof.createdAt,
    } : undefined,
    expiresAt: apiGesture.expires_at,
    createdAt: apiGesture.created_at,
    completedAt: apiGesture.completed_at,
    updatedAt: apiGesture.updated_at,
  };
}

/**
 * Normalize place from API response
 */
export function normalizePlaceFromAPI(apiPlace: any): Place {
  return {
    id: apiPlace.id,
    name: apiPlace.name,
    address: apiPlace.address,
    latitude: apiPlace.latitude ?? apiPlace.lat,
    longitude: apiPlace.longitude ?? apiPlace.lng,
    city: apiPlace.city,
    country: apiPlace.country,
    distance: apiPlace.distance,
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
    text: apiMessage.text ?? apiMessage.content,
    content: apiMessage.content ?? apiMessage.text,
    attachmentUrl: apiMessage.attachment_url,
    timestamp: apiMessage.timestamp,
    isMine: apiMessage.is_mine,
    read: apiMessage.read,
    proofId: apiMessage.proof_id,
    createdAt: apiMessage.created_at,
  };
}

/**
 * Normalize proof location from API response
 */
export function normalizeProofLocationFromAPI(location: any): ProofLocation | string | undefined {
  if (!location) return undefined;
  if (typeof location === 'string') return location;

  return {
    latitude: location.latitude ?? location.lat,
    longitude: location.longitude ?? location.lng,
    lat: location.lat ?? location.latitude,
    lng: location.lng ?? location.longitude,
    address: location.address,
    city: location.city,
    country: location.country,
    name: location.name,
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
export function normalizeTransactionParticipantFromAPI(participant: any): TransactionParticipant | undefined {
  if (!participant) return undefined;

  return {
    id: participant.id,
    name: participant.name,
    avatar: participant.avatar ?? participant.avatar_url,
    avatarUrl: participant.avatar_url ?? participant.avatar,
  };
}

/**
 * Normalize transaction from API response
 */
export function normalizeTransactionFromAPI(apiTransaction: ApiTransaction): Transaction {
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
    giver: normalizeTransactionParticipantFromAPI(apiTransaction.giver ?? apiTransaction.from_user),
    receiver: normalizeTransactionParticipantFromAPI(apiTransaction.receiver ?? apiTransaction.to_user),
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
export function normalizeProofStoryAuthorFromAPI(author: any): ProofStoryAuthor | undefined {
  if (!author) return undefined;

  return {
    id: author.id,
    name: author.name,
    avatar: author.avatar ?? author.avatar_url,
    avatarUrl: author.avatar_url ?? author.avatar,
    trustScore: author.trust_score ?? author.trustScore,
  };
}

/**
 * Normalize proof story from API response
 */
export function normalizeProofStoryFromAPI(apiStory: any): ProofStory {
  return {
    id: apiStory.id,
    proofId: apiStory.proof_id ?? apiStory.proofId,
    userId: apiStory.user_id ?? apiStory.userId,
    type: apiStory.type,
    author: normalizeProofStoryAuthorFromAPI(apiStory.author),
    title: apiStory.title,
    description: apiStory.description,
    content: apiStory.content,
    mediaUrl: apiStory.media_url ?? apiStory.mediaUrl,
    mediaType: apiStory.media_type ?? apiStory.mediaType,
    images: apiStory.images,
    location: normalizeProofLocationFromAPI(apiStory.location),
    stats: apiStory.stats ? {
      views: apiStory.stats.views,
      likes: apiStory.stats.likes,
      shares: apiStory.stats.shares ?? apiStory.stats.comments,
      comments: apiStory.stats.comments,
    } : undefined,
    date: apiStory.date,
    expiresAt: apiStory.expires_at ?? apiStory.expiresAt,
    createdAt: apiStory.created_at ?? apiStory.createdAt ?? null,
  };
}

/**
 * Normalize giver info from API response
 */
export function normalizeGiverInfoFromAPI(giver: any): GiverInfo | undefined {
  if (!giver) return undefined;

  return {
    id: giver.id,
    name: giver.name,
    avatar: giver.avatar ?? giver.avatar_url,
    avatarUrl: giver.avatar_url ?? giver.avatar,
    amount: giver.amount,
    message: giver.message,
    trustScore: giver.trust_score ?? giver.trustScore,
  };
}

/**
 * Normalize giver slot from API response
 */
export function normalizeGiverSlotFromAPI(apiSlot: any): GiverSlot {
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
export function normalizeMomentUserFromAPI(user: any): MomentUser | undefined {
  if (!user) return undefined;

  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar ?? user.avatar_url,
    avatarUrl: user.avatar_url ?? user.avatar,
    role: user.role,
    type: user.type,
    location: user.location,
    travelDays: user.travel_days ?? user.travelDays,
    isVerified: user.is_verified ?? user.isVerified,
    visitingUntil: user.visiting_until ?? user.visitingUntil,
  };
}

/**
 * Normalize moment location from API response
 */
export function normalizeMomentLocationFromAPI(location: any): MomentLocation | undefined {
  if (!location) return undefined;

  return {
    name: location.name,
    city: location.city,
    country: location.country,
    coordinates: location.coordinates ? {
      lat: location.coordinates.lat ?? location.coordinates.latitude,
      lng: location.coordinates.lng ?? location.coordinates.longitude,
    } : undefined,
  };
}

/**
 * Normalize moment from API response
 */
export function normalizeMomentFromAPI(apiMoment: any): Moment {
  return {
    id: apiMoment.id,
    user: normalizeMomentUserFromAPI(apiMoment.user ?? apiMoment.creator),
    creator: normalizeMomentUserFromAPI(apiMoment.creator ?? apiMoment.user),
    title: apiMoment.title,
    story: apiMoment.story ?? apiMoment.description,
    description: apiMoment.description ?? apiMoment.story,
    image: apiMoment.image ?? apiMoment.image_url ?? apiMoment.imageUrl,
    imageUrl: apiMoment.image_url ?? apiMoment.imageUrl ?? apiMoment.image,
    images: apiMoment.images,
    price: apiMoment.price ?? apiMoment.price_per_guest ?? 0,
    pricePerGuest: apiMoment.price_per_guest ?? apiMoment.pricePerGuest ?? apiMoment.price,
    location: normalizeMomentLocationFromAPI(apiMoment.location),
    place: apiMoment.place,
    availability: apiMoment.availability,
    giftCount: apiMoment.gift_count ?? apiMoment.giftCount,
    distance: apiMoment.distance,
    status: apiMoment.status,
    date: apiMoment.date,
    completedDate: apiMoment.completed_date ?? apiMoment.completedDate,
    rating: apiMoment.rating,
    requestCount: apiMoment.request_count ?? apiMoment.requestCount,
    category: apiMoment.category ? {
      id: apiMoment.category.id,
      label: apiMoment.category.label,
      emoji: apiMoment.category.emoji,
    } : undefined,
    dateRange: apiMoment.date_range ?? apiMoment.dateRange,
    createdAt: apiMoment.created_at ?? apiMoment.createdAt,
    updatedAt: apiMoment.updated_at ?? apiMoment.updatedAt,
  };
}

/**
 * Batch normalize functions for arrays
 */
export const normalizeArrayFromAPI = {
  users: (apiUsers: ApiUser[]) => apiUsers.map(normalizeUserFromAPI),
  gestures: (apiGestures: ApiGesture[]) => apiGestures.map(normalizeGestureFromAPI),
  messages: (apiMessages: ApiMessage[]) => apiMessages.map(normalizeMessageFromAPI),
  proofs: (apiProofs: ApiProof[]) => apiProofs.map(normalizeProofFromAPI),
  transactions: (apiTransactions: ApiTransaction[]) => apiTransactions.map(normalizeTransactionFromAPI),
  proofStories: (apiStories: any[]) => apiStories.map(normalizeProofStoryFromAPI),
  giverSlots: (apiSlots: any[]) => apiSlots.map(normalizeGiverSlotFromAPI),
  moments: (apiMoments: any[]) => apiMoments.map(normalizeMomentFromAPI),
  places: (apiPlaces: any[]) => apiPlaces.map(normalizePlaceFromAPI),
};

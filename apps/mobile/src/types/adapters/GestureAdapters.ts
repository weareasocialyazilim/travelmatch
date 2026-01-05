/**
 * Gesture & Gift Adapters
 *
 * Normalizes Gesture and GiftItem API responses (snake_case) to canonical types (camelCase)
 */

// ============================================
// TYPES
// ============================================

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

// ============================================
// API TYPES (snake_case from backend)
// ============================================

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

export interface ApiGesture {
  id: string;
  moment_id?: string;
  giver_id?: string;
  receiver_id?: string;
  item?: Partial<ApiGiftItem>;
  amount?: number;
  amount_usd?: number;
  currency?: string;
  tier?: 'low' | 'mid' | 'high';
  status?: string;
  state?: string;
  message?: string;
  proof?: {
    id: string;
    type?: string;
    media_url?: string;
    status?: string;
    created_at?: string;
  };
  expires_at?: string;
  created_at?: string;
  completed_at?: string;
  updated_at?: string;
}

// ============================================
// NORMALIZER FUNCTIONS
// ============================================

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
    status: (apiGesture.status ??
      apiGesture.state ??
      'pending') as Gesture['status'],
    state: apiGesture.state ?? apiGesture.status ?? 'pending',
    message: apiGesture.message,
    proof: apiGesture.proof
      ? {
          id: apiGesture.proof.id,
          type: apiGesture.proof.type ?? '',
          mediaUrl: apiGesture.proof.media_url,
          status: apiGesture.proof.status ?? '',
          createdAt: apiGesture.proof.created_at ?? '',
        }
      : undefined,
    expiresAt: apiGesture.expires_at,
    createdAt: apiGesture.created_at,
    completedAt: apiGesture.completed_at,
    updatedAt: apiGesture.updated_at,
  };
}

/**
 * Normalize array of gestures from API
 */
export function normalizeGesturesFromAPI(apiGestures: ApiGesture[]): Gesture[] {
  return apiGestures.map(normalizeGestureFromAPI);
}

/**
 * Normalize array of gift items from API
 */
export function normalizeGiftItemsFromAPI(apiItems: ApiGiftItem[]): GiftItem[] {
  return apiItems.map(normalizeGiftItemFromAPI);
}

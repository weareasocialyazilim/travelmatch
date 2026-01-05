/**
 * Type Adapters - Entry Point
 *
 * Re-exports all adapter functions from modular files.
 * These functions normalize API responses (snake_case) to canonical types (camelCase)
 *
 * Modular structure:
 * - UserAdapters: User, UserLocation normalization
 * - GestureAdapters: Gesture, GiftItem normalization
 * - PlaceAdapters: Place normalization
 * - MessageAdapters: Message normalization
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

// ============================================
// USER ADAPTERS
// ============================================

export {
  type User,
  type UserLocation,
  type ApiUser,
  type ApiUserLocation,
  normalizeUserFromAPI,
  normalizeUserLocationFromAPI,
  normalizeUsersFromAPI,
} from './UserAdapters';

// ============================================
// GESTURE ADAPTERS
// ============================================

export {
  type Gesture,
  type GiftItem,
  type ApiGesture,
  type ApiGiftItem,
  normalizeGestureFromAPI,
  normalizeGiftItemFromAPI,
  normalizeGesturesFromAPI,
  normalizeGiftItemsFromAPI,
} from './GestureAdapters';

// ============================================
// PLACE ADAPTERS
// ============================================

export {
  type Place,
  type ApiPlace,
  normalizePlaceFromAPI,
  normalizePlacesFromAPI,
} from './PlaceAdapters';

// ============================================
// MESSAGE ADAPTERS
// ============================================

export {
  type Message,
  type ApiMessage,
  normalizeMessageFromAPI,
  normalizeMessagesFromAPI,
} from './MessageAdapters';

// ============================================
// BATCH NORMALIZE (For backward compatibility)
// ============================================

import { normalizeUsersFromAPI } from './UserAdapters';
import { normalizeGesturesFromAPI } from './GestureAdapters';
import { normalizePlacesFromAPI } from './PlaceAdapters';
import { normalizeMessagesFromAPI } from './MessageAdapters';

export const normalizeArrayFromAPI = {
  users: normalizeUsersFromAPI,
  gestures: normalizeGesturesFromAPI,
  places: normalizePlacesFromAPI,
  messages: normalizeMessagesFromAPI,
};

/**
 * TypeScript Types
 * All shared type definitions for Lovendo
 */

// Core types - but exclude KYCStatus to avoid conflict with enums
export type {
  Role,
  UserLocation,
  User,
  GiftItem,
  Gesture,
  Place,
  MomentLocation,
  MomentUser,
  Moment,
} from './core';

// Domain types - but exclude duplicates that are in enums
export type {
  Message,
  ProofLocation,
  Proof,
  TransactionParticipant,
  Transaction,
  ProofStoryAuthor,
  ProofStoryStats,
  ProofStory,
  GiverInfo,
  GiverSlot,
} from './domain';

// Enums - single source of truth for status types
export * from './enums';

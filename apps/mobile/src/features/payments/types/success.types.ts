/**
 * Success Screen Types
 * Separated to avoid circular dependency with routeParams
 */

export type SuccessType =
  | 'card_added'
  | 'card_removed'
  | 'cache_cleared'
  | 'gift_sent'
  | 'withdraw'
  | 'withdrawal'
  | 'payment'
  | 'review'
  | 'dispute'
  | 'proof_uploaded'
  | 'proof_approved'
  | 'profile_complete'
  | 'offer'
  | 'generic';

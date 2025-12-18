/**
 * Domain Types - Mobile App
 *
 * Re-exports canonical types from @travelmatch/shared package.
 * Use adapters.ts to normalize API responses to these types.
 *
 * @see {@link @travelmatch/shared/types/domain} for canonical definitions
 * @see {@link ./adapters} for API normalization functions
 */

// Re-export all domain types from shared package
export type {
  Message,
  ProofType,
  ProofStatus,
  ProofLocation,
  Proof,
  TransactionType,
  TransactionStatus,
  TransactionParticipant,
  Transaction,
  ProofStoryAuthor,
  ProofStoryStats,
  ProofStory,
  GiverInfo,
  GiverSlot,
  MomentLocation,
  MomentUser,
  MomentCategory,
  Moment,
} from '@travelmatch/shared';

/**
 * Mobile-specific domain types
 * These types are specific to mobile UI and not shared with other platforms
 */

/**
 * Moment data with guaranteed MomentUser (not full User)
 * Used in contexts where we know we have simplified user data
 */
export interface MomentData {
  id: string;
  user: import('@travelmatch/shared').MomentUser;
  creator?: import('@travelmatch/shared').MomentUser;
  title: string;
  story?: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  images?: string[];
  price: number;
  pricePerGuest?: number;
  location?: import('@travelmatch/shared').MomentLocation;
  place?: string;
  availability?: string;
  giftCount?: number;
  distance?: string;
  status?: 'active' | 'pending' | 'completed' | 'paused' | 'draft' | 'deleted';
  date?: string;
  completedDate?: string;
  rating?: number;
  requestCount?: number;
  category?: import('@travelmatch/shared').MomentCategory;
  dateRange?: {
    start: Date;
    end: Date;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Selected giver in moment creation/editing flow
 * UI-specific type for giver selection
 */
export interface SelectedGiver {
  id: string;
  name: string;
  avatar: string;
  amount: number;
}

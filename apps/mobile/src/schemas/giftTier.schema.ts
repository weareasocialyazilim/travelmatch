/**
 * Gift Tier Schema - 0-30-100 Barem Kuralları
 * TravelMatch Master UX System
 *
 * Bu schema, hediye miktarına göre chat ve onay kurallarını
 * backend'e gitmeden önce Zod ile doğrular.
 *
 * TIER RULES:
 * - Tier 1 (0-30$): Chat yok, sadece Bulk Thank You
 * - Tier 2 (30-100$): Chat aday, host "Sohbeti Başlat" onayı gerekli
 * - Tier 3 (100$+): Premium teklif, gümüş parıltılı, yine onay gerekli
 *
 * SPECIAL RULES:
 * - 20% Bonus: İstenen miktarın %20 üstü → erken chat unlock (Premium/Platinum)
 * - Subscriber Boost: Premium/Platinum üyelerin teklifleri öne çıkar
 *
 * @module schemas/giftTier.schema
 */

import { z } from 'zod';
import { VALUES } from '@/constants/values';

// =============================================================================
// CHAT TIER ENUM & CONSTANTS
// =============================================================================

/**
 * Chat eligibility tiers based on gift amount
 */
export const ChatTierSchema = z.enum(['none', 'candidate', 'premium']);
export type ChatTier = z.infer<typeof ChatTierSchema>;

/**
 * Tier thresholds in USD
 */
export const TIER_THRESHOLDS = {
  /** 0-30$: No chat, bulk thank you only */
  NONE_MAX: VALUES.ESCROW_THRESHOLDS.DIRECT_MAX, // $30
  /** 30-100$: Chat candidate, requires host approval */
  CANDIDATE_MAX: VALUES.ESCROW_THRESHOLDS.OPTIONAL_MAX, // $100
  /** 100$+: Premium offer, highlighted */
  PREMIUM_MIN: VALUES.ESCROW_THRESHOLDS.OPTIONAL_MAX, // $100
  /** Bonus threshold: 20% above requested amount unlocks early chat */
  BONUS_MULTIPLIER: 1.2,
} as const;

// =============================================================================
// GIFT AMOUNT VALIDATION
// =============================================================================

/**
 * Gift amount schema with tier-aware validation
 */
export const GiftAmountSchema = z.object({
  /** Gift amount in USD */
  amount: z
    .number()
    .positive('Hediye miktarı pozitif olmalı')
    .min(1, 'Minimum hediye: $1'),

  /** Original requested amount (for bonus calculation) */
  requestedAmount: z.number().positive().optional(),

  /** Currency code */
  currency: z.enum(['USD', 'TRY', 'EUR', 'GBP']).default('USD'),
});

export type GiftAmount = z.infer<typeof GiftAmountSchema>;

// =============================================================================
// CHAT ELIGIBILITY SCHEMA
// =============================================================================

/**
 * Full chat eligibility schema
 */
export const ChatEligibilitySchema = z.object({
  /** Determined tier based on amount */
  tier: ChatTierSchema,

  /** Whether chat is technically possible */
  canChat: z.boolean(),

  /** Whether host approval is required */
  requiresApproval: z.boolean(),

  /** English description */
  message: z.string(),

  /** Turkish description */
  messageTR: z.string(),
});

export type ChatEligibility = z.infer<typeof ChatEligibilitySchema>;

// =============================================================================
// GIFT TIER DETERMINATION
// =============================================================================

/**
 * Gift tier request schema
 */
export const GiftTierRequestSchema = z.object({
  /** Gift amount in USD */
  amountUSD: z.number().nonnegative(),

  /** Sender's subscription tier */
  senderTier: z.enum(['free', 'premium', 'platinum']).optional(),

  /** Original requested amount for bonus check */
  requestedAmount: z.number().nonnegative().optional(),
});

export type GiftTierRequest = z.infer<typeof GiftTierRequestSchema>;

/**
 * Determine chat tier from gift amount
 * This is the Zod-validated version of determineChatTier
 */
export const determineTierFromAmount = (amountUSD: number): ChatTier => {
  if (amountUSD < TIER_THRESHOLDS.NONE_MAX) {
    return 'none';
  }
  if (amountUSD < TIER_THRESHOLDS.CANDIDATE_MAX) {
    return 'candidate';
  }
  return 'premium';
};

/**
 * Check if gift qualifies for early chat unlock (20% bonus rule)
 */
export const hasEarlyUnlockBonus = (
  amount: number,
  requestedAmount?: number,
): boolean => {
  if (!requestedAmount || requestedAmount <= 0) return false;
  return amount >= requestedAmount * TIER_THRESHOLDS.BONUS_MULTIPLIER;
};

/**
 * Full gift tier validation with eligibility result
 */
export const validateGiftTier = (request: GiftTierRequest): ChatEligibility => {
  // Validate input
  const parsed = GiftTierRequestSchema.parse(request);
  const { amountUSD, senderTier, requestedAmount } = parsed;

  // Determine base tier
  const tier = determineTierFromAmount(amountUSD);

  // Check for early unlock bonus (Premium/Platinum with 20%+ bonus)
  const hasBonus = hasEarlyUnlockBonus(amountUSD, requestedAmount);
  const isSubscriber = senderTier === 'premium' || senderTier === 'platinum';
  const earlyUnlock = hasBonus && isSubscriber;

  // Build eligibility response
  switch (tier) {
    case 'none':
      return {
        tier: 'none',
        canChat: false,
        requiresApproval: false,
        message: 'Gifts under $30 receive bulk thank you messages only',
        messageTR: '30$ altı hediyeler sadece toplu teşekkür mesajı alır',
      };

    case 'candidate':
      return {
        tier: 'candidate',
        canChat: true,
        requiresApproval: !earlyUnlock, // Early unlock skips approval
        message: earlyUnlock
          ? 'Generous offer! Chat unlocked immediately'
          : 'Chat available if host approves',
        messageTR: earlyUnlock
          ? 'Cömert teklif! Sohbet hemen açıldı'
          : 'Host "Sohbeti Başlat" derse chat açılabilir',
      };

    case 'premium':
      return {
        tier: 'premium',
        canChat: true,
        requiresApproval: !earlyUnlock, // Early unlock skips approval
        message: 'Premium offer - Chat available with host approval',
        messageTR: 'Premium teklif - Host onayı ile chat açılabilir',
      };
  }
};

// =============================================================================
// UI CONFIG SCHEMAS
// =============================================================================

/**
 * Tier badge configuration for UI rendering
 */
export const TierBadgeConfigSchema = z.object({
  label: z.string(),
  icon: z.string(),
  color: z.string(),
  bgColor: z.string(),
  shimmer: z.boolean().optional(),
});

export type TierBadgeConfig = z.infer<typeof TierBadgeConfigSchema>;

/**
 * Get badge config for a tier
 */
export const getTierBadgeConfig = (tier: ChatTier): TierBadgeConfig => {
  switch (tier) {
    case 'none':
      return {
        label: 'Sadece Teşekkür',
        icon: 'gift-outline',
        color: '#9CA3AF',
        bgColor: 'rgba(156, 163, 175, 0.15)',
        shimmer: false,
      };
    case 'candidate':
      return {
        label: 'Chat Adayı',
        icon: 'message-badge-outline',
        color: '#7B61FF',
        bgColor: 'rgba(123, 97, 255, 0.15)',
        shimmer: false,
      };
    case 'premium':
      return {
        label: 'Premium Teklif',
        icon: 'crown',
        color: '#FFB800',
        bgColor: 'rgba(255, 184, 0, 0.15)',
        shimmer: true, // Gümüş parıltı
      };
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  ChatTierSchema,
  GiftAmountSchema,
  ChatEligibilitySchema,
  GiftTierRequestSchema,
  TierBadgeConfigSchema,
  TIER_THRESHOLDS,
  determineTierFromAmount,
  hasEarlyUnlockBonus,
  validateGiftTier,
  getTierBadgeConfig,
};

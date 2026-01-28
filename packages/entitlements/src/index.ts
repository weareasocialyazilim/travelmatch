export type PlanTier = 'GUEST' | 'FREE' | 'PAID' | 'VIP';

export type BackendTier = 'free' | 'premium' | 'platinum';

// Tier mapping from backend tiers to package tiers
const TIER_MAPPING: Record<BackendTier, PlanTier> = {
  free: 'FREE',
  premium: 'PAID',
  platinum: 'VIP',
};

export type Entitlements = {
  tier: PlanTier;
  backendTier: BackendTier;

  canChangeLocation: boolean;

  maxRadiusKm: number;
  canUseAdvancedFilters: boolean;

  canClaim: boolean;
  canGift: boolean;
  canChatUnlock: boolean;

  canViewFullDetails: boolean;

  // Membership-specific
  dailyOffers: number;
  counterOffers: boolean;
  visibilityBoost: number;
};

export const getEntitlements = (backendTier: BackendTier): Entitlements => {
  const tier = TIER_MAPPING[backendTier] || 'FREE';

  switch (tier) {
    case 'GUEST':
      return {
        tier,
        backendTier: 'free',
        canChangeLocation: false,
        maxRadiusKm: 5,
        canUseAdvancedFilters: false,
        canClaim: false,
        canGift: false,
        canChatUnlock: false,
        canViewFullDetails: false,
        dailyOffers: 0,
        counterOffers: false,
        visibilityBoost: 1.0,
      };
    case 'FREE':
      return {
        tier,
        backendTier: 'free',
        canChangeLocation: false,
        maxRadiusKm: 10,
        canUseAdvancedFilters: false,
        canClaim: true,
        canGift: true,
        canChatUnlock: false,
        canViewFullDetails: true,
        dailyOffers: 3,
        counterOffers: false,
        visibilityBoost: 1.0,
      };
    case 'PAID':
      return {
        tier,
        backendTier: 'premium',
        canChangeLocation: true,
        maxRadiusKm: 50,
        canUseAdvancedFilters: true,
        canClaim: true,
        canGift: true,
        canChatUnlock: true,
        canViewFullDetails: true,
        dailyOffers: 5,
        counterOffers: true,
        visibilityBoost: 1.2,
      };
    case 'VIP':
      return {
        tier,
        backendTier: 'platinum',
        canChangeLocation: true,
        maxRadiusKm: 200,
        canUseAdvancedFilters: true,
        canClaim: true,
        canGift: true,
        canChatUnlock: true,
        canViewFullDetails: true,
        dailyOffers: 8,
        counterOffers: true,
        visibilityBoost: 1.4,
      };
  }
};

export type PlanTier = 'GUEST' | 'FREE' | 'PAID' | 'VIP';

export type Entitlements = {
  tier: PlanTier;

  canChangeLocation: boolean;

  maxRadiusKm: number;
  canUseAdvancedFilters: boolean;

  canClaim: boolean;
  canGift: boolean;
  canChatUnlock: boolean;

  canViewFullDetails: boolean;
};

export const getEntitlements = (tier: PlanTier): Entitlements => {
  switch (tier) {
    case 'GUEST':
      return {
        tier,
        canChangeLocation: false,
        maxRadiusKm: 5,
        canUseAdvancedFilters: false,
        canClaim: false,
        canGift: false,
        canChatUnlock: false,
        canViewFullDetails: false,
      };
    case 'FREE':
      return {
        tier,
        canChangeLocation: false, // kesin
        maxRadiusKm: 10,
        canUseAdvancedFilters: false,
        canClaim: true,
        canGift: true,
        canChatUnlock: false,
        canViewFullDetails: true,
      };
    case 'PAID':
      return {
        tier,
        canChangeLocation: true,
        maxRadiusKm: 50,
        canUseAdvancedFilters: true,
        canClaim: true,
        canGift: true,
        canChatUnlock: true,
        canViewFullDetails: true,
      };
    case 'VIP':
      return {
        tier,
        canChangeLocation: true,
        maxRadiusKm: 200,
        canUseAdvancedFilters: true,
        canClaim: true,
        canGift: true,
        canChatUnlock: true,
        canViewFullDetails: true,
      };
  }
};

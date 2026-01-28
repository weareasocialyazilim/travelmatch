/**
 * Payment Plans Constants
 *
 * Moment Subscription Tiers:
 * - Basic ($0): Free tier for starters
 * - Premium ($10): Enhanced features for active users
 * - Platinum ($25): Unlimited experience with all features unlocked
 *
 * Moment is a peer-to-peer experience sharing and gifting marketplace.
 * Core features: Moments (experiences), Messaging, Gifts, Trust/Verification
 */

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanLimits {
  momentsPerMonth: number; // -1 = unlimited
  messagesPerDay: number; // -1 = unlimited
  giftsPerMonth: number; // -1 = unlimited
  savedMoments: number; // -1 = unlimited
  photoPerMoment: number; // max photos per moment
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: PlanFeature[];
  limits: PlanLimits;
  popular?: boolean;
  icon: string; // MaterialCommunityIcons name
  color: string; // hex color for plan accent
}

// Alias for backward compatibility
export type Plan = SubscriptionPlan;

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Standart',
    tagline: 'Temel gifting deneyimi',
    price: 0,
    currency: 'TRY',
    interval: 'month',
    icon: 'star-four-points',
    color: '#6B7280', // gray
    limits: {
      momentsPerMonth: 3,
      messagesPerDay: 20,
      giftsPerMonth: 5,
      savedMoments: 10,
      photoPerMoment: 5,
    },
    features: [
      { text: '3 moment/ay', included: true },
      { text: 'Günlük 3 offer', included: true },
      { text: 'Standart görünürlük', included: true },
      { text: 'Standart moderasyon', included: true },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Daha fazla olanak, daha hızlı deneyim',
    price: 149,
    currency: 'TRY',
    interval: 'month',
    popular: true,
    icon: 'star',
    color: '#3B82F6', // blue
    limits: {
      momentsPerMonth: 10,
      messagesPerDay: -1,
      giftsPerMonth: 25,
      savedMoments: 50,
      photoPerMoment: 10,
    },
    features: [
      { text: '10 moment/ay', included: true },
      { text: 'Günlük 5 offer', included: true },
      { text: 'Counter-offer yapabilme', included: true },
      { text: '%10 offer indirimi', included: true },
      { text: 'Hızlı moderasyon', included: true },
      { text: '1.2x görünürlük artışı', included: true },
    ],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    tagline: 'En kapsamlı deneyim, VIP ayrıcalıkları',
    price: 299,
    currency: 'TRY',
    interval: 'month',
    icon: 'crown',
    color: '#F59E0B', // gold
    limits: {
      momentsPerMonth: -1,
      messagesPerDay: -1,
      giftsPerMonth: -1,
      savedMoments: -1,
      photoPerMoment: 20,
    },
    features: [
      { text: 'Sınırsız moment', included: true },
      { text: 'Günlük 8 offer', included: true },
      { text: 'Counter-offer yapabilme', included: true },
      { text: '%20 offer indirimi', included: true },
      { text: 'Öncelikli moderasyon', included: true },
      { text: '1.4x görünürlük artışı', included: true },
      { text: 'Concierge destek', included: true },
      { text: 'VIP rozet', included: true },
    ],
  },
];

// Alias for backward compatibility
export const PLANS = SUBSCRIPTION_PLANS;

export const getPlanById = (id: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id);
};

export const getPopularPlan = (): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find((plan) => plan.popular);
};

export const getFreePlan = (): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find((plan) => plan.price === 0);
};

export const getPremiumPlans = (): SubscriptionPlan[] => {
  return SUBSCRIPTION_PLANS.filter((plan) => plan.price > 0);
};

/**
 * Check if a feature is available for a given plan
 */
export const isPlanFeatureAvailable = (
  planId: string,
  featureText: string,
): boolean => {
  const plan = getPlanById(planId);
  if (!plan) return false;
  const feature = plan.features.find((f) =>
    f.text.toLowerCase().includes(featureText.toLowerCase()),
  );
  return feature?.included ?? false;
};

/**
 * Get limit value for a plan
 * Returns -1 for unlimited, actual number for limited
 */
export const getPlanLimit = (
  planId: string,
  limitKey: keyof PlanLimits,
): number => {
  const plan = getPlanById(planId);
  if (!plan) return 0;
  return plan.limits[limitKey];
};

/**
 * Format limit for display
 */
export const formatLimit = (value: number): string => {
  return value === -1 ? 'Unlimited' : value.toString();
};

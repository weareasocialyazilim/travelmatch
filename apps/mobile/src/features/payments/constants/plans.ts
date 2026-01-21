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
    id: 'basic',
    name: 'Momentum',
    tagline: 'Start sharing moments',
    price: 0,
    currency: 'USD',
    interval: 'month',
    icon: 'star-four-points',
    color: '#6B7280', // gray
    limits: {
      momentsPerMonth: 3,
      messagesPerDay: 20,
      giftsPerMonth: 1,
      savedMoments: 10,
      photoPerMoment: 5,
    },
    features: [
      { text: '3 moments per month', included: true },
      { text: '20 messages per day', included: true },
      { text: 'Para Çekme Komisyonu %15', included: true },
      { text: 'TrustGarden Hızı Standart', included: true },
      { text: 'Basic filters', included: true },
    ],
  },
  {
    id: 'premium',
    name: 'PRO (Support)',
    tagline: 'More moments, more magic',
    price: 249.99,
    currency: 'TRY',
    interval: 'month',
    popular: true,
    icon: 'star',
    color: '#3B82F6', // blue
    limits: {
      momentsPerMonth: 15,
      messagesPerDay: -1,
      giftsPerMonth: 10,
      savedMoments: 50,
      photoPerMoment: 10,
    },
    features: [
      { text: 'Aylık 50 LVND Hediye', included: true },
      { text: 'Para Çekme Komisyonu %10', included: true },
      { text: 'TrustScore Bonusu +25/Ay', included: true },
      { text: 'Gümüş (Pro) Rozet', included: true },
      { text: '1.5x TrustGarden Hızı', included: true },
      { text: 'LVND Satın Alma İndirimi %5', included: true },
    ],
  },
  {
    id: 'platinum',
    name: 'ELITE (VIP)',
    tagline: 'The ultimate experience',
    price: 749.99,
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
      { text: 'Aylık 150 LVND Hediye', included: true },
      { text: 'Para Çekme Komisyonu %5', included: true },
      { text: 'TrustScore Bonusu +100/Ay', included: true },
      { text: 'Altın (Elite) Rozet', included: true },
      { text: '3x TrustGarden Hızı', included: true },
      { text: 'LVND Satın Alma İndirimi %10', included: true },
      { text: '7/24 VIP Destek', included: true },
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

/**
 * Payment Plans Constants
 *
 * TravelMatch Subscription Tiers:
 * - Passport ($0): Free tier for casual explorers
 * - First Class ($10): Enhanced features for serious travelers
 * - Concierge ($25): Premium experience with all features unlocked
 *
 * TravelMatch is a peer-to-peer travel experience marketplace.
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
    id: 'passport',
    name: 'Passport',
    tagline: 'Start your journey',
    price: 0,
    currency: 'USD',
    interval: 'month',
    icon: 'passport',
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
      { text: '1 gift per month', included: true },
      { text: '10 saved moments', included: true },
      { text: '5 photos per moment', included: true },
      { text: 'Basic filters (category, sort)', included: true },
      { text: 'Distance & price filters', included: false },
      { text: 'Verified badge', included: false },
      { text: 'Incognito mode', included: false },
    ],
  },
  {
    id: 'first_class',
    name: 'First Class',
    tagline: 'Travel in style',
    price: 10,
    currency: 'USD',
    interval: 'month',
    popular: true,
    icon: 'airplane-takeoff',
    color: '#3B82F6', // blue
    limits: {
      momentsPerMonth: 15,
      messagesPerDay: -1, // unlimited
      giftsPerMonth: 10,
      savedMoments: 50,
      photoPerMoment: 10,
    },
    features: [
      { text: '15 moments per month', included: true },
      { text: 'Unlimited messages', included: true },
      { text: '10 gifts per month', included: true },
      { text: '50 saved moments', included: true },
      { text: '10 photos per moment', included: true },
      { text: 'All discovery filters', included: true },
      { text: 'Verified badge', included: false },
      { text: 'Incognito mode', included: false },
    ],
  },
  {
    id: 'concierge',
    name: 'Concierge',
    tagline: 'The ultimate experience',
    price: 25,
    currency: 'USD',
    interval: 'month',
    icon: 'crown',
    color: '#F59E0B', // gold
    limits: {
      momentsPerMonth: -1, // unlimited
      messagesPerDay: -1, // unlimited
      giftsPerMonth: -1, // unlimited
      savedMoments: -1, // unlimited
      photoPerMoment: 20,
    },
    features: [
      { text: 'Unlimited moments', included: true },
      { text: 'Unlimited messages', included: true },
      { text: 'Unlimited gifts', included: true },
      { text: 'Unlimited saved moments', included: true },
      { text: '20 photos per moment', included: true },
      { text: 'All discovery filters', included: true },
      { text: 'Verified badge', included: true },
      { text: 'Incognito mode', included: true },
      { text: 'Early access to features', included: true },
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

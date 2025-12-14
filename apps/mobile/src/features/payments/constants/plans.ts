/**
 * Payment Plans Constants
 */

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: PlanFeature[];
  popular?: boolean;
}

// Alias for backward compatibility
export type Plan = SubscriptionPlan;

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      { text: '3 moments per month', included: true },
      { text: 'Basic matching', included: true },
      { text: 'Community support', included: true },
      { text: 'Priority matching', included: false },
      { text: 'Unlimited moments', included: false },
      { text: 'Verified badge', included: false },
    ],
  },
  {
    id: 'pro_monthly',
    name: 'Pro',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    popular: true,
    features: [
      { text: 'Unlimited moments', included: true },
      { text: 'Priority matching', included: true },
      { text: 'Verified badge', included: true },
      { text: '24/7 support', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: 'Custom branding', included: false },
    ],
  },
  {
    id: 'pro_yearly',
    name: 'Pro (Annual)',
    price: 99.99,
    currency: 'USD',
    interval: 'year',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: '2 months free', included: true },
      { text: 'Custom branding', included: true },
      { text: 'API access', included: true },
      { text: 'Dedicated support', included: true },
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

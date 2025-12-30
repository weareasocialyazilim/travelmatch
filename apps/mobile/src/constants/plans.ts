import { COLORS } from './colors';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/**
 * TravelMatch Subscription Plans
 * "Cinematic Trust Jewelry" - Travel-themed tier naming
 *
 * Passport → Free (Basic traveler)
 * First Class → $10/month (Frequent traveler)
 * Concierge → $25/month (VIP traveler)
 */

export interface PlanLimits {
  momentsPerMonth: number; // -1 = unlimited
  messagesPerDay: number; // -1 = unlimited
  giftsPerMonth: number; // -1 = unlimited
  savedMoments: number; // -1 = unlimited
  photosPerMoment: number;
}

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: PlanFeature[];
  limits: PlanLimits;
  popular?: boolean;
  color: string;
  icon: IconName;
}

export const SUBSCRIPTION_PLANS: Plan[] = [
  {
    id: 'passport',
    name: 'Passport',
    tagline: 'Start your journey',
    price: 0,
    currency: 'USD',
    interval: 'month',
    color: '#6B7280', // Gray
    icon: 'passport',
    limits: {
      momentsPerMonth: 3,
      messagesPerDay: 20,
      giftsPerMonth: 1,
      savedMoments: 10,
      photosPerMoment: 5,
    },
    features: [
      { text: '3 moments per month', included: true },
      { text: '20 messages per day', included: true },
      { text: '1 gift per month', included: true },
      { text: 'Basic trust score', included: true },
      { text: 'Verified badge', included: false },
      { text: 'Incognito mode', included: false },
      { text: 'Priority support', included: false },
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
    color: '#3B82F6', // Blue
    icon: 'airplane-takeoff',
    limits: {
      momentsPerMonth: 15,
      messagesPerDay: -1, // Unlimited
      giftsPerMonth: 10,
      savedMoments: 50,
      photosPerMoment: 10,
    },
    features: [
      { text: '15 moments per month', included: true },
      { text: 'Unlimited messages', included: true },
      { text: '10 gifts per month', included: true },
      { text: 'Enhanced trust score', included: true },
      { text: 'Verified badge', included: false },
      { text: 'Incognito mode', included: false },
      { text: 'Priority support', included: true },
    ],
  },
  {
    id: 'concierge',
    name: 'Concierge',
    tagline: 'The ultimate experience',
    price: 25,
    currency: 'USD',
    interval: 'month',
    color: '#F59E0B', // Amber/Gold
    icon: 'crown',
    limits: {
      momentsPerMonth: -1, // Unlimited
      messagesPerDay: -1, // Unlimited
      giftsPerMonth: -1, // Unlimited
      savedMoments: -1, // Unlimited
      photosPerMoment: 20,
    },
    features: [
      { text: 'Unlimited moments', included: true },
      { text: 'Unlimited messages', included: true },
      { text: 'Unlimited gifts', included: true },
      { text: 'Premium trust score', included: true },
      { text: 'Verified badge', included: true },
      { text: 'Incognito mode', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early access to features', included: true },
    ],
  },
];

// Legacy export for backwards compatibility
export const PLANS = SUBSCRIPTION_PLANS;

// Default limits for free tier
export const DEFAULT_LIMITS: PlanLimits = SUBSCRIPTION_PLANS[0].limits;

// Helper to get plan by id
export const getPlanById = (id: string): Plan | undefined => {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === id);
};

// Helper to check if limit allows action (-1 = unlimited)
export const checkLimit = (current: number, limit: number): boolean => {
  if (limit === -1) return true;
  return current < limit;
};

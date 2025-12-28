import { COLORS } from './colors';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  color: string;
  icon: IconName;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    color: COLORS.text.secondary,
    icon: 'gift',
    features: [
      '3 gestures per month',
      'Basic proof verification',
      'Community access',
      'Profile with Trust Score',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 10,
    interval: 'month',
    color: COLORS.brand.primary,
    icon: 'rocket',
    features: [
      '10 gestures per month',
      'Priority proof verification',
      'Advanced analytics',
      'Badge & recognition',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 25,
    interval: 'month',
    popular: true,
    color: COLORS.brand.accent,
    icon: 'star',
    features: [
      'Unlimited gestures',
      'Instant verification',
      'Premium analytics',
      'Featured profile',
      'Priority support',
      'API access',
      'Custom branding',
    ],
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 50,
    interval: 'month',
    color: COLORS.feedback.warning,
    icon: 'crown',
    features: [
      'All Pro features',
      'Dedicated account manager',
      'White-label solution',
      'Custom integrations',
      'Enterprise support',
      'Exclusive events access',
      'Partnership opportunities',
    ],
  },
];

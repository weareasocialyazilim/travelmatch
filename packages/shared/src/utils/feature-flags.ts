/**
 * Feature Flags & Kill-Switch System
 * Live operasyonel emniyet kemeri
 *
 * Usage:
 * import { featureFlags } from '@lovendo/shared';
 *
 * if (featureFlags.isEnabled('escrowCreate')) {
 *   // escrow logic
 * }
 */

export type FeatureFlag =
  | 'escrowCreate'
  | 'escrowRelease'
  | 'messagingMedia'
  | 'messaging'
  | 'momentsCreate'
  | 'momentsGift'
  | 'shareInvite'
  | 'kycVerification'
  | 'paymentWithdraw'
  | 'aiModeration';

interface FeatureConfig {
  key: FeatureFlag;
  description: string;
  defaultValue: boolean;
}

// Production'da true, staging'de false olabilir
const ENV_FEATURES: Partial<Record<FeatureFlag, boolean>> = {
  escrowCreate: process.env.NEXT_PUBLIC_FLAG_ESCROW_CREATE !== 'false',
  escrowRelease: process.env.NEXT_PUBLIC_FLAG_ESCROW_RELEASE !== 'false',
  messagingMedia: process.env.NEXT_PUBLIC_FLAG_MESSAGING_MEDIA !== 'false',
  messaging: process.env.NEXT_PUBLIC_FLAG_MESSAGING !== 'false',
  momentsCreate: process.env.NEXT_PUBLIC_FLAG_MOMENTS_CREATE !== 'false',
  momentsGift: process.env.NEXT_PUBLIC_FLAG_MOMENTS_GIFT !== 'false',
  shareInvite: process.env.NEXT_PUBLIC_FLAG_SHARE_INVITE !== 'false',
  kycVerification: process.env.NEXT_PUBLIC_FLAG_KYC_VERIFICATION !== 'false',
  paymentWithdraw: process.env.NEXT_PUBLIC_FLAG_PAYMENT_WITHDRAW !== 'false',
  aiModeration: process.env.NEXT_PUBLIC_FLAG_AI_MODERATION !== 'false',
};

export const FEATURE_CONFIG: FeatureConfig[] = [
  { key: 'escrowCreate', description: 'Yeni escrow oluşturma', defaultValue: true },
  { key: 'escrowRelease', description: 'Escrow release işlemleri', defaultValue: true },
  { key: 'messagingMedia', description: 'Mesajlaşmada medya paylaşımı', defaultValue: true },
  { key: 'messaging', description: 'Mesajlaşma sistemi', defaultValue: true },
  { key: 'momentsCreate', description: 'Yeni moment oluşturma', defaultValue: true },
  { key: 'momentsGift', description: 'Moment hediye gönderme', defaultValue: true },
  { key: 'shareInvite', description: 'Davet linki paylaşımı', defaultValue: true },
  { key: 'kycVerification', description: 'KYC doğrulama', defaultValue: true },
  { key: 'paymentWithdraw', description: 'Para çekme işlemleri', defaultValue: true },
  { key: 'aiModeration', description: 'AI içerik moderasyonu', defaultValue: true },
];

export function isEnabled(flag: FeatureFlag): boolean {
  // Environment variable override
  if (process.env[`NEXT_PUBLIC_FLAG_${flag.toUpperCase()}`] !== undefined) {
    return ENV_FEATURES[flag] ?? FEATURE_CONFIG.find(f => f.key === flag)?.defaultValue ?? true;
  }
  return ENV_FEATURES[flag] ?? true;
}

export function isDisabled(flag: FeatureFlag): boolean {
  return !isEnabled(flag);
}

export function getFlagStatus(): Record<FeatureFlag, { enabled: boolean; description: string }> {
  const status: Record<string, { enabled: boolean; description: string }> = {};
  for (const config of FEATURE_CONFIG) {
    status[config.key] = {
      enabled: isEnabled(config.key),
      description: config.description,
    };
  }
  return status;
}

// Kill-switch: Tüm kritik işlemleri durdur
export function isSystemOperational(): boolean {
  return isEnabled('momentsCreate') && isEnabled('messaging');
}

// Emergency shutdown check
export function requireFeature(flag: FeatureFlag): void {
  if (isDisabled(flag)) {
    throw new Error(`Feature disabled: ${flag}`);
  }
}

export const featureFlags = {
  isEnabled,
  isDisabled,
  getFlagStatus,
  isSystemOperational,
  requireFeature,
  flags: FEATURE_CONFIG,
};

export default featureFlags;

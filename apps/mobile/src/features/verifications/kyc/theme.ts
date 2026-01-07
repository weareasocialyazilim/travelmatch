/**
 * KYC Verification - Awwwards Edition Theme
 *
 * Twilight Zinc & Neon Energy aesthetic for identity verification.
 * Premium dark theme with ceremonial glass effects.
 */

// Twilight Zinc + Neon Energy palette
export const KYC_COLORS = {
  // Background layers
  background: {
    primary: '#121214',
    secondary: '#1E1E20',
    tertiary: '#27272A',
    elevated: '#3F3F46',
  },

  // Glass effects
  glass: {
    background: 'rgba(30, 30, 32, 0.85)',
    backgroundLight: 'rgba(255, 255, 255, 0.03)',
    backgroundMedium: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    borderActive: 'rgba(255, 255, 255, 0.15)',
  },

  // Text colors
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    tertiary: '#64748B',
    muted: '#475569',
    inverse: '#121214',
  },

  // Neon accents
  neon: {
    lime: '#DFFF00',
    violet: '#A855F7',
    cyan: '#06B6D4',
    rose: '#F43F5E',
    amber: '#F59E0B',
    emerald: '#10B981',
  },

  // Status colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#F43F5E',
    info: '#06B6D4',
  },

  // Glow effects
  glow: {
    lime: 'rgba(223, 255, 0, 0.3)',
    violet: 'rgba(168, 85, 247, 0.3)',
    cyan: 'rgba(6, 182, 212, 0.3)',
    emerald: 'rgba(16, 185, 129, 0.3)',
  },

  // Gradient presets
  gradients: {
    primary: ['#DFFF00', '#A855F7'] as const,
    trust: ['#06B6D4', '#A855F7'] as const,
    success: ['#10B981', '#06B6D4'] as const,
    ceremony: ['rgba(223, 255, 0, 0.1)', 'rgba(168, 85, 247, 0.1)'] as const,
  },
} as const;

// Spacing constants
export const KYC_SPACING = {
  screenPadding: 24,
  sectionGap: 32,
  cardGap: 16,
  cardPadding: 20,
  iconSize: 56,
  iconRadius: 18,
} as const;

// Animation spring configs
export const KYC_SPRINGS = {
  snappy: { damping: 20, stiffness: 300, mass: 0.5 },
  bouncy: { damping: 15, stiffness: 150, mass: 0.5 },
  gentle: { damping: 20, stiffness: 120, mass: 0.5 },
  slow: { damping: 25, stiffness: 100, mass: 0.8 },
} as const;

// Typography scale
export const KYC_TYPOGRAPHY = {
  pageTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },
} as const;

// KYC Steps configuration
export const KYC_STEPS = [
  { id: 'intro', label: 'Başla' },
  { id: 'document', label: 'Belge' },
  { id: 'upload', label: 'Yükle' },
  { id: 'selfie', label: 'Selfie' },
  { id: 'review', label: 'Onayla' },
] as const;

// Document types with Turkish labels
export const KYC_DOCUMENT_TYPES = [
  {
    id: 'passport',
    title: 'Pasaport',
    icon: 'passport',
    description: 'Uluslararası geçerliliği olan biyometrik belge.',
  },
  {
    id: 'id_card',
    title: 'Kimlik Kartı',
    icon: 'card-account-details',
    description: 'Yeni nesil çipli T.C. kimlik kartı.',
  },
  {
    id: 'drivers_license',
    title: 'Ehliyet',
    icon: 'car',
    description: 'Güncel sürücü belgesi.',
  },
] as const;

// Requirements with Turkish labels
export const KYC_REQUIREMENTS = [
  { id: 'doc', label: 'Resmi kimlik belgesi', icon: 'card-account-details' },
  { id: 'selfie', label: 'Canlı selfie fotoğrafı', icon: 'account-box' },
  { id: 'time', label: '5-10 dakika süren işlem', icon: 'clock-outline' },
] as const;

// Helper to get step index
export const getStepIndex = (stepId: string): number => {
  const index = KYC_STEPS.findIndex((s) => s.id === stepId);
  return index >= 0 ? index : 0;
};

// Helper to get progress percentage
export const getStepProgress = (stepId: string): number => {
  const index = getStepIndex(stepId);
  return (index / (KYC_STEPS.length - 1)) * 100;
};

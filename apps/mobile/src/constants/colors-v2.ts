/**
 * TravelMatch Awwwards Design System 2026 - Colors V2
 *
 * Estetik Yön: "Liquid Warmth" - Organic Luxury meets Playful Warmth
 *
 * Konsept:
 * - Gift-giving = sıcaklık, duygu, bağlantı
 * - Travel = keşif, macera, özgürlük
 * - Trust = güvenilirlik, şeffaflık
 *
 * Architecture:
 * 1. PALETTE - Raw color values with full shade scale
 * 2. COLORS_V2 - Semantic colors for consistent theming
 * 3. GRADIENTS_V2 - Awwwards-level gradient presets
 */

// ============================================
// 1. PALETTE - Raw Color Values (Internal Use)
// ============================================
export const PALETTE = {
  // Primary: Warm Amber → Coral gradient
  // Represents the warmth of gift-giving
  primary: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // Main primary
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  // Secondary: Rose Pink
  // Emotional connection and gift excitement
  rose: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E', // Main secondary
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },

  // Accent: Aurora Violet
  // Premium feel and uniqueness
  aurora: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7', // Main accent
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
  },

  // Trust: Deep Emerald
  // Reliability and transparency
  trust: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Main trust
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Neutrals: Warm Sand Grays
  // Warmer alternative to standard gray
  sand: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
    950: '#0C0A09',
  },

  // Info: Ocean Blue
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Main info
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Warning: Warm Amber
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Error: Vibrant Red
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Main error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Pure values
  white: '#FFFFFF',
  black: '#000000',
} as const;

// ============================================
// 2. SEMANTIC COLORS (Use these in components)
// ============================================
export const COLORS_V2 = {
  // --------------------------------------------
  // Backgrounds - Warm cream tones
  // --------------------------------------------
  bg: {
    primary: '#FFFCF7', // Warm cream - main app background
    secondary: '#FFF9F0', // Slightly warmer
    tertiary: '#FFF5E6', // Even warmer for emphasis
    dark: '#0C0A09', // Dark mode primary
    darkSecondary: '#1C1917', // Dark mode secondary
    darkTertiary: '#292524', // Dark mode tertiary
  },

  // --------------------------------------------
  // Surfaces - Cards, modals, elevated elements
  // --------------------------------------------
  surface: {
    base: PALETTE.white,
    elevated: 'rgba(255, 252, 247, 0.95)', // Subtle cream tint
    glass: 'rgba(255, 252, 247, 0.72)', // Glassmorphism light
    glassDark: 'rgba(28, 25, 23, 0.85)', // Glassmorphism dark
    card: PALETTE.white,
    cardDark: '#1C1917',
    modal: PALETTE.white,
    modalDark: '#292524',
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayDark: 'rgba(0, 0, 0, 0.7)',
  },

  // --------------------------------------------
  // Text Colors
  // --------------------------------------------
  text: {
    primary: PALETTE.sand[900], // Main text
    secondary: PALETTE.sand[500], // Subdued text
    muted: PALETTE.sand[400], // Disabled/placeholder
    inverse: PALETTE.white, // On dark backgrounds
    accent: PALETTE.primary[600], // Emphasized text
    link: PALETTE.primary[500], // Clickable text
    // Dark mode variants
    primaryDark: '#FAFAF9',
    secondaryDark: '#A8A29E',
    mutedDark: '#78716C',
  },

  // --------------------------------------------
  // Interactive Elements
  // --------------------------------------------
  interactive: {
    primary: PALETTE.primary[500], // Main CTA color
    primaryHover: PALETTE.primary[600],
    primaryPressed: PALETTE.primary[700],
    primaryMuted: `rgba(249, 115, 22, 0.15)`,
    secondary: PALETTE.rose[500], // Secondary actions
    secondaryHover: PALETTE.rose[600],
    secondaryMuted: `rgba(244, 63, 94, 0.15)`,
    accent: PALETTE.aurora[500], // Special actions
    accentHover: PALETTE.aurora[600],
    accentMuted: `rgba(168, 85, 247, 0.15)`,
    disabled: PALETTE.sand[300],
    disabledText: PALETTE.sand[400],
  },

  // --------------------------------------------
  // Semantic Feedback Colors
  // --------------------------------------------
  feedback: {
    success: PALETTE.trust[500],
    successLight: PALETTE.trust[50],
    successMuted: `rgba(16, 185, 129, 0.15)`,
    error: PALETTE.red[500],
    errorLight: PALETTE.red[50],
    errorMuted: `rgba(239, 68, 68, 0.15)`,
    warning: PALETTE.amber[500],
    warningLight: PALETTE.amber[50],
    warningMuted: `rgba(245, 158, 11, 0.15)`,
    info: PALETTE.blue[500],
    infoLight: PALETTE.blue[50],
    infoMuted: `rgba(59, 130, 246, 0.15)`,
  },

  // --------------------------------------------
  // Trust System Colors
  // --------------------------------------------
  trust: {
    primary: PALETTE.trust[500],
    light: PALETTE.trust[400],
    dark: PALETTE.trust[600],
    muted: `rgba(16, 185, 129, 0.15)`,
    // Trust Score Ring Levels
    platinum: ['#10B981', '#34D399'] as const, // 90+
    gold: ['#F59E0B', '#FBBF24'] as const, // 70-89
    silver: ['#3B82F6', '#60A5FA'] as const, // 50-69
    bronze: ['#78716C', '#A8A29E'] as const, // 0-49
    // KYC Badge Colors
    kycBronze: '#CD7F32',
    kycSilver: '#C0C0C0',
    kycGold: '#FFD700',
    kycPlatinum: '#E5E4E2',
  },

  // --------------------------------------------
  // Border Colors
  // --------------------------------------------
  border: {
    default: PALETTE.sand[200],
    light: PALETTE.sand[100],
    dark: PALETTE.sand[300],
    focus: PALETTE.primary[500],
    error: PALETTE.red[500],
    // Dark mode
    defaultDark: PALETTE.sand[700],
    lightDark: PALETTE.sand[800],
  },

  // --------------------------------------------
  // Social Brand Colors
  // --------------------------------------------
  social: {
    apple: PALETTE.black,
    google: '#4285F4',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    instagram: '#E4405F',
    whatsapp: '#25D366',
    telegram: '#0088CC',
    linkedin: '#0A66C2',
  },

  // --------------------------------------------
  // Payment Brand Colors
  // --------------------------------------------
  payment: {
    visa: '#1A1F71',
    mastercard: '#EB001B',
    amex: '#006FCF',
    paypal: '#003087',
  },
} as const;

// ============================================
// 3. GRADIENTS - Awwwards Level Presets
// ============================================
export const GRADIENTS_V2 = {
  // Hero gradient - Splash and onboarding screens
  hero: ['#F97316', '#FB7185', '#A855F7'] as const,

  // Gift button - Main CTA gradient
  gift: ['#F97316', '#F43F5E'] as const,
  giftHover: ['#EA580C', '#E11D48'] as const,

  // Trust ring gradient
  trust: ['#10B981', '#34D399'] as const,
  trustPlatinum: ['#10B981', '#34D399', '#6EE7B7'] as const,

  // Aurora ambient - Premium feel
  aurora: ['#A855F7', '#F43F5E', '#F97316'] as const,
  auroraSubtle: ['#E9D5FF', '#FECDD3', '#FED7AA'] as const,

  // Glass overlay gradients
  glassLight: [
    'rgba(255, 252, 247, 0.9)',
    'rgba(255, 252, 247, 0.7)',
  ] as const,

  glassDark: [
    'rgba(28, 25, 23, 0.95)',
    'rgba(28, 25, 23, 0.8)',
  ] as const,

  // Card image overlays
  cardOverlay: [
    'transparent',
    'rgba(0, 0, 0, 0.4)',
    'rgba(0, 0, 0, 0.8)',
  ] as const,

  cardOverlayLight: [
    'transparent',
    'rgba(0, 0, 0, 0.3)',
    'rgba(0, 0, 0, 0.6)',
  ] as const,

  // Celebration gradient (gift received/sent)
  celebration: ['#F43F5E', '#A855F7', '#3B82F6'] as const,

  // Success gradient
  success: ['#10B981', '#34D399'] as const,

  // Warm sunset gradient
  sunset: ['#F97316', '#FB923C', '#FCD34D'] as const,

  // Cool night gradient
  night: ['#1E3A8A', '#6D28D9', '#A855F7'] as const,

  // Background ambient gradients
  bgWarm: ['#FFFCF7', '#FFF5E6'] as const,
  bgCool: ['#F5F5F4', '#FAFAF9'] as const,

  // Button variants
  primary: ['#F97316', '#EA580C'] as const,
  secondary: ['#F43F5E', '#E11D48'] as const,
  accent: ['#A855F7', '#9333EA'] as const,

  // Disabled state
  disabled: ['#D6D3D1', '#A8A29E'] as const,

  // Skeleton loading
  skeleton: [
    'rgba(231, 229, 228, 0.6)',
    'rgba(231, 229, 228, 1)',
    'rgba(231, 229, 228, 0.6)',
  ] as const,
} as const;

// ============================================
// 4. SHADOWS - Elevation System
// ============================================
export const SHADOWS_V2 = {
  // Card shadows - warm tinted
  card: {
    shadowColor: PALETTE.sand[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  cardHover: {
    shadowColor: PALETTE.sand[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },

  cardElevated: {
    shadowColor: PALETTE.sand[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 12,
  },

  // Button shadows - colored
  buttonPrimary: {
    shadowColor: PALETTE.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },

  buttonSecondary: {
    shadowColor: PALETTE.rose[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },

  buttonAccent: {
    shadowColor: PALETTE.aurora[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },

  // Floating elements
  floating: {
    shadowColor: PALETTE.black,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },

  // Subtle shadows
  subtle: {
    shadowColor: PALETTE.sand[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  // Inner shadows (simulated)
  inner: {
    shadowColor: PALETTE.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 0,
  },
} as const;

// ============================================
// 5. UTILITY FUNCTIONS
// ============================================

/**
 * Get trust ring colors based on score
 */
export const getTrustRingColors = (score: number): readonly [string, string] => {
  if (score >= 90) return COLORS_V2.trust.platinum;
  if (score >= 70) return COLORS_V2.trust.gold;
  if (score >= 50) return COLORS_V2.trust.silver;
  return COLORS_V2.trust.bronze;
};

/**
 * Get trust level label
 */
export const getTrustLevel = (score: number): 'platinum' | 'gold' | 'silver' | 'bronze' => {
  if (score >= 90) return 'platinum';
  if (score >= 70) return 'gold';
  if (score >= 50) return 'silver';
  return 'bronze';
};

/**
 * Create rgba color with opacity
 */
export const withOpacity = (hexColor: string, opacity: number): string => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Check if color is dark (for contrast)
 */
export const isColorDark = (hexColor: string): boolean => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

// Export types
export type PaletteColor = keyof typeof PALETTE;
export type SemanticColor = keyof typeof COLORS_V2;
export type GradientName = keyof typeof GRADIENTS_V2;

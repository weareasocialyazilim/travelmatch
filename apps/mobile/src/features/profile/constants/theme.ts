/**
 * TravelMatch Profile - Awwwards Edition Theme
 *
 * Twilight Zinc & Neon Energy aesthetic for the profile experience.
 * Premium dark theme with liquid glass and constellation effects.
 */

export const PROFILE_COLORS = {
  // Background layers (Twilight Zinc)
  background: {
    primary: '#121214',    // Main background - deep anthracite
    secondary: '#1E1E20',  // Card surfaces
    tertiary: '#27272A',   // Elevated surfaces
    elevated: '#3F3F46',   // Hover/pressed states
  },

  // Glass effects (Liquid Glass)
  glass: {
    background: 'rgba(30, 30, 32, 0.85)',
    backgroundLight: 'rgba(255, 255, 255, 0.03)',
    backgroundMedium: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.05)',
    borderActive: 'rgba(255, 255, 255, 0.15)',
  },

  // Text on dark (High Legibility)
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    tertiary: '#64748B',
    muted: '#475569',
    inverse: '#121214',
  },

  // Neon accent colors (Neon Energy)
  neon: {
    lime: '#DFFF00',       // Primary action (Gift-Lime)
    violet: '#A855F7',     // Premium/AI features
    cyan: '#06B6D4',       // Verified & Trust
    rose: '#F43F5E',       // Hearts & Notifications
    amber: '#F59E0B',      // Warnings
    emerald: '#10B981',    // Success
  },

  // Trust levels for constellation
  trust: {
    platinum: '#E5E4E2',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
    low: '#F43F5E',
    medium: '#F59E0B',
    high: '#06B6D4',
  },

  // Status-specific glows
  glow: {
    lime: 'rgba(223, 255, 0, 0.3)',
    violet: 'rgba(168, 85, 247, 0.3)',
    cyan: 'rgba(6, 182, 212, 0.3)',
    rose: 'rgba(244, 63, 94, 0.3)',
    gold: 'rgba(255, 215, 0, 0.3)',
  },

  // Gradient presets
  gradients: {
    header: ['#DFFF00', '#A855F7'] as const,
    headerDark: ['rgba(223, 255, 0, 0.15)', 'rgba(168, 85, 247, 0.15)'] as const,
    trust: ['#06B6D4', '#A855F7'] as const,
    constellation: ['rgba(223, 255, 0, 0.1)', 'rgba(6, 182, 212, 0.1)'] as const,
    cardOverlay: ['transparent', 'rgba(18, 18, 20, 0.95)'] as const,
  },
} as const;

// Spacing constants
export const PROFILE_SPACING = {
  screenPadding: 20,
  sectionGap: 32,
  cardGap: 16,
  cardPadding: 20,
  avatarSize: 120,
  avatarRingSize: 140,
  statCardMinWidth: 100,
} as const;

// Animation spring configs
export const PROFILE_SPRINGS = {
  snappy: { damping: 20, stiffness: 300, mass: 0.5 },
  bouncy: { damping: 15, stiffness: 150, mass: 0.5 },
  gentle: { damping: 20, stiffness: 120, mass: 0.5 },
  slow: { damping: 25, stiffness: 100, mass: 0.8 },
} as const;

// Typography scale for profile
export const PROFILE_TYPOGRAPHY = {
  pageTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  userBio: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },
} as const;

// Trust score helpers
export const getTrustLevel = (score: number): 'platinum' | 'gold' | 'silver' | 'bronze' => {
  if (score >= 90) return 'platinum';
  if (score >= 70) return 'gold';
  if (score >= 50) return 'silver';
  return 'bronze';
};

export const getTrustColors = (score: number): [string, string] => {
  const level = getTrustLevel(score);
  switch (level) {
    case 'platinum':
      return [PROFILE_COLORS.trust.platinum, PROFILE_COLORS.neon.cyan];
    case 'gold':
      return [PROFILE_COLORS.trust.gold, PROFILE_COLORS.neon.amber];
    case 'silver':
      return [PROFILE_COLORS.trust.silver, PROFILE_COLORS.neon.violet];
    default:
      return [PROFILE_COLORS.trust.bronze, PROFILE_COLORS.neon.rose];
  }
};

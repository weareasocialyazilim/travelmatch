/**
 * TravelMatch Design System - React Native Components
 *
 * Platform-specific components with animations, haptics, and native features.
 * These components are designed specifically for React Native and use:
 * - react-native-reanimated for animations
 * - expo-haptics for haptic feedback
 * - expo-blur for glass effects
 *
 * @packageDocumentation
 */

// =============================================================================
// MIGRATION STATUS: POST-LAUNCH (Phase 2)
// =============================================================================
//
// DECISION (2026-01-06):
// Mobile UI bileşenleri şu an apps/mobile/src/components/ui/ içinde kalacak.
// Sebep: Expo-specific bağımlılıklar (expo-blur, expo-haptics, reanimated)
//        ve mobile-only hooks (@/hooks/useMotion) nedeniyle tam migration
//        production öncesi riskli.
//
// CURRENT STATE:
// - TrustOrb: ✅ Migrated (tek bağımsız bileşen)
// - Diğer bileşenler: apps/mobile/src/components/ui/ içinde
// - Tokens: packages/design-system/src/tokens/ (canonical source)
//
// POST-LAUNCH MIGRATION PLAN:
// 1. Mobile constants/colors.ts → design-system/tokens re-export
// 2. Bileşen bağımlılıklarını (hooks, constants) design-system'e taşı
// 3. Phase 1 bileşenlerini (TMButton, TMBadge, TMCard) migrate et
// 4. Mobile'dan backward-compat re-export sağla
//
// =============================================================================
// FUTURE PHASES (Post-Launch):
// =============================================================================
//
// Phase 1 (Critical - Shared by multiple screens):
// - TMButton      → @travelmatch/design-system/native
// - TMBadge       → @travelmatch/design-system/native
// - TMCard        → @travelmatch/design-system/native
// - LiquidInput   → @travelmatch/design-system/native
// - TMAvatar      → @travelmatch/design-system/native
//
// Phase 2 (Liquid Design System):
// - LiquidBottomSheet      → @travelmatch/design-system/native
// - LiquidSegmentedControl → @travelmatch/design-system/native
// - LiquidSelection        → @travelmatch/design-system/native
//
// Phase 3 (Trust/Ceremony Components):
// - TMTrustRing           → @travelmatch/design-system/native
// - TrustConstellation    → @travelmatch/design-system/native
// - TrustScoreCircle      → @travelmatch/design-system/native
// - SuccessCeremony       → @travelmatch/design-system/native
//
// Phase 4 (Utility Components):
// - TMLoading, TMSkeleton → @travelmatch/design-system/native
// - OptimizedImage        → @travelmatch/design-system/native
// - GlassCard, GlassModal → @travelmatch/design-system/native
//
// After migration, apps/mobile/src/components/ui/index.ts will re-export
// from @travelmatch/design-system/native for backward compatibility.
// =============================================================================

// Re-export from mobile (temporary - until migration complete)
// These will be replaced with actual implementations

// For now, export types and placeholder documentation
export interface NativeComponentsConfig {
  /** Enable haptic feedback globally */
  enableHaptics: boolean;
  /** Enable blur effects (expensive on low-end devices) */
  enableBlur: boolean;
  /** Enable particle effects */
  enableParticles: boolean;
  /** Animation duration multiplier (0 = instant, 1 = normal, 2 = slow) */
  animationScale: number;
}

export const defaultNativeConfig: NativeComponentsConfig = {
  enableHaptics: true,
  enableBlur: true,
  enableParticles: true,
  animationScale: 1,
};

// Export configuration context (to be implemented)
// export { NativeConfigProvider, useNativeConfig } from './NativeConfigContext';

// =============================================================================
// COMPONENT EXPORTS (Placeholders - will be actual components after migration)
// =============================================================================

// ✅ MIGRATED COMPONENTS
// TrustOrb - Premium trust visualization (renamed from TrustConstellation to avoid collision)
export { TrustOrb, TrustConstellation } from './TrustOrb';
export type {
  TrustOrbProps,
  TrustConstellationProps,
  TrustFactor,
} from './TrustOrb';

// Placeholder exports - these will be replaced as components are migrated
export const MIGRATION_STATUS = {
  // ✅ DONE
  TrustOrb: 'done',

  // 🚀 POST-LAUNCH (Phase 1 - Critical)
  TMButton: 'post-launch',
  TMBadge: 'post-launch',
  TMCard: 'post-launch',
  LiquidInput: 'post-launch',
  TMAvatar: 'post-launch',

  // 🚀 POST-LAUNCH (Phase 2 - Liquid)
  LiquidBottomSheet: 'post-launch',
  LiquidSegmentedControl: 'post-launch',
  LiquidSelection: 'post-launch',

  // 🚀 POST-LAUNCH (Phase 3 - Trust)
  TMTrustRing: 'post-launch',
  TrustScoreCircle: 'post-launch',
  SuccessCeremony: 'post-launch',

  // 🚀 POST-LAUNCH (Phase 4 - Utility)
  TMLoading: 'post-launch',
  TMSkeleton: 'post-launch',
  OptimizedImage: 'post-launch',
  GlassCard: 'post-launch',
  GlassModal: 'post-launch',
} as const;

// =============================================================================
// USAGE AFTER MIGRATION:
// =============================================================================
//
// import { TMButton, TMBadge, LiquidInput } from '@travelmatch/design-system/native';
//
// Or with configuration:
//
// import { NativeConfigProvider, TMButton } from '@travelmatch/design-system/native';
//
// <NativeConfigProvider config={{ enableHaptics: true, enableBlur: false }}>
//   <TMButton variant="primary">Click me</TMButton>
// </NativeConfigProvider>
// =============================================================================

/**
 * Lovendo Design System - React Native Components
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
// 3. Phase 1 bileşenlerini (LovendoButton, LovendoBadge, LovendoCard) migrate et
// 4. Mobile'dan backward-compat re-export sağla
//
// =============================================================================
// FUTURE PHASES (Post-Launch):
// =============================================================================
//
// Phase 1 (Critical - Shared by multiple screens):
// - LovendoButton      → @lovendo/design-system/native
// - LovendoBadge       → @lovendo/design-system/native
// - LovendoCard        → @lovendo/design-system/native
// - LiquidInput   → @lovendo/design-system/native
// - LovendoAvatar      → @lovendo/design-system/native
//
// Phase 2 (Liquid Design System):
// - LiquidBottomSheet      → @lovendo/design-system/native
// - LiquidSegmentedControl → @lovendo/design-system/native
// - LiquidSelection        → @lovendo/design-system/native
//
// Phase 3 (Trust/Ceremony Components):
// - LovendoTrustRing           → @lovendo/design-system/native
// - TrustConstellation    → @lovendo/design-system/native
// - TrustScoreCircle      → @lovendo/design-system/native
// - SuccessCeremony       → @lovendo/design-system/native
//
// Phase 4 (Utility Components):
// - LovendoLoading, LovendoSkeleton → @lovendo/design-system/native
// - OptimizedImage        → @lovendo/design-system/native
// - GlassCard, GlassModal → @lovendo/design-system/native
//
// After migration, apps/mobile/src/components/ui/index.ts will re-export
// from @lovendo/design-system/native for backward compatibility.
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
  LovendoButton: 'post-launch',
  LovendoBadge: 'post-launch',
  LovendoCard: 'post-launch',
  LiquidInput: 'post-launch',
  LovendoAvatar: 'post-launch',

  // 🚀 POST-LAUNCH (Phase 2 - Liquid)
  LiquidBottomSheet: 'post-launch',
  LiquidSegmentedControl: 'post-launch',
  LiquidSelection: 'post-launch',

  // 🚀 POST-LAUNCH (Phase 3 - Trust)
  LovendoTrustRing: 'post-launch',
  TrustScoreCircle: 'post-launch',
  SuccessCeremony: 'post-launch',

  // 🚀 POST-LAUNCH (Phase 4 - Utility)
  LovendoLoading: 'post-launch',
  LovendoSkeleton: 'post-launch',
  OptimizedImage: 'post-launch',
  GlassCard: 'post-launch',
  GlassModal: 'post-launch',
} as const;

// =============================================================================
// USAGE AFTER MIGRATION:
// =============================================================================
//
// import { LovendoButton, LovendoBadge, LiquidInput } from '@lovendo/design-system/native';
//
// Or with configuration:
//
// import { NativeConfigProvider, LovendoButton } from '@lovendo/design-system/native';
//
// <NativeConfigProvider config={{ enableHaptics: true, enableBlur: false }}>
//   <LovendoButton variant="primary">Click me</LovendoButton>
// </NativeConfigProvider>
// =============================================================================

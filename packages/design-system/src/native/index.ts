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
// MIGRATION PLAN: Components to be moved from apps/mobile/src/components/ui/
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

// Placeholder exports - these will be replaced as components are migrated
export const MIGRATION_STATUS = {
  TMButton: 'pending',
  TMBadge: 'pending',
  TMCard: 'pending',
  LiquidInput: 'pending',
  TMAvatar: 'pending',
  LiquidBottomSheet: 'pending',
  LiquidSegmentedControl: 'pending',
  LiquidSelection: 'pending',
  TMTrustRing: 'pending',
  TrustConstellation: 'pending',
  TrustScoreCircle: 'pending',
  SuccessCeremony: 'pending',
  TMLoading: 'pending',
  TMSkeleton: 'pending',
  OptimizedImage: 'pending',
  GlassCard: 'pending',
  GlassModal: 'pending',
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

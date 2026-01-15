// ═══════════════════════════════════════════════════════════════════
// Lovendo Ultimate Design System 2026
// "Cinematic Trust Jewelry" Component Library
// ═══════════════════════════════════════════════════════════════════

// Core UI Components
export { Button } from './Button';
export { Card, GlassCard, GlassView, GlassButton } from './Card';
export type { CardVariant, CardPadding, GlassTint } from './Card';
export { Divider } from './Divider';
export { EmptyState } from './EmptyState';
export { FlashMessage } from './FlashMessage';

// ═══════════════════════════════════════════════════════════════════
// Input Components - LiquidInput is the master component
// ═══════════════════════════════════════════════════════════════════
export { LiquidInput } from './LiquidInput';
export { ControlledLiquidInput } from './ControlledLiquidInput';
// @deprecated aliases - use LiquidInput instead
export { LiquidInput as Input } from './LiquidInput';

// LovendoBadge - Consolidated badge component (replaces Badge, StatusBadge, TrustBadge)
export {
  LovendoBadge,
  LiveStatusBadge,
  VerifiedBadge,
  PremiumBadge,
} from './LovendoBadge';
export type {
  LovendoBadgeType,
  LabelVariant,
  StatusVariant,
  BadgeSize,
  LovendoBadgeProps,
} from './LovendoBadge';
// @deprecated aliases for backward compatibility
export {
  LovendoBadge as Badge,
  LovendoBadge as StatusBadge,
  LovendoBadge as TrustBadge,
} from './LovendoBadge';

// ═══════════════════════════════════════════════════════════════════
// Lovendo Design System Components
// ═══════════════════════════════════════════════════════════════════

// LovendoButton - Primary button with gradient, animation, haptics
// Consolidated master component - replaces Button, HapticButton, AnimatedButton
export { LovendoButton } from './LovendoButton';
export { MagneticButton } from './MagneticButton';
export type {
  LovendoButtonProps,
  ButtonVariant,
  ButtonSize,
  AnimationMode,
  HapticType,
} from './LovendoButton';

// LovendoTrustRing - Trust score visualization with "Jewelry" aesthetic
export { LovendoTrustRing } from './LovendoTrustRing';

// LovendoCard - Moment card with "Soft Glass" aesthetic
export { LovendoCard } from './LovendoCard';
export type { MomentData, MomentBadgeType } from './LovendoCard';

// LovendoPill - Chip/pill components
export { LovendoPill, LovendoCategoryChip } from './LovendoPill';

// LovendoLoading - Consolidated loading component (replaces Spinner, LoadingSpinner, LiquidLoading)
export { LovendoLoading } from './LovendoLoading';
export type {
  LovendoLoadingType,
  LoadingSize,
  LoadingVariant,
  LovendoLoadingProps,
} from './LovendoLoading';
// @deprecated aliases for backward compatibility
export {
  LovendoLoading as Spinner,
  LovendoLoading as LoadingSpinner,
  LovendoLoading as LiquidLoading,
} from './LovendoLoading';

// LovendoSkeleton - Consolidated skeleton component (replaces Skeleton, SkeletonList, NavigationSkeleton)
export {
  LovendoSkeleton,
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonCard,
  SkeletonMessage,
  SkeletonList,
  ScreenSkeleton,
} from './LovendoSkeleton';
export type {
  LovendoSkeletonType,
  SkeletonListType,
  SkeletonScreenType,
  SkeletonVariant,
  LovendoSkeletonProps,
} from './LovendoSkeleton';
// @deprecated aliases for backward compatibility - use LovendoSkeleton with type prop instead
export { LovendoSkeleton as FeedSkeleton } from './LovendoSkeleton';

// LovendoSheet - Bottom sheet with gestures and blur
export { LovendoSheet } from './LovendoSheet';
export type { LovendoSheetProps, LovendoSheetSize } from './LovendoSheet';

// LovendoAvatar - Avatar with initials fallback, status, verified badge
export { LovendoAvatar } from './LovendoAvatar';
export type { LovendoAvatarProps, AvatarSize, AvatarStatus } from './LovendoAvatar';
// @deprecated alias for backward compatibility
export { LovendoAvatar as Avatar } from './LovendoAvatar';

// LovendoProofCard - Proof submission card for chat
export { LovendoProofCard } from './LovendoProofCard';
export type { LovendoProofCardProps, ProofStatus, MediaType } from './LovendoProofCard';

// Paywall - Feature paywall with upgrade CTA
export { Paywall } from './Paywall';
export type { PaywallProps, PaywallFeature } from './Paywall';

// SubscriptionBadge - Tinder/Bumble style subscription tier badge
export { SubscriptionBadge, SubscriptionUpgradeCTA } from './SubscriptionBadge';
export type { SubscriptionTier } from './SubscriptionBadge';

// ═══════════════════════════════════════════════════════════════════
// Form Components
// ═══════════════════════════════════════════════════════════════════
export { PasswordInput } from './PasswordInput';
export { ControlledInput } from './ControlledInput';
export { PasswordStrengthMeter } from './PasswordStrengthMeter';
export { FormStepIndicator } from './FormStepIndicator';
export type { FormStep } from './FormStepIndicator';
export { OTPInput } from './OTPInput';
export type { OTPInputProps } from './OTPInput';

// ═══════════════════════════════════════════════════════════════════
// Trust Score Components
// ═══════════════════════════════════════════════════════════════════
export { TrustScoreCircle, TrustScoreRingCompact } from './TrustScoreCircle';
export type { TrustScoreCircleProps, TrustFactor } from './TrustScoreCircle';

// ═══════════════════════════════════════════════════════════════════
// Performance Optimized Components
// ═══════════════════════════════════════════════════════════════════
export { OptimizedImage } from './OptimizedImage';

// ═══════════════════════════════════════════════════════════════════
// Dashboard Components
// ═══════════════════════════════════════════════════════════════════
export { DashboardStatCard } from './DashboardStatCard';
export { AlertCard, AlertBadge } from './AlertCard';
export {
  ProgressBar,
  SegmentedProgress,
  CircularProgress,
} from './ProgressBar';
export { FilterPanel, FilterChips } from './FilterPanel';

// ═══════════════════════════════════════════════════════════════════
// Bottom Sheets
// ═══════════════════════════════════════════════════════════════════
export {
  GenericBottomSheet,
  ConfirmationBottomSheet,
  SelectionBottomSheet,
} from './GenericBottomSheet';
export type {
  BottomSheetRef,
  GenericBottomSheetProps,
  ConfirmationBottomSheetProps,
  SelectionBottomSheetProps,
  SelectionOption,
  BottomSheetHeight,
} from './GenericBottomSheet';

// ═══════════════════════════════════════════════════════════════════
// Filter Modals
// ═══════════════════════════════════════════════════════════════════
export { BlurFilterModal, type FilterValues } from './BlurFilterModal';
export { ContentReactiveGlow } from './ContentReactiveGlow';
export { LocationPermissionPrompt } from './LocationPermissionPrompt';

// ═══════════════════════════════════════════════════════════════════
// Glass Modals
// ═══════════════════════════════════════════════════════════════════
export { GlassModal } from './GlassModal';
export type { GlassModalProps } from './GlassModal';

// ═══════════════════════════════════════════════════════════════════
// Map Components
// ═══════════════════════════════════════════════════════════════════

// NeonPulseMarker - Animated map marker with "Breathing Neon" effect
export { NeonPulseMarker } from './NeonPulseMarker';

// ═══════════════════════════════════════════════════════════════════
// Layout Components (Re-exports)
// ═══════════════════════════════════════════════════════════════════

// LiquidScreenWrapper - Premium screen wrapper with glass background
// Canonical source: @/components/layout/LiquidScreenWrapper
export {
  LiquidScreenWrapper,
  LiquidScreenHeader,
  LiquidScreenBody,
} from '../layout/LiquidScreenWrapper';

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

// Badge - Consolidated badge component (replaces Badge, StatusBadge, TrustBadge)
export { Badge, LiveStatusBadge, VerifiedBadge, PremiumBadge } from './Badge';
export type {
  BadgeType,
  LabelVariant,
  StatusVariant,
  BadgeSize,
  BadgeProps,
} from './Badge';
// @deprecated aliases for backward compatibility
export { Badge as StatusBadge, Badge as TrustBadge } from './Badge';

// ═══════════════════════════════════════════════════════════════════
// Lovendo Design System Components
// ═══════════════════════════════════════════════════════════════════

// Button - Primary button with gradient, animation, haptics
// Consolidated master component - replaces Button, HapticButton, AnimatedButton
export { MagneticButton } from './MagneticButton';
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  AnimationMode,
  HapticType,
} from './Button';

// TrustRing - Trust score visualization with "Jewelry" aesthetic
export { TrustRing } from './TrustRing';

// MomentCard - Moment card with "Soft Glass" aesthetic
export { MomentCard } from './MomentCard';
export type { MomentData, MomentBadgeType } from './MomentCard';

// Pill/Chip component for categories, filters, and tags
export { Pill, CategoryChip } from './Pill';

// Loading - Consolidated loading component (replaces Spinner, LoadingSpinner, LiquidLoading)
export { Loading } from './Loading';
export type {
  LoadingType,
  LoadingSize,
  LoadingVariant,
  LoadingProps,
} from './Loading';
// @deprecated aliases for backward compatibility
export {
  Loading as Spinner,
  Loading as LoadingSpinner,
  Loading as LiquidLoading,
} from './Loading';

// Skeleton - Consolidated skeleton component (replaces Skeleton, SkeletonList, NavigationSkeleton)
export {
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonCard,
  SkeletonMessage,
  SkeletonList,
  ScreenSkeleton,
} from './Skeleton';
export type {
  SkeletonType,
  SkeletonListType,
  SkeletonScreenType,
  SkeletonVariant,
  SkeletonProps,
} from './Skeleton';
// @deprecated aliases for backward compatibility - use Skeleton with type prop instead
export { Skeleton as FeedSkeleton } from './Skeleton';

// Sheet - Bottom sheet with gestures and blur
export { Sheet } from './Sheet';
export type { SheetProps, SheetSize } from './Sheet';

// Avatar - Avatar with initials fallback, status, verified badge
export { Avatar } from './Avatar';
export type { AvatarProps, AvatarSize, AvatarStatus } from './Avatar';
// @deprecated alias for backward compatibility
// export { Avatar as Avatar } from './Avatar';

// ProofCard - Proof submission card for chat
export { ProofCard } from './ProofCard';
export type { ProofCardProps, ProofStatus, MediaType } from './ProofCard';

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

// ═══════════════════════════════════════════════════════════════════
// TravelMatch Ultimate Design System 2026
// "Cinematic Trust Jewelry" Component Library
// ═══════════════════════════════════════════════════════════════════

// Core UI Components
export { Button } from './Button';
export { Card, GlassCard, GlassView, GlassButton } from './Card';
export type { CardVariant, CardPadding, GlassTint } from './Card';
export { Input } from './Input';
export { Divider } from './Divider';
export { EmptyState } from './EmptyState';
export { FlashMessage } from './FlashMessage';

// TMBadge - Consolidated badge component (replaces Badge, StatusBadge, TrustBadge)
export { TMBadge, LiveStatusBadge, VerifiedBadge, PremiumBadge } from './TMBadge';
export type { TMBadgeType, LabelVariant, StatusVariant, BadgeSize, TMBadgeProps } from './TMBadge';
// @deprecated aliases for backward compatibility
export { TMBadge as Badge, TMBadge as StatusBadge, TMBadge as TrustBadge } from './TMBadge';

// ═══════════════════════════════════════════════════════════════════
// TravelMatch Design System Components (TM* prefix)
// ═══════════════════════════════════════════════════════════════════

// TMButton - Primary button with gradient, animation, haptics
// Consolidated master component - replaces Button, HapticButton, AnimatedButton
export { TMButton } from './TMButton';
export type { TMButtonProps, ButtonVariant, ButtonSize, AnimationMode, HapticType } from './TMButton';

// TMTrustRing - Trust score visualization with "Jewelry" aesthetic
export { TMTrustRing } from './TMTrustRing';

// TMCard - Moment card with "Soft Glass" aesthetic
export { TMCard } from './TMCard';
export type { MomentData, MomentBadgeType } from './TMCard';

// TMPill - Chip/pill components
export { TMPill, TMCategoryChip } from './TMPill';

// TMInput - Enhanced input with floating label and validation
export { TMInput } from './TMInput';
export type { TMInputProps } from './TMInput';

// TMLoading - Consolidated loading component (replaces Spinner, LoadingSpinner, LiquidLoading)
export { TMLoading } from './TMLoading';
export type { TMLoadingType, LoadingSize, LoadingVariant, TMLoadingProps } from './TMLoading';
// @deprecated aliases for backward compatibility
export { TMLoading as Spinner, TMLoading as LoadingSpinner, TMLoading as LiquidLoading } from './TMLoading';

// TMSkeleton - Consolidated skeleton component (replaces Skeleton, SkeletonList, NavigationSkeleton)
export { TMSkeleton, Skeleton, SkeletonAvatar, SkeletonText, SkeletonCard, SkeletonMessage } from './TMSkeleton';
export type { TMSkeletonType, SkeletonListType, SkeletonScreenType, SkeletonVariant, TMSkeletonProps } from './TMSkeleton';
// @deprecated aliases for backward compatibility - use TMSkeleton with type prop instead
export { TMSkeleton as SkeletonList, TMSkeleton as FeedSkeleton, TMSkeleton as ScreenSkeleton } from './TMSkeleton';

// TMSheet - Bottom sheet with gestures and blur
export { TMSheet } from './TMSheet';
export type { TMSheetProps, TMSheetSize } from './TMSheet';

// TMAvatar - Avatar with initials fallback, status, verified badge
export { TMAvatar } from './TMAvatar';
export type { TMAvatarProps, AvatarSize, AvatarStatus } from './TMAvatar';
// @deprecated alias for backward compatibility
export { TMAvatar as Avatar } from './TMAvatar';

// TMGiftCard - Gift message card for chat
export { TMGiftCard } from './TMGiftCard';
export type { TMGiftCardProps, GiftStatus } from './TMGiftCard';

// TMProofCard - Proof submission card for chat
export { TMProofCard } from './TMProofCard';
export type { TMProofCardProps, ProofStatus, MediaType } from './TMProofCard';

// Paywall - Feature paywall with upgrade CTA
export { Paywall } from './Paywall';
export type { PaywallProps, PaywallFeature } from './Paywall';

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
export { ProgressBar, SegmentedProgress, CircularProgress } from './ProgressBar';
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
export { BlurFilterModal } from './BlurFilterModal';

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

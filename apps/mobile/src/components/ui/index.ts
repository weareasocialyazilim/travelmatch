// ═══════════════════════════════════════════════════════════════════
// TravelMatch Ultimate Design System 2026
// "Cinematic Trust Jewelry" Component Library
// ═══════════════════════════════════════════════════════════════════

// Core UI Components
export { Button } from './Button';
export { Card } from './Card';
export { Avatar } from './Avatar';
export { Input } from './Input';
export { Badge, NotificationBadge } from './Badge';
export { Divider } from './Divider';
export { EmptyState } from './EmptyState';
export { FlashMessage } from './FlashMessage';
export { LoadingSpinner } from './LoadingSpinner';
export { SkeletonList } from './SkeletonList';
export type { SkeletonItemType } from './SkeletonList';

// ═══════════════════════════════════════════════════════════════════
// TravelMatch Design System Components (TM* prefix)
// ═══════════════════════════════════════════════════════════════════

// TMButton - Primary button with gradient, animation, haptics
export { TMButton } from './TMButton';

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

// TMSheet - Bottom sheet with gestures and blur
export { TMSheet } from './TMSheet';
export type { TMSheetProps, TMSheetSize } from './TMSheet';

// TMAvatar - Avatar with initials fallback, status, verified badge
export { TMAvatar } from './TMAvatar';
export type { TMAvatarProps, AvatarSize, AvatarStatus } from './TMAvatar';

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
// Glass Components (iOS 26 Liquid Glass)
// ═══════════════════════════════════════════════════════════════════
export { GlassCard, GlassView, GlassButton } from './GlassCard';

export { Button } from './ui/Button';
// TMButton - Consolidated master button component
export { TMButton } from './ui/TMButton';
export type {
  TMButtonProps,
  ButtonVariant,
  ButtonSize,
  AnimationMode,
  HapticType,
} from './ui/TMButton';
export { SocialButton } from './SocialButton';
export type { SocialButtonProps } from './SocialButton';
export {
  ErrorBoundary,
  AppErrorBoundary,
  NavigationErrorBoundary,
  ScreenErrorBoundary,
  ComponentErrorBoundary,
  type ErrorFallbackType,
} from './ErrorBoundary';
export {
  withErrorBoundary,
  withNetworkErrorBoundary,
  withGenericErrorBoundary,
  withCriticalErrorBoundary,
} from './withErrorBoundary';
export { NetworkGuard, type NetworkGuardProps } from './NetworkGuard';
export { OfflineState, type OfflineStateProps } from './OfflineState';
export { FilterPill } from './FilterPill';

// Gift Components - Taşındı: features/gifts/components
// Legacy re-exports for backward compatibility
export {
  GiftMomentBottomSheet,
  GiftSuccessModal,
  ConfirmGiftModal,
  ThankYouModal,
  CompleteGiftBottomSheet,
  GiftCelebration,
} from '@/features/gifts/components';

// ShareProofModal removed - ghost code, functionality is in ProofCeremonyFlow
export { NotificationPermissionModal } from './NotificationPermissionModal';

// Messages Components - Taşındı: features/messages/components
export { ChatAttachmentBottomSheet } from '@/features/messages/components';

// Settings Components - Taşındı: features/settings/components
export { LanguageSelectionBottomSheet } from '@/features/settings/components';

// Payments Components - Taşındı: features/payments/components
export { CurrencySelectionBottomSheet } from '@/features/payments/components';

// Wallet Components - Taşındı: features/wallet/components
export {
  AddBankAccountBottomSheet,
  AddCardBottomSheet,
  RemoveCardModal,
  WithdrawConfirmationModal,
  PendingTransactionsModal,
} from '@/features/wallet/components';

export { LimitReachedModal } from './LimitReachedModal';

// Moments Components - Taşındı: features/moments/components
export {
  RetakeProofBottomSheet,
  DeleteProofModal,
  RequestAdditionalProofBottomSheet,
  LocationPickerBottomSheet,
  LazyLocationPicker,
  ChooseCategoryBottomSheet,
  ShareMomentBottomSheet,
  DeleteMomentDialog,
} from '@/features/moments/components';
export type { Location } from '@/features/moments/components/LazyLocationPicker';

// SetPriceBottomSheet - Taşındı: features/moments/components
export { SetPriceBottomSheet } from '@/features/moments/components/SetPriceBottomSheet';

// Profile Components - Taşındı: features/profile/components
export {
  UnblockUserBottomSheet,
  KYCBadge,
} from '@/features/profile/components';
export type { KYCLevel } from '@/features/profile/components/KYCBadge';

// LeaveTrustNoteBottomSheet - Artık ui/ altında (tek kaynak)
export { LeaveTrustNoteBottomSheet } from './ui/LeaveTrustNoteBottomSheet';

export { FilterBottomSheet } from './FilterBottomSheet';
export { FeedbackModal } from './FeedbackModal';

// Auth Components - Taşındı: features/auth/components
export { EmailVerificationModal } from '@/features/auth/components';

export { LoginPromptModal } from './LoginPromptModal';
export { EmptyStateIllustration } from './ui/EmptyStateIllustration';
export { EmptyState } from './ui/EmptyState';

// Loading States & Skeletons - All from TMSkeleton.tsx
export {
  TMSkeleton,
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonCard,
  SkeletonMessage,
  SkeletonList,
  ScreenSkeleton,
} from './ui/TMSkeleton';
export type { SkeletonListType } from './ui/TMSkeleton';

export { ErrorState } from './ErrorState';

// Animated Components
export {
  AnimatedButton,
  FadeInView,
  SlideInView,
  ScaleOnPress,
  PulseView,
  StaggeredList,
  useShakeAnimation,
  SuccessAnimation,
} from './AnimatedComponents';

// Smart Components
export { default as SmartImage, AvatarImage, Thumbnail } from './SmartImage';
export { default as OfflineBanner } from './OfflineBanner';
export {
  DismissKeyboardView,
  KeyboardAwareScrollView,
  FormInput,
} from './FormComponents';

// Layout Components (TravelMatch: The Rebirth)
// FloatingDock is exported from navigation for proper React Navigation integration
export { FloatingDock } from './navigation';

// Trust Badge & Ring - TMTrustRing is the consolidated component
export { TMTrustRing } from './ui/TMTrustRing';
// TrustRing silindi - TMTrustRing kullanılmalı

// Loading State
export { LoadingState } from './LoadingState';

// DeleteMomentDialog taşındı - features/moments/components (yukarıda re-export ediliyor)

// Autocomplete
export { CityAutocomplete } from './CityAutocomplete';

// KYC Components taşındı - features/profile/components (yukarıda re-export ediliyor)
// getKYCLabel, getNextKYCLevel artık KYCBadge içinden değil, ayrı utility'den export edilmeli

// App Bootstrap
export { InitializationScreen } from './InitializationScreen';

// Provider Utilities
export { ProviderComposer } from './ProviderComposer';
// Privacy & Consent
export {
  PrivacyConsentModal,
  checkConsentStatus,
  saveConsentPreferences,
} from './PrivacyConsentModal';
export type { ConsentPreferences } from './PrivacyConsentModal';

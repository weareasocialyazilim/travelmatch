// Note: import/order disabled because lazyLoad imports are grouped by feature, not alphabetically
import React, { Suspense, useState, useEffect } from 'react';
import { View, ActivityIndicator, StatusBar, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationErrorBoundary } from '../components/ErrorBoundary';
import { COLORS } from '../constants/colors';
import { lazyLoad } from '../utils/lazyLoad';
import { MainTabNavigator } from './MainTabNavigator';
import { navigationRef } from '../services/navigationService';
import { apiClient } from '../services/apiV1Service';
import { deepLinkHandler } from '../services/deepLinkHandler';
import { logger } from '../utils/logger';
import { addBreadcrumb } from '../config/sentry'; // ADDED: Sentry navigation tracking

// Loading fallback for lazy-loaded screens
const loadingStyle = {
  flex: 1,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};
const LoadingFallback = () => (
  <View style={loadingStyle}>
    <ActivityIndicator size="large" color={COLORS.brand.primary} />
  </View>
);

// ===================================
// AUTH FEATURE SCREENS
// ===================================
import {
  SplashScreen,
  WelcomeScreen,
  OnboardingScreen,
  CompleteProfileScreen,
  VerifyPhoneScreen,
  PhoneAuthScreen,
  EmailAuthScreen,
  RegisterScreen,
  UnifiedAuthScreen,
  SetPasswordScreen,
  TwoFactorSetupScreen,
  VerifyCodeScreen,
  ForgotPasswordScreen,
  ChangePasswordScreen,
  AuthSuccessScreen,
  BiometricSetupScreen,
} from '../features/auth';
import { SessionExpiredScreen } from '../screens/SessionExpiredScreen';
import LinkNotFoundScreen from '../screens/LinkNotFoundScreen';
import { LinkExpiredScreen } from '../screens/LinkExpiredScreen';
import LinkInvalidScreen from '../screens/LinkInvalidScreen';
import { ImageViewerScreen } from '../screens/ImageViewerScreen';
import { DateTimePickerScreen } from '../screens/DateTimePickerScreen';
import { NotFoundScreen } from '../screens/NotFoundScreen';
// PickLocationScreen - lazy loaded to prevent Mapbox init at startup
const PickLocationScreen = React.lazy(() =>
  import('../screens/PickLocationScreen').then((m) => ({
    default: m.PickLocationScreen,
  })),
);
// Dev Menu - only loaded in development
const DevMenuScreen = __DEV__
  ? require('../screens/dev/DevMenuScreen').DevMenuScreen
  : () => null;

// ===================================
// DISCOVER FEATURE SCREENS
// ===================================
import {
  EscrowStatusScreen,
  HowEscrowWorksScreen,
  MatchConfirmationScreen,
  ReceiverApprovalScreen,
  DisputeFlowScreen,
  RequestsScreen,
  TicketScreen,
  DiscoverScreen,
} from '../features/discover';

// ===================================
// MESSAGES FEATURE SCREENS
// ===================================
import {
  MessagesScreen,
  ChatScreen,
  ArchivedChatsScreen,
} from '../features/messages';

// ===================================
// NEW FEATURE SCREENS (LAZY LOADED)
// ===================================
// SearchMapScreen - lazy loaded to prevent Mapbox TurboModule init at startup
// Note: Search feature removed - platform is filter-based only
const _SearchMapScreen = React.lazy(() =>
  import('../features/discover/screens/SearchMapScreen').then((m) => ({
    default: m.default,
  })),
);
// InboxScreen removed - deprecated, use Notifications or Messages instead
import { NotificationsScreen } from '../features/notifications';
import { CheckoutScreen } from '../features/payments';
// REMOVED: ChatDetailScreen - duplicate of ChatScreen (zombie cleanup)

// ===================================
// PROFILE FEATURE SCREENS
// ===================================
const ProfileScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.ProfileScreen })),
);
const EditProfileScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.EditProfileScreen })),
);
// ReputationScreen removed - using TrustGardenDetailScreen for Reputation route
const TrustGardenDetailScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({
    default: m.TrustGardenDetailScreen,
  })),
);
import { TrustNotesScreen, ProfileDetailScreen } from '../features/profile';

// Gamification feature (elevated from profile)
import { AchievementsScreen } from '../features/gamification';

// Proof system screens (from verifications feature)
const ProofHistoryScreen = lazyLoad(() =>
  import('../features/verifications').then((m) => ({
    default: m.ProofHistoryScreen,
  })),
);
const ProofFlowScreen = lazyLoad(() =>
  import('../features/verifications').then((m) => ({
    default: m.ProofFlowScreen,
  })),
);
const ProofDetailScreen = lazyLoad(() =>
  import('../features/verifications').then((m) => ({
    default: m.ProofDetailScreen,
  })),
);
// NEW: MomentProofCeremony (Anı Mühürleme)
const MomentProofCeremony = lazyLoad(() =>
  import('../features/verifications/screens/MomentProofCeremony').then((m) => ({
    default: m.MomentProofCeremony,
  })),
);

// ===================================
// MOMENTS FEATURE SCREENS (ELEVATED)
// ===================================
// CreateMomentScreen moved to moments feature - the core of the app
const CreateMomentScreen = lazyLoad(() =>
  import('../features/moments').then((m) => ({
    default: m.CreateMomentScreen,
  })),
);
const MyMomentsScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.MyMomentsScreen })),
);
const MyHostedMomentsScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({
    default: m.MyHostedMomentsScreen,
  })),
);
const MomentDetailScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({
    default: m.MomentDetailScreen,
  })),
);
const MomentGalleryScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({
    default: m.MomentGalleryScreen,
  })),
);
const ShareMomentScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.ShareMomentScreen })),
);
const SavedMomentsScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({
    default: m.SavedMomentsScreen,
  })),
);
const EditMomentScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.EditMomentScreen })),
);
const ReportMomentScreen = lazyLoad(() =>
  import('../features/moderation').then((m) => ({
    default: m.ReportMomentScreen,
  })),
);
const DeletedMomentsScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({
    default: m.DeletedMomentsScreen,
  })),
);
const MomentCommentsScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({
    default: m.MomentCommentsScreen,
  })),
);

// ===================================
// PAYMENTS FEATURE SCREENS
// ===================================
import {
  PaymentMethodsScreen,
  AddCardScreen,
  TransactionDetailScreen,
  TransactionHistoryScreen,
  PaymentsKYCScreen,
  SubscriptionScreen,
  RefundRequestScreen,
  SuccessScreen,
  SuccessConfirmationScreen,
  PaymentFailedScreen,
  ProofReviewScreen,
  // PayTRWebViewScreen removed for Apple Compliance (backend only)
  PromoCodeScreen,
  UnifiedGiftFlowScreen,
  SubscriberOfferModal,
  // KYC Screens
  KYCIntroScreen,
  KYCDocumentTypeScreen,
  KYCDocumentCaptureScreen,
  KYCSelfieScreen,
  KYCReviewScreen,
  KYCPendingScreen,
} from '../features/payments';

// ===================================
// WALLET FEATURE SCREENS
// ===================================
import {
  WalletScreen,
  WithdrawScreen,
  WithdrawSuccessScreen,
  CoinStoreScreen,
} from '../features/wallet';

// ===================================
// NOTIFICATIONS FEATURE SCREENS
// ===================================
import {
  NotificationDetailScreen,
  GestureReceivedScreen,
} from '../features/notifications';

// ===================================
// SETTINGS FEATURE SCREENS
// ===================================
import {
  AppSettingsScreen,
  SecurityScreen,
  NotificationSettingsScreen,
  ConnectedAccountsScreen,
  BlockedUsersScreen,
  HiddenItemsScreen,
  DeleteAccountScreen,
  AboutScreen,
  FAQScreen,
  SupportScreen,
  HelpCenterScreen,
  SafetyScreen,
  EmergencyScreen,
  PrivacyPolicyScreen,
  TermsOfServiceScreen,
  RefundPolicyScreen,
  InviteFriendsScreen,
  InviteContactsScreen,
  MaintenanceScreen,
  DataPrivacyScreen,
  DataSettingsScreen,
  CommunityGuidelinesScreen,
  ReferralScreen,
  SafetyTipsScreen,
  DiagnosticsScreen,
} from '../features/settings';

// NEW: VisibilitySettingsScreen
const VisibilitySettingsScreen = lazyLoad(() =>
  import('../features/settings/screens/VisibilitySettingsScreen').then((m) => ({
    default: m.VisibilitySettingsScreen,
  })),
);
import { ReportUserScreen } from '../features/moderation';

// Legal screens - Turkish compliance
import {
  KVKKAydinlatmaScreen,
  MesafeliSatisScreen,
} from '../features/settings/screens/legal';

// ===================================
// TYPE IMPORTS
// ===================================
// RootStackParamList is defined in routeParams.ts to avoid circular dependencies
// when screens need to import navigation types
import { RootStackParamList } from './routeParams';
export type { RootStackParamList } from './routeParams';
export type { SuccessDetails } from './routeParams';

const Stack = createNativeStackNavigator<RootStackParamList>();

const ONBOARDING_KEY = '@has_seen_onboarding';
const GUEST_MODE_KEY = '@allow_guest_browse';

const AppNavigator = () => {
  // Check if user has seen onboarding - determines where Splash navigates to
  // Guest Mode: Users can browse Discover feed without logging in
  const [initialRoute, setInitialRoute] = useState<
    'Splash' | 'Onboarding' | 'Welcome' | 'MainTabs' | null
  >(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
        const allowGuestBrowse = await AsyncStorage.getItem(GUEST_MODE_KEY);

        // Guest Mode Strategy:
        // - If user has seen onboarding and guest browsing is enabled, go to MainTabs (Discover)
        // - This allows users to "taste the product" before signing up
        // - Login is required only for actions like Gift, Chat, Save
        if (hasSeenOnboarding === 'true') {
          // Enable guest browsing by default after onboarding
          if (allowGuestBrowse !== 'false') {
            await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
            setInitialRoute('MainTabs');
          } else {
            setInitialRoute('Welcome');
          }
        } else {
          setInitialRoute('Splash');
        }
      } catch (_onboardingError) {
        setInitialRoute('Splash');
      }
    };
    checkOnboarding();
  }, []);

  // Setup session expired callback for API client
  useEffect(() => {
    apiClient.setSessionExpiredCallback(() => {
      // Navigate to SessionExpired screen when token refresh fails
      if (navigationRef.isReady()) {
        // Type assertion required for dynamic navigation from outside component
        (navigationRef.navigate as (name: string) => void)('SessionExpired');
      }
    });

    // Setup deep link handler with navigation
    if (navigationRef.current) {
      // P2 FIX: setNavigation is now async for queue persistence
      deepLinkHandler.setNavigation(navigationRef.current).catch((err) => {
        logger.error('[AppNavigator] Failed to setup deep link handler:', err);
      });
    }

    // Handle deep links for email verification and password reset
    const handleDeepLink = (url: string) => {
      try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        const params = Object.fromEntries(urlObj.searchParams);

        if (!navigationRef.isReady()) {
          logger.warn('Navigation not ready for deep link:', url);
          return;
        }

        // Email verification
        if (path.includes('/verify-email') || path.includes('/verify')) {
          const { token, code } = params;
          if (token || code) {
            (navigationRef.navigate as any)('VerifyCode', {
              verificationToken: token || code,
              email: params.email,
            });
          }
        }
        // Password reset
        else if (
          path.includes('/reset-password') ||
          path.includes('/password-reset')
        ) {
          const { token } = params;
          if (token) {
            (navigationRef.navigate as any)('SetPassword', {
              resetToken: token,
            });
          }
        }
        // Fallback to deep link handler for other routes
        else {
          deepLinkHandler.handleDeepLink(url);
        }
      } catch (error) {
        logger.error('Failed to handle deep link:', error);
      }
    };

    // Get initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for incoming URLs
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Show loading while checking onboarding status
  if (initialRoute === null) {
    return <LoadingFallback />;
  }

  // Deep linking configuration
  const linking = {
    // Canonical Lovendo prefixes first; keep legacy Lovendo for backward compatibility.
    prefixes: [
      'lovendo://',
      'https://www.lovendo.xyz',
      'lovendo://',
      'https://lovendo.app',
    ],
    config: {
      screens: {
        MomentDetail: 'moment/:momentId',
        ProfileDetail: 'profile/:userId',
        Chat: 'chat/:conversationId',
        Settings: 'settings',
      },
    },
  };

  return (
    <NavigationErrorBoundary>
      <NavigationContainer
        linking={linking}
        ref={navigationRef}
        onReady={() => {
          // ADDED: Track initial route
          const currentRoute = navigationRef.current?.getCurrentRoute();
          if (currentRoute) {
            addBreadcrumb(
              `App started: ${currentRoute.name}`,
              'navigation',
              'info',
              { screen: currentRoute.name, params: currentRoute.params },
            );
          }
        }}
        onStateChange={() => {
          // ADDED: Track navigation changes
          const currentRoute = navigationRef.current?.getCurrentRoute();
          if (currentRoute) {
            addBreadcrumb(
              `Navigated to: ${currentRoute.name}`,
              'navigation',
              'info',
              { screen: currentRoute.name },
            );
          }
        }}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <Suspense fallback={<LoadingFallback />}>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
              // Awwwards kalitesinde ipeksi fade gecis efekti
              animation: 'fade_from_bottom',
              animationDuration: 350,
              contentStyle: { backgroundColor: COLORS.background.primary },
              gestureEnabled: true,
            }}
          >
            {/* Giris Akisi - Ipeksi fade gecisler */}
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ gestureEnabled: false, animation: 'fade' }}
            />
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ animation: 'fade' }}
            />
            {/* UnifiedAuth - Master 2026 Liquid Auth Flow */}
            <Stack.Screen
              name="UnifiedAuth"
              component={UnifiedAuthScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="SessionExpired"
              component={SessionExpiredScreen}
            />
            <Stack.Screen name="LinkNotFound" component={LinkNotFoundScreen} />
            <Stack.Screen name="LinkExpired" component={LinkExpiredScreen} />
            <Stack.Screen name="LinkInvalid" component={LinkInvalidScreen} />
            <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
            <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
            <Stack.Screen
              name="TwoFactorSetup"
              component={TwoFactorSetupScreen}
            />
            <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
            {/* Auth Success - Premium fade for celebration */}
            <Stack.Screen
              name="SuccessConfirmation"
              component={SuccessConfirmationScreen}
              options={{ animation: 'fade', gestureEnabled: false }}
            />
            <Stack.Screen
              name="AuthSuccess"
              component={AuthSuccessScreen}
              options={{ gestureEnabled: false, animation: 'fade' }}
            />
            <Stack.Screen name="Maintenance" component={MaintenanceScreen} />
            <Stack.Screen name="About" component={AboutScreen} />

            {/* Dispute Flow */}
            <Stack.Screen name="DisputeFlow" component={DisputeFlowScreen} />

            <Stack.Screen
              name="TransactionHistory"
              component={TransactionHistoryScreen}
            />
            <Stack.Screen
              name="PaymentFailed"
              component={PaymentFailedScreen}
            />
            <Stack.Screen name="VerifyPhone" component={VerifyPhoneScreen} />
            <Stack.Screen
              name="CompleteProfile"
              component={CompleteProfileScreen}
            />

            {/* Unified Success Screen - Premium celebration fade */}
            <Stack.Screen
              name="Success"
              component={SuccessScreen}
              options={{ animation: 'fade', gestureEnabled: false }}
            />

            {/* Main App - Tab Navigator */}
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
              options={{ animation: 'fade', gestureEnabled: false }}
            />

            {/* Individual Screens (for deep linking) */}
            <Stack.Screen
              name="Discover"
              component={DiscoverScreen}
              options={{ animation: 'fade' }}
            />
            {/* Search removed - platform is filter-based only */}
            {/* Inbox removed - deprecated, use Notifications or Messages */}
            <Stack.Screen name="Requests" component={RequestsScreen} />
            <Stack.Screen name="Messages" component={MessagesScreen} />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
            />

            <Stack.Screen
              name="CreateMoment"
              component={CreateMomentScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="EditMoment" component={EditMomentScreen} />
            {/* Seremoni ve Detay Ekranlari - Premium modal presentation */}
            <Stack.Screen
              name="MomentDetail"
              component={MomentDetailScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                gestureDirection: 'vertical',
              }}
            />
            <Stack.Screen
              name="MomentComments"
              component={MomentCommentsScreen}
            />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen
              name="ProfileDetail"
              component={ProfileDetailScreen}
            />
            <Stack.Screen name="TrustNotes" component={TrustNotesScreen} />
            <Stack.Screen
              name="MomentGallery"
              component={MomentGalleryScreen}
            />
            <Stack.Screen name="ProofHistory" component={ProofHistoryScreen} />

            {/* Proof System */}
            <Stack.Screen name="ProofFlow" component={ProofFlowScreen} />
            <Stack.Screen name="ProofDetail" component={ProofDetailScreen} />
            <Stack.Screen name="ProofReview" component={ProofReviewScreen} />

            {/* Approval & Matching - Vetting Ceremony with vertical slide */}
            <Stack.Screen
              name="ReceiverApproval"
              component={ReceiverApprovalScreen}
              options={{
                animation: 'slide_from_bottom',
                gestureDirection: 'vertical',
                gestureEnabled: true,
              }}
            />
            <Stack.Screen
              name="MatchConfirmation"
              component={MatchConfirmationScreen}
            />

            {/* Communication */}
            <Stack.Screen name="Chat" component={ChatScreen} />
            {/* REMOVED: ChatDetail - duplicate route, use Chat instead */}

            {/* Checkout & Reviews (Modals) */}
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ presentation: 'modal' }}
            />
            {/* Transactions */}
            <Stack.Screen
              name="TransactionDetail"
              component={TransactionDetailScreen}
            />
            <Stack.Screen name="RefundPolicy" component={RefundPolicyScreen} />
            <Stack.Screen
              name="RefundRequest"
              component={RefundRequestScreen}
            />

            {/* Escrow & Gesture Tracking */}
            <Stack.Screen name="EscrowStatus" component={EscrowStatusScreen} />
            <Stack.Screen
              name="GestureReceived"
              component={GestureReceivedScreen}
            />

            {/* Settings */}
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="FAQ" component={FAQScreen} />
            <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
            <Stack.Screen
              name="DeleteAccount"
              component={DeleteAccountScreen}
            />
            <Stack.Screen
              name="NotificationSettings"
              component={NotificationSettingsScreen}
            />
            <Stack.Screen
              name="HowEscrowWorks"
              component={HowEscrowWorksScreen}
            />
            <Stack.Screen name="SavedMoments" component={SavedMomentsScreen} />
            <Stack.Screen name="ReportMoment" component={ReportMomentScreen} />
            <Stack.Screen name="ReportUser" component={ReportUserScreen} />
            <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
            <Stack.Screen name="HiddenItems" component={HiddenItemsScreen} />
            <Stack.Screen
              name="ArchivedChats"
              component={ArchivedChatsScreen}
            />

            {/* Identity Verification (Modular KYC Flow) */}
            <Stack.Screen
              name="IdentityVerification"
              component={KYCIntroScreen}
            />
            <Stack.Screen
              name="KYCDocumentType"
              component={KYCDocumentTypeScreen}
            />
            <Stack.Screen
              name="KYCDocumentCapture"
              component={KYCDocumentCaptureScreen}
            />
            <Stack.Screen name="KYCSelfie" component={KYCSelfieScreen} />
            <Stack.Screen name="KYCReview" component={KYCReviewScreen} />
            <Stack.Screen name="KYCPending" component={KYCPendingScreen} />

            {/* Social & Invite */}
            <Stack.Screen
              name="InviteFriends"
              component={InviteFriendsScreen}
            />
            <Stack.Screen
              name="InviteContacts"
              component={InviteContactsScreen}
            />

            {/* Reputation - Now using TrustGardenDetailScreen */}
            <Stack.Screen
              name="Reputation"
              component={TrustGardenDetailScreen}
            />

            {/* Legal & Policy */}
            <Stack.Screen
              name="TermsOfService"
              component={TermsOfServiceScreen}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
            />
            <Stack.Screen name="PaymentsKYC" component={PaymentsKYCScreen} />
            <Stack.Screen
              name="KVKKAydinlatma"
              component={KVKKAydinlatmaScreen}
            />
            <Stack.Screen
              name="MesafeliSatis"
              component={MesafeliSatisScreen}
            />

            {/* Withdraw */}
            <Stack.Screen name="Withdraw" component={WithdrawScreen} />
            <Stack.Screen
              name="WithdrawSuccess"
              component={WithdrawSuccessScreen}
            />

            {/* Payment Methods */}
            <Stack.Screen
              name="PaymentMethods"
              component={PaymentMethodsScreen}
            />
            <Stack.Screen name="AddCard" component={AddCardScreen} />

            {/* Gift & Offer Flows */}
            <Stack.Screen
              name="UnifiedGiftFlow"
              component={UnifiedGiftFlowScreen}
            />
            <Stack.Screen
              name="SubscriberOfferModal"
              component={SubscriberOfferModal}
              options={{ presentation: 'modal' }}
            />

            {/* Wallet & Settings */}
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen
              name="CoinStore"
              component={CoinStoreScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen name="PromoCode" component={PromoCodeScreen} />
            <Stack.Screen name="Settings" component={AppSettingsScreen} />
            <Stack.Screen
              name="NotificationDetail"
              component={NotificationDetailScreen}
            />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />

            {/* Profile Sub-screens */}
            <Stack.Screen name="MyMoments" component={MyMomentsScreen} />
            <Stack.Screen
              name="MyHostedMoments"
              component={MyHostedMomentsScreen}
            />
            <Stack.Screen name="Security" component={SecurityScreen} />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
            />
            <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
            <Stack.Screen name="DataSettings" component={DataSettingsScreen} />
            <Stack.Screen
              name="ConnectedAccounts"
              component={ConnectedAccountsScreen}
            />
            <Stack.Screen
              name="TrustGardenDetail"
              component={TrustGardenDetailScreen}
            />

            {/* Ticket */}
            <Stack.Screen name="Ticket" component={TicketScreen} />
            <Stack.Screen name="ShareMoment" component={ShareMomentScreen} />
            {/* <Stack.Screen name="PayTRWebView" component={PayTRWebViewScreen} /> */}

            {/* Footer Pages */}
            <Stack.Screen name="Safety" component={SafetyScreen} />
            <Stack.Screen name="Emergency" component={EmergencyScreen} />

            {/* Data Privacy & Deleted Content */}
            <Stack.Screen name="DataPrivacy" component={DataPrivacyScreen} />
            <Stack.Screen
              name="DeletedMoments"
              component={DeletedMomentsScreen}
            />

            {/* NEW: Moment Proof Ceremony - Anı Mühürleme */}
            <Stack.Screen
              name="MomentProofCeremony"
              component={MomentProofCeremony}
              options={{
                animation: 'slide_from_bottom',
                gestureDirection: 'vertical',
                presentation: 'modal',
              }}
            />

            {/* NEW: Visibility Settings - Görünürlük Ayarları */}
            <Stack.Screen
              name="VisibilitySettings"
              component={VisibilitySettingsScreen}
              options={{ animation: 'slide_from_right' }}
            />

            {/* Image Viewer */}
            <Stack.Screen
              name="ImageViewer"
              component={ImageViewerScreen}
              options={{
                presentation: 'fullScreenModal',
                animation: 'fade',
                headerShown: false,
              }}
            />

            {/* Missing Screens - Now Registered */}
            <Stack.Screen name="Achievements" component={AchievementsScreen} />
            <Stack.Screen
              name="BiometricSetup"
              component={BiometricSetupScreen}
            />
            <Stack.Screen
              name="CommunityGuidelines"
              component={CommunityGuidelinesScreen}
            />
            <Stack.Screen
              name="DateTimePicker"
              component={DateTimePickerScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="NotFound" component={NotFoundScreen} />
            <Stack.Screen
              name="PickLocation"
              component={PickLocationScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen name="Referral" component={ReferralScreen} />
            <Stack.Screen name="SafetyTips" component={SafetyTipsScreen} />

            {/* Diagnostics (Hidden - 7 taps on version) */}
            <Stack.Screen
              name="Diagnostics"
              component={DiagnosticsScreen}
              options={{ animation: 'slide_from_bottom' }}
            />

            {/* Dev Menu (Development Only) */}
            {__DEV__ && (
              <Stack.Screen name="DevMenu" component={DevMenuScreen} />
            )}
          </Stack.Navigator>
        </Suspense>
      </NavigationContainer>
    </NavigationErrorBoundary>
  );
};

export default AppNavigator;

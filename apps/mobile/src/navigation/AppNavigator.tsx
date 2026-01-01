// Note: import/order disabled because lazyLoad imports are grouped by feature, not alphabetically
import React, { Suspense, useState, useEffect } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
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
  LoginScreen,
  SetPasswordScreen,
  TwoFactorSetupScreen,
  VerifyCodeScreen,
  WaitingForCodeScreen,
  ForgotPasswordScreen,
  ChangePasswordScreen,
} from '../features/auth';
import SessionExpiredScreen from '../screens/SessionExpiredScreen';
import LinkNotFoundScreen from '../screens/LinkNotFoundScreen';
import LinkExpiredScreen from '../screens/LinkExpiredScreen';
import LinkInvalidScreen from '../screens/LinkInvalidScreen';

// ===================================
// TRIPS FEATURE SCREENS
// ===================================
import {
  DiscoverScreen,
  BookingDetailScreen,
  EscrowStatusScreen,
  HowEscrowWorksScreen,
  MatchConfirmationScreen,
  ReceiverApprovalScreen,
  DisputeFlowScreen,
  RequestsScreen,
  TicketScreen,
} from '../features/trips';

// ===================================
// MESSAGES FEATURE SCREENS
// ===================================
import {
  MessagesScreen,
  ChatScreen,
  ArchivedChatsScreen,
} from '../features/messages';

// ===================================
// NEW FEATURE SCREENS
// ===================================
import { SearchMapScreen } from '../features/discovery';
import { InboxScreen, ChatDetailScreen } from '../features/chat';
import { WalletScreen as WalletFeatureScreen } from '../features/wallet';
import { NotificationsScreen } from '../features/notifications';
import { CheckoutScreen } from '../features/payment';
import { ReviewScreen } from '../features/reviews';

// ===================================
// PROFILE FEATURE SCREENS
// ===================================
const ProfileScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.ProfileScreen })),
);
const EditProfileScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.EditProfileScreen })),
);
const ReputationScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.ReputationScreen })),
);
const TrustGardenDetailScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({
    default: m.TrustGardenDetailScreen,
  })),
);
import {
  TrustNotesScreen,
  ProfileDetailScreen,
  UserProfileScreen,
} from '../features/profile';

// Proof system screens
const ProofHistoryScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({
    default: m.ProofHistoryScreen,
  })),
);
const ProofFlowScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.ProofFlowScreen })),
);
const ProofDetailScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.ProofDetailScreen })),
);

// Moments screens
const MyMomentsScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.MyMomentsScreen })),
);
const CreateMomentScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({
    default: m.CreateMomentScreen,
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
  import('../features/profile').then((m) => ({
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
  WalletScreen,
  WithdrawScreen,
  PaymentMethodsScreen,
  AddCardScreen,
  TransactionDetailScreen,
  TransactionHistoryScreen,
  PaymentsKYCScreen,
  SubscriptionScreen,
  GiftInboxScreen,
  GiftInboxDetailScreen,
  UnifiedGiftFlowScreen,
  MyGiftsScreen,
  RefundRequestScreen,
  SuccessScreen,
  SuccessConfirmationScreen,
  PaymentFailedScreen,
  ProofReviewScreen,
  PayTRWebViewScreen,
  // KYC Screens
  KYCIntroScreen,
  KYCDocumentTypeScreen,
  KYCDocumentCaptureScreen,
  KYCSelfieScreen,
  KYCReviewScreen,
  KYCPendingScreen,
} from '../features/payments';

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
  ReportUserScreen,
  MaintenanceScreen,
  DataPrivacyScreen,
  DietaryPreferencesScreen,
} from '../features/settings';

// Legal screens - Turkish compliance
import {
  KVKKAydinlatmaScreen,
  MesafeliSatisScreen,
} from '../features/settings/screens/legal';

// ===================================
// CALENDAR FEATURE SCREENS
// ===================================
import { MyCalendarScreen } from '../features/calendar';

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

const AppNavigator = () => {
  // Check if user has seen onboarding - determines where Splash navigates to
  const [initialRoute, setInitialRoute] = useState<
    'Splash' | 'Onboarding' | 'Welcome' | null
  >(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
        // Always start with Splash, which will navigate to appropriate screen
        // Pass the next destination via AsyncStorage or state
        setInitialRoute(hasSeenOnboarding === 'true' ? 'Welcome' : 'Splash');
      } catch {
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
      deepLinkHandler.setNavigation(navigationRef.current);
    }
  }, []);

  // Show loading while checking onboarding status
  if (initialRoute === null) {
    return <LoadingFallback />;
  }

  // Deep linking configuration
  const linking = {
    prefixes: ['travelmatch://', 'https://travelmatch.app'],
    config: {
      screens: {
        MomentDetail: 'moment/:momentId',
        ProfileDetail: 'profile/:userId',
        Chat: 'chat/:conversationId',
        GiftInboxDetail: 'gift/:giftId',
        Settings: 'settings',
      },
    },
  };

  return (
    <NavigationErrorBoundary>
      <NavigationContainer linking={linking} ref={navigationRef}>
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
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: '#050505' },
            }}
          >
            {/* Splash & Onboarding */}
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
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
            <Stack.Screen
              name="WaitingForCode"
              component={WaitingForCodeScreen}
            />
            <Stack.Screen
              name="SuccessConfirmation"
              component={SuccessConfirmationScreen}
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

            {/* Unified Success Screen */}
            <Stack.Screen name="Success" component={SuccessScreen} />

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
            <Stack.Screen
              name="Search"
              component={SearchMapScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen
              name="Inbox"
              component={InboxScreen}
              options={{ animation: 'fade' }}
            />
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
            <Stack.Screen name="MomentDetail" component={MomentDetailScreen} />
            <Stack.Screen
              name="MomentComments"
              component={MomentCommentsScreen}
            />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen
              name="ProfileDetail"
              component={ProfileDetailScreen}
            />
            <Stack.Screen name="MyGifts" component={MyGiftsScreen} />
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

            {/* Approval & Matching */}
            <Stack.Screen
              name="ReceiverApproval"
              component={ReceiverApprovalScreen}
            />
            <Stack.Screen
              name="MatchConfirmation"
              component={MatchConfirmationScreen}
            />

            {/* Communication */}
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />

            {/* User Profile (Public View) */}
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />

            {/* Checkout & Reviews (Modals) */}
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="Review"
              component={ReviewScreen}
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

            {/* Gift Inbox */}
            <Stack.Screen name="GiftInbox" component={GiftInboxScreen} />
            <Stack.Screen
              name="GiftInboxDetail"
              component={GiftInboxDetailScreen}
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

            {/* Reputation */}
            <Stack.Screen name="Reputation" component={ReputationScreen} />

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

            {/* Moment Publishing */}
            {/* <Stack.Screen
              name="MomentPreview"
              component={MomentPreviewScreen}
            />
            <Stack.Screen
              name="MomentPublished"
              component={MomentPublishedScreen}
            /> */}

            {/* Payment Methods */}
            <Stack.Screen
              name="PaymentMethods"
              component={PaymentMethodsScreen}
            />
            <Stack.Screen name="AddCard" component={AddCardScreen} />

            {/* Wallet & Settings */}
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="PromoCode" component={PromoCodeScreen} />
            <Stack.Screen name="Settings" component={AppSettingsScreen} />
            <Stack.Screen
              name="NotificationDetail"
              component={NotificationDetailScreen}
            />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />

            {/* Place Selection */}
            {/* <Stack.Screen name="SelectPlace" component={SelectPlaceScreen} /> */}

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

            {/* New Screens */}
            <Stack.Screen
              name="BookingDetail"
              component={BookingDetailScreen}
            />
            <Stack.Screen name="Ticket" component={TicketScreen} />
            <Stack.Screen name="ShareMoment" component={ShareMomentScreen} />
            <Stack.Screen
              name="UnifiedGiftFlow"
              component={UnifiedGiftFlowScreen}
            />
            <Stack.Screen name="PayTRWebView" component={PayTRWebViewScreen} />

            {/* Footer Pages */}
            {/* <Stack.Screen name="Contact" component={ContactScreen} />
            <Stack.Screen name="Help" component={HelpScreen} /> */}
            <Stack.Screen name="Safety" component={SafetyScreen} />
            <Stack.Screen name="Emergency" component={EmergencyScreen} />

            {/* Data Privacy & Deleted Content */}
            <Stack.Screen name="DataPrivacy" component={DataPrivacyScreen} />
            <Stack.Screen
              name="DeletedMoments"
              component={DeletedMomentsScreen}
            />

            {/* Calendar */}
            <Stack.Screen name="MyCalendar" component={MyCalendarScreen} />
          </Stack.Navigator>
        </Suspense>
      </NavigationContainer>
    </NavigationErrorBoundary>
  );
};

export default AppNavigator;

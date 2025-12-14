// Note: import/order disabled because lazyLoad imports are grouped by feature, not alphabetically
import React, { Suspense, useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationErrorBoundary } from '../components/ErrorBoundary';
import { COLORS } from '../constants/colors';
import { lazyLoad } from '../utils/lazyLoad';
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
    <ActivityIndicator size="large" color={COLORS.buttonPrimary} />
  </View>
);

// ===================================
// AUTH FEATURE SCREENS
// ===================================
import {
  WelcomeScreen,
  OnboardingScreen,
  CompleteProfileScreen,
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
  import('../features/profile').then((m) => ({ default: m.TrustGardenDetailScreen })),
);
import { TrustNotesScreen, ProfileDetailScreen } from '../features/profile';

// Proof system screens
const ProofHistoryScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.ProofHistoryScreen })),
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
  import('../features/profile').then((m) => ({ default: m.CreateMomentScreen })),
);
const MomentDetailScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.MomentDetailScreen })),
);
const MomentGalleryScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.MomentGalleryScreen })),
);
const ShareMomentScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.ShareMomentScreen })),
);
const SavedMomentsScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.SavedMomentsScreen })),
);
const EditMomentScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.EditMomentScreen })),
);
const ReportMomentScreen = lazyLoad(() =>
  import('../features/profile').then((m) => ({ default: m.ReportMomentScreen })),
);

// ===================================
// PAYMENTS FEATURE SCREENS
// ===================================
import {
  WalletScreen,
  WithdrawScreen,
  PaymentMethodsScreen,
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
  SafetyScreen,
  PrivacyPolicyScreen,
  TermsOfServiceScreen,
  RefundPolicyScreen,
  InviteFriendsScreen,
  ReportUserScreen,
  MaintenanceScreen,
} from '../features/settings';

// ===================================
// TYPE IMPORTS
// ===================================
import type { VerificationData as KYCVerificationData } from '../features/payments/kyc/types';
import type { SuccessType } from '../features/payments/screens/SuccessScreen';
import type { Moment, User, SelectedGiver } from '../types';

// Success screen details interface
interface SuccessDetails {
  amount?: number;
  destination?: string;
  referenceId?: string;
  estimatedArrival?: string;
}

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  PhoneAuth: undefined;
  EmailAuth: undefined;
  ForgotPassword: undefined;
  VerifyCode: undefined;
  WaitingForCode: undefined;
  SuccessConfirmation: undefined;
  SetPassword: undefined;
  TwoFactorSetup: undefined;
  Maintenance: undefined;
  About: undefined;

  // Dispute Flow
  DisputeFlow: {
    type: 'transaction' | 'proof';
    id: string;
    details?: any;
  };

  // Deprecated - to be removed
  // DisputeTransaction: undefined;
  // DisputeStatus: undefined;
  // DisputeProof: { proofId: string };

  CompleteProfile: undefined;

  // Unified Success Screen - replaces individual success screens
  Success: {
    type: SuccessType;
    title?: string;
    subtitle?: string;
    details?: SuccessDetails;
  };

  // Main App
  Discover: undefined;
  Requests: { initialTab?: 'pending' | 'notifications' } | undefined;
  Messages: undefined;

  CreateMoment: undefined;
  EditMoment: { momentId: string };
  MomentDetail: { moment: Moment; isOwner?: boolean; pendingRequests?: number };
  Profile: undefined;
  ProfileDetail: { userId: string };
  MyGifts: undefined;
  TrustNotes: undefined;
  MomentGallery: { momentId: string };
  ProofHistory: { momentId: string };

  // Proof System
  ProofFlow: undefined;
  ProofDetail: { proofId: string };

  // Approval & Matching
  ReceiverApproval: { momentTitle: string; totalAmount: number; momentId: string };
  MatchConfirmation: { selectedGivers: SelectedGiver[] };

  // Communication
  Chat: { otherUser: User; conversationId?: string };

  // Transactions
  TransactionDetail: { transactionId: string };
  RefundPolicy: undefined;
  RefundRequest: { transactionId: string };

  // Escrow & Gesture Tracking
  EscrowStatus: {
    escrowId: string;
    momentTitle: string;
    amount: number;
    receiverName: string;
    receiverAvatar?: string;
    status:
      | 'pending_proof'
      | 'in_escrow'
      | 'pending_verification'
      | 'verified'
      | 'refunded';
  };
  GestureReceived: {
    gestureId: string;
    momentTitle: string;
    amount: number;
    senderName?: string;
    senderAvatar?: string;
    isAnonymous: boolean;
    status: 'pending_proof' | 'pending_verification' | 'verified';
  };

  // Gift Inbox
  GiftInbox: undefined;
  GiftInboxDetail: {
    senderId: string;
    senderName: string;
    senderAvatar: string;
    senderAge: number;
    senderRating: number;
    senderVerified: boolean;
    senderTripCount: number;
    senderCity: string;
    gifts: Array<{
      id: string;
      momentTitle: string;
      momentEmoji: string;
      amount: number;
      message: string;
      paymentType: 'direct' | 'half_escrow' | 'full_escrow';
      status:
        | 'received'
        | 'pending_proof'
        | 'verifying'
        | 'verified'
        | 'failed';
      createdAt: string;
    }>;
    totalAmount: number;
    canStartChat: boolean;
  };

  // Settings
  Subscription: undefined;
  Support: undefined;
  FAQ: undefined;
  DeleteAccount: undefined;
  NotificationSettings: undefined;
  HowEscrowWorks: undefined;
  SavedMoments: undefined;
  ReportMoment: { momentId: string };
  ReportUser: { userId: string };
  BlockedUsers: undefined;
  HiddenItems: undefined;
  ArchivedChats: undefined;

  // Identity Verification (modular KYC flow)
  IdentityVerification: undefined;
  KYCDocumentType: { data: KYCVerificationData };
  KYCDocumentCapture: { data: KYCVerificationData };
  KYCSelfie: { data: KYCVerificationData };
  KYCReview: { data: KYCVerificationData };
  KYCPending: undefined;

  // Social & Invite
  InviteFriends: undefined;

  // Reputation
  Reputation: undefined;

  // Legal & Policy
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  PaymentsKYC: undefined;

  // Withdraw
  Withdraw: undefined;

  // Moment Publishing
  // MomentPreview: { momentId: string };
  // MomentPublished: { momentId: string };

  // Payment Methods
  PaymentMethods: undefined;

  // Wallet & Settings
  Wallet: undefined;
  TransactionHistory: undefined;
  Settings: undefined;
  NotificationDetail: { notificationId: string };
  EditProfile: undefined;

  // Place Selection
  // SelectPlace: undefined;

  // New Profile sub-screens
  MyMoments: undefined;
  Security: undefined;
  AppSettings: undefined;
  ConnectedAccounts: undefined;
  TrustGardenDetail: undefined;
  ChangePassword: undefined;

  // Missing routes
  BookingDetail: { bookingId: string };
  UnifiedGiftFlow: {
    recipientId: string;
    recipientName: string;
    momentId?: string;
  };
  ShareMoment: { momentId: string };

  // Footer pages
  // Contact: undefined;
  // Footer pages
  Safety: undefined;

  // Deep Link Error Screens
  LinkInvalid: { message?: string };
  LinkExpired: { message?: string };
  LinkNotFound: { message?: string };
  SessionExpired: undefined;
  PaymentFailed: { transactionId?: string; error?: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const ONBOARDING_KEY = '@has_seen_onboarding';

const AppNavigator = () => {
  // Check if user has seen onboarding
  const [initialRoute, setInitialRoute] = useState<
    'Onboarding' | 'Welcome' | null
  >(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
        setInitialRoute(
          hasSeenOnboarding === 'true' ? 'Welcome' : 'Onboarding',
        );
      } catch {
        setInitialRoute('Onboarding');
      }
    };
    checkOnboarding();
  }, []);
  
  // Setup session expired callback for API client
  useEffect(() => {
    apiClient.setSessionExpiredCallback(() => {
      // Navigate to SessionExpired screen when token refresh fails
      if (navigationRef.isReady()) {
        // @ts-ignore
        navigationRef.navigate('SessionExpired');
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
        <Suspense fallback={<LoadingFallback />}>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{
              headerShown: false,
              cardStyleInterpolator: ({ current: { progress } }) => ({
                cardStyle: {
                  opacity: progress,
                },
              }),
              transitionSpec: {
                open: {
                  animation: 'timing',
                  config: {
                    duration: 200,
                  },
                },
                close: {
                  animation: 'timing',
                  config: {
                    duration: 200,
                  },
                },
              },
            }}
          >
            {/* Onboarding & Auth */}
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SessionExpired" component={SessionExpiredScreen} />
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
            <Stack.Screen
              name="CompleteProfile"
              component={CompleteProfileScreen}
            />

            {/* Unified Success Screen */}
            <Stack.Screen name="Success" component={SuccessScreen} />

            {/* Main App - New consolidated screens */}
            <Stack.Screen name="Discover" component={DiscoverScreen} />
            <Stack.Screen name="Requests" component={RequestsScreen} />
            <Stack.Screen name="Messages" component={MessagesScreen} />

            <Stack.Screen name="CreateMoment" component={CreateMomentScreen} />
            <Stack.Screen name="EditMoment" component={EditMomentScreen} />
            <Stack.Screen name="MomentDetail" component={MomentDetailScreen} />
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

            {/* Wallet & Settings */}
            <Stack.Screen name="Wallet" component={WalletScreen} />
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
            <Stack.Screen name="Security" component={SecurityScreen} />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
            />
            <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
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
            <Stack.Screen name="ShareMoment" component={ShareMomentScreen} />
            <Stack.Screen
              name="UnifiedGiftFlow"
              component={UnifiedGiftFlowScreen}
            />

            {/* Footer Pages */}
            {/* <Stack.Screen name="Contact" component={ContactScreen} />
            <Stack.Screen name="Help" component={HelpScreen} /> */}
            <Stack.Screen name="Safety" component={SafetyScreen} />
          </Stack.Navigator>
        </Suspense>
      </NavigationContainer>
    </NavigationErrorBoundary>
  );
};

export default AppNavigator;

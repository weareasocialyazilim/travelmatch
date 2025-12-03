import React, { Suspense, useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lazyLoad } from '../utils/lazyLoad';
import { useFeatureFlag } from '../utils/featureFlags';

// Loading fallback for lazy-loaded screens
const LoadingFallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);

// Lazy load largest screens for better performance
const ProfileScreen = lazyLoad(() => import('../screens/ProfileScreen'));
const CreateMomentScreen = lazyLoad(
  () => import('../screens/CreateMomentScreen'),
);

// Main app screens
const DiscoverScreen = lazyLoad(() => import('../screens/DiscoverScreen'));
const RequestsScreen = lazyLoad(() => import('../screens/RequestsScreen'));
const MessagesScreen = lazyLoad(() => import('../screens/MessagesScreen'));

// Frequently used screens (keep eager loading for fast initial load)
import MomentDetailScreen from '../screens/MomentDetailScreen';

// Onboarding & Welcome - eagerly loaded as initial routes
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';

// Auth screens (lazy load)
const PhoneAuthScreen = lazyLoad(() =>
  import('../screens/PhoneAuthScreen').then((m) => ({
    default: m.PhoneAuthScreen,
  })),
);
const EmailAuthScreen = lazyLoad(() =>
  import('../screens/EmailAuthScreen').then((m) => ({
    default: m.EmailAuthScreen,
  })),
);

// Keep critical auth screens eager for fast auth flow
import { CompleteProfileScreen } from '../screens/CompleteProfileScreen';
import { SetPasswordScreen } from '../screens/SetPasswordScreen';
import { TwoFactorSetupScreen } from '../screens/TwoFactorSetupScreen';
import { VerifyCodeScreen } from '../screens/VerifyCodeScreen';
import { SuccessConfirmationScreen } from '../screens/SuccessConfirmationScreen';
import { WaitingForCodeScreen } from '../screens/WaitingForCodeScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';

// Lazy load infrequent screens
const MaintenanceScreen = lazyLoad(() =>
  import('../screens/MaintenanceScreen').then((m) => ({
    default: m.MaintenanceScreen,
  })),
);
const AboutScreen = lazyLoad(() =>
  import('../screens/AboutScreen').then((m) => ({ default: m.AboutScreen })),
);
const EditProfileScreen = lazyLoad(
  () => import('../screens/EditProfileScreen'),
);
const SubscriptionScreen = lazyLoad(() =>
  import('../screens/SubscriptionScreen').then((m) => ({
    default: m.SubscriptionScreen,
  })),
);

// Payment & Transaction screens (lazy load)
const PaymentMethodsScreen = lazyLoad(
  () => import('../screens/PaymentMethodsScreen'),
);
const WalletScreen = lazyLoad(() => import('../screens/WalletScreen'));
const TransactionHistoryScreen = lazyLoad(() =>
  import('../screens/TransactionHistoryScreen').then((m) => ({
    default: m.TransactionHistoryScreen,
  })),
);
const TransactionDetailScreen = lazyLoad(() =>
  import('../screens/TransactionDetailScreen').then((m) => ({
    default: m.TransactionDetailScreen,
  })),
);
const WithdrawScreen = lazyLoad(() => import('../screens/WithdrawScreen'));

// Payment Failed (not a success screen)
const PaymentFailedScreen = lazyLoad(() =>
  import('../screens/PaymentFailedScreen').then((m) => ({
    default: m.PaymentFailedScreen,
  })),
);

// Moment management (lazy load large screens)
const EditMomentScreen = lazyLoad(() =>
  import('../screens/EditMomentScreen').then((m) => ({
    default: m.EditMomentScreen,
  })),
);
const MomentGalleryScreen = lazyLoad(() =>
  import('../screens/MomentGalleryScreen').then((m) => ({
    default: m.MomentGalleryScreen,
  })),
);
const MomentPreviewScreen = lazyLoad(
  () => import('../screens/MomentPreviewScreen'),
);
const MomentPublishedScreen = lazyLoad(
  () => import('../screens/MomentPublishedScreen'),
);
const SavedMomentsScreen = lazyLoad(() =>
  import('../screens/SavedMomentsScreen').then((m) => ({
    default: m.SavedMomentsScreen,
  })),
);

// Frequently accessed - keep eager
import { DisputeTransactionScreen } from '../screens/DisputeTransactionScreen';
import { DisputeStatusScreen } from '../screens/DisputeStatusScreen';
import { ProofVerificationScreen } from '../screens/ProofVerificationScreen';
import { MyGiftsScreen } from '../screens/MyGiftsScreen';
import { TrustNotesScreen } from '../screens/TrustNotesScreen';
// Proof system (lazy load large screens)
const ProofHistoryScreen = lazyLoad(() =>
  import('../screens/ProofHistoryScreen').then((m) => ({
    default: m.ProofHistoryScreen,
  })),
);
const ProofUploadScreen = lazyLoad(() =>
  import('../screens/ProofUploadScreen').then((m) => ({
    default: m.ProofUploadScreen,
  })),
);
const UnifiedGiftFlowScreen = lazyLoad(() =>
  import('../screens/UnifiedGiftFlowScreen').then((m) => ({
    default: m.UnifiedGiftFlowScreen,
  })),
);
const ProofDetailScreen = lazyLoad(() =>
  import('../screens/ProofDetailScreen').then((m) => ({
    default: m.ProofDetailScreen,
  })),
);
const DisputeProofScreen = lazyLoad(
  () => import('../screens/DisputeProofScreen'),
);

// Escrow & Gesture screens (lazy load)
const EscrowStatusScreen = lazyLoad(() =>
  import('../screens/EscrowStatusScreen').then((m) => ({
    default: m.EscrowStatusScreen,
  })),
);
const GestureReceivedScreen = lazyLoad(() =>
  import('../screens/GestureReceivedScreen').then((m) => ({
    default: m.GestureReceivedScreen,
  })),
);

// Gift Inbox screens (lazy load)
const GiftInboxScreen = lazyLoad(() => import('../screens/GiftInboxScreen'));
const GiftInboxDetailScreen = lazyLoad(() =>
  import('../screens/GiftInboxDetailScreen').then((m) => ({
    default: m.GiftInboxDetailScreen,
  })),
);

// Settings & Help (lazy load)
const NotificationSettingsScreen = lazyLoad(() =>
  import('../screens/NotificationSettingsScreen').then((m) => ({
    default: m.NotificationSettingsScreen,
  })),
);
const SupportScreen = lazyLoad(() =>
  import('../screens/SupportScreen').then((m) => ({
    default: m.SupportScreen,
  })),
);
const FAQScreen = lazyLoad(() =>
  import('../screens/FAQScreen').then((m) => ({ default: m.FAQScreen })),
);
const HowEscrowWorksScreen = lazyLoad(() =>
  import('../screens/HowEscrowWorksScreen').then((m) => ({
    default: m.HowEscrowWorksScreen,
  })),
);
const TermsOfServiceScreen = lazyLoad(
  () => import('../screens/TermsOfServiceScreen'),
);
const PrivacyPolicyScreen = lazyLoad(
  () => import('../screens/PrivacyPolicyScreen'),
);
const RefundPolicyScreen = lazyLoad(() =>
  import('../screens/RefundPolicyScreen').then((m) => ({
    default: m.RefundPolicyScreen,
  })),
);

// Report & Moderation (lazy load)
const ReportMomentScreen = lazyLoad(() =>
  import('../screens/ReportMomentScreen').then((m) => ({
    default: m.ReportMomentScreen,
  })),
);
const ReportUserScreen = lazyLoad(() =>
  import('../screens/ReportUserScreen').then((m) => ({
    default: m.ReportUserScreen,
  })),
);
const BlockedUsersScreen = lazyLoad(() =>
  import('../screens/BlockedUsersScreen').then((m) => ({
    default: m.BlockedUsersScreen,
  })),
);
const HiddenItemsScreen = lazyLoad(() =>
  import('../screens/HiddenItemsScreen').then((m) => ({
    default: m.HiddenItemsScreen,
  })),
);
const ArchivedChatsScreen = lazyLoad(() =>
  import('../screens/ArchivedChatsScreen').then((m) => ({
    default: m.ArchivedChatsScreen,
  })),
);
const DeleteAccountScreen = lazyLoad(
  () => import('../screens/DeleteAccountScreen'),
);

// Identity verification (unified wizard)
const IdentityVerificationWizardScreen = lazyLoad(() =>
  import('../screens/IdentityVerificationWizardScreen').then((m) => ({
    default: m.IdentityVerificationWizardScreen,
  })),
);

// Social (lazy load)
const InviteFriendsScreen = lazyLoad(
  () => import('../screens/InviteFriendsScreen'),
);
// Reputation & Reviews (lazy load)
const ReputationScreen = lazyLoad(() => import('../screens/ReputationScreen'));

// Profile sub-screens (lazy load)
const MyMomentsScreen = lazyLoad(
  () => import('../screens/MyMomentsScreen'),
);
const SecurityScreen = lazyLoad(
  () => import('../screens/SecurityScreen'),
);
const ChangePasswordScreen = lazyLoad(
  () => import('../screens/ChangePasswordScreen'),
);
const AppSettingsScreen = lazyLoad(
  () => import('../screens/AppSettingsScreen'),
);
const ConnectedAccountsScreen = lazyLoad(
  () => import('../screens/ConnectedAccountsScreen'),
);
const TrustGardenDetailScreen = lazyLoad(
  () => import('../screens/TrustGardenDetailScreen'),
);

// Payments & KYC (lazy load)
const PaymentsKYCScreen = lazyLoad(
  () => import('../screens/PaymentsKYCScreen'),
);
const RefundRequestScreen = lazyLoad(() =>
  import('../screens/RefundRequestScreen').then((m) => ({
    default: m.RefundRequestScreen,
  })),
);

// Keep frequently accessed screens eager
import { SelectPlaceScreen } from '../screens/SelectPlaceScreen';
import { ReceiverApprovalScreen } from '../screens/ReceiverApprovalScreen';
import MatchConfirmationScreen from '../screens/MatchConfirmationScreen';
import ChatScreen from '../screens/ChatScreen';
import NotificationDetailScreen from '../screens/NotificationDetailScreen';
import { ProfileDetailScreen } from '../screens/ProfileDetailScreen';
import SocialLoginScreen from '../screens/SocialLoginScreen';

// Unified Success Screen
const SuccessScreen = lazyLoad(() => import('../screens/SuccessScreen'));
import type { SuccessType } from '../screens/SuccessScreen';

import type { Moment, User, SelectedGiver } from '../types';

// Success screen details interface
interface SuccessDetails {
  amount?: number;
  destination?: string;
  referenceId?: string;
  estimatedArrival?: string;
}

export type RootStackParamList = {
  // Onboarding & Auth
  Onboarding: undefined;
  Welcome: undefined;
  SocialLogin: undefined;
  PhoneAuth: undefined;
  EmailAuth: undefined;
  ForgotPassword: undefined;
  SetPassword: undefined;
  TwoFactorSetup: undefined;
  VerifyCode: undefined;
  WaitingForCode: undefined;
  SuccessConfirmation: undefined;
  Maintenance: undefined;
  About: undefined;
  DisputeTransaction: undefined;
  DisputeStatus: undefined;
  ProofVerification: undefined;
  TransactionHistory: undefined;
  PaymentFailed: undefined;
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
  Requests: undefined;
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
  ProofUpload: undefined;
  ProofDetail: { proofId: string };

  // Approval & Matching
  ReceiverApproval: { momentTitle: string; totalAmount: number };
  MatchConfirmation: { selectedGivers: SelectedGiver[] };

  // Communication
  Chat: { otherUser: User };

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
    status: 'pending_proof' | 'in_escrow' | 'pending_verification' | 'verified' | 'refunded';
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
      status: 'received' | 'pending_proof' | 'verifying' | 'verified' | 'failed';
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
  DisputeProof: { proofId: string };
  NotificationSettings: undefined;
  HowEscrowWorks: undefined;
  SavedMoments: undefined;
  ReportMoment: { momentId: string };
  ReportUser: { userId: string };
  BlockedUsers: undefined;
  HiddenItems: undefined;
  ArchivedChats: undefined;

  // Identity Verification (unified wizard)
  IdentityVerification: undefined;

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
  MomentPreview: { momentId: string };
  MomentPublished: { momentId: string };

  // Payment Methods
  PaymentMethods: undefined;

  // Wallet & Settings
  Wallet: undefined;
  Settings: undefined;
  NotificationDetail: { notificationId: string };
  EditProfile: undefined;

  // Place Selection
  SelectPlace: undefined;
  
  // New Profile sub-screens
  MyMoments: undefined;
  Security: undefined;
  AppSettings: undefined;
  ConnectedAccounts: undefined;
  TrustGardenDetail: undefined;
  ChangePassword: undefined;

  // Missing routes
  BookingDetail: { bookingId: string };
  UnifiedGiftFlow: { recipientId: string; recipientName: string; momentId?: string };
  ShareMoment: { momentId: string };
  Search: { initialQuery?: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const ONBOARDING_KEY = '@has_seen_onboarding';

const AppNavigator = () => {
  // Feature flags for conditional routing
  const useUnifiedGiftFlow = useFeatureFlag('unifiedGiftFlow');

  // Check if user has seen onboarding
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'Welcome' | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
        setInitialRoute(hasSeenOnboarding === 'true' ? 'Welcome' : 'Onboarding');
      } catch {
        setInitialRoute('Onboarding');
      }
    };
    checkOnboarding();
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
    <NavigationContainer linking={linking}>
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
          <Stack.Screen name="SocialLogin" component={SocialLoginScreen} />
          <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
          <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
          <Stack.Screen name="TwoFactorSetup" component={TwoFactorSetupScreen} />
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
          <Stack.Screen
            name="DisputeTransaction"
            component={DisputeTransactionScreen}
          />
          <Stack.Screen name="DisputeStatus" component={DisputeStatusScreen} />
          <Stack.Screen
            name="ProofVerification"
            component={ProofVerificationScreen}
          />
          <Stack.Screen
            name="TransactionHistory"
            component={TransactionHistoryScreen}
          />
          <Stack.Screen name="PaymentFailed" component={PaymentFailedScreen} />
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
          <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
          <Stack.Screen name="MyGifts" component={MyGiftsScreen} />
          <Stack.Screen name="TrustNotes" component={TrustNotesScreen} />
          <Stack.Screen name="MomentGallery" component={MomentGalleryScreen} />
          <Stack.Screen name="ProofHistory" component={ProofHistoryScreen} />

          {/* Proof System */}
          <Stack.Screen name="ProofUpload" component={ProofUploadScreen} />
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
          <Stack.Screen name="RefundRequest" component={RefundRequestScreen} />

          {/* Escrow & Gesture Tracking */}
          <Stack.Screen name="EscrowStatus" component={EscrowStatusScreen} />
          <Stack.Screen name="GestureReceived" component={GestureReceivedScreen} />

          {/* Gift Inbox */}
          <Stack.Screen name="GiftInbox" component={GiftInboxScreen} />
          <Stack.Screen name="GiftInboxDetail" component={GiftInboxDetailScreen} />

          {/* Settings */}
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="FAQ" component={FAQScreen} />
          <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
          <Stack.Screen name="DisputeProof" component={DisputeProofScreen} />
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
          <Stack.Screen name="ArchivedChats" component={ArchivedChatsScreen} />

          {/* Identity Verification (Unified Wizard) */}
          <Stack.Screen
            name="IdentityVerification"
            component={IdentityVerificationWizardScreen}
          />

          {/* Social & Invite */}
          <Stack.Screen name="InviteFriends" component={InviteFriendsScreen} />

          {/* Reputation */}
          <Stack.Screen name="Reputation" component={ReputationScreen} />

          {/* Legal & Policy */}
          <Stack.Screen
            name="TermsOfService"
            component={TermsOfServiceScreen}
          />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="PaymentsKYC" component={PaymentsKYCScreen} />

          {/* Withdraw */}
          <Stack.Screen name="Withdraw" component={WithdrawScreen} />

          {/* Moment Publishing */}
          <Stack.Screen name="MomentPreview" component={MomentPreviewScreen} />
          <Stack.Screen
            name="MomentPublished"
            component={MomentPublishedScreen}
          />

          {/* Payment Methods */}
          <Stack.Screen
            name="PaymentMethods"
            component={PaymentMethodsScreen}
          />

          {/* Wallet & Settings */}
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen
            name="NotificationDetail"
            component={NotificationDetailScreen}
          />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />

          {/* Place Selection */}
          <Stack.Screen name="SelectPlace" component={SelectPlaceScreen} />
          
          {/* Profile Sub-screens */}
          <Stack.Screen name="MyMoments" component={MyMomentsScreen} />
          <Stack.Screen name="Security" component={SecurityScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
          <Stack.Screen name="ConnectedAccounts" component={ConnectedAccountsScreen} />
          <Stack.Screen name="TrustGardenDetail" component={TrustGardenDetailScreen} />
        </Stack.Navigator>
      </Suspense>
    </NavigationContainer>
  );
};

export default AppNavigator;

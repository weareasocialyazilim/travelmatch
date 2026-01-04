/**
 * Route parameters for the app navigation
 * This file is separate from AppNavigator to avoid circular dependencies
 * when screens need to import navigation types.
 */

import type { VerificationData as KYCVerificationData } from '../features/payments/kyc/types';
import type { SuccessType } from '../features/payments/types/success.types';
import type { Moment, User, SelectedGiver } from '../types';

// Success screen details interface
export interface SuccessDetails {
  amount?: number;
  destination?: string;
  referenceId?: string;
  estimatedArrival?: string;
}

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Onboarding: undefined;
  // UnifiedAuth - Master 2026 Liquid Auth Flow (replaces Login)
  UnifiedAuth: { initialMode?: 'login' | 'register' } | undefined;
  Register: undefined;
  PhoneAuth: undefined;
  EmailAuth: undefined;
  ForgotPassword: undefined;
  VerifyCode: { phone?: string; email?: string } | undefined;
  SuccessConfirmation: undefined;
  AuthSuccess: undefined;
  SetPassword: undefined;
  TwoFactorSetup: undefined;
  Maintenance: undefined;
  About: undefined;

  // Phone verification
  VerifyPhone: {
    email: string;
    phone: string;
    fullName: string;
  };

  // Dispute Flow
  DisputeFlow: {
    type: 'transaction' | 'proof';
    id: string;
    details?: Record<string, unknown>;
  };

  CompleteProfile: {
    email?: string;
    phone?: string;
    fullName?: string;
  };

  // Unified Success Screen - replaces individual success screens
  Success: {
    type: SuccessType;
    title?: string;
    subtitle?: string;
    details?: SuccessDetails;
  };

  // Main App - Tab Navigator
  MainTabs: undefined;

  // Individual Tab Screens (for deep linking)
  Discover: undefined;
  Search: undefined;
  Inbox: { initialTab?: 'active' | 'requests' } | undefined;
  Requests: { initialTab?: 'pending' | 'notifications' } | undefined;
  Messages: undefined;
  SearchMap: undefined;

  CreateMoment: undefined;
  EditMoment: { momentId: string };
  MomentDetail: { moment: Moment; isOwner?: boolean; pendingRequests?: number };
  MomentComments: { momentId: string; commentCount?: number };
  Profile: undefined;
  ProfileDetail: { userId: string };
  UserProfile: { userId: string };
  MyGifts: undefined;
  GiftCardMarket: undefined;
  TrustNotes: undefined;
  MomentGallery: { momentId: string };
  ProofHistory: { momentId: string };

  // Proof System
  ProofFlow: {
    escrowId?: string; // Escrow transaction ID
    giftId?: string; // Gift ID
    momentId?: string; // Moment being proven
    momentTitle?: string; // Moment title for display
    senderId?: string; // Gift sender's user ID (for notifications)
  };
  ProofDetail: { proofId: string };
  ProofReview: {
    escrowId: string;
    giftId: string;
    receiverId: string;
    receiverName: string;
    receiverAvatar?: string;
    momentTitle: string;
    amount: number;
    proofPhotos: string[];
    proofDescription?: string;
    proofSubmittedAt: string;
  };

  // Approval & Matching
  ReceiverApproval: {
    momentTitle: string;
    totalAmount: number;
    momentId: string;
  };
  MatchConfirmation: { selectedGivers: SelectedGiver[] };

  // Communication
  Chat: { otherUser: User; conversationId?: string };
  ChatDetail: { conversationId: string; otherUser: User };

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
    senderId: string; // User ID of the gift sender
    momentTitle: string;
    amount: number;
    senderName?: string;
    senderAvatar?: string;
    isAnonymous: boolean;
    status: 'pending_proof' | 'pending_verification' | 'verified';
  };

  // Gift Selection - Start gift flow from user profile
  GiftSelection: {
    recipientId: string;
    recipientName: string;
    recipientAvatar: string;
    topMomentId?: string; // Optional - pre-select user's top moment
  };

  // Gift Inbox
  GiftInbox: undefined;
  GiftInboxDetail: {
    senderId: string;
    senderName: string;
    senderAvatar: string;
    // Trust-based metrics (replacing legacy trip count)
    senderTrustScore: number; // 0-100 Trust Garden score
    senderSubscriptionTier: 'free' | 'premium' | 'platinum';
    senderMomentCount: number; // Number of moments created
    senderVerified: boolean;
    senderCity: string;
    gifts: Array<{
      id: string;
      momentTitle: string;
      momentEmoji: string;
      momentCategory: string; // For proof flow camera mode
      amount: number;
      message: string;
      paymentType: 'direct' | 'half_escrow' | 'full_escrow';
      status:
        | 'pending' // Subscriber offer waiting for acceptance
        | 'received'
        | 'pending_proof'
        | 'verifying'
        | 'verified'
        | 'failed';
      createdAt: string;
      isSubscriberOffer?: boolean;
      isHighValueOffer?: boolean; // For premium treatment
    }>;
    // Pending subscriber offers (not yet accepted)
    pendingOffers?: Array<{
      id: string;
      amount: number;
      currency: string;
      message: string;
      createdAt: string;
    }>;
    totalAmount: number;
    canStartChat: boolean;
  };

  // Notifications
  Notifications: undefined;

  // Settings
  Subscription: undefined;
  Support: undefined;
  FAQ: undefined;
  HelpCenter: undefined;
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
  InviteContacts: undefined;

  // Reputation
  Reputation: undefined;

  // Achievements
  Achievements: undefined;

  // Legal & Policy
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  PaymentsKYC: undefined;
  KVKKAydinlatma: undefined;
  MesafeliSatis: undefined;

  // Withdraw
  Withdraw: undefined;
  WithdrawSuccess:
    | {
        transactionCode?: string;
        amount?: number;
      }
    | undefined;

  // Payment Methods
  PaymentMethods: undefined;
  AddCard: undefined;

  // Checkout
  Checkout:
    | {
        momentId?: string;
        amount?: number;
        recipientId?: string;
        recipientName?: string;
        title?: string;
        price?: number;
        fee?: number;
      }
    | undefined;

  // Wallet & Settings
  Wallet: undefined;
  TransactionHistory: undefined;
  Settings: undefined;
  NotificationDetail: { notificationId: string };
  EditProfile: undefined;

  // New Profile sub-screens
  MyMoments: undefined;
  MyHostedMoments: undefined;
  Security: undefined;
  AppSettings: undefined;
  DataSettings: undefined;
  ConnectedAccounts: undefined;
  TrustGardenDetail: undefined;
  ChangePassword: undefined;

  // Moment Confirmation Ticket
  Ticket: { momentId: string; ticketId?: string };
  UnifiedGiftFlow: {
    recipientId: string;
    recipientName: string;
    momentId: string;
    momentTitle: string;
    momentImageUrl?: string;
    requestedAmount: number;
    requestedCurrency: 'TRY' | 'EUR' | 'USD' | 'GBP' | 'JPY' | 'CAD';
    // Subscriber offer params (optional)
    isSubscriberOffer?: boolean;
    offerDescription?: string;
  };
  // Subscriber Offer Modal for Pro/Platinum users
  SubscriberOfferModal: {
    momentId: string;
    momentTitle: string;
    momentCategory: string;
    targetValue: number;
    targetCurrency: string;
    hostId: string;
    hostName: string;
  };
  ShareMoment: { momentId: string };

  // Footer pages
  Safety: undefined;
  CommunityGuidelines: undefined;
  SafetyTips: undefined;
  Emergency: undefined;
  DietaryPreferences: undefined;
  Referral: undefined;

  // Deep Link Error Screens
  LinkInvalid: { message?: string };
  LinkExpired: { message?: string };
  LinkNotFound: { message?: string };
  SessionExpired: undefined;
  PaymentFailed: { transactionId?: string; error?: string };

  // PayTR WebView for secure payment
  PayTRWebView: {
    iframeToken: string;
    merchantOid: string;
    amount: number;
    currency: 'TRY' | 'EUR' | 'USD';
    giftId?: string;
    isTestMode?: boolean;
  };

  // Data Privacy & Deleted Moments
  DataPrivacy: undefined;
  DeletedMoments: undefined;

  // NEW: Gift Success Screen (PayTR Güvenceli)
  GiftSuccess: {
    giftId: string;
    momentId: string;
    momentTitle: string;
    momentCategory: string;
    amount: number;
    currency: string;
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
    escrowId?: string;
    paymentType: 'direct' | 'half_escrow' | 'full_escrow';
    isAnonymous?: boolean;
    conversationId?: string;
  };

  // NEW: Moment Proof Ceremony (Anı Mühürleme)
  MomentProofCeremony: {
    giftId: string;
    escrowId: string;
    momentId: string;
    momentTitle: string;
    momentCategory: string;
    senderId: string;
    senderName: string;
    amount: number;
    currency: string;
  };

  // NEW: Gift Legacy Screen (Hediye Mirası)
  GiftLegacy: undefined;

  // NEW: Visibility Settings (Görünürlük Ayarları)
  VisibilitySettings: undefined;

  // Dev Menu (development only)
  DevMenu: undefined;

  // Image Viewer (fullscreen modal)
  ImageViewer: { imageUrl: string };

  // Location Picker
  PickLocation: undefined;

  // Not Found (404)
  NotFound: undefined;

  // Date Time Picker Modal
  DateTimePicker:
    | {
        initialDate?: string; // YYYY-MM-DD format
        initialTime?: string; // HH:mm format
        onSelect?: (date: string, time: string) => void;
      }
    | undefined;

  // Biometric Setup (auth flow)
  BiometricSetup: undefined;

  // Promo Code
  PromoCode: undefined;
};

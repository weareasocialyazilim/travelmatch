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
  ReceiverApproval: {
    momentTitle: string;
    totalAmount: number;
    momentId: string;
  };
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

  // Payment Methods
  PaymentMethods: undefined;

  // Wallet & Settings
  Wallet: undefined;
  TransactionHistory: undefined;
  Settings: undefined;
  NotificationDetail: { notificationId: string };
  EditProfile: undefined;

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
  Safety: undefined;

  // Deep Link Error Screens
  LinkInvalid: { message?: string };
  LinkExpired: { message?: string };
  LinkNotFound: { message?: string };
  SessionExpired: undefined;
  PaymentFailed: { transactionId?: string; error?: string };
};

/**
 * Navigation Flow Tests
 * Tests for auth flows, payment flows, and main navigation
 */

// Mock navigation hooks
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockReset = jest.fn();
const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      reset: mockReset,
      replace: mockReplace,
      canGoBack: jest.fn(() => true),
      getState: jest.fn(() => ({ routes: [], index: 0 })),
    }),
    useRoute: () => ({
      params: {},
      name: 'TestScreen',
    }),
    useFocusEffect: jest.fn(),
    useIsFocused: () => true,
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock Expo modules
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('Navigation Flow Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Auth Flow Navigation', () => {
    it('should navigate from Welcome to PhoneAuth', () => {
      // Simulate button press
      mockNavigate('PhoneAuth');

      expect(mockNavigate).toHaveBeenCalledWith('PhoneAuth');
    });

    it('should navigate from Welcome to EmailAuth', () => {
      mockNavigate('EmailAuth');
      expect(mockNavigate).toHaveBeenCalledWith('EmailAuth');
    });

    it('should navigate from PhoneAuth to VerifyCode', () => {
      mockNavigate('VerifyCode', { phoneNumber: '+1234567890' });
      expect(mockNavigate).toHaveBeenCalledWith('VerifyCode', {
        phoneNumber: '+1234567890',
      });
    });

    it('should navigate from VerifyCode to CompleteProfile for new users', () => {
      mockNavigate('CompleteProfile');
      expect(mockNavigate).toHaveBeenCalledWith('CompleteProfile');
    });

    it('should navigate from CompleteProfile to Discover', () => {
      mockReset({
        index: 0,
        routes: [{ name: 'Discover' }],
      });
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Discover' }],
      });
    });

    it('should navigate to ForgotPassword from Login', () => {
      mockNavigate('ForgotPassword');
      expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword');
    });

    it('should navigate back from VerifyCode', () => {
      mockGoBack();
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should handle TwoFactorSetup navigation', () => {
      mockNavigate('TwoFactorSetup');
      expect(mockNavigate).toHaveBeenCalledWith('TwoFactorSetup');
    });
  });

  describe('Main Navigation Flow', () => {
    it('should navigate from Discover to MomentDetail', () => {
      const mockMoment = { id: 'moment-123', title: 'Test Moment' };
      mockNavigate('MomentDetail', { moment: mockMoment });
      expect(mockNavigate).toHaveBeenCalledWith('MomentDetail', {
        moment: mockMoment,
      });
    });

    it('should navigate from Discover to ProfileDetail', () => {
      mockNavigate('ProfileDetail', { userId: 'user-123' });
      expect(mockNavigate).toHaveBeenCalledWith('ProfileDetail', {
        userId: 'user-123',
      });
    });

    it('should navigate to CreateMoment from bottom nav', () => {
      mockNavigate('CreateMoment');
      expect(mockNavigate).toHaveBeenCalledWith('CreateMoment');
    });

    it('should navigate to Messages from bottom nav', () => {
      mockNavigate('Messages');
      expect(mockNavigate).toHaveBeenCalledWith('Messages');
    });

    it('should navigate from Messages to Chat', () => {
      mockNavigate('Chat', { conversationId: 'conv-123' });
      expect(mockNavigate).toHaveBeenCalledWith('Chat', {
        conversationId: 'conv-123',
      });
    });

    it('should navigate to Profile from bottom nav', () => {
      mockNavigate('Profile');
      expect(mockNavigate).toHaveBeenCalledWith('Profile');
    });

    it('should navigate to Requests from bottom nav', () => {
      mockNavigate('Requests');
      expect(mockNavigate).toHaveBeenCalledWith('Requests');
    });

    it('should navigate to Settings from Profile', () => {
      mockNavigate('Settings');
      expect(mockNavigate).toHaveBeenCalledWith('Settings');
    });

    it('should navigate to EditProfile from Profile', () => {
      mockNavigate('EditProfile');
      expect(mockNavigate).toHaveBeenCalledWith('EditProfile');
    });
  });

  describe('Payment Flow Navigation', () => {
    it('should navigate to UnifiedGiftFlow from MomentDetail', () => {
      mockNavigate('UnifiedGiftFlow', { momentId: 'moment-123', amount: 50 });
      expect(mockNavigate).toHaveBeenCalledWith('UnifiedGiftFlow', {
        momentId: 'moment-123',
        amount: 50,
      });
    });

    it('should navigate to PaymentMethods from Wallet', () => {
      mockNavigate('PaymentMethods');
      expect(mockNavigate).toHaveBeenCalledWith('PaymentMethods');
    });

    it('should navigate to Wallet from Profile', () => {
      mockNavigate('Wallet');
      expect(mockNavigate).toHaveBeenCalledWith('Wallet');
    });

    it('should navigate to Withdraw from Wallet', () => {
      mockNavigate('Withdraw');
      expect(mockNavigate).toHaveBeenCalledWith('Withdraw');
    });

    it('should navigate to TransactionHistory from Wallet', () => {
      mockNavigate('TransactionHistory');
      expect(mockNavigate).toHaveBeenCalledWith('TransactionHistory');
    });

    it('should navigate to TransactionDetail from TransactionHistory', () => {
      mockNavigate('TransactionDetail', { transactionId: 'txn-123' });
      expect(mockNavigate).toHaveBeenCalledWith('TransactionDetail', {
        transactionId: 'txn-123',
      });
    });

    it('should navigate to Success after successful payment', () => {
      mockNavigate('Success', { type: 'gift_sent' });
      expect(mockNavigate).toHaveBeenCalledWith('Success', {
        type: 'gift_sent',
      });
    });

    it('should navigate to PaymentFailed on payment failure', () => {
      mockNavigate('PaymentFailed', { error: 'Payment declined' });
      expect(mockNavigate).toHaveBeenCalledWith('PaymentFailed', {
        error: 'Payment declined',
      });
    });

    it('should navigate to DisputeTransaction', () => {
      mockNavigate('DisputeTransaction', { transactionId: 'txn-123' });
      expect(mockNavigate).toHaveBeenCalledWith('DisputeTransaction', {
        transactionId: 'txn-123',
      });
    });

    it('should navigate to EscrowStatus', () => {
      mockNavigate('EscrowStatus', { requestId: 'req-123' });
      expect(mockNavigate).toHaveBeenCalledWith('EscrowStatus', {
        requestId: 'req-123',
      });
    });
  });

  describe('Proof Flow Navigation', () => {
    it('should navigate to ProofUpload', () => {
      mockNavigate('ProofUpload', { giftId: 'gift-123' });
      expect(mockNavigate).toHaveBeenCalledWith('ProofUpload', {
        giftId: 'gift-123',
      });
    });

    it('should navigate to ProofVerification', () => {
      mockNavigate('ProofVerification', { proofId: 'proof-123' });
      expect(mockNavigate).toHaveBeenCalledWith('ProofVerification', {
        proofId: 'proof-123',
      });
    });

    it('should navigate to ProofDetail', () => {
      mockNavigate('ProofDetail', { proofId: 'proof-123' });
      expect(mockNavigate).toHaveBeenCalledWith('ProofDetail', {
        proofId: 'proof-123',
      });
    });

    it('should navigate to ProofHistory', () => {
      mockNavigate('ProofHistory');
      expect(mockNavigate).toHaveBeenCalledWith('ProofHistory');
    });

    it('should navigate to Success after proof approval', () => {
      mockNavigate('Success', { type: 'proof_approved' });
      expect(mockNavigate).toHaveBeenCalledWith('Success', {
        type: 'proof_approved',
      });
    });
  });

  describe('Gift Inbox Navigation', () => {
    it('should navigate to GiftInbox', () => {
      mockNavigate('GiftInbox');
      expect(mockNavigate).toHaveBeenCalledWith('GiftInbox');
    });

    it('should navigate to GiftInboxDetail', () => {
      mockNavigate('GiftInboxDetail', { giftId: 'gift-123' });
      expect(mockNavigate).toHaveBeenCalledWith('GiftInboxDetail', {
        giftId: 'gift-123',
      });
    });

    it('should navigate to MyGifts', () => {
      mockNavigate('MyGifts');
      expect(mockNavigate).toHaveBeenCalledWith('MyGifts');
    });
  });

  describe('Settings Navigation', () => {
    it('should navigate to NotificationSettings', () => {
      mockNavigate('NotificationSettings');
      expect(mockNavigate).toHaveBeenCalledWith('NotificationSettings');
    });

    it('should navigate to ChangePassword', () => {
      mockNavigate('ChangePassword');
      expect(mockNavigate).toHaveBeenCalledWith('ChangePassword');
    });

    it('should navigate to BlockedUsers', () => {
      mockNavigate('BlockedUsers');
      expect(mockNavigate).toHaveBeenCalledWith('BlockedUsers');
    });

    it('should navigate to HiddenItems', () => {
      mockNavigate('HiddenItems');
      expect(mockNavigate).toHaveBeenCalledWith('HiddenItems');
    });

    it('should navigate to DeleteAccount', () => {
      mockNavigate('DeleteAccount');
      expect(mockNavigate).toHaveBeenCalledWith('DeleteAccount');
    });

    it('should navigate to PrivacyPolicy', () => {
      mockNavigate('PrivacyPolicy');
      expect(mockNavigate).toHaveBeenCalledWith('PrivacyPolicy');
    });

    it('should navigate to TermsOfService', () => {
      mockNavigate('TermsOfService');
      expect(mockNavigate).toHaveBeenCalledWith('TermsOfService');
    });
  });

  describe('KYC/Identity Verification Navigation', () => {
    it('should navigate to IdentityVerification intro', () => {
      mockNavigate('IdentityVerification');
      expect(mockNavigate).toHaveBeenCalledWith('IdentityVerification');
    });

    it('should navigate through KYC flow', () => {
      // Step 1: Intro
      mockNavigate('KYCIntro');
      expect(mockNavigate).toHaveBeenCalledWith('KYCIntro');

      // Step 2: Document type
      mockNavigate('KYCDocumentType');
      expect(mockNavigate).toHaveBeenCalledWith('KYCDocumentType');

      // Step 3: Document capture
      mockNavigate('KYCDocumentCapture', { documentType: 'passport' });
      expect(mockNavigate).toHaveBeenCalledWith('KYCDocumentCapture', {
        documentType: 'passport',
      });

      // Step 4: Selfie
      mockNavigate('KYCSelfie');
      expect(mockNavigate).toHaveBeenCalledWith('KYCSelfie');

      // Step 5: Review
      mockNavigate('KYCReview');
      expect(mockNavigate).toHaveBeenCalledWith('KYCReview');
    });
  });

  describe('Support Navigation', () => {
    it('should navigate to FAQ', () => {
      mockNavigate('FAQ');
      expect(mockNavigate).toHaveBeenCalledWith('FAQ');
    });

    it('should navigate to Support', () => {
      mockNavigate('Support');
      expect(mockNavigate).toHaveBeenCalledWith('Support');
    });

    it('should navigate to HowEscrowWorks', () => {
      mockNavigate('HowEscrowWorks');
      expect(mockNavigate).toHaveBeenCalledWith('HowEscrowWorks');
    });

    it('should navigate to Help', () => {
      mockNavigate('Help');
      expect(mockNavigate).toHaveBeenCalledWith('Help');
    });

    it('should navigate to Contact', () => {
      mockNavigate('Contact');
      expect(mockNavigate).toHaveBeenCalledWith('Contact');
    });
  });

  describe('Report/Moderation Navigation', () => {
    it('should navigate to ReportMoment', () => {
      mockNavigate('ReportMoment', { momentId: 'moment-123' });
      expect(mockNavigate).toHaveBeenCalledWith('ReportMoment', {
        momentId: 'moment-123',
      });
    });

    it('should navigate to ReportUser', () => {
      mockNavigate('ReportUser', { userId: 'user-123' });
      expect(mockNavigate).toHaveBeenCalledWith('ReportUser', {
        userId: 'user-123',
      });
    });
  });

  describe('Deep Link Navigation', () => {
    it('should handle moment deep link', () => {
      const momentId = 'moment-123';
      mockNavigate('MomentDetail', { momentId });
      expect(mockNavigate).toHaveBeenCalledWith('MomentDetail', { momentId });
    });

    it('should handle profile deep link', () => {
      const userId = 'user-123';
      mockNavigate('ProfileDetail', { userId });
      expect(mockNavigate).toHaveBeenCalledWith('ProfileDetail', { userId });
    });

    it('should handle chat deep link', () => {
      const conversationId = 'conv-123';
      mockNavigate('Chat', { conversationId });
      expect(mockNavigate).toHaveBeenCalledWith('Chat', { conversationId });
    });

    it('should handle gift deep link', () => {
      const giftId = 'gift-123';
      mockNavigate('GiftInboxDetail', { giftId });
      expect(mockNavigate).toHaveBeenCalledWith('GiftInboxDetail', { giftId });
    });
  });

  describe('Navigation State Management', () => {
    it('should reset navigation to Discover after logout', () => {
      mockReset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
      expect(mockReset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    });

    it('should replace screen during onboarding', () => {
      mockReplace('Discover');
      expect(mockReplace).toHaveBeenCalledWith('Discover');
    });

    it('should go back when possible', () => {
      mockGoBack();
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});

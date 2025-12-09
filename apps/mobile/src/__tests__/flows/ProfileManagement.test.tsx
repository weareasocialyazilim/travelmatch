// @ts-nocheck
/**
 * Profile Management Flow Test Suite
 * Comprehensive tests for profile editing and settings
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  EditProfileScreen,
  SettingsScreen,
  PaymentMethodsScreen,
  NotificationSettingsScreen,
  PrivacySettingsScreen,
} from '@/screens/profile';
import { useProfile } from '@/hooks/useProfile';
import { useSettings } from '@/hooks/useSettings';
import { usePayments } from '@/hooks/usePayments';

jest.mock('@/hooks/useProfile');
jest.mock('@/hooks/useSettings');
jest.mock('@/hooks/usePayments');
jest.mock('@/hooks/useImagePicker');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

describe('EditProfileScreen', () => {
  const mockProfile = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Travel enthusiast',
    location: 'Los Angeles, CA',
    dateOfBirth: '1990-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    useProfile.mockReturnValue({
      profile: mockProfile,
      updateProfile: jest.fn().mockResolvedValue({}),
      uploadAvatar: jest.fn().mockResolvedValue({ url: 'new-avatar.jpg' }),
      isLoading: false,
      error: null,
    });
  });

  describe('Basic Rendering', () => {
    it('should render edit profile screen', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByTestID('edit-profile-screen')).toBeTruthy();
    });

    it('should render profile form with current values', () => {
      const { getByDisplayValue } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByDisplayValue('John Doe')).toBeTruthy();
      expect(getByDisplayValue('john@example.com')).toBeTruthy();
      expect(getByDisplayValue('Travel enthusiast')).toBeTruthy();
    });

    it('should render avatar with current image', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      const avatar = getByTestID('profile-avatar');
      expect(avatar.props.source.uri).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('Avatar Upload', () => {
    it('should show change photo button', () => {
      const { getByText } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Change Photo')).toBeTruthy();
    });

    it('should open image picker on change photo', async () => {
      const uploadAvatar = jest.fn().mockResolvedValue({ url: 'new.jpg' });
      useProfile.mockReturnValue({
        profile: mockProfile,
        updateProfile: jest.fn(),
        uploadAvatar,
        isLoading: false,
        error: null,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Change Photo'));
      
      await waitFor(() => {
        expect(uploadAvatar).toHaveBeenCalled();
      });
    });

    it('should update avatar after upload', async () => {
      const uploadAvatar = jest.fn().mockResolvedValue({ url: 'new-avatar.jpg' });
      useProfile.mockReturnValue({
        profile: mockProfile,
        updateProfile: jest.fn(),
        uploadAvatar,
        isLoading: false,
        error: null,
      });
      
      const { getByText, getByTestID } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Change Photo'));
      
      await waitFor(() => {
        const avatar = getByTestID('profile-avatar');
        expect(avatar.props.source.uri).toContain('new-avatar.jpg');
      });
    });

    it('should show remove photo option', () => {
      const { getByText } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Change Photo'));
      
      expect(getByText('Remove Photo')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should validate name is required', async () => {
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      const nameInput = getByPlaceholderText('Name');
      fireEvent.changeText(nameInput, '');
      fireEvent(nameInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Name is required')).toBeTruthy();
      });
    });

    it('should validate email format', async () => {
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      const emailInput = getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent(emailInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Invalid email format')).toBeTruthy();
      });
    });

    it('should validate bio length', async () => {
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      const bioInput = getByPlaceholderText('Bio');
      fireEvent.changeText(bioInput, 'a'.repeat(201));
      fireEvent(bioInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Bio must be 200 characters or less')).toBeTruthy();
      });
    });
  });

  describe('Profile Update', () => {
    it('should update profile with valid data', async () => {
      const updateProfile = jest.fn().mockResolvedValue({ success: true });
      useProfile.mockReturnValue({
        profile: mockProfile,
        updateProfile,
        uploadAvatar: jest.fn(),
        isLoading: false,
        error: null,
      });
      
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.changeText(getByPlaceholderText('Name'), 'Jane Doe');
      fireEvent.changeText(getByPlaceholderText('Bio'), 'Updated bio');
      
      fireEvent.press(getByText('Save Changes'));
      
      await waitFor(() => {
        expect(updateProfile).toHaveBeenCalledWith({
          name: 'Jane Doe',
          bio: 'Updated bio',
          email: mockProfile.email,
          location: mockProfile.location,
        });
      });
    });

    it('should show success message after update', async () => {
      const updateProfile = jest.fn().mockResolvedValue({ success: true });
      useProfile.mockReturnValue({
        profile: mockProfile,
        updateProfile,
        uploadAvatar: jest.fn(),
        isLoading: false,
        error: null,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Save Changes'));
      
      await waitFor(() => {
        expect(getByText('Profile updated successfully')).toBeTruthy();
      });
    });

    it('should navigate back after successful update', async () => {
      const updateProfile = jest.fn().mockResolvedValue({ success: true });
      useProfile.mockReturnValue({
        profile: mockProfile,
        updateProfile,
        uploadAvatar: jest.fn(),
        isLoading: false,
        error: null,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Save Changes'));
      
      await waitFor(() => {
        expect(mockNavigation.goBack).toHaveBeenCalled();
      });
    });

    it('should show loading state during update', () => {
      useProfile.mockReturnValue({
        profile: mockProfile,
        updateProfile: jest.fn(),
        uploadAvatar: jest.fn(),
        isLoading: true,
        error: null,
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByTestID('loading-indicator')).toBeTruthy();
    });

    it('should show error message on update failure', async () => {
      useProfile.mockReturnValue({
        profile: mockProfile,
        updateProfile: jest.fn().mockRejectedValue(new Error('Update failed')),
        uploadAvatar: jest.fn(),
        isLoading: false,
        error: new Error('Update failed'),
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      await waitFor(() => {
        expect(getByText('Update failed')).toBeTruthy();
      });
    });
  });

  describe('Cancel Changes', () => {
    it('should show cancel button', () => {
      const { getByText } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should navigate back on cancel', () => {
      const { getByText } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Cancel'));
      
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });

    it('should show confirmation if changes made', () => {
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <EditProfileScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.changeText(getByPlaceholderText('Name'), 'Changed');
      fireEvent.press(getByText('Cancel'));
      
      expect(getByText('Discard changes?')).toBeTruthy();
    });
  });
});

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    useSettings.mockReturnValue({
      settings: {
        notifications: true,
        darkMode: false,
        language: 'en',
      },
      updateSettings: jest.fn().mockResolvedValue({}),
    });
  });

  describe('Basic Rendering', () => {
    it('should render settings screen', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByTestID('settings-screen')).toBeTruthy();
    });

    it('should render settings sections', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Account')).toBeTruthy();
      expect(getByText('Notifications')).toBeTruthy();
      expect(getByText('Privacy')).toBeTruthy();
      expect(getByText('About')).toBeTruthy();
    });
  });

  describe('Account Settings', () => {
    it('should navigate to edit profile', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Edit Profile'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('EditProfile');
    });

    it('should navigate to payment methods', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Payment Methods'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('PaymentMethods');
    });

    it('should navigate to change password', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Change Password'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ChangePassword');
    });
  });

  describe('Notification Settings', () => {
    it('should toggle notifications', async () => {
      const updateSettings = jest.fn().mockResolvedValue({});
      useSettings.mockReturnValue({
        settings: { notifications: true },
        updateSettings,
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent(getByTestID('notifications-toggle'), 'valueChange', false);
      
      await waitFor(() => {
        expect(updateSettings).toHaveBeenCalledWith({ notifications: false });
      });
    });

    it('should navigate to detailed notification settings', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Notification Preferences'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('NotificationSettings');
    });
  });

  describe('Appearance Settings', () => {
    it('should toggle dark mode', async () => {
      const updateSettings = jest.fn().mockResolvedValue({});
      useSettings.mockReturnValue({
        settings: { darkMode: false },
        updateSettings,
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent(getByTestID('dark-mode-toggle'), 'valueChange', true);
      
      await waitFor(() => {
        expect(updateSettings).toHaveBeenCalledWith({ darkMode: true });
      });
    });

    it('should show language selector', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Language')).toBeTruthy();
    });
  });

  describe('Privacy Settings', () => {
    it('should navigate to privacy settings', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Privacy'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('PrivacySettings');
    });

    it('should navigate to blocked users', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Blocked Users'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('BlockedUsers');
    });
  });

  describe('About Section', () => {
    it('should show app version', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText(/Version/)).toBeTruthy();
    });

    it('should navigate to terms and conditions', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Terms & Conditions'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Terms');
    });

    it('should navigate to privacy policy', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Privacy Policy'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('PrivacyPolicy');
    });
  });

  describe('Account Actions', () => {
    it('should show logout button', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Logout')).toBeTruthy();
    });

    it('should show delete account button', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Delete Account')).toBeTruthy();
    });

    it('should show confirmation before delete', () => {
      const { getByText } = render(
        <NavigationContainer>
          <SettingsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Delete Account'));
      
      expect(getByText('Are you sure?')).toBeTruthy();
    });
  });
});

describe('PaymentMethodsScreen', () => {
  const mockPaymentMethods = [
    {
      id: 'pm-1',
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: 'pm-2',
      type: 'card',
      last4: '5555',
      brand: 'mastercard',
      expiryMonth: 6,
      expiryYear: 2024,
      isDefault: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    usePayments.mockReturnValue({
      paymentMethods: mockPaymentMethods,
      addPaymentMethod: jest.fn().mockResolvedValue({}),
      removePaymentMethod: jest.fn().mockResolvedValue({}),
      setDefaultPaymentMethod: jest.fn().mockResolvedValue({}),
      isLoading: false,
      error: null,
    });
  });

  describe('Basic Rendering', () => {
    it('should render payment methods screen', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <PaymentMethodsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByTestID('payment-methods-screen')).toBeTruthy();
    });

    it('should render list of payment methods', () => {
      const { getByText } = render(
        <NavigationContainer>
          <PaymentMethodsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('•••• 4242')).toBeTruthy();
      expect(getByText('•••• 5555')).toBeTruthy();
    });

    it('should show default badge', () => {
      const { getByText } = render(
        <NavigationContainer>
          <PaymentMethodsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Default')).toBeTruthy();
    });
  });

  describe('Add Payment Method', () => {
    it('should show add button', () => {
      const { getByText } = render(
        <NavigationContainer>
          <PaymentMethodsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Add Payment Method')).toBeTruthy();
    });

    it('should open add payment modal', () => {
      const { getByText } = render(
        <NavigationContainer>
          <PaymentMethodsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Add Payment Method'));
      
      expect(getByText('Add New Card')).toBeTruthy();
    });

    it('should add new payment method', async () => {
      const addPaymentMethod = jest.fn().mockResolvedValue({ id: 'new-pm' });
      usePayments.mockReturnValue({
        paymentMethods: mockPaymentMethods,
        addPaymentMethod,
        removePaymentMethod: jest.fn(),
        setDefaultPaymentMethod: jest.fn(),
        isLoading: false,
        error: null,
      });
      
      const { getByText, getByPlaceholderText } = render(
        <NavigationContainer>
          <PaymentMethodsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Add Payment Method'));
      
      fireEvent.changeText(getByPlaceholderText('Card Number'), '4242424242424242');
      fireEvent.changeText(getByPlaceholderText('MM/YY'), '12/25');
      fireEvent.changeText(getByPlaceholderText('CVC'), '123');
      
      fireEvent.press(getByText('Add Card'));
      
      await waitFor(() => {
        expect(addPaymentMethod).toHaveBeenCalled();
      });
    });
  });

  describe('Remove Payment Method', () => {
    it('should show remove option on swipe', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <PaymentMethodsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      const paymentMethod = getByTestID('payment-method-pm-1');
      fireEvent(paymentMethod, 'swipe', { direction: 'left' });
      
      expect(getByTestID('remove-button-pm-1')).toBeTruthy();
    });

    it('should remove payment method with confirmation', async () => {
      const removePaymentMethod = jest.fn().mockResolvedValue({});
      usePayments.mockReturnValue({
        paymentMethods: mockPaymentMethods,
        addPaymentMethod: jest.fn(),
        removePaymentMethod,
        setDefaultPaymentMethod: jest.fn(),
        isLoading: false,
        error: null,
      });
      
      const { getByTestID, getByText } = render(
        <NavigationContainer>
          <PaymentMethodsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      const paymentMethod = getByTestID('payment-method-pm-2');
      fireEvent(paymentMethod, 'swipe', { direction: 'left' });
      fireEvent.press(getByTestID('remove-button-pm-2'));
      
      fireEvent.press(getByText('Remove'));
      
      await waitFor(() => {
        expect(removePaymentMethod).toHaveBeenCalledWith('pm-2');
      });
    });

    it('should not allow removing default payment method', () => {
      const { getByTestID, getByText } = render(
        <NavigationContainer>
          <PaymentMethodsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      const defaultMethod = getByTestID('payment-method-pm-1');
      fireEvent(defaultMethod, 'swipe', { direction: 'left' });
      fireEvent.press(getByTestID('remove-button-pm-1'));
      
      expect(getByText('Cannot remove default payment method')).toBeTruthy();
    });
  });

  describe('Set Default', () => {
    it('should set payment method as default', async () => {
      const setDefaultPaymentMethod = jest.fn().mockResolvedValue({});
      usePayments.mockReturnValue({
        paymentMethods: mockPaymentMethods,
        addPaymentMethod: jest.fn(),
        removePaymentMethod: jest.fn(),
        setDefaultPaymentMethod,
        isLoading: false,
        error: null,
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <PaymentMethodsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('set-default-button-pm-2'));
      
      await waitFor(() => {
        expect(setDefaultPaymentMethod).toHaveBeenCalledWith('pm-2');
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no payment methods', () => {
      usePayments.mockReturnValue({
        paymentMethods: [],
        addPaymentMethod: jest.fn(),
        removePaymentMethod: jest.fn(),
        setDefaultPaymentMethod: jest.fn(),
        isLoading: false,
        error: null,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <PaymentMethodsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('No payment methods')).toBeTruthy();
      expect(getByText('Add your first payment method')).toBeTruthy();
    });
  });
});

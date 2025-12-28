/**
 * LoginScreen Component Tests
 * Tests for the login screen including form validation and authentication flow
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';

// Mock dependencies
const mockLogin = jest.fn();
const mockShowToast = jest.fn();
const mockAuthenticateForAppLaunch = jest.fn();

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: jest.fn(),
    user: null,
    loading: false,
  }),
}));

jest.mock('@/context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

let mockBiometricState = {
  biometricAvailable: false,
  biometricEnabled: false,
  biometricTypeName: 'Face ID',
  authenticateForAppLaunch: mockAuthenticateForAppLaunch,
};

jest.mock('@/context/BiometricAuthContext', () => ({
  useBiometric: () => mockBiometricState,
}));

jest.mock('@/hooks/useAccessibility', () => ({
  useAccessibility: () => ({
    props: {
      header: () => ({}),
      button: () => ({}),
      alert: () => ({}),
    },
  }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBiometricState = {
      biometricAvailable: false,
      biometricEnabled: false,
      biometricTypeName: 'Face ID',
      authenticateForAppLaunch: mockAuthenticateForAppLaunch,
    };
  });

  describe('Rendering', () => {
    it('should render email and password inputs', () => {
      const { getByTestId, getByText } = render(<LoginScreen />);

      expect(getByTestId('email-input')).toBeTruthy();
      expect(getByTestId('password-input')).toBeTruthy();
      expect(getByTestId('login-button')).toBeTruthy();
      expect(getByText('Tekrar Hoşgeldiniz')).toBeTruthy();
      expect(getByText('Devam etmek için giriş yapın')).toBeTruthy();
    });

    it('should not render biometric button when not available', () => {
      const { queryByTestId } = render(<LoginScreen />);

      expect(queryByTestId('biometric-login-button')).toBeNull();
    });

    it('should render biometric button when available and enabled', () => {
      mockBiometricState = {
        biometricAvailable: true,
        biometricEnabled: true,
        biometricTypeName: 'Face ID',
        authenticateForAppLaunch: mockAuthenticateForAppLaunch,
      };

      const { getByTestId, getByText } = render(<LoginScreen />);

      expect(getByTestId('biometric-login-button')).toBeTruthy();
      expect(getByText('Face ID ile giriş yap')).toBeTruthy();
    });
  });

  describe('Form Input', () => {
    it('should update email input value', () => {
      const { getByTestId } = render(<LoginScreen />);

      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'test@example.com');

      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('should update password input value', () => {
      const { getByTestId } = render(<LoginScreen />);

      const passwordInput = getByTestId('password-input');
      fireEvent.changeText(passwordInput, 'password123');

      expect(passwordInput.props.value).toBe('password123');
    });
  });

  describe('Authentication Flow', () => {
    it('should call login with correct credentials on submit', async () => {
      mockLogin.mockResolvedValue({ success: true });

      const { getByTestId } = render(<LoginScreen />);

      // Fill form
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'ValidPass123!');

      // Submit
      fireEvent.press(getByTestId('login-button'));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'ValidPass123!',
        });
      });
    });

    it('should show error toast on login failure', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));

      const { getByTestId } = render(<LoginScreen />);

      // Fill form
      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('password-input'), 'WrongPass123!');

      // Submit
      fireEvent.press(getByTestId('login-button'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'Invalid credentials',
          'error',
        );
      });
    });
  });

  describe('Biometric Authentication', () => {
    it('should call biometric auth when button pressed', async () => {
      mockAuthenticateForAppLaunch.mockResolvedValue(true);
      mockBiometricState = {
        biometricAvailable: true,
        biometricEnabled: true,
        biometricTypeName: 'Touch ID',
        authenticateForAppLaunch: mockAuthenticateForAppLaunch,
      };

      const { getByTestId } = render(<LoginScreen />);

      fireEvent.press(getByTestId('biometric-login-button'));

      await waitFor(() => {
        expect(mockAuthenticateForAppLaunch).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'Touch ID ile başarıyla giriş yaptınız',
          'success',
        );
      });
    });

    it('should show error toast on biometric failure', async () => {
      mockAuthenticateForAppLaunch.mockResolvedValue(false);
      mockBiometricState = {
        biometricAvailable: true,
        biometricEnabled: true,
        biometricTypeName: 'Face ID',
        authenticateForAppLaunch: mockAuthenticateForAppLaunch,
      };

      const { getByTestId } = render(<LoginScreen />);

      fireEvent.press(getByTestId('biometric-login-button'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.stringContaining('Face ID'),
          'error',
        );
      });
    });
  });
});

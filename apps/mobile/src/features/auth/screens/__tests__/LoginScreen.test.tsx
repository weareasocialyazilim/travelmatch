/**
 * LoginScreen Component Tests
 * Tests for the login screen including form validation and authentication flow
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock all dependencies BEFORE importing the component
// This ensures Jest hoists these mocks properly

// Mock expo/virtual/env (ES module issue)
jest.mock('expo/virtual/env', () => ({
  env: process.env,
}));

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: (data: unknown) => void) => fn,
    formState: { errors: {}, isValid: true, isSubmitting: false },
    watch: jest.fn() as jest.Mock,
    setValue: jest.fn() as jest.Mock,
    reset: jest.fn() as jest.Mock,
  }),
  Controller: ({
    render: renderProp,
  }: {
    render: (props: {
      field: { onChange: jest.Mock; onBlur: jest.Mock; value: string };
      fieldState: { error: null };
    }) => React.ReactNode;
  }) =>
    renderProp({
      field: { onChange: jest.fn() as jest.Mock, onBlur: jest.fn() as jest.Mock, value: '' },
      fieldState: { error: null },
    }),
}));

// Mock @hookform/resolvers/zod
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => jest.fn() as jest.Mock,
}));

// Mock context and hooks
const mockLogin = jest.fn() as jest.Mock;
const mockShowToast = jest.fn() as jest.Mock;
const mockAuthenticateForAppLaunch = jest.fn() as jest.Mock;

jest.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: jest.fn() as jest.Mock,
    user: null,
    loading: false,
  }),
}));

jest.mock('../../../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
    success: jest.fn() as jest.Mock,
    error: jest.fn() as jest.Mock,
    warning: jest.fn() as jest.Mock,
    info: jest.fn() as jest.Mock,
  }),
}));

let mockBiometricState = {
  biometricAvailable: false,
  biometricEnabled: false,
  hasCredentials: false,
  biometricTypeName: 'Face ID',
  authenticateForAppLaunch: mockAuthenticateForAppLaunch,
  getCredentials: jest.fn() as jest.Mock,
  saveCredentials: jest.fn() as jest.Mock,
};

jest.mock('../../../../context/BiometricAuthContext', () => ({
  useBiometric: () => mockBiometricState,
}));

jest.mock('../../../../hooks/useAccessibility', () => ({
  useAccessibility: () => ({
    props: {
      header: () => ({}),
      button: () => ({}),
      alert: () => ({}),
    },
  }),
}));

jest.mock('../../../../utils/forms', () => ({
  loginSchema: {},
}));

jest.mock('../../../../utils/forms/helpers', () => ({
  canSubmitForm: () => true,
}));

jest.mock('../../../../components/ErrorBoundary', () => ({
  ScreenErrorBoundary: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock('../../../../constants/colors', () => ({
  COLORS: {
    bg: {
      primary: '#FFFCF7',
      secondary: '#FFF9F0',
    },
    surface: {
      base: '#FFFFFF',
    },
    text: {
      primary: '#1C1917',
      secondary: '#78716C',
    },
    brand: {
      primary: '#F97316',
    },
    border: {
      default: '#E7E5E4',
    },
    feedback: {
      error: '#EF4444',
      success: '#22C55E',
    },
    utility: {
      white: '#FFFFFF',
    },
  },
}));

// Import component after all mocks
import { LoginScreen } from '../LoginScreen';

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBiometricState = {
      biometricAvailable: false,
      biometricEnabled: false,
      hasCredentials: false,
      biometricTypeName: 'Face ID',
      authenticateForAppLaunch: mockAuthenticateForAppLaunch,
      getCredentials: jest.fn() as jest.Mock,
      saveCredentials: jest.fn() as jest.Mock,
    };
  });

  describe('Rendering', () => {
    it('should render login screen component', () => {
      const { getByText } = render(<LoginScreen />);
      // Turkish text: "Tekrar Hoşgeldiniz"
      expect(getByText('Tekrar Hoşgeldiniz')).toBeTruthy();
    });

    it('should render sign in subtitle', () => {
      const { getByText } = render(<LoginScreen />);
      // Turkish text: "Devam etmek için giriş yapın"
      expect(getByText('Devam etmek için giriş yapın')).toBeTruthy();
    });
  });

  describe('Biometric Authentication', () => {
    it('should not render biometric button when not available', () => {
      const { queryByTestId } = render(<LoginScreen />);
      expect(queryByTestId('biometric-login-button')).toBeNull();
    });

    it('should render biometric button when available, enabled, and has credentials', () => {
      mockBiometricState = {
        biometricAvailable: true,
        biometricEnabled: true,
        hasCredentials: true,
        biometricTypeName: 'Face ID',
        authenticateForAppLaunch: mockAuthenticateForAppLaunch,
        getCredentials: jest.fn() as jest.Mock,
        saveCredentials: jest.fn() as jest.Mock,
      };

      const { getByTestId } = render(<LoginScreen />);
      expect(getByTestId('biometric-login-button')).toBeTruthy();
    });
  });
});

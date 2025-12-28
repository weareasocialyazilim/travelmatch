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
    watch: jest.fn(),
    setValue: jest.fn(),
    reset: jest.fn(),
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
      field: { onChange: jest.fn(), onBlur: jest.fn(), value: '' },
      fieldState: { error: null },
    }),
}));

// Mock @hookform/resolvers/zod
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => jest.fn(),
}));

// Mock context and hooks
const mockLogin = jest.fn();
const mockShowToast = jest.fn();
const mockAuthenticateForAppLaunch = jest.fn();

jest.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: jest.fn(),
    user: null,
    loading: false,
  }),
}));

jest.mock('../../../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  }),
}));

let mockBiometricState = {
  biometricAvailable: false,
  biometricEnabled: false,
  biometricTypeName: 'Face ID',
  authenticateForAppLaunch: mockAuthenticateForAppLaunch,
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
    primary: '#007AFF',
    background: '#FFFFFF',
    text: '#000000',
    textSecondary: '#666666',
    border: '#E0E0E0',
    error: '#FF3B30',
    success: '#34C759',
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
      biometricTypeName: 'Face ID',
      authenticateForAppLaunch: mockAuthenticateForAppLaunch,
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

    it('should render biometric button when available and enabled', () => {
      mockBiometricState = {
        biometricAvailable: true,
        biometricEnabled: true,
        biometricTypeName: 'Face ID',
        authenticateForAppLaunch: mockAuthenticateForAppLaunch,
      };

      const { getByTestId } = render(<LoginScreen />);
      expect(getByTestId('biometric-login-button')).toBeTruthy();
    });
  });
});

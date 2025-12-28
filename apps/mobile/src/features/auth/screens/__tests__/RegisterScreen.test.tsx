/**
 * RegisterScreen Component Tests
 * Tests for the registration screen
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock all dependencies BEFORE importing the component

// Mock expo/virtual/env (ES module issue)
jest.mock('expo/virtual/env', () => ({
  env: process.env,
}));

// Mock @react-native-community/datetimepicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => React.createElement('View', { testID: 'date-picker' }),
  };
});

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: Function) => fn,
    formState: { errors: {}, isValid: true, isSubmitting: false },
    watch: jest.fn(() => ''),
    setValue: jest.fn(),
    reset: jest.fn(),
    trigger: jest.fn(),
  }),
  Controller: ({ render: renderProp }: any) =>
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
const mockRegister = jest.fn();

jest.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
    login: jest.fn(),
    logout: jest.fn(),
    user: null,
    loading: false,
  }),
}));

jest.mock('../../../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../../../utils/forms', () => ({
  registerSchema: {},
}));

jest.mock('../../../../utils/forms/helpers', () => ({
  canSubmitForm: () => true,
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

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Import component after all mocks
import { RegisterScreen } from '../RegisterScreen';

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render register screen component', () => {
      const { getByText } = render(<RegisterScreen />);
      expect(getByText('Hesap Oluştur')).toBeTruthy();
    });

    it('should render form elements', () => {
      const { getByTestId } = render(<RegisterScreen />);
      expect(getByTestId('email-input')).toBeTruthy();
      expect(getByTestId('password-input')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should have register button', () => {
      const { getByTestId } = render(<RegisterScreen />);
      expect(getByTestId('register-button')).toBeTruthy();
    });
  });
});

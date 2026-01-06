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
    handleSubmit: (fn: (data: unknown) => void) => fn,
    formState: { errors: {}, isValid: true, isSubmitting: false },
    watch: jest.fn(() => '') as jest.Mock,
    setValue: jest.fn() as jest.Mock,
    reset: jest.fn() as jest.Mock,
    trigger: jest.fn() as jest.Mock,
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
      field: {
        onChange: jest.fn() as jest.Mock,
        onBlur: jest.fn() as jest.Mock,
        value: '',
      },
      fieldState: { error: null },
    }),
}));

// Mock @hookform/resolvers/zod
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => jest.fn() as jest.Mock,
}));

// Mock context and hooks
const mockRegister = jest.fn() as jest.Mock;

jest.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    register: mockRegister,
    login: jest.fn() as jest.Mock,
    logout: jest.fn() as jest.Mock,
    user: null,
    loading: false,
  }),
}));

jest.mock('../../../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn() as jest.Mock,
    success: jest.fn() as jest.Mock,
    error: jest.fn() as jest.Mock,
    warning: jest.fn() as jest.Mock,
    info: jest.fn() as jest.Mock,
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
  SHADOWS: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    modal: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  primitives: {
    stone: {
      50: '#FAFAF9',
      100: '#F5F5F4',
      200: '#E7E5E4',
      300: '#D6D3D1',
      400: '#A8A29E',
      500: '#78716C',
    },
    sand: {
      200: '#E7E5E4',
    },
  },
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
    trust: {
      primary: '#10B981',
      secondary: '#059669',
    },
    utility: {
      white: '#FFFFFF',
    },
    overlay: {
      default: 'rgba(0, 0, 0, 0.5)',
      light: 'rgba(0, 0, 0, 0.3)',
      medium: 'rgba(0, 0, 0, 0.5)',
      heavy: 'rgba(0, 0, 0, 0.7)',
      dark: 'rgba(0, 0, 0, 0.8)',
    },
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock expo-localization to avoid ES module issue
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en', languageTag: 'en-US' }],
  locale: 'en-US',
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

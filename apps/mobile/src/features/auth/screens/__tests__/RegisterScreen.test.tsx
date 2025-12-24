/**
 * RegisterScreen Component Tests
 * Tests for the registration screen
 */

import React from 'react';
import {
  render as rtlRender,
  fireEvent,
  RenderOptions,
} from '@testing-library/react-native';
import { RegisterScreen } from '@/features/auth/screens/RegisterScreen';
import { useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

// Helper to wrap component with required providers
const render = (ui: React.ReactElement, options?: RenderOptions) => {
  return rtlRender(<ToastProvider>{ui}</ToastProvider>, options);
};

// Mock dependencies
jest.mock('@/context/AuthContext');
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('RegisterScreen', () => {
  const mockRegister = jest.fn();
  const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      register: mockRegister,
      login: jest.fn(),
      logout: jest.fn(),
      user: null,
      loading: false,
    } as unknown as ReturnType<typeof useAuth>);
  });

  describe('Rendering', () => {
    it('should render all form elements', () => {
      const { getByTestId, getByText } = render(<RegisterScreen />);

      expect(getByTestId('email-input')).toBeTruthy();
      expect(getByTestId('password-input')).toBeTruthy();
      expect(getByTestId('confirm-password-input')).toBeTruthy();
      expect(getByTestId('fullname-input')).toBeTruthy();
      expect(getByText('Hesap Oluştur')).toBeTruthy();
    });

    it('should render labels correctly', () => {
      const { getByText } = render(<RegisterScreen />);

      expect(getByText('Ad Soyad')).toBeTruthy();
      expect(getByText('E-posta')).toBeTruthy();
      expect(getByText('Şifre')).toBeTruthy();
      expect(getByText('Şifre Tekrar')).toBeTruthy();
    });

    it('should render gender options', () => {
      const { getByText } = render(<RegisterScreen />);

      expect(getByText('Erkek')).toBeTruthy();
      expect(getByText('Kadın')).toBeTruthy();
      expect(getByText('Diğer')).toBeTruthy();
    });

    it('should render date of birth section', () => {
      const { getByText } = render(<RegisterScreen />);

      expect(getByText('Doğum Tarihi')).toBeTruthy();
      expect(getByText('18 yaşından büyük olmalısınız')).toBeTruthy();
    });
  });

  describe('Form Inputs', () => {
    it('should update email input', () => {
      const { getByTestId } = render(<RegisterScreen />);

      const emailInput = getByTestId('email-input');
      fireEvent.changeText(emailInput, 'test@example.com');

      expect(emailInput.props.value).toBe('test@example.com');
    });

    it('should update password input', () => {
      const { getByTestId } = render(<RegisterScreen />);

      const passwordInput = getByTestId('password-input');
      fireEvent.changeText(passwordInput, 'password123');

      expect(passwordInput.props.value).toBe('password123');
    });

    it('should update confirm password input', () => {
      const { getByTestId } = render(<RegisterScreen />);

      const confirmPasswordInput = getByTestId('confirm-password-input');
      fireEvent.changeText(confirmPasswordInput, 'password123');

      expect(confirmPasswordInput.props.value).toBe('password123');
    });

    it('should update fullname input', () => {
      const { getByTestId } = render(<RegisterScreen />);

      const fullnameInput = getByTestId('fullname-input');
      fireEvent.changeText(fullnameInput, 'John Doe');

      expect(fullnameInput.props.value).toBe('John Doe');
    });

    it('should have secure text entry for password fields', () => {
      const { getByTestId } = render(<RegisterScreen />);

      expect(getByTestId('password-input').props.secureTextEntry).toBe(true);
      expect(getByTestId('confirm-password-input').props.secureTextEntry).toBe(
        true,
      );
    });
  });

  describe('Gender Selection', () => {
    it('should select gender option', () => {
      const { getByText } = render(<RegisterScreen />);

      const maleOption = getByText('Erkek');
      fireEvent.press(maleOption);

      expect(maleOption).toBeTruthy();
    });
  });

  describe('Button State', () => {
    it('should have register button', () => {
      const { getByTestId } = render(<RegisterScreen />);

      const registerButton = getByTestId('register-button');
      expect(registerButton).toBeTruthy();
    });

    it('should be able to press register button', () => {
      const { getByTestId } = render(<RegisterScreen />);

      const registerButton = getByTestId('register-button');
      fireEvent.press(registerButton);

      // Component should not crash after press
      expect(registerButton).toBeTruthy();
    });
  });
});

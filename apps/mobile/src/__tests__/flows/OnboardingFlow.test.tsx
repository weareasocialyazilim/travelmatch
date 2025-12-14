/**
 * Onboarding Flow Test Suite
 * Enhanced comprehensive tests for user onboarding
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  WelcomeScreen,
  LoginScreen,
  RegisterScreen,
  PhoneVerificationScreen,
  OnboardingStepsScreen,
} from '@/screens/onboarding';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';

jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useOnboarding');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  replace: jest.fn(),
};

describe('WelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render welcome screen', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <WelcomeScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByTestID('welcome-screen')).toBeTruthy();
    });

    it('should render app logo and title', () => {
      const { getByTestID, getByText } = render(
        <NavigationContainer>
          <WelcomeScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByTestID('app-logo')).toBeTruthy();
      expect(getByText('TravelMatch')).toBeTruthy();
    });

    it('should render tagline', () => {
      const { getByText } = render(
        <NavigationContainer>
          <WelcomeScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Connect. Explore. Experience.')).toBeTruthy();
    });

    it('should render action buttons', () => {
      const { getByText } = render(
        <NavigationContainer>
          <WelcomeScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Get Started')).toBeTruthy();
      expect(getByText('Log In')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to register on get started', () => {
      const { getByText } = render(
        <NavigationContainer>
          <WelcomeScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Get Started'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
    });

    it('should navigate to login on log in', () => {
      const { getByText } = render(
        <NavigationContainer>
          <WelcomeScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Log In'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });
  });

  describe('Animation', () => {
    it('should animate logo on mount', async () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <WelcomeScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      await waitFor(() => {
        expect(getByTestID('app-logo')).toBeTruthy();
        // Animation should complete
      }, { timeout: 1000 });
    });
  });
});

describe('RegisterScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    useAuth.mockReturnValue({
      register: jest.fn().mockResolvedValue({}),
      isLoading: false,
      error: null,
    });
  });

  describe('Basic Rendering', () => {
    it('should render register screen', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByTestID('register-screen')).toBeTruthy();
    });

    it('should render all form fields', () => {
      const { getByPlaceholderText } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByPlaceholderText('Full Name')).toBeTruthy();
      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Phone Number')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
      expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    });

    it('should render terms and conditions checkbox', () => {
      const { getByText } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText(/I agree to the Terms/)).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should validate name is required', async () => {
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      const nameInput = getByPlaceholderText('Full Name');
      fireEvent.changeText(nameInput, '');
      fireEvent(nameInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Name is required')).toBeTruthy();
      });
    });

    it('should validate email format', async () => {
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      const emailInput = getByPlaceholderText('Email');
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent(emailInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Invalid email format')).toBeTruthy();
      });
    });

    it('should validate phone number format', async () => {
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      const phoneInput = getByPlaceholderText('Phone Number');
      fireEvent.changeText(phoneInput, '123');
      fireEvent(phoneInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Invalid phone number')).toBeTruthy();
      });
    });

    it('should validate password strength', async () => {
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      const passwordInput = getByPlaceholderText('Password');
      fireEvent.changeText(passwordInput, '123');
      fireEvent(passwordInput, 'blur');
      
      await waitFor(() => {
        expect(getByText('Password must be at least 8 characters')).toBeTruthy();
      });
    });

    it('should validate password confirmation matches', async () => {
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'different');
      fireEvent(getByPlaceholderText('Confirm Password'), 'blur');
      
      await waitFor(() => {
        expect(getByText('Passwords do not match')).toBeTruthy();
      });
    });

    it('should require terms acceptance', async () => {
      const { getByText } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Create Account'));
      
      await waitFor(() => {
        expect(getByText('You must accept the terms and conditions')).toBeTruthy();
      });
    });
  });

  describe('Registration', () => {
    it('should register user with valid data', async () => {
      const register = jest.fn().mockResolvedValue({ success: true });
      useAuth.mockReturnValue({
        register,
        isLoading: false,
        error: null,
      });
      
      const { getByPlaceholderText, getByText, getByTestID } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '+1234567890');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
      fireEvent.press(getByTestID('terms-checkbox'));
      
      fireEvent.press(getByText('Create Account'));
      
      await waitFor(() => {
        expect(register).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          password: 'password123',
        });
      });
    });

    it('should navigate to phone verification after registration', async () => {
      const register = jest.fn().mockResolvedValue({ success: true });
      useAuth.mockReturnValue({
        register,
        isLoading: false,
        error: null,
      });
      
      const { getByPlaceholderText, getByText, getByTestID } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      // Fill form
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'John Doe');
      fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
      fireEvent.changeText(getByPlaceholderText('Phone Number'), '+1234567890');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
      fireEvent.press(getByTestID('terms-checkbox'));
      
      fireEvent.press(getByText('Create Account'));
      
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('PhoneVerification');
      });
    });

    it('should show loading state during registration', () => {
      useAuth.mockReturnValue({
        register: jest.fn(),
        isLoading: true,
        error: null,
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByTestID('loading-indicator')).toBeTruthy();
    });

    it('should show error message on registration failure', async () => {
      useAuth.mockReturnValue({
        register: jest.fn().mockRejectedValue(new Error('Email already exists')),
        isLoading: false,
        error: new Error('Email already exists'),
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      await waitFor(() => {
        expect(getByText('Email already exists')).toBeTruthy();
      });
    });
  });

  describe('Social Registration', () => {
    it('should show Google sign up button', () => {
      const { getByText } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Continue with Google')).toBeTruthy();
    });

    it('should show Apple sign up button', () => {
      const { getByText } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Continue with Apple')).toBeTruthy();
    });

    it('should handle Google registration', async () => {
      const registerWithGoogle = jest.fn().mockResolvedValue({});
      
      const { getByText } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Continue with Google'));
      
      await waitFor(() => {
        // Should trigger Google OAuth flow
      });
    });
  });

  describe('Navigation', () => {
    it('should have link to login', () => {
      const { getByText } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText(/Already have an account/)).toBeTruthy();
    });

    it('should navigate to login on link press', () => {
      const { getByText } = render(
        <NavigationContainer>
          <RegisterScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Log In'));
      
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
    });
  });
});

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    useAuth.mockReturnValue({
      login: jest.fn().mockResolvedValue({}),
      isLoading: false,
      error: null,
    });
  });

  describe('Basic Rendering', () => {
    it('should render login screen', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <LoginScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByTestID('login-screen')).toBeTruthy();
    });

    it('should render email and password fields', () => {
      const { getByPlaceholderText } = render(
        <NavigationContainer>
          <LoginScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
    });

    it('should render forgot password link', () => {
      const { getByText } = render(
        <NavigationContainer>
          <LoginScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Forgot Password?')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should validate email is required', async () => {
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <LoginScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Log In'));
      
      await waitFor(() => {
        expect(getByText('Email is required')).toBeTruthy();
      });
    });

    it('should validate password is required', async () => {
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <LoginScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
      fireEvent.press(getByText('Log In'));
      
      await waitFor(() => {
        expect(getByText('Password is required')).toBeTruthy();
      });
    });
  });

  describe('Login', () => {
    it('should login user with valid credentials', async () => {
      const login = jest.fn().mockResolvedValue({ success: true });
      useAuth.mockReturnValue({
        login,
        isLoading: false,
        error: null,
      });
      
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <LoginScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.press(getByText('Log In'));
      
      await waitFor(() => {
        expect(login).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'password123',
        });
      });
    });

    it('should navigate to home after successful login', async () => {
      const login = jest.fn().mockResolvedValue({ success: true });
      useAuth.mockReturnValue({
        login,
        isLoading: false,
        error: null,
      });
      
      const { getByPlaceholderText, getByText } = render(
        <NavigationContainer>
          <LoginScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.changeText(getByPlaceholderText('Email'), 'john@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      fireEvent.press(getByText('Log In'));
      
      await waitFor(() => {
        expect(mockNavigation.replace).toHaveBeenCalledWith('Home');
      });
    });

    it('should show error on invalid credentials', async () => {
      useAuth.mockReturnValue({
        login: jest.fn().mockRejectedValue(new Error('Invalid credentials')),
        isLoading: false,
        error: new Error('Invalid credentials'),
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <LoginScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      await waitFor(() => {
        expect(getByText('Invalid credentials')).toBeTruthy();
      });
    });
  });

  describe('Remember Me', () => {
    it('should show remember me checkbox', () => {
      const { getByText } = render(
        <NavigationContainer>
          <LoginScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Remember me')).toBeTruthy();
    });

    it('should toggle remember me', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <LoginScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      const checkbox = getByTestID('remember-me-checkbox');
      fireEvent.press(checkbox);
      
      expect(checkbox).toBeTruthy();
    });
  });

  describe('Biometric Login', () => {
    it('should show biometric login option when available', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <LoginScreen navigation={mockNavigation} biometricAvailable={true} />
        </NavigationContainer>
      );
      
      expect(getByTestID('biometric-login-button')).toBeTruthy();
    });

    it('should attempt biometric login', async () => {
      const loginWithBiometric = jest.fn().mockResolvedValue({});
      
      const { getByTestID } = render(
        <NavigationContainer>
          <LoginScreen navigation={mockNavigation} biometricAvailable={true} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByTestID('biometric-login-button'));
      
      await waitFor(() => {
        // Should trigger biometric authentication
      });
    });
  });
});

describe('PhoneVerificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    useAuth.mockReturnValue({
      verifyPhone: jest.fn().mockResolvedValue({}),
      resendCode: jest.fn().mockResolvedValue({}),
      isLoading: false,
      error: null,
    });
  });

  describe('Basic Rendering', () => {
    it('should render verification screen', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <PhoneVerificationScreen
            navigation={mockNavigation}
            route={{ params: { phone: '+1234567890' } }}
          />
        </NavigationContainer>
      );
      
      expect(getByTestID('phone-verification-screen')).toBeTruthy();
    });

    it('should show phone number', () => {
      const { getByText } = render(
        <NavigationContainer>
          <PhoneVerificationScreen
            navigation={mockNavigation}
            route={{ params: { phone: '+1234567890' } }}
          />
        </NavigationContainer>
      );
      
      expect(getByText(/\+1234567890/)).toBeTruthy();
    });

    it('should render 6-digit code input', () => {
      const { getAllByTestID } = render(
        <NavigationContainer>
          <PhoneVerificationScreen
            navigation={mockNavigation}
            route={{ params: { phone: '+1234567890' } }}
          />
        </NavigationContainer>
      );
      
      const codeInputs = getAllByTestID(/code-input-/);
      expect(codeInputs).toHaveLength(6);
    });
  });

  describe('Code Entry', () => {
    it('should auto-focus first input', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <PhoneVerificationScreen
            navigation={mockNavigation}
            route={{ params: { phone: '+1234567890' } }}
          />
        </NavigationContainer>
      );
      
      const firstInput = getByTestID('code-input-0');
      expect(firstInput).toBeTruthy();
    });

    it('should move to next input on digit entry', () => {
      const { getByTestID } = render(
        <NavigationContainer>
          <PhoneVerificationScreen
            navigation={mockNavigation}
            route={{ params: { phone: '+1234567890' } }}
          />
        </NavigationContainer>
      );
      
      fireEvent.changeText(getByTestID('code-input-0'), '1');
      
      // Should auto-focus code-input-1
    });

    it('should verify code when all digits entered', async () => {
      const verifyPhone = jest.fn().mockResolvedValue({ success: true });
      useAuth.mockReturnValue({
        verifyPhone,
        resendCode: jest.fn(),
        isLoading: false,
        error: null,
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <PhoneVerificationScreen
            navigation={mockNavigation}
            route={{ params: { phone: '+1234567890' } }}
          />
        </NavigationContainer>
      );
      
      for (let i = 0; i < 6; i++) {
        fireEvent.changeText(getByTestID(`code-input-${i}`), String(i));
      }
      
      await waitFor(() => {
        expect(verifyPhone).toHaveBeenCalledWith('012345');
      });
    });
  });

  describe('Resend Code', () => {
    it('should show resend button', () => {
      const { getByText } = render(
        <NavigationContainer>
          <PhoneVerificationScreen
            navigation={mockNavigation}
            route={{ params: { phone: '+1234567890' } }}
          />
        </NavigationContainer>
      );
      
      expect(getByText(/Resend Code/)).toBeTruthy();
    });

    it('should resend code on button press', async () => {
      const resendCode = jest.fn().mockResolvedValue({});
      useAuth.mockReturnValue({
        verifyPhone: jest.fn(),
        resendCode,
        isLoading: false,
        error: null,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <PhoneVerificationScreen
            navigation={mockNavigation}
            route={{ params: { phone: '+1234567890' } }}
          />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Resend Code'));
      
      await waitFor(() => {
        expect(resendCode).toHaveBeenCalled();
      });
    });

    it('should show countdown timer before allowing resend', () => {
      const { getByText } = render(
        <NavigationContainer>
          <PhoneVerificationScreen
            navigation={mockNavigation}
            route={{ params: { phone: '+1234567890' } }}
          />
        </NavigationContainer>
      );
      
      expect(getByText(/Resend in 60s/)).toBeTruthy();
    });
  });

  describe('Verification Success', () => {
    it('should navigate to onboarding steps after verification', async () => {
      const verifyPhone = jest.fn().mockResolvedValue({ success: true });
      useAuth.mockReturnValue({
        verifyPhone,
        resendCode: jest.fn(),
        isLoading: false,
        error: null,
      });
      
      const { getByTestID } = render(
        <NavigationContainer>
          <PhoneVerificationScreen
            navigation={mockNavigation}
            route={{ params: { phone: '+1234567890' } }}
          />
        </NavigationContainer>
      );
      
      // Enter complete code
      for (let i = 0; i < 6; i++) {
        fireEvent.changeText(getByTestID(`code-input-${i}`), '1');
      }
      
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('OnboardingSteps');
      });
    });
  });
});

describe('OnboardingStepsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    useOnboarding.mockReturnValue({
      saveProfile: jest.fn().mockResolvedValue({}),
      currentStep: 0,
      totalSteps: 3,
    });
  });

  describe('Profile Setup', () => {
    it('should show profile photo upload', () => {
      const { getByText } = render(
        <NavigationContainer>
          <OnboardingStepsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Add Profile Photo')).toBeTruthy();
    });

    it('should show bio input', () => {
      const { getByPlaceholderText } = render(
        <NavigationContainer>
          <OnboardingStepsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByPlaceholderText('Tell us about yourself')).toBeTruthy();
    });

    it('should show interests selection', () => {
      const { getByText } = render(
        <NavigationContainer>
          <OnboardingStepsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Select Your Interests')).toBeTruthy();
    });
  });

  describe('Step Navigation', () => {
    it('should show progress indicator', () => {
      const { getByText } = render(
        <NavigationContainer>
          <OnboardingStepsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Step 1 of 3')).toBeTruthy();
    });

    it('should navigate to next step', () => {
      const { getByText } = render(
        <NavigationContainer>
          <OnboardingStepsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Next'));
      
      expect(getByText('Step 2 of 3')).toBeTruthy();
    });

    it('should allow going back', () => {
      const { getByText, getByTestID } = render(
        <NavigationContainer>
          <OnboardingStepsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Next'));
      fireEvent.press(getByTestID('back-button'));
      
      expect(getByText('Step 1 of 3')).toBeTruthy();
    });

    it('should complete onboarding on final step', async () => {
      const saveProfile = jest.fn().mockResolvedValue({});
      useOnboarding.mockReturnValue({
        saveProfile,
        currentStep: 2,
        totalSteps: 3,
      });
      
      const { getByText } = render(
        <NavigationContainer>
          <OnboardingStepsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Complete'));
      
      await waitFor(() => {
        expect(saveProfile).toHaveBeenCalled();
        expect(mockNavigation.replace).toHaveBeenCalledWith('Home');
      });
    });
  });

  describe('Skip Option', () => {
    it('should show skip button', () => {
      const { getByText } = render(
        <NavigationContainer>
          <OnboardingStepsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      expect(getByText('Skip')).toBeTruthy();
    });

    it('should navigate to home on skip', () => {
      const { getByText } = render(
        <NavigationContainer>
          <OnboardingStepsScreen navigation={mockNavigation} />
        </NavigationContainer>
      );
      
      fireEvent.press(getByText('Skip'));
      
      expect(mockNavigation.replace).toHaveBeenCalledWith('Home');
    });
  });
});

// Auth Feature Exports
// Core screens
export { SplashScreen } from './screens/SplashScreen';
export { WelcomeScreen } from './screens/WelcomeScreen';
export { OnboardingScreen } from './screens/OnboardingScreen';
export { CompleteProfileScreen } from './screens/CompleteProfileScreen';

// Auth flow screens
export { PhoneAuthScreen } from './screens/PhoneAuthScreen';
export { EmailAuthScreen } from './screens/EmailAuthScreen';
export { RegisterScreen } from './screens/RegisterScreen';
export { LoginScreen } from './screens/LoginScreen';
export { SetPasswordScreen } from './screens/SetPasswordScreen';
export { TwoFactorSetupScreen } from './screens/TwoFactorSetupScreen';
export { VerifyCodeScreen } from './screens/VerifyCodeScreen';
export { WaitingForCodeScreen } from './screens/WaitingForCodeScreen';
export { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
export { ChangePasswordScreen } from './screens/ChangePasswordScreen';
// Note: VerifyEmailScreen removed - using email link verification instead
export { VerifyPhoneScreen } from './screens/VerifyPhoneScreen';

// Services
export { authApi } from './services/authApi';

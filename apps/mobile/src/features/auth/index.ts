// Auth Feature Exports
// Core screens
export { SplashScreen } from './screens/SplashScreen';
export { WelcomeScreen } from './screens/WelcomeScreen';
export { OnboardingScreen, AwwwardsOnboardingScreen } from './screens/OnboardingScreen';
export { CompleteProfileScreen } from './screens/CompleteProfileScreen';
export { VerifyPhoneScreen } from './screens/VerifyPhoneScreen';

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
export { AuthSuccessScreen } from './screens/AuthSuccessScreen';
export { BiometricSetupScreen } from './screens/BiometricSetupScreen';

// Services
export { authApi as authService } from './services/authService';
/** @deprecated Use authService instead */
export { authApi } from './services/authService';

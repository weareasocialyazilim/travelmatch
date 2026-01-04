// Auth Feature Exports
// Core screens
export { SplashScreen } from './screens/SplashScreen';
export { WelcomeScreen } from './screens/WelcomeScreen';
export {
  OnboardingScreen,
  AwwwardsOnboardingScreen,
} from './screens/OnboardingScreen';
export { CompleteProfileScreen } from './screens/CompleteProfileScreen';
export { VerifyPhoneScreen } from './screens/VerifyPhoneScreen';

// Auth flow screens - Unified Auth (Master 2026)
export { UnifiedAuthScreen } from './screens/UnifiedAuthScreen';
export { PhoneAuthScreen } from './screens/PhoneAuthScreen';
export { EmailAuthScreen } from './screens/EmailAuthScreen';
export { RegisterScreen } from './screens/RegisterScreen';
export { SetPasswordScreen } from './screens/SetPasswordScreen';
export { TwoFactorSetupScreen } from './screens/TwoFactorSetupScreen';
export { VerifyCodeScreen } from './screens/VerifyCodeScreen';
export { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
export { ChangePasswordScreen } from './screens/ChangePasswordScreen';
export { AuthSuccessScreen } from './screens/AuthSuccessScreen';
export { BiometricSetupScreen } from './screens/BiometricSetupScreen';

// Services - Direct function exports (no legacy API)
export {
  signInWithEmail,
  signUpWithEmail,
  signInWithOAuth,
  handleOAuthCallback,
  signOut,
  getSession,
  getCurrentUser,
  refreshSession,
  resetPassword,
  updatePassword,
  changePasswordWithVerification,
  updateProfile,
  deleteAccount,
  signInWithPhone,
  verifyPhoneOtp,
  resendVerificationEmail,
  onAuthStateChange,
  type AuthResult,
  type SignUpMetadata,
} from './services/authService';

import { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Loading from '../components/Loading';
import SocialButton from '../components/SocialButton';
import { COLORS } from '../constants/colors';
import { RootStackParamList } from '../navigation/AppNavigator';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { SHADOWS } from '../constants/shadows';

type EmailAuthScreenProps = StackScreenProps<RootStackParamList, 'EmailAuth'>;

export const EmailAuthScreen: React.FC<EmailAuthScreenProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleContinue = () => {
    if (!email || !validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters');
      return;
    }

    // Mock authentication - gerçek uygulamada API call yapılacak
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (isSignUp) {
        navigation.navigate('CompleteProfile');
      } else {
        navigation.navigate('Home');
      }
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    console.log('Social login:', provider);
    // For now treat social login as signup flow
    navigation.navigate('CompleteProfile');
  };

  const handleContinueWithoutSignup = () => {
    navigation.replace('Home');
  };
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading && (
        <Loading
          text={isSignUp ? 'Creating Account...' : 'Signing In...'}
          mode="overlay"
        />
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.screenCenter}>
          <View style={styles.cardContainer}>
            <View style={styles.cardInner}>
              {/* Header */}
              <View style={styles.headerRow}>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.backButton}
                >
                  <Icon name="arrow-left" size={22} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              {/* Content */}
              <View style={styles.content}>
                <View style={styles.iconContainer}>
                  <Icon name="email-outline" size={52} color={COLORS.primary} />
                </View>
                <Text style={styles.title}>
                  {isSignUp ? 'Create account' : 'Welcome back'}
                </Text>
                <Text style={styles.subtitleText}>
                  {isSignUp
                    ? 'Sign up with your email to get started'
                    : 'Sign in to continue your journey'}
                </Text>
                {/* Email Input */}
                <View style={[styles.inputContainer, styles.inputWithIcon]}>
                  <Icon
                    name="email-outline"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor={COLORS.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {/* Password Input */}
                <View style={[styles.inputContainer, styles.inputWithIcon]}>
                  <Icon
                    name="lock-outline"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={COLORS.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {/* Forgot Password */}
                {!isSignUp && (
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                )}
                {/* Continue Button */}
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={handleContinue}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.coral]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.continueGradient}
                  >
                    <Text style={styles.continueButtonText}>
                      {isSignUp ? 'Sign Up' : 'Sign In'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                {/* Toggle Sign Up/Sign In */}
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleText}>
                    {isSignUp
                      ? 'Already have an account?'
                      : "Don't have an account?"}
                  </Text>
                  <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                    <Text style={styles.toggleLink}>
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>
                {/* Social Options */}
                <View style={styles.socialContainerRow}>
                  <SocialButton
                    provider="google"
                    size="icon"
                    onPress={() => handleSocialLogin('google')}
                  />
                  <SocialButton
                    provider="apple"
                    size="icon"
                    onPress={() => handleSocialLogin('apple')}
                  />
                  <SocialButton
                    provider="facebook"
                    size="icon"
                    onPress={() => handleSocialLogin('facebook')}
                  />
                </View>
                {/* Terms */}
                <Text style={styles.terms}>
                  By continuing, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
                {/* Continue without signup button */}
                <TouchableOpacity
                  style={styles.continueWithoutSignupButton}
                  onPress={handleContinueWithoutSignup}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.mint]}
                    style={styles.continueWithoutSignupGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.continueWithoutSignupText}>
                      Üye olmadan devam et
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    borderRadius: radii.md,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  cardContainer: {
    backgroundColor: COLORS.card,
    borderRadius: radii.xl,
    maxWidth: 420,
    width: '92%',
    ...SHADOWS.lg,
    overflow: 'hidden',
  },
  cardInner: {
    padding: spacing.lg,
  },
  container: {
    flex: 1,
  },
  content: {
    justifyContent: 'center',
    width: '100%',
  },
  continueButton: {
    borderRadius: radii.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    width: '100%',
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  continueGradient: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  continueWithoutSignupButton: {
    borderRadius: radii.md,
    marginTop: spacing.lg,
    overflow: 'hidden',
    width: '100%',
  },
  continueWithoutSignupGradient: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  continueWithoutSignupText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    backgroundColor: COLORS.border,
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginHorizontal: spacing.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    fontWeight: '600',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  input: {
    ...TYPOGRAPHY.body,
    flex: 1,
    marginLeft: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputWithIcon: {
    gap: spacing.md,
  },
  keyboardView: {
    flex: 1,
  },
  screenCenter: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  socialContainerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  subtitleText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  terms: {
    ...TYPOGRAPHY.caption,
    color: COLORS.whiteTransparentLight,
    lineHeight: 18,
    textAlign: 'center',
  },
  termsLink: {
    color: COLORS.white,
    fontWeight: '700',
  },
  title: {
    ...TYPOGRAPHY.h2,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  toggleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: 32,
  },
  toggleLink: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    fontWeight: '700',
  },
  toggleText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.whiteTransparent,
  },
});

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
import { LAYOUT } from '../constants/layout';
import { VALUES } from '../constants/values';
import { RootStackParamList } from '../navigation/AppNavigator';

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
      <Loading
        visible={loading}
        text={isSignUp ? 'Creating Account...' : 'Signing In...'}
        overlay
      />
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
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  cardContainer: {
    backgroundColor: COLORS.card,
    borderRadius: VALUES.borderRadius * 1.6,
    maxWidth: 420,
    width: '92%',
    ...VALUES.shadow,
    overflow: 'hidden',
  },
  cardInner: {
    padding: LAYOUT.padding * 2,
  },
  container: {
    flex: 1,
  },
  content: {
    justifyContent: 'center',
    width: '100%',
  },
  continueButton: {
    borderRadius: VALUES.borderRadius,
    marginBottom: LAYOUT.spacing.md,
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
    paddingVertical: LAYOUT.padding * 1.5,
  },
  continueWithoutSignupButton: {
    borderRadius: VALUES.borderRadius,
    marginTop: LAYOUT.spacing.lg,
    overflow: 'hidden',
    width: '100%',
  },
  continueWithoutSignupGradient: {
    alignItems: 'center',
    paddingVertical: LAYOUT.padding * 1.3,
  },
  continueWithoutSignupText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: LAYOUT.spacing.lg,
  },
  dividerLine: {
    backgroundColor: COLORS.border,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginHorizontal: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: LAYOUT.spacing.md,
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  input: {
    color: COLORS.text,
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWithIcon: {
    gap: 12,
  },
  keyboardView: {
    flex: 1,
  },
  screenCenter: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: LAYOUT.padding * 2,
  },
  socialContainerRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 24,
  },
  subtitleText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: LAYOUT.spacing.lg,
    textAlign: 'center',
  },
  terms: {
    color: COLORS.whiteTransparentLight,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  termsLink: {
    color: COLORS.white,
    fontWeight: '700',
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: LAYOUT.spacing.sm,
    textAlign: 'center',
  },
  toggleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 32,
  },
  toggleLink: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  toggleText: {
    color: COLORS.whiteTransparent,
    fontSize: 14,
  },
});

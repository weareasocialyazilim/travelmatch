import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SocialButton from '../components/SocialButton';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';

export const EmailAuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    if (isSignUp) {
      navigation.navigate('CompleteProfile');
    } else {
      navigation.navigate('Home');
    }
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.screenCenter}>
          <View style={styles.cardContainer}>
            <View style={styles.cardInner}>
              {/* Header */}
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <Icon name="arrow-left" size={22} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              {/* Content */}
              <View style={styles.content}>
                <View style={styles.iconContainer}>
                  <Icon name="email-outline" size={52} color={COLORS.primary} />
                </View>
                <Text style={styles.title}>{isSignUp ? 'Create account' : 'Welcome back'}</Text>
                <Text style={styles.subtitleText}>
                  {isSignUp
                    ? 'Sign up with your email to get started'
                    : 'Sign in to continue your journey'}
                </Text>
                {/* Email Input */}
                <View style={[styles.inputContainer, styles.inputWithIcon]}>
                  <Icon name="email-outline" size={20} color={COLORS.textSecondary} />
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
                  <Icon name="lock-outline" size={20} color={COLORS.textSecondary} />
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
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
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
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
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
                    <Text style={styles.continueButtonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                {/* Toggle Sign Up/Sign In */}
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleText}>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
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
                  <SocialButton provider="google" size="icon" onPress={() => handleSocialLogin('google')} />
                  <SocialButton provider="apple" size="icon" onPress={() => handleSocialLogin('apple')} />
                  <SocialButton provider="facebook" size="icon" onPress={() => handleSocialLogin('facebook')} />
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
                    <Text style={styles.continueWithoutSignupText}>Üye olmadan devam et</Text>
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
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  screenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: LAYOUT.padding * 2,
  },
  cardContainer: {
    width: '92%',
    maxWidth: 420,
    borderRadius: VALUES.borderRadius * 1.6,
    backgroundColor: COLORS.card,
    ...VALUES.shadow,
    overflow: 'hidden',
  },
  cardInner: {
    padding: LAYOUT.padding * 2,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: LAYOUT.spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  content: {
    width: '100%',
    justifyContent: 'center',
  },
  iconContainer: {
    alignSelf: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  subtitleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWithIcon: {
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
  continueButton: {
    width: '100%',
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
    marginBottom: LAYOUT.spacing.md,
  },
  continueGradient: {
    paddingVertical: LAYOUT.padding * 1.5,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 32,
  },
  toggleText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  toggleLink: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginHorizontal: 12,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialContainerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
    continueWithoutSignupButton: {
      marginTop: LAYOUT.spacing.lg,
      width: '100%',
      borderRadius: VALUES.borderRadius,
      overflow: 'hidden',
    },
    continueWithoutSignupGradient: {
      paddingVertical: LAYOUT.padding * 1.3,
      alignItems: 'center',
    },
    continueWithoutSignupText: {
      color: COLORS.white,
      fontSize: 15,
      fontWeight: '700',
    },
  terms: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: '700',
    color: COLORS.white,
  },
});

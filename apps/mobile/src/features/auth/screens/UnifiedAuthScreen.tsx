/**
 * UnifiedAuthScreen - Master Auth Flow
 *
 * Liquid Design System 2026
 * Single entry point for authentication:
 * - Email detection: existing user → password, new user → registration
 * - Phone detection: auto OTP flow
 * - Seamless transitions with haptic feedback
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { HapticManager } from '@/services/HapticManager';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';

import { COLORS, PALETTE } from '@/constants/colors';
import { TYPE_SCALE, FONTS } from '@/constants/typography';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAccessibility } from '@/hooks/useAccessibility';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/LoadingState';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

// ============================================
// TYPES
// ============================================
type AuthStep = 'identifier' | 'password' | 'register' | 'otp';
type IdentifierType = 'email' | 'phone';

// ============================================
// HELPER FUNCTIONS
// ============================================
const isEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const isPhone = (value: string): boolean => {
  return /^\+?[1-9]\d{9,14}$/.test(value.replace(/\s/g, ''));
};

const detectIdentifierType = (value: string): IdentifierType | null => {
  if (isEmail(value)) return 'email';
  if (isPhone(value)) return 'phone';
  return null;
};

// ============================================
// ANIMATED INPUT COMPONENT
// ============================================
interface LiquidInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
  error?: string;
  accessibilityLabel: string;
  inputRef?: React.RefObject<TextInput | null>;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  blurOnSubmit?: boolean;
  onSubmitEditing?: () => void;
  onKeyPress?: (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => void;
  rightIcon?: string;
  onRightIconPress?: () => void;
  rightIconAccessibilityLabel?: string;
}

const LiquidInput: React.FC<LiquidInputProps> = ({
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'none',
  autoFocus = false,
  error,
  accessibilityLabel,
  inputRef,
  returnKeyType,
  blurOnSubmit,
  onSubmitEditing,
  onKeyPress,
  rightIcon,
  onRightIconPress,
  rightIconAccessibilityLabel,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = useSharedValue<string>(COLORS.border.default);
  const scale = useSharedValue(1);

  const handleFocus = () => {
    setIsFocused(true);
    borderColor.value = withTiming(COLORS.brand.primary);
    scale.value = withTiming(1.02, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderColor.value = withTiming(
      error ? COLORS.feedback.error : COLORS.border.default,
    );
    scale.value = withTiming(1, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.inputContainer}>
      <Reanimated.View style={[styles.inputWrapper, animatedStyle]}>
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={isFocused ? COLORS.brand.primary : COLORS.text.muted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.muted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          keyboardAppearance="dark"
          autoFocus={autoFocus}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={accessibilityLabel}
          ref={inputRef}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          onSubmitEditing={onSubmitEditing}
          onKeyPress={onKeyPress}
        />
        {rightIcon && (
          <TouchableOpacity
            style={styles.inputRightIconButton}
            onPress={onRightIconPress}
            accessibilityRole="button"
            accessibilityLabel={rightIconAccessibilityLabel}
          >
            <MaterialCommunityIcons
              name={rightIcon as any}
              size={20}
              color={COLORS.text.muted}
            />
          </TouchableOpacity>
        )}
      </Reanimated.View>
      {error && (
        <Reanimated.Text
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.errorText}
        >
          {error}
        </Reanimated.Text>
      )}
    </View>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export const UnifiedAuthScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'UnifiedAuth'>>();
  const initialMode = route.params?.initialMode;

  const { login, register, socialAuth } = useAuth();
  const { showToast } = useToast();
  const { props: a11y } = useAccessibility();

  // Handle Social Login (Apple/Google)
  const handleSocialLogin = async (provider: 'apple' | 'google') => {
    HapticManager.buttonPress();
    setIsLoading(true);
    try {
      const result = await socialAuth({ provider, token: '' });
      if (!result.success && result.error) {
        HapticManager.error();
        showToast(result.error, 'error');
      }
    } catch (error) {
      HapticManager.error();
      logger.error(`[UnifiedAuth] ${provider} login error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // State
  const [step, setStep] = useState<AuthStep>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // For secureTextEntry toggle

  // Refs
  const passwordRef = useRef<TextInput | null>(null);
  const nameRef = useRef<TextInput | null>(null);
  const registerPasswordRef = useRef<TextInput | null>(null);
  const confirmPasswordRef = useRef<TextInput | null>(null);

  // Animation values
  const titleOpacity = useSharedValue(1);

  // Get step title
  const getStepTitle = (): string => {
    switch (step) {
      case 'identifier':
        return initialMode === 'register' ? 'Hesap Oluştur' : 'Hoş Geldin';
      case 'password':
        return 'Tekrar Hoş Geldin';
      case 'register':
        return 'Hesap Oluştur';
      case 'otp':
        return 'Doğrulama';
      default:
        return 'Hoş Geldin';
    }
  };

  // Get step subtitle
  const getStepSubtitle = (): string => {
    switch (step) {
      case 'identifier':
        return 'E-posta veya telefon numaranı gir';
      case 'password':
        return `${identifier} hesabına giriş yap`;
      case 'register':
        return 'Aramıza katıl ve anlar paylaş';
      case 'otp':
        return 'Telefonuna gönderilen kodu gir';
      default:
        return '';
    }
  };

  // Handle identifier submission
  const handleIdentifierSubmit = async () => {
    const type = detectIdentifierType(identifier);

    if (!type) {
      HapticManager.error();
      showToast('Geçerli bir e-posta veya telefon numarası girin', 'error');
      return;
    }

    HapticManager.buttonPress();

    if (type === 'phone') {
      // Phone flow - go to OTP
      setIsLoading(true);
      try {
        const { error } = await supabase.auth.signInWithOtp({
          phone: identifier,
        });

        if (error) {
          HapticManager.error();
          showToast(error.message || 'SMS gönderilemedi', 'error');
        } else {
          setStep('otp');
          showToast('Doğrulama kodu gönderildi', 'success');
        }
      } catch (error) {
        logger.error('[UnifiedAuth] Phone OTP error:', error);
        showToast('Bir hata oluştu', 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Email flow - check if user exists
      setIsCheckingUser(true);
      try {
        // Check initialMode to determine flow
        if (initialMode === 'register') {
          setStep('register');
        } else {
          // Default to login flow and let the user choose register if needed
          setStep('password');
          setTimeout(() => passwordRef.current?.focus(), 300);
        }
      } finally {
        setIsCheckingUser(false);
      }
    }
  };

  // Handle login
  const handleLogin = async () => {
    if (!identifier || !password) {
      HapticManager.error();
      showToast('Lütfen tüm alanları doldurun', 'error');
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const result = await login({ email: identifier, password });

      if (result.success) {
        HapticManager.success();
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' as never }],
        });
      } else {
        HapticManager.error();
        showToast(result.error || 'Giriş başarısız', 'error');
      }
    } catch (error) {
      HapticManager.error();
      logger.error('[UnifiedAuth] Login error:', error);
      showToast('Giriş yapılırken bir hata oluştu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle register
  const handleRegister = async () => {
    if (!identifier || !password || !name) {
      HapticManager.error();
      showToast('Lütfen tüm alanları doldurun', 'error');
      return;
    }

    if (password !== confirmPassword) {
      HapticManager.error();
      showToast('Şifreler eşleşmiyor', 'error');
      return;
    }

    if (password.length < 8) {
      HapticManager.error();
      showToast('Şifre en az 8 karakter olmalı', 'error');
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      const result = await register({
        email: identifier,
        password,
        name: name.trim(),
      });

      if (result.success) {
        HapticManager.success();
        showToast('Hesap oluşturuldu!', 'success');
        navigation.reset({
          index: 0,
          routes: [{ name: 'CompleteProfile' as never }],
        });
      } else {
        HapticManager.error();
        showToast(result.error || 'Kayıt başarısız', 'error');
      }
    } catch (error) {
      HapticManager.error();
      logger.error('[UnifiedAuth] Register error:', error);
      showToast('Kayıt olurken bir hata oluştu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    HapticManager.buttonPress();
    navigation.navigate('ForgotPassword' as never);
  };

  // Handle back
  const handleBack = () => {
    HapticManager.buttonPress();
    if (step === 'identifier') {
      navigation.goBack();
    } else {
      setStep('identifier');
      setPassword('');
      setConfirmPassword('');
      setName('');
    }
  };

  // Switch to register mode
  const switchToRegister = () => {
    HapticManager.buttonPress();
    setStep('register');
  };

  // Switch to login mode
  const switchToLogin = () => {
    HapticManager.buttonPress();
    setStep('password');
  };

  // Title animation style
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const handleTabFocus =
    (
      currentRef: React.RefObject<TextInput | null>,
      nextRef?: React.RefObject<TextInput | null>,
    ) =>
    (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (event.nativeEvent.key !== 'Tab') return;
      if (nextRef?.current) {
        nextRef.current.focus();
      } else if (currentRef?.current) {
        setTimeout(() => currentRef.current?.focus(), 0);
      }
    };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.bg.primary, COLORS.bg.tertiary]}
        style={StyleSheet.absoluteFill}
      />

      {isLoading && (
        <LoadingState type="overlay" message="Lütfen bekleyin..." />
      )}

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 12 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 120 },
          ]}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
          contentInsetAdjustmentBehavior="always"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            {...a11y.button('Geri dön')}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>

          {/* Header */}
          <Reanimated.View style={[styles.header, titleStyle]}>
            <MaterialCommunityIcons
              name={
                step === 'identifier'
                  ? 'account-circle-outline'
                  : step === 'password'
                    ? 'lock-outline'
                    : step === 'register'
                      ? 'account-plus-outline'
                      : 'cellphone-message'
              }
              size={64}
              color={COLORS.brand.primary}
            />
            <Text style={styles.title}>{getStepTitle()}</Text>
            <Text style={styles.subtitle}>{getStepSubtitle()}</Text>
          </Reanimated.View>

          {/* Form Content */}
          <View style={styles.formContainer}>
            {/* Step: Identifier */}
            {step === 'identifier' && (
              <Reanimated.View entering={FadeIn} exiting={FadeOut}>
                <LiquidInput
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="E-posta veya telefon"
                  icon="account-outline"
                  keyboardType="email-address"
                  autoFocus
                  accessibilityLabel="E-posta veya telefon numarası"
                />

                <Button
                  variant="primary"
                  onPress={handleIdentifierSubmit}
                  size="lg"
                  disabled={!identifier || isCheckingUser}
                  fullWidth
                  style={styles.submitButton}
                >
                  {isCheckingUser ? 'Kontrol ediliyor...' : 'Devam Et'}
                </Button>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>VEYA</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Login Buttons */}
                <View style={styles.socialRow}>
                  <TouchableOpacity
                    style={[styles.socialButton, styles.appleButton]}
                    onPress={() => handleSocialLogin('apple')}
                    accessibilityLabel="Apple ile giriş yap"
                  >
                    <MaterialCommunityIcons
                      name="apple"
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.socialButton, styles.googleButton]}
                    onPress={() => handleSocialLogin('google')}
                    accessibilityLabel="Google ile giriş yap"
                  >
                    <MaterialCommunityIcons
                      name="google"
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </Reanimated.View>
            )}

            {/* Step: Password (Login) */}
            {step === 'password' && (
              <Reanimated.View
                entering={SlideInRight.duration(300)}
                exiting={SlideOutLeft.duration(300)}
              >
                <View style={styles.identifierBadge}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={16}
                    color={COLORS.brand.primary}
                  />
                  <Text style={styles.identifierText}>{identifier}</Text>
                  <TouchableOpacity onPress={handleBack}>
                    <MaterialCommunityIcons
                      name="pencil"
                      size={16}
                      color={COLORS.text.muted}
                    />
                  </TouchableOpacity>
                </View>

                <LiquidInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Şifre"
                  icon="lock-outline"
                  secureTextEntry={!showPassword}
                  autoFocus
                  accessibilityLabel="Şifre"
                  inputRef={passwordRef}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowPassword((prev) => !prev)}
                  rightIconAccessibilityLabel={
                    showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'
                  }
                />

                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={handleForgotPassword}
                  {...a11y.button('Şifremi unuttum')}
                >
                  <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
                </TouchableOpacity>

                <Button
                  variant="primary"
                  onPress={handleLogin}
                  size="lg"
                  disabled={!password}
                  fullWidth
                  style={styles.submitButton}
                >
                  Giriş Yap
                </Button>

                <TouchableOpacity
                  style={styles.switchMode}
                  onPress={switchToRegister}
                >
                  <Text style={styles.switchModeText}>
                    Hesabın yok mu?{' '}
                    <Text style={styles.switchModeLink}>Kayıt Ol</Text>
                  </Text>
                </TouchableOpacity>
              </Reanimated.View>
            )}

            {/* Step: Register */}
            {step === 'register' && (
              <Reanimated.View
                entering={SlideInRight.duration(300)}
                exiting={SlideOutLeft.duration(300)}
              >
                <View style={styles.identifierBadge}>
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={16}
                    color={COLORS.brand.primary}
                  />
                  <Text style={styles.identifierText}>{identifier}</Text>
                  <TouchableOpacity onPress={handleBack}>
                    <MaterialCommunityIcons
                      name="pencil"
                      size={16}
                      color={COLORS.text.muted}
                    />
                  </TouchableOpacity>
                </View>

                <LiquidInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ad Soyad"
                  icon="account-outline"
                  autoCapitalize="words"
                  autoFocus
                  accessibilityLabel="Ad Soyad"
                  inputRef={nameRef}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => registerPasswordRef.current?.focus()}
                  onKeyPress={handleTabFocus(nameRef, registerPasswordRef)}
                />

                <LiquidInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Şifre (en az 8 karakter)"
                  icon="lock-outline"
                  secureTextEntry={!showPassword}
                  accessibilityLabel="Şifre"
                  inputRef={registerPasswordRef}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  onKeyPress={handleTabFocus(
                    registerPasswordRef,
                    confirmPasswordRef,
                  )}
                  rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowPassword((prev) => !prev)}
                  rightIconAccessibilityLabel={
                    showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'
                  }
                />

                <Text style={styles.passwordHint}>
                  En az 8 karakter • Harf ve rakam önerilir
                </Text>

                <LiquidInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Şifreyi Onayla"
                  icon="lock-check-outline"
                  secureTextEntry={!showPassword}
                  accessibilityLabel="Şifreyi onayla"
                  inputRef={confirmPasswordRef}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  onKeyPress={handleTabFocus(confirmPasswordRef)}
                  rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => setShowPassword((prev) => !prev)}
                  rightIconAccessibilityLabel={
                    showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'
                  }
                />

                <View style={styles.policySection}>
                  <MaterialCommunityIcons
                    name="shield-check-outline"
                    size={16}
                    color={COLORS.brand.accent}
                  />
                  <Text style={styles.policyText}>
                    Hesap oluşturarak Kullanım Koşullarını ve KVKK metnini kabul
                    etmiş olursun.
                  </Text>
                </View>

                <Button
                  variant="primary"
                  onPress={handleRegister}
                  size="lg"
                  disabled={!name || !password || !confirmPassword}
                  fullWidth
                  style={styles.submitButton}
                >
                  Hesabımı Oluştur
                </Button>

                <TouchableOpacity
                  style={styles.switchMode}
                  onPress={switchToLogin}
                >
                  <Text style={styles.switchModeText}>
                    Zaten hesabın var mı?{' '}
                    <Text style={styles.switchModeLink}>Giriş Yap</Text>
                  </Text>
                </TouchableOpacity>
              </Reanimated.View>
            )}

            {/* Step: OTP */}
            {step === 'otp' && (
              <Reanimated.View
                entering={SlideInRight.duration(300)}
                exiting={SlideOutLeft.duration(300)}
              >
                <View style={styles.identifierBadge}>
                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={16}
                    color={COLORS.brand.primary}
                  />
                  <Text style={styles.identifierText}>{identifier}</Text>
                  <TouchableOpacity onPress={handleBack}>
                    <MaterialCommunityIcons
                      name="pencil"
                      size={16}
                      color={COLORS.text.muted}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.otpHint}>
                  Telefonuna gönderilen 6 haneli kodu gir
                </Text>

                <Button
                  variant="secondary"
                  onPress={() => navigation.navigate('VerifyCode' as never)}
                  size="lg"
                  fullWidth
                  style={styles.submitButton}
                >
                  Kodu Gir
                </Button>
              </Reanimated.View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -6,
    marginBottom: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.display.black,
    fontWeight: '900',
    color: COLORS.text.primary,
    marginTop: 16,
  },
  subtitle: {
    ...TYPE_SCALE.body.base,
    color: COLORS.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  // Social Buttons
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  appleButton: {
    backgroundColor: 'black',
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border.default,
  },
  dividerText: {
    marginHorizontal: 16,
    color: COLORS.text.muted,
    fontSize: 12,
    fontFamily: FONTS.body.medium,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.base,
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputRightIconButton: {
    padding: 6,
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.body.regular,
    color: COLORS.text.primary,
    paddingVertical: 16,
  },
  passwordHint: {
    ...TYPE_SCALE.body.caption,
    color: COLORS.text.muted,
    marginTop: -4,
    marginBottom: 12,
    marginLeft: 6,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.feedback.error,
    marginTop: 6,
    marginLeft: 4,
  },
  identifierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  identifierText: {
    flex: 1,
    ...TYPE_SCALE.body.small,
    color: COLORS.text.primary,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    ...TYPE_SCALE.body.small,
    color: COLORS.brand.primary,
    fontWeight: '600',
  },
  submitButton: {
    height: 52,
    borderRadius: 26,
    marginBottom: 16,
  },
  switchMode: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchModeText: {
    ...TYPE_SCALE.body.small,
    color: COLORS.text.secondary,
  },
  switchModeLink: {
    color: COLORS.brand.primary,
    fontWeight: '600',
  },
  policySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  policyText: {
    flex: 1,
    ...TYPE_SCALE.body.caption,
    color: COLORS.text.muted,
    lineHeight: 18,
  },
  otpHint: {
    ...TYPE_SCALE.body.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default UnifiedAuthScreen;

import React, { useState, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS } from '@/constants/colors';
import { logger } from '@/utils/logger';
import {
  showErrorAlert,
  AppErrorCode,
  AppError,
} from '@/utils/friendlyErrorHandler';
import { LoadingState } from '@/components/LoadingState';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { loginSchema, type LoginInput } from '@/utils/forms';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';

type LoginScreenProps = StackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState, watch } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const identifierValue = watch('identifier');
  
  // Detect if identifier is email or phone
  const isEmailInput = useMemo(() => {
    return identifierValue?.includes('@') || false;
  }, [identifierValue]);

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      logger.info('LoginScreen', 'Starting login...');
      
      // Determine if using email or phone
      const loginPayload = isEmailInput
        ? { email: data.identifier, password: data.password }
        : { phone: data.identifier, password: data.password };
      
      const result = await login(loginPayload);

      logger.info('LoginScreen', 'Login result:', result);

      if (result.success) {
        logger.info('LoginScreen', 'Navigating to Discover...');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Discover' }],
        });
        logger.info('LoginScreen', 'Navigation reset called');
      } else {
        throw new AppError(
          AppErrorCode.AUTH_INVALID_CREDENTIALS,
          result.error || 'Invalid credentials',
        );
      }
    } catch (error) {
      logger.error('Login error:', error);
      showErrorAlert(error, t, {
        onRetry: () => handleSubmit(onSubmit)(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (_provider: string) => {
    showToast('Coming Soon! This feature will be available shortly.', 'info');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading && <LoadingState type="overlay" message="Logging in..." />}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Log In
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          bounces={false}
        >
          {/* Social Login Icons - Small Row at Top */}
          <View style={styles.socialSection}>
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialIconButton}
                onPress={() => handleSocialLogin('apple')}
                activeOpacity={0.7}
              >
                <Icon name="apple" size={22} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.socialIconButton, styles.googleButton]}
                onPress={() => handleSocialLogin('google')}
                activeOpacity={0.7}
              >
                <Icon name="google" size={22} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.socialIconButton, styles.facebookButton]}
                onPress={() => handleSocialLogin('facebook')}
                activeOpacity={0.7}
              >
                <Icon name="facebook" size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or login with email/phone</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email/Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel} nativeID="identifier-label">
              Email or Phone Number
            </Text>
            <Controller
              control={control}
              name="identifier"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <>
                  <View
                    style={[styles.inputWrapper, error && styles.inputError]}
                  >
                    <Icon
                      name={isEmailInput ? "email-outline" : "phone-outline"}
                      size={20}
                      color={COLORS.textSecondary}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Email or phone number"
                      placeholderTextColor={COLORS.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType={isEmailInput ? "email-address" : "default"}
                      autoCapitalize="none"
                      autoCorrect={false}
                      accessibilityLabel="Email or phone number"
                      accessibilityHint="Enter your email address or phone number"
                      accessibilityLabelledBy="identifier-label"
                    />
                  </View>
                  {error && (
                    <Text
                      style={styles.errorText}
                      accessibilityLiveRegion="polite"
                    >
                      {error.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel} nativeID="password-label">
              Password
            </Text>
            <Controller
              control={control}
              name="password"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <>
                  <View
                    style={[styles.inputWrapper, error && styles.inputError]}
                  >
                    <Icon
                      name="lock-outline"
                      size={20}
                      color={COLORS.textSecondary}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter your password"
                      placeholderTextColor={COLORS.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      accessibilityLabel="Password"
                      accessibilityHint="Enter your password"
                      accessibilityLabelledBy="password-label"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      accessibilityRole="button"
                      accessibilityLabel={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                    >
                      <Icon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={COLORS.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {error && (
                    <Text style={styles.errorText}>{error.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate('ForgotPassword')}
            accessibilityRole="link"
            accessibilityLabel="Forgot your password? Tap to reset"
          >
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.loginButton,
              (!formState.isValid || loading) && styles.loginButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={!formState.isValid || loading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Log in"
            accessibilityState={{ disabled: !formState.isValid || loading }}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          <View style={styles.registerPrompt}>
            <Text style={styles.registerPromptText}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              accessibilityRole="link"
            >
              <Text style={styles.registerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  socialSection: {
    marginBottom: 16,
    marginTop: 24,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
    gap: 10,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotPasswordText: {
    color: COLORS.mint,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: COLORS.background,
  },
  loginButton: {
    height: 52,
    backgroundColor: COLORS.mint,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    backgroundColor: `${COLORS.mint}50`,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerPromptText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mint,
  },
});

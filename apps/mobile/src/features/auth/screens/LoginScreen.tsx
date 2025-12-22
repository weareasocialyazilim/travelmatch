import React, { useState } from 'react';
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
import SocialButton from '@/components/SocialButton';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, type LoginInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';

type LoginScreenProps = StackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      logger.info('LoginScreen', 'Starting login...');
      const result = await login({
        email: data.email,
        password: data.password,
      });

      logger.info('LoginScreen', 'Login result:', result);

      if (result.success) {
        logger.info('LoginScreen', 'Navigating to Discover...');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Discover' }],
        });
        logger.info('LoginScreen', 'Navigation reset called');
      } else {
        // Show user-friendly error
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

  const handleSocialLogin = (provider: string) => {
    logger.debug('Social login:', provider);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Discover' }],
    });
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
          {/* Welcome Text */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to continue exploring and connecting
            </Text>
          </View>

          {/* OAuth Buttons */}
          <View style={styles.socialButtonsContainer}>
            <SocialButton
              provider="apple"
              label="Continue with Apple"
              onPress={() => handleSocialLogin('apple')}
            />
            <SocialButton
              provider="google"
              label="Continue with Google"
              onPress={() => handleSocialLogin('google')}
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or login with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel} nativeID="email-label">
              Email address
            </Text>
            <Controller
              control={control}
              name="email"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <>
                  <View
                    style={[styles.inputWrapper, error && styles.inputError]}
                  >
                    <Icon
                      name="email-outline"
                      size={20}
                      color={COLORS.textSecondary}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="name@example.com"
                      placeholderTextColor={COLORS.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      accessibilityLabel="Email address"
                      accessibilityHint="Enter your email address"
                      accessibilityLabelledBy="email-label"
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
              !canSubmitForm({ formState }) && styles.loginButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={!canSubmitForm({ formState }) || loading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Log in to your account"
            accessibilityState={{
              disabled: !canSubmitForm({ formState }) || loading,
            }}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>

          <View style={styles.registerPrompt}>
            <Text style={styles.registerPromptText}>
              Don&apos;t have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              accessibilityRole="link"
              accessibilityLabel="Sign up for an account"
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
    paddingBottom: 24,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  socialButtonsContainer: {
    gap: 12,
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
    marginHorizontal: 16,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  inputContainer: {
    marginBottom: 16,
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
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mint,
  },
  bottomBar: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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

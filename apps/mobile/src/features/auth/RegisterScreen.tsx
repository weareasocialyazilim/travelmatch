import React, { useState, useRef } from 'react';
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
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS } from '@/constants/colors';
import { logger } from '@/utils/logger';
import { LoadingState } from '@/components/LoadingState';
import SocialButton from '@/components/SocialButton';
import { useAuth } from '@/context/AuthContext';
import { registerSchema, type RegisterInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import { useToast } from '@/context/ToastContext';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';

type RegisterScreenProps = StackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  navigation,
}) => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState,
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');
  const email = watch('email');

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const result = await register({
        email: data.email,
        password: data.password,
        name: data.email.split('@')[0], // Default name from email
      });

      if (result.success) {
        navigation.navigate('CompleteProfile');
      } else {
        showToast(result.error || 'Please try again', 'error');
      }
    } catch (error) {
      logger.error('Registration error:', error);
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    logger.debug('Social register:', provider);
    navigation.navigate('CompleteProfile');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading && <LoadingState type="overlay" message="Creating account..." />}

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
            Create Account
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome Text */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Join TravelMatch</Text>
            <Text style={styles.welcomeSubtitle}>
              Create an account to start connecting with travelers and locals
            </Text>
          </View>

          {/* Social Login */}
          <View style={styles.socialSection}>
            <Text style={styles.socialText}>Or sign up with</Text>
            <View style={styles.socialButtons}>
              <SocialButton
                provider="apple"
                onPress={() => handleSocialLogin('apple')}
              />
              <SocialButton
                provider="google"
                onPress={() => handleSocialLogin('google')}
              />
              <SocialButton
                provider="facebook"
                onPress={() => handleSocialLogin('facebook')}
              />
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or register with email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email address</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <>
                  <View style={[styles.inputWrapper, error && styles.inputError]}>
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
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </View>
                  {error && <Text style={styles.errorText}>{error.message}</Text>}
                </>
              )}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <>
                  <View style={[styles.inputWrapper, error && styles.inputError]}>
                    <Icon
                      name="lock-outline"
                      size={20}
                      color={COLORS.textSecondary}
                    />
                    <TextInput
                      ref={passwordRef}
                      style={styles.textInput}
                      placeholder="Min. 8 characters"
                      placeholderTextColor={COLORS.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      returnKeyType="next"
                      onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Icon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={COLORS.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {error && <Text style={styles.errorText}>{error.message}</Text>}
                </>
              )}
            />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <>
                  <View style={[styles.inputWrapper, error && styles.inputError]}>
                    <Icon
                      name="lock-check-outline"
                      size={20}
                      color={COLORS.textSecondary}
                    />
                    <TextInput
                      ref={confirmPasswordRef}
                      style={styles.textInput}
                      placeholder="Re-enter password"
                      placeholderTextColor={COLORS.textSecondary}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(onSubmit)}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Icon
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={COLORS.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {error && <Text style={styles.errorText}>{error.message}</Text>}
                </>
              )}
            />
          </View>

          {/* Terms */}
          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
            <Text
              style={styles.termsLink}
              onPress={() => navigation.navigate('TermsOfService')}
            >
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text
              style={styles.termsLink}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              Privacy Policy
            </Text>
          </Text>

          {/* Bottom Action Bar - Moved inside ScrollView to prevent keyboard overlap issues */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[
                styles.registerButton,
                !canSubmitForm({ formState }) && styles.registerButtonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={!canSubmitForm({ formState }) || loading}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>Create Account</Text>
            </TouchableOpacity>

            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Log in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  socialSection: {
    marginBottom: 24,
  },
  socialText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
  },
  socialButtons: {
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
  termsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  termsLink: {
    color: COLORS.mint,
    fontWeight: '600',
  },
  bottomBar: {
    paddingTop: 24,
    paddingBottom: 16,
    // Removed absolute positioning/border to flow with content
  },
  registerButton: {
    height: 52,
    backgroundColor: COLORS.mint,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonDisabled: {
    backgroundColor: `${COLORS.mint}50`,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginPromptText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mint,
  },
});

export default RegisterScreen;

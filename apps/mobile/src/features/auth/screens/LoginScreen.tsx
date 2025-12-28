import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '@/navigation/routeParams';
import { useAuth } from '@/context/AuthContext';
import { useBiometric } from '@/context/BiometricAuthContext';
import { useAccessibility } from '@/hooks/useAccessibility';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import SocialButton from '@/components/SocialButton';
import { loginSchema, type LoginInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import type { MinimalFormState } from '@/utils/forms/helpers';
import { useToast } from '@/context/ToastContext';
import { COLORS } from '@/constants/colors';
import { logger } from '@/utils/logger';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const { login } = useAuth();
  const {
    biometricAvailable,
    biometricEnabled,
    biometricTypeName,
    authenticateForAppLaunch,
  } = useBiometric();
  const { props: a11y } = useAccessibility();

  const { control, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      await login({ email: data.email, password: data.password });
      // Navigation handled by auth state change
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin',
        'error',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'apple' | 'google') => {
    try {
      setIsLoading(true);
      logger.debug('[Auth] Social login initiated:', provider);
      // TODO: Implement actual social login with Supabase
      // For now, show a message that it's coming soon
      showToast(
        `${provider === 'apple' ? 'Apple' : 'Google'} ile giriş yakında aktif olacak`,
        'info',
      );
    } catch (error) {
      logger.error('[Auth] Social login error:', error);
      showToast('Sosyal giriş başarısız oldu. Lütfen tekrar deneyin.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setIsBiometricLoading(true);
      const success = await authenticateForAppLaunch();

      if (success) {
        // User authenticated with biometric, proceed with login
        // In a real app, you would retrieve stored credentials and call login
        // For now, we'll just show a success message
        showToast(
          biometricTypeName + ' ile başarıyla giriş yaptınız',
          'success',
        );
      } else {
        showToast(
          biometricTypeName +
            ' doğrulaması başarısız. Lütfen tekrar deneyin veya şifrenizi kullanın',
          'error',
        );
      }
    } catch {
      showToast(
        'Biyometrik doğrulama kullanılamıyor. Lütfen şifrenizi kullanın',
        'error',
      );
    } finally {
      setIsBiometricLoading(false);
    }
  };

  return (
    <ScreenErrorBoundary>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title} {...a11y.header('Welcome Back')}>
            Welcome Back
          </Text>
          <Text
            style={styles.subtitle}
            accessible={true}
            accessibilityLabel="Sign in to continue"
          >
            Sign in to continue
          </Text>

          {/* Social Login Buttons */}
          <View style={styles.socialButtonsContainer}>
            <SocialButton
              provider="apple"
              label="Apple ile devam et"
              onPress={() => handleSocialLogin('apple')}
              style={styles.socialButton}
            />
            <SocialButton
              provider="google"
              label="Google ile devam et"
              onPress={() => handleSocialLogin('google')}
              style={styles.socialButton}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya email ile giriş yap</Text>
            <View style={styles.dividerLine} />
          </View>

          <Controller
            control={control}
            name="email"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  testID="email-input"
                  style={[styles.input, error && styles.inputError]}
                  placeholder="Email"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                  accessible={true}
                  accessibilityLabel="Email address"
                  accessibilityHint="Enter your email address to sign in"
                  accessibilityValue={{ text: value }}
                />
                {error && (
                  <Text
                    style={styles.errorText}
                    {...a11y.alert(error.message || 'Validation error')}
                  >
                    {error.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <View style={styles.inputContainer}>
                <TextInput
                  testID="password-input"
                  style={[styles.input, error && styles.inputError]}
                  placeholder="Password"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  editable={!isLoading}
                  accessible={true}
                  accessibilityLabel="Password"
                  accessibilityHint="Enter your password to sign in"
                />
                {error && (
                  <Text
                    style={styles.errorText}
                    {...a11y.alert(error.message || 'Validation error')}
                  >
                    {error.message}
                  </Text>
                )}
              </View>
            )}
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giriş Yap</Text>
          <View style={styles.placeholder} />
        </View>

          {biometricAvailable && biometricEnabled && (
            <>
              <View style={styles.biometricDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>veya</Text>
                <View style={styles.dividerLine} />
              </View>

            <Controller
              control={control}
              name="email"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    testID="email-input"
                    style={[styles.input, error && styles.inputError]}
                    placeholder="E-posta"
                    placeholderTextColor={COLORS.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                    accessible={true}
                    accessibilityLabel="E-posta adresi"
                    accessibilityHint="Giriş yapmak için e-posta adresinizi girin"
                    accessibilityValue={{ text: value }}
                  />
                  {error && (
                    <Text
                      style={styles.errorText}
                      {...a11y.alert(error.message || 'Validation error')}
                    >
                      {error.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    testID="password-input"
                    style={[styles.input, error && styles.inputError]}
                    placeholder="Şifre"
                    placeholderTextColor={COLORS.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    editable={!isLoading}
                    accessible={true}
                    accessibilityLabel="Şifre"
                    accessibilityHint="Giriş yapmak için şifrenizi girin"
                  />
                  {error && (
                    <Text
                      style={styles.errorText}
                      {...a11y.alert(error.message || 'Validation error')}
                    >
                      {error.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="login-button"
              style={[
                styles.button,
                (isLoading ||
                  !canSubmitForm({ formState } as {
                    formState: MinimalFormState;
                  })) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={
                isLoading ||
                !canSubmitForm({ formState } as { formState: MinimalFormState })
              }
              {...a11y.button(
                isLoading ? 'Giriş yapılıyor' : 'Giriş Yap',
                'E-posta ve şifrenizle giriş yapın',
                isLoading ||
                  !canSubmitForm({ formState } as {
                    formState: MinimalFormState;
                  }),
              )}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Text>
            </TouchableOpacity>

            {biometricAvailable && biometricEnabled && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>veya</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  testID="biometric-login-button"
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                  disabled={isBiometricLoading || isLoading}
                  {...a11y.button(
                    `${biometricTypeName} ile giriş yap`,
                    `Hızlı giriş için ${biometricTypeName} kullanın`,
                    isBiometricLoading || isLoading,
                  )}
                >
                  {isBiometricLoading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="fingerprint"
                        size={32}
                        color={COLORS.primary}
                        accessible={false}
                      />
                      <Text style={styles.biometricButtonText}>
                        {biometricTypeName} ile giriş yap
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Hesabın yok mu? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signUpLink}>Kayıt Ol</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenErrorBoundary>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  socialButtonsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 8,
  },
  socialButton: {
    width: '100%',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  biometricDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  biometricButton: {
    width: '100%',
    height: 60,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  biometricButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -8,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signUpText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  signUpLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

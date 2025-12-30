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
import { loginSchema, type LoginInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import type { MinimalFormState } from '@/utils/forms/helpers';
import { useToast } from '@/context/ToastContext';
import { COLORS } from '@/constants/colors';
import { TYPE_SCALE } from '@/constants/typography';
import { RADIUS } from '@/constants/spacing';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const { login } = useAuth();
  const {
    biometricAvailable,
    biometricEnabled,
    hasCredentials,
    biometricTypeName,
    authenticateForAppLaunch,
    getCredentials,
    saveCredentials,
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
      const result = await login({
        email: data.email,
        password: data.password,
      });
      if (result.success) {
        // Save credentials for biometric login if enabled
        if (biometricEnabled) {
          try {
            await saveCredentials({
              email: data.email,
              password: data.password,
            });
          } catch {
            // Silent fail - biometric login won't work but normal login is fine
          }
        }
        // Navigate to Discover on successful login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Discover' }],
        });
      } else {
        showToast(
          result.error || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin',
          'error',
        );
      }
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

  const handleBiometricLogin = async () => {
    try {
      setIsBiometricLoading(true);

      // Check if we have saved credentials
      if (!hasCredentials) {
        showToast(
          'Biyometrik giriş için önce şifrenizle giriş yapın',
          'info',
        );
        return;
      }

      // Authenticate with biometric
      const success = await authenticateForAppLaunch();

      if (success) {
        // Get saved credentials and login
        const credentials = await getCredentials();
        if (!credentials) {
          showToast(
            'Kayıtlı kimlik bilgisi bulunamadı. Lütfen şifrenizle giriş yapın',
            'error',
          );
          return;
        }

        // Perform actual login with saved credentials
        const result = await login({
          email: credentials.email,
          password: credentials.password,
        });

        if (result.success) {
          showToast(
            biometricTypeName + ' ile başarıyla giriş yaptınız',
            'success',
          );
          navigation.reset({
            index: 0,
            routes: [{ name: 'Discover' }],
          });
        } else {
          showToast(
            'Oturum süresi dolmuş. Lütfen şifrenizle tekrar giriş yapın',
            'error',
          );
        }
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessible={true}
            accessibilityLabel="Geri dön"
            accessibilityRole="button"
            accessibilityHint="Önceki ekrana döner"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Giriş Yap</Text>
          <View style={styles.placeholder} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title} {...a11y.header('Tekrar Hoşgeldiniz')}>
              Tekrar Hoşgeldiniz
            </Text>
            <Text
              style={styles.subtitle}
              accessible={true}
              accessibilityLabel="Devam etmek için giriş yapın"
            >
              Devam etmek için giriş yapın
            </Text>

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
                    placeholderTextColor={COLORS.text.secondary}
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
                    placeholderTextColor={COLORS.text.secondary}
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
              accessible={true}
              accessibilityLabel="Şifremi unuttum"
              accessibilityRole="link"
              accessibilityHint="Şifre sıfırlama sayfasına yönlendirir"
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

            {biometricAvailable && biometricEnabled && hasCredentials && (
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
                    <ActivityIndicator
                      size="small"
                      color={COLORS.brand.primary}
                    />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="fingerprint"
                        size={32}
                        color={COLORS.brand.primary}
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
              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                accessible={true}
                accessibilityLabel="Kayıt ol"
                accessibilityRole="link"
                accessibilityHint="Yeni hesap oluşturma sayfasına yönlendirir"
              >
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
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...TYPE_SCALE.display.h4,
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    ...TYPE_SCALE.display.h1,
    marginBottom: 10,
    color: COLORS.text.primary,
  },
  subtitle: {
    ...TYPE_SCALE.body.base,
    color: COLORS.text.secondary,
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 16,
    ...TYPE_SCALE.body.base,
    color: COLORS.text.primary,
    backgroundColor: COLORS.surface.base,
  },
  inputError: {
    borderColor: COLORS.feedback.error,
  },
  errorText: {
    ...TYPE_SCALE.body.caption,
    color: COLORS.feedback.error,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.brand.primary,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...TYPE_SCALE.button.base,
    color: COLORS.utility.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border.default,
  },
  dividerText: {
    ...TYPE_SCALE.body.small,
    marginHorizontal: 16,
    color: COLORS.text.secondary,
  },
  biometricButton: {
    width: '100%',
    height: 60,
    borderWidth: 1.5,
    borderColor: COLORS.brand.primary,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  biometricButtonText: {
    ...TYPE_SCALE.button.base,
    color: COLORS.brand.primary,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    marginTop: -8,
  },
  forgotPasswordText: {
    ...TYPE_SCALE.body.small,
    color: COLORS.brand.primary,
    fontWeight: '500',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signUpText: {
    ...TYPE_SCALE.body.small,
    color: COLORS.text.secondary,
  },
  signUpLink: {
    ...TYPE_SCALE.body.small,
    color: COLORS.brand.primary,
    fontWeight: '600',
  },
});

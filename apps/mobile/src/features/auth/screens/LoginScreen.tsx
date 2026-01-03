import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '@/navigation/routeParams';
import { useAuth } from '@/context/AuthContext';
import { useBiometric } from '@/context/BiometricAuthContext';
import { useAccessibility } from '@/hooks/useAccessibility';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import { loginSchema, type LoginInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import type { MinimalFormState } from '@/utils/forms/helpers';
import { useToast } from '@/context/ToastContext';
import { ControlledInput } from '@/components/ui/ControlledInput';
import { TMButton } from '@/components/ui/TMButton';
import { COLORS } from '@/constants/colors';
import { TYPE_SCALE, FONTS } from '@/constants/typography';

/**
 * Awwwards standardında Giriş Ekranı.
 * Odak: Minimalist form yapısı, ipeksi geçişler ve neon aksiyon vurgusu.
 * Liquid Glass design with silky transitions.
 */
export const LoginScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
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
        showToast('Biyometrik giriş için önce şifrenizle giriş yapın', 'info');
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

  const canSubmit = canSubmitForm({ formState } as {
    formState: MinimalFormState;
  });

  return (
    <ScreenErrorBoundary>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 16 }]}
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

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: insets.top + 60 },
            ]}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.title} {...a11y.header('Tekrar Hoş Geldin')}>
                Tekrar Hoş Geldin
              </Text>
              <Text
                style={styles.subtitle}
                accessible={true}
                accessibilityLabel="İpeksi anlara kaldığın yerden devam et"
              >
                İpeksi anlara kaldığın yerden devam et.
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Email Input */}
              <ControlledInput<LoginInput>
                name="email"
                control={control}
                label="E-POSTA ADRESİ"
                placeholder="ornek@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
                testID="email-input"
                showSuccess={true}
              />

              {/* Password Input */}
              <View style={{ marginTop: 24 }}>
                <ControlledInput<LoginInput>
                  name="password"
                  control={control}
                  label="ŞİFRE"
                  placeholder="••••••••"
                  isPassword={true}
                  editable={!isLoading}
                  testID="password-input"
                  showSuccess={true}
                />
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={styles.forgotButton}
                onPress={() => navigation.navigate('ForgotPassword')}
                accessible={true}
                accessibilityLabel="Şifremi unuttum"
                accessibilityRole="link"
                accessibilityHint="Şifre sıfırlama sayfasına yönlendirir"
              >
                <Text style={styles.forgotText}>Şifremi Unuttum</Text>
              </TouchableOpacity>
            </View>

            {/* Action Section */}
            <View style={styles.actionSection}>
              {/* Login Button */}
              <TMButton
                variant="primary"
                size="xl"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={!canSubmit}
                fullWidth
                testID="login-button"
              >
                {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </TMButton>

              {/* Biometric Login */}
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
                    <GlassCard
                      intensity={20}
                      style={styles.biometricButtonInner}
                      padding={16}
                      showBorder={true}
                    >
                      <MaterialCommunityIcons
                        name="fingerprint"
                        size={32}
                        color={COLORS.brand.primary}
                        accessible={false}
                      />
                      <Text style={styles.biometricButtonText}>
                        {isBiometricLoading
                          ? 'Doğrulanıyor...'
                          : `${biometricTypeName} ile giriş yap`}
                      </Text>
                    </GlassCard>
                  </TouchableOpacity>
                </>
              )}

              {/* Sign Up Link */}
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Henüz hesabın yok mu?</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}
                  accessible={true}
                  accessibilityLabel="Kayıt ol"
                  accessibilityRole="link"
                  accessibilityHint="Yeni hesap oluşturma sayfasına yönlendirir"
                >
                  <Text style={styles.signupText}>Kayıt Ol</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  backButton: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
    padding: 8,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 48,
  },
  title: {
    fontSize: 40,
    fontFamily: FONTS.display.black,
    fontWeight: '900',
    color: COLORS.text.primary,
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: FONTS.body.regular,
    color: COLORS.text.secondary,
    marginTop: 12,
    lineHeight: 26,
  },
  formSection: {
    marginBottom: 40,
  },
  label: {
    fontSize: 10,
    fontFamily: FONTS.mono.medium,
    color: COLORS.text.muted,
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  inputWrapperError: {
    borderColor: COLORS.feedback.error,
  },
  input: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontFamily: FONTS.body.regular,
    padding: 16,
  },
  errorText: {
    ...TYPE_SCALE.body.caption,
    color: COLORS.feedback.error,
    marginTop: 8,
    marginLeft: 4,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 16,
    padding: 4,
  },
  forgotText: {
    color: COLORS.text.muted,
    fontSize: 14,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
  },
  actionSection: {
    marginTop: 'auto',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border.light,
  },
  dividerText: {
    ...TYPE_SCALE.body.small,
    marginHorizontal: 16,
    color: COLORS.text.muted,
  },
  biometricButton: {
    width: '100%',
  },
  biometricButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.brand.primary,
  },
  biometricButtonText: {
    ...TYPE_SCALE.button.base,
    color: COLORS.brand.primary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 8,
  },
  footerText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontFamily: FONTS.body.regular,
  },
  signupText: {
    color: COLORS.brand.primary,
    fontSize: 14,
    fontFamily: FONTS.body.bold,
    fontWeight: '700',
  },
});

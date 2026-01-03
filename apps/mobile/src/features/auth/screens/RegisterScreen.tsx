import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { COLORS } from '@/constants/colors';
import { FONTS, TYPE_SCALE } from '@/constants/typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { TMButton } from '@/components/ui/TMButton';

/**
 * Awwwards standardında Kayıt Ekranı - "Liquid Register Screen"
 * Prestijli Katılım: Kullanıcının "The Guest List"e dahil olduğu hissini veren
 * ferah bir tasarım.
 *
 * Odak: Prestij, veri güvenliği vurgusu ve pürüzsüz form akışı.
 */
export const RegisterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = () => {
    if (!name.trim() || name.trim().length < 2) return false;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    if (!password || password.length < 8) return false;
    return true;
  };

  const handleRegister = async () => {
    if (!isFormValid()) return;

    try {
      setIsLoading(true);
      const result = await register({
        email: email.toLowerCase(),
        password,
        name: name.trim(),
      });

      if (result.success) {
        showToast('Hesap oluşturuldu!', 'success');
        navigation.reset({ index: 0, routes: [{ name: 'Discover' }] });
      } else {
        showToast(result.error || 'Kayıt başarısız. Lütfen tekrar deneyin.', 'error');
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Kayıt başarısız. Lütfen tekrar deneyin.',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.backButton, { top: insets.top + 10 }]}
        accessible={true}
        accessibilityLabel="Geri dön"
        accessibilityRole="button"
        accessibilityHint="Önceki ekrana döner"
      >
        <Ionicons name="chevron-back" size={28} color={COLORS.text.primary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 80 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerSection}>
            <Text style={styles.title}>Aramıza Katıl</Text>
            <Text style={styles.subtitle}>
              Sıradışı bir topluluğun parçası olmak için ilk adımı at.
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>AD SOYAD</Text>
            <GlassCard intensity={10} style={styles.inputWrapper} padding={0} showBorder={true}>
              <TextInput
                style={styles.input}
                placeholder="Caner Öz"
                placeholderTextColor={COLORS.text.muted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
                accessible={true}
                accessibilityLabel="Ad Soyad"
                accessibilityHint="Adınızı ve soyadınızı girin"
              />
            </GlassCard>

            <Text style={[styles.label, { marginTop: 24 }]}>E-POSTA</Text>
            <GlassCard intensity={10} style={styles.inputWrapper} padding={0} showBorder={true}>
              <TextInput
                style={styles.input}
                placeholder="caner@travelmatch.io"
                placeholderTextColor={COLORS.text.muted}
                value={email}
                onChangeText={(text) => setEmail(text.toLowerCase())}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                accessible={true}
                accessibilityLabel="E-posta adresi"
                accessibilityHint="E-posta adresinizi girin"
              />
            </GlassCard>

            <Text style={[styles.label, { marginTop: 24 }]}>ŞİFRE BELİRLE</Text>
            <GlassCard intensity={10} style={styles.inputWrapper} padding={0} showBorder={true}>
              <TextInput
                style={styles.input}
                placeholder="En az 8 karakter"
                placeholderTextColor={COLORS.text.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                accessible={true}
                accessibilityLabel="Şifre"
                accessibilityHint="En az 8 karakterli bir şifre belirleyin"
              />
            </GlassCard>
          </View>

          <View style={styles.policySection}>
            <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.brand.accent} />
            <Text style={styles.policyText}>
              Hesap oluşturarak Kullanım Koşullarını ve KVKK metnini kabul etmiş olursun.
            </Text>
          </View>

          <View style={styles.actionSection}>
            <TMButton
              variant="primary"
              onPress={handleRegister}
              size="lg"
              disabled={!isFormValid() || isLoading}
              fullWidth
              style={styles.registerButton}
            >
              {isLoading ? 'Oluşturuluyor...' : 'Hesabımı Oluştur'}
            </TMButton>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Zaten hesabın var mı? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              accessible={true}
              accessibilityLabel="Giriş yap"
              accessibilityRole="link"
              accessibilityHint="Giriş ekranına yönlendirir"
            >
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontFamily: FONTS.display.black,
    fontWeight: '900',
    color: COLORS.text.primary,
  },
  subtitle: {
    ...TYPE_SCALE.body.base,
    color: COLORS.text.secondary,
    marginTop: 12,
    lineHeight: 24,
  },
  formSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 10,
    fontFamily: FONTS.mono.regular,
    color: COLORS.text.muted,
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  inputWrapper: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  input: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontFamily: FONTS.body.regular,
    padding: 16,
  },
  policySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  policyText: {
    flex: 1,
    ...TYPE_SCALE.body.caption,
    color: COLORS.text.muted,
    lineHeight: 18,
  },
  actionSection: {
    marginBottom: 20,
  },
  registerButton: {
    height: 64,
    borderRadius: 32,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginText: {
    ...TYPE_SCALE.body.small,
    color: COLORS.text.secondary,
  },
  loginLink: {
    ...TYPE_SCALE.body.small,
    color: COLORS.brand.primary,
    fontWeight: '600',
  },
});

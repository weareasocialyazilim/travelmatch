import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SocialButton from '../components/SocialButton';
import { COLORS, CARD_SHADOW } from '../constants/colors';
import { VALUES } from '../constants/values';
import { STRINGS } from '../constants/strings';
import { LAYOUT } from '../constants/layout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const WelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Mock social login flow: treat as new signup and go to complete profile
    navigation.navigate('CompleteProfile');
  };

  const handlePhoneLogin = () => {
    navigation.navigate('PhoneAuth');
  };

  const handleEmailLogin = () => {
    navigation.navigate('EmailAuth');
  };

  const handleSkipLogin = () => {
    navigation.navigate('Home');
  };

    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Modern Card */}
          <View style={styles.cardContainer}>
            <View style={styles.cardInner}>
              <View style={styles.headerRow}>
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <View style={styles.headerTextBlock}>
                  <Text style={styles.title}>TravelMatch</Text>
                  <Text style={styles.subtitle}>Give from the heart — verify with trust</Text>
                </View>
              </View>

              {/* Social Login Buttons */}
              <View style={styles.loginContainer}>
                <SocialButton
                  provider="google"
                  label="Continue with Google"
                  onPress={() => handleSocialLogin('google')}
                />

                <SocialButton
                  provider="apple"
                  label="Continue with Apple"
                  onPress={() => handleSocialLogin('apple')}
                />

                <SocialButton
                  provider="facebook"
                  label="Continue with Facebook"
                  onPress={() => handleSocialLogin('facebook')}
                />

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Phone & Email Login */}
                <SocialButton
                  provider="phone"
                  label="Continue with Phone"
                  onPress={handlePhoneLogin}
                />

                <SocialButton
                  provider="email"
                  label="Continue with Email"
                  onPress={handleEmailLogin}
                />

                {/* Skip Login */}
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={handleSkipLogin}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.coral]}
                    style={styles.ctaGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.ctaButtonText}>Üye olmadan devam et</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Terms & Privacy */}
                <Text style={styles.termsText}>
                  By continuing, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
    backgroundColor: COLORS.background,
    paddingVertical: LAYOUT.padding * 4,
  },
  cardContainer: {
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: VALUES.borderRadius * 2,
    overflow: 'hidden',
    ...CARD_SHADOW,
    backgroundColor: COLORS.cardBackground,
    marginVertical: LAYOUT.padding * 2,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    padding: LAYOUT.padding * 3,
    borderRadius: VALUES.borderRadius * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInner: {
    padding: LAYOUT.padding * 3,
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: LAYOUT.spacing.lg,
    width: '100%',
    gap: 16,
  },
  headerTextBlock: {
    flex: 1,
    marginLeft: LAYOUT.padding * 2,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 0,
    marginRight: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
    marginTop: 0,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    opacity: 0.95,
    textAlign: 'left',
    marginBottom: LAYOUT.spacing.md,
  },
  loginContainer: {
    width: '100%',
    marginTop: LAYOUT.spacing.lg,
    marginBottom: LAYOUT.spacing.lg,
    alignItems: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingVertical: LAYOUT.spacing.md,
    borderRadius: VALUES.borderRadius,
    marginBottom: 10,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appleButton: {
    backgroundColor: COLORS.text,
  },
  facebookButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIcon: {
    backgroundColor: COLORS.white,
  },
  appleIcon: {
    backgroundColor: COLORS.white,
  },
  facebookIcon: {
    backgroundColor: COLORS.info,
  },
  appleButtonText: {
    color: COLORS.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: LAYOUT.spacing.md,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
    opacity: 0.3,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginHorizontal: 10,
    opacity: 0.7,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingVertical: LAYOUT.spacing.md,
    borderRadius: VALUES.borderRadius,
    backgroundColor: COLORS.primary,
    marginBottom: 10,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingVertical: LAYOUT.spacing.md,
    borderRadius: VALUES.borderRadius,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: 10,
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 12,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.padding * 1.2,
    marginTop: 10,
    width: '100%',
  },
  skipButtonGradient: {
    width: '100%',
    paddingVertical: LAYOUT.padding * 1.2,
    borderRadius: VALUES.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    opacity: 1,
    textDecorationLine: 'none',
    letterSpacing: 0.5,
  },
  termsText: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.8,
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  /* new CTA styles */
  ctaButton: {
    width: '100%',
    marginTop: LAYOUT.spacing.lg,
  },
  ctaGradient: {
    width: '100%',
    paddingVertical: LAYOUT.padding * 1.6,
    alignItems: 'center',
    borderRadius: VALUES.borderRadius * 1.6,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});

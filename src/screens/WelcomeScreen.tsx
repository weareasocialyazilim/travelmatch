import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import SocialButton from '../components/SocialButton';
import { CARD_SHADOW, COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { VALUES } from '../constants/values';

export const WelcomeScreen: React.FC<{
  navigation: { navigate: (route: string) => void };
}> = ({ navigation }) => {
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
                <Text style={styles.subtitle}>
                  Give from the heart — verify with trust
                </Text>
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
  cardContainer: {
    ...CARD_SHADOW,
    alignSelf: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: VALUES.borderRadius * 2,
    elevation: 6,
    marginVertical: LAYOUT.padding * 2,
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: COLORS.shadowColor,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    width: '90%',
  },
  cardInner: {
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    padding: LAYOUT.padding * 3,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  ctaButton: {
    marginTop: LAYOUT.spacing.lg,
    width: '100%',
  },
  ctaButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  ctaGradient: {
    alignItems: 'center',
    borderRadius: VALUES.borderRadius * 1.6,
    paddingVertical: LAYOUT.padding * 1.6,
    width: '100%',
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: LAYOUT.spacing.md,
    width: '100%',
  },
  dividerLine: {
    backgroundColor: COLORS.border,
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  dividerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 10,
    opacity: 0.7,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'flex-start',
    marginBottom: LAYOUT.spacing.lg,
    width: '100%',
  },
  headerTextBlock: {
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'center',
    marginLeft: LAYOUT.padding * 2,
  },
  loginContainer: {
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.lg,
    marginTop: LAYOUT.spacing.lg,
    width: '100%',
  },
  logo: {
    height: 64,
    marginBottom: 0,
    marginRight: 0,
    width: 64,
  },
  scrollContent: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: '100%',
    paddingVertical: LAYOUT.padding * 4,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: LAYOUT.spacing.md,
    opacity: 0.95,
    textAlign: 'left',
  },
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  termsText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    marginTop: 10,
    opacity: 0.8,
    textAlign: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    marginTop: 0,
  },
});

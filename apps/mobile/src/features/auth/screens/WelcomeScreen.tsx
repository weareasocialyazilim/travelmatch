import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { logger } from '@/utils/logger';

const { height: _SCREEN_HEIGHT } = Dimensions.get('window');

export const WelcomeScreen: React.FC<{
  navigation: { navigate: (route: string) => void };
}> = ({ navigation }) => {
  const handleCreateAccount = () => {
    navigation.navigate('Register');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleTermsPress = () => {
    navigation.navigate('TermsOfService');
  };

  const handlePrivacyPress = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleAppleSignIn = () => {
    logger.debug('[Auth] Apple sign in initiated from Welcome screen');
    // TODO: Implement Apple Sign In with Supabase
    navigation.navigate('Register');
  };

  const handleGoogleSignIn = () => {
    logger.debug('[Auth] Google sign in initiated from Welcome screen');
    // TODO: Implement Google Sign In with Supabase
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.main}>
        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../../../../assets/icon.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Headline & Body Text */}
          <View style={styles.textSection}>
            <Text style={styles.headline}>Welcome to TravelMatch</Text>
            <Text style={styles.bodyText}>
              Connect with locals. Share experiences.{'\n'}Make every trip
              meaningful.
            </Text>
          </View>
        </View>

        {/* Action Section */}
        <View style={styles.actionSection}>
          <View style={styles.buttonContainer}>
            {/* Apple Sign In */}
            <TouchableOpacity
              style={[styles.socialButton, styles.appleButton]}
              onPress={handleAppleSignIn}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Apple ile devam et"
            >
              <View style={styles.socialButtonContent}>
                <MaterialCommunityIcons
                  name="apple"
                  size={24}
                  color={COLORS.white}
                />
                <Text style={styles.socialButtonText}>Apple ile devam et</Text>
              </View>
            </TouchableOpacity>

            {/* Google Sign In */}
            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Google ile devam et"
            >
              <View style={styles.socialButtonContent}>
                <MaterialCommunityIcons
                  name="google"
                  size={24}
                  color={COLORS.white}
                />
                <Text style={styles.socialButtonText}>Google ile devam et</Text>
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCreateAccount}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Hesap oluştur"
            >
              <Text style={styles.primaryButtonText}>Hesap oluştur</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleLogin}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Giriş yap"
            >
              <Text style={styles.secondaryButtonText}>Giriş yap</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink} onPress={handleTermsPress}>
              Terms
            </Text>
            {' & '}
            <Text style={styles.footerLink} onPress={handlePrivacyPress}>
              Privacy
            </Text>
            .
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  main: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  contentSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  textSection: {
    width: '100%',
    alignItems: 'center',
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  bodyText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionSection: {
    width: '100%',
    paddingTop: 32,
    paddingBottom: 16,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  socialButton: {
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  socialButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    backgroundColor: COLORS.apple,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
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
  primaryButton: {
    backgroundColor: COLORS.mint,
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.25,
  },
  secondaryButton: {
    backgroundColor: COLORS.transparent,
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: COLORS.mint,
  },
  secondaryButtonText: {
    color: COLORS.mint,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.25,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingTop: 16,
  },
  footerLink: {
    textDecorationLine: 'underline',
  },
});

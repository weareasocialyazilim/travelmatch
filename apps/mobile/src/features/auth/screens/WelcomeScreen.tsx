import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS } from '@/constants/colors';
import { useToast } from '@/context/ToastContext';

export const WelcomeScreen: React.FC<{
  navigation: { navigate: (route: string) => void };
}> = ({ navigation }) => {
  const { showToast } = useToast();

  const handleCreateAccount = () => {
    navigation.navigate('Register');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSocialLogin = (_provider: string) => {
    showToast('Coming Soon! This feature will be available shortly.', 'info');
  };

  const handleTermsPress = () => {
    navigation.navigate('TermsOfService');
  };

  const handlePrivacyPress = () => {
    navigation.navigate('PrivacyPolicy');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.main}>
        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              source={require('../../../../assets/icon.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Headline & Body Text */}
          <View style={styles.textSection}>
            <Text style={styles.headline}>Welcome to TravelMatch</Text>
            <Text style={styles.bodyText}>
              Connect with locals. Share experiences.
            </Text>
          </View>
        </View>

        {/* Action Section */}
        <View style={styles.actionSection}>
          {/* Social Login Icons - Row */}
          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialIconButton}
              onPress={() => handleSocialLogin('apple')}
              activeOpacity={0.7}
            >
              <Icon name="apple" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialIconButton, styles.googleButton]}
              onPress={() => handleSocialLogin('google')}
              activeOpacity={0.7}
            >
              <Icon name="google" size={28} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.socialIconButton, styles.facebookButton]}
              onPress={() => handleSocialLogin('facebook')}
              activeOpacity={0.7}
            >
              <Icon name="facebook" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Main Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCreateAccount}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Create an account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Log in</Text>
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
    maxWidth: 280,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
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
    paddingBottom: 16,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  socialIconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
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
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
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
    fontWeight: '600',
  },
  footerText: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLink: {
    textDecorationLine: 'underline',
  },
});

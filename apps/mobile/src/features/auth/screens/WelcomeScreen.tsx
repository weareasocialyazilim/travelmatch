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
import { COLORS } from '@/constants/colors';

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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.main}>
        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
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
            {/* Apple Sign In (Mock) */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: '#000000', marginBottom: 12 },
              ]}
              onPress={() => navigation.navigate('Register')} // Mock action
              activeOpacity={0.8}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Use text icon for now as we don't have Apple icon asset guaranteed */}
                <Text style={[styles.primaryButtonText, { marginRight: 8 }]}>
                  
                </Text>
                <Text style={styles.primaryButtonText}>
                  Continue with Apple
                </Text>
              </View>
            </TouchableOpacity>

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
    gap: 16,
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

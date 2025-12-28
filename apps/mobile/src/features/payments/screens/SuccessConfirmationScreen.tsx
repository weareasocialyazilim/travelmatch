import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

export const SuccessConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleStartOnboarding = () => {
    // Navigate to CompleteProfile or first onboarding step
    navigation.navigate('CompleteProfile', {});
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Main Content */}
      <View style={styles.main}>
        <View style={styles.content}>
          {/* Hero Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlF2IY63pEHHaekuT7LbIXWcTVjWSmlkPxb2tkNSq3Qm6n9vZHRNC5LU_CfC0mmyaLrOW1UGMmz4ovSzGDbJGQ1yAAKpJ9eWpaJfZD5NN3KBSprvX4_kSTcIclkPVnEcDw0zlOVz1dtDShM6CJLs2XSY2rFKQIvtMz-jzpbn4fCKybX4lPU1JWQCWuy6PysRctLIT5KUMvdPfO7Ff2MDYjPAKnR8fEZ3w-DgkfISTtoRUr3esAbpFfLrYtbismq8wK3dfdmzKCNmQS',
              }}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Text Block */}
          <View style={styles.textBlock}>
            <Text style={styles.headline}>You&apos;re in!</Text>
            <Text style={styles.body}>
              Let&apos;s personalize your TravelMatch journey.
            </Text>
          </View>
        </View>
      </View>

      {/* Sticky Footer with CTA Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleStartOnboarding}
        >
          <Text style={styles.ctaButtonText}>Start onboarding</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    width: 192,
    height: 192,
    marginBottom: 32,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  textBlock: {
    alignItems: 'center',
    gap: 8,
  },
  headline: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  body: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '400',
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 16,
    backgroundColor: `${COLORS.bg.primary}CC`, // 80% opacity
  },
  ctaButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 512,
    alignSelf: 'center',
    width: '100%',
  },
  ctaButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.bg.primary,
    letterSpacing: 0.24,
  },
});

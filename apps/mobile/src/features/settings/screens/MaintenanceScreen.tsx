import React from 'react';
import { View, Text, Image as _Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';

export const MaintenanceScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <MaterialCommunityIcons
            name="hammer-wrench"
            size={120}
            color={COLORS.primary}
          />
        </View>

        {/* Text Block */}
        <View style={styles.textBlock}>
          <Text style={styles.headline}>We&apos;ll be back soon</Text>
          <Text style={styles.body}>
            Our team is making things even better for your next travel
            adventure.
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  illustrationContainer: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 1,
    marginBottom: 24,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  textBlock: {
    alignItems: 'center',
    gap: 8,
    maxWidth: 336,
  },
  headline: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  body: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

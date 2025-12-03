import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../constants/colors';

export const MaintenanceScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCalu2-rIyVHbcA-s4tk41DdvDP88QWpT4OYdktVBo33e92eWDyyk0Ue-t8jJm-Lsg1O5pkg9HtiNCbiphgKxQ_kem8qIFpmNq17iX_lreodMRBxZSdEqLq7ofEGl-FX5GejWLqsjVC7ChJPkIiXLGQohdrxEDtHbq-xxxBRY7htYVDdFplk18-wb_0QC1xiVsA0BPRGxI_BrgzsI0JbgG29ZHOF5cqv-3G4RGwq4OAVVLJzmtHmh2ol3uMa3UOvLci4YY46a7nInS2',
            }}
            style={styles.illustration}
            resizeMode="contain"
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
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

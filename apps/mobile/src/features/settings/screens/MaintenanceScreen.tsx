import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export const MaintenanceScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="cone"
        size={80}
        color="#FFD700"
        style={styles.icon}
      />
      <Text style={styles.title}>Under Construction</Text>
      <Text style={styles.desc}>
        We are currently upgrading the vibe engine. TravelMatch will be back
        shortly with new features.
      </Text>
      <Text style={styles.retry}>Please check back later.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  desc: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 40,
  },
  retry: {
    color: COLORS.brand.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

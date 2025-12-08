import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TwoFactorSetupScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Two-Factor Authentication</Text>
      <Text style={styles.subtitle}>Set up 2FA for extra security</Text>
      {/* TODO: Implement 2FA setup */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

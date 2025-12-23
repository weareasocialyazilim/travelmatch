import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const WaitingForCodeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Waiting for Code</Text>
      <Text style={styles.subtitle}>Check your phone for the verification code</Text>
      {/* TODO: Implement waiting/loading UI */}
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

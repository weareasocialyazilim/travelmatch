import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const EmailAuthScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Authentication</Text>
      <Text style={styles.subtitle}>Enter your email to continue</Text>
      {/* TODO: Implement email authentication UI */}
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

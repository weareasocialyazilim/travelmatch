/**
 * Onboarding Container
 * Handles conditional rendering of onboarding flow
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { useUIStore } from '../stores/uiStore';

interface OnboardingContainerProps {
  children: React.ReactNode;
}

export const OnboardingContainer: React.FC<OnboardingContainerProps> = ({
  children,
}) => {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const isOnboardingCompleted = useUIStore(
    (state) => state.isOnboardingCompleted,
  );

  useEffect(() => {
    // Simulate checking async storage
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isOnboardingCompleted) {
    return <OnboardingScreen />;
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

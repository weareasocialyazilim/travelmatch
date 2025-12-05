import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@has_seen_onboarding';

export const useOnboarding = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      setHasSeenOnboarding(value === 'true');
    } catch (error) {
      logger.debug('Error checking onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
      logger.debug('Error saving onboarding status:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      setHasSeenOnboarding(false);
    } catch (error) {
      logger.debug('Error resetting onboarding status:', error);
    }
  };

  return {
    isLoading,
    hasSeenOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
};

export default useOnboarding;

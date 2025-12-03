/**
 * Feedback Prompt Hook
 * Automatically trigger feedback modal based on user behavior
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analytics } from '../services/analytics';

interface FeedbackConditions {
  lastShown: number | null;
  sessionCount: number;
  momentsViewed: number;
  tripsBooked: number;
}

const FEEDBACK_KEYS = {
  LAST_SHOWN: '@feedback_last_shown',
  SESSION_COUNT: '@app_sessions_count',
  MOMENTS_VIEWED: '@moments_viewed_count',
  TRIPS_BOOKED: '@trips_booked_count',
};

const FEEDBACK_COOLDOWN = 7 * 24 * 60 * 60 * 1000; // 7 days
const TRIGGER_THRESHOLDS = {
  SESSIONS: 3,
  MOMENTS_VIEWED: 10,
  TRIPS_BOOKED: 1,
};

export const useFeedbackPrompt = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkFeedbackConditions();
  }, []);

  const checkFeedbackConditions = async () => {
    try {
      const [lastShown, sessions, moments, trips] = await Promise.all([
        AsyncStorage.getItem(FEEDBACK_KEYS.LAST_SHOWN),
        AsyncStorage.getItem(FEEDBACK_KEYS.SESSION_COUNT),
        AsyncStorage.getItem(FEEDBACK_KEYS.MOMENTS_VIEWED),
        AsyncStorage.getItem(FEEDBACK_KEYS.TRIPS_BOOKED),
      ]);

      const conditions: FeedbackConditions = {
        lastShown: lastShown ? parseInt(lastShown) : null,
        sessionCount: sessions ? parseInt(sessions) : 0,
        momentsViewed: moments ? parseInt(moments) : 0,
        tripsBooked: trips ? parseInt(trips) : 0,
      };

      const now = Date.now();

      // Check cooldown period
      if (
        conditions.lastShown &&
        now - conditions.lastShown < FEEDBACK_COOLDOWN
      ) {
        setLoading(false);
        return;
      }

      // Check trigger conditions
      const shouldShow =
        conditions.sessionCount >= TRIGGER_THRESHOLDS.SESSIONS ||
        conditions.momentsViewed >= TRIGGER_THRESHOLDS.MOMENTS_VIEWED ||
        conditions.tripsBooked >= TRIGGER_THRESHOLDS.TRIPS_BOOKED;

      if (shouldShow) {
        setShowFeedback(true);
        await AsyncStorage.setItem(FEEDBACK_KEYS.LAST_SHOWN, now.toString());

        // Track feedback prompt shown
        let triggerReason = 'unknown';
        if (conditions.sessionCount >= TRIGGER_THRESHOLDS.SESSIONS)
          triggerReason = 'sessions';
        else if (conditions.momentsViewed >= TRIGGER_THRESHOLDS.MOMENTS_VIEWED)
          triggerReason = 'moments_viewed';
        else if (conditions.tripsBooked >= TRIGGER_THRESHOLDS.TRIPS_BOOKED)
          triggerReason = 'booking';

        analytics.trackEvent('feedback_prompt_shown', {
          trigger_reason: triggerReason,
          sessions: conditions.sessionCount,
          moments_viewed: conditions.momentsViewed,
          trips_booked: conditions.tripsBooked,
        });
      }
    } catch (error) {
      console.error('[FeedbackPrompt] Error checking conditions:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementSessionCount = async () => {
    try {
      const current = await AsyncStorage.getItem(FEEDBACK_KEYS.SESSION_COUNT);
      const count = current ? parseInt(current) : 0;
      await AsyncStorage.setItem(
        FEEDBACK_KEYS.SESSION_COUNT,
        (count + 1).toString(),
      );
    } catch (error) {
      console.error('[FeedbackPrompt] Error incrementing session:', error);
    }
  };

  const incrementMomentsViewed = async () => {
    try {
      const current = await AsyncStorage.getItem(FEEDBACK_KEYS.MOMENTS_VIEWED);
      const count = current ? parseInt(current) : 0;
      await AsyncStorage.setItem(
        FEEDBACK_KEYS.MOMENTS_VIEWED,
        (count + 1).toString(),
      );
    } catch (error) {
      console.error('[FeedbackPrompt] Error incrementing moments:', error);
    }
  };

  const incrementTripsBooked = async () => {
    try {
      const current = await AsyncStorage.getItem(FEEDBACK_KEYS.TRIPS_BOOKED);
      const count = current ? parseInt(current) : 0;
      await AsyncStorage.setItem(
        FEEDBACK_KEYS.TRIPS_BOOKED,
        (count + 1).toString(),
      );
    } catch (error) {
      console.error('[FeedbackPrompt] Error incrementing trips:', error);
    }
  };

  const dismissFeedback = (reason?: 'completed' | 'dismissed') => {
    setShowFeedback(false);

    // Track dismissal
    if (reason === 'dismissed') {
      analytics.trackEvent('feedback_prompt_dismissed', {
        reason: 'user_closed',
      });
    }
  };

  return {
    showFeedback,
    loading,
    dismissFeedback,
    incrementSessionCount,
    incrementMomentsViewed,
    incrementTripsBooked,
  };
};

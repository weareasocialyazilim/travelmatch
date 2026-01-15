import { useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';
import {
  getItemWithLegacyFallback,
  setItemAndCleanupLegacy,
} from '../utils/storageKeyMigration';

const STORAGE_KEY = '@lovendo/feedback_prompt';
const LEGACY_STORAGE_KEYS = ['@lovendo/feedback_prompt'];
const SESSION_THRESHOLD = 5; // Show feedback after 5 sessions
const DAYS_BETWEEN_PROMPTS = 30; // Don't show again for 30 days after dismissal

interface FeedbackState {
  sessionCount: number;
  lastPromptDate: string | null;
  hasSubmittedFeedback: boolean;
}

const defaultState: FeedbackState = {
  sessionCount: 0,
  lastPromptDate: null,
  hasSubmittedFeedback: false,
};

export function useFeedbackPrompt() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [state, setState] = useState<FeedbackState>(defaultState);
  const stateRef = useRef<FeedbackState>(defaultState);
  const hasIncrementedRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Load state from storage on mount
  useEffect(() => {
    async function loadState() {
      try {
        const stored = await getItemWithLegacyFallback(
          STORAGE_KEY,
          LEGACY_STORAGE_KEYS,
        );
        if (stored) {
          setState(JSON.parse(stored));
        }
      } catch (error) {
        logger.error(
          'useFeedbackPrompt',
          'Failed to load feedback state',
          error,
        );
      }
    }
    void loadState();
  }, []);

  // Check if we should show feedback prompt
  const shouldShowFeedback = useCallback(
    (currentState: FeedbackState): boolean => {
      // Never show if already submitted feedback
      if (currentState.hasSubmittedFeedback) {
        return false;
      }

      // Check session threshold
      if (currentState.sessionCount < SESSION_THRESHOLD) {
        return false;
      }

      // Check if enough time has passed since last prompt
      if (currentState.lastPromptDate) {
        const lastPrompt = new Date(currentState.lastPromptDate);
        const daysSinceLastPrompt = Math.floor(
          (Date.now() - lastPrompt.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysSinceLastPrompt < DAYS_BETWEEN_PROMPTS) {
          return false;
        }
      }

      return true;
    },
    [],
  );

  // Increment session count - stable reference, only runs once per mount
  const incrementSessionCount = useCallback(async () => {
    // Prevent multiple increments
    if (hasIncrementedRef.current) {
      return;
    }
    hasIncrementedRef.current = true;

    try {
      const currentState = stateRef.current;
      const newState: FeedbackState = {
        ...currentState,
        sessionCount: currentState.sessionCount + 1,
      };

      await setItemAndCleanupLegacy(
        STORAGE_KEY,
        JSON.stringify(newState),
        LEGACY_STORAGE_KEYS,
      );
      setState(newState);

      // Check if we should show feedback
      if (shouldShowFeedback(newState)) {
        setShowFeedback(true);
      }

      logger.debug(
        'useFeedbackPrompt',
        `Session count: ${newState.sessionCount}`,
      );
    } catch (error) {
      logger.error(
        'useFeedbackPrompt',
        'Failed to increment session count',
        error,
      );
    }
  }, [shouldShowFeedback]);

  // Dismiss feedback prompt - stable callback using ref
  const dismissFeedback = useCallback(async () => {
    try {
      const currentState = stateRef.current;
      const newState: FeedbackState = {
        ...currentState,
        lastPromptDate: new Date().toISOString(),
      };

      await setItemAndCleanupLegacy(
        STORAGE_KEY,
        JSON.stringify(newState),
        LEGACY_STORAGE_KEYS,
      );
      setState(newState);
      setShowFeedback(false);

      logger.info('useFeedbackPrompt', 'Feedback prompt dismissed');
    } catch (error) {
      logger.error('useFeedbackPrompt', 'Failed to dismiss feedback', error);
      setShowFeedback(false);
    }
  }, []);

  // Mark feedback as submitted - stable callback using ref
  const markFeedbackSubmitted = useCallback(async () => {
    try {
      const currentState = stateRef.current;
      const newState: FeedbackState = {
        ...currentState,
        hasSubmittedFeedback: true,
        lastPromptDate: new Date().toISOString(),
      };

      await setItemAndCleanupLegacy(
        STORAGE_KEY,
        JSON.stringify(newState),
        LEGACY_STORAGE_KEYS,
      );
      setState(newState);
      setShowFeedback(false);

      logger.info('useFeedbackPrompt', 'Feedback submitted');
    } catch (error) {
      logger.error(
        'useFeedbackPrompt',
        'Failed to mark feedback as submitted',
        error,
      );
      setShowFeedback(false);
    }
  }, []);

  // Reset feedback state (for testing)
  const resetFeedbackState = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEY),
        ...LEGACY_STORAGE_KEYS.map((k) => AsyncStorage.removeItem(k)),
      ]);
      setState(defaultState);
      setShowFeedback(false);
      logger.info('useFeedbackPrompt', 'Feedback state reset');
    } catch (error) {
      logger.error(
        'useFeedbackPrompt',
        'Failed to reset feedback state',
        error,
      );
    }
  }, []);

  return {
    showFeedback,
    dismissFeedback,
    incrementSessionCount,
    markFeedbackSubmitted,
    resetFeedbackState,
    sessionCount: state.sessionCount,
  };
}

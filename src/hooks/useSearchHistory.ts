/**
 * Search History Hook
 * Manages search history with AsyncStorage persistence
 */
import { logger } from '../utils/logger';

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = '@search_history';
const MAX_HISTORY_ITEMS = 10;

export const useSearchHistory = () => {
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from storage
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      logger.error('Failed to load search history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save history to storage
  const saveHistory = async (newHistory: string[]) => {
    try {
      await AsyncStorage.setItem(
        SEARCH_HISTORY_KEY,
        JSON.stringify(newHistory),
      );
    } catch (error) {
      logger.error('Failed to save search history:', error);
    }
  };

  // Add search to history
  const addToHistory = useCallback(
    (query: string) => {
      if (!query.trim()) return;

      const newHistory = [
        query,
        ...history.filter((item) => item !== query),
      ].slice(0, MAX_HISTORY_ITEMS);

      setHistory(newHistory);
      saveHistory(newHistory);
    },
    [history],
  );

  // Remove from history
  const removeFromHistory = useCallback(
    (query: string) => {
      const newHistory = history.filter((item) => item !== query);
      setHistory(newHistory);
      saveHistory(newHistory);
    },
    [history],
  );

  // Clear all history
  const clearHistory = useCallback(async () => {
    setHistory([]);
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      logger.error('Failed to clear search history:', error);
    }
  }, []);

  return {
    history,
    isLoading,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
};

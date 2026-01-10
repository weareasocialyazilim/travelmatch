'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getPersonalizedSuggestions,
  getProfileTrustScore,
  type ExperienceInsight,
} from '@/lib/ml-client';

/**
 * Deneyim Asistanı Hook
 * ML önerilerini React bileşenlerine bağlar
 */
export function useExperienceAssistant(
  userId?: string,
  interests: string[] = [],
) {
  const [insights, setInsights] = useState<ExperienceInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getPersonalizedSuggestions(userId, interests);
      setInsights(data);
      setError(null);
    } catch {
      setError('Öneriler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [userId, interests]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    isLoading,
    error,
    refresh: fetchInsights,
  };
}

/**
 * Güvenilirlik Rozeti Hook
 */
export function useTrustScore(userId?: string) {
  const [score, setScore] = useState<number>(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    async function fetchTrustScore() {
      try {
        setIsLoading(true);
        const data = await getProfileTrustScore(userId as string);
        setScore(data.score);
        setBadges(data.badges);
        setMessage(data.message);
      } catch {
        // Varsayılan değerler kullan
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrustScore();
  }, [userId]);

  return {
    score,
    badges,
    message,
    isLoading,
  };
}

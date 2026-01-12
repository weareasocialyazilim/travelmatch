'use client';

import { useState, useCallback } from 'react';

/**
 * useNeuralMatch - Hook for Neural Match API integration
 *
 * Connects the Match Simulator to the real ML service
 */

export interface MatchRecommendation {
  id: string;
  name: string;
  score: number;
  commonInterests: string[];
  avatar: string;
  type: 'experience' | 'person' | 'moment';
}

export interface NeuralMatchResult {
  score: number;
  recommendations: MatchRecommendation[];
  neuralPath: 'ESTABLISHED' | 'PENDING' | 'CALIBRATING';
  vibe: 'speed' | 'romance' | 'luxury';
  timestamp: string;
}

interface UseNeuralMatchReturn {
  result: NeuralMatchResult | null;
  isLoading: boolean;
  error: string | null;
  analyze: (interests: string[], identityPulse?: number) => Promise<void>;
  reset: () => void;
}

export function useNeuralMatch(): UseNeuralMatchReturn {
  const [result, setResult] = useState<NeuralMatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(
    async (interests: string[], identityPulse: number = 50) => {
      if (interests.length === 0) {
        setError('Please select at least one interest');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/neural-match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interests, identityPulse }),
        });

        if (!response.ok) {
          throw new Error('Neural match request failed');
        }

        const data: NeuralMatchResult = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    result,
    isLoading,
    error,
    analyze,
    reset,
  };
}

export default useNeuralMatch;

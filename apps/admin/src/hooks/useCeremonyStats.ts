'use client';

import { useQuery } from '@tanstack/react-query';

export interface CeremonyStats {
  verifiedToday: number;
  verifiedChange: number;
  pendingReview: number;
  aiSuccessRate: number;
  aiSuccessChange: number;
  avgCeremonyTime: number;
}

// Mock data since proof_ceremonies table doesn't exist in the schema
const mockStats: CeremonyStats = {
  verifiedToday: 12,
  verifiedChange: 3,
  pendingReview: 5,
  aiSuccessRate: 87,
  aiSuccessChange: 2,
  avgCeremonyTime: 4,
};

export function useCeremonyStats() {
  return useQuery({
    queryKey: ['ceremony-stats'],
    queryFn: async (): Promise<CeremonyStats> => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockStats;
    },
    staleTime: 30000,
  });
}

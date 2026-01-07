'use client';

import { useQuery } from '@tanstack/react-query';
import { getClient } from '@/lib/supabase';

export interface CeremonyStats {
  verifiedToday: number;
  verifiedChange: number;
  pendingReview: number;
  aiSuccessRate: number;
  aiSuccessChange: number;
  avgCeremonyTime: number;
}

export function useCeremonyStats() {
  return useQuery({
    queryKey: ['ceremony-stats'],
    queryFn: async (): Promise<CeremonyStats> => {
      const supabase = getClient();
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split('T')[0];

      // Get verified count for today
      const { count: verifiedToday } = await supabase
        .from('proof_ceremonies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'verified')
        .gte('verified_at', today);

      // Get verified count for yesterday
      const { count: verifiedYesterday } = await supabase
        .from('proof_ceremonies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'verified')
        .gte('verified_at', yesterday)
        .lt('verified_at', today);

      // Get pending review count
      const { count: pendingReview } = await supabase
        .from('proof_ceremonies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_review');

      // Calculate AI success rate
      const { count: aiVerified } = await supabase
        .from('proof_ceremonies')
        .select('*', { count: 'exact', head: true })
        .eq('ai_verified', true);

      const { count: totalProcessed } = await supabase
        .from('proof_ceremonies')
        .select('*', { count: 'exact', head: true })
        .in('status', ['verified', 'rejected']);

      const aiSuccessRate =
        totalProcessed && totalProcessed > 0
          ? Math.round(((aiVerified || 0) / totalProcessed) * 100)
          : 0;

      return {
        verifiedToday: verifiedToday || 0,
        verifiedChange: (verifiedToday || 0) - (verifiedYesterday || 0),
        pendingReview: pendingReview || 0,
        aiSuccessRate,
        aiSuccessChange: 0, // Calculate from historical data
        avgCeremonyTime: 4, // Calculate from ceremony_logs if available
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

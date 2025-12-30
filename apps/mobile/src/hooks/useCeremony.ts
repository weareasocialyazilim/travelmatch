/**
 * useCeremony Hook
 *
 * State management hook for the Proof Ceremony flow.
 * Handles ceremony state, progress tracking, and API integration.
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import {
  type CeremonyStep,
  type SunsetPhase,
  type TrustMilestone,
  CEREMONY_STEP_ORDER,
  SUNSET_PHASE_THRESHOLDS,
  DEFAULT_MILESTONES,
} from '@/constants/ceremony';

interface Gift {
  id: string;
  escrowId: string;
  momentId: string;
  momentTitle: string;
  giverName: string;
  giverId: string;
  amount: number;
  currency: string;
  escrowUntil: Date;
  location?: string;
}

interface ProofData {
  id: string;
  photos: string[];
  location?: {
    lat: number;
    lng: number;
    name: string;
  };
  description?: string;
}

interface CeremonyState {
  step: CeremonyStep;
  gift: Gift | null;
  proofData: ProofData | null;
  isLoading: boolean;
  error: string | null;
  sunsetPhase: SunsetPhase;
  milestones: TrustMilestone[];
  thankYouCardSent: boolean;
  verificationStatus: 'pending' | 'analyzing' | 'verified' | 'rejected' | 'needs_review' | null;
}

interface UseCeremonyReturn {
  state: CeremonyState;
  // Actions
  startCeremony: (gift: Gift) => void;
  goToStep: (step: CeremonyStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  setProofData: (data: ProofData) => void;
  submitProof: () => Promise<boolean>;
  sendThankYouCard: (cardUrl: string) => Promise<boolean>;
  resetCeremony: () => void;
  // Computed
  currentStepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  timeRemaining: string;
}

const calculateSunsetPhase = (deadline: Date): SunsetPhase => {
  const now = new Date();
  const remaining = deadline.getTime() - now.getTime();
  const hours = remaining / (1000 * 60 * 60);

  if (hours <= 0) return 'expired';
  if (hours <= SUNSET_PHASE_THRESHOLDS.twilight) return 'twilight';
  if (hours <= SUNSET_PHASE_THRESHOLDS.urgent) return 'urgent';
  if (hours <= SUNSET_PHASE_THRESHOLDS.warning) return 'warning';
  if (hours <= SUNSET_PHASE_THRESHOLDS.golden) return 'golden';
  return 'peaceful';
};

const formatTimeRemaining = (deadline: Date): string => {
  const now = new Date();
  const remaining = deadline.getTime() - now.getTime();

  if (remaining <= 0) return 'Süre doldu';

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}g ${hours}s`;
  if (hours > 0) return `${hours}s ${minutes}dk`;
  return `${minutes}dk`;
};

const initialState: CeremonyState = {
  step: 'intro',
  gift: null,
  proofData: null,
  isLoading: false,
  error: null,
  sunsetPhase: 'peaceful',
  milestones: DEFAULT_MILESTONES,
  thankYouCardSent: false,
  verificationStatus: null,
};

export function useCeremony(): UseCeremonyReturn {
  const [state, setState] = useState<CeremonyState>(initialState);

  // Update sunset phase periodically
  useEffect(() => {
    if (!state.gift) return;

    const updatePhase = () => {
      const phase = calculateSunsetPhase(state.gift!.escrowUntil);
      setState((prev) => {
        if (prev.sunsetPhase !== phase) {
          // Haptic feedback on phase change
          if (phase === 'urgent' || phase === 'twilight') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
          return { ...prev, sunsetPhase: phase };
        }
        return prev;
      });
    };

    updatePhase();
    const interval = setInterval(updatePhase, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [state.gift?.escrowUntil]);

  // Fetch user milestones
  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.session.user.id)
          .single();

        if (profile) {
          // Map profile data to milestones
          const updatedMilestones = DEFAULT_MILESTONES.map((m) => {
            switch (m.type) {
              case 'email':
                return {
                  ...m,
                  verified: !!profile.email_verified,
                  verifiedAt: profile.email_verified_at,
                };
              case 'phone':
                return {
                  ...m,
                  verified: !!profile.phone_verified,
                  verifiedAt: profile.phone_verified_at,
                };
              case 'id':
                return {
                  ...m,
                  verified: !!profile.kyc_verified,
                  verifiedAt: profile.kyc_verified_at,
                };
              case 'bank':
                return {
                  ...m,
                  verified: !!profile.bank_connected,
                  verifiedAt: profile.bank_connected_at,
                };
              default:
                return m;
            }
          });

          setState((prev) => ({ ...prev, milestones: updatedMilestones }));
        }
      } catch (error) {
        console.error('Error fetching milestones:', error);
      }
    };

    fetchMilestones();
  }, []);

  // Actions
  const startCeremony = useCallback((gift: Gift) => {
    setState({
      ...initialState,
      gift,
      sunsetPhase: calculateSunsetPhase(gift.escrowUntil),
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const goToStep = useCallback((step: CeremonyStep) => {
    setState((prev) => ({ ...prev, step }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = CEREMONY_STEP_ORDER.indexOf(prev.step);
      if (currentIndex < CEREMONY_STEP_ORDER.length - 1) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return { ...prev, step: CEREMONY_STEP_ORDER[currentIndex + 1] };
      }
      return prev;
    });
  }, []);

  const previousStep = useCallback(() => {
    setState((prev) => {
      const currentIndex = CEREMONY_STEP_ORDER.indexOf(prev.step);
      if (currentIndex > 0) {
        return { ...prev, step: CEREMONY_STEP_ORDER[currentIndex - 1] };
      }
      return prev;
    });
  }, []);

  const setProofData = useCallback((data: ProofData) => {
    setState((prev) => ({ ...prev, proofData: data }));
  }, []);

  const submitProof = useCallback(async (): Promise<boolean> => {
    if (!state.gift || !state.proofData) return false;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Call verify-proof edge function
      const { data, error } = await supabase.functions.invoke('verify-proof', {
        body: {
          proofId: state.proofData.id,
          escrowId: state.gift.escrowId,
          momentId: state.gift.momentId,
          photos: state.proofData.photos,
          location: state.proofData.location,
        },
      });

      if (error) throw error;

      const status = data.verified
        ? 'verified'
        : data.needsReview
          ? 'needs_review'
          : 'rejected';

      setState((prev) => ({
        ...prev,
        isLoading: false,
        verificationStatus: status,
      }));

      if (status === 'verified') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      return status === 'verified';
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Proof submission failed',
      }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return false;
    }
  }, [state.gift, state.proofData]);

  const sendThankYouCard = useCallback(
    async (cardUrl: string): Promise<boolean> => {
      if (!state.gift) return false;

      try {
        // Send thank you card notification
        await supabase.from('notifications').insert({
          user_id: state.gift.giverId,
          type: 'thank_you_card',
          title: 'Teşekkür Kartı Aldınız!',
          body: `${state.gift.momentTitle} deneyimi için teşekkür kartı`,
          data: { cardUrl, giftId: state.gift.id },
        });

        setState((prev) => ({ ...prev, thankYouCardSent: true }));
        return true;
      } catch (error) {
        console.error('Error sending thank you card:', error);
        return false;
      }
    },
    [state.gift]
  );

  const resetCeremony = useCallback(() => {
    setState(initialState);
  }, []);

  // Computed values
  const currentStepIndex = CEREMONY_STEP_ORDER.indexOf(state.step);
  const totalSteps = CEREMONY_STEP_ORDER.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const timeRemaining = state.gift
    ? formatTimeRemaining(state.gift.escrowUntil)
    : '';

  return {
    state,
    startCeremony,
    goToStep,
    nextStep,
    previousStep,
    setProofData,
    submitProof,
    sendThankYouCard,
    resetCeremony,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    timeRemaining,
  };
}

export default useCeremony;

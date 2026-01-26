/**
 * useMessagingEligibility Hook
 *
 * Manages messaging eligibility state and guided first message flow.
 *
 * Messaging is an EARNED REWARD - it never opens automatically.
 * Users must meet specific thresholds before messaging becomes available.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_EDGE_URL } from '../services/supabase';
import { logger } from '../utils/logger';

export interface MessagingEligibility {
  state: 'closed' | 'pending' | 'eligible' | 'active' | 'suspended';
  eligibilityType?: string;
  criteria?: Record<string, any>;
}

export interface GuidedMessageState {
  phase: 'prompt' | 'response' | 'complete' | 'skipped';
  prompt?: {
    key: string;
    text: string;
    category: string;
  };
  canSkip: boolean;
  canSendFreeForm: boolean;
}

interface UseMessagingEligibilityReturn {
  // Eligibility state
  eligibility: MessagingEligibility | null;
  eligibilityLoading: boolean;
  isEligible: boolean;
  isActive: boolean;

  // Guided message state
  guidedState: GuidedMessageState | null;
  guidedLoading: boolean;

  // Actions
  checkEligibility: (conversationId: string) => Promise<boolean>;
  getPrompt: (conversationId: string) => Promise<void>;
  submitResponse: (
    conversationId: string,
    response: string,
  ) => Promise<boolean>;
  skipGuidedFlow: (conversationId: string) => Promise<boolean>;
  completeFirstMessage: (conversationId: string) => Promise<boolean>;

  // Utility
  getEligibilityReasons: () => string[];
}

export const useMessagingEligibility = (): UseMessagingEligibilityReturn => {
  const [eligibility, setEligibility] = useState<MessagingEligibility | null>(
    null,
  );
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const [guidedState, setGuidedState] = useState<GuidedMessageState | null>(
    null,
  );
  const [guidedLoading, setGuidedLoading] = useState(false);

  // Check if messaging is eligible for a conversation
  const checkEligibility = useCallback(
    async (conversationId: string): Promise<boolean> => {
      try {
        setEligibilityLoading(true);

        const { data, error } = await supabase
          .from('messaging_eligibility')
          .select('*')
          .eq('conversation_id', conversationId)
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (error || !data) {
          logger.warn('Failed to check eligibility:', error);
          setEligibility(null);
          return false;
        }

        const dataAny = data as any;
        const eligibilityData: MessagingEligibility = {
          state: dataAny.state || 'closed',
          eligibilityType: dataAny.eligibility_type,
          criteria: dataAny.eligibility_criteria,
        };

        setEligibility(eligibilityData);
        return dataAny.state === 'active';
      } catch (error) {
        logger.error('Error checking eligibility:', error);
        setEligibility(null);
        return false;
      } finally {
        setEligibilityLoading(false);
      }
    },
    [],
  );

  // Get guided first message prompt
  const getPrompt = useCallback(
    async (conversationId: string): Promise<void> => {
      try {
        setGuidedLoading(true);

        const response = await fetch(
          `${SUPABASE_EDGE_URL}/functions/v1/guided-first-message`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
            body: JSON.stringify({
              conversationId,
              action: 'get_prompt',
            }),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to get prompt');
        }

        const data = await response.json();

        if (data.success) {
          setGuidedState({
            phase: data.phase,
            prompt: data.prompt,
            canSkip: data.canSkip,
            canSendFreeForm: data.canSendFreeForm || data.phase === 'complete',
          });
        }
      } catch (error) {
        logger.error('Error getting guided prompt:', error);
        setGuidedState(null);
      } finally {
        setGuidedLoading(false);
      }
    },
    [],
  );

  // Submit response to guided prompt
  const submitResponse = useCallback(
    async (conversationId: string, response: string): Promise<boolean> => {
      try {
        setGuidedLoading(true);

        const apiResponse = await fetch(
          `${SUPABASE_EDGE_URL}/functions/v1/guided-first-message`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
            body: JSON.stringify({
              conversationId,
              action: 'submit_response',
              response,
            }),
          },
        );

        if (!apiResponse.ok) {
          const error = await apiResponse.json();
          throw new Error(error.error || 'Failed to submit response');
        }

        const data = await apiResponse.json();

        if (data.success) {
          setGuidedState({
            phase: data.phase,
            canSkip: true,
            canSendFreeForm: data.canSendFirstMessage,
          });
          return true;
        }

        return false;
      } catch (error) {
        logger.error('Error submitting response:', error);
        return false;
      } finally {
        setGuidedLoading(false);
      }
    },
    [],
  );

  // Skip guided flow
  const skipGuidedFlow = useCallback(
    async (conversationId: string): Promise<boolean> => {
      try {
        setGuidedLoading(true);

        const response = await fetch(
          `${SUPABASE_EDGE_URL}/functions/v1/guided-first-message`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
            body: JSON.stringify({
              conversationId,
              action: 'skip',
            }),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to skip');
        }

        const data = await response.json();

        if (data.success) {
          setGuidedState({
            phase: data.phase,
            canSkip: false,
            canSendFreeForm: data.canSendFreeForm,
          });
          return true;
        }

        return false;
      } catch (error) {
        logger.error('Error skipping guided flow:', error);
        return false;
      } finally {
        setGuidedLoading(false);
      }
    },
    [],
  );

  // Complete first message (called after sending first actual message)
  const completeFirstMessage = useCallback(
    async (conversationId: string): Promise<boolean> => {
      try {
        const response = await fetch(
          `${SUPABASE_EDGE_URL}/functions/v1/guided-first-message`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
            body: JSON.stringify({
              conversationId,
              action: 'complete',
            }),
          },
        );

        if (!response.ok) {
          return false;
        }

        const data = await response.json();

        if (data.success) {
          setGuidedState({
            phase: data.phase,
            canSkip: false,
            canSendFreeForm: data.canSendFreeForm,
          });
          return true;
        }

        return false;
      } catch (error) {
        logger.error('Error completing first message:', error);
        return false;
      }
    },
    [],
  );

  // Get human-readable reasons for eligibility
  const getEligibilityReasons = useCallback((): string[] => {
    if (!eligibility?.criteria) return [];

    const reasons: string[] = [];
    const criteria = eligibility.criteria;

    if (criteria.lvnd_spent?.meets) {
      reasons.push('LVND threshold met');
    }

    if (criteria.accepted_offer?.meets) {
      reasons.push('Offer accepted');
    }

    if (criteria.moment_unlock?.meets) {
      reasons.push('Moment shared');
    }

    if (criteria.mutual_approval?.meets) {
      reasons.push('Mutual approval received');
    }

    return reasons;
  }, [eligibility]);

  return {
    eligibility,
    eligibilityLoading,
    isEligible:
      eligibility?.state === 'eligible' || eligibility?.state === 'active',
    isActive: eligibility?.state === 'active',

    guidedState,
    guidedLoading,

    checkEligibility,
    getPrompt,
    submitResponse,
    skipGuidedFlow,
    completeFirstMessage,

    getEligibilityReasons,
  };
};

export default useMessagingEligibility;

/**
 * useComplianceCheck Hook
 *
 * React hook for compliance checks in components.
 * Provides easy-to-use interface for limit and AML checks.
 */

import { useState, useCallback } from 'react';
import {
  checkUserLimits,
  checkMomentContributionLimit,
  checkMomentCreationLimit,
  checkTransactionCompliance,
  formatLimitMessage,
  shouldPromptUpgrade,
  shouldPromptKyc,
  type LimitCheckResult,
  type ContributionLimitResult,
  type MomentCreationLimitResult,
  type ComplianceCheckResult,
} from '../services/complianceService';
import type { CurrencyCode } from '../constants/currencies';

interface UseComplianceCheckReturn {
  // States
  isChecking: boolean;
  error: string | null;

  // Send limit check
  checkSendLimit: (
    amount: number,
    currency?: CurrencyCode
  ) => Promise<{
    allowed: boolean;
    message: string;
    promptUpgrade: boolean;
    promptKyc: boolean;
    result: LimitCheckResult;
  }>;

  // Receive limit check
  checkReceiveLimit: (
    amount: number,
    currency?: CurrencyCode
  ) => Promise<{
    allowed: boolean;
    message: string;
    result: LimitCheckResult;
  }>;

  // Moment contribution check
  checkContribution: (
    momentId: string,
    amount: number
  ) => Promise<{
    allowed: boolean;
    message: string;
    remaining: number;
    result: ContributionLimitResult;
  }>;

  // Moment creation check
  checkCanCreateMoment: () => Promise<{
    allowed: boolean;
    message: string;
    dailyRemaining: number | null;
    monthlyRemaining: number | null;
    result: MomentCreationLimitResult;
  }>;

  // Full transaction compliance
  checkCompliance: (
    amount: number,
    currency: CurrencyCode,
    recipientId?: string
  ) => Promise<{
    allowed: boolean;
    riskLevel: string;
    warnings: string[];
    blockReasons: string[];
    result: ComplianceCheckResult;
  }>;
}

export const useComplianceCheck = (): UseComplianceCheckReturn => {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSendLimit = useCallback(
    async (amount: number, currency: CurrencyCode = 'TRY') => {
      setIsChecking(true);
      setError(null);

      try {
        const result = await checkUserLimits('send', amount, currency);

        return {
          allowed: result.allowed,
          message: formatLimitMessage(result),
          promptUpgrade: shouldPromptUpgrade(result),
          promptKyc: shouldPromptKyc(result),
          result,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Limit kontrolü başarısız';
        setError(message);
        throw err;
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  const checkReceiveLimit = useCallback(
    async (amount: number, currency: CurrencyCode = 'TRY') => {
      setIsChecking(true);
      setError(null);

      try {
        const result = await checkUserLimits('receive', amount, currency);

        return {
          allowed: result.allowed,
          message: formatLimitMessage(result),
          result,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Limit kontrolü başarısız';
        setError(message);
        throw err;
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  const checkContribution = useCallback(
    async (momentId: string, amount: number) => {
      setIsChecking(true);
      setError(null);

      try {
        const result = await checkMomentContributionLimit(momentId, amount);

        return {
          allowed: result.allowed,
          message: result.reason || '',
          remaining: result.remaining_amount || 0,
          result,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Katkı limiti kontrolü başarısız';
        setError(message);
        throw err;
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  const checkCanCreateMoment = useCallback(async () => {
    setIsChecking(true);
    setError(null);

    try {
      const result = await checkMomentCreationLimit();

      const dailyRemaining =
        result.daily_limit !== null
          ? result.daily_limit - result.daily_count
          : null;
      const monthlyRemaining =
        result.monthly_limit !== null
          ? result.monthly_limit - result.monthly_count
          : null;

      return {
        allowed: result.allowed,
        message: result.reason || '',
        dailyRemaining,
        monthlyRemaining,
        result,
      };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Moment oluşturma limiti kontrolü başarısız';
      setError(message);
      throw err;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const checkCompliance = useCallback(
    async (
      amount: number,
      currency: CurrencyCode,
      recipientId?: string
    ) => {
      setIsChecking(true);
      setError(null);

      try {
        const result = await checkTransactionCompliance(
          amount,
          currency,
          'send',
          recipientId
        );

        return {
          allowed: result.allowed,
          riskLevel: result.risk_level,
          warnings: result.warnings,
          blockReasons: result.block_reasons,
          result,
        };
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Uyumluluk kontrolü başarısız';
        setError(message);
        throw err;
      } finally {
        setIsChecking(false);
      }
    },
    []
  );

  return {
    isChecking,
    error,
    checkSendLimit,
    checkReceiveLimit,
    checkContribution,
    checkCanCreateMoment,
    checkCompliance,
  };
};

export default useComplianceCheck;

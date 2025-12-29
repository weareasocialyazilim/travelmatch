/**
 * useIdenfyVerification Hook
 *
 * React hook for iDenfy KYC verification integration.
 * This hook provides the interface for starting and tracking
 * identity verification flow.
 *
 * SETUP REQUIRED:
 * 1. Install iDenfy React Native SDK: npm install @idenfy/react-native-sdk
 * 2. Add API key to environment variables: IDENFY_API_KEY
 * 3. Configure native modules for iOS/Android
 *
 * Documentation: https://documentation.idenfy.com/mobile/react-native
 */

import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/services/supabase';
import { useAnalytics } from './useAnalytics';
import { logger } from '@/utils/production-logger';

// Types
export interface IdenfyVerificationResult {
  status: 'approved' | 'denied' | 'suspected' | 'expired' | 'cancelled';
  scanRef?: string;
  documentType?: string;
  documentCountry?: string;
  errorMessage?: string;
}

export interface IdenfyConfig {
  authToken: string;
  locale?: 'tr' | 'en';
  expiresAt?: string;
}

export interface UseIdenfyVerificationReturn {
  // States
  isLoading: boolean;
  isVerifying: boolean;
  verificationStatus: 'none' | 'pending' | 'approved' | 'denied' | 'expired';
  error: string | null;

  // Actions
  startVerification: () => Promise<void>;
  checkStatus: () => Promise<void>;
  getAuthToken: () => Promise<IdenfyConfig | null>;
}

// KYC verification statuses
type KycStatus = 'pending' | 'processing' | 'approved' | 'denied' | 'expired';

export const useIdenfyVerification = (): UseIdenfyVerificationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    'none' | 'pending' | 'approved' | 'denied' | 'expired'
  >('none');
  const [error, setError] = useState<string | null>(null);

  const { trackEvent } = useAnalytics();

  // Check current verification status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  /**
   * Check user's current KYC verification status
   */
  const checkStatus = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from('kyc_verifications')
        .select('status, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        logger.error('Error fetching KYC status', fetchError);
        return;
      }

      if (!data) {
        setVerificationStatus('none');
        return;
      }

      // Check expiry (KYC is valid for 1 year from approval date)
      // Using updated_at as the approval timestamp since verified_at doesn't exist
      if (data.status === 'approved' && data.updated_at) {
        const expiryDate = new Date(data.updated_at);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        if (expiryDate < new Date()) {
          setVerificationStatus('expired');
          return;
        }
      }

      // Map database status to UI status
      const statusMap: Record<KycStatus, typeof verificationStatus> = {
        pending: 'pending',
        processing: 'pending',
        approved: 'approved',
        denied: 'denied',
        expired: 'expired',
      };

      setVerificationStatus(
        statusMap[(data.status as KycStatus) || 'pending'] || 'none',
      );
    } catch (err) {
      logger.error(
        'Error checking KYC status',
        err instanceof Error ? err : new Error(String(err)),
      );
    }
  }, []);

  /**
   * Get authentication token from backend for iDenfy SDK
   */
  const getAuthToken = useCallback(async (): Promise<IdenfyConfig | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Oturum bulunamadı');
      }

      // Call edge function to get iDenfy auth token
      const { data, error: fnError } = await supabase.functions.invoke(
        'verify-kyc',
        {
          body: { action: 'get_auth_token' },
        },
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data?.authToken) {
        throw new Error('Auth token alınamadı');
      }

      return {
        authToken: data.authToken,
        locale: 'tr',
        expiresAt: data.expiresAt,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Token alınamadı';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Start iDenfy verification flow
   *
   * NOTE: This function currently uses a placeholder implementation.
   * When iDenfy SDK is installed, uncomment the SDK integration code.
   */
  const startVerification = useCallback(async () => {
    try {
      setIsVerifying(true);
      setError(null);

      trackEvent('kyc_verification_started');

      // Get auth token from backend
      const config = await getAuthToken();
      if (!config) {
        throw new Error('Kimlik doğrulama başlatılamadı');
      }

      /**
       * IDENFY SDK INTEGRATION
       *
       * When iDenfy React Native SDK is installed, uncomment below:
       *
       * import IdenfySdk from '@idenfy/react-native-sdk';
       *
       * const result = await IdenfySdk.start({
       *   authToken: config.authToken,
       *   locale: config.locale || 'tr',
       * });
       *
       * handleVerificationResult(result);
       */

      // Placeholder: Navigate to manual KYC flow
      // This will be replaced with iDenfy SDK call
      Alert.alert(
        'Kimlik Doğrulama',
        'iDenfy SDK entegrasyonu için hesap açılması bekleniyor.\n\nŞu an için manuel kimlik doğrulama akışını kullanabilirsiniz.',
        [
          {
            text: 'Manuel Doğrulama',
            onPress: () => {
              // Navigate to manual KYC screens
              trackEvent('kyc_manual_flow_started');
            },
          },
          {
            text: 'İptal',
            style: 'cancel',
          },
        ],
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Kimlik doğrulama başlatılamadı';
      setError(message);
      trackEvent('kyc_verification_error', { error: message });

      Alert.alert('Hata', message);
    } finally {
      setIsVerifying(false);
    }
  }, [getAuthToken, trackEvent]);

  // NOTE: _handleVerificationResult is prepared for future iDenfy SDK integration
  // It will be used when the native SDK callback is implemented
  // For now, keeping the types ready: IdenfyVerificationResult

  return {
    isLoading,
    isVerifying,
    verificationStatus,
    error,
    startVerification,
    checkStatus,
    getAuthToken,
  };
};

export default useIdenfyVerification;

/**
 * useEmailVerification Hook
 *
 * Provides email verification status and functionality throughout the app.
 * Used to check if user's email is verified before allowing sensitive operations.
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

export interface EmailVerificationState {
  /** Whether the user's email is verified */
  isEmailVerified: boolean;
  /** Whether the verification status is being checked */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Check email verification status */
  checkVerification: () => Promise<boolean>;
  /** Send verification email */
  sendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  /** Whether a verification email was recently sent */
  emailSent: boolean;
  /** Cooldown time remaining for resend (in seconds) */
  resendCooldown: number;
}

const RESEND_COOLDOWN_SECONDS = 60;

export const useEmailVerification = (): EmailVerificationState => {
  const { user } = useAuth();
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  /**
   * Check if user's email is verified
   */
  const checkVerification = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        logger.error('[EmailVerification] Error getting user:', userError);
        setError('Kullanıcı bilgileri alınamadı');
        return false;
      }

      if (!currentUser) {
        setIsEmailVerified(false);
        return false;
      }

      // Check email_confirmed_at field
      const verified = !!currentUser.email_confirmed_at;
      setIsEmailVerified(verified);

      logger.info('[EmailVerification] Status checked:', { verified });
      return verified;
    } catch (err) {
      logger.error('[EmailVerification] Check error:', err);
      setError('Doğrulama durumu kontrol edilemedi');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Send verification email
   */
  const sendVerificationEmail = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (resendCooldown > 0) {
      return { success: false, error: `Lütfen ${resendCooldown} saniye bekleyin` };
    }

    try {
      if (!user?.email) {
        return { success: false, error: 'E-posta adresi bulunamadı' };
      }

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (resendError) {
        logger.error('[EmailVerification] Resend error:', resendError);
        return { success: false, error: resendError.message };
      }

      setEmailSent(true);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);

      logger.info('[EmailVerification] Verification email sent');
      return { success: true };
    } catch (err) {
      logger.error('[EmailVerification] Send error:', err);
      return { success: false, error: 'E-posta gönderilemedi' };
    }
  }, [user?.email, resendCooldown]);

  // Check verification status on mount and when user changes
  useEffect(() => {
    if (user) {
      checkVerification();
    } else {
      setIsEmailVerified(false);
      setIsLoading(false);
    }
  }, [user, checkVerification]);

  return {
    isEmailVerified,
    isLoading,
    error,
    checkVerification,
    sendVerificationEmail,
    emailSent,
    resendCooldown,
  };
};

export default useEmailVerification;

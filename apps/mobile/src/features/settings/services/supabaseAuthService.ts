/**
 * Supabase Auth Service for Settings
 * Handles auth-related operations for settings screens
 */

import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

export interface DeleteAccountResult {
  error: Error | null;
}

/**
 * Delete user account
 * Marks account for deletion according to KVKK/GDPR requirements
 */
export async function deleteAccount(): Promise<DeleteAccountResult> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return { error: new Error('User not authenticated') };
    }

    const userId = session.session.user.id;

    // Mark user for deletion (soft delete)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        deleted_at: new Date().toISOString(),
        deletion_requested_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      logger.error('[DeleteAccount] Failed to mark user for deletion', {
        error: updateError,
      });
      return { error: updateError };
    }

    // Sign out user
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      logger.warn('[DeleteAccount] Sign out failed after deletion request', {
        error: signOutError,
      });
    }

    logger.info('[DeleteAccount] Account scheduled for deletion', { userId });
    return { error: null };
  } catch (error) {
    logger.error('[DeleteAccount] Unexpected error', { error });
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Request data export according to GDPR
 */
export async function requestDataExport(): Promise<{
  error: Error | null;
  requestId?: string;
}> {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      return { error: new Error('User not authenticated') };
    }

    const userId = session.session.user.id;

    // Create data export request
    const { data, error } = await supabase
      .from('data_export_requests')
      .insert({
        user_id: userId,
        status: 'pending',
        requested_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      logger.error('[DataExport] Failed to create export request', { error });
      return { error };
    }

    const requestId = (data as { id?: string } | null)?.id;
    logger.info('[DataExport] Export request created', { userId, requestId });
    return { error: null, requestId };
  } catch (error) {
    logger.error('[DataExport] Unexpected error', { error });
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Sign in with phone number (OTP)
 * Sends an OTP SMS to the provided phone number
 */
export async function signInWithPhone(phone: string): Promise<{
  error: Error | null;
}> {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (error) {
      logger.error('[SignInWithPhone] Failed to send OTP', { error });
      return { error };
    }

    logger.info('[SignInWithPhone] OTP sent successfully', {
      phone: phone.slice(-4),
    });
    return { error: null };
  } catch (error) {
    logger.error('[SignInWithPhone] Unexpected error', { error });
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Verify phone OTP code
 */
export async function verifyPhoneOtp(
  phone: string,
  token: string,
): Promise<{
  error: Error | null;
}> {
  try {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) {
      logger.error('[VerifyPhoneOtp] Verification failed', { error });
      return { error };
    }

    logger.info('[VerifyPhoneOtp] Phone verified successfully');
    return { error: null };
  } catch (error) {
    logger.error('[VerifyPhoneOtp] Unexpected error', { error });
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export const supabaseAuthService = {
  deleteAccount,
  requestDataExport,
  signInWithPhone,
  verifyPhoneOtp,
};

export default supabaseAuthService;

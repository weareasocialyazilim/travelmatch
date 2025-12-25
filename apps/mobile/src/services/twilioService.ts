/**
 * Twilio Service Client
 *
 * Client for phone verification via Twilio (through Supabase Edge Function)
 *
 * @packageDocumentation
 */

import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

export interface SendOtpResult {
  success: boolean;
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  valid?: boolean;
  error?: string;
}

/**
 * Send OTP to phone number via Twilio
 */
export async function sendPhoneOtp(
  phone: string,
  channel: 'sms' | 'whatsapp' = 'sms',
): Promise<SendOtpResult> {
  try {
    const { data: _data, error } = await supabase.functions.invoke(
      'twilio-sms/send-otp',
      {
        body: { phone, channel },
      },
    );

    if (error) {
      logger.error('[TwilioClient] Send OTP error:', error);
      return { success: false, error: error.message };
    }

    logger.info('[TwilioClient] OTP sent successfully');
    return { success: true };
  } catch (error) {
    logger.error('[TwilioClient] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send OTP',
    };
  }
}

/**
 * Verify OTP code
 */
export async function verifyPhoneOtp(
  phone: string,
  code: string,
): Promise<VerifyOtpResult> {
  try {
    const { data, error } = await supabase.functions.invoke(
      'twilio-sms/verify-otp',
      {
        body: { phone, code },
      },
    );

    if (error) {
      logger.error('[TwilioClient] Verify OTP error:', error);
      return { success: false, error: error.message };
    }

    const result = data as { valid?: boolean };
    logger.info('[TwilioClient] OTP verification result:', result.valid);

    return {
      success: true,
      valid: result.valid,
    };
  } catch (error) {
    logger.error('[TwilioClient] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify OTP',
    };
  }
}

/**
 * Send direct SMS message
 */
export async function sendSms(
  to: string,
  message: string,
): Promise<SendOtpResult> {
  try {
    const { data: _data, error } = await supabase.functions.invoke(
      'twilio-sms/send-sms',
      {
        body: { to, message },
      },
    );

    if (error) {
      logger.error('[TwilioClient] Send SMS error:', error);
      return { success: false, error: error.message };
    }

    logger.info('[TwilioClient] SMS sent successfully');
    return { success: true };
  } catch (error) {
    logger.error('[TwilioClient] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS',
    };
  }
}

export const twilioClient = {
  sendPhoneOtp,
  verifyPhoneOtp,
  sendSms,
};

export default twilioClient;

/**
 * SendGrid Email Service Client
 *
 * Client for sending emails via SendGrid (through Supabase Edge Function)
 *
 * @packageDocumentation
 */

import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Send a basic email
 */
export async function sendEmail(
  to: EmailRecipient | EmailRecipient[],
  subject: string,
  content: { text?: string; html?: string },
): Promise<SendEmailResult> {
  try {
    const recipients = Array.isArray(to) ? to : [to];

    const { data, error } = await supabase.functions.invoke(
      'sendgrid-email/send',
      {
        body: {
          to: recipients,
          subject,
          text: content.text,
          html: content.html,
        },
      },
    );

    if (error) {
      logger.error('[SendGridClient] Send email error:', error);
      return { success: false, error: error.message };
    }

    logger.info('[SendGridClient] Email sent successfully');
    return {
      success: true,
      messageId: (data as { messageId?: string })?.messageId,
    };
  } catch (error) {
    logger.error('[SendGridClient] Unexpected error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Send email using a template
 */
export async function sendTemplateEmail(
  to: EmailRecipient | EmailRecipient[],
  templateId: string,
  data: Record<string, unknown>,
): Promise<SendEmailResult> {
  try {
    const recipients = Array.isArray(to) ? to : [to];

    const { data: responseData, error } = await supabase.functions.invoke(
      'sendgrid-email/template',
      {
        body: {
          to: recipients,
          templateId,
          data,
        },
      },
    );

    if (error) {
      logger.error('[SendGridClient] Send template email error:', error);
      return { success: false, error: error.message };
    }

    logger.info('[SendGridClient] Template email sent successfully');
    return {
      success: true,
      messageId: (responseData as { messageId?: string })?.messageId,
    };
  } catch (error) {
    logger.error('[SendGridClient] Unexpected error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to send template email',
    };
  }
}

/**
 * Send email verification code
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  name?: string,
): Promise<SendEmailResult> {
  try {
    const { data: _data, error } = await supabase.functions.invoke(
      'sendgrid-email/verification',
      {
        body: {
          email,
          name,
          code,
          expiresInMinutes: 10,
        },
      },
    );

    if (error) {
      logger.error('[SendGridClient] Send verification email error:', error);
      return { success: false, error: error.message };
    }

    logger.info('[SendGridClient] Verification email sent successfully');
    return { success: true };
  } catch (error) {
    logger.error('[SendGridClient] Unexpected error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to send verification email',
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
  name?: string,
): Promise<SendEmailResult> {
  try {
    const { data: _data, error } = await supabase.functions.invoke(
      'sendgrid-email/password-reset',
      {
        body: {
          email,
          name,
          resetLink,
          expiresInHours: 1,
        },
      },
    );

    if (error) {
      logger.error('[SendGridClient] Send password reset email error:', error);
      return { success: false, error: error.message };
    }

    logger.info('[SendGridClient] Password reset email sent successfully');
    return { success: true };
  } catch (error) {
    logger.error('[SendGridClient] Unexpected error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to send password reset email',
    };
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string,
): Promise<SendEmailResult> {
  try {
    const { data: _data, error } = await supabase.functions.invoke(
      'sendgrid-email/welcome',
      {
        body: {
          email,
          firstName,
        },
      },
    );

    if (error) {
      logger.error('[SendGridClient] Send welcome email error:', error);
      return { success: false, error: error.message };
    }

    logger.info('[SendGridClient] Welcome email sent successfully');
    return { success: true };
  } catch (error) {
    logger.error('[SendGridClient] Unexpected error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to send welcome email',
    };
  }
}

export const sendgridClient = {
  sendEmail,
  sendTemplateEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};

export default sendgridClient;

import { Logger } from '..//_shared/logger.ts';
const logger = new Logger();

/**
 * SendGrid Email Edge Function
 *
 * Handles transactional emails via SendGrid
 *
 * Endpoints:
 * - POST /send - Send email
 * - POST /template - Send template email
 * - POST /verification - Send verification code
 * - POST /password-reset - Send password reset
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const SENDGRID_FROM_EMAIL =
  Deno.env.get('SENDGRID_FROM_EMAIL') || 'noreply@travelmatch.app';
const SENDGRID_FROM_NAME = Deno.env.get('SENDGRID_FROM_NAME') || 'TravelMatch';

const SENDGRID_API_BASE = 'https://api.sendgrid.com/v3';

interface EmailRecipient {
  email: string;
  name?: string;
}

interface SendGridResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Make authenticated request to SendGrid API
 */
async function sendgridRequest(
  endpoint: string,
  method: string,
  body: unknown,
): Promise<SendGridResponse> {
  if (!SENDGRID_API_KEY) {
    return { success: false, error: 'SendGrid API key not configured' };
  }

  try {
    const response = await fetch(`${SENDGRID_API_BASE}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // SendGrid returns 202 for successful sends
    if (response.status === 202 || response.ok) {
      const messageId = response.headers.get('x-message-id');
      return { success: true, messageId: messageId || undefined };
    }

    const errorData = await response.json().catch(() => ({}));
    logger.error('[SendGrid] API error:', errorData);
    return {
      success: false,
      error:
        (errorData as { errors?: { message: string }[] }).errors?.[0]
          ?.message || `SendGrid error: ${response.status}`,
    };
  } catch (error) {
    logger.error('[SendGrid] Request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send basic email
 */
async function sendEmail(
  to: EmailRecipient[],
  subject: string,
  content: { text?: string; html?: string },
): Promise<SendGridResponse> {
  const payload = {
    personalizations: [
      {
        to: to.map((r) => ({ email: r.email, name: r.name })),
      },
    ],
    from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
    subject,
    content: [
      ...(content.text ? [{ type: 'text/plain', value: content.text }] : []),
      ...(content.html ? [{ type: 'text/html', value: content.html }] : []),
    ],
  };

  logger.info('[SendGrid] Sending email', {
    recipients: to.map((r) => r.email).join(', '),
  });

  return sendgridRequest('/mail/send', 'POST', payload);
}

/**
 * Send template email
 */
async function sendTemplateEmail(
  to: EmailRecipient[],
  templateId: string,
  dynamicData: Record<string, unknown>,
): Promise<SendGridResponse> {
  const payload = {
    personalizations: [
      {
        to: to.map((r) => ({ email: r.email, name: r.name })),
        dynamic_template_data: {
          ...dynamicData,
          appName: 'TravelMatch',
          supportEmail: 'support@travelmatch.app',
          currentYear: new Date().getFullYear(),
        },
      },
    ],
    from: { email: SENDGRID_FROM_EMAIL, name: SENDGRID_FROM_NAME },
    template_id: templateId,
  };

  logger.info('[SendGrid] Sending template email', {
    recipients: to.map((r) => r.email).join(', '),
  });

  return sendgridRequest('/mail/send', 'POST', payload);
}

/**
 * Send email verification code
 */
async function sendVerificationEmail(
  to: EmailRecipient,
  code: string,
  expiresInMinutes: number = 10,
): Promise<SendGridResponse> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
      <h1 style="color: #A6E5C1;">E-posta Doğrulama</h1>
      <p>Doğrulama kodunuz:</p>
      <div style="background: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1A1A1A;">${code}</span>
      </div>
      <p style="color: #666;">Bu kod ${expiresInMinutes} dakika içinde geçerliliğini yitirecektir.</p>
      <p style="color: #999; font-size: 12px;">Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.</p>
    </div>
  `;

  return sendEmail([to], 'TravelMatch - E-posta Doğrulama Kodu', { html });
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(
  to: EmailRecipient,
  resetLink: string,
  expiresInHours: number = 1,
): Promise<SendGridResponse> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
      <h1 style="color: #A6E5C1;">Şifre Sıfırlama</h1>
      <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
      <a href="${resetLink}" style="display: inline-block; background: #A6E5C1; color: #1A1A1A; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Şifremi Sıfırla</a>
      <p style="color: #666;">Bu link ${expiresInHours} saat içinde geçerliliğini yitirecektir.</p>
      <p style="color: #999; font-size: 12px;">Bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.</p>
    </div>
  `;

  return sendEmail([to], 'TravelMatch - Şifre Sıfırlama', { html });
}

/**
 * Send welcome email
 */
async function sendWelcomeEmail(
  to: EmailRecipient,
  firstName: string,
): Promise<SendGridResponse> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #A6E5C1;">Hoş Geldiniz, ${firstName}! 🎉</h1>
      <p>TravelMatch ailesine katıldığınız için çok mutluyuz!</p>
      <p>Şimdi:</p>
      <ul>
        <li>Profilinizi tamamlayın</li>
        <li>Yakınlarınızdaki anları keşfedin</li>
        <li>İlk hediyenizi gönderin veya alın</li>
      </ul>
      <a href="https://travelmatch.app" style="display: inline-block; background: #A6E5C1; color: #1A1A1A; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Keşfetmeye Başla</a>
      <p style="color: #666; font-size: 14px;">Herhangi bir sorunuz varsa, support@travelmatch.app adresinden bize ulaşabilirsiniz.</p>
    </div>
  `;

  return sendEmail([to], "TravelMatch'a Hoş Geldiniz! 🎉", { html });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();

    let result: SendGridResponse;

    switch (path) {
      case 'send':
        if (!body.to || !body.subject || (!body.text && !body.html)) {
          return new Response(
            JSON.stringify({ error: 'Required: to, subject, and text/html' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }
        result = await sendEmail(
          Array.isArray(body.to) ? body.to : [body.to],
          body.subject,
          { text: body.text, html: body.html },
        );
        break;

      case 'template':
        if (!body.to || !body.templateId) {
          return new Response(
            JSON.stringify({ error: 'Required: to, templateId' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }
        result = await sendTemplateEmail(
          Array.isArray(body.to) ? body.to : [body.to],
          body.templateId,
          body.data || {},
        );
        break;

      case 'verification':
        if (!body.email || !body.code) {
          return new Response(
            JSON.stringify({ error: 'Required: email, code' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }
        result = await sendVerificationEmail(
          { email: body.email, name: body.name },
          body.code,
          body.expiresInMinutes,
        );
        break;

      case 'password-reset':
        if (!body.email || !body.resetLink) {
          return new Response(
            JSON.stringify({ error: 'Required: email, resetLink' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }
        result = await sendPasswordResetEmail(
          { email: body.email, name: body.name },
          body.resetLink,
          body.expiresInHours,
        );
        break;

      case 'welcome':
        if (!body.email || !body.firstName) {
          return new Response(
            JSON.stringify({ error: 'Required: email, firstName' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          );
        }
        result = await sendWelcomeEmail(
          { email: body.email, name: body.firstName },
          body.firstName,
        );
        break;

      default:
        return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ success: true, messageId: result.messageId }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    logger.error('[SendGrid Edge] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

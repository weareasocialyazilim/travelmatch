import { serve } from 'std/http/server.ts';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { createRateLimiter, RateLimitPresets } from '../_shared/rateLimit.ts';
import { Logger } from '../_shared/logger.ts';
import { getCorsHeaders } from '../_shared/cors.ts';

const logger = new Logger('verify-kyc-async');

const KycSchema = z.object({
  documentType: z.enum(['passport', 'id_card', 'driving_license']),
  documentNumber: z.string().min(5),
  frontImage: z.string().url(),
  backImage: z.string().url().optional(),
  provider: z.enum(['onfido', 'stripe_identity']).default('onfido').optional(),
});

// Rate limiter: 5 requests per 15 minutes (KYC is sensitive)
const kycLimiter = createRateLimiter(RateLimitPresets.auth);

// Job Queue API URL (from environment)
const JOB_QUEUE_URL = Deno.env.get('JOB_QUEUE_URL') || 'http://localhost:3002';

serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check rate limit first
    const rateLimitResult = await kycLimiter.check(req);
    if (!rateLimitResult.ok) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate request body
    const body = await req.json();
    logger.info('Processing KYC verification request', { userId: user.id });

    const validatedData = KycSchema.parse(body);

    // Check if user already has pending KYC verification
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: existingUser } = await serviceClient
      .from('users')
      .select('kyc_status')
      .eq('id', user.id)
      .single();

    if (existingUser?.kyc_status === 'processing') {
      return new Response(
        JSON.stringify({
          error: 'KYC verification already in progress',
          status: 'processing',
        }),
        {
          status: 409, // Conflict
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Enqueue job to background queue instead of processing synchronously
    const jobData = {
      userId: user.id,
      documentType: validatedData.documentType,
      documentNumber: validatedData.documentNumber,
      frontImageUrl: validatedData.frontImage,
      backImageUrl: validatedData.backImage,
      provider: validatedData.provider || 'onfido',
    };

    logger.info('Enqueueing KYC job to queue', { queueUrl: JOB_QUEUE_URL });

    const queueResponse = await fetch(`${JOB_QUEUE_URL}/jobs/kyc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });

    if (!queueResponse.ok) {
      const errorText = await queueResponse.text();
      logger.error('Failed to enqueue job', new Error(errorText));
      throw new Error(`Failed to enqueue KYC verification: ${errorText}`);
    }

    const queueResult = await queueResponse.json();

    // Update user status to pending (will be updated to processing by worker)
    await serviceClient
      .from('users')
      .update({
        kyc_status: 'pending',
        kyc_updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // Return job ID immediately (instant response, no timeout risk)
    return new Response(
      JSON.stringify({
        success: true,
        jobId: queueResult.jobId,
        status: 'queued',
        message:
          'KYC verification has been queued. You will receive a notification when verification is complete.',
        statusUrl: `${JOB_QUEUE_URL}${queueResult.statusUrl}`,
        estimatedTime: '2-5 minutes',
      }),
      {
        status: 202, // Accepted (async processing)
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    logger.error(
      'KYC verification error',
      error instanceof Error ? error : new Error(String(error)),
    );

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request data',
          details: error.errors,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

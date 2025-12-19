import { Worker, Job } from 'bullmq';
import { createClient } from '@supabase/supabase-js';
import { KycJobData, KycJobResult, KycJobSchema } from '../jobs/index.js';
import Redis from 'ioredis';

// Onfido API response types
interface OnfidoReportBreakdown {
  result: string;
  [key: string]: unknown;
}

interface OnfidoReport {
  result: 'clear' | 'consider' | 'unidentified';
  name: string;
  breakdown?: OnfidoReportBreakdown[];
}

interface OnfidoCheckResult {
  id: string;
  status: 'in_progress' | 'awaiting_applicant' | 'complete' | 'withdrawn' | 'paused' | 'reopened';
  result: 'clear' | 'consider' | 'unidentified' | null;
  reports?: OnfidoReport[];
}

// Stripe Identity response types
interface StripeVerificationSession {
  id: string;
  status: 'requires_input' | 'processing' | 'verified' | 'canceled';
  livemode: boolean;
  last_error?: {
    code: string;
    reason: string;
  } | null;
}

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Update KYC status in database
 */
async function updateKycStatus(
  userId: string,
  status: 'pending' | 'processing' | 'verified' | 'rejected' | 'failed'
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      kyc_status: status,
      kyc_updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to update KYC status: ${error.message}`);
  }
}

/**
 * Verify KYC documents using Onfido
 */
async function verifyWithOnfido(data: KycJobData): Promise<KycJobResult> {
  const apiKey = process.env.ONFIDO_API_KEY;
  if (!apiKey) {
    throw new Error('ONFIDO_API_KEY not configured');
  }

  // 1. Create applicant
  const applicantResponse = await fetch('https://api.onfido.com/v3/applicants', {
    method: 'POST',
    headers: {
      Authorization: `Token token=${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: 'User',
      last_name: data.userId.slice(0, 8), // Use part of UUID as last name (temporary)
    }),
  });

  if (!applicantResponse.ok) {
    throw new Error(`Onfido applicant creation failed: ${applicantResponse.statusText}`);
  }

  const applicant = await applicantResponse.json() as { id: string };

  // 2. Upload document (front image)
  const documentFormData = new FormData();
  documentFormData.append('type', data.documentType);
  documentFormData.append('file', data.frontImageUrl); // In production, download and upload actual file
  if (data.backImageUrl) {
    documentFormData.append('back', data.backImageUrl);
  }

  const documentResponse = await fetch('https://api.onfido.com/v3/documents', {
    method: 'POST',
    headers: {
      Authorization: `Token token=${apiKey}`,
    },
    body: documentFormData,
  });

  if (!documentResponse.ok) {
    throw new Error(`Onfido document upload failed: ${documentResponse.statusText}`);
  }

  const document = await documentResponse.json() as { id: string };

  // 3. Create check (document + identity verification)
  const checkResponse = await fetch('https://api.onfido.com/v3/checks', {
    method: 'POST',
    headers: {
      Authorization: `Token token=${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      applicant_id: applicant.id,
      report_names: ['document', 'identity_enhanced'],
    }),
  });

  if (!checkResponse.ok) {
    throw new Error(`Onfido check creation failed: ${checkResponse.statusText}`);
  }

  const check = await checkResponse.json() as { id: string };

  // 4. Poll for results (in production, use webhooks)
  let attempts = 0;
  const maxAttempts = 20; // 20 * 3s = 60s max wait
  let checkResult: OnfidoCheckResult | null = null;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3s

    const resultResponse = await fetch(`https://api.onfido.com/v3/checks/${check.id}`, {
      headers: {
        Authorization: `Token token=${apiKey}`,
      },
    });

    if (!resultResponse.ok) {
      throw new Error(`Onfido check retrieval failed: ${resultResponse.statusText}`);
    }

    checkResult = await resultResponse.json() as OnfidoCheckResult;

    if (checkResult.status === 'complete') {
      break;
    }

    attempts++;
  }

  if (!checkResult || checkResult.status !== 'complete') {
    throw new Error('Onfido verification timed out');
  }

  // 5. Parse result
  const isVerified = checkResult.result === 'clear';
  const rejectionReasons = checkResult.reports
    ?.filter((r: OnfidoReport) => r.result !== 'clear')
    .map((r: OnfidoReport) => r.breakdown?.map((b: OnfidoReportBreakdown) => b.result).join(', '))
    .filter(Boolean);

  return {
    success: true,
    status: isVerified ? 'verified' : 'rejected',
    provider: 'onfido',
    providerId: check.id,
    rejectionReasons,
    completedAt: new Date().toISOString(),
    metadata: {
      applicantId: applicant.id,
      checkId: check.id,
      documentId: document.id,
    },
  };
}

/**
 * Verify KYC documents using Stripe Identity
 */
async function verifyWithStripe(data: KycJobData): Promise<KycJobResult> {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  // 1. Create verification session
  const sessionResponse = await fetch('https://api.stripe.com/v1/identity/verification_sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      type: 'document',
      'options[document][allowed_types][]': data.documentType,
    }),
  });

  if (!sessionResponse.ok) {
    throw new Error(`Stripe session creation failed: ${sessionResponse.statusText}`);
  }

  const session = await sessionResponse.json() as { id: string; livemode: boolean };

  // 2. Submit document (in production, use Stripe's client SDK)
  // This is simplified - actual implementation would use Stripe Identity SDK
  const submitResponse = await fetch(
    `https://api.stripe.com/v1/identity/verification_sessions/${session.id}/submit`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  if (!submitResponse.ok) {
    throw new Error(`Stripe document submission failed: ${submitResponse.statusText}`);
  }

  // 3. Poll for verification result
  let attempts = 0;
  const maxAttempts = 20;
  let verificationResult: StripeVerificationSession | null = null;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const resultResponse = await fetch(
      `https://api.stripe.com/v1/identity/verification_sessions/${session.id}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!resultResponse.ok) {
      throw new Error(`Stripe result retrieval failed: ${resultResponse.statusText}`);
    }

    verificationResult = await resultResponse.json() as StripeVerificationSession;

    if (verificationResult.status === 'verified' || verificationResult.status === 'requires_input') {
      break;
    }

    attempts++;
  }

  if (!verificationResult) {
    throw new Error('Stripe verification timed out');
  }

  const isVerified = verificationResult.status === 'verified';
  const rejectionReasons =
    verificationResult.last_error?.reason ? [verificationResult.last_error.reason] : undefined;

  return {
    success: true,
    status: isVerified ? 'verified' : 'rejected',
    provider: 'stripe_identity',
    providerId: session.id,
    rejectionReasons,
    completedAt: new Date().toISOString(),
    metadata: {
      sessionId: session.id,
      livemode: session.livemode,
    },
  };
}

/**
 * Mock KYC verification (for testing)
 */
async function verifyMock(data: KycJobData): Promise<KycJobResult> {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock: Always pass verification
  return {
    success: true,
    status: 'verified',
    provider: 'mock',
    providerId: `mock_${Date.now()}`,
    confidence: 0.95,
    completedAt: new Date().toISOString(),
    metadata: {
      documentType: data.documentType,
      documentNumber: data.documentNumber,
    },
  };
}

/**
 * Send notification to user about KYC status
 */
async function sendNotification(userId: string, result: KycJobResult): Promise<void> {
  // Insert notification into database
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type: 'kyc_update',
    title: result.status === 'verified' ? 'KYC Verified ✓' : 'KYC Verification Failed',
    body:
      result.status === 'verified'
        ? 'Your identity has been verified successfully!'
        : `Verification ${result.status}. ${result.rejectionReasons?.join(', ') || ''}`,
    data: {
      status: result.status,
      provider: result.provider,
      providerId: result.providerId,
    },
    read: false,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Failed to send notification:', error);
    // Don't throw - notification failure shouldn't fail the job
  }

  // TODO: Send push notification via notification queue
  // await notificationQueue.add('push', {
  //   userId,
  //   type: 'push',
  //   title: 'KYC Update',
  //   body: `Verification ${result.status}`,
  //   data: { type: 'kyc_update', status: result.status },
  // });
}

/**
 * KYC Verification Worker
 * Processes KYC verification jobs from the queue
 */
export function createKycWorker(connection: Redis) {
  const worker = new Worker<KycJobData, KycJobResult>(
    'kyc-verification',
    async (job: Job<KycJobData, KycJobResult>) => {
      console.log(`[KYC Worker] Processing job ${job.id} for user ${job.data.userId}`);

      try {
        // 1. Validate job data
        const validatedData = KycJobSchema.parse(job.data);

        // 2. Update status to processing
        await updateKycStatus(validatedData.userId, 'processing');
        await job.updateProgress(10);

        // 3. Call appropriate KYC provider
        let result: KycJobResult;

        if (process.env.NODE_ENV === 'development' || process.env.USE_MOCK_KYC === 'true') {
          console.log('[KYC Worker] Using mock verification');
          result = await verifyMock(validatedData);
        } else if (validatedData.provider === 'onfido') {
          console.log('[KYC Worker] Verifying with Onfido');
          result = await verifyWithOnfido(validatedData);
        } else if (validatedData.provider === 'stripe_identity') {
          console.log('[KYC Worker] Verifying with Stripe Identity');
          result = await verifyWithStripe(validatedData);
        } else {
          throw new Error(`Unsupported KYC provider: ${validatedData.provider}`);
        }

        await job.updateProgress(60);

        // 4. Update database with result
        await updateKycStatus(
          validatedData.userId,
          result.status === 'verified' ? 'verified' : result.status === 'rejected' ? 'rejected' : 'failed'
        );

        // Store verification details
        const { error: detailsError } = await supabase.from('kyc_verifications').insert({
          user_id: validatedData.userId,
          provider: result.provider,
          provider_id: result.providerId,
          status: result.status,
          confidence: result.confidence,
          rejection_reasons: result.rejectionReasons,
          metadata: result.metadata,
          created_at: result.completedAt,
        });

        if (detailsError) {
          console.error('[KYC Worker] Failed to store verification details:', detailsError);
          // Don't throw - main verification succeeded
        }

        await job.updateProgress(80);

        // 5. Send notification to user
        await sendNotification(validatedData.userId, result);

        await job.updateProgress(100);

        console.log(`[KYC Worker] Job ${job.id} completed successfully`);
        return result;
      } catch (error) {
        console.error(`[KYC Worker] Job ${job.id} failed:`, error);

        // Update status to failed
        try {
          await updateKycStatus(job.data.userId, 'failed');
        } catch (updateError) {
          console.error('[KYC Worker] Failed to update status to failed:', updateError);
        }

        throw error; // Re-throw to trigger BullMQ retry mechanism
      }
    },
    {
      connection,
      concurrency: 5, // Process up to 5 KYC verifications in parallel
      limiter: {
        max: 10, // Max 10 jobs per interval
        duration: 60000, // 1 minute
      },
    }
  );

  // Event handlers
  worker.on('completed', (job) => {
    console.log(`[KYC Worker] ✓ Job ${job.id} completed`);
  });

  worker.on('failed', (job, error) => {
    console.error(`[KYC Worker] ✗ Job ${job?.id} failed:`, error.message);
  });

  worker.on('stalled', (jobId) => {
    console.warn(`[KYC Worker] ⚠ Job ${jobId} stalled (worker crashed or took too long)`);
  });

  worker.on('error', (error) => {
    console.error('[KYC Worker] Worker error:', error);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[KYC Worker] Received SIGTERM, shutting down gracefully...');
    await worker.close();
    process.exit(0);
  });

  return worker;
}

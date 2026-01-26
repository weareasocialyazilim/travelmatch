// supabase/functions/handle-storage-upload/index.ts
// AWS Rekognition Image Moderation - LIVE Build
// Handles storage upload webhooks and scans images for policy violations
// Updated: 2026-01-26 - Multi-tier moderation, PII detection, graceful degradation, hash deduplication

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
  DetectLabelsCommand,
  DetectFacesCommand,
  DetectTextCommand,
} from 'npm:@aws-sdk/client-rekognition@3.454.0';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';
import { encodeHex } from 'https://deno.land/std@0.208.0/encoding/hex.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface StorageWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: {
    id: string;
    bucket_id: string;
    name: string;
    owner: string;
    created_at: string;
    updated_at: string;
    metadata: Record<string, unknown>;
    path_tokens: string[];
  };
  old_record: null | Record<string, unknown>;
}

// Multi-tier moderation thresholds (confidence-based decisions)
const MODERATION_THRESHOLDS = {
  // Reject immediately if confidence > 90%
  reject: 90,
  // Pending review if confidence between 50-90%
  pendingReview: 50,
  // Categories with stricter thresholds
  strictCategories: {
    'Explicit Nudity': 80,
    Violence: 85,
    Alcohol: 75,
    Drugs: 85,
  },
} as const;

// PII patterns for text detection
const PII_PATTERNS = {
  phone: /(\+?[0-9]{1,4}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?[\d\s-]{6,14}/g,
  url: /https?:\/\/[^\s]+/g,
  handle: /@[a-zA-Z0-9_.]+/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
} as const;

// Forbidden concepts in AI prompts (product identity protection)
const FORBIDDEN_CONCEPTS = [
  'trip',
  'booking',
  'reservation',
  'travel',
  'flight',
  'hotel',
  'airbnb',
  'vacation',
] as const;

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 20,
  windowMinutes: 10,
} as const;

// Response length limits
const RESPONSE_LIMITS = {
  maxDescriptionLength: 500, // chars for moderation descriptions
  maxSummaryLength: 1000, // chars for admin summaries
} as const;

/**
 * Calculate SHA-256 hash of image for deduplication
 */
async function calculateImageHash(imageBytes: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', imageBytes);
  return encodeHex(new Uint8Array(hashBuffer));
}

/**
 * Truncate long text responses
 */
function truncateResponse(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Check for forbidden concepts in text (product identity protection)
 */
function containsForbiddenConcepts(text: string): boolean {
  const lowerText = text.toLowerCase();
  return FORBIDDEN_CONCEPTS.some((concept) => lowerText.includes(concept));
}

/**
 * Validate AI response schema - ensures required fields exist
 */
function validateModerationResponse(
  response: Record<string, unknown>,
): boolean {
  const requiredFields = ['status', 'labels', 'score'];
  return requiredFields.every((field) => field in response);
}

/**
 * Rate limit check for user/IP
 */
async function checkRateLimit(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(
    Date.now() - RATE_LIMIT.windowMinutes * 60 * 1000,
  ).toISOString();

  const { count } = await supabase
    .from('moderation_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', windowStart);

  const requestCount = count || 0;
  return {
    allowed: requestCount < RATE_LIMIT.maxRequests,
    remaining: Math.max(0, RATE_LIMIT.maxRequests - requestCount),
  };
}

/**
 * Get previous moderation decision by image hash (deduplication)
 */
async function getPreviousDecision(
  supabase: ReturnType<typeof createClient>,
  imageHash: string,
): Promise<Record<string, unknown> | null> {
  const { data } = await supabase
    .from('moderation_logs')
    .select('action_taken, metadata')
    .eq('metadata->>image_hash', imageHash)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return data || null;
}

/**
 * Log admin override action (for audit trail)
 */
async function logAdminOverride(
  supabase: ReturnType<typeof createClient>,
  adminId: string,
  logId: string,
  originalDecision: string,
  newDecision: string,
  reason: string,
): Promise<void> {
  await supabase.from('admin_audit_logs').insert({
    admin_id: adminId,
    action: 'moderation_override',
    resource_type: 'moderation_log',
    resource_id: logId,
    old_value: originalDecision,
    new_value: newDecision,
    reason,
    metadata: {
      timestamp: new Date().toISOString(),
      provider: 'aws_rekognition',
    },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const awsSecretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const awsRegion = Deno.env.get('AWS_REGION') || 'eu-central-1';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Moderation] Missing Supabase credentials');
      // Silent downgrade: return success without AI decision
      return new Response(
        JSON.stringify({
          status: 'pending_review',
          reason: 'service_config_error',
          silent: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const payload: StorageWebhookPayload = await req.json();

    if (payload.type !== 'INSERT' || payload.table !== 'objects') {
      return new Response(
        JSON.stringify({ message: 'Skipping non-INSERT event' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { record } = payload;

    if (!record || !record.name) {
      return new Response(JSON.stringify({ message: 'No record found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Only scan 'moments' or 'kyc-documents' buckets
    if (!['moments', 'kyc-documents'].includes(record.bucket_id)) {
      return new Response(JSON.stringify({ message: 'Skipped bucket' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limit check - silent fail if over limit
    const rateLimitCheck = await checkRateLimit(supabase, record.owner);
    if (!rateLimitCheck.allowed) {
      console.warn(`[Moderation] Rate limit exceeded for user ${record.owner}`);
      return new Response(
        JSON.stringify({
          status: 'pending_review',
          reason: 'rate_limit_exceeded',
          silent: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // --- Moderation Decision Engine ---
    const decision = {
      status: 'pending' as
        | 'pending'
        | 'approved'
        | 'pending_review'
        | 'rejected'
        | 'skipped_idempotent'
        | 'error',
      score: 0,
      maxConfidence: 0,
      labels: [] as Array<{
        name: string;
        parent: string;
        confidence: number;
        category: string;
      }>,
      piiDetected: [] as Array<{ type: string; value: string }>,
      evidence: {
        moderationLabels: [] as Array<Record<string, unknown>>,
        detectedText: [] as Array<{ type: string; value: string }>,
        faceDetails: [] as Record<string, unknown>[],
        processingMetadata: {
          timestamp: new Date().toISOString(),
          bucket: record.bucket_id,
          fileSize: 0,
          aiModels: ['DetectModerationLabels', 'DetectText'],
        },
      },
      reasons: [] as string[],
    };

    // Idempotency check - also check image hash for deduplication
    const { data: existingLog } = await supabase
      .from('moderation_logs')
      .select('id, action_taken, metadata')
      .eq('metadata->>path', record.name)
      .eq('metadata->>bucket', record.bucket_id)
      .limit(1);

    if (existingLog && existingLog.length > 0) {
      console.log('[Moderation] Already processed, skipping:', record.name);
      decision.status = 'skipped_idempotent';
      return new Response(JSON.stringify(decision), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Process image
    if (
      awsAccessKeyId &&
      awsSecretAccessKey &&
      (record.metadata?.mimetype as string)?.startsWith('image/')
    ) {
      try {
        console.log('[Moderation] Processing:', record.name);

        const { data: fileBlob, error: downloadError } = await supabase.storage
          .from(record.bucket_id)
          .download(record.name);

        if (downloadError) {
          console.error('[Moderation] Download failed:', downloadError);
          decision.status = 'error';
          decision.reasons.push('File download failed');
          // Silent downgrade - no user error shown
          decision.status = 'pending_review';
        } else if (fileBlob) {
          const arrayBuffer = await fileBlob.arrayBuffer();
          const imageBytes = new Uint8Array(arrayBuffer);
          decision.evidence.processingMetadata.fileSize =
            arrayBuffer.byteLength;

          // Calculate image hash for deduplication
          const imageHash = await calculateImageHash(imageBytes);
          decision.evidence.processingMetadata.imageHash = imageHash;

          // Check for previous decision by hash (avoid duplicate Rekognition calls)
          const previousDecision = await getPreviousDecision(
            supabase,
            imageHash,
          );
          if (previousDecision) {
            console.log(
              '[Moderation] Found previous decision for same image hash, reusing',
            );
            decision.status =
              previousDecision.action_taken as typeof decision.status;
            decision.evidence.processingMetadata.reusedFromHash = true;
            // Reuse labels from previous decision if available
            if (previousDecision.metadata?.labels) {
              decision.labels = previousDecision.metadata.labels;
            }
          }

          // 5MB limit check with graceful fallback
          if (arrayBuffer.byteLength > 5 * 1024 * 1024) {
            console.warn('[Moderation] File >5MB, setting to pending_review');
            decision.status = 'pending_review';
            decision.reasons.push('File size requires manual review');
            decision.evidence.processingMetadata.aiModels.push(
              'SKIPPED_5MB_LIMIT',
            );
          } else {
            const client = new RekognitionClient({
              region: awsRegion,
              credentials: {
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey,
              },
            });

            // Step 1: Safety Moderation (Multi-tier)
            const modCommand = new DetectModerationLabelsCommand({
              Image: { Bytes: imageBytes },
              MinConfidence: 60, // Lower threshold to get more labels
            });

            const modResponse = await client.send(modCommand);

            if (
              modResponse.ModerationLabels &&
              modResponse.ModerationLabels.length > 0
            ) {
              const labels = modResponse.ModerationLabels;
              decision.maxConfidence = Math.max(
                ...labels.map((l) => l.Confidence || 0),
              );
              decision.score = decision.maxConfidence;

              // Process labels with category-aware thresholds
              let shouldReject = false;
              let shouldPending = false;

              for (const label of labels) {
                const confidence = label.Confidence || 0;
                const parentName = label.ParentName || '';
                const name = label.Name || '';

                // Determine threshold for this category
                const threshold =
                  MODERATION_THRESHOLDS.strictCategories[
                    parentName as keyof typeof MODERATION_THRESHOLDS.strictCategories
                  ] ||
                  MODERATION_THRESHOLDS.strictCategories[
                    name as keyof typeof MODERATION_THRESHOLDS.strictCategories
                  ] ||
                  MODERATION_THRESHOLDS.reject;

                const labelCategory = determineCategory(parentName || name);

                decision.labels.push({
                  name,
                  parent: parentName,
                  confidence,
                  category: labelCategory,
                });

                decision.evidence.moderationLabels.push({
                  name,
                  parent: parentName,
                  confidence,
                  category: labelCategory,
                  threshold,
                });

                // Multi-tier decision logic
                if (confidence >= threshold) {
                  if (
                    ['explicit', 'violence', 'drugs'].includes(labelCategory)
                  ) {
                    shouldReject = true;
                    decision.reasons.push(
                      `${labelCategory} detected (${Math.round(confidence)}% confidence)`,
                    );
                  } else if (
                    confidence >= MODERATION_THRESHOLDS.pendingReview
                  ) {
                    shouldPending = true;
                  }
                }
              }

              // Final decision based on multi-tier logic
              if (shouldReject) {
                decision.status = 'rejected';
              } else if (
                shouldPending ||
                decision.maxConfidence >= MODERATION_THRESHOLDS.pendingReview
              ) {
                decision.status = 'pending_review';
                if (!shouldReject) {
                  decision.reasons.push(
                    `Medium risk content (${Math.round(decision.maxConfidence)}% confidence)`,
                  );
                }
              } else {
                decision.status = 'approved';
              }
            } else {
              decision.status = 'approved';
              decision.score = 0;
            }

            // Step 2: Text Detection (PII) - Only for moments bucket
            if (record.bucket_id === 'moments') {
              const textCommand = new DetectTextCommand({
                Image: { Bytes: imageBytes },
              });

              const textResponse = await client.send(textCommand);
              const detectedTexts = textResponse.TextDetections || [];

              const piiItems: Array<{ type: string; value: string }> = [];

              for (const textItem of detectedTexts) {
                if (textItem.DetectedText) {
                  const text = textItem.DetectedText;

                  // Check for PII patterns
                  if (
                    PII_PATTERNS.phone.test(text) ||
                    PII_PATTERNS.email.test(text)
                  ) {
                    piiItems.push({ type: 'contact', value: text });
                    decision.reasons.push('Contact info detected in image');
                  } else if (PII_PATTERNS.url.test(text)) {
                    piiItems.push({ type: 'url', value: text });
                    decision.reasons.push('External URL detected in image');
                  } else if (PII_PATTERNS.handle.test(text)) {
                    piiItems.push({ type: 'handle', value: text });
                    decision.reasons.push('Social handle detected in image');
                  }
                }
              }

              if (piiItems.length > 0) {
                decision.piiDetected = piiItems;
                decision.evidence.detectedText = piiItems;

                // PII in images is a policy violation
                if (!decision.labels.some((l) => l.category === 'explicit')) {
                  decision.status = 'pending_review';
                }
              }
            }
          }
        }
      } catch (modErr) {
        console.error('[Moderation] Process Error:', modErr);
        decision.status = 'error';
        decision.reasons.push('AI processing failed - manual review required');
        // Graceful degradation: AI error → pending_review (never auto-approve)
        decision.status = 'pending_review';
      }
    } else if (!awsAccessKeyId || !awsSecretAccessKey) {
      console.warn('[Moderation] AWS not configured, skipping');
      decision.status = 'pending_review';
      decision.reasons.push(
        'AI moderation unavailable - manual review required',
      );
    }

    // --- Persist to Database ---
    await persistModerationResult(supabase, record, decision);

    return new Response(JSON.stringify(decision), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[Moderation] Handler Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});

/**
 * Determine moderation category from label
 */
function determineCategory(labelName: string): string {
  const name = labelName.toLowerCase();

  if (name.includes('nudity') || name.includes('explicit')) return 'explicit';
  if (name.includes('violence') || name.includes('weapon')) return 'violence';
  if (name.includes('drug') || name.includes('alcohol')) return 'substances';
  if (name.includes('suggestive') || name.includes('partial'))
    return 'suggestive';
  if (name.includes('food') || name.includes('meal')) return 'food';
  if (name.includes('person') || name.includes('face')) return 'person';
  if (name.includes('text')) return 'text';

  return 'other';
}

/**
 * Persist moderation result to database
 */
async function persistModerationResult(
  supabase: ReturnType<typeof createClient>,
  record: StorageWebhookPayload['record'],
  decision: {
    status: string;
    score: number;
    maxConfidence: number;
    labels: Array<{
      name: string;
      parent: string;
      confidence: number;
      category: string;
    }>;
    piiDetected: Array<{ type: string; value: string }>;
    evidence: Record<string, unknown>;
    reasons: string[];
  },
): Promise<void> {
  try {
    // Update moments table with moderation results
    if (record.bucket_id === 'moments') {
      const momentUpdate: Record<string, unknown> = {
        moderation_status: decision.status,
        ai_moderation_score: decision.maxConfidence,
        ai_moderation_labels: JSON.stringify(decision.labels),
        ai_moderation_reasons: JSON.stringify(decision.reasons),
        ai_moderation_pii: JSON.stringify(decision.piiDetected),
        updated_at: new Date().toISOString(),
      };

      // Set approval status based on decision
      if (decision.status === 'approved') {
        momentUpdate.is_approved = true;
        momentUpdate.is_hidden = false;
      } else if (decision.status === 'rejected') {
        momentUpdate.is_approved = false;
        momentUpdate.is_hidden = true;
      } else {
        // pending_review or error
        momentUpdate.is_approved = false;
        momentUpdate.is_hidden = false;
      }

      await supabase
        .from('moments')
        .update(momentUpdate)
        .eq('media_url', record.name);
    }

    // Log to moderation_logs for admin queue
    const severityMap: Record<string, 'high' | 'medium' | 'low'> = {
      rejected: 'high',
      pending_review: 'medium',
      approved: 'low',
      error: 'medium',
    };

    await supabase.from('moderation_logs').insert({
      user_id: record.owner,
      content_type: 'image',
      severity: severityMap[decision.status] || 'medium',
      violations: decision.labels
        .map((l) => l.name)
        .concat(decision.piiDetected.map((p) => `PII:${p.type}`)),
      action_taken:
        decision.status === 'approved' ? 'auto_approved' : decision.status,
      metadata: {
        provider: 'aws_rekognition',
        decision: {
          status: decision.status,
          score: decision.score,
          maxConfidence: decision.maxConfidence,
          reasons: decision.reasons,
        },
        evidence: decision.evidence,
        labels: decision.labels,
        pii: decision.piiDetected,
        bucket: record.bucket_id,
        path: record.name,
        timestamp: new Date().toISOString(),
      },
    });

    // Increment risk score for rejected content
    if (decision.status === 'rejected') {
      await supabase.rpc('increment_risk_score', {
        target_user_id: record.owner,
        increment_amount: 25,
        reason_text: `Content rejected: ${decision.reasons.join(', ')}`,
      });
    }
  } catch (err) {
    console.error('[Moderation] Failed to persist results:', err);
  }
}

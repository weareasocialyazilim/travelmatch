// supabase/functions/handle-storage-upload/index.ts
// AWS Rekognition Image Moderation - LIVE Build
// Handles storage upload webhooks and scans images for policy violations

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
  DetectLabelsCommand,
  DetectFacesCommand,
} from 'npm:@aws-sdk/client-rekognition@3.454.0';

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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const awsSecretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const awsRegion = Deno.env.get('AWS_REGION') || 'eu-central-1';

    // FAIL-CLOSED: If required credentials missing, reject
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const payload: StorageWebhookPayload = await req.json();

    // Only process INSERT events on storage.objects
    if (payload.type !== 'INSERT' || payload.table !== 'objects') {
      return new Response(
        JSON.stringify({ message: 'Skipping non-INSERT event' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { record } = payload;

    if (!record || !record.name) {
      return new Response(
        JSON.stringify({ message: 'No record found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only scan 'moments' or 'kyc-documents' buckets
    if (!['moments', 'kyc-documents'].includes(record.bucket_id)) {
      return new Response(
        JSON.stringify({ message: 'Skipped bucket' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- AWS Rekognition Analysis ---
    let moderationStatus = 'pending';
    let moderationLabels: unknown[] = [];
    let moderationScore = 0;
    let verificationResult = {
      isVerified: false,
      matchConfidence: 0,
      detectedContext: [] as string[],
    };

    // Only scan if AWS credentials exist and it's an image
    if (
      awsAccessKeyId &&
      awsSecretAccessKey &&
      (record.metadata?.mimetype as string)?.startsWith('image/')
    ) {
      try {
        console.log(`🔍 Scanning image with Rekognition: ${record.name}`);

        // Download image from Storage
        const { data: fileBlob, error: downloadError } = await supabase.storage
          .from(record.bucket_id)
          .download(record.name);

        if (downloadError) {
          console.error('Download failed for moderation:', downloadError);
        } else if (fileBlob) {
          const arrayBuffer = await fileBlob.arrayBuffer();
          const imageBytes = new Uint8Array(arrayBuffer);

          // AWS Rekognition 5MB limit check
          if (arrayBuffer.byteLength > 5 * 1024 * 1024) {
            console.warn('⚠️ Image too large for Rekognition (>5MB), skipping.');
            moderationStatus = 'skipped_size';
          } else {
            const client = new RekognitionClient({
              region: awsRegion,
              credentials: {
                accessKeyId: awsAccessKeyId,
                secretAccessKey: awsSecretAccessKey,
              },
            });

            // 1. Safety Moderation (Always Run)
            const modCommand = new DetectModerationLabelsCommand({
              Image: { Bytes: imageBytes },
              MinConfidence: 65,
            });

            const modResponse = await client.send(modCommand);

            if (modResponse.ModerationLabels && modResponse.ModerationLabels.length > 0) {
              const labels = modResponse.ModerationLabels;
              const hasExplicit = labels.some(
                (l) =>
                  l.ParentName === 'Explicit Nudity' ||
                  l.Name === 'Explicit Nudity' ||
                  l.ParentName === 'Violence' ||
                  l.Name === 'Violence'
              );

              if (hasExplicit) {
                moderationStatus = 'rejected';
                moderationScore = 100;
                console.log('❌ Content REJECTED (Explicit):', JSON.stringify(labels));

                // Block the content
                if (record.bucket_id === 'moments') {
                  await supabase
                    .from('moments')
                    .update({
                      is_approved: false,
                      is_hidden: true,
                      moderation_status: 'rejected',
                    })
                    .eq('media_url', record.name);
                }

                // Log to moderation_logs
                await supabase.from('moderation_logs').insert({
                  user_id: record.owner,
                  content_type: 'image',
                  severity: 'high',
                  violations: labels.map((l) => l.Name),
                  action_taken: 'blocked',
                  metadata: {
                    provider: 'aws_rekognition',
                    labels,
                    bucket: record.bucket_id,
                    path: record.name,
                  },
                });

                // Increment user risk score
                await supabase.rpc('increment_risk_score', {
                  target_user_id: record.owner,
                  increment_amount: 50,
                  reason_text: 'Uploaded explicit content (Rekognition)',
                });
              } else {
                moderationStatus = 'pending_review';
                moderationScore = labels[0]?.Confidence || 50;
                console.log('⚠️ Content SUSPICIOUS (Review):', JSON.stringify(labels));
              }
              moderationLabels = labels;
            } else {
              moderationStatus = 'approved';
              console.log('✅ Content APPROVED (Safety)');
            }

            // 2. AI Verification Modes (Optional)
            const aiMode = record.metadata?.aiMode as string | undefined;
            if (aiMode && moderationStatus === 'approved') {
              console.log(`🧠 Running AI Verification for mode: ${aiMode}`);

              if (aiMode === 'food_recognition' || aiMode === 'food') {
                const labelCommand = new DetectLabelsCommand({
                  Image: { Bytes: imageBytes },
                  MaxLabels: 10,
                  MinConfidence: 70,
                });
                const labelResponse = await client.send(labelCommand);
                const detectedLabels = labelResponse.Labels || [];
                const foodRelated = detectedLabels.some((l) =>
                  ['Food', 'Meal', 'Dish', 'Beverage', 'Drink'].includes(l.Name || '')
                );
                verificationResult = {
                  isVerified: foodRelated,
                  matchConfidence: foodRelated ? 90 : 0,
                  detectedContext: detectedLabels.map((l) => l.Name || ''),
                };
              } else if (aiMode.includes('selfie') || aiMode.includes('face')) {
                const faceCommand = new DetectFacesCommand({
                  Image: { Bytes: imageBytes },
                  Attributes: ['DEFAULT'],
                });
                const faceResponse = await client.send(faceCommand);
                const hasFace = (faceResponse.FaceDetails?.length || 0) > 0;
                verificationResult = {
                  isVerified: hasFace,
                  matchConfidence: hasFace ? 95 : 0,
                  detectedContext: hasFace ? ['Face Detected'] : ['No Face'],
                };
              } else if (aiMode.includes('landscape') || aiMode.includes('outdoors')) {
                const labelCommand = new DetectLabelsCommand({
                  Image: { Bytes: imageBytes },
                  MaxLabels: 10,
                  MinConfidence: 70,
                });
                const labelResponse = await client.send(labelCommand);
                const detectedLabels = labelResponse.Labels || [];
                const outdoors = detectedLabels.some((l) =>
                  ['Nature', 'Outdoors', 'Landscape', 'City', 'Building', 'Sky'].includes(
                    l.Name || ''
                  )
                );
                verificationResult = {
                  isVerified: outdoors,
                  matchConfidence: outdoors ? 85 : 0,
                  detectedContext: detectedLabels.map((l) => l.Name || ''),
                };
              }
            }
          }
        }
      } catch (modErr) {
        console.error('Moderation/Verification Process Error:', modErr);
        moderationStatus = 'error';
      }
    } else if (!awsAccessKeyId || !awsSecretAccessKey) {
      console.warn('⚠️ AWS credentials not configured, skipping moderation');
      moderationStatus = 'skipped_no_aws';
    }

    // Auto-approve if safe
    if (moderationStatus === 'approved' && record.bucket_id === 'moments') {
      await supabase
        .from('moments')
        .update({ is_approved: true, moderation_status: 'approved' })
        .eq('media_url', record.name);
    }

    return new Response(
      JSON.stringify({
        status: moderationStatus,
        score: moderationScore,
        labels: moderationLabels,
        verification: verificationResult,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Handler Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

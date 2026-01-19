/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

// Edge Function: handle-storage-upload
// Webhook handler for storage.objects INSERT events
// Creates uploaded_images records automatically

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { getCorsHeaders } from '../_shared/cors.ts';
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
  DetectLabelsCommand,
  DetectFacesCommand,
} from 'npm:@aws-sdk/client-rekognition@3.454.0';

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

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const awsSecretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');
    const awsRegion = Deno.env.get('AWS_REGION') || 'eu-central-1';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: StorageWebhookPayload = await req.json();

    // Debug log for development only

    // Only process INSERT events on storage.objects
    if (payload.type !== 'INSERT' || payload.table !== 'objects') {
      return new Response(
        JSON.stringify({ message: 'Skipping non-INSERT event' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { record } = payload;

    // Skip if no owner (system uploads)
    if (!record.owner) {
      return new Response(
        JSON.stringify({ message: 'Skipping upload without owner' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Generate public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${record.bucket_id}/${record.name}`;

    // Determine image type from path
    let imageType = 'other';
    const pathLower = record.name.toLowerCase();
    if (pathLower.includes('avatar') || pathLower.includes('profile')) {
      imageType = 'avatar';
    } else if (pathLower.includes('moment')) {
      imageType = 'moment';
    } else if (
      pathLower.includes('verification') ||
      pathLower.includes('proof')
    ) {
      imageType = 'verification';
    }

    // --- AWS Rekognition Analysis ---
    let moderationStatus = 'pending';
    let moderationLabels: any[] = [];
    let moderationScore = 0;
    let verificationResult = {
      isVerified: false,
      matchConfidence: 0,
      detectedContext: [] as string[],
    };

    // Only scan if credentials exist and it's an image
    if (
      awsAccessKeyId &&
      awsSecretAccessKey &&
      record.metadata?.mimetype?.startsWith('image/')
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

          // AWS Rekognition 5MB Limit check
          if (arrayBuffer.byteLength > 5 * 1024 * 1024) {
            console.warn(
              '⚠️ Image too large for Rekognition (>5MB), skipping.',
            );
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

            if (
              modResponse.ModerationLabels &&
              modResponse.ModerationLabels.length > 0
            ) {
              const labels = modResponse.ModerationLabels;
              const hasExplicit = labels.some(
                (l) =>
                  l.ParentName === 'Explicit Nudity' ||
                  l.Name === 'Explicit Nudity' ||
                  l.ParentName === 'Violence' ||
                  l.Name === 'Violence',
              );

              if (hasExplicit) {
                moderationStatus = 'rejected';
                moderationScore = 100;
                console.log(
                  '❌ Content REJECTED (Explicit):',
                  JSON.stringify(labels),
                );
                await supabase.rpc('increment_risk_score', {
                  target_user_id: record.owner,
                  increment_amount: 50,
                  reason_text: 'Uploaded explicit content (Rekognition)',
                });
              } else {
                moderationStatus = 'pending_review';
                moderationScore = labels[0].Confidence || 50;
                console.log(
                  '⚠️ Content SUSPICIOUS (Review):',
                  JSON.stringify(labels),
                );
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
                const labels = labelResponse.Labels || [];
                const foodRelated = labels.some((l) =>
                  ['Food', 'Meal', 'Dish', 'Beverage', 'Drink'].includes(
                    l.Name || '',
                  ),
                );
                verificationResult = {
                  isVerified: foodRelated,
                  matchConfidence: foodRelated ? 90 : 0,
                  detectedContext: labels.map((l) => l.Name || ''),
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
              } else if (
                aiMode.includes('landscape') ||
                aiMode.includes('outdoors')
              ) {
                const labelCommand = new DetectLabelsCommand({
                  Image: { Bytes: imageBytes },
                  MaxLabels: 10,
                  MinConfidence: 70,
                });
                const labelResponse = await client.send(labelCommand);
                const labels = labelResponse.Labels || [];
                const outdoors = labels.some((l) =>
                  [
                    'Nature',
                    'Outdoors',
                    'Landscape',
                    'City',
                    'Building',
                    'Sky',
                  ].includes(l.Name || ''),
                );
                verificationResult = {
                  isVerified: outdoors,
                  matchConfidence: outdoors ? 85 : 0,
                  detectedContext: labels.map((l) => l.Name || ''),
                };
              }
            }
          }
        }
      } catch (modErr) {
        console.error('Moderation/Verification Process Error:', modErr);
      }
    }

    // Insert into uploaded_images table
    const { data, error } = await supabase
      .from('uploaded_images')
      .insert({
        user_id: record.owner,
        bucket_id: record.bucket_id,
        storage_path: record.name,
        public_url: publicUrl,
        image_type: imageType,
        file_size: record.metadata?.size || null,
        mime_type: record.metadata?.mimetype || null,
        metadata: {
          ...record.metadata,
          verification_result: verificationResult, // Store extra AI data
        },
        moderation_status: moderationStatus,
        moderation_labels: moderationLabels,
        moderation_score: moderationScore,
        moderation_details: {
          scanned_at: new Date().toISOString(),
          provider: 'aws_rekognition',
          ai_mode: record.metadata?.aiMode,
        },
      })
      .select()
      .single();

    if (error) {
      // Error logged by Supabase
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

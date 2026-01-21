// supabase/functions/handle-storage-upload/index.ts (AWS Rekognition LIVE Build)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { RekognitionClient, DetectModerationLabelsCommand } from "https://esm.sh/@aws-sdk/client-rekognition";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

<<<<<<< Updated upstream
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

=======
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = await req.json();
>>>>>>> Stashed changes
    const { record } = payload;
    // record format: { name: 'folder/filename.jpg', bucket_id: 'moments', owner: 'user-uuid', id: 'object-uuid', ... }

    if (!record || !record.name) {
      return new Response("No record found", { status: 200, headers: corsHeaders });
    }

    // Critical: Only scan 'moments' or 'verification' buckets
    if (!['moments', 'kyc-documents'].includes(record.bucket_id)) {
      return new Response("Skipped Bucket", { status: 200, headers: corsHeaders });
    }

<<<<<<< Updated upstream
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
=======
    // Initialize Supabase Admin Client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. AWS Rekognition Analizi
    const rekognition = new RekognitionClient({
      region: Deno.env.get("AWS_REGION"),
      credentials: {
        accessKeyId: Deno.env.get("AWS_ACCESS_KEY_ID")!,
        secretAccessKey: Deno.env.get("AWS_SECRET_ACCESS_KEY")!,
      },
    });

    const command = new DetectModerationLabelsCommand({
      Image: { S3Object: { Bucket: record.bucket_id, Name: record.name } },
      MinConfidence: 75,
    });

    let response;
    try {
        // Note: For S3Object to work, the bucket and name must match what AWS expects (usually an S3 bucket).
        // If Supabase Storage is S3-compatible or backed by S3, this might work if 'bucket_id' maps to the S3 bucket name.
        // However, usually we send bytes or use a public URL if the bucket is not directly accessible by this Rekognition role in this way.
        // The user provided code uses `S3Object`, implying Supabase is backed by S3 and we are using the underlying S3 bucket.
        // If this fails, we might need to fetch the image bytes and send `Bytes`.
        // Given the prompt explicitly provided `{ S3Object: ... }`, I will stick to it, but add a comment.
        response = await rekognition.send(command);
    } catch (awsError) {
        console.error("AWS Rekognition Error:", awsError);
        // Fallback or re-throw? 
        // If we can't scan, we might fail-open or fail-closed. Failsafe: log and return.
        return new Response(JSON.stringify({ error: "AWS Scan Failed", details: awsError.message }), { status: 500, headers: corsHeaders });
    }

    // 2. İhlal Tespit Edilirse (Xcode 26/Guideline 1.2 Uyumlu)
    if (response.ModerationLabels && response.ModerationLabels.length > 0) {
      console.warn(`[AI SCAN] FLAGGED: ${record.name} - Labels: ${response.ModerationLabels.map(l => l.Name).join(", ")}`);

      // İçeriği otomatik blokla
      // Both tables for safety
      if (record.bucket_id === 'moments') {
        await supabase.from('moments').update({ is_approved: false, is_hidden: true, moderation_status: 'rejected' }).eq('media_url', record.name);
      }
      
      // Admin Dashboard'u besleyen log kaydı
      await supabase.from('moderation_logs').insert({
        user_id: record.owner,
        content_type: 'moment_description',
        severity: 'high',
        violations: response.ModerationLabels.map(l => l.Name),
        action_taken: 'blocked',
        metadata: { provider: 'AWS_Rekognition', labels: response.ModerationLabels }
      });
>>>>>>> Stashed changes

      return new Response(JSON.stringify({ status: "unsafe", action: "blocked", labels: response.ModerationLabels }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Auto-approve if safe
    if (record.bucket_id === 'moments') {
         await supabase.from('moments').update({ is_approved: true, moderation_status: 'approved' }).eq('media_url', record.name);
    }

    return new Response(JSON.stringify({ status: "safe" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Handler Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

// Edge Function: handle-storage-upload
// Webhook handler for storage.objects INSERT events
// Creates uploaded_images records automatically

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: StorageWebhookPayload = await req.json();
    
    // Debug log for development only

    // Only process INSERT events on storage.objects
    if (payload.type !== 'INSERT' || payload.table !== 'objects') {
      return new Response(
        JSON.stringify({ message: 'Skipping non-INSERT event' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { record } = payload;
    
    // Skip if no owner (system uploads)
    if (!record.owner) {
      return new Response(
        JSON.stringify({ message: 'Skipping upload without owner' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    } else if (pathLower.includes('verification') || pathLower.includes('proof')) {
      imageType = 'verification';
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
        metadata: record.metadata || {},
      })
      .select()
      .single();

    if (error) {
      // Error logged by Supabase
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

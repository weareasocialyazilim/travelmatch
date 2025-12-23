/**
 * Update moment images with real Unsplash URLs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const imageUrls = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800', // breakfast
  'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800', // great wall
  'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800', // tapas
  'https://images.unsplash.com/photo-1582657233895-0f37a3f150c0?w=800', // origami
  'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800', // yacht
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=800', // temple
];

async function updateImages() {
  console.log('🖼️ Updating moment images...');

  const { data: moments, error } = await supabase
    .from('moments')
    .select('id, title, images')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching moments:', error);
    return;
  }

  if (!moments || moments.length === 0) {
    console.log('No moments found');
    return;
  }

  console.log(`Found ${moments.length} moments to update`);

  for (let i = 0; i < moments.length; i++) {
    const moment = moments[i];
    if (!moment) continue;

    const imageUrl = imageUrls[i % imageUrls.length];

    // Skip if already has valid Unsplash URL
    if (moment.images?.[0]?.includes('unsplash.com')) {
      console.log(`✓ ${moment.title} - already has Unsplash image`);
      continue;
    }

    const { error: updateError } = await supabase
      .from('moments')
      .update({ images: [imageUrl] })
      .eq('id', moment.id);

    if (updateError) {
      console.error(`✗ Error updating ${moment.title}:`, updateError);
    } else {
      console.log(
        `✓ ${moment.title} → ${imageUrl?.substring(38, 80) ?? ''}...`,
      );
    }
  }

  console.log('✅ All moments updated with real images');
}

updateImages().catch(console.error);

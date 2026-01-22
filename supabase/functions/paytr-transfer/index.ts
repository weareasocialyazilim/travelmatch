/**
 * ⚠️ DISABLED - NO USER-TO-USER TRANSFERS ⚠️
 *
 * PayTR transfers are disabled. Users cannot send money to each other.
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { getCorsHeaders } from '../_shared/cors.ts';

serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  return new Response(
    JSON.stringify({
      success: false,
      error: 'Bu işlem artık kullanılamıyor.',
      code: 'TRANSFER_DISABLED',
    }),
    {
      status: 410,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
});

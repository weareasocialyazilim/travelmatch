// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

// Rate limiting map (in-memory for demo, use Redis for production)
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const BLOCK_DURATION = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password, type, token, options } = await req.json();
    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    // 1. Rate Limiting Check
    const userRL = rateLimit.get(ip) || { count: 0, timestamp: Date.now() };
    if (Date.now() - userRL.timestamp > BLOCK_DURATION) {
      // Reset if block expired
      userRL.count = 0;
      userRL.timestamp = Date.now();
    }

    if (userRL.count >= MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Please try again later.' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // 2. Turnstile / Captcha Check (Placeholder)
    // if (token) { ... verify token with Cloudflare ... }

    // Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      },
    );

    let result;
    if (type === 'signup') {
      result = await supabaseClient.auth.signUp({
        email,
        password,
        options: options || {}, // Pass options (metadata, etc.)
      });
    } else {
      result = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
    }

    const { data, error } = result;

    if (error) {
      // Increment rate limit counter on failure
      userRL.count++;
      rateLimit.set(ip, userRL);

      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

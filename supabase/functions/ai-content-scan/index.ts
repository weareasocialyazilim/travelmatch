// AI Content Scan Function (Compliance: Apple Guideline 1.2)
// This function provides text content moderation via OpenAI Moderation API
// SECURITY: Requires authentication

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import OpenAI from 'https://esm.sh/openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface ScanRequest {
  contentId: string;
  contentType: 'text' | 'image';
  textContent?: string;
  imageUrl?: string;
}

interface ModerationResult {
  flagged: boolean;
  confidence: number;
  categories: string[];
  categoryScores: Record<string, number>;
  action: 'approved' | 'rejected' | 'pending_review';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    // FAIL-CLOSED: Require credentials
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: ScanRequest = await req.json();
    const { contentId, contentType, textContent, imageUrl } = body;

    if (!contentId || !contentType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: contentId, contentType' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[AI SCAN] Scanning content: ${contentId} (${contentType}) for user: ${user.id}`);

    let result: ModerationResult;

    // Text content moderation via OpenAI
    if (contentType === 'text' && textContent) {
      if (!openaiApiKey) {
        console.warn('OpenAI API key not configured, using fallback');
        // Fallback: Basic keyword check
        const flaggedKeywords = ['spam', 'scam', 'hack'];
        const lowerContent = textContent.toLowerCase();
        const hasFlagged = flaggedKeywords.some((kw) => lowerContent.includes(kw));

        result = {
          flagged: hasFlagged,
          confidence: hasFlagged ? 0.7 : 0.1,
          categories: hasFlagged ? ['spam'] : [],
          categoryScores: {},
          action: hasFlagged ? 'pending_review' : 'approved',
        };
      } else {
        // Use OpenAI Moderation API
        const openai = new OpenAI({ apiKey: openaiApiKey });

        const moderation = await openai.moderations.create({
          input: textContent,
        });

        const modResult = moderation.results[0];
        const flaggedCategories: string[] = [];
        const scores: Record<string, number> = {};

        // Extract flagged categories
        for (const [category, isFlagged] of Object.entries(modResult.categories)) {
          if (isFlagged) {
            flaggedCategories.push(category);
          }
        }

        // Extract category scores
        for (const [category, score] of Object.entries(modResult.category_scores)) {
          scores[category] = score;
        }

        // Determine action based on severity
        let action: 'approved' | 'rejected' | 'pending_review' = 'approved';
        if (modResult.flagged) {
          const hasHighSeverity = flaggedCategories.some((cat) =>
            ['sexual/minors', 'violence/graphic', 'self-harm/intent'].includes(cat)
          );
          action = hasHighSeverity ? 'rejected' : 'pending_review';
        }

        const maxScore = Math.max(...Object.values(scores));

        result = {
          flagged: modResult.flagged,
          confidence: maxScore,
          categories: flaggedCategories,
          categoryScores: scores,
          action,
        };

        // Log moderation result if flagged
        if (modResult.flagged) {
          await supabase.from('moderation_logs').insert({
            user_id: user.id,
            content_type: 'text',
            severity: action === 'rejected' ? 'high' : 'medium',
            violations: flaggedCategories,
            action_taken: action,
            metadata: {
              provider: 'openai_moderation',
              content_id: contentId,
              scores,
            },
          });

          console.log(`[AI SCAN] FLAGGED content ${contentId}:`, flaggedCategories);
        }
      }
    } else if (contentType === 'image' && imageUrl) {
      // Image moderation would be handled by handle-storage-upload function
      // This endpoint is primarily for text content
      result = {
        flagged: false,
        confidence: 0,
        categories: [],
        categoryScores: {},
        action: 'approved',
      };
      console.log('[AI SCAN] Image content should use handle-storage-upload function');
    } else {
      return new Response(
        JSON.stringify({ error: 'Missing content: textContent or imageUrl required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[AI SCAN] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

import { Logger } from '..//_shared/logger.ts';
const logger = new Logger();

/**
 * PayTR Saved Cards Management
 *
 * Manages saved card tokens for quick payments.
 * Provides list, delete, and set default functionality.
 *
 * GET /paytr-saved-cards - List user's saved cards
 * DELETE /paytr-saved-cards?cardId=xxx - Delete a saved card
 * PUT /paytr-saved-cards - Set default card
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createSupabaseClients, requireAuth } from '../_shared/supabase.ts';

// =============================================================================
// TYPES
// =============================================================================

interface SavedCard {
  id: string;
  cardLastFour: string;
  cardBrand: string;
  cardBank: string | null;
  cardFamily: string | null;
  isDefault: boolean;
  useCount: number;
  lastUsedAt: string | null;
  createdAt: string;
}

// =============================================================================
// CORS HEADERS
// =============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// =============================================================================
// MAIN HANDLER
// =============================================================================

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userClient, adminClient } = createSupabaseClients({
      request: req,
    });

    // Authenticate user
    const user = await requireAuth(userClient);
    const userId = user.id;

    const url = new URL(req.url);

    switch (req.method) {
      case 'GET':
        return handleListCards(adminClient, userId);

      case 'DELETE':
        const cardId = url.searchParams.get('cardId');
        if (!cardId) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Missing cardId parameter',
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        return handleDeleteCard(adminClient, userId, cardId);

      case 'PUT':
        const body = await req.json();
        return handleSetDefault(adminClient, userId, body.cardId);

      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Method not allowed',
          }),
          {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }
  } catch (error) {
    logger.error('Saved Cards Error:', error);

    if (error.message === 'Authentication required') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication required',
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// =============================================================================
// HANDLERS
// =============================================================================

async function handleListCards(adminClient: any, userId: string) {
  const { data: cards, error } = await adminClient
    .from('saved_cards')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch cards',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Transform to frontend format (hide sensitive data)
  const transformedCards: SavedCard[] = (cards || []).map((card: any) => ({
    id: card.id,
    cardLastFour: card.card_last_four,
    cardBrand: card.card_brand,
    cardBank: card.card_bank,
    cardFamily: card.card_family,
    isDefault: card.is_default,
    useCount: card.use_count,
    lastUsedAt: card.last_used_at,
    createdAt: card.created_at,
  }));

  return new Response(
    JSON.stringify({
      success: true,
      cards: transformedCards,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function handleDeleteCard(
  adminClient: any,
  userId: string,
  cardId: string
) {
  // Verify card belongs to user
  const { data: card, error: fetchError } = await adminClient
    .from('saved_cards')
    .select('id, user_id')
    .eq('id', cardId)
    .single();

  if (fetchError || !card) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Card not found',
      }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  if (card.user_id !== userId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Not authorized',
      }),
      {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Delete card
  const { error: deleteError } = await adminClient
    .from('saved_cards')
    .delete()
    .eq('id', cardId);

  if (deleteError) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to delete card',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Log security event
  await adminClient.from('security_logs').insert({
    user_id: userId,
    event_type: 'card_deleted',
    event_status: 'success',
    event_details: { card_id: cardId },
  });

  return new Response(
    JSON.stringify({
      success: true,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

async function handleSetDefault(
  adminClient: any,
  userId: string,
  cardId: string
) {
  if (!cardId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Missing cardId',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Verify card belongs to user
  const { data: card, error: fetchError } = await adminClient
    .from('saved_cards')
    .select('id, user_id')
    .eq('id', cardId)
    .single();

  if (fetchError || !card) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Card not found',
      }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  if (card.user_id !== userId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Not authorized',
      }),
      {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Set as default (trigger will unset others)
  const { error: updateError } = await adminClient
    .from('saved_cards')
    .update({ is_default: true })
    .eq('id', cardId);

  if (updateError) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to set default card',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

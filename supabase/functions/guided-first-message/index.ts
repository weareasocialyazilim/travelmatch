/**
 * Supabase Edge Function: guided-first-message
 *
 * Manages the guided first message flow after messaging becomes eligible.
 *
 * Flow:
 * 1. User tries to send first message
 * 2. System checks if guided flow is required
 * 3. Select appropriate prompt based on eligibility type
 * 4. Return prompt to user
 * 5. User responds to prompt
 * 6. First actual message is sent
 * 7. Guided flow completes, free-form messaging begins
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';
import { createLogger } from '../_shared/logger.ts';

interface GuidedMessageRequest {
  conversationId: string;
  action: 'get_prompt' | 'submit_response' | 'skip' | 'complete';
  response?: string;
}

serve(async (req) => {
  const logger = createLogger('guided-first-message', req);
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const body: GuidedMessageRequest = await req.json();
    const { conversationId, action, response } = body;

    if (!conversationId || !action) {
      return new Response(
        JSON.stringify({ error: 'conversationId and action are required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify user is in conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, user_id, recipient_id, user_id')
      .eq('id', conversationId)
      .or(`user_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .single();

    if (convError || !conversation) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Check messaging eligibility
    const { data: eligibility, error: eligError } = await supabase
      .from('messaging_eligibility')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (eligError || !eligibility || eligibility.state !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Messaging not eligible', requires: 'eligibility' }),
        { status: 403, headers: corsHeaders }
      );
    }

    // Handle different actions
    switch (action) {
      case 'get_prompt':
        return handleGetPrompt(supabase, conversationId, user.id, eligibility, corsHeaders, logger);
      case 'submit_response':
        if (!response) {
          return new Response(
            JSON.stringify({ error: 'Response is required' }),
            { status: 400, headers: corsHeaders }
          );
        }
        return handleSubmitResponse(supabase, conversationId, user.id, response, corsHeaders, logger);
      case 'skip':
        return handleSkip(supabase, conversationId, user.id, corsHeaders, logger);
      case 'complete':
        return handleComplete(supabase, conversationId, user.id, corsHeaders, logger);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (error) {
    logger.error('Guided message request failed', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleGetPrompt(
  supabase: any,
  conversationId: string,
  userId: string,
  eligibility: any,
  corsHeaders: Record<string, string>,
  logger: any
) {
  // Check if guided state exists
  let { data: guidedState, error: guidedError } = await supabase
    .from('guided_first_message_state')
    .select('*')
    .eq('conversation_id', conversationId)
    .single();

  if (guidedError && guidedError.code !== 'PGRST116') {
    throw guidedError;
  }

  // If already complete, return that info
  if (guidedState && guidedState.phase === 'complete') {
    return new Response(
      JSON.stringify({
        success: true,
        phase: 'complete',
        canSendFreeForm: true,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // If no guided state, create one
  if (!guidedState) {
    // Select appropriate prompt based on eligibility type
    const prompt = await selectPrompt(supabase, conversationId, eligibility.eligibility_type);

    const { data: newState, error: createError } = await supabase
      .from('guided_first_message_state')
      .insert({
        conversation_id: conversationId,
        phase: 'prompt',
        prompt_variant: prompt.key,
        user_prompts: [JSON.stringify(prompt)],
      })
      .select()
      .single();

    if (createError) throw createError;
    guidedState = newState;
  }

  // Get the current prompt
  const currentPrompt = guidedState.user_prompts?.length > 0
    ? JSON.parse(guidedState.user_prompts[guidedState.user_prompts.length - 1])
    : null;

  logger.info('Returning prompt', { conversationId, promptVariant: guidedState.prompt_variant });

  return new Response(
    JSON.stringify({
      success: true,
      phase: guidedState.phase,
      prompt: currentPrompt,
      canSkip: true, // Users can skip guided flow if they want
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function selectPrompt(
  supabase: any,
  conversationId: string,
  eligibilityType?: string
) {
  // Get prompts based on eligibility type
  let query = supabase
    .from('guided_message_templates')
    .select('*')
    .eq('is_active', true);

  if (eligibilityType) {
    query = query.eq('category', eligibilityType);
  }

  const { data: prompts, error } = await query.order('created_at').limit(10);
  if (error) throw error;

  // If no prompts for category, get general ones
  if (!prompts || prompts.length === 0) {
    const { data: generalPrompts, genError } = await supabase
      .from('guided_message_templates')
      .select('*')
      .eq('is_active', true)
      .eq('category', 'general')
      .limit(5);

    if (genError) throw genError;
    return generalPrompts[Math.floor(Math.random() * generalPrompts.length)];
  }

  // Randomly select from available prompts
  const selected = prompts[Math.floor(Math.random() * prompts.length)];
  return {
    key: selected.template_key,
    text: selected.prompt_text,
    category: selected.category,
  };
}

async function handleSubmitResponse(
  supabase: any,
  conversationId: string,
  userId: string,
  response: string,
  corsHeaders: Record<string, string>,
  logger: any
) {
  // Get current guided state
  const { data: guidedState, error: stateError } = await supabase
    .from('guided_first_message_state')
    .select('*')
    .eq('conversation_id', conversationId)
    .single();

  if (stateError || !guidedState) {
    return new Response(
      JSON.stringify({ error: 'No guided flow in progress' }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Add response to history
  const prompts = guidedState.user_prompts || [];
  const responses = guidedState.user_responses || [];
  responses.push(response);

  // Update state to response phase
  const { data: updatedState, error: updateError } = await supabase
    .from('guided_first_message_state')
    .update({
      phase: 'response',
      user_responses: responses,
      updated_at: new Date().toISOString(),
    })
    .eq('id', guidedState.id)
    .select()
    .single();

  if (updateError) throw updateError;

  logger.info('Response submitted', { conversationId, userId });

  return new Response(
    JSON.stringify({
      success: true,
      phase: 'response',
      canSendFirstMessage: true,
      nextStep: 'send_first_message',
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleSkip(
  supabase: any,
  conversationId: string,
  userId: string,
  corsHeaders: Record<string, string>,
  logger: any
) {
  // Update state to skipped
  const { data: guidedState, error: stateError } = await supabase
    .from('guided_first_message_state')
    .select('*')
    .eq('conversation_id', conversationId)
    .single();

  if (stateError || !guidedState) {
    return new Response(
      JSON.stringify({ error: 'No guided flow to skip' }),
      { status: 400, headers: corsHeaders }
    );
  }

  const { error: updateError } = await supabase
    .from('guided_first_message_state')
    .update({
      phase: 'skipped',
      updated_at: new Date().toISOString(),
    })
    .eq('id', guidedState.id);

  if (updateError) throw updateError;

  logger.info('Guided flow skipped', { conversationId, userId });

  return new Response(
    JSON.stringify({
      success: true,
      phase: 'skipped',
      canSendFreeForm: true,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleComplete(
  supabase: any,
  conversationId: string,
  userId: string,
  corsHeaders: Record<string, string>,
  logger: any
) {
  // Mark guided flow as complete
  const { error: updateError } = await supabase
    .from('guided_first_message_state')
    .update({
      phase: 'complete',
      first_message_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('conversation_id', conversationId);

  if (updateError) throw updateError;

  logger.info('Guided flow completed', { conversationId, userId });

  return new Response(
    JSON.stringify({
      success: true,
      phase: 'complete',
      canSendFreeForm: true,
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

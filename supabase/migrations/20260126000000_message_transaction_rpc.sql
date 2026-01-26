-- =============================================================================
-- Message Transaction RPC
-- Wraps message sending in a transaction for atomicity
-- Prevents race conditions and ensures data consistency
-- =============================================================================

-- Create function to send message atomically
-- Returns message record on success, throws error on failure
CREATE OR REPLACE FUNCTION send_message_atomic(
  p_conversation_id UUID,
  p_sender_id UUID,
  p_receiver_id UUID,
  p_content TEXT,
  p_message_type TEXT DEFAULT 'text',
  p_visibility TEXT DEFAULT 'public'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message messages;
  v_result JSON;
BEGIN
  -- Start transaction
  BEGIN
    -- Insert message
    INSERT INTO messages (
      conversation_id,
      sender_id,
      receiver_id,
      content,
      type,
      visibility,
      created_at
    ) VALUES (
      p_conversation_id,
      p_sender_id,
      p_receiver_id,
      p_content,
      p_message_type,
      p_visibility,
      NOW()
    )
    RETURNING * INTO v_message;

    -- Update conversation last_message_at atomically
    UPDATE conversations
    SET last_message_at = NOW()
    WHERE id = p_conversation_id;

    -- Return success
    v_result := json_build_object(
      'success', true,
      'message', json_build_object(
        'id', v_message.id,
        'conversation_id', v_message.conversation_id,
        'sender_id', v_message.sender_id,
        'content', v_message.content,
        'type', v_message.type,
        'visibility', v_message.visibility,
        'created_at', v_message.created_at
      )
    );

  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback is automatic on exception
      v_result := json_build_object(
        'success', false,
        'error', SQLERRM,
        'code', SQLSTATE
      );
  END;

  RETURN v_result;
END;
$$;

-- =============================================================================
-- Rate Limiting RPC (enhanced)
-- =============================================================================

-- Create improved rate limit function with better tracking
CREATE OR REPLACE FUNCTION check_message_rate_limit(
  p_user_id UUID,
  p_window_seconds INTEGER DEFAULT 60,
  p_max_messages INTEGER DEFAULT 20
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_result BOOLEAN;
BEGIN
  -- Count messages in window
  SELECT COUNT(*) INTO v_count
  FROM messages
  WHERE sender_id = p_user_id
    AND created_at > NOW() - (p_window_seconds || ' seconds')::INTERVAL;

  -- Return true if under limit, false if over
  v_result := v_count < p_max_messages;

  -- Log rate limit check (for monitoring)
  INSERT INTO rate_limit_logs (
    user_id,
    window_seconds,
    max_messages,
    current_count,
    allowed
  ) VALUES (
    p_user_id,
    p_window_seconds,
    p_max_messages,
    v_count,
    v_result
  );

  RETURN v_result;
END;
$$;

-- =============================================================================
-- Grant execute permissions (managed separately per environment)
-- Note: In Supabase, functions are created with SECURITY DEFINER by default
-- =============================================================================

-- Grant execute on functions to authenticated users
-- This is done via SQL execution in the dashboard or via CLI

-- ============================================================================
-- Lovendo RLS Policy Templates
-- Version: 2.0
-- 
-- Usage: Copy and customize these templates for each table.
-- Replace {{TABLE_NAME}}, {{OWNER_COLUMN}}, etc. with actual values.
--
-- CRITICAL: Always test with `supabase test db` before deploying!
-- ============================================================================

-- ============================================================================
-- TEMPLATE 1: Standard User-Owned Resource
-- Use for: moments, trips, bookings, user_settings
-- Pattern: User can CRUD their own resources
-- ============================================================================

/*
-- Enable RLS
ALTER TABLE {{TABLE_NAME}} ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own resources
CREATE POLICY "{{TABLE_NAME}}_select_own"
ON {{TABLE_NAME}}
FOR SELECT
TO authenticated
USING (
  {{OWNER_COLUMN}} = auth.uid()
);

-- Policy: Users can insert their own resources
CREATE POLICY "{{TABLE_NAME}}_insert_own"
ON {{TABLE_NAME}}
FOR INSERT
TO authenticated
WITH CHECK (
  {{OWNER_COLUMN}} = auth.uid()
);

-- Policy: Users can update their own resources
CREATE POLICY "{{TABLE_NAME}}_update_own"
ON {{TABLE_NAME}}
FOR UPDATE
TO authenticated
USING (
  {{OWNER_COLUMN}} = auth.uid()
)
WITH CHECK (
  {{OWNER_COLUMN}} = auth.uid()
);

-- Policy: Users can delete their own resources
CREATE POLICY "{{TABLE_NAME}}_delete_own"
ON {{TABLE_NAME}}
FOR DELETE
TO authenticated
USING (
  {{OWNER_COLUMN}} = auth.uid()
);
*/


-- ============================================================================
-- TEMPLATE 2: Public Read, Owner Write
-- Use for: moments (public), profiles (public view)
-- Pattern: Anyone can view, only owner can modify
-- ============================================================================

/*
ALTER TABLE {{TABLE_NAME}} ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published/public resources
CREATE POLICY "{{TABLE_NAME}}_select_public"
ON {{TABLE_NAME}}
FOR SELECT
TO authenticated
USING (
  {{VISIBILITY_COLUMN}} = 'public'
  OR {{OWNER_COLUMN}} = auth.uid()
);

-- Policy: Only owner can insert
CREATE POLICY "{{TABLE_NAME}}_insert_own"
ON {{TABLE_NAME}}
FOR INSERT
TO authenticated
WITH CHECK (
  {{OWNER_COLUMN}} = auth.uid()
);

-- Policy: Only owner can update
CREATE POLICY "{{TABLE_NAME}}_update_own"
ON {{TABLE_NAME}}
FOR UPDATE
TO authenticated
USING ({{OWNER_COLUMN}} = auth.uid())
WITH CHECK ({{OWNER_COLUMN}} = auth.uid());

-- Policy: Only owner can delete
CREATE POLICY "{{TABLE_NAME}}_delete_own"
ON {{TABLE_NAME}}
FOR DELETE
TO authenticated
USING ({{OWNER_COLUMN}} = auth.uid());
*/


-- ============================================================================
-- TEMPLATE 3: Conversation/Chat Resources
-- Use for: messages, conversation_participants
-- Pattern: Participants can access, sender owns message
-- ============================================================================

/*
ALTER TABLE {{TABLE_NAME}} ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is conversation participant
-- IMPORTANT: Use SECURITY INVOKER, not DEFINER for this check
CREATE OR REPLACE FUNCTION is_conversation_participant(
  p_conversation_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.conversation_participants 
    WHERE conversation_id = p_conversation_id 
    AND user_id = p_user_id
  );
$$;

-- Policy: Participants can view messages
CREATE POLICY "{{TABLE_NAME}}_select_participant"
ON {{TABLE_NAME}}
FOR SELECT
TO authenticated
USING (
  is_conversation_participant(conversation_id, auth.uid())
);

-- Policy: Participants can insert messages
CREATE POLICY "{{TABLE_NAME}}_insert_participant"
ON {{TABLE_NAME}}
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND is_conversation_participant(conversation_id, auth.uid())
);

-- Policy: Sender can update own messages (e.g., edit)
CREATE POLICY "{{TABLE_NAME}}_update_sender"
ON {{TABLE_NAME}}
FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- Policy: Sender can delete own messages
CREATE POLICY "{{TABLE_NAME}}_delete_sender"
ON {{TABLE_NAME}}
FOR DELETE
TO authenticated
USING (sender_id = auth.uid());
*/


-- ============================================================================
-- TEMPLATE 4: Financial/Sensitive Resources
-- Use for: payments, transactions, escrow, balances
-- Pattern: Strict owner-only with audit logging
-- ============================================================================

/*
ALTER TABLE {{TABLE_NAME}} ENABLE ROW LEVEL SECURITY;

-- CRITICAL: Financial tables need extra protection
-- 1. Use SECURITY DEFINER functions with explicit search_path
-- 2. Always verify auth.uid() INSIDE the function
-- 3. Log all operations

-- Secure function template for balance operations
CREATE OR REPLACE FUNCTION secure_{{OPERATION}}_{{TABLE_NAME}}(
  p_user_id UUID,
  p_amount DECIMAL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID;
BEGIN
  -- CRITICAL: Verify caller identity
  v_caller_id := auth.uid();
  
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- CRITICAL: Verify caller matches target user OR is service role
  IF v_caller_id != p_user_id AND 
     NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_caller_id AND role = 'service_role') THEN
    RAISE EXCEPTION 'Unauthorized: Cannot modify other user balance';
  END IF;
  
  -- Perform operation with explicit schema
  UPDATE public.{{TABLE_NAME}}
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Audit log
  INSERT INTO public.audit_logs (
    user_id, 
    action, 
    table_name, 
    details,
    created_at
  ) VALUES (
    v_caller_id,
    '{{OPERATION}}',
    '{{TABLE_NAME}}',
    jsonb_build_object('amount', p_amount, 'target_user', p_user_id),
    NOW()
  );
END;
$$;

-- Policy: Users can only view their own financial data
CREATE POLICY "{{TABLE_NAME}}_select_own"
ON {{TABLE_NAME}}
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: NO direct insert/update/delete - use secure functions only
-- Block all direct modifications
CREATE POLICY "{{TABLE_NAME}}_no_direct_insert"
ON {{TABLE_NAME}}
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "{{TABLE_NAME}}_no_direct_update"
ON {{TABLE_NAME}}
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "{{TABLE_NAME}}_no_direct_delete"
ON {{TABLE_NAME}}
FOR DELETE
TO authenticated
USING (false);
*/


-- ============================================================================
-- TEMPLATE 5: Admin-Only Resources
-- Use for: admin_settings, system_configs, moderation_logs
-- Pattern: Only admin/service role can access
-- ============================================================================

/*
ALTER TABLE {{TABLE_NAME}} ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = p_user_id 
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Policy: Only admins can view
CREATE POLICY "{{TABLE_NAME}}_select_admin"
ON {{TABLE_NAME}}
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Policy: Only admins can insert
CREATE POLICY "{{TABLE_NAME}}_insert_admin"
ON {{TABLE_NAME}}
FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()));

-- Policy: Only admins can update
CREATE POLICY "{{TABLE_NAME}}_update_admin"
ON {{TABLE_NAME}}
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Policy: Only admins can delete
CREATE POLICY "{{TABLE_NAME}}_delete_admin"
ON {{TABLE_NAME}}
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));
*/


-- ============================================================================
-- TEMPLATE 6: Soft Delete Pattern
-- Use for: Any table that needs soft delete with archived_at column
-- Pattern: Hide archived records from normal queries
-- ============================================================================

/*
ALTER TABLE {{TABLE_NAME}} ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see non-archived resources
CREATE POLICY "{{TABLE_NAME}}_select_active"
ON {{TABLE_NAME}}
FOR SELECT
TO authenticated
USING (
  {{OWNER_COLUMN}} = auth.uid()
  AND (archived_at IS NULL OR archived_at > NOW())
);

-- Policy: Users can "delete" by setting archived_at
CREATE POLICY "{{TABLE_NAME}}_soft_delete"
ON {{TABLE_NAME}}
FOR UPDATE
TO authenticated
USING ({{OWNER_COLUMN}} = auth.uid())
WITH CHECK (
  {{OWNER_COLUMN}} = auth.uid()
  -- Only allow setting archived_at, not unsetting
  AND (
    archived_at IS NOT NULL 
    OR NEW.archived_at IS NOT NULL
  )
);

-- Prevent actual DELETE - use soft delete instead
CREATE POLICY "{{TABLE_NAME}}_no_hard_delete"
ON {{TABLE_NAME}}
FOR DELETE
TO authenticated
USING (false);
*/


-- ============================================================================
-- ANTI-PATTERNS TO AVOID
-- ============================================================================

/*
❌ DON'T: Use SECURITY DEFINER without search_path
   CREATE FUNCTION bad_func() SECURITY DEFINER AS $$ ... $$;
   
✅ DO: Always set search_path
   CREATE FUNCTION good_func() 
   SECURITY DEFINER 
   SET search_path = public, pg_temp
   AS $$ ... $$;

❌ DON'T: Forget auth.uid() check in SECURITY DEFINER
   CREATE FUNCTION bad_func(user_id UUID) SECURITY DEFINER AS $$
     UPDATE users SET ... WHERE id = user_id;  -- No auth check!
   $$;

✅ DO: Always verify auth.uid() inside SECURITY DEFINER
   CREATE FUNCTION good_func(user_id UUID) SECURITY DEFINER AS $$
   DECLARE
     v_caller UUID := auth.uid();
   BEGIN
     IF v_caller IS NULL OR v_caller != user_id THEN
       RAISE EXCEPTION 'Unauthorized';
     END IF;
     UPDATE users SET ... WHERE id = user_id;
   END;
   $$;

❌ DON'T: Use multiple permissive policies (they OR together)
   CREATE POLICY "a" ON t FOR SELECT USING (owner = auth.uid());
   CREATE POLICY "b" ON t FOR SELECT USING (is_public = true);
   -- Results in: owner = auth.uid() OR is_public = true (might be too permissive)

✅ DO: Combine conditions in single policy OR use restrictive
   CREATE POLICY "combined" ON t FOR SELECT USING (
     owner = auth.uid() OR is_public = true
   );

❌ DON'T: Forget WITH CHECK on INSERT/UPDATE
   CREATE POLICY "insert" ON t FOR INSERT USING (owner = auth.uid());
   -- USING alone doesn't validate new rows!

✅ DO: Use WITH CHECK for write operations
   CREATE POLICY "insert" ON t FOR INSERT WITH CHECK (owner = auth.uid());
   CREATE POLICY "update" ON t FOR UPDATE 
     USING (owner = auth.uid()) 
     WITH CHECK (owner = auth.uid());
*/


-- ============================================================================
-- TESTING CHECKLIST
-- Run these tests before every deployment
-- ============================================================================

/*
-- Test 1: Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false;
-- Should return empty if all tables have RLS

-- Test 2: Check for SECURITY DEFINER without search_path
SELECT proname, prosecdef 
FROM pg_proc 
WHERE prosecdef = true 
AND proconfig IS NULL;
-- Should return empty

-- Test 3: Verify no direct access to sensitive tables
-- (Run as authenticated user, not service_role)
SET ROLE authenticated;
SET request.jwt.claim.sub = 'test-user-id';

-- These should fail or return empty:
SELECT * FROM payments WHERE user_id != auth.uid();
INSERT INTO payments (user_id, amount) VALUES ('other-user', 100);

RESET ROLE;

-- Test 4: Verify owner checks work
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-1';

-- This should work:
SELECT * FROM moments WHERE owner_id = 'user-1';

-- This should return empty:
SELECT * FROM moments WHERE owner_id = 'user-2' AND visibility = 'private';

RESET ROLE;
*/

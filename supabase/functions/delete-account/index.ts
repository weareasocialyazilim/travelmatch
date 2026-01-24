/**
 * Delete Account Edge Function
 * EK-P0-1: Move critical writes to Edge Functions
 *
 * Handles soft account deletion.
 * Previously done directly in client, now secured server-side.
 *
 * SECURITY:
 * - Requires authenticated user (JWT)
 * - User can only delete their own account
 * - Uses service_role for DB operations
 * - Logs deletion to audit_logs
 * - Signs out user after deletion
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createSupabaseClients, requireAuth } from '../_shared/supabase.ts';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { Logger } from '../_shared/logger.ts';

const logger = new Logger('delete-account');

serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Only POST or DELETE allowed
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return errorResponse('Method not allowed', 405, req);
  }

  try {
    logger.setRequestContext(req);

    // Get authenticated user
    const { userClient, adminClient } = createSupabaseClients({ request: req });
    const user = await requireAuth(userClient);

    logger.setContext({ userId: user.id });
    logger.info('Account deletion request received');

    // Call the secure RPC function (uses service_role)
    const { data: result, error: rpcError } = await adminClient.rpc('soft_delete_account', {
      p_user_id: user.id,
    });

    if (rpcError) {
      logger.error('Account deletion failed', new Error(rpcError.message));
      return errorResponse(rpcError.message, 400, req);
    }

    // Sign out the user
    const { error: signOutError } = await userClient.auth.signOut();
    if (signOutError) {
      logger.warn('Sign out after deletion failed', { error: signOutError.message });
      // Don't fail the request - account is already deleted
    }

    logger.info('Account deleted successfully');

    return jsonResponse({
      success: true,
      message: 'Account deleted successfully',
    }, 200, req);

  } catch (error) {
    const err = error as Error;
    logger.error('Unexpected error', err);

    if (err.message === 'Authentication required') {
      return errorResponse('Unauthorized', 401, req);
    }

    return errorResponse(err.message || 'Internal server error', 500, req);
  }
});

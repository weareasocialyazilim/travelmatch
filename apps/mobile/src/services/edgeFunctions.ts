/**
 * Edge Functions Service
 * EK-P0-1: Move critical writes to Edge Functions
 *
 * This module provides type-safe wrappers for calling Supabase Edge Functions.
 * All critical business logic operations should go through these functions
 * instead of direct database access.
 *
 * SECURITY:
 * - All requests include the user's JWT for authentication
 * - Edge Functions use service_role for privileged operations
 * - Client never has direct write access to critical tables
 */

import { supabase, SUPABASE_EDGE_URL } from '@/config/supabase';
import { logger } from '@/utils/logger';

// =============================================================================
// TYPES
// =============================================================================

interface EdgeFunctionResponse<T = unknown> {
  data: T | null;
  error: Error | null;
}

interface GiftApproveRequest {
  gift_id: string;
  sender_id?: string;
}

interface GiftApproveResponse {
  success: boolean;
  gift_id?: string;
  already_approved?: boolean;
  message?: string;
}

interface DeleteAccountResponse {
  success: boolean;
  message: string;
}

interface SendNotificationRequest {
  user_id: string;
  type: 'gratitude_received' | 'message_received';
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface SendNotificationResponse {
  success: boolean;
  notification_id?: string;
}

interface SignedUrlRequest {
  bucket: string;
  path: string;
  expiresIn?: number; // seconds, default 3600
}

interface SignedUrlResponse {
  signed_url: string;
  expires_at: string;
}

type InvokeOptions = Parameters<typeof supabase.functions.invoke>[1];
type EdgeFunctionPayload = InvokeOptions extends { body?: infer B }
  ? B
  : unknown;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get current session token
 */
async function getAccessToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

/**
 * Call an Edge Function with proper authentication
 */
async function callEdgeFunction<
  TRequest extends EdgeFunctionPayload,
  TResponse,
>(
  functionName: string,
  payload: TRequest,
): Promise<EdgeFunctionResponse<TResponse>> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase.functions.invoke<TResponse>(
      functionName,
      {
        body: payload as EdgeFunctionPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (error) {
      logger.error(`[EdgeFunction] ${functionName} failed:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    logger.error(`[EdgeFunction] ${functionName} exception:`, error);
    return { data: null, error: error as Error };
  }
}

// =============================================================================
// EDGE FUNCTION WRAPPERS
// =============================================================================

/**
 * Approve gift chat unlock (host action)
 * Replaces direct supabase.from('gifts').update()
 */
export async function approveGiftChat(
  giftId: string,
  senderId?: string,
): Promise<EdgeFunctionResponse<GiftApproveResponse>> {
  logger.info('[EdgeFunction] Approving gift chat', { giftId });

  return callEdgeFunction<GiftApproveRequest, GiftApproveResponse>(
    'gift-approve',
    {
      gift_id: giftId,
      sender_id: senderId,
    },
  );
}

/**
 * Delete user account (soft delete)
 * Replaces direct supabase.from('users').update({ deleted_at })
 */
export async function deleteAccount(): Promise<
  EdgeFunctionResponse<DeleteAccountResponse>
> {
  logger.info('[EdgeFunction] Deleting account');

  return callEdgeFunction<Record<string, never>, DeleteAccountResponse>(
    'delete-account',
    {},
  );
}

/**
 * Send notification to another user
 * Replaces direct supabase.from('notifications').insert()
 */
export async function sendNotification(
  request: SendNotificationRequest,
): Promise<EdgeFunctionResponse<SendNotificationResponse>> {
  logger.info('[EdgeFunction] Sending notification', {
    type: request.type,
    targetUser: request.user_id,
  });

  return callEdgeFunction<SendNotificationRequest, SendNotificationResponse>(
    'send-notification',
    request,
  );
}

/**
 * Get signed URL for storage asset
 * Replaces getPublicUrl() with secure signed URLs
 */
export async function getSignedStorageUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600,
): Promise<EdgeFunctionResponse<SignedUrlResponse>> {
  // For now, use Supabase SDK's createSignedUrl directly
  // This is secure because it generates time-limited URLs
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      return { data: null, error };
    }

    return {
      data: {
        signed_url: data.signedUrl,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const edgeFunctions = {
  approveGiftChat,
  deleteAccount,
  sendNotification,
  getSignedStorageUrl,
};

export default edgeFunctions;

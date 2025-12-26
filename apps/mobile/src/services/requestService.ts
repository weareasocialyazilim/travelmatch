/**
 * Request Service
 * Gift requests, bookings, and related operations
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { requestsService as dbRequestsService } from './supabaseDbService';
import type { Database } from '../types/database.types';

// Type aliases for joined relation data
type UserRow = Database['public']['Tables']['users']['Row'];
type MomentRow = Database['public']['Tables']['moments']['Row'];
type RequestRow = Database['public']['Tables']['requests']['Row'];

// Request row with joined relations
type RequestRowWithRelations = RequestRow & {
  users?: UserRow | null;
  moments?: MomentRow | null;
};

// Types
export type RequestStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'cancelled'
  | 'completed'
  | 'expired';

export type RequestType = 'gift_request' | 'booking' | 'collaboration';

export interface GiftRequest {
  id: string;
  type: RequestType;
  status: RequestStatus | null;

  // Moment info
  momentId: string;
  momentTitle: string;
  momentImage: string;

  // Requester info (person making request)
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  requesterRating?: number;
  requesterVerified?: boolean;
  requesterLocation?: string;

  // Host info (moment owner)
  hostId: string;
  hostName: string;
  hostAvatar: string;

  // Request details
  message?: string;
  guestCount: number | null;
  preferredDates?: string[];
  selectedDate?: string | null;

  // Pricing
  pricePerGuest: number;
  totalPrice?: number;
  currency?: string | null;

  // Timestamps
  createdAt: string | null;
  updatedAt: string | null;
  expiresAt?: string;
  acceptedAt?: string;
  completedAt?: string;

  // Response
  hostResponse?: string;
  declineReason?: string;
}

export interface CreateRequestData {
  momentId: string;
  message?: string;
  guestCount: number;
  preferredDates?: string[];
}

export interface RequestResponse {
  accept: boolean;
  selectedDate?: string;
  message?: string;
  declineReason?: string;
}

export interface RequestFilters {
  status?: RequestStatus;
  type?: RequestType;
  role?: 'requester' | 'host';
  momentId?: string;
  page?: number;
  pageSize?: number;
}

// Request Service
export const requestService = {
  /**
   * Create a new gift request
   */
  createRequest: async (
    data: CreateRequestData,
  ): Promise<{ request: GiftRequest }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch moment to get host_id
      const { data: moment, error: momentError } = await supabase
        .from('moments')
        .select('user_id, price, currency, title, images')
        .eq('id', data.momentId)
        .single();

      if (momentError || !moment) throw new Error('Moment not found');

      const momentRow =
        moment as unknown as Database['public']['Tables']['moments']['Row'];

      const requestData = {
        user_id: user.id, // Requester
        moment_id: data.momentId,
        // host_id is not part of requests table in DB schema; store for backend if needed
        status: 'pending',
        message: data.message,
        // guest_count and pricing fields may be handled elsewhere; keep minimal insert
        type: 'gift_request',
      } as unknown as Database['public']['Tables']['requests']['Insert'];

      const { data: newRequest, error } =
        await dbRequestsService.create(requestData);
      if (error) throw error;

      const computedTotal =
        Number(momentRow.price || 0) * Number(data.guestCount || 0);

      const request: GiftRequest = {
        id: newRequest!.id,
        type: 'gift_request',
        status: 'pending',
        momentId: data.momentId,
        momentTitle: momentRow.title,
        momentImage: momentRow.images?.[0] || '',
        requesterId: user.id,
        requesterName: '',
        requesterAvatar: '',
        hostId: momentRow.user_id || '',
        hostName: '',
        hostAvatar: '',
        message: data.message,
        guestCount: data.guestCount,
        preferredDates: data.preferredDates,
        selectedDate: null,
        pricePerGuest: momentRow.price || 0,
        // Compute totalPrice locally to ensure UI/client consistency
        totalPrice: computedTotal,
        currency: momentRow.currency || 'USD',
        createdAt: newRequest!.created_at,
        updatedAt: newRequest!.created_at,
      };

      return { request };
    } catch (error) {
      logger.error('Create request error:', error);
      throw error;
    }
  },

  /**
   * Get all requests (as requester or host)
   */
  getRequests: async (
    filters?: RequestFilters,
  ): Promise<{ requests: GiftRequest[]; total: number }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Use DB service to get requests where I am the requester
      const { data, count, error } = await dbRequestsService.list({
        userId: user.id,
        status: filters?.status,
      });

      if (error) throw error;

      const requests: GiftRequest[] = (data || []).map((row: unknown) => {
        const r = row as RequestRowWithRelations;
        return {
          id: r.id,
          type: 'gift_request',
          status: r.status as RequestStatus | null,
          momentId: r.moment_id,
          momentTitle: r.moments?.title || '',
          momentImage: r.moments?.images?.[0] || '',
          requesterId: r.user_id,
          requesterName: r.users?.full_name || '',
          requesterAvatar: r.users?.avatar_url || '',
          requesterRating: r.users?.rating || 0,
          requesterVerified: r.users?.verified || false,
          requesterLocation: r.users?.location || '',
          hostId: r.moments?.user_id || '',
          hostName: '',
          hostAvatar: '',
          message: r.message ?? undefined,
          guestCount: null,
          preferredDates: undefined,
          selectedDate: undefined,
          pricePerGuest: 0,
          totalPrice: undefined,
          currency: undefined,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          expiresAt: undefined,
          acceptedAt: undefined,
          completedAt: undefined,
        };
      });

      return { requests, total: count };
    } catch (error) {
      logger.error('Get requests error:', error);
      return { requests: [], total: 0 };
    }
  },

  /**
   * Get requests I made (as requester)
   */
  getSentRequests: async (
    filters?: Omit<RequestFilters, 'role'>,
  ): Promise<{ requests: GiftRequest[]; total: number }> => {
    return requestService.getRequests({ ...filters, role: 'requester' });
  },

  /**
   * Get requests I received (as host)
   */
  getReceivedRequests: async (
    _filters?: Omit<RequestFilters, 'role'>,
  ): Promise<{ requests: GiftRequest[]; total: number }> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const {
        data,
        count: _count,
        error,
      } = await supabase
        .from('requests')
        .select('*, users(*), moments(*)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter by moment owner (host)
      const filtered = (data || []).filter((row: unknown) => {
        const r = row as RequestRowWithRelations;
        return (r?.moments?.user_id ?? '') === user.id;
      });

      const requests: GiftRequest[] = filtered.map((row: unknown) => {
        const r = row as RequestRowWithRelations;
        return {
          id: r.id,
          type: 'gift_request',
          status: r.status as RequestStatus | null,
          momentId: r.moment_id,
          momentTitle: r.moments?.title || '',
          momentImage: r.moments?.images?.[0] || '',
          requesterId: r.user_id,
          requesterName: r.users?.full_name || '',
          requesterAvatar: r.users?.avatar_url || '',
          requesterRating: r.users?.rating || 0,
          requesterVerified: r.users?.verified || false,
          requesterLocation: r.users?.location || '',
          hostId: r.moments?.user_id || '',
          hostName: '',
          hostAvatar: '',
          message: r.message ?? undefined,
          guestCount: null,
          preferredDates: undefined,
          selectedDate: undefined,
          pricePerGuest: 0,
          totalPrice: undefined,
          currency: undefined,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        };
      });

      return { requests, total: filtered.length || 0 };
    } catch (error) {
      logger.error('Get received requests error:', error);
      return { requests: [], total: 0 };
    }
  },

  /**
   * Get a single request by ID
   */
  getRequest: async (requestId: string): Promise<{ request: GiftRequest }> => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*, users(*), moments(*)')
        .eq('id', requestId)
        .single();

      if (error) throw error;

      const row = data as unknown as RequestRowWithRelations;

      const request: GiftRequest = {
        id: row.id,
        type: 'gift_request',
        status: row.status as RequestStatus | null,
        momentId: row.moment_id,
        momentTitle: row.moments?.title || '',
        momentImage: row.moments?.images?.[0] || '',
        requesterId: row.user_id,
        requesterName: row.users?.full_name || '',
        requesterAvatar: row.users?.avatar_url || '',
        hostId: row.moments?.user_id || '',
        hostName: '',
        hostAvatar: '',
        message: row.message ?? undefined,
        guestCount: null,
        preferredDates: undefined,
        selectedDate: undefined,
        pricePerGuest: 0,
        totalPrice: undefined,
        currency: undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      return { request };
    } catch (error) {
      logger.error('Get request error:', error);
      throw error;
    }
  },

  /**
   * Accept a request (as host)
   */
  acceptRequest: async (
    requestId: string,
    data: { selectedDate?: string; message?: string },
  ): Promise<{ request: GiftRequest }> => {
    try {
      const { data: _updated, error } = await dbRequestsService.updateStatus(
        requestId,
        'accepted',
      );
      if (error) throw error;

      // Also update selected date if provided
      if (data.selectedDate) {
        await supabase
          .from('requests')
          .update({
            selected_date: data.selectedDate,
          } as Database['public']['Tables']['requests']['Update'])
          .eq('id', requestId);
      }

      // Return updated request (simplified)
      return requestService.getRequest(requestId);
    } catch (error) {
      logger.error('Accept request error:', error);
      throw error;
    }
  },

  /**
   * Decline a request (as host)
   */
  declineRequest: async (
    requestId: string,
    _reason?: string,
  ): Promise<{ request: GiftRequest }> => {
    try {
      const { data: _updated, error } = await dbRequestsService.updateStatus(
        requestId,
        'rejected',
      );
      if (error) throw error;

      return requestService.getRequest(requestId);
    } catch (error) {
      logger.error('Decline request error:', error);
      throw error;
    }
  },

  /**
   * Cancel a request (as requester)
   */
  cancelRequest: async (
    requestId: string,
  ): Promise<{ request: GiftRequest }> => {
    try {
      const { data: _updated, error } = await dbRequestsService.updateStatus(
        requestId,
        'cancelled',
      );
      if (error) throw error;

      return requestService.getRequest(requestId);
    } catch (error) {
      logger.error('Cancel request error:', error);
      throw error;
    }
  },

  /**
   * Complete a request
   */
  completeRequest: async (
    requestId: string,
  ): Promise<{ request: GiftRequest }> => {
    try {
      const { data: _updated, error } = await dbRequestsService.updateStatus(
        requestId,
        'completed',
      );
      if (error) throw error;

      return requestService.getRequest(requestId);
    } catch (error) {
      logger.error('Complete request error:', error);
      throw error;
    }
  },
};

// Helper functions
export const getStatusColor = (status: RequestStatus): string => {
  switch (status) {
    case 'pending':
      return '#FFC107'; // Amber
    case 'accepted':
      return '#4CAF50'; // Green
    case 'declined':
      return '#F44336';
    case 'cancelled':
      return '#9E9E9E';
    case 'completed':
      return '#2196F3';
    case 'expired':
      return '#9E9E9E';
    default:
      return '#9E9E9E';
  }
};

export const getStatusLabel = (status: RequestStatus): string => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'accepted':
      return 'Accepted';
    case 'declined':
      return 'Declined';
    case 'cancelled':
      return 'Cancelled';
    case 'completed':
      return 'Completed';
    case 'expired':
      return 'Expired';
    default: {
      const s = status as string;
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
  }
};

export const canCancel = (status: RequestStatus): boolean => {
  return status === 'pending' || status === 'accepted';
};

export const canRespond = (status: RequestStatus): boolean => {
  return status === 'pending';
};

export const canComplete = (status: RequestStatus): boolean => {
  return status === 'accepted';
};

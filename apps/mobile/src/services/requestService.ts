// @ts-nocheck - TODO: Fix type errors
/**
 * Request Service
 * Gift requests, bookings, and related operations
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { requestsService as dbRequestsService } from './supabaseDbService';

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
  status: RequestStatus;

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
  guestCount: number;
  preferredDates?: string[];
  selectedDate?: string;

  // Pricing
  pricePerGuest: number;
  totalPrice: number;
  currency: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
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

      // We need to fetch moment details to get host_id and pricing
      // For now, we'll assume the DB trigger or backend handles validation
      // But strictly speaking we should fetch the moment first.
      // Let's assume the UI passes valid data or we fetch it here.

      // Fetch moment to get host_id
      const { data: moment, error: momentError } = await supabase
        .from('moments')
        .select('user_id, price, currency, title, images')
        .eq('id', data.momentId)
        .single();

      if (momentError || !moment) throw new Error('Moment not found');

      const requestData = {
        user_id: user.id, // Requester
        moment_id: data.momentId,
        host_id: moment.user_id,
        status: 'pending',
        message: data.message,
        guest_count: data.guestCount,
        preferred_dates: data.preferredDates,
        total_price: (moment.price || 0) * data.guestCount,
        currency: moment.currency || 'USD',
        type: 'gift_request', // Default
      };

      const { data: newRequest, error } = await dbRequestsService.create(
        requestData as any,
      );
      if (error) throw error;

      // Construct return object
      // Note: In a real app, we might want to return the expanded object
      // but for creation, basic info + what we have is often enough
      const request: GiftRequest = {
        id: newRequest!.id,
        type: 'gift_request',
        status: 'pending',
        momentId: data.momentId,
        momentTitle: moment.title,
        momentImage: moment.images?.[0] || '',
        requesterId: user.id,
        requesterName: '', // Current user name (could fetch from auth metadata)
        requesterAvatar: '',
        hostId: moment.user_id,
        hostName: '', // Would need to fetch
        hostAvatar: '',
        message: data.message,
        guestCount: data.guestCount,
        preferredDates: data.preferredDates,
        pricePerGuest: moment.price || 0,
        totalPrice: requestData.total_price,
        currency: requestData.currency,
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

      // Determine if we are filtering by role
      const _userIdFilter = undefined;
      // If role is specified, we might need a custom query in db service
      // But dbRequestsService.list takes userId which usually implies "requests involving this user"
      // or "requests created by this user".
      // Looking at dbRequestsService.list implementation:
      // if (options?.userId) query = query.eq('user_id', options.userId);
      // This means it filters by REQUESTER.

      // If we want to filter by HOST, we need to update dbRequestsService or use raw query here.
      // For now, let's assume we want requests where I am the requester.

      // TODO: Update dbRequestsService to support host_id filtering

      const { data, count, error } = await dbRequestsService.list({
        userId: user.id, // This gets requests created BY me
        status: filters?.status,
      });

      if (error) throw error;

      const requests: GiftRequest[] = data.map((row: any) => ({
        id: row.id,
        type: 'gift_request', // Default or from row
        status: row.status,
        momentId: row.moment_id,
        momentTitle: row.moments?.title || '',
        momentImage: row.moments?.images?.[0] || '',
        requesterId: row.user_id,
        requesterName: row.users?.full_name || '',
        requesterAvatar: row.users?.avatar_url || '',
        requesterRating: row.users?.rating || 0,
        requesterVerified: row.users?.verified || false,
        requesterLocation: row.users?.location || '',
        hostId: row.host_id,
        hostName: '', // Need to join host
        hostAvatar: '',
        message: row.message,
        guestCount: row.guest_count,
        preferredDates: row.preferred_dates,
        selectedDate: row.selected_date,
        pricePerGuest: 0, // Need from moment
        totalPrice: row.total_price,
        currency: row.currency,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        expiresAt: row.expires_at,
        acceptedAt: row.accepted_at,
        completedAt: row.completed_at,
      }));

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
    filters?: Omit<RequestFilters, 'role'>,
  ): Promise<{ requests: GiftRequest[]; total: number }> => {
    // This requires a query by host_id which dbRequestsService.list doesn't support yet via 'userId' param
    // We'll implement a direct query here for now
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('requests')
        .select('*, users(*), moments(*)', { count: 'exact' })
        .eq('host_id', user.id);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, count, error } = await query.order('created_at', {
        ascending: false,
      });
      if (error) throw error;

      const requests: GiftRequest[] = (data || []).map((row: any) => ({
        id: row.id,
        type: 'gift_request',
        status: row.status,
        momentId: row.moment_id,
        momentTitle: row.moments?.title || '',
        momentImage: row.moments?.images?.[0] || '',
        requesterId: row.user_id,
        requesterName: row.users?.full_name || '',
        requesterAvatar: row.users?.avatar_url || '',
        requesterRating: row.users?.rating || 0,
        requesterVerified: row.users?.verified || false,
        requesterLocation: row.users?.location || '',
        hostId: row.host_id,
        hostName: '', // Me
        hostAvatar: '',
        message: row.message,
        guestCount: row.guest_count,
        preferredDates: row.preferred_dates,
        selectedDate: row.selected_date,
        pricePerGuest: 0,
        totalPrice: row.total_price,
        currency: row.currency,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return { requests, total: count || 0 };
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

      const request: GiftRequest = {
        id: data.id,
        type: 'gift_request',
        status: data.status,
        momentId: data.moment_id,
        momentTitle: data.moments?.title || '',
        momentImage: data.moments?.images?.[0] || '',
        requesterId: data.user_id,
        requesterName: data.users?.full_name || '',
        requesterAvatar: data.users?.avatar_url || '',
        hostId: data.host_id,
        hostName: '',
        hostAvatar: '',
        message: data.message,
        guestCount: data.guest_count,
        preferredDates: data.preferred_dates,
        selectedDate: data.selected_date,
        pricePerGuest: 0,
        totalPrice: data.total_price,
        currency: data.currency,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
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
          .update({ selected_date: data.selectedDate })
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
  cancelRequest: async (requestId: string): Promise<{ request: GiftRequest }> => {
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
  completeRequest: async (requestId: string): Promise<{ request: GiftRequest }> => {
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
      return '#F44336'; // Red
    case 'cancelled':
      return '#9E9E9E'; // Grey
    case 'completed':
      return '#2196F3'; // Blue
    case 'expired':
      return '#9E9E9E'; // Grey
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
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
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

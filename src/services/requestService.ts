/**
 * Request Service
 * Gift requests, bookings, and related operations
 */

import { api } from '../utils/api';
import { COLORS } from '../constants/colors';

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
    return api.post('/requests', data);
  },

  /**
   * Get all requests (as requester or host)
   */
  getRequests: async (
    filters?: RequestFilters,
  ): Promise<{ requests: GiftRequest[]; total: number }> => {
    return api.get('/requests', { params: filters });
  },

  /**
   * Get requests I made (as requester)
   */
  getSentRequests: async (
    filters?: Omit<RequestFilters, 'role'>,
  ): Promise<{ requests: GiftRequest[]; total: number }> => {
    return api.get('/requests', { params: { ...filters, role: 'requester' } });
  },

  /**
   * Get requests I received (as host)
   */
  getReceivedRequests: async (
    filters?: Omit<RequestFilters, 'role'>,
  ): Promise<{ requests: GiftRequest[]; total: number }> => {
    return api.get('/requests', { params: { ...filters, role: 'host' } });
  },

  /**
   * Get a single request by ID
   */
  getRequest: async (requestId: string): Promise<{ request: GiftRequest }> => {
    return api.get(`/requests/${requestId}`);
  },

  /**
   * Accept a request (as host)
   */
  acceptRequest: async (
    requestId: string,
    data: { selectedDate?: string; message?: string },
  ): Promise<{ request: GiftRequest }> => {
    return api.post(`/requests/${requestId}/accept`, data);
  },

  /**
   * Decline a request (as host)
   */
  declineRequest: async (
    requestId: string,
    reason?: string,
  ): Promise<{ request: GiftRequest }> => {
    return api.post(`/requests/${requestId}/decline`, { reason });
  },

  /**
   * Cancel a request (as requester)
   */
  cancelRequest: async (
    requestId: string,
  ): Promise<{ request: GiftRequest }> => {
    return api.post(`/requests/${requestId}/cancel`);
  },

  /**
   * Mark request as completed (after the experience)
   */
  completeRequest: async (
    requestId: string,
  ): Promise<{ request: GiftRequest }> => {
    return api.post(`/requests/${requestId}/complete`);
  },

  /**
   * Get pending requests count
   */
  getPendingCount: async (): Promise<{ sent: number; received: number }> => {
    return api.get('/requests/pending-count');
  },

  /**
   * Check availability for a moment
   */
  checkAvailability: async (
    momentId: string,
    dates: string[],
  ): Promise<{
    available: boolean;
    availableDates: string[];
    unavailableDates: string[];
  }> => {
    return api.post(`/moments/${momentId}/check-availability`, { dates });
  },

  /**
   * Get request history with a specific user
   */
  getHistoryWithUser: async (
    userId: string,
  ): Promise<{ requests: GiftRequest[] }> => {
    return api.get(`/requests/history/${userId}`);
  },
};

// Helper functions
export const getStatusColor = (status: RequestStatus): string => {
  const colors: Record<RequestStatus, string> = {
    pending: COLORS.warning, // Amber
    accepted: COLORS.emerald, // Green
    declined: COLORS.error, // Red
    cancelled: COLORS.grayMedium, // Gray
    completed: COLORS.info, // Blue
    expired: COLORS.grayLight, // Light gray
  };
  return colors[status];
};

export const getStatusLabel = (status: RequestStatus): string => {
  const labels: Record<RequestStatus, string> = {
    pending: 'Pending',
    accepted: 'Accepted',
    declined: 'Declined',
    cancelled: 'Cancelled',
    completed: 'Completed',
    expired: 'Expired',
  };
  return labels[status];
};

export const canCancel = (request: GiftRequest, userId: string): boolean => {
  return request.requesterId === userId && request.status === 'pending';
};

export const canRespond = (request: GiftRequest, userId: string): boolean => {
  return request.hostId === userId && request.status === 'pending';
};

export const canComplete = (request: GiftRequest): boolean => {
  return request.status === 'accepted' && !!request.selectedDate;
};

export default requestService;

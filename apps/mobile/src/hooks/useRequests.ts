/**
 * useRequests Hook
 * Gift request management for both travelers and hosts
 */
import { useState, useEffect, useCallback } from 'react';
import { requestService } from '../services/requestService';
import { logger } from '../utils/logger';
import type {
  GiftRequest,
  CreateRequestData,
  RequestStatus,
  RequestFilters,
} from '../services/requestService';

interface UseRequestsReturn {
  // Sent requests (as traveler)
  sentRequests: GiftRequest[];
  sentLoading: boolean;
  sentError: string | null;
  refreshSent: () => Promise<void>;

  // Received requests (as host)
  receivedRequests: GiftRequest[];
  receivedLoading: boolean;
  receivedError: string | null;
  refreshReceived: () => Promise<void>;

  // Actions
  createRequest: (data: CreateRequestData) => Promise<GiftRequest | null>;
  acceptRequest: (
    requestId: string,
    selectedDate?: string,
    message?: string,
  ) => Promise<boolean>;
  declineRequest: (requestId: string, reason?: string) => Promise<boolean>;
  cancelRequest: (requestId: string) => Promise<boolean>;
  completeRequest: (requestId: string) => Promise<boolean>;

  // Single request
  getRequest: (requestId: string) => Promise<GiftRequest | null>;

  // Counts
  pendingSentCount: number;
  pendingReceivedCount: number;

  // Filters
  filterSent: (status: RequestStatus | null) => void;
  filterReceived: (status: RequestStatus | null) => void;
  sentFilter: RequestStatus | null;
  receivedFilter: RequestStatus | null;
}

export const useRequests = (): UseRequestsReturn => {
  // Sent requests state
  const [sentRequests, setSentRequests] = useState<GiftRequest[]>([]);
  const [sentLoading, setSentLoading] = useState(true);
  const [sentError, setSentError] = useState<string | null>(null);
  const [sentFilter, setSentFilter] = useState<RequestStatus | null>(null);

  // Received requests state
  const [receivedRequests, setReceivedRequests] = useState<GiftRequest[]>([]);
  const [receivedLoading, setReceivedLoading] = useState(true);
  const [receivedError, setReceivedError] = useState<string | null>(null);
  const [receivedFilter, setReceivedFilter] = useState<RequestStatus | null>(
    null,
  );

  /**
   * Fetch sent requests
   */
  const fetchSentRequests = useCallback(async () => {
    try {
      setSentLoading(true);
      setSentError(null);

      const filters: RequestFilters = {};
      if (sentFilter) filters.status = sentFilter;

      const response = await requestService.getSentRequests(filters);
      setSentRequests(response.requests);
    } catch (err) {
      setSentError(
        err instanceof Error ? err.message : 'Failed to load sent requests',
      );
    } finally {
      setSentLoading(false);
    }
  }, [sentFilter]);

  /**
   * Fetch received requests
   */
  const fetchReceivedRequests = useCallback(async () => {
    try {
      setReceivedLoading(true);
      setReceivedError(null);

      const filters: RequestFilters = {};
      if (receivedFilter) filters.status = receivedFilter;

      const response = await requestService.getReceivedRequests(filters);
      setReceivedRequests(response.requests);
    } catch (err) {
      setReceivedError(
        err instanceof Error ? err.message : 'Failed to load received requests',
      );
    } finally {
      setReceivedLoading(false);
    }
  }, [receivedFilter]);

  /**
   * Refresh sent requests
   */
  const refreshSent = useCallback(async () => {
    await fetchSentRequests();
  }, [fetchSentRequests]);

  /**
   * Refresh received requests
   */
  const refreshReceived = useCallback(async () => {
    await fetchReceivedRequests();
  }, [fetchReceivedRequests]);

  /**
   * Create a new request
   */
  const createRequest = useCallback(
    async (data: CreateRequestData): Promise<GiftRequest | null> => {
      try {
        const response = await requestService.createRequest(data);
        setSentRequests((prev) => [response.request, ...prev]);
        return response.request;
      } catch (err) {
        logger.error('Failed to create request:', err);
        return null;
      }
    },
    [],
  );

  /**
   * Accept a request (as host)
   */
  const acceptRequest = useCallback(
    async (
      requestId: string,
      selectedDate?: string,
      message?: string,
    ): Promise<boolean> => {
      try {
        const response = await requestService.acceptRequest(requestId, {
          selectedDate,
          message,
        });

        setReceivedRequests((prev) =>
          prev.map((r) => (r.id === requestId ? response.request : r)),
        );

        return true;
      } catch (err) {
        logger.error('Failed to accept request:', err);
        return false;
      }
    },
    [],
  );

  /**
   * Decline a request (as host)
   */
  const declineRequest = useCallback(
    async (requestId: string, reason?: string): Promise<boolean> => {
      try {
        const response = await requestService.declineRequest(requestId, reason);

        setReceivedRequests((prev) =>
          prev.map((r) => (r.id === requestId ? response.request : r)),
        );

        return true;
      } catch (err) {
        logger.error('Failed to decline request:', err);
        return false;
      }
    },
    [],
  );

  /**
   * Cancel a request (as requester)
   */
  const cancelRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      try {
        const response = await requestService.cancelRequest(requestId);

        setSentRequests((prev) =>
          prev.map((r) => (r.id === requestId ? response.request : r)),
        );

        return true;
      } catch (err) {
        logger.error('Failed to cancel request:', err);
        return false;
      }
    },
    [],
  );

  /**
   * Complete a request
   */
  const completeRequest = useCallback(
    async (requestId: string): Promise<boolean> => {
      try {
        const response = await requestService.completeRequest(requestId);

        // Update in both lists
        const updateRequest = (list: GiftRequest[]) =>
          list.map((r) => (r.id === requestId ? response.request : r));

        setSentRequests(updateRequest);
        setReceivedRequests(updateRequest);

        return true;
      } catch (err) {
        logger.error('Failed to complete request:', err);
        return false;
      }
    },
    [],
  );

  /**
   * Get single request
   */
  const getRequest = useCallback(
    async (requestId: string): Promise<GiftRequest | null> => {
      try {
        const response = await requestService.getRequest(requestId);
        return response.request;
      } catch (err) {
        logger.error('Failed to get request:', err);
        return null;
      }
    },
    [],
  );

  /**
   * Filter sent requests
   */
  const filterSent = useCallback((status: RequestStatus | null) => {
    setSentFilter(status);
  }, []);

  /**
   * Filter received requests
   */
  const filterReceived = useCallback((status: RequestStatus | null) => {
    setReceivedFilter(status);
  }, []);

  // Calculate pending counts
  const pendingSentCount = sentRequests.filter(
    (r) => r.status === 'pending',
  ).length;
  const pendingReceivedCount = receivedRequests.filter(
    (r) => r.status === 'pending',
  ).length;

  // Initial load
  useEffect(() => {
    void fetchSentRequests();
    void fetchReceivedRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when filters change
  useEffect(() => {
    void fetchSentRequests();
  }, [sentFilter, fetchSentRequests]);

  useEffect(() => {
    void fetchReceivedRequests();
  }, [receivedFilter, fetchReceivedRequests]);

  return {
    // Sent requests
    sentRequests,
    sentLoading,
    sentError,
    refreshSent,

    // Received requests
    receivedRequests,
    receivedLoading,
    receivedError,
    refreshReceived,

    // Actions
    createRequest,
    acceptRequest,
    declineRequest,
    cancelRequest,
    completeRequest,

    // Single request
    getRequest,

    // Counts
    pendingSentCount,
    pendingReceivedCount,

    // Filters
    filterSent,
    filterReceived,
    sentFilter,
    receivedFilter,
  };
};

export default useRequests;

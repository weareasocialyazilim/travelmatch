/**
 * Tests for useRequests hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useRequests } from '../useRequests';
import { requestService } from '../../services/requestService';

// Mock the request service
jest.mock('../../services/requestService', () => ({
  requestService: {
    getSentRequests: jest.fn(),
    getReceivedRequests: jest.fn(),
    createRequest: jest.fn(),
    acceptRequest: jest.fn(),
    declineRequest: jest.fn(),
    cancelRequest: jest.fn(),
    completeRequest: jest.fn(),
    getRequest: jest.fn(),
  },
  REQUEST_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    DECLINED: 'declined',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
    EXPIRED: 'expired',
  },
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockRequestService = requestService as jest.Mocked<typeof requestService>;

describe('useRequests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Default mock implementations
    mockRequestService.getSentRequests.mockResolvedValue({ requests: [] });
    mockRequestService.getReceivedRequests.mockResolvedValue({ requests: [] });
  });

  describe('refreshSent', () => {
    it('should fetch sent requests', async () => {
      const mockRequests = [
        { id: 'r1', momentId: 'm1', status: 'pending' },
        { id: 'r2', momentId: 'm2', status: 'accepted' },
      ];

      mockRequestService.getSentRequests.mockResolvedValue({
        requests: mockRequests,
      });

      const { result } = renderHook(() => useRequests());

      await waitFor(() => {
        expect(result.current.sentLoading).toBe(false);
      });

      expect(result.current.sentRequests).toEqual(mockRequests);
    });

    it('should handle errors', async () => {
      mockRequestService.getSentRequests.mockRejectedValue(
        new Error('Network error'),
      );

      const { result } = renderHook(() => useRequests());

      await waitFor(() => {
        expect(result.current.sentLoading).toBe(false);
      });

      expect(result.current.sentError).toBe('Network error');
    });
  });

  describe('refreshReceived', () => {
    it('should fetch received requests', async () => {
      const mockRequests = [
        { id: 'r1', momentId: 'm1', status: 'pending', sender: { id: 'u1' } },
      ];

      mockRequestService.getReceivedRequests.mockResolvedValue({
        requests: mockRequests,
      });

      const { result } = renderHook(() => useRequests());

      await waitFor(() => {
        expect(result.current.receivedLoading).toBe(false);
      });

      expect(result.current.receivedRequests).toEqual(mockRequests);
    });
  });

  describe('createRequest', () => {
    it('should create a new request', async () => {
      const mockRequest = {
        id: 'r1',
        momentId: 'm1',
        status: 'pending',
      };

      mockRequestService.createRequest.mockResolvedValue({
        request: mockRequest,
      });

      const { result } = renderHook(() => useRequests());

      await waitFor(() => {
        expect(result.current.sentLoading).toBe(false);
      });

      let createdRequest = null;
      await act(async () => {
        createdRequest = await result.current.createRequest({
          momentId: 'm1',
          proposedDates: ['2024-01-15'],
          message: 'Hello!',
          guests: 2,
        });
      });

      expect(createdRequest).toEqual(mockRequest);
      expect(mockRequestService.createRequest).toHaveBeenCalled();
    });

    it('should handle create errors', async () => {
      mockRequestService.createRequest.mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useRequests());

      await waitFor(() => {
        expect(result.current.sentLoading).toBe(false);
      });

      let createdRequest: unknown = 'not-null';
      await act(async () => {
        createdRequest = await result.current.createRequest({
          momentId: 'm1',
          proposedDates: ['2024-01-15'],
          guests: 1,
        });
      });

      expect(createdRequest).toBeNull();
    });
  });

  describe('acceptRequest', () => {
    it('should accept a request', async () => {
      const acceptedRequest = { id: 'r1', momentId: 'm1', status: 'accepted' };

      mockRequestService.acceptRequest.mockResolvedValue({
        request: acceptedRequest,
      });

      const { result } = renderHook(() => useRequests());

      await waitFor(() => {
        expect(result.current.receivedLoading).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.acceptRequest('r1', '2024-01-15');
      });

      expect(success).toBe(true);
      expect(mockRequestService.acceptRequest).toHaveBeenCalledWith('r1', {
        selectedDate: '2024-01-15',
        message: undefined,
      });
    });
  });

  describe('declineRequest', () => {
    it('should decline a request', async () => {
      const declinedRequest = { id: 'r1', status: 'declined' };

      mockRequestService.declineRequest.mockResolvedValue({
        request: declinedRequest,
      });

      const { result } = renderHook(() => useRequests());

      await waitFor(() => {
        expect(result.current.receivedLoading).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.declineRequest('r1', 'Not available');
      });

      expect(success).toBe(true);
      expect(mockRequestService.declineRequest).toHaveBeenCalledWith(
        'r1',
        'Not available',
      );
    });
  });

  describe('cancelRequest', () => {
    it('should cancel a request', async () => {
      mockRequestService.cancelRequest.mockResolvedValue({
        request: { id: 'r1', status: 'cancelled' },
      });

      const { result } = renderHook(() => useRequests());

      await waitFor(() => {
        expect(result.current.sentLoading).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.cancelRequest('r1');
      });

      expect(success).toBe(true);
      expect(mockRequestService.cancelRequest).toHaveBeenCalledWith('r1');
    });
  });

  describe('getRequest', () => {
    it('should fetch request details', async () => {
      const mockRequest = {
        id: 'r1',
        momentId: 'm1',
        status: 'pending',
        sender: { id: 'u1', name: 'John' },
      };

      mockRequestService.getRequest.mockResolvedValue({
        request: mockRequest,
      });

      const { result } = renderHook(() => useRequests());

      await waitFor(() => {
        expect(result.current.sentLoading).toBe(false);
      });

      let details = null;
      await act(async () => {
        details = await result.current.getRequest('r1');
      });

      expect(details).toEqual(mockRequest);
      expect(mockRequestService.getRequest).toHaveBeenCalledWith('r1');
    });
  });

  describe('filters', () => {
    it('should filter sent requests by status', async () => {
      const { result } = renderHook(() => useRequests());

      await waitFor(() => {
        expect(result.current.sentLoading).toBe(false);
      });

      act(() => {
        result.current.filterSent('pending');
      });

      expect(result.current.sentFilter).toBe('pending');
    });

    it('should filter received requests by status', async () => {
      const { result } = renderHook(() => useRequests());

      await waitFor(() => {
        expect(result.current.receivedLoading).toBe(false);
      });

      act(() => {
        result.current.filterReceived('accepted');
      });

      expect(result.current.receivedFilter).toBe('accepted');
    });
  });

  describe('pendingCounts', () => {
    it('should calculate pending sent count', async () => {
      const mockRequests = [
        { id: 'r1', status: 'pending' },
        { id: 'r2', status: 'pending' },
        { id: 'r3', status: 'accepted' },
      ];

      mockRequestService.getSentRequests.mockResolvedValue({
        requests: mockRequests,
      });

      const { result } = renderHook(() => useRequests());

      await waitFor(() => {
        expect(result.current.sentLoading).toBe(false);
      });

      expect(result.current.pendingSentCount).toBe(2);
    });

    it('should calculate pending received count', async () => {
      const mockRequests = [
        { id: 'r1', status: 'pending' },
        { id: 'r2', status: 'declined' },
      ];

      mockRequestService.getReceivedRequests.mockResolvedValue({
        requests: mockRequests,
      });

      const { result } = renderHook(() => useRequests());

      await waitFor(() => {
        expect(result.current.receivedLoading).toBe(false);
      });

      expect(result.current.pendingReceivedCount).toBe(1);
    });
  });
});

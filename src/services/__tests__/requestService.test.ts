/**
 * Tests for requestService
 * Verifies gift request CRUD operations
 */

import { requestService } from '../requestService';
import { api } from '../../utils/api';

// Mock the api module
jest.mock('../../utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('requestService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRequest', () => {
    it('should create a new request', async () => {
      const mockRequest = {
        request: {
          id: 'r1',
          momentId: 'm1',
          status: 'pending',
          guestCount: 2,
        },
      };

      mockApi.post.mockResolvedValueOnce(mockRequest);

      const result = await requestService.createRequest({
        momentId: 'm1',
        guestCount: 2,
        message: 'Hello!',
      });

      expect(mockApi.post).toHaveBeenCalledWith('/requests', {
        momentId: 'm1',
        guestCount: 2,
        message: 'Hello!',
      });
      expect(result.request.id).toBe('r1');
    });
  });

  describe('getRequests', () => {
    it('should fetch all requests', async () => {
      const mockRequests = {
        requests: [
          { id: 'r1', status: 'pending' },
          { id: 'r2', status: 'accepted' },
        ],
        total: 2,
      };

      mockApi.get.mockResolvedValueOnce(mockRequests);

      const result = await requestService.getRequests();

      expect(mockApi.get).toHaveBeenCalledWith('/requests', {
        params: undefined,
      });
      expect(result.requests).toHaveLength(2);
    });

    it('should support filtering', async () => {
      const mockRequests = { requests: [], total: 0 };

      mockApi.get.mockResolvedValueOnce(mockRequests);

      await requestService.getRequests({ status: 'pending', role: 'host' });

      expect(mockApi.get).toHaveBeenCalledWith('/requests', {
        params: { status: 'pending', role: 'host' },
      });
    });
  });

  describe('getSentRequests', () => {
    it('should fetch sent requests with requester role', async () => {
      const mockRequests = {
        requests: [{ id: 'r1', status: 'pending' }],
        total: 1,
      };

      mockApi.get.mockResolvedValueOnce(mockRequests);

      await requestService.getSentRequests();

      expect(mockApi.get).toHaveBeenCalledWith('/requests', {
        params: { role: 'requester' },
      });
    });
  });

  describe('getReceivedRequests', () => {
    it('should fetch received requests with host role', async () => {
      const mockRequests = {
        requests: [{ id: 'r1', status: 'pending' }],
        total: 1,
      };

      mockApi.get.mockResolvedValueOnce(mockRequests);

      await requestService.getReceivedRequests();

      expect(mockApi.get).toHaveBeenCalledWith('/requests', {
        params: { role: 'host' },
      });
    });
  });

  describe('getRequest', () => {
    it('should fetch a single request', async () => {
      const mockRequest = {
        request: { id: 'r1', momentId: 'm1', status: 'pending' },
      };

      mockApi.get.mockResolvedValueOnce(mockRequest);

      const result = await requestService.getRequest('r1');

      expect(mockApi.get).toHaveBeenCalledWith('/requests/r1');
      expect(result.request.id).toBe('r1');
    });
  });

  describe('acceptRequest', () => {
    it('should accept a request', async () => {
      const mockRequest = {
        request: { id: 'r1', status: 'accepted' },
      };

      mockApi.post.mockResolvedValueOnce(mockRequest);

      const result = await requestService.acceptRequest('r1', {
        selectedDate: '2024-03-15',
        message: 'Looking forward!',
      });

      expect(mockApi.post).toHaveBeenCalledWith('/requests/r1/accept', {
        selectedDate: '2024-03-15',
        message: 'Looking forward!',
      });
      expect(result.request.status).toBe('accepted');
    });
  });

  describe('declineRequest', () => {
    it('should decline a request with reason', async () => {
      const mockRequest = {
        request: { id: 'r1', status: 'declined' },
      };

      mockApi.post.mockResolvedValueOnce(mockRequest);

      const result = await requestService.declineRequest(
        'r1',
        'Not available on that date',
      );

      expect(mockApi.post).toHaveBeenCalledWith('/requests/r1/decline', {
        reason: 'Not available on that date',
      });
      expect(result.request.status).toBe('declined');
    });

    it('should decline a request without reason', async () => {
      const mockRequest = {
        request: { id: 'r1', status: 'declined' },
      };

      mockApi.post.mockResolvedValueOnce(mockRequest);

      await requestService.declineRequest('r1');

      expect(mockApi.post).toHaveBeenCalledWith('/requests/r1/decline', {
        reason: undefined,
      });
    });
  });

  describe('cancelRequest', () => {
    it('should cancel a request', async () => {
      const mockRequest = {
        request: { id: 'r1', status: 'cancelled' },
      };

      mockApi.post.mockResolvedValueOnce(mockRequest);

      const result = await requestService.cancelRequest('r1');

      expect(mockApi.post).toHaveBeenCalledWith('/requests/r1/cancel');
      expect(result.request.status).toBe('cancelled');
    });
  });
});

/**
 * useDeepLinking Hook Tests
 * Testing deep linking functionality
 */

import { renderHook, waitFor } from '@testing-library/react-native';

// Mock the deep linking utilities
const mockGetInitialURL = jest.fn();
const mockSubscribeToDeepLinks = jest.fn();
const mockHandleDeepLink = jest.fn();

jest.mock('../../utils/deepLinking', () => ({
  getInitialURL: () => mockGetInitialURL(),
  subscribeToDeepLinks: (callback: (url: string) => void) =>
    mockSubscribeToDeepLinks(callback),
  handleDeepLink: (url: string, navigation: unknown) =>
    mockHandleDeepLink(url, navigation),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
}));

import { useDeepLinking } from '../useDeepLinking';

describe('useDeepLinking', () => {
  let mockUnsubscribe: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUnsubscribe = jest.fn();
    mockGetInitialURL.mockResolvedValue(null);
    mockSubscribeToDeepLinks.mockReturnValue(mockUnsubscribe);
  });

  it('should check for initial URL on mount', async () => {
    renderHook(() => useDeepLinking());

    await waitFor(() => {
      expect(mockGetInitialURL).toHaveBeenCalled();
    });
  });

  it('should handle initial URL if present', async () => {
    const initialUrl = 'travelmatch://moment/123';
    mockGetInitialURL.mockResolvedValue(initialUrl);

    renderHook(() => useDeepLinking());

    await waitFor(() => {
      expect(mockHandleDeepLink).toHaveBeenCalledWith(
        initialUrl,
        mockNavigation,
      );
    });
  });

  it('should not handle deep link if no initial URL', async () => {
    mockGetInitialURL.mockResolvedValue(null);

    renderHook(() => useDeepLinking());

    await waitFor(() => {
      expect(mockGetInitialURL).toHaveBeenCalled();
    });

    expect(mockHandleDeepLink).not.toHaveBeenCalled();
  });

  it('should subscribe to deep links', () => {
    renderHook(() => useDeepLinking());

    expect(mockSubscribeToDeepLinks).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should handle deep links while app is running', () => {
    let linkCallback: ((url: string) => void) | undefined;
    mockSubscribeToDeepLinks.mockImplementation((cb) => {
      linkCallback = cb;
      return mockUnsubscribe;
    });

    renderHook(() => useDeepLinking());

    const runtimeUrl = 'travelmatch://profile/456';
    if (linkCallback) {
      linkCallback(runtimeUrl);
    }

    expect(mockHandleDeepLink).toHaveBeenCalledWith(runtimeUrl, mockNavigation);
  });

  it('should unsubscribe on unmount', () => {
    const { unmount } = renderHook(() => useDeepLinking());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('should only subscribe once', () => {
    const { rerender } = renderHook(() => useDeepLinking());

    rerender({});
    rerender({});

    expect(mockSubscribeToDeepLinks).toHaveBeenCalledTimes(1);
  });
});

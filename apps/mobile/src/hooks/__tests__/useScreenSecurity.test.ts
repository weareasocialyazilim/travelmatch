/** Cleaned useScreenSecurity tests to remove duplicated content and ensure reliable mocks */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useScreenSecurity } from '../useScreenSecurity';

// Provide controlled mocks using jest.mock + jest.requireMock to avoid import redeclaration
jest.mock('expo-screen-capture', () => ({
  preventScreenCaptureAsync: jest.fn(),
  allowScreenCaptureAsync: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const mockScreenCapture = jest.requireMock('expo-screen-capture');
const { logger: mockLogger } = jest.requireMock('../../utils/logger');

describe('useScreenSecurity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // ensure fresh module resolution for tests that mock react-native Platform
    jest.resetModules();
  });

  it('prevents screenshots on mount and logs', async () => {
    mockScreenCapture.preventScreenCaptureAsync.mockResolvedValue(undefined);

    renderHook(() => useScreenSecurity());

    await waitFor(() => {
      expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalledTimes(1);
    });

    expect(mockLogger.info).toHaveBeenCalledWith('ScreenSecurity', 'Screenshot protection enabled');
  });

  it('allows screenshots on unmount and logs', async () => {
    mockScreenCapture.preventScreenCaptureAsync.mockResolvedValue(undefined);
    mockScreenCapture.allowScreenCaptureAsync.mockResolvedValue(undefined);

    const { unmount } = renderHook(() => useScreenSecurity());

    await waitFor(() => {
      expect(mockScreenCapture.preventScreenCaptureAsync).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(mockScreenCapture.allowScreenCaptureAsync).toHaveBeenCalledTimes(1);
    });

    expect(mockLogger.info).toHaveBeenCalledWith('ScreenSecurity', 'Screenshot protection disabled');
  });
});

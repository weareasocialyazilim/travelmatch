/**
 * Deep Linking Utils Tests
 * Testing URL parsing and generation
 */

import { Linking } from 'react-native';
import {
  parseDeepLink,
  generateDeepLink,
  getInitialURL,
  subscribeToDeepLinks,
  handleDeepLink,
  DEEP_LINK_CONFIG,
} from '../deepLinking';

// Mock Linking
jest.mock('react-native', () => ({
  Linking: {
    getInitialURL: jest.fn(),
    addEventListener: jest.fn(),
  },
}));

// Mock logger
jest.mock('../logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

const mockLinking = Linking as jest.Mocked<typeof Linking>;

describe('DEEP_LINK_CONFIG', () => {
  it('should have correct prefixes', () => {
    expect(DEEP_LINK_CONFIG.prefixes).toContain('travelmatch://');
    expect(DEEP_LINK_CONFIG.prefixes).toContain('https://travelmatch.app');
  });

  it('should have screen configurations', () => {
    expect(DEEP_LINK_CONFIG.config.screens).toBeDefined();
    expect(DEEP_LINK_CONFIG.config.screens.MomentDetail).toBe(
      'moment/:momentId',
    );
    expect(DEEP_LINK_CONFIG.config.screens.Profile).toBe('profile/:userId');
  });
});

describe('parseDeepLink', () => {
  it('should parse moment deep link with travelmatch:// protocol', () => {
    const result = parseDeepLink('travelmatch://moment/123');

    expect(result.screen).toBe('MomentDetail');
    expect(result.params?.momentId).toBe('123');
  });

  it('should parse moment deep link with https protocol', () => {
    const result = parseDeepLink('https://travelmatch.app/moment/456');

    expect(result.screen).toBe('MomentDetail');
    expect(result.params?.momentId).toBe('456');
  });

  it('should parse profile deep link', () => {
    const result = parseDeepLink('travelmatch://profile/user-abc');

    expect(result.screen).toBe('Profile');
    expect(result.params?.userId).toBe('user-abc');
  });

  it('should parse booking deep link', () => {
    const result = parseDeepLink('travelmatch://booking/booking-123');

    expect(result.screen).toBe('BookingDetail');
    expect(result.params?.bookingId).toBe('booking-123');
  });

  it('should parse chat deep link', () => {
    const result = parseDeepLink('travelmatch://chat/conversation-789');

    expect(result.screen).toBe('Chat');
    expect(result.params?.conversationId).toBe('conversation-789');
  });

  it('should return empty object for unknown screen', () => {
    const result = parseDeepLink('travelmatch://unknown/path');

    expect(result.screen).toBeUndefined();
    expect(result.params).toBeUndefined();
  });

  it('should handle URL without params', () => {
    const result = parseDeepLink('travelmatch://moment/');

    expect(result.screen).toBe('MomentDetail');
    // Empty path part returns undefined
    expect(result.params?.momentId).toBeUndefined();
  });
});

describe('generateDeepLink', () => {
  it('should generate moment deep link', () => {
    const url = generateDeepLink('MomentDetail', { momentId: '123' });

    expect(url).toBe('https://travelmatch.app/moment/123');
  });

  it('should generate profile deep link', () => {
    const url = generateDeepLink('Profile', { userId: 'user-abc' });

    expect(url).toBe('https://travelmatch.app/profile/user-abc');
  });

  it('should generate booking deep link', () => {
    const url = generateDeepLink('BookingDetail', { bookingId: 'booking-123' });

    expect(url).toBe('https://travelmatch.app/booking/booking-123');
  });

  it('should generate chat deep link', () => {
    const url = generateDeepLink('Chat', { conversationId: 'conv-789' });

    expect(url).toBe('https://travelmatch.app/chat/conv-789');
  });

  it('should return base URL for unknown screen', () => {
    const url = generateDeepLink(
      'Home' as keyof typeof DEEP_LINK_CONFIG.config.screens,
    );

    expect(url).toBe('https://travelmatch.app');
  });

  it('should handle missing params', () => {
    const url = generateDeepLink('MomentDetail');

    expect(url).toBe('https://travelmatch.app/moment/');
  });
});

describe('getInitialURL', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial URL', async () => {
    mockLinking.getInitialURL.mockResolvedValueOnce('travelmatch://moment/123');

    const url = await getInitialURL();

    expect(url).toBe('travelmatch://moment/123');
    expect(mockLinking.getInitialURL).toHaveBeenCalled();
  });

  it('should return null when no initial URL', async () => {
    mockLinking.getInitialURL.mockResolvedValueOnce(null);

    const url = await getInitialURL();

    expect(url).toBeNull();
  });

  it('should return null on error', async () => {
    mockLinking.getInitialURL.mockRejectedValueOnce(new Error('Test error'));

    const url = await getInitialURL();

    expect(url).toBeNull();
  });
});

describe('subscribeToDeepLinks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should subscribe to URL events', () => {
    const callback = jest.fn();
    const mockRemove = jest.fn();
    mockLinking.addEventListener.mockReturnValueOnce({ remove: mockRemove });

    subscribeToDeepLinks(callback);

    expect(mockLinking.addEventListener).toHaveBeenCalledWith(
      'url',
      expect.any(Function),
    );
  });

  it('should return unsubscribe function', () => {
    const callback = jest.fn();
    const mockRemove = jest.fn();
    mockLinking.addEventListener.mockReturnValueOnce({ remove: mockRemove });

    const unsubscribe = subscribeToDeepLinks(callback);
    unsubscribe();

    expect(mockRemove).toHaveBeenCalled();
  });

  it('should call callback with URL when event fires', () => {
    const callback = jest.fn();
    let eventHandler: ((event: { url: string }) => void) | undefined;

    mockLinking.addEventListener.mockImplementationOnce((event, handler) => {
      eventHandler = handler;
      return { remove: jest.fn() };
    });

    subscribeToDeepLinks(callback);

    // Simulate URL event
    if (eventHandler) {
      eventHandler({ url: 'travelmatch://moment/456' });
    }

    expect(callback).toHaveBeenCalledWith('travelmatch://moment/456');
  });
});

describe('handleDeepLink', () => {
  it('should navigate to parsed screen when navigation is ready', () => {
    const mockNavigation = {
      isReady: jest.fn().mockReturnValue(true),
      navigate: jest.fn(),
    };

    handleDeepLink(
      'travelmatch://moment/123',
      mockNavigation as unknown as Parameters<typeof handleDeepLink>[1],
    );

    expect(mockNavigation.navigate).toHaveBeenCalledWith('MomentDetail', {
      momentId: '123',
    });
  });

  it('should not navigate when navigation is not ready', () => {
    const mockNavigation = {
      isReady: jest.fn().mockReturnValue(false),
      navigate: jest.fn(),
    };

    handleDeepLink(
      'travelmatch://moment/123',
      mockNavigation as unknown as Parameters<typeof handleDeepLink>[1],
    );

    expect(mockNavigation.navigate).not.toHaveBeenCalled();
  });

  it('should not navigate for unknown URL', () => {
    const mockNavigation = {
      isReady: jest.fn().mockReturnValue(true),
      navigate: jest.fn(),
    };

    handleDeepLink(
      'travelmatch://unknown/path',
      mockNavigation as unknown as Parameters<typeof handleDeepLink>[1],
    );

    expect(mockNavigation.navigate).not.toHaveBeenCalled();
  });
});

/**
 * Deep Link Handler Integration Tests
 * 
 * Tests for unified deep link infrastructure including:
 * - URL parsing and validation
 * - Zod schema validation
 * - Resource existence checking (404/410)
 * - Navigation mapping
 * - Error handling
 * - Link generation
 * 
 * Coverage:
 * - Deep link parsing (all supported formats)
 * - Parameter validation with Zod
 * - Resource existence checks
 * - Navigation execution
 * - Error screens
 * - UTM tracking
 */

// @ts-nocheck - Complex React Navigation mocks

import { Linking } from 'react-native';
import { NavigationContainerRef } from '@react-navigation/native';
import { deepLinkHandler, DeepLinkType, DeepLinkError } from '../../apps/mobile/src/services/deepLinkHandler';
import { logger } from '../../apps/mobile/src/utils/logger';
import { sessionManager } from '../../apps/mobile/src/services/sessionManager';

// Mock dependencies
jest.mock('react-native', () => ({
  Linking: {
    getInitialURL: jest.fn(),
    addEventListener: jest.fn(),
  },
}));

jest.mock('../../apps/mobile/src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../apps/mobile/src/services/sessionManager', () => ({
  sessionManager: {
    getValidToken: jest.fn(),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('DeepLinkHandler', () => {
  let mockNavigation: NavigationContainerRef<any>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock navigation
    mockNavigation = {
      navigate: jest.fn(),
      isReady: jest.fn(() => true),
      reset: jest.fn(),
      goBack: jest.fn(),
      canGoBack: jest.fn(() => true),
    } as any;

    deepLinkHandler.setNavigation(mockNavigation);

    // Default sessionManager mock
    (sessionManager.getValidToken as jest.Mock).mockResolvedValue('mock-token');

    // Default fetch mock (resource exists)
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    });
  });

  // ===========================
  // URL Parsing Tests
  // ===========================

  describe('URL Parsing', () => {
    it('should parse HTTPS deep link', async () => {
      const url = 'https://travelmatch.app/profile/123e4567-e89b-12d3-a456-426614174000';

      const result = await deepLinkHandler.handleDeepLink(url);

      expect(result.success).toBe(true);
      expect(result.type).toBe(DeepLinkType.PROFILE);
      expect(result.screen).toBe('ProfileDetail');
      expect(result.params).toEqual({
        userId: '123e4567-e89b-12d3-a456-426614174000',
      });
    });

    it('should parse custom scheme deep link', async () => {
      const url = 'travelmatch://moment/987fcdeb-51a2-43f1-b456-426614174111';

      const result = await deepLinkHandler.handleDeepLink(url);

      expect(result.success).toBe(true);
      expect(result.type).toBe(DeepLinkType.MOMENT);
      expect(result.screen).toBe('MomentDetail');
      expect(result.params).toEqual({
        momentId: '987fcdeb-51a2-43f1-b456-426614174111',
      });
    });

    it('should parse short aliases (p, m, t)', async () => {
      const urls = [
        { url: 'https://travelmatch.app/p/123e4567-e89b-12d3-a456-426614174000', type: DeepLinkType.PROFILE },
        { url: 'https://travelmatch.app/m/987fcdeb-51a2-43f1-b456-426614174111', type: DeepLinkType.MOMENT },
        { url: 'https://travelmatch.app/t/456e7890-e89b-12d3-a456-426614174222', type: DeepLinkType.TRIP },
      ];

      for (const { url, type } of urls) {
        const result = await deepLinkHandler.handleDeepLink(url);
        expect(result.success).toBe(true);
        expect(result.type).toBe(type);
      }
    });

    it('should parse query parameters', async () => {
      const url = 'https://travelmatch.app/moment/987fcdeb-51a2-43f1-b456-426614174111?utm_source=email&utm_campaign=winter';

      const result = await deepLinkHandler.handleDeepLink(url);

      expect(result.success).toBe(true);
      // Query params are not returned in result but are logged internally
      expect(logger.info).toHaveBeenCalledWith('[DeepLink] Handling:', url);
    });

    it('should handle deep links without IDs (notifications, settings)', async () => {
      const urls = [
        { url: 'https://travelmatch.app/notifications', screen: 'Notifications' },
        { url: 'https://travelmatch.app/settings', screen: 'Settings' },
      ];

      for (const { url, screen } of urls) {
        const result = await deepLinkHandler.handleDeepLink(url);
        expect(result.success).toBe(true);
        expect(result.screen).toBe(screen);
        expect(result.params).toEqual({});
      }
    });

    it('should return error for invalid URL format', async () => {
      const url = 'https://travelmatch.app/invalid-path';

      const result = await deepLinkHandler.handleDeepLink(url);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(DeepLinkError.INVALID_URL);
      expect(result.error?.message).toBe('Link formatı geçersiz');
    });

    it('should handle malformed URLs gracefully', async () => {
      const urls = [
        'not-a-url',
        'https://',
        '',
        'travelmatch://',
      ];

      for (const url of urls) {
        const result = await deepLinkHandler.handleDeepLink(url);
        expect(result.success).toBe(false);
      }
    });
  });

  // ===========================
  // Zod Validation Tests
  // ===========================

  describe('Parameter Validation', () => {
    it('should validate UUID format', async () => {
      const url = 'https://travelmatch.app/profile/123e4567-e89b-12d3-a456-426614174000';

      const result = await deepLinkHandler.handleDeepLink(url);

      expect(result.success).toBe(true);
      expect(result.params?.userId).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    it('should reject invalid UUID format', async () => {
      const urls = [
        'https://travelmatch.app/profile/invalid-uuid',
        'https://travelmatch.app/profile/123',
        'https://travelmatch.app/moment/not-a-uuid',
      ];

      for (const url of urls) {
        const result = await deepLinkHandler.handleDeepLink(url);
        expect(result.success).toBe(false);
        expect(result.error?.code).toBe(DeepLinkError.INVALID_PARAMS);
        expect(result.error?.message).toContain('geçersiz');
      }
    });

    it('should validate all deep link types', async () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const types = [
        { path: 'profile', param: 'userId' },
        { path: 'moment', param: 'momentId' },
        { path: 'trip', param: 'tripId' },
        { path: 'gift', param: 'giftId' },
        { path: 'chat', param: 'conversationId' },
        { path: 'request', param: 'requestId' },
      ];

      for (const { path, param } of types) {
        const url = `https://travelmatch.app/${path}/${validUUID}`;
        const result = await deepLinkHandler.handleDeepLink(url);

        expect(result.success).toBe(true);
        expect(result.params?.[param]).toBe(validUUID);
      }
    });

    it('should handle missing parameters', async () => {
      const url = 'https://travelmatch.app/profile/';

      const result = await deepLinkHandler.handleDeepLink(url);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(DeepLinkError.INVALID_PARAMS);
    });
  });

  // ===========================
  // Resource Existence Tests
  // ===========================

  describe('Resource Existence Checking', () => {
    it('should check if resource exists (200)', async () => {
      const url = 'https://travelmatch.app/moment/987fcdeb-51a2-43f1-b456-426614174111';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await deepLinkHandler.handleDeepLink(url, { checkExists: true });

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/moments/987fcdeb-51a2-43f1-b456-426614174111'),
        expect.objectContaining({
          method: 'HEAD',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });

    it('should handle 404 not found', async () => {
      const url = 'https://travelmatch.app/moment/987fcdeb-51a2-43f1-b456-426614174111';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await deepLinkHandler.handleDeepLink(url, { checkExists: true });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(DeepLinkError.NOT_FOUND);
      expect(result.error?.message).toBe('İçerik bulunamadı');
    });

    it('should handle 410 expired link', async () => {
      const url = 'https://travelmatch.app/gift/456e7890-e89b-12d3-a456-426614174222';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 410,
      });

      const result = await deepLinkHandler.handleDeepLink(url, { checkExists: true });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(DeepLinkError.EXPIRED);
      expect(result.error?.message).toBe('Bu linkin süresi dolmuş gibi görünüyor');
    });

    it('should handle 401 unauthorized', async () => {
      const url = 'https://travelmatch.app/trip/123e4567-e89b-12d3-a456-426614174000';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await deepLinkHandler.handleDeepLink(url, { checkExists: true });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(DeepLinkError.UNAUTHORIZED);
      expect(result.error?.message).toBe('Bu içeriği görüntüleme yetkiniz yok');
    });

    it('should handle 403 forbidden', async () => {
      const url = 'https://travelmatch.app/chat/987fcdeb-51a2-43f1-b456-426614174111';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      const result = await deepLinkHandler.handleDeepLink(url, { checkExists: true });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(DeepLinkError.UNAUTHORIZED);
    });

    it('should skip existence check for public resources without token', async () => {
      (sessionManager.getValidToken as jest.Mock).mockResolvedValueOnce(null);

      const url = 'https://travelmatch.app/moment/987fcdeb-51a2-43f1-b456-426614174111';
      const result = await deepLinkHandler.handleDeepLink(url, { checkExists: true });

      expect(result.success).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fail-open on network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const url = 'https://travelmatch.app/moment/987fcdeb-51a2-43f1-b456-426614174111';
      const result = await deepLinkHandler.handleDeepLink(url, { checkExists: true });

      expect(result.success).toBe(true);
      expect(logger.error).toHaveBeenCalledWith(
        '[DeepLink] Existence check failed:',
        expect.any(Error)
      );
    });

    it('should not check existence when option disabled', async () => {
      const url = 'https://travelmatch.app/moment/987fcdeb-51a2-43f1-b456-426614174111';

      const result = await deepLinkHandler.handleDeepLink(url, { checkExists: false });

      expect(result.success).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should skip check for links without endpoints', async () => {
      const urls = [
        'https://travelmatch.app/notifications',
        'https://travelmatch.app/settings',
      ];

      for (const url of urls) {
        const result = await deepLinkHandler.handleDeepLink(url, { checkExists: true });
        expect(result.success).toBe(true);
      }

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  // ===========================
  // Navigation Tests
  // ===========================

  describe('Navigation Execution', () => {
    it('should navigate to correct screen', async () => {
      const url = 'https://travelmatch.app/profile/123e4567-e89b-12d3-a456-426614174000';

      await deepLinkHandler.handleDeepLink(url);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('ProfileDetail', {
        userId: '123e4567-e89b-12d3-a456-426614174000',
      });
    });

    it('should map all deep link types to screens', async () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const screenMap = [
        { path: 'profile', screen: 'ProfileDetail', param: 'userId' },
        { path: 'moment', screen: 'MomentDetail', param: 'momentId' },
        { path: 'trip', screen: 'BookingDetail', param: 'bookingId' },
        { path: 'gift', screen: 'GiftInboxDetail', param: 'giftId' },
        { path: 'chat', screen: 'Chat', param: 'conversationId' },
        { path: 'request', screen: 'RequestDetail', param: 'requestId' },
      ];

      for (const { path, screen, param } of screenMap) {
        jest.clearAllMocks();

        const url = `https://travelmatch.app/${path}/${validUUID}`;
        await deepLinkHandler.handleDeepLink(url);

        expect(mockNavigation.navigate).toHaveBeenCalledWith(
          screen,
          { [param]: validUUID }
        );
      }
    });

    it('should not navigate when navigation not ready', async () => {
      mockNavigation.isReady.mockReturnValue(false);

      const url = 'https://travelmatch.app/profile/123e4567-e89b-12d3-a456-426614174000';
      const result = await deepLinkHandler.handleDeepLink(url);

      expect(result.success).toBe(true);
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to error screen on 404', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const url = 'https://travelmatch.app/moment/987fcdeb-51a2-43f1-b456-426614174111';
      const result = await deepLinkHandler.handleDeepLink(url, { checkExists: true });

      expect(result.success).toBe(false);

      // Manually trigger error navigation
      deepLinkHandler.navigateToError(result.error!.code, result.error!.message);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('LinkNotFound', {
        message: 'İçerik bulunamadı',
      });
    });

    it('should navigate to expired screen on 410', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 410,
      });

      const url = 'https://travelmatch.app/gift/456e7890-e89b-12d3-a456-426614174222';
      const result = await deepLinkHandler.handleDeepLink(url, { checkExists: true });

      deepLinkHandler.navigateToError(result.error!.code, result.error!.message);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('LinkExpired', {
        message: 'Bu linkin süresi dolmuş gibi görünüyor',
      });
    });

    it('should navigate to invalid screen on other errors', async () => {
      const url = 'https://travelmatch.app/invalid-path';
      const result = await deepLinkHandler.handleDeepLink(url);

      deepLinkHandler.navigateToError(result.error!.code, result.error!.message);

      expect(mockNavigation.navigate).toHaveBeenCalledWith('LinkInvalid', {
        message: 'Link formatı geçersiz',
      });
    });

    it('should not navigate to error when navigation not ready', async () => {
      mockNavigation.isReady.mockReturnValue(false);

      deepLinkHandler.navigateToError(DeepLinkError.NOT_FOUND, 'Test error');

      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });

  // ===========================
  // Link Generation Tests
  // ===========================

  describe('Link Generation', () => {
    it('should generate profile link', () => {
      const link = deepLinkHandler.generateLink(
        DeepLinkType.PROFILE,
        '123e4567-e89b-12d3-a456-426614174000'
      );

      expect(link).toBe('https://travelmatch.app/profile/123e4567-e89b-12d3-a456-426614174000');
    });

    it('should generate links for all types', () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const types = [
        { type: DeepLinkType.PROFILE, path: 'profile' },
        { type: DeepLinkType.MOMENT, path: 'moment' },
        { type: DeepLinkType.TRIP, path: 'trip' },
        { type: DeepLinkType.GIFT, path: 'gift' },
        { type: DeepLinkType.CHAT, path: 'chat' },
        { type: DeepLinkType.REQUEST, path: 'request' },
      ];

      for (const { type, path } of types) {
        const link = deepLinkHandler.generateLink(type, validUUID);
        expect(link).toBe(`https://travelmatch.app/${path}/${validUUID}`);
      }
    });

    it('should generate links without IDs', () => {
      const notificationLink = deepLinkHandler.generateLink(DeepLinkType.NOTIFICATION, '');
      const settingsLink = deepLinkHandler.generateLink(DeepLinkType.SETTINGS, '');

      expect(notificationLink).toBe('https://travelmatch.app/notifications');
      expect(settingsLink).toBe('https://travelmatch.app/settings');
    });

    it('should add UTM parameters', () => {
      const link = deepLinkHandler.generateLink(
        DeepLinkType.MOMENT,
        '987fcdeb-51a2-43f1-b456-426614174111',
        {
          source: 'email',
          campaign: 'winter_campaign',
          medium: 'newsletter',
          content: 'hero_image',
        }
      );

      expect(link).toContain('utm_source=email');
      expect(link).toContain('utm_campaign=winter_campaign');
      expect(link).toContain('utm_medium=newsletter');
      expect(link).toContain('utm_content=hero_image');
    });

    it('should add partial UTM parameters', () => {
      const link = deepLinkHandler.generateLink(
        DeepLinkType.PROFILE,
        '123e4567-e89b-12d3-a456-426614174000',
        {
          source: 'facebook',
          campaign: 'social_share',
        }
      );

      expect(link).toContain('utm_source=facebook');
      expect(link).toContain('utm_campaign=social_share');
      expect(link).not.toContain('utm_medium');
      expect(link).not.toContain('utm_content');
    });

    it('should not add UTM params when empty', () => {
      const link = deepLinkHandler.generateLink(
        DeepLinkType.TRIP,
        '456e7890-e89b-12d3-a456-426614174222'
      );

      expect(link).toBe('https://travelmatch.app/trip/456e7890-e89b-12d3-a456-426614174222');
      expect(link).not.toContain('utm_');
    });
  });

  // ===========================
  // Initialization Tests
  // ===========================

  describe('Deep Link Initialization', () => {
    it('should handle initial URL on app launch', async () => {
      const initialURL = 'https://travelmatch.app/moment/987fcdeb-51a2-43f1-b456-426614174111';

      (Linking.getInitialURL as jest.Mock).mockResolvedValueOnce(initialURL);

      const unsubscribe = deepLinkHandler.initialize();

      // Wait for promise resolution
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(Linking.getInitialURL).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('[DeepLink] Initial URL:', initialURL);

      unsubscribe();
    });

    it('should handle no initial URL', async () => {
      (Linking.getInitialURL as jest.Mock).mockResolvedValueOnce(null);

      const unsubscribe = deepLinkHandler.initialize();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(Linking.getInitialURL).toHaveBeenCalled();
      expect(mockNavigation.navigate).not.toHaveBeenCalled();

      unsubscribe();
    });

    it('should listen to URL changes', () => {
      const mockRemove = jest.fn();
      (Linking.addEventListener as jest.Mock).mockReturnValueOnce({ remove: mockRemove });

      const unsubscribe = deepLinkHandler.initialize();

      expect(Linking.addEventListener).toHaveBeenCalledWith('url', expect.any(Function));

      unsubscribe();
      expect(mockRemove).toHaveBeenCalled();
    });

    it('should handle URL events when app in background', async () => {
      let urlListener: (event: { url: string }) => void = () => {};

      (Linking.addEventListener as jest.Mock).mockImplementationOnce((event, callback) => {
        urlListener = callback;
        return { remove: jest.fn() };
      });

      deepLinkHandler.initialize();

      // Trigger URL event
      const eventURL = 'https://travelmatch.app/profile/123e4567-e89b-12d3-a456-426614174000';
      urlListener({ url: eventURL });

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(logger.info).toHaveBeenCalledWith('[DeepLink] URL received:', eventURL);
    });

    it('should navigate to error screen on failed initial URL', async () => {
      const invalidURL = 'https://travelmatch.app/invalid-path';

      (Linking.getInitialURL as jest.Mock).mockResolvedValueOnce(invalidURL);

      deepLinkHandler.initialize();

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should be logged as invalid
      expect(logger.warn).toHaveBeenCalledWith('[DeepLink] Invalid URL format');
    });
  });

  // ===========================
  // Error Handling Tests
  // ===========================

  describe('Error Handling', () => {
    it('should handle unknown errors gracefully', async () => {
      // Mock parseURL to throw
      const url = 'https://travelmatch.app/profile/123e4567-e89b-12d3-a456-426614174000';

      // Force an error by setting invalid navigation
      deepLinkHandler.setNavigation(null as any);
      mockNavigation.isReady.mockImplementation(() => {
        throw new Error('Navigation error');
      });

      const result = await deepLinkHandler.handleDeepLink(url);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(DeepLinkError.UNKNOWN);
    });

    it('should log all errors', async () => {
      const url = 'https://travelmatch.app/invalid-path';

      await deepLinkHandler.handleDeepLink(url);

      expect(logger.warn).toHaveBeenCalledWith('[DeepLink] Invalid URL format');
    });

    it('should include error details', async () => {
      const url = 'https://travelmatch.app/profile/invalid-uuid';

      const result = await deepLinkHandler.handleDeepLink(url);

      expect(result.error).toMatchObject({
        code: DeepLinkError.INVALID_PARAMS,
        message: expect.any(String),
        details: expect.any(Object),
      });
    });
  });

  // ===========================
  // Edge Cases
  // ===========================

  describe('Edge Cases', () => {
    it('should handle trailing slashes', async () => {
      const url = 'https://travelmatch.app/profile/123e4567-e89b-12d3-a456-426614174000/';

      const result = await deepLinkHandler.handleDeepLink(url);

      expect(result.success).toBe(true);
      expect(result.screen).toBe('ProfileDetail');
    });

    it('should handle case-insensitive paths', async () => {
      const urls = [
        'https://travelmatch.app/PROFILE/123e4567-e89b-12d3-a456-426614174000',
        'https://travelmatch.app/Profile/123e4567-e89b-12d3-a456-426614174000',
      ];

      for (const url of urls) {
        const result = await deepLinkHandler.handleDeepLink(url);
        expect(result.success).toBe(true);
        expect(result.type).toBe(DeepLinkType.PROFILE);
      }
    });

    it('should handle special characters in query params', async () => {
      const url = 'https://travelmatch.app/moment/987fcdeb-51a2-43f1-b456-426614174111?utm_content=Special%20Characters%20%26%20Symbols';

      const result = await deepLinkHandler.handleDeepLink(url);

      expect(result.success).toBe(true);
    });

    it('should handle concurrent deep link requests', async () => {
      const urls = [
        'https://travelmatch.app/profile/123e4567-e89b-12d3-a456-426614174000',
        'https://travelmatch.app/moment/987fcdeb-51a2-43f1-b456-426614174111',
        'https://travelmatch.app/trip/456e7890-e89b-12d3-a456-426614174222',
      ];

      const results = await Promise.all(
        urls.map(url => deepLinkHandler.handleDeepLink(url))
      );

      expect(results).toHaveLength(3);
      results.forEach(result => expect(result.success).toBe(true));
    });

    it('should preserve navigation state across multiple calls', async () => {
      await deepLinkHandler.handleDeepLink('https://travelmatch.app/profile/123e4567-e89b-12d3-a456-426614174000');
      await deepLinkHandler.handleDeepLink('https://travelmatch.app/moment/987fcdeb-51a2-43f1-b456-426614174111');

      expect(mockNavigation.navigate).toHaveBeenCalledTimes(2);
    });

    it('should handle very long UUIDs gracefully', async () => {
      const url = 'https://travelmatch.app/profile/123e4567-e89b-12d3-a456-426614174000-extra-long-uuid';

      const result = await deepLinkHandler.handleDeepLink(url);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(DeepLinkError.INVALID_PARAMS);
    });
  });
});

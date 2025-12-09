/**
 * Navigation Service Tests
 * 
 * Tests for global navigation reference management
 * 
 * Coverage:
 * - Navigation ref initialization
 * - Imperative navigation (navigate, reset, goBack)
 * - Navigation readiness checks
 * - Error handling for unready navigation
 * - Concurrent navigation requests
 */

// @ts-nocheck - React Navigation mock types

import { navigationRef, navigate, resetNavigation, goBack } from '../../apps/mobile/src/services/navigationService';

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  createNavigationContainerRef: jest.fn(() => ({
    isReady: jest.fn(),
    navigate: jest.fn(),
    reset: jest.fn(),
    goBack: jest.fn(),
    canGoBack: jest.fn(),
  })),
}));

describe('Navigation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset navigation ref state
    (navigationRef.isReady as jest.Mock).mockReturnValue(true);
    (navigationRef.canGoBack as jest.Mock).mockReturnValue(true);
  });

  // ===========================
  // Navigate Tests
  // ===========================

  describe('navigate()', () => {
    it('should navigate to screen when ready', () => {
      navigate('ProfileDetail', { userId: '123' });

      expect(navigationRef.isReady).toHaveBeenCalled();
      expect(navigationRef.navigate).toHaveBeenCalledWith('ProfileDetail', { userId: '123' });
    });

    it('should navigate without params', () => {
      navigate('Home');

      expect(navigationRef.navigate).toHaveBeenCalledWith('Home', undefined);
    });

    it('should not navigate when not ready', () => {
      (navigationRef.isReady as jest.Mock).mockReturnValue(false);

      navigate('ProfileDetail', { userId: '123' });

      expect(navigationRef.navigate).not.toHaveBeenCalled();
    });

    it('should handle complex params', () => {
      const params = {
        userId: '123',
        tab: 'moments',
        filters: { category: 'travel', limit: 10 },
      };

      navigate('ProfileDetail', params);

      expect(navigationRef.navigate).toHaveBeenCalledWith('ProfileDetail', params);
    });

    it('should handle multiple navigations', () => {
      navigate('Home');
      navigate('ProfileDetail', { userId: '123' });
      navigate('MomentDetail', { momentId: '456' });

      expect(navigationRef.navigate).toHaveBeenCalledTimes(3);
    });
  });

  // ===========================
  // Reset Navigation Tests
  // ===========================

  describe('resetNavigation()', () => {
    it('should reset navigation stack', () => {
      resetNavigation('Home');

      expect(navigationRef.isReady).toHaveBeenCalled();
      expect(navigationRef.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    });

    it('should not reset when not ready', () => {
      (navigationRef.isReady as jest.Mock).mockReturnValue(false);

      resetNavigation('Home');

      expect(navigationRef.reset).not.toHaveBeenCalled();
    });

    it('should reset to different screens', () => {
      const screens = ['Home', 'Login', 'Onboarding'];

      screens.forEach(screen => {
        jest.clearAllMocks();
        resetNavigation(screen);

        expect(navigationRef.reset).toHaveBeenCalledWith({
          index: 0,
          routes: [{ name: screen }],
        });
      });
    });
  });

  // ===========================
  // Go Back Tests
  // ===========================

  describe('goBack()', () => {
    it('should go back when possible', () => {
      (navigationRef.canGoBack as jest.Mock).mockReturnValue(true);

      goBack();

      expect(navigationRef.isReady).toHaveBeenCalled();
      expect(navigationRef.canGoBack).toHaveBeenCalled();
      expect(navigationRef.goBack).toHaveBeenCalled();
    });

    it('should not go back when cannot go back', () => {
      (navigationRef.canGoBack as jest.Mock).mockReturnValue(false);

      goBack();

      expect(navigationRef.goBack).not.toHaveBeenCalled();
    });

    it('should not go back when not ready', () => {
      (navigationRef.isReady as jest.Mock).mockReturnValue(false);

      goBack();

      expect(navigationRef.goBack).not.toHaveBeenCalled();
    });
  });

  // ===========================
  // Navigation Ref Tests
  // ===========================

  describe('navigationRef', () => {
    it('should export navigation ref', () => {
      expect(navigationRef).toBeDefined();
      expect(navigationRef.isReady).toBeDefined();
      expect(navigationRef.navigate).toBeDefined();
      expect(navigationRef.reset).toBeDefined();
      expect(navigationRef.goBack).toBeDefined();
    });

    it('should allow checking readiness', () => {
      (navigationRef.isReady as jest.Mock).mockReturnValue(true);

      expect(navigationRef.isReady()).toBe(true);

      (navigationRef.isReady as jest.Mock).mockReturnValue(false);

      expect(navigationRef.isReady()).toBe(false);
    });
  });

  // ===========================
  // Edge Cases
  // ===========================

  describe('Edge Cases', () => {
    it('should handle rapid successive navigations', () => {
      for (let i = 0; i < 10; i++) {
        navigate(`Screen${i}`);
      }

      expect(navigationRef.navigate).toHaveBeenCalledTimes(10);
    });

    it('should handle navigation with null params', () => {
      navigate('Home', null as any);

      expect(navigationRef.navigate).toHaveBeenCalledWith('Home', null);
    });

    it('should handle empty string screen name', () => {
      navigate('');

      expect(navigationRef.navigate).toHaveBeenCalledWith('', undefined);
    });

    it('should handle navigation state transitions', () => {
      // Not ready
      (navigationRef.isReady as jest.Mock).mockReturnValue(false);
      navigate('Home');
      expect(navigationRef.navigate).not.toHaveBeenCalled();

      // Becomes ready
      (navigationRef.isReady as jest.Mock).mockReturnValue(true);
      navigate('Home');
      expect(navigationRef.navigate).toHaveBeenCalledTimes(1);
    });

    it('should handle canGoBack state changes', () => {
      // Can go back
      (navigationRef.canGoBack as jest.Mock).mockReturnValue(true);
      goBack();
      expect(navigationRef.goBack).toHaveBeenCalledTimes(1);

      // Cannot go back
      (navigationRef.canGoBack as jest.Mock).mockReturnValue(false);
      goBack();
      expect(navigationRef.goBack).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should handle resetNavigation followed by navigate', () => {
      resetNavigation('Login');
      navigate('Home');

      expect(navigationRef.reset).toHaveBeenCalledTimes(1);
      expect(navigationRef.navigate).toHaveBeenCalledTimes(1);
    });

    it('should handle concurrent navigation and reset', () => {
      navigate('Screen1');
      resetNavigation('Home');
      navigate('Screen2');

      expect(navigationRef.navigate).toHaveBeenCalledTimes(2);
      expect(navigationRef.reset).toHaveBeenCalledTimes(1);
    });
  });
});

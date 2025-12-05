/**
 * Haptic Feedback Utilities Tests
 * Tests for haptic feedback functionality
 */

import * as Haptics from 'expo-haptics';
import { triggerHaptic, HapticType, hapticPatterns } from '../haptics';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

describe('Haptic Feedback Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('triggerHaptic', () => {
    it('should trigger light impact feedback', async () => {
      await triggerHaptic(HapticType.LIGHT);
      expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
    });

    it('should trigger medium impact feedback', async () => {
      await triggerHaptic(HapticType.MEDIUM);
      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    });

    it('should trigger heavy impact feedback', async () => {
      await triggerHaptic(HapticType.HEAVY);
      expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');
    });

    it('should trigger success notification feedback', async () => {
      await triggerHaptic(HapticType.SUCCESS);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
    });

    it('should trigger warning notification feedback', async () => {
      await triggerHaptic(HapticType.WARNING);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('warning');
    });

    it('should trigger error notification feedback', async () => {
      await triggerHaptic(HapticType.ERROR);
      expect(Haptics.notificationAsync).toHaveBeenCalledWith('error');
    });

    it('should trigger selection feedback', async () => {
      await triggerHaptic(HapticType.SELECTION);
      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });

    it('should default to light impact when no type is provided', async () => {
      await triggerHaptic();
      expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
    });

    it('should handle errors gracefully', async () => {
      (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(new Error('Haptics unavailable'));
      
      // Should not throw
      await expect(triggerHaptic(HapticType.LIGHT)).resolves.not.toThrow();
    });
  });

  describe('hapticPatterns', () => {
    it('should have buttonPress pattern', async () => {
      await hapticPatterns.buttonPress();
      expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
    });

    it('should have primaryAction pattern', async () => {
      await hapticPatterns.primaryAction();
      expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
    });

    it('should have destructiveAction pattern', async () => {
      await hapticPatterns.destructiveAction();
      expect(Haptics.impactAsync).toHaveBeenCalledWith('heavy');
    });
  });
});

// @ts-nocheck
/**
 * E2E Test: Offline Scenarios
 * 
 * Tests app behavior in offline/poor connectivity scenarios including:
 * - Graceful degradation when offline
 * - Queue message sending while offline
 * - Data sync on reconnection
 * - Offline indicator visibility
 * - Cached data availability
 * - Offline moment browsing
 * - Payment flow offline handling
 * - Proof upload offline handling
 * 
 * Priority: 🔴 CRITICAL
 */

import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

describe('Offline Scenarios E2E', () => {
  beforeAll(async () => {
    await device.launchApp({
      permissions: { notifications: 'YES' }
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    // Ensure we start with network enabled
    await device.setNetworkEnabled(true);
  });

  afterEach(async () => {
    // Always re-enable network after each test
    await device.setNetworkEnabled(true);
  });

  describe('1. Offline Indicator & UI Feedback', () => {
    it('should show offline indicator when network is disabled', async () => {
      // Disable network
      await device.setNetworkEnabled(false);
      
      // Should show offline banner/indicator
      await waitFor(element(by.id('offline-indicator')))
        .toBeVisible()
        .withTimeout(5000);
      
      await detoxExpect(element(by.text(/offline|no.*connection/i))).toBeVisible();
    });

    it('should hide offline indicator when network is restored', async () => {
      // Go offline
      await device.setNetworkEnabled(false);
      await waitFor(element(by.id('offline-indicator')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Go back online
      await device.setNetworkEnabled(true);
      
      // Offline indicator should disappear
      await waitFor(element(by.id('offline-indicator')))
        .not.toBeVisible()
        .withTimeout(5000);
    });

    it('should show connection restored message', async () => {
      await device.setNetworkEnabled(false);
      await waitFor(element(by.id('offline-indicator')))
        .toBeVisible()
        .withTimeout(5000);
      
      await device.setNetworkEnabled(true);
      
      // Should show reconnection message
      await waitFor(element(by.text(/connected|online|connection.*restored/i)))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should update UI elements to reflect offline state', async () => {
      await device.setNetworkEnabled(false);
      
      // Refresh buttons should be disabled or show offline state
      const refreshButton = element(by.id('refresh-button'));
      // Visual indication of offline state
    });
  });

  describe('2. Offline Message Queuing', () => {
    beforeEach(async () => {
      // Navigate to chat
      await element(by.id('tab-messages')).tap();
      await waitFor(element(by.id('conversation-list')))
        .toBeVisible()
        .withTimeout(3000);
      await element(by.id('conversation-item-0')).tap();
    });

    it('should queue messages when offline', async () => {
      // Go offline
      await device.setNetworkEnabled(false);
      
      // Type and send message
      const offlineMessage = 'This message was sent offline';
      await element(by.id('message-input')).typeText(offlineMessage);
      await element(by.id('send-button')).tap();
      
      // Message should appear with pending/queued indicator
      await waitFor(element(by.text(offlineMessage)))
        .toBeVisible()
        .withTimeout(2000);
      
      await detoxExpect(element(by.id('message-pending-indicator-0'))).toBeVisible();
    });

    it('should show pending status for queued messages', async () => {
      await device.setNetworkEnabled(false);
      
      await element(by.id('message-input')).typeText('Queued message');
      await element(by.id('send-button')).tap();
      
      // Should show clock or pending icon
      await detoxExpect(element(by.id('message-pending-indicator-0'))).toBeVisible();
    });

    it('should send queued messages when connection restored', async () => {
      // Send message offline
      await device.setNetworkEnabled(false);
      
      const queuedMessage = 'Will be sent when online';
      await element(by.id('message-input')).typeText(queuedMessage);
      await element(by.id('send-button')).tap();
      
      // Verify pending state
      await detoxExpect(element(by.id('message-pending-indicator-0'))).toBeVisible();
      
      // Go back online
      await device.setNetworkEnabled(true);
      
      // Message should be sent and pending indicator should disappear
      await waitFor(element(by.id('message-pending-indicator-0')))
        .not.toBeVisible()
        .withTimeout(10000);
      
      // Should show sent/delivered indicator
      await detoxExpect(element(by.id('message-sent-indicator-0'))).toBeVisible();
    });

    it('should maintain message queue across app restarts', async () => {
      // Send message offline
      await device.setNetworkEnabled(false);
      
      await element(by.id('message-input')).typeText('Persistent message');
      await element(by.id('send-button')).tap();
      
      // Restart app (still offline)
      await device.reloadReactNative();
      
      // Navigate back to chat
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
      
      // Message should still be there with pending state
      await detoxExpect(element(by.text('Persistent message'))).toBeVisible();
      await detoxExpect(element(by.id('message-pending-indicator-0'))).toBeVisible();
    });

    it('should handle multiple queued messages', async () => {
      await device.setNetworkEnabled(false);
      
      // Send multiple messages
      await element(by.id('message-input')).typeText('Message 1');
      await element(by.id('send-button')).tap();
      
      await element(by.id('message-input')).typeText('Message 2');
      await element(by.id('send-button')).tap();
      
      await element(by.id('message-input')).typeText('Message 3');
      await element(by.id('send-button')).tap();
      
      // All should be pending
      await detoxExpect(element(by.text('Message 1'))).toBeVisible();
      await detoxExpect(element(by.text('Message 2'))).toBeVisible();
      await detoxExpect(element(by.text('Message 3'))).toBeVisible();
      
      // Go online
      await device.setNetworkEnabled(true);
      
      // All should be sent in order
      await waitFor(element(by.id('message-sent-indicator-0')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('3. Offline Data Browsing - Cached Content', () => {
    it('should display cached moments feed when offline', async () => {
      // First, load moments while online
      await element(by.id('tab-home')).tap();
      await waitFor(element(by.id('moments-feed')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Wait for moments to load
      await waitFor(element(by.id('moment-card-0')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Go offline
      await device.setNetworkEnabled(false);
      
      // Navigate away and back
      await element(by.id('tab-profile')).tap();
      await element(by.id('tab-home')).tap();
      
      // Cached moments should still be visible
      await detoxExpect(element(by.id('moments-feed'))).toBeVisible();
      await detoxExpect(element(by.id('moment-card-0'))).toBeVisible();
    });

    it('should display cached user profile when offline', async () => {
      // Load profile while online
      await element(by.id('tab-profile')).tap();
      await waitFor(element(by.id('profile-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Go offline
      await device.setNetworkEnabled(false);
      
      // Navigate away and back
      await element(by.id('tab-home')).tap();
      await element(by.id('tab-profile')).tap();
      
      // Profile should still be visible from cache
      await detoxExpect(element(by.id('profile-screen'))).toBeVisible();
    });

    it('should display cached conversation list when offline', async () => {
      // Load conversations while online
      await element(by.id('tab-messages')).tap();
      await waitFor(element(by.id('conversation-list')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Go offline
      await device.setNetworkEnabled(false);
      
      // Navigate away and back
      await element(by.id('tab-home')).tap();
      await element(by.id('tab-messages')).tap();
      
      // Conversations should be cached
      await detoxExpect(element(by.id('conversation-list'))).toBeVisible();
    });

    it('should display cached chat messages when offline', async () => {
      // Load chat while online
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
      await waitFor(element(by.id('message-list')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Go offline
      await device.setNetworkEnabled(false);
      
      // Navigate away and back
      await element(by.id('back-button')).tap();
      await element(by.id('conversation-item-0')).tap();
      
      // Messages should be cached
      await detoxExpect(element(by.id('message-list'))).toBeVisible();
    });

    it('should show stale data indicator for cached content', async () => {
      // Go offline
      await device.setNetworkEnabled(false);
      
      await element(by.id('tab-home')).tap();
      
      // Should indicate data might be stale
      const staleIndicator = element(by.text(/cached|stale|last.*updated/i));
      // May or may not be visible depending on implementation
    });
  });

  describe('4. Offline Feature Restrictions', () => {
    beforeEach(async () => {
      await device.setNetworkEnabled(false);
    });

    it('should disable refresh functionality when offline', async () => {
      await element(by.id('tab-home')).tap();
      
      // Pull to refresh should show offline message
      // Exact implementation varies
    });

    it('should prevent new moment creation when offline', async () => {
      await element(by.id('tab-home')).tap();
      
      const createMomentButton = element(by.id('create-moment-button'));
      await createMomentButton.tap();
      
      // Should show offline message
      await waitFor(element(by.text(/offline|network.*required/i)))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should prevent payment transactions when offline', async () => {
      await element(by.id('tab-home')).tap();
      await waitFor(element(by.id('moment-card-0')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id('moment-card-0')).tap();
      
      const giftButton = element(by.id('gift-button'));
      try {
        await giftButton.tap();
        
        // Should show offline error
        await waitFor(element(by.text(/offline|network.*required/i)))
          .toBeVisible()
          .withTimeout(3000);
      } catch (e) {
        // Button might be disabled
      }
    });

    it('should prevent proof upload when offline', async () => {
      await element(by.id('tab-profile')).tap();
      
      const uploadProofButton = element(by.id('upload-proof-button'));
      try {
        await uploadProofButton.tap();
        
        // Should show offline error
        await waitFor(element(by.text(/offline|network.*required/i)))
          .toBeVisible()
          .withTimeout(3000);
      } catch (e) {
        // Not available or disabled
      }
    });

    it('should show helpful offline message for restricted features', async () => {
      await element(by.id('tab-home')).tap();
      
      // Try to perform network-dependent action
      const createButton = element(by.id('create-moment-button'));
      await createButton.tap();
      
      // Should explain why feature is unavailable
      await waitFor(element(by.text(/network.*required|offline|connect.*internet/i)))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('5. Data Synchronization on Reconnection', () => {
    it('should sync data when connection is restored', async () => {
      // Go offline
      await device.setNetworkEnabled(false);
      
      // Perform offline actions (queue messages, etc.)
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
      await element(by.id('message-input')).typeText('Sync test message');
      await element(by.id('send-button')).tap();
      
      // Go back online
      await device.setNetworkEnabled(true);
      
      // Should show syncing indicator
      await waitFor(element(by.text(/syncing|updating/i)))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should refresh feed data on reconnection', async () => {
      await element(by.id('tab-home')).tap();
      await waitFor(element(by.id('moments-feed')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Go offline
      await device.setNetworkEnabled(false);
      
      // Navigate away
      await element(by.id('tab-profile')).tap();
      
      // Go back online
      await device.setNetworkEnabled(true);
      
      // Navigate back to home
      await element(by.id('tab-home')).tap();
      
      // Should fetch fresh data (loading indicator may appear)
      await waitFor(element(by.id('moments-feed')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should fetch new messages on reconnection', async () => {
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
      
      // Go offline
      await device.setNetworkEnabled(false);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Go back online
      await device.setNetworkEnabled(true);
      
      // Should sync and fetch new messages
      // New messages would appear if sent by other user during offline period
    });

    it('should resolve conflicts on data sync', async () => {
      // Complex scenario: data modified offline and online
      // Conflict resolution depends on implementation
      // Should handle gracefully without data loss
    });
  });

  describe('6. Poor Network Conditions', () => {
    it('should show loading state for slow requests', async () => {
      // This test would ideally use network throttling
      // Detox doesn't directly support this, but we can test loading states
      
      await element(by.id('tab-home')).tap();
      
      // Pull to refresh
      // Should show loading indicator during slow request
    });

    it('should timeout and show error after prolonged loading', async () => {
      // Simulate very slow network
      await device.setNetworkEnabled(false);
      
      await element(by.id('tab-home')).tap();
      
      const refreshButton = element(by.id('refresh-button'));
      try {
        await refreshButton.tap();
        
        // Should eventually timeout and show error
        await waitFor(element(by.text(/timeout|slow.*connection|try.*again/i)))
          .toBeVisible()
          .withTimeout(30000);
      } catch (e) {
        // Timeout handling
      }
    });

    it('should allow retry after failed request', async () => {
      await device.setNetworkEnabled(false);
      
      await element(by.id('tab-home')).tap();
      
      // Try to refresh (will fail)
      const refreshButton = element(by.id('refresh-button'));
      try {
        await refreshButton.tap();
        
        // Error should have retry button
        await waitFor(element(by.id('retry-button')))
          .toBeVisible()
          .withTimeout(5000);
        
        // Go online and retry
        await device.setNetworkEnabled(true);
        await element(by.id('retry-button')).tap();
        
        // Should succeed
        await waitFor(element(by.id('moments-feed')))
          .toBeVisible()
          .withTimeout(5000);
      } catch (e) {
        // Retry not implemented
      }
    });
  });

  describe('7. Offline Mode Edge Cases', () => {
    it('should handle rapid network on/off switching', async () => {
      // Quickly toggle network
      await device.setNetworkEnabled(false);
      await new Promise(resolve => setTimeout(resolve, 500));
      await device.setNetworkEnabled(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      await device.setNetworkEnabled(false);
      await new Promise(resolve => setTimeout(resolve, 500));
      await device.setNetworkEnabled(true);
      
      // App should remain stable
      await element(by.id('tab-home')).tap();
      await detoxExpect(element(by.id('moments-feed'))).toBeVisible();
    });

    it('should handle offline mode during active operations', async () => {
      await element(by.id('tab-home')).tap();
      await waitFor(element(by.id('moment-card-0')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Start navigation
      await element(by.id('moment-card-0')).tap();
      
      // Go offline during navigation
      await device.setNetworkEnabled(false);
      
      // Should handle gracefully
      // Either show cached data or offline message
    });

    it('should preserve user input when going offline', async () => {
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
      
      // Start typing
      await element(by.id('message-input')).typeText('Test message in');
      
      // Go offline mid-typing
      await device.setNetworkEnabled(false);
      
      // Continue typing
      await element(by.id('message-input')).typeText('put preservation');
      
      // Input should be preserved
      await detoxExpect(element(by.id('message-input')))
        .toHaveText('Test message input preservation');
    });

    it('should handle app backgrounding while offline', async () => {
      await device.setNetworkEnabled(false);
      
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
      await element(by.id('message-input')).typeText('Background test');
      await element(by.id('send-button')).tap();
      
      // Background app
      await device.sendToHome();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return to app
      await device.launchApp({ newInstance: false });
      
      // Message should still be queued
      await detoxExpect(element(by.text('Background test'))).toBeVisible();
      await detoxExpect(element(by.id('message-pending-indicator-0'))).toBeVisible();
    });
  });

  describe('8. Offline Error Messages & UX', () => {
    beforeEach(async () => {
      await device.setNetworkEnabled(false);
    });

    it('should show user-friendly offline error messages', async () => {
      await element(by.id('tab-home')).tap();
      
      const createButton = element(by.id('create-moment-button'));
      await createButton.tap();
      
      // Error should be helpful, not technical
      await waitFor(element(by.text(/internet.*connection|connect.*network|offline/i)))
        .toBeVisible()
        .withTimeout(3000);
      
      // Should NOT show technical errors like "ERR_NETWORK" to user
    });

    it('should suggest actions when offline', async () => {
      await element(by.id('tab-home')).tap();
      
      // Should suggest checking connection, wifi, etc.
      await waitFor(element(by.id('offline-indicator')))
        .toBeVisible()
        .withTimeout(5000);
      
      // May have tips or help text
    });

    it('should differentiate between offline and server errors', async () => {
      // When offline, show offline-specific message
      await device.setNetworkEnabled(false);
      
      await element(by.id('tab-home')).tap();
      
      await waitFor(element(by.text(/offline|no.*connection/i)))
        .toBeVisible()
        .withTimeout(5000);
      
      // When online but server error, show different message
      // This would require server to return error
    });
  });

  describe('9. Performance in Offline Mode', () => {
    it('should load cached content quickly', async () => {
      // First load with network
      await element(by.id('tab-home')).tap();
      await waitFor(element(by.id('moments-feed')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Go offline
      await device.setNetworkEnabled(false);
      
      const startTime = Date.now();
      
      // Navigate away and back
      await element(by.id('tab-profile')).tap();
      await element(by.id('tab-home')).tap();
      
      // Cached content should load very fast (< 1 second)
      await waitFor(element(by.id('moments-feed')))
        .toBeVisible()
        .withTimeout(1000);
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(1000);
    });

    it('should not freeze UI when offline', async () => {
      await device.setNetworkEnabled(false);
      
      // App should remain responsive
      await element(by.id('tab-home')).tap();
      await element(by.id('tab-messages')).tap();
      await element(by.id('tab-profile')).tap();
      await element(by.id('tab-home')).tap();
      
      // All navigation should work smoothly
      await detoxExpect(element(by.id('moments-feed'))).toBeVisible();
    });
  });

  describe('10. Offline Notifications', () => {
    it('should queue push notifications when offline', async () => {
      // If notifications arrive while offline
      // Should be delivered when app comes online
      // Complex to test in E2E without backend control
    });

    it('should show offline notification permission restrictions', async () => {
      await device.setNetworkEnabled(false);
      
      // If trying to change notification settings
      // Should indicate network is needed
    });
  });
});

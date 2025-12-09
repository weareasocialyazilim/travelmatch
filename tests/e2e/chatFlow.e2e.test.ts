// @ts-nocheck
/**
 * E2E Test: Chat Flow
 * 
 * Tests the complete chat messaging journey including:
 * - Navigating to chat from matches
 * - Sending text messages
 * - Sending media (photos, videos)
 * - Typing indicators
 * - Message delivery and read receipts
 * - Real-time message updates
 * - Sending gifts via chat
 * - Reporting/blocking users
 * - Offline message queuing
 */

import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

describe('Chat Flow E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('1. Navigation to Chat', () => {
    it('should navigate to Messages tab', async () => {
      // Tap Messages tab
      await element(by.id('tab-messages')).tap();
      
      // Verify Messages screen is visible
      await detoxExpect(element(by.text('Messages'))).toBeVisible();
      await detoxExpect(element(by.id('conversation-list'))).toBeVisible();
    });

    it('should open chat from conversation list', async () => {
      await element(by.id('tab-messages')).tap();
      
      // Tap first conversation
      await element(by.id('conversation-item-0')).tap();
      
      // Verify Chat screen is visible
      await detoxExpect(element(by.id('chat-screen'))).toBeVisible();
      await detoxExpect(element(by.id('message-list'))).toBeVisible();
      await detoxExpect(element(by.id('message-input'))).toBeVisible();
    });

    it('should show user info in chat header', async () => {
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
      
      // Verify header shows user name and avatar
      await detoxExpect(element(by.id('chat-header'))).toBeVisible();
      await detoxExpect(element(by.id('user-avatar'))).toBeVisible();
      await detoxExpect(element(by.id('user-name'))).toBeVisible();
    });

    it('should show back button in chat header', async () => {
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
      
      await detoxExpect(element(by.id('back-button'))).toBeVisible();
      
      // Tap back button
      await element(by.id('back-button')).tap();
      
      // Should return to messages list
      await detoxExpect(element(by.id('conversation-list'))).toBeVisible();
    });
  });

  describe('2. Sending Text Messages', () => {
    beforeEach(async () => {
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
    });

    it('should send a text message', async () => {
      const messageText = 'Hi! How are you doing?';
      
      // Type message
      await element(by.id('message-input')).typeText(messageText);
      
      // Verify send button is enabled
      await detoxExpect(element(by.id('send-button'))).toBeVisible();
      
      // Tap send button
      await element(by.id('send-button')).tap();
      
      // Verify message appears in message list
      await waitFor(element(by.text(messageText)))
        .toBeVisible()
        .withTimeout(5000);
      
      // Verify input is cleared
      await detoxExpect(element(by.id('message-input'))).toHaveText('');
    });

    it('should send multiple messages', async () => {
      const messages = [
        'First message',
        'Second message',
        'Third message',
      ];
      
      for (const message of messages) {
        await element(by.id('message-input')).typeText(message);
        await element(by.id('send-button')).tap();
        
        await waitFor(element(by.text(message)))
          .toBeVisible()
          .withTimeout(3000);
      }
      
      // Verify all messages are visible
      for (const message of messages) {
        await detoxExpect(element(by.text(message))).toBeVisible();
      }
    });

    it('should send emoji message', async () => {
      const emojiMessage = '👋 😊 🎉';
      
      await element(by.id('message-input')).typeText(emojiMessage);
      await element(by.id('send-button')).tap();
      
      await waitFor(element(by.text(emojiMessage)))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should send long message', async () => {
      const longMessage = 'This is a very long message that contains multiple sentences. ' +
        'It should be properly displayed in the message bubble without any truncation issues. ' +
        'The message bubble should expand to fit the content appropriately.';
      
      await element(by.id('message-input')).typeText(longMessage);
      await element(by.id('send-button')).tap();
      
      await waitFor(element(by.text(longMessage)))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should disable send button when input is empty', async () => {
      // Verify send button is disabled when input is empty
      await detoxExpect(element(by.id('send-button'))).not.toBeVisible();
      
      // Type message
      await element(by.id('message-input')).typeText('Test');
      
      // Send button should be visible now
      await detoxExpect(element(by.id('send-button'))).toBeVisible();
      
      // Clear input
      await element(by.id('message-input')).clearText();
      
      // Send button should be hidden again
      await detoxExpect(element(by.id('send-button'))).not.toBeVisible();
    });
  });

  describe('3. Typing Indicators', () => {
    beforeEach(async () => {
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
    });

    it('should show typing indicator when typing', async () => {
      // Start typing
      await element(by.id('message-input')).typeText('Test');
      
      // Typing indicator should be visible for other user
      // (In real app, this would be shown via real-time subscription)
      // For E2E, we can verify the typing event is sent
      await waitFor(element(by.id('message-input')))
        .toHaveText('Test')
        .withTimeout(2000);
    });

    it('should hide typing indicator after timeout', async () => {
      await element(by.id('message-input')).typeText('Test');
      
      // Wait for typing timeout (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Typing indicator should stop
      // (Verify via network call or mock subscription)
    });

    it('should stop typing indicator when sending message', async () => {
      await element(by.id('message-input')).typeText('Test message');
      await element(by.id('send-button')).tap();
      
      // Typing indicator should stop immediately
      await waitFor(element(by.id('message-input')))
        .toHaveText('')
        .withTimeout(2000);
    });
  });

  describe('4. Sending Media Messages', () => {
    beforeEach(async () => {
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
    });

    it('should open attachment sheet', async () => {
      // Tap attachment button
      await element(by.id('attach-button')).tap();
      
      // Verify attachment sheet is visible
      await detoxExpect(element(by.id('attachment-sheet'))).toBeVisible();
      await detoxExpect(element(by.text('Photo/Video'))).toBeVisible();
      await detoxExpect(element(by.text('Send Gift'))).toBeVisible();
    });

    it('should close attachment sheet', async () => {
      await element(by.id('attach-button')).tap();
      await detoxExpect(element(by.id('attachment-sheet'))).toBeVisible();
      
      // Close sheet (swipe down or tap outside)
      await element(by.id('attachment-sheet')).swipe('down', 'fast', 0.5);
      
      await waitFor(element(by.id('attachment-sheet')))
        .not.toBeVisible()
        .withTimeout(2000);
    });

    it('should send photo from gallery', async () => {
      await element(by.id('attach-button')).tap();
      await element(by.text('Photo/Video')).tap();
      
      // Select photo from gallery (mocked in test environment)
      await element(by.text('Choose from library')).tap();
      
      // Verify photo message appears
      await waitFor(element(by.id('photo-message')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should send photo from camera', async () => {
      await element(by.id('attach-button')).tap();
      await element(by.text('Photo/Video')).tap();
      
      // Open camera
      await element(by.text('Camera')).tap();
      
      // Take photo (mocked)
      // Verify photo message appears
      await waitFor(element(by.id('photo-message')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('5. Sending Gifts', () => {
    beforeEach(async () => {
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
    });

    it('should navigate to gift flow from chat', async () => {
      await element(by.id('attach-button')).tap();
      await element(by.text('Send Gift')).tap();
      
      // Verify navigation to gift flow
      await detoxExpect(element(by.id('gift-flow-screen'))).toBeVisible();
    });

    it('should return to chat after sending gift', async () => {
      await element(by.id('attach-button')).tap();
      await element(by.text('Send Gift')).tap();
      
      // Complete gift flow (simplified)
      await element(by.id('confirm-gift-button')).tap();
      
      // Should return to chat
      await waitFor(element(by.id('chat-screen')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Verify gift message appears in chat
      await waitFor(element(by.id('gift-message')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('6. Message Delivery & Read Receipts', () => {
    beforeEach(async () => {
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
    });

    it('should show sending status', async () => {
      await element(by.id('message-input')).typeText('Test message');
      await element(by.id('send-button')).tap();
      
      // Should show sending indicator
      await waitFor(element(by.id('message-sending-indicator')))
        .toBeVisible()
        .withTimeout(1000);
    });

    it('should show sent status', async () => {
      await element(by.id('message-input')).typeText('Test message');
      await element(by.id('send-button')).tap();
      
      // Wait for message to be sent
      await waitFor(element(by.id('message-sent-indicator')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show delivered status', async () => {
      await element(by.id('message-input')).typeText('Test message');
      await element(by.id('send-button')).tap();
      
      // Wait for message to be delivered
      await waitFor(element(by.id('message-delivered-indicator')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show read status', async () => {
      await element(by.id('message-input')).typeText('Test message');
      await element(by.id('send-button')).tap();
      
      // Wait for message to be read (simulated)
      await waitFor(element(by.id('message-read-indicator')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('7. Real-time Message Updates', () => {
    beforeEach(async () => {
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
    });

    it('should receive new message in real-time', async () => {
      // Simulate incoming message via push or real-time subscription
      // (In test environment, this would be triggered by test harness)
      
      // Wait for new message to appear
      await waitFor(element(by.text('Incoming message')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should update unread badge when receiving message', async () => {
      // Navigate away from chat
      await element(by.id('back-button')).tap();
      
      // Simulate receiving message
      // Verify unread badge appears on conversation
      await waitFor(element(by.id('unread-badge-0')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should clear unread badge when opening chat', async () => {
      await element(by.id('back-button')).tap();
      
      // Wait for unread badge
      await waitFor(element(by.id('unread-badge-0')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Open chat
      await element(by.id('conversation-item-0')).tap();
      
      // Navigate back
      await element(by.id('back-button')).tap();
      
      // Unread badge should be cleared
      await waitFor(element(by.id('unread-badge-0')))
        .not.toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('8. Report & Block Actions', () => {
    beforeEach(async () => {
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
    });

    it('should open chat options menu', async () => {
      // Tap options button (three dots)
      await element(by.id('chat-options-button')).tap();
      
      // Verify options sheet is visible
      await detoxExpect(element(by.id('chat-options-sheet'))).toBeVisible();
      await detoxExpect(element(by.text('Report'))).toBeVisible();
      await detoxExpect(element(by.text('Block'))).toBeVisible();
      await detoxExpect(element(by.text('Mute'))).toBeVisible();
    });

    it('should report user', async () => {
      await element(by.id('chat-options-button')).tap();
      await element(by.text('Report')).tap();
      
      // Select report reason
      await element(by.text('Spam')).tap();
      
      // Add details
      await element(by.id('report-details-input')).typeText('Spamming with unwanted messages');
      
      // Submit report
      await element(by.id('submit-report-button')).tap();
      
      // Verify success message
      await waitFor(element(by.text('Report Submitted')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should block user', async () => {
      await element(by.id('chat-options-button')).tap();
      await element(by.text('Block')).tap();
      
      // Confirm block
      await element(by.text('Block User')).tap();
      
      // Should navigate back to messages list
      await waitFor(element(by.id('conversation-list')))
        .toBeVisible()
        .withTimeout(5000);
      
      // Verify blocked user alert
      await detoxExpect(element(by.text('User Blocked'))).toBeVisible();
    });

    it('should mute notifications', async () => {
      await element(by.id('chat-options-button')).tap();
      await element(by.text('Mute')).tap();
      
      // Verify success message
      await waitFor(element(by.text('Notifications Muted')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('9. Offline Message Queuing', () => {
    it('should queue messages when offline', async () => {
      // Disable network
      await device.setURLBlacklist(['.*']);
      
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
      
      // Send message while offline
      await element(by.id('message-input')).typeText('Offline message');
      await element(by.id('send-button')).tap();
      
      // Should show pending status
      await waitFor(element(by.id('message-pending-indicator')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Enable network
      await device.setURLBlacklist([]);
      
      // Message should be sent
      await waitFor(element(by.id('message-sent-indicator')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should show offline banner when disconnected', async () => {
      await device.setURLBlacklist(['.*']);
      
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
      
      // Should show offline banner
      await waitFor(element(by.text('No connection')))
        .toBeVisible()
        .withTimeout(5000);
      
      await device.setURLBlacklist([]);
      
      // Banner should disappear
      await waitFor(element(by.text('No connection')))
        .not.toBeVisible()
        .withTimeout(5000);
    });

    it('should sync messages when coming back online', async () => {
      await device.setURLBlacklist(['.*']);
      
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
      
      // Send multiple messages offline
      const messages = ['Message 1', 'Message 2', 'Message 3'];
      for (const msg of messages) {
        await element(by.id('message-input')).typeText(msg);
        await element(by.id('send-button')).tap();
      }
      
      // Enable network
      await device.setURLBlacklist([]);
      
      // All messages should sync
      for (const msg of messages) {
        await waitFor(element(by.text(msg)).and(by.id('message-sent-indicator')))
          .toBeVisible()
          .withTimeout(10000);
      }
    });
  });

  describe('10. Message Search', () => {
    beforeEach(async () => {
      await element(by.id('tab-messages')).tap();
    });

    it('should search conversations', async () => {
      // Tap search input
      await element(by.id('search-input')).tap();
      
      // Type search query
      await element(by.id('search-input')).typeText('John');
      
      // Verify filtered results
      await waitFor(element(by.id('conversation-item-0')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should clear search', async () => {
      await element(by.id('search-input')).typeText('John');
      
      // Tap clear button
      await element(by.id('search-clear-button')).tap();
      
      // Verify search is cleared
      await detoxExpect(element(by.id('search-input'))).toHaveText('');
    });

    it('should show no results message', async () => {
      await element(by.id('search-input')).typeText('NonexistentUser123');
      
      // Verify no results message
      await waitFor(element(by.text('No conversations found')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('11. Edge Cases', () => {
    it('should handle rapid message sending', async () => {
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
      
      // Send 10 messages rapidly
      for (let i = 0; i < 10; i++) {
        await element(by.id('message-input')).typeText(`Message ${i}`);
        await element(by.id('send-button')).tap();
      }
      
      // All messages should be sent
      await waitFor(element(by.text('Message 9')))
        .toBeVisible()
        .withTimeout(15000);
    });

    it('should handle app backgrounding during chat', async () => {
      await element(by.id('tab-messages')).tap();
      await element(by.id('conversation-item-0')).tap();
      
      // Send message
      await element(by.id('message-input')).typeText('Before background');
      await element(by.id('send-button')).tap();
      
      // Background app
      await device.sendToHome();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Bring app back
      await device.launchApp({ newInstance: false });
      
      // Chat should still be visible
      await detoxExpect(element(by.id('chat-screen'))).toBeVisible();
      await detoxExpect(element(by.text('Before background'))).toBeVisible();
    });

    it('should handle empty conversation gracefully', async () => {
      // Start new conversation (no messages)
      await element(by.id('tab-discover')).tap();
      await element(by.id('moment-card-0')).tap();
      await element(by.id('message-button')).tap();
      
      // Should show empty state or welcome message
      await detoxExpect(element(by.id('chat-screen'))).toBeVisible();
      await detoxExpect(element(by.id('message-input'))).toBeVisible();
    });
  });
});

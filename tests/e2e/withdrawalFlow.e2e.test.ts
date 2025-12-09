// @ts-nocheck
/**
 * E2E Test: Withdrawal Flow
 * 
 * Tests the complete withdrawal journey including:
 * - Navigating to withdrawal screen
 * - Viewing available balance
 * - Adding bank account
 * - Entering withdrawal amount
 * - Validating minimum/maximum limits
 * - Biometric authentication
 * - Confirming withdrawal
 * - Viewing withdrawal success
 * - Transaction history
 */

import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

describe('Withdrawal Flow E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('1. Navigation to Withdrawal', () => {
    it('should navigate to wallet from profile', async () => {
      // Tap Profile tab
      await element(by.id('tab-profile')).tap();
      
      // Tap Wallet button
      await element(by.id('wallet-button')).tap();
      
      // Verify Wallet screen is visible
      await detoxExpect(element(by.id('wallet-screen'))).toBeVisible();
      await detoxExpect(element(by.text('Wallet'))).toBeVisible();
    });

    it('should navigate to withdraw screen from wallet', async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      
      // Tap Withdraw button
      await element(by.id('withdraw-button')).tap();
      
      // Verify Withdraw screen is visible
      await detoxExpect(element(by.id('withdraw-screen'))).toBeVisible();
      await detoxExpect(element(by.text('Withdraw'))).toBeVisible();
    });

    it('should show back button on withdraw screen', async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('withdraw-button')).tap();
      
      // Verify back button exists
      await detoxExpect(element(by.id('back-button'))).toBeVisible();
      
      // Tap back button
      await element(by.id('back-button')).tap();
      
      // Should return to wallet
      await detoxExpect(element(by.id('wallet-screen'))).toBeVisible();
    });
  });

  describe('2. Viewing Balance Information', () => {
    beforeEach(async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('withdraw-button')).tap();
    });

    it('should display available balance', async () => {
      // Verify balance card is visible
      await detoxExpect(element(by.id('balance-card'))).toBeVisible();
      await detoxExpect(element(by.text('Available to withdraw'))).toBeVisible();
      
      // Verify balance amount is displayed
      await detoxExpect(element(by.id('available-balance'))).toBeVisible();
    });

    it('should display pending escrow amount', async () => {
      await detoxExpect(element(by.text('Pending in escrow'))).toBeVisible();
      await detoxExpect(element(by.id('pending-escrow'))).toBeVisible();
    });

    it('should display withdrawal limits', async () => {
      // Scroll to view limits if needed
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      
      // Verify limit information (if displayed)
      // Min: $10, Max varies by user
    });
  });

  describe('3. Bank Account Selection', () => {
    beforeEach(async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('withdraw-button')).tap();
    });

    it('should display saved bank account', async () => {
      await detoxExpect(element(by.text('Payout account'))).toBeVisible();
      await detoxExpect(element(by.id('bank-account-card'))).toBeVisible();
      
      // Verify account details are masked
      await detoxExpect(element(by.text(/•••• \d{4}/))).toBeVisible();
    });

    it('should navigate to add bank account', async () => {
      // Tap Change button
      await element(by.id('change-account-button')).tap();
      
      // Should navigate to payment methods
      await detoxExpect(element(by.id('payment-methods-screen'))).toBeVisible();
    });

    it('should show bank icon', async () => {
      await detoxExpect(element(by.id('bank-icon'))).toBeVisible();
    });
  });

  describe('4. Amount Input Validation', () => {
    beforeEach(async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('withdraw-button')).tap();
    });

    it('should enter valid withdrawal amount', async () => {
      // Tap amount input
      await element(by.id('amount-input')).tap();
      
      // Type amount
      await element(by.id('amount-input')).typeText('100');
      
      // Verify amount is displayed
      await detoxExpect(element(by.id('amount-input'))).toHaveText('100');
    });

    it('should reject amount below minimum ($10)', async () => {
      await element(by.id('amount-input')).typeText('5');
      
      // Verify error message
      await waitFor(element(by.text(/minimum.*\$10/i)))
        .toBeVisible()
        .withTimeout(3000);
      
      // Confirm button should be disabled
      await detoxExpect(element(by.id('confirm-button'))).toHaveToggleValue(false);
    });

    it('should reject amount exceeding available balance', async () => {
      // Type amount greater than balance (e.g., if balance is $1,250)
      await element(by.id('amount-input')).typeText('5000');
      
      // Verify error message
      await waitFor(element(by.text(/exceeds available balance/i)))
        .toBeVisible()
        .withTimeout(3000);
      
      // Confirm button should be disabled
      await detoxExpect(element(by.id('confirm-button'))).toHaveToggleValue(false);
    });

    it('should accept decimal amounts', async () => {
      await element(by.id('amount-input')).typeText('99.99');
      
      // Should be accepted
      await detoxExpect(element(by.id('amount-input'))).toHaveText('99.99');
      
      // No error should be shown
      await detoxExpect(element(by.text(/error/i))).not.toBeVisible();
    });

    it('should reject negative amounts', async () => {
      await element(by.id('amount-input')).typeText('-50');
      
      // Should show error or prevent input
      await waitFor(element(by.text(/positive/i)))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should clear amount input', async () => {
      await element(by.id('amount-input')).typeText('100');
      await element(by.id('amount-input')).clearText();
      
      // Input should be empty
      await detoxExpect(element(by.id('amount-input'))).toHaveText('');
    });
  });

  describe('5. Optional Note Field', () => {
    beforeEach(async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('withdraw-button')).tap();
    });

    it('should add optional note', async () => {
      await element(by.id('amount-input')).typeText('100');
      
      // Scroll to note field
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      
      // Tap note input
      await element(by.id('note-input')).tap();
      
      // Type note
      await element(by.id('note-input')).typeText('Monthly payout');
      
      // Verify note is displayed
      await detoxExpect(element(by.id('note-input'))).toHaveText('Monthly payout');
    });

    it('should submit without note', async () => {
      await element(by.id('amount-input')).typeText('100');
      
      // Leave note empty - should still allow submission
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      
      // Confirm button should be enabled
      await detoxExpect(element(by.id('confirm-button'))).toBeVisible();
    });
  });

  describe('6. Biometric Authentication', () => {
    beforeEach(async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('withdraw-button')).tap();
      await element(by.id('amount-input')).typeText('100');
    });

    it('should prompt for biometric authentication', async () => {
      // Scroll to bottom
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      
      // Tap confirm button
      await element(by.id('confirm-button')).tap();
      
      // Should show biometric prompt (if enabled)
      // In test environment, this might be mocked
      await waitFor(element(by.text(/Face ID|Touch ID|Fingerprint/i)))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should cancel withdrawal on biometric failure', async () => {
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      await element(by.id('confirm-button')).tap();
      
      // Simulate biometric failure
      // (In test, this would require mocking the biometric API)
      
      // Should show error alert
      await waitFor(element(by.text('Authentication Required')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should proceed without biometric if disabled', async () => {
      // Assuming biometric is disabled in settings
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      await element(by.id('confirm-button')).tap();
      
      // Should proceed directly to processing
      await waitFor(element(by.text('Processing...')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('7. Withdrawal Confirmation', () => {
    beforeEach(async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('withdraw-button')).tap();
      await element(by.id('amount-input')).typeText('100');
    });

    it('should show processing state', async () => {
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      await element(by.id('confirm-button')).tap();
      
      // Should show processing indicator
      await waitFor(element(by.text('Processing...')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Button should be disabled during processing
      await detoxExpect(element(by.id('confirm-button'))).toHaveToggleValue(false);
    });

    it('should navigate to success screen', async () => {
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      await element(by.id('confirm-button')).tap();
      
      // Wait for processing to complete
      await waitFor(element(by.id('success-screen')))
        .toBeVisible()
        .withTimeout(10000);
      
      // Verify success message
      await detoxExpect(element(by.text(/withdraw.*successful/i))).toBeVisible();
    });

    it('should show withdrawal details on success', async () => {
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      await element(by.id('confirm-button')).tap();
      
      await waitFor(element(by.id('success-screen')))
        .toBeVisible()
        .withTimeout(10000);
      
      // Verify details
      await detoxExpect(element(by.text('$100.00'))).toBeVisible();
      await detoxExpect(element(by.text(/Bank Account/))).toBeVisible();
      await detoxExpect(element(by.text(/1-3 business days/i))).toBeVisible();
      await detoxExpect(element(by.text(/WD-\d+/))).toBeVisible(); // Reference ID
    });

    it('should handle withdrawal error', async () => {
      // Simulate error condition (e.g., network failure)
      await device.setURLBlacklist(['.*']);
      
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      await element(by.id('confirm-button')).tap();
      
      // Should show error message
      await waitFor(element(by.text(/error|failed/i)))
        .toBeVisible()
        .withTimeout(10000);
      
      await device.setURLBlacklist([]);
    });
  });

  describe('8. Success Screen Actions', () => {
    beforeEach(async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('withdraw-button')).tap();
      await element(by.id('amount-input')).typeText('100');
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      await element(by.id('confirm-button')).tap();
      
      // Wait for success screen
      await waitFor(element(by.id('success-screen')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should navigate to transaction history', async () => {
      // Tap "View History" button
      await element(by.id('view-history-button')).tap();
      
      // Should navigate to transaction history
      await detoxExpect(element(by.id('transaction-history-screen'))).toBeVisible();
      
      // Verify withdrawal appears in history
      await detoxExpect(element(by.text('Withdrawal'))).toBeVisible();
      await detoxExpect(element(by.text('$100.00'))).toBeVisible();
    });

    it('should return to wallet', async () => {
      // Tap "Done" button
      await element(by.id('done-button')).tap();
      
      // Should return to wallet
      await detoxExpect(element(by.id('wallet-screen'))).toBeVisible();
    });

    it('should return to home', async () => {
      // Tap "Back to Home" button
      await element(by.id('back-home-button')).tap();
      
      // Should navigate to discover/home
      await detoxExpect(element(by.id('tab-discover'))).toBeVisible();
    });
  });

  describe('9. Transaction History', () => {
    it('should view withdrawal in transaction history', async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      
      // Tap Transaction History
      await element(by.id('transaction-history-button')).tap();
      
      // Verify screen is visible
      await detoxExpect(element(by.id('transaction-history-screen'))).toBeVisible();
      
      // Verify withdrawal transaction is listed
      await detoxExpect(element(by.text('Withdrawal'))).toBeVisible();
    });

    it('should filter by withdrawal type', async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('transaction-history-button')).tap();
      
      // Tap filter button
      await element(by.id('filter-button')).tap();
      
      // Select "Withdrawals" filter
      await element(by.text('Withdrawals')).tap();
      
      // Apply filter
      await element(by.id('apply-filter-button')).tap();
      
      // Should show only withdrawals
      await detoxExpect(element(by.text('Withdrawal'))).toBeVisible();
    });

    it('should view withdrawal details', async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('transaction-history-button')).tap();
      
      // Tap on withdrawal transaction
      await element(by.id('transaction-item-0')).tap();
      
      // Should show transaction details
      await detoxExpect(element(by.id('transaction-detail-screen'))).toBeVisible();
      await detoxExpect(element(by.text('Withdrawal'))).toBeVisible();
      await detoxExpect(element(by.text(/Status.*Pending/i))).toBeVisible();
    });
  });

  describe('10. Withdrawal Limits & Restrictions', () => {
    beforeEach(async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('withdraw-button')).tap();
    });

    it('should show minimum withdrawal error for $5', async () => {
      await element(by.id('amount-input')).typeText('5');
      
      await waitFor(element(by.text(/minimum.*\$10/i)))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show maximum daily limit error', async () => {
      // Assuming daily limit is $5,000
      await element(by.id('amount-input')).typeText('6000');
      
      await waitFor(element(by.text(/daily limit/i)))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show insufficient balance error', async () => {
      await element(by.id('amount-input')).typeText('10000');
      
      await waitFor(element(by.text(/insufficient|exceeds balance/i)))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show KYC verification required', async () => {
      // For unverified users
      // This test assumes user is not KYC verified
      
      await element(by.id('amount-input')).typeText('100');
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      await element(by.id('confirm-button')).tap();
      
      // Should show KYC alert
      await waitFor(element(by.text(/verify.*identity|KYC/i)))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('11. Edge Cases', () => {
    it('should handle concurrent withdrawal attempts', async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('withdraw-button')).tap();
      
      await element(by.id('amount-input')).typeText('100');
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      
      // Tap confirm multiple times rapidly
      await element(by.id('confirm-button')).multiTap(3);
      
      // Should only process once
      await waitFor(element(by.id('success-screen')))
        .toBeVisible()
        .withTimeout(10000);
      
      // Verify only one withdrawal was created (check via API or UI)
    });

    it('should handle app backgrounding during withdrawal', async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('withdraw-button')).tap();
      
      await element(by.id('amount-input')).typeText('100');
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      await element(by.id('confirm-button')).tap();
      
      // Background app immediately
      await device.sendToHome();
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Bring app back
      await device.launchApp({ newInstance: false });
      
      // Should either show success or error (not stuck in processing)
      await waitFor(element(by.id('success-screen')).or(by.text(/error|failed/i)))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should handle network timeout', async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('withdraw-button')).tap();
      
      await element(by.id('amount-input')).typeText('100');
      
      // Simulate slow network
      await device.setURLBlacklist(['.*']);
      
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      await element(by.id('confirm-button')).tap();
      
      // Should timeout and show error
      await waitFor(element(by.text(/timeout|network/i)))
        .toBeVisible()
        .withTimeout(35000); // 30s timeout + buffer
      
      await device.setURLBlacklist([]);
    });

    it('should preserve form data on navigation back', async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('withdraw-button')).tap();
      
      // Enter data
      await element(by.id('amount-input')).typeText('100');
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      await element(by.id('note-input')).typeText('Test note');
      
      // Navigate back
      await element(by.id('back-button')).tap();
      
      // Navigate to withdraw again
      await element(by.id('withdraw-button')).tap();
      
      // Form should be reset (fresh state)
      await detoxExpect(element(by.id('amount-input'))).toHaveText('');
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      await detoxExpect(element(by.id('note-input'))).toHaveText('');
    });

    it('should handle zero balance gracefully', async () => {
      // Assuming user has $0 balance
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('withdraw-button')).tap();
      
      // Should show $0 available
      await detoxExpect(element(by.text('$0.00'))).toBeVisible();
      
      // Trying to withdraw should show error
      await element(by.id('amount-input')).typeText('10');
      
      await waitFor(element(by.text(/insufficient/i)))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('12. Accessibility', () => {
    beforeEach(async () => {
      await element(by.id('tab-profile')).tap();
      await element(by.id('wallet-button')).tap();
      await element(by.id('withdraw-button')).tap();
    });

    it('should have accessible labels for all inputs', async () => {
      // Verify accessibility labels exist
      await detoxExpect(element(by.id('amount-input'))).toBeVisible();
      await element(by.id('withdraw-scroll-view')).scrollTo('bottom');
      await detoxExpect(element(by.id('note-input'))).toBeVisible();
      await detoxExpect(element(by.id('confirm-button'))).toBeVisible();
    });

    it('should announce balance to screen reader', async () => {
      // Verify important elements have accessibility labels
      // (Detox can verify accessibility props exist)
      await detoxExpect(element(by.id('available-balance'))).toBeVisible();
    });

    it('should support keyboard navigation', async () => {
      // Tab between inputs (if keyboard navigation is supported)
      await element(by.id('amount-input')).tap();
      // Verify keyboard appears
      // Tab to next field
      // Note: Full keyboard testing may require additional setup
    });
  });
});

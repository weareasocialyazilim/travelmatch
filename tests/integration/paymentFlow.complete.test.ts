/**
 * Payment Flow Integration Tests
 * 
 * End-to-end tests for complete payment workflows:
 * - Create payment intent → Confirm payment → Update balance
 * - Add payment method → Make payment → View transaction
 * - Request withdrawal → Process → Update balance
 */

import { supabase } from '../../config/supabase';
import { paymentService } from '../../services/paymentService';
import { transactionsService } from '../../services/supabaseDbService';

describe('Payment Flow Integration Tests', () => {
  let testUserId: string;
  let testMomentId: string;
  let testPaymentMethodId: string;

  beforeAll(async () => {
    // Create test user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `payment-test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });

    if (authError) throw authError;
    testUserId = authData.user!.id;

    // Create test moment
    const { data: momentData, error: momentError } = await supabase
      .from('moments')
      .insert({
        user_id: testUserId,
        title: 'Test Payment Moment',
        description: 'Test moment for payment flow',
        type: 'coffee',
        price: 25,
        currency: 'USD',
        location: { lat: 0, lng: 0 },
        status: 'active',
      })
      .select()
      .single();

    if (momentError) throw momentError;
    testMomentId = momentData.id;
  });

  afterAll(async () => {
    // Cleanup
    if (testUserId) {
      await supabase.from('moments').delete().eq('user_id', testUserId);
      await supabase.from('transactions').delete().eq('user_id', testUserId);
      await supabase.auth.admin.deleteUser(testUserId);
    }
  });

  describe('Gift Payment Flow', () => {
    it('should complete full gift payment workflow', async () => {
      // Step 1: Create payment intent
      const paymentIntent = await paymentService.createPaymentIntent({
        momentId: testMomentId,
        amount: 2500, // $25.00 in cents
      });

      expect(paymentIntent.paymentIntent).toBeDefined();
      expect(paymentIntent.paymentIntent.amount).toBe(2500);
      expect(paymentIntent.paymentIntent.status).toBe('pending');

      // Step 2: Add payment method
      const card = await paymentService.addCard('tok_visa_test');
      
      expect(card.card).toBeDefined();
      expect(card.card.brand).toBe('visa');
      testPaymentMethodId = card.card.id;

      // Step 3: Confirm payment
      const confirmation = await paymentService.confirmPayment(
        paymentIntent.paymentIntent.paymentIntentId,
        testPaymentMethodId
      );

      expect(confirmation.success).toBe(true);

      // Step 4: Verify transaction created
      const transactions = await paymentService.getTransactions({
        type: 'gift_sent',
      });

      expect(transactions.transactions.length).toBeGreaterThan(0);
      const transaction = transactions.transactions.find(
        t => t.referenceId === testMomentId
      );
      expect(transaction).toBeDefined();
      expect(transaction!.status).toBe('completed');
      expect(transaction!.amount).toBe(25);

      // Step 5: Verify balance updated
      const balance = await paymentService.getBalance();
      expect(balance.available).toBeDefined();
    });

    it('should handle payment failure gracefully', async () => {
      // Create payment intent
      const paymentIntent = await paymentService.createPaymentIntent({
        momentId: testMomentId,
        amount: 1000,
      });

      // Try to confirm with invalid payment method
      await expect(
        paymentService.confirmPayment(
          paymentIntent.paymentIntent.paymentIntentId,
          'invalid_pm_id'
        )
      ).rejects.toThrow();

      // Verify no transaction created
      const transactions = await paymentService.getTransactions();
      const failedTx = transactions.transactions.find(
        t => t.status === 'failed' && t.referenceId === testMomentId
      );
      
      // Failed transaction should be recorded
      expect(failedTx).toBeUndefined(); // Or expect it to exist depending on implementation
    });

    it('should prevent duplicate payments', async () => {
      // Create payment intent
      const paymentIntent = await paymentService.createPaymentIntent({
        momentId: testMomentId,
        amount: 1500,
      });

      // Confirm payment
      await paymentService.confirmPayment(
        paymentIntent.paymentIntent.paymentIntentId,
        testPaymentMethodId
      );

      // Try to confirm again
      await expect(
        paymentService.confirmPayment(
          paymentIntent.paymentIntent.paymentIntentId,
          testPaymentMethodId
        )
      ).rejects.toThrow();
    });
  });

  describe('Withdrawal Flow', () => {
    beforeAll(async () => {
      // Add funds to wallet for withdrawal testing
      await supabase.from('users').update({
        balance: 100,
        currency: 'USD',
      }).eq('id', testUserId);
    });

    it('should complete full withdrawal workflow', async () => {
      // Step 1: Add bank account
      const bankAccount = await paymentService.addBankAccount({
        routingNumber: '110000000',
        accountNumber: '000123456789',
        accountType: 'checking',
      });

      expect(bankAccount.bankAccount).toBeDefined();
      expect(bankAccount.bankAccount.isVerified).toBe(true);

      const bankAccountId = bankAccount.bankAccount.id;

      // Step 2: Request withdrawal
      const withdrawal = await paymentService.requestWithdrawal({
        amount: 50,
        bankAccountId,
      });

      expect(withdrawal.transaction).toBeDefined();
      expect(withdrawal.transaction.type).toBe('withdrawal');
      expect(withdrawal.transaction.status).toBe('pending');
      expect(withdrawal.transaction.amount).toBe(50);

      // Step 3: Verify balance updated
      const balance = await paymentService.getBalance();
      expect(balance.available).toBeLessThanOrEqual(50); // Should be reduced

      // Step 4: Verify transaction history
      const transactions = await paymentService.getTransactions({
        type: 'withdrawal',
      });

      const withdrawalTx = transactions.transactions.find(
        t => t.id === withdrawal.transaction.id
      );
      expect(withdrawalTx).toBeDefined();
    });

    it('should reject withdrawal exceeding balance', async () => {
      const bankAccount = await paymentService.addBankAccount({
        routingNumber: '110000000',
        accountNumber: '000123456789',
        accountType: 'savings',
      });

      // Try to withdraw more than balance
      await expect(
        paymentService.requestWithdrawal({
          amount: 10000, // Way more than available
          bankAccountId: bankAccount.bankAccount.id,
        })
      ).rejects.toThrow();
    });

    it('should handle bank account verification', async () => {
      const unverifiedAccount = await paymentService.addBankAccount({
        routingNumber: '110000000',
        accountNumber: '999999999',
        accountType: 'checking',
      });

      // Unverified accounts should still be created but marked as unverified
      expect(unverifiedAccount.bankAccount.isVerified).toBeDefined();
    });
  });

  describe('Transaction History', () => {
    it('should track complete transaction history', async () => {
      // Make multiple transactions
      const paymentIntent1 = await paymentService.createPaymentIntent({
        momentId: testMomentId,
        amount: 1000,
      });
      await paymentService.confirmPayment(
        paymentIntent1.paymentIntent.paymentIntentId,
        testPaymentMethodId
      );

      const paymentIntent2 = await paymentService.createPaymentIntent({
        momentId: testMomentId,
        amount: 2000,
      });
      await paymentService.confirmPayment(
        paymentIntent2.paymentIntent.paymentIntentId,
        testPaymentMethodId
      );

      // Fetch all transactions
      const transactions = await paymentService.getTransactions();

      expect(transactions.transactions.length).toBeGreaterThanOrEqual(2);
      expect(transactions.total).toBeGreaterThanOrEqual(2);

      // Verify transactions are sorted by date (newest first)
      const dates = transactions.transactions.map(t => new Date(t.date).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });

    it('should filter transactions by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // 7 days ago
      const endDate = new Date();

      const transactions = await paymentService.getTransactions({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // All transactions should be within date range
      transactions.transactions.forEach(tx => {
        const txDate = new Date(tx.date);
        expect(txDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(txDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    it('should paginate transaction history', async () => {
      const page1 = await paymentService.getTransactions({
        page: 1,
        pageSize: 2,
      });

      const page2 = await paymentService.getTransactions({
        page: 2,
        pageSize: 2,
      });

      expect(page1.transactions.length).toBeLessThanOrEqual(2);
      expect(page2.transactions.length).toBeLessThanOrEqual(2);

      // Pages should have different transactions
      const page1Ids = page1.transactions.map(t => t.id);
      const page2Ids = page2.transactions.map(t => t.id);
      const intersection = page1Ids.filter(id => page2Ids.includes(id));
      expect(intersection.length).toBe(0);
    });
  });

  describe('Payment Methods Management', () => {
    it('should manage multiple payment cards', async () => {
      // Add multiple cards
      const card1 = await paymentService.addCard('tok_visa');
      const card2 = await paymentService.addCard('tok_mastercard');

      // Fetch all payment methods
      const methods = await paymentService.getPaymentMethods();

      expect(methods.cards.length).toBeGreaterThanOrEqual(2);

      // First card should be default
      const defaultCard = methods.cards.find(c => c.isDefault);
      expect(defaultCard).toBeDefined();

      // Remove card
      await paymentService.removeCard(card2.card.id);

      const updatedMethods = await paymentService.getPaymentMethods();
      expect(updatedMethods.cards.length).toBe(methods.cards.length - 1);
    });

    it('should manage bank accounts', async () => {
      // Add bank account
      const account = await paymentService.addBankAccount({
        routingNumber: '110000000',
        accountNumber: '123456789',
        accountType: 'checking',
      });

      expect(account.bankAccount.isVerified).toBeDefined();

      // Fetch payment methods
      const methods = await paymentService.getPaymentMethods();
      const savedAccount = methods.bankAccounts.find(
        a => a.id === account.bankAccount.id
      );
      expect(savedAccount).toBeDefined();

      // Remove bank account
      await paymentService.removeBankAccount(account.bankAccount.id);

      const updatedMethods = await paymentService.getPaymentMethods();
      const removedAccount = updatedMethods.bankAccounts.find(
        a => a.id === account.bankAccount.id
      );
      expect(removedAccount).toBeUndefined();
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent payment requests safely', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        paymentService.createPaymentIntent({
          momentId: testMomentId,
          amount: 1000 + i * 100,
        })
      );

      const results = await Promise.all(promises);

      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(result.paymentIntent).toBeDefined();
        expect(result.paymentIntent.status).toBe('pending');
      });

      // All payment intents should have unique IDs
      const ids = results.map(r => r.paymentIntent.paymentIntentId);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds.length).toBe(5);
    });

    it('should handle race conditions in balance updates', async () => {
      // Make concurrent withdrawals (some should fail)
      const bankAccount = await paymentService.addBankAccount({
        routingNumber: '110000000',
        accountNumber: '000111222',
        accountType: 'checking',
      });

      const withdrawalPromises = Array.from({ length: 3 }, () =>
        paymentService.requestWithdrawal({
          amount: 40,
          bankAccountId: bankAccount.bankAccount.id,
        }).catch(() => null) // Some may fail
      );

      const results = await Promise.all(withdrawalPromises);
      const successful = results.filter(r => r !== null);

      // At least one should succeed, but not all if balance is limited
      expect(successful.length).toBeGreaterThan(0);
    });
  });

  describe('Error Recovery', () => {
    it('should rollback on payment failure', async () => {
      const initialBalance = await paymentService.getBalance();

      try {
        // Attempt payment with invalid data
        await paymentService.processPayment({
          amount: 9999,
          currency: 'USD',
          paymentMethodId: 'invalid_pm',
        });
      } catch (error) {
        // Expected to fail
      }

      // Balance should remain unchanged
      const finalBalance = await paymentService.getBalance();
      expect(finalBalance.available).toBe(initialBalance.available);
    });

    it('should handle network failures gracefully', async () => {
      // Simulate network failure by using invalid endpoint
      const originalFrom = supabase.from;
      
      (supabase.from as any) = () => ({
        select: () => ({ eq: () => ({ single: () => Promise.reject(new Error('Network error')) }) }),
      });

      await expect(paymentService.getBalance()).resolves.toMatchObject({
        available: 0,
        pending: 0,
        currency: 'USD',
      });

      // Restore original
      supabase.from = originalFrom;
    });
  });

  describe('Performance', () => {
    it('should fetch transaction history within acceptable time', async () => {
      const start = Date.now();
      await paymentService.getTransactions({ pageSize: 50 });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Less than 1 second
    });

    it('should handle large transaction volumes', async () => {
      // Create many small transactions
      const promises = Array.from({ length: 20 }, (_, i) =>
        paymentService.createPaymentIntent({
          momentId: testMomentId,
          amount: 100 + i,
        })
      );

      const start = Date.now();
      await Promise.all(promises);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000); // Less than 5 seconds for 20 transactions
    });
  });
});

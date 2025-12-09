/**
 * Edge Case Testing Script
 * 
 * Helper functions to manually test crash recovery, storage monitoring, etc.
 * Run these in your app to simulate edge cases.
 * 
 * Usage:
 * 1. Import this file in your test screen
 * 2. Call test functions from buttons/console
 * 3. Verify expected behavior
 */

import { pendingTransactionsService, TransactionStatus } from '../apps/mobile/src/services/pendingTransactionsService';
import { storageMonitor } from '../apps/mobile/src/services/storageMonitor';
import { logger } from '../apps/mobile/src/utils/logger';

/**
 * Test 1: Simulate payment crash
 * 
 * Steps:
 * 1. Add pending payment
 * 2. Force quit app (don't complete payment)
 * 3. Restart app
 * 4. Verify modal shows pending payment
 */
export async function testPaymentCrash() {
  logger.info('TEST', '🧪 Simulating payment crash...');
  
  await pendingTransactionsService.addPendingPayment({
    id: `test_payment_${Date.now()}`,
    type: 'gift',
    amount: 50,
    currency: 'USD',
    status: TransactionStatus.INITIATED,
    metadata: {
      note: 'Test crash recovery',
    },
  });
  
  logger.info('TEST', '✅ Payment added. Now force quit the app and restart.');
  logger.info('TEST', '📱 You should see the pending transactions modal on startup.');
}

/**
 * Test 2: Simulate upload crash with retry
 * 
 * Steps:
 * 1. Add pending upload at 35% progress
 * 2. Force quit app
 * 3. Restart app
 * 4. Click "Retry" in modal
 * 5. Verify retry count increments
 */
export async function testUploadCrash() {
  logger.info('TEST', '🧪 Simulating upload crash...');
  
  await pendingTransactionsService.addPendingUpload({
    id: `test_upload_${Date.now()}`,
    type: 'proof',
    localUri: 'file:///test/ticket.jpg',
    bucket: 'proofs',
    fileName: 'test_ticket.jpg',
    fileSize: 2048000, // 2MB
    mimeType: 'image/jpeg',
    status: TransactionStatus.UPLOADING,
    progress: 35,
  });
  
  logger.info('TEST', '✅ Upload added at 35% progress.');
  logger.info('TEST', '📱 Force quit app, restart, and click "Retry" in modal.');
}

/**
 * Test 3: Simulate max retry limit (3 retries)
 * 
 * Steps:
 * 1. Add upload with 2 retries already
 * 2. Increment retry to 3
 * 3. Verify auto-removed after 3rd failure
 */
export async function testMaxRetryLimit() {
  logger.info('TEST', '🧪 Testing max retry limit...');
  
  const uploadId = `test_upload_${Date.now()}`;
  
  // Add upload with 2 retries
  await pendingTransactionsService.addPendingUpload({
    id: uploadId,
    type: 'moment',
    localUri: 'file:///test/moment.jpg',
    bucket: 'moments',
    fileName: 'test_moment.jpg',
    fileSize: 1024000,
    mimeType: 'image/jpeg',
    status: TransactionStatus.FAILED,
    progress: 0,
  });
  
  // Manually increment retry count twice to get to 2
  await pendingTransactionsService.incrementUploadRetry(uploadId);
  await pendingTransactionsService.incrementUploadRetry(uploadId);
  
  logger.info('TEST', `✅ Upload added with 2 retries. ID: ${uploadId}`);
  logger.info('TEST', '📱 Now increment retry one more time...');
  
  // Increment to 3 (should auto-remove)
  const retryCount = await pendingTransactionsService.incrementUploadRetry(uploadId);
  logger.info('TEST', `Retry count: ${retryCount}`);
  
  // Check if removed
  const uploads = await pendingTransactionsService.getPendingUploads();
  const found = uploads.find(u => u.id === uploadId);
  
  if (!found) {
    logger.info('TEST', '✅ Upload auto-removed after 3rd retry (PASS)');
  } else {
    logger.error('TEST', '❌ Upload still exists after 3rd retry (FAIL)');
  }
}

/**
 * Test 4: Check storage info
 * 
 * Displays current storage status and thresholds
 */
export async function testStorageInfo() {
  logger.info('TEST', '🧪 Checking storage info...');
  
  const info = await storageMonitor.getStorageInfo();
  
  if (!info) {
    logger.error('TEST', '❌ Failed to get storage info');
    return;
  }
  
  logger.info('TEST', '📊 Storage Status:');
  logger.info('TEST', `- Total: ${storageMonitor.formatBytes(info.totalSpace)}`);
  logger.info('TEST', `- Used: ${storageMonitor.formatBytes(info.usedSpace)}`);
  logger.info('TEST', `- Free: ${storageMonitor.formatBytes(info.freeSpace)} (${info.freePercentage.toFixed(1)}%)`);
  logger.info('TEST', `- Level: ${info.level}`);
  logger.info('TEST', `- Can Upload: ${info.canUpload ? 'Yes' : 'No'}`);
  logger.info('TEST', `- Est. Uploads: ~${info.estimatedUploadsRemaining} files`);
  
  // Test file size checks
  const testSizes = [
    { name: '5MB file', size: 5 * 1024 * 1024 },
    { name: '50MB file', size: 50 * 1024 * 1024 },
    { name: '100MB file', size: 100 * 1024 * 1024 },
  ];
  
  logger.info('TEST', '\n📁 Upload Permission Tests:');
  for (const test of testSizes) {
    const canUpload = await storageMonitor.canUpload(test.size);
    logger.info('TEST', `- ${test.name}: ${canUpload ? '✅ OK' : '❌ BLOCKED'}`);
  }
}

/**
 * Test 5: Test 24h expiry
 * 
 * WARNING: This modifies the createdAt timestamp to simulate old transactions
 */
export async function testExpiryCleanup() {
  logger.info('TEST', '🧪 Testing 24h auto-cleanup...');
  
  // Add old payment (25 hours ago)
  const oldPaymentId = `old_payment_${Date.now()}`;
  const twentyFiveHoursAgo = Date.now() - (25 * 60 * 60 * 1000);
  
  await pendingTransactionsService.addPendingPayment({
    id: oldPaymentId,
    type: 'withdraw',
    amount: 100,
    currency: 'USD',
    status: TransactionStatus.INITIATED,
    metadata: {},
  });
  
  // Manually modify timestamp (hack for testing)
  const payments = await pendingTransactionsService.getPendingPayments();
  const payment = payments.find(p => p.id === oldPaymentId);
  if (payment) {
    // @ts-ignore - Modifying for test
    payment.createdAt = twentyFiveHoursAgo;
    // Save back to AsyncStorage manually
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('@travelmatch/pending_payments', JSON.stringify(payments));
  }
  
  logger.info('TEST', '✅ Old payment created (25h ago)');
  logger.info('TEST', '📱 Now call getPendingPayments() to trigger cleanup...');
  
  // This should auto-remove the old payment
  const validPayments = await pendingTransactionsService.getPendingPayments();
  const stillExists = validPayments.find(p => p.id === oldPaymentId);
  
  if (!stillExists) {
    logger.info('TEST', '✅ Old payment auto-removed (PASS)');
  } else {
    logger.error('TEST', '❌ Old payment still exists (FAIL)');
  }
}

/**
 * Test 6: Clear all pending transactions
 * 
 * Use this to reset state between tests
 */
export async function clearAllPending() {
  logger.info('TEST', '🧹 Clearing all pending transactions...');
  
  await pendingTransactionsService.clearAll();
  
  const payments = await pendingTransactionsService.getPendingPayments();
  const uploads = await pendingTransactionsService.getPendingUploads();
  
  logger.info('TEST', `✅ Cleared. Payments: ${payments.length}, Uploads: ${uploads.length}`);
}

/**
 * Test 7: View all pending transactions
 */
export async function viewAllPending() {
  logger.info('TEST', '📋 Viewing all pending transactions...');
  
  const payments = await pendingTransactionsService.getPendingPayments();
  const uploads = await pendingTransactionsService.getPendingUploads();
  
  logger.info('TEST', `\n💳 Pending Payments (${payments.length}):`);
  payments.forEach((p, i) => {
    logger.info('TEST', `${i + 1}. ${p.type} - $${p.amount} ${p.currency} - ${p.status}`);
    logger.info('TEST', `   ID: ${p.id}`);
    logger.info('TEST', `   Created: ${new Date(p.createdAt).toLocaleString()}`);
  });
  
  logger.info('TEST', `\n☁️ Pending Uploads (${uploads.length}):`);
  uploads.forEach((u, i) => {
    logger.info('TEST', `${i + 1}. ${u.type} - ${u.fileName} - ${u.status}`);
    logger.info('TEST', `   Progress: ${u.progress}%`);
    logger.info('TEST', `   Retry Count: ${u.retryCount}/3`);
    logger.info('TEST', `   Size: ${storageMonitor.formatBytes(u.fileSize)}`);
    logger.info('TEST', `   Created: ${new Date(u.createdAt).toLocaleString()}`);
  });
  
  if (payments.length === 0 && uploads.length === 0) {
    logger.info('TEST', '✅ No pending transactions');
  }
}

/**
 * Test Suite Runner
 * 
 * Runs all tests in sequence
 */
export async function runAllTests() {
  logger.info('TEST', '🧪 Running all edge case tests...\n');
  
  try {
    // Clear state
    await clearAllPending();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Test storage
    await testStorageInfo();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test payment crash
    await testPaymentCrash();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test upload crash
    await testUploadCrash();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test max retry
    await testMaxRetryLimit();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test expiry
    await testExpiryCleanup();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // View results
    await viewAllPending();
    
    logger.info('TEST', '\n✅ All tests completed!');
    logger.info('TEST', '📱 Force quit and restart app to test crash recovery modal.');
    
  } catch (error) {
    logger.error('TEST', '❌ Test suite failed', error);
  }
}

// Export all test functions
export const EdgeCaseTests = {
  testPaymentCrash,
  testUploadCrash,
  testMaxRetryLimit,
  testStorageInfo,
  testExpiryCleanup,
  clearAllPending,
  viewAllPending,
  runAllTests,
};

export default EdgeCaseTests;

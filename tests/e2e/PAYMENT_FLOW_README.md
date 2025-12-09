# Payment Flow E2E Tests - Gift Sending

## 📋 Overview

Comprehensive end-to-end tests for the critical payment flow, covering the complete gift purchase journey from browsing moments to transaction confirmation and receipt generation.

**Priority:** 🔴 CRITICAL  
**Status:** ✅ IMPLEMENTED  
**Framework:** Detox  
**Test File:** `tests/e2e/paymentFlow.e2e.test.ts`  
**YAML Plan:** `tests/e2e/flows/payment-gift-flow.yaml`

---

## 🎯 Test Coverage

### 1. Gift Purchase Journey
- ✅ Navigate to moments feed
- ✅ Display available moments
- ✅ Select moment to gift
- ✅ Open moment details
- ✅ Initiate gift flow

**Test Cases:** 3  
**Location:** Section 1 in test file

### 2. Form Input & Validation
- ✅ Enter recipient email
- ✅ Enter gift message
- ✅ Email format validation
- ✅ Invalid email error handling
- ✅ Required field validation

**Test Cases:** 5  
**Location:** Section 1, 7 in test file

### 3. Payment Method Selection
- ✅ Display available payment methods
- ✅ Credit card selection
- ✅ Apple Pay selection (if available)
- ✅ Google Pay selection (if available)
- ✅ Payment method details display
- ✅ Add new payment method (optional)

**Test Cases:** 5  
**Location:** Section 2 in test file

### 4. Transaction Summary & Confirmation
- ✅ Display moment price
- ✅ Display service fees
- ✅ Calculate total amount
- ✅ Show transaction summary
- ✅ Enable/disable purchase button
- ✅ Loading state during processing

**Test Cases:** 6  
**Location:** Section 3 in test file

### 5. Payment Success & Receipt
- ✅ Success confirmation screen
- ✅ Display receipt details
- ✅ Show transaction ID
- ✅ View detailed receipt
- ✅ Share receipt
- ✅ Download receipt as PDF
- ✅ Return to home screen

**Test Cases:** 8  
**Location:** Section 4 in test file

### 6. Transaction History
- ✅ Verify transaction in history
- ✅ Display correct transaction details
- ✅ Show gift transaction type
- ✅ Filter transactions by type

**Test Cases:** 4  
**Location:** Section 5 in test file

### 7. Error Handling
- ✅ Network error graceful handling
- ✅ Insufficient funds error
- ✅ Payment declined error
- ✅ Retry after failure
- ✅ Validation error display

**Test Cases:** 4  
**Location:** Section 6 in test file

### 8. Edge Cases
- ✅ Prevent gifting own moments
- ✅ Minimum payment amount validation
- ✅ Maximum payment amount validation
- ✅ Email format edge cases
- ✅ Form data preservation on navigation

**Test Cases:** 5  
**Location:** Section 7 in test file

### 9. Security & Privacy
- ✅ Masked credit card numbers
- ✅ Secure connection indicators
- ✅ No full card number display
- ✅ Authentication for sensitive operations

**Test Cases:** 3  
**Location:** Section 10 in test file

### 10. Performance
- ✅ Complete flow within 20 seconds
- ✅ UI responsiveness during processing
- ✅ No UI freeze during payment

**Test Cases:** 2  
**Location:** Section 9 in test file

### 11. Multi-Currency Support
- ✅ Display correct currency symbol
- ✅ Currency conversion (if applicable)

**Test Cases:** 2  
**Location:** Section 8 in test file

---

## 📊 Test Statistics

| Metric | Value |
|--------|-------|
| **Total Test Cases** | 40+ |
| **Test Suites** | 10 |
| **Estimated Duration** | 15-20 minutes |
| **Coverage Areas** | 11 |
| **Critical Flows** | 5 |
| **Security Tests** | 3 |
| **Performance Tests** | 2 |

---

## 🚀 Running the Tests

### Prerequisites
```bash
# Install dependencies
pnpm install

# Ensure Detox is configured
npx detox build --configuration ios.sim.debug
```

### Run All Payment Flow Tests
```bash
# iOS Simulator
npx detox test tests/e2e/paymentFlow.e2e.test.ts --configuration ios.sim.debug

# Android Emulator
npx detox test tests/e2e/paymentFlow.e2e.test.ts --configuration android.emu.debug
```

### Run Specific Test Suites
```bash
# Only gift purchase journey
npx detox test tests/e2e/paymentFlow.e2e.test.ts -o "Gift Purchase Journey"

# Only payment method selection
npx detox test tests/e2e/paymentFlow.e2e.test.ts -o "Payment Method Selection"

# Only error handling
npx detox test tests/e2e/paymentFlow.e2e.test.ts -o "Payment Error Handling"
```

### Run with Video Recording
```bash
npx detox test tests/e2e/paymentFlow.e2e.test.ts --record-videos all
```

### Run in CI/CD
```bash
# Headless mode for CI
npx detox test tests/e2e/paymentFlow.e2e.test.ts --configuration ios.sim.release --cleanup
```

---

## 🧪 Test Data Requirements

### Test User Accounts
```javascript
// Test user with payment methods
{
  email: "payment-test@example.com",
  password: "TestPassword123!",
  hasPaymentMethod: true,
  cardLastFour: "4242"
}

// Test user without payment methods
{
  email: "no-payment@example.com",
  password: "TestPassword123!",
  hasPaymentMethod: false
}
```

### Test Moments
```javascript
// Regular moment for gifting
{
  id: "test-moment-001",
  title: "First Authentic Pizza in Naples",
  price: 25.00,
  currency: "USD",
  status: "active",
  userId: "recipient-user-id"
}

// High-value moment for edge case testing
{
  id: "test-moment-002",
  title: "Luxury Experience",
  price: 500.00,
  currency: "USD",
  status: "active"
}
```

### Test Payment Methods
```javascript
// Stripe test cards
const TEST_CARDS = {
  success: "4242424242424242",      // Successful payment
  declined: "4000000000000002",      // Declined payment
  insufficientFunds: "4000000000009995", // Insufficient funds
  expired: "4000000000000069"        // Expired card
};
```

---

## 🔧 Test Element IDs Reference

### Navigation
- `tab-home` - Home/Feed tab
- `tab-profile` - Profile tab
- `back-button` - Back navigation button

### Moments Feed
- `moments-feed` - Main feed container
- `moment-card-0` - First moment card
- `moment-details-screen` - Moment details screen
- `moment-title` - Moment title text
- `moment-price` - Moment price display
- `gift-button` - Gift this moment button

### Gift Flow
- `unified-gift-flow-screen` - Main gift flow screen
- `recipient-email-input` - Recipient email input field
- `gift-message-input` - Gift message input field
- `payment-section` - Payment methods section
- `payment-methods-list` - Payment methods list container

### Payment Methods
- `payment-method-card` - Credit card payment option
- `payment-method-card-selected` - Selected card indicator
- `payment-method-details` - Payment method details
- `add-payment-method-button` - Add new payment method

### Transaction Summary
- `transaction-summary` - Summary container
- `moment-price-label` - Moment price label
- `service-fee-label` - Service fee label
- `total-amount-label` - Total amount label
- `total-amount-value` - Total amount value

### Payment Processing
- `purchase-button` - Complete purchase button
- `payment-loading-indicator` - Loading spinner
- `payment-success-screen` - Success confirmation screen

### Receipt
- `success-message` - Success message text
- `success-icon` - Success checkmark icon
- `receipt-moment-title` - Receipt moment title
- `receipt-amount` - Receipt amount
- `receipt-recipient` - Receipt recipient email
- `receipt-date` - Receipt transaction date
- `transaction-id` - Transaction ID display
- `view-receipt-button` - View detailed receipt
- `share-receipt-button` - Share receipt
- `download-receipt-button` - Download receipt PDF
- `done-button` - Close success screen

### Transaction History
- `transaction-history-button` - Open transaction history
- `transaction-history-screen` - Transaction history screen
- `transaction-item-0` - First transaction item
- `transaction-detail-screen` - Transaction detail screen
- `transaction-type` - Transaction type label
- `transaction-amount` - Transaction amount
- `transaction-status` - Transaction status
- `transaction-date` - Transaction date
- `filter-button` - Filter transactions button
- `filter-gift-sent` - Gift sent filter option

### Error Handling
- `retry-payment-button` - Retry payment button
- Network error text: `/network|connection|offline/`

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Add Payment Method Flow:** Not fully implemented in test (optional test cases)
2. **PDF Receipt Download:** Implementation-dependent, marked as optional
3. **Biometric Authentication:** Not tested (requires device capabilities)
4. **Real Payment Processing:** Tests use mock/sandbox payment gateway

### Test Environment Requirements
- iOS Simulator 14.0+ or Android Emulator API 28+
- Network connectivity for API calls
- Test Stripe account with test API keys
- Mock payment gateway in test environment

### Known Flaky Tests
- Network simulation tests may be unreliable on some CI environments
- Retry functionality tests depend on proper error state handling

---

## 📈 Success Criteria

### Test Execution
- ✅ All 40+ test cases pass
- ✅ No timeout errors
- ✅ No flaky test failures
- ✅ Complete execution within 20 minutes

### Coverage Requirements
- ✅ 100% of critical payment flows covered
- ✅ All error scenarios tested
- ✅ Security validations included
- ✅ Performance benchmarks met

### CI/CD Integration
- ✅ Tests run on every PR
- ✅ Failed tests block merge
- ✅ Test reports generated
- ✅ Notifications on failure

---

## 🔄 Maintenance

### Regular Updates Required
1. **Test Data:** Update test payment methods when they expire
2. **Element IDs:** Keep in sync with UI changes
3. **API Endpoints:** Update when backend changes
4. **Error Messages:** Verify error text matches production

### When to Update Tests
- UI component IDs change
- Payment flow UX redesign
- New payment methods added
- Error handling improvements
- Security requirements change

---

## 📚 Related Documentation

- [Test Execution Report](../../../docs/TEST_EXECUTION_REPORT.md)
- [Payment Service Documentation](../../../apps/mobile/src/services/paymentService.ts)
- [Unified Gift Flow Screen](../../../apps/mobile/src/features/payments/screens/UnifiedGiftFlowScreen.tsx)
- [Detox Configuration](../../../.detoxrc.js)
- [CI/CD Pipeline](.github/workflows/e2e-tests.yml)

---

## 🤝 Contributing

When adding new payment features:

1. **Update Test Cases:** Add corresponding E2E tests
2. **Update Element IDs:** Document new test IDs in this README
3. **Update YAML Plan:** Sync with `payment-gift-flow.yaml`
4. **Run Full Suite:** Ensure all existing tests still pass
5. **Update Coverage Stats:** Reflect in Test Execution Report

---

## 📞 Support

**Test Issues:** Open issue in GitHub with `test:e2e` label  
**CI/CD Issues:** Tag DevOps team with `ci:e2e` label  
**Test Data Issues:** Contact QA team for test environment access

---

**Last Updated:** December 9, 2025  
**Maintained By:** QA Team  
**Review Frequency:** Every sprint

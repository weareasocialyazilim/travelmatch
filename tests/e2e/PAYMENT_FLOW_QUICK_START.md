# 🚀 Payment Flow E2E - Quick Start Guide

## ⚡ Quick Run Commands

### Run All Payment Tests
```bash
# iOS
npx detox test tests/e2e/paymentFlow.e2e.test.ts --configuration ios.sim.debug

# Android
npx detox test tests/e2e/paymentFlow.e2e.test.ts --configuration android.emu.debug
```

### Run Specific Test Suite
```bash
# Gift Purchase Journey
npx detox test tests/e2e/paymentFlow.e2e.test.ts -o "Gift Purchase Journey"

# Payment Method Selection
npx detox test tests/e2e/paymentFlow.e2e.test.ts -o "Payment Method Selection"

# Error Handling
npx detox test tests/e2e/paymentFlow.e2e.test.ts -o "Payment Error Handling"

# Transaction Success
npx detox test tests/e2e/paymentFlow.e2e.test.ts -o "Payment Success & Receipt"
```

### Debug Mode
```bash
# With video recording
npx detox test tests/e2e/paymentFlow.e2e.test.ts --record-videos all

# With logs
npx detox test tests/e2e/paymentFlow.e2e.test.ts --loglevel verbose

# Take screenshots on failure
npx detox test tests/e2e/paymentFlow.e2e.test.ts --take-screenshots failing
```

---

## 📋 Test Coverage Summary

| Category | Test Cases | Status |
|----------|------------|--------|
| **Gift Purchase Journey** | 3 | ✅ |
| **Form Validation** | 5 | ✅ |
| **Payment Methods** | 5 | ✅ |
| **Transaction Summary** | 6 | ✅ |
| **Success & Receipt** | 8 | ✅ |
| **Transaction History** | 4 | ✅ |
| **Error Handling** | 4 | ✅ |
| **Edge Cases** | 5 | ✅ |
| **Security** | 3 | ✅ |
| **Performance** | 2 | ✅ |
| **TOTAL** | **40+** | ✅ |

---

## 🎯 Key Test Scenarios

### Happy Path
1. Browse moments → Select moment → Tap Gift button
2. Enter recipient email & message
3. Select payment method (card)
4. Review summary → Complete purchase
5. View success screen & receipt
6. Verify in transaction history

**Duration:** ~30-40 seconds

### Error Scenarios
- Invalid email format
- Network failure during payment
- Payment declined
- Insufficient funds
- Retry after failure

### Security Checks
- ✅ Card numbers masked (•••• 4242)
- ✅ No full card number display
- ✅ Secure connection indicators

---

## 🔧 Required Test IDs

### Critical Elements (Must Exist)
```javascript
// Navigation
'tab-home', 'tab-profile', 'back-button'

// Moments
'moments-feed', 'moment-card-0', 'gift-button'

// Gift Flow
'unified-gift-flow-screen'
'recipient-email-input'
'gift-message-input'

// Payment
'payment-methods-list'
'payment-method-card'
'transaction-summary'
'purchase-button'

// Success
'payment-success-screen'
'transaction-id'
'done-button'

// History
'transaction-history-button'
'transaction-item-0'
```

---

## 📊 Expected Results

### Success Criteria
- ✅ All 40+ tests pass
- ✅ No timeout errors
- ✅ Complete in < 20 minutes
- ✅ No flaky test failures

### Performance Benchmarks
- Complete flow: < 20 seconds
- Payment processing: < 10 seconds
- Screen transitions: < 1 second

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** Tests fail with "element not found"
```bash
# Solution: Verify element IDs in code match test IDs
grep -r "testID" apps/mobile/src/features/payments/
```

**Issue:** Payment processing times out
```bash
# Solution: Check mock payment gateway is configured
# Verify test Stripe API keys in .env.test
```

**Issue:** Network tests are flaky
```bash
# Solution: Run with network simulation disabled
# Comment out setNetworkEnabled(false) calls
```

**Issue:** Transaction history tests fail
```bash
# Solution: Ensure test database is properly seeded
# Run: npm run test:e2e:seed
```

---

## 📦 Test Data Setup

### Required Test Accounts
```javascript
// Primary test user (has payment method)
{
  email: "payment-test@example.com",
  password: "TestPassword123!",
  hasCard: true,
  cardLast4: "4242"
}

// Secondary test user (no payment method)
{
  email: "no-payment@example.com",
  password: "TestPassword123!",
  hasCard: false
}
```

### Test Stripe Cards
```javascript
// Success
4242424242424242

// Declined
4000000000000002

// Insufficient Funds
4000000000009995
```

---

## 🔗 Related Files

- **Main Test File:** `tests/e2e/paymentFlow.e2e.test.ts`
- **YAML Plan:** `tests/e2e/flows/payment-gift-flow.yaml`
- **Documentation:** `tests/e2e/PAYMENT_FLOW_README.md`
- **Implementation:** `apps/mobile/src/features/payments/screens/UnifiedGiftFlowScreen.tsx`
- **Service:** `apps/mobile/src/services/paymentService.ts`

---

## 📞 Need Help?

- **Detox Issues:** [Detox Documentation](https://wix.github.io/Detox/)
- **Test Framework:** Ask in #qa-testing Slack channel
- **Payment Integration:** Ask in #payments Slack channel
- **CI/CD:** Tag DevOps team

---

**Status:** ✅ Implemented  
**Priority:** 🔴 Critical  
**Last Updated:** December 9, 2025

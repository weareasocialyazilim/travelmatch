# E2E Tests - Maestro

This directory contains end-to-end tests for TravelMatch using [Maestro](https://maestro.mobile.dev/).

## Prerequisites

1. Install Maestro:
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

2. Ensure app is running on simulator/emulator or device

## Test Flows

### Critical User Journeys

1. **login-flow.yaml** - User authentication and login
   - Email/password login
   - Navigation verification
   - Session persistence

2. **create-moment-flow.yaml** - Moment creation
   - Photo upload
   - Title, description, and pricing
   - Category and location selection
   - Publishing

3. **gift-booking-flow.yaml** - Complete booking flow
   - Moment discovery
   - Gift selection
   - Payment processing
   - Proof wallet verification

4. **proof-upload-flow.yaml** - Proof submission
   - Photo upload
   - Receipt attachment
   - Verification request
   - Status tracking

5. **chat-flow.yaml** - Messaging
   - Start conversation
   - Send messages
   - Real-time updates

6. **profile-settings-flow.yaml** - Profile management
   - Edit profile
   - Update settings
   - Privacy controls

## Running Tests

### Run all tests
```bash
maestro test .maestro/all-flows.yaml
```

### Run individual test
```bash
maestro test .maestro/login-flow.yaml
```

### Run on specific device
```bash
maestro test --device "iPhone 15 Pro" .maestro/login-flow.yaml
```

### Run with continuous mode (watches for changes)
```bash
maestro test --watch .maestro/
```

## CI/CD Integration

### GitHub Actions
The tests are integrated into the CI pipeline (`.github/workflows/ci.yml`) and run on every PR.

### Local Pre-commit
Run tests before committing:
```bash
npm run test:e2e
```

## Writing New Tests

Follow Maestro YAML syntax:
```yaml
appId: com.travelmatch.app
---
- launchApp
- tapOn: "Button Text"
- inputText: "Your text"
- assertVisible: "Expected Text"
- scroll
- swipe
```

## Debugging

### View test run with UI
```bash
maestro studio .maestro/login-flow.yaml
```

### Generate test report
```bash
maestro test --format junit .maestro/all-flows.yaml > test-results.xml
```

### Record test execution
```bash
maestro record .maestro/login-flow.yaml
```

## Best Practices

1. **Explicit waits**: Use `waitForAnimationToEnd` for async operations
2. **Assertions**: Always verify critical UI elements
3. **Idempotency**: Tests should be runnable multiple times
4. **Cleanup**: Reset app state between tests
5. **Descriptive names**: Use clear test and step descriptions

## Test Data

For test environments, use:
- Email: `test@example.com`
- Password: `password123`
- Test card: `4242424242424242` (Stripe test card)

## Troubleshooting

### App not launching
- Verify app is installed: `maestro test --device list`
- Check appId matches: `com.travelmatch.app`

### Element not found
- Use `maestro studio` to inspect elements
- Check for dynamic content loading
- Add appropriate wait commands

### Flaky tests
- Increase wait times for slow operations
- Use explicit assertions instead of delays
- Check for race conditions

## Coverage

Current E2E test coverage:
- ✅ Authentication (Login/Logout)
- ✅ Moment Creation
- ✅ Gift Booking & Payment
- ✅ Proof Upload & Verification
- ✅ Messaging
- ✅ Profile Management

Target: 80% of critical user paths

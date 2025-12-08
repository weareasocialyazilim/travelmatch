# Maestro E2E Tests

This directory contains end-to-end tests for the TravelMatch mobile app using [Maestro](https://maestro.mobile.dev/).

## Test Coverage

We have **20 comprehensive E2E test flows** covering critical user journeys:

### Authentication & Onboarding (3 flows)
1. **01-login.yaml** - User login with email/password
2. **07-signup.yaml** - New user registration
3. **08-forgot-password.yaml** - Password reset flow

### Core Features (6 flows - Existing)
4. **02-create-moment.yaml** - Creating and publishing a moment
5. **03-browse-moments.yaml** - Browsing and discovering moments
6. **04-request-flow.yaml** - Requesting to join a moment
7. **05-payment-flow.yaml** - Payment processing
8. **06-profile-update.yaml** - Updating user profile

### Discovery & Engagement (3 flows)
9. **10-search-filter.yaml** - Search with filters
10. **11-favorites.yaml** - Adding/removing favorites
11. **12-messaging.yaml** - Direct messaging between users

### Notifications & Reviews (2 flows)
12. **13-notifications.yaml** - Notification handling
13. **14-review.yaml** - Leaving reviews after moments

### Trust & Security (3 flows)
14. **15-trust-verification.yaml** - Trust Garden verification
15. **16-kyc.yaml** - KYC verification for payments
16. **19-block-user.yaml** - Blocking/unblocking users

### Financial Operations (2 flows)
17. **17-wallet.yaml** - Wallet management (add funds, withdraw)
18. **18-refund.yaml** - Requesting refunds

### Safety & Moderation (1 flow)
19. **20-report-content.yaml** - Reporting inappropriate content/users

## Prerequisites

Install Maestro CLI:
```bash
# macOS
brew tap mobile-dev-inc/tap
brew install maestro

# Linux/WSL
curl -Ls "https://get.maestro.mobile.dev" | bash

# Windows
powershell -c "iwr 'https://get.maestro.mobile.dev' -o maestro-installer.ps1; .\maestro-installer.ps1"
```

## Running Tests

### Run all tests
```bash
maestro test .maestro/
```

### Run specific test
```bash
maestro test .maestro/01-login.yaml
```

### Run tests on specific device
```bash
# iOS
maestro test --device "iPhone 14 Pro" .maestro/

# Android
maestro test --device "Pixel 6" .maestro/
```

### Run with cloud recording
```bash
maestro cloud --apiKey=<YOUR_KEY> .maestro/
```

## Test Organization

Tests are numbered for logical execution order:
- **01-09**: Authentication and basic flows
- **10-14**: Core feature interactions
- **15-20**: Advanced features and safety

## CI/CD Integration

Tests run automatically on:
- Pull requests to `main`
- Nightly builds
- Before releases

See `.github/workflows/e2e-tests.yml` for configuration.

## Writing New Tests

1. Create new `.yaml` file in `.maestro/` directory
2. Follow naming convention: `##-feature-name.yaml`
3. Include descriptive comments
4. Test both happy path and error cases
5. Update this README with test description

## Debugging

### View test execution
```bash
maestro test --debug .maestro/01-login.yaml
```

### Record test execution
```bash
maestro test --record .maestro/01-login.yaml
```

### Interactive mode
```bash
maestro studio
```

## Best Practices

✅ **DO:**
- Use descriptive test IDs for elements
- Test critical user journeys
- Include assertions for success/failure states
- Keep tests independent and atomic
- Mock external dependencies

❌ **DON'T:**
- Hard-code sensitive data
- Create interdependent tests
- Test implementation details
- Skip error scenarios

## Coverage Goals

| Category | Flows | Status |
|----------|-------|--------|
| Authentication | 3 | ✅ Complete |
| Core Features | 6 | ✅ Complete |
| Discovery | 3 | ✅ Complete |
| Notifications | 2 | ✅ Complete |
| Trust & Security | 3 | ✅ Complete |
| Financial | 2 | ✅ Complete |
| Safety | 1 | ✅ Complete |
| **Total** | **20** | **✅ 100%** |

## Resources

- [Maestro Documentation](https://maestro.mobile.dev/getting-started/introduction)
- [Maestro Cloud](https://cloud.mobile.dev/)
- [Best Practices Guide](https://maestro.mobile.dev/best-practices/writing-flows)

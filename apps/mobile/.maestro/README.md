# Maestro E2E Tests - Lovendo Mobile

## Quick Start

### Install Maestro CLI
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Run Tests Locally

```bash
# Run all tests
cd apps/mobile
maestro test .maestro/flows/

# Run smoke tests only (P0)
maestro test .maestro/flows/cold_start.yaml .maestro/flows/auth_email_otp.yaml

# Run single test
maestro test .maestro/flows/cold_start.yaml

# Run with debug output
maestro test .maestro/flows/cold_start.yaml --debug-output ./debug
```

### Prerequisites
1. iOS Simulator or Android Emulator running
2. App installed (via `npx expo run:ios` or `npx expo run:android`)
3. Maestro CLI installed

## Test Suite

| Flow | Priority | Risk Covered | Runtime |
|------|----------|--------------|---------|
| `cold_start.yaml` | P0 | App crash on startup | ~15s |
| `auth_email_otp.yaml` | P0 | Auth flow failure | ~30s |
| `onboarding_minimal.yaml` | P0 | Profile creation | ~45s |
| `empty_state.yaml` | P1 | Poor empty UX | ~20s |
| `purchase_revenuecat.yaml` | P0 | Payment failure | ~40s |
| `image_upload.yaml` | P1 | Upload broken | ~30s |
| `logout_login_cycle.yaml` | P1 | Session bugs | ~60s |

## CI Integration

Tests run automatically on:
- PRs to `main` or `developer` branches
- Changes to `apps/mobile/**`
- Manual trigger via GitHub Actions

### Smoke vs Regression

**Smoke (P0)** - Must pass before merge:
- `cold_start.yaml`
- `auth_email_otp.yaml`
- `purchase_revenuecat.yaml`

**Regression (P1)** - Should pass, warnings on failure:
- `onboarding_minimal.yaml`
- `empty_state.yaml`
- `image_upload.yaml`
- `logout_login_cycle.yaml`

## testID Strategy

All selectors use deterministic `testID` props. See `TESTID_STRATEGY.md` for:
- Naming conventions
- Examples by screen
- Implementation guidelines

## Failure Strategy

### P0 Failure (BLOCKER)
- **Action:** CI MUST FAIL
- **Tests:** cold_start, auth_email_otp, purchase_revenuecat
- **Owner:** Mobile team immediate investigation

### P1 Failure (WARNING)
- **Action:** CI WARNS, does not block
- **Tests:** onboarding, empty_state, image_upload, logout_login
- **Owner:** Track in bug backlog, fix before release

## Debugging Failed Tests

1. **Check Screenshots**
   - Artifacts uploaded to GitHub Actions
   - Located in `.maestro/screenshots/`

2. **Run Locally with Debug**
   ```bash
   maestro test --debug-output ./debug .maestro/flows/failing_test.yaml
   ```

3. **Check testID Existence**
   - Verify component has `testID` prop
   - Check React Native Inspector

4. **Timing Issues**
   - Increase `timeout` in `extendedWaitUntil`
   - Add explicit `wait` commands

## OTP Bypass for CI

For auth flows in CI, configure test backend to accept:
- Email: `e2e-test@lovendo.xyz`
- OTP: `123456` (bypass code)

Or use Supabase test mode with mock OTP verification.

## Launch Checklist

Before release:
- [ ] All P0 tests pass
- [ ] No P1 regressions
- [ ] Screenshots reviewed for visual issues
- [ ] Tested on both iOS and Android
- [ ] Staging environment tests pass

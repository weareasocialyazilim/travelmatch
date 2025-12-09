# GitHub Actions E2E Setup Guide

## Overview
This guide covers the CI/CD integration for Detox E2E tests covering all 4 critical flows:
- Payment Flow (Gift Sending)
- Proof Verification Flow
- Chat/Messaging Flow
- Offline Scenarios

## 🔧 Prerequisites

### 1. GitHub Secrets Configuration

Navigate to: **Settings → Secrets and variables → Actions → New repository secret**

#### Required Secrets:
```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe (Test Mode)
STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...

# Test User Credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!

# Slack Notifications (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### 2. Branch Protection Rules

Navigate to: **Settings → Branches → Branch protection rules**

#### For `main` branch:
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
  - **Required status checks:**
    - `E2E Status Check (Required)`
    - `Detox E2E Tests (iOS - Critical Flows)`
    - `Detox E2E Tests (Android - Critical Flows)`
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings

#### For `develop` branch:
- ✅ Require status checks to pass before merging
  - Same required checks as `main`

## 📋 Workflow Configuration

### File: `.github/workflows/e2e-detox.yml`

#### Triggers:
- **Pull Requests:** Runs on PRs to `main` or `develop`
- **Push:** Runs on push to `main` branch
- **Schedule:** Nightly at 3 AM UTC
- **Manual:** Workflow dispatch available

#### Jobs:

##### 1. `e2e-detox-ios`
- **Platform:** macOS-13 with Xcode 15.0
- **Strategy:** Matrix with 4 flows (payment, proof-verification, chat, offline)
- **Timeout:** 60 minutes
- **Artifacts:** Videos, screenshots, logs on failure

##### 2. `e2e-detox-android`
- **Platform:** Ubuntu with Android Emulator (API 33, Pixel 6)
- **Strategy:** Matrix with 4 flows
- **Timeout:** 60 minutes
- **Caching:** AVD snapshot cached for faster runs
- **Artifacts:** Videos, screenshots, logs on failure

##### 3. `e2e-status-check` (Required Check)
- **Purpose:** Aggregate status for branch protection
- **Blocks merge if:** Any iOS or Android flow fails
- **Creates:** Summary with pass/fail status

##### 4. `notify-slack`
- **Trigger:** On failure in `main` or scheduled runs
- **Action:** Sends Slack notification with details

## 🚀 Setup Instructions

### Step 1: Add Secrets
```bash
# Using GitHub CLI
gh secret set EXPO_PUBLIC_SUPABASE_URL --body "https://your-project.supabase.co"
gh secret set EXPO_PUBLIC_SUPABASE_ANON_KEY --body "your-anon-key"
gh secret set STRIPE_TEST_PUBLISHABLE_KEY --body "pk_test_..."
gh secret set TEST_USER_EMAIL --body "test@example.com"
gh secret set TEST_USER_PASSWORD --body "TestPassword123!"
gh secret set SLACK_WEBHOOK_URL --body "https://hooks.slack.com/services/..."
```

### Step 2: Configure Branch Protection
```bash
# Using GitHub CLI
gh api repos/:owner/:repo/branches/main/protection \
  -X PUT \
  -F required_status_checks[strict]=true \
  -F required_status_checks[contexts][]=E2E Status Check (Required) \
  -F required_status_checks[contexts][]=Detox E2E Tests (iOS - Critical Flows) \
  -F required_status_checks[contexts][]=Detox E2E Tests (Android - Critical Flows) \
  -F required_pull_request_reviews[required_approving_review_count]=1 \
  -F enforce_admins=true
```

### Step 3: Test Workflow
```bash
# Trigger manual run
gh workflow run e2e-detox.yml --ref main

# Monitor run
gh run watch
```

### Step 4: Verify Branch Protection
1. Create a test PR
2. Verify all 3 required checks appear
3. Verify merge is blocked until checks pass
4. Merge PR once checks pass

## 📊 Workflow Features

### Matrix Strategy
Each flow runs in parallel for both iOS and Android:
- `payment` → `paymentFlow.e2e.test.ts`
- `proof-verification` → `proofVerificationFlow.e2e.test.ts`
- `chat` → `chatFlow.e2e.test.ts`
- `offline` → `offlineScenarios.e2e.test.ts`

**Total:** 8 parallel jobs (4 flows × 2 platforms)

### Artifact Collection
On test failure, uploads:
- ✅ Video recordings (`.mp4`)
- ✅ Screenshots (`.png`)
- ✅ Detox logs
- ✅ Test results JSON

**Retention:** 14 days for videos/screenshots, 7 days for results

### PR Comments
Automatic comment on each PR with:
- Test status (✅/❌)
- Flow name
- Platform
- Link to workflow run

### Status Check Aggregation
Single required check (`e2e-status-check`) that:
- Waits for all iOS/Android jobs
- Fails if ANY flow fails
- Provides summary in GitHub UI

## 🔍 Monitoring & Debugging

### View Test Results
1. Go to **Actions** tab
2. Select workflow run
3. Click on failed job
4. Download artifacts for debugging

### Local Reproduction
```bash
# Run same test that failed in CI
detox test tests/e2e/paymentFlow.e2e.test.ts \
  --configuration ios.sim.release \
  --record-videos all \
  --loglevel verbose
```

### Common Issues

#### Issue: Tests timeout
**Solution:** Increase `timeout-minutes` in workflow

#### Issue: Simulator/Emulator slow
**Solution:** Workflow uses caching for AVD, should be fast

#### Issue: Flaky tests
**Solution:** Add retry logic:
```yaml
- name: Run tests with retry
  uses: nick-invision/retry@v2
  with:
    timeout_minutes: 60
    max_attempts: 3
    command: detox test ...
```

## 📈 Performance Optimization

### Current Setup:
- **iOS:** ~20-30 min per flow
- **Android:** ~25-35 min per flow (with AVD caching)
- **Total:** ~30-40 min (parallel execution)

### Optimization Tips:
1. **Enable caching:**
   - ✅ npm/pnpm cache (already enabled)
   - ✅ Gradle cache (already enabled)
   - ✅ AVD cache (already enabled)
   - ✅ CocoaPods cache (already enabled)

2. **Reduce build time:**
   - Use `release` builds (faster than `debug`)
   - Cache iOS build artifacts

3. **Parallel execution:**
   - Already using matrix strategy
   - Consider splitting tests further if needed

## 🔐 Security Best Practices

### Secrets Management:
- ✅ Never commit secrets to repository
- ✅ Use GitHub Secrets for sensitive data
- ✅ Use test mode keys for Stripe
- ✅ Rotate test credentials regularly

### Test Data:
- ✅ Use test/staging environment
- ✅ Test credit cards only (4242424242424242)
- ✅ Mock external services when possible

## 📝 Maintenance

### Regular Tasks:
1. **Weekly:** Review failed test patterns
2. **Monthly:** Update Xcode/Android SDK versions
3. **Quarterly:** Review and update test scenarios
4. **Yearly:** Audit secrets and rotate credentials

### Version Updates:
```yaml
# Update in workflow file as needed
node-version: '20'        # Update to latest LTS
xcode-version: '15.0'     # Update to latest stable
java-version: '17'        # Update as needed
api-level: 33             # Update Android API level
```

## 🎯 Success Criteria

### Merge Blocking:
✅ All 4 critical flows must pass on both platforms
✅ No exceptions for admins
✅ Status check required and enforced

### Test Coverage:
✅ Payment Flow: 40+ test cases
✅ Proof Verification: 50+ test cases
✅ Chat/Messaging: 70+ test cases
✅ Offline Scenarios: 35+ test cases

### Performance:
✅ Complete E2E suite runs in < 40 minutes
✅ Individual flows complete in < 10 minutes
✅ Artifact upload < 5 minutes

## 🆘 Support

### Getting Help:
1. Check workflow logs in GitHub Actions
2. Review test artifacts (videos, screenshots)
3. Reproduce locally with same configuration
4. Check Detox documentation: https://wix.github.io/Detox/

### Contact:
- **Team Channel:** #travelmatch-eng
- **On-call:** Check team schedule
- **Documentation:** `docs/E2E_TESTING.md`

---

**Last Updated:** December 9, 2025
**Status:** ✅ Ready for deployment
**Next Review:** January 2026

# Branch Protection Configuration

## Overview
This document outlines the branch protection rules configured for TravelMatch to ensure code quality and prevent broken code from being merged.

## Protected Branches

### `main` Branch
Production branch - requires all checks to pass before merge.

**Required Status Checks:**
- ✅ UI & E2E Component Tests
  - `unit-component-tests` - Unit and component tests must pass
  - `integration-tests` - Integration tests must pass
  - `e2e-flow-tests` - E2E flow tests must pass
  - `screen-tests` - Screen component tests must pass
  - `test-quality-gate` - Overall quality gate must pass
  
- ✅ E2E Tests (Maestro)
  - `e2e-ios` - iOS E2E tests must pass
  - `e2e-android` - Android E2E tests must pass

**Rules:**
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require pull request before merging
- ✅ Require approvals: **2 reviewers**
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners
- ✅ Restrict who can push to matching branches (maintainers only)
- ❌ Allow force pushes (disabled)
- ❌ Allow deletions (disabled)

### `develop` Branch
Development branch - requires tests to pass before merge.

**Required Status Checks:**
- ✅ UI & E2E Component Tests
  - `unit-component-tests`
  - `integration-tests`
  - `e2e-flow-tests`
  - `screen-tests`
  - `test-quality-gate`
  
- ✅ E2E Tests (Maestro)
  - `e2e-ios`
  - `e2e-android`

**Rules:**
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require pull request before merging
- ✅ Require approvals: **1 reviewer**
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ❌ Allow force pushes (disabled)
- ❌ Allow deletions (disabled)

## GitHub Actions Workflows

### 1. UI & E2E Component Tests (`.github/workflows/ui-e2e-tests.yml`)

**Triggers:**
- Pull requests to `main` or `develop`
- Push to `main` or `develop`
- Manual dispatch

**Jobs:**
1. **unit-component-tests** (20 min timeout)
   - Runs unit and component tests with coverage
   - Uses `pnpm test:unit` and `pnpm test:components`
   - Uploads coverage to Codecov
   
2. **integration-tests** (20 min timeout)
   - Runs integration tests with coverage
   - Uses `pnpm test:integration`
   - Uploads coverage to Codecov
   
3. **e2e-flow-tests** (30 min timeout)
   - Runs E2E flow tests (onboarding, profile, moments)
   - Uses `pnpm test:e2e:flows`
   - Uploads test results and coverage
   
4. **screen-tests** (20 min timeout)
   - Runs screen component tests
   - Uses `pnpm test:screens`
   - Uploads coverage to Codecov
   
5. **test-quality-gate**
   - Depends on all test jobs
   - Fails if any test job fails
   - Blocks merge if quality gate fails
   
6. **notify-results**
   - Comments on PR if tests fail
   - Sends Slack notification on push failures
   - Shows test status breakdown

### 2. E2E Tests - Maestro (`.github/workflows/e2e-tests.yml`)

**Triggers:**
- Pull requests to `main` or `develop`
- Push to `main`
- Scheduled: Daily at 2 AM UTC
- Manual dispatch

**Jobs:**
1. **e2e-ios** (45 min timeout)
   - Runs on macOS latest
   - Uses iPhone 14 Pro simulator
   - Executes Maestro test flows
   - Uploads test results and recordings
   
2. **e2e-android** (45 min timeout)
   - Runs on Ubuntu latest
   - Uses Pixel 6 emulator (API 33)
   - Executes Maestro test flows
   - Uploads test results and recordings
   
3. **e2e-cloud** (main branch only)
   - Uploads to Maestro Cloud
   - Runs distributed E2E tests
   
4. **notify** (on failure)
   - Sends Slack notification
   - Includes workflow link and details

## Test Coverage Requirements

### Minimum Coverage Thresholds
- **Unit Tests:** 85% (currently: 85%)
- **Integration Tests:** 75% (currently: 75%)
- **E2E Component Tests:** 75% (currently: 75%)
- **E2E Critical Flows:** 100% (currently: 100%)

### Blocking Conditions
A pull request **CANNOT** be merged if:
1. ❌ Any unit/component test fails
2. ❌ Any integration test fails
3. ❌ Any E2E flow test fails
4. ❌ Any screen test fails
5. ❌ iOS E2E tests fail
6. ❌ Android E2E tests fail
7. ❌ Test quality gate fails
8. ❌ Coverage drops below thresholds

## Setup Instructions

### Step 1: Configure Branch Protection on GitHub

1. Go to **Settings** > **Branches** > **Add branch protection rule**

2. For `main` branch:
   - Branch name pattern: `main`
   - Check: ✅ Require a pull request before merging
   - Check: ✅ Require approvals: 2
   - Check: ✅ Dismiss stale pull request approvals when new commits are pushed
   - Check: ✅ Require review from Code Owners
   - Check: ✅ Require status checks to pass before merging
   - Check: ✅ Require branches to be up to date before merging
   - Select status checks:
     * `unit-component-tests`
     * `integration-tests`
     * `e2e-flow-tests`
     * `screen-tests`
     * `test-quality-gate`
     * `e2e-ios`
     * `e2e-android`
   - Check: ✅ Restrict who can push to matching branches
   - Uncheck: ❌ Allow force pushes
   - Uncheck: ❌ Allow deletions

3. For `develop` branch:
   - Branch name pattern: `develop`
   - Check: ✅ Require a pull request before merging
   - Check: ✅ Require approvals: 1
   - Check: ✅ Dismiss stale pull request approvals when new commits are pushed
   - Check: ✅ Require status checks to pass before merging
   - Check: ✅ Require branches to be up to date before merging
   - Select status checks:
     * `unit-component-tests`
     * `integration-tests`
     * `e2e-flow-tests`
     * `screen-tests`
     * `test-quality-gate`
     * `e2e-ios`
     * `e2e-android`
   - Uncheck: ❌ Allow force pushes
   - Uncheck: ❌ Allow deletions

### Step 2: Configure GitHub Secrets

Required secrets for workflows:
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SLACK_WEBHOOK_URL` - Slack webhook for notifications
- `CODECOV_TOKEN` - Codecov upload token (optional)
- `MAESTRO_CLOUD_API_KEY` - Maestro Cloud API key (for cloud tests)

### Step 3: Enable Workflows

1. Go to **Actions** > **Workflows**
2. Enable:
   - ✅ UI & E2E Component Tests
   - ✅ E2E Tests - Maestro

### Step 4: Test Configuration

Create a test PR to verify:
1. All test jobs execute
2. Status checks appear in PR
3. Merge is blocked if tests fail
4. Merge is allowed only when all checks pass

## Monitoring & Alerts

### Slack Notifications
Failed test runs on `main` or `develop` branches trigger Slack alerts with:
- Repository and branch information
- Commit SHA
- Link to workflow run
- Test status breakdown

### PR Comments
Failed test runs on PRs automatically post a comment with:
- Test quality gate status
- Individual test suite results
- Link to workflow logs
- Blocking message

## Maintenance

### Weekly Tasks
- Review test execution times
- Monitor flaky tests
- Update coverage thresholds if needed

### Monthly Tasks
- Review branch protection rules
- Update required status checks
- Audit test suite performance
- Review and optimize slow tests

## Emergency Procedures

### Bypassing Branch Protection (Emergency Only)
If merge is required despite test failures (production incident):

1. **DO NOT** disable branch protection
2. Contact repository admin
3. Admin temporarily adds exception for specific PR
4. Merge with admin override
5. Create immediate follow-up PR to fix tests
6. Document incident in post-mortem

### Disabling Tests (Never Recommended)
If a test suite is consistently failing and blocking all PRs:

1. Create GitHub issue documenting the problem
2. Tag test as `.skip()` in code
3. Create fix PR immediately
4. Re-enable test once fixed
5. Document in CHANGELOG

## Troubleshooting

### Tests Pass Locally But Fail in CI
- Check environment variables in CI
- Verify Node.js and package versions match
- Check for timing issues (add proper waits)
- Review CI logs for environment differences

### Tests Are Too Slow
- Run tests in parallel (`--maxWorkers`)
- Optimize slow tests
- Split test suites into smaller jobs
- Use test sharding for large suites

### Flaky Tests
- Add proper wait conditions
- Mock time-dependent code
- Increase timeout values
- Add retry logic for network requests

## Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Maestro Documentation](https://maestro.mobile.dev/)

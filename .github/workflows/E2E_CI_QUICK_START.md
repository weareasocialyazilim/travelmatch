# E2E CI/CD Integration - Quick Start

**Goal:** Enable E2E tests as required checks that block merges to `main` and `develop`

## ⚡ 5-Minute Setup

### 1. Add GitHub Secrets (2 minutes)
```bash
# Navigate to: Settings → Secrets → Actions → New secret

EXPO_PUBLIC_SUPABASE_URL          # Your Supabase project URL
EXPO_PUBLIC_SUPABASE_ANON_KEY     # Your Supabase anon key
STRIPE_TEST_PUBLISHABLE_KEY       # pk_test_... from Stripe Dashboard
TEST_USER_EMAIL                   # test@example.com
TEST_USER_PASSWORD                # Strong password for test user
SLACK_WEBHOOK_URL                 # (Optional) For failure notifications
```

### 2. Enable Branch Protection (2 minutes)
```bash
# Navigate to: Settings → Branches → Add rule

Branch name pattern: main

☑️ Require a pull request before merging
☑️ Require status checks to pass before merging

Required status checks (search and add):
  ☑️ E2E Status Check (Required)
  ☑️ Detox E2E Tests (iOS - Critical Flows)
  ☑️ Detox E2E Tests (Android - Critical Flows)

☑️ Require conversation resolution before merging
☑️ Do not allow bypassing the above settings

Click "Create" or "Save changes"
```

### 3. Test It (1 minute)
```bash
# Create a test PR
git checkout -b test/e2e-ci
git commit --allow-empty -m "test: verify E2E CI"
git push origin test/e2e-ci

# Create PR and watch checks run
gh pr create --fill
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Secrets are configured in GitHub
- [ ] Branch protection rule is active for `main`
- [ ] Create a test PR and see 3 required checks appear
- [ ] Try merging PR before checks complete (should be blocked)
- [ ] Wait for checks to pass and merge PR
- [ ] Check Slack notification on failure (if configured)

## 🎯 What This Enables

### Before Setup:
❌ E2E tests could be skipped  
❌ Broken flows could reach production  
❌ No automated validation of critical paths  

### After Setup:
✅ All PRs must pass E2E tests  
✅ 4 critical flows validated automatically  
✅ Merge blocked if any test fails  
✅ Parallel execution (8 jobs: 4 flows × 2 platforms)  
✅ Automatic artifacts on failure  
✅ PR comments with test results  

## 📊 What Gets Tested

Every PR runs:
- **Payment Flow** (40+ tests) - Gift purchasing journey
- **Proof Verification** (50+ tests) - Upload, approve/reject
- **Chat/Messaging** (70+ tests) - Text, media, gifts in chat
- **Offline Scenarios** (35+ tests) - Queue, cache, sync

**Total:** 195+ test cases per PR

## 🔍 Monitoring

### View Test Results:
1. Go to PR → Checks tab
2. Click on "E2E Status Check (Required)"
3. View summary and individual job results

### Download Failure Artifacts:
1. Click on failed job
2. Scroll to bottom → Artifacts
3. Download videos, screenshots, logs

### Local Reproduction:
```bash
# Run exact same test that failed
detox test tests/e2e/paymentFlow.e2e.test.ts \
  --configuration ios.sim.release \
  --record-videos all
```

## 🚨 Common Issues

### Issue: "Required check not found"
**Solution:** 
1. Run workflow manually first to register checks
2. Go to Actions → e2e-detox → Run workflow
3. Wait for completion, then add to branch protection

### Issue: Tests timing out
**Solution:** 
- Default timeout is 60 minutes (should be enough)
- If needed, edit `.github/workflows/e2e-detox.yml`
- Change `timeout-minutes: 60` to higher value

### Issue: Secrets not working
**Solution:** 
- Verify secret names match exactly (case-sensitive)
- Re-add secrets if needed
- Check workflow logs for "secret not found" errors

## 📈 Performance

**Expected Runtimes:**
- iOS jobs: ~20-30 min per flow
- Android jobs: ~25-35 min per flow
- **Total:** ~30-40 min (parallel execution)

**Why it's fast:**
- ✅ Parallel matrix execution (8 jobs at once)
- ✅ Cached dependencies (npm, gradle, pods)
- ✅ Cached AVD snapshots
- ✅ Release builds (faster than debug)

## 🎓 Next Steps

### Immediate:
1. ✅ Complete 5-minute setup above
2. ✅ Test with a PR
3. ✅ Verify merge blocking works

### Optional Enhancements:
- [ ] Add Slack notifications for failures
- [ ] Configure develop branch protection
- [ ] Add workflow badge to README
- [ ] Set up scheduled runs (already configured for 3 AM)

### Badge for README:
```markdown
[![E2E Tests](https://github.com/your-org/travelmatch-new/actions/workflows/e2e-detox.yml/badge.svg)](https://github.com/your-org/travelmatch-new/actions/workflows/e2e-detox.yml)
```

## 📚 Resources

- **Full Guide:** `.github/workflows/E2E_CI_SETUP.md`
- **Test Documentation:** `tests/e2e/PAYMENT_FLOW_README.md`
- **Detox Docs:** https://wix.github.io/Detox/
- **GitHub Actions:** https://docs.github.com/en/actions

## ✨ Success!

After completing setup:
- ✅ E2E tests run automatically on every PR
- ✅ Merges blocked until all tests pass
- ✅ 195+ test cases validating critical flows
- ✅ Production risk significantly reduced

**Production Status:** 🟢 READY (once setup complete)

---

**Setup Time:** ~5 minutes  
**Protection Level:** HIGH  
**Impact:** CRITICAL  
**Status:** Ready to deploy

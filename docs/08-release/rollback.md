# Rollback Procedures

## When to Rollback

| Condition                         | Severity | Action                 |
| --------------------------------- | -------- | ---------------------- |
| Critical bug affecting >10% users | High     | Immediate rollback     |
| Data integrity issue              | Critical | Immediate rollback     |
| Security vulnerability            | Critical | Immediate rollback     |
| Performance regression            | Medium   | Evaluate, decide       |
| UI bug                            | Low      | Hotfix in next release |

## Rollback Procedures

### Web/Admin (Vercel)

```bash
# Via Vercel Dashboard:
# 1. Go to deployments
# 2. Find previous working deployment
# 3. Click "Rollback"
```

### Mobile

```bash
# iOS
# 1. Pull previous version from App Store Connect
# 2. Hotfix if needed
# 3. Resubmit (24-48 hours review)

# Android
# 1. Rollback in Play Console
# 2. Staged rollout adjustment
```

## Rollback Triggers

| Metric          | Threshold           |
| --------------- | ------------------- |
| Error rate      | >2%                 |
| Crash rate      | >1%                 |
| Support tickets | +100% from baseline |

## NOT IMPLEMENTED

- Automatic rollback triggers
- Blue-green deployments
- Canary deployments

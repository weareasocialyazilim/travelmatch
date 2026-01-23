# Observability — Launch Ready

## Sentry (Release + Alerts)

### Mobile EAS Sourcemaps

- EAS production builds upload sourcemaps automatically via Expo Sentry plugin.
- Ensure `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` are set in EAS.

### P0 Alert (Crash-Free Users)

Create a Sentry alert rule:

- **Metric**: Crash-free users
- **Threshold**: < 99.5%
- **Window**: 30 minutes
- **Environments**: production
- **Actions**: Slack + email + PagerDuty (or equivalent)

## PostHog (Canonical Events)

These event names are **fixed** and must be used verbatim:

1. `signup_completed`
2. `login_completed`
3. `onboarding_completed`
4. `moment_created`
5. `moment_listed`
6. `payment_init`
7. `payment_success`
8. `proof_uploaded`
9. `admin_action`
10. `error_toast_shown`

> Use these canonical names in code and dashboards to avoid split analytics.

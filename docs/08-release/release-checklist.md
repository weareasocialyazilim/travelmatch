# Release Checklist

## Pre-Release Checks

- [ ] All tests passing
- [ ] Type-check passing
- [ ] Lint passing (0 errors, 0 warnings)
- [ ] No critical Sentry errors
- [ ] AI moderation working
- [ ] Escrow logic verified
- [ ] Payment flows tested

## Release Steps

### 1. Code Freeze

```bash
git checkout -b release/v1.0
# No new features after this point
```

### 2. Build

```bash
# iOS
pnpm ios:build

# Android
pnpm android:build
```

### 3. Submit

```bash
# iOS - Upload to App Store Connect
eas submit --platform ios

# Android - Upload to Play Console
eas submit --platform android
```

### 4. Verify

- [ ] Build appears in store
- [ ] TestFlight/Internal test works
- [ ] Critical flows tested

## Code References

| Feature        | Location               |
| -------------- | ---------------------- |
| Build config   | `apps/mobile/eas.json` |
| Release script | `scripts/release.sh`   |

## NOT IMPLEMENTED

- Automated builds
- CI/CD pipelines
- Release automation

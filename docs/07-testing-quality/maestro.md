# Maestro E2E Testing

## Overview

Maestro is used for end-to-end mobile testing on both iOS and Android.

## Test Structure

```
.maestro/
├── common/
│   ├── login.yaml
│   └── logout.yaml
├── flows/
│   ├── discover.yaml
│   ├── create_moment.yaml
│   └── gift_moment.yaml
└── tests/
    ├── smoke.yaml
    └── critical_paths.yaml
```

## Running Tests

```bash
# Run all tests
pnpm test:e2e

# Run specific test
maestro test .maestro/tests/smoke.yaml

# Run on iOS
pnpm test:e2e:ios

# Run on Android
pnpm test:e2e:android
```

## Code References

| Feature        | Location                   |
| -------------- | -------------------------- |
| Test configs   | `apps/mobile/.maestro/`    |
| Maestro config | `apps/mobile/maestro.yaml` |

## NOT IMPLEMENTED

- Parallel test execution
- Test parallelization by device
- Cloud test execution
- Flaky test detection

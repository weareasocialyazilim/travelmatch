# Testing Strategy

## Testing Pyramid

```
        ┌───────────┐
        │    E2E    │  (Maestro)
       ╱ └───────────┘ ╲
      ╱                 ╲
    ┌───────────┐     ┌───────────┐
    │ Integration│     │   Unit    │
    └───────────┘     └───────────┘
```

## Testing Levels

| Level       | Tool        | Coverage              | Purpose           |
| ----------- | ----------- | --------------------- | ----------------- |
| Unit        | Jest/Vitest | Components, utilities | Logic correctness |
| Integration | Jest        | API mocks             | Feature testing   |
| E2E         | Maestro     | Critical flows        | User journey      |

## Testing Requirements

| Check      | Command           | Pass Criteria        |
| ---------- | ----------------- | -------------------- |
| Lint       | `pnpm lint`       | 0 errors, 0 warnings |
| Type-check | `pnpm type-check` | 0 errors             |
| Unit tests | `pnpm test`       | 80% pass             |
| E2E tests  | `pnpm test:e2e`   | Critical paths       |

## Code References

| Feature        | Location                     |
| -------------- | ---------------------------- |
| Jest config    | `apps/mobile/jest.config.js` |
| Maestro tests  | `apps/mobile/.maestro/`      |
| Test utilities | `apps/mobile/src/__tests__/` |

## NOT IMPLEMENTED

- Snapshot testing
- Performance testing
- Load testing
- Accessibility testing

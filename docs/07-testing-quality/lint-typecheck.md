# Lint and Type-Check Standards

## Lint Rules

The project uses ESLint with strict rules. Console statements are restricted:

| Level | Console Method  | Allowed |
| ----- | --------------- | ------- |
| Error | `console.error` | Yes     |
| Error | `console.warn`  | Yes     |
| Error | `console.info`  | Yes     |
| Error | `console.log`   | NO      |
| Error | `console.debug` | NO      |

## Running Checks

```bash
# Lint
pnpm lint

# Fix auto-fixable issues
pnpm lint:fix

# Type-check
pnpm type-check

# Full quality check
pnpm check
```

## TypeScript Configuration

| Setting     | Value   |
| ----------- | ------- |
| Strict mode | Enabled |
| NoEmit      | true    |
| ES Module   | ESNext  |

## Code References

| Feature           | Location                    |
| ----------------- | --------------------------- |
| ESLint config     | `apps/mobile/.eslintrc.js`  |
| TypeScript config | `apps/mobile/tsconfig.json` |

## Pre-commit Hooks

Husky + lint-staged run checks before each commit:

```bash
# Runs automatically on commit
- pnpm lint
- pnpm type-check
```

## NOT IMPLEMENTED

- Custom lint rules
- Legacy JS support
- ESLint plugin extensions

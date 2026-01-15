# Lovendo Source Code

This directory contains the source code for the Lovendo React Native application.

## Directory Structure

```
src/
├── components/     # Reusable UI components
├── config/         # App configuration (Sentry, feature flags, i18n)
├── constants/      # Design tokens (colors, spacing, typography)
├── context/        # React Context providers
├── data/           # Static data and mock data
├── hooks/          # Custom React hooks
├── locales/        # Internationalization files
├── mocks/          # Mock data for development/testing
├── navigation/     # React Navigation configuration
├── screens/        # Screen components
├── services/       # API services and external integrations
├── stores/         # Zustand state management stores
├── theme/          # Theme configuration
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Key Patterns

### State Management

- **Zustand** for global state (auth, UI, favorites)
- **React Context** for feature-specific state (toast, network, realtime)
- **React Hook Form** with **Zod** for form validation

### API Layer

- Centralized API client in `utils/api.ts`
- Service modules in `services/` for each domain
- Offline support with caching in `services/cacheService.ts`
- **API Middleware** in `utils/apiMiddleware.ts` for request validation, rate limiting, and response
  handling

### Error Handling

- Centralized error handling in `utils/errorHandler.ts`
- Custom error classes in `utils/errors.ts`
- ErrorBoundary components for crash recovery
- Sentry integration for error tracking

### Security

- Input sanitization in `utils/security.ts`
- Rate limiting in `utils/rateLimiter.ts`
- Comprehensive validation schemas in `utils/validation.ts`
- Secure storage for sensitive data

### Performance

- Lazy loading for screens in `navigation/AppNavigator.tsx`
- Memoized components with `React.memo`
- OptimizedFlatList for list performance
- Debounce and throttle hooks in `utils/performance.ts`
- Image optimization utilities

### Accessibility

- A11y props generators in `utils/accessibility.ts`
- Color contrast validation
- Touch target size helpers
- Screen reader support

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Run tests
npm test

# Type check
npx tsc --noEmit
```

## Testing

Tests are located alongside source files in `__tests__/` directories:

- Unit tests for hooks and utilities
- Component tests with React Native Testing Library
- Integration tests for API flows

### Running Tests

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
npm test -- --testPathPattern="utils"  # Run specific tests
```

## Code Style

- ESLint for linting (comprehensive rules for React Native, TypeScript, imports)
- Prettier for formatting
- TypeScript strict mode enabled
- Import ordering enforced

### Linting Commands

```bash
npm run lint               # Check for issues
npm run lint:fix           # Auto-fix issues
npm run format             # Format code
npm run format:check       # Check formatting
```

## Validation Schemas

All API inputs are validated using Zod schemas defined in `utils/validation.ts`:

| Schema               | Purpose                                      |
| -------------------- | -------------------------------------------- |
| `loginSchema`        | User login validation                        |
| `registerSchema`     | User registration with password confirmation |
| `createMomentSchema` | Moment creation with location and images     |
| `sendMessageSchema`  | Message sending validation                   |
| `addCardSchema`      | Payment card validation                      |
| `reportSchema`       | User/content reporting                       |
| `feedbackSchema`     | App feedback submission                      |
| `disputeSchema`      | Transaction dispute filing                   |

## Utils Overview

| Utility            | Purpose                            |
| ------------------ | ---------------------------------- |
| `api.ts`           | Axios client with interceptors     |
| `apiMiddleware.ts` | Request validation & rate limiting |
| `errors.ts`        | Custom error classes               |
| `errorHandler.ts`  | Centralized error processing       |
| `validation.ts`    | Zod validation schemas             |
| `security.ts`      | Input sanitization & validation    |
| `rateLimiter.ts`   | Client-side rate limiting          |
| `logger.ts`        | Environment-aware logging          |
| `performance.ts`   | Debounce, throttle, memoization    |
| `accessibility.ts` | A11y helpers                       |
| `offline.ts`       | Network detection & caching        |
| `haptics.ts`       | Haptic feedback                    |

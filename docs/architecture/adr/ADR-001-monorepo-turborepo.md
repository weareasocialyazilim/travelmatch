# ADR-001: Monorepo with Turborepo

## Status

Accepted

## Date

December 2024

## Context

Lovendo consists of multiple applications (mobile, web, admin) and shared packages (design-system, shared utilities, monitoring). We needed to decide on a repository structure that would:

1. Enable code sharing across applications
2. Maintain consistent versioning and dependencies
3. Support efficient CI/CD pipelines
4. Allow independent team workflows
5. Scale as the codebase grows

### Options Considered

1. **Polyrepo**: Separate repositories for each application
2. **Monorepo with Lerna**: Traditional JavaScript monorepo tool
3. **Monorepo with Nx**: Enterprise monorepo solution
4. **Monorepo with Turborepo**: Modern build system for JavaScript/TypeScript

## Decision

We decided to use **Turborepo** as our monorepo build system with **pnpm** as the package manager.

### Repository Structure

```
lovendo/
├── apps/
│   ├── mobile/          # React Native + Expo
│   ├── web/             # Next.js
│   └── admin/           # React + Next.js
├── packages/
│   ├── shared/          # Shared utilities and types
│   ├── design-system/   # UI components
│   └── monitoring/      # Observability utilities
├── services/
│   ├── job-queue/       # Background workers
│   └── payment/         # Payment processing
├── turbo.json           # Turborepo configuration
└── pnpm-workspace.yaml  # pnpm workspace config
```

### Configuration

```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {
      "outputs": []
    }
  },
  "remoteCache": {
    "enabled": true
  }
}
```

## Consequences

### Positive

1. **Code Sharing**: TypeScript types, validation schemas, and utilities are shared across all apps
2. **Atomic Changes**: Cross-package changes are committed together
3. **Faster Builds**: Turborepo's caching reduces CI time by 60-80%
4. **Dependency Consistency**: Single lockfile ensures consistent versions
5. **Developer Experience**: One clone, one install, unified tooling

### Negative

1. **Learning Curve**: Team needs to understand workspace concepts
2. **CI Complexity**: Requires understanding of task dependencies
3. **Repository Size**: Single repo grows larger over time
4. **Partial Failures**: One broken package can affect others

### Neutral

1. **Migration Path**: Existing polyrepo can be migrated incrementally
2. **IDE Support**: Most modern IDEs handle monorepos well
3. **Git History**: Single history for all packages

## Related

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo Documentation](https://turbo.build/repo/docs)

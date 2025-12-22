# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the TravelMatch platform.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## ADR Template

Each ADR follows this template:
- **Title**: Short descriptive title
- **Status**: Proposed | Accepted | Deprecated | Superseded
- **Context**: What is the issue we're facing?
- **Decision**: What have we decided to do?
- **Consequences**: What are the results of this decision?

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](./ADR-001-monorepo-turborepo.md) | Monorepo with Turborepo | Accepted | Dec 2024 |
| [ADR-002](./ADR-002-supabase-backend.md) | Supabase as Backend | Accepted | Dec 2024 |
| [ADR-003](./ADR-003-react-native-expo.md) | React Native with Expo | Accepted | Dec 2024 |
| [ADR-004](./ADR-004-zustand-state-management.md) | Zustand for State Management | Accepted | Dec 2024 |
| [ADR-005](./ADR-005-row-level-security.md) | Row Level Security Strategy | Accepted | Dec 2024 |

## How to Create a New ADR

1. Copy the template below
2. Create a new file: `ADR-NNN-short-title.md`
3. Fill in the sections
4. Update this index
5. Submit for review

### Template

```markdown
# ADR-NNN: Title

## Status

Proposed | Accepted | Deprecated | Superseded by [ADR-XXX]

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?

### Positive
- Benefit 1
- Benefit 2

### Negative
- Trade-off 1
- Trade-off 2

### Neutral
- Observation 1
```

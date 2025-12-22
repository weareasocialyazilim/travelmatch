# TravelMatch Architecture Documentation

Welcome to the TravelMatch architecture documentation. This directory contains comprehensive documentation of the system architecture, design decisions, and technical specifications.

## Quick Links

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Main architecture overview |
| [C4_MODEL.md](./C4_MODEL.md) | C4 model diagrams (Context, Container, Component) |
| [DATA_ARCHITECTURE.md](./DATA_ARCHITECTURE.md) | Database design and data flows |
| [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) | Security controls and compliance |

## Architecture Decision Records (ADRs)

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](./adr/ADR-001-monorepo-turborepo.md) | Monorepo with Turborepo | Accepted |
| [ADR-002](./adr/ADR-002-supabase-backend.md) | Supabase as Backend | Accepted |
| [ADR-003](./adr/ADR-003-react-native-expo.md) | React Native with Expo | Accepted |
| [ADR-004](./adr/ADR-004-zustand-state-management.md) | Zustand for State Management | Accepted |
| [ADR-005](./adr/ADR-005-row-level-security.md) | Row Level Security Strategy | Accepted |

## Directory Structure

```
docs/architecture/
├── README.md                    # This file
├── ARCHITECTURE.md              # Main architecture document
├── C4_MODEL.md                  # C4 model with Mermaid diagrams
├── DATA_ARCHITECTURE.md         # Database and data flow documentation
├── SECURITY_ARCHITECTURE.md     # Security architecture
├── adr/                         # Architecture Decision Records
│   ├── README.md               # ADR index and template
│   ├── ADR-001-*.md            # Monorepo decision
│   ├── ADR-002-*.md            # Backend decision
│   ├── ADR-003-*.md            # Mobile framework decision
│   ├── ADR-004-*.md            # State management decision
│   └── ADR-005-*.md            # Security decision
└── diagrams/                    # Additional diagrams (if needed)
```

## How to Use This Documentation

1. **New developers**: Start with [ARCHITECTURE.md](./ARCHITECTURE.md) for an overview
2. **Understanding data**: Read [DATA_ARCHITECTURE.md](./DATA_ARCHITECTURE.md)
3. **Security review**: Check [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md)
4. **Why decisions were made**: Browse the [ADRs](./adr/)

## Viewing Diagrams

All diagrams use Mermaid syntax, which renders automatically on GitHub. For local viewing:

- **VS Code**: Install the "Mermaid Markdown Preview" extension
- **CLI**: Use `mmdc` from mermaid-cli: `npm install -g @mermaid-js/mermaid-cli`

## Contributing

When making architectural changes:

1. Update relevant documentation
2. Create an ADR for significant decisions
3. Keep diagrams in sync with code
4. Review with the team before merging

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 2024 | Initial architecture documentation |

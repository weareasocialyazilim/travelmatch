# Lovendo Terminology

## Moment Lifecycle States

| State             | Description                    | Allowed Transitions              |
| ----------------- | ------------------------------ | -------------------------------- |
| `draft`           | Moment being created           | → `active`                       |
| `active`          | Published and discoverable     | → `claimed`, `cancelled`         |
| `claimed`         | User committed to consume      | → `consumed`, `cancelled`        |
| `consumed`        | Experience occurred            | → `proof_submitted`              |
| `proof_submitted` | Proof uploaded, pending review | → `approved`, `rejected`         |
| `approved`        | Proof verified                 | → `completed`                    |
| `rejected`        | Proof denied (can resubmit)    | → `proof_submitted`, `cancelled` |
| `completed`       | Full cycle done                | Terminal                         |
| `cancelled`       | Cancelled at any stage         | Terminal                         |

## Price Tiers (USD Equivalent)

| Tier   | Range  | Escrow Rule      | Chat Rule              |
| ------ | ------ | ---------------- | ---------------------- |
| Tier 0 | 0-30   | No escrow        | No chat                |
| Tier 1 | 30-100 | Optional escrow  | Host approval required |
| Tier 2 | 100+   | Mandatory escrow | Premium + approval     |

## Trust Score Levels

| Level      | Score Range | Description    |
| ---------- | ----------- | -------------- |
| Sprout     | 0-29        | New user       |
| Growing    | 30-49       | Established    |
| Blooming   | 50-69       | Trusted        |
| Vibrant    | 70-89       | Highly trusted |
| Ambassador | 90-100      | Top tier       |

## Membership Plans

Plan features are defined in `apps/mobile/src/features/payments/constants/plans.ts`:

- Free: Basic browse, limited filters
- Premium: Unlimited filters, location change, priority support

## Gift Types

- **Direct Gift**: 0-30 tier, no escrow
- **Escrow Gift**: 100+ tier, mandatory escrow

## NOT IMPLEMENTED

- Voice/video messaging
- Trip/reservation booking
- Crowdfunding/pledges
- AI-generated content
- Automatic matching/recommendations

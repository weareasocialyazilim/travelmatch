# TravelMatch Admin Dashboard - Implementation Plan

## Executive Summary

**Status**: 75% Complete → Target: 100% Enterprise-Ready
**Quality Standard**: META, TESLA, NVIDIA, Canva, Airbnb
**Timeline**: Prioritized by business impact

---

## Current State Analysis

### Audit Results

| Category | Status | Score |
|----------|--------|-------|
| Functional Completeness | 75% | B |
| API Integration | 85% | B+ |
| Design Consistency | 60% | C |
| Dark Mode Support | 80% | B |
| UX/Navigation | 70% | C+ |
| Error Handling | 90% | A- |
| Real-time Features | 85% | B+ |

### Critical Issues Identified

1. **fraud-investigation** - 100% mock data, no real functionality
2. **wallet-operations** - Payment processing not connected
3. **disputes** - "İncele" button non-functional
4. **support** - Message sending doesn't work
5. **Design System** - Mixed Canva + shadcn components
6. **Dark Mode** - 15-20 files with hardcoded colors

---

## Implementation Roadmap

### Phase 1: Critical Fixes (P0) - Immediate

#### 1.1 Fraud Investigation Hub
- [x] Create `use-fraud.ts` hook with full CRUD
- [ ] Update `fraud-investigation/page.tsx` to use real hooks
- [ ] Implement case assignment workflow
- [ ] Add evidence upload functionality
- [ ] Connect linked accounts detection

**Files to update:**
```
apps/admin/src/app/(dashboard)/fraud-investigation/page.tsx
apps/admin/src/hooks/use-fraud.ts ✓
```

#### 1.2 Wallet Operations
- [x] Create `use-wallet-operations.ts` hook
- [ ] Update `wallet-operations/page.tsx` to use real hooks
- [ ] Implement PayTR integration for payouts
- [ ] Add KYC document viewer modal
- [ ] Implement bulk payout processing

**Files to update:**
```
apps/admin/src/app/(dashboard)/wallet-operations/page.tsx
apps/admin/src/hooks/use-wallet-operations.ts ✓
```

### Phase 2: High Priority Fixes (P1) - Week 1-2

#### 2.1 Disputes Detail View
- [ ] Create dispute detail modal/drawer
- [ ] Implement real dispute resolution flow
- [ ] Add evidence attachment support
- [ ] Connect to notification system

#### 2.2 Support Ticketing
- [ ] Fix message sending functionality
- [ ] Implement canned response insertion
- [ ] Add file attachment support
- [ ] Real-time message updates

#### 2.3 Team Management
- [ ] Replace mock data with `useAdminUsers()` hook
- [ ] Implement role management
- [ ] Add shift scheduling backend
- [ ] Connect performance metrics

### Phase 3: Design Standardization (P2) - Week 2-3

#### 3.1 Component Migration
Replace all shadcn/ui components with Canva equivalents:

| shadcn Component | Canva Replacement | Files Affected |
|-----------------|-------------------|----------------|
| Card | CanvaCard | ~20 files |
| Button | CanvaButton | ~15 files |
| Badge | CanvaBadge | ~12 files |
| Input | CanvaInput | ~10 files |

#### 3.2 Color Standardization
Replace hardcoded colors with design tokens:

```css
/* Before */
text-red-500, bg-red-100, text-green-600

/* After */
text-destructive, bg-destructive/10, text-success
```

**Priority files:**
1. `ceo-briefing/page.tsx` - 18+ instances
2. `system-health/page.tsx` - 15+ instances
3. `analytics/page.tsx` - Chart colors
4. `safety-hub/page.tsx` - Extensive usage

#### 3.3 Dark Mode Completion
Add dark mode variants to all remaining files:

```tsx
/* Pattern */
className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
```

### Phase 4: UX Enhancements (P3) - Week 3-4

#### 4.1 Navigation Improvements
- [ ] Add breadcrumbs to all detail pages
- [ ] Implement keyboard shortcuts
- [ ] Add command palette (Cmd+K)
- [ ] Quick search across all modules

#### 4.2 Loading States
- [ ] Add skeleton loaders to all stat cards
- [ ] Implement optimistic updates consistently
- [ ] Add progress indicators for long operations

#### 4.3 Error Boundaries
- [ ] Consistent error UI across all pages
- [ ] Retry functionality on failures
- [ ] Graceful degradation messaging

---

## Technical Implementation Details

### New Hooks Created

#### use-fraud.ts
```typescript
// Exports:
- useFraudStats()           // Dashboard stats
- useFraudCases(filters)    // Case list with filtering
- useFraudCase(caseId)      // Single case detail
- useFraudEvidence(caseId)  // Evidence for a case
- useLinkedAccounts(caseId) // Connected accounts
- useUpdateFraudCase()      // Update case mutation
- useResolveFraudCase()     // Resolve with action
- useAssignFraudCase()      // Assign to admin
- useAddFraudEvidence()     // Add evidence
```

#### use-wallet-operations.ts
```typescript
// Exports:
- useWalletStats()          // Dashboard stats
- usePayoutRequests(filters) // Payout queue
- useKYCVerifications(filters) // KYC queue
- useTopWallets(limit)      // Top wallet balances
- useProcessPayout()        // Approve/reject payout
- useBulkProcessPayouts()   // Bulk processing
- useVerifyKYC()            // Approve/reject KYC
- useWalletTransaction()    // Manual adjustment
```

### Database Tables Required

```sql
-- Fraud Investigation
CREATE TABLE fraud_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'investigating', 'resolved', 'escalated')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  type TEXT NOT NULL,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_to UUID REFERENCES admin_users(id),
  suspect_id UUID REFERENCES users(id),
  suspect_name TEXT,
  suspect_email TEXT,
  description TEXT,
  evidence_count INT DEFAULT 0,
  linked_accounts INT DEFAULT 0,
  total_amount_involved DECIMAL(12,2) DEFAULT 0,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE fraud_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES fraud_cases(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  metadata JSONB DEFAULT '{}',
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES admin_users(id)
);

CREATE TABLE linked_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES fraud_cases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  user_email TEXT,
  connection_type TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0,
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet Operations
CREATE TABLE payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  user_email TEXT,
  user_avatar TEXT,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'TRY',
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  payout_method TEXT NOT NULL,
  bank_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES admin_users(id),
  failure_reason TEXT,
  transaction_id TEXT
);

CREATE TABLE kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  user_email TEXT,
  user_avatar TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'expired')),
  document_type TEXT NOT NULL,
  document_front_url TEXT NOT NULL,
  document_back_url TEXT,
  selfie_url TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES admin_users(id),
  rejection_reason TEXT,
  verification_notes TEXT,
  ai_confidence_score DECIMAL(3,2),
  ai_flags TEXT[] DEFAULT '{}'
);
```

---

## Design System Standards (Canva)

### Component Hierarchy

```
CanvaCard
├── CanvaCardHeader
│   ├── CanvaCardTitle
│   └── CanvaCardSubtitle
├── CanvaCardBody
└── CanvaCardFooter

CanvaStatCard (specialized)
├── label (string)
├── value (string | number)
├── change ({ value, label })
└── icon (ReactNode)

CanvaButton
├── variant: primary | secondary | outline | ghost | success | danger
├── size: sm | md | lg
└── iconOnly: boolean

CanvaBadge / CanvaStatusBadge
├── variant: default | primary | success | warning | error
└── children
```

### Color Tokens

```css
/* Semantic Colors - Use These */
--color-primary: #F59E0B       /* Actions, CTAs */
--color-secondary: #EC4899     /* Emotion, Highlights */
--color-accent: #14B8A6        /* Discovery */
--color-trust: #10B981         /* Success, Reliability */
--color-destructive: #EF4444   /* Errors, Danger */

/* Status Colors */
--color-status-active: var(--color-trust)
--color-status-pending: #F59E0B
--color-status-suspended: #F97316
--color-status-banned: var(--color-destructive)

/* Usage Pattern */
className="text-destructive bg-destructive/10 dark:bg-destructive/20"
```

### Spacing Scale

```css
--space-1: 4px    /* xs */
--space-2: 8px    /* sm */
--space-3: 12px
--space-4: 16px   /* md - default */
--space-5: 20px
--space-6: 24px   /* lg */
--space-8: 32px   /* xl */
--space-10: 40px
--space-12: 48px  /* 2xl */
```

---

## API Routes Checklist

### Existing Routes (Complete)
- [x] /api/users - Full CRUD
- [x] /api/disputes - Full CRUD
- [x] /api/campaigns - CRUD
- [x] /api/promos - Full CRUD
- [x] /api/feature-flags - Full CRUD
- [x] /api/analytics - Read
- [x] /api/finance - Read
- [x] /api/audit-logs - Read
- [x] /api/security/* - 2FA, sessions

### Routes to Create
- [ ] /api/fraud-cases - Full CRUD
- [ ] /api/fraud-evidence - CRUD
- [ ] /api/linked-accounts - Read
- [ ] /api/payout-requests - CRUD
- [ ] /api/kyc-verifications - CRUD
- [ ] /api/wallet-transactions - CRUD
- [ ] /api/pricing-tiers - CRUD

---

## Testing Checklist

### Functional Testing
- [ ] All buttons trigger expected actions
- [ ] All forms submit to real APIs
- [ ] All tables load real data
- [ ] Pagination works correctly
- [ ] Search/filter works correctly
- [ ] Real-time updates received

### Visual Testing
- [ ] Light mode renders correctly
- [ ] Dark mode renders correctly
- [ ] Mobile responsive layout
- [ ] Consistent spacing
- [ ] Consistent typography

### Error Handling
- [ ] API failures show user-friendly messages
- [ ] Network errors have retry options
- [ ] Invalid inputs show validation errors
- [ ] Empty states display properly

---

## Success Metrics

### Before Implementation
- Functional Completeness: 75%
- API Integration: 85%
- Design Consistency: 60%
- User Satisfaction: Unknown

### After Implementation (Target)
- Functional Completeness: 100%
- API Integration: 100%
- Design Consistency: 95%
- User Satisfaction: 4.5/5

---

## Team Assignments

| Task | Owner | Deadline |
|------|-------|----------|
| Fraud Investigation | Backend + Frontend | Week 1 |
| Wallet Operations | Backend + Frontend | Week 1 |
| Disputes Enhancement | Frontend | Week 2 |
| Support Enhancement | Frontend | Week 2 |
| Design Standardization | UI/UX | Week 2-3 |
| Dark Mode Completion | Frontend | Week 2 |
| Testing & QA | QA Team | Week 3-4 |

---

## Sign-off

**CEO Approval**: Pending
**CMO Approval**: Pending
**Tech Lead Approval**: Pending

---

*Document Version: 1.0*
*Last Updated: January 13, 2026*
*Generated by: TravelMatch Engineering Team*

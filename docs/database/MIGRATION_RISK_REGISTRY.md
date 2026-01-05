# Migration Risk Registry

> **Purpose**: Operational reference for migration risk assessment and rollback procedures
> **Last Updated**: 2026-01-03

## Risk Level Definitions

| Risk | Impact | Rollback Time | Examples |
|------|--------|---------------|----------|
| **LOW** | No data loss, additive changes | < 1 min | Add column, create index, add table |
| **MEDIUM** | Requires data backup, schema changes | 1-5 min | Modify column type, restructure table |
| **HIGH** | Potential data loss, requires downtime | > 5 min | Drop table, remove column with data |

## Migration Risk Assessment

### Critical Infrastructure (HIGH Risk)

| Migration | Risk | Rollback Procedure |
|-----------|------|-------------------|
| `20241205000000_initial_schema.sql` | HIGH | Full DB restore from backup |
| `20251213000002_escrow_system_backend.sql` | HIGH | `DROP TABLE escrow_transactions CASCADE` |
| `20251229000000_commission_system.sql` | HIGH | `DROP TABLE commission_tiers CASCADE` |
| `20251229200000_multi_currency_system.sql` | HIGH | `DROP TABLE exchange_rates CASCADE` |

### Security & RLS (MEDIUM Risk)

| Migration | Risk | Rollback Procedure |
|-----------|------|-------------------|
| `20241205000002_enable_rls.sql` | MEDIUM | `ALTER TABLE x DISABLE ROW LEVEL SECURITY` |
| `20251206000001_strict_security.sql` | MEDIUM | Restore previous policies |
| `20251213000001_strict_rls_policies.sql` | MEDIUM | Drop new policies, restore old |
| `20251217100000_critical_security_fixes.sql` | MEDIUM | Restore previous function definitions |
| `20251218150000_security_definer_audit.sql` | MEDIUM | Restore previous function definitions |
| `20251219000002_defcon1_security_fixes.sql` | MEDIUM | Restore previous policies |
| `20260102000001_critical_security_fixes.sql` | LOW | No functional changes, security only |
| `20260102000004_consolidate_policies.sql` | MEDIUM | Restore individual policies from backup |

### Performance Optimizations (LOW Risk)

| Migration | Risk | Rollback Procedure |
|-----------|------|-------------------|
| `20241205000001_add_indexes.sql` | LOW | `DROP INDEX idx_name` |
| `20251209000004_mobile_optimizations.sql` | LOW | Drop added indexes |
| `20251218140000_cleanup_duplicate_indexes.sql` | LOW | Recreate removed indexes |
| `20251220000001_gist_indexes.sql` | LOW | `DROP INDEX gist_idx_name` |
| `20251228100000_additional_composite_indexes.sql` | LOW | Drop composite indexes |
| `20260102000002_rls_performance_fixes.sql` | LOW | Restore previous RLS policies |
| `20260102000003_cleanup_duplicate_indexes.sql` | LOW | Recreate removed indexes |

### Feature Additions (MEDIUM Risk)

| Migration | Risk | Rollback Procedure |
|-----------|------|-------------------|
| `20251206000000_add_subscriptions.sql` | MEDIUM | `DROP TABLE subscriptions` |
| `20251209000000_add_kyc_verifications.sql` | MEDIUM | `DROP TABLE kyc_verifications` |
| `20251217000000_add_blurhash_support.sql` | LOW | `ALTER TABLE DROP COLUMN blurhash` |
| `20251217000001_create_proof_verifications.sql` | MEDIUM | `DROP TABLE proof_verifications` |
| `20251222210000_add_username_column.sql` | LOW | `ALTER TABLE users DROP COLUMN username` |
| `20251228500000_create_gifts_table.sql` | MEDIUM | `DROP TABLE gifts CASCADE` |
| `20251229000003_dynamic_proof_system.sql` | MEDIUM | Drop proof-related tables |
| `20251229100000_trust_notes.sql` | MEDIUM | `DROP TABLE trust_notes` |
| `20251231100000_admin_campaign_tables.sql` | MEDIUM | Drop campaign tables |

### Bug Fixes & Maintenance (LOW Risk)

| Migration | Risk | Rollback Procedure |
|-----------|------|-------------------|
| `20251209150000_fix_security_definer_search_path.sql` | LOW | Restore original functions |
| `20251209170000_fix_remaining_lint_errors.sql` | LOW | No rollback needed |
| `20251210000000_fix_notification_functions.sql` | LOW | Restore original functions |
| `20251211000000_fix_conversation_functions.sql` | LOW | Restore original functions |
| `20251218000000_fix_lints.sql` | LOW | No rollback needed |
| `20251218120000_health_check_fixes.sql` | LOW | Restore original functions |
| `20251218160000_linter_fixes.sql` | LOW | No rollback needed |
| `20251219100000_fix_linter_issues.sql` | LOW | No rollback needed |

## Emergency Rollback Procedure

### 1. Identify the Problem Migration
```bash
supabase db dump --local > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Execute Rollback
```sql
BEGIN;
-- Execute rollback commands from registry
COMMIT;
```

### 3. Verify Rollback
```bash
supabase db lint
supabase db push --dry-run
```

### 4. Document Incident
- Record the issue in incident log
- Update risk registry if needed
- Create follow-up fix migration

## Pre-Deployment Checklist

- [ ] Migration tested on local environment
- [ ] Rollback procedure documented
- [ ] Risk level assessed
- [ ] Database backup taken
- [ ] Staging environment verified
- [ ] Deployment window scheduled (for HIGH risk)

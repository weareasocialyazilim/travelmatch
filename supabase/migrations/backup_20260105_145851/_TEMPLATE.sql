-- ============================================================================
-- MIGRATION: [Title]
-- ============================================================================
-- Date: YYYY-MM-DD
-- Author: [author]
-- RISK: LOW | MEDIUM | HIGH
-- ROLLBACK: DROP TABLE x; | ALTER TABLE x DROP COLUMN y; | See rollback section
-- ============================================================================
--
-- Purpose:
-- [Brief description of what this migration does]
--
-- Changes:
-- 1. [Change 1]
-- 2. [Change 2]
--
-- Dependencies:
-- - [Previous migration or table it depends on]
--
-- Testing:
-- - [ ] Tested on local
-- - [ ] Tested on staging
-- - [ ] Performance impact verified
--
-- ============================================================================

BEGIN;

-- Your migration SQL here

COMMIT;

-- ============================================================================
-- ROLLBACK SECTION (Keep for emergencies)
-- ============================================================================
-- To rollback this migration, run the following commands:
--
-- BEGIN;
-- -- Rollback commands here
-- COMMIT;
-- ============================================================================

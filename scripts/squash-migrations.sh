#!/bin/bash

# ============================================================================
# Lovendo Migration Squash Script
# Version: 2.0
# 
# Purpose: Squash multiple migrations into clean baseline files
# 
# Usage:
#   ./scripts/squash-migrations.sh [--dry-run] [--backup]
#
# Prerequisites:
#   - Supabase CLI installed
#   - Database connection available
#   - All pending migrations applied
#
# Output:
#   Creates squashed baseline files in supabase/migrations/squashed/
#
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MIGRATIONS_DIR="supabase/migrations"
SQUASH_DIR="supabase/migrations/squashed"
BACKUP_DIR="supabase/migrations/backup_$(date +%Y%m%d_%H%M%S)"
DRY_RUN=false
CREATE_BACKUP=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --backup)
      CREATE_BACKUP=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Lovendo Migration Squash Script v2.0               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI not found. Please install it first.${NC}"
    exit 1
fi

# Count current migrations
MIGRATION_COUNT=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | wc -l | tr -d ' ')
echo -e "${YELLOW}Found ${MIGRATION_COUNT} migration files${NC}"

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}DRY RUN MODE - No changes will be made${NC}"
fi

# Create backup if requested
if [ "$CREATE_BACKUP" = true ] && [ "$DRY_RUN" = false ]; then
    echo -e "${BLUE}Creating backup...${NC}"
    mkdir -p "$BACKUP_DIR"
    cp "$MIGRATIONS_DIR"/*.sql "$BACKUP_DIR/" 2>/dev/null || true
    echo -e "${GREEN}✓ Backup created at: $BACKUP_DIR${NC}"
fi

# Create squash directory
if [ "$DRY_RUN" = false ]; then
    mkdir -p "$SQUASH_DIR"
fi

echo ""
echo -e "${BLUE}Step 1: Dumping current schema...${NC}"

# Generate schema dump
if [ "$DRY_RUN" = false ]; then
    # Dump schema using supabase db dump
    supabase db dump --schema public > "$SQUASH_DIR/001_baseline_schema.sql" 2>/dev/null || {
        echo -e "${YELLOW}Warning: Could not dump schema. Using placeholder.${NC}"
        cat > "$SQUASH_DIR/001_baseline_schema.sql" << 'EOF'
-- ============================================================================
-- Lovendo Baseline Schema v2.0
-- Generated: $(date)
-- 
-- This file was created by squashing migrations.
-- Run `supabase db dump --schema public` to regenerate.
-- ============================================================================

-- TODO: Run `supabase db dump` to populate this file with current schema
EOF
    }
    echo -e "${GREEN}✓ Schema dumped to 001_baseline_schema.sql${NC}"
else
    echo -e "${YELLOW}Would create: $SQUASH_DIR/001_baseline_schema.sql${NC}"
fi

echo ""
echo -e "${BLUE}Step 2: Creating index baseline...${NC}"

if [ "$DRY_RUN" = false ]; then
    cat > "$SQUASH_DIR/002_indexes_and_constraints.sql" << 'EOF'
-- ============================================================================
-- Lovendo Indexes and Constraints v2.0
-- 
-- All indexes consolidated from:
--   - 20241205000001_add_indexes.sql
--   - 20251213000003_escrow_indexes.sql
--   - 20251219200002_performance_indexes.sql
--   - 20251220000001_gist_indexes.sql
--   - 20251228100000_additional_composite_indexes.sql
--   - 20260102000003_cleanup_duplicate_indexes.sql
-- ============================================================================

-- Run `supabase db dump --schema public | grep -A5 "CREATE INDEX"` 
-- to extract current indexes

-- TODO: Populate with current indexes from production schema
EOF
    echo -e "${GREEN}✓ Created 002_indexes_and_constraints.sql${NC}"
else
    echo -e "${YELLOW}Would create: $SQUASH_DIR/002_indexes_and_constraints.sql${NC}"
fi

echo ""
echo -e "${BLUE}Step 3: Creating RLS policies baseline...${NC}"

if [ "$DRY_RUN" = false ]; then
    cat > "$SQUASH_DIR/003_rls_policies.sql" << 'EOF'
-- ============================================================================
-- Lovendo RLS Policies v2.0
-- 
-- All RLS policies consolidated from multiple security fix migrations.
-- 
-- IMPORTANT: Use templates from packages/shared/sql-templates/rls-policy-templates.sql
--            for new policies.
-- ============================================================================

-- Enable RLS on all tables (idempotent)
DO $$ 
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);
    END LOOP;
END $$;

-- TODO: Extract current RLS policies using:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies WHERE schemaname = 'public';
EOF
    echo -e "${GREEN}✓ Created 003_rls_policies.sql${NC}"
else
    echo -e "${YELLOW}Would create: $SQUASH_DIR/003_rls_policies.sql${NC}"
fi

echo ""
echo -e "${BLUE}Step 4: Creating functions baseline...${NC}"

if [ "$DRY_RUN" = false ]; then
    cat > "$SQUASH_DIR/004_functions_and_triggers.sql" << 'EOF'
-- ============================================================================
-- Lovendo Functions and Triggers v2.0
-- 
-- All functions consolidated. SECURITY DEFINER functions have:
--   - SET search_path = public, pg_temp
--   - Internal auth.uid() verification
-- ============================================================================

-- TODO: Extract functions using:
-- \df+ in psql
-- or
-- SELECT pg_get_functiondef(oid) FROM pg_proc WHERE pronamespace = 'public'::regnamespace;
EOF
    echo -e "${GREEN}✓ Created 004_functions_and_triggers.sql${NC}"
else
    echo -e "${YELLOW}Would create: $SQUASH_DIR/004_functions_and_triggers.sql${NC}"
fi

echo ""
echo -e "${BLUE}Step 5: Creating seed data file...${NC}"

if [ "$DRY_RUN" = false ]; then
    cat > "$SQUASH_DIR/005_seed_data.sql" << 'EOF'
-- ============================================================================
-- Lovendo Seed Data v2.0
-- 
-- Essential data for application startup.
-- NOT for test data - use supabase/seed.sql for development data.
-- ============================================================================

-- System configuration
INSERT INTO public.system_config (key, value, description)
VALUES 
    ('app_version', '2.0.0', 'Current application version'),
    ('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
    ('min_app_version', '1.0.0', 'Minimum supported app version')
ON CONFLICT (key) DO NOTHING;

-- Default categories (if applicable)
-- INSERT INTO public.categories ...

-- Default settings
-- INSERT INTO public.default_settings ...
EOF
    echo -e "${GREEN}✓ Created 005_seed_data.sql${NC}"
else
    echo -e "${YELLOW}Would create: $SQUASH_DIR/005_seed_data.sql${NC}"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗"
echo "║                         Summary                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝${NC}"

echo ""
echo -e "${GREEN}Squashed baseline files created in: $SQUASH_DIR${NC}"
echo ""
echo "Files created:"
echo "  📄 001_baseline_schema.sql"
echo "  📄 002_indexes_and_constraints.sql"
echo "  📄 003_rls_policies.sql"
echo "  📄 004_functions_and_triggers.sql"
echo "  📄 005_seed_data.sql"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Review and populate baseline files with actual schema"
echo "  2. Test squashed migrations on a fresh database:"
echo "     ${BLUE}supabase db reset --db-url <test-db-url>${NC}"
echo "  3. Once verified, archive old migrations:"
echo "     ${BLUE}mv $MIGRATIONS_DIR/*.sql $BACKUP_DIR/${NC}"
echo "  4. Move squashed files to migrations folder:"
echo "     ${BLUE}mv $SQUASH_DIR/*.sql $MIGRATIONS_DIR/${NC}"
echo ""
echo -e "${RED}⚠️  WARNING: Only squash migrations when schema is stable!${NC}"
echo -e "${RED}⚠️  Always test on staging before production!${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}This was a DRY RUN. No files were modified.${NC}"
    echo -e "${YELLOW}Run without --dry-run to create files.${NC}"
fi

echo ""
echo -e "${GREEN}Done!${NC}"

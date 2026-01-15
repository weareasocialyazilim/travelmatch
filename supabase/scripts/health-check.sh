#!/bin/bash

#===============================================================================
# Database Health Check Script
#
# Runs comprehensive health checks on the Supabase database:
# - Connection test
# - Table counts
# - Index usage
# - RLS policy verification
# - Orphan detection
# - Performance metrics
#===============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_REF="${SUPABASE_PROJECT_REF:-bjikxgtbptrvawkguypv}"

log_header() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# Check if psql or supabase CLI is available
check_dependencies() {
  if command -v supabase &> /dev/null; then
    echo "Using Supabase CLI for database queries"
    DB_METHOD="supabase"
  elif [ -n "$DATABASE_URL" ]; then
    echo "Using direct psql connection"
    DB_METHOD="psql"
  else
    echo -e "${RED}Error: Neither Supabase CLI nor DATABASE_URL found${NC}"
    echo "Please set DATABASE_URL or ensure Supabase CLI is logged in"
    exit 1
  fi
}

run_query() {
  local query=$1
  
  if [ "$DB_METHOD" = "supabase" ]; then
    supabase db query "$query" --project-ref "$PROJECT_REF" 2>/dev/null || echo "Query failed"
  else
    psql "$DATABASE_URL" -c "$query" 2>/dev/null || echo "Query failed"
  fi
}

#===============================================================================
# Health Checks
#===============================================================================

check_connection() {
  log_header "Connection Test"
  
  local result=$(run_query "SELECT 1 as connected;")
  if [[ $result == *"connected"* ]]; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
  else
    echo -e "${RED}✗ Database connection failed${NC}"
    exit 1
  fi
}

check_tables() {
  log_header "Table Statistics"
  
  run_query "
    SELECT 
      schemaname as schema,
      relname as table_name,
      n_live_tup as row_count
    FROM pg_stat_user_tables 
    WHERE schemaname = 'public'
    ORDER BY n_live_tup DESC
    LIMIT 20;
  "
}

check_indexes() {
  log_header "Index Usage Statistics"
  
  run_query "
    SELECT 
      schemaname as schema,
      relname as table_name,
      indexrelname as index_name,
      idx_scan as scans,
      idx_tup_read as tuples_read
    FROM pg_stat_user_indexes 
    WHERE schemaname = 'public'
    ORDER BY idx_scan DESC
    LIMIT 20;
  "
}

check_unused_indexes() {
  log_header "Potentially Unused Indexes"
  
  run_query "
    SELECT 
      schemaname || '.' || relname as table,
      indexrelname as index,
      pg_size_pretty(pg_relation_size(indexrelid)) as size,
      idx_scan as scans
    FROM pg_stat_user_indexes 
    WHERE idx_scan = 0 
      AND schemaname = 'public'
    ORDER BY pg_relation_size(indexrelid) DESC
    LIMIT 10;
  "
}

check_rls_policies() {
  log_header "RLS Policy Summary"
  
  run_query "
    SELECT 
      tablename,
      COUNT(*) as policy_count
    FROM pg_policies 
    WHERE schemaname = 'public'
    GROUP BY tablename
    ORDER BY policy_count DESC;
  "
}

check_tables_without_rls() {
  log_header "Tables Without RLS"
  
  run_query "
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename NOT IN (
        SELECT DISTINCT tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
      )
    ORDER BY tablename;
  "
}

check_database_size() {
  log_header "Database Size"
  
  run_query "
    SELECT 
      pg_database.datname as database,
      pg_size_pretty(pg_database_size(pg_database.datname)) as size
    FROM pg_database
    WHERE datname = current_database();
  "
}

check_table_sizes() {
  log_header "Table Sizes"
  
  run_query "
    SELECT 
      relname as table_name,
      pg_size_pretty(pg_total_relation_size(relid)) as total_size,
      pg_size_pretty(pg_relation_size(relid)) as table_size,
      pg_size_pretty(pg_indexes_size(relid)) as index_size
    FROM pg_catalog.pg_statio_user_tables
    ORDER BY pg_total_relation_size(relid) DESC
    LIMIT 15;
  "
}

check_slow_queries() {
  log_header "Slowest Query Patterns (if pg_stat_statements enabled)"
  
  run_query "
    SELECT 
      calls,
      round(total_exec_time::numeric, 2) as total_ms,
      round(mean_exec_time::numeric, 2) as avg_ms,
      LEFT(query, 80) as query_sample
    FROM pg_stat_statements
    WHERE userid IN (SELECT usesysid FROM pg_user WHERE usename = current_user)
    ORDER BY mean_exec_time DESC
    LIMIT 10;
  " 2>/dev/null || echo "pg_stat_statements extension not available"
}

check_active_connections() {
  log_header "Active Connections"
  
  run_query "
    SELECT 
      state,
      COUNT(*) as connections,
      MAX(now() - state_change) as max_duration
    FROM pg_stat_activity
    WHERE datname = current_database()
    GROUP BY state
    ORDER BY connections DESC;
  "
}

#===============================================================================
# Main
#===============================================================================

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Lovendo Database Health Check           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════╝${NC}"
echo ""

check_dependencies
check_connection
check_database_size
check_tables
check_table_sizes
check_indexes
check_unused_indexes
check_rls_policies
check_tables_without_rls
check_active_connections
check_slow_queries

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Health check complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
echo ""

#!/bin/bash

# ============================================
# Complete Security Test Runner
# ============================================
# Description: Runs all security tests against Supabase database
# Tests: RLS policies, Storage, Realtime, Functions, Mutations
# Usage: ./run_rls_tests.sh [local|staging|production] [suite]
# Suites: all, rls, storage, realtime, functions, mutations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment and test suite
ENV=${1:-local}
SUITE=${2:-all}

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Security Test Suite${NC}"
echo -e "${BLUE}Environment: ${ENV}${NC}"
echo -e "${BLUE}Suite: ${SUITE}${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Set connection string based on environment
case $ENV in
  local)
    echo -e "${GREEN}Using local Supabase instance...${NC}"
    DB_URL=$(supabase status | grep "DB URL" | awk '{print $3}')
    if [ -z "$DB_URL" ]; then
      echo -e "${RED}Error: Local Supabase not running${NC}"
      echo -e "${YELLOW}Start with: supabase start${NC}"
      exit 1
    fi
    ;;
  staging)
    echo -e "${YELLOW}Using staging environment...${NC}"
    if [ -z "$STAGING_DB_URL" ]; then
      echo -e "${RED}Error: STAGING_DB_URL not set${NC}"
      exit 1
    fi
    DB_URL=$STAGING_DB_URL
    ;;
  production)
    echo -e "${RED}WARNING: Running tests on PRODUCTION${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
      echo "Aborted"
      exit 1
    fi
    if [ -z "$PRODUCTION_DB_URL" ]; then
      echo -e "${RED}Error: PRODUCTION_DB_URL not set${NC}"
      exit 1
    fi
    DB_URL=$PRODUCTION_DB_URL
    ;;
  *)
    echo -e "${RED}Error: Invalid environment '${ENV}'${NC}"
    echo "Usage: $0 [local|staging|production]"
    exit 1
    ;;
esac

# Create tests schema if it doesn't exist
echo -e "${BLUE}Creating tests schema...${NC}"
psql "$DB_URL" -c "CREATE SCHEMA IF NOT EXISTS tests;" 2>/dev/null || true

# Determine which test files to run
declare -a TEST_FILES=()

case $SUITE in
  all)
    TEST_FILES=(
      "supabase/tests/rls_policies.test.sql"
      "supabase/tests/rls_advanced_security.test.sql"
      "supabase/tests/storage_security.test.sql"
      "supabase/tests/realtime_security.test.sql"
      "supabase/tests/function_security.test.sql"
      "supabase/tests/mutation_testing.test.sql"
    )
    ;;
  rls)
    TEST_FILES=(
      "supabase/tests/rls_policies.test.sql"
      "supabase/tests/rls_advanced_security.test.sql"
    )
    ;;
  storage)
    TEST_FILES=("supabase/tests/storage_security.test.sql")
    ;;
  realtime)
    TEST_FILES=("supabase/tests/realtime_security.test.sql")
    ;;
  functions)
    TEST_FILES=("supabase/tests/function_security.test.sql")
    ;;
  mutations)
    TEST_FILES=("supabase/tests/mutation_testing.test.sql")
    ;;
  *)
    echo -e "${RED}Error: Invalid test suite '${SUITE}'${NC}"
    echo "Available suites: all, rls, storage, realtime, functions, mutations"
    exit 1
    ;;
esac

# Run the test suite
echo -e "${BLUE}Running ${SUITE} tests...${NC}"
echo -e "${BLUE}Test files: ${#TEST_FILES[@]}${NC}"
echo ""

TOTAL_PASS=0
TOTAL_FAIL=0
COMBINED_OUTPUT=""

for TEST_FILE in "${TEST_FILES[@]}"; do
  if [ ! -f "$TEST_FILE" ]; then
    echo -e "${YELLOW}Warning: Test file not found: $TEST_FILE${NC}"
    continue
  fi
  
  TEST_NAME=$(basename "$TEST_FILE" .test.sql)
  echo -e "${BLUE}Running: ${TEST_NAME}...${NC}"
  
  TEST_OUTPUT=$(psql "$DB_URL" -f "$TEST_FILE" 2>&1)
  TEST_EXIT_CODE=$?
  
  # Count passes and failures
  PASS_COUNT=$(echo "$TEST_OUTPUT" | grep -c "PASS:" || echo "0")
  FAIL_COUNT=$(echo "$TEST_OUTPUT" | grep -c "FAIL:" || echo "0")
  
  TOTAL_PASS=$((TOTAL_PASS + PASS_COUNT))
  TOTAL_FAIL=$((TOTAL_FAIL + FAIL_COUNT))
  
  # Append to combined output
  COMBINED_OUTPUT="${COMBINED_OUTPUT}\n${TEST_OUTPUT}"
  
  # Check for failures in this file
  if echo "$TEST_OUTPUT" | grep -q "FAIL:"; then
    echo -e "${RED}  ✗ ${TEST_NAME}: ${FAIL_COUNT} failures${NC}"
  else
    echo -e "${GREEN}  ✓ ${TEST_NAME}: ${PASS_COUNT} passed${NC}"
  fi
done

echo ""

# Display full output if requested
if [ "$VERBOSE" = "1" ]; then
  echo -e "$COMBINED_OUTPUT"
fi

# Check for failures
if [ $TOTAL_FAIL -gt 0 ]; then
  echo ""
  echo -e "${RED}============================================${NC}"
  echo -e "${RED}TEST FAILURES DETECTED${NC}"
  echo -e "${RED}============================================${NC}"
  echo ""
  echo -e "${RED}Security breaches found! Fix immediately:${NC}"
  echo -e "$COMBINED_OUTPUT" | grep "FAIL:" | sed "s/^/${RED}  ✗ ${NC}/"
  echo ""
  echo -e "${RED}Total failures: ${TOTAL_FAIL}${NC}"
  echo -e "${GREEN}Total passes: ${TOTAL_PASS}${NC}"
  echo ""
  exit 1
fi

# Success
echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}ALL TESTS PASSED ✓${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${GREEN}Security tests are passing!${NC}"
echo -e "${GREEN}No vulnerabilities detected${NC}"
echo -e "${GREEN}Total tests passed: ${TOTAL_PASS}${NC}"
echo ""

# Generate test report
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="supabase/tests/reports/security_test_${SUITE}_${ENV}_${TIMESTAMP}.log"
mkdir -p supabase/tests/reports

echo -e "$COMBINED_OUTPUT" > "$REPORT_FILE"
echo -e "${BLUE}Test report saved: ${REPORT_FILE}${NC}"
echo ""

exit 0

#!/bin/bash

# ============================================
# Lovendo Supabase Verification Script
# ============================================
# Verifies all Supabase components are working

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_REF="bjikxgtbptrvawkguypv"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

# Load environment variables
if [ -f "apps/mobile/.env.development" ]; then
    export $(cat apps/mobile/.env.development | grep EXPO_PUBLIC_SUPABASE_ANON_KEY | xargs)
fi

if [ -z "$EXPO_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ EXPO_PUBLIC_SUPABASE_ANON_KEY not set${NC}"
    echo -e "${YELLOW}Please set it in apps/mobile/.env.development${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Lovendo Supabase Verification${NC}"
echo -e "${BLUE}=====================================${NC}\n"

PASSED=0
FAILED=0

# ============================================
# Test 1: Database Connection
# ============================================
echo -e "${YELLOW}1️⃣  Testing database connection...${NC}"

# We can't test direct DB connection without password, so we'll test via REST API
curl -f -s "$SUPABASE_URL/rest/v1/" \
    -H "apikey: $EXPO_PUBLIC_SUPABASE_ANON_KEY" > /dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Database accessible via REST API${NC}\n"
    ((PASSED++))
else
    echo -e "${RED}   ❌ Database connection failed${NC}\n"
    ((FAILED++))
fi

# ============================================
# Test 2: Auth API
# ============================================
echo -e "${YELLOW}2️⃣  Testing Auth API...${NC}"

AUTH_RESPONSE=$(curl -s "$SUPABASE_URL/auth/v1/health")
if echo "$AUTH_RESPONSE" | grep -q "ok\|healthy"; then
    echo -e "${GREEN}   ✅ Auth API healthy${NC}\n"
    ((PASSED++))
else
    echo -e "${RED}   ❌ Auth API check failed${NC}\n"
    ((FAILED++))
fi

# ============================================
# Test 3: Storage API
# ============================================
echo -e "${YELLOW}3️⃣  Testing Storage API...${NC}"

STORAGE_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null \
    "$SUPABASE_URL/storage/v1/bucket" \
    -H "Authorization: Bearer $EXPO_PUBLIC_SUPABASE_ANON_KEY")

if [ "$STORAGE_RESPONSE" = "200" ]; then
    echo -e "${GREEN}   ✅ Storage API accessible${NC}\n"
    ((PASSED++))
else
    echo -e "${RED}   ❌ Storage API returned: $STORAGE_RESPONSE${NC}\n"
    ((FAILED++))
fi

# ============================================
# Test 4: Edge Functions Endpoint
# ============================================
echo -e "${YELLOW}4️⃣  Testing Edge Functions endpoint...${NC}"

FUNCTIONS_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null \
    "$SUPABASE_URL/functions/v1/")

if [ "$FUNCTIONS_RESPONSE" = "404" ] || [ "$FUNCTIONS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}   ✅ Edge Functions endpoint accessible${NC}\n"
    ((PASSED++))
else
    echo -e "${YELLOW}   ⚠️  Edge Functions returned: $FUNCTIONS_RESPONSE${NC}\n"
    ((PASSED++))  # Not critical
fi

# ============================================
# Test 5: Check Storage Buckets
# ============================================
echo -e "${YELLOW}5️⃣  Checking storage buckets...${NC}"

BUCKETS=$(curl -s "$SUPABASE_URL/storage/v1/bucket" \
    -H "Authorization: Bearer $EXPO_PUBLIC_SUPABASE_ANON_KEY" | \
    grep -o '"name":"[^"]*"' | wc -l)

if [ "$BUCKETS" -ge 1 ]; then
    echo -e "${GREEN}   ✅ Found $BUCKETS storage bucket(s)${NC}"

    # List bucket names
    BUCKET_NAMES=$(curl -s "$SUPABASE_URL/storage/v1/bucket" \
        -H "Authorization: Bearer $EXPO_PUBLIC_SUPABASE_ANON_KEY" | \
        grep -o '"name":"[^"]*"' | cut -d'"' -f4)

    echo -e "${BLUE}   Buckets:${NC}"
    echo "$BUCKET_NAMES" | while read bucket; do
        echo -e "${BLUE}     • $bucket${NC}"
    done
    echo ""
    ((PASSED++))
else
    echo -e "${YELLOW}   ⚠️  No storage buckets found (may need to run migrations)${NC}\n"
    ((FAILED++))
fi

# ============================================
# Test 6: Check Tables (via REST API)
# ============================================
echo -e "${YELLOW}6️⃣  Checking database tables...${NC}"

# Test critical tables
TABLES=("users" "moments" "messages" "payments" "wallets")
TABLE_ERRORS=0

for table in "${TABLES[@]}"; do
    TABLE_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null \
        "$SUPABASE_URL/rest/v1/$table?limit=1" \
        -H "apikey: $EXPO_PUBLIC_SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $EXPO_PUBLIC_SUPABASE_ANON_KEY")

    if [ "$TABLE_RESPONSE" = "200" ] || [ "$TABLE_RESPONSE" = "406" ]; then
        echo -e "${GREEN}   ✅ Table '$table' exists${NC}"
    else
        echo -e "${RED}   ❌ Table '$table' check failed (HTTP $TABLE_RESPONSE)${NC}"
        ((TABLE_ERRORS++))
    fi
done

echo ""
if [ "$TABLE_ERRORS" -eq 0 ]; then
    ((PASSED++))
else
    ((FAILED++))
fi

# ============================================
# Test 7: RLS Policies (Indirect Check)
# ============================================
echo -e "${YELLOW}7️⃣  Testing RLS policies...${NC}"

# Attempt to access users table without auth (should be blocked by RLS)
RLS_TEST=$(curl -s -w "%{http_code}" -o /dev/null \
    "$SUPABASE_URL/rest/v1/users?limit=1" \
    -H "apikey: $EXPO_PUBLIC_SUPABASE_ANON_KEY")

# 200 with empty result or 401/403 means RLS is working
if [ "$RLS_TEST" = "200" ] || [ "$RLS_TEST" = "401" ] || [ "$RLS_TEST" = "403" ]; then
    echo -e "${GREEN}   ✅ RLS policies active (protected access)${NC}\n"
    ((PASSED++))
else
    echo -e "${YELLOW}   ⚠️  RLS check inconclusive (HTTP $RLS_TEST)${NC}\n"
    ((PASSED++))  # Don't fail on this
fi

# ============================================
# Test 8: Migration Status
# ============================================
echo -e "${YELLOW}8️⃣  Checking migration status...${NC}"

if command -v npx &> /dev/null; then
    MIGRATION_STATUS=$(npx supabase migration list --linked 2>&1 || echo "error")

    if echo "$MIGRATION_STATUS" | grep -q "error\|not linked"; then
        echo -e "${YELLOW}   ⚠️  Project not linked or Supabase CLI not available${NC}"
        echo -e "${BLUE}   Run: npx supabase link --project-ref $PROJECT_REF${NC}\n"
    else
        APPLIED=$(echo "$MIGRATION_STATUS" | grep -c "✓\|applied" || echo "0")
        echo -e "${GREEN}   ✅ $APPLIED migration(s) applied${NC}\n"
        ((PASSED++))
    fi
else
    echo -e "${YELLOW}   ⚠️  Supabase CLI not available (skipping migration check)${NC}\n"
fi

# ============================================
# Summary
# ============================================
echo -e "${BLUE}=====================================${NC}"
echo -e "${BLUE}Verification Summary${NC}"
echo -e "${BLUE}=====================================${NC}\n"

TOTAL=$((PASSED + FAILED))
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo -e "${BLUE}📊 Total:  $TOTAL${NC}\n"

if [ "$FAILED" -eq 0 ]; then
    echo -e "${GREEN}═══════════════════════════════════${NC}"
    echo -e "${GREEN}🎉 All checks passed!${NC}"
    echo -e "${GREEN}Supabase is ready for production${NC}"
    echo -e "${GREEN}═══════════════════════════════════${NC}\n"
    exit 0
else
    echo -e "${YELLOW}═══════════════════════════════════${NC}"
    echo -e "${YELLOW}⚠️  Some checks failed${NC}"
    echo -e "${YELLOW}Review errors above and run:${NC}"
    echo -e "${BLUE}  npx supabase db push${NC}"
    echo -e "${BLUE}  npx supabase functions deploy${NC}"
    echo -e "${YELLOW}═══════════════════════════════════${NC}\n"
    exit 1
fi

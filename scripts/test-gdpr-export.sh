#!/bin/bash

# GDPR Data Export - Integration Test Script
# Tests the complete GDPR export flow end-to-end

set -e

echo "🧪 GDPR Data Export - Integration Test"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SUPABASE_URL="${SUPABASE_URL:-http://localhost:54321}"
FUNCTION_NAME="export-user-data"

echo -e "${BLUE}Configuration:${NC}"
echo "  Supabase URL: $SUPABASE_URL"
echo "  Function: $FUNCTION_NAME"
echo ""

# Check if running locally or production
if [[ "$SUPABASE_URL" == *"localhost"* ]]; then
    echo -e "${YELLOW}⚠  Running in LOCAL mode${NC}"
    echo ""
    
    # Check if Supabase is running locally
    if ! curl -s "$SUPABASE_URL/rest/v1/" > /dev/null 2>&1; then
        echo -e "${RED}❌ Supabase is not running locally${NC}"
        echo ""
        echo "Start it with:"
        echo "  supabase start"
        exit 1
    fi
    
    echo -e "${GREEN}✓${NC} Supabase is running locally"
else
    echo -e "${BLUE}ℹ  Running in PRODUCTION mode${NC}"
fi

echo ""
echo "📋 Test Checklist:"
echo "==================="

# Test 1: Check if edge function exists
echo ""
echo -e "${BLUE}Test 1: Edge Function Deployment${NC}"
echo "-----------------------------------"

if command -v supabase &> /dev/null; then
    if supabase functions list 2>/dev/null | grep -q "$FUNCTION_NAME"; then
        echo -e "${GREEN}✓${NC} Edge function '$FUNCTION_NAME' is deployed"
    else
        echo -e "${YELLOW}⚠${NC}  Edge function '$FUNCTION_NAME' not found"
        echo ""
        echo "Deploy it with:"
        echo "  ./scripts/deploy-gdpr-export.sh"
    fi
else
    echo -e "${YELLOW}⚠${NC}  Supabase CLI not found, skipping function check"
fi

# Test 2: Check if audit_logs table exists
echo ""
echo -e "${BLUE}Test 2: Database Schema${NC}"
echo "------------------------"

read -p "Has the audit_logs migration been applied? (y/n): " MIGRATION_APPLIED

if [[ "$MIGRATION_APPLIED" == "y" ]]; then
    echo -e "${GREEN}✓${NC} audit_logs table exists"
else
    echo -e "${YELLOW}⚠${NC}  audit_logs table not created yet"
    echo ""
    echo "Run the migration:"
    echo "  supabase db push"
    echo ""
    echo "Or manually in SQL Editor:"
    echo "  supabase/migrations/20251208_create_audit_logs_table.sql"
fi

# Test 3: Check TypeScript types
echo ""
echo -e "${BLUE}Test 3: TypeScript Compilation${NC}"
echo "--------------------------------"

if npx tsc --noEmit --project apps/mobile/tsconfig.json 2>&1 | grep -q "error"; then
    echo -e "${RED}❌ TypeScript errors found${NC}"
    echo ""
    echo "Fix errors before testing"
else
    echo -e "${GREEN}✓${NC} No TypeScript errors"
fi

# Test 4: Service layer implementation
echo ""
echo -e "${BLUE}Test 4: Service Layer${NC}"
echo "----------------------"

if grep -q "exportData.*async.*Promise" apps/mobile/src/services/userService.ts; then
    echo -e "${GREEN}✓${NC} userService.exportData() implemented"
else
    echo -e "${RED}❌ userService.exportData() not found${NC}"
fi

# Test 5: UI component implementation
echo ""
echo -e "${BLUE}Test 5: UI Component${NC}"
echo "--------------------"

if grep -q "handleExportData" apps/mobile/src/features/settings/screens/DataPrivacyScreen.tsx; then
    echo -e "${GREEN}✓${NC} DataPrivacyScreen export button implemented"
else
    echo -e "${RED}❌ DataPrivacyScreen export button not found${NC}"
fi

# Test 6: Dependencies
echo ""
echo -e "${BLUE}Test 6: Dependencies${NC}"
echo "--------------------"

REQUIRED_DEPS=("expo-file-system" "expo-sharing")

for dep in "${REQUIRED_DEPS[@]}"; do
    if grep -q "\"$dep\"" apps/mobile/package.json; then
        echo -e "${GREEN}✓${NC} $dep installed"
    else
        echo -e "${YELLOW}⚠${NC}  $dep not found in package.json"
        echo ""
        echo "Install with:"
        echo "  cd apps/mobile && pnpm add $dep"
    fi
done

# Test 7: Edge Function Response
echo ""
echo -e "${BLUE}Test 7: Manual Export Test${NC}"
echo "---------------------------"

read -p "Do you want to test the export with a user account? (y/n): " TEST_EXPORT

if [[ "$TEST_EXPORT" == "y" ]]; then
    read -p "Enter user JWT token (from auth): " JWT_TOKEN
    
    if [ -z "$JWT_TOKEN" ]; then
        echo -e "${YELLOW}⚠${NC}  No token provided, skipping test"
    else
        echo ""
        echo "Testing export..."
        
        RESPONSE=$(curl -s -w "\n%{http_code}" \
            --location --request POST "$SUPABASE_URL/functions/v1/$FUNCTION_NAME" \
            --header "Authorization: Bearer $JWT_TOKEN" \
            --header "Content-Type: application/json")
        
        HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
        BODY=$(echo "$RESPONSE" | head -n -1)
        
        if [ "$HTTP_CODE" == "200" ]; then
            echo -e "${GREEN}✓${NC} Export successful!"
            echo ""
            echo "Response preview:"
            echo "$BODY" | jq -r '.metadata' 2>/dev/null || echo "$BODY" | head -c 500
        else
            echo -e "${RED}❌ Export failed (HTTP $HTTP_CODE)${NC}"
            echo ""
            echo "Response:"
            echo "$BODY"
        fi
    fi
else
    echo -e "${YELLOW}⚠${NC}  Skipping manual export test"
fi

# Summary
echo ""
echo ""
echo "📊 Test Summary"
echo "==============="
echo ""
echo "✅ = Passed"
echo "⚠  = Warning/Manual check needed"
echo "❌ = Failed"
echo ""
echo "Next steps:"
echo "1. Fix any ❌ failures"
echo "2. Verify ⚠  warnings manually"
echo "3. Test export in the mobile app with a real user"
echo "4. Check audit_logs table for the export record"
echo ""
echo -e "${BLUE}Full documentation:${NC}"
echo "  docs/GDPR_DATA_EXPORT_IMPLEMENTATION.md"
echo ""

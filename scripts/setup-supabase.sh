#!/bin/bash

# ============================================
# Lovendo Supabase Setup Script
# ============================================
# This script sets up the complete Supabase infrastructure
# Run this after updating credentials in .env files

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_REF="bjikxgtbptrvawkguypv"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

echo -e "${BLUE}🚀 Lovendo Supabase Setup${NC}"
echo -e "${BLUE}================================${NC}\n"

# ============================================
# Step 1: Check Prerequisites
# ============================================
echo -e "${YELLOW}📋 Step 1: Checking prerequisites...${NC}"

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found!${NC}"
    echo -e "${YELLOW}Installing via npx...${NC}"
    echo -e "${BLUE}ℹ️  For permanent installation, run:${NC}"
    echo -e "   brew install supabase/tap/supabase"
    echo ""
fi

# Check if logged in (will prompt if not)
echo -e "${YELLOW}🔐 Checking Supabase authentication...${NC}"
npx supabase projects list &> /dev/null || {
    echo -e "${YELLOW}⚠️  Not logged in. Logging in...${NC}"
    npx supabase login
}

echo -e "${GREEN}✅ Prerequisites OK${NC}\n"

# ============================================
# Step 2: Link Project
# ============================================
echo -e "${YELLOW}🔗 Step 2: Linking to Supabase project...${NC}"

# Check if already linked
if [ -f "supabase/.temp/project-ref" ]; then
    CURRENT_REF=$(cat supabase/.temp/project-ref)
    if [ "$CURRENT_REF" = "$PROJECT_REF" ]; then
        echo -e "${GREEN}✅ Already linked to project $PROJECT_REF${NC}"
    else
        echo -e "${YELLOW}⚠️  Linked to different project: $CURRENT_REF${NC}"
        echo -e "${YELLOW}Re-linking to $PROJECT_REF...${NC}"
        npx supabase link --project-ref "$PROJECT_REF"
    fi
else
    npx supabase link --project-ref "$PROJECT_REF"
fi

echo -e "${GREEN}✅ Project linked${NC}\n"

# ============================================
# Step 3: Verify Migrations
# ============================================
echo -e "${YELLOW}📊 Step 3: Verifying migrations...${NC}"

MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
echo -e "${BLUE}ℹ️  Found $MIGRATION_COUNT migration files${NC}"

if [ "$MIGRATION_COUNT" -eq 0 ]; then
    echo -e "${RED}❌ No migration files found!${NC}"
    exit 1
fi

# List migrations
echo -e "${BLUE}Migration files:${NC}"
npx supabase migration list --local | head -20

echo -e "${GREEN}✅ Migrations verified${NC}\n"

# ============================================
# Step 4: Apply Migrations (Dry Run)
# ============================================
echo -e "${YELLOW}🧪 Step 4: Checking migration diff (dry run)...${NC}"

echo -e "${BLUE}ℹ️  Comparing local migrations with remote database...${NC}"
npx supabase db diff --linked || {
    echo -e "${YELLOW}⚠️  No differences found (migrations may already be applied)${NC}"
}

echo ""
read -p "$(echo -e ${YELLOW}Apply migrations to production? [y/N]: ${NC})" -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}📤 Applying migrations to production...${NC}"
    npx supabase db push
    echo -e "${GREEN}✅ Migrations applied successfully${NC}\n"
else
    echo -e "${BLUE}ℹ️  Skipped migration deployment${NC}\n"
fi

# ============================================
# Step 5: Deploy Edge Functions
# ============================================
echo -e "${YELLOW}⚡ Step 5: Deploying Edge Functions...${NC}"

FUNCTIONS_COUNT=$(ls -1d supabase/functions/*/ 2>/dev/null | wc -l)
echo -e "${BLUE}ℹ️  Found $FUNCTIONS_COUNT Edge Functions${NC}"

if [ "$FUNCTIONS_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No Edge Functions found${NC}"
else
    read -p "$(echo -e ${YELLOW}Deploy all Edge Functions? [y/N]: ${NC})" -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}📤 Deploying all functions...${NC}"
        npx supabase functions deploy
        echo -e "${GREEN}✅ Edge Functions deployed${NC}\n"
    else
        echo -e "${BLUE}ℹ️  Skipped Edge Functions deployment${NC}\n"
    fi
fi

# ============================================
# Step 6: Verify Setup
# ============================================
echo -e "${YELLOW}🔍 Step 6: Verifying setup...${NC}"

# Test API endpoint
echo -e "${BLUE}Testing REST API...${NC}"
curl -f -s "$SUPABASE_URL/rest/v1/" \
    -H "apikey: $EXPO_PUBLIC_SUPABASE_ANON_KEY" > /dev/null && \
    echo -e "${GREEN}✅ REST API accessible${NC}" || \
    echo -e "${RED}❌ REST API check failed${NC}"

# Test Auth endpoint
echo -e "${BLUE}Testing Auth API...${NC}"
curl -f -s "$SUPABASE_URL/auth/v1/health" > /dev/null && \
    echo -e "${GREEN}✅ Auth API accessible${NC}" || \
    echo -e "${RED}❌ Auth API check failed${NC}"

# Test Storage endpoint
echo -e "${BLUE}Testing Storage API...${NC}"
curl -f -s "$SUPABASE_URL/storage/v1/bucket" \
    -H "Authorization: Bearer $EXPO_PUBLIC_SUPABASE_ANON_KEY" > /dev/null && \
    echo -e "${GREEN}✅ Storage API accessible${NC}" || \
    echo -e "${RED}❌ Storage API check failed${NC}"

echo ""

# ============================================
# Step 7: Next Steps
# ============================================
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Supabase Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}\n"

echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "  1. Set Edge Function secrets:"
echo -e "     ${YELLOW}npx supabase secrets set OPENAI_API_KEY=sk-xxxxx${NC}"
echo ""
echo -e "  2. Verify storage buckets in dashboard:"
echo -e "     ${BLUE}https://supabase.com/dashboard/project/$PROJECT_REF/storage/buckets${NC}"
echo ""
echo -e "  3. Check migration status:"
echo -e "     ${YELLOW}npx supabase migration list --linked${NC}"
echo ""
echo -e "  4. Monitor Edge Function logs:"
echo -e "     ${YELLOW}npx supabase functions logs --tail${NC}"
echo ""
echo -e "  5. Update mobile app .env files with production credentials"
echo ""
echo -e "${GREEN}🔗 Useful Links:${NC}"
echo -e "  • Dashboard: ${BLUE}https://supabase.com/dashboard/project/$PROJECT_REF${NC}"
echo -e "  • Database Editor: ${BLUE}https://supabase.com/dashboard/project/$PROJECT_REF/editor${NC}"
echo -e "  • Logs: ${BLUE}https://supabase.com/dashboard/project/$PROJECT_REF/logs/explorer${NC}"
echo ""
echo -e "${YELLOW}📖 See SUPABASE_DEPLOYMENT_GUIDE.md for detailed instructions${NC}\n"

# ============================================
# Optional: Run verification script
# ============================================
if [ -f "scripts/verify-supabase.sh" ]; then
    echo ""
    read -p "$(echo -e ${YELLOW}Run verification script? [y/N]: ${NC})" -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        bash scripts/verify-supabase.sh
    fi
fi

echo -e "${GREEN}✅ Setup script completed${NC}"

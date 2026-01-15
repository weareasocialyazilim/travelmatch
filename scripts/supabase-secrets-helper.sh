#!/bin/bash

# Supabase Secrets Helper
# Shows you exactly where to find Supabase credentials

set -e

echo "🔑 Supabase Secrets Quick Reference"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Your Lovendo Supabase Project${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Project Reference: bjikxgtbptrvawkguypv"
echo "Region: South Asia (Mumbai)"
echo "Project URL: https://bjikxgtbptrvawkguypv.supabase.co"
echo ""

echo -e "${YELLOW}📋 COPY THESE VALUES TO YOUR GITHUB SECRETS:${NC}"
echo ""

# Secrets that are already known
echo -e "${GREEN}✅ Known Values (can be added now):${NC}"
echo ""

echo "1. SUPABASE_URL"
echo "   Value: https://bjikxgtbptrvawkguypv.supabase.co"
echo ""

echo "2. SUPABASE_PROJECT_REF"
echo "   Value: bjikxgtbptrvawkguypv"
echo ""

echo "3. EXPO_PUBLIC_SUPABASE_URL"
echo "   Value: https://bjikxgtbptrvawkguypv.supabase.co"
echo "   (same as SUPABASE_URL)"
echo ""

echo "4. VITE_SUPABASE_URL"
echo "   Value: https://bjikxgtbptrvawkguypv.supabase.co"
echo "   (same as SUPABASE_URL)"
echo ""

# Secrets that need to be fetched
echo -e "${YELLOW}🔐 Get from Supabase Dashboard:${NC}"
echo ""

echo -e "${BLUE}Step 1: Get API Keys${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "URL: https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/settings/api"
echo ""
echo "Find these sections:"
echo ""

echo "1. SUPABASE_ANON_KEY"
echo "   Section: 'Project API keys' → 'anon' → 'public'"
echo "   Look for: Long string starting with 'eyJ...'"
echo "   ⚠️  This is PUBLIC - safe to use in mobile apps"
echo ""
echo "   Also copy this value to:"
echo "     - EXPO_PUBLIC_SUPABASE_ANON_KEY"
echo "     - VITE_SUPABASE_ANON_KEY"
echo ""

echo "2. SUPABASE_SERVICE_KEY"
echo "   Section: 'Project API keys' → 'service_role' → 'secret'"
echo "   Look for: Long string starting with 'eyJ...'"
echo "   🚨 DANGER: This BYPASSES Row Level Security!"
echo "   🚨 NEVER expose this in client-side code!"
echo "   🚨 Only use in secure server environments (GitHub Actions, Edge Functions)"
echo ""

echo -e "${BLUE}Step 2: Generate Access Token${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "URL: https://supabase.com/dashboard/account/tokens"
echo ""
echo "Steps:"
echo "  1. Click 'Generate new token'"
echo "  2. Name it: 'GitHub Actions - Lovendo'"
echo "  3. Click 'Generate token'"
echo "  4. Copy the token immediately (you won't see it again!)"
echo ""
echo "3. SUPABASE_ACCESS_TOKEN"
echo "   This is your personal access token for Supabase CLI"
echo "   Used for: Deploying edge functions, running migrations"
echo ""

echo -e "${GREEN}Quick Add Commands:${NC}"
echo ""
echo "After getting the values above, run these commands:"
echo ""

cat << 'EOF'
# Option 1: Use the interactive script
./scripts/add-github-secrets.sh

# Option 2: Use GitHub CLI directly
gh secret set SUPABASE_URL --body "https://bjikxgtbptrvawkguypv.supabase.co"
gh secret set SUPABASE_PROJECT_REF --body "bjikxgtbptrvawkguypv"
gh secret set SUPABASE_ANON_KEY --body "YOUR_ANON_KEY_HERE"
gh secret set SUPABASE_SERVICE_KEY --body "YOUR_SERVICE_KEY_HERE"
gh secret set SUPABASE_ACCESS_TOKEN --body "YOUR_ACCESS_TOKEN_HERE"

# Public variants (same as above)
gh secret set EXPO_PUBLIC_SUPABASE_URL --body "https://bjikxgtbptrvawkguypv.supabase.co"
gh secret set EXPO_PUBLIC_SUPABASE_ANON_KEY --body "YOUR_ANON_KEY_HERE"
gh secret set VITE_SUPABASE_URL --body "https://bjikxgtbptrvawkguypv.supabase.co"
gh secret set VITE_SUPABASE_ANON_KEY --body "YOUR_ANON_KEY_HERE"
EOF

echo ""
echo -e "${YELLOW}⚠️  IMPORTANT SECURITY NOTES:${NC}"
echo ""
echo "✅ Safe to expose (public keys):"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_PROJECT_REF"
echo "   - SUPABASE_ANON_KEY (and EXPO_PUBLIC_*, VITE_* variants)"
echo ""
echo "❌ NEVER expose (secret keys):"
echo "   - SUPABASE_SERVICE_KEY (bypasses RLS!)"
echo "   - SUPABASE_ACCESS_TOKEN (full account access!)"
echo ""
echo "🔒 Row Level Security (RLS):"
echo "   - anon key: Respects RLS policies ✅"
echo "   - service_role key: BYPASSES RLS ⚠️"
echo ""
echo "   Use service_role ONLY in:"
echo "     - GitHub Actions workflows"
echo "     - Supabase Edge Functions"
echo "     - Secure backend servers"
echo ""
echo "   NEVER use service_role in:"
echo "     - Mobile apps"
echo "     - Web frontends"
echo "     - Client-side code"
echo ""

echo -e "${BLUE}Verification:${NC}"
echo ""
echo "After adding secrets, verify with:"
echo "  ./scripts/verify-github-secrets.sh"
echo ""

echo -e "${GREEN}Next Steps:${NC}"
echo ""
echo "1. Open Supabase Dashboard in your browser"
echo "2. Copy the 3 secret values (anon key, service key, access token)"
echo "3. Run: ./scripts/add-github-secrets.sh"
echo "4. Choose option 3 to auto-add known values"
echo "5. Then manually add the 3 secret values when prompted"
echo "6. Verify: ./scripts/verify-github-secrets.sh"
echo "7. Test: gh workflow run ci.yml"
echo ""

echo "📚 Full guide: docs/GITHUB_SECRETS_SETUP.md"
echo ""

# Offer to open URLs
read -p "Open Supabase API settings in browser? (y/n): " open_api
if [ "$open_api" = "y" ]; then
    open "https://supabase.com/dashboard/project/bjikxgtbptrvawkguypv/settings/api"
    echo "✅ Opened API settings"
fi

echo ""
read -p "Open Supabase tokens page in browser? (y/n): " open_tokens
if [ "$open_tokens" = "y" ]; then
    open "https://supabase.com/dashboard/account/tokens"
    echo "✅ Opened tokens page"
fi

echo ""
echo "Happy configuring! 🚀"
echo ""

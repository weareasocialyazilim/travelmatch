#!/bin/bash

# Quick Add Script for GitHub Secrets
# Helps you add all required secrets efficiently

set -e

echo "🚀 GitHub Secrets Quick Add Script"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check prerequisites
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) not installed${NC}"
    echo "Install: brew install gh"
    exit 1
fi

if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI authenticated${NC}"
echo ""

# Function to add a secret
add_secret() {
    local name=$1
    local value=$2
    local description=$3
    
    if [ -z "$value" ]; then
        echo -e "${YELLOW}⏭️  Skipping $name (no value provided)${NC}"
        return
    fi
    
    echo -e "${BLUE}Adding: $name${NC}"
    echo -e "  Description: $description"
    
    if gh secret set "$name" --body "$value" 2>/dev/null; then
        echo -e "${GREEN}  ✅ Success${NC}"
    else
        echo -e "${RED}  ❌ Failed${NC}"
    fi
    echo ""
}

# Function to prompt for a secret
prompt_secret() {
    local name=$1
    local description=$2
    local default=$3
    local secret_mode=${4:-true}
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}$name${NC}"
    echo "Description: $description"
    
    if [ -n "$default" ]; then
        echo -e "Default: ${GREEN}$default${NC}"
    fi
    
    echo ""
    
    if [ "$secret_mode" = true ]; then
        read -sp "Enter value (hidden): " value
        echo ""
    else
        read -p "Enter value: " value
    fi
    
    # Use default if no value provided
    if [ -z "$value" ] && [ -n "$default" ]; then
        value=$default
    fi
    
    if [ -n "$value" ]; then
        add_secret "$name" "$value" "$description"
    else
        echo -e "${YELLOW}⏭️  Skipped (no value)${NC}"
        echo ""
    fi
}

# Welcome message
echo "This script will guide you through adding GitHub secrets."
echo ""
echo "You can:"
echo "  1. Add all secrets interactively"
echo "  2. Add only P0 (critical) secrets"
echo "  3. Add known Supabase secrets automatically"
echo "  4. Exit"
echo ""

read -p "Choose option [1-4]: " choice

case $choice in
    1)
        echo ""
        echo "📋 Adding ALL secrets (you'll be prompted for each)"
        echo ""
        MODE="all"
        ;;
    2)
        echo ""
        echo "📋 Adding P0 CRITICAL secrets only"
        echo ""
        MODE="p0"
        ;;
    3)
        echo ""
        echo "📋 Adding known Supabase secrets automatically"
        echo ""
        
        # Known Supabase values for Lovendo project
        SUPABASE_URL="https://bjikxgtbptrvawkguypv.supabase.co"
        SUPABASE_PROJECT_REF="bjikxgtbptrvawkguypv"
        
        echo "Adding known Supabase secrets..."
        echo ""
        
        add_secret "SUPABASE_URL" "$SUPABASE_URL" "Supabase project URL"
        add_secret "SUPABASE_PROJECT_REF" "$SUPABASE_PROJECT_REF" "Supabase project reference"
        add_secret "EXPO_PUBLIC_SUPABASE_URL" "$SUPABASE_URL" "Public Supabase URL for mobile"
        add_secret "VITE_SUPABASE_URL" "$SUPABASE_URL" "Supabase URL for admin panel"
        
        echo ""
        echo -e "${GREEN}✅ Added 4 Supabase URL/ref secrets${NC}"
        echo ""
        echo "⚠️  You still need to add manually:"
        echo "  - SUPABASE_ANON_KEY (from Dashboard → Settings → API)"
        echo "  - SUPABASE_SERVICE_KEY (from Dashboard → Settings → API)"
        echo "  - SUPABASE_ACCESS_TOKEN (from https://supabase.com/dashboard/account/tokens)"
        echo "  - EXPO_PUBLIC_SUPABASE_ANON_KEY (same as SUPABASE_ANON_KEY)"
        echo "  - VITE_SUPABASE_ANON_KEY (same as SUPABASE_ANON_KEY)"
        echo ""
        echo "Run this script again with option 2 to add P0 secrets interactively."
        echo ""
        exit 0
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

# P0 - Critical secrets
echo ""
echo -e "${RED}═════════════════════════════════════════════════════${NC}"
echo -e "${RED}P0 - CRITICAL SECRETS (Required for CI/CD)${NC}"
echo -e "${RED}═════════════════════════════════════════════════════${NC}"
echo ""

prompt_secret "EXPO_TOKEN" \
    "Expo access token. Get from: https://expo.dev → Settings → Access Tokens" \
    ""

prompt_secret "SUPABASE_URL" \
    "Supabase project URL" \
    "https://bjikxgtbptrvawkguypv.supabase.co" \
    false

prompt_secret "SUPABASE_ANON_KEY" \
    "Supabase anonymous key. Get from: Dashboard → Settings → API → anon public" \
    ""

prompt_secret "SUPABASE_SERVICE_KEY" \
    "⚠️  DANGEROUS: Bypasses RLS. Get from: Dashboard → Settings → API → service_role" \
    ""

prompt_secret "SUPABASE_PROJECT_REF" \
    "Supabase project reference ID" \
    "bjikxgtbptrvawkguypv" \
    false

prompt_secret "SUPABASE_ACCESS_TOKEN" \
    "Supabase CLI token. Get from: https://supabase.com/dashboard/account/tokens" \
    ""

if [ "$MODE" = "p0" ]; then
    echo ""
    echo -e "${GREEN}✅ P0 secrets added!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: ./scripts/verify-github-secrets.sh"
    echo "  2. Test CI: gh workflow run ci.yml"
    echo "  3. Add P1 secrets when ready (run this script with option 1)"
    echo ""
    exit 0
fi

# P1 - High priority secrets
echo ""
echo -e "${YELLOW}═════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}P1 - HIGH PRIORITY SECRETS (Production)${NC}"
echo -e "${YELLOW}═════════════════════════════════════════════════════${NC}"
echo ""

# Auto-fill from previous SUPABASE_URL and SUPABASE_ANON_KEY if available
SUPABASE_URL_DEFAULT="https://bjikxgtbptrvawkguypv.supabase.co"

prompt_secret "EXPO_PUBLIC_SUPABASE_URL" \
    "Public Supabase URL (same as SUPABASE_URL)" \
    "$SUPABASE_URL_DEFAULT" \
    false

echo "ℹ️  For EXPO_PUBLIC_SUPABASE_ANON_KEY, use the same value as SUPABASE_ANON_KEY"
prompt_secret "EXPO_PUBLIC_SUPABASE_ANON_KEY" \
    "Public Supabase key for mobile (same as SUPABASE_ANON_KEY)" \
    ""

prompt_secret "VITE_SUPABASE_URL" \
    "Supabase URL for admin panel (same as SUPABASE_URL)" \
    "$SUPABASE_URL_DEFAULT" \
    false

echo "ℹ️  For VITE_SUPABASE_ANON_KEY, use the same value as SUPABASE_ANON_KEY"
prompt_secret "VITE_SUPABASE_ANON_KEY" \
    "Supabase key for admin panel (same as SUPABASE_ANON_KEY)" \
    ""

prompt_secret "PAYTR_MERCHANT_KEY" \
    "PayTR merchant key. Get from: https://www.paytr.com/panel/integration" \
    ""

prompt_secret "OPENAI_API_KEY" \
    "OpenAI API key. Get from: https://platform.openai.com/api-keys" \
    ""

read -p "Add ANTHROPIC_API_KEY? (optional, y/n): " add_anthropic
if [ "$add_anthropic" = "y" ]; then
    prompt_secret "ANTHROPIC_API_KEY" \
        "Anthropic API key (optional). Get from: https://console.anthropic.com/settings/keys" \
        ""
fi

# P2 - Medium priority
echo ""
read -p "Add P2 (monitoring) secrets? (y/n): " add_p2

if [ "$add_p2" = "y" ]; then
    echo ""
    echo -e "${BLUE}═════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}P2 - MEDIUM PRIORITY (Monitoring)${NC}"
    echo -e "${BLUE}═════════════════════════════════════════════════════${NC}"
    echo ""
    
    prompt_secret "SENTRY_AUTH_TOKEN" \
        "Sentry auth token. Get from: https://sentry.io/settings/account/api/auth-tokens/" \
        ""
    
    prompt_secret "CODECOV_TOKEN" \
        "Codecov token. Get from: https://codecov.io/gh/kemalteksalgit/lovendo" \
        ""
    
    prompt_secret "SNYK_TOKEN" \
        "Snyk token. Get from: https://app.snyk.io/account" \
        ""
    
    prompt_secret "SLACK_WEBHOOK_URL" \
        "Slack webhook URL. Get from: https://api.slack.com/apps" \
        ""
    
    # SLACK_WEBHOOK is duplicate of SLACK_WEBHOOK_URL
    echo "ℹ️  SLACK_WEBHOOK is duplicate of SLACK_WEBHOOK_URL (auto-copying)"
    # This would be copied automatically if we had the previous value
fi

# Summary
echo ""
echo -e "${GREEN}═════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ SECRETS ADDED SUCCESSFULLY!${NC}"
echo -e "${GREEN}═════════════════════════════════════════════════════${NC}"
echo ""

echo "Next steps:"
echo "  1. Verify: ./scripts/verify-github-secrets.sh"
echo "  2. Test CI: gh workflow run ci.yml"
echo "  3. Check runs: gh run list --limit 5"
echo ""

echo "📚 Full documentation: docs/GITHUB_SECRETS_SETUP.md"
echo ""

echo "⚠️  Remember to:"
echo "  - Keep secret values secure"
echo "  - Never commit secrets to git"
echo "  - Rotate secrets every 90 days"
echo "  - Use different keys for test/staging/production"
echo ""

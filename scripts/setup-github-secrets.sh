# CI/CD Secrets Setup Script
# Run this script to set GitHub secrets via CLI

#!/bin/bash

set -e

REPO="kemalteksalgit/lovendo"

echo "🔐 GitHub Secrets Setup Script"
echo "================================"
echo ""
echo "This script will help you set up GitHub secrets for CI/CD"
echo "Repository: $REPO"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Install it with: brew install gh"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"
echo ""

# Function to set secret
set_secret() {
    local name=$1
    local prompt=$2
    local default=$3
    
    echo ""
    echo "📝 Setting: $name"
    if [ -n "$prompt" ]; then
        echo "   $prompt"
    fi
    
    if [ -n "$default" ]; then
        read -p "   Value (press Enter for default): " value
        value=${value:-$default}
    else
        read -sp "   Value: " value
        echo ""
    fi
    
    if [ -z "$value" ]; then
        echo "   ⏭️  Skipped (empty value)"
        return
    fi
    
    echo "$value" | gh secret set "$name" --repo="$REPO"
    echo "   ✅ Set successfully"
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "P0 - Critical Secrets (Required for CI/CD)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

set_secret "SUPABASE_URL" "Get from: Supabase Dashboard → Settings → API" "https://bjikxgtbptrvawkguypv.supabase.co"
set_secret "SUPABASE_ANON_KEY" "Get from: Supabase Dashboard → Settings → API → anon key"
set_secret "SUPABASE_SERVICE_KEY" "Get from: Supabase Dashboard → Settings → API → service_role key"
set_secret "SUPABASE_PROJECT_REF" "Project reference ID" "bjikxgtbptrvawkguypv"
set_secret "SUPABASE_ACCESS_TOKEN" "Get from: Supabase Account → Tokens"
set_secret "EXPO_TOKEN" "Get from: https://expo.dev/accounts/[account]/settings/access-tokens"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "P1 - Production Features (Optional for now)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Do you want to set P1 secrets now? (y/N): " continue_p1
if [[ "$continue_p1" =~ ^[Yy]$ ]]; then
    set_secret "EXPO_PUBLIC_SUPABASE_URL" "Same as SUPABASE_URL" "https://bjikxgtbptrvawkguypv.supabase.co"
    set_secret "EXPO_PUBLIC_SUPABASE_ANON_KEY" "Same as SUPABASE_ANON_KEY"
    set_secret "VITE_SUPABASE_URL" "Same as SUPABASE_URL" "https://bjikxgtbptrvawkguypv.supabase.co"
    set_secret "VITE_SUPABASE_ANON_KEY" "Same as SUPABASE_ANON_KEY"
    set_secret "STRIPE_SECRET_KEY" "Get from: https://dashboard.stripe.com/apikeys"
    set_secret "STRIPE_WEBHOOK_SECRET" "Get from: Stripe Dashboard → Webhooks"
    set_secret "OPENAI_API_KEY" "Get from: https://platform.openai.com/api-keys"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "P2 - Monitoring (Optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Do you want to set P2 secrets now? (y/N): " continue_p2
if [[ "$continue_p2" =~ ^[Yy]$ ]]; then
    set_secret "CODECOV_TOKEN" "Get from: https://codecov.io/gh/$REPO"
    set_secret "SENTRY_AUTH_TOKEN" "Get from: https://sentry.io/settings/account/api/auth-tokens/"
    set_secret "SNYK_TOKEN" "Get from: https://app.snyk.io/account"
    set_secret "SLACK_WEBHOOK" "Get from: Slack → Apps → Incoming Webhooks"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You can view all secrets at:"
echo "https://github.com/$REPO/settings/secrets/actions"
echo ""
echo "Next steps:"
echo "1. Push your changes to trigger CI"
echo "2. Check the workflow runs at:"
echo "   https://github.com/$REPO/actions"
echo ""

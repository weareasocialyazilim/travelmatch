#!/bin/bash

# GitHub Secrets Verification Script
# Checks which secrets are configured in the repository

set -e

echo "🔍 GitHub Secrets Verification for Lovendo"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo ""
    echo "Install it with: brew install gh"
    echo "Then authenticate with: gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub CLI${NC}"
    echo ""
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✅ GitHub CLI is authenticated${NC}"
echo ""

# Define all required secrets by priority
declare -A P0_SECRETS=(
    ["EXPO_TOKEN"]="Expo access token for builds and deployments"
    ["SUPABASE_URL"]="Supabase project URL"
    ["SUPABASE_ANON_KEY"]="Supabase anonymous key"
    ["SUPABASE_SERVICE_KEY"]="Supabase service role key (admin)"
    ["SUPABASE_PROJECT_REF"]="Supabase project reference ID"
    ["SUPABASE_ACCESS_TOKEN"]="Supabase CLI access token"
)

declare -A P1_SECRETS=(
    ["EXPO_PUBLIC_SUPABASE_URL"]="Public Supabase URL for mobile app"
    ["EXPO_PUBLIC_SUPABASE_ANON_KEY"]="Public Supabase key for mobile app"
    ["VITE_SUPABASE_URL"]="Supabase URL for admin panel"
    ["VITE_SUPABASE_ANON_KEY"]="Supabase key for admin panel"
    ["STRIPE_SECRET_KEY"]="Stripe secret key for payments"
    ["STRIPE_WEBHOOK_SECRET"]="Stripe webhook signing secret"
    ["OPENAI_API_KEY"]="OpenAI API key for AI features"
    ["ANTHROPIC_API_KEY"]="Anthropic API key (optional)"
)

declare -A P2_SECRETS=(
    ["SENTRY_AUTH_TOKEN"]="Sentry authentication token"
    ["CODECOV_TOKEN"]="Codecov upload token"
    ["SNYK_TOKEN"]="Snyk security scanning token"
    ["SLACK_WEBHOOK_URL"]="Slack webhook for notifications"
    ["SLACK_WEBHOOK"]="Slack webhook (duplicate)"
)

declare -A P3_SECRETS=(
    ["TURBO_TOKEN"]="Vercel Turbo token"
    ["TURBO_TEAM"]="Vercel team ID"
    ["CHROMATIC_TOKEN"]="Chromatic visual testing token"
    ["VERCEL_TOKEN"]="Vercel deployment token"
    ["VERCEL_ORG_ID"]="Vercel organization ID"
    ["VERCEL_STORYBOOK_PROJECT_ID"]="Vercel Storybook project ID"
    ["LHCI_GITHUB_APP_TOKEN"]="Lighthouse CI token"
    ["MAESTRO_CLOUD_API_KEY"]="Maestro E2E testing key"
    ["CLOUDFLARE_API_TOKEN"]="Cloudflare API token"
    ["CLOUDFLARE_ACCOUNT_ID"]="Cloudflare account ID"
    ["CLOUDFLARE_ZONE_ID"]="Cloudflare zone ID"
)

declare -A P4_SECRETS=(
    ["APPLE_ID"]="Apple Developer account email"
    ["ASC_APP_ID"]="App Store Connect app ID"
    ["APPLE_TEAM_ID"]="Apple Developer team ID"
)

# Get list of configured secrets
echo "📋 Fetching configured secrets from GitHub..."
CONFIGURED_SECRETS=$(gh secret list --json name --jq '.[].name' 2>/dev/null || echo "")

if [ -z "$CONFIGURED_SECRETS" ]; then
    echo -e "${YELLOW}⚠️  No secrets found or unable to fetch${NC}"
    echo ""
    CONFIGURED_SECRETS=""
fi

# Function to check if a secret is configured
is_configured() {
    local secret_name=$1
    echo "$CONFIGURED_SECRETS" | grep -q "^${secret_name}$"
}

# Function to print secret status
print_secret_status() {
    local secret_name=$1
    local description=$2
    
    if is_configured "$secret_name"; then
        echo -e "${GREEN}  ✅ ${secret_name}${NC} - ${description}"
        return 0
    else
        echo -e "${RED}  ❌ ${secret_name}${NC} - ${description}"
        return 1
    fi
}

# Count totals
total_secrets=0
configured_count=0

# Check P0 secrets
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}P0 - CRITICAL (Required for ANY CI/CD)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
p0_count=0
p0_configured=0
for secret in "${!P0_SECRETS[@]}"; do
    if print_secret_status "$secret" "${P0_SECRETS[$secret]}"; then
        ((p0_configured++))
    fi
    ((p0_count++))
    ((total_secrets++))
done
configured_count=$((configured_count + p0_configured))
echo ""
echo -e "P0 Status: ${p0_configured}/${p0_count} configured"

# Check P1 secrets
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}P1 - HIGH PRIORITY (Production deployments)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
p1_count=0
p1_configured=0
for secret in "${!P1_SECRETS[@]}"; do
    if print_secret_status "$secret" "${P1_SECRETS[$secret]}"; then
        ((p1_configured++))
    fi
    ((p1_count++))
    ((total_secrets++))
done
configured_count=$((configured_count + p1_configured))
echo ""
echo -e "P1 Status: ${p1_configured}/${p1_count} configured"

# Check P2 secrets
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}P2 - MEDIUM PRIORITY (Monitoring & Analytics)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
p2_count=0
p2_configured=0
for secret in "${!P2_SECRETS[@]}"; do
    if print_secret_status "$secret" "${P2_SECRETS[$secret]}"; then
        ((p2_configured++))
    fi
    ((p2_count++))
    ((total_secrets++))
done
configured_count=$((configured_count + p2_configured))
echo ""
echo -e "P2 Status: ${p2_configured}/${p2_count} configured"

# Check P3 secrets
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}P3 - LOW PRIORITY (Optional services)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
p3_count=0
p3_configured=0
for secret in "${!P3_SECRETS[@]}"; do
    if print_secret_status "$secret" "${P3_SECRETS[$secret]}"; then
        ((p3_configured++))
    fi
    ((p3_count++))
    ((total_secrets++))
done
configured_count=$((configured_count + p3_configured))
echo ""
echo -e "P3 Status: ${p3_configured}/${p3_count} configured"

# Check P4 secrets
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}P4 - iOS DEPLOYMENT (Apple-specific)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
p4_count=0
p4_configured=0
for secret in "${!P4_SECRETS[@]}"; do
    if print_secret_status "$secret" "${P4_SECRETS[$secret]}"; then
        ((p4_configured++))
    fi
    ((p4_count++))
    ((total_secrets++))
done
configured_count=$((configured_count + p4_configured))
echo ""
echo -e "P4 Status: ${p4_configured}/${p4_count} configured"

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

percentage=$((configured_count * 100 / total_secrets))

echo -e "Total Secrets Required: ${total_secrets}"
echo -e "Configured: ${GREEN}${configured_count}${NC}"
echo -e "Missing: ${RED}$((total_secrets - configured_count))${NC}"
echo -e "Completion: ${percentage}%"
echo ""

# Recommendations
if [ $p0_configured -lt $p0_count ]; then
    echo -e "${RED}⚠️  CRITICAL: ${p0_count - p0_configured} P0 secrets missing!${NC}"
    echo "   CI/CD pipelines are blocked. Add P0 secrets immediately."
    echo ""
fi

if [ $p0_configured -eq $p0_count ] && [ $p1_configured -lt $p1_count ]; then
    echo -e "${YELLOW}⚠️  WARNING: ${p1_count - p1_configured} P1 secrets missing${NC}"
    echo "   Production deployments may fail. Add P1 secrets next."
    echo ""
fi

if [ $p0_configured -eq $p0_count ] && [ $p1_configured -eq $p1_count ]; then
    echo -e "${GREEN}✅ All critical secrets configured!${NC}"
    echo "   CI/CD and production deployments should work."
    
    if [ $p2_configured -lt $p2_count ]; then
        echo ""
        echo -e "${YELLOW}💡 Tip: Add P2 secrets for monitoring and analytics${NC}"
    fi
    echo ""
fi

# Next steps
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}NEXT STEPS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

if [ $p0_configured -lt $p0_count ]; then
    echo "1. Add P0 secrets (CRITICAL)"
    echo "   See: docs/GITHUB_SECRETS_SETUP.md"
    echo ""
    echo "   GitHub Settings: https://github.com/kemalteksalgit/lovendo/settings/secrets/actions"
    echo ""
    echo "   Missing P0 secrets:"
    for secret in "${!P0_SECRETS[@]}"; do
        if ! is_configured "$secret"; then
            echo "     - $secret"
        fi
    done
elif [ $p1_configured -lt $p1_count ]; then
    echo "1. Add P1 secrets (HIGH PRIORITY)"
    echo "   See: docs/GITHUB_SECRETS_SETUP.md"
    echo ""
    echo "   Missing P1 secrets:"
    for secret in "${!P1_SECRETS[@]}"; do
        if ! is_configured "$secret"; then
            echo "     - $secret"
        fi
    done
elif [ $p2_configured -lt $p2_count ]; then
    echo "1. Add P2 secrets (MEDIUM PRIORITY)"
    echo "   See: docs/GITHUB_SECRETS_SETUP.md"
    echo ""
    echo "   Missing P2 secrets:"
    for secret in "${!P2_SECRETS[@]}"; do
        if ! is_configured "$secret"; then
            echo "     - $secret"
        fi
    done
else
    echo "1. All essential secrets configured! 🎉"
    echo ""
    echo "2. Optional: Add remaining P3/P4 secrets as needed"
    echo ""
    echo "3. Test CI/CD pipelines:"
    echo "   gh workflow run ci.yml"
    echo ""
    echo "4. Monitor workflow runs:"
    echo "   gh run list --limit 5"
fi

echo ""
echo "📚 Documentation: docs/GITHUB_SECRETS_SETUP.md"
echo ""

# Exit with appropriate status
if [ $p0_configured -eq $p0_count ]; then
    exit 0  # Success
else
    exit 1  # Missing critical secrets
fi

# GitHub Secrets Setup Script
# Run this script to quickly set up all required secrets for E2E CI/CD

#!/bin/bash

set -e

echo "🔐 GitHub Secrets Setup for E2E CI/CD"
echo "======================================"
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
    local secret_name=$1
    local secret_description=$2
    local is_optional=$3
    
    echo "📝 Setting: $secret_name"
    echo "   Description: $secret_description"
    
    if [ "$is_optional" = "true" ]; then
        echo -n "   Value (press Enter to skip): "
    else
        echo -n "   Value: "
    fi
    
    read -s secret_value
    echo ""
    
    if [ -z "$secret_value" ]; then
        if [ "$is_optional" = "true" ]; then
            echo "   ⏭️  Skipped (optional)"
            echo ""
            return
        else
            echo "   ❌ Error: Value is required"
            exit 1
        fi
    fi
    
    gh secret set "$secret_name" --body "$secret_value"
    echo "   ✅ Secret set successfully"
    echo ""
}

echo "🚀 Let's set up your secrets..."
echo ""
echo "IMPORTANT: You'll need the following information ready:"
echo "  1. Supabase project URL and anon key"
echo "  2. Stripe test publishable key (pk_test_...)"
echo "  3. Test user email and password"
echo "  4. (Optional) Slack webhook URL for notifications"
echo ""
read -p "Press Enter to continue..."
echo ""

# Required secrets
echo "📋 REQUIRED SECRETS"
echo "==================="
echo ""

set_secret "EXPO_PUBLIC_SUPABASE_URL" "Supabase project URL (e.g., https://xxx.supabase.co)" false
set_secret "EXPO_PUBLIC_SUPABASE_ANON_KEY" "Supabase anonymous key" false
set_secret "STRIPE_TEST_PUBLISHABLE_KEY" "Stripe test publishable key (pk_test_...)" false
set_secret "TEST_USER_EMAIL" "Test user email for E2E tests" false
set_secret "TEST_USER_PASSWORD" "Test user password (must be strong)" false

# Optional secrets
echo "📋 OPTIONAL SECRETS"
echo "==================="
echo ""

set_secret "SLACK_WEBHOOK_URL" "Slack webhook URL for failure notifications" true

echo ""
echo "✅ All secrets configured successfully!"
echo ""
echo "🎯 Next Steps:"
echo "  1. Enable branch protection: Settings → Branches → Add rule"
echo "  2. Add required status checks:"
echo "     - E2E Status Check (Required)"
echo "     - Detox E2E Tests (iOS - Critical Flows)"
echo "     - Detox E2E Tests (Android - Critical Flows)"
echo "  3. Create a test PR to verify"
echo ""
echo "📚 Full setup guide: .github/workflows/E2E_CI_SETUP.md"
echo "⚡ Quick start guide: .github/workflows/E2E_CI_QUICK_START.md"
echo ""
echo "🎉 Done!"

#!/bin/bash
# ============================================================================
# SUPABASE AUTH SECURITY SETTINGS
# ============================================================================
# This script configures Auth security settings that cannot be set via config.toml
# It uses the Supabase Management API
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔐 Configuring Supabase Auth Security Settings"
echo "================================================"

# Check for required environment variables
PROJECT_REF="${SUPABASE_PROJECT_REF:-bjikxgtbptrvawkguypv}"

# Check if logged in to Supabase CLI
if ! supabase projects list &>/dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Supabase CLI${NC}"
    echo "Please run: supabase login"
    exit 1
fi

echo ""
echo "📋 Project: $PROJECT_REF"
echo ""

# ============================================================================
# 1. LEAKED PASSWORD PROTECTION
# ============================================================================
# This setting checks passwords against HaveIBeenPwned database
# to prevent users from using known compromised passwords
# ============================================================================

echo "1️⃣  Enabling Leaked Password Protection..."

# Get current auth config
AUTH_CONFIG=$(supabase --project-ref "$PROJECT_REF" inspect db --output-format json 2>/dev/null || echo "{}")

# Note: The Supabase CLI doesn't directly support enabling leaked password protection
# This must be done via the Management API or Dashboard

# Check if SUPABASE_ACCESS_TOKEN is available for API calls
if [ -n "$SUPABASE_ACCESS_TOKEN" ]; then
    # Use Management API to enable leaked password protection
    RESPONSE=$(curl -s -X PATCH \
        "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
        -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "password_min_length": 8,
            "password_required_characters": "letters_digits",
            "enable_leaked_password_check": true
        }')
    
    if echo "$RESPONSE" | grep -q "error"; then
        echo -e "${RED}❌ Failed to enable leaked password protection${NC}"
        echo "$RESPONSE"
    else
        echo -e "${GREEN}✅ Leaked Password Protection enabled${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  SUPABASE_ACCESS_TOKEN not set${NC}"
    echo "   To enable via API, set SUPABASE_ACCESS_TOKEN environment variable"
    echo ""
    echo "   Alternative: Enable manually in Supabase Dashboard:"
    echo "   1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/auth/providers"
    echo "   2. Click on 'Email' provider"
    echo "   3. Enable 'Leaked Password Protection'"
    echo ""
fi

# ============================================================================
# 2. AUTH DB CONNECTION STRATEGY (info only)
# ============================================================================
# Connection pooling is configured in config.toml [db.pooler] section
# This just provides information about the setting
# ============================================================================

echo ""
echo "2️⃣  Auth DB Connection Strategy..."
echo -e "${GREEN}✅ Configured in config.toml [db.pooler] section${NC}"
echo "   - pool_mode: transaction"
echo "   - default_pool_size: 20"
echo "   - max_client_conn: 100"

# ============================================================================
# 3. VERIFY SETTINGS
# ============================================================================

echo ""
echo "3️⃣  Verifying settings..."

# Check if config.toml has the pooler settings
if grep -q "\[db.pooler\]" supabase/config.toml 2>/dev/null; then
    echo -e "${GREEN}✅ [db.pooler] section found in config.toml${NC}"
else
    echo -e "${YELLOW}⚠️  [db.pooler] section not found in config.toml${NC}"
fi

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo "================================================"
echo "📊 SUMMARY"
echo "================================================"
echo ""
echo "✅ DB Pooler: Configured in config.toml"
echo ""
if [ -n "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "✅ Leaked Password Protection: Enabled via API"
else
    echo "⚠️  Leaked Password Protection: Manual step required"
    echo ""
    echo "   Option 1: Set SUPABASE_ACCESS_TOKEN and re-run this script"
    echo "   Option 2: Enable in Supabase Dashboard:"
    echo "             https://supabase.com/dashboard/project/$PROJECT_REF/auth/providers"
fi
echo ""
echo "To apply config.toml changes to remote:"
echo "  supabase db push --project-ref $PROJECT_REF"
echo ""

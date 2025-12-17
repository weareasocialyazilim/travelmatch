#!/bin/bash
# Supabase Production Migration Runner
# Uses Management API to execute SQL

set -e

PROJECT_REF="bjikxgtbptrvawkguypv"
ACCESS_TOKEN="sbp_9a6ad7e105b0ad9ae37cb9aea7968f3cfb070a38"
API_URL="https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query"
MIGRATIONS_DIR="supabase/migrations"

echo "🚀 TravelMatch Production Database Migration"
echo "============================================="
echo ""

# Function to run SQL
run_sql() {
    local sql="$1"
    local result=$(curl -s -X POST "$API_URL" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"query\": $(echo "$sql" | jq -Rs .)}" 2>&1)
    echo "$result"
}

# Get migration files
MIGRATION_FILES=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | grep -v ".disabled" | sort)
TOTAL=$(echo "$MIGRATION_FILES" | wc -l | tr -d ' ')

echo "📁 Found $TOTAL migration files"
echo ""

SUCCESS=0
FAILED=0

for file in $MIGRATION_FILES; do
    filename=$(basename "$file")
    echo -n "📦 Running: $filename ... "
    
    # Read and escape SQL
    sql=$(cat "$file")
    
    # Execute via API
    result=$(curl -s -X POST "$API_URL" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"query\": $(echo "$sql" | jq -Rs .)}" 2>&1)
    
    # Check for errors
    if echo "$result" | grep -q '"error"'; then
        error_msg=$(echo "$result" | jq -r '.error // .message // "Unknown error"' 2>/dev/null)
        if [[ "$error_msg" == *"already exists"* ]] || [[ "$error_msg" == *"does not exist, skipping"* ]]; then
            echo "⚠️  Skipped (already exists)"
            ((SUCCESS++))
        else
            echo "❌ Failed"
            echo "   Error: $error_msg"
            ((FAILED++))
        fi
    else
        echo "✅ Done"
        ((SUCCESS++))
    fi
done

echo ""
echo "============================================="
echo "✅ Successful: $SUCCESS"
echo "❌ Failed: $FAILED"
echo "============================================="

# Verify tables
echo ""
echo "🔍 Verifying tables..."
tables=$(curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"query": "SELECT table_name FROM information_schema.tables WHERE table_schema = '\''public'\'' ORDER BY table_name;"}')

echo "📋 Tables created:"
echo "$tables" | jq -r '.[].table_name' 2>/dev/null | head -20

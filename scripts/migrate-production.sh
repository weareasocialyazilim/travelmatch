#!/bin/bash
# Production Database Migration Script using Supabase CLI
# This script applies all migrations to the production database

set -e

PROJECT_REF="bjikxgtbptrvawkguypv"
MIGRATIONS_DIR="supabase/migrations"

echo "🚀 Lovendo Production Database Migration"
echo "============================================="
echo ""

# Check if logged in
if ! supabase projects list &>/dev/null; then
    echo "❌ Not logged in to Supabase CLI"
    echo "Run: supabase login"
    exit 1
fi

echo "✅ Supabase CLI authenticated"
echo ""

# Get migration files in order
MIGRATION_FILES=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | grep -v ".disabled" | sort)

if [ -z "$MIGRATION_FILES" ]; then
    echo "❌ No migration files found in $MIGRATIONS_DIR"
    exit 1
fi

FILE_COUNT=$(echo "$MIGRATION_FILES" | wc -l | tr -d ' ')
echo "📁 Found $FILE_COUNT migration files"
echo ""

# Create combined migration file
COMBINED_FILE="/tmp/lovendo_combined_migration.sql"
echo "-- Lovendo Combined Migration" > "$COMBINED_FILE"
echo "-- Generated: $(date)" >> "$COMBINED_FILE"
echo "-- Project: $PROJECT_REF" >> "$COMBINED_FILE"
echo "" >> "$COMBINED_FILE"

for file in $MIGRATION_FILES; do
    filename=$(basename "$file")
    echo "-- ======================================" >> "$COMBINED_FILE"
    echo "-- Migration: $filename" >> "$COMBINED_FILE"
    echo "-- ======================================" >> "$COMBINED_FILE"
    cat "$file" >> "$COMBINED_FILE"
    echo "" >> "$COMBINED_FILE"
    echo "" >> "$COMBINED_FILE"
done

echo "✅ Combined migration file created: $COMBINED_FILE"
echo "   Size: $(wc -c < "$COMBINED_FILE" | tr -d ' ') bytes"
echo "   Lines: $(wc -l < "$COMBINED_FILE" | tr -d ' ')"
echo ""

# Show instructions for manual execution
echo "📋 MANUAL EXECUTION REQUIRED"
echo "=============================="
echo ""
echo "Due to connection pooler issues, please run the migration manually:"
echo ""
echo "1. Open Supabase Dashboard SQL Editor:"
echo "   https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo ""
echo "2. Copy the contents of: $COMBINED_FILE"
echo ""
echo "3. Paste into SQL Editor and click 'Run'"
echo ""
echo "Or use this command to copy to clipboard (macOS):"
echo "   cat $COMBINED_FILE | pbcopy"
echo ""

# Copy to clipboard if on macOS
if command -v pbcopy &>/dev/null; then
    read -p "📋 Copy migration SQL to clipboard? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cat "$COMBINED_FILE" | pbcopy
        echo "✅ Copied to clipboard! Paste in Supabase SQL Editor."
    fi
fi

echo ""
echo "After running the migration, verify with:"
echo "   curl -s 'https://$PROJECT_REF.supabase.co/rest/v1/users?select=id&limit=1' \\"
echo "     -H 'apikey: YOUR_ANON_KEY'"

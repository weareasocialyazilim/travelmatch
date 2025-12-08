#!/bin/bash

# GDPR Data Export - Production Deployment Script
# This script deploys the GDPR-compliant data export edge function to Supabase

set -e  # Exit on error

echo "🚀 GDPR Data Export - Production Deployment"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo ""
    echo "Install it with:"
    echo "  npm install -g supabase"
    echo "  or"
    echo "  brew install supabase/tap/supabase"
    exit 1
fi

echo -e "${GREEN}✓${NC} Supabase CLI found"

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo -e "${YELLOW}⚠${NC}  Not logged in to Supabase"
    echo ""
    echo "Logging in..."
    supabase login
fi

echo -e "${GREEN}✓${NC} Authenticated with Supabase"
echo ""

# List available projects
echo "📋 Available Supabase Projects:"
echo "================================"
supabase projects list
echo ""

# Ask for project reference
read -p "Enter your project reference ID: " PROJECT_REF

if [ -z "$PROJECT_REF" ]; then
    echo -e "${RED}❌ Project reference is required${NC}"
    exit 1
fi

echo ""
echo "🔗 Linking to project: $PROJECT_REF"
supabase link --project-ref "$PROJECT_REF"

echo ""
echo "📦 Deploying export-user-data edge function..."
echo "=============================================="

# Deploy the edge function
supabase functions deploy export-user-data --no-verify-jwt

echo ""
echo -e "${GREEN}✓${NC} Edge function deployed successfully!"
echo ""

# Verify deployment
echo "🔍 Verifying deployment..."
supabase functions list

echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Create audit_logs table (if not exists):"
echo "   Run this SQL in Supabase SQL Editor:"
echo ""
echo "   CREATE TABLE IF NOT EXISTS audit_logs ("
echo "     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),"
echo "     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,"
echo "     action TEXT NOT NULL,"
echo "     details JSONB,"
echo "     ip_address TEXT,"
echo "     user_agent TEXT,"
echo "     created_at TIMESTAMPTZ DEFAULT NOW()"
echo "   );"
echo ""
echo "   CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);"
echo "   CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);"
echo ""
echo "   ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;"
echo ""
echo "   CREATE POLICY \"Users can read own audit logs\""
echo "     ON audit_logs FOR SELECT"
echo "     USING (auth.uid() = user_id);"
echo ""
echo "   CREATE POLICY \"Service role can insert audit logs\""
echo "     ON audit_logs FOR INSERT"
echo "     WITH CHECK (true);"
echo ""
echo "2. Test the export with a real user account"
echo ""
echo "3. Update privacy policy to mention data export feature"
echo ""
echo "4. Publish user documentation"
echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📚 Full documentation: docs/GDPR_DATA_EXPORT_IMPLEMENTATION.md"

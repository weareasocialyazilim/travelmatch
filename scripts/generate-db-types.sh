#!/bin/bash

# ====================================================================
# Supabase Database Type Generation Script
# ====================================================================
# 
# Generates TypeScript types from Supabase schema
# Supports both local (Docker) and remote (production) generation
#
# Usage:
#   ./scripts/generate-db-types.sh [local|remote]
#
# Requirements:
#   - Supabase CLI installed: brew install supabase/tap/supabase
#   - For local: Docker running + supabase start
#   - For remote: SUPABASE_ACCESS_TOKEN env variable set
# ====================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
OUTPUT_FILE="apps/mobile/src/types/database.types.ts"
PROJECT_ID="isvstmzuyxuwptrrhkyi"
MODE="${1:-remote}"  # Default to remote if no argument

echo -e "${BLUE}🔧 Supabase Type Generation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo -e "${YELLOW}Install with: brew install supabase/tap/supabase${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Supabase CLI found${NC}"
echo -e "   Version: $(supabase --version)"
echo ""

# Function to generate types from local instance
generate_local() {
    echo -e "${BLUE}📦 Generating types from LOCAL Supabase...${NC}"
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker is not running${NC}"
        echo -e "${YELLOW}Please start Docker and run: supabase start${NC}"
        exit 1
    fi
    
    # Check if Supabase is running
    if ! supabase status &> /dev/null; then
        echo -e "${RED}❌ Supabase is not running${NC}"
        echo -e "${YELLOW}Starting Supabase...${NC}"
        supabase start
    fi
    
    echo -e "${GREEN}✅ Local Supabase is running${NC}"
    echo ""
    
    # Generate types
    echo -e "${BLUE}🔨 Generating TypeScript types...${NC}"
    supabase gen types typescript --local > "$OUTPUT_FILE"
}

# Function to generate types from remote instance
generate_remote() {
    echo -e "${BLUE}☁️  Generating types from REMOTE Supabase...${NC}"
    echo -e "   Project ID: ${PROJECT_ID}"
    echo ""
    
    # Check if access token is set
    if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
        echo -e "${YELLOW}⚠️  SUPABASE_ACCESS_TOKEN not set${NC}"
        echo -e "${YELLOW}📝 Get your token from: https://app.supabase.com/account/tokens${NC}"
        echo -e ""
        echo -e "${BLUE}Enter your Supabase access token:${NC}"
        read -s SUPABASE_ACCESS_TOKEN
        export SUPABASE_ACCESS_TOKEN
        echo ""
    fi
    
    # Login to Supabase with token flag
    echo -e "${BLUE}🔐 Authenticating with Supabase...${NC}"
    supabase login --token "$SUPABASE_ACCESS_TOKEN"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Authentication failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Authenticated successfully${NC}"
    echo ""
    
    # Generate types
    echo -e "${BLUE}🔨 Generating TypeScript types...${NC}"
    supabase gen types typescript --project-id "$PROJECT_ID" > "$OUTPUT_FILE"
}

# Main execution
echo -e "${BLUE}Mode: ${MODE}${NC}"
echo ""

case "$MODE" in
    local)
        generate_local
        ;;
    remote|production)
        generate_remote
        ;;
    *)
        echo -e "${RED}❌ Invalid mode: $MODE${NC}"
        echo -e "${YELLOW}Usage: $0 [local|remote]${NC}"
        exit 1
        ;;
esac

# Check if generation was successful
if [ $? -eq 0 ] && [ -f "$OUTPUT_FILE" ]; then
    echo -e ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Types generated successfully!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e ""
    echo -e "   📄 Output: ${OUTPUT_FILE}"
    echo -e "   📊 Size: $(wc -l < "$OUTPUT_FILE") lines"
    echo -e ""
    
    # Show first few lines as preview
    echo -e "${BLUE}📋 Preview (first 10 lines):${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    head -10 "$OUTPUT_FILE"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e ""
    
    # Add header comment to file
    TEMP_FILE=$(mktemp)
    cat > "$TEMP_FILE" << 'EOF'
/**
 * Supabase Database Types
 * 
 * Auto-generated from Supabase schema
 * DO NOT EDIT MANUALLY - Run `pnpm db:generate-types` to regenerate
 * 
 * Generated: $(date)
 * Mode: $MODE
 */

EOF
    cat "$OUTPUT_FILE" >> "$TEMP_FILE"
    mv "$TEMP_FILE" "$OUTPUT_FILE"
    
    echo -e "${GREEN}🎉 Type generation complete!${NC}"
    echo -e ""
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo -e "   1. Review the generated types in ${OUTPUT_FILE}"
    echo -e "   2. Update imports in your code to use the new types"
    echo -e "   3. Run 'pnpm type-check' to verify everything compiles"
    echo -e ""
else
    echo -e ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Type generation failed${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo -e "   - Check Supabase CLI version: supabase --version"
    echo -e "   - Verify project ID: ${PROJECT_ID}"
    echo -e "   - Check access token is valid"
    echo -e "   - For local: Ensure Docker and Supabase are running"
    echo -e ""
    exit 1
fi

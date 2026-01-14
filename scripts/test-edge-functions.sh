#!/bin/bash
# Test Edge Functions Deployment
# Usage: ./test-edge-functions.sh

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing Edge Functions Deployment"
echo "======================================"
echo ""

# Get Supabase project details
PROJECT_REF=$(supabase status 2>/dev/null | grep "Project ID" | awk '{print $3}' || echo "")
if [ -z "$PROJECT_REF" ]; then
  PROJECT_REF="bjikxgtbptrvawkguypv" # Fallback to known project
fi

SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
SUPABASE_ANON_KEY=$(supabase status 2>/dev/null | grep "anon key" | awk '{print $3}' || echo "")

echo "📍 Project: $PROJECT_REF"
echo "🔗 URL: $SUPABASE_URL"
echo ""

# Check if user is authenticated
echo "⚠️  Note: You need a valid user access token to test these endpoints"
echo "   Get your token from: https://supabase.com/dashboard/project/$PROJECT_REF/auth/users"
echo ""
read -p "Enter your user access token (or press Enter to skip auth tests): " ACCESS_TOKEN
echo ""

# Test 1: Check if Edge Functions are deployed
echo "📋 Test 1: Checking deployed functions..."
echo "----------------------------------------"
FUNCTIONS=$(supabase functions list 2>/dev/null | grep -E "transcribe-video|upload-image" || echo "")
if [[ $FUNCTIONS == *"transcribe-video"* ]]; then
  echo -e "${GREEN}✅ transcribe-video is deployed${NC}"
else
  echo -e "${RED}❌ transcribe-video is NOT deployed${NC}"
fi

if [[ $FUNCTIONS == *"upload-image"* ]]; then
  echo -e "${GREEN}✅ upload-image is deployed${NC}"
else
  echo -e "${RED}❌ upload-image is NOT deployed${NC}"
fi
echo ""

# Test 2: Check secrets are set
echo "📋 Test 2: Checking required secrets..."
echo "----------------------------------------"
SECRETS=$(supabase secrets list 2>/dev/null || echo "")

check_secret() {
  local secret_name=$1
  if [[ $SECRETS == *"$secret_name"* ]]; then
    echo -e "${GREEN}✅ $secret_name is set${NC}"
  else
    echo -e "${YELLOW}⚠️  $secret_name is NOT set${NC}"
    echo "   Set it with: supabase secrets set $secret_name=your-value"
  fi
}

check_secret "OPENAI_API_KEY"
check_secret "CLOUDFLARE_ACCOUNT_ID"
check_secret "CLOUDFLARE_IMAGES_TOKEN"
echo ""

# Test 3: Test transcribe-video endpoint (requires auth)
if [ ! -z "$ACCESS_TOKEN" ]; then
  echo "📋 Test 3: Testing transcribe-video endpoint..."
  echo "------------------------------------------------"
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "${SUPABASE_URL}/functions/v1/transcribe-video" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
      "videoId": "test-video-123",
      "audioUrl": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      "language": "en"
    }' 2>/dev/null || echo -e "\n500")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)
  
  echo "HTTP Status: $HTTP_CODE"
  echo "Response: $BODY"
  
  if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
    echo -e "${GREEN}✅ transcribe-video endpoint is working${NC}"
  elif [ "$HTTP_CODE" == "401" ]; then
    echo -e "${YELLOW}⚠️  Authentication required (expected)${NC}"
  elif [ "$HTTP_CODE" == "500" ]; then
    echo -e "${YELLOW}⚠️  Server error - check if OPENAI_API_KEY is set${NC}"
  else
    echo -e "${RED}❌ transcribe-video endpoint failed${NC}"
  fi
  echo ""
else
  echo "📋 Test 3: Skipped (no access token provided)"
  echo ""
fi

# Test 4: Test upload-image endpoint (requires auth and file)
if [ ! -z "$ACCESS_TOKEN" ]; then
  echo "📋 Test 4: Testing upload-image endpoint..."
  echo "-------------------------------------------"
  
  # Create a small test image (1x1 pixel PNG)
  TEST_IMAGE="/tmp/test-image.png"
  echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > "$TEST_IMAGE" 2>/dev/null || echo ""
  
  if [ -f "$TEST_IMAGE" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
      "${SUPABASE_URL}/functions/v1/upload-image" \
      -H "Authorization: Bearer ${ACCESS_TOKEN}" \
      -H "apikey: ${SUPABASE_ANON_KEY}" \
      -F "file=@${TEST_IMAGE}" \
      -F 'metadata={"type":"test"}' 2>/dev/null || echo -e "\n500")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    echo "HTTP Status: $HTTP_CODE"
    echo "Response: $BODY"
    
    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
      echo -e "${GREEN}✅ upload-image endpoint is working${NC}"
    elif [ "$HTTP_CODE" == "401" ]; then
      echo -e "${YELLOW}⚠️  Authentication required (expected)${NC}"
    elif [ "$HTTP_CODE" == "500" ]; then
      echo -e "${YELLOW}⚠️  Server error - check if CLOUDFLARE credentials are set${NC}"
    else
      echo -e "${RED}❌ upload-image endpoint failed${NC}"
    fi
    
    rm -f "$TEST_IMAGE"
  else
    echo -e "${YELLOW}⚠️  Could not create test image${NC}"
  fi
  echo ""
else
  echo "📋 Test 4: Skipped (no access token provided)"
  echo ""
fi

# Test 5: Check database tables
echo "📋 Test 5: Checking database tables..."
echo "---------------------------------------"
echo "Checking if tables exist via Supabase CLI..."

# Note: This requires database access
TABLES_CHECK="Skipped - requires database connection"
echo "$TABLES_CHECK"
echo ""

# Summary
echo "======================================"
echo "📊 Test Summary"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Set required secrets if not already set:"
echo "   supabase secrets set OPENAI_API_KEY=sk-..."
echo "   supabase secrets set CLOUDFLARE_IMAGES_TOKEN=..."
echo ""
echo "2. Check Edge Function logs:"
echo "   supabase functions logs transcribe-video"
echo "   supabase functions logs upload-image"
echo ""
echo "3. Monitor in Dashboard:"
echo "   https://supabase.com/dashboard/project/$PROJECT_REF/functions"
echo ""
echo "4. Test from mobile app:"
echo "   - Update EXPO_PUBLIC_SUPABASE_URL in .env"
echo "   - Test video transcription feature"
echo "   - Test image upload feature"
echo ""

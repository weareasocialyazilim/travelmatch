#!/bin/bash
# Monitor Edge Functions
# Usage: ./monitor-edge-functions.sh [function-name]

FUNCTION_NAME=${1:-"all"}

echo "📊 Monitoring Edge Functions"
echo "=============================="
echo ""

# Project info
PROJECT_REF="bjikxgtbptrvawkguypv"
DASHBOARD_URL="https://supabase.com/dashboard/project/$PROJECT_REF"

echo "🔗 Project: $PROJECT_REF"
echo "📍 Dashboard: $DASHBOARD_URL/functions"
echo ""

# List functions
echo "📋 Deployed Functions:"
echo "----------------------"
supabase functions list
echo ""

# Show secrets (hashed)
echo "🔐 Configured Secrets:"
echo "---------------------"
supabase secrets list
echo ""

# Instructions for viewing logs
echo "📊 View Logs:"
echo "-------------"
echo "Logs are best viewed in the Supabase Dashboard:"
echo ""
echo "1. Transcribe-Video Logs:"
echo "   $DASHBOARD_URL/functions/transcribe-video/logs"
echo ""
echo "2. Upload-Image Logs:"
echo "   $DASHBOARD_URL/functions/upload-image/logs"
echo ""

# Cost monitoring
echo "💰 Cost Monitoring:"
echo "-------------------"
echo "Monitor API usage and costs at:"
echo ""
echo "• OpenAI Usage: https://platform.openai.com/usage"
echo "• Cloudflare Analytics: https://dash.cloudflare.com/"
echo "• Supabase Dashboard: https://supabase.com/dashboard"
echo ""

# Usage stats query
echo "📈 Database Usage Stats:"
echo "------------------------"
echo "Run these SQL queries in Supabase Dashboard → SQL Editor:"
echo ""
echo "-- Transcription usage (last 30 days)"
echo "SELECT "
echo "  COUNT(*) as total_transcriptions,"
echo "  SUM(duration) / 60 as total_minutes,"
echo "  SUM(duration) / 60 * 0.006 as estimated_cost_usd"
echo "FROM video_transcriptions"
echo "WHERE created_at > NOW() - INTERVAL '30 days';"
echo ""
echo "-- Image upload usage (last 30 days)"
echo "SELECT "
echo "  COUNT(*) as total_uploads,"
echo "  type,"
echo "  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage"
echo "FROM uploaded_images"
echo "WHERE created_at > NOW() - INTERVAL '30 days'"
echo "GROUP BY type;"
echo ""

# Health check
echo "🏥 Quick Health Check:"
echo "----------------------"

# Check if functions respond (without auth)
check_endpoint() {
  local name=$1
  local url="https://${PROJECT_REF}.supabase.co/functions/v1/$name"
  
  echo -n "Checking $name... "
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
  
  if [ "$STATUS" == "401" ] || [ "$STATUS" == "403" ]; then
    echo "✅ Online (auth required - expected)"
  elif [ "$STATUS" == "200" ]; then
    echo "✅ Online"
  else
    echo "⚠️  Status: $STATUS"
  fi
}

check_endpoint "transcribe-video"
check_endpoint "upload-image"

echo ""
echo "=============================="
echo "✅ Monitoring check complete"
echo ""

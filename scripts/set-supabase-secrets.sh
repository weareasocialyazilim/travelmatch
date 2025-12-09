#!/bin/bash
# Set Supabase Edge Function Secrets
# Usage: Edit this file with your actual keys, then run: ./set-secrets.sh

set -e

echo "🔐 Setting Supabase Edge Function Secrets"
echo "=========================================="
echo ""

# ⚠️ IMPORTANT: Replace these with your actual API keys
# Get them from:
# - OpenAI: https://platform.openai.com/api-keys
# - Cloudflare: https://dash.cloudflare.com/
# - Upstash: https://console.upstash.com/

# Uncomment and add your real keys:

# OpenAI API Key (for video transcription)
# supabase secrets set OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxx"

# Cloudflare Images (for image uploads)
# supabase secrets set CLOUDFLARE_ACCOUNT_ID="your-account-id"
# supabase secrets set CLOUDFLARE_IMAGES_TOKEN="your-images-token"

# Upstash Redis (for rate limiting)
# supabase secrets set UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
# supabase secrets set UPSTASH_REDIS_REST_TOKEN="your-token"

echo ""
echo "✅ Secrets set successfully!"
echo ""
echo "Verify with:"
echo "  supabase secrets list"
echo ""
echo "Then deploy/redeploy functions:"
echo "  supabase functions deploy transcribe-video"
echo "  supabase functions deploy upload-image"
echo ""

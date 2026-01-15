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
# - Twilio: https://console.twilio.com/
# - SendGrid: https://app.sendgrid.com/settings/api_keys
# - Upstash: https://console.upstash.com/

# Uncomment and add your real keys:

# OpenAI API Key (for video transcription)
# supabase secrets set OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxx"

# Cloudflare Images (for image uploads)
# supabase secrets set CLOUDFLARE_ACCOUNT_ID="your-account-id"
# supabase secrets set CLOUDFLARE_IMAGES_TOKEN="your-images-token"

# Twilio (for SMS/Phone Verification)
# supabase secrets set TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxx"
# supabase secrets set TWILIO_AUTH_TOKEN="your-auth-token"
# supabase secrets set TWILIO_PHONE_NUMBER="+1234567890"
# supabase secrets set TWILIO_VERIFY_SERVICE_SID="VAxxxxxxxxxxxxxx"

# SendGrid (for Email)
# supabase secrets set SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"
# supabase secrets set SENDGRID_FROM_EMAIL="noreply@lovendo.app"
# supabase secrets set SENDGRID_FROM_NAME="Lovendo"

echo ""
echo "✅ Secrets set successfully!"
echo ""
echo "Verify with:"
echo "  supabase secrets list"
echo ""
echo "Then deploy/redeploy functions:"
echo "  supabase functions deploy twilio-sms"
echo "  supabase functions deploy sendgrid-email"
echo "  supabase functions deploy transcribe-video"
echo "  supabase functions deploy upload-image"
echo ""

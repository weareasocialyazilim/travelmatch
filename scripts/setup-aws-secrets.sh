#!/bin/bash

# Setup AWS for Supabase Checks
# Configures the necessary secrets for the AWS Rekognition integration

echo "🔌 AWS Rekognition Setup for Supabase"
echo "====================================="
echo ""

# Check for supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    exit 1
fi

echo "This script will help you configure AWS credentials for the AI moderation features."
echo "You need an IAM User with 'AmazonRekognitionFullAccess' (or limited policy)."
echo ""

read -p "Enter AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -s -p "Enter AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
echo ""
read -p "Enter AWS Region (default: eu-central-1): " AWS_REGION
AWS_REGION=${AWS_REGION:-eu-central-1}

if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ Keys cannot be empty."
    exit 1
fi

echo ""
echo "🚀 Setting secrets in Supabase..."

supabase secrets set AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
supabase secrets set AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
supabase secrets set AWS_REGION=$AWS_REGION

echo ""
echo "✅ AWS Credentials configured successfully!"
echo "The Edge Function 'handle-storage-upload' can now access AWS Rekognition."

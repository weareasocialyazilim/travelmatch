#!/bin/bash

# LocalStack Initialization Script
# This script runs when LocalStack is ready and sets up AWS resources

echo "🚀 Initializing LocalStack resources for TravelMatch..."

# Wait for LocalStack to be fully ready
echo "⏳ Waiting for LocalStack..."
until curl -s http://localhost:4566/_localstack/health | grep -q "\"s3\": \"running\""; do
  echo "   Waiting for LocalStack services..."
  sleep 2
done

echo "✅ LocalStack is ready!"

# Set AWS credentials for local development
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
export AWS_ENDPOINT_URL=http://localhost:4566

# ============================================================================
# S3 Buckets
# ============================================================================

echo "📦 Creating S3 buckets..."

# User uploads bucket
awslocal s3 mb s3://travelmatch-uploads || echo "   ℹ️  Bucket already exists: travelmatch-uploads"
awslocal s3api put-bucket-cors --bucket travelmatch-uploads --cors-configuration '{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }]
}'

# Profile images bucket
awslocal s3 mb s3://travelmatch-profile-images || echo "   ℹ️  Bucket already exists: travelmatch-profile-images"

# Moment images bucket
awslocal s3 mb s3://travelmatch-moment-images || echo "   ℹ️  Bucket already exists: travelmatch-moment-images"

# Video processing bucket
awslocal s3 mb s3://travelmatch-videos || echo "   ℹ️  Bucket already exists: travelmatch-videos"

# Thumbnails bucket
awslocal s3 mb s3://travelmatch-thumbnails || echo "   ℹ️  Bucket already exists: travelmatch-thumbnails"

echo "✅ S3 buckets created"

# ============================================================================
# SQS Queues
# ============================================================================

echo "📮 Creating SQS queues..."

# Image processing queue
awslocal sqs create-queue --queue-name travelmatch-image-processing || echo "   ℹ️  Queue already exists"

# Video processing queue
awslocal sqs create-queue --queue-name travelmatch-video-processing || echo "   ℹ️  Queue already exists"

# Notification queue
awslocal sqs create-queue --queue-name travelmatch-notifications || echo "   ℹ️  Queue already exists"

# Email queue
awslocal sqs create-queue --queue-name travelmatch-emails || echo "   ℹ️  Queue already exists"

# Dead letter queue
awslocal sqs create-queue --queue-name travelmatch-dlq || echo "   ℹ️  Queue already exists"

echo "✅ SQS queues created"

# ============================================================================
# SNS Topics
# ============================================================================

echo "📢 Creating SNS topics..."

# User events topic
awslocal sns create-topic --name travelmatch-user-events || echo "   ℹ️  Topic already exists"

# Moment events topic
awslocal sns create-topic --name travelmatch-moment-events || echo "   ℹ️  Topic already exists"

# Match events topic
awslocal sns create-topic --name travelmatch-match-events || echo "   ℹ️  Topic already exists"

# Payment events topic
awslocal sns create-topic --name travelmatch-payment-events || echo "   ℹ️  Topic already exists"

echo "✅ SNS topics created"

# ============================================================================
# DynamoDB Tables
# ============================================================================

echo "🗄️  Creating DynamoDB tables..."

# Session storage table
awslocal dynamodb create-table \
  --table-name travelmatch-sessions \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=sessionId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=sessionId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  || echo "   ℹ️  Table already exists: travelmatch-sessions"

# Rate limiting table
awslocal dynamodb create-table \
  --table-name travelmatch-rate-limits \
  --attribute-definitions \
    AttributeName=key,AttributeType=S \
  --key-schema \
    AttributeName=key,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --time-to-live-specification Enabled=true,AttributeName=ttl \
  || echo "   ℹ️  Table already exists: travelmatch-rate-limits"

echo "✅ DynamoDB tables created"

# ============================================================================
# Summary
# ============================================================================

echo ""
echo "============================================"
echo "✅ LocalStack initialization complete!"
echo "============================================"
echo ""
echo "📦 S3 Buckets:"
awslocal s3 ls
echo ""
echo "📮 SQS Queues:"
awslocal sqs list-queues
echo ""
echo "📢 SNS Topics:"
awslocal sns list-topics
echo ""
echo "🗄️  DynamoDB Tables:"
awslocal dynamodb list-tables
echo ""
echo "🌐 LocalStack Dashboard: http://localhost:4566/_localstack/health"
echo "============================================"

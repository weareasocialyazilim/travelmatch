# 🚀 Edge Functions Deployment Guide

## Overview

This guide covers deploying and testing the secure server-side Edge Functions for:
- **Video Transcription** (OpenAI Whisper API)
- **Image Upload** (Cloudflare Images CDN)

These functions prevent sensitive API keys from being exposed in the client bundle.

---

## Prerequisites

### Required Environment Variables

Set these in **Supabase Dashboard → Project Settings → Edge Functions → Secrets**:

```bash
# OpenAI API Key (for video transcription)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Cloudflare Images (for image uploads)
CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLOUDFLARE_IMAGES_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase (should already exist)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

### Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

### Login to Supabase

```bash
supabase login
```

---

## Deployment Steps

### 1. Link to Your Project

```bash
cd /Users/kemalteksal/Documents/travelmatch-new
supabase link --project-ref <your-project-ref>
```

### 2. Set Environment Secrets

```bash
# Set OpenAI API Key
supabase secrets set OPENAI_API_KEY=sk-xxxxx

# Set Cloudflare credentials
supabase secrets set CLOUDFLARE_ACCOUNT_ID=xxxxx
supabase secrets set CLOUDFLARE_IMAGES_TOKEN=xxxxx

# Set Upstash Redis (for rate limiting)
supabase secrets set UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
supabase secrets set UPSTASH_REDIS_REST_TOKEN=xxxxx

# Verify secrets are set
supabase secrets list
```

### 3. Deploy Edge Functions

```bash
# Deploy transcribe-video function
supabase functions deploy transcribe-video

# Deploy upload-image function
supabase functions deploy upload-image

# Or deploy all functions at once
supabase functions deploy
```

### 4. Verify Deployment

```bash
# List deployed functions
supabase functions list

# Check function logs
supabase functions logs transcribe-video
supabase functions logs upload-image
```

---

## Database Setup

### Create Required Tables

Run these SQL migrations in **Supabase Dashboard → SQL Editor**:

#### 1. Video Transcriptions Table

```sql
-- Table to cache video transcriptions
CREATE TABLE IF NOT EXISTS video_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcription_text TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  duration NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for fast lookups
  UNIQUE(video_id),
  INDEX idx_video_transcriptions_user_id ON video_transcriptions(user_id),
  INDEX idx_video_transcriptions_created_at ON video_transcriptions(created_at)
);

-- RLS Policies
ALTER TABLE video_transcriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own transcriptions
CREATE POLICY "Users can read own transcriptions"
  ON video_transcriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert (Edge Function uses service role)
CREATE POLICY "Service role can insert transcriptions"
  ON video_transcriptions
  FOR INSERT
  WITH CHECK (true);
```

#### 2. Uploaded Images Table

```sql
-- Table to track uploaded images
CREATE TABLE IF NOT EXISTS uploaded_images (
  id TEXT PRIMARY KEY, -- Cloudflare image ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  variants TEXT[] NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL,
  metadata JSONB,
  type TEXT NOT NULL DEFAULT 'general', -- avatar, moment, gift, proof, general
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_uploaded_images_user_id ON uploaded_images(user_id),
  INDEX idx_uploaded_images_type ON uploaded_images(type),
  INDEX idx_uploaded_images_created_at ON uploaded_images(created_at)
);

-- RLS Policies
ALTER TABLE uploaded_images ENABLE ROW LEVEL SECURITY;

-- Users can read their own uploads
CREATE POLICY "Users can read own uploads"
  ON uploaded_images
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert (Edge Function uses service role)
CREATE POLICY "Service role can insert uploads"
  ON uploaded_images
  FOR INSERT
  WITH CHECK (true);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
  ON uploaded_images
  FOR DELETE
  USING (auth.uid() = user_id);
```

---

## Testing

### Test Transcribe-Video Function

```bash
# Test with curl (replace with your tokens)
curl -X POST \
  'https://<your-project-ref>.supabase.co/functions/v1/transcribe-video' \
  -H 'Authorization: Bearer <user-access-token>' \
  -H 'apikey: <supabase-anon-key>' \
  -H 'Content-Type: application/json' \
  -d '{
    "videoId": "test-video-123",
    "audioUrl": "https://example.com/audio.mp3",
    "language": "en"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "text": "Transcribed text content...",
    "language": "en",
    "duration": 45.2,
    "cached": false
  }
}
```

### Test Upload-Image Function

```bash
# Test with curl (replace with your tokens)
curl -X POST \
  'https://<your-project-ref>.supabase.co/functions/v1/upload-image' \
  -H 'Authorization: Bearer <user-access-token>' \
  -H 'apikey: <supabase-anon-key>' \
  -F 'file=@/path/to/image.jpg' \
  -F 'metadata={"type":"avatar"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "cloudflare-image-id",
    "filename": "image.jpg",
    "url": "https://imagedelivery.net/.../public",
    "variants": [
      "https://imagedelivery.net/.../public",
      "https://imagedelivery.net/.../thumbnail"
    ],
    "uploaded": "2025-12-08T12:00:00.000Z"
  }
}
```

### Test from Mobile App

#### Transcription Test

```typescript
import { videoService } from '../services/video-service';

async function testTranscription() {
  try {
    const transcript = await videoService.generateTranscript(
      'video-id-123',
      'en'
    );
    console.log('✅ Transcription:', transcript);
  } catch (error) {
    console.error('❌ Transcription failed:', error);
  }
}
```

#### Image Upload Test

```typescript
import { uploadImage } from '../services/imageUploadService';

async function testImageUpload() {
  try {
    const result = await uploadImage(
      'file:///path/to/image.jpg',
      { type: 'avatar' }
    );
    console.log('✅ Upload successful:', result);
  } catch (error) {
    console.error('❌ Upload failed:', error);
  }
}
```

---

## Rate Limiting

### Current Limits

| Function | Limit | Window | Per |
|----------|-------|--------|-----|
| `transcribe-video` | 10 requests | 1 hour | User |
| `upload-image` | 50 requests | 1 hour | User |

### Modify Rate Limits

Edit the rate limiter in each function:

```typescript
// supabase/functions/transcribe-video/index.ts
const rateLimiter = createUpstashRateLimiter({
  maxRequests: 20, // ← Change this
  windowMs: 3600 * 1000, // 1 hour
});
```

Then redeploy:

```bash
supabase functions deploy transcribe-video
```

---

## Monitoring & Debugging

### View Function Logs

```bash
# Real-time logs
supabase functions logs transcribe-video --tail

# Filter by time range
supabase functions logs upload-image --since 1h

# Filter by level
supabase functions logs transcribe-video --level error
```

### Common Issues

#### 1. "Missing authorization header"

**Cause:** Client not sending auth token

**Fix:**
```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) throw new Error('Not authenticated');

// Include in request
headers: {
  'Authorization': `Bearer ${session.access_token}`,
}
```

#### 2. "Rate limit exceeded"

**Cause:** Too many requests in short time

**Fix:**
- Wait for rate limit window to reset
- Implement client-side retry with backoff
- Increase rate limits if legitimate use

#### 3. "OPENAI_API_KEY is required"

**Cause:** Environment secret not set

**Fix:**
```bash
supabase secrets set OPENAI_API_KEY=sk-xxxxx
supabase functions deploy transcribe-video
```

#### 4. "Failed to download audio file"

**Cause:** Invalid audio URL or network issue

**Fix:**
- Verify audio URL is accessible
- Check CORS settings on audio host
- Ensure URL uses HTTPS

---

## Cost Optimization

### Transcription Caching

Transcriptions are cached in `video_transcriptions` table:
- First request: Calls OpenAI API (~$0.006/minute)
- Subsequent requests: Instant from database (free)

### Image Upload Optimization

- Images stored in Cloudflare Images
- Automatic WebP/AVIF conversion
- Global CDN delivery
- Pay-per-image pricing (~$5/100k images stored)

### Monitor Usage

```sql
-- Check transcription usage
SELECT 
  COUNT(*) as total_transcriptions,
  SUM(duration) / 60 as total_minutes,
  SUM(duration) / 60 * 0.006 as estimated_cost_usd
FROM video_transcriptions
WHERE created_at > NOW() - INTERVAL '30 days';

-- Check upload usage
SELECT 
  COUNT(*) as total_uploads,
  user_id,
  type
FROM uploaded_images
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id, type
ORDER BY COUNT(*) DESC;
```

---

## Security Checklist

Before deploying to production:

- [ ] All secrets set in Supabase Edge Functions (not in .env)
- [ ] RLS policies enabled on all tables
- [ ] Rate limiting configured appropriately
- [ ] Client code using authenticated requests
- [ ] No API keys in client bundle (verify with security checks)
- [ ] Error messages don't leak sensitive info
- [ ] Logging sanitized (no tokens in logs)
- [ ] CORS configured correctly
- [ ] File upload validation (size, type, dimensions)

---

## Rollback Plan

If you need to rollback a deployment:

```bash
# View deployment history
supabase functions list --project-ref <your-project-ref>

# Redeploy previous version
git checkout <previous-commit>
supabase functions deploy transcribe-video

# Or disable function temporarily
# (Set environment variable to disable)
supabase secrets set DISABLE_TRANSCRIPTION=true
```

---

## Next Steps

1. ✅ Deploy Edge Functions
2. ✅ Create database tables
3. ✅ Set environment secrets
4. ✅ Test with curl/Postman
5. ✅ Test from mobile app
6. ✅ Monitor logs for errors
7. ✅ Set up alerts for rate limits
8. ✅ Document for team

---

## Support

- **Supabase Docs:** https://supabase.com/docs/guides/functions
- **OpenAI API:** https://platform.openai.com/docs
- **Cloudflare Images:** https://developers.cloudflare.com/images
- **Team Slack:** #backend-help

---

**Last Updated:** December 8, 2025  
**Author:** Security Team  
**Status:** Production Ready ✅

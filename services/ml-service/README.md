# ML Service - AI-Powered Gift Verification

## Overview

TravelMatch ML Service provides AI-powered verification and analysis for the gift experience
platform. When someone gifts a travel experience, the recipient must prove they completed it before
funds are released from escrow.

## What is TravelMatch?

TravelMatch is a **gift platform for travel experiences**:

1. **Create a Moment** — Define a travel experience you want to gift
2. **Gift & Send** — Send it to someone with funds held in escrow
3. **Prove It** — Recipient uploads proof (photos, location, receipts)
4. **Release Funds** — AI verifies the proof, money transfers automatically

## ML Service Capabilities

### 1. Proof Verification (KYC & Experience)

**Purpose**: Verify user identity and experience completion

```
POST /proof/verify

Input: {
  "imageUrl": "https://storage.../proof.jpg",
  "proofType": "selfie_with_id" | "experience_photo" | "receipt",
  "userId": "uuid",
  "momentId": "uuid"  // Optional, for experience proofs
}

AI Processing:
├── Face Detection (MediaPipe)
├── ID Card Detection (Edge detection + OCR)
├── Location Verification (EXIF metadata)
├── Image Quality Assessment (blur, brightness)
└── Fraud Detection (manipulation checks)

Output: {
  "overall": 85,
  "approved": true,
  "breakdown": {
    "faceQuality": 90,
    "idQuality": 80,
    "locationMatch": 95,
    "imageAuthenticity": 88
  },
  "issues": [],
  "suggestions": []
}
```

### 2. Gift Offer Analysis

**Purpose**: Analyze premium subscriber offers for "Reddedilemez Teklif" (Irresistible Offer)
notifications

```
POST /offer/analyze

Input: {
  "offerAmount": 1500,
  "requestedAmount": 1000,
  "senderTier": "platinum",
  "senderHistory": {
    "completedGifts": 12,
    "avgRating": 4.8
  }
}

Output: {
  "priority": "critical",
  "offerScore": 92.5,
  "valueRatio": 1.5,
  "notificationSound": "liquid_shine",
  "recommendation": "🔥 Yüksek değerli Platinum teklif! 50% fazla sunuluyor.",
  "isIrresistible": true
}
```

### 3. Content Moderation

**Purpose**: Auto-moderate user-generated content (moments, messages, proofs)

```
POST /content/moderate

Input: {
  "contentType": "moment" | "message" | "proof",
  "contentUrl": "https://...",
  "text": "Optional text content"
}

Output: {
  "approved": true,
  "flags": [],
  "confidence": 0.95,
  "requiresManualReview": false
}
```

### 4. Smart Notifications

**Purpose**: Predict optimal notification timing for each user

```
POST /notifications/optimize

Input: {
  "userId": "uuid",
  "notificationType": "gift_received" | "proof_approved" | "funds_released",
  "urgency": "low" | "medium" | "high"
}

Output: {
  "sendAt": "2024-07-15T14:30:00Z",
  "channel": "push",
  "confidence": 0.88,
  "reason": "User most active at 2-3pm on weekdays"
}
```

### 5. Fraud Detection

**Purpose**: Detect fraudulent activities (fake proofs, suspicious accounts)

```
POST /fraud/analyze

Input: {
  "userId": "uuid",
  "actionType": "proof_submission" | "withdrawal" | "account_creation",
  "metadata": { ... }
}

Output: {
  "riskScore": 15,
  "riskLevel": "low",
  "flags": [],
  "recommendation": "approve"
}
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App / Admin                        │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼ HTTP/gRPC
┌─────────────────────────────────────────────────────────────┐
│              Supabase Edge Functions                         │
│  (Lightweight request handlers)                              │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼ Internal HTTP
┌─────────────────────────────────────────────────────────────┐
│                   ML Service (FastAPI)                       │
│  • Proof Verification (KYC + Experience)                     │
│  • Gift Offer Analysis                                       │
│  • Content Moderation                                        │
│  • Fraud Detection                                           │
│  • Smart Notifications                                       │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ML Models (Local / S3)                          │
│  • Face Detection (MediaPipe)                                │
│  • ID Card Detection (YOLOv8)                                │
│  • Image Quality (BRISQUE)                                   │
│  • Text Moderation (Transformers)                            │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Framework**: FastAPI 0.115+ (async Python)
- **ML Core**: PyTorch 2.5.1, scikit-learn 1.6
- **Computer Vision**: OpenCV, MediaPipe, Pillow
- **NLP**: Transformers 4.47 (content moderation)
- **Inference**: ONNX Runtime 1.20 (optimized)
- **Cache**: Redis 5.2 (prediction cache)
- **Monitoring**: Prometheus, OpenTelemetry

## Quick Start

```bash
# Install dependencies
cd services/ml-service
pip install -r requirements.txt

# Run locally
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Docker
docker-compose up ml-service -d
```

## API Endpoints

| Endpoint                  | Method | Description                    |
| ------------------------- | ------ | ------------------------------ |
| `/proof/verify`           | POST   | Verify KYC or experience proof |
| `/offer/analyze`          | POST   | Analyze gift offer priority    |
| `/content/moderate`       | POST   | Moderate user content          |
| `/notifications/optimize` | POST   | Get optimal notification time  |
| `/fraud/analyze`          | POST   | Analyze fraud risk             |
| `/health`                 | GET    | Health check                   |

## Performance Targets

| Operation                 | Target Latency (p95) |
| ------------------------- | -------------------- |
| Proof Verification        | < 500ms              |
| Offer Analysis            | < 50ms               |
| Content Moderation        | < 200ms              |
| Fraud Analysis            | < 100ms              |
| Notification Optimization | < 50ms               |

## Environment Variables

```bash
# Service
ML_SERVICE_PORT=8000
ML_WORKERS=4

# Redis
REDIS_URL=redis://redis:6379

# Supabase
SUPABASE_URL=http://kong:8000
SUPABASE_SERVICE_KEY=your-service-key

# Models
MODEL_STORAGE=local
MODEL_PATH=/models

# Monitoring
LOG_LEVEL=info
```

## Gift Platform Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Gifter     │────▶│   Moment     │────▶│   Recipient  │
│  (Gönderen)  │     │   (Escrow)   │     │   (Alıcı)    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
  KYC Verify          Funds Held           Submit Proof
       │                    │                    │
       │                    │                    ▼
       │                    │            ┌──────────────┐
       │                    │            │  ML Service  │
       │                    │            │   Verify     │
       │                    │            └──────────────┘
       │                    │                    │
       │                    ▼                    ▼
       │              Funds Released ◀──── Proof Approved
       │                    │
       ▼                    ▼
   Gift Sent          Memory Created ✨
```

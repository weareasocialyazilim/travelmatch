# ML Service - Containerized Machine Learning Inference

## Overview
Isolated containerized service for ML inference, separating compute-intensive operations from Edge Functions.

## Why Separate ML Service?

### Problems with Edge Functions for ML:
- ❌ **Limited CPU/Memory**: Edge Functions have strict resource limits
- ❌ **Cold Starts**: Loading ML models on every request
- ❌ **Timeout Risk**: Inference can take > 10s for complex models
- ❌ **No GPU Support**: Can't use GPUs for acceleration
- ❌ **Large Bundle Size**: ML libraries exceed Edge Function limits

### Benefits of Containerized ML Service:
- ✅ **Dedicated Resources**: CPU/GPU optimized containers
- ✅ **Model Caching**: Models stay loaded in memory
- ✅ **No Timeout**: Long-running inference supported
- ✅ **Horizontal Scaling**: Scale workers independently
- ✅ **Better Libraries**: Use PyTorch, TensorFlow, scikit-learn

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Edge Functions                        │
│  (Lightweight request handlers)                          │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼ gRPC/HTTP
┌─────────────────────────────────────────────────────────┐
│                   ML Service (FastAPI)                   │
│  • Model Inference (travel matching, recommendations)    │
│  • Feature Engineering                                   │
│  • Smart Notifications                                   │
│  • GPU Acceleration (optional)                           │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Models (Mounted Volume/S3)                  │
│  • TravelMatch Model                                     │
│  • Recommendation Model                                  │
│  • Notification Timing Model                             │
└─────────────────────────────────────────────────────────┘
```

## Services

### 1. Match Scoring Service
**Purpose**: Score user compatibility for travel matching

**Input**:
```json
{
  "user_a_id": "uuid",
  "user_b_id": "uuid",
  "context": {
    "destination": "Paris",
    "dates": "2024-07-15",
    "interests": ["art", "food"]
  }
}
```

**Output**:
```json
{
  "score": 0.87,
  "confidence": 0.92,
  "factors": {
    "interest_overlap": 0.9,
    "travel_style": 0.85,
    "personality": 0.86
  },
  "latency_ms": 45
}
```

### 2. Recommendation Service
**Purpose**: Personalized travel recommendations

**Input**:
```json
{
  "user_id": "uuid",
  "limit": 10,
  "filters": {
    "budget": "medium",
    "duration": "week"
  }
}
```

**Output**:
```json
{
  "recommendations": [
    {
      "destination": "Tokyo",
      "score": 0.95,
      "reason": "Based on your interest in cuisine and culture"
    }
  ]
}
```

### 3. Smart Notifications Service
**Purpose**: Predict optimal notification timing

**Input**:
```json
{
  "user_id": "uuid",
  "notification_type": "match_found",
  "urgency": "medium"
}
```

**Output**:
```json
{
  "send_at": "2024-07-15T14:30:00Z",
  "channel": "push",
  "confidence": 0.88,
  "reason": "User most active at 2-3pm on weekdays"
}
```

## Tech Stack

- **Framework**: FastAPI (async Python)
- **ML Libraries**: scikit-learn, PyTorch, Transformers
- **Inference**: ONNX Runtime (optimized)
- **Cache**: Redis (feature store, prediction cache)
- **Monitoring**: Prometheus + Grafana
- **Deployment**: Docker + GPU support (optional)

## Quick Start

### Start ML Service
```bash
# CPU-only
docker-compose up ml-service -d

# With GPU (requires NVIDIA Docker)
docker-compose -f docker-compose.gpu.yml up ml-service -d

# Or using CLI
tm docker up ml-service
```

### Call from Edge Function
```typescript
// supabase/functions/match-users/index.ts
const response = await fetch('http://ml-service:8000/match/score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_a_id: userA.id,
    user_b_id: userB.id,
    context: { destination: 'Paris' },
  }),
});

const prediction = await response.json();
console.log('Match score:', prediction.score); // 0.87
```

## API Reference

### Match Scoring

**Endpoint**: `POST /match/score`

**Request**:
```json
{
  "user_a_id": "uuid",
  "user_b_id": "uuid",
  "context": {
    "destination": "string",
    "dates": "string",
    "interests": ["string"]
  }
}
```

**Response**:
```json
{
  "score": 0.87,
  "confidence": 0.92,
  "factors": {
    "interest_overlap": 0.9,
    "travel_style": 0.85,
    "personality": 0.86
  },
  "latency_ms": 45
}
```

### Recommendations

**Endpoint**: `POST /recommend/destinations`

**Request**:
```json
{
  "user_id": "uuid",
  "limit": 10,
  "filters": {
    "budget": "low|medium|high",
    "duration": "weekend|week|month"
  }
}
```

**Response**:
```json
{
  "recommendations": [
    {
      "destination": "Tokyo",
      "score": 0.95,
      "reason": "Based on your interests"
    }
  ]
}
```

### Smart Notifications

**Endpoint**: `POST /notifications/optimize`

**Request**:
```json
{
  "user_id": "uuid",
  "notification_type": "match_found|message|reminder",
  "urgency": "low|medium|high"
}
```

**Response**:
```json
{
  "send_at": "2024-07-15T14:30:00Z",
  "channel": "push|email|sms",
  "confidence": 0.88,
  "reason": "User most active at 2-3pm on weekdays"
}
```

### Health Check

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "models_loaded": true,
  "redis_connected": true,
  "gpu_available": false
}
```

## Performance

### Latency Targets
- Match Scoring: < 100ms (p95)
- Recommendations: < 200ms (p95)
- Smart Notifications: < 50ms (p95)

### Throughput
- Requests/sec: 100+ (CPU), 500+ (GPU)
- Concurrent requests: 50
- Model batch size: 32 (for batching multiple requests)

### Optimization
- **Model Quantization**: INT8 (4x smaller, 2-4x faster)
- **ONNX Runtime**: 2-3x faster than native PyTorch
- **Response Caching**: Redis cache for repeated predictions
- **Feature Caching**: Pre-computed user features
- **GPU Batching**: Batch multiple requests for GPU efficiency

## Environment Variables

```bash
# Service Configuration
ML_SERVICE_PORT=8000
ML_WORKERS=4

# Redis (Feature Store + Cache)
REDIS_URL=redis://redis:6379

# Supabase (Fetch user data)
SUPABASE_URL=http://kong:8000
SUPABASE_SERVICE_KEY=your-service-key

# Model Storage
MODEL_STORAGE=local  # or 's3'
MODEL_PATH=/models
S3_BUCKET=travelmatch-models
S3_REGION=us-east-1

# Performance
ENABLE_GPU=false
BATCH_SIZE=32
CACHE_TTL=3600  # 1 hour

# Monitoring
PROMETHEUS_PORT=9090
LOG_LEVEL=info
```

## Scaling

### Horizontal Scaling
```bash
# Scale to 5 replicas
docker-compose up --scale ml-service=5 -d

# Auto-scaling (Kubernetes)
kubectl autoscale deployment ml-service \
  --min=2 --max=20 \
  --cpu-percent=70
```

### Vertical Scaling
```yaml
# docker-compose.yml
ml-service:
  deploy:
    resources:
      limits:
        cpus: '4'
        memory: 8G
      reservations:
        cpus: '2'
        memory: 4G
```

### GPU Scaling
```yaml
# docker-compose.gpu.yml
ml-service:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

## Monitoring

### Prometheus Metrics
```
# Request metrics
ml_inference_requests_total
ml_inference_duration_seconds
ml_inference_errors_total

# Model metrics
ml_model_load_time_seconds
ml_model_memory_bytes
ml_prediction_batch_size

# Cache metrics
ml_cache_hits_total
ml_cache_misses_total
```

### Grafana Dashboard
```
http://localhost:3001/d/ml-service

Panels:
- Request Rate (req/sec)
- Latency (p50, p95, p99)
- Error Rate (%)
- Model Memory Usage
- Cache Hit Rate
- GPU Utilization (if available)
```

## Development

### Local Development
```bash
# Install dependencies
cd services/ml-service
pip install -r requirements.txt

# Run locally
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Test endpoint
curl -X POST http://localhost:8000/match/score \
  -H "Content-Type: application/json" \
  -d '{"user_a_id":"uuid","user_b_id":"uuid"}'
```

### Add New Model
```python
# app/models/new_model.py
from app.core.base_model import BaseModel

class NewModel(BaseModel):
    def load(self):
        # Load model from disk/S3
        pass
    
    def predict(self, features):
        # Run inference
        pass
```

### Register Model
```python
# app/main.py
from app.models.new_model import NewModel

@app.on_event("startup")
async def load_models():
    models['new_model'] = NewModel()
    await models['new_model'].load()
```

## Migration from Edge Functions

### Before (Edge Function - BAD)
```typescript
// supabase/functions/match-users/index.ts
import { someHeavyMLLibrary } from 'npm:heavy-ml-lib'; // Too large!

serve(async (req) => {
  // This is slow and resource-intensive
  const model = await loadModel(); // Cold start!
  const score = await model.predict(features); // Slow!
  return Response.json({ score });
});
```

### After (ML Service - GOOD)
```typescript
// supabase/functions/match-users/index.ts
serve(async (req) => {
  // Lightweight request handler
  const response = await fetch('http://ml-service:8000/match/score', {
    method: 'POST',
    body: JSON.stringify({ user_a_id, user_b_id }),
  });
  
  const prediction = await response.json();
  return Response.json(prediction);
});
```

## Best Practices

1. **Cache Predictions**: Cache results for 1-24 hours
2. **Batch Requests**: Batch multiple predictions for GPU efficiency
3. **Feature Store**: Pre-compute and cache user features
4. **Model Versioning**: Version models (v1, v2) for A/B testing
5. **Fallback**: Return cached/default predictions on error
6. **Monitoring**: Track latency, error rate, cache hit rate
7. **Timeouts**: Set request timeout (5s) with retry
8. **Quantization**: Use INT8/FP16 models for faster inference

## Troubleshooting

### High Latency?
- Check model size (quantize if > 1GB)
- Enable prediction caching
- Use GPU if available
- Reduce batch size
- Pre-compute features

### Out of Memory?
- Reduce model size (quantization)
- Lower batch size
- Scale horizontally (more replicas)
- Use model sharding

### Low Throughput?
- Increase worker count
- Enable GPU
- Batch requests
- Optimize model (ONNX)

---

**Files Created**:
- `services/ml-service/` - FastAPI ML inference service
- Dockerfile with GPU support
- Updated docker-compose.yml

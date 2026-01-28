# AWS Rekognition Integration

## Overview

AWS Rekognition provides AI-powered content analysis for moderation. It only flags content; humans
make final decisions.

## Usage

| Capability         | Purpose               | Result      |
| ------------------ | --------------------- | ----------- |
| Label detection    | Scene identification  | Metadata    |
| Content moderation | Explicit content flag | Admin queue |
| Face detection     | People counting       | Metadata    |

## How AI Moderation Works

```
User uploads content (moment media or proof)
    │
    ▼
Send to AWS Rekognition
    │
    ▼
Receive analysis results
    │
    ├────────────────────────────┐
    ▼                            ▼
No concerns                    Concerns detected
    │                            │
    ▼                            ▼
Content published        Add to admin queue
                    (human review required)
```

## Code References

| Feature            | Location                                     |
| ------------------ | -------------------------------------------- |
| Moderation service | `supabase/functions/_shared/moderation.ts`   |
| AI scan function   | `supabase/functions/_shared/ai-scan.ts`      |
| Admin queue        | `apps/admin/src/app/(dashboard)/moderation/` |

## Limitations

- AI does not make decisions
- False positives possible
- Context not understood
- Cultural nuances not analyzed

## NOT IMPLEMENTED

- Real-time video analysis
- Streaming content analysis
- Custom model training
- Auto-content removal

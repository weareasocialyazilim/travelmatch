# Moderation and AI

## Overview

Content moderation uses AWS Rekognition for initial flagging, with final decisions made by humans
(admin/super admin).

## AI Role

| Capability              | Status          |
| ----------------------- | --------------- |
| Flag suspicious content | Implemented     |
| Auto-approve content    | NOT IMPLEMENTED |
| Auto-reject content     | NOT IMPLEMENTED |
| Auto-ban users          | NOT IMPLEMENTED |

## AI Detection Flow

```
Content uploaded
    │
    ▼
┌─────────────────────┐
│ AWS Rekognition     │  Scan for:
    │                 │  - Explicit content
    │                 │  - Safety concerns
    │                 │  - Suspicious patterns
    ▼                 │
Flag generated        │  No flag
    │                 │
    ▼                 │
Admin queue ←─────────┘  No queue entry
    │
    ▼
Human review
    │
    ├────────────────────┐
    ▼                    ▼
Approve              Reject
    │                    │
    ▼                    ▼
Content live         Content rejected
```

## Moderation Actions

| Action       | Who                  | Result                           |
| ------------ | -------------------- | -------------------------------- |
| Flag         | AI (AWS Rekognition) | Adds to admin queue              |
| Approve      | Admin/Super Admin    | Content published                |
| Reject       | Admin/Super Admin    | Content hidden, creator notified |
| Suspend User | Super Admin          | User cannot create moments       |
| Ban User     | Super Admin          | Account disabled                 |

## Code References

| Feature             | Location                                        |
| ------------------- | ----------------------------------------------- |
| AI scan             | `supabase/functions/_shared/moderation.ts`      |
| Admin moderation UI | `apps/admin/src/app/(dashboard)/moderation/`    |
| Moderation service  | `apps/mobile/src/services/moderationService.ts` |

## NOT IMPLEMENTED

- AI-powered content suggestions
- Automated rejection thresholds
- Machine learning model training
- Proactive abuse detection
- User reputation scoring by AI

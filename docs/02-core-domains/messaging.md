# Messaging

## Overview

Messaging on Lovendo is consent-based and tier-restricted. It is NOT a general chat platform.

## Messaging Rules by Tier

| Tier   | Chat Available | Requirement             |
| ------ | -------------- | ----------------------- |
| 0-30   | No             | N/A                     |
| 30-100 | Yes            | Host approval required  |
| 100+   | Yes            | Host approval + Premium |

## Messaging Flow

```
User wants to chat
    │
    ▼
Check tier
    │
    ├─────────────────────────────┐
    ▼                             ▼
0-30 tier                    30+/100+ tier
    │                             │
    ▼                             ▼
Chat disabled              Show "Request Chat"
    │                             │
    │                             ▼
    │                     Host receives request
    │                             │
    │                             ▼
    │                     Host approves/denies
    │                             │
    ├─────────────────────────────┤
    │                             │
    ▼                             ▼
No chat                  Chat opened
                    (text messages only)
```

## Code References

| Feature      | Location                                    |
| ------------ | ------------------------------------------- |
| Chat unlock  | `apps/mobile/src/features/chat/`            |
| Chat service | `apps/mobile/src/services/chatService.ts`   |
| Chat DB      | `supabase/migrations/*_create_messages.sql` |

## NOT IMPLEMENTED

- Voice messages
- Video messages
- Image sharing in chat
- Voice/video calls
- Group chats
- Read receipts
- Typing indicators
- Message reactions
- Message editing/deletion

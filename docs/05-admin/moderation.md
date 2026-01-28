# Admin Moderation

## Moderation Queue

The moderation queue contains:

- AI-flagged content (Rekognition)
- User reports
- Manual escalations

## Moderation Actions

| Action          | Description                              |
| --------------- | ---------------------------------------- |
| Approve         | Content passes review, remains published |
| Reject          | Content hidden, creator notified         |
| Flag for Review | Escalate to senior moderator             |
| Ban User        | Disable user account                     |
| Ignore          | Clear false positive                     |

## Moderation Workflow

```
Content flagged
    │
    ▼
Appears in moderation queue
    │
    ▼
Moderator reviews content
    │
    ├────────────────────────────┐
    ▼                            ▼
Approve                      Needs action
    │                            │
    ▼                            ▼
Content stays live        Take action
                            │
                            ├───────────────┐
                            ▼               ▼
                        Reject         Escalate
```

## Code References

| Feature         | Location                                             |
| --------------- | ---------------------------------------------------- |
| Moderation page | `apps/admin/src/app/(dashboard)/moderation/page.tsx` |
| Queue service   | `apps/admin/src/hooks/useModerationQueue.ts`         |
| AI scan         | `supabase/functions/_shared/moderation.ts`           |

## NOT IMPLEMENTED

- Auto-moderation rules
- Bulk moderation
- Moderation templates
- Appeal workflow

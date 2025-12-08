# Moderation Feature

Content and user moderation (reporting, blocking, safety).

## Overview

The moderation feature handles user safety:
- Report users and content
- Block/unblock users
- Safety center
- Trust & safety guidelines
- Moderation queue (admin)

## Structure

```
moderation/
├── screens/
│   ├── ReportScreen.tsx              # Report form
│   ├── BlockedUsersScreen.tsx        # Blocked users list
│   ├── SafetyCenterScreen.tsx        # Safety info
│   └── ReportHistoryScreen.tsx       # User's reports
├── components/
│   ├── ReportModal.tsx              # Quick report modal
│   ├── ReportBlockBottomSheet.tsx   # Report/block options
│   ├── BlockConfirmation.tsx        # Block dialog
│   └── SafetyTips.tsx               # Safety guidelines
├── hooks/
│   ├── useReport.ts                # Report submission
│   ├── useBlock.ts                 # Block/unblock
│   └── useBlockedUsers.ts          # Blocked users list
├── services/
│   └── moderationService.ts        # Moderation API
└── types/
    └── moderation.types.ts         # Type definitions
```

## Screens

### ReportScreen
Detailed report submission form.

**Features:**
- Report categories
- Detailed description
- Evidence upload (screenshots)
- Anonymous reporting
- Report tracking

### BlockedUsersScreen
List of blocked users.

**Features:**
- View blocked users
- Unblock action
- Block reasons
- Block history

### SafetyCenterScreen
Safety information and resources.

**Content:**
- Community guidelines
- Safety tips
- How to report
- Crisis resources
- Contact support

## Components

### ReportModal
Quick report modal from any screen.

**Props:**
```typescript
interface ReportModalProps {
  type: 'user' | 'moment' | 'message' | 'comment';
  targetId: string;
  targetName: string;
  visible: boolean;
  onClose: () => void;
}
```

### ReportBlockBottomSheet
Bottom sheet with report/block options.

### BlockConfirmation
Confirmation dialog before blocking.

## Hooks

### useReport
```typescript
const {
  submitReport,
  submitting,
  success,
} = useReport();

await submitReport({
  type: 'user',
  targetId: userId,
  category: 'harassment',
  description: 'Details...',
});
```

### useBlock
```typescript
const {
  blockUser,
  unblockUser,
  isBlocked,
} = useBlock(userId);
```

### useBlockedUsers
```typescript
const {
  blockedUsers,
  loading,
  unblock,
} = useBlockedUsers();
```

## API

### Reports
- `POST /api/v1/moderation/reports` - Submit report
- `GET /api/v1/moderation/reports` - Get user's reports
- `GET /api/v1/moderation/reports/:id` - Report status

### Blocking
- `POST /api/v1/moderation/blocks` - Block user
- `DELETE /api/v1/moderation/blocks/:userId` - Unblock
- `GET /api/v1/moderation/blocks` - Get blocked users
- `GET /api/v1/moderation/blocks/check/:userId` - Check if blocked

## Report Categories

```typescript
const REPORT_CATEGORIES = {
  user: [
    'harassment',
    'hate_speech',
    'violence',
    'spam',
    'fake_profile',
    'inappropriate_content',
    'scam',
    'underage',
    'other',
  ],
  moment: [
    'nudity',
    'violence',
    'hate_speech',
    'spam',
    'copyright',
    'false_information',
    'other',
  ],
  message: [
    'harassment',
    'spam',
    'inappropriate',
    'scam',
    'other',
  ],
};
```

## Block Effects

When a user is blocked:
- ❌ No longer see each other's profiles
- ❌ Cannot message each other
- ❌ Removed from matches
- ❌ Cannot see moments/posts
- ❌ Cannot comment on content
- ✅ Block is bidirectional (both directions)

## Privacy & Safety

### Report Privacy
- Reports are anonymous to reported user
- Only moderation team sees details
- Reporter identity protected

### Data Handling
- Reports stored encrypted
- Evidence auto-deleted after 90 days
- GDPR compliant

### Automated Moderation
- AI pre-screening
- Keyword detection
- Pattern recognition
- Auto-escalation for severe cases

## Testing

```bash
pnpm test:unit features/moderation
pnpm test:integration features/moderation
```

## Performance

- **Optimistic updates**: Instant UI feedback
- **Cached blocks**: Client-side block cache
- **Debounced checks**: Batch block status checks

## Dependencies

- `@tanstack/react-query` - Data fetching
- `expo-image-picker` - Evidence upload
- `react-hook-form` - Form validation

## Admin Features (Future)

- Moderation queue
- Report review
- User suspension
- Content takedown
- Appeals process

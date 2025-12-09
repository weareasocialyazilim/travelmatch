# Empty State Implementation Guide

## Overview
Standardized empty state system across all list screens in the mobile app using a unified `EmptyState` component with action button support.

## Enhanced Component

### EmptyState Component
**Location:** `/apps/mobile/src/components/ui/EmptyState.tsx`

**New Props:**
- `secondaryActionLabel?: string` - Label for optional secondary button
- `onSecondaryAction?: () => void` - Handler for secondary button

**Features:**
- Primary and secondary action buttons
- Illustration support (custom or predefined types)
- Icon fallback with circular background
- Consistent spacing and typography
- Variant support through Button component

## Screens Updated

### 1. MyMomentsScreen
**Path:** `/apps/mobile/src/features/profile/screens/MyMomentsScreen.tsx`

**Empty States:**
- **Active Tab (No moments):**
  - Icon: `map-marker-star`
  - Title: "No active moments"
  - Description: "Create your first moment to start receiving requests"
  - Action: "Create Moment" → navigates to CreateMoment

- **Completed Tab:**
  - Icon: `check-circle`
  - Title: "No completed moments yet"
  - Description: "Complete your first moment to see it here"
  - No action (passive state)

### 2. ArchivedChatsScreen
**Path:** `/apps/mobile/src/features/messages/screens/ArchivedChatsScreen.tsx`

**Empty State:**
- Icon: `archive-off-outline`
- Title: "No archived chats"
- Description: "Chats you archive will appear here. Long press on a chat to archive it."
- Action: "Go to Messages" → navigates to Messages

### 3. DeletedMomentsScreen
**Path:** `/apps/mobile/src/features/profile/screens/DeletedMomentsScreen.tsx`

**Empty State:**
- Icon: `delete-empty-outline`
- Title: "No deleted moments"
- Description: "Deleted moments will appear here and can be restored within 90 days"
- Action: "My Moments" → navigates to MyMoments

### 4. ProfileDetailScreen
**Path:** `/apps/mobile/src/features/profile/screens/ProfileDetailScreen.tsx`

**Empty States:**
- **Active Tab:**
  - Icon: `compass-outline`
  - Title: "No active moments yet"
  - Description: "Check back soon to support [name]'s next adventure!"
  
- **Past Tab:**
  - Icon: `history`
  - Title: "No past moments"
  - Description: "Completed moments will appear here"

### 5. ProfileScreen
**Path:** `/apps/mobile/src/features/profile/screens/ProfileScreen.tsx`

**Empty States:**
- **Active Tab (Online):**
  - Icon: `map-marker-plus`
  - Title: "No active moments yet"
  - Description: "Create your first moment to start your journey"
  - Action: "Create Moment" → navigates to CreateMoment
  
- **Active Tab (Offline):**
  - Same visuals but no action button (respects offline state)
  
- **Past Tab:**
  - Icon: `history`
  - Title: "No past moments"
  - Description: "Completed moments will appear here"

### 6. TrustNotesScreen
**Path:** `/apps/mobile/src/features/profile/screens/TrustNotesScreen.tsx`

**Empty State:**
- Icon: `forum`
- Title: "No notes yet"
- Description: "Notes from supporters will appear here once they are left."

### 7. ProofHistoryScreen
**Path:** `/apps/mobile/src/features/profile/screens/ProofHistoryScreen.tsx`

**Empty State:**
- Icon: `camera`
- Title: "No proofs yet"
- Description: "Proofs submitted by the traveler will appear here once they are uploaded for verification."

### 8. DiscoverScreen
**Path:** `/apps/mobile/src/features/trips/screens/DiscoverScreen.tsx`

**Empty State:**
- Icon: `compass-off-outline`
- Title: "No moments found"
- Description: "Try adjusting your filters or location"
- Action: "Clear Filters" → calls clearFilters()

## Already Implemented (No Changes)

### MessagesScreen
- Already uses EmptyState with action: "Discover Moments"

### RequestsScreen
- Already uses EmptyState for both tabs (pending requests & notifications)

### SavedMomentsScreen
- Already uses EmptyState with illustration: "No Saved Moments Yet"

### MyGiftsScreen, TransactionHistoryScreen, WalletScreen
- Already have EmptyState implementations

### BlockedUsersScreen, HiddenItemsScreen
- Already have custom EmptyState implementations

## Design Patterns

### When to Add Action Buttons
✅ **DO add actions when:**
- User can create the missing content (e.g., "Create Moment")
- There's a clear next step (e.g., "Go to Messages", "Clear Filters")
- Navigation helps discover content (e.g., "Discover Moments")

❌ **DON'T add actions when:**
- State depends on external actions (e.g., waiting for others' notes)
- User is viewing someone else's content (e.g., ProfileDetail past moments)
- State is temporary/informational (e.g., "Coming soon")

### Offline State Handling
- Respect `isConnected` status from NetworkContext
- Conditionally hide action buttons when offline
- Use NetworkGuard for screens requiring connectivity
- Show appropriate offline messages

### Icon Selection Guidelines
- **Inbox/Archive:** `inbox-outline`, `archive-off-outline`
- **Create/Add:** `map-marker-plus`, `plus-circle`
- **History/Past:** `history`, `clock-outline`
- **Search/Discover:** `compass-outline`, `compass-off-outline`
- **Social:** `forum`, `chat-outline`, `account-group`
- **Camera/Media:** `camera`, `image-outline`

## Testing Checklist

- [ ] All screens show appropriate empty states
- [ ] Action buttons navigate correctly
- [ ] Offline state prevents online-only actions
- [ ] Icons render correctly on all platforms
- [ ] Descriptions are clear and actionable
- [ ] No TypeScript errors
- [ ] Consistent spacing and alignment
- [ ] Secondary actions work when present

## Future Enhancements

1. **Animation:** Add fade-in animations for empty states
2. **Illustrations:** Create custom illustrations for each context
3. **i18n:** Ensure all messages are translatable
4. **Analytics:** Track empty state views and action clicks
5. **A/B Testing:** Test different CTAs for conversion

## Related Files
- EmptyState Component: `/apps/mobile/src/components/ui/EmptyState.tsx`
- EmptyStateIllustration: `/apps/mobile/src/components/ui/EmptyStateIllustration.tsx`
- Button Component: `/apps/mobile/src/components/ui/Button.tsx`
- NetworkGuard: `/apps/mobile/src/components/NetworkGuard.tsx`

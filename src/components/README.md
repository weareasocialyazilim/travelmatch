# Components

Reusable UI components for the TravelMatch application.

## Directory Structure

```
components/
├── ui/                    # Base UI primitives
│   ├── OptimizedFlatList.tsx
│   ├── MemoizedMomentCard.tsx
│   └── GenericBottomSheet.tsx
├── createMoment/          # Create moment flow components
├── discover/              # Discover screen components
├── report/                # Report/moderation components
├── __tests__/             # Component tests
└── index.ts               # Barrel exports
```

## Core Components

### Button

Primary button component with variants and loading state.

```typescript
import { Button } from '@/components';

<Button 
  title="Continue"
  variant="primary"
  loading={isSubmitting}
  onPress={handleSubmit}
  accessibilityHint="Submit the form"
/>
```

### MomentCard

Displays a moment with user info, image, and actions.

```typescript
import { MomentCard } from '@/components';

<MomentCard
  moment={moment}
  onPress={handleMomentPress}
  onGiftPress={handleGiftPress}
  variant="single" // or "grid"
/>
```

### ErrorBoundary

Catches and handles React errors gracefully.

```typescript
import { ErrorBoundary, ScreenErrorBoundary } from '@/components';

// Wrap critical sections
<ScreenErrorBoundary>
  <PaymentScreen />
</ScreenErrorBoundary>

// App-level boundary
<ErrorBoundary level="app">
  <App />
</ErrorBoundary>
```

## Bottom Sheets

Multiple specialized bottom sheet components:

- `GiftMomentBottomSheet` - Gift sending flow
- `FilterBottomSheet` - Search filters
- `AddCardBottomSheet` - Payment card entry
- `LocationPickerBottomSheet` - Location selection

```typescript
import { GiftMomentBottomSheet } from '@/components';

<GiftMomentBottomSheet
  isOpen={isOpen}
  onClose={handleClose}
  moment={selectedMoment}
/>
```

## Loading States

```typescript
import { 
  LoadingState, 
  MomentsFeedSkeleton,
  LoadingOverlay 
} from '@/components';

// Full screen loading
<LoadingState message="Loading moments..." />

// Skeleton placeholders
<MomentsFeedSkeleton />

// Overlay during actions
<LoadingOverlay visible={isSubmitting} />
```

## Empty States

```typescript
import { UnifiedEmptyState, EMPTY_STATES } from '@/components';

<UnifiedEmptyState
  {...EMPTY_STATES.noMoments}
  action={{
    label: 'Create Moment',
    onPress: handleCreate,
  }}
/>
```

## Modals

```typescript
import { 
  ConfirmGiftModal,
  DeleteMomentModal,
  ReportModal 
} from '@/components';

<ConfirmGiftModal
  visible={showConfirm}
  moment={moment}
  amount={giftAmount}
  onConfirm={handleConfirmGift}
  onCancel={handleCancel}
/>
```

## Accessibility

All components include accessibility props:

```typescript
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Send gift"
  accessibilityHint="Opens gift amount selection"
  accessibilityState={{ disabled: !isValid }}
>
  <Text>Send Gift</Text>
</TouchableOpacity>
```

## Performance

### Memoization

Heavy components use `React.memo`:

```typescript
export const MomentCard = memo(({ moment, onPress }) => {
  // Only re-renders when props change
});
```

### Optimized Lists

Use `OptimizedFlatList` for long lists:

```typescript
import { OptimizedFlatList } from '@/components/ui';

<OptimizedFlatList
  data={moments}
  renderItem={renderMoment}
  itemHeight={200}
  emptyMessage="No moments found"
/>
```

## Testing

```bash
# Run component tests
npm test -- --testPathPattern="components"
```

Example test:

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

test('calls onPress when pressed', () => {
  const onPress = jest.fn();
  const { getByText } = render(
    <Button title="Click me" onPress={onPress} />
  );
  
  fireEvent.press(getByText('Click me'));
  expect(onPress).toHaveBeenCalled();
});
```

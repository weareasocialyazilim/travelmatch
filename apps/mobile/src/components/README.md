# Components

Reusable UI components for the TravelMatch application.

## Table of Contents

- [Directory Structure](#directory-structure)
- [Core Components](#core-components)
- [Bottom Sheets](#bottom-sheets)
- [Modals](#modals)
- [Loading States](#loading-states)
- [Empty States](#empty-states)
- [Form Components](#form-components)
- [Performance](#performance)
- [Accessibility](#accessibility)
- [Testing](#testing)
- [Development](#development)

## Directory Structure

```
components/
├── ui/                    # Base UI primitives (Button, Input, Card, etc.)
│   ├── OptimizedFlatList.tsx   # Performance-optimized list
│   ├── MemoizedMomentCard.tsx  # Memoized card component
│   ├── GenericBottomSheet.tsx  # Base bottom sheet
│   └── index.ts
├── createMoment/          # Create moment flow components
├── discover/              # Discover screen components
├── report/                # Report/moderation components
├── dev/                   # Development-only components
│   └── PerformanceOverlay.tsx  # FPS/memory overlay
├── __tests__/             # Component tests
└── index.ts               # Barrel exports (79+ components)
```

## Core Components

### Button

Primary button component with variants, loading state, and haptic feedback.

| Prop           | Type                                               | Default     | Description            |
| -------------- | -------------------------------------------------- | ----------- | ---------------------- |
| `title`        | `string`                                           | required    | Button text            |
| `onPress`      | `() => void`                                       | required    | Press handler          |
| `variant`      | `'primary' \| 'secondary' \| 'outline' \| 'ghost'` | `'primary'` | Visual style           |
| `size`         | `'sm' \| 'md' \| 'lg'`                             | `'md'`      | Button size            |
| `loading`      | `boolean`                                          | `false`     | Show loading spinner   |
| `disabled`     | `boolean`                                          | `false`     | Disable button         |
| `enableHaptic` | `boolean`                                          | `true`      | Enable haptic feedback |

```typescript
import { Button } from '@/components';

<Button
  title="Continue"
  variant="primary"
  loading={isSubmitting}
  onPress={handleSubmit}
  accessibilityHint="Submit the form"
/>;
```

### MomentCard

Displays a moment with user info, image, and actions.

| Prop          | Type                 | Default    | Description         |
| ------------- | -------------------- | ---------- | ------------------- |
| `moment`      | `Moment`             | required   | Moment data         |
| `onPress`     | `() => void`         | -          | Card press handler  |
| `onGiftPress` | `() => void`         | -          | Gift button handler |
| `variant`     | `'single' \| 'grid'` | `'single'` | Display mode        |
| `showActions` | `boolean`            | `true`     | Show action buttons |

```typescript
import { MomentCard } from '@/components';

<MomentCard
  moment={moment}
  onPress={handleMomentPress}
  onGiftPress={handleGiftPress}
  variant="single"
/>;
```

### SmartImage

Optimized image component with lazy loading, caching, and placeholder.

| Prop          | Type                                | Default      | Description      |
| ------------- | ----------------------------------- | ------------ | ---------------- |
| `source`      | `ImageSourcePropType \| string`     | required     | Image source     |
| `style`       | `ViewStyle`                         | -            | Container style  |
| `placeholder` | `'skeleton' \| 'blur' \| 'none'`    | `'skeleton'` | Placeholder type |
| `priority`    | `'low' \| 'normal' \| 'high'`       | `'normal'`   | Loading priority |
| `resizeMode`  | `'cover' \| 'contain' \| 'stretch'` | `'cover'`    | Resize mode      |

```typescript
import { SmartImage } from '@/components';

<SmartImage
  source={{ uri: imageUrl }}
  style={{ width: 200, height: 200 }}
  placeholder="skeleton"
  priority="high"
/>;
```

### ErrorBoundary

Catches and handles React errors gracefully with multiple severity levels.

| Prop       | Type                                               | Default       | Description          |
| ---------- | -------------------------------------------------- | ------------- | -------------------- |
| `level`    | `'app' \| 'navigation' \| 'screen' \| 'component'` | `'component'` | Error boundary level |
| `fallback` | `ReactNode`                                        | -             | Custom fallback UI   |
| `onError`  | `(error, info) => void`                            | -             | Error callback       |

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

All bottom sheets extend `GenericBottomSheet` with consistent behavior.

| Component                      | Description        | Key Props              |
| ------------------------------ | ------------------ | ---------------------- |
| `GiftMomentBottomSheet`        | Gift sending flow  | `moment`, `onGiftSent` |
| `FilterBottomSheet`            | Search filters     | `filters`, `onApply`   |
| `AddCardBottomSheet`           | Payment card entry | `onCardAdded`          |
| `AddBankAccountBottomSheet`    | Bank account entry | `onAccountAdded`       |
| `LocationPickerBottomSheet`    | Location selection | `onLocationSelect`     |
| `ChooseCategoryBottomSheet`    | Category selection | `onCategorySelect`     |
| `LanguageSelectionBottomSheet` | Language picker    | `onLanguageSelect`     |
| `CurrencySelectionBottomSheet` | Currency picker    | `onCurrencySelect`     |
| `ChatAttachmentBottomSheet`    | Chat attachments   | `onAttachmentSelect`   |
| `ShareMomentBottomSheet`       | Moment sharing     | `moment`, `onShare`    |
| `ReportBlockBottomSheet`       | Report/block user  | `userId`, `onReport`   |
| `UnblockUserBottomSheet`       | Unblock user       | `userId`, `onUnblock`  |

```typescript
import { GiftMomentBottomSheet } from '@/components';

<GiftMomentBottomSheet
  isOpen={isOpen}
  onClose={handleClose}
  moment={selectedMoment}
  onGiftSent={handleGiftSent}
/>;
```

## Modals

| Component                     | Description         | Key Props                       |
| ----------------------------- | ------------------- | ------------------------------- |
| `ConfirmGiftModal`            | Gift confirmation   | `moment`, `amount`, `onConfirm` |
| `DeleteMomentModal`           | Delete confirmation | `moment`, `onDelete`            |
| `DeleteProofModal`            | Proof deletion      | `proofId`, `onDelete`           |
| `ReportModal`                 | Report submission   | `targetId`, `type`, `onSubmit`  |
| `GiftSuccessModal`            | Success animation   | `giftAmount`, `recipientName`   |
| `LimitReachedModal`           | Rate limit warning  | `limitType`, `resetTime`        |
| `NotificationPermissionModal` | Push permission     | `onAllow`, `onDeny`             |
| `RemoveCardModal`             | Card removal        | `card`, `onRemove`              |
| `FeedbackModal`               | User feedback       | `onSubmit`                      |
| `ThankYouModal`               | Thank you message   | `message`                       |
| `ShareProofModal`             | Proof sharing       | `proof`, `onShare`              |
| `WithdrawConfirmationModal`   | Withdrawal confirm  | `amount`, `onConfirm`           |

```typescript
import { ConfirmGiftModal } from '@/components';

<ConfirmGiftModal
  visible={showConfirm}
  moment={moment}
  amount={giftAmount}
  onConfirm={handleConfirmGift}
  onCancel={handleCancel}
/>;
```

## Loading States

### LoadingState

Full-screen loading indicator.

```typescript
import { LoadingState } from '@/components';

<LoadingState message="Loading moments..." showSpinner={true} />;
```

### Skeleton Loaders

Pre-built skeleton components for common layouts.

| Component               | Use Case           |
| ----------------------- | ------------------ |
| `MomentsFeedSkeleton`   | Moments feed       |
| `ProfileSkeleton`       | User profile       |
| `ChatSkeleton`          | Chat messages      |
| `NotificationsSkeleton` | Notifications list |
| `SettingsSkeleton`      | Settings page      |

```typescript
import { MomentsFeedSkeleton } from '@/components';

{
  isLoading ? <MomentsFeedSkeleton count={5} /> : <MomentsList data={moments} />;
}
```

### LoadingOverlay

Overlay for blocking actions.

```typescript
import { LoadingOverlay } from '@/components';

<LoadingOverlay visible={isSubmitting} message="Processing payment..." />;
```

## Empty States

### UnifiedEmptyState

Configurable empty state with illustration.

| Prop              | Type                 | Description                |
| ----------------- | -------------------- | -------------------------- |
| `type`            | `string`             | Pre-defined type or custom |
| `title`           | `string`             | Main message               |
| `description`     | `string`             | Secondary message          |
| `illustration`    | `ReactNode`          | Custom illustration        |
| `action`          | `{ label, onPress }` | Primary action button      |
| `secondaryAction` | `{ label, onPress }` | Secondary action           |

```typescript
import { UnifiedEmptyState, EMPTY_STATES } from '@/components';

<UnifiedEmptyState
  {...EMPTY_STATES.noMoments}
  action={{
    label: 'Create Moment',
    onPress: handleCreate,
  }}
/>;
```

Pre-defined states: `noMoments`, `noMessages`, `noNotifications`, `noSearchResults`, `noFavorites`,
`offline`, `error`

## Form Components

### Input / ControlledInput

Form input with validation support.

```typescript
import { ControlledInput } from '@/components/ui';

<ControlledInput
  name="email"
  control={control}
  label="Email"
  placeholder="Enter your email"
  keyboardType="email-address"
  error={errors.email?.message}
/>;
```

### PasswordInput

Password input with visibility toggle.

```typescript
import { PasswordInput } from '@/components/ui';

<PasswordInput
  name="password"
  control={control}
  label="Password"
  error={errors.password?.message}
/>;
```

## Performance

### Memoization

Heavy components use `React.memo` to prevent unnecessary re-renders:

```typescript
export const MomentCard = memo(
  ({ moment, onPress }) => {
    // Only re-renders when props change
  },
  (prevProps, nextProps) => {
    return prevProps.moment.id === nextProps.moment.id;
  },
);
```

### OptimizedFlatList

Performance-optimized list with windowing and recycling.

| Prop           | Type                  | Description                       |
| -------------- | --------------------- | --------------------------------- |
| `data`         | `T[]`                 | List data                         |
| `renderItem`   | `(item) => ReactNode` | Item renderer                     |
| `itemHeight`   | `number`              | Fixed item height (improves perf) |
| `emptyMessage` | `string`              | Empty state message               |
| `onEndReached` | `() => void`          | Pagination handler                |

```typescript
import { OptimizedFlatList } from '@/components/ui';

<OptimizedFlatList
  data={moments}
  renderItem={renderMoment}
  itemHeight={200}
  emptyMessage="No moments found"
  onEndReached={loadMore}
/>;
```

### Performance Overlay (DEV only)

Real-time FPS and memory monitoring.

```typescript
import { PerformanceOverlay } from '@/components/dev';

// In App.tsx (only shows in __DEV__)
<PerformanceOverlay position="top-right" />;
```

## Accessibility

All components include comprehensive accessibility props:

```typescript
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Send gift"
  accessibilityHint="Opens gift amount selection"
  accessibilityState={{
    disabled: !isValid,
    busy: isLoading,
  }}
>
  <Text>Send Gift</Text>
</TouchableOpacity>
```

### Accessibility Guidelines

1. **Always include `accessibilityLabel`** for interactive elements
2. **Use `accessibilityHint`** for non-obvious actions
3. **Set `accessibilityRole`** appropriately (button, link, image, etc.)
4. **Manage `accessibilityState`** for disabled/loading states
5. **Test with VoiceOver (iOS) and TalkBack (Android)**

## Testing

```bash
# Run all component tests
npm test -- --testPathPattern="components"

# Run specific component test
npm test -- Button.test.tsx

# Run with coverage
npm test -- --coverage --testPathPattern="components"
```

### Example Test

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click me" onPress={onPress} />);

    fireEvent.press(getByText('Click me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading spinner when loading', () => {
    const { getByTestId } = render(<Button title="Submit" loading={true} onPress={() => {}} />);

    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('is disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Click me" disabled onPress={onPress} />);

    fireEvent.press(getByText('Click me'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
```

## Development

### Adding New Components

1. Create component file in appropriate directory
2. Add JSDoc documentation with props table
3. Export from `index.ts`
4. Add tests in `__tests__/`
5. Update this README

### Component Template

````typescript
/**
 * @component ComponentName
 * @description Brief description of the component
 *
 * @example
 * ```tsx
 * <ComponentName prop1="value" onAction={handler} />
 * ```
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';

interface ComponentNameProps {
  /** Description of prop1 */
  prop1: string;
  /** Description of onAction */
  onAction?: () => void;
}

export const ComponentName: React.FC<ComponentNameProps> = memo(({ prop1, onAction }) => {
  return (
    <View style={styles.container} accessibilityRole="none">
      {/* Component content */}
    </View>
  );
});

ComponentName.displayName = 'ComponentName';

const styles = StyleSheet.create({
  container: {
    // styles
  },
});
````

### Storybook (Coming Soon)

```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

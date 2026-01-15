# Hooks

Custom React hooks for the Lovendo application.

## Available Hooks

### Data Fetching

| Hook          | Description                          |
| ------------- | ------------------------------------ |
| `useMoments`  | Fetch and manage moment data         |
| `useMessages` | Chat messages with real-time updates |
| `useRequests` | Gift requests management             |
| `usePayments` | Wallet and transaction data          |
| `useReviews`  | User reviews and ratings             |

### Form & Validation

| Hook                | Description                               |
| ------------------- | ----------------------------------------- |
| `useZodForm`        | React Hook Form with Zod validation       |
| `useFormSubmit`     | Form submission with loading/error states |
| `useFormValidation` | Custom validation logic                   |

### UI & Experience

| Hook               | Description                   |
| ------------------ | ----------------------------- |
| `useBottomSheet`   | Bottom sheet state management |
| `useHaptics`       | Haptic feedback               |
| `useAccessibility` | Accessibility utilities       |
| `useTheme`         | Theme values and dark mode    |
| `useResponsive`    | Responsive sizing utilities   |

### Network & Offline

| Hook             | Description                 |
| ---------------- | --------------------------- |
| `useNetwork`     | Network connectivity status |
| `useOfflineData` | Offline data with caching   |
| `useFetch`       | Generic data fetching       |

### Analytics & Tracking

| Hook                   | Description            |
| ---------------------- | ---------------------- |
| `useAnalytics`         | Event tracking         |
| `useScreenTracking`    | Screen view tracking   |
| `useScreenPerformance` | Performance monitoring |

## Usage Examples

### useZodForm

```typescript
import { useZodForm } from '@/hooks';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function LoginForm() {
  const form = useZodForm({ schema });

  const onSubmit = form.handleSubmit((data) => {
    // data is typed: { email: string; password: string }
  });
}
```

### useFormSubmit

```typescript
import { useFormSubmit } from '@/hooks';

function CreateMomentForm() {
  const { submit, isSubmitting, error } = useFormSubmit({
    onSubmit: async (data) => {
      await api.createMoment(data);
    },
    onSuccess: () => navigation.goBack(),
    successMessage: 'Moment created!',
  });
}
```

### useBottomSheet

```typescript
import { useBottomSheet } from '@/hooks';

function MyComponent() {
  const { isOpen, open, close, snapTo } = useBottomSheet();

  return (
    <>
      <Button onPress={open}>Open Sheet</Button>
      <BottomSheet isOpen={isOpen} onClose={close}>
        <Content />
      </BottomSheet>
    </>
  );
}
```

### useOfflineData

```typescript
import { useOfflineData } from '@/hooks';

function MomentsList() {
  const { data, isLoading, isStale, refresh } = useOfflineData({
    key: 'moments',
    fetcher: () => api.getMoments(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <>
      {isStale && <Banner>Showing cached data</Banner>}
      <FlatList data={data} ... />
    </>
  );
}
```

## Testing

Hooks are tested using React Testing Library's `renderHook`:

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useBottomSheet } from '../useBottomSheet';

test('should toggle bottom sheet', () => {
  const { result } = renderHook(() => useBottomSheet());

  expect(result.current.isOpen).toBe(false);

  act(() => result.current.open());
  expect(result.current.isOpen).toBe(true);
});
```

## Best Practices

1. **Memoization**: Use `useMemo` and `useCallback` for expensive computations
2. **Error Handling**: Always handle errors gracefully
3. **Loading States**: Provide loading indicators
4. **TypeScript**: Export types for hook return values
5. **Testing**: Write tests for complex hooks

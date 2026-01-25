# Lovendo Mobile testID Strategy

## Purpose
Deterministic, stable selectors for Maestro E2E tests. No flaky xpath/text selectors.

## Naming Convention

### Pattern
```
{scope}-{element}-{identifier}
```

### Scope Prefixes
| Prefix | Description | Example |
|--------|-------------|---------|
| `screen` | Screen container | `screen-welcome` |
| `btn` | Buttons/Pressables | `btn-auth-continue` |
| `input` | TextInput fields | `input-email` |
| `otp` | OTP input digits | `otp-digit-0` |
| `list` | FlatList/ScrollView | `list-moments` |
| `item` | List items (dynamic) | `item-moment-{id}` |
| `card` | Card components | `card-coin-package-0` |
| `tab` | Tab bar items | `tab-home` |
| `modal` | Modal containers | `modal-login-prompt` |
| `toast` | Toast messages | `toast-success` |
| `empty` | Empty state views | `empty-moments` |
| `error` | Error state views | `error-network` |
| `loading` | Loading indicators | `loading-screen` |
| `text` | Important text labels | `text-balance` |
| `img` | Touchable images | `img-avatar` |
| `switch` | Toggle switches | `switch-notifications` |

### Examples by Screen

#### Welcome Screen
- `screen-welcome`
- `btn-apple-signin`
- `btn-google-signin`
- `btn-create-account`
- `btn-login`

#### Unified Auth Screen
- `screen-unified-auth`
- `input-identifier` (email or phone)
- `input-password`
- `input-name`
- `input-confirm-password`
- `btn-continue`
- `btn-login`
- `btn-register`
- `btn-forgot-password`
- `btn-switch-to-register`
- `btn-switch-to-login`
- `btn-back`

#### Verify Code Screen
- `screen-verify-code`
- `otp-digit-0` through `otp-digit-5`
- `btn-verify`
- `btn-resend-code`
- `text-resend-cooldown`

#### Complete Profile Screen
- `screen-complete-profile`
- `input-fullname`
- `input-username`
- `input-bio`
- `input-phone`
- `btn-avatar-select`
- `btn-interest-{id}` (e.g., `btn-interest-travel`)
- `btn-complete-profile`
- `btn-skip`

#### Discover Screen
- `screen-discover`
- `list-moments`
- `item-moment-{id}`
- `btn-filter`
- `btn-notifications`
- `btn-avatar`
- `btn-create-moment`
- `btn-gift-{momentId}`
- `empty-moments`

#### Create Moment Screen
- `screen-create-moment`
- `btn-pick-image`
- `input-title`
- `input-price`
- `btn-category-{id}`
- `btn-select-location`
- `btn-next-step`
- `btn-publish`
- `switch-show-as-story`

#### Coin Store Screen
- `screen-coin-store`
- `text-balance`
- `list-packages`
- `card-coin-package-{index}`
- `btn-purchase-{packageId}`
- `loading-purchase`

#### Settings Screen
- `screen-settings`
- `btn-sign-out`
- `btn-delete-account`
- `switch-notifications`
- `switch-profile-visibility`
- `btn-language`
- `btn-back`

#### Tab Navigation
- `tab-home`
- `tab-map`
- `tab-create`
- `tab-inbox`
- `tab-profile`

### Dynamic IDs for Lists

For list items with dynamic content:
```tsx
// Pattern: {prefix}-{type}-{index|id}
testID={`item-moment-${moment.id}`}
testID={`card-coin-package-${index}`}
testID={`btn-interest-${interest.id}`}
```

## Implementation Guidelines

### 1. Add testID to existing components
```tsx
// Button component already supports testID
<Button
  testID="btn-auth-continue"
  variant="primary"
  onPress={handleContinue}
>
  Continue
</Button>
```

### 2. Add to TouchableOpacity/Pressable
```tsx
<TouchableOpacity
  testID="btn-sign-out"
  onPress={handleSignOut}
>
  <Text>Sign Out</Text>
</TouchableOpacity>
```

### 3. Add to TextInput
```tsx
<TextInput
  testID="input-email"
  value={email}
  onChangeText={setEmail}
  placeholder="Email"
/>
```

### 4. Add to View containers for screens
```tsx
<SafeAreaView testID="screen-welcome" style={styles.container}>
  {/* ... */}
</SafeAreaView>
```

### 5. Add to empty/error states
```tsx
<View testID="empty-moments" style={styles.emptyContainer}>
  <Text>No moments found</Text>
</View>
```

## Maestro Selector Usage

```yaml
# By testID (preferred)
- tapOn:
    id: "btn-auth-continue"

# Wait for element
- assertVisible:
    id: "screen-discover"

# Input text
- tapOn:
    id: "input-email"
- inputText: "test@example.com"

# Dynamic elements
- assertVisible:
    id: "item-moment-.*"  # Regex for any moment item
```

## Files to Update (Minimal Changes)

### Priority 1 - Auth Flow
1. `WelcomeScreen.tsx` - Add to buttons
2. `UnifiedAuthScreen.tsx` - Add to inputs, buttons
3. `VerifyCodeScreen.tsx` - Add to OTP inputs, verify button
4. `CompleteProfileScreen.tsx` - Add to form fields, buttons

### Priority 2 - Core Navigation
5. `MainTabNavigator.tsx` - Add to tab buttons
6. `DiscoverScreen.tsx` - Add to header actions, empty state
7. `AppSettingsScreen.tsx` - Add to sign out button

### Priority 3 - Payment
8. `CoinStoreScreen.tsx` - Add to package cards, balance

### Priority 4 - Creation
9. `CreateMomentScreen.tsx` - Add to form fields, publish button

# Type Safety Implementation Guide

Bu dizin TravelMatch projesi için tip güvenliği sağlayan dosyaları içerir.

## 📁 Dizin Yapısı

```
src/
├── types/
│   ├── message.types.ts      # Discriminated Union - Message types
│   ├── guards.ts              # Type guard functions
│   └── supabase-helpers.ts    # Generic Supabase type helpers
└── schemas/
    ├── payment.schema.ts      # Zod schemas - Payment validation
    └── user.schema.ts         # Zod schemas - User validation
```

## 🎯 Kullanım Örnekleri

### 1. Discriminated Unions (Message Types)

```typescript
import { Message, isTextMessage, isImageMessage } from '@/types/message.types';

function handleMessage(message: Message) {
  // Type narrowing with discriminated union
  if (isTextMessage(message)) {
    // TypeScript knows: message.content exists
    console.log(message.content);
  } else if (isImageMessage(message)) {
    // TypeScript knows: message.image_url exists
    console.log(message.image_url);
  }
}
```

### 2. Zod Runtime Validation

```typescript
import { PaymentMetadataSchema } from '@/schemas/payment.schema';

// Compile-time + Runtime validation
try {
  const validatedMetadata = PaymentMetadataSchema.parse(unknownData);
  // TypeScript knows the exact shape now
  console.log(validatedMetadata.moment_id);
} catch (error) {
  // Invalid data caught at runtime
  console.error('Validation failed:', error);
}
```

### 3. Type Guards

```typescript
import { isUUID, isNotNull } from '@/types/guards';

const value: unknown = getUserInput();

if (isUUID(value)) {
  // TypeScript knows: value is string (UUID format)
  await fetchUser(value);
}

const items = [1, null, 3, undefined, 5];
const validItems = items.filter(isNotNull); // [1, 3, 5] with type number[]
```

### 4. Generic Pagination

```typescript
import { withCursorPagination, PaginationResult } from '@/types/supabase-helpers';

async function fetchMoments(cursor?: string): Promise<PaginationResult<Moment>> {
  const query = supabase.from('moments').select('*');
  
  const paginatedQuery = withCursorPagination(query, {
    pageSize: 20,
    cursor,
  });
  
  const { data, error } = await paginatedQuery;
  // Type-safe response handling
}
```

## ✅ Type Safety Checklist

- [x] Discriminated unions for polymorphic data (Message types)
- [x] Zod schemas for runtime validation (Payment, User)
- [x] Type guards for runtime type checking
- [x] Generic helpers for Supabase queries
- [x] ESLint rule: `no-explicit-any` → error
- [x] TypeScript strict mode enhanced
- [ ] Supabase database types (requires local DB)

## 🚀 Sonraki Adımlar

1. **Supabase Types Generation** (Docker gerekli):
   ```bash
   supabase start
   supabase gen types typescript --local > src/types/database.types.ts
   ```

2. **Mevcut Servisleri Güncelleyin**:
   - `services/userService.ts` → `SupabaseUserRow` types
   - `services/messageService.ts` → `Message` discriminated union
   - `services/paymentService.ts` → `PaymentMetadataSchema`

3. **ESLint Hatalarını Düzeltin**:
   ```bash
   pnpm lint --fix
   # Manuel düzeltme gerektirenler için:
   pnpm lint
   ```

## 📚 Best Practices

### ✅ DO

```typescript
// 1. Use discriminated unions
type Message = TextMessage | ImageMessage;

// 2. Use Zod for external data
const user = UserSchema.parse(apiResponse);

// 3. Use type guards
if (isTextMessage(msg)) { /* ... */ }

// 4. Use unknown, then narrow
const data: unknown = await fetch();
if (isObject(data)) { /* type-safe access */ }

// 5. Use generic constraints
function process<T extends BaseType>(item: T) { /* ... */ }
```

### ❌ DON'T

```typescript
// 1. Don't use any
const data: any = ...; // ❌

// 2. Don't use unsafe casting
const user = data as User; // ❌ without validation

// 3. Don't skip validation
const metadata = data.metadata; // ❌ unknown shape

// 4. Don't use type assertions
return result!; // ❌ unsafe

// 5. Don't leave implicit any
function process(item) { /* ... */ } // ❌
```

## 🔧 Konfigürasyon

### tsconfig.json
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### .eslintrc.js
```javascript
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

## 📊 Metrics

**Hedef (2 hafta):**
- Production `any` count: <10
- Type coverage: >95%
- Runtime type errors: 0
- Zod schemas: 10+

**Şu An:**
- ✅ 5 new type files created
- ✅ ESLint rule enforced
- ✅ TypeScript strict mode enhanced
- ⏳ Services refactoring pending

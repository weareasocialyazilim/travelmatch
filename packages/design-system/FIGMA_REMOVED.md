# Design System - Quick Update

## ✅ Figma Entegrasyonu Kaldırıldı

Platformda Figma kullanılmadığı için tüm Figma entegrasyonu kaldırıldı:

### Kaldırılan Dosyalar
- ❌ `figma.config.js` 
- ❌ `style-dictionary.config.js`

### Kaldırılan Bağımlılıklar
- ❌ `figma-export`
- ❌ `style-dictionary`
- ❌ `@figma/rest-api-spec`

### Kaldırılan Scripts
- ❌ `figma-export`
- ❌ `generate-tokens`

### Kaldırılan CI/CD Jobs
- ❌ `figma-sync` job (GitHub Actions)

---

## ✅ Yeni Yapı: Manuel Design Tokens

Design token'lar artık manuel olarak yönetiliyor ve kod tabanında saklanıyor:

### Token Dosyaları

1. **`src/tokens/colors.ts`** (200+ satır)
   - Primary, Secondary, Accent renkleri
   - Semantic renkler (success, warning, error, info)
   - Neutral scale (0-1000)
   - Background, text, border, overlay

2. **`src/tokens/typography.ts`** (120+ satır)
   - Font families (SF Pro Display, SF Pro Text, SF Mono)
   - Font sizes (xs → 6xl)
   - Line heights (tight, normal, relaxed, loose)
   - Font weights (light → extrabold)
   - Letter spacing
   - Text styles (h1-h6, body1-2, caption, button)

3. **`src/tokens/spacing.ts`** (60+ satır)
   - Spacing scale (4px grid: 0 → 64px)
   - Semantic spacing (gutter, sectionGap, componentGap)
   - Border radius (sm → full)
   - Shadows (none → 2xl)

4. **`src/tokens/index.ts`**
   - Tüm token'ları export eder
   - Theme type tanımı
   - Default theme

---

## 🎨 Kullanım

### Import
```typescript
import { colors, typography, spacing, radius, shadows } from '@travelmatch/design-system/tokens';
```

### Örnek
```typescript
// Colors
const primaryColor = colors.primary[500];
const backgroundColor = colors.background.primary;

// Typography
const h1Style = typography.styles.h1;
const fontSize = typography.fontSize.xl;

// Spacing
const padding = spacing.lg; // 16
const gap = spacing.componentGap; // 12

// Radius
const borderRadius = radius.md; // 8

// Shadows
const shadow = shadows.lg;
```

---

## 📝 Token Güncellemeleri

Design token'ları güncellemek için:

1. İlgili dosyayı aç (`colors.ts`, `typography.ts`, `spacing.ts`)
2. Değeri güncelle
3. Commit & push
4. CI/CD otomatik olarak build alır ve deploy eder

**Örnek:**
```typescript
// packages/design-system/src/tokens/colors.ts

export const colors = {
  primary: {
    500: '#NEW_COLOR', // Eski: '#2196F3'
  }
}
```

---

## ✅ Kalan Özellikler

Design system'in diğer tüm özellikleri aynen çalışmaya devam ediyor:

- ✅ **Storybook** - Component playground ve documentation
- ✅ **Chromatic** - Visual regression testing
- ✅ **Jest Tests** - Unit testing
- ✅ **TypeScript** - Full type safety
- ✅ **CI/CD** - Automated testing ve deployment
- ✅ **Personalization Engine** - Adaptive UI

---

## 🚀 Next Steps

1. Design token'ları review et ve gerekirse güncelle
2. Storybook'u çalıştır: `pnpm run storybook`
3. Component'ları test et
4. Production'a deploy et

**Design token dosyaları tamamen hazır ve kullanıma uygun! 🎉**

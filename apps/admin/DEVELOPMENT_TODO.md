# Admin Dashboard - Development TODO List

## 🚨 CRITICAL (Must Complete Before Launch)

### 1. Accessibility Improvements

#### 1.1 Add aria-labels to all interactive elements
```tsx
// Before
<button className="...">
  <XCircle className="h-4 w-4" />
</button>

// After
<button
  className="..."
  aria-label="Kapat"
>
  <XCircle className="h-4 w-4" />
</button>
```

**Files to update:**
- [ ] `components/layout/sidebar.tsx` - All navigation icons
- [ ] `components/canva/CanvaButton.tsx` - Icon-only buttons
- [ ] All page files with icon buttons

#### 1.2 Add alt text to Avatar components
```tsx
// Before
<AvatarImage src={user.avatar_url} />

// After
<AvatarImage
  src={user.avatar_url}
  alt={`${user.name} profil fotoğrafı`}
/>
```

**Files to update:**
- [ ] All pages using Avatar component (~20 files)

#### 1.3 Convert div tables to semantic tables
```tsx
// Before
<div className="grid grid-cols-5">
  <div>Header</div>
  ...
</div>

// After
<table>
  <thead>
    <tr><th scope="col">Header</th></tr>
  </thead>
  <tbody>
    <tr><td>Data</td></tr>
  </tbody>
</table>
```

---

### 2. Mobile Responsive Design

#### 2.1 Add sm: breakpoints to grid layouts
```tsx
// Before
<div className="grid md:grid-cols-4 gap-4">

// After
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
```

**Files to update (all dashboard pages):**
- [ ] `(dashboard)/dashboard/page.tsx`
- [ ] `(dashboard)/users/page.tsx`
- [ ] `(dashboard)/finance/page.tsx`
- [ ] ... (all 46 pages)

#### 2.2 Make tables horizontally scrollable on mobile
```tsx
// Wrap tables with:
<div className="overflow-x-auto -mx-4 sm:mx-0">
  <table className="min-w-full">
    ...
  </table>
</div>
```

#### 2.3 Add mobile navigation menu
```tsx
// In sidebar.tsx, add hamburger menu for mobile
{isMobile && (
  <button
    onClick={() => setMobileMenuOpen(true)}
    aria-label="Menüyü aç"
  >
    <Menu className="h-6 w-6" />
  </button>
)}
```

---

### 3. Remove Mock Data

#### 3.1 notifications/page.tsx
**Current mock arrays to remove:**
- `mockNotifications` (line ~50)
- `mockSegments` (line ~100)
- `mockTemplates` (line ~150)
- `mockCampaignStats` (line ~200)

**Replace with:**
```tsx
// Create hooks
const { data: notifications } = useNotifications();
const { data: segments } = useSegments();
const { data: templates } = useTemplates();
```

**API routes needed:**
- [ ] `api/notifications/route.ts` - Already exists, verify data
- [ ] `api/segments/route.ts` - Create new
- [ ] `api/templates/route.ts` - Create new

#### 3.2 users/[id]/page.tsx
**Remove:**
- `mockUser` object
- `mockActivity` array

**Replace with:**
- Proper loading state while fetching
- Error state if user not found

---

## ⚠️ HIGH PRIORITY

### 4. Fix TypeScript `any` Casts in API Routes

**Files with `any` casts:**
```
apps/admin/src/app/api/dashboard/route.ts - 7 instances
apps/admin/src/app/api/auth/setup-2fa/route.ts - 5 instances
apps/admin/src/app/api/notifications/route.ts - 3 instances
apps/admin/src/app/api/reports/route.ts - 2 instances
```

**Pattern to fix:**
```typescript
// Before
const { data } = await (supabase as any).from('table').select('*');

// After
const { data } = await supabase.from('table').select('*');
// OR if complex join:
const { data } = await supabase
  .from('table')
  .select('*, relation:other_table(*)')
  .single<CustomType>();
```

---

### 5. Add Empty States

**Files needing empty states:**
- [ ] `(dashboard)/finance/page.tsx`
- [ ] `(dashboard)/revenue/page.tsx`
- [ ] `(dashboard)/disputes/page.tsx`
- [ ] `(dashboard)/moments/page.tsx`

**Empty state component:**
```tsx
function EmptyState({
  icon: Icon,
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

---

## 📋 MEDIUM PRIORITY

### 6. Add Loading Skeletons
Create consistent loading skeletons for all page types:

```tsx
// components/skeletons/StatCardSkeleton.tsx
export function StatCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-24 bg-muted rounded mb-2" />
      <div className="h-8 w-16 bg-muted rounded" />
    </div>
  );
}
```

### 7. Keyboard Shortcuts
Add keyboard shortcuts for common actions:

```tsx
// hooks/use-keyboard-shortcuts.ts
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'k': // Search
          e.preventDefault();
          openSearch();
          break;
        case 's': // Save
          e.preventDefault();
          handleSave();
          break;
      }
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

---

## 🔧 LOW PRIORITY

### 8. Performance Optimizations
- [ ] Implement React.memo for expensive components
- [ ] Add useMemo for computed values
- [ ] Optimize images with next/image
- [ ] Add API response caching headers

### 9. Dark Mode Consistency
- [ ] Audit all color classes for dark mode variants
- [ ] Test all pages in dark mode
- [ ] Fix any color contrast issues

### 10. Documentation
- [ ] Create component usage guide
- [ ] Document API endpoints
- [ ] Add inline code comments for complex logic

---

## ✅ Completed

- [x] Fix CanvaBadge invalid variants (secondary, danger, neutral)
- [x] Fix CanvaButton invalid variants (destructive, tertiary)
- [x] Fix CanvaButton invalid sizes (small)
- [x] Align User interface with Database schema
- [x] Add totp_secret to AdminUser interface
- [x] Remove `as any` from auth.ts
- [x] Remove `as any` from use-auth.ts
- [x] Remove `as any` from use-realtime.ts
- [x] Replace inconsistent root page with dashboard redirect

---

## 📝 Notes for Developers

### Component Variants Reference

**CanvaBadge:**
- `default` - Gray/neutral
- `primary` - Purple/violet
- `success` - Green
- `warning` - Yellow/amber
- `error` - Red
- `info` - Blue
- `outline` - Border only

**CanvaButton:**
- `primary` - Purple filled
- `secondary` - Gray filled
- `outline` - Border only
- `ghost` - Transparent
- `success` - Green filled
- `danger` - Red filled

**CanvaButton Sizes:**
- `xs` - Extra small (h-7)
- `sm` - Small (h-8)
- `md` - Medium (h-10) [default]
- `lg` - Large (h-12)
- `xl` - Extra large (h-14)

### Testing Checklist

Before submitting any PR:
- [ ] Test in Chrome, Firefox, Safari
- [ ] Test in dark mode
- [ ] Test keyboard navigation
- [ ] Test screen reader (VoiceOver/NVDA)
- [ ] Test on mobile viewport (375px, 768px)
- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] Run linter: `npm run lint`

---

*Last updated: January 2026*

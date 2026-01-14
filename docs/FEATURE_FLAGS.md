# FEATURE_FLAGS.md

## TravelMatch - Feature Flags Registry

**Tarih:** 2026-01-14
**Versiyon:** Stabilization Release

---

## 1. Yeni Eklenen Feature Flags

### 1.1 Admin Panel Flags

| Flag Adi | Lokasyon | Default | Aciklama |
|----------|----------|---------|----------|
| `TRIAGE_ACTIONS_ENABLED` | triage/page.tsx | `false` | Triage queue action butonlarini aktiflestirir |

**Kullanim:**
```typescript
// apps/admin/src/app/(dashboard)/triage/page.tsx:35
const TRIAGE_ACTIONS_ENABLED = false; // PASSIVE MODE

// Approve/Reject butonlari:
<CanvaButton
  disabled={!TRIAGE_ACTIONS_ENABLED}
  onClick={() => handleApprove(item.id)}
>
  Onayla
</CanvaButton>
```

**Aktivasyon Kosullari:**
- QA tarafindan test edilmeli
- Product owner onayi gerekli
- Staging'de en az 1 hafta calismali

---

### 1.2 Mock Data Flags

| Flag/Mod | Lokasyon | Default | Aciklama |
|----------|----------|---------|----------|
| `isMockData` | ops-dashboard | `true` | Mock data kullanildigini belirtir |
| `isMockData` | triage | `true` | Mock data kullanildigini belirtir |
| `isMockData` | integration-health | `true` | Mock data kullanildigini belirtir |

**NOT:** Bu flag'lar UI'da "Mock Data" badge'i gostermek icin kullanilir. Gercek data baglantiginda `false` yapilmalidir.

---

## 2. Mevcut Feature Flags (Reference)

### 2.1 Mobile App Flags

```typescript
// apps/mobile/src/config/featureFlags.ts

export const FEATURE_FLAGS = {
  // Payment
  STRIPE_ENABLED: true,
  ESCROW_ENABLED: true,

  // Social
  CHAT_ENABLED: true,
  VIDEO_CALL_ENABLED: false,

  // Discovery
  MAP_VIEW_ENABLED: true,
  AI_RECOMMENDATIONS_ENABLED: false,

  // Notifications
  PUSH_NOTIFICATIONS_ENABLED: true,
  IN_APP_NOTIFICATIONS_ENABLED: true,

  // Analytics
  POSTHOG_ENABLED: true,
  SENTRY_ENABLED: true,
};
```

### 2.2 Admin Panel Flags (Existing)

```typescript
// apps/admin/src/config/features.ts

export const ADMIN_FEATURES = {
  // User Management
  USER_IMPERSONATION: true,
  BULK_USER_ACTIONS: false,

  // Content Moderation
  AUTO_MODERATION: false,
  AI_CONTENT_REVIEW: false,

  // Finance
  MANUAL_REFUNDS: true,
  PAYOUT_APPROVAL: true,

  // Reports
  EXPORT_TO_CSV: true,
  EXPORT_TO_EXCEL: true,
};
```

---

## 3. Flag Yonetim Rehberi

### 3.1 Flag Ekleme Kurallari

1. **Yeni ozellik = Yeni flag**
   - Her yeni ozellik icin flag olustur
   - Default KAPALI olmali

2. **Naming Convention**
   ```
   FEATURE_NAME_ENABLED
   MODULE_ACTION_ENABLED
   ```

3. **Dokumantasyon**
   - Bu dosyaya ekle
   - Aktivasyon kosullarini belirt

### 3.2 Flag Aktivasyon Sureci

```
1. Gelistirici flag'i KAPALI olarak ekler
2. QA staging'de test eder
3. Product owner onaylar
4. Flag ACIK yapilir
5. 2 hafta sonra flag kaldirilir (kod kalici olur)
```

### 3.3 Flag Kaldirma

```typescript
// Flag 2+ haftadir ACIK ve stabil ise:

// BEFORE:
if (FEATURE_X_ENABLED) {
  doNewThing();
} else {
  doOldThing();
}

// AFTER:
doNewThing();
// doOldThing() tamamen kaldirilir
```

---

## 4. Stabilization Release Ozel Notlar

### 4.1 PASSIVE MODE Aciklamasi

Triage Queue "PASSIVE MODE" ile gonderildi:

```typescript
const TRIAGE_ACTIONS_ENABLED = false;
```

**Neden?**
- Yeni ozellik, production'da test edilmeli
- Kullanici aksiyonlari risk tasir
- Oncelikle READ-ONLY olarak calistirilmali

**Ne Zaman ACIK?**
- 1 hafta mock data ile calismali
- Gercek data baglantisi yapilmali
- QA tam test yapmali
- Product owner onaylamali

### 4.2 Mock Data Gecisi

Tum yeni dashboard'lar mock data ile baslar:

```typescript
// Simdi:
const data = generateMockData();
return { ...data, isMockData: true };

// Gelecekte (flag ile):
if (USE_REAL_DATA) {
  const data = await fetchFromSupabase();
  return { ...data, isMockData: false };
} else {
  return { ...generateMockData(), isMockData: true };
}
```

---

## 5. Flag Status Ozeti

### Stabilization Release

| Flag | Durum | Aktivasyon Tahmini |
|------|-------|-------------------|
| TRIAGE_ACTIONS_ENABLED | KAPALI | 1-2 hafta sonra |

### Gelecek Sprint

| Flag | Planlanan | Aciklama |
|------|-----------|----------|
| REAL_OPS_DATA_ENABLED | Yeni | Ops dashboard gercek data |
| REAL_TRIAGE_DATA_ENABLED | Yeni | Triage gercek data |
| REAL_HEALTH_DATA_ENABLED | Yeni | Integration health gercek data |

---

## 6. Rollback Proseduru

Herhangi bir sorun durumunda:

```typescript
// 1. Flag'i KAPAT
const TRIAGE_ACTIONS_ENABLED = false;

// 2. Deploy et
// 3. Sorunu incele
// 4. Duzelt ve tekrar test et
// 5. Flag'i tekrar AC
```

**Rollback Suresi:** < 5 dakika (sadece flag degisikligi)

---

*Dokuman Tarihi: 2026-01-14*
*Hazirlayan: Claude (Release Guardian)*

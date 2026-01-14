# Mobile Diagnostics

## Ozet

Mobile Diagnostics, kullanicilarin cihazlarinda yasadiklari sorunlari teşhis etmek icin gizli bir ekran saglar. QA ekibi veya founder hata ayiklama yaparken kullanilir.

**Kritik:** Bu sadece okuma amaclidir. Hicbir veri disariya gonderilmez veya degistirilmez.

---

## Ne Yapar / Ne Yapmaz

### Yapar

- Build bilgisi gosterir (version, platform, device)
- Config sanity check gosterir (Supabase URL, auth state)
- Error log gosterir (son 50 hata, ring buffer)
- Performance snapshots gosterir (screen TTI)
- Panoya kopyalama imkani (PII-scrubbed, guvenli paylasim)
- Tum verileri temizleme imkani

### Yapmaz

- **Dis API cagrisi yapmaz** (NO-NETWORK)
- Veri gondermez (Sentry, PostHog, analytics)
- Kisisel bilgi gostermez (PII-SCRUBBED)
- Mevcut ayarlari degistirmez
- Kullanici verisini silmez (sadece diagnostics log)

---

## Feature Flag

```bash
# Mobile diagnostics etkinlestirme (default: DEV mode'da ON)
EXPO_PUBLIC_MOBILE_DIAGNOSTICS_ENABLED=true
```

```typescript
// apps/mobile/src/config/diagnostics.ts
export const MOBILE_DIAGNOSTICS_ENABLED =
  process.env.EXPO_PUBLIC_MOBILE_DIAGNOSTICS_ENABLED === 'true' || __DEV__;
```

**Not:** Gelistirme modunda (`__DEV__`) flag acik olmasa bile otomatik etkindir.

---

## Gizli Erisim Mekanizmasi

### 7-Tap Gesture

Settings ekraninda footer'daki version yazisina 7 kez tıklamak Diagnostics ekranini acar.

```typescript
// apps/mobile/src/features/settings/screens/AppSettingsScreen.tsx
const handleVersionTap = useCallback(() => {
  if (!MOBILE_DIAGNOSTICS_ENABLED) return;

  const now = Date.now();
  // 2 saniyeden uzun aralikta tap'ler sayilmaz
  if (now - lastTapTimeRef.current > 2000) {
    tapCountRef.current = 0;
  }
  lastTapTimeRef.current = now;
  tapCountRef.current++;

  if (tapCountRef.current >= DIAGNOSTICS_TAP_COUNT) {
    tapCountRef.current = 0;
    navigation.navigate('Diagnostics');
  }
}, [navigation]);
```

### Neden Gizli?

- Kullanicilari gereksiz karmasikliktan korur
- Sadece ihtiyac duyan kisiler (QA, founder, destek) erisir
- Standart Android/iOS developer ayarlari pattern'i

---

## Ekran Icerigi

### 1. Overview Tab

| Bolum | Icerik |
|-------|--------|
| Build Info | Version, build number, platform, device, environment |
| Config Sanity | Supabase URL/Key durumu, service role leak kontrolu, auth state |
| Quick Stats | Hata sayisi, son hata zamani, en yavas ekran |

### 2. Errors Tab

Son 50 hata kaydi (ring buffer):

| Alan | Aciklama |
|------|----------|
| Level | critical, error, warning, info |
| Timestamp | Hata zamani |
| Message | Hata mesaji (PII-scrubbed, max 200 karakter) |
| Source | api_error, network, render_error, async_storage, global_error |
| Screen | Hata anindaki ekran adi |
| Code | Hata kodu (varsa) |

### 3. Performance Tab

En yavas 5 ekran (ortalama TTI):

| Metric | Aciklama |
|--------|----------|
| Screen Name | Ekran adi |
| Avg TTI | Ortalama Time to Interactive (ms) |
| Count | Olcum sayisi |

Renk kodlari:
- Yesil: <1000ms (iyi)
- Sari: 1000-2000ms (yavas)
- Kirmizi: >2000ms (cok yavas)

---

## PII Scrubbing

Tum loglar kaydedilmeden once PII temizlenir:

```typescript
// apps/mobile/src/utils/diagnosticsLogger.ts
export const PII_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(\+?[0-9]{1,4}[-.\s]?)?(\(?[0-9]{2,4}\)?[-.\s]?)?[0-9]{3,4}[-.\s]?[0-9]{4}/g,
  token: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
  uuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
  apiKey: /(api[_-]?key|apikey|secret|token|password|auth)[=:]["']?[a-zA-Z0-9_-]+["']?/gi,
};
```

Tum eslesmeler `[REDACTED]` ile degistirilir.

---

## Ring Buffer

Loglar sabit boyutlu ring buffer'da tutulur:

```typescript
export const MAX_ERROR_LOG_SIZE = 50;    // Son 50 hata
export const MAX_PERFORMANCE_LOG_SIZE = 50;  // Son 50 TTI olcumu
```

Buffer dolunca en eski kayitlar silinir.

---

## Storage

Tum veriler MMKV'de yerel olarak saklanir:

```typescript
export const DIAGNOSTICS_STORAGE_KEYS = {
  ERROR_LOG: '@diagnostics/error_log',
  PERFORMANCE_LOG: '@diagnostics/performance_log',
  LAST_CLEAR: '@diagnostics/last_clear',
};
```

---

## Dosya Yapisi

```
apps/mobile/src/
├── config/
│   └── diagnostics.ts        # Feature flag + types
├── utils/
│   └── diagnosticsLogger.ts  # Ring buffer + PII scrub
└── features/
    └── settings/
        └── screens/
            ├── AppSettingsScreen.tsx    # 7-tap gesture
            └── DiagnosticsScreen.tsx    # Main UI

docs/
├── MOBILE_DIAGNOSTICS.md         # Bu dosya
└── MOBILE_DIAGNOSTICS_VERIFY.md  # Verification report
```

---

## Kullanim Senaryolari

### 1. Kullanici Bug Report

Kullanici destek'e yazdiginda:
1. Destek kullaniciya 7-tap'i anlatir
2. Kullanici Diagnostics ekranini acar
3. "Copy to Clipboard" butonuna tiklar
4. PII-scrubbed ozet destek'e gonderilir

### 2. QA Test

QA tester:
1. Settings > 7-tap on version
2. Errors tab'da hatalari inceler
3. Performance tab'da yavas ekranlari tespit eder

### 3. Founder Debug

Founder production issue'da:
1. Kendi cihazinda Diagnostics'i acar
2. Config sanity check yapar
3. Error log inceler

---

## Guvenlik

### NO-NETWORK Compliance

- Dis API cagrisi YOK
- Sentry/PostHog YOK
- Webhook YOK
- Email/SMS YOK
- Sadece yerel storage (MMKV)

### PII-SCRUBBED

- Email adresleri maskelenir
- Telefon numaralari maskelenir
- JWT token'lar maskelenir
- UUID'ler maskelenir
- API key'ler maskelenir

### READ-ONLY

- Sadece okuma islemi
- Kullanici verisi degistirmez
- Sadece diagnostics log silinebilir

---

## Rollback Proseduru

### Hizli Deaktif

```bash
# Flag'i kapat
EXPO_PUBLIC_MOBILE_DIAGNOSTICS_ENABLED=false

# Rebuild gerekli (OTA update degil)
```

### Tam Kaldirim

1. `EXPO_PUBLIC_MOBILE_DIAGNOSTICS_ENABLED=false`
2. 7-tap kodu `if (!MOBILE_DIAGNOSTICS_ENABLED) return;` ile korunur
3. Screen asla acilmaz

**Not:** __DEV__ modda her zaman erisilebiir (gelistirme kolayligi).

---

## Final Statement

> **Bu ozellik sadece okuma amaclidir; hicbir veri disariya gonderilmez ve kullanici verisini degistirmez.**

---

*Dokumantasyon Tarihi: 2026-01-14*

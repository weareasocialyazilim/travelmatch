# Mobile Health Inbox

## Ozet

Mobile Health Inbox, founder'in mobile app'ten kopyalanan diagnostics ozetini parse edip triage
onerisi sunan NO-NETWORK bir admin aracıdir.

**Kritik:** Network cagrisi YOK. Tum parsing islemleri client-side'da yapilir.

---

## Ne Yapar / Ne Yapmaz

### Yapar

- Mobile Diagnostics'ten kopyalanan text'i parse eder
- Build bilgisi cikartir
- Config sanity durumu cikartir
- Hata sayisi ve yavas ekranlari listeler
- Otomatik triage onerisi uretir (P0-P3)

### Yapmaz

- **Dis API cagrisi yapmaz** (NO-NETWORK)
- Database'e yazmaz
- Database'den okumaz
- Rapor kaydetmez (gerekirse manuel copy/paste)

---

## Feature Flag

```bash
# Mobile Health Inbox etkinlestirme (default: kapali)
NEXT_PUBLIC_MOBILE_HEALTH_INBOX_ENABLED=true
```

```typescript
// apps/admin/src/config/mobile-health-inbox.ts
export const MOBILE_HEALTH_INBOX_ENABLED =
  process.env.NEXT_PUBLIC_MOBILE_HEALTH_INBOX_ENABLED === 'true';
```

---

## Erisim

1. Command Center'a git (`/command-center`)
2. super_admin olarak giris yap
3. "Founder Pulse" bolumunde "Mobile Health Inbox" basligina tikla
4. Expand edilen alana diagnostics text'i yapistir
5. "Parse" butonuna tikla

---

## Kullanim Akisi

### 1. Mobile'dan Kopyala

Mobile app → Settings → 7-tap on version → Diagnostics → Copy to Clipboard

### 2. Admin'e Yapistir

Command Center → Founder Pulse → Mobile Health Inbox → Paste → Parse

### 3. Triage'i Oku

Parser otomatik olarak su bilgileri cikartir:

- Build Info (version, platform, device)
- Config Sanity (Supabase, auth state)
- Error Count
- Slow Screens (TTI > 1s)
- Triage Recommendations (P0-P3)

---

## Triage Seviyeleri

| Seviye | Anlam                   | Ornek                                          |
| ------ | ----------------------- | ---------------------------------------------- |
| **P0** | Kritik - Hemen mudahale | Service role key leak, Supabase config missing |
| **P1** | Yuksek - Bugun bak      | 20+ error, TTI > 2s ekranlar                   |
| **P2** | Orta - Bu hafta bak     | 5-20 error, TTI > 1s ekranlar                  |
| **P3** | Dusuk - Bilgi           | Her sey normal, minor iyilestirmeler           |

---

## Parse Edilen Format

Parser, mobile `getDiagnosticsSummaryText()` ciktisini bekler:

```
═══ TravelMatch Diagnostics ═══

📱 Build Info:
  Version: 1.0.0 (123)
  Platform: ios 17.0
  Device: iPhone 15 Pro
  Environment: production

⚙️ Config Sanity:
  Supabase URL: ✅ ok
  Supabase Key: ✅ ok
  Service Role Leak: ✅ None
  Auth State: logged_in

🐛 Errors: 5 logged

🐢 Top 5 Slowest Screens:
  1. Discover: 1200ms (10x)
  2. ProfileDetail: 800ms (5x)
  ...

Generated: 2026-01-14T12:00:00.000Z
```

---

## Dosya Yapisi

```
apps/admin/src/
├── config/
│   └── mobile-health-inbox.ts     # Config + Parser + Types
└── components/
    └── founder/
        └── MobileHealthInbox.tsx  # UI Component

apps/admin/src/app/(dashboard)/
└── command-center/
    └── page.tsx                   # Entegrasyon noktasi
```

---

## SAFE MODE Compliance

| Kural            | Durum                        |
| ---------------- | ---------------------------- |
| NO-NETWORK       | 100% client-side parsing     |
| NO-DATABASE      | Okuma/yazma YOK              |
| Feature Flag     | Default OFF                  |
| super_admin only | Command Center zaten koruyor |

---

## Gelistirme Notlari

### Parser Genisletme

Yeni bir alan parse etmek icin `parseDiagnosticsSummary()` fonksiyonuna regex ekle:

```typescript
// apps/admin/src/config/mobile-health-inbox.ts
const newFieldMatch = text.match(/New Field:\s*(.+)/);
if (newFieldMatch) {
  result.newField = newFieldMatch[1].trim();
}
```

### Yeni Triage Kurali

`parseDiagnosticsSummary()` icinde triage logic bolumune ekle:

```typescript
if (someCondition) {
  triage.push({
    level: 'P1',
    reason: 'HIGH: New issue detected.',
  });
}
```

---

## Final Statement

> **Bu ozellik 100% client-side'dir; hicbir network cagrisi yapmaz ve database'e erisim yoktur.**

---

_Dokumantasyon Tarihi: 2026-01-14_

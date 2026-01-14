# Founder Decision Loop

## Özet

Founder Decision Loop, super_admin kullanıcısının karar alma sürecini takip eden bir kapanış mekanizmasıdır.

**Önemli:** Bu bir otomasyon değildir. Sadece "karar alındı mı?" bilgisini kaydeder.

---

## Ne Yapar / Ne Yapmaz

### ✅ Yapar

- Founder'ın günlük kararlarını loglar (reviewed, deferred, focused)
- Bugünkü review/defer sayılarını gösterir
- Bu haftanın odağını takip eder
- Zihinsel yükü azaltır ("buna baktım mı?" sorusunu ortadan kaldırır)

### ❌ Yapmaz

- Otomasyon tetiklemez
- Başka sistemlere bildirim göndermez
- Mevcut workflow'ları değiştirmez
- Dış servislerle iletişim kurmaz (NO-NETWORK)

---

## Feature Flag

```typescript
// apps/admin/src/config/founder-config.ts

export const FOUNDER_DECISION_LOOP_ENABLED = false; // DEFAULT: OFF
```

### Flag Durumlarına Göre Davranış

| Flag | UI | API | Davranış |
|------|----|----|----------|
| `false` (default) | Butonlar görünmez | 403 döner | Mevcut sistem aynen çalışır |
| `true` | Butonlar görünür | Çalışır | Karar logging aktif |

### Aktivasyon

1. `FOUNDER_DECISION_LOOP_ENABLED = true` yapın
2. Deploy edin
3. super_admin olarak giriş yapın
4. /ceo-briefing veya /command-center'da butonları görün

---

## Database Schema

### Tablo: `founder_decision_log`

```sql
CREATE TABLE founder_decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Kimin kararı
  actor_admin_id UUID NOT NULL,

  -- Hangi sayfada
  context_page TEXT NOT NULL, -- 'ceo-briefing' | 'command-center'

  -- Ne tür item
  item_type TEXT NOT NULL, -- 'fire' | 'focus' | 'hygiene' | 'strategic'
  item_key TEXT NOT NULL, -- UI item'ını tanımlayan key

  -- Alınan aksiyon
  action TEXT NOT NULL, -- 'reviewed' | 'deferred' | 'focused'

  -- Opsiyonel
  note TEXT,
  metadata JSONB DEFAULT '{}'
);
```

### RLS Politikaları

- **SELECT:** Sadece super_admin
- **INSERT:** Sadece super_admin
- **UPDATE/DELETE:** Yok (append-only log)

---

## API Endpoint

### GET /api/founder-decisions

Bugünkü istatistikleri ve mevcut odağı döner.

**Response:**
```json
{
  "stats": {
    "reviewedToday": 5,
    "deferredToday": 2,
    "currentFocus": "premium_conversion",
    "focusSetAt": "2026-01-14T08:30:00Z"
  }
}
```

### POST /api/founder-decisions

Yeni bir karar kaydeder.

**Request:**
```json
{
  "context_page": "ceo-briefing",
  "item_type": "fire",
  "item_key": "decision_1",
  "action": "reviewed",
  "note": "Opsiyonel not"
}
```

**Response:**
```json
{
  "success": true,
  "id": "uuid",
  "created_at": "2026-01-14T10:00:00Z"
}
```

---

## Güvenlik

### Server-Side Checks

1. **Feature flag check:** `FOUNDER_DECISION_LOOP_ENABLED === true`
2. **Auth check:** `session.admin.role === 'super_admin'`
3. **Validation:** Tüm alanlar validate edilir
4. **Idempotency:** 5 saniye içinde duplicate log önlenir

### Client-Side Checks

1. **Feature flag:** `useFounderDecisionEnabled()` hook
2. **Permission:** `isSuperAdmin()` check
3. **UI:** Butonlar sadece her iki koşul true ise görünür

### Audit Log

- Generic isimle loglanır: `action: 'FOUNDER_DECISION'`
- Özel sayfa/route ismi geçmez
- PII loglanmaz

---

## UI Entegrasyonu

### CEO Briefing (/ceo-briefing)

🔥 **Yangın kartları:**
- "Reviewed" butonu → `action: 'reviewed'`
- "Defer" butonu → `action: 'deferred'`

🎯 **Bu Hafta Odak:**
- "Bu Hafta Odağım Bu" butonu → `action: 'focused'`

### Command Center (/command-center)

**Founder Pulse bölümü:**
- Bugünkü reviewed/deferred sayıları
- Mevcut haftalık odak

---

## Dosya Yapısı

```
apps/admin/src/
├── config/
│   └── founder-config.ts     # Feature flag ve tipler
├── hooks/
│   └── use-founder-decisions.ts  # React hook
├── app/
│   ├── api/
│   │   └── founder-decisions/
│   │       └── route.ts      # API endpoint
│   └── (dashboard)/
│       ├── ceo-briefing/
│       │   └── page.tsx      # UI butonları
│       └── command-center/
│           └── page.tsx      # Stats gösterimi

supabase/migrations/
└── 20260114000001_add_founder_decision_log.sql
```

---

## Rollback Planı

1. `FOUNDER_DECISION_LOOP_ENABLED = false` yapın
2. Deploy edin
3. Butonlar kaybolur, API 403 döner
4. Mevcut sistem aynen çalışmaya devam eder

**Rollback süresi:** < 5 dakika

---

*Dokümantasyon Tarihi: 2026-01-14*

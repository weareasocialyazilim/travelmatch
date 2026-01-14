# Founder Decision Loop

## Özet

Founder Decision Loop, super_admin kullanıcısının karar alma sürecini takip eden bir kapanış
mekanizmasıdır.

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

## Feature Flag (Two-Layer Model)

### İki Katmanlı Güvenlik

```bash
# 1. CLIENT FLAG - UI Görünürlüğü (public, browser'da görünür)
NEXT_PUBLIC_FOUNDER_DECISION_LOOP_ENABLED=true

# 2. SERVER FLAG - API Data Erişimi (private, sadece server)
FOUNDER_DECISION_LOOP_ENABLED=true
```

```typescript
// apps/admin/src/config/founder-config.ts

// Client-side: UI visibility
export const FOUNDER_DECISION_LOOP_ENABLED =
  process.env.NEXT_PUBLIC_FOUNDER_DECISION_LOOP_ENABLED === 'true';

// Server-side: API data access (NO FALLBACK to public!)
export function isFounderDecisionLoopEnabled(): boolean {
  return process.env.FOUNDER_DECISION_LOOP_ENABLED === 'true';
}
```

### Flag Kombinasyonları

| Client Flag | Server Flag | UI      | API     | Sonuç                      |
| ----------- | ----------- | ------- | ------- | -------------------------- |
| ❌ OFF      | ❌ OFF      | Gizli   | 403     | Feature yok                |
| ✅ ON       | ❌ OFF      | Görünür | 403     | UI var, data yok (güvenli) |
| ❌ OFF      | ✅ ON       | Gizli   | Çalışır | Kullanılamaz (güvenli)     |
| ✅ ON       | ✅ ON       | Görünür | Çalışır | **Tam işlevsel**           |

### Neden İki Katman?

**Operasyonel emniyet:**

- Client flag yanlışlıkla açık kalsa bile → server kapalı = data yok
- `NEXT_PUBLIC_*` herkes görebilir ama **güvenlik flag'den değil, server check'ten gelir**
- Her iki flag da açık olsa bile → `super_admin` değilsen yine 401

### Aktivasyon (Deploy Gerektirmez!)

```bash
# Full aktivasyon için İKİ FLAG da gerekli:
NEXT_PUBLIC_FOUNDER_DECISION_LOOP_ENABLED=true
FOUNDER_DECISION_LOOP_ENABLED=true
```

1. Her iki ENV variable'ı ayarlayın
2. Server'ı restart edin (veya Vercel'de Environment Variables'dan ekleyin)
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

Bugünkü istatistikleri, mevcut odağı ve ertelenen item'ları döner.

**Response:**

```json
{
  "stats": {
    "reviewedToday": 5,
    "deferredToday": 2,
    "currentFocus": "premium_conversion",
    "focusSetAt": "2026-01-14T08:30:00Z"
  },
  "deferredBacklog": [
    {
      "id": "uuid",
      "item_key": "payment_gateway_review",
      "item_type": "strategic",
      "note": "Q2'de değerlendir",
      "created_at": "2026-01-14T09:00:00Z"
    }
  ]
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
- **Ertelenenler (son 5):** En son ertelenen karar item'larının listesi

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

### Hızlı Rollback (Sadece API kapatma)

1. `FOUNDER_DECISION_LOOP_ENABLED=false` yapın (veya silin)
2. Server restart → API 403 döner
3. UI butonları görünür kalır ama çalışmaz (güvenli)

### Tam Rollback (UI + API)

1. Her iki flag'i de kaldırın veya `false` yapın
2. Server restart
3. Butonlar kaybolur + API 403

**Rollback süresi:** < 1 dakika (kod değişikliği gerektirmez!)

---

## Kullanım Protokolü

### Günlük Ritüel (Alert varsa, ~10 dk)

1. `/command-center` aç
2. **Founder Pulse** bölümüne bak
3. "Karar bekliyor" item'ları için:
   - ✅ **Reviewed** → "Baktım, aksiyon aldım/almayacağım"
   - 🕐 **Defer** → "Şu an değil, sonra bakarım"
4. **Ertelenenler (son 5)** listesinden 1 tanesini:
   - Ya kapat (reviewed)
   - Ya tekrar defer + not ekle

### Haftalık Ritüel (1 saat, Pazartesi sabahı önerilir)

1. `/ceo-briefing` aç
2. 🎯 **Bu Hafta Odak** seç (tek bir konu)
3. Geçen haftanın defer'larından 2 tanesini kapat
4. Haftalık metriklere bak, anomali var mı?

### Neden Bu Protokol?

- **Dashboard bağımlılığı yaratmaz** → Seni dashboard'a çekmez, seni rahatlatır
- **Karar yorgunluğunu azaltır** → "Buna baktım mı?" sorusu ortadan kalkar
- **Focus korur** → Haftada tek odak, günde sınırlı karar

---

_Dokümantasyon Tarihi: 2026-01-14_

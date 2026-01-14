# Founder Alert Routing

## Özet

Founder Alert Routing, internal kaynaklardan alarm bilgisi çekerek Founder Pulse içinde görünürlük sağlar.

**Kritik:** Bu bir otomasyon değildir. Sadece "neye bakmalıyım?" bilgisini gösterir.

---

## Ne Yapar / Ne Yapmaz

### ✅ Yapar

- Internal tablolardan alarm durumlarını okur
- Kritikten düşük önceliğe sıralı liste gösterir (ERROR > WARN > INFO)
- Son 24 saatlik olayları özetler
- Founder'a "hangi alana bakmalıyım?" görünürlüğü sağlar

### ❌ Yapmaz

- **Dış API çağrısı yapmaz** (Sentry, PostHog, Slack - YASAK)
- Otomasyon tetiklemez
- Bildirim göndermez (email, push, SMS)
- Mevcut workflow'ları değiştirmez
- Veritabanına yazmaz (read-only)

---

## Feature Flag (Two-Layer Model)

### İki Katmanlı Güvenlik

```bash
# 1. CLIENT FLAG - UI Görünürlüğü (public, browser'da görünür)
NEXT_PUBLIC_FOUNDER_ALERTS_ENABLED=true

# 2. SERVER FLAG - API Data Erişimi (private, sadece server)
FOUNDER_ALERTS_ENABLED=true
```

```typescript
// apps/admin/src/config/founder-alerts.ts

// Client-side: UI visibility
export const FOUNDER_ALERTS_ENABLED =
  process.env.NEXT_PUBLIC_FOUNDER_ALERTS_ENABLED === 'true';

// Server-side: API data access (NO FALLBACK to public!)
export function isFounderAlertsEnabled(): boolean {
  return process.env.FOUNDER_ALERTS_ENABLED === 'true';
}
```

### Flag Kombinasyonları

| Client Flag | Server Flag | UI | API | Sonuç |
|-------------|-------------|----|----|-------|
| ❌ OFF | ❌ OFF | Gizli | 403 | Feature yok |
| ✅ ON | ❌ OFF | Görünür | 403 | UI var, data yok (güvenli) |
| ❌ OFF | ✅ ON | Gizli | Çalışır | Kullanılamaz (güvenli) |
| ✅ ON | ✅ ON | Görünür | Çalışır | **Tam işlevsel** |

### Aktivasyon

```bash
# Full aktivasyon için İKİ FLAG da gerekli:
NEXT_PUBLIC_FOUNDER_ALERTS_ENABLED=true
FOUNDER_ALERTS_ENABLED=true
```

---

## Noise Control (Pager Kalitesi)

Alert fatigue'i önlemek için iki mekanizma:

### 1. Alert Budget (Level Başına Limit)

```typescript
// Her level için maximum alert sayısı
ALERT_LEVEL_BUDGET = {
  error: 2,  // Max 2 ERROR
  warn: 2,   // Max 2 WARN
  info: 1,   // Max 1 INFO
};
// Total: 5 alert
```

Bu sayede dashboard her zaman okunabilir kalır.

### 2. Cooldown (Dedup Window)

Her alert tipi için cooldown süresi var:

| Alert | Cooldown | Neden |
|-------|----------|-------|
| Critical Errors | 30 dk | Hızlı dikkat gerekli |
| Critical Triage | 30 dk | Hızlı dikkat gerekli |
| Integration Failures | 60 dk | Normal öncelik |
| Error Spike | 60 dk | Normal öncelik |
| Triage Backlog | 120 dk | Yavaş değişir |
| Degraded Integrations | 120 dk | Düşük öncelik |

**Fresh vs Stale:**
- `isFresh: true` → Cooldown dışında, dikkat çekmeli (parlak görünür)
- `isFresh: false` → Cooldown içinde, sadece count arttı (soluk görünür)

### 3. Actionable Links

Her alert satırında "→" butonu:
- Tıklayınca ilgili sayfaya yönlendirir
- "Bak → aksiyon" kısaltması sağlar

| Alert | Link |
|-------|------|
| Integration Failures | `/integration-health` |
| Critical Errors | `/ops-dashboard` |
| Critical Triage | `/triage?priority=critical&status=pending` |
| High Risk Security | `/audit-logs?type=security` |
| Content Violations | `/triage?type=content_flag` |
| Triage Backlog | `/triage?status=pending` |
| Error Spike | `/ops-dashboard` |

---

## Veri Kaynakları (Internal Only)

Tüm veriler mevcut internal tablolardan okunur. Yeni tablo eklenmedi.

| Tablo | Alert Türü | Condition |
|-------|-----------|-----------|
| `integration_health_events` | Integration Failures | status IN ('failure', 'timeout') |
| `internal_error_log` | Critical Errors | severity = 'critical' |
| `triage_items` | Critical Triage | status = 'pending', priority = 'critical' |
| `security_logs` | High Risk Security | risk_score >= 70, event_status IN ('failure', 'blocked') |
| `moderation_logs` | Content Violations | severity IN ('high', 'critical') |

---

## Alert Tanımları

### ERROR Level (Kritik)

| Key | Title | Threshold | Lookback |
|-----|-------|-----------|----------|
| `integration_failures` | Integration Failures | 5+ | 24h |
| `critical_errors` | Critical Errors | 1+ | 24h |
| `critical_triage` | Critical Triage Queue | 1+ | 24h |

### WARN Level (Uyarı)

| Key | Title | Threshold | Lookback |
|-----|-------|-----------|----------|
| `high_risk_security` | High Risk Security Events | 3+ | 24h |
| `content_violations` | Content Violations | 5+ | 24h |
| `triage_backlog` | Triage Backlog | 20+ | All time |
| `error_spike` | Error Spike | 20+ | 24h |

### INFO Level (Bilgi)

| Key | Title | Threshold | Lookback |
|-----|-------|-----------|----------|
| `degraded_integrations` | Degraded Integrations | 10+ | 24h |
| `login_failures` | Login Failures | 50+ | 24h |

---

## API Endpoint

### GET /api/founder-alerts

Active alert'leri döner.

**Security Gates:**
1. `isFounderAlertsEnabled()` → Server flag check
2. `session.admin.role === 'super_admin'` → Hard auth check

**Response:**
```json
{
  "alerts": [
    {
      "key": "integration_failures",
      "level": "error",
      "title": "Integration Failures",
      "shortDetail": "5 entegrasyon hatası (son 24s)",
      "count": 5,
      "lastSeenAt": "2026-01-14T10:00:00Z"
    }
  ],
  "totalCount": 3,
  "fetchedAt": "2026-01-14T12:00:00Z"
}
```

---

## UI Entegrasyonu

### Command Center (/command-center)

**Founder Pulse bölümü:**
- 🔔 Alerts (son 24 saat) listesi
- Max 5 alert gösterilir
- Fazlası varsa "+N more" gösterilir
- Boşsa: "Son 24 saatte kritik alarm yok" mesajı

---

## Dosya Yapısı

```
apps/admin/src/
├── config/
│   └── founder-alerts.ts      # Feature flag + alert tanımları
├── hooks/
│   └── use-founder-alerts.ts  # React hook
├── app/
│   ├── api/
│   │   └── founder-alerts/
│   │       └── route.ts       # API endpoint (NO-NETWORK)
│   └── (dashboard)/
│       └── command-center/
│           └── page.tsx       # UI (alert card)

docs/
├── FOUNDER_ALERT_ROUTING.md   # Bu dosya
└── ALERT_ROUTING_VERIFY.md    # Verification report
```

---

## Güvenlik

### Server-Side Checks

1. **Feature flag check:** `isFounderAlertsEnabled()` (server-only)
2. **Auth check:** `session.admin.role === 'super_admin'`
3. **Read-only:** Sadece SELECT queries

### Client-Side Checks

1. **Feature flag:** `FOUNDER_ALERTS_ENABLED` (client env)
2. **Permission:** `isSuperAdmin()` check
3. **UI:** Alert card sadece her iki koşul true ise görünür

### NO-NETWORK Compliance

- ❌ Sentry API
- ❌ PostHog API
- ❌ Slack webhook
- ❌ Email/SMS
- ✅ Sadece Supabase (internal DB)

---

## Rollback Planı

### Hızlı Rollback (Sadece API kapatma)
1. `FOUNDER_ALERTS_ENABLED=false` yapın
2. Server restart → API 403 döner
3. UI görünür kalır ama data gelmez

### Tam Rollback (UI + API)
1. Her iki flag'i de kaldırın
2. Server restart
3. Alert kartı tamamen kaybolur

**Rollback süresi:** < 1 dakika

---

## Final Statement

> **Bu değişiklik otomasyon yapmaz; sadece görünürlük sağlar ve varsayılan kapalıdır.**

---

*Dokümantasyon Tarihi: 2026-01-14*

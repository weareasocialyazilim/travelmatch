# Backend Operating System (Lovendo)

Bu doküman backend/services katmanının nasıl çalışacağını, hangi garantileri vereceğini ve hangi
kuralların asla ihlal edilmeyeceğini tanımlar.

## 1. İlkeler (Non-Negotiable)

- UI güvenlik değildir. Kritik aksiyonlar server-side enforce edilir.
- DB (Supabase) otoritedir. Services katmanı policy endpoint + orchestration görevi görür.
- Idempotency kritik işlemlerde zorunludur (gift/escrow/withdraw/webhook).
- Her kritik aksiyon audit log üretir (PII yok).
- Entegrasyonlar soft-fail çalışır, sistem core akışları korur.

## 2. Policy Endpoint Modeli

Kritik aksiyonlar "Policy Endpoint" olarak tanımlanır:

- claim.create
- proof.submit
- escrow.hold / escrow.release / escrow.refund
- gift.create
- chat.unlock.request / chat.unlock.approve
- location.override.set
- report.create
- review.create

Bu endpoint’ler:

- Auth zorunlu (guest kapalı)
- Plan gating zorunlu (free vs paid)
- DB/RPC üzerinden atomic işlem
- Deterministic error code döner

## 3. Response Contract (Standart)

Backend tüm endpoint’lerde aşağıdaki standardı uygular:

- success: boolean
- code: string (machine-readable)
- message: string (user-safe)
- data?: object
- meta?: object (rate limit, next_allowed_at vb.)

## 4. Error Code Standardı

- HUMAN message: kısa, nötr, güvenli
- MACHINE code: stabil, versiyonlanabilir

Örn:

- AUTH_REQUIRED
- PLAN_UPGRADE_REQUIRED
- RLS_DENIED
- RATE_LIMITED
- INVALID_PARAMS
- ESCROW_REQUIRED
- CONTRIBUTOR_LIMIT_REACHED
- SELF_TRANSFER_FORBIDDEN
- IDP_CONFLICT (idempotency conflict)

## 5. Idempotency Standardı

Kritik işlemler:

- Request idempotency_key taşır (uuid/text)
- DB’de unique constraint ile enforce edilir
- Aynı key ikinci kez gelirse var olan sonuç döner (no double side-effect)

## 6. Webhook Standardı (Ödeme/Provider)

- Signature doğrulama zorunlu
- Event idempotency zorunlu
- Retry safe

## 7. Integration Resilience

Her provider çağrısı:

- Timeout
- Retry (exponential)
- Circuit breaker (trip threshold)
- Fallback (kullanıcıya güvenli mesaj)
- Health log (integration-health)

## 8. Observability

- Sentry: errors + performance (PII yok)
- PostHog: event (PII yok)
- Integration health: provider bazlı success/error/latency

## 9. Güvenlik

- Secrets sadece Infisical/env
- Loglarda token, email, phone, exact lat/lng yok
- Admin override işlemleri ayrı audit

## 10. Kabul Kriterleri

- Her policy endpoint tek bir standart response döndürür
- Her kritik işlem idempotent
- Webhook replay zarar vermez
- Entegrasyon kesintisi core akışı çökertmez

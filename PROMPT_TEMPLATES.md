# Prompt Templates (Token-Safe, Sert)

Temel kural: Dokümanları prompt’a yapıştırma. Sadece path ver, delta iste.

## 1) Delta Prompt (Genel)

SSoT: docs-ssot/ geçerli. Yeni kural ekleme/değiştirme. Hedef: <tek cümle> Değiştirilecek dosyalar:
<maks 5 path> Kısıtlar: <maks 5 madde> Kabul kriterleri: <maks 5 madde> Sadece dosya bazlı çıktı
üret, gereksiz açıklama yapma.

## 2) Backend Policy Prompt

SSoT: docs-ssot/09, 10, 15, 16, 17. Sadece services/** ve supabase/functions/** değişebilir. Policy
endpoint: <name> Kontrat: services/contracts/response.ts + error-codes.ts Idempotency zorunlu. Audit
zorunlu. Kabul kriterleri: unit test + typecheck + CI yeşil.

## 3) Mobile Gating Prompt

SSoT: docs-ssot/12, 15, 16, 17. Sadece apps/mobile/** ve packages/entitlements/** değişebilir.
Guest/Free/Paid gating UI’da uygulanır, backend final otorite. Kabul kriterleri: ekran akışları,
typecheck, lint.

## 4) Integrations Prompt

Sadece services/integrations/\*\* değişebilir. Timeout + retry + health log zorunlu. PII log yok.
Kabul kriterleri: graceful degradation + health event.

## 5) Supabase Prompt (Sert)

Sadece supabase/** ve scripts/** ve .github/workflows/\*\* değişebilir. anon tablo write 0. RLS
default deny. SECURITY DEFINER search_path zorunlu. db-smoke + security-baseline yeşil kalacak.

# 00_README.md (SSoT Navigasyon, Okuma Rehberi, Disiplin)

## 1. Bu Repo Nedir?

Bu repo, Lovendo ürününün tek ve bağlayıcı doğrular kümesini (Single Source of Truth) barındırır.

Buradaki dokümanlar:

- Ürün davranışını tanımlar
- Teknik ve operasyonel kararların referansıdır
- Tartışma değil, uygulama içindir

## 2. Nasıl Okunmalı?

**Yeni Gelenler (Onboarding)**

- 00_README.md
- 01_PRD.md
- 02_DOMAIN_RALPH.md
- 03_ARCHITECTURE.md

**Ürün & Operasyon**

- 09_PAYMENT_CONSTITUTION.md
- 10_MOMENT_CLAIM_PROOF_PLAYBOOK.md
- 12_FILTERING_SPEC.md
- 15_ACCESS_CONTROL_MATRIX.md

**Teknik & Güvenlik**

- 04_DATA_MODEL_AND_RLS.md
- 06_SECURITY_PRIVACY.md
- 14_INTEGRATION_HEALTH_RUNBOOK.md
- 07_RELEASE_AND_QA.md

## 3. SSoT Kuralları (Çok Önemli)

Bir kural birden fazla yerde varsa:

- Access → 15_ACCESS_CONTROL_MATRIX.md
- Payment → 09_PAYMENT_CONSTITUTION.md
- Moment Flow → 10_MOMENT_CLAIM_PROOF_PLAYBOOK.md

**Çelişki varsa:**

- Bu repo güncellenir
- Kod değil, doküman esas alınır

## 4. Değişiklik Yapma Disiplini

- Yeni özellik → önce doküman
- Doküman onayı → sonra kod
- Sessiz değişiklik YASAK

## 5. Kimler Kullanır?

- Ürün ekibi
- Geliştiriciler
- Operasyon
- Destek
- Yönetim

Bu repo tek referanstır.

## 6. Sık Yapılan Hatalar (Kaçınılacak)

- "Bunu kodda hallettik, dokümana gerek yok"
- "Bu zaten başka yerde yazıyor"
- "Sonra yazarız"
- "TypeScript hatası var ama çalışıyor" → **YASAK**: 0 TypeScript hatası zorunludur
- "Middleware bypass edilebilir" → **YASAK**: Tüm admin route'ları middleware koruması altında olmalı

Bu hatalar ürün riskidir.

## 8. Kalite Standartları (2026-01)

### TypeScript
- **Zorunlu**: `npx tsc --noEmit` → 0 hata
- Komut: `pnpm type-check` (apps/admin ve apps/mobile için)
- Doküman: `docs/DEFINITION_OF_DONE.md`

### Admin Middleware
- Tüm `/admin/*` route'ları `middleware.ts` ile korunur
- Session validation + IP binding zorunlu
- Token süresi dolmuşsa → `/login?reason=session_expired` redirect

### Supabase Types
- Database types: `apps/admin/src/types/database.ts`
- Tüm tablolar için Insert/Update/Row tipleri tanımlı
- Custom query'ler için `as unknown as Type` cast kullanılabilir (sınırlı)

## 7. Dokümanlar Arası Referans

- Ödeme ile ilgili her konu → 09_PAYMENT_CONSTITUTION.md
- Claim/Proof → 10_MOMENT_CLAIM_PROOF_PLAYBOOK.md
- Yetki/Gating → 15_ACCESS_CONTROL_MATRIX.md
- Konum → 16_LOCATION_GATING_ENFORCEMENT.md
- Guest erişimi → 17_GUEST_BROWSE_IMPLEMENTATION.md

# REPO_MAP — Lovendo

Bu dosya, repoda “nerede ne var?” sorusunun kısa cevabıdır. SSoT ve enforcement burada referans
alınır.

## SSoT (Bağlayıcı Dokümanlar)

- docs-ssot/ : Ürün kanunları ve bağlayıcı spesifikasyonlar (PRD, RALPH, Payment, Claim/Proof,
  Filtering, Access Control, Release, Security, Mapbox, Integrations).

## Runbook / İşletim

- docs/architecture/ : Mühendislik işletim dokümanları (operating system, troubleshooting).

## Uygulamalar

- apps/mobile/ : Expo (iOS/Android)
- apps/admin/ : Next.js admin panel
- (varsa) apps/web/ : landing vb.

## Supabase (Bel kemiği)

- supabase/migrations/ : migration zinciri
- supabase/functions/ : Edge Functions
- supabase/policies/ : grants/policy baseline
- supabase/standards/ : DB güvenlik standartları
- supabase/tests/ : DB smoke testleri
- supabase/\_archive/ : zincir dışı dump/arşiv

## Tek Komut Noktası

- scripts/ : local giriş noktası
- .github/workflows/ : CI gate

## Ana Komutlar

- make db-smoke
- make db-audit
- ./scripts/db-smoke.sh
- ./scripts/db-security-audit.sh

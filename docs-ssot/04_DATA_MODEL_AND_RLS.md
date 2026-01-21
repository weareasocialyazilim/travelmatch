# Veri Modeli ve RLS (SSoT)

## 1. İlkeler

- Her tabloda ownership açık olmalı (owner_user_id gibi).
- Admin yetkisi ayrı bir role flag ile yönetilmeli.
- RLS varsayılanı: DENY ALL, sonra izinleri ekle.
- State machine güncellemeleri policy endpoint’lerinden yapılmalı.

EN note: Default deny. No direct client updates on critical transitions.

## 2. Ana Tablolar (Core)

### 2.1 profiles

## Temel Tablolar (Özet)

### users

- kyc_status (pending/verified/rejected)
- (coins_balance alanı legacy olabilir; wallets ile normalize edilir)

### wallets

- coins_balance
- pending_balance
- currency_code

### coin_packages

- store_product_id, name, amount_coins, price, currency

### coin_transactions

- user_id, type (purchase/gift/escrow_hold/escrow_release/refund/bonus/withdrawal_burn ...)
- amount_coins, reference_id, metadata

Amaç: Auth user ile ürün profilini ayırmak. Önerilen alanlar:

- id (uuid, auth.users.id ile aynı)
- display_name
- avatar_url
- created_at

RLS:

- user kendi profilini okur
- user kendi profilini günceller
- admin tüm profilleri okur

### 2.2 cities

- id
- name
- country_code
- is_active

RLS:

- herkes okur (public read)
- sadece admin yazar

### 2.3 experience_types

- id
- name
- is_active

RLS:

- herkes okur
- sadece admin yazar

### 2.4 moments

- id
- creator_user_id (profiles.id)
- city_id
- experience_type_id
- title / short_desc (opsiyonel)
- scheduled_start_at / scheduled_end_at (opsiyonel)
- status (enum/string)
- status (draft/active/full/completed/cancelled)
- price, currency, location, coordinates, date
- max_contributors, current_contributor_count
- created_at, updated_at

RLS:

- okuma:
  - status Approved ise herkes okur
  - creator kendi moment’lerini her durumda okur
  - admin tümünü okur
- yazma:
  - creator sadece kendi moment’ini oluşturur
  - creator sadece izinli statü geçişlerini yapabilir (Draft->Submitted gibi) (policy ile)
  - admin status günceller (Submitted->Approved/Rejected)
  - max_contributors sadece policy tarafından set edilir (admin değil, sistem kuralı)

Not: MVP’de kritik status update’leri Edge Function ile yapılmalı.

### 2.5 claims

- id
- moment_id
- user_id (claim sahibi)
- status (active/cancelled vb.)
- created_at

Kurallar:

- moment başına tek aktif claim (MVP)
- unique partial index önerisi:
  - UNIQUE(moment_id) WHERE status='active'

RLS:

- claim sahibi okur
- moment sahibi (creator) kendi moment’inin claim’lerini sınırlı okur (policyye göre)
- admin okur/yazar

### 2.6 proofs

- id
- claim_id
- user_id (claim sahibi ile aynı)
- status (submitted/approved/rejected/flagged_by_ai)
- submitted_at
- reviewed_by_admin_id (opsiyonel)
- reviewed_at
- rejection_reason (opsiyonel)
- ai_flagged (boolean)
- ai_flag_reason (string / enum)
- ai_confidence_score (numeric, opsiyonel)

RLS:

- owner okur/yazar (kendi proof’u)
- admin okur/yazar (review)
- AI servisinin DB yazma yetkisi sadece ai\_ alanlarıyla sınırlıdır
- AI servisi status alanına yazamaz

### 2.7 proof_assets (storage referansı)

- id
- proof_id
- storage_bucket
- storage_path
- mime_type
- size_bytes
- created_at

RLS:

- proof owner okur/yazar
- admin okur

### 2.8 audit_log

- id
- actor_user_id (admin veya user)
- action (string enum)
- entity_type (moment/claim/proof/profile)
- entity_id
- metadata (jsonb)
- created_at

RLS:

- sadece admin okur
- insert: server-side (Edge Function) ile yapılır
- UPDATE ve DELETE kapalıdır (DB constraint/rule)

### 2.9 reports (abuse)

- id
- reporter_user_id
- target_type (moment/profile/proof)
- target_id
- reason
- status (open/closed)
- created_at

## reviews

- moment_id, reviewer_id, reviewed_id, rating, comment
- unique(moment_id, reviewer_id)

RLS:

- reporter kendi raporunu okur
- admin tüm raporları okur/yazar

### 2.10 restrictions

- id
- user_id
- type (claim_ban / moment_create_ban vb.)
- reason
- starts_at
- ends_at (null = süresiz)
- created_by_admin_id

RLS:

- user kendi restriction’ını okur
- admin okur/yazar

### 2.11 gifts

Amaç: Bir kullanıcıdan diğerine moment bağlı veya bağımsız hediye/katkı kaydı.

Alanlar (özet):

- giver_id, receiver_id, moment_id
- amount, currency
- status: pending/completed/cancelled/refunded/disputed
- message (opsiyonel)
- metadata (jsonb)

RLS:

- giver veya receiver okuyabilir
- admin okuyabilir
- yazma kuralları policy ile (özellikle 100+ escrow)

### 2.12 escrow_transactions

Amaç: 100+ tier’lar için zorunlu escrow işlemleri.

Alanlar (özet):

- sender_id, recipient_id, amount, currency, moment_id
- status: pending/released/refunded/cancelled/expired
- expires_at, release_condition
- audit metadata

RLS:

- sender ve recipient kendi kayıtlarını görebilir (gizlilik sınırlarıyla)
- admin okuyabilir
- status değişimleri server-side fonksiyonlarla yapılır

- participant_ids
- moment_id (opsiyonel bağ)

Kurallar:

- Chat unlock gerçekleşmeden mesaj gönderilemez.
- Chat unlock tier + host onayı kurallarıyla yürür.

RLS:

- sadece conversation participant’ları mesajları görebilir
- admin yalnızca abuse/uyum gerektiren özel durumlarda erişir (policy ile)

RLS/Policy notu (çok kritik):

- 100+ direct transfer DB fonksiyonuyla block edilir.
- max 3 contributor kuralı DB fonksiyonuyla enforce edilir.
- Chat unlock, sadece policy sağlanınca mesajlaşma izinleri açılır. RLS:

- sadece conversation participant’ları mesajları görebilir
- admin yalnızca abuse/uyum gerektiren özel durumlarda erişir (policy ile)

## 3. RLS Politika Şablonları

Aşağıdaki şablonlar her tabloya uyarlanır:

- Public read (sadece belirli tablolar)
- Owner read/write (owner_user_id = auth.uid())
- Admin read/write (is_admin(auth.uid()) = true)

Admin kontrolü için iki yaklaşım:

1. profiles tablosunda is_admin boolean
2. ayrı roles tablosu (recommended: roles)

EN note: Prefer separate roles table for clarity.

## 4. Kritik Notlar (MVP)

- İstemci, moments.status gibi alanları direkt update etmemeli.
- Claim oluşturma ve proof submit endpoint’leri idempotent olmalı.
- “Tek aktif claim” kuralı DB constraint ile korunmalı.

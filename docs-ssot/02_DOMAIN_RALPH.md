# Domain Model (RALPH): Lovendo

> ⚠️ **IAP Uyumluluk Notu**
>
> - Kullanıcıdan kullanıcıya para/coin transferi devre dışıdır.
> - Kredi kartı / web ödeme akışları kaldırılmıştır.
> - Tüm satın almalar RevenueCat/IAP üzerinden yapılır.
> - PayTR yalnızca para çekme (withdrawal) için kullanılır.

## 1. Sözlük (Glossary)

- Account: Tekil kullanıcı hesabı. Aynı hesap hem user hem creator aksiyonlarını yapabilir. Rol,
  aksiyona göre belirlenir.
- User: Platformu kullanan tüketici.
- Creator: Moment oluşturan aktör.
- Admin: Operasyon ve denetim aktörü.
- City: Moment’in bağlı olduğu şehir.
- Venue (opsiyonel MVP): Mekan (kafe, müze vb.). MVP’de “venue optional” olabilir.
- ExperienceType: Deneyim kategorisi (kahvaltı, müze, etkinlik).
- Moment: Bir experience tüketimini organize eden domain nesnesi.
- Claim: Moment’e katılım/üstlenim kaydı.
- Proof: Gerçekleşme kanıtı (kural bazlı + admin inceleme).
- Gift: Bir moment’e veya kişiye yapılan katkı/hediye kaydı (amount, message, status).
- EscrowTransaction: Zorunlu/opsiyonel escrow koruması altında tutulan transfer kaydı.
- Contributor: Bir moment’e gift atan benzersiz kullanıcı (unique giver).
- ChatUnlock: Sohbetin açılması için yapılan talep/aksiyon. Host onayı gerekebilir.
- AI Flag: AI taramasının ürettiği risk sinyali (moment/proof için).
- Gender: Profilin zorunlu alanı. Filtrelemeye giriş verisidir.
- GenderPreference: Discover filtre parametresi (kimin moment’leri gösterilecek).

## 2. Moment State Machine (Publish Default)

## Moment State Machine

DB Status:

- draft → active → full/completed/cancelled

AI Flag:

- Flag ayrı bir sinyaldir (decision değil).
- Flag; admin’e “inceleme gerektirebilir” bildirimi üretir.
- Admin isterse moment’i suspended/disabled benzeri bir müdahale state’ine alır (soft).

Durumlar (MVP):

- Draft: Taslak
- Published: Yayında (default)
- Flagged: AI risk sinyali üretti (moment yayında kalır)
- Suspended: Admin müdahalesiyle yayından kaldırıldı (soft)
- Closed: Moment akışı tamamlandı (opsiyonel)

Kurallar:

- Publish admin onayı beklemez.
- Flagged bir "review sinyali"dir; state değişimi tek başına akışı durdurmaz.
- Suspended sadece Admin/Super Admin tarafından uygulanır.

Geçiş Kuralları:

- Draft -> Published (Creator - Otomatik)
- Published -> Suspended (Admin)
- Suspended -> Published (Admin - Geri alma)
- Published -> Flagged (AI)
- Flagged -> Suspended (Admin)
- Flagged -> Published (Admin - Clear flag)
- Published -> Claimed (User)
- Claimed -> Consumed (User)
- Claimed -> Published (System - Timeout/Cancel)
- Consumed -> ProofSubmitted (User)
- Submitted proof -> FlaggedByAI (AI scan)
- FlaggedByAI -> ProofApproved/ProofRejected (Admin)
- ProofSubmitted -> ProofApproved/ProofRejected (Admin)
- ProofApproved -> Closed (System)

Önemli Notlar:

- Moment publish edilirken admin onayı yoktur.
- AI taraması Published state'ini değiştirmez; sadece flag alanlarını günceller veya çok riskliyse
  Admin'e bildirim düşer. Admin manuel olarak Suspended yapabilir.
- Moment hard delete edilmez; soft disable / suspended state kullanılır.

EN note: Transitions must be enforced in database and service layer.

## 3. Yetki ve Sahiplik (Ownership)

- Moment owner: Creator
- Claim owner: User
- Proof owner: User (claim sahibi)
- Admin: tümüne okuma, policy ile yazma

## 4. Domain Invariants (asla bozulmayacaklar)

1. Bir Moment aynı anda birden fazla aktif Claim taşıyamaz (MVP kararı).
2. Proof, Claim olmadan oluşturulamaz.
3. Approved olmayan Moment claim edilemez.
4. ProofApproved sonrası moment tekrar claim edilemez (Closed).
5. 100+ moment’lerde benzersiz contributor sayısı maksimum 3’tür.
   - Aynı contributor tekrar gift atabilir.
6. Bir kullanıcı kendi oluşturduğu moment’e gift/claim atamaz. (self-dealing engeli)
7. Bir kullanıcı aynı anda hem creator hem consumer olabilir ANCAK aynı moment üzerinde iki rolü
   birden alamaz.

## 7. EscrowTransaction State Machine

## Transfer/Escrow Kuralları (Titan Plan v2.0)

- 0–30: direct transfer
- 30–100: optional escrow
- 100+: direct transfer blocked, escrow required

## Contributor Limit (100+)

- moment.price >= 100 → max 3 unique contributor
- < 100 → unlimited
- unique contributor = distinct giver_id
- refunded/cancelled gift’ler count’a dahil edilmez

## Chat Unlock Tier Kuralları

- 0–30: buton görünmez
- 30–100: sohbeti başlat (host onayı)
- 100+: premium sohbeti başlat (host onayı)

## Review

- moment_id, reviewer_id, reviewed_id, rating, comment
- unique(moment_id, reviewer_id)

## Report

- reporter_id + hedef (moment/user/message)
- status: pending/reviewed/resolved/dismissed

Durumlar:

- pending: escrow aktif, çözülmeyi bekliyor
- released: koşul sağlandı, recipient’e aktarıldı
- refunded: iade edildi
- cancelled: iptal edildi
- expired: süre aşımı

Kurallar:

- 100+ tier’larda direkt transfer yapılamaz; escrow zorunludur.
- Escrow çözülmesi policy’ye bağlıdır (örn. proof_verified).

## 5. Account Rolleri ve Super Admin

- Admin Rolleri:
  - Admin: Moment ve proof review yapabilir, abuse işlemlerini başlatabilir.
  - Super Admin: Admin atayabilir/kaldırabilir, restriction kaldırabilir, AI policy’lerini
    değiştirebilir, sistem-level override yapabilir.

## 6. Fail States ve Zaman aşımları (Timeouts)

- No-Show / Claim düşmesi: Claim sonrası belirlenen süre içinde Consumed işaretlenmezse claim
  otomatik düşer (expired), moment tekrar claim edilebilir hale gelir.
- Failed Claim: Consumed state’inden sonra belirli süre içinde proof gönderilmezse claim failed
  sayılır, abuse metriğine yazılır.
- Claim bir "niyet"tir, hukuki taahhüt değildir.
- AI Failover: AI taraması başarısız olursa moment yayında kalır. AI servisi asenkron çalışır ve
  publish'i engellemez.
- Moment ve Proof arasındaki maksimum süre policy ile belirlenir.

## 5. Audit Log Gerektiren Aksiyonlar

- Admin Approved/Rejected kararları
- ProofApproved/ProofRejected kararları
- Ban/Restrict gibi moderation aksiyonları
- Role değişiklikleri

## 6. Abuse / Moderation Kavramları (MVP)

- Report: User veya admin tarafından açılan rapor kaydı
- Restriction: Geçici/kalıcı kısıtlama (claim yasağı, moment oluşturma yasağı vb.)

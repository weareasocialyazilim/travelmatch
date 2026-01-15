# Lovendo Yasal Prosedürler

## İçindekiler

1. [Veri İhlali Bildirim Prosedürü](#1-veri-ihlali-bildirim-prosedürü)
2. [Veri Saklama ve Silme Politikası](#2-veri-saklama-ve-silme-politikası)
3. [Üçüncü Parti Veri İşleme Anlaşmaları (DPA)](#3-üçüncü-parti-veri-işleme-anlaşmaları-dpa)
4. [Kullanıcı Hakları Talebi Prosedürü](#4-kullanıcı-hakları-talebi-prosedürü)

---

## 1. Veri İhlali Bildirim Prosedürü

### 1.1 Yasal Gereklilikler

| Düzenleme          | Bildirim Süresi | Alıcılar                                 |
| ------------------ | --------------- | ---------------------------------------- |
| **GDPR (AB)**      | 72 saat         | Yetkili otorite + etkilenen kullanıcılar |
| **KVKK (Türkiye)** | 72 saat         | KVK Kurumu + etkilenen veri sahipleri    |

### 1.2 İhlal Müdahale Ekibi

| Rol                       | Sorumlu       | Yedek                |
| ------------------------- | ------------- | -------------------- |
| **İhlal Müdahale Lideri** | CTO           | VP Engineering       |
| **Güvenlik Uzmanı**       | Security Lead | DevOps Lead          |
| **Hukuk Danışmanı**       | Legal Counsel | External Counsel     |
| **İletişim Sorumlusu**    | CEO           | PR Manager           |
| **Teknik Uygulayıcı**     | DevOps Lead   | Sr. Backend Engineer |

### 1.3 İhlal Tespit & Değerlendirme (0-4 saat)

#### Adım 1: İlk Tespit

```
Tetikleyiciler:
- Sentry/Datadog anomali uyarısı
- Supabase audit log anormal aktivite
- Kullanıcı şikayeti
- Penetrasyon testi bulgusu
- Harici güvenlik bildirimi
```

#### Adım 2: Hızlı Değerlendirme (30 dakika içinde)

**Değerlendirme Kriterleri:**

| Kriter                     | Düşük (1) | Orta (2) | Yüksek (3) | Kritik (4)       |
| -------------------------- | --------- | -------- | ---------- | ---------------- |
| Etkilenen kullanıcı sayısı | <100      | 100-1K   | 1K-10K     | >10K             |
| Veri türü                  | Public    | Internal | Personal   | Financial/Health |
| Veri erişim türü           | Read      | Export   | Modify     | Delete           |
| Saldırı devam ediyor mu?   | Hayır     | Belirsiz | Muhtemelen | Evet             |

**Risk Skoru:** Kriterlerin toplamı

- 4-6: Düşük → 24 saat içinde bildir
- 7-10: Orta → 12 saat içinde bildir
- 11-14: Yüksek → 4 saat içinde bildir
- 15-16: Kritik → Derhal bildir

#### Adım 3: İzolasyon (Risk > Orta ise)

```bash
# 1. Etkilenen servisleri izole et
kubectl scale deployment <affected-service> --replicas=0

# 2. Supabase RLS'i sıkılaştır
supabase functions deploy emergency-lockdown

# 3. API rate limiting'i sıkılaştır
curl -X PUT "https://api.cloudflare.com/client/v4/zones/{zone_id}/rate_limits" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -d '{"threshold": 10, "period": 60}'

# 4. Session'ları sonlandır (kritik durumda)
supabase rpc logout_all_users
```

### 1.4 Bildirim Prosedürü (4-72 saat)

#### KVKK Bildirimi (Türkiye)

**Alıcı:** Kişisel Verileri Koruma Kurumu  
**Portal:** https://ihlalbildirim.kvkk.gov.tr  
**Süre:** En geç 72 saat

**Bildirim İçeriği:**

```markdown
1. Veri sorumlusunun kimliği ve iletişim bilgileri
2. İhlalin ne zaman ve nasıl tespit edildiği
3. İhlalden etkilenen kişisel veri kategorileri
4. İhlalden etkilenen kişi sayısı (tahmini)
5. İhlalin olası sonuçları
6. Alınan ve alınması planlanan önlemler
7. Veri güvenliği sorumlusunun (varsa) iletişim bilgileri
```

#### GDPR Bildirimi (AB Kullanıcıları)

**Alıcı:** İrlanda Veri Koruma Komisyonu (DPC)  
**Portal:** https://forms.dataprotection.ie/report-a-breach  
**Süre:** En geç 72 saat

#### Kullanıcı Bildirimi

**Yüksek/Kritik risk durumlarında:**

```typescript
// Email template: data_breach_notification
const notificationTemplate = {
  subject: 'Lovendo Güvenlik Bildirimi',
  body: `
Sayın {user_name},

{date} tarihinde Lovendo sistemlerinde bir güvenlik olayı tespit edilmiştir.

**Etkilenen Veriler:**
{affected_data_types}

**Alınan Önlemler:**
- Güvenlik açığı kapatılmıştır
- Tüm oturumlar sonlandırılmıştır
- Şifre sıfırlama zorunlu hale getirilmiştir

**Önerilen Eylemler:**
1. Lovendo şifrenizi değiştirin
2. Aynı şifreyi kullanan diğer hesaplarınızı güncelleyin
3. Hesap aktivitelerinizi kontrol edin

Sorularınız için: privacy@lovendo.app

Saygılarımızla,
Lovendo Güvenlik Ekibi
  `,
};
```

### 1.5 Post-Incident Analiz (72 saat sonrası)

**Rapor Şablonu:**

```markdown
# Post-Incident Report

## Özet

- Olay ID: INC-2026-XXX
- Tespit Tarihi: YYYY-MM-DD HH:MM
- Çözüm Tarihi: YYYY-MM-DD HH:MM
- Risk Seviyesi: [Düşük/Orta/Yüksek/Kritik]

## Zaman Çizelgesi

| Zaman | Eylem                    | Sorumlu |
| ----- | ------------------------ | ------- |
| T+0   | İlk tespit               | ...     |
| T+30m | Değerlendirme tamamlandı | ...     |
| ...   | ...                      | ...     |

## Root Cause Analysis

[5 Why analizi]

## Alınan Önlemler

1. ...
2. ...

## Gelecek İyileştirmeler

1. ...
2. ...

## Maliyet Analizi

- Teknik müdahale: X saat
- Hukuki danışmanlık: X TL
- İtibar kaybı tahmini: ...
```

---

## 2. Veri Saklama ve Silme Politikası

### 2.1 Saklama Süreleri

| Veri Türü           | Saklama Süresi           | Yasal Dayanak     |
| ------------------- | ------------------------ | ----------------- |
| Kullanıcı profili   | Hesap aktif + 30 gün     | KVKK Md. 7        |
| Ödeme kayıtları     | 10 yıl                   | VUK Md. 253       |
| Mesajlar            | 2 yıl (arşiv)            | KVKK Md. 7        |
| Audit logları       | 5 yıl                    | 5651 sayılı Kanun |
| Moment fotoğrafları | Moment silinene + 90 gün | KVKK Md. 7        |

### 2.2 Silme Prosedürü

```sql
-- Kullanıcı silme prosedürü (schedule_account_deletion RPC)
-- 1. 30 gün bekleme süresi
-- 2. Kişisel verilerin anonimleştirilmesi
-- 3. Finansal verilerin arşivlenmesi
-- 4. Medya dosyalarının silinmesi

-- Otomatik temizlik (weekly cron)
SELECT cleanup_deleted_accounts();
SELECT anonymize_expired_data();
SELECT archive_financial_records();
```

---

## 3. Üçüncü Parti Veri İşleme Anlaşmaları (DPA)

### 3.1 Mevcut DPA Durumu

| Sağlayıcı      | Hizmet                  | DPA Durumu       | Son Güncelleme |
| -------------- | ----------------------- | ---------------- | -------------- |
| **Supabase**   | Database, Auth, Storage | ✅ Signed        | 2025-09        |
| **PayTR**      | Payment Processing      | ✅ Signed        | 2025-10        |
| **AWS**        | Cloud Infrastructure    | ✅ Standard DPA  | 2025-08        |
| **Sentry**     | Error Monitoring        | ✅ DPA Available | 2025-11        |
| **Cloudflare** | CDN, Security           | ✅ Standard DPA  | 2025-07        |
| **Twilio**     | SMS OTP                 | ✅ Signed        | 2025-08        |
| **SendGrid**   | Email                   | ✅ Standard DPA  | 2025-09        |

### 3.2 DPA Gereklilikleri

Her DPA şunları içermelidir:

- [ ] Veri işleme kapsamı ve amacı
- [ ] Alt işlemci listesi ve onay mekanizması
- [ ] Veri güvenliği önlemleri (SOC2, ISO27001)
- [ ] İhlal bildirim prosedürü
- [ ] Veri silme/iade prosedürü
- [ ] Denetim hakkı

### 3.3 DPA İnceleme Takvimi

| Sağlayıcı | Sonraki İnceleme | Sorumlu         |
| --------- | ---------------- | --------------- |
| Supabase  | 2026-03          | Legal           |
| PayTR     | 2026-04          | Finance + Legal |
| AWS       | 2026-02          | DevOps          |
| Sentry    | 2026-05          | Engineering     |

---

## 4. Kullanıcı Hakları Talebi Prosedürü

### 4.1 KVKK/GDPR Hakları

| Hak            | Yanıt Süresi | Uygulama Yöntemi               |
| -------------- | ------------ | ------------------------------ |
| Bilgi Edinme   | 30 gün       | DataPrivacyScreen              |
| Veri Erişimi   | 30 gün       | export-user-data Edge Function |
| Düzeltme       | 30 gün       | Profil düzenleme               |
| Silme          | 30 gün       | schedule_account_deletion RPC  |
| Taşınabilirlik | 30 gün       | JSON export                    |
| İtiraz         | 30 gün       | privacy@lovendo.app        |

### 4.2 Talep İşleme Akışı

```
1. Talep alımı (App içi form veya email)
         ↓
2. Kimlik doğrulama (KYC seviyesine göre)
         ↓
3. Talep türü belirleme
         ↓
4. Otomatik/manuel işlem
         ↓
5. Kullanıcı bildirimi
         ↓
6. Audit log kaydı
```

---

## Versiyon Geçmişi

| Versiyon | Tarih      | Değişiklik   | Onaylayan |
| -------- | ---------- | ------------ | --------- |
| 1.0      | 2026-01-06 | İlk versiyon | CTO       |

---

## İletişim

- **Veri Koruma Sorumlusu:** dpo@lovendo.app
- **Güvenlik Ekibi:** security@lovendo.app
- **Hukuk:** legal@lovendo.app
- **Acil Durum:** +90 XXX XXX XX XX (7/24)

# 06_SECURITY_PRIVACY.md (Güvenlik, Gizlilik, KVKK/GDPR, Abuse Koruması)

## 1. Güvenlik İlkeleri

- **Least Privilege:** En az yetki
- **Defense in Depth:** Çok katmanlı koruma
- **Default Deny:** Varsayılan kapalı
- **Soft-Fail:** Sağlayıcı kesintilerinde çekirdek akışlar çalışır

## 2. Kimlik Doğrulama ve Yetkilendirme

- **Auth zorunlu**
- State-changing tüm işlemler auth + policy kontrolünden geçer
- Token'lar kısa ömürlü, yenilemeli

### 2.1 Admin Panel Güvenliği

**Middleware Koruması:** `apps/admin/src/middleware.ts`

- Tüm `/admin/*` route'ları Next.js middleware ile korunur
- Session token validation (admin_session cookie)
- IP binding (session.ip_hash vs client IP hash)
- Otomatik redirect: `/login?reason=session_expired`

**Session Yönetimi:**
- Token hash'leme (SHA-256)
- Süre kontrolü (expires_at)
- IP adresi kaydı
- Session invalidation: IP değişikliği tespitinde otomatik sonlandırma

```typescript
// Middleware kontrol akışı
1. admin_session cookie var mı?
2. Token DB'de geçerli mi? (expires_at > NOW())
3. IP adresi eşleşiyor mu?
4. Admin aktif mi? (is_active = true)
5. → Tüm koşullar sağlanırsa: İzin ver
6. → Koşullardan biri başarısız: /login redirect
```

## 3. Veri Gizliliği (PII)

**Toplama**

- Minimum veri
- Amaç dışı kullanım yok

**Saklama**

- Hassas veriler saklanmaz
- Token / hash / referans yaklaşımı

**Erişim**

- Role-based erişim
- Admin erişimleri kayıt altındadır

## 4. KVKK / GDPR Uyum

- Açık rıza metinleri
- Veri işleme amaçları tanımlı
- Silme/anonimleştirme süreçleri
- Veri taşınabilirliği talepleri

## 5. Media & İçerik Güvenliği

- Media upload boyut/format kısıtları
- Zararlı içerik taraması (non-blocking)
- Public erişimde hassasiyet düşürme

## 6. Abuse & Fraud Önlemleri

**Tespit**

- Rate limit
- Anomali desenleri
- Tekrarlayan şüpheli aksiyonlar

**Aksiyon**

- Geçici kısıtlama
- KYC tetikleme
- Finansal limit düşürme

## 7. Guest Browse Güvenliği

- Guest yalnızca subset veri görür
- Exact konum, mesaj, proof, finans verileri kapalı
- Server-side select ile enforce edilir

## 8. Konum Gizliliği

- GPS ve manuel override ayrımı
- Public görünümde yuvarlama/obfuscation
- Konum değişiklikleri audit’lenir

## 9. Loglama & İzleme

- PII loglanmaz
- Error ve security event’leri ayrıdır
- Alarm eşikleri tanımlıdır

## 10. Incident Response

**Adımlar**

1.  Tespit
2.  İzolasyon
3.  Düzeltme
4.  Bildirim
5.  Post-mortem

## 11. Veri Saklama Politikası

- **Audit log:** uzun süreli
- **Operasyonel log:** sınırlı süre
- Kullanıcı talepleri doğrultusunda silme/anonimleştirme

## 12. Üçüncü Taraf Entegrasyon Güvenliği

- Secrets merkezi yönetim (Infisical)
- Rotasyon
- **Webhook doğrulama**
- Rate limit

### 12.1 Webhook Güvenlik Kontrolleri

**Zorunlu Doğrulamalar:**

| Webhook | Doğrulama Yöntemi |
|---------|-------------------|
| RevenueCat | `REVENUECAT_WEBHOOK_SECRET` hash karşılaştırma |
| iDenfy | `IDENTFY_API_SECRET` header kontrolü |
| PayTR | Merchant ID + callback hash |
| SendGrid | API Key validation (internal) |

**IP Whitelist:**
```sql
-- İzin verilen IP aralıkları (Supabase Dashboard → Network Settings)
-- RevenueCat: 0.0.0.0/0 (dış servis, secret ile korunuyor)
-- iDenfy: EU-based IP'ler
-- PayTR: TR-based IP'ler
```

**Test Komutu:**
```bash
# Yetkisiz erişim testi (beklenen: 401 veya 500)
curl -X POST https://.../functions/v1/revenuecat-webhook \
  -H "Content-Type: application/json" \
  -d '{"event":{"type":"INITIAL_PURCHASE"}}'

# Beklenen: {"error":"Unauthorized"} veya 401 status
```

## 13. Güvenlik Testleri

- Release öncesi kontroller
- Periyodik gözden geçirme
- Pen-test / threat modeling (gerektikçe)

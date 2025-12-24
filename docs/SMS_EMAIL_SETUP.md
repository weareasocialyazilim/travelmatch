# 📱 SMS (Twilio) ve 📧 Email (SendGrid) Kurulum Rehberi

Bu döküman TravelMatch için telefon (SMS OTP) ve email doğrulama sistemlerinin kurulumunu açıklar.

---

## 📱 Twilio SMS Kurulumu

### 1. Twilio Hesabı Oluştur

1. [Twilio Console](https://console.twilio.com) adresine git
2. Yeni hesap oluştur veya giriş yap
3. Telefon numaranı doğrula

### 2. Account Credentials Al

Dashboard'dan şu bilgileri kopyala:

```
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Telefon Numarası Satın Al

1. **Phone Numbers** > **Buy a Number**
2. Ülke seç (TR veya US)
3. **SMS** capability seç
4. Numara satın al

```
Phone Number: +1xxxxxxxxxx (veya +90xxxxxxxxxx)
```

### 4. Verify Service Oluştur (OTP için)

1. **Verify** > **Services** > **Create Service**
2. Friendly name: `TravelMatch OTP`
3. Code length: 6
4. Service SID'i kopyala:

```
Verify Service SID: VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. Supabase'e Secrets Ekle

```bash
# Supabase CLI ile
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxx
supabase secrets set TWILIO_PHONE_NUMBER=+1xxxxx
supabase secrets set TWILIO_VERIFY_SERVICE_SID=VAxxxxx

# Veya Supabase Dashboard > Edge Functions > Secrets
```

### 6. Test Et

```bash
# Edge function'ı test et
curl -X POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/twilio-sms/send-otp' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"phone": "+905551234567", "channel": "sms"}'
```

---

## 📧 SendGrid Email Kurulumu

### 1. SendGrid Hesabı Oluştur

1. [SendGrid](https://sendgrid.com) adresine git
2. Ücretsiz plan ile başla (100 email/gün)
3. Hesap doğrulamasını tamamla

### 2. API Key Oluştur

1. **Settings** > **API Keys** > **Create API Key**
2. Name: `TravelMatch Production`
3. Permissions: **Full Access** veya **Restricted Access** (Mail Send only)
4. API Key'i kopyala (sadece bir kez gösterilir!)

```
API Key: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Sender Identity Doğrula

#### Domain Authentication (Önerilen)

1. **Settings** > **Sender Authentication** > **Domain Authentication**
2. DNS provider seç
3. Domain gir: `travelmatch.app`
4. DNS kayıtlarını ekle:
   - CNAME records (3 adet)
   - TXT record (DKIM)

#### Single Sender (Hızlı Test için)

1. **Settings** > **Sender Authentication** > **Single Sender Verification**
2. Email: `noreply@travelmatch.app`
3. Doğrulama emailini onayla

### 4. Dynamic Templates Oluştur (Opsiyonel)

1. **Email API** > **Dynamic Templates** > **Create Template**
2. Şablonları oluştur:

| Template | ID | Kullanım |
|----------|-----|----------|
| Welcome | `d-welcome123` | Yeni kayıt |
| Verification | `d-verify123` | Email doğrulama |
| Password Reset | `d-reset123` | Şifre sıfırlama |
| Payment Receipt | `d-receipt123` | Ödeme makbuzu |
| Gift Notification | `d-gift123` | Hediye bildirimi |

### 5. Supabase'e Secrets Ekle

```bash
# Supabase CLI ile
supabase secrets set SENDGRID_API_KEY=SG.xxxxx
supabase secrets set SENDGRID_FROM_EMAIL=noreply@travelmatch.app
supabase secrets set SENDGRID_FROM_NAME=TravelMatch

# Template ID'ler (opsiyonel)
supabase secrets set SENDGRID_TEMPLATE_WELCOME=d-xxxxx
supabase secrets set SENDGRID_TEMPLATE_VERIFICATION=d-xxxxx
```

### 6. Test Et

```bash
# Edge function'ı test et
curl -X POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/sendgrid-email/send' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "to": [{"email": "test@example.com"}],
    "subject": "Test Email",
    "content": {"text": "Hello from TravelMatch!"}
  }'
```

---

## 🔗 Supabase Auth Entegrasyonu

### SMS Auth (Twilio ile)

Supabase Dashboard'da:

1. **Authentication** > **Providers** > **Phone**
2. **Enable Phone provider** ✓
3. SMS Provider: **Twilio**
4. Credentials:
   - Account SID: `ACxxxxx`
   - Auth Token: `xxxxx`
   - Message Service SID: `MGxxxxx` veya telefon numarası
5. **Save**

### Email Auth (SendGrid SMTP ile)

Supabase Dashboard'da:

1. **Authentication** > **Email Templates**
2. **SMTP Settings** > **Enable Custom SMTP**
3. Credentials:
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: `SG.xxxxx` (API Key)
   - Sender email: `noreply@travelmatch.app`
   - Sender name: `TravelMatch`
4. **Save**

---

## 🧪 Mobil App Entegrasyonu

### PhoneAuthScreen Kullanımı

```typescript
// Supabase Auth (otomatik Twilio)
import { signInWithPhone, verifyPhoneOtp } from '@/services/supabaseAuthService';

// OTP gönder
await signInWithPhone('+905551234567');

// OTP doğrula
await verifyPhoneOtp('+905551234567', '123456');
```

### Direkt Twilio Kullanımı (Custom)

```typescript
import { sendPhoneOtp, verifyPhoneOtp } from '@/services/twilioService';

// Twilio Verify ile OTP
await sendPhoneOtp('+905551234567');
await verifyPhoneOtp('+905551234567', '123456');
```

### Email Gönderimi

```typescript
import { sendgridClient } from '@/services/sendgridService';

// Hoş geldin emaili
await sendgridClient.sendWelcomeEmail({
  email: 'user@example.com',
  name: 'Ahmet',
});

// Doğrulama kodu
await sendgridClient.sendVerificationEmail(
  { email: 'user@example.com' },
  '123456',
);
```

---

## 📋 Hızlı Kontrol Listesi

### Twilio
- [ ] Hesap oluşturuldu
- [ ] Account SID ve Auth Token alındı
- [ ] Telefon numarası satın alındı
- [ ] Verify Service oluşturuldu
- [ ] Secrets Supabase'e eklendi
- [ ] Test OTP gönderildi ve doğrulandı

### SendGrid
- [ ] Hesap oluşturuldu
- [ ] API Key oluşturuldu
- [ ] Domain/Sender doğrulandı
- [ ] Templates oluşturuldu (opsiyonel)
- [ ] Secrets Supabase'e eklendi
- [ ] Test email gönderildi

### Supabase
- [ ] Phone provider aktif edildi
- [ ] Twilio credentials girildi
- [ ] Custom SMTP aktif edildi
- [ ] SendGrid SMTP credentials girildi
- [ ] Email templates özelleştirildi

---

## 🚨 Sorun Giderme

### SMS Gönderilmiyor

1. **Twilio Trial Account**: Sadece doğrulanmış numaralara gönderebilir
2. **Geographic Permissions**: Console > Messaging > Geo Permissions'dan ülke ekle
3. **Balance**: Hesapta yeterli bakiye var mı kontrol et

### Email Spam'a Düşüyor

1. Domain authentication yap
2. SPF/DKIM kayıtlarını doğrula
3. Sender Reputation kontrol et

### OTP Expire Oluyor

- Default: 10 dakika
- Twilio Verify Service'de `code_length` ve `ttl` ayarla

---

## 💰 Maliyet Tahmini

### Twilio (Aylık 10,000 kullanıcı varsayımı)

| Servis | Birim Fiyat | Tahmini Kullanım | Aylık Maliyet |
|--------|-------------|------------------|---------------|
| Phone Number | $1/ay | 1 numara | $1 |
| SMS (US) | $0.0079/SMS | 20,000 SMS | $158 |
| SMS (TR) | $0.0544/SMS | 20,000 SMS | $1,088 |
| Verify API | $0.05/doğrulama | 10,000 | $500 |

### SendGrid

| Plan | Email/Ay | Fiyat |
|------|----------|-------|
| Free | 100/gün | $0 |
| Essentials | 50,000 | $19.95 |
| Pro | 100,000 | $89.95 |

---

## 🔐 Güvenlik Notları

1. **API Key'leri asla client-side'da kullanma**
2. **Rate limiting** uygula (1 OTP/dakika)
3. **IP blocking** şüpheli aktivite için
4. **Audit logging** tüm auth işlemleri için
5. **Key rotation** her 90 günde bir

# GitHub Secrets - Kapsamlı Eksik Liste

**Tarih:** 9 Aralık 2025  
**Durum:** CI/CD için kritik secret'lar eksik  
**Öncelik:** P0 (Kritik - Tüm deployment'ları blokluyor)

---

## 📊 Mevcut Durum Özeti

Tüm GitHub Actions workflow'ları analiz edildi. **Toplam 47 farklı secret** kullanılıyor.

---

## ✅ Kritik Secret'lar (P0 - İlk 15 Dakikada Ekle)

Bu 6 secret olmadan **hiçbir CI/CD workflow'u** çalışmaz:

| #   | Secret Adı              | Nereden Alınır                                           | Kullanıldığı Yer                        |
| --- | ----------------------- | -------------------------------------------------------- | --------------------------------------- |
| 1   | `EXPO_TOKEN`            | https://expo.dev/accounts/[hesap]/settings/access-tokens | build.yml, ci.yml, deploy.yml           |
| 2   | `SUPABASE_URL`          | `https://isvstmzuyxuwptrrhkyi.supabase.co`               | engagement-analytics.yml, load-test.yml |
| 3   | `SUPABASE_ANON_KEY`     | Supabase Dashboard → API                                 | load-test.yml                           |
| 4   | `SUPABASE_SERVICE_KEY`  | Supabase Dashboard → API (service_role)                  | engagement-analytics.yml                |
| 5   | `SUPABASE_PROJECT_REF`  | `isvstmzuyxuwptrrhkyi`                                   | monorepo-ci.yml                         |
| 6   | `SUPABASE_ACCESS_TOKEN` | https://supabase.com/dashboard/account/tokens            | monorepo-ci.yml                         |

**Aksiyon:** Bu 6 secret'ı hemen ekle → CI temel olarak çalışır hale gelir.

---

## 🔥 Yüksek Öncelik (P1 - 30 Dakika İçinde)

Production deployment için gerekli:

| #   | Secret Adı                      | Nereden Alınır                              | Kullanıldığı Yer                                                               |
| --- | ------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| 7   | `EXPO_PUBLIC_SUPABASE_URL`      | SUPABASE_URL ile aynı                       | e2e-detox.yml, monorepo-ci.yml, simple-ci.yml, e2e-tests.yml, ui-e2e-tests.yml |
| 8   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | SUPABASE_ANON_KEY ile aynı                  | e2e-detox.yml, monorepo-ci.yml, simple-ci.yml, e2e-tests.yml, ui-e2e-tests.yml |
| 9   | `VITE_SUPABASE_URL`             | SUPABASE_URL ile aynı                       | monorepo-ci.yml, simple-ci.yml                                                 |
| 10  | `VITE_SUPABASE_ANON_KEY`        | SUPABASE_ANON_KEY ile aynı                  | monorepo-ci.yml, simple-ci.yml                                                 |
| 11  | `STRIPE_SECRET_KEY`             | https://dashboard.stripe.com/apikeys        | monorepo-ci.yml                                                                |
| 12  | `STRIPE_WEBHOOK_SECRET`         | Stripe Dashboard → Webhooks                 | monorepo-ci.yml                                                                |
| 13  | `STRIPE_TEST_PUBLISHABLE_KEY`   | Stripe Dashboard → Test mode                | e2e-detox.yml                                                                  |
| 14  | `OPENAI_API_KEY`                | https://platform.openai.com/api-keys        | monorepo-ci.yml                                                                |
| 15  | `ANTHROPIC_API_KEY`             | https://console.anthropic.com/settings/keys | engagement-analytics.yml                                                       |

**Aksiyon:** Bu 9 secret'ı ekle → Mobile app ve admin panel build olur.

---

## ⚙️ Orta Öncelik (P2 - Monitoring & Testing)

Hata takibi, test coverage ve bildirimler için:

| #   | Secret Adı           | Nereden Alınır                                      | Kullanıldığı Yer                                                        |
| --- | -------------------- | --------------------------------------------------- | ----------------------------------------------------------------------- |
| 16  | `CODECOV_TOKEN`      | https://codecov.io/gh/kemalteksalgit/travelmatch    | ci.yml                                                                  |
| 17  | `SNYK_TOKEN`         | https://app.snyk.io/account                         | security-scan.yml, security-compliance.yml                              |
| 18  | `SENTRY_AUTH_TOKEN`  | https://sentry.io/settings/account/api/auth-tokens/ | performance-ci.yml                                                      |
| 19  | `SLACK_WEBHOOK_URL`  | Slack → Apps → Incoming Webhooks                    | e2e-detox.yml, security-compliance.yml, ui-e2e-tests.yml, e2e-tests.yml |
| 20  | `SLACK_WEBHOOK`      | SLACK_WEBHOOK_URL ile aynı                          | engagement-analytics.yml                                                |
| 21  | `TEST_USER_EMAIL`    | Test kullanıcı email'i                              | e2e-detox.yml                                                           |
| 22  | `TEST_USER_PASSWORD` | Test kullanıcı şifresi                              | e2e-detox.yml                                                           |

**Aksiyon:** Bu 7 secret'ı ekle → Error tracking ve notifications aktif olur.

---

## 🎨 Düşük Öncelik (P3 - Advanced Features)

Visual testing, CDN, ve optimization araçları için:

| #   | Secret Adı                       | Nereden Alınır                    | Kullanıldığı Yer                            |
| --- | -------------------------------- | --------------------------------- | ------------------------------------------- |
| 23  | `CHROMATIC_PROJECT_TOKEN`        | https://www.chromatic.com/start   | visual-regression.yml                       |
| 24  | `CHROMATIC_ADMIN_PROJECT_TOKEN`  | Chromatic → Admin project         | visual-regression.yml                       |
| 25  | `CHROMATIC_MOBILE_PROJECT_TOKEN` | Chromatic → Mobile project        | visual-regression.yml                       |
| 26  | `CHROMATIC_PROJECT_ID`           | Chromatic dashboard               | visual-regression.yml                       |
| 27  | `CHROMATIC_TOKEN`                | Chromatic → Design System         | design-system.yml                           |
| 28  | `VERCEL_TOKEN`                   | https://vercel.com/account/tokens | design-system.yml                           |
| 29  | `VERCEL_ORG_ID`                  | Vercel → Settings → General       | design-system.yml                           |
| 30  | `VERCEL_STORYBOOK_PROJECT_ID`    | Vercel → Project settings         | design-system.yml                           |
| 31  | `TURBO_TOKEN`                    | https://vercel.com/account/tokens | monorepo-ci.yml, simple-ci.yml              |
| 32  | `TURBO_TEAM`                     | Vercel team ID                    | monorepo-ci.yml, simple-ci.yml              |
| 33  | `LHCI_GITHUB_APP_TOKEN`          | GitHub → Developer settings       | accessibility-audit.yml, performance-ci.yml |
| 34  | `CLOUDFLARE_API_TOKEN`           | Cloudflare → API Tokens           | performance-ci.yml                          |
| 35  | `CLOUDFLARE_ACCOUNT_ID`          | Cloudflare dashboard              | performance-ci.yml                          |
| 36  | `CLOUDFLARE_ZONE_ID`             | Cloudflare → Domain → Overview    | performance-ci.yml                          |
| 37  | `SENDGRID_API_KEY`               | SendGrid dashboard                | engagement-analytics.yml                    |

**Aksiyon:** Bu 15 secret'ı isteğe bağlı olarak ekle.

---

## 📱 iOS Deployment (P4)

Apple App Store deployment için:

| #   | Secret Adı      | Nereden Alınır           | Kullanıldığı Yer |
| --- | --------------- | ------------------------ | ---------------- |
| 38  | `APPLE_ID`      | Apple Developer email    | deploy.yml       |
| 39  | `ASC_APP_ID`    | App Store Connect → Apps | deploy.yml       |
| 40  | `APPLE_TEAM_ID` | Developer → Membership   | deploy.yml       |

**Aksiyon:** iOS deployment yaparken ekle.

---

## 🧪 Device Farm & E2E Testing (P5)

AWS Device Farm ve BrowserStack için:

| #   | Secret Adı                            | Nereden Alınır              | Kullanıldığı Yer      |
| --- | ------------------------------------- | --------------------------- | --------------------- |
| 41  | `AWS_ACCESS_KEY_ID`                   | AWS IAM                     | device-farm-tests.yml |
| 42  | `AWS_SECRET_ACCESS_KEY`               | AWS IAM                     | device-farm-tests.yml |
| 43  | `AWS_DEVICE_FARM_PROJECT_ARN`         | AWS Device Farm             | device-farm-tests.yml |
| 44  | `AWS_DEVICE_FARM_DEVICE_POOL_ARN`     | AWS Device Farm             | device-farm-tests.yml |
| 45  | `AWS_DEVICE_FARM_IOS_DEVICE_POOL_ARN` | AWS Device Farm             | device-farm-tests.yml |
| 46  | `BROWSERSTACK_USERNAME`               | BrowserStack account        | device-farm-tests.yml |
| 47  | `BROWSERSTACK_ACCESS_KEY`             | BrowserStack → Settings     | device-farm-tests.yml |
| 48  | `MAESTRO_CLOUD_API_KEY`               | https://console.mobile.dev/ | e2e-tests.yml         |

**Aksiyon:** E2E test infrastructure hazır olduğunda ekle.

---

## 🎯 Hızlı Kurulum Planı

### Faz 1: CI/CD'yi Aç (15 dakika)

```bash
# Bu 6 secret ile CI temel olarak çalışır
1. EXPO_TOKEN
2. SUPABASE_URL
3. SUPABASE_ANON_KEY
4. SUPABASE_SERVICE_KEY
5. SUPABASE_PROJECT_REF
6. SUPABASE_ACCESS_TOKEN
```

### Faz 2: Production Build'leri Etkinleştir (30 dakika)

```bash
# Bu 9 secret ile mobile ve admin build olur
7. EXPO_PUBLIC_SUPABASE_URL
8. EXPO_PUBLIC_SUPABASE_ANON_KEY
9. VITE_SUPABASE_URL
10. VITE_SUPABASE_ANON_KEY
11. STRIPE_SECRET_KEY
12. STRIPE_WEBHOOK_SECRET
13. STRIPE_TEST_PUBLISHABLE_KEY
14. OPENAI_API_KEY
15. ANTHROPIC_API_KEY
```

### Faz 3: Monitoring Ekle (20 dakika)

```bash
# Bu 7 secret ile error tracking ve notifications çalışır
16. CODECOV_TOKEN
17. SNYK_TOKEN
18. SENTRY_AUTH_TOKEN
19. SLACK_WEBHOOK_URL
20. SLACK_WEBHOOK
21. TEST_USER_EMAIL
22. TEST_USER_PASSWORD
```

### Faz 4: İsteğe Bağlı (değişken süre)

Kalan 26 secret'ı ihtiyaç oldukça ekle.

---

## 📋 GitHub'a Secret Ekleme

### Web UI ile:

1. https://github.com/kemalteksalgit/travelmatch/settings/secrets/actions
2. "New repository secret" tıkla
3. Name: Secret adını tam olarak yaz (örn: `EXPO_TOKEN`)
4. Secret: Değeri yapıştır
5. "Add secret" tıkla

### GitHub CLI ile (Toplu Ekleme):

```bash
# GitHub CLI'yi kur
brew install gh

# Login ol
gh auth login

# Secret'ları ekle
gh secret set EXPO_TOKEN --body "your-expo-token"
gh secret set SUPABASE_URL --body "https://isvstmzuyxuwptrrhkyi.supabase.co"
gh secret set SUPABASE_PROJECT_REF --body "isvstmzuyxuwptrrhkyi"
# ... devam et
```

---

## ✅ Doğrulama

Secret'ları ekledikten sonra:

1. Dummy PR aç: `git checkout -b test/ci-secrets`
2. Küçük değişiklik yap
3. Push et ve CI'ın çalıştığını gör
4. Hangi workflow'ların başarılı olduğunu kontrol et

---

## 📊 İlerleme Takibi

- [ ] **Faz 1 Tamamlandı** (6/6 secret) → CI temel çalışıyor
- [ ] **Faz 2 Tamamlandı** (15/15 secret) → Production build olur
- [ ] **Faz 3 Tamamlandı** (22/22 secret) → Monitoring aktif
- [ ] **Faz 4 Başlatıldı** → İsteğe bağlı özellikler

---

## 🚨 Kritik Notlar

1. **SUPABASE_SERVICE_KEY** → Asla commit etme, sadece GitHub Secrets'a ekle
2. **STRIPE_SECRET_KEY** → Production key'i kullan, test key değil
3. **EXPO_TOKEN** → Personal Access Token olmalı, süresi dolmasın
4. **Apple secrets** → iOS deployment yapmadan önce gerekli değil
5. **AWS/BrowserStack** → E2E testing başlatılmadan önce gerekli değil

---

## 🔗 Referanslar

- [GitHub Secrets Setup Guide](./GITHUB_SECRETS_SETUP.md)
- [Supabase Dashboard](https://supabase.com/dashboard/project/isvstmzuyxuwptrrhkyi)
- [Expo Access Tokens](https://expo.dev/accounts/[hesap]/settings/access-tokens)
- [Stripe API Keys](https://dashboard.stripe.com/apikeys)

---

**Son Güncelleme:** 9 Aralık 2025  
**Durum:** 47 secret'tan 0'ı eklenmiş ❌

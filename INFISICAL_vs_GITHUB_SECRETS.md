# 🔐 Infisical vs GitHub Secrets - Farklar ve Kullanım

**TL;DR:** Sadece **Infisical** kullanın! GitHub Secrets'a sadece 2 tane gerekli.

---

## 📊 KARŞILAŞTIRMA

| Özellik                | GitHub Secrets ❌     | Infisical ✅                     |
| ---------------------- | --------------------- | -------------------------------- |
| **Secret Sayısı**      | 20+ (her biri manuel) | 2 (sadece Infisical credentials) |
| **Yönetim**            | GitHub her repo için  | Tek dashboard tüm projeler       |
| **Environment**        | Manuel ayrım          | Otomatik (dev, staging, prod)    |
| **Audit Logs**         | ❌ Yok                | ✅ Kim, ne zaman, ne erişti      |
| **Secret Versioning**  | ❌ Yok                | ✅ Değişiklik geçmişi            |
| **Secret Rotation**    | 😰 Her secret tek tek | ✅ Tek yerden hepsi              |
| **Multi-Project**      | 😰 Her repo ayrı      | ✅ Tüm projeler tek yerden       |
| **Mobile App Runtime** | ❌ Kullanılamaz       | ✅ SDK ile çeker                 |
| **Team Collaboration** | 😰 Zor                | ✅ Role-based access             |
| **Cost**               | Ücretsiz              | Ücretsiz (5000 secret'a kadar)   |

---

## ✅ DOĞRU YÖNTEM: Infisical

### GitHub Secrets (Sadece 2 tane!)

```bash
# GitHub → Settings → Secrets → Actions → New secret

INFISICAL_CLIENT_ID
  → Infisical Dashboard → Machine Identities → Create
  → https://app.infisical.com/org/cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9/identities

INFISICAL_CLIENT_SECRET
  → Yukarıdaki machine identity oluştururken verilecek
  → Sadece 1 kez gösterilir, kaydedin!
```

**Bu kadar!** Geri kalan HER ŞEY Infisical'dan çekilir! 🎉

---

### Infisical Dashboard (Tüm secrets burada!)

**Dashboard:** https://app.infisical.com/org/cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9

**Eklenecek Secrets:**

#### 🟢 Development Environment

```bash
# Supabase
SUPABASE_URL=https://bjikxgtbptrvawkguypv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=<get-from-supabase-dashboard>
SUPABASE_ACCESS_TOKEN=<get-from-supabase-account-tokens>
SUPABASE_DB_PASSWORD=<get-from-supabase-settings-database>

# Stripe (Test)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx

# Others (optional)
OPENAI_API_KEY=sk-xxxxx
CLOUDFLARE_STREAM_API_KEY=xxxxx
CLOUDFLARE_STREAM_ACCOUNT_ID=xxxxx
MAPBOX_SECRET_TOKEN=pk.eyJ... # Mapbox secret token (server-side)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

#### 🔴 Production Environment

```bash
# Same as dev but with LIVE keys:
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_live_xxxxx
# ... etc
```

---

## 🚀 NASIL ÇALIŞIR?

### 1. GitHub Actions'da

```yaml
# .github/workflows/deploy-supabase.yml

steps:
  # Infisical'dan TÜM secrets'ları çek
  - name: 🔐 Import secrets from Infisical
    uses: Infisical/secrets-action@v1
    with:
      client-id: ${{ secrets.INFISICAL_CLIENT_ID }}
      client-secret: ${{ secrets.INFISICAL_CLIENT_SECRET }}
      project-id: cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9
      environment: production # veya staging

  # Artık TÜM secrets environment variables olarak mevcut!
  - name: Deploy
    run: |
      echo $STRIPE_SECRET_KEY  # ✅ Çalışır!
      echo $SUPABASE_ACCESS_TOKEN  # ✅ Çalışır!
      # Tüm secrets otomatik yüklendi!
```

### 2. Mobile App'te (Runtime)

```typescript
// apps/mobile/src/config/secrets.ts

import { InfisicalSDK } from '@infisical/sdk';

const infisical = new InfisicalSDK({
  clientId: process.env.INFISICAL_CLIENT_ID!,
  clientSecret: process.env.INFISICAL_CLIENT_SECRET!,
});

export async function getSecrets() {
  const secrets = await infisical.listSecrets({
    environment: 'production',
    projectId: 'cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9',
  });

  return secrets;
}

// Kullanım:
const { STRIPE_SECRET_KEY } = await getSecrets();
```

### 3. Terminal'de (Development)

```bash
# Infisical CLI ile app çalıştır
infisical run -- npx expo start

# Tüm secrets otomatik yüklenir!
# process.env.STRIPE_SECRET_KEY ✅ Çalışır
# process.env.SUPABASE_URL ✅ Çalışır
```

---

## 🎯 KURULUM ADIMLARI

### Adım 1: Infisical'da Project Oluştur (2 dakika)

1. Git: https://app.infisical.com/org/cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9
2. "Create Project" → "TravelMatch"
3. 3 environment ekle: `development`, `staging`, `production`

### Adım 2: Secrets Ekle (5 dakika)

Her environment için yukarıdaki secrets'ları ekle.

### Adım 3: Machine Identity Oluştur (2 dakika)

1. Infisical → Organization Settings → Machine Identities
2. "Create Identity" → "GitHub Actions TravelMatch"
3. Copy **Client ID** ve **Client Secret**
4. Permissions: Read secrets from "TravelMatch" project

### Adım 4: GitHub Secrets Ekle (1 dakika)

GitHub → Settings → Secrets → Actions:

- `INFISICAL_CLIENT_ID` (yukarıdan)
- `INFISICAL_CLIENT_SECRET` (yukarıdan)

**BITTI!** ✅

---

## 📋 KONTROL LİSTESİ

### GitHub'da (Sadece 2 secret!)

- [ ] `INFISICAL_CLIENT_ID`
- [ ] `INFISICAL_CLIENT_SECRET`

### Infisical'da (Tüm secrets!)

**Development Environment:**

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_ACCESS_TOKEN`
- [ ] `SUPABASE_DB_PASSWORD`
- [ ] `STRIPE_SECRET_KEY` (test)
- [ ] `STRIPE_WEBHOOK_SECRET` (test)
- [ ] `OPENAI_API_KEY` (optional)
- [ ] `CLOUDFLARE_STREAM_API_KEY` (optional)
- [ ] `MAPBOX_SECRET_TOKEN` (optional)
- [ ] `UPSTASH_REDIS_REST_URL` (optional)
- [ ] `UPSTASH_REDIS_REST_TOKEN` (optional)

**Production Environment:**

- [ ] Same as above but with **LIVE** keys!

---

## 🎉 FAYDALAR

### Tek Dashboard

```
GitHub Secrets (ESKİ):
❌ Stripe secrets → GitHub'da
❌ Supabase secrets → GitHub'da
❌ OpenAI secrets → GitHub'da
❌ Her değişiklik için GitHub UI
❌ Her environment için ayrı secrets
❌ Değişiklik geçmişi yok

Infisical (YENİ):
✅ TÜM secrets → Infisical dashboard
✅ Tek tıkla değiştir
✅ Otomatik sync (GitHub, mobile, server)
✅ Environment'lar arası kopyala
✅ Kim ne zaman değiştirdi → Audit log
✅ Secret rotation → 1 dakika
```

### Güvenlik

```
GitHub Secrets:
❌ Secret leak → GitHub'da değiştir
❌ Team member left → Tüm secrets rotate et
❌ Hangi secret kullanılmamış? → Bilmiyoruz

Infisical:
✅ Secret leak → 1 tıkla rotate
✅ Team member left → Access revoke (otomatik rotate)
✅ Unused secrets → Dashboard'da görünür
✅ Access logs → Kim, ne zaman
```

### Developer Experience

```
GitHub Secrets:
❌ Yeni developer → 20 secret gir
❌ Local development → .env dosyası paylaş (GÜVENSİZ!)
❌ Environment değiştir → Manuel değişiklik

Infisical:
✅ Yeni developer → infisical login (DONE!)
✅ Local development → infisical run -- npm start
✅ Environment değiştir → --env production
```

---

## ❓ SSS

### S: Neden GitHub Secrets kullanmayayım?

**C:** Çünkü:

- 20+ secret manuel girmek zahmetli
- Her değişiklik GitHub UI'dan
- Audit log yok
- Multi-environment yönetimi zor
- Mobile app'te kullanılamaz

### S: Infisical güvenli mi?

**C:** ✅ Evet!

- End-to-end encryption
- Zero-knowledge architecture
- SOC 2 Type II certified
- Kullanılan: GitLab, Webflow, Automattic

### S: Infisical ücretli mi?

**C:** 🆓 Ücretsiz!

- 5000 secret'a kadar free
- Unlimited projects
- Unlimited environments
- TravelMatch için yeterli

### S: GitHub Secrets hiç kullanılmayacak mı?

**C:** Sadece 2 tane:

- `INFISICAL_CLIENT_ID`
- `INFISICAL_CLIENT_SECRET`

Geri kalan HER ŞEY Infisical'da!

---

## 🔗 KAYNAKLAR

- **Infisical Dashboard:** https://app.infisical.com/org/cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9
- **Infisical Docs:** https://infisical.com/docs
- **GitHub Actions Integration:** https://infisical.com/docs/integrations/cicd/githubactions
- **Mobile SDK:** https://infisical.com/docs/sdks/overview

---

## ✅ ÖZET

| Ne Yapılır           | Nerede              | Kaç Tane |
| -------------------- | ------------------- | -------- |
| **Machine Identity** | Infisical           | 1 kez    |
| **GitHub Secrets**   | GitHub Actions      | 2 secret |
| **App Secrets**      | Infisical           | Tümü!    |
| **Yönetim**          | Infisical Dashboard | Tek yer  |

**Sonuç:**

- ❌ GitHub Secrets'a 20+ secret girme
- ✅ Infisical'a 1 kez setup
- ✅ Sonsuza kadar kolay yönetim

**Başlayın:** [INFISICAL_SETUP_GUIDE.md](INFISICAL_SETUP_GUIDE.md)

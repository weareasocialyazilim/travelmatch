# 07_RELEASE_AND_QA.md (Release Disiplini, CI/CD, Migration, Rollback, Üretim Güvenliği)

## 1. Amaç

Bu doküman, Lovendo’nun yazılım yaşam döngüsünde:

- kodun nasıl üretime alındığını,
- veri migrasyonlarının nasıl yönetildiğini,
- hatalarda nasıl geri dönüldüğünü,
- prod ortamının nasıl korunduğunu tanımlar.

Amaç: sürprizsiz release, veri kaybı olmadan ilerleme, hızlı geri dönüş.

## 2. Ortamlar (Environments)

- **Local:** Geliştirme ve hızlı deneme
- **Preview / Staging:** PR bazlı doğrulama
- **Production:** Canlı ortam

**Kural**

- Prod’a giden her değişiklik preview’dan geçmek zorundadır.
- Prod ortamında “acil hotfix” harici doğrudan işlem yapılmaz.

## 3. Branch ve Versiyonlama Stratejisi

- **main:** Prod’a çıkan kod
- **Feature branch’ler:** izole geliştirme
- Release commit’leri anlamlı mesaj taşır

**Versiyonlama**

- Mobil ve backend sürümleri izlenebilir olmalıdır
- Release notları tutulur

## 4. CI/CD Akışı

### 4.1 Otomatik Kontroller

Her PR’da:

- Type check
- Lint
- Unit test (varsa)
- Build doğrulama

Kontrollerden geçmeyen PR merge edilemez.

### 4.2 Deploy Akışı

- PR merge → preview deploy
- Manuel QA onayı
- Prod deploy tetikleme

**Kural**

- Deploy işlemleri kayıt altındadır
- Deploy sırasında secrets loglanmaz

## 5. Database Migration Disiplini

### 5.1 Migration Kuralları

- Her migration ileri uyumlu yazılır
- Geriye dönük veri kaybı yaratacak işlemler yasaktır
- DROP COLUMN gibi işlemler aşamalı yapılır

### 5.2 Migration Sırası

1.  Yeni alan ekleme
2.  Kodun yeni alanı kullanmaya başlaması
3.  Eski alanın devre dışı bırakılması
4.  Gerekirse temizlik

## 6. Rollback Stratejisi

### 6.1 Kod Rollback

- Önceki stable build’e dönülebilir
- Feature flag ile davranış kapatılabilir

### 6.2 Veri Rollback

- Migration geri alınmaz
- Bunun yerine “düzeltici migration” yazılır

**Kural:** Prod verisi geri alınmaz, düzeltilir.

## 7. Feature Flag ve Kademeli Yayın

- Riskli özellikler feature flag ile korunur
- Kademeli açılır (admin → paid → herkes)

**Örnek kullanım:**

- Yeni ödeme akışı
- Yeni filtre kombinasyonları
- Yeni moderation kuralları

## 8. Mobil Release (App Store / Play Store)

- TestFlight / Internal testing zorunlu
- Versiyon artışı net olmalı
- Geri çağrılabilirlik (rollout) planı hazır olmalı

## 9. QA Kontrol Listesi (Pre-Release)

**Fonksiyonel**

- Moment oluşturma / edit
- Discover (story + card)
- Filtreler
- Claim / Proof
- Ödeme / escrow
- Chat unlock
- Guest browse

**Teknik**

- Error rate normal mi?
- Performans düşüşü var mı?
- Loglarda hassas veri var mı?

## 10. Prod Sonrası İzleme

- İlk 24 saat aktif izleme
- Anomali alarmı
- Gerekirse hızlı hotfix

## 11. Acil Durum Prosedürü

- Sistemsel hata → feature kapatma
- Veri riski → erişim kısıtlama
- Güvenlik → oturum iptali + secret rotasyonu

## 12. Post-Release Değerlendirme

- Ne çalıştı?
- Ne sorun çıkardı?
- Bir sonraki release için aksiyonlar

Bu değerlendirme yazılı tutulur.

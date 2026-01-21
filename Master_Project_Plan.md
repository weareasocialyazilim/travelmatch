# Lovendo: Master Project Plan (SSoT)

Bu belge, Lovendo platformunun mimari, UI/UX, Backend ve Lansman stratejilerini içeren ana yol haritasıdır.

## 1. Mimari Sütunlar
Lovendo platformu 5 ana sütun üzerine inşa edilmiştir:
- **Business Plan**: 1 LVND = 1 Yerel Birim. %5-15 komisyon ve abonelik gelirleri.
- **UI/UX**: "Coming Soon" metinleri kaldırıldı. TrustGarden ve Titan Flow ile premium deneyim.
- **Supabase & Backend**: Dinamik kur dönüşümü, HMAC imzalı iDenfy webhook ve AWS Rekognition AI moderasyonu.
- **Mobile**: Apple/Google IAP entegrasyonu, iDenfy Mobile SDK (çekim aşamasında).
- **Admin Dashboard**: CEO Komuta Merkezi. Finansal takip, kritik onaylar ve moderasyon kuyruğu.

## 2. App Store Connect / Play Console Metadata
### Uygulama Bilgileri
- **Başlık (TR):** Lovendo: Sosyal Hediye & Güven
- **Başlık (EN):** Lovendo: Social Gifting & Trust
- **Alt Başlık (TR):** Değer ver, paylaş, bahçeni büyüt.
- **Alt Başlık (EN):** Gift, share and grow your garden.
- **Anahtar Kelimeler:** social, gifting, trust, creator, moments, video, gift, secure, community, verified, lifestyle, experiences, kyc, escrow, bahçe, hediye, sosyal, güven, video, paylaşım.

### Tanıtım Metni (Giriş)
Lovendo ile sosyal etkileşimin en şeffaf ve güvenli halini keşfedin! Lovendo, sadece bir paylaşım platformu değil; gerçek bağlar kurduğunuz, değer paylaştığınız ve güveninizi görselleştirdiğiniz bir deneyim pazaryeridir.

## 3. İncelemeci Notları (App Review Notes)
"Lovendo, kullanıcıların birbirlerine dijital teşekkür hediyeleri gönderdiği bir platformdur. Platformumuzda gerçek para transferi doğrudan yapılmaz; tüm işlemler Apple IAP ile alınan sanal LVND birimi üzerinden döner. Dolandırıcılığı önlemek için 'Titan Protocol' adı verilen bir escrow mekanizması ve iDenfy tabanlı KYC süreçleri entegre edilmiştir. Uygulama tamamen Guideline 3.1.1 (IAP) ve Guideline 1.2 (UGC Moderation) kurallarına uygundur."

## 4. Lansman Kontrol Listesi (Checklist)
- [ ] **Teknik**: idenfy-webhook HMAC doğrulaması aktif mi?
- [ ] **AI**: AWS Rekognition moderasyon tetikleyicisi aktif mi?
- [ ] **Finansal**: Apple Small Business başvurusu yapıldı mı?
- [ ] **IAP**: Paketler "Consumable" olarak tanımlandı mı?
- [ ] **UX**: Grep "Coming Soon" sonucu sıfır mı?
- [ ] **Admin**: 1.000+ birim çekim talepleri için manuel onay ekranı hazır mı?

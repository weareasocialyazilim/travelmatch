# 10_MOMENT_CLAIM_PROOF_PLAYBOOK.md (Uçtan Uca Operasyon Playbook)

## 1. Amaç

Bu doküman, bir moment’in oluşturulmasından kapanmasına kadar geçen tüm operasyonel akışı tanımlar.

Bu doküman:

- Ürün
- Operasyon
- Moderasyon
- Destek için referanstır.

## 2. Moment Oluşturma

- Kullanıcı moment oluşturur
- Gerekli alanlar doldurulur
- Moment doğrudan publish edilir
- Admin onayı beklenmez.

**AI taraması:**

- Publish sonrası çalışır
- Karar vermez
- Risk sinyali üretir

## 3. Moment Aktif Durumu

Aktif moment:

- Discover’da görünür
- Story ve Card formatında gösterilir
- Claim alabilir
- Editlenebilir

Edit sonrası:

- Anında yayına girer
- Aynı kontrol mekanizması tekrar çalışır

## 4. Claim Süreci

**Claim:**

- Bir kullanıcının moment’i tüketme niyetidir
- Hukuki bağlayıcılığı yoktur
- Sistemsel bir kilittir

Kurallar:

- Kullanıcı kendi moment’ini claim edemez
- Aynı anda birden fazla aktif claim kısıtlanabilir
- Claim süresi dolabilir

## 5. Claim Sonrası Senaryolar

### 5.1 Normal Akış

- Claim alınır
- Deneyim gerçekleşir
- Proof gönderilir
- Proof kabul edilir
- Escrow varsa çözülür
- Moment completed olur

### 5.2 No-Show / Gerçekleşmedi

- Kullanıcı gelmez
- Deneyim gerçekleşmez

Bu durumda:

- Claim düşer
- Escrow varsa iade edilir
- Moment tekrar claim edilebilir

## 6. Proof Süreci

**Proof:**

- Deneyimin gerçekleştiğine dair platform içi sinyaldir
- Hukuki belge değildir

Proof gönderimi:

- Belirli süre içinde yapılmalıdır
- Aksi halde claim başarısız sayılır

**AI:**

- Proof’u tarayabilir
- Şüphe varsa admin’e düşer

## 7. Admin Müdahalesi

Admin:

- Proof’u inceleyebilir
- Moment’i suspend edebilir
- Claim’i iptal edebilir

Admin kararı:

- Geri alınabilir
- Ancak audit kaydı kalıcıdır

Super Admin:

- Yanlış admin kararını override edebilir

## 8. Moment Kapanışı

Moment:

- Başarıyla tamamlandıysa **completed**
- İptal edildiyse **cancelled**
- Abuse varsa **suspended**

Kapanan moment:

- Yeni claim alamaz
- Editlenemez (istisnai admin override hariç)

## 9. Review & Yorum

- Review yalnızca moment sonrası bırakılabilir
- Her kullanıcı, her moment için tek review bırakabilir
- Review’lar moderation kapsamındadır

## 10. Report (Şikayet)

- Kullanıcılar moment, mesaj veya kullanıcıyı report edebilir
- Report admin queue’ya düşer
- İnceleme sonucu aksiyon alınabilir

## 11. Edge Case’ler

- Proof hiç gelmezse
- Proof geç gelirse
- Escrow süresi dolarsa
- Admin yanlış karar verirse
- Kullanıcı itiraz ederse

Bu senaryoların tamamında:

- Audit log tutulur
- Geri dönüşler kayıt altındadır

## 12. Yetki Özeti

- **Kullanıcı:** moment, claim, proof
- **Admin:** inceleme, kısıtlama
- **Super Admin:** override, final karar

## 13. Temel Prensip

**Default allow – Exception handle**

Sistem:

- Akışı durdurmaz
- İstisnayı yönetir
- Güveni korur

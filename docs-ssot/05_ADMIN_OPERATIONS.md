# 05_ADMIN_OPERATIONS.md (Operasyonel SOP – Moderasyon, İnceleme, Kriz Yönetimi)

## 1. Amaç ve Yetki Çerçevesi

Bu doküman, admin ve super admin rollerinin operasyonel görevlerini, karar sınırlarını ve kriz
senaryolarını tanımlar. Amaç: hızlı müdahale, hatasız karar, izlenebilirlik.

**Yetki özeti**

- **Admin:** İnceleme, kısıtlama, raporlama
- **Super Admin:** Override, politika değişikliği, admin yönetimi

## 2. İnceleme Kuyrukları (Queues)

Admin panelinde aşağıdaki kuyruklar bulunur:

1.  **AI Flag Queue**
    - Moment/Proof yayımlı kalır
    - İnceleme istisnaidir

2.  **User Report Queue**
    - Moment / Mesaj / Kullanıcı şikayetleri

3.  **Payment/Escrow Alerts**
    - 100+ işlemler
    - Zaman aşımı / şüpheli akış

4.  **Integration Health Alerts**
    - Sağlayıcı hataları (soft-fail prensibi)

**Kural:** Kuyruklar FIFO + öncelik etiketleriyle işlenir.

## 3. İnceleme Süreci (Standard Review Flow)

**Adımlar**

1.  İnceleme kaydını aç
2.  İçeriği bağlamıyla gör (moment, edit geçmişi, proof)
3.  AI sinyalini bilgi olarak değerlendir (bağlayıcı değil)
4.  Kararı ver
5.  Kararı gerekçesiyle kaydet

**Karar tipleri**

- **No Action**
- **Warning** (kullanıcıya bilgilendirme)
- **Restriction** (geçici)
- **Suspension** (soft)
- **Escalation** (Super Admin)

## 4. Locking ve Çakışma Önleme

- Bir içerik incelemeye alındığında **review lock** oluşur
- Diğer admin’ler read-only görür
- Lock süresi sınırlıdır; süresi dolan lock otomatik düşer

## 5. Escrow & Finans Operasyonları

**Admin**

- Finansal işlem başlatamaz
- Sadece inceleme/eskalasyon yapar

**Super Admin**

- Escrow release/refund override
- Limit resetleme
- Olağanüstü durumlarda manuel müdahale

**Kural:** Tüm override’lar ayrı audit kaydı oluşturur.

## 6. Yanlış Karar ve Geri Alma

- Admin kararı geri alınabilir
- Geri alma yalnızca Super Admin tarafından yapılır
- İlk karar ve geri alma silinmez, zincir halinde tutulur

## 7. Kullanıcı İletişimi (Templates & Tone)

- Bildirimler nötr ve bilgilendirici olmalıdır
- “AI yaptı” dili kullanılmaz
- Gerekçeler kısa ve nettir
- İtiraz yolu açıkça belirtilir

## 8. SLA ve Önceliklendirme

**Öncelikler**

- AI Flag: Yüksek öncelik
- Payment/Escrow: Kritik
- Reports: Orta
- Diğer: Düşük

**Hedef süreler**

- Kritik: saatler içinde
- Diğer: 24–48 saat

## 9. Kriz Senaryoları

**Örnekler**

- Yanlış toplu suspend
- Entegrasyon kesintisi
- Şüpheli finansal akış

**Kriz adımları**

1.  Yayılmayı durdur
2.  Etkilenenleri belirle
3.  Geçici önlem al
4.  Super Admin bilgilendir
5.  Post-mortem hazırla

## 10. Audit & Raporlama

- Tüm admin aksiyonları immutable audit log’a yazılır
- Haftalık/aylık operasyon raporları hazırlanır
- Anomali trendleri izlenir

## 11. Eğitim ve Yetkilendirme

- Yeni admin onboarding zorunlu
- Yetki değişiklikleri kayıt altına alınır
- Düzenli tazeleme eğitimleri yapılır

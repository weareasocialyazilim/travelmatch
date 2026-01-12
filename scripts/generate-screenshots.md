# App Store Screenshots Guide

## Otomatik Screenshot Almak İçin

### Maestro ile (Önerilen)

1. Maestro CLI kur:

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

2. Screenshot flow çalıştır:

```bash
maestro test tests/e2e/flows/screenshots.yaml
```

### Manuel Screenshot Listesi

iOS Simulator'da şu ekranları yakala:

| #   | Ekran          | Navigasyon                  | Notlar                 |
| --- | -------------- | --------------------------- | ---------------------- |
| 1   | Discover Feed  | Ana ekran                   | Güzel momentlerle dolu |
| 2   | Map View       | Discover > Map icon         | İstanbul merkezli      |
| 3   | Moment Detail  | Herhangi bir moment'a tıkla | Fotoğraflı, detaylı    |
| 4   | Gift Selection | Moment > Hediye Gönder      | Tier seçimi göster     |
| 5   | Messages       | Messages tab                | Birkaç konuşma         |
| 6   | Profile        | Profile tab                 | Düzenli profil         |
| 7   | Wallet         | Profile > Wallet            | Bakiye görünür         |
| 8   | Create Moment  | + butonu                    | Kamera/galeri seçimi   |

### Screenshot Boyutları (Apple Requirements)

| Device                   | Resolution  | Required |
| ------------------------ | ----------- | -------- |
| iPhone 6.7" (14 Pro Max) | 1290 x 2796 | ✅ Yes   |
| iPhone 6.5" (14 Plus)    | 1284 x 2778 | ✅ Yes   |
| iPhone 5.5" (8 Plus)     | 1242 x 2208 | Optional |

### Simulator'da Screenshot Alma

```bash
# iPhone 14 Pro Max için
xcrun simctl io booted screenshot screenshot1.png

# Belirli simulator için
xcrun simctl io "iPhone 14 Pro Max" screenshot discover.png
```

### Screenshot İpuçları

1. **Temiz data kullan** - Demo account ile giriş yap
2. **Güzel görseller** - Kaliteli fotoğraflı momentler
3. **Türkçe UI** - Tüm text'ler Türkçe
4. **Status bar temiz** - Saat 9:41, full signal, full battery
5. **Dark mode** - Her iki theme için al

### Simulator Status Bar Ayarlama

```bash
# Status bar'ı "demo mode"a al
xcrun simctl status_bar "iPhone 14 Pro Max" override \
  --time "9:41" \
  --batteryState charged \
  --batteryLevel 100 \
  --wifiBars 3 \
  --cellularBars 4
```

### Figma/Sketch Template

Screenshot'ları frame'lere yerleştirmek için:

- Apple'ın resmi device frame'lerini kullan
- Headline ve subtitle ekle
- Marka renkleri ile tutarlı ol

### Örnek Headline'lar

1. "Seyahat Deneyimlerini Keşfet"
2. "Haritada Bul, Anında Bağlan"
3. "Detayları Gör, Hediye Seç"
4. "Sevdiklerine Deneyim Hediye Et"
5. "Gerçek Zamanlı Mesajlaş"
6. "Profilini Yönet"
7. "Güvenli Cüzdan"
8. "Anını Paylaş"

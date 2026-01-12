# TravelMatch Web - Static Assets

Bu klasör web uygulaması için gerekli statik dosyaları içerir.

## 📁 Klasör Yapısı

```
public/
├── manifest.json          ✅ PWA manifest
├── og-image.svg           ✅ Open Graph (SVG)
├── og-image.png           ⚠️ Gerekli (1200x630)
├── favicon.ico            ⚠️ Gerekli (32x32)
├── apple-touch-icon.png   ⚠️ Gerekli (180x180)
├── icons/                 📁 PWA Icons
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── sounds/                📁 UI Sound Effects
    ├── soft-click.mp3    ⚠️ Opsiyonel
    └── pulse-low.mp3     ⚠️ Opsiyonel
```

## 🎨 Asset Gereksinimleri

### Favicon & Icons

| Dosya                | Boyut   | Format | Kullanım        |
| -------------------- | ------- | ------ | --------------- |
| favicon.ico          | 32x32   | ICO    | Browser tab     |
| apple-touch-icon.png | 180x180 | PNG    | iOS home screen |
| icon-192x192.png     | 192x192 | PNG    | Android/PWA     |
| icon-512x512.png     | 512x512 | PNG    | PWA splash      |

### Open Graph Image

- **Boyut:** 1200x630 px
- **Format:** PNG veya JPG
- **İçerik:** TravelMatch logo + tagline
- **Kullanım:** Social media sharing

### Sound Effects (Opsiyonel)

- **soft-click.mp3:** UI buton tıklama sesi (~50KB)
- **pulse-low.mp3:** Bas frekans pulse (~100KB)
- **Not:** Graceful fallback var, ses dosyaları olmadan da çalışır

## 🔧 Asset Oluşturma

### Figma/Canva ile:

1. Logo'yu 512x512 olarak export et
2. Farklı boyutlarda resize et
3. favicon.ico için online converter kullan

### Online Araçlar:

- [Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [OG Image Generator](https://og-image.vercel.app/)

## 📝 Notlar

- Tüm PNG'ler optimize edilmeli (TinyPNG)
- Icon'lar maskable olmalı (PWA uyumluluğu için)
- Ses dosyaları 128kbps MP3 yeterli

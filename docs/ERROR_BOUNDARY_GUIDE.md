# Error Boundary & Hata Yönetimi Sistemi

## 📋 Genel Bakış

TravelMatch uygulaması, uygulama çökmelerini önlemek ve kullanıcı deneyimini korumak için çok katmanlı bir hata yönetimi sistemi kullanır.

## 🎯 Özellikler

### ✅ Tamamlanan İyileştirmeler

1. **Yeniden Kullanılabilir ErrorBoundary Komponenti**
   - Farklı hata türleri için özelleştirilebilir fallback tipleri
   - Türkçe hata mesajları
   - "Tekrar Dene" ve "Ana Sayfaya Dön" butonları
   - Sentry entegrasyonu ile otomatik hata kaydetme
   - Debug modunda detaylı hata bilgisi

2. **Ana Ekranlar ErrorBoundary ile Sarmalandı**
   - ✅ Discover (Ana Sayfa)
   - ✅ Messages (Mesajlar)
   - ✅ Chat (Sohbet)
   - ✅ Profile (Profil)
   - ✅ Requests (İstekler)
   - ✅ Settings (Ayarlar)
   - ✅ GiftInbox (Hediye Kutusu)
   - ✅ Wallet (Cüzdan) - Zaten sarmalanmıştı
   - ✅ BookingDetail, TransactionDetail, RefundRequest - Kritik ekranlar

3. **Sentry Entegrasyonu**
   - Otomatik hata yakalama ve raporlama
   - Hata seviyelerine göre (fatal, error, warning) loglama
   - Component stack trace kaydetme
   - Platform ve cihaz bilgisi ekleme

## 📚 Kullanım

### ErrorBoundary Tipleri

```tsx
import { withErrorBoundary } from '@/components/withErrorBoundary';

// Generic hata (otomatik tespit)
export default withErrorBoundary(MyScreen, { 
  fallbackType: 'generic',
  displayName: 'MyScreen' 
});

// Network hatası
export default withErrorBoundary(MyScreen, { 
  fallbackType: 'network',
  displayName: 'MyScreen' 
});

// Sunucu hatası
export default withErrorBoundary(MyScreen, { 
  fallbackType: 'server',
  displayName: 'MyScreen' 
});

// Kritik hata
export default withErrorBoundary(MyScreen, { 
  fallbackType: 'critical',
  displayName: 'MyScreen' 
});
```

### Fallback Türleri

| Tür | İkon | Başlık | Mesaj | Retry | Home |
|-----|------|--------|--------|-------|------|
| `generic` | ⚠️ | "Bir Şeyler Yanlış Gitti" | Genel mesaj | ✅ | ✅ |
| `network` | 📡 | "Bağlantı Hatası" | İnternet kontrolü | ✅ | ✅ |
| `server` | 🖥️ | "Sunucu Hatası" | Sunucu sorunu | ✅ | ✅ |
| `notfound` | 🔍 | "Sayfa Bulunamadı" | Sayfa yok | ❌ | ✅ |
| `unauthorized` | 🔒 | "Yetkilendirme Hatası" | Erişim yok | ❌ | ✅ |
| `critical` | 🛑 | "Kritik Hata" | Uygulama yeniden başlatma | ✅ | ✅ |

### Direkt Kullanım

```tsx
import { ScreenErrorBoundary } from '@/components';

function MyScreen() {
  return (
    <ScreenErrorBoundary fallbackType="network">
      {/* Screen content */}
    </ScreenErrorBoundary>
  );
}
```

### HOC ile Kullanım (Önerilen)

```tsx
import { withErrorBoundary } from '@/components/withErrorBoundary';

function MyScreen() {
  return (
    <View>
      {/* Screen content */}
    </View>
  );
}

export default withErrorBoundary(MyScreen, { 
  fallbackType: 'generic',
  displayName: 'MyScreen' 
});
```

## 🔧 Özel Fallback UI

```tsx
import { ErrorBoundary } from '@/components';

function MyComponent() {
  return (
    <ErrorBoundary
      level="component"
      fallback={(error, resetError, goHome) => (
        <View>
          <Text>Özel hata mesajı: {error.message}</Text>
          <Button onPress={resetError}>Tekrar Dene</Button>
          <Button onPress={goHome}>Ana Sayfa</Button>
        </View>
      )}
    >
      {/* Component content */}
    </ErrorBoundary>
  );
}
```

## 🏗️ Katman Yapısı

### App Level
```tsx
// App.tsx
<ErrorBoundary level="app" fallbackType="critical">
  <App />
</ErrorBoundary>
```
- Uygulama genelindeki kritik hatalar
- Tam ekran hata gösterimi
- Uygulama yeniden başlatma önerisi

### Navigation Level
```tsx
// AppNavigator.tsx
<NavigationErrorBoundary>
  <NavigationContainer>
    {/* Routes */}
  </NavigationContainer>
</NavigationErrorBoundary>
```
- Navigasyon hatalarını yakalar
- Ana sayfaya dönüş seçeneği

### Screen Level
```tsx
// Any Screen
export default withErrorBoundary(MyScreen, { 
  fallbackType: 'generic' 
});
```
- Ekran bazlı hata yakalama
- Retry ve home butonları
- En yaygın kullanım

### Component Level
```tsx
// Critical Components
<ComponentErrorBoundary fallbackType="network">
  <CriticalComponent />
</ComponentErrorBoundary>
```
- Bileşen bazlı izolasyon
- Minimal hata gösterimi

## 🔍 Hata Tespiti

ErrorBoundary, hata mesajından otomatik tip tespiti yapar:

```typescript
// "Network error" → network fallback
// "404 Not Found" → notfound fallback
// "401 Unauthorized" → unauthorized fallback
// "500 Server Error" → server fallback
// Diğerleri → generic fallback
```

## 📊 Sentry Entegrasyonu

Her hata otomatik olarak Sentry'e gönderilir:

```typescript
Sentry.captureException(error, {
  level: 'fatal', // or 'error' based on boundary level
  tags: {
    errorBoundaryLevel: 'screen',
    platform: 'ios',
  },
  contexts: {
    errorBoundary: {
      level: 'screen',
      componentStack: '...',
    },
  },
});
```

## 🎨 UI Özellikleri

### Retry Butonu
- Ekranı yeniden yükler
- State'i sıfırlar
- Hata durumunu temizler

### Ana Sayfaya Dön Butonu
- Navigation stack'i sıfırlar
- Discover ekranına yönlendirir
- Güvenli başlangıç noktası

### Debug Modu
Development modunda:
- Hata detayları gösterilir
- Stack trace görüntülenir
- Console'a detaylı log

## 📱 Ekran Örnekleri

### Generic Error
```
⚠️
Bir Şeyler Yanlış Gitti
Lütfen tekrar deneyin veya geri dönün.

[Tekrar Dene] [Ana Sayfaya Dön]
```

### Network Error
```
📡
Bağlantı Hatası
İnternet bağlantınızı kontrol edip tekrar deneyin.

[Tekrar Dene] [Ana Sayfaya Dön]
```

### Server Error
```
🖥️
Sunucu Hatası
Sunucularımızda bir sorun oluştu. Lütfen daha sonra tekrar deneyin.

[Tekrar Dene] [Ana Sayfaya Dön]
```

## 🚀 Best Practices

1. **Tüm Ana Ekranları Sarın**: Kritik ekranlar mutlaka ErrorBoundary ile korunmalı
2. **Doğru Fallback Tipi Seçin**: Hata türüne uygun fallback kullanın
3. **Display Name Ekleyin**: Debug için component adını belirtin
4. **Navigation Prop'u İletin**: Home butonunun çalışması için gerekli
5. **Kritik İşlemler İçin Critical Kullanın**: Payment, Auth gibi ekranlar

## 🐛 Test Etme

```tsx
// Test için hata fırlatan buton
<Button 
  onPress={() => {
    throw new Error('Test error for ErrorBoundary');
  }}
  title="Test Error Boundary"
/>
```

## 📝 Yapılacaklar

- [ ] Offline durumu için özel fallback
- [ ] Retry limit ve exponential backoff
- [ ] Kullanıcı feedback formu entegrasyonu
- [ ] Error analytics dashboard
- [ ] A/B testing için farklı mesajlar

## 🔗 İlgili Dosyalar

- `/apps/mobile/src/components/ErrorBoundary.tsx` - Ana ErrorBoundary komponenti
- `/apps/mobile/src/components/withErrorBoundary.tsx` - HOC wrapper
- `/apps/mobile/src/config/sentry.ts` - Sentry konfigürasyonu
- `/App.tsx` - Root level ErrorBoundary
- `/apps/mobile/src/navigation/AppNavigator.tsx` - Navigation level ErrorBoundary

## 📞 Destek

Sorularınız için: [İlgili dökümanlar ve issue tracker]

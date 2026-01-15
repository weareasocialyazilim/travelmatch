# Accessibility (a11y) Quick Start Guide

## Lovendo Mobile - Internal Developer Reference

> **Amaç:** Hiç a11y bilgisi olmayan bir geliştirici bile bu kılavuzu okuyup hemen uygulayabilsin.

---

## 📖 Nedir Bu Accessibility?

**Kısaca:** Uygulamanızı görme engelli kullanıcılar da dahil **herkesin** kullanabilmesi için ekstra
bilgi eklemektir.

**Örnek:** Bir butona "Sign In" yazan text var ama ekran okuyucu (VoiceOver/TalkBack) ona tıklayınca
ne olacağını bilmiyor. Biz söylemeliyiz: "Sign in with your email and password" diye.

---

## 🚀 Hızlı Başlangıç (3 Adım)

### 1️⃣ Hook'u Import Et

```tsx
import { useAccessibility } from '@/hooks/useAccessibility';
```

### 2️⃣ Component'inde Kullan

```tsx
export const MyScreen = () => {
  const { props: a11y } = useAccessibility();

  // ... rest of your component
};
```

### 3️⃣ Elementlere Ekle

```tsx
<TouchableOpacity onPress={handlePress} {...a11y.button('Sign In', 'Sign in to your account')}>
  <Text>Sign In</Text>
</TouchableOpacity>
```

**O kadar!** ✅

---

## 🎯 En Sık Kullanılanlar (Copy-Paste Örnekleri)

### ✅ Button (Buton)

```tsx
<TouchableOpacity
  onPress={handleLogin}
  {...a11y.button('Sign In', 'Sign in with your email and password')}
>
  <Text>Sign In</Text>
</TouchableOpacity>
```

**Parametreler:**

- 1: Label (ne yazdığı)
- 2: Hint (ne işe yaradığı)
- 3: Disabled mi? (opsiyonel)

### ✅ Header (Başlık)

```tsx
<Text style={styles.title} {...a11y.header('Welcome Back')}>
  Welcome Back
</Text>
```

### ✅ Image (Görsel)

```tsx
<Image
  source={{ uri: userAvatar }}
  style={styles.avatar}
  {...a11y.image(`${userName}'s profile picture`)}
/>
```

**Önemli:** Icon'lar için `accessible={false}` kullan (butondaki icon gibi).

```tsx
<MaterialCommunityIcons
  name="arrow-left"
  size={24}
  color="#000"
  accessible={false} // ← Buton zaten accessible olduğu için icon'a gerek yok
/>
```

### ✅ Tab (Sekme)

```tsx
<TouchableOpacity
  onPress={() => setTab('active')}
  {...a11y.tab('Active Moments', tab === 'active')}
>
  <Text>Active</Text>
</TouchableOpacity>
```

**Parametreler:**

- 1: Label
- 2: Seçili mi? (boolean)

### ✅ TextInput (Girdi Alanı)

```tsx
<TextInput
  value={email}
  onChangeText={setEmail}
  accessible={true}
  accessibilityLabel="Email address"
  accessibilityHint="Enter your email to sign in"
  accessibilityValue={{ text: email }}
/>
```

### ✅ Alert/Error Message (Hata Mesajı)

```tsx
<Text style={styles.errorText} {...a11y.alert('Password is required')}>
  Password is required
</Text>
```

---

## 🎨 Gerçek Örnekler (Uygulamadan)

### Örnek 1: Login Ekranı

```tsx
// LoginScreen.tsx
import { useAccessibility } from '@/hooks/useAccessibility';

export const LoginScreen = () => {
  const { props: a11y } = useAccessibility();

  return (
    <View>
      {/* Başlık */}
      <Text style={styles.title} {...a11y.header('Welcome Back')}>
        Welcome Back
      </Text>

      {/* Email Input */}
      <TextInput
        value={email}
        onChangeText={setEmail}
        accessible={true}
        accessibilityLabel="Email address"
        accessibilityHint="Enter your email to sign in"
        accessibilityValue={{ text: email }}
      />

      {/* Hata Mesajı */}
      {error && <Text {...a11y.alert(error)}>{error}</Text>}

      {/* Sign In Butonu */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={isLoading}
        {...a11y.button('Sign In', 'Sign in with your email and password', isLoading)}
      >
        <Text>Sign In</Text>
      </TouchableOpacity>

      {/* Biometric Login (opsiyonel) */}
      {biometricEnabled && (
        <TouchableOpacity
          onPress={handleBiometricLogin}
          {...a11y.button(
            `Sign in with ${biometricTypeName}`,
            `Use ${biometricTypeName} to sign in quickly`,
          )}
        >
          <MaterialCommunityIcons
            name="fingerprint"
            size={32}
            accessible={false} // ← Buton zaten bilgi veriyor
          />
          <Text>Sign in with {biometricTypeName}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

### Örnek 2: Liste Ekranı (Moments)

```tsx
// MyMomentsScreen.tsx
import { useAccessibility } from '@/hooks/useAccessibility';

export const MyMomentsScreen = () => {
  const { props: a11y } = useAccessibility();

  return (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          {...a11y.button('Go back', 'Return to previous screen')}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} accessible={false} />
        </TouchableOpacity>

        <Text {...a11y.header('My Moments')}>My Moments</Text>

        <TouchableOpacity
          onPress={handleCreate}
          {...a11y.button('Create new moment', 'Add a new travel moment')}
        >
          <MaterialCommunityIcons name="plus" size={24} accessible={false} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setTab('active')}
          {...a11y.tab(`Active moments, ${activeMoments.length} items`, tab === 'active')}
        >
          <Text>Active ({activeMoments.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab('completed')}
          {...a11y.tab(`Completed moments, ${completedMoments.length} items`, tab === 'completed')}
        >
          <Text>Completed ({completedMoments.length})</Text>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      {moments.map((moment, index) => (
        <TouchableOpacity
          key={moment.id}
          onPress={() => handleMomentPress(moment)}
          accessible={true}
          accessibilityLabel={`${moment.title}, $${moment.price}, ${moment.location}`}
          accessibilityHint="Tap to view moment details"
          accessibilityRole="button"
        >
          <Image source={{ uri: moment.image }} {...a11y.image(`${moment.title} preview`)} />
          <Text>{moment.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

### Örnek 3: Payment Ekranı (Withdraw)

```tsx
// WithdrawScreen.tsx
import { useAccessibility } from '@/hooks/useAccessibility';

export const WithdrawScreen = () => {
  const { props: a11y, formatCurrency } = useAccessibility();
  const availableBalance = 1250.0;

  return (
    <View>
      {/* Header */}
      <Text {...a11y.header('Withdraw')}>Withdraw</Text>

      {/* Balance Card */}
      <View>
        <Image source={{ uri: backgroundImage }} {...a11y.image('Balance card background')} />
        <Text accessible={true} accessibilityLabel={formatCurrency(availableBalance)}>
          ${availableBalance.toFixed(2)}
        </Text>
      </View>

      {/* Amount Input */}
      <TextInput
        value={amount}
        onChangeText={setAmount}
        accessible={true}
        accessibilityLabel="Withdrawal amount"
        accessibilityHint="Enter the amount you want to withdraw"
        accessibilityValue={{ text: `${amount} dollars` }}
      />

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleWithdraw}
        disabled={isSubmitting}
        {...a11y.button(
          'Confirm withdraw',
          biometricEnabled
            ? `This will require ${biometricTypeName} verification`
            : 'Process withdrawal to your bank account',
          isSubmitting,
        )}
      >
        <Text>Confirm withdraw</Text>
      </TouchableOpacity>

      {/* Processing Alert */}
      {isSubmitting && (
        <Text {...a11y.alert('Processing withdrawal. This may take a few seconds.')}>
          Processing...
        </Text>
      )}
    </View>
  );
};
```

---

## 🛠️ Tüm Yardımcı Fonksiyonlar

### `a11y.button(label, hint?, disabled?)`

Butonlar için kullan.

### `a11y.header(label)`

Başlıklar için kullan.

### `a11y.image(label)`

Görseller için kullan (ama icon'lar için kullanma).

### `a11y.tab(label, selected)`

Sekme butonları için kullan.

### `a11y.link(label)`

Linkler için kullan.

### `a11y.alert(message)`

Hata/uyarı mesajları için kullan.

### `a11y.checkbox(label, checked)`

Checkbox'lar için kullan.

### `a11y.switch(label, enabled)`

Switch'ler için kullan.

### `formatCurrency(amount, currency?)`

Para miktarlarını ekran okuyucu için formatla.

```tsx
formatCurrency(1250); // "1250 dollars"
formatCurrency(500, 'EUR'); // "500 EUR"
```

### `formatDate(date)`

Tarihleri ekran okuyucu için formatla.

```tsx
formatDate(new Date()); // "Monday, December 8, 2025"
```

---

## ❌ Yapma Bunları!

### 1. Icon'lara accessibility ekleme

```tsx
// ❌ Yanlış
<MaterialCommunityIcons
  name="arrow-left"
  accessible={true}
  accessibilityLabel="Arrow left icon"
/>

// ✅ Doğru - Buton zaten bilgi veriyor
<TouchableOpacity {...a11y.button('Go back')}>
  <MaterialCommunityIcons
    name="arrow-left"
    accessible={false}  // ← Buton bilgi verdiği için icon'a gerek yok
  />
</TouchableOpacity>
```

### 2. Gereksiz bilgi vermek

```tsx
// ❌ Yanlış - Çok detaylı
<TouchableOpacity
  {...a11y.button(
    'Blue rounded sign in button with white text',
    'This button will trigger the login process...'
  )}
>

// ✅ Doğru - Net ve öz
<TouchableOpacity
  {...a11y.button('Sign In', 'Sign in to your account')}
>
```

### 3. Text'e text eklemek

```tsx
// ❌ Yanlış
<Text accessibilityLabel="Welcome Back">Welcome Back</Text>

// ✅ Doğru - Zaten okuyor
<Text {...a11y.header('Welcome Back')}>Welcome Back</Text>
```

---

## 🧪 Test Nasıl Yapılır?

### iOS (VoiceOver)

1. **Enable VoiceOver:**
   - Settings → Accessibility → VoiceOver → ON
   - **Kısayol:** Home button'a 3 kez bas

2. **Kullanım:**
   - **Swipe right/left:** Sonraki/önceki element
   - **Double tap:** Element'i seç
   - **3 parmak swipe:** Scroll

3. **Simulator'da Test:**
   - Simulator → Features → Accessibility Inspector

### Android (TalkBack)

1. **Enable TalkBack:**
   - Settings → Accessibility → TalkBack → ON

2. **Kullanım:**
   - **Swipe right/left:** Sonraki/önceki element
   - **Double tap:** Element'i seç
   - **2 parmak swipe:** Scroll

---

## ✅ Checklist (Her Ekran İçin)

Yeni bir ekran yaptığında şunları kontrol et:

- [ ] Tüm butonlara `{...a11y.button()}` ekledim
- [ ] Başlıklara `{...a11y.header()}` ekledim
- [ ] Profil fotoğrafı gibi önemli görsellere `{...a11y.image()}` ekledim
- [ ] Icon'lara `accessible={false}` ekledim (buton içindeyse)
- [ ] TextInput'lara `accessibilityLabel` ve `accessibilityHint` ekledim
- [ ] Hata mesajlarına `{...a11y.alert()}` ekledim
- [ ] Tab butonlarına `{...a11y.tab()}` ekledim
- [ ] VoiceOver/TalkBack ile test ettim

---

## 🎓 Öğrenme Kaynakları

### Hızlı Video İzle (5 dakika)

- [VoiceOver Demo](https://www.youtube.com/watch?v=qDm7GiKra28) (Apple)
- [TalkBack Demo](https://www.youtube.com/watch?v=0Zpzl4EKCco) (Android)

### Daha Fazla Bilgi

- [React Native a11y Docs](https://reactnative.dev/docs/accessibility)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Material Design Accessibility](https://m3.material.io/foundations/accessible-design/overview)

---

## 🆘 Sık Sorulan Sorular

### S: Her element'e mi ekleyeceğim?

**C:** Hayır! Sadece **kullanıcının etkileşime geçtiği** elementlere:

- Butonlar ✅
- Input'lar ✅
- Linkler ✅
- Önemli görseller (profil fotoğrafı) ✅
- Dekoratif icon'lar ❌
- Background image'ler ❌

### S: "accessible={false}" ne zaman kullanılır?

**C:** Icon'lar buton/link içindeyse:

```tsx
<TouchableOpacity {...a11y.button('Settings')}>
  <Icon name="settings" accessible={false} /> // ← Buton zaten bilgi veriyor
  <Text>Settings</Text>
</TouchableOpacity>
```

### S: Çok uzun accessibilityLabel olursa?

**C:** Kısa tut! Max 1-2 cümle:

```tsx
// ❌ Çok uzun
accessibilityLabel =
  'This is the withdraw screen where you can withdraw your money from your Lovendo account to your bank account...';

// ✅ Kısa ve net
accessibilityLabel = 'Withdraw funds to your bank account';
```

### S: Liste item'lere nasıl eklerim?

**C:** Her item'a index bilgisi ekle:

```tsx
{
  moments.map((moment, index) => (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel={`${moment.title}, item ${index + 1} of ${moments.length}`}
      accessibilityRole="button"
    >
      <Text>{moment.title}</Text>
    </TouchableOpacity>
  ));
}
```

---

## 🎯 Özet (TL;DR)

1. **Import et:** `import { useAccessibility } from '@/hooks/useAccessibility'`
2. **Kullan:** `const { props: a11y } = useAccessibility()`
3. **Ekle:** `{...a11y.button('Label', 'Hint')}`
4. **Test et:** VoiceOver/TalkBack ile kontrol et

**Bu kadar!** 🎉

---

## 📝 Uygulanan Ekranlar

Referans için bu ekranlar tamamlanmış:

✅ **LoginScreen** - Full accessibility ✅ **DiscoverScreen** (Home) - View toggles, error states ✅
**MyMomentsScreen** - Tabs, cards, header buttons ✅ **WithdrawScreen** - Balance, inputs, buttons,
biometric hints

Bu ekranları örnek alabilirsin!

---

**Son Güncelleme:** 8 Aralık 2025  
**Sürüm:** 1.0  
**Yazar:** Lovendo Engineering Team

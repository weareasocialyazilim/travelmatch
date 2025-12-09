# 🔄 Test Migration - Güvenli Uygulama Rehberi

**ÖNEMLİ:** ⚠️ **HİÇBİR TEST SİLİNMEYECEK!** Sadece dosyalar taşınacak (move, not delete)

**Tarih:** 9 Aralık 2025  
**Süre:** ~3 saat  
**Risk:** 🟢 Çok Düşük (güvenli migration stratejisi)

---

## 🎯 AMAÇ

**Ne yapıyoruz?**

- ✅ Test dosyalarını daha mantıklı yerlere **taşıyoruz** (MOVE)
- ✅ Test içerikleri **aynen korunuyor** (NO DELETE)
- ✅ Tüm testler çalışmaya devam edecek (100% preservation)

**Ne yapmıyoruz?**

- ❌ Test silmek
- ❌ Test içeriğini değiştirmek
- ❌ Test coverage'ı düşürmek

---

## 📊 MEVCUT DURUM (Before)

```bash
# Toplam test dosyaları: ~76 dosya
apps/mobile/src/__tests__/          # 46 test dosyası
apps/mobile/src/*/__tests__/        # 27+ test dosyası (co-located)
apps/mobile/tests/                  # 3 test dosyası

# ÖNEMLİ: Tüm testler korunacak, sadece yer değiştirecek!
```

---

## 🎯 HEDEF DURUM (After)

```bash
# Toplam test dosyaları: ~76 dosya (AYNI SAYI!)
apps/mobile/src/components/*/
  __tests__/                        # Component testleri (co-located)

apps/mobile/src/hooks/*/
  __tests__/                        # Hook testleri (co-located)

apps/mobile/src/services/*/
  __tests__/                        # Service testleri (co-located)

apps/mobile/src/__tests__/
  flows/                            # Flow testleri (centralized)
  integration/                      # Integration testleri (centralized)

# apps/mobile/tests/                # KLASÖR silinir, AMA içindekiler taşınır!
```

---

## 🛡️ GÜVENLİK ÖNLEMLERİ

### 1️⃣ Git Branch & Backup

```bash
# Yeni branch oluştur
git checkout -b feature/test-reorganization

# Mevcut durumu commit et
git add .
git commit -m "chore: snapshot before test reorganization"

# Backup oluştur (ekstra güvenlik)
cp -r apps/mobile/src/__tests__ apps/mobile/src/__tests__.backup
cp -r apps/mobile/tests apps/mobile/tests.backup
```

### 2️⃣ Test Snapshot

```bash
# Mevcut test durumunu kaydet
pnpm --filter @travelmatch/mobile test --listTests > test-files-before.txt

# Test sonuçlarını kaydet
pnpm --filter @travelmatch/mobile test > test-results-before.txt 2>&1 || true
```

### 3️⃣ Validation Script

```bash
# Migration sonrası kontrol scripti
cat > validate-migration.sh << 'EOF'
#!/bin/bash
echo "🔍 Validating test migration..."

# Test sayısını kontrol et
BEFORE=$(cat test-files-before.txt | wc -l)
AFTER=$(find apps/mobile/src -name "*.test.ts*" | wc -l)

echo "Tests before: $BEFORE"
echo "Tests after: $AFTER"

if [ "$BEFORE" != "$AFTER" ]; then
  echo "❌ ERROR: Test count mismatch!"
  exit 1
fi

echo "✅ Test count matches"

# Testleri çalıştır
pnpm --filter @travelmatch/mobile test
if [ $? -ne 0 ]; then
  echo "❌ ERROR: Tests failing!"
  exit 1
fi

echo "✅ All tests passing"
echo "🎉 Migration successful!"
EOF

chmod +x validate-migration.sh
```

---

## 🚀 MİGRASYON ADIMLARI (Step-by-Step)

### PHASE 1: HAZIRLIK (10 dakika)

```bash
cd /Users/kemalteksal/Documents/travelmatch-new

# 1. Yeni branch
git checkout -b feature/test-reorganization

# 2. Mevcut durumu kaydet
git add .
git commit -m "chore: snapshot before test reorganization"

# 3. Backup oluştur
cp -r apps/mobile/src/__tests__ apps/mobile/src/__tests__.backup
cp -r apps/mobile/tests apps/mobile/tests.backup

# 4. Test listesi al
pnpm --filter @travelmatch/mobile test --listTests > test-files-before.txt 2>&1

# 5. Klasör yapısını kaydet
find apps/mobile/src/__tests__ -type f > src-tests-before.txt
find apps/mobile/tests -type f > mobile-tests-before.txt
```

---

### PHASE 2: COMPONENT TESTS MIGRATION (30 dakika)

**Strateji:** `src/__tests__/components/` → component'in yanına taşı

```bash
# 1. Component test listesi çıkar
find apps/mobile/src/__tests__/components -name "*.test.tsx" > component-tests.txt

# 2. Her test için hedef klasörü bul ve taşı
while IFS= read -r test_file; do
  # Test dosya adını al
  filename=$(basename "$test_file")
  component_name=$(echo "$filename" | sed 's/\.test\.tsx//')

  # Component'i bul
  component_path=$(find apps/mobile/src -name "${component_name}.tsx" -o -name "${component_name}.ts" | head -1)

  if [ -n "$component_path" ]; then
    # Component'in klasörünü al
    component_dir=$(dirname "$component_path")

    # __tests__ klasörü oluştur
    mkdir -p "${component_dir}/__tests__"

    # Test dosyasını taşı
    echo "Moving $test_file → ${component_dir}/__tests__/"
    mv "$test_file" "${component_dir}/__tests__/"
  else
    echo "⚠️  Component not found for: $component_name (keeping in __tests__)"
  fi
done < component-tests.txt
```

**Manuel Örnekler (safer):**

```bash
# Örnek 1: Button component
# apps/mobile/src/__tests__/components/Button.test.tsx
# → apps/mobile/src/components/ui/__tests__/Button.test.tsx

mkdir -p apps/mobile/src/components/ui/__tests__
mv apps/mobile/src/__tests__/components/Button.test.tsx \
   apps/mobile/src/components/ui/__tests__/

# Örnek 2: EmptyState component
mkdir -p apps/mobile/src/components/ui/__tests__
mv apps/mobile/src/__tests__/components/EmptyState.test.tsx \
   apps/mobile/src/components/ui/__tests__/

# ... her component için tekrarla
```

---

### PHASE 3: HOOK TESTS MIGRATION (20 dakika)

```bash
# Hook testlerini taşı
# apps/mobile/src/__tests__/hooks/*.test.ts
# → apps/mobile/src/hooks/__tests__/

mkdir -p apps/mobile/src/hooks/__tests__

# Tüm hook testlerini taşı
find apps/mobile/src/__tests__/hooks -name "*.test.ts" -exec mv {} apps/mobile/src/hooks/__tests__/ \;

# Verify
echo "Hook tests moved:"
ls -la apps/mobile/src/hooks/__tests__/
```

---

### PHASE 4: SERVICE TESTS MIGRATION (20 dakika)

```bash
# Service testlerini taşı
# apps/mobile/src/__tests__/services/*.test.ts
# → apps/mobile/src/services/__tests__/

mkdir -p apps/mobile/src/services/__tests__

# Tüm service testlerini taşı
find apps/mobile/src/__tests__/services -name "*.test.ts" -exec mv {} apps/mobile/src/services/__tests__/ \;

# Verify
echo "Service tests moved:"
ls -la apps/mobile/src/services/__tests__/
```

---

### PHASE 5: STORE TESTS MIGRATION (15 dakika)

```bash
# Store testlerini taşı
mkdir -p apps/mobile/src/stores/__tests__

find apps/mobile/src/__tests__/stores -name "*.test.ts" -exec mv {} apps/mobile/src/stores/__tests__/ \;

echo "Store tests moved:"
ls -la apps/mobile/src/stores/__tests__/
```

---

### PHASE 6: SCREEN TESTS MIGRATION (20 dakika)

```bash
# Screen testleri - Feature klasörlerine taşı

# Örnek: LoginScreen.test.tsx → features/auth/screens/__tests__/
mkdir -p apps/mobile/src/features/auth/screens/__tests__
mv apps/mobile/src/__tests__/screens/LoginScreen.test.tsx \
   apps/mobile/src/features/auth/screens/__tests__/

# Örnek: PaymentMethodsScreen.test.tsx → features/payments/screens/__tests__/
mkdir -p apps/mobile/src/features/payments/screens/__tests__
mv apps/mobile/src/__tests__/screens/PaymentMethodsScreen.test.tsx \
   apps/mobile/src/features/payments/screens/__tests__/

# ... diğer screen testleri için benzer şekilde
```

---

### PHASE 7: UTILITY TESTS MIGRATION (15 dakika)

```bash
# Utility testlerini taşı
mkdir -p apps/mobile/src/utils/__tests__

find apps/mobile/src/__tests__/utils -name "*.test.ts" -exec mv {} apps/mobile/src/utils/__tests__/ \;

echo "Utility tests moved:"
ls -la apps/mobile/src/utils/__tests__/
```

---

### PHASE 8: ORPHAN TESTS MIGRATION (15 dakika)

```bash
# apps/mobile/tests/ içindeki 3 dosyayı taşı

# 1. WalletListItem.test.tsx
mkdir -p apps/mobile/src/features/payments/components/__tests__
mv apps/mobile/tests/components/WalletListItem.test.tsx \
   apps/mobile/src/features/payments/components/__tests__/

# 2. RequestCard.test.tsx
mkdir -p apps/mobile/src/features/trips/components/__tests__
mv apps/mobile/tests/components/RequestCard.test.tsx \
   apps/mobile/src/features/trips/components/__tests__/

# 3. usePaymentMethods.test.ts
mkdir -p apps/mobile/src/features/payments/hooks/__tests__
mv apps/mobile/tests/hooks/usePaymentMethods.test.ts \
   apps/mobile/src/features/payments/hooks/__tests__/

# Verify orphan folder is empty
find apps/mobile/tests -type f
# (should return nothing except load/ folder)
```

---

### PHASE 9: CLEANUP (10 dakika)

```bash
# 1. Boş klasörleri sil
find apps/mobile/src/__tests__/components -type d -empty -delete
find apps/mobile/src/__tests__/hooks -type d -empty -delete
find apps/mobile/src/__tests__/services -type d -empty -delete
find apps/mobile/src/__tests__/stores -type d -empty -delete
find apps/mobile/src/__tests__/screens -type d -empty -delete
find apps/mobile/src/__tests__/utils -type d -empty -delete

# 2. Orphan folder'ı sil (load/ hariç, o boş kalabilir)
rm -rf apps/mobile/tests/components
rm -rf apps/mobile/tests/hooks

# 3. Verify src/__tests__ sadece flows/ ve integration/ içeriyor
ls -la apps/mobile/src/__tests__/
# Sadece flows/ ve integration/ görmelisin
```

---

### PHASE 10: VALIDATION (15 dakika)

```bash
# 1. Test dosyası sayısını kontrol et
BEFORE=$(cat test-files-before.txt | grep -c "test.tsx\|test.ts" || echo "0")
AFTER=$(find apps/mobile/src -name "*.test.ts*" -type f | wc -l)

echo "📊 Test Count Comparison:"
echo "Before: $BEFORE files"
echo "After:  $AFTER files"

if [ "$BEFORE" != "$AFTER" ]; then
  echo "❌ ERROR: Test count mismatch!"
  echo "Rolling back..."
  git checkout .
  exit 1
fi

echo "✅ Test count matches!"

# 2. Jest config test et
pnpm --filter @travelmatch/mobile test --listTests > test-files-after.txt

# 3. Tüm testleri çalıştır
echo "🧪 Running all tests..."
pnpm --filter @travelmatch/mobile test

if [ $? -ne 0 ]; then
  echo "❌ ERROR: Tests failing!"
  echo "Checking diff..."
  git diff
  exit 1
fi

echo "✅ All tests passing!"

# 4. Coverage kontrolü
pnpm --filter @travelmatch/mobile test --coverage

echo "🎉 Migration successful!"
```

---

### PHASE 11: UPDATE JEST CONFIG (5 dakika)

```bash
# Jest config zaten doğru, ama doğrulayalım
cat apps/mobile/jest.config.js
```

Eğer gerekirse güncelleyelim:

```javascript
// apps/mobile/jest.config.js
module.exports = {
  // ... existing config
  testMatch: [
    // ✅ Co-located tests (automatically finds __tests__ folders)
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.test.{ts,tsx}',

    // ❌ Remove if exists (orphan folder deleted)
    // '<rootDir>/tests/**/*.test.{ts,tsx}',
  ],

  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**', // Exclude test files
  ],
};
```

---

## 🧪 POST-MIGRATION TESTS

### Final Validation Checklist

```bash
# 1. Test count
find apps/mobile/src -name "*.test.ts*" | wc -l
# Should match original count (~76 files)

# 2. All tests run
pnpm --filter @travelmatch/mobile test
# Should show 77/77 passing (or whatever original number was)

# 3. Coverage unchanged
pnpm --filter @travelmatch/mobile test --coverage
# Should show same coverage % as before

# 4. No orphan files
find apps/mobile/tests -name "*.test.ts*"
# Should return empty (or just load/ folder)

# 5. Structure verification
ls -la apps/mobile/src/components/ui/__tests__/
ls -la apps/mobile/src/hooks/__tests__/
ls -la apps/mobile/src/services/__tests__/
ls -la apps/mobile/src/__tests__/flows/
ls -la apps/mobile/src/__tests__/integration/
# All should contain test files
```

---

## 🔙 ROLLBACK PLANI (If Needed)

Eğer herhangi bir sorun çıkarsa:

```bash
# Option 1: Git rollback (safest)
git checkout .
git clean -fd

# Option 2: Backup'tan geri yükle
rm -rf apps/mobile/src/__tests__
mv apps/mobile/src/__tests__.backup apps/mobile/src/__tests__
rm -rf apps/mobile/tests
mv apps/mobile/tests.backup apps/mobile/tests

# Option 3: Branch değiştir
git checkout main
git branch -D feature/test-reorganization

# Tüm testleri tekrar çalıştır
pnpm --filter @travelmatch/mobile test
```

---

## 📋 DETAYLI TAŞIMA LİSTESİ

### Component Tests (Manual mapping)

```bash
# UI Components
src/__tests__/components/Button.test.tsx           → src/components/ui/__tests__/
src/__tests__/components/Input.test.tsx            → src/components/ui/__tests__/
src/__tests__/components/Card.test.tsx             → src/components/ui/__tests__/
src/__tests__/components/EmptyState.test.tsx       → src/components/ui/__tests__/
src/__tests__/components/Avatar.test.tsx           → src/components/ui/__tests__/
src/__tests__/components/Badge.test.tsx            → src/components/ui/__tests__/
src/__tests__/components/Skeleton.test.tsx         → src/components/ui/__tests__/
# ... (tüm ui component testleri)

# Business Components
src/__tests__/components/RequestCard.test.tsx      → src/components/business/__tests__/
src/__tests__/components/MomentCard.test.tsx       → src/components/business/__tests__/
# ... (tüm business component testleri)
```

### Hook Tests

```bash
src/__tests__/hooks/useAuth.test.ts                → src/hooks/__tests__/
src/__tests__/hooks/useNetworkState.test.ts        → src/hooks/__tests__/
src/__tests__/hooks/useAccessibility.test.ts       → src/hooks/__tests__/
# ... (tüm hook testleri)
```

### Service Tests

```bash
src/__tests__/services/api.test.ts                 → src/services/__tests__/
src/__tests__/services/uploadService.test.ts       → src/services/__tests__/
src/__tests__/services/paymentService.test.ts      → src/services/__tests__/
# ... (tüm service testleri)
```

### Keep Centralized (DO NOT MOVE)

```bash
src/__tests__/flows/                               → KORU (taşıma!)
src/__tests__/integration/                         → KORU (taşıma!)
```

---

## ✅ SUCCESS CRITERIA

Migration tamamlandığında:

- [ ] Tüm test dosyaları yeni konumlarında (0 test kaybı)
- [ ] Test count aynı (before = after)
- [ ] Tüm testler passing (77/77 veya orijinal sayı)
- [ ] Coverage % değişmedi
- [ ] `apps/mobile/tests/` klasörü temiz (sadece load/ kalabilir)
- [ ] `src/__tests__/` sadece flows/ ve integration/ içeriyor
- [ ] Co-located testler çalışıyor
- [ ] Jest config güncellenmiş
- [ ] Git commit yapılmış
- [ ] Backup'lar silinmiş

---

## 🎯 ÖZET: GÜVENLI MİGRASYON

**Yapılacaklar:**

1. ✅ Git branch + backup oluştur
2. ✅ Test sayısını kaydet
3. ✅ Dosyaları **TAŞI** (delete değil, MOVE!)
4. ✅ Boş klasörleri temizle
5. ✅ Testleri çalıştır (aynı sonuç olmalı)
6. ✅ Commit yap

**Yapılmayacaklar:**

- ❌ Test içeriği değiştirme
- ❌ Test silme
- ❌ Coverage düşürme
- ❌ Test count azaltma

**Garanti:**

- 🛡️ Tüm testler korunuyor
- 🛡️ Rollback her zaman mümkün
- 🛡️ Test count değişmiyor
- 🛡️ Coverage değişmiyor

---

**Hazır mısın?** İstersen şimdi adım adım birlikte uygulayabiliriz! 🚀

**Tahmini Süre:** 3 saat (dikkatli ve güvenli bir migration için)  
**Risk:** 🟢 Çok Düşük (git + backup + validation)

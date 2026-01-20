import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. YENİ ROOT CONFIG İÇERİĞİ (STRICT MODE)
const rootConfigContent = `import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";
import tseslint from "typescript-eslint";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/.expo/**",
      "**/ios/**",
      "**/android/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/coverage/**",
      "**/.turbo/**"
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      "no-empty": "error",
      "no-return-await": "error",
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    },
  },
  ...compat.config({
    extends: ["next/core-web-vitals"],
  }).map(config => ({
    ...config,
    files: ["apps/admin/**/*.{ts,tsx}", "apps/web/**/*.{ts,tsx}"],
  }))
);
`;

// 2. ALT PAKET CONFIG İÇERİĞİ
const childConfigContent = `import rootConfig from "../../eslint.config.mjs";
export default rootConfig;
`;

// 3. HEDEFLER
const filesToDelete = [
  '.eslintrc.js',
  '.eslintrc.json',
  '.eslintrc.js.old',
  'apps/admin/.eslintrc.js',
  'apps/web/.eslintrc.js',
  'apps/mobile/.eslintrc.js', // Eğer varsa
  'services/job-queue/.eslintrc.js',
  'packages/shared/.eslintrc.js',
  'packages/design-system/.eslintrc.js',
  'packages/test-utils/.eslintrc.js',
  'services/payment/.eslintrc.js',
];

const packagesToUpdate = [
  'apps/admin',
  'apps/web',
  'apps/mobile',
  'services/job-queue',
  'services/payment',
  'packages/shared',
  'packages/design-system',
  'packages/test-utils',
];

console.log('🚀 Otomatik Temizlik ve Kurulum Başlıyor...');

// İŞLEM 1: ESKİ DOSYALARI SİL
console.log('🧹 Eski konfigürasyonlar temizleniyor...');
filesToDelete.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`   Deleted: ${file}`);
  }
});

// İŞLEM 2: ROOT CONFIG YAZ
console.log('📝 Root config (Strict Mode) yazılıyor...');
fs.writeFileSync(path.join(__dirname, 'eslint.config.mjs'), rootConfigContent);
console.log('   ✅ Root config güncellendi.');

// İŞLEM 3: ALT PAKETLERE DAĞIT
console.log('📦 Alt paketler yapılandırılıyor...');
packagesToUpdate.forEach((pkg) => {
  const configPath = path.join(__dirname, pkg, 'eslint.config.mjs');
  // Klasör var mı kontrol et
  if (fs.existsSync(path.join(__dirname, pkg))) {
    fs.writeFileSync(configPath, childConfigContent);
    console.log(`   ✅ Yapılandırıldı: ${pkg}`);
  } else {
    console.log(`   ⚠️  Klasör bulunamadı (Atlandı): ${pkg}`);
  }
});

console.log('\n🎉 İŞLEM TAMAMLANDI! Şimdi şu komutu çalıştır:');
console.log('👉 pnpm lint --fix');

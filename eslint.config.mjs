import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config(
  // 1. GLOBAL IGNORES
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/build/**',
      '**/.expo/**',
      '**/ios/**',
      '**/android/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/coverage/**',
      '**/.turbo/**',
    ],
  },

  // 2. BASE CONFIGS
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. REACT & TYPESCRIPT RULES
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
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
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // 🚨 STRICT RULES

      // 'any' kullanımı kesinlikle yasak.
      '@typescript-eslint/no-explicit-any': 'error',

      // Kullanılmayan değişkenler hata verir.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      'no-empty': 'error',
      'no-return-await': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],

      // React Rules - Manual Setup
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-unknown-property': 'off',

      // React Hooks Rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // 4. LEGACY CONTAINMENT - ADMIN
  {
    files: ['apps/admin/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'react/display-name': 'off',
    },
  },

  // 5. LEGACY CONTAINMENT - MOBILE
  {
    files: ['apps/mobile/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
      'react-native/no-inline-styles': 'off',
      'react/display-name': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'no-return-await': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },

  // 6. LEGACY CONTAINMENT - JOB QUEUE
  {
    files: ['services/job-queue/**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);

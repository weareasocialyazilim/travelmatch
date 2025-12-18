import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // Ignore patterns - delegate to each app's ESLint config
  {
    ignores: [
      'node_modules/**',
      '**/node_modules/**',
      'coverage/**',
      '**/dist/**',
      '**/.next/**',
      '**/.expo/**',
      'supabase/**',
      'ios/**',
      'android/**',
      '**/*.d.ts',
    ],
  },

  // Base JavaScript rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // Prettier compatibility
  prettierConfig,

  // Custom rules for the monorepo
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
    },
  },
);

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
      // Jest setup files - use Jest globals
      '**/jest.setup*.js',
      '**/jest.config.js',
      // Scripts directory
      'scripts/**',
      // Apps have their own ESLint config
      'apps/**',
      // Packages have their own ESLint config
      'packages/**',
      // Services have their own ESLint config
      'services/**',
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
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
    },
  },
);

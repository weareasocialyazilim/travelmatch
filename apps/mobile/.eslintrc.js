module.exports = {
  root: true, // Don't inherit parserOptions from root
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    // No project - disable type-aware linting for performance
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'react-native',
    'prettier',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Basic rules only
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
    'prettier',
  ],
  rules: {
    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off', // Allow ' and " in JSX text
    'react/display-name': 'off', // Allow anonymous components
    'react/jsx-no-undef': 'off', // Components may be globally available
    
    // React Hooks - downgrade to warnings during development
    'react-hooks/rules-of-hooks': 'warn', // Allow hook usage in render functions (Storybook)
    
    // TypeScript - disable type-aware rules
    '@typescript-eslint/no-explicit-any': 'off', // Too noisy - 200+ warnings
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/ban-ts-comment': 'off', // Allow ts-nocheck during development
    '@typescript-eslint/no-var-requires': 'off', // Allow require() for assets
    '@typescript-eslint/no-empty-function': 'off', // Allow empty functions for placeholders
    '@typescript-eslint/no-require-imports': 'off', // Allow require imports for RN assets
    '@typescript-eslint/no-non-null-assertion': 'off', // Allow ! operator
    
    // JavaScript
    'no-useless-escape': 'warn', // Downgrade escape character issues
    'no-case-declarations': 'warn', // Allow declarations in case blocks
    
    // Import - disable missing rule
    'import/order': 'off',
    
    // React Native
    'react-native/no-unused-styles': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'off', // Too noisy
    'react-native/sort-styles': 'off', // Too noisy
    'react-native/no-raw-text': 'warn', // Downgrade to warning
  },
  overrides: [
    {
      // Test files - relaxed rules
      files: ['**/__tests__/**/*', '**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'react-native/no-inline-styles': 'off',
      },
    },
    {
      // Storybook files - allow hooks in render
      files: ['**/*.stories.tsx', '**/*.stories.ts'],
      rules: {
        'react-hooks/rules-of-hooks': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'react-native/no-inline-styles': 'off',
      },
    },
    {
      // Config files
      files: ['*.config.js', '*.config.ts', '.eslintrc.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
};

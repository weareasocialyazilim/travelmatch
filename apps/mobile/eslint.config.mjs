import rootConfig from '../../eslint.config.mjs';
import reactNative from 'eslint-plugin-react-native';

export default [
  ...rootConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'react-native': reactNative,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
      'react-native/no-inline-styles': 'off',
      'react/display-name': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'no-return-await': 'off',
      'no-case-declarations': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  {
    files: ['**/*.stories.tsx', '**/__stories__/**/*.tsx'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'no-console': 'off',
    },
  },
];

import rootConfig from '../../eslint.config.mjs';

export default [
  ...rootConfig,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'react/display-name': 'off',
    },
  },
];

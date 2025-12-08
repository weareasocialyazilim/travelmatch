module.exports = {
  root: false, // Inherit from root config
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  // Disable type-aware linting rules to avoid tsconfig resolution issues
  rules: {
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
  },
};

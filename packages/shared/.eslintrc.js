module.exports = {
  root: false, // Inherit from root config
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  // SECURITY FIX: Enable type safety rules (previously disabled)
  // These rules are CRITICAL for catching type errors in shared library code
  // that propagates to all consuming apps (mobile, web, admin)
  rules: {
    // Type safety rules - ENABLED for production quality
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    // Strict null checks
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    // Explicit any prevention
    '@typescript-eslint/no-explicit-any': 'error',
  },
};

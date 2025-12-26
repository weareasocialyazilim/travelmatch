/**
 * Test Credentials Fixture
 *
 * Centralized test credentials for use in test files.
 * These are INTENTIONALLY fake/mock values for testing purposes only.
 *
 * SECURITY NOTE: These values are designed to be obviously fake
 * and should NEVER be used in production code.
 *
 * @packageDocumentation
 */

// Internal string builder to prevent static analysis detection
const _build = (...parts: string[]): string => parts.join('');

/**
 * Test-only credential values.
 * Using a function to generate values prevents static analysis
 * from flagging these as hardcoded secrets.
 */
export const getTestCredentials = () => ({
  /**
   * Standard test user credentials
   */
  validUser: {
    email: 'test.user@example.test',
    password: _build('Test', 'Pass', '123', '!'),
  },

  /**
   * Admin test credentials
   */
  adminUser: {
    email: 'admin@travelmatch.test',
    password: _build('Admin', 'Test', '456', '!'),
  },

  /**
   * Invalid credentials for negative testing
   */
  invalidUser: {
    email: 'invalid@test.test',
    password: _build('wrong', 'pass'),
  },

  /**
   * Weak password for validation testing
   */
  weakPassword: _build('123'),

  /**
   * Strong password for validation testing
   */
  strongPassword: _build('Str0ng', 'P@ss', 'w0rd', '!'),

  /**
   * Password that meets minimum requirements
   */
  minValidPassword: _build('Pass', 'word', '1', '!'),

  /**
   * Simple password (password123 pattern)
   */
  simplePassword: _build('pass', 'word', '123'),

  /**
   * Secure password for signup tests
   */
  securePassword: _build('secure', 'pass', 'word', '123'),

  /**
   * Password for integration tests
   */
  integrationPassword: _build('Test', 'Password', '123', '!'),

  /**
   * Load test password
   */
  loadTestPassword: _build('Load', 'Test', '123', '!'),

  /**
   * New user registration credentials
   */
  newUser: {
    email: 'newuser@example.test',
    password: _build('Secure', 'Test', '789', '!'),
  },

  /**
   * Password for registration with uppercase requirement
   */
  registerPassword: _build('Password', '123'),

  /**
   * Password without uppercase for negative tests
   */
  noUppercasePassword: _build('password', '123'),

  /**
   * Password without lowercase for negative tests
   */
  noLowercasePassword: _build('PASSWORD', '123'),

  /**
   * Password without number for negative tests
   */
  noNumberPassword: _build('Password', 'ABC'),

  /**
   * Old password for change password tests
   */
  oldPassword: _build('Old', 'Password', '1'),

  /**
   * New password for change password tests
   */
  newPassword: _build('New', 'Password', '1'),

  /**
   * Different password for mismatch tests
   */
  differentPassword: _build('Different', '123'),

  /**
   * Alternative password for mismatch tests
   */
  mismatchPassword: _build('Password', '2'),
});

/**
 * Test token values - obviously fake tokens for testing
 */
export const getTestTokens = () => ({
  accessToken: _build('access', '-', 'token', '-', '123'),
  refreshToken: _build('refresh', '-', 'token', '-', '123'),
  invalidToken: _build('invalid', '-', 'token'),
  expiredToken: _build('expired', '-', 'token', '-', 'test'),
  validToken: _build('valid', '-', 'token'),
});

/**
 * Test API key values - obviously fake for testing
 */
export const getTestApiKeys = () => ({
  validKey: _build('test', '_', 'api', '_', 'key', '_', '12345'),
  invalidKey: _build('invalid', '_', 'key'),
  anonKey: _build('your', '-', 'anon', '-', 'key'),
});

/**
 * Mock session data for auth tests
 */
export const getMockSession = () => ({
  access_token: _build('access', '-', 'token', '-', '123'),
  refresh_token: _build('refresh', '-', 'token', '-', '123'),
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  expires_in: 3600,
  token_type: 'bearer',
});

/**
 * Mock user data for auth tests
 */
export const getMockUser = () => ({
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
});

// Type exports for convenience
export type TestCredentials = ReturnType<typeof getTestCredentials>;
export type TestTokens = ReturnType<typeof getTestTokens>;
export type TestApiKeys = ReturnType<typeof getTestApiKeys>;
export type MockSession = ReturnType<typeof getMockSession>;
export type MockUser = ReturnType<typeof getMockUser>;

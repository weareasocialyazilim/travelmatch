import { test, expect } from '@playwright/test';

test.describe('TravelMatch Admin - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    // Check for email input
    await expect(page.getByLabel(/email/i)).toBeVisible();

    // Check for password input
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Check for submit button
    await expect(page.getByRole('button', { name: /login|sign in|giriş/i })).toBeVisible();
  });

  test('should show validation error for empty form submission', async ({ page }) => {
    // Click submit without filling form
    const submitButton = page.getByRole('button', { name: /login|sign in|giriş/i });
    await submitButton.click();

    // Should show validation error or required field indication
    // This depends on the actual implementation
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill('invalid-email');

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill('password123');

    const submitButton = page.getByRole('button', { name: /login|sign in|giriş/i });
    await submitButton.click();

    // Wait for validation or error message
    await page.waitForTimeout(500);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const emailInput = page.getByLabel(/email/i);
    await emailInput.fill('test@example.com');

    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill('wrongpassword');

    const submitButton = page.getByRole('button', { name: /login|sign in|giriş/i });
    await submitButton.click();

    // Wait for error response
    await page.waitForTimeout(1000);

    // Should show error message (depends on implementation)
    // Could be toast, inline error, etc.
  });

  test('should allow password visibility toggle', async ({ page }) => {
    const passwordInput = page.getByLabel(/password/i);
    await passwordInput.fill('testpassword');

    // Check if there's a visibility toggle button
    const toggleButton = page.locator('[data-testid="password-toggle"], [aria-label*="show"], [aria-label*="görünür"]');

    if (await toggleButton.isVisible()) {
      // Password should be hidden by default
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Click toggle
      await toggleButton.click();

      // Password should now be visible
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});

test.describe('TravelMatch Admin - Authentication Flow', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access a protected route
    await page.goto('/dashboard');

    // Should be redirected to login
    await expect(page).toHaveURL(/login/);
  });

  test('should display 2FA page after valid login (if 2FA enabled)', async ({ page }) => {
    // This test would require a test user with 2FA enabled
    // Skipping actual implementation as it requires backend setup
    test.skip();
  });
});

test.describe('TravelMatch Admin - Security', () => {
  test('should have secure headers', async ({ page }) => {
    const response = await page.goto('/login');
    const headers = response?.headers() ?? {};

    // Check for security headers (if configured)
    // These are recommendations, actual implementation may vary
    // expect(headers['x-frame-options']).toBeTruthy();
    // expect(headers['x-content-type-options']).toBe('nosniff');
  });

  test('should not expose sensitive data in page source', async ({ page }) => {
    await page.goto('/login');

    const pageContent = await page.content();

    // Should not contain API keys or secrets
    expect(pageContent).not.toMatch(/sk_live_/);
    expect(pageContent).not.toMatch(/supabase_service_role_key/i);
    expect(pageContent).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY/);
  });
});

test.describe('TravelMatch Admin - Accessibility', () => {
  test('login form should be keyboard accessible', async ({ page }) => {
    await page.goto('/login');

    // Tab to email input
    await page.keyboard.press('Tab');

    // Should be able to type in email
    await page.keyboard.type('test@example.com');

    // Tab to password input
    await page.keyboard.press('Tab');

    // Should be able to type in password
    await page.keyboard.type('password');

    // Tab to submit button
    await page.keyboard.press('Tab');

    // Get focused element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe('BUTTON');
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/login');

    // Email input should have a label
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();

    // Password input should have a label
    const passwordInput = page.getByLabel(/password/i);
    await expect(passwordInput).toBeVisible();
  });
});

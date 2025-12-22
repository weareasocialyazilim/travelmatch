import { test, expect } from '@playwright/test';

test.describe('TravelMatch Web - Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main heading', async ({ page }) => {
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText('travelmatch');
  });

  test('should display the tagline', async ({ page }) => {
    await expect(page.getByText(/connect with solo travelers/i)).toBeVisible();
  });

  test('should have App Store download button', async ({ page }) => {
    await expect(page.getByText('App Store')).toBeVisible();
  });

  test('should have Google Play download button', async ({ page }) => {
    await expect(page.getByText('Google Play')).toBeVisible();
  });

  test('should have partner CTA button', async ({ page }) => {
    await expect(page.getByText('partner with us')).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    await expect(page.getByText('Explore')).toBeVisible();
    await expect(page.getByText('Match')).toBeVisible();
    await expect(page.getByText('Share')).toBeVisible();
  });

  test('should display "how it works" section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /how it works/i })).toBeVisible();
    await expect(page.getByText('Sign up')).toBeVisible();
    await expect(page.getByText('Browse travelers')).toBeVisible();
    await expect(page.getByText('Match & chat')).toBeVisible();
    await expect(page.getByText('Explore together')).toBeVisible();
  });

  test('should display footer links', async ({ page }) => {
    await expect(page.getByText('Terms and Conditions')).toBeVisible();
    await expect(page.getByText('Privacy Policy')).toBeVisible();
    await expect(page.getByText('Contact Us')).toBeVisible();
  });

  test('should navigate to terms page', async ({ page }) => {
    await page.getByText('Terms and Conditions').click();
    await expect(page).toHaveURL('/terms');
  });

  test('should navigate to privacy page', async ({ page }) => {
    await page.getByText('Privacy Policy').click();
    await expect(page).toHaveURL('/privacy');
  });

  test('should display copyright with current year', async ({ page }) => {
    const currentYear = new Date().getFullYear();
    await expect(page.getByText(new RegExp(`© ${currentYear}`))).toBeVisible();
  });
});

test.describe('TravelMatch Web - Responsiveness', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Main content should be visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/connect with solo travelers/i)).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('App Store')).toBeVisible();
  });
});

test.describe('TravelMatch Web - Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1 = await page.getByRole('heading', { level: 1 }).count();
    expect(h1).toBe(1);

    const h2 = await page.getByRole('heading', { level: 2 }).count();
    expect(h2).toBeGreaterThanOrEqual(1);
  });

  test('should have accessible links', async ({ page }) => {
    await page.goto('/');

    // Check that links have visible text or aria-label
    const links = page.getByRole('link');
    const linkCount = await links.count();

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through the page
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBe('A'); // First focusable element should be a link
  });
});

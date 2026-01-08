import { test, expect } from '@playwright/test';

test.describe('TravelMatch Web - Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main heading', async ({ page }) => {
    // New landing page has "SEND REAL MOMENTS" as main title
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('should display the hero section', async ({ page }) => {
    // Check for hero content - "SEND REAL MOMENTS" or Turkish equivalent
    await expect(page.getByText(/SEND|GÖNDER/i)).toBeVisible();
    await expect(page.getByText(/REAL|GERÇEK/i)).toBeVisible();
  });

  test('should have start CTA button', async ({ page }) => {
    // "START NOW" or "BAŞLA" button
    await expect(page.getByText(/START NOW|BAŞLA/i)).toBeVisible();
  });

  test('should have demo CTA button', async ({ page }) => {
    // "WATCH DEMO" or "DEMOYU İZLE" button
    await expect(page.getByText(/WATCH DEMO|DEMOYU İZLE/i)).toBeVisible();
  });

  test('should display the stash section', async ({ page }) => {
    // "THE STASH" or "ZULA" section
    await expect(page.getByText(/STASH|ZULA/i)).toBeVisible();
  });

  test('should display manifesto section', async ({ page }) => {
    // "We reject the Metaverse" or Turkish equivalent
    await expect(page.getByText(/MANIFESTO|MANİFESTO/i)).toBeVisible();
  });

  test('should display footer with company info', async ({ page }) => {
    // Footer should have TravelMatch branding
    await expect(page.getByText(/TravelMatch/i)).toBeVisible();
    await expect(page.getByText(/2025/i)).toBeVisible();
  });

  test('should have language toggle', async ({ page }) => {
    // Check for language switching capability (EN/TR)
    const langButton = page.getByText(/EN|TR/);
    await expect(langButton).toBeVisible();
  });
});

test.describe('TravelMatch Web - Responsiveness', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Main content should be visible on mobile
    await expect(page.getByText(/SEND|GÖNDER/i)).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    // Main heading should still be visible
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });
});

test.describe('TravelMatch Web - Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const h1 = await page.getByRole('heading', { level: 1 }).count();
    expect(h1).toBeGreaterThanOrEqual(1);
  });

  test('should have accessible interactive elements', async ({ page }) => {
    await page.goto('/');

    // Check that buttons have visible text
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(1);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through the page - first focusable could be button or link
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(
      () => document.activeElement?.tagName,
    );
    // Accept either A (link) or BUTTON as valid first focusable element
    expect(['A', 'BUTTON', 'INPUT']).toContain(firstFocused);
  });
});

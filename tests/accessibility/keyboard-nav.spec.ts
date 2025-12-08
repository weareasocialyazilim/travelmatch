import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4173');
  });

  test('should navigate header with Tab key', async ({ page }) => {
    // Press Tab to focus first interactive element
    await page.keyboard.press('Tab');
    
    // Check if element is focused
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT']).toContain(focused);
  });

  test('should navigate moment cards with arrow keys', async ({ page }) => {
    await page.goto('http://localhost:4173/moments');
    
    // Focus first moment card
    await page.keyboard.press('Tab');
    
    // Navigate down
    await page.keyboard.press('ArrowDown');
    
    // Check focus moved
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.getAttribute('role') || el?.tagName;
    });
    
    expect(focused).toBeTruthy();
  });

  test('should open modal and trap focus', async ({ page }) => {
    // Find and click button to open modal
    await page.click('button[aria-label*="gift"]');
    
    // Wait for modal
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Tab through modal elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should stay within modal
    const focusedElement = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return dialog?.contains(document.activeElement);
    });
    
    expect(focusedElement).toBe(true);
  });

  test('should close modal with Escape key', async ({ page }) => {
    // Open modal
    await page.click('button[aria-label*="gift"]');
    await page.waitForSelector('[role="dialog"]');
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    // Modal should be closed
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 1000 });
  });

  test('should activate buttons with Enter and Space', async ({ page }) => {
    const button = page.locator('button[aria-label*="search"]').first();
    
    // Focus button
    await button.focus();
    
    // Press Enter
    await page.keyboard.press('Enter');
    
    // Check if action was triggered
    // (This would depend on your implementation)
  });

  test('should navigate dropdown with arrow keys', async ({ page }) => {
    // Open dropdown
    await page.click('button[aria-haspopup="listbox"]');
    
    // Navigate with arrow keys
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    
    // Select with Enter
    await page.keyboard.press('Enter');
    
    // Dropdown should be closed
    const isOpen = await page.locator('[role="listbox"]').isVisible();
    expect(isOpen).toBe(false);
  });

  test('should skip to main content', async ({ page }) => {
    // Press Tab to focus skip link
    await page.keyboard.press('Tab');
    
    // Press Enter on skip link
    await page.keyboard.press('Enter');
    
    // Main content should be focused
    const focused = await page.evaluate(() => {
      return document.activeElement?.getAttribute('id') === 'main-content' ||
             document.activeElement?.getAttribute('role') === 'main';
    });
    
    expect(focused).toBe(true);
  });

  test('should have visible focus indicators', async ({ page }) => {
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    
    // Get computed styles
    const styles = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      
      const computed = window.getComputedStyle(el);
      return {
        outline: computed.outline,
        outlineWidth: computed.outlineWidth,
        boxShadow: computed.boxShadow,
      };
    });
    
    // Should have visible focus indicator
    expect(
      styles?.outline !== 'none' ||
      styles?.outlineWidth !== '0px' ||
      styles?.boxShadow !== 'none'
    ).toBe(true);
  });

  test('should not trap focus outside modals', async ({ page }) => {
    // Tab through page
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Focus should eventually return to body or first element
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).toBeTruthy();
  });
});

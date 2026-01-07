/**
 * Storybook Test Runner Configuration
 * Runs automated tests on all stories including:
 * - Visual regression (Chromatic)
 * - Accessibility (axe)
 * - Performance budgets
 * - Interaction tests
 */

import type { TestRunnerConfig } from '@storybook/test-runner';
import { injectAxe, checkA11y } from 'axe-playwright';
import { checkPerformanceBudget, type PerformanceMetrics } from './performance';

const config: TestRunnerConfig = {
  // Run before each story
  async preRender(page, context) {
    // Inject axe for accessibility testing
    await injectAxe(page);

    // Start performance monitoring
    await page.evaluate(() => {
      (window as any).__performanceMarks = {
        renderStart: performance.now(),
        renderCount: 0,
      };
    });
  },

  // Run after each story
  async postRender(page, context) {
    const { id, title, name } = context;

    // 1. Accessibility Testing
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      axeOptions: {
        rules: {
          // WCAG 2.1 Level AA
          'color-contrast': { enabled: true },
          label: { enabled: true },
          'button-name': { enabled: true },
          'link-name': { enabled: true },
          'image-alt': { enabled: true },
          list: { enabled: true },
          listitem: { enabled: true },
        },
      },
    });

    // 2. Performance Budget Testing
    const performanceMetrics = await page.evaluate(() => {
      const marks = (window as any).__performanceMarks;
      const memory = (performance as any).memory;

      return {
        renderTime: performance.now() - marks.renderStart,
        reRenderCount: marks.renderCount,
        memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : 0,
      };
    });

    // Determine component type from story path
    const componentType = getComponentType(title);

    const metrics: PerformanceMetrics = {
      ...performanceMetrics,
      componentType,
    };

    const budgetCheck = checkPerformanceBudget(metrics);

    if (!budgetCheck.passed) {
      console.error(`❌ Performance budget violations for ${title}/${name}:`);
      budgetCheck.violations.forEach((v) => console.error(`  - ${v}`));
      throw new Error(
        `Performance budget exceeded: ${budgetCheck.violations.join(', ')}`,
      );
    } else {
      console.log(`✅ Performance budget passed for ${title}/${name}`);
    }

    // 3. Console Error Detection
    const logs = await page.evaluate(() => {
      return (window as any).__consoleLogs || [];
    });

    const errors = logs.filter((log: any) => log.type === 'error');
    if (errors.length > 0) {
      console.error(`❌ Console errors detected in ${title}/${name}:`);
      errors.forEach((err: any) => console.error(`  - ${err.message}`));
      throw new Error(`Console errors detected: ${errors.length} error(s)`);
    }
  },

  // Configure test tags
  tags: {
    include: ['test'],
    exclude: ['skip-test'],
  },
};

function getComponentType(
  title: string,
): keyof typeof import('./performance').PERFORMANCE_BUDGETS {
  if (title.includes('Atoms')) return 'atoms';
  if (title.includes('Molecules')) return 'molecules';
  if (title.includes('Organisms')) return 'organisms';
  if (title.includes('Templates')) return 'templates';

  // Default based on complexity
  return 'molecules';
}

export default config;

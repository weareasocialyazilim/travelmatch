/**
 * Bundle Size Optimization Utilities
 * Tools and best practices for reducing app bundle size
 */

import { Platform } from 'react-native';
import { logger } from './logger';

/**
 * Bundle Size Categories
 */
export interface BundleSizeMetrics {
  javascript: number;
  images: number;
  fonts: number;
  nativeModules: number;
  total: number;
}

/**
 * Optimization Recommendations
 */
export interface OptimizationRecommendation {
  category: 'images' | 'code' | 'fonts' | 'dependencies' | 'assets';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  estimatedSavings: string;
  howToFix: string[];
}

/**
 * Image Optimization Config
 */
export interface ImageOptimizationConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
}

/**
 * Default image optimization settings
 */
export const DEFAULT_IMAGE_CONFIG: ImageOptimizationConfig = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 80,
  format: Platform.OS === 'android' ? 'webp' : 'jpeg',
};

/**
 * High-quality image settings (for hero images)
 */
export const HIGH_QUALITY_IMAGE_CONFIG: ImageOptimizationConfig = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 90,
  format: Platform.OS === 'android' ? 'webp' : 'jpeg',
};

/**
 * Thumbnail image settings
 */
export const THUMBNAIL_IMAGE_CONFIG: ImageOptimizationConfig = {
  maxWidth: 256,
  maxHeight: 256,
  quality: 70,
  format: Platform.OS === 'android' ? 'webp' : 'jpeg',
};

/**
 * Bundle Size Analyzer
 */
class BundleSizeAnalyzerClass {
  private recommendations: OptimizationRecommendation[] = [];

  /**
   * Analyze bundle and generate recommendations
   */
  analyze = (): OptimizationRecommendation[] => {
    this.recommendations = [];

    // Add common recommendations
    this.addImageRecommendations();
    this.addCodeRecommendations();
    this.addDependencyRecommendations();
    this.addFontRecommendations();
    this.addAssetRecommendations();

    // Sort by priority
    this.recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return this.recommendations;
  };

  /**
   * Add image optimization recommendations
   */
  private addImageRecommendations = (): void => {
    this.recommendations.push({
      category: 'images',
      priority: 'high',
      title: 'Use WebP format for images',
      description:
        'WebP images are 25-35% smaller than PNG/JPEG with similar quality.',
      estimatedSavings: '30-40% reduction in image size',
      howToFix: [
        'Convert all PNG/JPEG images to WebP format',
        'Use expo-image or react-native-fast-image for WebP support',
        'Keep PNG fallback for iOS < 14',
        'Run: npx expo install expo-image',
      ],
    });

    this.recommendations.push({
      category: 'images',
      priority: 'high',
      title: 'Resize large images',
      description: 'Images larger than screen resolution waste bundle size.',
      estimatedSavings: '50-70% for oversized images',
      howToFix: [
        'Resize images to max 2x screen dimensions',
        'Use @1x, @2x, @3x image variants',
        'Remove any images > 2048px',
        'Consider using CDN for large images',
      ],
    });

    this.recommendations.push({
      category: 'images',
      priority: 'medium',
      title: 'Use SVG for icons and logos',
      description:
        'SVG icons scale perfectly and are smaller than multiple PNG sizes.',
      estimatedSavings: '60-80% for icon assets',
      howToFix: [
        'Convert icon PNGs to SVG format',
        'Use react-native-svg for SVG rendering',
        'Use expo vector icons instead of custom icon images',
        'Run: npx expo install react-native-svg',
      ],
    });

    this.recommendations.push({
      category: 'images',
      priority: 'medium',
      title: 'Implement lazy loading for images',
      description: 'Load images only when they enter the viewport.',
      estimatedSavings: 'Faster initial load, lower memory',
      howToFix: [
        'Use LazyImage component for list items',
        'Implement placeholder/skeleton while loading',
        'Set priority for above-the-fold images',
        'Use FlatList for image grids',
      ],
    });
  };

  /**
   * Add code optimization recommendations
   */
  private addCodeRecommendations = (): void => {
    this.recommendations.push({
      category: 'code',
      priority: 'high',
      title: 'Enable Hermes JavaScript Engine',
      description: 'Hermes reduces app size and improves startup time.',
      estimatedSavings: '20-50% smaller JS bundle',
      howToFix: [
        'Hermes is enabled by default in Expo SDK 48+',
        'Verify in app.json: "jsEngine": "hermes"',
        'Check startup time metrics after enabling',
      ],
    });

    this.recommendations.push({
      category: 'code',
      priority: 'high',
      title: 'Remove unused exports (tree shaking)',
      description: 'Import only what you use from libraries.',
      estimatedSavings: '10-30% depending on usage',
      howToFix: [
        'Use named imports: import { Button } from "library"',
        'Avoid import * as Library from "library"',
        'Check bundle analyzer for unused code',
        'Use babel-plugin-transform-imports for large libs',
      ],
    });

    this.recommendations.push({
      category: 'code',
      priority: 'medium',
      title: 'Implement code splitting',
      description: 'Load screens and features on demand.',
      estimatedSavings: 'Faster initial load',
      howToFix: [
        'Use React.lazy() for screen components',
        'Implement route-based code splitting',
        'Defer loading of non-critical features',
        'Use dynamic imports for large modules',
      ],
    });

    this.recommendations.push({
      category: 'code',
      priority: 'low',
      title: 'Minify and compress production builds',
      description: 'Reduce whitespace and optimize code.',
      estimatedSavings: '15-25% smaller bundle',
      howToFix: [
        'This is automatic in production builds',
        'Verify metro.config.js has minify: true',
        'Use source-maps for debugging',
      ],
    });
  };

  /**
   * Add dependency optimization recommendations
   */
  private addDependencyRecommendations = (): void => {
    this.recommendations.push({
      category: 'dependencies',
      priority: 'high',
      title: 'Audit and remove unused dependencies',
      description: 'Each dependency adds to bundle size.',
      estimatedSavings: 'Varies by dependency',
      howToFix: [
        'Run: npx depcheck to find unused deps',
        'Review package.json for unnecessary packages',
        'Remove development-only deps from dependencies',
        'Consider lighter alternatives for heavy libraries',
      ],
    });

    this.recommendations.push({
      category: 'dependencies',
      priority: 'high',
      title: 'Use lighter library alternatives',
      description: 'Some libraries have smaller alternatives.',
      estimatedSavings: '50-80% per replaced library',
      howToFix: [
        'moment.js → date-fns or dayjs (90% smaller)',
        'lodash → lodash-es or native methods',
        'axios → fetch (built-in)',
        'uuid → nanoid (2KB vs 12KB)',
      ],
    });

    this.recommendations.push({
      category: 'dependencies',
      priority: 'medium',
      title: 'Check for duplicate dependencies',
      description: 'Different versions of same package add bloat.',
      estimatedSavings: '5-15% of duplicate size',
      howToFix: [
        'Run: npm ls <package-name> to check versions',
        'Use npm dedupe to remove duplicates',
        'Pin versions in package.json resolutions',
        'Update all packages to use same versions',
      ],
    });
  };

  /**
   * Add font optimization recommendations
   */
  private addFontRecommendations = (): void => {
    this.recommendations.push({
      category: 'fonts',
      priority: 'medium',
      title: 'Subset custom fonts',
      description: 'Include only the characters you use.',
      estimatedSavings: '50-90% smaller font files',
      howToFix: [
        'Use font subsetting tools like glyphhanger',
        'Remove unused font weights (keep 400, 500, 700)',
        'Subset to latin characters if not using others',
        'Use system fonts for body text',
      ],
    });

    this.recommendations.push({
      category: 'fonts',
      priority: 'medium',
      title: 'Use variable fonts',
      description: 'One file for multiple weights and styles.',
      estimatedSavings: '30-70% vs separate font files',
      howToFix: [
        'Check if your font family has variable version',
        'Replace multiple weight files with single variable font',
        'Configure font-weight range in CSS',
      ],
    });

    this.recommendations.push({
      category: 'fonts',
      priority: 'low',
      title: 'Consider system fonts',
      description: 'System fonts add 0 bytes to bundle.',
      estimatedSavings: '100KB-500KB',
      howToFix: [
        'Use Platform.select for system font families',
        'iOS: San Francisco, Android: Roboto',
        'Reserve custom fonts for branding elements',
      ],
    });
  };

  /**
   * Add asset optimization recommendations
   */
  private addAssetRecommendations = (): void => {
    this.recommendations.push({
      category: 'assets',
      priority: 'medium',
      title: 'Use animations efficiently',
      description: 'Lottie files can be large if not optimized.',
      estimatedSavings: '20-60% per animation',
      howToFix: [
        'Simplify animation complexity',
        'Remove unused layers in After Effects',
        'Use lottie-compress for optimization',
        'Consider CSS animations for simple effects',
      ],
    });

    this.recommendations.push({
      category: 'assets',
      priority: 'low',
      title: 'Remove development assets',
      description: 'Test images and mock data add to bundle.',
      estimatedSavings: 'Varies',
      howToFix: [
        'Move mock data to separate dev files',
        'Use __DEV__ guard for development imports',
        'Remove placeholder images before production',
        'Use .gitignore for local test assets',
      ],
    });
  };

  /**
   * Get recommendations
   */
  getRecommendations = (): OptimizationRecommendation[] => {
    return [...this.recommendations];
  };

  /**
   * Generate report
   */
  generateReport = (): string => {
    const recommendations = this.analyze();

    let report = `# Bundle Size Optimization Report\n\n`;
    report += `**Date:** ${new Date().toISOString()}\n`;
    report += `**Total Recommendations:** ${recommendations.length}\n\n`;

    const grouped = {
      high: recommendations.filter((r) => r.priority === 'high'),
      medium: recommendations.filter((r) => r.priority === 'medium'),
      low: recommendations.filter((r) => r.priority === 'low'),
    };

    report += `## High Priority (${grouped.high.length})\n\n`;
    grouped.high.forEach((rec, i) => {
      report += `### ${i + 1}. ${rec.title}\n\n`;
      report += `**Category:** ${rec.category}\n`;
      report += `**Description:** ${rec.description}\n`;
      report += `**Estimated Savings:** ${rec.estimatedSavings}\n\n`;
      report += `**How to Fix:**\n`;
      rec.howToFix.forEach((step) => {
        report += `- ${step}\n`;
      });
      report += `\n`;
    });

    report += `## Medium Priority (${grouped.medium.length})\n\n`;
    grouped.medium.forEach((rec, i) => {
      report += `### ${i + 1}. ${rec.title}\n\n`;
      report += `**Category:** ${rec.category}\n`;
      report += `**Description:** ${rec.description}\n`;
      report += `**Estimated Savings:** ${rec.estimatedSavings}\n\n`;
      report += `**How to Fix:**\n`;
      rec.howToFix.forEach((step) => {
        report += `- ${step}\n`;
      });
      report += `\n`;
    });

    report += `## Low Priority (${grouped.low.length})\n\n`;
    grouped.low.forEach((rec, i) => {
      report += `### ${i + 1}. ${rec.title}\n\n`;
      report += `**Category:** ${rec.category}\n`;
      report += `**Description:** ${rec.description}\n`;
      report += `**Estimated Savings:** ${rec.estimatedSavings}\n\n`;
      report += `**How to Fix:**\n`;
      rec.howToFix.forEach((step) => {
        report += `- ${step}\n`;
      });
      report += `\n`;
    });

    return report;
  };

  /**
   * Log recommendations to console
   */
  logRecommendations = (): void => {
    const recommendations = this.analyze();

    logger.info('\n📦 Bundle Size Optimization Recommendations\n');

    const grouped = {
      high: recommendations.filter((r) => r.priority === 'high'),
      medium: recommendations.filter((r) => r.priority === 'medium'),
      low: recommendations.filter((r) => r.priority === 'low'),
    };

    logger.warn(`🔴 High Priority (${grouped.high.length}):`);
    grouped.high.forEach((rec) => {
      logger.warn(`  • ${rec.title}`);
      logger.info(`    ${rec.description}`);
      logger.info(`    Savings: ${rec.estimatedSavings}`);
    });

    logger.info(`\n🟡 Medium Priority (${grouped.medium.length}):`);
    grouped.medium.forEach((rec) => {
      logger.info(`  • ${rec.title}`);
    });

    logger.debug(`\n🟢 Low Priority (${grouped.low.length}):`);
    grouped.low.forEach((rec) => {
      logger.debug(`  • ${rec.title}`);
    });
  };
}

export const BundleSizeAnalyzer = new BundleSizeAnalyzerClass();

/**
 * Lazy loading utility for code splitting
 * Note: This is a simplified version - for production use React.lazy directly
 */
export const createLazyComponent = <P extends Record<string, unknown>>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  FallbackComponent?: React.ComponentType,
): React.FC<P> => {
  const LazyComponent = React.lazy(importFn);

  const WrappedComponent: React.FC<P> = (props) => {
    const fallback = FallbackComponent ? <FallbackComponent /> : null;
    return (
      <React.Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };

  return WrappedComponent;
};

/**
 * Hook for dynamic imports with loading state
 */
import React, { useEffect, useState } from 'react';

export const useDynamicImport = <T,>(
  importFn: () => Promise<T>,
): { module: T | null; loading: boolean; error: Error | null } => {
  const [module, setModule] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    importFn()
      .then((mod) => {
        if (mounted) {
          setModule(mod);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [importFn]);

  return { module, loading, error };
};

export default BundleSizeAnalyzer;

#!/usr/bin/env node

/**
 * React Native Metro Bundle Analyzer
 * 
 * Analyzes Metro bundler output for iOS/Android builds
 * Generates size report and enforces 18MB threshold
 * 
 * Usage:
 *   node scripts/analyze-rn-bundle.mjs [--platform ios|android] [--threshold 18]
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

const PLATFORMS = ['ios', 'android'];
const DEFAULT_THRESHOLD_MB = 18; // React Native standard
const BUNDLE_OUTPUT_DIR = './apps/mobile/.bundle-analysis';

const args = process.argv.slice(2);
const platform = args.find(arg => PLATFORMS.includes(arg)) || 'ios';
const thresholdMB = parseInt(args.find(arg => arg.startsWith('--threshold='))?.split('=')[1] || DEFAULT_THRESHOLD_MB);

console.log(`
🔍 React Native Bundle Analyzer
================================
Platform: ${platform}
Threshold: ${thresholdMB}MB
`);

async function analyzeBundleSizes() {
  try {
    // Ensure output directory exists
    await fs.mkdir(BUNDLE_OUTPUT_DIR, { recursive: true });

    // Generate Metro bundle
    console.log('📦 Building Metro bundle...');
    const bundleFile = path.join(BUNDLE_OUTPUT_DIR, `index.${platform}.bundle`);
    const sourceMapFile = path.join(BUNDLE_OUTPUT_DIR, `index.${platform}.bundle.map`);

    const bundleCommand = platform === 'ios'
      ? `npx react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ${bundleFile} --sourcemap-output ${sourceMapFile}`
      : `npx react-native bundle --entry-file index.js --platform android --dev false --bundle-output ${bundleFile} --sourcemap-output ${sourceMapFile}`;

    await execAsync(bundleCommand, { cwd: './apps/mobile' });

    // Get bundle size
    const stats = await fs.stat(bundleFile);
    const sizeBytes = stats.size;
    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);

    console.log(`\n📊 Bundle Size: ${sizeMB}MB (${sizeBytes} bytes)`);

    // Check threshold
    const thresholdBytes = thresholdMB * 1024 * 1024;
    const status = sizeBytes < thresholdBytes ? '✅ PASS' : '❌ FAIL';
    const percentage = ((sizeBytes / thresholdBytes) * 100).toFixed(1);

    console.log(`🎯 Threshold: ${thresholdMB}MB (${percentage}% of limit)`);
    console.log(`\n${status}\n`);

    // Analyze source map for top modules
    console.log('📈 Analyzing largest modules...');
    const sourceMap = JSON.parse(await fs.readFile(sourceMapFile, 'utf-8'));
    
    // Parse source map to find largest contributors
    const moduleSizes = {};
    
    if (sourceMap.sources) {
      sourceMap.sources.forEach((source, index) => {
        // Group by top-level module (node_modules/package-name)
        const match = source.match(/node_modules\/(@?[^/]+(?:\/[^/]+)?)/);
        if (match) {
          const moduleName = match[1];
          moduleSizes[moduleName] = (moduleSizes[moduleName] || 0) + 1;
        } else if (source.includes('apps/mobile/src')) {
          const appMatch = source.match(/apps\/mobile\/src\/([^/]+)/);
          if (appMatch) {
            const appModule = `app:${appMatch[1]}`;
            moduleSizes[appModule] = (moduleSizes[appModule] || 0) + 1;
          }
        }
      });
    }

    // Sort and display top 10
    const sortedModules = Object.entries(moduleSizes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    console.log('\nTop 10 Module Contributors:');
    sortedModules.forEach(([name, count], index) => {
      const estimatedSizeKB = Math.round((count / sourceMap.sources.length) * sizeBytes / 1024);
      console.log(`  ${index + 1}. ${name}: ~${estimatedSizeKB}KB (${count} sources)`);
    });

    // Generate JSON report
    const report = {
      platform,
      timestamp: new Date().toISOString(),
      bundle: {
        sizeBytes,
        sizeMB: parseFloat(sizeMB),
        thresholdMB,
        percentageOfThreshold: parseFloat(percentage),
        passed: sizeBytes < thresholdBytes,
      },
      topModules: sortedModules.map(([name, count]) => ({
        name,
        sourceCount: count,
        estimatedSizeKB: Math.round((count / sourceMap.sources.length) * sizeBytes / 1024),
      })),
    };

    const reportPath = path.join(BUNDLE_OUTPUT_DIR, `bundle-report.${platform}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📝 Report saved: ${reportPath}`);

    // Exit with error if threshold exceeded
    if (sizeBytes >= thresholdBytes) {
      console.error(`\n❌ Bundle size ${sizeMB}MB exceeds ${thresholdMB}MB threshold!`);
      process.exit(1);
    }

    console.log(`\n✅ Bundle analysis complete!\n`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    process.exit(1);
  }
}

analyzeBundleSizes();

#!/usr/bin/env node

/**
 * Bundle Size Tracker
 * 
 * Analyzes bundle sizes and compares against baseline
 * Generates reports and fails CI if size increases significantly
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import yaml from 'js-yaml';
import { gzipSync } from 'zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface BundleSize {
  name: string;
  size: number;
  gzipSize: number;
  files: Array<{
    name: string;
    size: number;
    gzipSize: number;
  }>;
}

interface Baseline {
  timestamp: string;
  commit: string;
  bundles: Record<string, BundleSize>;
}

interface Config {
  limits: Record<string, any>;
  tracking: Array<{
    name: string;
    path: string;
    pattern: string;
    limit: number;
  }>;
  analysis: {
    failOnIncrease: {
      enabled: boolean;
      threshold: number;
    };
  };
}

class BundleSizeTracker {
  private config: Config;
  private baseline: Baseline | null = null;
  private currentSizes: Record<string, BundleSize> = {};

  async loadConfig(): Promise<void> {
    const configPath = path.join(rootDir, '.bundlewatch.yml');
    const content = await fs.readFile(configPath, 'utf-8');
    this.config = yaml.load(content) as Config;
  }

  async loadBaseline(): Promise<void> {
    try {
      const baselinePath = path.join(rootDir, '.bundle-size-baseline.json');
      const content = await fs.readFile(baselinePath, 'utf-8');
      this.baseline = JSON.parse(content);
      console.log(`${colors.cyan}📊 Loaded baseline from ${this.baseline?.commit}${colors.reset}`);
    } catch (error) {
      console.log(`${colors.yellow}⚠️  No baseline found - will create new one${colors.reset}`);
    }
  }

  async analyzeBundle(name: string, bundlePath: string, pattern: string): Promise<BundleSize> {
    const files: Array<{ name: string; size: number; gzipSize: number }> = [];
    let totalSize = 0;
    let totalGzipSize = 0;

    try {
      const fullPath = path.join(rootDir, bundlePath);
      const dirEntries = await fs.readdir(fullPath, { withFileTypes: true });

      for (const entry of dirEntries) {
        if (entry.isFile() && this.matchesPattern(entry.name, pattern)) {
          const filePath = path.join(fullPath, entry.name);
          const content = await fs.readFile(filePath);
          const size = content.length;
          const gzipSize = gzipSync(content).length;

          files.push({
            name: entry.name,
            size,
            gzipSize,
          });

          totalSize += size;
          totalGzipSize += gzipSize;
        }
      }
    } catch (error) {
      console.warn(`${colors.yellow}⚠️  Could not analyze ${name}: ${error}${colors.reset}`);
    }

    return {
      name,
      size: totalSize,
      gzipSize: totalGzipSize,
      files,
    };
  }

  matchesPattern(filename: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(filename);
  }

  async analyze(): Promise<void> {
    console.log(`\n${colors.blue}📦 Analyzing bundle sizes...${colors.reset}\n`);

    for (const track of this.config.tracking) {
      const bundle = await this.analyzeBundle(track.name, track.path, track.pattern);
      this.currentSizes[track.name] = bundle;

      const sizeKB = (bundle.size / 1024).toFixed(2);
      const gzipKB = (bundle.gzipSize / 1024).toFixed(2);

      console.log(`${colors.cyan}${track.name}${colors.reset}`);
      console.log(`  Size: ${sizeKB} KB (${gzipKB} KB gzipped)`);
      console.log(`  Files: ${bundle.files.length}`);

      // Check against limit
      const limitKB = track.limit;
      const currentKB = bundle.gzipSize / 1024;

      if (currentKB > limitKB) {
        console.log(`  ${colors.red}❌ Exceeds limit (${limitKB} KB)${colors.reset}`);
      } else {
        const percentUsed = ((currentKB / limitKB) * 100).toFixed(1);
        console.log(`  ${colors.green}✓ Within limit (${percentUsed}% used)${colors.reset}`);
      }

      console.log();
    }
  }

  async compare(): Promise<{ passed: boolean; report: string }> {
    if (!this.baseline) {
      return {
        passed: true,
        report: 'No baseline to compare against',
      };
    }

    let report = '## Bundle Size Comparison\n\n';
    report += '| Bundle | Current | Baseline | Diff | Status |\n';
    report += '|--------|---------|----------|------|--------|\n';

    let passed = true;
    const threshold = this.config.analysis.failOnIncrease.threshold;

    for (const [name, current] of Object.entries(this.currentSizes)) {
      const baseline = this.baseline.bundles[name];
      
      if (!baseline) {
        report += `| ${name} | ${this.formatSize(current.gzipSize)} | N/A | New | ⚪ |\n`;
        continue;
      }

      const diff = current.gzipSize - baseline.gzipSize;
      const diffPercent = (diff / baseline.gzipSize) * 100;

      let status = '✅';
      if (diffPercent > threshold) {
        status = '❌';
        passed = false;
      } else if (diffPercent > threshold / 2) {
        status = '⚠️';
      }

      report += `| ${name} | ${this.formatSize(current.gzipSize)} | ${this.formatSize(baseline.gzipSize)} | ${this.formatDiff(diff, diffPercent)} | ${status} |\n`;
    }

    return { passed, report };
  }

  formatSize(bytes: number): string {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  formatDiff(bytes: number, percent: number): string {
    const sign = bytes >= 0 ? '+' : '';
    return `${sign}${this.formatSize(bytes)} (${sign}${percent.toFixed(1)}%)`;
  }

  async saveBaseline(): Promise<void> {
    const currentCommit = execSync('git rev-parse HEAD').toString().trim();

    const baseline: Baseline = {
      timestamp: new Date().toISOString(),
      commit: currentCommit,
      bundles: this.currentSizes,
    };

    const baselinePath = path.join(rootDir, '.bundle-size-baseline.json');
    await fs.writeFile(baselinePath, JSON.stringify(baseline, null, 2));

    console.log(`${colors.green}✓ Saved new baseline${colors.reset}`);
  }

  async generateReport(): Promise<void> {
    const reportDir = path.join(rootDir, 'bundle-reports');
    await fs.mkdir(reportDir, { recursive: true });

    // JSON report
    const jsonReport = {
      timestamp: new Date().toISOString(),
      sizes: this.currentSizes,
    };

    await fs.writeFile(
      path.join(reportDir, 'bundle-size.json'),
      JSON.stringify(jsonReport, null, 2)
    );

    // Markdown report
    const { report } = await this.compare();
    await fs.writeFile(path.join(reportDir, 'bundle-size.md'), report);

    console.log(`${colors.green}✓ Generated reports in bundle-reports/${colors.reset}`);
  }
}

// Main execution
async function main() {
  const tracker = new BundleSizeTracker();

  try {
    await tracker.loadConfig();
    await tracker.loadBaseline();
    await tracker.analyze();

    const { passed, report } = await tracker.compare();

    console.log('\n' + report);

    await tracker.generateReport();

    // Save baseline on main branch
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    if (currentBranch === 'main' || currentBranch === 'master') {
      await tracker.saveBaseline();
    }

    if (!passed) {
      console.log(`\n${colors.red}❌ Bundle size check failed!${colors.reset}\n`);
      process.exit(1);
    }

    console.log(`\n${colors.green}✅ Bundle size check passed!${colors.reset}\n`);
  } catch (error) {
    console.error(`${colors.red}Error: ${error}${colors.reset}`);
    process.exit(1);
  }
}

main();

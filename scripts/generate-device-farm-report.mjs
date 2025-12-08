#!/usr/bin/env node

/**
 * Device Farm Test Report Generator
 * 
 * Combines results from AWS Device Farm, BrowserStack, and other sources
 * into a unified test report
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

interface TestResult {
  name: string;
  platform: string;
  device: string;
  os: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  tests: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  errors: Array<{
    test: string;
    message: string;
    screenshot?: string;
  }>;
}

class ReportGenerator {
  private results: TestResult[] = [];

  async collectResults(): Promise<void> {
    const resultsDir = path.join(rootDir, 'test-results');
    
    try {
      const entries = await fs.readdir(resultsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          await this.processResultsDir(path.join(resultsDir, entry.name));
        }
      }
    } catch (error) {
      console.error('Failed to collect results:', error);
    }
  }

  async processResultsDir(dirPath: string): Promise<void> {
    try {
      const files = await fs.readdir(dirPath);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(dirPath, file), 'utf-8');
          const result = JSON.parse(content) as TestResult;
          this.results.push(result);
        }
      }
    } catch (error) {
      console.warn(`Failed to process ${dirPath}:`, error);
    }
  }

  generateMarkdownReport(): string {
    let report = '# 📱 Device Farm Test Results\n\n';
    
    // Summary
    const total = this.results.length;
    const passed = this.results.filter((r) => r.status === 'passed').length;
    const failed = this.results.filter((r) => r.status === 'failed').length;
    
    const passRate = ((passed / total) * 100).toFixed(1);
    
    report += '## Summary\n\n';
    report += `| Metric | Value |\n`;
    report += `|--------|-------|\n`;
    report += `| Total Devices | ${total} |\n`;
    report += `| ✅ Passed | ${passed} |\n`;
    report += `| ❌ Failed | ${failed} |\n`;
    report += `| Pass Rate | ${passRate}% |\n\n`;
    
    // Results by platform
    report += '## Results by Platform\n\n';
    
    const android = this.results.filter((r) => r.platform === 'android');
    const ios = this.results.filter((r) => r.platform === 'ios');
    
    report += '### Android\n\n';
    report += '| Device | OS | Status | Tests | Duration |\n';
    report += '|--------|-------|--------|-------|----------|\n';
    android.forEach((r) => {
      const status = r.status === 'passed' ? '✅' : '❌';
      report += `| ${r.device} | ${r.os} | ${status} | ${r.tests.passed}/${r.tests.total} | ${this.formatDuration(r.duration)} |\n`;
    });
    
    report += '\n### iOS\n\n';
    report += '| Device | OS | Status | Tests | Duration |\n';
    report += '|--------|-------|--------|-------|----------|\n';
    ios.forEach((r) => {
      const status = r.status === 'passed' ? '✅' : '❌';
      report += `| ${r.device} | ${r.os} | ${status} | ${r.tests.passed}/${r.tests.total} | ${this.formatDuration(r.duration)} |\n`;
    });
    
    // Failed tests
    const failures = this.results.filter((r) => r.status === 'failed');
    
    if (failures.length > 0) {
      report += '\n## ❌ Failed Tests\n\n';
      
      failures.forEach((r) => {
        report += `### ${r.device} (${r.platform} ${r.os})\n\n`;
        
        r.errors.forEach((error) => {
          report += `- **${error.test}**\n`;
          report += `  \`\`\`\n  ${error.message}\n  \`\`\`\n`;
          
          if (error.screenshot) {
            report += `  ![Screenshot](${error.screenshot})\n`;
          }
          
          report += '\n';
        });
      });
    }
    
    return report;
  }

  formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  }

  async saveReport(): Promise<void> {
    const reportDir = path.join(rootDir, 'test-reports');
    await fs.mkdir(reportDir, { recursive: true });
    
    const markdown = this.generateMarkdownReport();
    await fs.writeFile(path.join(reportDir, 'summary.md'), markdown);
    
    const json = JSON.stringify(this.results, null, 2);
    await fs.writeFile(path.join(reportDir, 'results.json'), json);
    
    // Create failed.txt if any tests failed
    const failed = this.results.some((r) => r.status === 'failed');
    if (failed) {
      await fs.writeFile(path.join(reportDir, 'failed.txt'), 'Tests failed');
    }
    
    console.log('✅ Reports generated in test-reports/');
  }
}

async function main() {
  const generator = new ReportGenerator();
  
  await generator.collectResults();
  await generator.saveReport();
}

main().catch(console.error);

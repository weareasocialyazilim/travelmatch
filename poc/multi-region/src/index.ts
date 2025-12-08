/**
 * Multi-Region Test Suite
 * 
 * Comprehensive tests for Supabase multi-region replication
 */

import { testReplicationLag } from './tests/replication-lag.js';
import { testReadScalability } from './tests/read-scalability.js';
import { testGeoLatency } from './tests/geo-latency.js';
import { testWritePerformance } from './tests/write-performance.js';
import chalk from 'chalk';

async function main() {
  console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║   TravelMatch Multi-Region Replication Test Suite        ║'));
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════════════════╝\n'));

  const tests = [
    { name: 'Replication Lag', fn: testReplicationLag },
    { name: 'Read Scalability', fn: testReadScalability },
    { name: 'Geographic Latency', fn: testGeoLatency },
    { name: 'Write Performance', fn: testWritePerformance },
  ];

  const results: any[] = [];

  for (const test of tests) {
    console.log(chalk.bold.blue(`\n🧪 Running: ${test.name}...`));
    console.log(chalk.dim('─'.repeat(60)));

    try {
      const result = await test.fn();
      results.push({ name: test.name, status: 'PASS', result });
      console.log(chalk.green(`✅ ${test.name}: PASSED`));
    } catch (error: any) {
      results.push({ name: test.name, status: 'FAIL', error: error.message });
      console.log(chalk.red(`❌ ${test.name}: FAILED`));
      console.log(chalk.red(`   Error: ${error.message}`));
    }
  }

  // Summary
  console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║                     Test Summary                          ║'));
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════════════════════════╝\n'));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  for (const result of results) {
    const icon = result.status === 'PASS' ? chalk.green('✅') : chalk.red('❌');
    console.log(`${icon} ${result.name}: ${result.status}`);
  }

  console.log(chalk.bold(`\n📊 Total: ${tests.length} | Passed: ${chalk.green(passed)} | Failed: ${chalk.red(failed)}`));

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(console.error);

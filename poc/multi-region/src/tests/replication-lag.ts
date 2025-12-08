/**
 * Replication Lag Test
 * 
 * Measures time for data to replicate from primary to replicas
 */

import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';

const PRIMARY_URL = process.env.PRIMARY_DB_URL || 'http://localhost:8000';
const EU_WEST_URL = process.env.EU_WEST_DB_URL || 'http://localhost:8001';
const AP_SOUTHEAST_URL = process.env.AP_SOUTHEAST_DB_URL || 'http://localhost:8002';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const primaryClient = createClient(PRIMARY_URL, ANON_KEY);
const euWestClient = createClient(EU_WEST_URL, ANON_KEY);
const apSoutheastClient = createClient(AP_SOUTHEAST_URL, ANON_KEY);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function measureReplicationLag(
  primaryClient: any,
  replicaClient: any,
  replicaName: string
): Promise<number> {
  const startTime = Date.now();
  const testId = `test-${Date.now()}-${Math.random()}`;

  // Write to primary
  const { data: inserted, error: insertError } = await primaryClient
    .from('replication_test')
    .insert({ id: testId, data: 'test', timestamp: startTime })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to insert to primary: ${insertError.message}`);
  }

  console.log(chalk.dim(`  📝 Written to primary: ${testId}`));

  // Poll replica until data appears (max 5 seconds)
  let lagMs = 0;
  const maxWaitTime = 5000;
  const pollInterval = 10;

  while (Date.now() - startTime < maxWaitTime) {
    const { data: replicaData, error: selectError } = await replicaClient
      .from('replication_test')
      .select()
      .eq('id', testId)
      .single();

    if (!selectError && replicaData) {
      lagMs = Date.now() - startTime;
      console.log(chalk.green(`  ✅ Found in ${replicaName}: ${lagMs}ms`));
      break;
    }

    await sleep(pollInterval);
  }

  if (lagMs === 0) {
    throw new Error(`Replication timeout: data not found in ${replicaName} after ${maxWaitTime}ms`);
  }

  // Cleanup
  await primaryClient.from('replication_test').delete().eq('id', testId);

  return lagMs;
}

export async function testReplicationLag() {
  console.log(chalk.cyan('\n📊 Testing Replication Lag...\n'));

  const iterations = 10;
  const euWestLags: number[] = [];
  const apSoutheastLags: number[] = [];

  for (let i = 0; i < iterations; i++) {
    console.log(chalk.dim(`\nIteration ${i + 1}/${iterations}:`));

    // Test EU West
    try {
      const euLag = await measureReplicationLag(primaryClient, euWestClient, 'EU West');
      euWestLags.push(euLag);
    } catch (error: any) {
      console.log(chalk.yellow(`  ⚠️  EU West: ${error.message}`));
    }

    await sleep(100);

    // Test AP Southeast
    try {
      const apLag = await measureReplicationLag(primaryClient, apSoutheastClient, 'AP Southeast');
      apSoutheastLags.push(apLag);
    } catch (error: any) {
      console.log(chalk.yellow(`  ⚠️  AP Southeast: ${error.message}`));
    }

    await sleep(100);
  }

  // Calculate statistics
  const euAvg = euWestLags.reduce((a, b) => a + b, 0) / euWestLags.length;
  const euP95 = euWestLags.sort((a, b) => a - b)[Math.floor(euWestLags.length * 0.95)];

  const apAvg = apSoutheastLags.reduce((a, b) => a + b, 0) / apSoutheastLags.length;
  const apP95 = apSoutheastLags.sort((a, b) => a - b)[Math.floor(apSoutheastLags.length * 0.95)];

  console.log(chalk.bold.cyan('\n📈 Results:'));
  console.log(chalk.dim('─'.repeat(60)));
  console.log(`EU West Replication Lag:`);
  console.log(`  Average: ${chalk.yellow(euAvg.toFixed(2))}ms`);
  console.log(`  P95: ${chalk.yellow(euP95.toFixed(2))}ms`);
  console.log(`  Min: ${chalk.green(Math.min(...euWestLags).toFixed(2))}ms`);
  console.log(`  Max: ${chalk.red(Math.max(...euWestLags).toFixed(2))}ms`);

  console.log(`\nAP Southeast Replication Lag:`);
  console.log(`  Average: ${chalk.yellow(apAvg.toFixed(2))}ms`);
  console.log(`  P95: ${chalk.yellow(apP95.toFixed(2))}ms`);
  console.log(`  Min: ${chalk.green(Math.min(...apSoutheastLags).toFixed(2))}ms`);
  console.log(`  Max: ${chalk.red(Math.max(...apSoutheastLags).toFixed(2))}ms`);

  const targetLag = 100;
  if (euP95 <= targetLag && apP95 <= targetLag) {
    console.log(chalk.green(`\n✅ Replication lag within target (${targetLag}ms)`));
  } else {
    console.log(chalk.red(`\n❌ Replication lag exceeds target (${targetLag}ms)`));
  }

  return {
    euWest: { avg: euAvg, p95: euP95 },
    apSoutheast: { avg: apAvg, p95: apP95 },
  };
}

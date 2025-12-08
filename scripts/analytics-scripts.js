#!/usr/bin/env node

/**
 * Analytics Support Scripts
 * 
 * Helper scripts for engagement tracking, viral optimization,
 * and analytics automation.
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ============================================
// Script 1: Calculate Engagement Metrics
// ============================================

async function calculateEngagementMetrics() {
  console.log('📊 Calculating engagement metrics...');

  const timeRanges = {
    '24h': 1,
    '7d': 7,
    '30d': 30,
  };

  for (const [label, days] of Object.entries(timeRanges)) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // DAU
    const { count: dau } = await supabase
      .from('user_sessions')
      .select('DISTINCT user_id', { count: 'exact', head: true })
      .gte('session_start', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // MAU
    const { count: mau } = await supabase
      .from('user_sessions')
      .select('DISTINCT user_id', { count: 'exact', head: true })
      .gte('session_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const stickiness = mau ? (dau / mau) : 0;

    console.log(`\n${label}:`);
    console.log(`  DAU: ${dau}`);
    console.log(`  MAU: ${mau}`);
    console.log(`  Stickiness (DAU/MAU): ${(stickiness * 100).toFixed(1)}%`);

    // Check thresholds
    if (stickiness < 0.2) {
      console.warn(`  ⚠️  Stickiness below 20% target!`);
      process.exitCode = 1;
    }
  }
}

// ============================================
// Script 2: Check Viral Metrics
// ============================================

async function checkViralMetrics() {
  console.log('🚀 Checking viral metrics...');

  const { data: metrics } = await supabase
    .from('user_viral_metrics')
    .select('*')
    .gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (!metrics || metrics.length === 0) {
    console.log('No viral metrics data available');
    return;
  }

  const avgKFactor = metrics.reduce((sum, m) => sum + m.k_factor, 0) / metrics.length;
  const avgConversion = metrics.reduce((sum, m) => sum + m.invite_conversion_rate, 0) / metrics.length;
  const avgShareRate = metrics.reduce((sum, m) => sum + m.share_rate, 0) / metrics.length;
  const avgCycleTime = metrics.reduce((sum, m) => sum + m.viral_cycle_time, 0) / metrics.length;

  console.log(`\nViral Metrics (30d average):`);
  console.log(`  K-Factor: ${avgKFactor.toFixed(2)} ${avgKFactor >= 1.0 ? '✅' : '⚠️'}`);
  console.log(`  Conversion Rate: ${(avgConversion * 100).toFixed(1)}% ${avgConversion >= 0.1 ? '✅' : '⚠️'}`);
  console.log(`  Share Rate: ${(avgShareRate * 100).toFixed(1)}% ${avgShareRate >= 0.25 ? '✅' : '⚠️'}`);
  console.log(`  Viral Cycle Time: ${avgCycleTime.toFixed(0)}h ${avgCycleTime < 48 ? '✅' : '⚠️'}`);

  // Export for CI
  const fs = require('fs');
  fs.writeFileSync('viral-metrics.json', JSON.stringify({
    kFactor: avgKFactor,
    conversionRate: avgConversion,
    shareRate: avgShareRate,
    cycleTime: avgCycleTime,
  }));

  // Fail if not viral
  if (avgKFactor < 0.5) {
    console.error('\n❌ K-Factor critically low! Viral growth not sustainable.');
    process.exit(1);
  }
}

// ============================================
// Script 3: Capture Daily Metrics
// ============================================

async function captureDailyMetrics() {
  console.log('📅 Capturing daily metrics snapshot...');

  const today = new Date().toISOString().split('T')[0];

  // Total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  // New users (today)
  const { count: newUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today);

  // Active users (today)
  const { count: activeUsers } = await supabase
    .from('user_sessions')
    .select('DISTINCT user_id', { count: 'exact', head: true })
    .gte('session_start', today);

  // DAU
  const { count: dau } = await supabase
    .from('user_sessions')
    .select('DISTINCT user_id', { count: 'exact', head: true })
    .gte('session_start', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // MAU
  const { count: mau } = await supabase
    .from('user_sessions')
    .select('DISTINCT user_id', { count: 'exact', head: true })
    .gte('session_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  // Content created
  const { count: moments } = await supabase
    .from('moments')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today);

  const { count: matches } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today);

  const { count: messages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today);

  // Revenue
  const { data: revenueData } = await supabase
    .from('revenue_events')
    .select('amount')
    .gte('created_at', today);

  const revenue = revenueData?.reduce((sum, r) => sum + r.amount, 0) || 0;

  // Save to database
  await supabase
    .from('daily_metrics')
    .upsert({
      date: today,
      total_users: totalUsers,
      new_users: newUsers,
      active_users: activeUsers,
      dau,
      mau,
      moments_created: moments,
      matches_made: matches,
      messages_sent: messages,
      revenue,
    });

  console.log(`\nDaily Metrics for ${today}:`);
  console.log(`  Total Users: ${totalUsers}`);
  console.log(`  New Users: ${newUsers}`);
  console.log(`  DAU: ${dau}`);
  console.log(`  MAU: ${mau}`);
  console.log(`  Stickiness: ${mau ? ((dau / mau) * 100).toFixed(1) : 0}%`);
  console.log(`  Moments: ${moments}`);
  console.log(`  Matches: ${matches}`);
  console.log(`  Messages: ${messages}`);
  console.log(`  Revenue: $${revenue.toFixed(2)}`);
}

// ============================================
// Script 4: Predict Churn
// ============================================

async function predictChurn() {
  console.log('🔮 Predicting user churn...');

  // Get users inactive for 7+ days
  const { data: atRiskUsers } = await supabase
    .from('user_engagement_metrics')
    .select('user_id, last_session_at, avg_sessions_per_week')
    .lt('last_session_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .gt('avg_sessions_per_week', 0);

  console.log(`\nFound ${atRiskUsers?.length || 0} at-risk users`);

  if (!atRiskUsers || atRiskUsers.length === 0) {
    console.log('No users at risk of churning');
    return;
  }

  // Calculate churn probability for each
  const predictions = atRiskUsers.map(user => {
    const daysSinceLastSession = Math.floor(
      (Date.now() - new Date(user.last_session_at).getTime()) / (24 * 60 * 60 * 1000)
    );

    const churnProbability = Math.min(
      daysSinceLastSession / 30 * 0.5 +
      (7 - user.avg_sessions_per_week) / 7 * 0.3 +
      0.2,
      1
    );

    return {
      userId: user.user_id,
      daysSinceLastSession,
      churnProbability,
      riskLevel: churnProbability > 0.7 ? 'high' : churnProbability > 0.4 ? 'medium' : 'low',
    };
  });

  const highRisk = predictions.filter(p => p.riskLevel === 'high');
  console.log(`\nHigh risk users: ${highRisk.length}`);
  console.log(`Avg churn probability: ${(predictions.reduce((sum, p) => sum + p.churnProbability, 0) / predictions.length * 100).toFixed(1)}%`);

  // Save predictions
  const fs = require('fs');
  fs.writeFileSync('churn-predictions.json', JSON.stringify(predictions, null, 2));
}

// ============================================
// Script 5: Update Leaderboards
// ============================================

async function updateLeaderboards() {
  console.log('🏆 Updating leaderboards...');

  const metrics = ['moments_created', 'matches_made', 'referrals_converted', 'user_level'];

  for (const metric of metrics) {
    const { data } = await supabase
      .from('user_engagement_metrics')
      .select(`user_id, ${metric}`)
      .order(metric, { ascending: false })
      .limit(100);

    console.log(`\n${metric} Top 5:`);
    data?.slice(0, 5).forEach((user, index) => {
      console.log(`  ${index + 1}. User ${user.user_id.substring(0, 8)}: ${user[metric]}`);
    });
  }

  console.log('\n✅ Leaderboards updated');
}

// ============================================
// Main Execution
// ============================================

const command = process.argv[2];

switch (command) {
  case 'engagement':
    calculateEngagementMetrics().catch(console.error);
    break;
  case 'viral':
    checkViralMetrics().catch(console.error);
    break;
  case 'daily':
    captureDailyMetrics().catch(console.error);
    break;
  case 'churn':
    predictChurn().catch(console.error);
    break;
  case 'leaderboards':
    updateLeaderboards().catch(console.error);
    break;
  default:
    console.log(`
Usage: node analytics-scripts.js <command>

Commands:
  engagement    - Calculate engagement metrics (DAU, MAU, stickiness)
  viral         - Check viral metrics (K-factor, conversion, share rate)
  daily         - Capture daily metrics snapshot
  churn         - Predict user churn risk
  leaderboards  - Update user leaderboards

Example:
  node analytics-scripts.js engagement
    `);
}

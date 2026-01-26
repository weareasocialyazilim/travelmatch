/**
 * AI Cost Monitor
 * Tracks monthly AI service costs and enforces soft caps
 * Updated: 2026-01-26 - Cost discipline implementation
 */

import { createClient } from '@supabase/supabase-js';

// Cost per request estimates (cents)
const COST_ESTIMATES = {
  rekognition_moderation: 0.1,  // ~$0.001 per image
  rekognition_text: 0.05,       // ~$0.0005 per text detection
  gpt4o_mini: 0.15,             // ~$0.0015 per 1K tokens
  gpt4o: 1.5,                   // ~$0.015 per 1K tokens
  embeddings: 0.02,             // ~$0.0002 per 1K tokens
} as const;

const COST_CAP_SOFT_LIMIT = 10000; // $100 soft cap (in cents)
const COST_CAP_HARD_LIMIT = 25000; // $250 hard cap (in cents)

interface CostEntry {
  service: keyof typeof COST_ESTIMATES;
  requestCount: number;
  estimatedCost: number;
  timestamp: string;
}

interface CostStatus {
  currentMonthSpend: number;
  remainingBudget: number;
  percentUsed: number;
  isNearLimit: boolean;     // > 80%
  isOverLimit: boolean;     // > 100%
  recommendations: string[];
}

/**
 * Track AI cost for a single request
 */
export async function trackAICost(
  service: keyof typeof COST_ESTIMATES,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[CostMonitor] Supabase not configured');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const cost = COST_ESTIMATES[service];

  await supabase.from('ai_cost_logs').insert({
    service,
    cost_cents: cost,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Get current month's AI cost status
 */
export async function getMonthlyCostStatus(): Promise<CostStatus> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    return {
      currentMonthSpend: 0,
      remainingBudget: COST_CAP_SOFT_LIMIT,
      percentUsed: 0,
      isNearLimit: false,
      isOverLimit: false,
      recommendations: [],
    };
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get start of current month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // Sum current month's costs
  const { data: costs } = await supabase
    .from('ai_cost_logs')
    .select('cost_cents')
    .gte('created_at', monthStart.toISOString());

  const totalCost = costs?.reduce((sum, row) => sum + (row.cost_cents || 0), 0) || 0;
  const percentUsed = (totalCost / COST_CAP_SOFT_LIMIT) * 100;

  const recommendations: string[] = [];

  if (percentUsed > 80) {
    recommendations.push('Consider increasing manual review threshold');
    recommendations.push('Review high-volume users for abuse');
  }
  if (percentUsed > 100) {
    recommendations.push('Switch to auto-approve for low-risk content');
    recommendations.push('Consider implementing stricter rate limits');
  }

  return {
    currentMonthSpend: totalCost,
    remainingBudget: Math.max(0, COST_CAP_SOFT_LIMIT - totalCost),
    percentUsed,
    isNearLimit: percentUsed > 80,
    isOverLimit: totalCost > COST_CAP_SOFT_LIMIT,
    recommendations,
  };
}

/**
 * Check if requests should be rate-limited due to cost
 */
export async function shouldRateLimitDueToCost(): Promise<boolean> {
  const status = await getMonthlyCostStatus();
  return status.isOverLimit;
}

/**
 * Get cost breakdown by service for current month
 */
export async function getCostBreakdownByService(): Promise<Record<string, number>> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    return {};
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data: costs } = await supabase
    .from('ai_cost_logs')
    .select('service, cost_cents')
    .gte('created_at', monthStart.toISOString());

  const breakdown: Record<string, number> = {};

  for (const row of costs || []) {
    breakdown[row.service] = (breakdown[row.service] || 0) + (row.cost_cents || 0);
  }

  return breakdown;
}

/**
 * Log cost and return whether to proceed (respects soft cap)
 */
export async function trackAndCheckCost(
  service: keyof typeof COST_ESTIMATES,
): Promise<{ proceed: boolean; reason: string }> {
  const status = await getMonthlyCostStatus();

  // If over hard limit, reject new requests
  if (status.currentMonthSpend > COST_CAP_HARD_LIMIT) {
    return {
      proceed: false,
      reason: 'Monthly AI cost limit exceeded',
    };
  }

  // If over soft limit, still proceed but warn
  if (status.currentMonthSpend > COST_CAP_SOFT_LIMIT) {
    console.warn(`[CostMonitor] Over soft limit: ${status.percentUsed.toFixed(1)}% used`);
  }

  // Track the cost
  await trackAICost(service);

  return {
    proceed: true,
    reason: 'ok',
  };
}

export const COST_CONFIG = {
  softLimit: COST_CAP_SOFT_LIMIT,
  hardLimit: COST_CAP_HARD_LIMIT,
  estimates: COST_ESTIMATES,
};

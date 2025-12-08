import { supabase } from '@/config/supabase';
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '@/utils/logger';

// Generic chart data types
interface UserGrowthData {
  date: string;
  total_users: number;
}

interface RevenueBreakdownData {
  source: string;
  amount: number;
}

interface CohortRetentionData {
  cohort_month: string;
  day: number;
  retention_rate: number;
}

interface FeatureUsageData {
  feature: string;
  hour: number;
  usage_count: number;
}

interface FunnelStepData {
  step_name: string;
  user_count: number;
  avg_time_to_next?: number;
}

interface TrendCalculationData {
  total_users: number;
  [key: string]: number; // For flexibility with different metric fields
}

/**
 * Advanced Analytics Dashboard
 * 
 * Real-time analytics with ML-powered insights, predictive modeling,
 * and actionable recommendations for growth optimization.
 * 
 * Dashboards:
 * 1. Growth Analytics - User acquisition, retention, churn
 * 2. Engagement Analytics - Activity, viral loops, social features
 * 3. Revenue Analytics - Monetization, gifts, premium conversions
 * 4. Product Analytics - Feature usage, user journeys, funnels
 * 5. Predictive Analytics - Churn prediction, LTV forecasting
 */

export interface AnalyticsDashboard {
  timeRange: '24h' | '7d' | '30d' | '90d' | 'all';
  metrics: DashboardMetrics;
  charts: ChartData[];
  insights: MLInsight[];
  recommendations: ActionableRecommendation[];
}

export interface DashboardMetrics {
  // Growth metrics
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  retentionRate: number;
  churnRate: number;
  growthRate: number;

  // Engagement metrics
  avgSessionDuration: number;
  avgSessionsPerUser: number;
  dau: number; // Daily Active Users
  mau: number; // Monthly Active Users
  stickiness: number; // DAU/MAU ratio

  // Viral metrics
  kFactor: number;
  viralCoefficient: number;
  referralConversionRate: number;
  shareRate: number;

  // Revenue metrics
  arr: number; // Annual Recurring Revenue
  mrr: number; // Monthly Recurring Revenue
  arpu: number; // Average Revenue Per User
  ltv: number; // Lifetime Value
  cac: number; // Customer Acquisition Cost

  // Social metrics
  momentsCreated: number;
  matchesMade: number;
  messagesExchanged: number;
  giftsValue: number;
}

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'funnel' | 'heatmap' | 'cohort';
  title: string;
  data: Array<{
    label: string;
    value: number;
    metadata?: Record<string, any>;
  }>;
  trend?: 'up' | 'down' | 'stable';
  trendPercentage?: number;
}

export interface MLInsight {
  type: 'warning' | 'opportunity' | 'success' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number; // 0-1
  data?: Record<string, any>;
}

export interface ActionableRecommendation {
  id: string;
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  priority: number; // 1-10
  actions: string[];
}

export interface UserSegment {
  name: string;
  description: string;
  userCount: number;
  criteria: Record<string, any>;
  avgLtv: number;
  churnRisk: number;
}

export interface FunnelAnalysis {
  name: string;
  steps: Array<{
    step: string;
    users: number;
    conversionRate: number;
    dropoffRate: number;
    avgTimeToNext: number; // seconds
  }>;
  overallConversion: number;
  bottleneck: string;
}

export class AdvancedAnalytics {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Get comprehensive dashboard for specified time range
   */
  async getDashboard(timeRange: AnalyticsDashboard['timeRange'] = '30d'): Promise<AnalyticsDashboard> {
    const [metrics, charts, insights] = await Promise.all([
      this.getMetrics(timeRange),
      this.getCharts(timeRange),
      this.generateMLInsights(timeRange),
    ]);

    const recommendations = await this.generateRecommendations(metrics, insights);

    return {
      timeRange,
      metrics,
      charts,
      insights,
      recommendations,
    };
  }

  /**
   * Calculate all dashboard metrics
   */
  private async getMetrics(timeRange: string): Promise<DashboardMetrics> {
    const days = this.getDaysFromRange(timeRange);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Growth metrics
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: newUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    const { count: activeUsers } = await supabase
      .from('user_sessions')
      .select('DISTINCT user_id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Retention calculation (Day 1, Day 7, Day 30)
    const retentionRate = await this.calculateRetentionRate(days);
    const churnRate = 1 - retentionRate;
    const growthRate = totalUsers && newUsers ? (newUsers / (totalUsers - newUsers)) : 0;

    // Engagement metrics
    const { data: sessionData } = await supabase.rpc('calculate_session_metrics', {
      start_date: startDate.toISOString(),
    });

    const avgSessionDuration = sessionData?.[0]?.avg_duration || 0;
    const avgSessionsPerUser = sessionData?.[0]?.avg_sessions || 0;

    const { count: dau } = await supabase
      .from('user_sessions')
      .select('DISTINCT user_id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { count: mau } = await supabase
      .from('user_sessions')
      .select('DISTINCT user_id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const stickiness = mau ? (dau || 0) / mau : 0;

    // Viral metrics
    const { data: viralMetrics } = await supabase
      .from('user_viral_metrics')
      .select('*')
      .gte('updated_at', startDate.toISOString());

    const kFactor = viralMetrics?.reduce((sum, m) => sum + m.k_factor, 0) / (viralMetrics?.length || 1);
    const viralCoefficient = kFactor; // Simplified
    const referralConversionRate = viralMetrics?.reduce((sum, m) => sum + m.invite_conversion_rate, 0) / (viralMetrics?.length || 1);
    const shareRate = viralMetrics?.reduce((sum, m) => sum + m.share_rate, 0) / (viralMetrics?.length || 1);

    // Revenue metrics
    const { data: revenueData } = await supabase.rpc('calculate_revenue_metrics', {
      start_date: startDate.toISOString(),
    });

    const mrr = revenueData?.[0]?.mrr || 0;
    const arr = mrr * 12;
    const arpu = totalUsers ? mrr / totalUsers : 0;
    const ltv = await this.calculateLTV();
    const cac = await this.calculateCAC(days);

    // Social metrics
    const { count: momentsCreated } = await supabase
      .from('moments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    const { count: matchesMade } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    const { count: messagesExchanged } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    const { data: giftsData } = await supabase
      .from('gifts')
      .select('amount')
      .gte('created_at', startDate.toISOString());

    const giftsValue = giftsData?.reduce((sum, g) => sum + g.amount, 0) || 0;

    return {
      totalUsers: totalUsers || 0,
      newUsers: newUsers || 0,
      activeUsers: activeUsers || 0,
      retentionRate,
      churnRate,
      growthRate,
      avgSessionDuration,
      avgSessionsPerUser,
      dau: dau || 0,
      mau: mau || 0,
      stickiness,
      kFactor,
      viralCoefficient,
      referralConversionRate,
      shareRate,
      arr,
      mrr,
      arpu,
      ltv,
      cac,
      momentsCreated: momentsCreated || 0,
      matchesMade: matchesMade || 0,
      messagesExchanged: messagesExchanged || 0,
      giftsValue,
    };
  }

  /**
   * Generate charts for visualization
   */
  private async getCharts(timeRange: string): Promise<ChartData[]> {
    const days = this.getDaysFromRange(timeRange);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const charts: ChartData[] = [];

    // 1. User Growth Chart (Line)
    const { data: userGrowth } = await supabase.rpc('get_daily_user_growth', {
      start_date: startDate.toISOString(),
      days,
    });

    charts.push({
      id: 'user_growth',
      type: 'line',
      title: 'User Growth',
      data: (userGrowth as UserGrowthData[] || []).map((d) => ({
        label: d.date,
        value: d.total_users,
      })),
      trend: this.calculateTrend(userGrowth as TrendCalculationData[]),
      trendPercentage: this.calculateTrendPercentage(userGrowth as TrendCalculationData[]),
    });

    // 2. Engagement Funnel (Funnel)
    const funnelData = await this.getEngagementFunnel();
    charts.push({
      id: 'engagement_funnel',
      type: 'funnel',
      title: 'Engagement Funnel',
      data: funnelData.steps.map(s => ({
        label: s.step,
        value: s.users,
        metadata: { conversionRate: s.conversionRate },
      })),
    });

    // 3. Revenue Breakdown (Pie)
    const { data: revenueBreakdown } = await supabase.rpc('get_revenue_breakdown', {
      start_date: startDate.toISOString(),
    });

    charts.push({
      id: 'revenue_breakdown',
      type: 'pie',
      title: 'Revenue by Source',
      data: (revenueBreakdown as RevenueBreakdownData[] || []).map((d) => ({
        label: d.source,
        value: d.amount,
      })),
    });

    // 4. Cohort Retention (Cohort)
    const { data: cohortData } = await supabase.rpc('get_cohort_retention', {
      start_date: startDate.toISOString(),
    });

    charts.push({
      id: 'cohort_retention',
      type: 'cohort',
      title: 'Cohort Retention',
      data: (cohortData as CohortRetentionData[] || []).map((d) => ({
        label: `${d.cohort_month} - Day ${d.day}`,
        value: d.retention_rate,
        metadata: { cohort: d.cohort_month, day: d.day },
      })),
    });

    // 5. Feature Usage Heatmap (Heatmap)
    const { data: featureUsage } = await supabase.rpc('get_feature_usage_heatmap', {
      start_date: startDate.toISOString(),
    });

    charts.push({
      id: 'feature_usage',
      type: 'heatmap',
      title: 'Feature Usage by Hour',
      data: (featureUsage as FeatureUsageData[] || []).map((d) => ({
        label: `${d.feature} - ${d.hour}:00`,
        value: d.usage_count,
        metadata: { feature: d.feature, hour: d.hour },
      })),
    });

    return charts;
  }

  /**
   * Generate ML-powered insights using Claude
   */
  private async generateMLInsights(timeRange: string): Promise<MLInsight[]> {
    const metrics = await this.getMetrics(timeRange);
    
    const prompt = `Analyze these product metrics and provide 3-5 key insights:

Metrics:
- Total Users: ${metrics.totalUsers}
- New Users: ${metrics.newUsers}
- Active Users: ${metrics.activeUsers}
- Retention Rate: ${(metrics.retentionRate * 100).toFixed(1)}%
- Churn Rate: ${(metrics.churnRate * 100).toFixed(1)}%
- Growth Rate: ${(metrics.growthRate * 100).toFixed(1)}%
- DAU/MAU (Stickiness): ${(metrics.stickiness * 100).toFixed(1)}%
- K-Factor: ${metrics.kFactor.toFixed(2)}
- Share Rate: ${(metrics.shareRate * 100).toFixed(1)}%
- LTV: $${metrics.ltv.toFixed(2)}
- CAC: $${metrics.cac.toFixed(2)}
- LTV/CAC Ratio: ${(metrics.ltv / metrics.cac).toFixed(2)}

Return ONLY a JSON array of insights with this structure:
[
  {
    "type": "warning|opportunity|success|info",
    "title": "Brief title",
    "description": "Detailed insight with specific numbers",
    "impact": "high|medium|low",
    "confidence": 0.95
  }
]`;

    const message = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      try {
        const insights = JSON.parse(content.text);
        return insights;
      } catch (error) {
        logger.error('Failed to parse ML insights:', error);
        return this.getFallbackInsights(metrics);
      }
    }

    return this.getFallbackInsights(metrics);
  }

  /**
   * Generate actionable recommendations based on insights
   */
  private async generateRecommendations(
    metrics: DashboardMetrics,
    insights: MLInsight[]
  ): Promise<ActionableRecommendation[]> {
    const recommendations: ActionableRecommendation[] = [];

    // Churn reduction
    if (metrics.churnRate > 0.1) {
      recommendations.push({
        id: 'reduce_churn',
        title: 'Reduce User Churn',
        description: `Churn rate is ${(metrics.churnRate * 100).toFixed(1)}%. Implement retention campaigns.`,
        expectedImpact: `Save ${Math.floor(metrics.totalUsers * metrics.churnRate * metrics.ltv)} in LTV`,
        effort: 'medium',
        priority: 9,
        actions: [
          'Segment churned users by reason',
          'Send re-engagement email campaigns',
          'Offer win-back incentives (premium trial)',
          'Implement exit surveys',
        ],
      });
    }

    // Viral growth optimization
    if (metrics.kFactor < 1.0) {
      recommendations.push({
        id: 'boost_viral_growth',
        title: 'Boost Viral Growth',
        description: `K-Factor is ${metrics.kFactor.toFixed(2)}. Need 1.0+ for viral growth.`,
        expectedImpact: `Increase from ${metrics.kFactor.toFixed(2)} to 1.2 = 2x faster growth`,
        effort: 'medium',
        priority: 8,
        actions: [
          'Optimize share prompts timing',
          'Increase referral rewards',
          'Add social proof to onboarding',
          'Implement share streaks/challenges',
        ],
      });
    }

    // Engagement optimization
    if (metrics.stickiness < 0.2) {
      recommendations.push({
        id: 'improve_stickiness',
        title: 'Improve User Stickiness',
        description: `DAU/MAU is ${(metrics.stickiness * 100).toFixed(1)}%. Target 25%+.`,
        expectedImpact: `25% stickiness = ${Math.floor(metrics.mau * 0.25)} daily active users`,
        effort: 'high',
        priority: 7,
        actions: [
          'Add daily login rewards',
          'Implement push notifications for friend activity',
          'Create daily challenges',
          'Improve content discovery',
        ],
      });
    }

    // Monetization optimization
    if (metrics.ltv / metrics.cac < 3.0) {
      recommendations.push({
        id: 'optimize_unit_economics',
        title: 'Optimize Unit Economics',
        description: `LTV/CAC is ${(metrics.ltv / metrics.cac).toFixed(2)}. Target 3.0+.`,
        expectedImpact: `3x LTV/CAC = Sustainable growth`,
        effort: 'high',
        priority: 8,
        actions: [
          'Reduce CAC through organic channels',
          'Increase LTV with premium upsells',
          'Optimize conversion funnel',
          'Implement pricing experiments',
        ],
      });
    }

    // Feature adoption
    if (metrics.momentsCreated / metrics.activeUsers < 2.0) {
      recommendations.push({
        id: 'increase_content_creation',
        title: 'Increase Content Creation',
        description: `Only ${(metrics.momentsCreated / metrics.activeUsers).toFixed(1)} moments per active user.`,
        expectedImpact: `2x content = 35% more engagement`,
        effort: 'low',
        priority: 6,
        actions: [
          'Simplify moment creation flow',
          'Add templates/prompts',
          'Gamify content creation',
          'Show content performance stats',
        ],
      });
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Segment users for targeted campaigns
   */
  async getUserSegments(): Promise<UserSegment[]> {
    const segments: UserSegment[] = [];

    // Power users (top 20% by engagement)
    const { data: powerUsers } = await supabase.rpc('get_user_segment', {
      segment_type: 'power_users',
      percentile: 0.8,
    });

    segments.push({
      name: 'Power Users',
      description: 'Top 20% most engaged users',
      userCount: powerUsers?.[0]?.count || 0,
      criteria: { engagement_percentile: '>= 80' },
      avgLtv: powerUsers?.[0]?.avg_ltv || 0,
      churnRisk: 0.05, // Power users rarely churn
    });

    // At-risk users (low engagement, high churn risk)
    const { data: atRiskUsers } = await supabase.rpc('get_user_segment', {
      segment_type: 'at_risk',
      days_inactive: 7,
    });

    segments.push({
      name: 'At-Risk Users',
      description: 'Inactive for 7+ days, high churn risk',
      userCount: atRiskUsers?.[0]?.count || 0,
      criteria: { days_inactive: '>= 7', churn_score: '>= 0.7' },
      avgLtv: atRiskUsers?.[0]?.avg_ltv || 0,
      churnRisk: 0.8,
    });

    // New users (signed up in last 7 days)
    const { data: newUsers } = await supabase.rpc('get_user_segment', {
      segment_type: 'new_users',
      days_since_signup: 7,
    });

    segments.push({
      name: 'New Users',
      description: 'Signed up in last 7 days',
      userCount: newUsers?.[0]?.count || 0,
      criteria: { days_since_signup: '<= 7' },
      avgLtv: newUsers?.[0]?.avg_ltv || 0,
      churnRisk: 0.3, // Onboarding critical
    });

    // Premium users
    const { data: premiumUsers } = await supabase.rpc('get_user_segment', {
      segment_type: 'premium',
    });

    segments.push({
      name: 'Premium Users',
      description: 'Active premium subscribers',
      userCount: premiumUsers?.[0]?.count || 0,
      criteria: { subscription_status: 'active' },
      avgLtv: premiumUsers?.[0]?.avg_ltv || 0,
      churnRisk: 0.1,
    });

    return segments;
  }

  /**
   * Analyze conversion funnels
   */
  async getEngagementFunnel(): Promise<FunnelAnalysis> {
    const { data: funnelData } = await supabase.rpc('calculate_engagement_funnel');

    const typedFunnelData = (funnelData as FunnelStepData[] || []);
    const steps = typedFunnelData.map((step, index) => ({
      step: step.step_name,
      users: step.user_count,
      conversionRate: index === 0 ? 1 : step.user_count / typedFunnelData[0].user_count,
      dropoffRate: index === 0 ? 0 : 1 - (step.user_count / typedFunnelData[index - 1].user_count),
      avgTimeToNext: step.avg_time_to_next || 0,
    }));

    const overallConversion = steps[steps.length - 1]?.conversionRate || 0;
    const bottleneck = steps.reduce((worst, step) => 
      step.dropoffRate > worst.dropoffRate ? step : worst
    ).step;

    return {
      name: 'User Engagement Funnel',
      steps,
      overallConversion,
      bottleneck,
    };
  }

  /**
   * Predict user churn using ML
   */
  async predictChurn(userId: string): Promise<{
    churnProbability: number;
    riskLevel: 'low' | 'medium' | 'high';
    factors: Array<{ factor: string; impact: number }>;
  }> {
    // Get user engagement data
    const { data: userMetrics } = await supabase
      .from('user_engagement_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!userMetrics) {
      return { churnProbability: 0.5, riskLevel: 'medium', factors: [] };
    }

    // Calculate churn score (simplified - would use actual ML model)
    const daysSinceLastSession = Math.floor(
      (Date.now() - new Date(userMetrics.last_session_at).getTime()) / (24 * 60 * 60 * 1000)
    );

    const factors = [
      {
        factor: 'Days since last session',
        impact: Math.min(daysSinceLastSession / 30, 1) * 0.3,
      },
      {
        factor: 'Session frequency',
        impact: Math.max(0, (1 - userMetrics.avg_sessions_per_week / 7)) * 0.25,
      },
      {
        factor: 'Content creation',
        impact: Math.max(0, (1 - userMetrics.moments_created / 10)) * 0.2,
      },
      {
        factor: 'Social connections',
        impact: Math.max(0, (1 - userMetrics.matches_made / 5)) * 0.15,
      },
      {
        factor: 'Premium status',
        impact: userMetrics.is_premium ? 0 : 0.1,
      },
    ];

    const churnProbability = factors.reduce((sum, f) => sum + f.impact, 0);

    const riskLevel = churnProbability > 0.7 ? 'high' 
      : churnProbability > 0.4 ? 'medium' 
      : 'low';

    return { churnProbability, riskLevel, factors };
  }

  // Helper methods

  private getDaysFromRange(timeRange: string): number {
    const ranges: Record<string, number> = {
      '24h': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      'all': 365,
    };
    return ranges[timeRange] || 30;
  }

  private async calculateRetentionRate(days: number): Promise<number> {
    const { data } = await supabase.rpc('calculate_retention_rate', { days });
    return data?.[0]?.retention_rate || 0;
  }

  private async calculateLTV(): Promise<number> {
    const { data } = await supabase.rpc('calculate_ltv');
    return data?.[0]?.ltv || 0;
  }

  private async calculateCAC(days: number): Promise<number> {
    const { data } = await supabase.rpc('calculate_cac', { days });
    return data?.[0]?.cac || 0;
  }

  private calculateTrend(data: TrendCalculationData[]): 'up' | 'down' | 'stable' {
    if (!data || data.length < 2) return 'stable';
    const recent = data.slice(-7).reduce((sum: number, d) => sum + d.total_users, 0) / 7;
    const previous = data.slice(-14, -7).reduce((sum: number, d) => sum + d.total_users, 0) / 7;
    const change = (recent - previous) / previous;
    return change > 0.05 ? 'up' : change < -0.05 ? 'down' : 'stable';
  }

  private calculateTrendPercentage(data: TrendCalculationData[]): number {
    if (!data || data.length < 2) return 0;
    const recent = data.slice(-7).reduce((sum: number, d) => sum + d.total_users, 0) / 7;
    const previous = data.slice(-14, -7).reduce((sum: number, d) => sum + d.total_users, 0) / 7;
    return ((recent - previous) / previous) * 100;
  }

  private getFallbackInsights(metrics: DashboardMetrics): MLInsight[] {
    const insights: MLInsight[] = [];

    if (metrics.churnRate > 0.1) {
      insights.push({
        type: 'warning',
        title: 'High Churn Rate',
        description: `${(metrics.churnRate * 100).toFixed(1)}% churn rate is above healthy threshold (10%). Focus on retention.`,
        impact: 'high',
        confidence: 0.9,
      });
    }

    if (metrics.kFactor > 1.0) {
      insights.push({
        type: 'success',
        title: 'Viral Growth Achieved',
        description: `K-Factor of ${metrics.kFactor.toFixed(2)} means exponential viral growth!`,
        impact: 'high',
        confidence: 0.95,
      });
    }

    if (metrics.ltv / metrics.cac > 3.0) {
      insights.push({
        type: 'success',
        title: 'Healthy Unit Economics',
        description: `LTV/CAC ratio of ${(metrics.ltv / metrics.cac).toFixed(2)} indicates sustainable growth.`,
        impact: 'high',
        confidence: 0.95,
      });
    }

    return insights;
  }
}

export const advancedAnalytics = new AdvancedAnalytics();

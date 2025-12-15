import { supabase } from '@/config/supabase';
import { logAuditEvent } from '@/config/soc2-compliance';

/**
 * Viral Loop Engine
 * 
 * Implements K-factor optimization, referral tracking, and viral mechanics
 * to maximize user acquisition through organic sharing.
 * 
 * Target K-factor: 1.5+ (each user brings 1.5 new users)
 * Target viral cycle time: <48 hours
 */

export interface ViralMetrics {
  kFactor: number; // Virality coefficient (invites sent × conversion rate)
  viralCycleTime: number; // Time from signup to first invite (hours)
  inviteConversionRate: number; // % of invites that convert to signups
  shareRate: number; // % of users who share
  viralGrowthRate: number; // Daily growth from referrals
}

export interface ReferralReward {
  type: 'credits' | 'premium_days' | 'badge' | 'boost' | 'unlock';
  amount: number;
  description: string;
  unlockCondition?: string;
}

export interface ViralTrigger {
  event: string;
  sharePrompt: string;
  shareTemplates: {
    whatsapp: string;
    instagram: string;
    twitter: string;
    facebook: string;
  };
  incentive: ReferralReward;
  timing: 'immediate' | 'delayed' | 'optimal'; // Optimal = ML-predicted best time
}

// Viral triggers optimized for travel context
const VIRAL_TRIGGERS: ViralTrigger[] = [
  {
    event: 'moment_created',
    sharePrompt: 'Share your amazing moment with friends!',
    shareTemplates: {
      whatsapp: '🌍 Just posted an incredible moment on TravelMatch! Check it out: {{url}}',
      instagram: 'Living my best travel life ✈️ #TravelMatch {{url}}',
      twitter: 'Amazing experience captured! 📸 {{url}} via @TravelMatch',
      facebook: 'Just shared a travel moment that gave me chills! {{url}}',
    },
    incentive: {
      type: 'credits',
      amount: 50,
      description: 'Get 50 credits when a friend signs up from your share!',
    },
    timing: 'immediate',
  },
  {
    event: 'match_made',
    sharePrompt: 'Found your travel twin! Invite friends to find theirs.',
    shareTemplates: {
      whatsapp: '🤝 I just found my travel match! Join TravelMatch to find yours: {{url}}',
      instagram: 'Travel buddy found! 🎉 Your turn: {{url}} #TravelMatch',
      twitter: 'Best. Match. Ever. Find your travel twin: {{url}}',
      facebook: 'TravelMatch connected me with someone who loves {{destination}} as much as I do! {{url}}',
    },
    incentive: {
      type: 'premium_days',
      amount: 7,
      description: '7 days premium when your friend makes their first match!',
    },
    timing: 'optimal',
  },
  {
    event: 'trip_completed',
    sharePrompt: 'Trip of a lifetime! Share your success story.',
    shareTemplates: {
      whatsapp: '✈️ Just came back from an epic trip I planned on TravelMatch: {{url}}',
      instagram: 'Trip highlights from TravelMatch 🌟 {{url}}',
      twitter: 'This trip was perfection 💯 Planned it all on @TravelMatch {{url}}',
      facebook: '{{destination}} was INCREDIBLE! Thanks to TravelMatch for the connections: {{url}}',
    },
    incentive: {
      type: 'boost',
      amount: 3,
      description: '3-day profile boost when friends join from your story!',
    },
    timing: 'delayed', // 24h after trip for reflection
  },
  {
    event: 'milestone_reached',
    sharePrompt: 'Achievement unlocked! Show off your traveler status.',
    shareTemplates: {
      whatsapp: '🏆 Just unlocked {{milestone}} on TravelMatch! Join me: {{url}}',
      instagram: 'Level up! {{milestone}} achieved 🎯 {{url}}',
      twitter: 'New milestone unlocked on @TravelMatch: {{milestone}} 🚀 {{url}}',
      facebook: 'Proud moment: {{milestone}} on TravelMatch! {{url}}',
    },
    incentive: {
      type: 'badge',
      amount: 1,
      description: 'Exclusive "Influencer" badge for 10+ successful referrals',
      unlockCondition: 'referral_count >= 10',
    },
    timing: 'immediate',
  },
  {
    event: 'gift_sent',
    sharePrompt: 'Spread the love! Invite friends to join the gifting.',
    shareTemplates: {
      whatsapp: '🎁 Just sent a travel gift on TravelMatch! You should try it: {{url}}',
      instagram: 'Gifting culture at its finest 💝 {{url}}',
      twitter: 'Love the community on @TravelMatch 🎁 {{url}}',
      facebook: 'Supporting fellow travelers on TravelMatch feels amazing! {{url}}',
    },
    incentive: {
      type: 'credits',
      amount: 100,
      description: 'Double credits when referred friend sends their first gift!',
    },
    timing: 'optimal',
  },
];

export class ViralLoopEngine {
  /**
   * Track viral event and trigger appropriate sharing prompt
   */
  async trackViralEvent(
    userId: string,
    event: string,
    metadata: Record<string, any>
  ): Promise<ViralTrigger | null> {
    const trigger = VIRAL_TRIGGERS.find(t => t.event === event);
    if (!trigger) return null;

    // Record event in analytics
    await supabase.from('viral_events').insert({
      user_id: userId,
      event_type: event,
      metadata,
      trigger_shown: true,
      trigger_timing: trigger.timing,
      created_at: new Date().toISOString(),
    });

    // Check if timing is optimal (ML-based)
    if (trigger.timing === 'optimal') {
      const shouldShow = await this.shouldShowPromptNow(userId, event);
      if (!shouldShow) return null;
    }

    // Delayed triggers (scheduled for later)
    if (trigger.timing === 'delayed') {
      await this.scheduleDelayedTrigger(userId, trigger, metadata);
      return null;
    }

    return trigger;
  }

  /**
   * Generate personalized share link with attribution
   */
  async generateShareLink(
    userId: string,
    source: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    // Create unique referral code
    const referralCode = await this.createReferralCode(userId);

    // Generate share link
    const baseUrl = 'https://travelmatch.app';
    const params = new URLSearchParams({
      ref: referralCode,
      source,
      ...metadata,
    });

    const shareUrl = `${baseUrl}/join?${params.toString()}`;

    // Track link generation
    await supabase.from('referral_links').insert({
      user_id: userId,
      referral_code: referralCode,
      source,
      metadata,
      created_at: new Date().toISOString(),
    });

    return shareUrl;
  }

  /**
   * Track referral conversion and grant rewards
   */
  async trackReferralConversion(
    referralCode: string,
    newUserId: string
  ): Promise<void> {
    // Find referrer
    const { data: referralLink } = await supabase
      .from('referral_links')
      .select('user_id, source')
      .eq('referral_code', referralCode)
      .single();

    if (!referralLink) return;

    const referrerId = referralLink.user_id;

    // Record conversion
    await supabase.from('referral_conversions').insert({
      referrer_id: referrerId,
      referee_id: newUserId,
      referral_code: referralCode,
      source: referralLink.source,
      converted_at: new Date().toISOString(),
    });

    // Grant rewards to referrer
    await this.grantReferralReward(referrerId, 'signup', {
      refereeId: newUserId,
      source: referralLink.source,
    });

    // Welcome bonus for new user
    await this.grantReferralReward(newUserId, 'referred_signup', {
      referrerId,
    });

    // Update K-factor metrics
    await this.updateViralMetrics(referrerId);
  }

  /**
   * Calculate viral metrics for user/platform
   */
  async calculateViralMetrics(userId?: string): Promise<ViralMetrics> {
    const timeWindow = 30; // Last 30 days

    // SECURITY: Explicit column selection - never use select('*')
    let query = supabase
      .from('referral_conversions')
      .select(`
        id,
        referrer_id,
        referred_id,
        converted_at,
        conversion_type,
        reward_amount
      `)
      .gte('converted_at', new Date(Date.now() - timeWindow * 24 * 60 * 60 * 1000).toISOString());

    if (userId) {
      query = query.eq('referrer_id', userId);
    }

    const { data: conversions } = await query;
    const conversionCount = conversions?.length || 0;

    // Get total invites sent
    const { data: invites } = await supabase
      .from('referral_links')
      .select('user_id')
      .gte('created_at', new Date(Date.now() - timeWindow * 24 * 60 * 60 * 1000).toISOString());

    const inviteCount = invites?.length || 0;

    // Get users who shared
    const uniqueSharers = new Set(invites?.map(i => i.user_id) || []).size;

    // Get total active users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - timeWindow * 24 * 60 * 60 * 1000).toISOString());

    // Calculate metrics
    const inviteConversionRate = inviteCount > 0 ? conversionCount / inviteCount : 0;
    const shareRate = totalUsers ? uniqueSharers / totalUsers : 0;
    const invitesPerUser = totalUsers ? inviteCount / totalUsers : 0;
    
    const kFactor = invitesPerUser * inviteConversionRate;

    // Calculate viral cycle time (average time from signup to first share)
    const { data: cycleTimes } = await supabase
      .rpc('calculate_viral_cycle_time', { time_window_days: timeWindow });

    const viralCycleTime = cycleTimes?.[0]?.avg_cycle_time || 0;

    // Calculate viral growth rate
    const viralGrowthRate = conversionCount / timeWindow; // New users per day from referrals

    return {
      kFactor,
      viralCycleTime,
      inviteConversionRate,
      shareRate,
      viralGrowthRate,
    };
  }

  /**
   * Gamification: Level system based on engagement
   */
  async calculateUserLevel(userId: string): Promise<{
    level: number;
    xp: number;
    nextLevelXp: number;
    title: string;
  }> {
    // Get user's engagement metrics
    // SECURITY: Explicit column selection - never use select('*')
    const { data: metrics } = await supabase
      .from('user_engagement_metrics')
      .select(`
        user_id,
        moments_created,
        matches_made,
        trips_completed,
        gifts_sent,
        referrals_converted,
        profile_views,
        messages_sent,
        updated_at
      `)
      .eq('user_id', userId)
      .single();

    if (!metrics) {
      return { level: 1, xp: 0, nextLevelXp: 100, title: 'Explorer' };
    }

    // XP calculation
    const xp = 
      (metrics.moments_created || 0) * 10 +
      (metrics.matches_made || 0) * 25 +
      (metrics.trips_completed || 0) * 100 +
      (metrics.gifts_sent || 0) * 15 +
      (metrics.referrals_converted || 0) * 50 +
      (metrics.profile_views || 0) * 1 +
      (metrics.messages_sent || 0) * 2;

    // Level calculation (logarithmic curve)
    const level = Math.floor(Math.log2(xp / 50 + 1)) + 1;
    const nextLevelXp = Math.pow(2, level) * 50;

    // Title based on level
    const titles = [
      'Explorer',
      'Wanderer',
      'Adventurer',
      'Globetrotter',
      'World Traveler',
      'Travel Guru',
      'Legend',
      'Travel Icon',
    ];
    const title = titles[Math.min(level - 1, titles.length - 1)] || 'Explorer';

    return { level, xp, nextLevelXp, title };
  }

  /**
   * Leaderboard: Top users by various metrics
   */
  async getLeaderboard(
    metric: 'referrals' | 'moments' | 'matches' | 'trips' | 'level',
    limit = 100
  ): Promise<Array<{
    userId: string;
    username: string;
    avatar: string;
    value: number;
    rank: number;
  }>> {
    const columnMap = {
      referrals: 'referrals_converted',
      moments: 'moments_created',
      matches: 'matches_made',
      trips: 'trips_completed',
      level: 'user_level',
    };

    const { data } = await supabase
      .from('user_engagement_metrics')
      .select(`
        user_id,
        ${columnMap[metric]},
        users!inner(username, avatar)
      `)
      .order(columnMap[metric], { ascending: false })
      .limit(limit);

    return ((data as any[]) || []).map((row, index) => ({
      userId: row.user_id,
      username: row.users.username,
      avatar: row.users.avatar,
      value: row[columnMap[metric]],
      rank: index + 1,
    }));
  }

  /**
   * Challenges: Time-limited engagement challenges
   */
  async getActiveChallenges(userId: string): Promise<Array<{
    id: string;
    title: string;
    description: string;
    reward: ReferralReward;
    progress: number;
    target: number;
    endsAt: string;
  }>> {
    const { data: challenges } = await supabase
      .from('engagement_challenges')
      .select(`
        *,
        user_challenge_progress!left(progress)
      `)
      .eq('active', true)
      .gte('ends_at', new Date().toISOString());

    return (challenges || []).map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      reward: challenge.reward,
      progress: challenge.user_challenge_progress?.[0]?.progress || 0,
      target: challenge.target,
      endsAt: challenge.ends_at,
    }));
  }

  /**
   * Social proof: Show friend activity to drive engagement
   */
  async getFriendActivity(userId: string, limit = 10): Promise<Array<{
    friendId: string;
    friendName: string;
    friendAvatar: string;
    activity: string;
    timestamp: string;
  }>> {
    // Get user's connections
    const { data: connections } = await supabase
      .from('user_connections')
      .select('connected_user_id')
      .eq('user_id', userId);

    const friendIds = connections?.map(c => c.connected_user_id) || [];

    if (friendIds.length === 0) return [];

    // Get recent activity from friends
    const { data: activities } = await supabase
      .from('user_activity_feed')
      .select(`
        user_id,
        activity_type,
        metadata,
        created_at,
        users!inner(username, avatar)
      `)
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })
      .limit(limit);

    return ((activities as any[]) || []).map(activity => ({
      friendId: activity.user_id,
      friendName: activity.users?.[0]?.username || activity.users?.username,
      friendAvatar: activity.users?.[0]?.avatar || activity.users?.avatar,
      activity: this.formatActivityString(activity.activity_type, activity.metadata),
      timestamp: activity.created_at,
    }));
  }

  // Private helper methods

  private async createReferralCode(userId: string): Promise<string> {
    // Generate unique 8-character code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Ensure uniqueness
    const { data: existing } = await supabase
      .from('referral_links')
      .select('referral_code')
      .eq('referral_code', code)
      .single();

    if (existing) {
      return this.createReferralCode(userId); // Recursive retry
    }

    return code;
  }

  private async shouldShowPromptNow(userId: string, event: string): Promise<boolean> {
    // ML-based optimal timing (simplified - would use actual ML model)
    // Factors: time of day, day of week, user engagement history, etc.
    
    const hour = new Date().getHours();
    
    // Don't show prompts late at night
    if (hour < 8 || hour > 22) return false;

    // Check if user has been shown too many prompts recently
    const { count } = await supabase
      .from('viral_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('trigger_shown', true)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Max 3 prompts per day
    if ((count || 0) >= 3) return false;

    return true;
  }

  private async scheduleDelayedTrigger(
    userId: string,
    trigger: ViralTrigger,
    metadata: Record<string, any>
  ): Promise<void> {
    // Schedule trigger for 24h later
    const scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await supabase.from('scheduled_viral_triggers').insert({
      user_id: userId,
      trigger_event: trigger.event,
      metadata,
      scheduled_for: scheduledFor.toISOString(),
    });
  }

  private async grantReferralReward(
    userId: string,
    rewardType: string,
    metadata: Record<string, any>
  ): Promise<void> {
    // Determine reward based on type
    const rewards: Record<string, ReferralReward> = {
      signup: { type: 'credits', amount: 50, description: 'Welcome bonus!' },
      referred_signup: { type: 'credits', amount: 25, description: 'Thanks for joining!' },
      first_match: { type: 'premium_days', amount: 7, description: '7 days premium!' },
      first_gift: { type: 'credits', amount: 100, description: 'Generous starter!' },
    };

    const reward = rewards[rewardType];
    if (!reward) return;

    // Apply reward
    if (reward.type === 'credits') {
      await supabase.rpc('add_user_credits', {
        user_id: userId,
        amount: reward.amount,
      });
    } else if (reward.type === 'premium_days') {
      await supabase.rpc('extend_premium', {
        user_id: userId,
        days: reward.amount,
      });
    }

    // Log reward
    await supabase.from('reward_grants').insert({
      user_id: userId,
      reward_type: reward.type,
      amount: reward.amount,
      reason: rewardType,
      metadata,
      granted_at: new Date().toISOString(),
    });

    await logAuditEvent({
      userId,
      userEmail: '',
      event: 'reward_granted',
      category: 'dataAccess',
      resource: 'rewards',
      action: 'create',
      result: 'success',
      ipAddress: '',
      userAgent: '',
      metadata: { rewardType, reward, metadata },
    });
  }

  private async updateViralMetrics(userId: string): Promise<void> {
    const metrics = await this.calculateViralMetrics(userId);
    
    await supabase
      .from('user_viral_metrics')
      .upsert({
        user_id: userId,
        k_factor: metrics.kFactor,
        viral_cycle_time: metrics.viralCycleTime,
        invite_conversion_rate: metrics.inviteConversionRate,
        share_rate: metrics.shareRate,
        viral_growth_rate: metrics.viralGrowthRate,
        updated_at: new Date().toISOString(),
      });
  }

  private formatActivityString(activityType: string, metadata: any): string {
    const formats: Record<string, string> = {
      moment_created: `posted a new moment in ${metadata.destination}`,
      match_made: `matched with ${metadata.matchName}`,
      trip_completed: `just returned from ${metadata.destination}`,
      gift_sent: `sent a gift to ${metadata.recipientName}`,
      milestone_reached: `unlocked ${metadata.milestone}`,
    };

    return formats[activityType] || 'was active';
  }
}

export const viralLoopEngine = new ViralLoopEngine();

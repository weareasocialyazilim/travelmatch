import React, { useState, useEffect } from 'react';
import { viralLoopEngine } from '@/services/viral-loop-engine';
import { advancedAnalytics } from '@/services/advanced-analytics';
import type { ViralTrigger, ReferralReward } from '@/services/viral-loop-engine';
import type { AnalyticsDashboard, MLInsight, ActionableRecommendation } from '@/services/advanced-analytics';

/**
 * Social Engagement Components
 * 
 * UI components for viral loops, gamification, leaderboards,
 * challenges, and friend activity.
 */

// Share Modal Component
interface ShareModalProps {
  trigger: ViralTrigger;
  userId: string;
  metadata?: Record<string, any>;
  onClose: () => void;
  onShare?: (platform: string) => void;
}

export function ShareModal({ trigger, userId, metadata, onClose, onShare }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generateUrl = async () => {
      const url = await viralLoopEngine.generateShareLink(userId, trigger.event, metadata);
      setShareUrl(url);
    };
    generateUrl();
  }, [userId, trigger.event, metadata]);

  const handleShare = async (platform: keyof typeof trigger.shareTemplates) => {
    const template = trigger.shareTemplates[platform];
    const message = template
      .replace('{{url}}', shareUrl)
      .replace('{{destination}}', metadata?.destination || '')
      .replace('{{milestone}}', metadata?.milestone || '');

    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      instagram: `instagram://share?text=${encodeURIComponent(message)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(message)}`,
    };

    window.open(shareUrls[platform], '_blank');
    onShare?.(platform);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share-modal" role="dialog" aria-labelledby="share-title">
      <div className="share-modal__content">
        <button onClick={onClose} className="share-modal__close" aria-label="Close">
          ×
        </button>

        <h2 id="share-title">{trigger.sharePrompt}</h2>

        <div className="share-modal__reward">
          <div className="reward-badge">
            <span className="reward-icon">🎁</span>
            <div>
              <div className="reward-title">{trigger.incentive.description}</div>
              <div className="reward-amount">
                {trigger.incentive.amount} {trigger.incentive.type.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        <div className="share-modal__platforms">
          <button
            onClick={() => handleShare('whatsapp')}
            className="share-button share-button--whatsapp"
            aria-label="Share on WhatsApp"
          >
            <span className="share-button__icon">💬</span>
            WhatsApp
          </button>

          <button
            onClick={() => handleShare('instagram')}
            className="share-button share-button--instagram"
            aria-label="Share on Instagram"
          >
            <span className="share-button__icon">📸</span>
            Instagram
          </button>

          <button
            onClick={() => handleShare('twitter')}
            className="share-button share-button--twitter"
            aria-label="Share on Twitter"
          >
            <span className="share-button__icon">🐦</span>
            Twitter
          </button>

          <button
            onClick={() => handleShare('facebook')}
            className="share-button share-button--facebook"
            aria-label="Share on Facebook"
          >
            <span className="share-button__icon">👥</span>
            Facebook
          </button>
        </div>

        <div className="share-modal__link">
          <input
            type="text"
            value={shareUrl}
            readOnly
            aria-label="Share link"
          />
          <button onClick={copyLink} aria-label="Copy link">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Leaderboard Component
interface LeaderboardProps {
  metric: 'referrals' | 'moments' | 'matches' | 'trips' | 'level';
  currentUserId: string;
  limit?: number;
}

export function Leaderboard({ metric, currentUserId, limit = 100 }: LeaderboardProps) {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      const data = await viralLoopEngine.getLeaderboard(metric, limit);
      setLeaders(data);
      
      const currentUserIndex = data.findIndex(l => l.userId === currentUserId);
      setUserRank(currentUserIndex >= 0 ? currentUserIndex + 1 : null);
      
      setLoading(false);
    };
    loadLeaderboard();
  }, [metric, currentUserId, limit]);

  const metricLabels = {
    referrals: 'Referrals',
    moments: 'Moments',
    matches: 'Matches',
    trips: 'Trips',
    level: 'Level',
  };

  if (loading) {
    return <div className="leaderboard__loading">Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard">
      <h2 className="leaderboard__title">
        🏆 Top {metricLabels[metric]} Leaders
      </h2>

      {userRank && (
        <div className="leaderboard__user-rank">
          Your rank: #{userRank} of {leaders.length}
        </div>
      )}

      <div className="leaderboard__list" role="list">
        {leaders.map((leader, index) => (
          <div
            key={leader.userId}
            className={`leaderboard__item ${leader.userId === currentUserId ? 'leaderboard__item--current' : ''}`}
            role="listitem"
          >
            <div className="leaderboard__rank">
              {index < 3 ? (
                <span className="leaderboard__medal">
                  {['🥇', '🥈', '🥉'][index]}
                </span>
              ) : (
                <span className="leaderboard__number">#{index + 1}</span>
              )}
            </div>

            <img
              src={leader.avatar}
              alt={leader.username}
              className="leaderboard__avatar"
            />

            <div className="leaderboard__user">
              <div className="leaderboard__username">{leader.username}</div>
            </div>

            <div className="leaderboard__value">
              {leader.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Challenges Component
interface ChallengesProps {
  userId: string;
}

export function Challenges({ userId }: ChallengesProps) {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChallenges = async () => {
      setLoading(true);
      const data = await viralLoopEngine.getActiveChallenges(userId);
      setChallenges(data);
      setLoading(false);
    };
    loadChallenges();
  }, [userId]);

  if (loading) {
    return <div className="challenges__loading">Loading challenges...</div>;
  }

  return (
    <div className="challenges">
      <h2 className="challenges__title">🎯 Active Challenges</h2>

      <div className="challenges__list">
        {challenges.map(challenge => {
          const progressPercent = (challenge.progress / challenge.target) * 100;
          const daysLeft = Math.ceil(
            (new Date(challenge.endsAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
          );

          return (
            <div key={challenge.id} className="challenge-card">
              <div className="challenge-card__header">
                <h3 className="challenge-card__title">{challenge.title}</h3>
                <div className="challenge-card__timer">
                  ⏰ {daysLeft} days left
                </div>
              </div>

              <p className="challenge-card__description">{challenge.description}</p>

              <div className="challenge-card__progress">
                <div className="progress-bar">
                  <div
                    className="progress-bar__fill"
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    role="progressbar"
                    aria-valuenow={challenge.progress}
                    aria-valuemin={0}
                    aria-valuemax={challenge.target}
                  />
                </div>
                <div className="progress-text">
                  {challenge.progress} / {challenge.target}
                </div>
              </div>

              <div className="challenge-card__reward">
                <span className="reward-icon">🎁</span>
                <span>{challenge.reward.description}</span>
              </div>
            </div>
          );
        })}

        {challenges.length === 0 && (
          <div className="challenges__empty">
            No active challenges. Check back soon!
          </div>
        )}
      </div>
    </div>
  );
}

// Friend Activity Feed Component
interface FriendActivityProps {
  userId: string;
  limit?: number;
}

export function FriendActivity({ userId, limit = 10 }: FriendActivityProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivity = async () => {
      setLoading(true);
      const data = await viralLoopEngine.getFriendActivity(userId, limit);
      setActivities(data);
      setLoading(false);
    };
    loadActivity();
  }, [userId, limit]);

  const formatTimestamp = (timestamp: string) => {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diff = now - then;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return <div className="friend-activity__loading">Loading activity...</div>;
  }

  return (
    <div className="friend-activity">
      <h2 className="friend-activity__title">👥 Friend Activity</h2>

      <div className="friend-activity__list" role="feed">
        {activities.map((activity, index) => (
          <div key={`${activity.friendId}-${index}`} className="activity-item" role="article">
            <img
              src={activity.friendAvatar}
              alt={activity.friendName}
              className="activity-item__avatar"
            />

            <div className="activity-item__content">
              <div className="activity-item__text">
                <strong>{activity.friendName}</strong> {activity.activity}
              </div>
              <time className="activity-item__time" dateTime={activity.timestamp}>
                {formatTimestamp(activity.timestamp)}
              </time>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="friend-activity__empty">
            Connect with travelers to see their activity!
          </div>
        )}
      </div>
    </div>
  );
}

// Level Badge Component
interface LevelBadgeProps {
  userId: string;
  showProgress?: boolean;
}

export function LevelBadge({ userId, showProgress = true }: LevelBadgeProps) {
  const [levelData, setLevelData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLevel = async () => {
      setLoading(true);
      const data = await viralLoopEngine.calculateUserLevel(userId);
      setLevelData(data);
      setLoading(false);
    };
    loadLevel();
  }, [userId]);

  if (loading || !levelData) {
    return <div className="level-badge__loading">...</div>;
  }

  const progressPercent = (levelData.xp / levelData.nextLevelXp) * 100;

  return (
    <div className="level-badge">
      <div className="level-badge__icon">
        <span className="level-badge__number">{levelData.level}</span>
      </div>

      <div className="level-badge__info">
        <div className="level-badge__title">{levelData.title}</div>
        
        {showProgress && (
          <>
            <div className="level-badge__progress">
              <div
                className="level-badge__progress-bar"
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={levelData.xp}
                aria-valuemin={0}
                aria-valuemax={levelData.nextLevelXp}
              />
            </div>
            <div className="level-badge__xp">
              {levelData.xp.toLocaleString()} / {levelData.nextLevelXp.toLocaleString()} XP
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Analytics Dashboard Component
export function AnalyticsDashboard() {
  const [dashboard, setDashboard] = useState<AnalyticsDashboard | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      const data = await advancedAnalytics.getDashboard(timeRange);
      setDashboard(data);
      setLoading(false);
    };
    loadDashboard();
  }, [timeRange]);

  if (loading || !dashboard) {
    return <div className="analytics-dashboard__loading">Loading analytics...</div>;
  }

  const { metrics, charts, insights, recommendations } = dashboard;

  return (
    <div className="analytics-dashboard">
      <header className="analytics-dashboard__header">
        <h1>📊 Analytics Dashboard</h1>
        
        <div className="analytics-dashboard__time-range" role="tablist">
          {(['24h', '7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`time-range-button ${timeRange === range ? 'active' : ''}`}
              role="tab"
              aria-selected={timeRange === range}
            >
              {range}
            </button>
          ))}
        </div>
      </header>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          change={metrics.growthRate}
          icon="👥"
        />
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers.toLocaleString()}
          subtitle={`${(metrics.stickiness * 100).toFixed(1)}% stickiness`}
          icon="⚡"
        />
        <MetricCard
          title="K-Factor"
          value={metrics.kFactor.toFixed(2)}
          subtitle={metrics.kFactor >= 1 ? 'Viral! 🚀' : 'Growing 📈'}
          icon="🔄"
        />
        <MetricCard
          title="MRR"
          value={`$${metrics.mrr.toLocaleString()}`}
          change={metrics.growthRate}
          icon="💰"
        />
        <MetricCard
          title="LTV / CAC"
          value={(metrics.ltv / metrics.cac).toFixed(2)}
          subtitle={metrics.ltv / metrics.cac >= 3 ? 'Healthy ✅' : 'Optimize ⚠️'}
          icon="📈"
        />
        <MetricCard
          title="Retention"
          value={`${(metrics.retentionRate * 100).toFixed(1)}%`}
          subtitle={`${(metrics.churnRate * 100).toFixed(1)}% churn`}
          icon="🔁"
        />
      </div>

      {/* ML Insights */}
      <section className="analytics-section">
        <h2>🤖 AI Insights</h2>
        <div className="insights-grid">
          {insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section className="analytics-section">
        <h2>💡 Recommendations</h2>
        <div className="recommendations-list">
          {recommendations.slice(0, 5).map(rec => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </section>

      {/* Charts */}
      <section className="analytics-section">
        <h2>📈 Visualizations</h2>
        <div className="charts-grid">
          {charts.map(chart => (
            <ChartCard key={chart.id} chart={chart} />
          ))}
        </div>
      </section>
    </div>
  );
}

// Helper Components

function MetricCard({ title, value, subtitle, change, icon }: any) {
  return (
    <div className="metric-card">
      <div className="metric-card__icon">{icon}</div>
      <div className="metric-card__content">
        <div className="metric-card__title">{title}</div>
        <div className="metric-card__value">{value}</div>
        {subtitle && <div className="metric-card__subtitle">{subtitle}</div>}
        {change !== undefined && (
          <div className={`metric-card__change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change * 100).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: MLInsight }) {
  const icons = {
    warning: '⚠️',
    opportunity: '💡',
    success: '✅',
    info: 'ℹ️',
  };

  return (
    <div className={`insight-card insight-card--${insight.type}`}>
      <div className="insight-card__header">
        <span className="insight-card__icon">{icons[insight.type]}</span>
        <span className="insight-card__impact">{insight.impact} impact</span>
      </div>
      <h3 className="insight-card__title">{insight.title}</h3>
      <p className="insight-card__description">{insight.description}</p>
      <div className="insight-card__confidence">
        Confidence: {(insight.confidence * 100).toFixed(0)}%
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: ActionableRecommendation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="recommendation-card">
      <div className="recommendation-card__header">
        <div>
          <h3 className="recommendation-card__title">{recommendation.title}</h3>
          <p className="recommendation-card__description">{recommendation.description}</p>
        </div>
        <div className="recommendation-card__meta">
          <span className="recommendation-card__priority">
            Priority: {recommendation.priority}/10
          </span>
          <span className={`recommendation-card__effort recommendation-card__effort--${recommendation.effort}`}>
            {recommendation.effort} effort
          </span>
        </div>
      </div>

      <div className="recommendation-card__impact">
        💰 {recommendation.expectedImpact}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="recommendation-card__toggle"
        aria-expanded={expanded}
      >
        {expanded ? 'Hide' : 'Show'} action steps
      </button>

      {expanded && (
        <ol className="recommendation-card__actions">
          {recommendation.actions.map((action, index) => (
            <li key={index}>{action}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

function ChartCard({ chart }: { chart: any }) {
  return (
    <div className="chart-card">
      <h3 className="chart-card__title">{chart.title}</h3>
      {chart.trend && (
        <div className={`chart-card__trend chart-card__trend--${chart.trend}`}>
          {chart.trend === 'up' ? '↗' : chart.trend === 'down' ? '↘' : '→'}
          {chart.trendPercentage !== undefined && ` ${Math.abs(chart.trendPercentage).toFixed(1)}%`}
        </div>
      )}
      <div className="chart-card__placeholder">
        {/* Chart visualization would go here (using Chart.js, Recharts, etc.) */}
        <div className="chart-placeholder">
          Chart: {chart.type} - {chart.data.length} data points
        </div>
      </div>
    </div>
  );
}

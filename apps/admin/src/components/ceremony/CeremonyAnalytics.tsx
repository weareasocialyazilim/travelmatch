/**
 * CeremonyAnalytics Component
 *
 * Analytics dashboard for Proof Ceremony metrics.
 * Shows verification stats, AI success rates, and ceremony completion data.
 */

'use client';

import React from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose';
}

function StatCard({ title, value, change, icon, color }: StatCardProps) {
  const colorClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
  };

  return (
    <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            colorClasses[color],
          )}
        >
          {icon}
        </div>
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              change >= 0 ? 'text-emerald-600' : 'text-rose-600',
            )}
          >
            {change >= 0 ? (
              <ArrowTrendingUpIcon className="w-4 h-4" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4" />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
      </div>
    </div>
  );
}

interface CeremonyStats {
  verifiedToday: number;
  verifiedChange: number;
  pendingReview: number;
  aiSuccessRate: number;
  aiSuccessChange: number;
  avgCeremonyTime: number;
  totalCeremonies: number;
  rejectionRate: number;
}

interface TrustDistribution {
  platinum: number;
  gold: number;
  silver: number;
  bronze: number;
}

interface CeremonyAnalyticsProps {
  stats: CeremonyStats;
  trustDistribution: TrustDistribution;
  recentActivity?: Array<{
    id: string;
    type: 'verified' | 'rejected' | 'pending';
    userName: string;
    momentTitle: string;
    timestamp: Date;
  }>;
}

export function CeremonyAnalytics({
  stats,
  trustDistribution,
  recentActivity = [],
}: CeremonyAnalyticsProps) {
  const totalUsers =
    trustDistribution.platinum +
    trustDistribution.gold +
    trustDistribution.silver +
    trustDistribution.bronze;

  const getPercentage = (value: number) =>
    ((value / totalUsers) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Bugün Doğrulanan"
          value={stats.verifiedToday}
          change={stats.verifiedChange}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="emerald"
        />
        <StatCard
          title="Bekleyen Review"
          value={stats.pendingReview}
          icon={<ClockIcon className="w-6 h-6" />}
          color="amber"
        />
        <StatCard
          title="AI Başarı Oranı"
          value={`${stats.aiSuccessRate}%`}
          change={stats.aiSuccessChange}
          icon={<SparklesIcon className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Ortalama Ceremony Süresi"
          value={`${stats.avgCeremonyTime}dk`}
          icon={<ChartBarIcon className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Trust Distribution */}
      <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Trust Constellation Dağılımı
        </h3>

        <div className="space-y-4">
          {/* Platinum */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-foreground">
                ⭐ Platinum (90-100)
              </span>
              <span className="text-muted-foreground">
                {trustDistribution.platinum} (
                {getPercentage(trustDistribution.platinum)}%)
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"
                style={{
                  width: `${(trustDistribution.platinum / totalUsers) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Gold */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-foreground">🥇 Gold (70-89)</span>
              <span className="text-muted-foreground">
                {trustDistribution.gold} (
                {getPercentage(trustDistribution.gold)}%)
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                style={{
                  width: `${(trustDistribution.gold / totalUsers) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Silver */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-foreground">
                🥈 Silver (50-69)
              </span>
              <span className="text-muted-foreground">
                {trustDistribution.silver} (
                {getPercentage(trustDistribution.silver)}%)
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-slate-300 to-slate-400 rounded-full"
                style={{
                  width: `${(trustDistribution.silver / totalUsers) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Bronze */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-foreground">
                🥉 Bronze (0-49)
              </span>
              <span className="text-muted-foreground">
                {trustDistribution.bronze} (
                {getPercentage(trustDistribution.bronze)}%)
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                style={{
                  width: `${(trustDistribution.bronze / totalUsers) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
              <p className="text-sm text-muted-foreground">Toplam Kullanıcı</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">
                {stats.totalCeremonies}
              </p>
              <p className="text-sm text-muted-foreground">Toplam Ceremony</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-600">
                {stats.rejectionRate}%
              </p>
              <p className="text-sm text-muted-foreground">Red Oranı</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-card rounded-xl shadow-sm p-6 border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Son Aktiviteler
          </h3>

          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      activity.type === 'verified'
                        ? 'bg-emerald-500'
                        : activity.type === 'rejected'
                          ? 'bg-rose-500'
                          : 'bg-amber-500',
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {activity.userName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.momentTitle}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-1 rounded-full',
                      activity.type === 'verified'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                        : activity.type === 'rejected'
                          ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                          : 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
                    )}
                  >
                    {activity.type === 'verified'
                      ? 'Onaylandı'
                      : activity.type === 'rejected'
                        ? 'Reddedildi'
                        : 'Bekliyor'}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(activity.timestamp).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CeremonyAnalytics;

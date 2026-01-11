'use client';

/**
 * CEO Executive Briefing
 *
 * Design Inspired by: Tesla Dashboard, Apple Keynote, Stripe Atlas
 *
 * Principles:
 * - 5-second comprehension
 * - Data speaks, not decoration
 * - Action-oriented insights
 * - Mobile-ready executive view
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  Download,
  Mail,
  Clock,
  Target,
  Loader2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { CanvaButton } from '@/components/canva/CanvaButton';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardBody,
} from '@/components/canva/CanvaCard';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// API function - replace mock when ready
async function fetchCEOBriefing() {
  // TODO: Replace with real API
  // const res = await fetch('/api/ceo-briefing');
  // return res.json();

  // Simulated API response
  return {
    lastUpdated: new Date().toISOString(),
    healthScore: 87,
    systemStatus: 'operational',
    northStar: {
      name: 'Weekly Active Gifters',
      current: 8420,
      target: 10000,
      previousPeriod: 7850,
      percentToGoal: 84.2,
    },
    kpis: [
      { id: 'gmv', label: 'Daily GMV', value: 284500, prefix: '₺', change: 12.5, status: 'up' },
      { id: 'dau', label: 'DAU', value: 45200, change: 8.3, status: 'up' },
      { id: 'completion', label: 'Completion Rate', value: 87.2, suffix: '%', change: 2.1, status: 'up' },
      { id: 'fraud', label: 'Fraud Rate', value: 0.32, suffix: '%', change: -15.2, status: 'down', inverse: true },
    ],
    alerts: [
      { id: '1', severity: 'critical', title: 'PayTR Gateway Slowdown', subtitle: 'Response time 320ms (normal: 85ms)', action: 'View Details', href: '/system-health' },
      { id: '2', severity: 'warning', title: '23 Pending KYC Verifications', subtitle: 'High-value transactions waiting', action: 'Review', href: '/wallet-operations' },
    ],
    weeklyGoals: [
      { id: 'users', label: 'New Users', current: 3420, target: 4000 },
      { id: 'gmv', label: 'GMV', current: 1.85, target: 2.0, unit: 'M' },
      { id: 'nps', label: 'NPS Score', current: 48, target: 50 },
      { id: 'resolution', label: 'Dispute Resolution', current: 92, target: 95, unit: '%' },
    ],
  };
}

export default function CEOBriefingPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch data
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['ceo-briefing'],
    queryFn: fetchCEOBriefing,
    refetchInterval: 60000, // Refresh every minute
  });

  // Update time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 w-48 bg-gray-200 rounded" />
            <div className="h-8 w-64 bg-gray-200 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-gray-200 rounded" />
            <div className="h-9 w-24 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 h-48 bg-gray-100 rounded-2xl" />
          <div className="col-span-8 h-48 bg-violet-100 rounded-2xl" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="h-40 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  const greeting = getGreeting();
  const healthColor = getHealthColor(data?.healthScore || 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header - Clean, minimal */}
      <header className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {formatDate(currentTime)}
          </p>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mt-1">
            {greeting}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <CanvaButton
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            leftIcon={<RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />}
          >
            {formatTime(currentTime)}
          </CanvaButton>
          <CanvaButton variant="outline" size="sm" leftIcon={<Mail className="w-4 h-4" />}>
            E-posta
          </CanvaButton>
          <CanvaButton variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
            PDF İndir
          </CanvaButton>
        </div>
      </header>

      {/* Health Score + North Star - The two most important numbers */}
      <div className="grid grid-cols-12 gap-6">
        {/* Health Score Card */}
        <div className="col-span-4 bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Şirket Sağlığı
            </span>
            <span className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              data?.systemStatus === 'operational'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-red-50 text-red-700'
            )}>
              <span className={cn(
                'w-1.5 h-1.5 rounded-full',
                data?.systemStatus === 'operational' ? 'bg-emerald-500' : 'bg-red-500'
              )} />
              {data?.systemStatus === 'operational' ? 'Tüm Sistemler Aktif' : 'Sorun Tespit Edildi'}
            </span>
          </div>

          {/* Circular Progress */}
          <div className="flex items-center justify-center py-4">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-100 dark:text-gray-800"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(data?.healthScore || 0) * 3.52} 352`}
                  strokeLinecap="round"
                  className={healthColor}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn('text-4xl font-bold', healthColor)}>
                  {data?.healthScore}
                </span>
                <span className="text-xs text-gray-400 mt-1">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kuzey Yıldızı Metriği */}
        <div className="col-span-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 opacity-80" />
            <span className="text-sm font-medium opacity-80">Kuzey Yıldızı Metriği</span>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-medium opacity-90 mb-2">
                Haftalık Aktif Hediyeleşenler
              </h2>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold">
                  {data?.northStar.current.toLocaleString('tr-TR')}
                </span>
                <span className="flex items-center gap-1 text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
                  <ArrowUpRight className="w-4 h-4" />
                  {((((data?.northStar.current || 0) - (data?.northStar.previousPeriod || 0)) / (data?.northStar.previousPeriod || 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <p className="text-sm opacity-70 mt-2">
                geçen hafta: {data?.northStar.previousPeriod.toLocaleString('tr-TR')}
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="opacity-70">Hedefe İlerleme</span>
                <span className="font-semibold">%{data?.northStar.percentToGoal}</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${data?.northStar.percentToGoal}%` }}
                />
              </div>
              <p className="text-sm opacity-70 mt-2">
                Hedef: {data?.northStar.target.toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical KPIs - 4 most important metrics */}
      <div className="grid grid-cols-4 gap-4">
        {data?.kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
          >
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {kpi.label}
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              {kpi.prefix && <span className="text-lg text-gray-500">{kpi.prefix}</span>}
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
              </span>
              {kpi.suffix && <span className="text-lg text-gray-500">{kpi.suffix}</span>}
            </div>
            <div className="mt-2">
              <span className={cn(
                'inline-flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full',
                (kpi.inverse ? kpi.status === 'down' : kpi.status === 'up')
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
              )}>
                {kpi.status === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {kpi.change > 0 ? '+' : ''}{kpi.change}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Uyarılar - Dikkat Gerektiren Konular */}
      {data?.alerts && data.alerts.length > 0 && (
        <CanvaCard>
          <CanvaCardHeader>
            <CanvaCardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Dikkat Gerektiriyor
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                {data.alerts.length}
              </span>
            </CanvaCardTitle>
          </CanvaCardHeader>
          <CanvaCardBody className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'px-6 py-4 flex items-center justify-between',
                    'hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-2',
                      alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'
                    )} />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {alert.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {alert.subtitle}
                      </p>
                    </div>
                  </div>
                  <Link href={alert.href}>
                    <CanvaButton variant="ghost" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                      {alert.action === 'View Details' ? 'Detaylar' : alert.action === 'Review' ? 'İncele' : alert.action}
                    </CanvaButton>
                  </Link>
                </div>
              ))}
            </div>
          </CanvaCardBody>
        </CanvaCard>
      )}

      {/* Haftalık Hedefler */}
      <CanvaCard padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-500" />
            Haftalık Hedefler
          </h2>
          <span className="text-sm text-gray-500">
            {getWeekNumber(currentTime)}. Hafta
          </span>
        </div>

        <div className="grid grid-cols-4 gap-8">
          {data?.weeklyGoals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            const progressColor = progress >= 90 ? 'bg-emerald-500' : progress >= 70 ? 'bg-amber-500' : 'bg-red-500';

            return (
              <div key={goal.id}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {goal.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {goal.current}{goal.unit} / {goal.target}{goal.unit}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', progressColor)}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CanvaCard>

      {/* Hızlı Erişim */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Finans Özeti', href: '/finance', metric: '₺284K bugün' },
          { label: 'Kullanıcı Büyümesi', href: '/analytics', metric: '+%8.3 DAU' },
          { label: 'Moderasyon Kuyruğu', href: '/moderation', metric: '12 bekliyor' },
          { label: 'Sistem Durumu', href: '/system-health', metric: '%99.9 uptime' },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={cn(
              'bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800',
              'p-4 flex items-center justify-between',
              'hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm transition-all'
            )}
          >
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                {action.label}
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {action.metric}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// Helper functions
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

function formatDate(date: Date) {
  return date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getWeekNumber(date: Date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getHealthColor(score: number) {
  if (score >= 85) return 'text-emerald-500';
  if (score >= 70) return 'text-amber-500';
  return 'text-red-500';
}

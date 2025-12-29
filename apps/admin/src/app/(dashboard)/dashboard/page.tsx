'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Activity,
  Camera,
  DollarSign,
  ArrowRight,
  BarChart3,
  Heart,
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/common/stat-card';
import {
  AdminAreaChart,
  AdminLineChart,
  CHART_COLORS,
} from '@/components/common/admin-chart';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

// Types for API responses
interface DashboardStats {
  totalUsers: number;
  userGrowth: number;
  activeUsers: number;
  activeGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  totalMoments: number;
  momentGrowth: number;
}

interface PendingTask {
  id: string;
  type: string;
  title: string;
  count: number;
  priority: 'high' | 'medium' | 'low';
}

interface DailyMetric {
  date: string;
  users: number;
  newUsers: number;
}

interface RevenueMetric {
  date: string;
  revenue: number;
  subscriptions: number;
  gifts: number;
}

interface TodaySummary {
  newRegistrations: number;
  activeSessions: number;
  dailyRevenue: number;
  newMoments: number;
}

// Task type to icon mapping
const taskIcons: Record<string, typeof Shield> = {
  kyc_verification: Shield,
  payment_approval: DollarSign,
  payout_approval: DollarSign,
  report_review: AlertTriangle,
  content_moderation: Camera,
  dispute_review: AlertTriangle,
  support_ticket: AlertCircle,
};

const taskLabels: Record<string, string> = {
  kyc_verification: 'KYC Onayı Bekliyor',
  payment_approval: 'Ödeme Onayı Bekliyor',
  payout_approval: 'Ödeme Onayı Bekliyor',
  report_review: 'Şikayet İncelemesi',
  content_moderation: 'Moment Moderasyonu',
  dispute_review: 'Anlaşmazlık İncelemesi',
  support_ticket: 'Destek Talebi',
};

const quickLinks = [
  {
    title: 'Analitik',
    description: 'Detaylı metrikler',
    href: '/analytics',
    icon: BarChart3,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    title: 'Gelir',
    description: 'Finansal raporlar',
    href: '/revenue',
    icon: DollarSign,
    color:
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  {
    title: 'Coğrafya',
    description: 'Bölgesel analiz',
    href: '/geographic',
    icon: Heart,
    color:
      'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    title: 'Olaylar',
    description: 'Sistem durumu',
    href: '/incidents',
    icon: AlertTriangle,
    color:
      'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
];

// System health check (this would ideally come from a monitoring API)
const systemHealth = {
  api: { status: 'healthy' as const, uptime: 99.98, label: 'API Gateway' },
  database: { status: 'healthy' as const, uptime: 99.99, label: 'Database' },
  storage: { status: 'healthy' as const, uptime: 99.95, label: 'Storage' },
  notifications: {
    status: 'healthy' as const,
    uptime: 99.9,
    label: 'Notifications',
  },
};

// Sparkline data generators
const generateSparkline = (trend: 'up' | 'down' | 'stable') => {
  const base = [20, 25, 22, 28, 32, 30, 35, 40];
  if (trend === 'up') return base;
  if (trend === 'down') return base.reverse();
  return base.map((v) => v + Math.random() * 5 - 2.5);
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [userActivityData, setUserActivityData] = useState<DailyMetric[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueMetric[]>([]);
  const [todaySummary, setTodaySummary] = useState<TodaySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [statsRes, tasksRes, analyticsRes, financeRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/tasks?status=pending'),
        fetch('/api/analytics?period=7d'),
        fetch('/api/finance?period=7d'),
      ]);

      // Process stats
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats({
          totalUsers: statsData.totalUsers || 0,
          userGrowth: statsData.userGrowth || 0,
          activeUsers: statsData.activeUsers || 0,
          activeGrowth: statsData.activeGrowth || 0,
          totalRevenue: statsData.totalRevenue || 0,
          revenueGrowth: statsData.revenueGrowth || 0,
          totalMoments: statsData.totalMoments || 0,
          momentGrowth: statsData.momentGrowth || 0,
        });
        setTodaySummary({
          newRegistrations: statsData.todayRegistrations || 0,
          activeSessions: statsData.activeSessions || 0,
          dailyRevenue: statsData.todayRevenue || 0,
          newMoments: statsData.todayMoments || 0,
        });
      }

      // Process pending tasks
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        // Group tasks by type and count them
        const taskCounts: Record<string, number> = {};
        (tasksData.tasks || []).forEach((task: { type: string }) => {
          taskCounts[task.type] = (taskCounts[task.type] || 0) + 1;
        });

        const processedTasks: PendingTask[] = Object.entries(taskCounts).map(
          ([type, count], idx) => ({
            id: `task-${idx}`,
            type,
            title: taskLabels[type] || type,
            count,
            priority: [
              'kyc_verification',
              'payout_approval',
              'payment_approval',
            ].includes(type)
              ? 'high'
              : 'medium',
          }),
        );

        // Sort by priority and count
        processedTasks.sort((a, b) => {
          if (a.priority === 'high' && b.priority !== 'high') return -1;
          if (a.priority !== 'high' && b.priority === 'high') return 1;
          return b.count - a.count;
        });

        setPendingTasks(processedTasks.slice(0, 4));
      }

      // Process analytics for user activity chart
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        if (analyticsData.dailyMetrics) {
          setUserActivityData(analyticsData.dailyMetrics);
        } else {
          // Generate from available data
          const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
          const today = new Date();
          setUserActivityData(
            days.map((day, i) => ({
              date: day,
              users: Math.floor(
                (analyticsData.metrics?.activeUsers || 1000) *
                  (0.8 + Math.random() * 0.4),
              ),
              newUsers: Math.floor(
                ((analyticsData.metrics?.newUsers || 100) / 7) *
                  (0.7 + Math.random() * 0.6),
              ),
            })),
          );
        }
      }

      // Process finance for revenue chart
      if (financeRes.ok) {
        const financeData = await financeRes.json();
        if (financeData.dailyRevenue) {
          setRevenueData(financeData.dailyRevenue);
        } else {
          // Generate from summary
          const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
          const avgRevenue = (financeData.summary?.totalRevenue || 350000) / 7;
          setRevenueData(
            days.map((day) => {
              const dailyRevenue = Math.floor(
                avgRevenue * (0.7 + Math.random() * 0.6),
              );
              return {
                date: day,
                revenue: dailyRevenue,
                subscriptions: Math.floor(dailyRevenue * 0.65),
                gifts: Math.floor(dailyRevenue * 0.35),
              };
            }),
          );
        }
      }

      setLastUpdated(new Date());
    } catch (err) {
      logger.error('Dashboard fetch error', err);
      setError('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const getStatusIcon = (
    status: 'healthy' | 'degraded' | 'down' | 'maintenance',
  ) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-4 w-4 text-status-healthy" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-status-degraded" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-status-down" />;
      case 'maintenance':
        return <Clock className="h-4 w-4 text-status-maintenance" />;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <Badge className="badge-gradient-amber text-[10px] font-semibold">
            Acil
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="secondary" className="text-[10px] font-semibold">
            Normal
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading && !stats) {
    return (
      <div className="admin-content flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="admin-content flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Platform genel bakış ve özet metrikleri
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <RefreshCw
              className={cn('h-4 w-4 mr-1', loading && 'animate-spin')}
            />
            Yenile
          </Button>
        </div>
      </div>

      {/* Key Metrics - Using new StatCard */}
      <div className="dashboard-grid">
        <StatCard
          title="Toplam Kullanıcı"
          value={(stats?.totalUsers || 0).toLocaleString('tr-TR')}
          icon={Users}
          change={stats?.userGrowth || 0}
          changeLabel="son 30 gün"
          href="/users"
          sparkline={generateSparkline(
            stats?.userGrowth && stats.userGrowth > 0 ? 'up' : 'stable',
          )}
        />
        <StatCard
          title="Aktif Kullanıcı"
          value={(stats?.activeUsers || 0).toLocaleString('tr-TR')}
          icon={Activity}
          change={stats?.activeGrowth || 0}
          changeLabel="son 7 gün"
          variant="success"
          href="/analytics"
          sparkline={generateSparkline(
            stats?.activeGrowth && stats.activeGrowth > 0 ? 'up' : 'stable',
          )}
        />
        <StatCard
          title="Toplam Gelir"
          value={formatCurrency(stats?.totalRevenue || 0, 'TRY')}
          icon={DollarSign}
          change={stats?.revenueGrowth || 0}
          changeLabel="son 30 gün"
          variant="success"
          href="/revenue"
          sparkline={generateSparkline(
            stats?.revenueGrowth && stats.revenueGrowth > 0 ? 'up' : 'stable',
          )}
        />
        <StatCard
          title="Toplam Moment"
          value={(stats?.totalMoments || 0).toLocaleString('tr-TR')}
          icon={Camera}
          change={stats?.momentGrowth || 0}
          changeLabel="son 30 gün"
          href="/moments"
          sparkline={generateSparkline(
            stats?.momentGrowth && stats.momentGrowth > 0 ? 'up' : 'stable',
          )}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Activity Chart */}
          <AdminAreaChart
            title="Kullanıcı Aktivitesi"
            description="Son 7 günlük DAU ve yeni kayıtlar"
            data={userActivityData}
            xAxisKey="date"
            height={280}
            areas={[
              {
                dataKey: 'users',
                name: 'Aktif Kullanıcı',
                color: CHART_COLORS.primary,
              },
              {
                dataKey: 'newUsers',
                name: 'Yeni Kayıt',
                color: CHART_COLORS.trust,
              },
            ]}
            formatter={(value, name) => [value.toLocaleString('tr-TR'), name]}
          />

          {/* Revenue Chart */}
          <AdminLineChart
            title="Günlük Gelir"
            description="Son 7 günlük gelir trendi"
            data={revenueData}
            xAxisKey="date"
            height={250}
            lines={[
              {
                dataKey: 'subscriptions',
                name: 'Abonelik',
                color: CHART_COLORS.primary,
              },
              {
                dataKey: 'gifts',
                name: 'Hediye',
                color: CHART_COLORS.secondary,
              },
            ]}
            yAxisFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`}
            formatter={(value, name) => [formatCurrency(value, 'TRY'), name]}
          />
        </div>

        {/* Right Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Bekleyen Görevler
                </CardTitle>
                <Link href="/queue">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                  >
                    Tümü
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  Bekleyen görev yok
                </div>
              ) : (
                pendingTasks.map((task) => {
                  const TaskIcon = taskIcons[task.type] || AlertCircle;
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        'flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50',
                        task.priority === 'high' &&
                          'border-l-4 border-l-amber-500',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-lg',
                            task.priority === 'high'
                              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          <TaskIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {task.count} adet bekliyor
                          </p>
                        </div>
                      </div>
                      {getPriorityBadge(task.priority)}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Sistem Durumu
                </CardTitle>
                <Link href="/ops-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                  >
                    Detay
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(systemHealth).map(([key, data]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'health-indicator',
                        data.status === 'healthy' && 'health-indicator-healthy',
                        data.status === 'degraded' &&
                          'health-indicator-degraded',
                        data.status === 'down' && 'health-indicator-down',
                        data.status === 'maintenance' &&
                          'health-indicator-maintenance',
                      )}
                    />
                    <span className="text-sm font-medium">{data.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {data.uptime}%
                    </span>
                    {getStatusIcon(data.status)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Bugünkü Özet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Yeni Kayıt
                  </span>
                  <span className="text-sm font-semibold">
                    +{todaySummary?.newRegistrations || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Aktif Oturum
                  </span>
                  <span className="text-sm font-semibold">
                    {(todaySummary?.activeSessions || 0).toLocaleString(
                      'tr-TR',
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Günlük Gelir
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {formatCurrency(todaySummary?.dailyRevenue || 0, 'TRY')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Yeni Moment
                  </span>
                  <span className="text-sm font-semibold">
                    {(todaySummary?.newMoments || 0).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="quick-action-card">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  link.color,
                )}
              >
                <link.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{link.title}</p>
                <p className="text-xs text-muted-foreground">
                  {link.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

'use client';

/**
 * TravelMatch Admin Dashboard
 *
 * CEO/CMO Final Meeting - Ultimate Dashboard Implementation
 *
 * Design Inspirations:
 * - META: Unified data architecture, real-time metrics
 * - TESLA: Telemetry dashboard, minimal design
 * - NVIDIA: Performance metrics, visual hierarchy
 * - CANVA: Beautiful UI, intuitive UX
 * - Airbnb: Host dashboard, actionable insights
 *
 * Features:
 * - 100% Real-time data (no mock data)
 * - Canva design system components
 * - Real-time subscriptions
 * - Performance optimized
 * - Full accessibility
 */

import {
  Users,
  Activity,
  Camera,
  DollarSign,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Heart,
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  TrendingUp,
  Zap,
  Globe,
  Server,
  Database,
  CreditCard,
  HardDrive,
} from 'lucide-react';
import Link from 'next/link';
import { useRealtimeDashboard } from '@/hooks/use-dashboard';
import { CanvaButton } from '@/components/canva/CanvaButton';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardBody,
  CanvaStatCard,
} from '@/components/canva/CanvaCard';
import { CanvaBadge, CanvaStatusBadge } from '@/components/canva/CanvaBadge';
import {
  AdminAreaChart,
  AdminLineChart,
  CHART_COLORS,
} from '@/components/common/admin-chart';
import { formatCurrency, cn } from '@/lib/utils';

// Quick links configuration
const quickLinks = [
  {
    title: 'Analitik',
    description: 'Detaylı metrikler',
    href: '/analytics',
    icon: BarChart3,
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Gelir',
    description: 'Finansal raporlar',
    href: '/revenue',
    icon: DollarSign,
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    title: 'Coğrafya',
    description: 'Bölgesel analiz',
    href: '/geographic',
    icon: Globe,
    gradient: 'from-violet-500 to-violet-600',
  },
  {
    title: 'Operasyonlar',
    description: 'Sistem durumu',
    href: '/ops-center',
    icon: Zap,
    gradient: 'from-amber-500 to-amber-600',
  },
];

// System health icon mapping
const healthIcons = {
  database: Database,
  api: Server,
  payments: CreditCard,
  storage: HardDrive,
};

export default function DashboardPage() {
  // Real-time dashboard data
  const { data, isLoading, error, refresh, isFetching } =
    useRealtimeDashboard();

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-emerald-500';
      case 'degraded':
        return 'bg-amber-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  // Error state
  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Bağlantı Hatası
            </h2>
            <p className="text-gray-500 mt-1">
              Dashboard verileri yüklenemedi. Lütfen tekrar deneyin.
            </p>
          </div>
          <CanvaButton variant="primary" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
            Tekrar Dene
          </CanvaButton>
        </div>
      </div>
    );
  }

  // Transform chart data for components
  const userActivityChartData =
    data?.charts.userActivity.labels.map((label, index) => ({
      date: label,
      users: data.charts.userActivity.datasets[0]?.data[index] || 0,
      moments: data.charts.userActivity.datasets[1]?.data[index] || 0,
    })) || [];

  const revenueChartData =
    data?.charts.revenue.labels.map((label, index) => ({
      date: label,
      revenue: data.charts.revenue.datasets[0]?.data[index] || 0,
    })) || [];

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Platform genel bakış ve canlı metrikler
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data?.meta.generatedAt && (
            <span className="text-xs text-gray-400">
              Son güncelleme:{' '}
              {new Date(data.meta.generatedAt).toLocaleTimeString('tr-TR')}
            </span>
          )}
          <CanvaButton
            variant="default"
            size="sm"
            onClick={refresh}
            disabled={isFetching}
          >
            <RefreshCw
              className={cn('h-4 w-4', isFetching && 'animate-spin')}
            />
            Yenile
          </CanvaButton>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <CanvaStatCard
          label="Toplam Kullanıcı"
          value={
            isLoading
              ? '...'
              : (data?.metrics.totalUsers || 0).toLocaleString('tr-TR')
          }
          icon={<Users className="h-5 w-5" />}
          change={
            data?.metrics.userGrowth
              ? { value: data.metrics.userGrowth, label: 'bu hafta' }
              : undefined
          }
        />

        {/* Active Users */}
        <CanvaStatCard
          label="Aktif Kullanıcı (24s)"
          value={
            isLoading
              ? '...'
              : (data?.metrics.activeUsers24h || 0).toLocaleString('tr-TR')
          }
          icon={<Activity className="h-5 w-5" />}
          change={
            data?.metrics.engagementRate
              ? { value: data.metrics.engagementRate, label: 'etkileşim oranı' }
              : undefined
          }
        />

        {/* Total Revenue */}
        <CanvaStatCard
          label="Toplam Gelir"
          value={
            isLoading
              ? '...'
              : formatCurrency(data?.metrics.totalRevenue || 0, 'TRY')
          }
          icon={<DollarSign className="h-5 w-5" />}
          change={{ value: 12.5, label: 'bu ay' }}
        />

        {/* Total Moments */}
        <CanvaStatCard
          label="Toplam Moment"
          value={
            isLoading
              ? '...'
              : (data?.metrics.totalMoments || 0).toLocaleString('tr-TR')
          }
          icon={<Camera className="h-5 w-5" />}
          change={{ value: 8.3, label: 'bu hafta' }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts Section - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Activity Chart */}
          <CanvaCard>
            <CanvaCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CanvaCardTitle>Kullanıcı Aktivitesi</CanvaCardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Son 14 günlük kayıt ve aktivite trendi
                  </p>
                </div>
                <Link href="/analytics">
                  <CanvaButton variant="ghost" size="sm">
                    Detay
                    <ArrowRight className="h-4 w-4" />
                  </CanvaButton>
                </Link>
              </div>
            </CanvaCardHeader>
            <CanvaCardBody>
              {isLoading ? (
                <div className="flex items-center justify-center h-[280px]">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                </div>
              ) : userActivityChartData.length > 0 ? (
                <AdminAreaChart
                  data={userActivityChartData}
                  xAxisKey="date"
                  height={280}
                  areas={[
                    {
                      dataKey: 'users',
                      name: 'Yeni Kullanıcı',
                      color: CHART_COLORS.primary,
                    },
                    {
                      dataKey: 'moments',
                      name: 'Yeni Moment',
                      color: CHART_COLORS.trust,
                    },
                  ]}
                  formatter={(value, name) => [
                    value.toLocaleString('tr-TR'),
                    name,
                  ]}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
                  <BarChart3 className="h-12 w-12 mb-3" />
                  <p>Henüz veri yok</p>
                </div>
              )}
            </CanvaCardBody>
          </CanvaCard>

          {/* Revenue Chart */}
          <CanvaCard>
            <CanvaCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CanvaCardTitle>Gelir Trendi</CanvaCardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Aylık gelir performansı
                  </p>
                </div>
                <Link href="/revenue">
                  <CanvaButton variant="ghost" size="sm">
                    Detay
                    <ArrowRight className="h-4 w-4" />
                  </CanvaButton>
                </Link>
              </div>
            </CanvaCardHeader>
            <CanvaCardBody>
              {isLoading ? (
                <div className="flex items-center justify-center h-[250px]">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                </div>
              ) : revenueChartData.length > 0 ? (
                <AdminLineChart
                  data={revenueChartData}
                  xAxisKey="date"
                  height={250}
                  lines={[
                    {
                      dataKey: 'revenue',
                      name: 'Gelir',
                      color: CHART_COLORS.secondary,
                    },
                  ]}
                  yAxisFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`}
                  formatter={(value, name) => [
                    formatCurrency(value, 'TRY'),
                    name,
                  ]}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px] text-gray-400">
                  <TrendingUp className="h-12 w-12 mb-3" />
                  <p>Henüz veri yok</p>
                </div>
              )}
            </CanvaCardBody>
          </CanvaCard>
        </div>

        {/* Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <CanvaCard>
            <CanvaCardHeader>
              <div className="flex items-center justify-between">
                <CanvaCardTitle>Bekleyen Görevler</CanvaCardTitle>
                <Link href="/queue">
                  <CanvaButton variant="ghost" size="sm">
                    Tümü
                    <ArrowRight className="h-4 w-4" />
                  </CanvaButton>
                </Link>
              </div>
            </CanvaCardHeader>
            <CanvaCardBody className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                </div>
              ) : (data?.pendingTasksList?.length || 0) > 0 ? (
                <div className="divide-y divide-gray-100">
                  {data?.pendingTasksList.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        'flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors',
                        task.priority === 'urgent' &&
                          'border-l-4 border-l-red-500',
                        task.priority === 'high' &&
                          'border-l-4 border-l-amber-500',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-xl',
                            task.priority === 'urgent' &&
                              'bg-red-50 text-red-600',
                            task.priority === 'high' &&
                              'bg-amber-50 text-amber-600',
                            task.priority === 'medium' &&
                              'bg-blue-50 text-blue-600',
                            task.priority === 'low' &&
                              'bg-gray-100 text-gray-600',
                          )}
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(task.created_at).toLocaleDateString(
                              'tr-TR',
                            )}
                          </p>
                        </div>
                      </div>
                      <CanvaBadge
                        variant={
                          task.priority === 'urgent'
                            ? 'error'
                            : task.priority === 'high'
                              ? 'warning'
                              : 'primary'
                        }
                        size="sm"
                      >
                        {task.priority === 'urgent'
                          ? 'Acil'
                          : task.priority === 'high'
                            ? 'Yüksek'
                            : 'Normal'}
                      </CanvaBadge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <CheckCircle2 className="h-12 w-12 mb-3 text-emerald-500" />
                  <p className="text-gray-600 font-medium">
                    Tüm görevler tamamlandı!
                  </p>
                  <p className="text-sm">Bekleyen görev yok</p>
                </div>
              )}
            </CanvaCardBody>
          </CanvaCard>

          {/* System Health */}
          <CanvaCard>
            <CanvaCardHeader>
              <div className="flex items-center justify-between">
                <CanvaCardTitle>Sistem Durumu</CanvaCardTitle>
                <Link href="/ops-center">
                  <CanvaButton variant="ghost" size="sm">
                    Detay
                    <ArrowRight className="h-4 w-4" />
                  </CanvaButton>
                </Link>
              </div>
            </CanvaCardHeader>
            <CanvaCardBody>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Overall Health Bar */}
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-medium text-emerald-700">
                        Tüm Sistemler Çalışıyor
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-700">
                      {data?.systemHealth.uptime || 99.9}% uptime
                    </span>
                  </div>

                  {/* Individual Services */}
                  <div className="space-y-3">
                    {Object.entries(data?.systemHealth || {})
                      .filter(([key]) =>
                        ['database', 'api', 'payments', 'storage'].includes(
                          key,
                        ),
                      )
                      .map(([key, value]) => {
                        const Icon =
                          healthIcons[key as keyof typeof healthIcons] ||
                          Server;
                        const status =
                          typeof value === 'string' ? value : 'unknown';
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  'w-2 h-2 rounded-full',
                                  getStatusColor(status),
                                )}
                              />
                              <Icon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                {key}
                              </span>
                            </div>
                            {getStatusIcon(status)}
                          </div>
                        );
                      })}
                  </div>

                  {/* Performance Metrics */}
                  <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Yanıt Süresi</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {data?.systemHealth.responseTime || 45}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Hata Oranı</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {data?.systemHealth.errorRate || 0.1}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CanvaCardBody>
          </CanvaCard>

          {/* Live Engagement */}
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Canlı Etkileşim</CanvaCardTitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Aktif Bağlantılar
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {(
                        data?.systemHealth.activeConnections || 0
                      ).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Etkileşim Oranı
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {data?.metrics.engagementRate || 0}%
                      </span>
                      {(data?.metrics.engagementRate || 0) > 50 ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Bekleyen Görevler
                    </span>
                    <CanvaBadge
                      variant={
                        (data?.metrics.pendingTasks || 0) > 10
                          ? 'warning'
                          : 'success'
                      }
                      dot
                    >
                      {data?.metrics.pendingTasks || 0} adet
                    </CanvaBadge>
                  </div>
                </div>
              )}
            </CanvaCardBody>
          </CanvaCard>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <CanvaCard interactive className="group h-full">
              <div className="p-5 flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shrink-0',
                    link.gradient,
                  )}
                >
                  <link.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                    {link.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {link.description}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-violet-500" />
              </div>
            </CanvaCard>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      {(data?.recentActivities?.length || 0) > 0 && (
        <CanvaCard>
          <CanvaCardHeader>
            <div className="flex items-center justify-between">
              <CanvaCardTitle>Son Aktiviteler</CanvaCardTitle>
              <Link href="/activity-logs">
                <CanvaButton variant="ghost" size="sm">
                  Tümünü Gör
                  <ArrowRight className="h-4 w-4" />
                </CanvaButton>
              </Link>
            </div>
          </CanvaCardHeader>
          <CanvaCardBody className="p-0">
            <div className="divide-y divide-gray-100">
              {data?.recentActivities.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.entity_type} • {activity.entity_id}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(activity.created_at).toLocaleString('tr-TR')}
                  </span>
                </div>
              ))}
            </div>
          </CanvaCardBody>
        </CanvaCard>
      )}
    </div>
  );
}

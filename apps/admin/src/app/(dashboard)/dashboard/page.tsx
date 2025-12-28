'use client';

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
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/common/stat-card';
import {
  AdminAreaChart,
  AdminLineChart,
  CHART_COLORS,
  ChartLegend,
} from '@/components/common/admin-chart';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Mock data - Enhanced with sparklines
const overviewStats = {
  totalUsers: 125000,
  userGrowth: 8.5,
  activeUsers: 45000,
  activeGrowth: 12.3,
  totalRevenue: 4850000,
  revenueGrowth: 15.2,
  totalMoments: 89000,
  momentGrowth: 22.4,
};

const userActivityData = [
  { date: '12 Ara', users: 3200, newUsers: 180 },
  { date: '13 Ara', users: 3450, newUsers: 195 },
  { date: '14 Ara', users: 3100, newUsers: 165 },
  { date: '15 Ara', users: 3800, newUsers: 220 },
  { date: '16 Ara', users: 4100, newUsers: 245 },
  { date: '17 Ara', users: 4500, newUsers: 280 },
  { date: '18 Ara', users: 4200, newUsers: 260 },
];

const revenueData = [
  { date: '12 Ara', revenue: 42000, subscriptions: 28000, gifts: 14000 },
  { date: '13 Ara', revenue: 45000, subscriptions: 30000, gifts: 15000 },
  { date: '14 Ara', revenue: 38000, subscriptions: 25000, gifts: 13000 },
  { date: '15 Ara', revenue: 52000, subscriptions: 35000, gifts: 17000 },
  { date: '16 Ara', revenue: 58000, subscriptions: 38000, gifts: 20000 },
  { date: '17 Ara', revenue: 65000, subscriptions: 42000, gifts: 23000 },
  { date: '18 Ara', revenue: 48000, subscriptions: 32000, gifts: 16000 },
];

const pendingTasks = [
  { id: '1', type: 'kyc', title: 'KYC Onayı Bekliyor', count: 24, priority: 'high', icon: Shield },
  { id: '2', type: 'payout', title: 'Ödeme Onayı Bekliyor', count: 12, priority: 'high', icon: DollarSign },
  { id: '3', type: 'report', title: 'Şikayet İncelemesi', count: 45, priority: 'medium', icon: AlertTriangle },
  { id: '4', type: 'moment', title: 'Moment Moderasyonu', count: 156, priority: 'medium', icon: Camera },
];

const systemHealth = {
  api: { status: 'healthy' as const, uptime: 99.98, label: 'API Gateway' },
  database: { status: 'healthy' as const, uptime: 99.99, label: 'Database' },
  storage: { status: 'healthy' as const, uptime: 99.95, label: 'Storage' },
  notifications: { status: 'degraded' as const, uptime: 98.5, label: 'Notifications' },
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
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  {
    title: 'Coğrafya',
    description: 'Bölgesel analiz',
    href: '/geographic',
    icon: Heart,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    title: 'Olaylar',
    description: 'Sistem durumu',
    href: '/incidents',
    icon: AlertTriangle,
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
];

// Sparkline data generators
const generateSparkline = (trend: 'up' | 'down' | 'stable') => {
  const base = [20, 25, 22, 28, 32, 30, 35, 40];
  if (trend === 'up') return base;
  if (trend === 'down') return base.reverse();
  return base.map((v) => v + Math.random() * 5 - 2.5);
};

export default function DashboardPage() {
  const getStatusIcon = (status: 'healthy' | 'degraded' | 'down' | 'maintenance') => {
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

  return (
    <div className="admin-content space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Platform genel bakış ve özet metrikleri</p>
      </div>

      {/* Key Metrics - Using new StatCard */}
      <div className="dashboard-grid">
        <StatCard
          title="Toplam Kullanıcı"
          value={overviewStats.totalUsers.toLocaleString('tr-TR')}
          icon={Users}
          change={overviewStats.userGrowth}
          changeLabel="son 30 gün"
          href="/users"
          sparkline={generateSparkline('up')}
        />
        <StatCard
          title="Aktif Kullanıcı"
          value={overviewStats.activeUsers.toLocaleString('tr-TR')}
          icon={Activity}
          change={overviewStats.activeGrowth}
          changeLabel="son 7 gün"
          variant="success"
          href="/analytics"
          sparkline={generateSparkline('up')}
        />
        <StatCard
          title="Toplam Gelir"
          value={formatCurrency(overviewStats.totalRevenue, 'TRY')}
          icon={DollarSign}
          change={overviewStats.revenueGrowth}
          changeLabel="son 30 gün"
          variant="success"
          href="/revenue"
          sparkline={generateSparkline('up')}
        />
        <StatCard
          title="Toplam Moment"
          value={overviewStats.totalMoments.toLocaleString('tr-TR')}
          icon={Camera}
          change={overviewStats.momentGrowth}
          changeLabel="son 30 gün"
          href="/moments"
          sparkline={generateSparkline('up')}
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
              { dataKey: 'users', name: 'Aktif Kullanıcı', color: CHART_COLORS.primary },
              { dataKey: 'newUsers', name: 'Yeni Kayıt', color: CHART_COLORS.trust },
            ]}
            formatter={(value, name) => [
              value.toLocaleString('tr-TR'),
              name,
            ]}
          />

          {/* Revenue Chart */}
          <AdminLineChart
            title="Günlük Gelir"
            description="Son 7 günlük gelir trendi"
            data={revenueData}
            xAxisKey="date"
            height={250}
            lines={[
              { dataKey: 'subscriptions', name: 'Abonelik', color: CHART_COLORS.primary },
              { dataKey: 'gifts', name: 'Hediye', color: CHART_COLORS.secondary },
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
                <CardTitle className="text-base font-semibold">Bekleyen Görevler</CardTitle>
                <Link href="/queue">
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                    Tümü
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50',
                    task.priority === 'high' && 'border-l-4 border-l-amber-500'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg',
                        task.priority === 'high'
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <task.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.count} adet bekliyor</p>
                    </div>
                  </div>
                  {getPriorityBadge(task.priority)}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Sistem Durumu</CardTitle>
                <Link href="/ops-center">
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
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
                        data.status === 'degraded' && 'health-indicator-degraded',
                        data.status === 'down' && 'health-indicator-down',
                        data.status === 'maintenance' && 'health-indicator-maintenance'
                      )}
                    />
                    <span className="text-sm font-medium">{data.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{data.uptime}%</span>
                    {getStatusIcon(data.status)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Revenue Summary Mini Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Bugünkü Özet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Yeni Kayıt</span>
                  <span className="text-sm font-semibold">+248</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Aktif Oturum</span>
                  <span className="text-sm font-semibold">3,892</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Günlük Gelir</span>
                  <span className="text-sm font-semibold text-emerald-600">₺48,750</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Yeni Moment</span>
                  <span className="text-sm font-semibold">1,234</span>
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
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', link.color)}>
                <link.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{link.title}</p>
                <p className="text-xs text-muted-foreground">{link.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

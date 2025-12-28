'use client';

/**
 * TravelMatch Admin Dashboard V2
 * "Cinematic Travel + Trust Jewelry" Design
 */

import {
  Users,
  Activity,
  DollarSign,
  Camera,
  ArrowRight,
  BarChart3,
  Globe,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StatCard } from '@/components/common/stat-card';
import { cn } from '@/lib/utils';

// Mock data
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
  { date: '12 Ara', revenue: 42000, gifts: 28 },
  { date: '13 Ara', revenue: 45000, gifts: 32 },
  { date: '14 Ara', revenue: 38000, gifts: 24 },
  { date: '15 Ara', revenue: 52000, gifts: 38 },
  { date: '16 Ara', revenue: 58000, gifts: 42 },
  { date: '17 Ara', revenue: 65000, gifts: 48 },
  { date: '18 Ara', revenue: 48000, gifts: 35 },
];

const pendingTasks = [
  { id: '1', type: 'kyc', title: 'KYC Onayı Bekliyor', count: 24, priority: 'high', icon: Shield },
  { id: '2', type: 'payout', title: 'Ödeme Onayı Bekliyor', count: 12, priority: 'high', icon: DollarSign },
  { id: '3', type: 'report', title: 'Şikayet İncelemesi', count: 45, priority: 'medium', icon: AlertTriangle },
  { id: '4', type: 'moment', title: 'Moment Moderasyonu', count: 156, priority: 'medium', icon: Camera },
];

const systemHealth = [
  { name: 'API', status: 'healthy', uptime: 99.98 },
  { name: 'Database', status: 'healthy', uptime: 99.99 },
  { name: 'Storage', status: 'healthy', uptime: 99.95 },
  { name: 'Notifications', status: 'degraded', uptime: 98.5 },
];

const recentActivity = [
  { id: '1', type: 'user', message: 'Yeni kullanıcı kaydı: Ahmet Y.', time: '2 dk önce', color: 'bg-primary' },
  { id: '2', type: 'payment', message: 'Premium abonelik: ₺149.99', time: '5 dk önce', color: 'bg-trust' },
  { id: '3', type: 'gift', message: 'Gift gönderildi: $25', time: '8 dk önce', color: 'bg-secondary' },
  { id: '4', type: 'moment', message: 'Moment onaylandı: #12345', time: '12 dk önce', color: 'bg-accent' },
  { id: '5', type: 'payout', message: 'Ödeme onaylandı: ₺540', time: '15 dk önce', color: 'bg-trust' },
];

const quickLinks = [
  { title: 'Analitik', description: 'Detaylı metrikler', href: '/analytics', icon: BarChart3, color: 'bg-primary/10 text-primary' },
  { title: 'Gelir', description: 'Finansal raporlar', href: '/revenue', icon: DollarSign, color: 'bg-trust/10 text-trust' },
  { title: 'Coğrafya', description: 'Bölgesel analiz', href: '/geographic', icon: Globe, color: 'bg-accent/10 text-accent' },
  { title: 'Olaylar', description: 'Sistem durumu', href: '/incidents', icon: AlertTriangle, color: 'bg-warning/10 text-warning' },
];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="admin-chart-tooltip">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString('tr-TR')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Platform genel bakış ve özet metrikleri
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Son güncelleme: şimdi</span>
          <div className="h-2 w-2 rounded-full bg-trust animate-pulse" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Toplam Kullanıcı"
          value={overviewStats.totalUsers.toLocaleString('tr-TR')}
          change={overviewStats.userGrowth}
          icon={<Users className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Aktif Kullanıcı"
          value={overviewStats.activeUsers.toLocaleString('tr-TR')}
          change={overviewStats.activeGrowth}
          changeLabel="son 7 gün"
          icon={<Activity className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="Toplam Gelir"
          value={formatCurrency(overviewStats.totalRevenue)}
          change={overviewStats.revenueGrowth}
          icon={<DollarSign className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="Toplam Moment"
          value={overviewStats.totalMoments.toLocaleString('tr-TR')}
          change={overviewStats.momentGrowth}
          icon={<Camera className="h-6 w-6" />}
          variant="primary"
        />
      </div>

      {/* Charts & Tasks */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Activity Chart */}
        <div className="lg:col-span-2 admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Kullanıcı Aktivitesi</h3>
              <p className="admin-card-description">Son 7 günlük DAU ve yeni kayıtlar</p>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userActivityData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis dataKey="date" stroke="#78716C" fontSize={12} />
                <YAxis stroke="#78716C" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fill="url(#colorUsers)"
                  name="Aktif Kullanıcı"
                />
                <Area
                  type="monotone"
                  dataKey="newUsers"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#colorNewUsers)"
                  name="Yeni Kayıt"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Bekleyen Görevler</h3>
            <Link href="/queue" className="admin-btn-ghost text-xs px-2 py-1">
              Tümü <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold',
                    task.priority === 'high'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-warning/10 text-warning'
                  )}>
                    {task.count}
                  </div>
                  <span className="text-sm font-medium">{task.title}</span>
                </div>
                <span className={cn(
                  'admin-badge',
                  task.priority === 'high' ? 'admin-badge-danger' : 'admin-badge-warning'
                )}>
                  {task.priority === 'high' ? 'Acil' : 'Normal'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue & System Health */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Günlük Gelir & Gift</h3>
              <p className="admin-card-description">Son 7 günlük gelir ve gift trendi</p>
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis dataKey="date" stroke="#78716C" fontSize={12} />
                <YAxis
                  yAxisId="left"
                  stroke="#78716C"
                  fontSize={12}
                  tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#78716C"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 0 }}
                  name="Gelir (₺)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="gifts"
                  stroke="#EC4899"
                  strokeWidth={2}
                  dot={{ fill: '#EC4899', strokeWidth: 0 }}
                  name="Gift Sayısı"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health & Activity */}
        <div className="space-y-6">
          {/* System Health */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Sistem Durumu</h3>
              <Link href="/ops-center" className="admin-btn-ghost text-xs px-2 py-1">
                Detay <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {systemHealth.map((system) => (
                <div key={system.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'status-dot',
                      system.status === 'healthy' && 'status-healthy',
                      system.status === 'degraded' && 'status-degraded',
                      system.status === 'down' && 'status-down'
                    )} />
                    <span className="text-sm font-medium">{system.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {system.uptime}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Son Aktivite</h3>
            </div>
            <div className="space-y-1">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="admin-activity-item">
                  <div className={cn('admin-activity-dot', activity.color)} />
                  <div className="admin-activity-content">
                    <p className="admin-activity-message">{activity.message}</p>
                    <p className="admin-activity-time">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <div className="admin-quick-link">
              <div className={cn('admin-quick-link-icon', link.color)}>
                <link.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="admin-quick-link-title">{link.title}</p>
                <p className="admin-quick-link-description">{link.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

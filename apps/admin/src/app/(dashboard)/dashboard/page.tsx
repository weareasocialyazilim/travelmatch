'use client';

import {
  Users,
  Heart,
  Camera,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  ArrowRight,
  BarChart3,
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
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { formatCurrency, formatDate } from '@/lib/utils';

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
  { date: '12 Ara', revenue: 42000 },
  { date: '13 Ara', revenue: 45000 },
  { date: '14 Ara', revenue: 38000 },
  { date: '15 Ara', revenue: 52000 },
  { date: '16 Ara', revenue: 58000 },
  { date: '17 Ara', revenue: 65000 },
  { date: '18 Ara', revenue: 48000 },
];

const pendingTasks = [
  {
    id: '1',
    type: 'kyc',
    title: 'KYC Onayı Bekliyor',
    count: 24,
    priority: 'high',
  },
  {
    id: '2',
    type: 'payout',
    title: 'Ödeme Onayı Bekliyor',
    count: 12,
    priority: 'high',
  },
  {
    id: '3',
    type: 'report',
    title: 'Şikayet İncelemesi',
    count: 45,
    priority: 'medium',
  },
  {
    id: '4',
    type: 'moment',
    title: 'Moment Moderasyonu',
    count: 156,
    priority: 'medium',
  },
];

const systemHealth = {
  api: { status: 'healthy', uptime: 99.98 },
  database: { status: 'healthy', uptime: 99.99 },
  storage: { status: 'healthy', uptime: 99.95 },
  notifications: { status: 'degraded', uptime: 98.5 },
};

const recentActivity = [
  {
    id: '1',
    type: 'user',
    message: 'Yeni kullanıcı kaydı: Ahmet Y.',
    time: '2 dk önce',
  },
  {
    id: '2',
    type: 'payment',
    message: 'Premium abonelik: ₺149.99',
    time: '5 dk önce',
  },
  {
    id: '3',
    type: 'report',
    message: 'Yeni şikayet alındı',
    time: '8 dk önce',
  },
  {
    id: '4',
    type: 'moment',
    message: 'Moment onaylandı: #12345',
    time: '12 dk önce',
  },
  {
    id: '5',
    type: 'payout',
    message: 'Ödeme onaylandı: ₺540.00',
    time: '15 dk önce',
  },
];

export default function DashboardPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Platform genel bakış ve özet metrikleri
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Toplam Kullanıcı
                </p>
                <p className="text-2xl font-bold">
                  {overviewStats.totalUsers.toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              {overviewStats.userGrowth > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">
                    +{overviewStats.userGrowth}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">
                    {overviewStats.userGrowth}%
                  </span>
                </>
              )}
              <span className="text-muted-foreground">son 30 gün</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Kullanıcı</p>
                <p className="text-2xl font-bold">
                  {overviewStats.activeUsers.toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-600">
                +{overviewStats.activeGrowth}%
              </span>
              <span className="text-muted-foreground">son 7 gün</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Gelir</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(overviewStats.totalRevenue, 'TRY')}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-600">
                +{overviewStats.revenueGrowth}%
              </span>
              <span className="text-muted-foreground">son 30 gün</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Moment</p>
                <p className="text-2xl font-bold">
                  {overviewStats.totalMoments.toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Camera className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-600">
                +{overviewStats.momentGrowth}%
              </span>
              <span className="text-muted-foreground">son 30 gün</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Aktivitesi</CardTitle>
              <CardDescription>
                Son 7 günlük DAU ve yeni kayıtlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                      name="Aktif Kullanıcı"
                    />
                    <Area
                      type="monotone"
                      dataKey="newUsers"
                      stackId="2"
                      stroke="#22c55e"
                      fill="#86efac"
                      name="Yeni Kayıt"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Günlük Gelir</CardTitle>
              <CardDescription>Son 7 günlük gelir trendi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      tickFormatter={(value) =>
                        `₺${(value / 1000).toFixed(0)}K`
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value as number, 'TRY'),
                        'Gelir',
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: '#22c55e' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Bekleyen Görevler</CardTitle>
                <Link href="/queue">
                  <Button variant="ghost" size="sm">
                    Tümü
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${getPriorityColor(
                        task.priority,
                      )}`}
                    >
                      {task.count}
                    </div>
                    <span className="text-sm font-medium">{task.title}</span>
                  </div>
                  <Badge
                    variant={
                      task.priority === 'high' ? 'destructive' : 'secondary'
                    }
                  >
                    {task.priority === 'high' ? 'Acil' : 'Normal'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Sistem Durumu</CardTitle>
                <Link href="/ops-center">
                  <Button variant="ghost" size="sm">
                    Detay
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(systemHealth).map(([key, data]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${getStatusColor(
                        data.status,
                      )}`}
                    />
                    <span className="text-sm font-medium capitalize">
                      {key}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {data.uptime}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Son Aktivite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/analytics">
          <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Analitik</p>
                  <p className="text-sm text-muted-foreground">
                    Detaylı metrikler
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/revenue">
          <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Gelir</p>
                  <p className="text-sm text-muted-foreground">
                    Finansal raporlar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/geographic">
          <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                  <Heart className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Coğrafya</p>
                  <p className="text-sm text-muted-foreground">
                    Bölgesel analiz
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/incidents">
          <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Olaylar</p>
                  <p className="text-sm text-muted-foreground">Sistem durumu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

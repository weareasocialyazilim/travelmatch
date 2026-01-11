'use client';

/**
 * User Lifecycle Management
 * Comprehensive user journey tracking from onboarding to retention
 * With AI-powered churn prediction and lifecycle analytics
 */

import { useState } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  UserMinus,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Clock,
  Calendar,
  Star,
  Heart,
  Zap,
  Brain,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Filter,
  Download,
  ChevronRight,
  Sparkles,
  Gift,
  Bell,
  Mail,
  MessageSquare,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminAreaChart, AdminBarChart } from '@/components/common/admin-chart';
import { cn } from '@/lib/utils';
import { CanvaButton } from '@/components/canva/CanvaButton';
import { CanvaInput } from '@/components/canva/CanvaInput';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
  CanvaCardBody,
  CanvaStatCard,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';

// Lifecycle stage stats
const lifecycleStats = {
  newUsers: { count: 8500, change: 12.5, period: '7 gün' },
  activeUsers: { count: 145000, change: 5.2, period: '30 gün' },
  atRiskUsers: { count: 12400, change: -8.3, period: '14 gün inaktif' },
  churnedUsers: { count: 28900, change: 2.1, period: '30+ gün inaktif' },
  reactivatedUsers: { count: 3200, change: 18.7, period: '7 gün' },
};

// Onboarding funnel
const onboardingFunnel = [
  { stage: 'Kayıt', count: 8500, percentage: 100, color: 'bg-blue-500' },
  {
    stage: 'Email Doğrulama',
    count: 7650,
    percentage: 90,
    color: 'bg-blue-400',
  },
  {
    stage: 'Profil Tamamlama',
    count: 6120,
    percentage: 72,
    color: 'bg-purple-500',
  },
  {
    stage: 'Fotoğraf Yükleme',
    count: 5200,
    percentage: 61,
    color: 'bg-purple-400',
  },
  { stage: 'İlk Eşleşme', count: 3900, percentage: 46, color: 'bg-green-500' },
  { stage: 'İlk Mesaj', count: 2890, percentage: 34, color: 'bg-green-400' },
  {
    stage: 'İlk Rezervasyon',
    count: 1275,
    percentage: 15,
    color: 'bg-orange-500',
  },
];

// Retention cohorts data
const retentionData = [
  { week: 'Hafta 1', retention: 78, users: 6630 },
  { week: 'Hafta 2', retention: 62, users: 5270 },
  { week: 'Hafta 3', retention: 51, users: 4335 },
  { week: 'Hafta 4', retention: 43, users: 3655 },
  { week: 'Hafta 5', retention: 38, users: 3230 },
  { week: 'Hafta 6', retention: 35, users: 2975 },
  { week: 'Hafta 7', retention: 33, users: 2805 },
  { week: 'Hafta 8', retention: 31, users: 2635 },
];

// At-risk users
const atRiskUsers = [
  {
    id: 'usr-001',
    name: 'Ahmet Y.',
    email: 'ahmet.***@gmail.com',
    riskScore: 0.87,
    lastActive: '12 gün önce',
    ltv: 245,
    segment: 'Premium',
    reason: 'Aktivite düşüşü',
  },
  {
    id: 'usr-002',
    name: 'Zeynep K.',
    email: 'zeynep.***@hotmail.com',
    riskScore: 0.79,
    lastActive: '10 gün önce',
    ltv: 180,
    segment: 'Aktif',
    reason: 'Olumsuz deneyim',
  },
  {
    id: 'usr-003',
    name: 'Burak S.',
    email: 'burak.***@gmail.com',
    riskScore: 0.72,
    lastActive: '8 gün önce',
    ltv: 420,
    segment: 'Premium',
    reason: 'Abonelik bitecek',
  },
  {
    id: 'usr-004',
    name: 'Elif T.',
    email: 'elif.***@icloud.com',
    riskScore: 0.68,
    lastActive: '14 gün önce',
    ltv: 95,
    segment: 'Free',
    reason: 'Düşük engagement',
  },
];

// User health metrics
const healthMetrics = [
  { metric: 'Profil Tamamlama', value: 87, target: 95, unit: '%' },
  { metric: 'Haftalık Aktivite', value: 4.2, target: 5, unit: 'gün' },
  { metric: 'Yanıt Oranı', value: 72, target: 80, unit: '%' },
  { metric: 'Rezervasyon Oranı', value: 23, target: 30, unit: '%' },
  { metric: 'NPS Skoru', value: 42, target: 50, unit: '' },
];

// User segments
const userSegments = [
  {
    name: 'Power Users',
    count: 12500,
    percentage: 5,
    avgLTV: 680,
    color: 'bg-green-500',
    description: 'Günlük aktif, yüksek harcama',
  },
  {
    name: 'Regular Users',
    count: 87500,
    percentage: 35,
    avgLTV: 245,
    color: 'bg-blue-500',
    description: 'Haftalık aktif, orta harcama',
  },
  {
    name: 'Occasional Users',
    count: 75000,
    percentage: 30,
    avgLTV: 85,
    color: 'bg-yellow-500',
    description: 'Aylık aktif, düşük harcama',
  },
  {
    name: 'Dormant Users',
    count: 50000,
    percentage: 20,
    avgLTV: 25,
    color: 'bg-orange-500',
    description: '60+ gün inaktif',
  },
  {
    name: 'New Users',
    count: 25000,
    percentage: 10,
    avgLTV: 0,
    color: 'bg-purple-500',
    description: 'Son 30 günde kayıt',
  },
];

// Daily active users trend
const dauTrend = [
  { date: 'Pzt', dau: 45200, wau: 145000, mau: 245000 },
  { date: 'Sal', dau: 48500, wau: 147000, mau: 246000 },
  { date: 'Çar', dau: 51200, wau: 148500, mau: 247500 },
  { date: 'Per', dau: 49800, wau: 149000, mau: 248000 },
  { date: 'Cum', dau: 52400, wau: 150000, mau: 249000 },
  { date: 'Cmt', dau: 61200, wau: 152000, mau: 250000 },
  { date: 'Paz', dau: 58900, wau: 153500, mau: 251000 },
];

export default function UserLifecyclePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kullanıcı Yaşam Döngüsü</h1>
          <p className="text-muted-foreground">
            Onboarding, retention ve churn analitikleri
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Gün</SelectItem>
              <SelectItem value="30d">30 Gün</SelectItem>
              <SelectItem value="90d">90 Gün</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Rapor
          </Button>
        </div>
      </div>

      {/* Lifecycle Stage Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="admin-card border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <UserPlus className="h-5 w-5 text-blue-500" />
              <Badge
                variant="outline"
                className={cn(
                  lifecycleStats.newUsers.change > 0
                    ? 'text-green-500'
                    : 'text-red-500',
                )}
              >
                {lifecycleStats.newUsers.change > 0 ? '+' : ''}
                {lifecycleStats.newUsers.change}%
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">
              {formatNumber(lifecycleStats.newUsers.count)}
            </p>
            <p className="text-xs text-muted-foreground">
              Yeni Kullanıcı ({lifecycleStats.newUsers.period})
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <UserCheck className="h-5 w-5 text-green-500" />
              <Badge variant="outline" className="text-green-500">
                +{lifecycleStats.activeUsers.change}%
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">
              {formatNumber(lifecycleStats.activeUsers.count)}
            </p>
            <p className="text-xs text-muted-foreground">
              Aktif ({lifecycleStats.activeUsers.period})
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <Badge variant="outline" className="text-green-500">
                {lifecycleStats.atRiskUsers.change}%
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">
              {formatNumber(lifecycleStats.atRiskUsers.count)}
            </p>
            <p className="text-xs text-muted-foreground">
              Risk Altında ({lifecycleStats.atRiskUsers.period})
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <UserX className="h-5 w-5 text-red-500" />
              <Badge variant="outline" className="text-red-500">
                +{lifecycleStats.churnedUsers.change}%
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">
              {formatNumber(lifecycleStats.churnedUsers.count)}
            </p>
            <p className="text-xs text-muted-foreground">
              Churn ({lifecycleStats.churnedUsers.period})
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <RotateCcw className="h-5 w-5 text-purple-500" />
              <Badge variant="outline" className="text-green-500">
                +{lifecycleStats.reactivatedUsers.change}%
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">
              {formatNumber(lifecycleStats.reactivatedUsers.count)}
            </p>
            <p className="text-xs text-muted-foreground">
              Reaktivasyon ({lifecycleStats.reactivatedUsers.period})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="onboarding">
            <UserPlus className="h-4 w-4 mr-2" />
            Onboarding
          </TabsTrigger>
          <TabsTrigger value="retention">
            <Heart className="h-4 w-4 mr-2" />
            Retention
          </TabsTrigger>
          <TabsTrigger value="at-risk">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risk Altında
          </TabsTrigger>
          <TabsTrigger value="segments">
            <Users className="h-4 w-4 mr-2" />
            Segmentler
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Aktif Kullanıcı Trendi</CardTitle>
                <CardDescription>DAU / WAU / MAU</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminAreaChart
                  data={dauTrend}
                  xAxisKey="date"
                  series={[
                    { key: 'dau', name: 'DAU', color: '#3b82f6' },
                    { key: 'wau', name: 'WAU', color: '#10b981' },
                  ]}
                  height={250}
                />
              </CardContent>
            </Card>

            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Kullanıcı Sağlık Metrikleri</CardTitle>
                <CardDescription>Platform sağlık göstergeleri</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {healthMetrics.map((metric) => (
                  <div key={metric.metric} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{metric.metric}</span>
                      <span className="font-medium">
                        {metric.value}
                        {metric.unit} / {metric.target}
                        {metric.unit}
                      </span>
                    </div>
                    <Progress
                      value={(metric.value / metric.target) * 100}
                      className={cn(
                        'h-2',
                        (metric.value / metric.target) * 100 >= 80
                          ? '[&>div]:bg-green-500'
                          : (metric.value / metric.target) * 100 >= 60
                            ? '[&>div]:bg-yellow-500'
                            : '[&>div]:bg-red-500',
                      )}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* User Flow Visualization */}
          <Card className="admin-card">
            <CardHeader>
              <CardTitle>Kullanıcı Akışı</CardTitle>
              <CardDescription>
                Yaşam döngüsü aşamaları arası geçişler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                {[
                  {
                    stage: 'Yeni',
                    count: 8500,
                    icon: UserPlus,
                    color: 'bg-blue-500',
                  },
                  {
                    stage: 'Aktif',
                    count: 145000,
                    icon: UserCheck,
                    color: 'bg-green-500',
                  },
                  {
                    stage: 'Risk',
                    count: 12400,
                    icon: AlertTriangle,
                    color: 'bg-yellow-500',
                  },
                  {
                    stage: 'Churn',
                    count: 28900,
                    icon: UserX,
                    color: 'bg-red-500',
                  },
                ].map((item, i, arr) => (
                  <div
                    key={item.stage}
                    className="flex items-center gap-4 flex-1"
                  >
                    <div className="flex-1 text-center p-4 bg-muted/30 rounded-lg">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-full mx-auto flex items-center justify-center',
                          item.color + '/10',
                        )}
                      >
                        <item.icon
                          className={cn(
                            'h-6 w-6',
                            item.color.replace('bg-', 'text-'),
                          )}
                        />
                      </div>
                      <p className="font-semibold mt-2">
                        {formatNumber(item.count)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.stage}
                      </p>
                    </div>
                    {i < arr.length - 1 && (
                      <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onboarding Tab */}
        <TabsContent value="onboarding" className="space-y-4">
          <Card className="admin-card">
            <CardHeader>
              <CardTitle>Onboarding Hunisi</CardTitle>
              <CardDescription>Kayıttan ilk rezervasyona</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {onboardingFunnel.map((step, i) => (
                  <div key={step.stage} className="flex items-center gap-4">
                    <div className="w-40 text-sm font-medium">{step.stage}</div>
                    <div className="flex-1 h-8 bg-muted/30 rounded overflow-hidden relative">
                      <div
                        className={cn('h-full transition-all', step.color)}
                        style={{ width: `${step.percentage}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-between px-3 text-sm">
                        <span className="font-medium text-white mix-blend-difference">
                          {formatNumber(step.count)}
                        </span>
                        <span className="font-semibold">
                          {step.percentage}%
                        </span>
                      </div>
                    </div>
                    {i > 0 && (
                      <div className="w-16 text-right text-sm text-muted-foreground">
                        -
                        {100 -
                          Math.round(
                            (step.count / onboardingFunnel[i - 1].count) * 100,
                          )}
                        %
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            {[
              {
                title: 'Onboarding Tamamlama',
                value: '15%',
                description: 'Tam akış tamamlama',
                icon: Target,
                trend: '+2.3%',
              },
              {
                title: 'Ortalama Süre',
                value: '4.2 gün',
                description: 'İlk rezervasyona kadar',
                icon: Clock,
                trend: '-0.5 gün',
              },
              {
                title: 'Dropout Noktası',
                value: 'Profil',
                description: 'En yüksek kayıp aşaması',
                icon: AlertTriangle,
                trend: '28%',
              },
            ].map((stat) => (
              <Card key={stat.title} className="admin-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-green-500">
                      {stat.trend}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Retention Tab */}
        <TabsContent value="retention" className="space-y-4">
          <Card className="admin-card">
            <CardHeader>
              <CardTitle>Haftalık Retention Kohortları</CardTitle>
              <CardDescription>Ocak 2026 kohort analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminBarChart
                data={retentionData}
                xAxisKey="week"
                series={[
                  { key: 'retention', name: 'Retention %', color: '#3b82f6' },
                ]}
                height={300}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-4 gap-4">
            {[
              { period: 'D1', rate: 72, benchmark: 65 },
              { period: 'D7', rate: 45, benchmark: 40 },
              { period: 'D30', rate: 28, benchmark: 25 },
              { period: 'D90', rate: 18, benchmark: 15 },
            ].map((item) => (
              <Card key={item.period} className="admin-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{item.period} Retention</span>
                    {item.rate > item.benchmark ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-3xl font-bold">{item.rate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Benchmark: {item.benchmark}%
                  </p>
                  <Progress
                    value={(item.rate / 100) * 100}
                    className="h-2 mt-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* At-Risk Tab */}
        <TabsContent value="at-risk" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="admin-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {formatNumber(lifecycleStats.atRiskUsers.count)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Risk Altında
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="admin-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Brain className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">89.2%</p>
                    <p className="text-xs text-muted-foreground">
                      AI Doğruluğu
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="admin-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <RotateCcw className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">32%</p>
                    <p className="text-xs text-muted-foreground">
                      Kurtarma Oranı
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="admin-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Yüksek Riskli Kullanıcılar</CardTitle>
                <Button>
                  <Bell className="h-4 w-4 mr-2" />
                  Toplu Kampanya
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Risk Skoru</TableHead>
                    <TableHead>Son Aktivite</TableHead>
                    <TableHead>LTV</TableHead>
                    <TableHead>Risk Sebebi</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atRiskUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.segment}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={user.riskScore * 100}
                            className={cn(
                              'w-16 h-2',
                              user.riskScore > 0.8
                                ? '[&>div]:bg-red-500'
                                : user.riskScore > 0.6
                                  ? '[&>div]:bg-yellow-500'
                                  : '[&>div]:bg-green-500',
                            )}
                          />
                          <span className="font-medium">
                            {(user.riskScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.lastActive}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(user.ltv)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-yellow-500/10 text-yellow-700"
                        >
                          {user.reason}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Push Gönder"
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Email Gönder"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Hediye Gönder"
                          >
                            <Gift className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-5 gap-4">
            {userSegments.map((segment) => (
              <Card key={segment.name} className="admin-card">
                <CardContent className="p-4">
                  <div
                    className={cn('w-3 h-3 rounded-full mb-2', segment.color)}
                  />
                  <p className="font-medium">{segment.name}</p>
                  <p className="text-2xl font-bold">
                    {formatNumber(segment.count)}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {segment.percentage}% of total
                  </p>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Avg LTV</p>
                    <p className="font-semibold">
                      {formatCurrency(segment.avgLTV)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="admin-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Segment Detayları</CardTitle>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Özel Segment Oluştur
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment</TableHead>
                    <TableHead>Kullanıcı Sayısı</TableHead>
                    <TableHead>Oran</TableHead>
                    <TableHead>Ort. LTV</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userSegments.map((segment) => (
                    <TableRow key={segment.name}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'w-3 h-3 rounded-full',
                              segment.color,
                            )}
                          />
                          <span className="font-medium">{segment.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatNumber(segment.count)}</TableCell>
                      <TableCell>{segment.percentage}%</TableCell>
                      <TableCell>{formatCurrency(segment.avgLTV)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {segment.description}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Kampanya
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

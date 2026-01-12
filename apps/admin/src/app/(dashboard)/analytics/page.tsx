'use client';

import { useState } from 'react';
import {
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Repeat,
  UserPlus,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { CanvaButton } from '@/components/canva/CanvaButton';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
  CanvaCardBody,
  CanvaStatCard,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  useAnalytics,
  useUserMetrics,
  useRevenueMetrics,
  useEngagementMetrics,
} from '@/hooks/use-analytics';
import { Loader2, AlertTriangle } from 'lucide-react';

// Chart data - will be enhanced with real API data
const dailyActiveUsers = [
  { date: '12/12', dau: 3200, mau: 12500 },
  { date: '13/12', dau: 3450, mau: 12600 },
  { date: '14/12', dau: 3100, mau: 12700 },
  { date: '15/12', dau: 3800, mau: 12850 },
  { date: '16/12', dau: 4200, mau: 13000 },
  { date: '17/12', dau: 4500, mau: 13200 },
  { date: '18/12', dau: 4100, mau: 13400 },
];

const revenueData = [
  { date: '12/12', revenue: 12500, transactions: 89 },
  { date: '13/12', revenue: 15200, transactions: 102 },
  { date: '14/12', revenue: 11800, transactions: 78 },
  { date: '15/12', revenue: 18900, transactions: 134 },
  { date: '16/12', revenue: 22400, transactions: 156 },
  { date: '17/12', revenue: 19800, transactions: 142 },
  { date: '18/12', revenue: 24500, transactions: 178 },
];

const userAcquisition = [
  { source: 'Organik', value: 45, color: '#22c55e' },
  { source: 'Referral', value: 25, color: '#3b82f6' },
  { source: 'Sosyal Medya', value: 18, color: '#f59e0b' },
  { source: 'Reklam', value: 12, color: '#ef4444' },
];

const retentionData = [
  { day: 'Gün 1', rate: 100 },
  { day: 'Gün 3', rate: 72 },
  { day: 'Gün 7', rate: 58 },
  { day: 'Gün 14', rate: 45 },
  { day: 'Gün 30', rate: 38 },
  { day: 'Gün 60', rate: 32 },
  { day: 'Gün 90', rate: 28 },
];

const topCities = [
  { city: 'İstanbul', users: 4521, percentage: 35 },
  { city: 'Ankara', users: 2134, percentage: 17 },
  { city: 'İzmir', users: 1856, percentage: 14 },
  { city: 'Antalya', users: 1234, percentage: 10 },
  { city: 'Bursa', users: 987, percentage: 8 },
];

const contentStats = [
  { metric: 'Toplam Moment', value: '24,582', change: '+12%', trend: 'up' },
  { metric: 'Günlük Paylaşım', value: '342', change: '+8%', trend: 'up' },
  { metric: 'Ort. Etkileşim', value: '23.4', change: '-3%', trend: 'down' },
  { metric: 'Onay Oranı', value: '94%', change: '+2%', trend: 'up' },
];

type DateRange = '7d' | '30d' | '90d' | '365d';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('7d');

  // Use real API data
  const { data, isLoading, error } = useAnalytics({ period: dateRange });
  const userMetrics = useUserMetrics(dateRange);
  const revenueMetrics = useRevenueMetrics(dateRange);
  const engagementMetrics = useEngagementMetrics(dateRange);

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">Bir hata oluştu</h2>
          <p className="text-muted-foreground">
            Analitik verileri yüklenemedi. Lütfen tekrar deneyin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analitik</h1>
          <p className="text-muted-foreground">
            Platform performansını ve kullanıcı davranışlarını izleyin
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={dateRange}
            onValueChange={(v) => setDateRange(v as DateRange)}
          >
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Son 7 gün</SelectItem>
              <SelectItem value="30d">Son 30 gün</SelectItem>
              <SelectItem value="90d">Son 90 gün</SelectItem>
              <SelectItem value="365d">Son 1 yıl</SelectItem>
            </SelectContent>
          </Select>
          <CanvaButton variant="primary">
            <Download className="mr-2 h-4 w-4" />
            Rapor İndir
          </CanvaButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <CanvaStatCard
          title="Günlük Aktif Kullanıcı"
          value={isLoading ? '-' : formatNumber(userMetrics.activeUsers || 4521)}
          icon={Users}
          change="+12.5%"
          changeLabel="geçen haftadan"
          trend="up"
        />
        <CanvaStatCard
          title="Günlük Gelir"
          value={isLoading ? '-' : formatCurrency(revenueMetrics.totalRevenue / 30 || 24500)}
          icon={DollarSign}
          change="+23.7%"
          changeLabel="geçen haftadan"
          trend="up"
        />
        <CanvaStatCard
          title="Dönüşüm Oranı"
          value="3.2%"
          icon={Target}
          change="-0.4%"
          changeLabel="geçen haftadan"
          trend="down"
        />
        <CanvaStatCard
          title="Retention (D7)"
          value="58%"
          icon={Repeat}
          change="+5%"
          changeLabel="geçen aydan"
          trend="up"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
          <TabsTrigger value="revenue">Gelir</TabsTrigger>
          <TabsTrigger value="content">İçerik</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* DAU/MAU Chart */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Aktif Kullanıcılar</CanvaCardTitle>
                <CanvaCardSubtitle>DAU ve MAU trendi</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyActiveUsers}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="dau"
                        name="DAU"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                      />
                      <Area
                        type="monotone"
                        dataKey="mau"
                        name="MAU"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CanvaCardBody>
            </CanvaCard>

            {/* Revenue Chart */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Gelir</CanvaCardTitle>
                <CanvaCardSubtitle>Günlük gelir ve işlem sayısı</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(
                          value: number | undefined,
                          name?: string,
                        ) => [
                          name === 'revenue'
                            ? formatCurrency(value ?? 0)
                            : (value ?? 0),
                          name === 'revenue' ? 'Gelir' : 'İşlem',
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="revenue"
                        name="Gelir"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CanvaCardBody>
            </CanvaCard>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* User Acquisition */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Kullanıcı Kazanımı</CanvaCardTitle>
                <CanvaCardSubtitle>Kaynak dağılımı</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userAcquisition}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {userAcquisition.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {userAcquisition.map((item) => (
                    <div key={item.source} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">
                        {item.source} ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CanvaCardBody>
            </CanvaCard>

            {/* Retention Curve */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Retention Eğrisi</CanvaCardTitle>
                <CanvaCardSubtitle>Kullanıcı tutma oranları</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={retentionData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" unit="%" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: '#f59e0b' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CanvaCardBody>
            </CanvaCard>

            {/* Top Cities */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Popüler Şehirler</CanvaCardTitle>
                <CanvaCardSubtitle>Kullanıcı dağılımı</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <div className="space-y-4">
                  {topCities.map((city, index) => (
                    <div key={city.city} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {index + 1}.
                          </span>
                          <span>{city.city}</span>
                        </div>
                        <span className="font-medium">
                          {formatNumber(city.users)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${city.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CanvaCardBody>
            </CanvaCard>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <CanvaStatCard
              title="Yeni Kayıtlar"
              value="234"
              icon={UserPlus}
              changeLabel="Bugün"
            />
            <CanvaStatCard
              title="Aktif Oturumlar"
              value="1,847"
              icon={Activity}
              changeLabel="Şu an"
            />
            <CanvaStatCard
              title="Ort. Oturum Süresi"
              value="12.4 dk"
              icon={Clock}
              changeLabel="Bugün"
            />
            <CanvaStatCard
              title="Churn Oranı"
              value="2.3%"
              icon={TrendingDown}
              changeLabel="Bu ay"
            />
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <CanvaStatCard
              title="Aylık Gelir"
              value={formatCurrency(324500)}
              icon={DollarSign}
              change="+18%"
              changeLabel="geçen aydan"
              trend="up"
            />
            <CanvaStatCard
              title="ARPU"
              value={formatCurrency(24.5)}
              icon={Users}
              changeLabel="Kullanıcı başına"
            />
            <CanvaStatCard
              title="LTV"
              value={formatCurrency(156)}
              icon={TrendingUp}
              changeLabel="Yaşam boyu değer"
            />
            <CanvaStatCard
              title="İade Oranı"
              value="1.8%"
              icon={TrendingDown}
              changeLabel="Bu ay"
            />
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            {contentStats.map((stat) => (
              <CanvaStatCard
                key={stat.metric}
                title={stat.metric}
                value={stat.value}
                icon={BarChart3}
                change={stat.change}
                trend={stat.trend as 'up' | 'down'}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

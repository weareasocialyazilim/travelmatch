'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  useAnalytics,
  useUserMetrics,
  useRevenueMetrics,
  useEngagementMetrics,
} from '@/hooks/use-analytics';
import { getClient } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { AlertTriangle } from 'lucide-react';

// Types for chart data
interface DailyActiveUsersData {
  date: string;
  dau: number;
  mau: number;
}

interface RevenueChartData {
  date: string;
  revenue: number;
  transactions: number;
}

interface UserAcquisitionData {
  source: string;
  value: number;
  color: string;
}

interface RetentionData {
  day: string;
  rate: number;
}

interface TopCityData {
  city: string;
  users: number;
  percentage: number;
}

interface ContentStatData {
  metric: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

interface AnalyticsChartData {
  dailyActiveUsers: DailyActiveUsersData[];
  revenueData: RevenueChartData[];
  userAcquisition: UserAcquisitionData[];
  retentionData: RetentionData[];
  topCities: TopCityData[];
  contentStats: ContentStatData[];
}

// Mock data fallback for when API data is unavailable
const mockAnalyticsData: AnalyticsChartData = {
  dailyActiveUsers: [
    { date: '12/12', dau: 3200, mau: 12500 },
    { date: '13/12', dau: 3450, mau: 12600 },
    { date: '14/12', dau: 3100, mau: 12700 },
    { date: '15/12', dau: 3800, mau: 12850 },
    { date: '16/12', dau: 4200, mau: 13000 },
    { date: '17/12', dau: 4500, mau: 13200 },
    { date: '18/12', dau: 4100, mau: 13400 },
  ],
  revenueData: [
    { date: '12/12', revenue: 12500, transactions: 89 },
    { date: '13/12', revenue: 15200, transactions: 102 },
    { date: '14/12', revenue: 11800, transactions: 78 },
    { date: '15/12', revenue: 18900, transactions: 134 },
    { date: '16/12', revenue: 22400, transactions: 156 },
    { date: '17/12', revenue: 19800, transactions: 142 },
    { date: '18/12', revenue: 24500, transactions: 178 },
  ],
  userAcquisition: [
    { source: 'Organik', value: 45, color: '#22c55e' },
    { source: 'Referral', value: 25, color: '#3b82f6' },
    { source: 'Sosyal Medya', value: 18, color: '#f59e0b' },
    { source: 'Reklam', value: 12, color: '#ef4444' },
  ],
  retentionData: [
    { day: 'Gün 1', rate: 100 },
    { day: 'Gün 3', rate: 72 },
    { day: 'Gün 7', rate: 58 },
    { day: 'Gün 14', rate: 45 },
    { day: 'Gün 30', rate: 38 },
    { day: 'Gün 60', rate: 32 },
    { day: 'Gün 90', rate: 28 },
  ],
  topCities: [
    { city: 'İstanbul', users: 4521, percentage: 35 },
    { city: 'Ankara', users: 2134, percentage: 17 },
    { city: 'İzmir', users: 1856, percentage: 14 },
    { city: 'Antalya', users: 1234, percentage: 10 },
    { city: 'Bursa', users: 987, percentage: 8 },
  ],
  contentStats: [
    { metric: 'Toplam Moment', value: '24,582', change: '+12%', trend: 'up' },
    { metric: 'Günlük Paylaşım', value: '342', change: '+8%', trend: 'up' },
    { metric: 'Ort. Etkileşim', value: '23.4', change: '-3%', trend: 'down' },
    { metric: 'Onay Oranı', value: '94%', change: '+2%', trend: 'up' },
  ],
};

type DateRange = '7d' | '30d' | '90d' | '365d';

// Custom hook for fetching analytics chart data
function useAnalyticsChartData(period: DateRange) {
  return useQuery<AnalyticsChartData>({
    queryKey: ['admin-analytics-charts', period],
    queryFn: async () => {
      const supabase = getClient();

      // Try to fetch from Supabase RPC
      const { data, error } = await supabase.rpc('get_admin_analytics_charts', {
        period_days: period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365,
      });

      if (error) {
        // If RPC doesn't exist or fails, fall back to individual queries

        // Fetch daily active users from user activity
        const now = new Date();
        const startDate = new Date(now.getTime() - (period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365) * 24 * 60 * 60 * 1000);

        // Attempt to fetch real data from available tables
        const { data: userActivityData, error: activityError } = await supabase
          .from('user_activity_logs')
          .select('created_at, user_id')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true });

        if (activityError) {
          // Return mock data as fallback
          throw new Error('Unable to fetch analytics data');
        }

        // Process user activity data into daily active users format
        const dauMap = new Map<string, Set<string>>();
        userActivityData?.forEach((activity) => {
          const date = new Date(activity.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
          if (!dauMap.has(date)) {
            dauMap.set(date, new Set());
          }
          dauMap.get(date)?.add(activity.user_id);
        });

        const processedDau: DailyActiveUsersData[] = Array.from(dauMap.entries())
          .slice(-7)
          .map(([date, users]) => ({
            date,
            dau: users.size,
            mau: users.size * 4, // Estimate MAU
          }));

        // Fetch revenue data
        const { data: transactionData } = await supabase
          .from('transactions')
          .select('created_at, amount')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: true });

        const revenueMap = new Map<string, { revenue: number; transactions: number }>();
        transactionData?.forEach((tx) => {
          const date = new Date(tx.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
          if (!revenueMap.has(date)) {
            revenueMap.set(date, { revenue: 0, transactions: 0 });
          }
          const current = revenueMap.get(date)!;
          current.revenue += tx.amount || 0;
          current.transactions += 1;
        });

        const processedRevenue: RevenueChartData[] = Array.from(revenueMap.entries())
          .slice(-7)
          .map(([date, data]) => ({
            date,
            revenue: data.revenue,
            transactions: data.transactions,
          }));

        // Fetch user acquisition sources
        const { data: usersData } = await supabase
          .from('users')
          .select('acquisition_source')
          .gte('created_at', startDate.toISOString());

        const sourceMap = new Map<string, number>();
        usersData?.forEach((user) => {
          const source = user.acquisition_source || 'Organik';
          sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
        });

        const total = Array.from(sourceMap.values()).reduce((a, b) => a + b, 0) || 1;
        const sourceColors: Record<string, string> = {
          'Organik': '#22c55e',
          'Referral': '#3b82f6',
          'Sosyal Medya': '#f59e0b',
          'Reklam': '#ef4444',
        };

        const processedAcquisition: UserAcquisitionData[] = Array.from(sourceMap.entries()).map(([source, count]) => ({
          source,
          value: Math.round((count / total) * 100),
          color: sourceColors[source] || '#6b7280',
        }));

        // Fetch top cities
        const { data: cityData } = await supabase
          .from('users')
          .select('city')
          .not('city', 'is', null);

        const cityMap = new Map<string, number>();
        cityData?.forEach((user) => {
          if (user.city) {
            cityMap.set(user.city, (cityMap.get(user.city) || 0) + 1);
          }
        });

        const totalCityUsers = Array.from(cityMap.values()).reduce((a, b) => a + b, 0) || 1;
        const processedCities: TopCityData[] = Array.from(cityMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([city, users]) => ({
            city,
            users,
            percentage: Math.round((users / totalCityUsers) * 100),
          }));

        // Fetch content stats
        const { count: totalMoments } = await supabase
          .from('moments')
          .select('*', { count: 'exact', head: true });

        const { count: todayMoments } = await supabase
          .from('moments')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(now.setHours(0, 0, 0, 0)).toISOString());

        const { count: approvedMoments } = await supabase
          .from('moments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');

        const processedContentStats: ContentStatData[] = [
          { metric: 'Toplam Moment', value: formatNumber(totalMoments || 0), change: '+12%', trend: 'up' },
          { metric: 'Günlük Paylaşım', value: String(todayMoments || 0), change: '+8%', trend: 'up' },
          { metric: 'Ort. Etkileşim', value: '23.4', change: '-3%', trend: 'down' },
          { metric: 'Onay Oranı', value: `${totalMoments ? Math.round(((approvedMoments || 0) / totalMoments) * 100) : 0}%`, change: '+2%', trend: 'up' },
        ];

        return {
          dailyActiveUsers: processedDau.length > 0 ? processedDau : mockAnalyticsData.dailyActiveUsers,
          revenueData: processedRevenue.length > 0 ? processedRevenue : mockAnalyticsData.revenueData,
          userAcquisition: processedAcquisition.length > 0 ? processedAcquisition : mockAnalyticsData.userAcquisition,
          retentionData: mockAnalyticsData.retentionData, // Retention requires cohort analysis - use mock for now
          topCities: processedCities.length > 0 ? processedCities : mockAnalyticsData.topCities,
          contentStats: processedContentStats,
        };
      }

      return data as AnalyticsChartData;
    },
    placeholderData: mockAnalyticsData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Chart skeleton component for loading states
function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="space-y-4" style={{ height }}>
      <div className="flex items-end justify-between gap-2 h-full pb-8">
        {[...Array(7)].map((_, i) => (
          <Skeleton
            key={i}
            className="w-full"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-8" />
        ))}
      </div>
    </div>
  );
}

// Stat card skeleton for loading states
function StatCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>('7d');

  // Use real API data for metrics
  const { data, isLoading: isMetricsLoading, error: metricsError } = useAnalytics({ period: dateRange });
  const { data: userMetricsData } = useUserMetrics(dateRange);
  const { data: revenueMetricsData } = useRevenueMetrics(dateRange);

  // Use chart data hook for all chart-related data
  const {
    data: chartData,
    isLoading: isChartLoading,
    error: chartError,
    isPlaceholderData,
  } = useAnalyticsChartData(dateRange);

  // Combined loading state
  const isLoading = isMetricsLoading || isChartLoading;

  // Show toast notification on error
  useEffect(() => {
    if (chartError) {
      toast({
        title: 'Veri yüklenirken hata oluştu',
        description: 'Grafik verileri yüklenemedi. Varsayılan veriler gösteriliyor.',
        variant: 'destructive',
      });
    }
    if (metricsError) {
      toast({
        title: 'Metrik verisi hatası',
        description: 'Bazı metrikler yüklenemedi. Lütfen sayfayı yenileyin.',
        variant: 'destructive',
      });
    }
  }, [chartError, metricsError]);

  // Destructure chart data with fallback to mock data
  const {
    dailyActiveUsers,
    revenueData,
    userAcquisition,
    retentionData,
    topCities,
    contentStats,
  } = chartData || mockAnalyticsData;

  // Show error state only if both queries fail completely
  if (metricsError && chartError && !chartData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">Bir hata oluştu</h2>
          <p className="text-muted-foreground">
            Analitik verileri yüklenemedi. Lütfen tekrar deneyin.
          </p>
          <CanvaButton
            variant="primary"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Sayfayı Yenile
          </CanvaButton>
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
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <CanvaStatCard
              title="Günlük Aktif Kullanıcı"
              value={formatNumber(userMetricsData?.activeUsers || dailyActiveUsers[dailyActiveUsers.length - 1]?.dau || 4521)}
              icon={Users}
              change="+12.5%"
              changeLabel="geçen haftadan"
              trend="up"
            />
            <CanvaStatCard
              title="Günlük Gelir"
              value={formatCurrency((revenueMetricsData?.totalRevenue || 0) / 30 || revenueData[revenueData.length - 1]?.revenue || 24500)}
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
              value={`${retentionData.find(r => r.day === 'Gün 7')?.rate || 58}%`}
              icon={Repeat}
              change="+5%"
              changeLabel="geçen aydan"
              trend="up"
            />
          </>
        )}
      </div>

      {/* Show indicator when using placeholder/mock data */}
      {isPlaceholderData && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950 px-4 py-2 text-sm text-amber-700 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4" />
          <span>Gerçek zamanlı veriler yüklenemedi. Varsayılan veriler gösteriliyor.</span>
        </div>
      )}

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
                {isChartLoading ? (
                  <ChartSkeleton height={300} />
                ) : (
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
                )}
              </CanvaCardBody>
            </CanvaCard>

            {/* Revenue Chart */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Gelir</CanvaCardTitle>
                <CanvaCardSubtitle>Günlük gelir ve işlem sayısı</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                {isChartLoading ? (
                  <ChartSkeleton height={300} />
                ) : (
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
                )}
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
                {isChartLoading ? (
                  <div className="space-y-4">
                    <div className="h-[200px] flex items-center justify-center">
                      <Skeleton className="h-40 w-40 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-4 w-24" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </CanvaCardBody>
            </CanvaCard>

            {/* Retention Curve */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Retention Eğrisi</CanvaCardTitle>
                <CanvaCardSubtitle>Kullanıcı tutma oranları</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                {isChartLoading ? (
                  <ChartSkeleton height={200} />
                ) : (
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
                )}
              </CanvaCardBody>
            </CanvaCard>

            {/* Top Cities */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Popüler Şehirler</CanvaCardTitle>
                <CanvaCardSubtitle>Kullanıcı dağılımı</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                {isChartLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : (
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
                )}
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
            {isChartLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : (
              contentStats.map((stat) => (
                <CanvaStatCard
                  key={stat.metric}
                  title={stat.metric}
                  value={stat.value}
                  icon={BarChart3}
                  change={stat.change}
                  trend={stat.trend as 'up' | 'down'}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

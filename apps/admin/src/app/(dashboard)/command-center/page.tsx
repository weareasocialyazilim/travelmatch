'use client';

/**
 * TravelMatch Command Center
 * CEO/CMO Executive Dashboard - Real-time Platform Overview
 *
 * Tum sirketin nabzini tek bir yerden gormek icin tasarlandi.
 * Kritik KPI'lar, AI insights, entegrasyon durumlari ve anlik alertler.
 */

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Heart,
  MessageSquare,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Globe,
  Smartphone,
  CreditCard,
  Mail,
  MessageCircle,
  Brain,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Lock,
  Camera,
  Star,
  Award,
  RefreshCw,
  Eye,
  Send,
  Bell,
} from 'lucide-react';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
  CanvaCardBody,
  CanvaStatCard,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';
import { CanvaButton } from '@/components/canva/CanvaButton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AdminAreaChart,
  AdminBarChart,
  AdminLineChart,
  CHART_COLORS,
} from '@/components/common/admin-chart';
import { formatCurrency, cn } from '@/lib/utils';
import { useStats } from '@/hooks/use-stats';

// Executive KPI Data
const executiveKPIs = {
  // Finansal
  dailyRevenue: 127450,
  dailyRevenueChange: 12.5,
  monthlyRevenue: 2845000,
  monthlyRevenueChange: 8.3,
  escrowBalance: 456780,
  pendingPayouts: 89450,

  // Kullanici
  totalUsers: 48752,
  activeToday: 8234,
  newToday: 342,
  premiumUsers: 4521,
  premiumConversion: 9.27,

  // Engagement
  totalMoments: 12456,
  activeMoments: 8934,
  matchesToday: 567,
  messagestoday: 23456,
  avgResponseTime: 4.2, // dakika

  // Trust & Safety
  kycPending: 156,
  kycApproved: 234,
  proofsPending: 89,
  proofsVerified: 456,
  disputesOpen: 23,
  disputesResolved: 12,

  // AI Performance
  aiVerificationAccuracy: 94.7,
  priceRecommendationAccuracy: 87.3,
  chatbotResolutionRate: 78.5,
  fraudDetectionRate: 99.2,
};

// Real-time Activity Data
const realtimeActivity = [
  {
    time: '14:32',
    type: 'payment',
    message: 'Yeni odeme: ₺2,450 - Premium abonelik',
    user: 'Ahmet K.',
    status: 'success',
  },
  {
    time: '14:31',
    type: 'match',
    message: 'Yeni eslesme: Istanbul -> Kapadokya',
    user: 'Ayse M.',
    status: 'success',
  },
  {
    time: '14:30',
    type: 'kyc',
    message: 'KYC dogrulama tamamlandi',
    user: 'Mehmet S.',
    status: 'success',
  },
  {
    time: '14:29',
    type: 'dispute',
    message: 'Yeni anlasmazlik acildi',
    user: 'Zeynep A.',
    status: 'warning',
  },
  {
    time: '14:28',
    type: 'proof',
    message: 'Proof onaylandi - AI skoru: 96%',
    user: 'Can B.',
    status: 'success',
  },
  {
    time: '14:27',
    type: 'message',
    message: '150 yeni mesaj gonderildi',
    user: 'Sistem',
    status: 'info',
  },
  {
    time: '14:26',
    type: 'moment',
    message: 'Yeni moment olusturuldu: Bosphorus Tour',
    user: 'Deniz K.',
    status: 'success',
  },
  {
    time: '14:25',
    type: 'escrow',
    message: 'Escrow serbest birakildi: ₺1,200',
    user: 'Ali T.',
    status: 'success',
  },
];

// Integration Status
const integrationStatus = {
  paytr: {
    status: 'healthy',
    latency: 145,
    uptime: 99.98,
    lastCheck: '2 dk once',
  },
  supabase: {
    status: 'healthy',
    latency: 23,
    uptime: 99.99,
    lastCheck: '1 dk once',
  },
  twilio: {
    status: 'healthy',
    latency: 89,
    uptime: 99.95,
    lastCheck: '3 dk once',
  },
  sendgrid: {
    status: 'degraded',
    latency: 320,
    uptime: 98.5,
    lastCheck: '1 dk once',
  },
  cloudflare: {
    status: 'healthy',
    latency: 12,
    uptime: 99.99,
    lastCheck: '30 sn once',
  },
  sentry: {
    status: 'healthy',
    latency: 156,
    uptime: 99.9,
    lastCheck: '2 dk once',
  },
  posthog: {
    status: 'healthy',
    latency: 78,
    uptime: 99.8,
    lastCheck: '1 dk once',
  },
  mlService: {
    status: 'healthy',
    latency: 234,
    uptime: 99.7,
    lastCheck: '1 dk once',
  },
};

// Revenue Trend Data
const revenueTrendData = [
  { date: 'Pzt', revenue: 95000, subscriptions: 65000, gifts: 30000 },
  { date: 'Sal', revenue: 108000, subscriptions: 72000, gifts: 36000 },
  { date: 'Car', revenue: 92000, subscriptions: 61000, gifts: 31000 },
  { date: 'Per', revenue: 125000, subscriptions: 85000, gifts: 40000 },
  { date: 'Cum', revenue: 142000, subscriptions: 95000, gifts: 47000 },
  { date: 'Cmt', revenue: 168000, subscriptions: 112000, gifts: 56000 },
  { date: 'Paz', revenue: 127450, subscriptions: 85000, gifts: 42450 },
];

// User Funnel Data
const userFunnelData = [
  { stage: 'Ziyaretci', count: 125000, rate: 100 },
  { stage: 'Kayit', count: 48752, rate: 39 },
  { stage: 'Profil Tamamlama', count: 38456, rate: 78.9 },
  { stage: 'Ilk Moment', count: 28934, rate: 75.2 },
  { stage: 'Ilk Eslesme', count: 18234, rate: 63 },
  { stage: 'Ilk Odeme', count: 8934, rate: 49 },
  { stage: 'Premium', count: 4521, rate: 50.6 },
];

// Geographic Distribution
const geoData = [
  { city: 'Istanbul', users: 18500, revenue: 850000, growth: 15.2 },
  { city: 'Ankara', users: 8200, revenue: 320000, growth: 12.8 },
  { city: 'Izmir', users: 6100, revenue: 245000, growth: 18.5 },
  { city: 'Antalya', users: 4800, revenue: 420000, growth: 22.3 },
  { city: 'Bodrum', users: 3200, revenue: 380000, growth: 28.7 },
  { city: 'Kapadokya', users: 2100, revenue: 290000, growth: 35.4 },
];

// AI Insights
const aiInsights = [
  {
    type: 'opportunity',
    title: 'Premium Donusum Firsati',
    message: '2,345 kullanici premium icin uygun - kampanya onerisi',
    confidence: 89,
  },
  {
    type: 'warning',
    title: 'Churn Riski',
    message: '156 premium kullanicida churn riski tespit edildi',
    confidence: 76,
  },
  {
    type: 'trend',
    title: 'Trend Analizi',
    message: "Kapadokya moment'leri %35 artis gosteriyor",
    confidence: 94,
  },
  {
    type: 'fraud',
    title: 'Fraud Onleme',
    message: '3 supeli hesap tespit edildi - inceleme bekliyor',
    confidence: 92,
  },
];

export default function CommandCenterPage() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: stats, isLoading } = useStats();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdate(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-emerald-500';
      case 'degraded':
        return 'text-amber-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-emerald-500/10';
      case 'degraded':
        return 'bg-amber-500/10';
      case 'down':
        return 'bg-red-500/10';
      default:
        return 'bg-gray-500/10';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'match':
        return <Heart className="h-4 w-4" />;
      case 'kyc':
        return <Shield className="h-4 w-4" />;
      case 'dispute':
        return <AlertTriangle className="h-4 w-4" />;
      case 'proof':
        return <Camera className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'moment':
        return <Camera className="h-4 w-4" />;
      case 'escrow':
        return <Lock className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-emerald-500 bg-emerald-500/10';
      case 'warning':
        return 'text-amber-500 bg-amber-500/10';
      case 'error':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-blue-500 bg-blue-500/10';
    }
  };

  return (
    <div className="admin-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-500" />
            Command Center
          </h1>
          <p className="text-muted-foreground">
            CEO/CMO Executive Dashboard - Tum platform tek bakista
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Son guncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
          </span>
          <CanvaButton
            variant="secondary"
            size="small"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn('h-4 w-4 mr-2', isRefreshing && 'animate-spin')}
            />
            Yenile
          </CanvaButton>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {executiveKPIs.disputesOpen > 20 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="font-medium text-amber-600">
                Dikkat: {executiveKPIs.disputesOpen} acik anlasmazlik bekliyor
              </p>
              <p className="text-sm text-muted-foreground">
                Acil inceleme gerektiren 5 yuksek oncelikli vaka var
              </p>
            </div>
          </div>
          <CanvaButton
            variant="secondary"
            size="small"
            className="border-amber-500/50 text-amber-600"
          >
            Incele
          </CanvaButton>
        </div>
      )}

      {/* Executive KPIs - 6 Column Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {/* Gunluk Gelir */}
        <CanvaStatCard
          title="Gunluk Gelir"
          value={formatCurrency(executiveKPIs.dailyRevenue, 'TRY')}
          icon={<DollarSign className="h-4 w-4" />}
          trend={{ value: executiveKPIs.dailyRevenueChange, isPositive: true }}
          variant="success"
        />

        {/* Aktif Kullanici */}
        <CanvaStatCard
          title="Aktif Simdi"
          value={executiveKPIs.activeToday.toLocaleString('tr-TR')}
          icon={<Users className="h-4 w-4" />}
          subtitle={`+${executiveKPIs.newToday} bugun`}
          variant="info"
        />

        {/* Eslesmeler */}
        <CanvaStatCard
          title="Bugun Eslesme"
          value={executiveKPIs.matchesToday.toString()}
          icon={<Heart className="h-4 w-4" />}
          trend={{ value: 12.3, isPositive: true }}
          variant="default"
        />

        {/* Escrow */}
        <CanvaStatCard
          title="Escrow Bakiye"
          value={formatCurrency(executiveKPIs.escrowBalance, 'TRY')}
          icon={<Lock className="h-4 w-4" />}
          subtitle="89 bekleyen"
          variant="default"
        />

        {/* Premium Oran */}
        <CanvaStatCard
          title="Premium Oran"
          value={`%${executiveKPIs.premiumConversion}`}
          icon={<Star className="h-4 w-4" />}
          subtitle={`${executiveKPIs.premiumUsers.toLocaleString()} premium`}
          variant="warning"
        />

        {/* AI Dogruluk */}
        <CanvaStatCard
          title="AI Dogruluk"
          value={`%${executiveKPIs.aiVerificationAccuracy}`}
          icon={<Brain className="h-4 w-4" />}
          subtitle="Excellent"
          variant="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <CanvaCard>
            <CanvaCardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CanvaCardTitle>Haftalik Gelir Trendi</CanvaCardTitle>
                  <CardDescription>
                    Abonelik ve hediye gelir dagilimi
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(executiveKPIs.monthlyRevenue, 'TRY')}
                  </p>
                  <p className="text-sm text-muted-foreground">Bu ay toplam</p>
                </div>
              </div>
            </CanvaCardHeader>
            <CanvaCardBody>
              <AdminAreaChart
                data={revenueTrendData}
                xAxisKey="date"
                height={250}
                areas={[
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
                formatter={(value, name) => [
                  formatCurrency(value as number, 'TRY'),
                  name,
                ]}
              />
            </CanvaCardBody>
          </CanvaCard>

          {/* User Funnel */}
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Kullanici Donusum Hunisi</CanvaCardTitle>
              <CardDescription>
                Kayittan premium'a donusum oranlari
              </CardDescription>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="space-y-4">
                {userFunnelData.map((stage, index) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="text-muted-foreground">
                        {stage.count.toLocaleString('tr-TR')} ({stage.rate}%)
                      </span>
                    </div>
                    <Progress
                      value={stage.rate}
                      className="h-2"
                      // Progressive color based on funnel position
                    />
                  </div>
                ))}
              </div>
            </CanvaCardBody>
          </CanvaCard>

          {/* Geographic Distribution */}
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Bolgesel Performans
              </CanvaCardTitle>
              <CardDescription>
                Sehir bazinda kullanici ve gelir dagilimi
              </CardDescription>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="space-y-4">
                {geoData.map((city) => (
                  <div
                    key={city.city}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{city.city}</p>
                        <p className="text-sm text-muted-foreground">
                          {city.users.toLocaleString('tr-TR')} kullanici
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(city.revenue, 'TRY')}
                      </p>
                      <p
                        className={cn(
                          'text-sm flex items-center gap-1',
                          city.growth > 0 ? 'text-emerald-600' : 'text-red-600',
                        )}
                      >
                        {city.growth > 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {city.growth}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </div>

        {/* Right Column - Activity & Status */}
        <div className="space-y-6">
          {/* Real-time Activity Feed */}
          <CanvaCard>
            <CanvaCardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CanvaCardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary animate-pulse" />
                  Canli Aktivite
                </CanvaCardTitle>
                <CanvaBadge variant="outline" className="text-xs">
                  CANLI
                </CanvaBadge>
              </div>
            </CanvaCardHeader>
            <CanvaCardBody>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {realtimeActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={cn(
                          'p-2 rounded-lg',
                          getActivityColor(activity.status),
                        )}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activity.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user} - {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CanvaCardBody>
          </CanvaCard>

          {/* AI Insights */}
          <CanvaCard>
            <CanvaCardHeader className="pb-3">
              <CanvaCardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-cyan-500" />
                AI Insights
              </CanvaCardTitle>
              <CardDescription>Yapay zeka destekli oneriler</CardDescription>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="space-y-3">
                {aiInsights.map((insight, index) => (
                  <div
                    key={index}
                    className={cn(
                      'p-3 rounded-lg border',
                      insight.type === 'opportunity' &&
                        'border-emerald-500/30 bg-emerald-500/5',
                      insight.type === 'warning' &&
                        'border-amber-500/30 bg-amber-500/5',
                      insight.type === 'trend' &&
                        'border-blue-500/30 bg-blue-500/5',
                      insight.type === 'fraud' &&
                        'border-red-500/30 bg-red-500/5',
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {insight.title}
                      </span>
                      <CanvaBadge variant="outline" className="text-xs">
                        %{insight.confidence} guven
                      </CanvaBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {insight.message}
                    </p>
                  </div>
                ))}
              </div>
            </CanvaCardBody>
          </CanvaCard>

          {/* Integration Status */}
          <CanvaCard>
            <CanvaCardHeader className="pb-3">
              <CanvaCardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Entegrasyon Durumu
              </CanvaCardTitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="space-y-3">
                {Object.entries(integrationStatus).map(([name, data]) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          data.status === 'healthy' && 'bg-emerald-500',
                          data.status === 'degraded' &&
                            'bg-amber-500 animate-pulse',
                          data.status === 'down' && 'bg-red-500 animate-pulse',
                        )}
                      />
                      <span className="text-sm font-medium capitalize">
                        {name === 'mlService'
                          ? 'ML Service'
                          : name.charAt(0).toUpperCase() + name.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{data.latency}ms</span>
                      <span className={getStatusColor(data.status)}>
                        {data.uptime}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CanvaCardBody>
          </CanvaCard>

          {/* Quick Actions */}
          <CanvaCard>
            <CanvaCardHeader className="pb-3">
              <CanvaCardTitle>Hizli Islemler</CanvaCardTitle>
            </CanvaCardHeader>
            <CanvaCardBody className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                Kampanya Gonder
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Bell className="h-4 w-4 mr-2" />
                Toplu Bildirim
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                Rapor Olustur
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                size="sm"
              >
                <Shield className="h-4 w-4 mr-2" />
                Guvenlik Taramasi
              </Button>
            </CanvaCardBody>
          </CanvaCard>
        </div>
      </div>

      {/* Bottom Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <CanvaCard className="bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CanvaCardBody className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">KYC Onay Orani</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    (executiveKPIs.kycApproved /
                      (executiveKPIs.kycApproved + executiveKPIs.kycPending)) *
                      100,
                  )}
                  %
                </p>
              </div>
              <Shield className="h-8 w-8 text-emerald-500/50" />
            </div>
            <Progress value={60} className="mt-3 h-1" />
          </CanvaCardBody>
        </CanvaCard>

        <CanvaCard className="bg-gradient-to-br from-blue-500/10 to-transparent">
          <CanvaCardBody className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Proof Dogrulama</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    (executiveKPIs.proofsVerified /
                      (executiveKPIs.proofsVerified +
                        executiveKPIs.proofsPending)) *
                      100,
                  )}
                  %
                </p>
              </div>
              <Camera className="h-8 w-8 text-blue-500/50" />
            </div>
            <Progress value={84} className="mt-3 h-1" />
          </CanvaCardBody>
        </CanvaCard>

        <CanvaCard className="bg-gradient-to-br from-purple-500/10 to-transparent">
          <CanvaCardBody className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Ort. Yanit Suresi
                </p>
                <p className="text-2xl font-bold">
                  {executiveKPIs.avgResponseTime} dk
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500/50" />
            </div>
            <Progress value={85} className="mt-3 h-1" />
          </CanvaCardBody>
        </CanvaCard>

        <CanvaCard className="bg-gradient-to-br from-amber-500/10 to-transparent">
          <CanvaCardBody className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fraud Tespit</p>
                <p className="text-2xl font-bold">
                  %{executiveKPIs.fraudDetectionRate}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500/50" />
            </div>
            <Progress value={99} className="mt-3 h-1" />
          </CanvaCardBody>
        </CanvaCard>
      </div>
    </div>
  );
}

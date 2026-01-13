'use client';

/**
 * TravelMatch Integration Monitoring
 * Tum 3rd party entegrasyonlarin durumu ve metrikleri
 *
 * PayTR, Supabase, Twilio, SendGrid, Cloudflare, Sentry, PostHog
 */

import { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
  RefreshCw,
  Settings,
  ExternalLink,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Wifi,
  WifiOff,
  Server,
  Database,
  CreditCard,
  Mail,
  MessageSquare,
  Cloud,
  Shield,
  Eye,
  Bug,
  Send,
  Image,
  Globe,
  Smartphone,
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
  AdminLineChart,
  CHART_COLORS,
} from '@/components/common/admin-chart';
import { cn } from '@/lib/utils';

// Integration Categories
const integrations = {
  payment: {
    name: 'Odeme',
    icon: CreditCard,
    services: [
      {
        id: 'paytr',
        name: 'PayTR',
        description: 'Turkiye odeme altyapisi',
        status: 'healthy',
        uptime: 99.98,
        latency: 145,
        requests_today: 567,
        errors_today: 2,
        lastCheck: '30 sn once',
        metrics: {
          successRate: 99.6,
          avgResponseTime: 145,
          failedTransactions: 2,
          pendingTransactions: 12,
        },
      },
    ],
  },
  database: {
    name: 'Database',
    icon: Database,
    services: [
      {
        id: 'supabase',
        name: 'Supabase',
        description: 'PostgreSQL + Realtime + Auth',
        status: 'healthy',
        uptime: 99.99,
        latency: 23,
        requests_today: 125678,
        errors_today: 5,
        lastCheck: '15 sn once',
        metrics: {
          connections: 45,
          maxConnections: 100,
          dbSize: '2.4 GB',
          realtimeConnections: 234,
        },
      },
      {
        id: 'redis',
        name: 'Upstash Redis',
        description: 'Cache ve rate limiting',
        status: 'healthy',
        uptime: 99.95,
        latency: 12,
        requests_today: 89456,
        errors_today: 0,
        lastCheck: '20 sn once',
        metrics: {
          hitRate: 94.5,
          missRate: 5.5,
          memory: '256 MB',
          keys: 12456,
        },
      },
    ],
  },
  communication: {
    name: 'Iletisim',
    icon: MessageSquare,
    services: [
      {
        id: 'twilio',
        name: 'Twilio',
        description: 'SMS ve telefon dogrulama',
        status: 'healthy',
        uptime: 99.95,
        latency: 89,
        requests_today: 234,
        errors_today: 1,
        lastCheck: '45 sn once',
        metrics: {
          smsSent: 234,
          smsDelivered: 231,
          deliveryRate: 98.7,
          avgDeliveryTime: 3.2,
        },
      },
      {
        id: 'sendgrid',
        name: 'SendGrid',
        description: 'Email gonderim servisi',
        status: 'degraded',
        uptime: 98.5,
        latency: 320,
        requests_today: 1256,
        errors_today: 15,
        lastCheck: '1 dk once',
        metrics: {
          emailsSent: 1256,
          delivered: 1241,
          bounced: 8,
          opened: 456,
          clicked: 123,
        },
      },
    ],
  },
  storage: {
    name: 'Storage',
    icon: Cloud,
    services: [
      {
        id: 'cloudflare',
        name: 'Cloudflare',
        description: 'CDN ve gorsel optimizasyonu',
        status: 'healthy',
        uptime: 99.99,
        latency: 12,
        requests_today: 456789,
        errors_today: 3,
        lastCheck: '10 sn once',
        metrics: {
          bandwidth: '45.6 GB',
          cacheHitRate: 92.3,
          requests: 456789,
          threats: 12,
        },
      },
      {
        id: 'supabase_storage',
        name: 'Supabase Storage',
        description: 'Dosya depolama',
        status: 'healthy',
        uptime: 99.95,
        latency: 45,
        requests_today: 8934,
        errors_today: 2,
        lastCheck: '25 sn once',
        metrics: {
          totalSize: '12.4 GB',
          filesUploaded: 234,
          filesDeleted: 12,
          bandwidth: '2.3 GB',
        },
      },
    ],
  },
  analytics: {
    name: 'Analytics',
    icon: BarChart3,
    services: [
      {
        id: 'posthog',
        name: 'PostHog',
        description: 'Kullanici analitigii',
        status: 'healthy',
        uptime: 99.8,
        latency: 78,
        requests_today: 34567,
        errors_today: 0,
        lastCheck: '35 sn once',
        metrics: {
          events: 34567,
          users: 8234,
          sessions: 12456,
          featureFlags: 15,
        },
      },
      {
        id: 'sentry',
        name: 'Sentry',
        description: 'Hata izleme ve monitoring',
        status: 'healthy',
        uptime: 99.9,
        latency: 156,
        requests_today: 456,
        errors_today: 0,
        lastCheck: '40 sn once',
        metrics: {
          errorsToday: 23,
          unresolvedErrors: 8,
          resolvedErrors: 45,
          crashFreeRate: 99.2,
        },
      },
    ],
  },
  ai: {
    name: 'AI/ML',
    icon: Zap,
    services: [
      {
        id: 'ml_service',
        name: 'ML Service',
        description: 'FastAPI ML backend',
        status: 'healthy',
        uptime: 99.7,
        latency: 234,
        requests_today: 12456,
        errors_today: 8,
        lastCheck: '20 sn once',
        metrics: {
          modelsActive: 8,
          avgInferenceTime: 234,
          gpuUtilization: 45,
          queueLength: 12,
        },
      },
      {
        id: 'openai',
        name: 'OpenAI',
        description: 'GPT ve embeddings',
        status: 'healthy',
        uptime: 99.5,
        latency: 890,
        requests_today: 2345,
        errors_today: 3,
        lastCheck: '50 sn once',
        metrics: {
          tokensUsed: 1234567,
          completions: 2345,
          embeddings: 890,
          cost: '$12.45',
        },
      },
    ],
  },
};

// Latency History Data
const latencyHistoryData = [
  { time: '00:00', paytr: 145, supabase: 22, twilio: 85, sendgrid: 290 },
  { time: '04:00', paytr: 142, supabase: 21, twilio: 88, sendgrid: 310 },
  { time: '08:00', paytr: 156, supabase: 25, twilio: 92, sendgrid: 340 },
  { time: '12:00', paytr: 168, supabase: 28, twilio: 95, sendgrid: 380 },
  { time: '16:00', paytr: 152, supabase: 24, twilio: 90, sendgrid: 350 },
  { time: '20:00', paytr: 148, supabase: 23, twilio: 87, sendgrid: 320 },
  { time: '24:00', paytr: 145, supabase: 23, twilio: 89, sendgrid: 320 },
];

// Incidents
const recentIncidents = [
  {
    id: 'INC-001',
    service: 'SendGrid',
    type: 'degraded',
    title: 'Yuksek latency tespit edildi',
    description: 'Email gonderim sureleri normalin 2x uzerinde',
    startedAt: '2024-01-10 13:45',
    status: 'investigating',
  },
  {
    id: 'INC-002',
    service: 'Supabase',
    type: 'resolved',
    title: 'Baglanti havuzu doygunlugu',
    description: 'Max connections limit gecikmesi',
    startedAt: '2024-01-10 10:20',
    resolvedAt: '2024-01-10 10:35',
    status: 'resolved',
  },
  {
    id: 'INC-003',
    service: 'PayTR',
    type: 'resolved',
    title: 'Timeout hatasi',
    description: '3 islemde timeout yasandi',
    startedAt: '2024-01-09 16:45',
    resolvedAt: '2024-01-09 16:52',
    status: 'resolved',
  },
];

export default function IntegrationsMonitorPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <CanvaBadge variant="success">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Saglikli
          </CanvaBadge>
        );
      case 'degraded':
        return (
          <CanvaBadge variant="warning" className="animate-pulse">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Yavaslamis
          </CanvaBadge>
        );
      case 'down':
        return (
          <CanvaBadge variant="error" className="animate-pulse">
            <XCircle className="h-3 w-3 mr-1" />
            Erisim Yok
          </CanvaBadge>
        );
      default:
        return <CanvaBadge variant="neutral">{status}</CanvaBadge>;
    }
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return 'text-emerald-600 dark:text-emerald-400';
    if (uptime >= 99) return 'text-blue-600 dark:text-blue-400';
    if (uptime >= 98) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'text-emerald-600 dark:text-emerald-400';
    if (latency < 200) return 'text-blue-600 dark:text-blue-400';
    if (latency < 500) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  // Calculate overall stats
  const allServices = Object.values(integrations).flatMap(
    (cat) => cat.services,
  );
  const healthyCount = allServices.filter((s) => s.status === 'healthy').length;
  const degradedCount = allServices.filter(
    (s) => s.status === 'degraded',
  ).length;
  const downCount = allServices.filter((s) => s.status === 'down').length;
  const avgUptime =
    allServices.reduce((acc, s) => acc + s.uptime, 0) / allServices.length;
  const totalErrors = allServices.reduce((acc, s) => acc + s.errors_today, 0);

  return (
    <div className="admin-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-500 dark:text-amber-400" />
            Integration Monitoring
          </h1>
          <p className="text-muted-foreground">
            Tum 3rd party entegrasyonlarin durumu ve metrikleri
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

      {/* Overall Status */}
      <div className="grid gap-4 md:grid-cols-5">
        <CanvaCard
          className={cn(
            healthyCount === allServices.length
              ? 'border-emerald-500/30 dark:border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10'
              : degradedCount > 0
                ? 'border-amber-500/30 dark:border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10'
                : 'border-red-500/30 dark:border-red-500/40 bg-red-500/5 dark:bg-red-500/10',
          )}
        >
          <CanvaCardHeader>
            <CanvaCardSubtitle>Genel Durum</CanvaCardSubtitle>
            <CanvaCardTitle className="text-xl flex items-center gap-2">
              {healthyCount === allServices.length ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                  Tum Sistemler Calisiyor
                </>
              ) : degradedCount > 0 ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                  Kismi Yavaslik
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                  Sorun Var
                </>
              )}
            </CanvaCardTitle>
          </CanvaCardHeader>
        </CanvaCard>

        <CanvaStatCard
          title="Saglikli"
          value={`${healthyCount}/${allServices.length}`}
          variant="success"
        />

        <CanvaStatCard
          title="Yavaslamis"
          value={degradedCount.toString()}
          variant="warning"
        />

        <CanvaStatCard
          title="Ort. Uptime"
          value={`%${avgUptime.toFixed(2)}`}
          variant={
            avgUptime >= 99.9 ? 'success' : avgUptime >= 99 ? 'info' : 'warning'
          }
        />

        <CanvaStatCard
          title="Bugun Hata"
          value={totalErrors.toString()}
          variant={totalErrors > 10 ? 'error' : 'success'}
        />
      </div>

      {/* Active Incidents */}
      {recentIncidents.filter((i) => i.status !== 'resolved').length > 0 && (
        <CanvaCard className="border-amber-500/30 dark:border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10">
          <CanvaCardHeader>
            <CanvaCardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
              Aktif Olaylar
            </CanvaCardTitle>
          </CanvaCardHeader>
          <CanvaCardBody>
            {recentIncidents
              .filter((i) => i.status !== 'resolved')
              .map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background"
                >
                  <div>
                    <p className="font-medium">{incident.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {incident.service} - {incident.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <CanvaBadge variant="warning">{incident.status}</CanvaBadge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Basladi: {incident.startedAt}
                    </p>
                  </div>
                </div>
              ))}
          </CanvaCardBody>
        </CanvaCard>
      )}

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Genel Bakis</TabsTrigger>
          <TabsTrigger value="latency">Latency</TabsTrigger>
          <TabsTrigger value="incidents">Olaylar</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {Object.entries(integrations).map(([key, category]) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-4">
                <category.icon className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">{category.name}</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {category.services.map((service) => (
                  <CanvaCard
                    key={service.id}
                    className={cn(
                      'hover:shadow-md transition-all',
                      service.status === 'degraded' &&
                        'border-amber-500/30 dark:border-amber-500/40',
                      service.status === 'down' &&
                        'border-red-500/30 dark:border-red-500/40',
                    )}
                  >
                    <CanvaCardHeader>
                      <div className="flex items-center justify-between">
                        <CanvaCardTitle className="text-base">
                          {service.name}
                        </CanvaCardTitle>
                        {getStatusBadge(service.status)}
                      </div>
                      <CanvaCardSubtitle>
                        {service.description}
                      </CanvaCardSubtitle>
                    </CanvaCardHeader>
                    <CanvaCardBody className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Uptime
                          </p>
                          <p
                            className={cn(
                              'text-lg font-bold',
                              getUptimeColor(service.uptime),
                            )}
                          >
                            %{service.uptime}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Latency
                          </p>
                          <p
                            className={cn(
                              'text-lg font-bold',
                              getLatencyColor(service.latency),
                            )}
                          >
                            {service.latency}ms
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Istek</span>
                          <span className="font-medium">
                            {service.requests_today.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Hata</span>
                          <span
                            className={cn(
                              'font-medium',
                              service.errors_today > 0 &&
                                'text-red-600 dark:text-red-400',
                            )}
                          >
                            {service.errors_today}
                          </span>
                        </div>
                      </div>

                      {/* Service-specific metrics */}
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">
                          Metrikler
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(service.metrics)
                            .slice(0, 4)
                            .map(([key, value]) => (
                              <div
                                key={key}
                                className="flex items-center justify-between"
                              >
                                <span className="text-muted-foreground capitalize">
                                  {key.replace(/([A-Z])/g, ' $1')}
                                </span>
                                <span className="font-medium">{value}</span>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                        <span>Son kontrol: {service.lastCheck}</span>
                        <CanvaButton
                          variant="tertiary"
                          size="small"
                          className="h-6 px-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </CanvaButton>
                      </div>
                    </CanvaCardBody>
                  </CanvaCard>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Latency Tab */}
        <TabsContent value="latency" className="space-y-6">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Gunluk Latency Trendi</CanvaCardTitle>
              <CanvaCardSubtitle>
                Ana servislerin response time degisimi
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <AdminLineChart
                data={latencyHistoryData}
                xAxisKey="time"
                height={350}
                lines={[
                  {
                    dataKey: 'paytr',
                    name: 'PayTR',
                    color: CHART_COLORS.primary,
                  },
                  {
                    dataKey: 'supabase',
                    name: 'Supabase',
                    color: CHART_COLORS.trust,
                  },
                  {
                    dataKey: 'twilio',
                    name: 'Twilio',
                    color: CHART_COLORS.secondary,
                  },
                  {
                    dataKey: 'sendgrid',
                    name: 'SendGrid',
                    color: CHART_COLORS.amber,
                  },
                ]}
                yAxisFormatter={(value) => `${value}ms`}
              />
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Son Olaylar</CanvaCardTitle>
              <CanvaCardSubtitle>
                Tum entegrasyon olaylari ve cozumleri
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="space-y-4">
                {recentIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      incident.status === 'resolved'
                        ? 'bg-muted/50'
                        : 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/30 dark:border-amber-500/40',
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {incident.status === 'resolved' ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400 mt-0.5 animate-pulse" />
                        )}
                        <div>
                          <p className="font-medium">{incident.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {incident.service} - {incident.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Basladi: {incident.startedAt}</span>
                            {incident.resolvedAt && (
                              <span>Cozuldu: {incident.resolvedAt}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <CanvaBadge
                        variant={
                          incident.status === 'resolved' ? 'success' : 'warning'
                        }
                      >
                        {incident.status === 'resolved'
                          ? 'Cozuldu'
                          : 'Inceleniyor'}
                      </CanvaBadge>
                    </div>
                  </div>
                ))}
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

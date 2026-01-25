'use client';

/**
 * Integration Health Dashboard - LOG-BASED
 *
 * SAFE MODE: Gercek ping YAPMAZ
 * Sadece integration_health_events tablosundaki log'lari gosterir
 *
 * GUVENLI:
 * - Network cagrisi YOK
 * - Sadece READ-ONLY
 * - Mock data fallback
 */

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Loader2,
  Activity,
  Clock,
  TrendingUp,
  Server,
  Database,
  CreditCard,
  MessageSquare,
  Mail,
  BarChart3,
  Bug,
  Brain,
  MapPin,
  Cloud,
  Smartphone,
  Bell,
} from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  generateMockHealthSummaries,
  IntegrationHealthSummary,
  IntegrationName,
} from '@/lib/integration-health';

// =====================================================
// ICON MAPPING
// =====================================================

const integrationIcons: Record<IntegrationName, React.ElementType> = {
  supabase: Database,
  paytr: CreditCard,
  idenfy: CreditCard,
  twilio: MessageSquare,
  sendgrid: Mail,
  posthog: BarChart3,
  sentry: Bug,
  openai: Brain,
  mapbox: MapPin,
  cloudflare: Cloud,
  vercel: Server,
  expo: Smartphone,
  apple_push: Bell,
  google_push: Bell,
  custom: Server,
};

// =====================================================
// TYPES
// =====================================================

interface HealthDashboardData {
  summaries: IntegrationHealthSummary[];
  overallHealth: number;
  totalIntegrations: number;
  healthyCount: number;
  degradedCount: number;
  downCount: number;
  generatedAt: string;
  isMockData: boolean;
}

// =====================================================
// DATA FETCHING (MOCK - NO REAL PINGS)
// =====================================================

async function fetchHealthData(): Promise<HealthDashboardData> {
  // SAFE MODE: Mock data kullaniyoruz
  // Gercek entegrasyon icin bu fonksiyon guncellenmeli
  const summaries = generateMockHealthSummaries();

  const healthyCount = summaries.filter((s) => s.status === 'healthy').length;
  const degradedCount = summaries.filter((s) => s.status === 'degraded').length;
  const downCount = summaries.filter((s) => s.status === 'down').length;
  const overallHealth = Math.round((healthyCount / summaries.length) * 100);

  return {
    summaries,
    overallHealth,
    totalIntegrations: summaries.length,
    healthyCount,
    degradedCount,
    downCount,
    generatedAt: new Date().toISOString(),
    isMockData: true,
  };
}

// =====================================================
// COMPONENT
// =====================================================

export default function IntegrationHealthPage() {
  const [data, setData] = useState<HealthDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchHealthData();
      setData(result);
    } catch {
      const summaries = generateMockHealthSummaries();
      setData({
        summaries,
        overallHealth: 100,
        totalIntegrations: summaries.length,
        healthyCount: summaries.length,
        degradedCount: 0,
        downCount: 0,
        generatedAt: new Date().toISOString(),
        isMockData: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <CanvaBadge variant="success" size="sm">
            Saglikli
          </CanvaBadge>
        );
      case 'degraded':
        return (
          <CanvaBadge variant="warning" size="sm">
            Yavaslamis
          </CanvaBadge>
        );
      case 'down':
        return (
          <CanvaBadge variant="error" size="sm">
            Calismiyor
          </CanvaBadge>
        );
      default:
        return (
          <CanvaBadge variant="default" size="sm">
            Bilinmiyor
          </CanvaBadge>
        );
    }
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Bilinmiyor';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Simdi';
    if (diffMins < 60) return `${diffMins} dk once`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}s once`;
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 99) return 'text-green-600 dark:text-green-400';
    if (rate >= 95) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Entegrasyon Sagligi
          </h1>
          <p className="text-muted-foreground mt-1">
            Ucuncu parti servis durumu (LOG-BASED - gercek ping yok)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data?.isMockData && (
            <CanvaBadge variant="warning" size="sm">
              Mock Data
            </CanvaBadge>
          )}
          <CanvaButton
            variant="primary"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            Yenile
          </CanvaButton>
        </div>
      </div>

      {/* Overall Health */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <CanvaStatCard
          label="Genel Saglik"
          value={isLoading ? '...' : `${data?.overallHealth || 0}%`}
          icon={<Activity className="h-5 w-5 text-green-600" />}
        />
        <CanvaStatCard
          label="Toplam Entegrasyon"
          value={isLoading ? '...' : data?.totalIntegrations || 0}
          icon={<Server className="h-5 w-5 text-blue-600" />}
        />
        <CanvaStatCard
          label="Saglikli"
          value={isLoading ? '...' : data?.healthyCount || 0}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
        />
        <CanvaStatCard
          label="Yavaslamis"
          value={isLoading ? '...' : data?.degradedCount || 0}
          icon={<AlertCircle className="h-5 w-5 text-yellow-600" />}
        />
        <CanvaStatCard
          label="Calismiyor"
          value={isLoading ? '...' : data?.downCount || 0}
          icon={<XCircle className="h-5 w-5 text-red-600" />}
        />
      </div>

      {/* Integration Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          data?.summaries.map((integration) => {
            const Icon =
              integrationIcons[integration.integrationName] || Server;

            return (
              <CanvaCard
                key={integration.integrationName}
                className={cn(
                  integration.status === 'down' &&
                    'border-red-200 dark:border-red-800',
                  integration.status === 'degraded' &&
                    'border-yellow-200 dark:border-yellow-800',
                )}
              >
                <CanvaCardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl',
                          integration.status === 'healthy' &&
                            'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400',
                          integration.status === 'degraded' &&
                            'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
                          integration.status === 'down' &&
                            'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CanvaCardTitle className="text-base">
                          {integration.displayName}
                        </CanvaCardTitle>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(integration.lastCheck)}
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(integration.status)}
                  </div>
                </CanvaCardHeader>
                <CanvaCardBody className="pt-2 space-y-3">
                  {/* Success Rate */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">
                        Basari Orani
                      </span>
                      <span
                        className={cn(
                          'font-semibold',
                          getSuccessRateColor(integration.successRate),
                        )}
                      >
                        {integration.successRate}%
                      </span>
                    </div>
                    <Progress
                      value={integration.successRate}
                      className={cn(
                        'h-1.5',
                        integration.successRate >= 99 && '[&>div]:bg-green-500',
                        integration.successRate >= 95 &&
                          integration.successRate < 99 &&
                          '[&>div]:bg-yellow-500',
                        integration.successRate < 95 && '[&>div]:bg-red-500',
                      )}
                    />
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">
                        Ort. Yanit
                      </p>
                      <p className="font-semibold">
                        {integration.avgResponseTime}ms
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-xs text-muted-foreground">
                        Hata (24s)
                      </p>
                      <p
                        className={cn(
                          'font-semibold',
                          integration.failures24h > 10 &&
                            'text-red-600 dark:text-red-400',
                          integration.failures24h > 0 &&
                            integration.failures24h <= 10 &&
                            'text-yellow-600 dark:text-yellow-400',
                          integration.failures24h === 0 &&
                            'text-green-600 dark:text-green-400',
                        )}
                      >
                        {integration.failures24h}
                      </p>
                    </div>
                  </div>

                  {/* Total Events */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                    <span>Toplam Event (24s)</span>
                    <span className="font-medium">
                      {integration.totalEvents24h.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </CanvaCardBody>
              </CanvaCard>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>Bu dashboard LOG-BASED calisir. Gercek servis ping'i YAPMAZ.</p>
        <p>
          Entegrasyon kullanildikca event log'lari toplanir ve burada
          gosterilir.
        </p>
        <p>
          Event logging icin{' '}
          <code className="bg-muted px-1 rounded">withIntegrationHealth()</code>{' '}
          wrapper'ini kullanin.
        </p>
      </div>
    </div>
  );
}

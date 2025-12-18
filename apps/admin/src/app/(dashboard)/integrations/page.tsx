'use client';

import { useState } from 'react';
import {
  Plug,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Settings,
  Activity,
  Database,
  CreditCard,
  Bug,
  BarChart3,
  Cloud,
  Image,
  Bell,
  MapPin,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { formatRelativeDate, cn } from '@/lib/utils';

// Mock integration data
const mockIntegrations = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database, Auth & Realtime',
    icon: Database,
    status: 'healthy',
    category: 'core',
    metrics: {
      requests_today: 45892,
      avg_latency: '23ms',
      error_rate: '0.01%',
      uptime: '99.99%',
    },
    last_check: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    webhook_url: 'https://api.travelmatch.app/webhooks/supabase',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payments & Subscriptions',
    icon: CreditCard,
    status: 'healthy',
    category: 'payments',
    metrics: {
      transactions_today: 234,
      volume_today: '₺45,230',
      success_rate: '98.7%',
      disputes: 2,
    },
    last_check: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    webhook_url: 'https://api.travelmatch.app/webhooks/stripe',
  },
  {
    id: 'sentry',
    name: 'Sentry',
    description: 'Error Tracking',
    icon: Bug,
    status: 'warning',
    category: 'monitoring',
    metrics: {
      errors_today: 47,
      errors_weekly: 312,
      affected_users: 23,
      resolved: '89%',
    },
    last_check: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    alert: '47 yeni hata tespit edildi',
  },
  {
    id: 'posthog',
    name: 'PostHog',
    description: 'Product Analytics',
    icon: BarChart3,
    status: 'healthy',
    category: 'analytics',
    metrics: {
      events_today: 125430,
      active_users: 3421,
      sessions: 8923,
      retention: '42%',
    },
    last_check: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    description: 'CDN & Security',
    icon: Cloud,
    status: 'healthy',
    category: 'infrastructure',
    metrics: {
      requests_today: '2.4M',
      bandwidth: '45 GB',
      threats_blocked: 1234,
      cache_hit: '94%',
    },
    last_check: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
  },
  {
    id: 'cloudflare-images',
    name: 'Cloudflare Images',
    description: 'Image Storage & CDN',
    icon: Image,
    status: 'healthy',
    category: 'storage',
    metrics: {
      images_stored: '125K',
      storage_used: '12.4 GB',
      deliveries_today: '890K',
      avg_size: '124 KB',
    },
    last_check: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
  },
  {
    id: 'expo-push',
    name: 'Expo Push',
    description: 'Push Notifications',
    icon: Bell,
    status: 'healthy',
    category: 'notifications',
    metrics: {
      sent_today: 12450,
      delivered: '99.2%',
      opened: '34%',
      failed: 98,
    },
    last_check: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 'mapbox',
    name: 'Mapbox',
    description: 'Maps & Geocoding',
    icon: MapPin,
    status: 'error',
    category: 'maps',
    metrics: {
      requests_today: 8923,
      geocodes: 1234,
      static_maps: 567,
      quota_used: '78%',
    },
    last_check: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
    alert: 'API quota %80\'e ulaştı',
  },
];

const mockWebhookLogs = [
  {
    id: 'w1',
    integration: 'stripe',
    event: 'payment_intent.succeeded',
    status: 'success',
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    response_time: '45ms',
  },
  {
    id: 'w2',
    integration: 'supabase',
    event: 'INSERT:profiles',
    status: 'success',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    response_time: '23ms',
  },
  {
    id: 'w3',
    integration: 'stripe',
    event: 'charge.refunded',
    status: 'success',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    response_time: '67ms',
  },
  {
    id: 'w4',
    integration: 'sentry',
    event: 'issue.created',
    status: 'error',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    response_time: '156ms',
    error: 'Timeout',
  },
];

const statusConfig = {
  healthy: { label: 'Sağlıklı', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle },
  warning: { label: 'Uyarı', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: AlertTriangle },
  error: { label: 'Hata', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', icon: XCircle },
};

const categoryLabels: Record<string, string> = {
  core: 'Çekirdek',
  payments: 'Ödemeler',
  monitoring: 'İzleme',
  analytics: 'Analitik',
  infrastructure: 'Altyapı',
  storage: 'Depolama',
  notifications: 'Bildirimler',
  maps: 'Haritalar',
};

export default function IntegrationsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const healthyCount = mockIntegrations.filter((i) => i.status === 'healthy').length;
  const warningCount = mockIntegrations.filter((i) => i.status === 'warning').length;
  const errorCount = mockIntegrations.filter((i) => i.status === 'error').length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // API call would go here
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entegrasyonlar</h1>
          <p className="text-muted-foreground">
            Tüm harici servislerin durumunu izleyin ve yönetin
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
          {isRefreshing ? 'Kontrol ediliyor...' : 'Durumu Kontrol Et'}
        </Button>
      </div>

      {/* Overall Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Entegrasyon</CardTitle>
            <Plug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockIntegrations.length}</div>
            <p className="text-xs text-muted-foreground">Aktif servis</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sağlıklı</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthyCount}</div>
            <p className="text-xs text-muted-foreground">Sorunsuz çalışıyor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uyarı</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <p className="text-xs text-muted-foreground">Dikkat gerektiriyor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hata</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <p className="text-xs text-muted-foreground">Müdahale gerekli</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">
            <Plug className="mr-2 h-4 w-4" />
            Servisler
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <Zap className="mr-2 h-4 w-4" />
            Webhook Logları
          </TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services">
          <div className="grid gap-4 md:grid-cols-2">
            {mockIntegrations.map((integration) => {
              const status = statusConfig[integration.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;
              const IntegrationIcon = integration.icon;

              return (
                <Card key={integration.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <IntegrationIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          <CardDescription>{integration.description}</CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn('border-0', status.bg, status.color)}
                      >
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {integration.alert && (
                      <div
                        className={cn(
                          'mb-3 rounded-lg p-2 text-sm',
                          integration.status === 'error'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        )}
                      >
                        <AlertTriangle className="mr-1 inline h-4 w-4" />
                        {integration.alert}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {Object.entries(integration.metrics).map(([key, value]) => (
                        <div key={key} className="rounded-lg bg-muted/50 p-2">
                          <p className="text-xs text-muted-foreground">
                            {key.replace(/_/g, ' ')}
                          </p>
                          <p className="font-medium">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        <Clock className="mr-1 inline h-3 w-3" />
                        Son kontrol: {formatRelativeDate(integration.last_check)}
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Logları</CardTitle>
              <CardDescription>
                Son gelen webhook istekleri ve durumları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
                  <div>Entegrasyon</div>
                  <div>Event</div>
                  <div>Durum</div>
                  <div>Süre</div>
                  <div>Zaman</div>
                </div>
                {mockWebhookLogs.map((log) => (
                  <div
                    key={log.id}
                    className="grid grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4 border-b px-4 py-3 text-sm last:border-0"
                  >
                    <div className="font-medium capitalize">{log.integration}</div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {log.event}
                    </div>
                    <Badge
                      variant={log.status === 'success' ? 'success' : 'error'}
                    >
                      {log.status === 'success' ? 'Başarılı' : 'Hata'}
                    </Badge>
                    <div className="text-muted-foreground">{log.response_time}</div>
                    <div className="text-muted-foreground">
                      {formatRelativeDate(log.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

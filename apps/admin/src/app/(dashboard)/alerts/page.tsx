'use client';

/**
 * Real-time Alert Management System
 * Kritik olayların anlık izlenmesi ve yönetimi
 */

import { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  Settings,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Trash2,
  CheckCheck,
  ChevronRight,
  RefreshCw,
  Zap,
  Shield,
  DollarSign,
  Users,
  Server,
  Activity,
  TrendingUp,
  TrendingDown,
  Loader2,
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
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useAlertRules,
  useActiveAlerts,
  useAlertHistory,
  useAcknowledgeAlert,
  useResolveAlert,
  type ActiveAlert,
} from '@/hooks/use-alerts';

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState('all');

  // Fetch data with React Query
  const {
    data: alertRules = [],
    isLoading: isLoadingRules,
    error: rulesError,
  } = useAlertRules();

  const {
    data: fetchedAlerts = [],
    isLoading: isLoadingAlerts,
    error: alertsError,
  } = useActiveAlerts();

  const {
    data: alertHistory = [],
    isLoading: isLoadingHistory,
    error: historyError,
  } = useAlertHistory();

  // Local state for optimistic updates
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);

  // Sync local state with fetched data
  useEffect(() => {
    if (fetchedAlerts.length > 0) {
      setAlerts(fetchedAlerts);
    }
  }, [fetchedAlerts]);

  // Show error toasts
  useEffect(() => {
    if (rulesError) {
      toast.error('Alert kuralları yüklenirken hata oluştu. Mock veri kullanılıyor.');
    }
  }, [rulesError]);

  useEffect(() => {
    if (alertsError) {
      toast.error('Aktif alertler yüklenirken hata oluştu. Mock veri kullanılıyor.');
    }
  }, [alertsError]);

  useEffect(() => {
    if (historyError) {
      toast.error('Alert geçmişi yüklenirken hata oluştu. Mock veri kullanılıyor.');
    }
  }, [historyError]);

  // Mutations
  const acknowledgeAlert = useAcknowledgeAlert();
  const resolveAlert = useResolveAlert();

  const handleAcknowledge = (alertId: string) => {
    // Optimistic update
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId
        ? { ...alert, status: 'acknowledged' as const, acknowledgedBy: 'Admin' }
        : alert
    ));
    toast.success('Alert onaylandı');

    // Fire mutation (best effort, already optimistically updated)
    acknowledgeAlert.mutate(alertId, {
      onError: () => {
        toast.error('Alert onaylanırken hata oluştu (yerel değişiklik korundu)');
      },
    });
  };

  const handleResolve = (alertId: string) => {
    // Optimistic update
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast.success('Alert çözüldü ve kapatıldı');

    // Fire mutation (best effort, already optimistically updated)
    resolveAlert.mutate(alertId, {
      onError: () => {
        toast.error('Alert çözülürken hata oluştu (yerel değişiklik korundu)');
      },
    });
  };

  // Loading state
  const isLoading = isLoadingRules || isLoadingAlerts || isLoadingHistory;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variantMap = {
      critical: 'error',
      high: 'warning',
      medium: 'warning',
      low: 'info',
    } as const;
    return (
      <CanvaBadge variant={variantMap[severity as keyof typeof variantMap] || 'info'}>
        {severity.toUpperCase()}
      </CanvaBadge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'payments':
        return <DollarSign className="h-4 w-4" />;
      case 'operations':
        return <Activity className="h-4 w-4" />;
      case 'engineering':
        return <Server className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return 'Az önce';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} dk önce`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} saat önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const criticalCount = alerts.filter(
    (a) => a.severity === 'critical',
  ).length;
  const highCount = alerts.filter((a) => a.severity === 'high').length;

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Alert Merkezi</h1>
            <p className="text-muted-foreground">
              Gerçek zamanlı sistem ve operasyon alertleri
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Alertler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alert Merkezi</h1>
          <p className="text-muted-foreground">
            Gerçek zamanlı sistem ve operasyon alertleri
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CanvaButton
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            leftIcon={soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          >
            Ses {soundEnabled ? 'Açık' : 'Kapalı'}
          </CanvaButton>
          <Dialog>
            <DialogTrigger asChild>
              <CanvaButton variant="outline" size="sm" leftIcon={<Settings className="h-4 w-4" />}>
                Kuralları Yönet
              </CanvaButton>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Alert Kuralları</DialogTitle>
                <DialogDescription>
                  Hangi durumlarda alert oluşturulacağını yapılandırın
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 max-h-96 overflow-auto">
                {alertRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(rule.category)}
                      <div>
                        <p className="font-medium">{rule.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {rule.condition}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getSeverityBadge(rule.severity)}
                      <Switch checked={rule.enabled} />
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {criticalCount > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <p className="font-semibold text-red-500">
                  {criticalCount} Kritik Alert Aktif
                </p>
                <p className="text-sm text-muted-foreground">
                  Acil müdahale gerekebilir
                </p>
              </div>
            </div>
            <CanvaButton variant="danger" size="sm">
              Hepsini Gör
            </CanvaButton>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <CanvaStatCard
          label="Kritik"
          value={criticalCount}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          className="border-l-4 border-l-red-500"
        />
        <CanvaStatCard
          label="Yüksek"
          value={highCount}
          icon={<AlertCircle className="h-5 w-5 text-orange-500" />}
          className="border-l-4 border-l-orange-500"
        />
        <CanvaStatCard
          label="Toplam Aktif"
          value={alerts.length}
          icon={<Bell className="h-5 w-5 text-gray-400" />}
        />
        <CanvaStatCard
          label="Onaylandı"
          value={alerts.filter((a) => a.status === 'acknowledged').length}
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
          className="border-l-4 border-l-green-500"
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">
              <Zap className="h-4 w-4 mr-2" />
              Aktif ({alerts.length})
            </TabsTrigger>
            <TabsTrigger value="acknowledged">
              <Eye className="h-4 w-4 mr-2" />
              Onaylanan
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="h-4 w-4 mr-2" />
              Geçmiş
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="security">Güvenlik</SelectItem>
                <SelectItem value="payments">Ödemeler</SelectItem>
                <SelectItem value="operations">Operasyon</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="active" className="space-y-3 mt-4">
          {alerts
            .filter((a) => a.status === 'active')
            .sort((a, b) => {
              const order = { critical: 0, high: 1, medium: 2, low: 3 };
              return (
                order[a.severity as keyof typeof order] -
                order[b.severity as keyof typeof order]
              );
            })
            .map((alert) => (
              <CanvaCard
                key={alert.id}
                className={cn(
                  'border-l-4',
                  alert.severity === 'critical'
                    ? 'border-l-red-500 bg-red-500/5'
                    : alert.severity === 'high'
                      ? 'border-l-orange-500 bg-orange-500/5'
                      : 'border-l-yellow-500 bg-yellow-500/5',
                )}
              >
                <CanvaCardBody className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {getSeverityIcon(alert.severity)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{alert.title}</h3>
                          {getSeverityBadge(alert.severity)}
                          <CanvaBadge variant="default" size="sm" icon={getCategoryIcon(alert.category)}>
                            {alert.category}
                          </CanvaBadge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {formatTime(alert.triggeredAt)}
                          </span>
                          {alert.metric && (
                            <span>
                              Değer: {alert.metric.current}
                              {alert.metric.unit} (threshold:{' '}
                              {alert.metric.threshold}
                              {alert.metric.unit})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CanvaButton variant="outline" size="sm" leftIcon={<Eye className="h-4 w-4" />} onClick={() => handleAcknowledge(alert.id)}>
                        Onayla
                      </CanvaButton>
                      <CanvaButton variant="primary" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />} onClick={() => handleResolve(alert.id)}>
                        Çöz
                      </CanvaButton>
                    </div>
                  </div>
                </CanvaCardBody>
              </CanvaCard>
            ))}
        </TabsContent>

        <TabsContent value="acknowledged" className="space-y-3 mt-4">
          {alerts
            .filter((a) => a.status === 'acknowledged')
            .map((alert) => (
              <CanvaCard
                key={alert.id}
                className="border-l-4 border-l-blue-500"
              >
                <CanvaCardBody className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Eye className="h-5 w-5 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">{alert.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {alert.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Onaylayan: {alert.acknowledgedBy} •{' '}
                          {formatTime(alert.triggeredAt)}
                        </p>
                      </div>
                    </div>
                    <CanvaButton variant="primary" size="sm" onClick={() => handleResolve(alert.id)}>
                      Çöz
                    </CanvaButton>
                  </div>
                </CanvaCardBody>
              </CanvaCard>
            ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-3 mt-4">
          {alertHistory.map((alert) => (
            <CanvaCard key={alert.id} className="opacity-75">
              <CanvaCardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <h3 className="font-medium">{alert.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        Çözüldü: {formatTime(alert.resolvedAt)} • Süre:{' '}
                        {alert.duration} • {alert.resolvedBy}
                      </p>
                    </div>
                  </div>
                  {getSeverityBadge(alert.severity)}
                </div>
              </CanvaCardBody>
            </CanvaCard>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

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
} from 'lucide-react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

// Alert types and thresholds
const alertRules = [
  {
    id: 'fraud-spike',
    name: 'Fraud Spike',
    category: 'security',
    condition: 'fraud_count > 10 in 1 hour',
    threshold: 10,
    severity: 'critical',
    enabled: true,
  },
  {
    id: 'payment-failure',
    name: 'Payment Gateway Error Rate',
    category: 'payments',
    condition: 'error_rate > 5%',
    threshold: 5,
    severity: 'critical',
    enabled: true,
  },
  {
    id: 'escrow-expiring',
    name: 'Escrow Expiring Soon',
    category: 'operations',
    condition: 'expires_in < 2 hours',
    threshold: 2,
    severity: 'high',
    enabled: true,
  },
  {
    id: 'proof-queue',
    name: 'Proof Queue Backlog',
    category: 'operations',
    condition: 'pending_proofs > 100',
    threshold: 100,
    severity: 'medium',
    enabled: true,
  },
  {
    id: 'system-latency',
    name: 'High API Latency',
    category: 'engineering',
    condition: 'p95_latency > 500ms',
    threshold: 500,
    severity: 'high',
    enabled: true,
  },
  {
    id: 'user-spike',
    name: 'Unusual User Activity',
    category: 'security',
    condition: 'registrations > 500 in 1 hour',
    threshold: 500,
    severity: 'medium',
    enabled: true,
  },
];

// Active alerts
const activeAlerts = [
  {
    id: 'alert-001',
    ruleId: 'payment-failure',
    title: 'PayTR Error Rate Yükseldi',
    description: 'Son 1 saatte error rate %7.2 (threshold: %5)',
    severity: 'critical',
    category: 'payments',
    triggeredAt: new Date(Date.now() - 45 * 60000),
    acknowledgedBy: null,
    status: 'active',
    metric: { current: 7.2, threshold: 5, unit: '%' },
  },
  {
    id: 'alert-002',
    ruleId: 'escrow-expiring',
    title: '12 Escrow 2 Saat İçinde Expire Olacak',
    description: 'Toplam değer: ₺45,200',
    severity: 'high',
    category: 'operations',
    triggeredAt: new Date(Date.now() - 30 * 60000),
    acknowledgedBy: 'Kemal Y.',
    status: 'acknowledged',
    metric: { current: 12, threshold: 0, unit: 'adet' },
  },
  {
    id: 'alert-003',
    ruleId: 'proof-queue',
    title: 'Proof Queue Birikmesi',
    description: '127 proof manual review bekliyor',
    severity: 'medium',
    category: 'operations',
    triggeredAt: new Date(Date.now() - 2 * 3600000),
    acknowledgedBy: null,
    status: 'active',
    metric: { current: 127, threshold: 100, unit: 'adet' },
  },
  {
    id: 'alert-004',
    ruleId: 'fraud-spike',
    title: 'Potansiyel Fraud Ring Tespit',
    description: '5 hesap aynı device fingerprint ile işlem yapıyor',
    severity: 'critical',
    category: 'security',
    triggeredAt: new Date(Date.now() - 15 * 60000),
    acknowledgedBy: null,
    status: 'active',
    metric: { current: 5, threshold: 3, unit: 'hesap' },
  },
];

// Alert history
const alertHistory = [
  {
    id: 'hist-001',
    title: 'Database Connection Pool Exhausted',
    severity: 'critical',
    resolvedAt: new Date(Date.now() - 24 * 3600000),
    duration: '8 dakika',
    resolvedBy: 'System Auto-recovery',
  },
  {
    id: 'hist-002',
    title: 'Twilio SMS Delivery Failure',
    severity: 'high',
    resolvedAt: new Date(Date.now() - 48 * 3600000),
    duration: '25 dakika',
    resolvedBy: 'Ahmet K.',
  },
];

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState('all');

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
    const styles = {
      critical: 'bg-red-500/10 text-red-500 border-red-500/20',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return (
      <CanvaBadge
        className={styles[severity as keyof typeof styles] || styles.low}
      >
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

  const criticalCount = activeAlerts.filter(
    (a) => a.severity === 'critical',
  ).length;
  const highCount = activeAlerts.filter((a) => a.severity === 'high').length;

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
            variant="primary"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 mr-2" />
            ) : (
              <VolumeX className="h-4 w-4 mr-2" />
            )}
            Ses {soundEnabled ? 'Açık' : 'Kapalı'}
          </CanvaButton>
          <Dialog>
            <DialogTrigger asChild>
              <CanvaButton variant="primary" size="sm">
                <Settings className="h-4 w-4 mr-2" />
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
        <Card className="admin-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-red-500">
                  {criticalCount}
                </p>
                <p className="text-sm text-muted-foreground">Kritik</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="admin-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-orange-500">
                  {highCount}
                </p>
                <p className="text-sm text-muted-foreground">Yüksek</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="admin-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{activeAlerts.length}</p>
                <p className="text-sm text-muted-foreground">Toplam Aktif</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground/20" />
            </div>
          </CardContent>
        </Card>
        <Card className="admin-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-500">
                  {
                    activeAlerts.filter((a) => a.status === 'acknowledged')
                      .length
                  }
                </p>
                <p className="text-sm text-muted-foreground">Onaylandı</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">
              <Zap className="h-4 w-4 mr-2" />
              Aktif ({activeAlerts.length})
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
          {activeAlerts
            .filter((a) => a.status === 'active')
            .sort((a, b) => {
              const order = { critical: 0, high: 1, medium: 2, low: 3 };
              return (
                order[a.severity as keyof typeof order] -
                order[b.severity as keyof typeof order]
              );
            })
            .map((alert) => (
              <Card
                key={alert.id}
                className={cn(
                  'admin-card border-l-4',
                  alert.severity === 'critical'
                    ? 'border-l-red-500 bg-red-500/5'
                    : alert.severity === 'high'
                      ? 'border-l-orange-500 bg-orange-500/5'
                      : 'border-l-yellow-500 bg-yellow-500/5',
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {getSeverityIcon(alert.severity)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{alert.title}</h3>
                          {getSeverityBadge(alert.severity)}
                          <CanvaBadge variant="primary" className="text-xs">
                            {getCategoryIcon(alert.category)}
                            <span className="ml-1">{alert.category}</span>
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
                      <CanvaButton variant="primary" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Onayla
                      </CanvaButton>
                      <CanvaButton variant="primary" size="sm">
                        Çöz
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </CanvaButton>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="acknowledged" className="space-y-3 mt-4">
          {activeAlerts
            .filter((a) => a.status === 'acknowledged')
            .map((alert) => (
              <Card
                key={alert.id}
                className="admin-card border-l-4 border-l-blue-500"
              >
                <CardContent className="p-4">
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
                    <CanvaButton variant="primary" size="sm">
                      Çöz
                    </CanvaButton>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-3 mt-4">
          {alertHistory.map((alert) => (
            <Card key={alert.id} className="admin-card opacity-75">
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

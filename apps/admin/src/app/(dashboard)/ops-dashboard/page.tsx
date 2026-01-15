'use client';

/**
 * Lovendo Ops Dashboard - READ-ONLY Stability Dashboard
 *
 * Bu sayfa ADD-ONLY prensibiyle eklenmistir.
 * Mevcut sistemlere dokunmaz, sadece gozlem ve stabilite metrikleri gosterir.
 *
 * GUVENLI:
 * - Tum veriler READ-ONLY
 * - Mock data fallback
 * - Mevcut akislara etki yok
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Eye,
  FileWarning,
  AlertCircle,
  TrendingUp,
  Activity,
  Camera,
  Flag,
  MessageSquareWarning,
  ShieldAlert,
  Bug,
  Server,
} from 'lucide-react';
import Link from 'next/link';
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
import { cn } from '@/lib/utils';

// =====================================================
// TYPES - READ ONLY DATA STRUCTURES
// =====================================================

interface OpsMetrics {
  pendingProofs: number;
  highRiskItems: number;
  openComplaints: number;
  error24hCount: number;
  systemHealthScore: number;
  avgResponseTime: number;
}

interface PendingProof {
  id: string;
  userId: string;
  userName: string;
  type: 'identity' | 'photo' | 'video' | 'location';
  submittedAt: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  aiRiskScore?: number;
}

interface HighRiskItem {
  id: string;
  type: 'user' | 'moment' | 'transaction' | 'message';
  description: string;
  riskScore: number;
  detectedAt: string;
  reason: string;
}

interface OpenComplaint {
  id: string;
  reporterId: string;
  reportedId: string;
  category: string;
  status: 'open' | 'investigating' | 'pending_review';
  createdAt: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface ErrorEvent {
  id: string;
  type: string;
  message: string;
  count: number;
  lastOccurred: string;
  service: string;
}

interface OpsDashboardData {
  metrics: OpsMetrics;
  pendingProofs: PendingProof[];
  highRiskItems: HighRiskItem[];
  openComplaints: OpenComplaint[];
  recentErrors: ErrorEvent[];
  generatedAt: string;
  isMockData: boolean;
}

// =====================================================
// MOCK DATA - FALLBACK FOR SAFE OPERATION
// =====================================================

const generateMockData = (): OpsDashboardData => {
  return {
    metrics: {
      pendingProofs: 12,
      highRiskItems: 3,
      openComplaints: 7,
      error24hCount: 24,
      systemHealthScore: 98.5,
      avgResponseTime: 145,
    },
    pendingProofs: [
      {
        id: 'pf_1',
        userId: 'usr_001',
        userName: 'Ahmet Y.',
        type: 'identity',
        submittedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        priority: 'urgent',
        aiRiskScore: 0.85,
      },
      {
        id: 'pf_2',
        userId: 'usr_002',
        userName: 'Elif K.',
        type: 'photo',
        submittedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        priority: 'high',
        aiRiskScore: 0.45,
      },
      {
        id: 'pf_3',
        userId: 'usr_003',
        userName: 'Mehmet D.',
        type: 'video',
        submittedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        priority: 'medium',
      },
    ],
    highRiskItems: [
      {
        id: 'hr_1',
        type: 'user',
        description: 'Supheli hesap aktivitesi tespit edildi',
        riskScore: 0.92,
        detectedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        reason: 'Coklu IP degisikligi',
      },
      {
        id: 'hr_2',
        type: 'transaction',
        description: 'Olagan disi odeme patterni',
        riskScore: 0.78,
        detectedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        reason: 'Yuksek frekansta kucuk odemeler',
      },
    ],
    openComplaints: [
      {
        id: 'cmp_1',
        reporterId: 'usr_101',
        reportedId: 'usr_102',
        category: 'harrassment',
        status: 'investigating',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        severity: 'high',
      },
      {
        id: 'cmp_2',
        reporterId: 'usr_103',
        reportedId: 'usr_104',
        category: 'fake_profile',
        status: 'pending_review',
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        severity: 'medium',
      },
    ],
    recentErrors: [
      {
        id: 'err_1',
        type: 'API_ERROR',
        message: 'Supabase connection timeout',
        count: 12,
        lastOccurred: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        service: 'auth',
      },
      {
        id: 'err_2',
        type: 'PAYMENT_ERROR',
        message: 'Stripe webhook verification failed',
        count: 3,
        lastOccurred: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        service: 'payment',
      },
    ],
    generatedAt: new Date().toISOString(),
    isMockData: true,
  };
};

// =====================================================
// DATA FETCHING - SAFE WITH FALLBACK
// =====================================================

async function fetchOpsDashboardData(): Promise<OpsDashboardData> {
  // Bu fonksiyon gercek API'ye baglanmak yerine mock data doner
  // SAFE MODE: Network cagrisi yapmiyoruz
  // Gercek entegrasyon icin bu fonksiyon guncellenmeli
  return generateMockData();
}

// =====================================================
// COMPONENT
// =====================================================

export default function OpsDashboardPage() {
  const [data, setData] = useState<OpsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchOpsDashboardData();
      setData(result);
      setLastRefresh(new Date());
    } catch {
      // Fallback to mock data on any error
      setData(generateMockData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600 dark:text-red-400';
    if (score >= 0.6) return 'text-orange-600 dark:text-orange-400';
    if (score >= 0.4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Simdi';
    if (diffMins < 60) return `${diffMins} dk once`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat once`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} gun once`;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Stabilite Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistem sagligi ve operasyonel metrikler (READ-ONLY)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data?.isMockData && (
            <CanvaBadge variant="warning" size="sm">
              Mock Data
            </CanvaBadge>
          )}
          <span className="text-xs text-muted-foreground">
            Son guncelleme: {lastRefresh.toLocaleTimeString('tr-TR')}
          </span>
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

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <CanvaStatCard
          label="Bekleyen Proof"
          value={isLoading ? '...' : data?.metrics.pendingProofs || 0}
          icon={<Camera className="h-5 w-5 text-blue-600" />}
        />
        <CanvaStatCard
          label="Yuksek Risk"
          value={isLoading ? '...' : data?.metrics.highRiskItems || 0}
          icon={<ShieldAlert className="h-5 w-5 text-red-600" />}
        />
        <CanvaStatCard
          label="Acik Sikayet"
          value={isLoading ? '...' : data?.metrics.openComplaints || 0}
          icon={<MessageSquareWarning className="h-5 w-5 text-orange-600" />}
        />
        <CanvaStatCard
          label="Hata (24s)"
          value={isLoading ? '...' : data?.metrics.error24hCount || 0}
          icon={<Bug className="h-5 w-5 text-purple-600" />}
        />
        <CanvaStatCard
          label="Sistem Sagligi"
          value={isLoading ? '...' : `${data?.metrics.systemHealthScore || 0}%`}
          icon={<Activity className="h-5 w-5 text-green-600" />}
        />
        <CanvaStatCard
          label="Ort. Yanit"
          value={isLoading ? '...' : `${data?.metrics.avgResponseTime || 0}ms`}
          icon={<Clock className="h-5 w-5 text-teal-600" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Proofs */}
        <CanvaCard>
          <CanvaCardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CanvaCardTitle>Bekleyen Dogrulamalar</CanvaCardTitle>
                <CanvaCardSubtitle>
                  Inceleme bekleyen proof talepleri
                </CanvaCardSubtitle>
              </div>
              <Link href="/proof-center">
                <CanvaButton variant="ghost" size="sm">
                  Tumunu Gor
                </CanvaButton>
              </Link>
            </div>
          </CanvaCardHeader>
          <CanvaCardBody className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (data?.pendingProofs?.length || 0) > 0 ? (
              <div className="divide-y divide-border">
                {data?.pendingProofs.slice(0, 5).map((proof) => (
                  <div
                    key={proof.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl',
                          proof.priority === 'urgent' &&
                            'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                          proof.priority === 'high' &&
                            'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
                          proof.priority === 'medium' &&
                            'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
                          proof.priority === 'low' &&
                            'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                        )}
                      >
                        {proof.type === 'identity' && (
                          <Shield className="h-5 w-5" />
                        )}
                        {proof.type === 'photo' && (
                          <Camera className="h-5 w-5" />
                        )}
                        {proof.type === 'video' && <Eye className="h-5 w-5" />}
                        {proof.type === 'location' && (
                          <Flag className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {proof.userName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {proof.type} dogrulamasi -{' '}
                          {formatTimeAgo(proof.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {proof.aiRiskScore !== undefined && (
                        <span
                          className={cn(
                            'text-xs font-medium',
                            getRiskColor(proof.aiRiskScore),
                          )}
                        >
                          Risk: {Math.round(proof.aiRiskScore * 100)}%
                        </span>
                      )}
                      <CanvaBadge
                        variant={
                          proof.priority === 'urgent'
                            ? 'error'
                            : proof.priority === 'high'
                              ? 'warning'
                              : 'default'
                        }
                        size="sm"
                      >
                        {proof.priority === 'urgent'
                          ? 'Acil'
                          : proof.priority === 'high'
                            ? 'Yuksek'
                            : proof.priority === 'medium'
                              ? 'Orta'
                              : 'Dusuk'}
                      </CanvaBadge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-3 text-green-500" />
                <p className="font-medium text-foreground">
                  Tum dogrulamalar tamamlandi!
                </p>
                <p className="text-sm">Bekleyen proof yok</p>
              </div>
            )}
          </CanvaCardBody>
        </CanvaCard>

        {/* High Risk Items */}
        <CanvaCard>
          <CanvaCardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CanvaCardTitle>Yuksek Risk Ogeler</CanvaCardTitle>
                <CanvaCardSubtitle>
                  AI tarafindan tespit edilen riskli aktiviteler
                </CanvaCardSubtitle>
              </div>
              <Link href="/fraud-investigation">
                <CanvaButton variant="ghost" size="sm">
                  Tumunu Gor
                </CanvaButton>
              </Link>
            </div>
          </CanvaCardHeader>
          <CanvaCardBody className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (data?.highRiskItems?.length || 0) > 0 ? (
              <div className="divide-y divide-border">
                {data?.highRiskItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <ShieldAlert className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {item.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.reason} - {formatTimeAgo(item.detectedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-sm font-bold',
                          getRiskColor(item.riskScore),
                        )}
                      >
                        {Math.round(item.riskScore * 100)}%
                      </span>
                      <CanvaBadge variant="error" size="sm">
                        {item.type}
                      </CanvaBadge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mb-3 text-green-500" />
                <p className="font-medium text-foreground">Sistem guvenli!</p>
                <p className="text-sm">Yuksek risk tespit edilmedi</p>
              </div>
            )}
          </CanvaCardBody>
        </CanvaCard>

        {/* Open Complaints */}
        <CanvaCard>
          <CanvaCardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CanvaCardTitle>Acik Sikayetler</CanvaCardTitle>
                <CanvaCardSubtitle>
                  Cozum bekleyen kullanici sikayetleri
                </CanvaCardSubtitle>
              </div>
              <Link href="/disputes">
                <CanvaButton variant="ghost" size="sm">
                  Tumunu Gor
                </CanvaButton>
              </Link>
            </div>
          </CanvaCardHeader>
          <CanvaCardBody className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (data?.openComplaints?.length || 0) > 0 ? (
              <div className="divide-y divide-border">
                {data?.openComplaints.slice(0, 5).map((complaint) => (
                  <div
                    key={complaint.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl',
                          complaint.severity === 'critical' &&
                            'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                          complaint.severity === 'high' &&
                            'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
                          complaint.severity === 'medium' &&
                            'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
                          complaint.severity === 'low' &&
                            'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                        )}
                      >
                        <MessageSquareWarning className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">
                          {complaint.category.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {complaint.status === 'investigating'
                            ? 'Inceleniyor'
                            : complaint.status === 'pending_review'
                              ? 'Onay Bekliyor'
                              : 'Acik'}
                          {' - '}
                          {formatTimeAgo(complaint.createdAt)}
                        </p>
                      </div>
                    </div>
                    <CanvaBadge
                      variant={
                        complaint.severity === 'critical'
                          ? 'error'
                          : complaint.severity === 'high'
                            ? 'warning'
                            : 'default'
                      }
                      size="sm"
                    >
                      {complaint.severity === 'critical'
                        ? 'Kritik'
                        : complaint.severity === 'high'
                          ? 'Yuksek'
                          : complaint.severity === 'medium'
                            ? 'Orta'
                            : 'Dusuk'}
                    </CanvaBadge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-3 text-green-500" />
                <p className="font-medium text-foreground">Harika!</p>
                <p className="text-sm">Acik sikayet yok</p>
              </div>
            )}
          </CanvaCardBody>
        </CanvaCard>

        {/* Recent Errors */}
        <CanvaCard>
          <CanvaCardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CanvaCardTitle>Son 24 Saat Hatalar</CanvaCardTitle>
                <CanvaCardSubtitle>
                  Internal log kayitlarindan toplanan hatalar
                </CanvaCardSubtitle>
              </div>
              <Link href="/system-health">
                <CanvaButton variant="ghost" size="sm">
                  Tumunu Gor
                </CanvaButton>
              </Link>
            </div>
          </CanvaCardHeader>
          <CanvaCardBody className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (data?.recentErrors?.length || 0) > 0 ? (
              <div className="divide-y divide-border">
                {data?.recentErrors.slice(0, 5).map((error) => (
                  <div
                    key={error.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                        <Bug className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {error.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {error.service} - {formatTimeAgo(error.lastOccurred)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CanvaBadge variant="secondary" size="sm">
                        {error.count}x
                      </CanvaBadge>
                      <CanvaBadge variant="default" size="sm">
                        {error.type}
                      </CanvaBadge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Server className="h-12 w-12 mb-3 text-green-500" />
                <p className="font-medium text-foreground">Sistem stabil!</p>
                <p className="text-sm">Son 24 saatte hata yok</p>
              </div>
            )}
          </CanvaCardBody>
        </CanvaCard>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-muted-foreground">
        <p>
          Bu dashboard stabilite izleme amaciyla eklenmiştir. Tum veriler
          READ-ONLY modda gosterilmektedir.
        </p>
        <p className="mt-1">
          Gercek API entegrasyonu icin{' '}
          <code className="bg-muted px-1 rounded">fetchOpsDashboardData()</code>{' '}
          fonksiyonunu guncelleyin.
        </p>
      </div>
    </div>
  );
}

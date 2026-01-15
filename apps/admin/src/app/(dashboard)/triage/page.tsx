'use client';

/**
 * Lovendo Triage Queue - PASSIVE MODE
 *
 * Bu sayfa ADD-ONLY prensibiyle eklenmistir.
 * Default: Sadece goruntumleme
 * Aksiyonlar feature-flag arkasinda (TRIAGE_ACTIONS_ENABLED)
 *
 * GUVENLI:
 * - Default olarak READ-ONLY
 * - Aksiyonlar feature flag arkasinda kapali
 * - Mevcut akislara etki yok
 * - Mock data fallback
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  User,
  Camera,
  CreditCard,
  MessageSquare,
  Flag,
  Filter,
  Search,
  ChevronDown,
  ArrowUpRight,
  Lock,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

// =====================================================
// FEATURE FLAG CHECK (PASSIVE MODE)
// =====================================================

// Actions are DISABLED by default - requires feature flag
const TRIAGE_ACTIONS_ENABLED = false; // Default: PASSIVE MODE

// =====================================================
// TYPES
// =====================================================

interface TriageItem {
  id: string;
  itemType:
    | 'proof_review'
    | 'user_report'
    | 'content_flag'
    | 'fraud_alert'
    | 'kyc_review'
    | 'payment_dispute'
    | 'general';
  sourceType?: string;
  sourceId?: string;
  title: string;
  description?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_review' | 'escalated' | 'resolved' | 'dismissed';
  aiRiskScore?: number;
  aiRiskFactors?: string[];
  assignedTo?: string;
  assignedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

interface TriageStats {
  total: number;
  pending: number;
  inReview: number;
  escalated: number;
  resolved24h: number;
  avgResolutionTime: number; // minutes
}

// =====================================================
// MOCK DATA
// =====================================================

const generateMockData = (): { items: TriageItem[]; stats: TriageStats } => {
  const items: TriageItem[] = [
    {
      id: 'tri_1',
      itemType: 'fraud_alert',
      sourceType: 'user',
      sourceId: 'usr_12345',
      title: 'Supheli hesap aktivitesi',
      description:
        'Kullanici kisa surede birden fazla IP adresinden giris yapti',
      priority: 'critical',
      status: 'pending',
      aiRiskScore: 0.92,
      aiRiskFactors: ['multiple_ip', 'rapid_login', 'new_device'],
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: 'tri_2',
      itemType: 'proof_review',
      sourceType: 'user',
      sourceId: 'usr_23456',
      title: 'Kimlik dogrulama talebi',
      description: 'Kullanici kimlik belgesi yuklemis, AI analizi tamamlandi',
      priority: 'high',
      status: 'pending',
      aiRiskScore: 0.35,
      aiRiskFactors: ['document_quality_low'],
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 'tri_3',
      itemType: 'user_report',
      sourceType: 'user',
      sourceId: 'usr_34567',
      title: 'Kullanici sikayeti - Taciz',
      description:
        'Kullanici diger bir kullaniciyi uygunsuz mesajlar nedeniyle sikayet etti',
      priority: 'high',
      status: 'in_review',
      assignedTo: 'admin_1',
      assignedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'tri_4',
      itemType: 'content_flag',
      sourceType: 'moment',
      sourceId: 'mom_45678',
      title: 'Icerik bildirimi',
      description: 'Paylasilan fotograf uygunsuz icerik olarak isaretlendi',
      priority: 'medium',
      status: 'pending',
      aiRiskScore: 0.68,
      aiRiskFactors: ['nsfw_detected'],
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    {
      id: 'tri_5',
      itemType: 'payment_dispute',
      sourceType: 'transaction',
      sourceId: 'txn_56789',
      title: 'Odeme itiraz',
      description: 'Kullanici yapilan odemeye itiraz etti',
      priority: 'medium',
      status: 'escalated',
      createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 'tri_6',
      itemType: 'kyc_review',
      sourceType: 'user',
      sourceId: 'usr_67890',
      title: 'KYC dogrulama',
      description:
        'Otomatik KYC dogrulamasi basarisiz, manuel inceleme gerekli',
      priority: 'low',
      status: 'pending',
      aiRiskScore: 0.22,
      createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    },
  ];

  const stats: TriageStats = {
    total: items.length,
    pending: items.filter((i) => i.status === 'pending').length,
    inReview: items.filter((i) => i.status === 'in_review').length,
    escalated: items.filter((i) => i.status === 'escalated').length,
    resolved24h: 12,
    avgResolutionTime: 47,
  };

  return { items, stats };
};

// =====================================================
// DATA FETCHING
// =====================================================

async function fetchTriageData(): Promise<{
  items: TriageItem[];
  stats: TriageStats;
  isMockData: boolean;
}> {
  // SAFE MODE: Mock data kullaniyoruz
  // Gercek entegrasyon icin bu fonksiyon guncellenmeli
  const { items, stats } = generateMockData();
  return { items, stats, isMockData: true };
}

// =====================================================
// COMPONENT
// =====================================================

export default function TriagePage() {
  const [data, setData] = useState<{
    items: TriageItem[];
    stats: TriageStats;
    isMockData: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchTriageData();
      setData(result);
    } catch {
      const { items, stats } = generateMockData();
      setData({ items, stats, isMockData: true });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];

    return data.items.filter((item) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !item.title.toLowerCase().includes(query) &&
          !item.description?.toLowerCase().includes(query) &&
          !item.id.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Priority filter
      if (filterPriority !== 'all' && item.priority !== filterPriority) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'all' && item.status !== filterStatus) {
        return false;
      }

      // Type filter
      if (filterType !== 'all' && item.itemType !== filterType) {
        return false;
      }

      return true;
    });
  }, [data?.items, searchQuery, filterPriority, filterStatus, filterType]);

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'fraud_alert':
        return <Shield className="h-4 w-4" />;
      case 'proof_review':
        return <Eye className="h-4 w-4" />;
      case 'user_report':
        return <Flag className="h-4 w-4" />;
      case 'content_flag':
        return <Camera className="h-4 w-4" />;
      case 'payment_dispute':
        return <CreditCard className="h-4 w-4" />;
      case 'kyc_review':
        return <User className="h-4 w-4" />;
      default:
        return <FileWarning className="h-4 w-4" />;
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'fraud_alert':
        return 'Fraud';
      case 'proof_review':
        return 'Proof';
      case 'user_report':
        return 'Sikayet';
      case 'content_flag':
        return 'Icerik';
      case 'payment_dispute':
        return 'Odeme';
      case 'kyc_review':
        return 'KYC';
      default:
        return 'Genel';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <CanvaBadge variant="error" size="sm">
            Kritik
          </CanvaBadge>
        );
      case 'high':
        return (
          <CanvaBadge variant="warning" size="sm">
            Yuksek
          </CanvaBadge>
        );
      case 'medium':
        return (
          <CanvaBadge variant="default" size="sm">
            Orta
          </CanvaBadge>
        );
      default:
        return (
          <CanvaBadge variant="secondary" size="sm">
            Dusuk
          </CanvaBadge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <CanvaBadge variant="warning" size="sm">
            Bekliyor
          </CanvaBadge>
        );
      case 'in_review':
        return (
          <CanvaBadge variant="primary" size="sm">
            Inceleniyor
          </CanvaBadge>
        );
      case 'escalated':
        return (
          <CanvaBadge variant="error" size="sm">
            Eskalasyon
          </CanvaBadge>
        );
      case 'resolved':
        return (
          <CanvaBadge variant="success" size="sm">
            Cozuldu
          </CanvaBadge>
        );
      default:
        return (
          <CanvaBadge variant="secondary" size="sm">
            Kapatildi
          </CanvaBadge>
        );
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Simdi';
    if (diffMins < 60) return `${diffMins} dk`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}s`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}g`;
  };

  const getRiskColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600 dark:text-red-400';
    if (score >= 0.6) return 'text-orange-600 dark:text-orange-400';
    if (score >= 0.4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Triage Kuyrugu
          </h1>
          <p className="text-muted-foreground mt-1">
            Inceleme bekleyen ogeler (PASSIVE MODE - sadece goruntumleme)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data?.isMockData && (
            <CanvaBadge variant="warning" size="sm">
              Mock Data
            </CanvaBadge>
          )}
          {!TRIAGE_ACTIONS_ENABLED && (
            <CanvaBadge variant="secondary" size="sm">
              <Lock className="h-3 w-3 mr-1" />
              Aksiyonlar Kapali
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <CanvaStatCard
          label="Toplam"
          value={isLoading ? '...' : data?.stats.total || 0}
          icon={<FileWarning className="h-5 w-5 text-blue-600" />}
        />
        <CanvaStatCard
          label="Bekleyen"
          value={isLoading ? '...' : data?.stats.pending || 0}
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
        />
        <CanvaStatCard
          label="Inceleniyor"
          value={isLoading ? '...' : data?.stats.inReview || 0}
          icon={<Eye className="h-5 w-5 text-blue-600" />}
        />
        <CanvaStatCard
          label="Eskalasyon"
          value={isLoading ? '...' : data?.stats.escalated || 0}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
        />
        <CanvaStatCard
          label="Cozulen (24s)"
          value={isLoading ? '...' : data?.stats.resolved24h || 0}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
        />
        <CanvaStatCard
          label="Ort. Cozum"
          value={isLoading ? '...' : `${data?.stats.avgResolutionTime || 0} dk`}
          icon={<Clock className="h-5 w-5 text-teal-600" />}
        />
      </div>

      {/* Filters */}
      <CanvaCard>
        <CanvaCardBody className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <CanvaInput
                  placeholder="Ara (ID, baslik, aciklama)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Oncelik" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tum Oncelik</SelectItem>
                <SelectItem value="critical">Kritik</SelectItem>
                <SelectItem value="high">Yuksek</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="low">Dusuk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tum Durum</SelectItem>
                <SelectItem value="pending">Bekliyor</SelectItem>
                <SelectItem value="in_review">Inceleniyor</SelectItem>
                <SelectItem value="escalated">Eskalasyon</SelectItem>
                <SelectItem value="resolved">Cozuldu</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tum Tip</SelectItem>
                <SelectItem value="fraud_alert">Fraud</SelectItem>
                <SelectItem value="proof_review">Proof</SelectItem>
                <SelectItem value="user_report">Sikayet</SelectItem>
                <SelectItem value="content_flag">Icerik</SelectItem>
                <SelectItem value="payment_dispute">Odeme</SelectItem>
                <SelectItem value="kyc_review">KYC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CanvaCardBody>
      </CanvaCard>

      {/* Queue List */}
      <CanvaCard>
        <CanvaCardHeader>
          <CanvaCardTitle>Triage Ogeleri</CanvaCardTitle>
          <CanvaCardSubtitle>
            {filteredItems.length} oge listeleniyor
          </CanvaCardSubtitle>
        </CanvaCardHeader>
        <CanvaCardBody className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors',
                    item.priority === 'critical' &&
                      'border-l-4 border-l-red-500',
                    item.priority === 'high' &&
                      'border-l-4 border-l-orange-500',
                  )}
                >
                  {/* Type Icon */}
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl shrink-0',
                      item.priority === 'critical' &&
                        'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
                      item.priority === 'high' &&
                        'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
                      item.priority === 'medium' &&
                        'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
                      item.priority === 'low' &&
                        'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                    )}
                  >
                    {getItemTypeIcon(item.itemType)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.title}
                      </p>
                      <CanvaBadge variant="secondary" size="sm">
                        {getItemTypeLabel(item.itemType)}
                      </CanvaBadge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {item.description || 'Aciklama yok'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {item.id}
                      </span>
                      {item.sourceType && item.sourceId && (
                        <span className="text-xs text-muted-foreground">
                          - {item.sourceType}:{item.sourceId}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Risk Score */}
                  {item.aiRiskScore !== undefined && (
                    <div className="text-center shrink-0">
                      <p
                        className={cn(
                          'text-lg font-bold',
                          getRiskColor(item.aiRiskScore),
                        )}
                      >
                        {Math.round(item.aiRiskScore * 100)}%
                      </p>
                      <p className="text-xs text-muted-foreground">AI Risk</p>
                    </div>
                  )}

                  {/* Status & Priority */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {getPriorityBadge(item.priority)}
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Time */}
                  <div className="text-right shrink-0 w-16">
                    <p className="text-xs font-medium text-foreground">
                      {formatTimeAgo(item.createdAt)}
                    </p>
                    <p className="text-xs text-muted-foreground">once</p>
                  </div>

                  {/* Action Button (Disabled in PASSIVE MODE) */}
                  <div className="shrink-0">
                    <CanvaButton
                      variant="ghost"
                      size="sm"
                      disabled={!TRIAGE_ACTIONS_ENABLED}
                      title={
                        TRIAGE_ACTIONS_ENABLED
                          ? 'Detay'
                          : 'Aksiyonlar kapali - Feature flag gerekli'
                      }
                    >
                      {TRIAGE_ACTIONS_ENABLED ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </CanvaButton>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mb-3 text-green-500" />
              <p className="font-medium text-foreground">Triage kuyrugu bos!</p>
              <p className="text-sm">Bekleyen oge yok</p>
            </div>
          )}
        </CanvaCardBody>
      </CanvaCard>

      {/* Footer Info */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>
          Bu sayfa PASSIVE MODE'da calismaktadir. Sadece goruntumleme
          yapilabilir.
        </p>
        <p>
          Aksiyonlari etkinlestirmek icin{' '}
          <code className="bg-muted px-1 rounded">TRIAGE_ACTIONS_ENABLED</code>{' '}
          feature flag'ini aktif edin.
        </p>
      </div>
    </div>
  );
}

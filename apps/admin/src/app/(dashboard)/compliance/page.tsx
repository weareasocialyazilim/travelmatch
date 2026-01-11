'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  AlertTriangle,
  UserX,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
  Search,
  MoreHorizontal,
  Flag,
  AlertCircle,
  Clock,
  FileText,
  DollarSign,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
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
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { formatRelativeDate, getInitials, cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { logger } from '@/lib/logger';

// Types
interface SarReport {
  id: string;
  report_number: string;
  report_type: string;
  user_id: string;
  triggered_rules: string[];
  risk_score: number;
  total_amount: number;
  currency: string;
  status: string;
  assigned_to: string | null;
  investigation_notes: string | null;
  reported_to: string | null;
  created_at: string;
  user?: {
    id: string;
    email: string;
    kyc_status: string;
  };
}

interface RiskProfile {
  id: string;
  user_id: string;
  risk_score: number;
  risk_level: string;
  flags: string[];
  is_blocked: boolean;
  block_reason: string | null;
  total_sent: number;
  total_received: number;
  user?: {
    id: string;
    email: string;
    kyc_status: string;
  };
}

interface ComplianceStats {
  sar: {
    total: number;
    pending: number;
    investigating: number;
    escalated: number;
    reported: number;
    resolved: number;
  };
  risk: {
    low: number;
    medium: number;
    high: number;
    critical: number;
    blocked: number;
  };
  recent: {
    alerts24h: number;
    latestAlerts: SarReport[];
  };
}

const getRiskLevelColor = (level: string) => {
  switch (level) {
    case 'critical':
      return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    case 'high':
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    default:
      return 'text-green-600 bg-green-100 dark:bg-green-900/30';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <CanvaBadge variant="warning">Bekliyor</CanvaBadge>;
    case 'investigating':
      return <CanvaBadge variant="primary">İnceleniyor</CanvaBadge>;
    case 'escalated':
      return <CanvaBadge variant="error">Yükseltildi</CanvaBadge>;
    case 'reported':
      return <CanvaBadge variant="info">Bildirildi</CanvaBadge>;
    case 'cleared':
      return <CanvaBadge variant="success">Temiz</CanvaBadge>;
    case 'confirmed':
      return <CanvaBadge variant="error">Onaylandı</CanvaBadge>;
    default:
      return <CanvaBadge>{status}</CanvaBadge>;
  }
};

// Mock data for development
const mockStats: ComplianceStats = {
  sar: {
    total: 24,
    pending: 8,
    investigating: 5,
    escalated: 3,
    reported: 4,
    resolved: 4,
  },
  risk: {
    low: 1250,
    medium: 180,
    high: 45,
    critical: 12,
    blocked: 8,
  },
  recent: {
    alerts24h: 15,
    latestAlerts: [],
  },
};

const mockSarReports: SarReport[] = [
  {
    id: 'sar-1',
    report_number: 'SAR-2024-001',
    report_type: 'suspicious_activity',
    user_id: 'user-1',
    triggered_rules: ['large_transaction', 'new_account'],
    risk_score: 85,
    total_amount: 15000,
    currency: 'TRY',
    status: 'pending',
    assigned_to: null,
    investigation_notes: null,
    reported_to: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    user: {
      id: 'user-1',
      email: 'suspect1@example.com',
      kyc_status: 'pending',
    },
  },
  {
    id: 'sar-2',
    report_number: 'SAR-2024-002',
    report_type: 'high_volume',
    user_id: 'user-2',
    triggered_rules: ['multiple_transfers', 'velocity_check'],
    risk_score: 72,
    total_amount: 8500,
    currency: 'TRY',
    status: 'investigating',
    assigned_to: 'admin-1',
    investigation_notes: 'İnceleme devam ediyor',
    reported_to: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    user: { id: 'user-2', email: 'user2@example.com', kyc_status: 'verified' },
  },
  {
    id: 'sar-3',
    report_number: 'SAR-2024-003',
    report_type: 'fraud_attempt',
    user_id: 'user-3',
    triggered_rules: ['chargeback_pattern'],
    risk_score: 95,
    total_amount: 25000,
    currency: 'TRY',
    status: 'escalated',
    assigned_to: 'admin-1',
    investigation_notes: 'Üst yönetime bildirildi',
    reported_to: 'compliance_officer',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    user: {
      id: 'user-3',
      email: 'fraudster@example.com',
      kyc_status: 'rejected',
    },
  },
];

const mockRiskProfiles: RiskProfile[] = [
  {
    id: 'risk-1',
    user_id: 'user-1',
    risk_score: 85,
    risk_level: 'high',
    flags: ['large_transaction', 'new_account'],
    is_blocked: false,
    block_reason: null,
    total_sent: 15000,
    total_received: 2000,
    user: {
      id: 'user-1',
      email: 'highrisk@example.com',
      kyc_status: 'pending',
    },
  },
  {
    id: 'risk-2',
    user_id: 'user-2',
    risk_score: 45,
    risk_level: 'medium',
    flags: ['multiple_transfers'],
    is_blocked: false,
    block_reason: null,
    total_sent: 5000,
    total_received: 8000,
    user: {
      id: 'user-2',
      email: 'mediumrisk@example.com',
      kyc_status: 'verified',
    },
  },
  {
    id: 'risk-3',
    user_id: 'user-3',
    risk_score: 95,
    risk_level: 'critical',
    flags: ['fraud_attempt', 'chargeback'],
    is_blocked: true,
    block_reason: 'Dolandırıcılık şüphesi',
    total_sent: 25000,
    total_received: 0,
    user: {
      id: 'user-3',
      email: 'blocked@example.com',
      kyc_status: 'rejected',
    },
  },
  {
    id: 'risk-4',
    user_id: 'user-4',
    risk_score: 15,
    risk_level: 'low',
    flags: [],
    is_blocked: false,
    block_reason: null,
    total_sent: 1000,
    total_received: 3000,
    user: {
      id: 'user-4',
      email: 'lowrisk@example.com',
      kyc_status: 'verified',
    },
  },
];

export default function CompliancePage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [sarReports, setSarReports] = useState<SarReport[]>([]);
  const [riskProfiles, setRiskProfiles] = useState<RiskProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSar, setSelectedSar] = useState<SarReport | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<RiskProfile | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [investigationNotes, setInvestigationNotes] = useState('');

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/compliance/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        // Use mock data on 401/error
        setStats(mockStats);
      }
    } catch (error) {
      logger.error('Failed to fetch stats', error);
      setStats(mockStats);
    }
  }, []);

  // Fetch SAR reports
  const fetchSarReports = useCallback(async () => {
    try {
      const params = new URLSearchParams({ type: 'sar' });
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/compliance?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSarReports(data.reports || []);
      } else {
        // Use mock data on 401/error
        let filtered = mockSarReports;
        if (statusFilter !== 'all') {
          filtered = filtered.filter((r) => r.status === statusFilter);
        }
        setSarReports(filtered);
      }
    } catch (error) {
      logger.error('Failed to fetch SAR reports', error);
      setSarReports(mockSarReports);
    }
  }, [statusFilter]);

  // Fetch risk profiles
  const fetchRiskProfiles = useCallback(async () => {
    try {
      const params = new URLSearchParams({ type: 'risk_profiles' });
      if (riskFilter !== 'all') params.set('risk_level', riskFilter);

      const res = await fetch(`/api/compliance?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRiskProfiles(data.profiles || []);
      } else {
        // Use mock data on 401/error
        let filtered = mockRiskProfiles;
        if (riskFilter !== 'all') {
          filtered = filtered.filter((p) => p.risk_level === riskFilter);
        }
        setRiskProfiles(filtered);
      }
    } catch (error) {
      logger.error('Failed to fetch risk profiles', error);
      setRiskProfiles(mockRiskProfiles);
    }
  }, [riskFilter]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchSarReports(), fetchRiskProfiles()]);
      setLoading(false);
    };
    loadData();
  }, [fetchStats, fetchSarReports, fetchRiskProfiles]);

  // Update SAR status
  const updateSarStatus = async (
    id: string,
    status: string,
    notes?: string,
  ) => {
    try {
      const res = await fetch('/api/compliance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          investigation_notes: notes,
        }),
      });

      if (res.ok) {
        toast({ title: 'SAR güncellendi' });
        fetchSarReports();
        fetchStats();
        setSelectedSar(null);
      } else {
        toast({ title: 'Güncelleme başarısız', variant: 'error' });
      }
    } catch (error) {
      logger.error('Failed to update SAR', error);
      toast({ title: 'Bir hata oluştu', variant: 'error' });
    }
  };

  // Block/Unblock user
  const toggleUserBlock = async (
    userId: string,
    block: boolean,
    reason?: string,
  ) => {
    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: block ? 'block_user' : 'unblock_user',
          user_id: userId,
          block_reason: reason,
        }),
      });

      if (res.ok) {
        toast({ title: block ? 'Kullanıcı engellendi' : 'Engel kaldırıldı' });
        fetchRiskProfiles();
        fetchStats();
        setSelectedProfile(null);
      } else {
        toast({ title: 'İşlem başarısız', variant: 'error' });
      }
    } catch (error) {
      logger.error('Failed to toggle block', error);
      toast({ title: 'Bir hata oluştu', variant: 'error' });
    }
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-200 rounded" />
          <div className="h-8 w-32 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-gray-100 rounded-lg" />
    </div>
  );

  // Error State
  const ErrorState = () => (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Bir hata oluştu</h2>
        <p className="text-gray-500 max-w-md">
          Uyumluluk verileri yüklenemedi. Lütfen tekrar deneyin.
        </p>
        <CanvaButton
          variant="primary"
          onClick={() => {
            fetchStats();
            fetchSarReports();
            fetchRiskProfiles();
          }}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Tekrar Dene
        </CanvaButton>
      </div>
    </div>
  );

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Uyumluluk Merkezi
          </h1>
          <p className="text-muted-foreground">
            AML, Fraud Tespit ve Uyumluluk Yönetimi
          </p>
        </div>
        <div className="flex gap-2">
          <CanvaButton
            variant="primary"
            onClick={() => {
              fetchStats();
              fetchSarReports();
              fetchRiskProfiles();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </CanvaButton>
          {stats?.sar.pending ? (
            <CanvaBadge variant="error" className="h-8 px-3 text-sm">
              <AlertCircle className="mr-1 h-4 w-4" />
              {stats.sar.pending} bekleyen SAR
            </CanvaBadge>
          ) : null}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam SAR</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sar.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.sar.pending || 0} bekliyor
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yüksek Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {(stats?.risk.high || 0) + (stats?.risk.critical || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.risk.critical || 0} kritik
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engellenen</CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.risk.blocked || 0}
            </div>
            <p className="text-xs text-muted-foreground">kullanıcı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Uyarı</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.recent.alerts24h || 0}
            </div>
            <p className="text-xs text-muted-foreground">yeni uyarı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Çözülen</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.sar.resolved || 0}
            </div>
            <p className="text-xs text-muted-foreground">SAR raporu</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sar">
            <FileText className="mr-2 h-4 w-4" />
            SAR Raporları
            {stats?.sar.pending ? (
              <CanvaBadge variant="error" className="ml-2">
                {stats.sar.pending}
              </CanvaBadge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="risk">
            <Shield className="mr-2 h-4 w-4" />
            Risk Profilleri
          </TabsTrigger>
          <TabsTrigger value="thresholds">
            <DollarSign className="mr-2 h-4 w-4" />
            AML Eşikleri
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Flag className="mr-2 h-4 w-4" />
            Fraud Kuralları
          </TabsTrigger>
        </TabsList>

        {/* SAR Reports Tab */}
        <TabsContent value="sar">
          <Card>
            <CardHeader>
              <CardTitle>Şüpheli Aktivite Raporları (SAR)</CardTitle>
              <CardDescription>
                AML ve fraud tespitinden oluşan otomatik raporlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <CanvaInput
                    placeholder="Rapor numarası veya kullanıcı ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="pending">Bekliyor</SelectItem>
                    <SelectItem value="investigating">İnceleniyor</SelectItem>
                    <SelectItem value="escalated">Yükseltildi</SelectItem>
                    <SelectItem value="reported">Bildirildi</SelectItem>
                    <SelectItem value="cleared">Temiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* SAR List */}
              <div className="space-y-3">
                {sarReports.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Henüz SAR raporu bulunmuyor
                  </div>
                ) : (
                  sarReports.map((sar) => (
                    <div
                      key={sar.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full',
                            sar.risk_score >= 80
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : sar.risk_score >= 50
                                ? 'bg-orange-100 dark:bg-orange-900/30'
                                : 'bg-yellow-100 dark:bg-yellow-900/30',
                          )}
                        >
                          <span className="text-sm font-bold">
                            {sar.risk_score}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {sar.report_number}
                            </span>
                            {getStatusBadge(sar.status)}
                            <CanvaBadge variant="primary">
                              {sar.report_type.toUpperCase()}
                            </CanvaBadge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {sar.user?.email || 'Bilinmeyen kullanıcı'}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {sar.triggered_rules?.slice(0, 3).map((rule, i) => (
                              <CanvaBadge
                                key={i}
                                variant="primary"
                                className="text-xs"
                              >
                                {rule}
                              </CanvaBadge>
                            ))}
                            {sar.triggered_rules?.length > 3 && (
                              <CanvaBadge variant="primary" className="text-xs">
                                +{sar.triggered_rules.length - 3}
                              </CanvaBadge>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatRelativeDate(sar.created_at)} •{' '}
                            {sar.total_amount?.toLocaleString('tr-TR')}{' '}
                            {sar.currency}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CanvaButton
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setSelectedSar(sar);
                            setInvestigationNotes(
                              sar.investigation_notes || '',
                            );
                          }}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          İncele
                        </CanvaButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <CanvaButton size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </CanvaButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                updateSarStatus(sar.id, 'investigating')
                              }
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              İncelemeye Al
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateSarStatus(sar.id, 'escalated')
                              }
                            >
                              <TrendingUp className="mr-2 h-4 w-4 text-orange-600" />
                              Yükselt
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => updateSarStatus(sar.id, 'cleared')}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Temiz İşaretle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                updateSarStatus(sar.id, 'confirmed')
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Fraud Onayla
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Profiles Tab */}
        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Risk Profilleri</CardTitle>
              <CardDescription>
                Risk skoruna göre sıralanmış kullanıcılar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-6 flex items-center gap-4">
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Risk Seviyesi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="critical">Kritik</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="low">Düşük</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Risk Profile List */}
              <div className="space-y-3">
                {riskProfiles.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    Henüz risk profili bulunmuyor
                  </div>
                ) : (
                  riskProfiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-full font-bold',
                            getRiskLevelColor(profile.risk_level),
                          )}
                        >
                          {profile.risk_score}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {profile.user?.email || 'Bilinmeyen'}
                            </span>
                            <CanvaBadge
                              className={getRiskLevelColor(profile.risk_level)}
                            >
                              {profile.risk_level.toUpperCase()}
                            </CanvaBadge>
                            {profile.is_blocked && (
                              <CanvaBadge variant="error">
                                <Lock className="mr-1 h-3 w-3" />
                                Engelli
                              </CanvaBadge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Gönderilen:{' '}
                            {profile.total_sent?.toLocaleString('tr-TR')} TL •
                            Alınan:{' '}
                            {profile.total_received?.toLocaleString('tr-TR')} TL
                          </p>
                          {profile.flags?.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {profile.flags.slice(0, 3).map((flag, i) => (
                                <CanvaBadge
                                  key={i}
                                  variant="primary"
                                  className="text-xs"
                                >
                                  {flag}
                                </CanvaBadge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CanvaButton
                          size="sm"
                          variant="primary"
                          onClick={() => setSelectedProfile(profile)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Detay
                        </CanvaButton>
                        {profile.is_blocked ? (
                          <CanvaButton
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              toggleUserBlock(profile.user_id, false)
                            }
                          >
                            <Unlock className="mr-1 h-4 w-4 text-green-600" />
                            Aç
                          </CanvaButton>
                        ) : (
                          <CanvaButton
                            size="sm"
                            variant="danger"
                            onClick={() =>
                              toggleUserBlock(
                                profile.user_id,
                                true,
                                'Manuel engel',
                              )
                            }
                          >
                            <Lock className="mr-1 h-4 w-4" />
                            Engelle
                          </CanvaButton>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AML Thresholds Tab */}
        <TabsContent value="thresholds">
          <Card>
            <CardHeader>
              <CardTitle>AML Eşikleri</CardTitle>
              <CardDescription>
                MASAK, EU AML, FinCEN ve NCA uyumlu eşikler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold">Türkiye (MASAK)</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tek işlem bildirimi</span>
                      <CanvaBadge variant="error">₺75,000</CanvaBadge>
                    </div>
                    <div className="flex justify-between">
                      <span>KYC zorunlu</span>
                      <CanvaBadge variant="warning">₺25,000</CanvaBadge>
                    </div>
                    <div className="flex justify-between">
                      <span>Günlük hacim</span>
                      <CanvaBadge variant="error">₺100,000</CanvaBadge>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Avrupa Birliği</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>FIU bildirimi</span>
                      <CanvaBadge variant="error">€10,000</CanvaBadge>
                    </div>
                    <div className="flex justify-between">
                      <span>KYC zorunlu</span>
                      <CanvaBadge variant="warning">€3,000</CanvaBadge>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">ABD (FinCEN)</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>SAR bildirimi</span>
                      <CanvaBadge variant="error">$10,000</CanvaBadge>
                    </div>
                    <div className="flex justify-between">
                      <span>KYC zorunlu</span>
                      <CanvaBadge variant="warning">$3,000</CanvaBadge>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">İngiltere (NCA)</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>NCA bildirimi</span>
                      <CanvaBadge variant="error">£8,000</CanvaBadge>
                    </div>
                    <div className="flex justify-between">
                      <span>KYC zorunlu</span>
                      <CanvaBadge variant="warning">£2,500</CanvaBadge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fraud Rules Tab */}
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Fraud Tespit Kuralları</CardTitle>
              <CardDescription>
                Aktif fraud tespit ve önleme kuralları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    name: 'Rapid Fire',
                    type: 'velocity',
                    action: 'block',
                    desc: "5 dk'da 5+ hediye",
                    active: true,
                  },
                  {
                    name: 'Ping Pong',
                    type: 'pattern',
                    action: 'block',
                    desc: 'Karşılıklı transfer',
                    active: true,
                  },
                  {
                    name: 'Circular Flow',
                    type: 'pattern',
                    action: 'block',
                    desc: 'A→B→C→A döngüsü',
                    active: true,
                  },
                  {
                    name: 'Self Gift',
                    type: 'relationship',
                    action: 'block',
                    desc: 'Kendine hediye',
                    active: true,
                  },
                  {
                    name: 'New User Max',
                    type: 'behavioral',
                    action: 'block',
                    desc: "24h'de ₺1000+",
                    active: true,
                  },
                  {
                    name: 'Sanctioned Country',
                    type: 'geographic',
                    action: 'block',
                    desc: 'KP, IR, SY, CU',
                    active: true,
                  },
                  {
                    name: 'VPN Detection',
                    type: 'geographic',
                    action: 'challenge',
                    desc: 'VPN/Proxy tespit',
                    active: true,
                  },
                  {
                    name: 'Multi Account',
                    type: 'device',
                    action: 'flag',
                    desc: 'Aynı cihazdan 2+ hesap',
                    active: true,
                  },
                ].map((rule, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full',
                          rule.active
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-gray-100 dark:bg-gray-900/30',
                        )}
                      >
                        <Shield
                          className={cn(
                            'h-5 w-5',
                            rule.active ? 'text-green-600' : 'text-gray-400',
                          )}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rule.name}</span>
                          <CanvaBadge variant="primary">{rule.type}</CanvaBadge>
                          <CanvaBadge
                            variant={
                              rule.action === 'block'
                                ? 'error'
                                : rule.action === 'challenge'
                                  ? 'warning'
                                  : 'default'
                            }
                          >
                            {rule.action === 'block'
                              ? 'Engelle'
                              : rule.action === 'challenge'
                                ? '2FA İste'
                                : 'İşaretle'}
                          </CanvaBadge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rule.desc}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`rule-${i}`} className="text-sm">
                        {rule.active ? 'Aktif' : 'Pasif'}
                      </Label>
                      <Switch id={`rule-${i}`} checked={rule.active} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* SAR Detail Dialog */}
      <Dialog open={!!selectedSar} onOpenChange={() => setSelectedSar(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>SAR Detayı - {selectedSar?.report_number}</DialogTitle>
            <DialogDescription>
              Şüpheli aktivite raporu incelemesi
            </DialogDescription>
          </DialogHeader>
          {selectedSar && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Kullanıcı</p>
                  <p className="font-medium">{selectedSar.user?.email}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Risk Skoru</p>
                  <p className="font-medium">{selectedSar.risk_score}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Tutar</p>
                  <p className="font-medium">
                    {selectedSar.total_amount?.toLocaleString('tr-TR')}{' '}
                    {selectedSar.currency}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Tarih</p>
                  <p className="font-medium">
                    {formatRelativeDate(selectedSar.created_at)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="mb-2 font-medium">Tetiklenen Kurallar</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSar.triggered_rules?.map((rule, i) => (
                    <CanvaBadge key={i} variant="primary">
                      <AlertTriangle className="mr-1 h-3 w-3 text-orange-500" />
                      {rule}
                    </CanvaBadge>
                  ))}
                </div>
              </div>

              <div>
                <Label>İnceleme Notları</Label>
                <Textarea
                  className="mt-2"
                  placeholder="İnceleme notlarınızı buraya yazın..."
                  value={investigationNotes}
                  onChange={(e) => setInvestigationNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <CanvaButton variant="primary" onClick={() => setSelectedSar(null)}>
              Kapat
            </CanvaButton>
            <CanvaButton
              variant="primary"
              onClick={() =>
                selectedSar &&
                updateSarStatus(
                  selectedSar.id,
                  'investigating',
                  investigationNotes,
                )
              }
            >
              <Clock className="mr-2 h-4 w-4" />
              Kaydet
            </CanvaButton>
            <CanvaButton
              variant="primary"
              className="bg-green-600 hover:bg-green-700"
              onClick={() =>
                selectedSar &&
                updateSarStatus(selectedSar.id, 'cleared', investigationNotes)
              }
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Temiz
            </CanvaButton>
            <CanvaButton
              variant="danger"
              onClick={() =>
                selectedSar &&
                updateSarStatus(selectedSar.id, 'confirmed', investigationNotes)
              }
            >
              <XCircle className="mr-2 h-4 w-4" />
              Onayla
            </CanvaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Risk Profile Detail Dialog */}
      <Dialog
        open={!!selectedProfile}
        onOpenChange={() => setSelectedProfile(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Risk Profili Detayı</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold',
                    getRiskLevelColor(selectedProfile.risk_level),
                  )}
                >
                  {selectedProfile.risk_score}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {selectedProfile.user?.email}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Risk Seviyesi: {selectedProfile.risk_level.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Gönderilen</p>
                  <p className="font-medium">
                    {selectedProfile.total_sent?.toLocaleString('tr-TR')} TL
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Alınan</p>
                  <p className="font-medium">
                    {selectedProfile.total_received?.toLocaleString('tr-TR')} TL
                  </p>
                </div>
              </div>

              {selectedProfile.is_blocked && (
                <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-600">
                      Hesap Engelli
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-red-600">
                    {selectedProfile.block_reason || 'Sebep belirtilmedi'}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <CanvaButton
              variant="primary"
              onClick={() => setSelectedProfile(null)}
            >
              Kapat
            </CanvaButton>
            {selectedProfile?.is_blocked ? (
              <CanvaButton
                onClick={() =>
                  selectedProfile &&
                  toggleUserBlock(selectedProfile.user_id, false)
                }
              >
                <Unlock className="mr-2 h-4 w-4" />
                Engeli Kaldır
              </CanvaButton>
            ) : (
              <CanvaButton
                variant="danger"
                onClick={() =>
                  selectedProfile &&
                  toggleUserBlock(selectedProfile.user_id, true, 'Manuel engel')
                }
              >
                <Lock className="mr-2 h-4 w-4" />
                Engelle
              </CanvaButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

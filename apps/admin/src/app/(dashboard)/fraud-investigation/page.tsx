'use client';

/**
 * Fraud Investigation Hub
 * Derinlemesine dolandırıcılık soruşturma aracı
 * Real API integration with use-fraud.ts hooks
 */

import { useState } from 'react';
import {
  Search,
  AlertTriangle,
  Users,
  Smartphone,
  CreditCard,
  Clock,
  Eye,
  Ban,
  Activity,
  TrendingUp,
  Globe,
  ChevronDown,
  Flag,
  Download,
  Share2,
  DollarSign,
  FileText,
  XCircle,
  RefreshCw,
  UserX,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
  CanvaCardBody,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';
import { CanvaButton } from '@/components/canva/CanvaButton';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useFraudStats,
  useFraudCases,
  useFraudCase,
  useFraudEvidence,
  useLinkedAccounts,
  useUpdateFraudCase,
  useResolveFraudCase,
  useAssignFraudCase,
  type FraudCase,
} from '@/hooks/use-fraud';

export default function FraudInvestigationPage() {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolution, setResolution] = useState('');
  const [resolveAction, setResolveAction] = useState<'ban' | 'warn' | 'dismiss' | 'escalate'>('ban');

  // Data hooks
  const { data: stats, isLoading: statsLoading } = useFraudStats();
  const { data: cases, isLoading: casesLoading, refetch: refetchCases } = useFraudCases({
    status: statusFilter,
    priority: priorityFilter,
    search: searchQuery,
  });
  const { data: selectedCase, isLoading: caseLoading } = useFraudCase(selectedCaseId || '');
  const { data: evidence } = useFraudEvidence(selectedCaseId || '');
  const { data: linkedAccounts } = useLinkedAccounts(selectedCaseId || '');

  // Mutations
  const updateCase = useUpdateFraudCase();
  const resolveCase = useResolveFraudCase();
  const assignCase = useAssignFraudCase();

  // Auto-select first case
  if (cases && cases.length > 0 && !selectedCaseId) {
    setSelectedCaseId(cases[0].id);
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400',
      investigating: 'bg-yellow-500/10 text-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-400',
      resolved: 'bg-green-500/10 text-green-500 dark:bg-green-500/20 dark:text-green-400',
      escalated: 'bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400',
    };
    const labels: Record<string, string> = {
      open: 'Açık',
      investigating: 'Soruşturuluyor',
      resolved: 'Çözüldü',
      escalated: 'Eskale Edildi',
    };
    return (
      <CanvaBadge className={styles[status] || styles.open}>
        {labels[status] || status}
      </CanvaBadge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-black',
      low: 'bg-blue-500 text-white',
    };
    return (
      <CanvaBadge className={styles[priority] || styles.low}>
        {priority.toUpperCase()}
      </CanvaBadge>
    );
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);

  const handleResolve = async () => {
    if (!selectedCaseId || !resolution) {
      toast.error('Lütfen çözüm açıklaması girin');
      return;
    }

    await resolveCase.mutateAsync({
      caseId: selectedCaseId,
      resolution,
      action: resolveAction,
    });

    setShowResolveDialog(false);
    setResolution('');
  };

  const handleAssignToMe = async () => {
    if (!selectedCaseId) return;

    // In a real app, get the current admin's ID from auth context
    await assignCase.mutateAsync({
      caseId: selectedCaseId,
      adminId: 'current-admin-id',
    });
  };

  const handleBanAllAccounts = async () => {
    if (!selectedCaseId) return;

    toast.promise(
      resolveCase.mutateAsync({
        caseId: selectedCaseId,
        resolution: 'Tüm bağlı hesaplar kalıcı olarak yasaklandı',
        action: 'ban',
      }),
      {
        loading: 'Hesaplar yasaklanıyor...',
        success: 'Tüm hesaplar yasaklandı',
        error: 'İşlem başarısız',
      }
    );
  };

  // Risk indicators from stats
  const riskIndicators = [
    {
      name: 'Multi-Account',
      count: stats?.open_cases || 0,
      trend: 'up',
      severity: 'critical',
    },
    {
      name: 'Çözülen (Bugün)',
      count: stats?.resolved_today || 0,
      trend: 'stable',
      severity: 'low',
    },
    {
      name: 'Toplam Vaka',
      count: stats?.total_cases || 0,
      trend: 'up',
      severity: 'medium',
    },
    {
      name: 'Kurtarılan',
      count: stats?.total_amount_recovered ? formatCurrency(stats.total_amount_recovered) : '₺0',
      trend: 'up',
      severity: 'low',
      isAmount: true,
    },
    {
      name: 'Fraud Oranı',
      count: `${stats?.fraud_rate || 0}%`,
      trend: 'down',
      severity: 'medium',
      isPercentage: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fraud Soruşturma Merkezi</h1>
          <p className="text-muted-foreground">
            Derinlemesine dolandırıcılık analizi ve soruşturma
          </p>
        </div>
        <div className="flex gap-2">
          <CanvaButton variant="outline" onClick={() => refetchCases()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </CanvaButton>
          <CanvaButton variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Rapor
          </CanvaButton>
          <CanvaButton>
            <Flag className="h-4 w-4 mr-2" />
            Yeni Vaka
          </CanvaButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        {statsLoading ? (
          Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))
        ) : (
          riskIndicators.map((indicator) => (
            <CanvaCard key={indicator.name}>
              <CanvaCardBody className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground truncate">
                    {indicator.name}
                  </span>
                  {indicator.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-red-500" />
                  ) : indicator.trend === 'down' ? (
                    <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />
                  ) : (
                    <Activity className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-end justify-between">
                  <p className={cn(
                    "font-bold",
                    indicator.isAmount || indicator.isPercentage ? "text-lg" : "text-2xl"
                  )}>
                    {indicator.count}
                  </p>
                  {getPriorityBadge(indicator.severity)}
                </div>
              </CanvaCardBody>
            </CanvaCard>
          ))
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Case List */}
        <CanvaCard className="col-span-1">
          <CanvaCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CanvaCardTitle className="text-base">Aktif Vakalar</CanvaCardTitle>
              <CanvaBadge variant="secondary">{cases?.length || 0}</CanvaBadge>
            </div>
            <div className="space-y-2 mt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Vaka ara..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="open">Açık</SelectItem>
                    <SelectItem value="investigating">Soruşturuluyor</SelectItem>
                    <SelectItem value="resolved">Çözüldü</SelectItem>
                    <SelectItem value="escalated">Eskale</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Öncelik" />
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
            </div>
          </CanvaCardHeader>
          <CanvaCardBody className="space-y-2 max-h-[600px] overflow-y-auto">
            {casesLoading ? (
              Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))
            ) : cases && cases.length > 0 ? (
              cases.map((fraudCase) => (
                <div
                  key={fraudCase.id}
                  onClick={() => setSelectedCaseId(fraudCase.id)}
                  className={cn(
                    'p-3 rounded-lg border cursor-pointer transition-colors',
                    selectedCaseId === fraudCase.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50',
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {fraudCase.case_number}
                    </span>
                    {getPriorityBadge(fraudCase.priority)}
                  </div>
                  <p className="font-medium text-sm mb-1">
                    {fraudCase.suspect_name}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {fraudCase.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    {getStatusBadge(fraudCase.status)}
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(fraudCase.total_amount_involved)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShieldAlert className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Vaka bulunamadı</p>
              </div>
            )}
          </CanvaCardBody>
        </CanvaCard>

        {/* Case Detail */}
        <CanvaCard className="col-span-2">
          {caseLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-64" />
            </div>
          ) : selectedCase ? (
            <>
              <CanvaCardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CanvaCardTitle>{selectedCase.case_number}</CanvaCardTitle>
                      {getPriorityBadge(selectedCase.priority)}
                      {getStatusBadge(selectedCase.status)}
                    </div>
                    <CanvaCardSubtitle>{selectedCase.type.replace('_', ' ').toUpperCase()}</CanvaCardSubtitle>
                  </div>
                  <div className="flex gap-2">
                    {!selectedCase.assigned_to && (
                      <CanvaButton
                        variant="outline"
                        size="sm"
                        onClick={handleAssignToMe}
                        disabled={assignCase.isPending}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Üstlen
                      </CanvaButton>
                    )}
                    <CanvaButton variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-1" />
                      Paylaş
                    </CanvaButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <CanvaButton variant="outline" size="sm">
                          Aksiyon
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </CanvaButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleBanAllAccounts}>
                          <Ban className="h-4 w-4 mr-2" />
                          Tüm Hesapları Yasakla
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setResolveAction('warn');
                          setShowResolveDialog(true);
                        }}>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Uyarı Ver
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setResolveAction('escalate');
                          setShowResolveDialog(true);
                        }}>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Eskale Et
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          setResolveAction('dismiss');
                          setShowResolveDialog(true);
                        }}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Kapat (Yanlış Alarm)
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CanvaCardHeader>
              <CanvaCardBody>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Özet</TabsTrigger>
                    <TabsTrigger value="users">
                      Bağlı Hesaplar
                      {linkedAccounts && linkedAccounts.length > 0 && (
                        <CanvaBadge className="ml-2" variant="secondary">
                          {linkedAccounts.length}
                        </CanvaBadge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="evidence">
                      Kanıtlar
                      {evidence && evidence.length > 0 && (
                        <CanvaBadge className="ml-2" variant="secondary">
                          {evidence.length}
                        </CanvaBadge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    {/* Case Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/30">
                        <h4 className="font-medium mb-2">Şüpheli Bilgileri</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">İsim:</span>
                            <span className="font-medium">{selectedCase.suspect_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-medium">{selectedCase.suspect_email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Vaka Tipi:</span>
                            <span className="font-medium">{selectedCase.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30">
                        <h4 className="font-medium mb-2">Vaka Detayları</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Toplam Tutar:</span>
                            <span className="font-medium text-red-500">
                              {formatCurrency(selectedCase.total_amount_involved)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bağlı Hesap:</span>
                            <span className="font-medium">{selectedCase.linked_accounts}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Kanıt Sayısı:</span>
                            <span className="font-medium">{selectedCase.evidence_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="p-4 rounded-lg bg-muted/30">
                      <h4 className="font-medium mb-2">Açıklama</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedCase.description}
                      </p>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-red-500/10 dark:bg-red-500/20 text-center">
                        <p className="text-2xl font-bold text-red-500 dark:text-red-400">
                          {selectedCase.linked_accounts}
                        </p>
                        <p className="text-xs text-muted-foreground">Bağlı Hesap</p>
                      </div>
                      <div className="p-3 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-center">
                        <p className="text-lg font-bold text-orange-500 dark:text-orange-400">
                          {formatCurrency(selectedCase.total_amount_involved)}
                        </p>
                        <p className="text-xs text-muted-foreground">Toplam Hacim</p>
                      </div>
                      <div className="p-3 rounded-lg bg-yellow-500/10 dark:bg-yellow-500/20 text-center">
                        <p className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">
                          {selectedCase.evidence_count}
                        </p>
                        <p className="text-xs text-muted-foreground">Kanıt</p>
                      </div>
                      <div className="p-3 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-center">
                        <p className="text-lg font-bold text-purple-500 dark:text-purple-400">
                          {new Date(selectedCase.reported_at).toLocaleDateString('tr-TR')}
                        </p>
                        <p className="text-xs text-muted-foreground">Rapor Tarihi</p>
                      </div>
                    </div>

                    {/* Resolve Button */}
                    {selectedCase.status !== 'resolved' && (
                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <CanvaButton
                          variant="danger"
                          onClick={() => {
                            setResolveAction('ban');
                            setShowResolveDialog(true);
                          }}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Yasakla ve Kapat
                        </CanvaButton>
                        <CanvaButton
                          variant="success"
                          onClick={() => {
                            setResolveAction('dismiss');
                            setShowResolveDialog(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Yanlış Alarm
                        </CanvaButton>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="users">
                    {linkedAccounts && linkedAccounts.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Kullanıcı</TableHead>
                            <TableHead>Bağlantı Tipi</TableHead>
                            <TableHead>Güven Skoru</TableHead>
                            <TableHead>Tespit Tarihi</TableHead>
                            <TableHead className="text-right">Aksiyon</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {linkedAccounts.map((account) => (
                            <TableRow key={account.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {account.user_name?.slice(0, 2) || 'NA'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{account.user_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {account.user_email}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <CanvaBadge variant="outline">
                                  {account.connection_type.replace('_', ' ')}
                                </CanvaBadge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={account.confidence_score * 100}
                                    className={cn(
                                      'w-16 h-2',
                                      account.confidence_score > 0.8
                                        ? '[&>div]:bg-red-500'
                                        : '[&>div]:bg-yellow-500',
                                    )}
                                  />
                                  <span className="font-medium">
                                    {Math.round(account.confidence_score * 100)}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {new Date(account.detected_at).toLocaleDateString('tr-TR')}
                              </TableCell>
                              <TableCell className="text-right">
                                <CanvaButton variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </CanvaButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Bağlı hesap bulunamadı</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="evidence">
                    {evidence && evidence.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {evidence.map((item) => (
                          <div key={item.id} className="p-4 rounded-lg border">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">{item.title}</span>
                              </div>
                              <CanvaBadge variant="outline">{item.type}</CanvaBadge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.uploaded_at).toLocaleString('tr-TR')}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Kanıt dosyası bulunamadı</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CanvaCardBody>
            </>
          ) : (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
              <div className="text-center">
                <ShieldAlert className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Vaka Seçin</p>
                <p className="text-sm">Detayları görüntülemek için soldaki listeden bir vaka seçin</p>
              </div>
            </div>
          )}
        </CanvaCard>
      </div>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {resolveAction === 'ban' && 'Hesabı Yasakla'}
              {resolveAction === 'warn' && 'Uyarı Ver'}
              {resolveAction === 'dismiss' && 'Vakayı Kapat'}
              {resolveAction === 'escalate' && 'Vakayı Eskale Et'}
            </DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. Lütfen kararınızı açıklayın.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Çözüm açıklaması..."
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <CanvaButton variant="outline" onClick={() => setShowResolveDialog(false)}>
              İptal
            </CanvaButton>
            <CanvaButton
              variant={resolveAction === 'ban' ? 'danger' : 'primary'}
              onClick={handleResolve}
              disabled={resolveCase.isPending || !resolution}
            >
              {resolveCase.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Onayla
            </CanvaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

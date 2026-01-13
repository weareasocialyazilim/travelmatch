'use client';

/**
 * TravelMatch Wallet & Payout Operations
 * Kullanıcı cüzdanları, para çekme talepleri ve KYC yönetimi
 * Real API integration with use-wallet-operations.ts hooks
 */

import { useState } from 'react';
import {
  Wallet,
  Send,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Download,
  RefreshCw,
  Eye,
  UserCheck,
  Ban,
  Building,
  CreditCard,
  DollarSign,
  TrendingUp,
  Shield,
  FileText,
  MoreHorizontal,
  Users,
  Banknote,
  Timer,
  Loader2,
  CheckCheck,
  Image,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useWalletStats,
  usePayoutRequests,
  useKYCVerifications,
  useTopWallets,
  useProcessPayout,
  useBulkProcessPayouts,
  useVerifyKYC,
  type PayoutRequest,
  type KYCVerification,
} from '@/hooks/use-wallet-operations';

export default function WalletOperationsPage() {
  const [activeTab, setActiveTab] = useState('payouts');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showKYCDialog, setShowKYCDialog] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState<KYCVerification | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [kycNotes, setKycNotes] = useState('');

  // Data hooks
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useWalletStats();
  const { data: payouts, isLoading: payoutsLoading, refetch: refetchPayouts } = usePayoutRequests({
    status: statusFilter,
    search: searchQuery,
  });
  const { data: kycQueue, isLoading: kycLoading, refetch: refetchKYC } = useKYCVerifications({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: searchQuery,
  });
  const { data: topWallets, isLoading: walletsLoading } = useTopWallets(10);

  // Mutations
  const processPayout = useProcessPayout();
  const bulkProcess = useBulkProcessPayouts();
  const verifyKYC = useVerifyKYC();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string }> = {
      pending: { className: 'bg-yellow-500/10 text-yellow-500 dark:bg-yellow-500/20 dark:text-yellow-400', label: 'Bekliyor' },
      processing: { className: 'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400', label: 'İşleniyor' },
      completed: { className: 'bg-green-500/10 text-green-500 dark:bg-green-500/20 dark:text-green-400', label: 'Tamamlandı' },
      failed: { className: 'bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400', label: 'Başarısız' },
      cancelled: { className: 'bg-gray-500/10 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400', label: 'İptal' },
      approved: { className: 'bg-green-500/10 text-green-500 dark:bg-green-500/20 dark:text-green-400', label: 'Onaylandı' },
      rejected: { className: 'bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400', label: 'Reddedildi' },
      in_review: { className: 'bg-orange-500/10 text-orange-500 dark:bg-orange-500/20 dark:text-orange-400', label: 'İnceleniyor' },
    };
    const { className, label } = config[status] || config.pending;
    return <CanvaBadge className={className}>{label}</CanvaBadge>;
  };

  const handleApprovePayout = async (payoutId: string) => {
    toast.promise(
      processPayout.mutateAsync({ payoutId, action: 'approve' }),
      {
        loading: 'Ödeme onaylanıyor...',
        success: 'Ödeme onaylandı ve işleme alındı',
        error: 'Ödeme onaylanamadı',
      }
    );
  };

  const handleRejectPayout = async (payoutId: string) => {
    if (!rejectReason) {
      toast.error('Lütfen red sebebi girin');
      return;
    }

    await processPayout.mutateAsync({
      payoutId,
      action: 'reject',
      reason: rejectReason,
    });

    setShowRejectDialog(false);
    setRejectReason('');
  };

  const handleBulkApprove = async () => {
    if (selectedPayouts.length === 0) {
      toast.error('Lütfen en az bir ödeme seçin');
      return;
    }

    toast.promise(
      bulkProcess.mutateAsync({ payoutIds: selectedPayouts, action: 'approve' }),
      {
        loading: `${selectedPayouts.length} ödeme onaylanıyor...`,
        success: `${selectedPayouts.length} ödeme onaylandı`,
        error: 'Toplu onaylama başarısız',
      }
    );

    setSelectedPayouts([]);
  };

  const handleKYCAction = async (action: 'approve' | 'reject') => {
    if (!selectedKYC) return;

    if (action === 'reject' && !rejectReason) {
      toast.error('Lütfen red sebebi girin');
      return;
    }

    await verifyKYC.mutateAsync({
      kycId: selectedKYC.id,
      action,
      reason: action === 'reject' ? rejectReason : undefined,
      notes: kycNotes || undefined,
    });

    setShowKYCDialog(false);
    setSelectedKYC(null);
    setRejectReason('');
    setKycNotes('');
  };

  const togglePayoutSelection = (id: string) => {
    setSelectedPayouts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleRefresh = () => {
    refetchStats();
    refetchPayouts();
    refetchKYC();
    toast.success('Veriler yenilendi');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cüzdan Operasyonları</h1>
          <p className="text-muted-foreground">
            Para çekme talepleri, KYC doğrulama ve cüzdan yönetimi
          </p>
        </div>
        <div className="flex gap-2">
          <CanvaButton variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </CanvaButton>
          <CanvaButton variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Rapor
          </CanvaButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <CanvaStatCard
              label="Bekleyen Ödemeler"
              value={stats?.total_pending_payouts || 0}
              icon={<Clock className="h-6 w-6 text-yellow-500" />}
              change={{ value: 5, label: 'bu hafta' }}
            />
            <CanvaStatCard
              label="Bekleyen Tutar"
              value={formatCurrency(stats?.pending_payout_amount || 0)}
              icon={<Wallet className="h-6 w-6 text-blue-500" />}
            />
            <CanvaStatCard
              label="Bugün İşlenen"
              value={formatCurrency(stats?.processed_amount_today || 0)}
              icon={<CheckCircle2 className="h-6 w-6 text-green-500" />}
              change={{ value: stats?.processed_today || 0, label: 'işlem' }}
            />
            <CanvaStatCard
              label="Bekleyen KYC"
              value={stats?.pending_kyc_count || 0}
              icon={<Shield className="h-6 w-6 text-purple-500" />}
            />
          </>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="payouts">
              <Banknote className="h-4 w-4 mr-2" />
              Ödeme Talepleri
              {payouts && payouts.filter(p => p.status === 'pending').length > 0 && (
                <CanvaBadge className="ml-2" variant="warning">
                  {payouts.filter(p => p.status === 'pending').length}
                </CanvaBadge>
              )}
            </TabsTrigger>
            <TabsTrigger value="kyc">
              <UserCheck className="h-4 w-4 mr-2" />
              KYC Doğrulama
              {kycQueue && kycQueue.filter(k => k.status === 'pending').length > 0 && (
                <CanvaBadge className="ml-2" variant="warning">
                  {kycQueue.filter(k => k.status === 'pending').length}
                </CanvaBadge>
              )}
            </TabsTrigger>
            <TabsTrigger value="wallets">
              <Wallet className="h-4 w-4 mr-2" />
              En Yüksek Bakiyeler
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ara..."
                className="pl-9 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="pending">Bekliyor</SelectItem>
                <SelectItem value="processing">İşleniyor</SelectItem>
                <SelectItem value="completed">Tamamlandı</SelectItem>
                <SelectItem value="failed">Başarısız</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Payouts Tab */}
        <TabsContent value="payouts">
          <CanvaCard>
            <CanvaCardHeader>
              <div className="flex items-center justify-between">
                <CanvaCardTitle>Ödeme Talepleri</CanvaCardTitle>
                {selectedPayouts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedPayouts.length} seçili
                    </span>
                    <CanvaButton
                      variant="success"
                      size="sm"
                      onClick={handleBulkApprove}
                      disabled={bulkProcess.isPending}
                    >
                      {bulkProcess.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      <CheckCheck className="h-4 w-4 mr-2" />
                      Toplu Onayla
                    </CanvaButton>
                  </div>
                )}
              </div>
            </CanvaCardHeader>
            <CanvaCardBody>
              {payoutsLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : payouts && payouts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          className="rounded"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPayouts(payouts.filter(p => p.status === 'pending').map(p => p.id));
                            } else {
                              setSelectedPayouts([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Banka / IBAN</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          {payout.status === 'pending' && (
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={selectedPayouts.includes(payout.id)}
                              onChange={() => togglePayoutSelection(payout.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={payout.user_avatar || ''} />
                              <AvatarFallback>
                                {payout.user_name?.slice(0, 2) || 'NA'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{payout.user_name}</p>
                              <p className="text-xs text-muted-foreground">{payout.user_email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-lg">{formatCurrency(payout.amount)}</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payout.bank_details?.bank_name || '-'}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {payout.bank_details?.iban || '-'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {new Date(payout.created_at).toLocaleDateString('tr-TR')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payout.created_at).toLocaleTimeString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell className="text-right">
                          {payout.status === 'pending' && (
                            <div className="flex justify-end gap-1">
                              <CanvaButton
                                variant="ghost"
                                size="sm"
                                iconOnly
                                className="text-green-500"
                                onClick={() => handleApprovePayout(payout.id)}
                                disabled={processPayout.isPending}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </CanvaButton>
                              <CanvaButton
                                variant="ghost"
                                size="sm"
                                iconOnly
                                className="text-red-500"
                                onClick={() => {
                                  setSelectedPayouts([payout.id]);
                                  setShowRejectDialog(true);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </CanvaButton>
                              <CanvaButton variant="ghost" size="sm" iconOnly>
                                <Eye className="h-4 w-4" />
                              </CanvaButton>
                            </div>
                          )}
                          {payout.status !== 'pending' && (
                            <CanvaButton variant="ghost" size="sm" iconOnly>
                              <Eye className="h-4 w-4" />
                            </CanvaButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Banknote className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Ödeme talebi bulunamadı</p>
                </div>
              )}
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* KYC Tab */}
        <TabsContent value="kyc">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>KYC Doğrulama Kuyruğu</CanvaCardTitle>
              <CanvaCardSubtitle>
                Kimlik doğrulama bekleyen kullanıcılar
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              {kycLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : kycQueue && kycQueue.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Belge Tipi</TableHead>
                      <TableHead>AI Güven</TableHead>
                      <TableHead>Uyarılar</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kycQueue.map((kyc) => (
                      <TableRow key={kyc.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={kyc.user_avatar || ''} />
                              <AvatarFallback>
                                {kyc.user_name?.slice(0, 2) || 'NA'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{kyc.user_name}</p>
                              <p className="text-xs text-muted-foreground">{kyc.user_email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <CanvaBadge variant="outline">
                            {kyc.document_type === 'national_id' ? 'TC Kimlik' :
                             kyc.document_type === 'passport' ? 'Pasaport' :
                             kyc.document_type === 'drivers_license' ? 'Ehliyet' : kyc.document_type}
                          </CanvaBadge>
                        </TableCell>
                        <TableCell>
                          {kyc.ai_confidence_score !== null && (
                            <div className="flex items-center gap-2">
                              <Progress
                                value={kyc.ai_confidence_score * 100}
                                className={cn(
                                  'w-16 h-2',
                                  kyc.ai_confidence_score > 0.8
                                    ? '[&>div]:bg-green-500'
                                    : kyc.ai_confidence_score > 0.5
                                    ? '[&>div]:bg-yellow-500'
                                    : '[&>div]:bg-red-500'
                                )}
                              />
                              <span className="text-sm font-medium">
                                {Math.round(kyc.ai_confidence_score * 100)}%
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {kyc.ai_flags && kyc.ai_flags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {kyc.ai_flags.slice(0, 2).map((flag, i) => (
                                <CanvaBadge key={i} variant="error" className="text-xs">
                                  {flag}
                                </CanvaBadge>
                              ))}
                              {kyc.ai_flags.length > 2 && (
                                <CanvaBadge variant="default" className="text-xs">
                                  +{kyc.ai_flags.length - 2}
                                </CanvaBadge>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {new Date(kyc.submitted_at).toLocaleDateString('tr-TR')}
                          </p>
                        </TableCell>
                        <TableCell>{getStatusBadge(kyc.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <CanvaButton
                              variant="ghost"
                              size="sm"
                              iconOnly
                              onClick={() => {
                                setSelectedKYC(kyc);
                                setShowKYCDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </CanvaButton>
                            {kyc.status === 'pending' && (
                              <>
                                <CanvaButton
                                  variant="ghost"
                                  size="sm"
                                  iconOnly
                                  className="text-green-500"
                                  onClick={() => {
                                    setSelectedKYC(kyc);
                                    handleKYCAction('approve');
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </CanvaButton>
                                <CanvaButton
                                  variant="ghost"
                                  size="sm"
                                  iconOnly
                                  className="text-red-500"
                                  onClick={() => {
                                    setSelectedKYC(kyc);
                                    setShowKYCDialog(true);
                                  }}
                                >
                                  <XCircle className="h-4 w-4" />
                                </CanvaButton>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>KYC doğrulama bekleyen kullanıcı yok</p>
                </div>
              )}
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Top Wallets Tab */}
        <TabsContent value="wallets">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>En Yüksek Bakiyeler</CanvaCardTitle>
              <CanvaCardSubtitle>
                En yüksek bakiyeye sahip kullanıcılar
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              {walletsLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : topWallets && topWallets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Bakiye</TableHead>
                      <TableHead>Bekleyen</TableHead>
                      <TableHead>Toplam Kazanç</TableHead>
                      <TableHead>Toplam Çekim</TableHead>
                      <TableHead>Son İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topWallets.map((wallet, index) => (
                      <TableRow key={wallet.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-muted-foreground">
                              #{index + 1}
                            </span>
                            <div>
                              <p className="font-medium">{wallet.user_name}</p>
                              <p className="text-xs text-muted-foreground">{wallet.user_email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-lg text-green-600 dark:text-green-400">
                            {formatCurrency(wallet.balance)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {wallet.pending_balance > 0 ? (
                            <span className="text-yellow-600 dark:text-yellow-400">
                              {formatCurrency(wallet.pending_balance)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(wallet.total_earned)}</TableCell>
                        <TableCell>{formatCurrency(wallet.total_withdrawn)}</TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {new Date(wallet.last_activity).toLocaleDateString('tr-TR')}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Cüzdan verisi bulunamadı</p>
                </div>
              )}
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödeme Talebini Reddet</DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. Lütfen red sebebini belirtin.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Red sebebi..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <CanvaButton variant="outline" onClick={() => setShowRejectDialog(false)}>
              İptal
            </CanvaButton>
            <CanvaButton
              variant="danger"
              onClick={() => handleRejectPayout(selectedPayouts[0])}
              disabled={processPayout.isPending || !rejectReason}
            >
              {processPayout.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reddet
            </CanvaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KYC Review Dialog */}
      <Dialog open={showKYCDialog} onOpenChange={setShowKYCDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>KYC Doğrulama İnceleme</DialogTitle>
            <DialogDescription>
              {selectedKYC?.user_name} - {selectedKYC?.document_type}
            </DialogDescription>
          </DialogHeader>

          {selectedKYC && (
            <div className="space-y-4">
              {/* Document Images */}
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-2">
                  <p className="text-xs text-muted-foreground mb-2">Ön Yüz</p>
                  <div className="aspect-[3/2] bg-muted rounded flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                {selectedKYC.document_back_url && (
                  <div className="border rounded-lg p-2">
                    <p className="text-xs text-muted-foreground mb-2">Arka Yüz</p>
                    <div className="aspect-[3/2] bg-muted rounded flex items-center justify-center">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div className="border rounded-lg p-2">
                  <p className="text-xs text-muted-foreground mb-2">Selfie</p>
                  <div className="aspect-[3/2] bg-muted rounded flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              {selectedKYC.ai_confidence_score !== null && (
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">AI Analizi</span>
                    <span className={cn(
                      "font-bold",
                      selectedKYC.ai_confidence_score > 0.8 ? "text-green-500" :
                      selectedKYC.ai_confidence_score > 0.5 ? "text-yellow-500" : "text-red-500"
                    )}>
                      {Math.round(selectedKYC.ai_confidence_score * 100)}% Güven
                    </span>
                  </div>
                  {selectedKYC.ai_flags && selectedKYC.ai_flags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedKYC.ai_flags.map((flag, i) => (
                        <CanvaBadge key={i} variant="error">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {flag}
                        </CanvaBadge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-sm font-medium">İnceleme Notları</label>
                <Textarea
                  placeholder="Notlarınızı ekleyin..."
                  value={kycNotes}
                  onChange={(e) => setKycNotes(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Rejection Reason (if rejecting) */}
              <div>
                <label className="text-sm font-medium">Red Sebebi (Opsiyonel)</label>
                <Textarea
                  placeholder="Red sebebi..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <CanvaButton variant="outline" onClick={() => setShowKYCDialog(false)}>
              İptal
            </CanvaButton>
            <CanvaButton
              variant="danger"
              onClick={() => handleKYCAction('reject')}
              disabled={verifyKYC.isPending}
            >
              Reddet
            </CanvaButton>
            <CanvaButton
              variant="success"
              onClick={() => handleKYCAction('approve')}
              disabled={verifyKYC.isPending}
            >
              {verifyKYC.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Onayla
            </CanvaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

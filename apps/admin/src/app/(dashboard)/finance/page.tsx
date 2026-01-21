'use client';

import { useState } from 'react';
import {
  Search,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  CreditCard,
  Wallet,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { logger } from '@/lib/logger';
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
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { formatCurrency, formatRelativeDate, getInitials } from '@/lib/utils';
import { useFinance } from '@/hooks/use-finance';
import { exportToCSV, generateExportFilename } from '@/lib/export';

const transactionTypeConfig = {
  payment: {
    label: 'Ödeme',
    icon: ArrowUpRight,
    color: 'text-green-600 dark:text-green-400',
  },
  subscription: {
    label: 'Abonelik',
    icon: ArrowUpRight,
    color: 'text-green-600 dark:text-green-400',
  },
  boost: {
    label: 'Boost',
    icon: ArrowUpRight,
    color: 'text-blue-600 dark:text-blue-400',
  },
  payout: {
    label: 'Çekim',
    icon: ArrowDownRight,
    color: 'text-blue-600 dark:text-blue-400',
  },
  refund: {
    label: 'İade',
    icon: ArrowDownRight,
    color: 'text-orange-600 dark:text-orange-400',
  },
  gift: {
    label: 'Hediye',
    icon: DollarSign,
    color: 'text-purple-600 dark:text-purple-400',
  },
  fee: {
    label: 'Komisyon',
    icon: DollarSign,
    color: 'text-purple-600 dark:text-purple-400',
  },
};

const statusConfig = {
  pending: { label: 'Bekliyor', variant: 'warning' as const },
  completed: { label: 'Tamamlandı', variant: 'success' as const },
  approved: { label: 'Onaylandı', variant: 'success' as const },
  processing: { label: 'İşleniyor', variant: 'info' as const },
  failed: { label: 'Başarısız', variant: 'error' as const },
  cancelled: { label: 'İptal', variant: 'default' as const },
};

interface PendingPayout {
  id: string;
  amount: number;
}

interface TitanHealth {
  total_transactions: number;
  total_escrow_volume: number;
  active_escrow_balance: number;
  direct_volume: number;
  optional_volume: number;
  mandatory_volume: number;
  pending_withdrawals_count: number;
  pending_withdrawals_amount: number;
  pending_proofs_count: number;
  total_coins_sold: number;
  apple_pending_funds: number;
}

export default function FinancePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [titanHealth, setTitanHealth] = useState<TitanHealth | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Use real API data
  const { stats, transactions, isLoading, loadData, exportData, error } =
    useFinance(dateRange);

  useEffect(() => {
    // Load Titan Health independently
    const loadTitanHealth = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client'); // Dynamic import to avoid SSR issues if any
        const supabase = createClient();
        const { data, error } = await supabase
          .from('view_financial_health')
          .select('*')
          .single();
        if (!error && data) {
          setTitanHealth(data as any);
        }
      } catch (e) {
        logger.error('Failed to load titan health', e);
      }
    };
    loadTitanHealth();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/finance/payout/${id}/approve`, { method: 'POST' });
      if (!response.ok) throw new Error('Onay başarısız');
      toast.success('Ödeme başarıyla onaylandı');
      loadData();
    } catch (e) {
      toast.error('Onaylama sırasında hata oluştu');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/finance/payout/${id}/reject`, { method: 'POST' });
      if (!response.ok) throw new Error('Red başarısız');
      toast.success('Ödeme reddedildi');
      loadData();
    } catch (e) {
      toast.error('Reddetme sırasında hata oluştu');
    }
  };

  const allTransactions = transactions || [];
  const summary = stats || {
    totalRevenue: 0,
    totalRefunds: 0,
    subscriptionRevenue: 0,
    boostRevenue: 0,
    transactionCount: 0,
  };

  // Filter transactions
  const filteredTransactions = allTransactions.filter((tx) => {
    const matchesSearch =
      search === '' || tx.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pending payouts (filter by type)
  const pendingPayouts = allTransactions.filter(
    (tx) => tx.status === 'pending',
  );
  const pendingPayoutsCount = pendingPayouts.length;
  const pendingPayoutsTotal = pendingPayouts.reduce(
    (sum, p) => sum + p.amount,
    0,
  );

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">Bir hata oluştu</h2>
          <p className="text-muted-foreground">
            Finansal veriler yüklenemedi. Lütfen tekrar deneyin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finans</h1>
          <p className="text-muted-foreground">
            Ödemeleri, çekimleri ve finansal işlemleri yönetin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={period}
            onValueChange={(v) => setPeriod(v as '7d' | '30d' | '90d')}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 gün</SelectItem>
              <SelectItem value="30d">30 gün</SelectItem>
              <SelectItem value="90d">90 gün</SelectItem>
            </SelectContent>
          </Select>
          <CanvaButton
            variant="primary"
            disabled={isLoading || allTransactions.length === 0}
            onClick={() => {
              try {
                const exportData = allTransactions.map((tx) => ({
                  ID: tx.id,
                  Tip:
                    transactionTypeConfig[
                      tx.type as keyof typeof transactionTypeConfig
                    ]?.label || tx.type,
                  Tutar: tx.amount,
                  ParaBirimi: tx.currency,
                  Durum:
                    statusConfig[tx.status as keyof typeof statusConfig]
                      ?.label || tx.status,
                  KullaniciID: tx.user_id,
                  Tarih: new Date(tx.created_at).toLocaleDateString('tr-TR'),
                }));

                exportToCSV(
                  exportData,
                  [
                    { header: 'İşlem ID', accessor: 'ID' },
                    { header: 'Tip', accessor: 'Tip' },
                    { header: 'Tutar', accessor: 'Tutar' },
                    { header: 'Para Birimi', accessor: 'ParaBirimi' },
                    { header: 'Durum', accessor: 'Durum' },
                    { header: 'Kullanıcı ID', accessor: 'KullaniciID' },
                    { header: 'Tarih', accessor: 'Tarih' },
                  ],
                  generateExportFilename('finans-raporu'),
                );

                toast.success('Finansal rapor başarıyla indirildi');
              } catch (error) {
                toast.error('Rapor indirilemedi');
              }
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Rapor İndir
          </CanvaButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* TITAN PROTOCOL HEALTH WIDGET */}
        <div className="rounded-xl border bg-card p-6 shadow-sm border-l-4 border-l-indigo-500">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Titan Protocol (Locked)
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">
                {titanHealth
                  ? formatCurrency(titanHealth.active_escrow_balance)
                  : '...'}
              </span>
              <span className="text-xs text-indigo-500 font-medium">Safe</span>
            </div>
            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500"
                style={{ width: '100%' }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {titanHealth?.total_transactions || 0} secure txns •{' '}
              {titanHealth?.pending_proofs_count || 0} pending proofs
            </p>
          </div>
        </div>

        {/* PENDING WITHDRAWALS WIDGET */}
        <div className="rounded-xl border bg-card p-6 shadow-sm border-l-4 border-l-orange-500">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Pending Withdrawals
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">
                {titanHealth ? titanHealth.pending_withdrawals_count : '...'}
              </span>
              <span className="text-xs text-orange-500">Requests</span>
            </div>
            <p className="text-sm font-medium">
              {titanHealth
                ? formatCurrency(titanHealth.pending_withdrawals_amount)
                : '...'}
            </p>
            <p className="text-xs text-muted-foreground">Manual Check Required if > 1k</p>
          </div>
        </div>

        {/* LVND SALES WIDGET */}
        <div className="rounded-xl border bg-card p-6 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Total LVND Sold
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">
                {titanHealth ? titanHealth.total_coins_sold?.toLocaleString() : '...'}
              </span>
              <span className="text-xs text-blue-500">Units</span>
            </div>
            <p className="text-sm font-medium">
              Gross: {titanHealth ? formatCurrency(titanHealth.total_coins_sold * 1.5) : '...'}
            </p>
            <p className="text-xs text-muted-foreground">Consumable Revenue</p>
          </div>
        </div>

        {/* NET REVENUE WIDGET (Apple Tax Applied) */}
        <div className="rounded-xl border bg-card p-6 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Apple Pending Funds
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">
                {titanHealth ? formatCurrency(titanHealth.apple_pending_funds) : '...'}
              </span>
              <span className="text-xs text-emerald-500 font-medium">Verified</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated Payout from App Store
            </p>
          </div>
        </div>

        <CanvaStatCard
          title="Toplam Gelir"
          value={isLoading ? '...' : formatCurrency(summary.totalRevenue)}
          description={`Son ${period === '7d' ? '7 gün' : period === '30d' ? '30 gün' : '90 gün'}`}
          icon={<DollarSign className="h-5 w-5" />}
          accentColor="emerald"
          trend="up"
        />
        <CanvaStatCard
          title="Abonelik Geliri"
          value={
            isLoading ? '...' : formatCurrency(summary.subscriptionRevenue)
          }
          description={`Toplam gelirin %${summary.totalRevenue > 0 ? Math.round((summary.subscriptionRevenue / summary.totalRevenue) * 100) : 0}'i`}
          icon={<CreditCard className="h-5 w-5" />}
          accentColor="violet"
        />
        <CanvaStatCard
          title="Bekleyen İşlemler"
          value={isLoading ? '...' : pendingPayoutsCount.toString()}
          description={`Toplam ${formatCurrency(pendingPayoutsTotal)}`}
          icon={<Clock className="h-5 w-5" />}
          accentColor="amber"
        />
        <CanvaStatCard
          title="Toplam İşlem"
          value={isLoading ? '...' : summary.transactionCount.toString()}
          description="Bu dönem"
          icon={<Wallet className="h-5 w-5" />}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">İşlem Geçmişi</TabsTrigger>
          <TabsTrigger value="payouts">
            Bekleyen Ödemeler
            {pendingPayoutsCount > 0 && (
              <CanvaBadge variant="warning" className="ml-2">
                {pendingPayoutsCount}
              </CanvaBadge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>İşlem Geçmişi</CanvaCardTitle>
              <CanvaCardSubtitle>
                Tüm finansal işlemleri görüntüleyin
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              {/* Filters */}
              <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="İşlem ID ara..."
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
                    <SelectItem value="completed">Tamamlanan</SelectItem>
                    <SelectItem value="pending">Bekleyen</SelectItem>
                    <SelectItem value="failed">Başarısız</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Transaction List */}
              {!isLoading && (
                <div className="rounded-md border">
                  <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
                    <div>İşlem ID</div>
                    <div>Tür</div>
                    <div>Tutar</div>
                    <div>Durum</div>
                    <div>Tarih</div>
                  </div>
                  {filteredTransactions.map((tx) => {
                    const typeInfo = transactionTypeConfig[
                      tx.type as keyof typeof transactionTypeConfig
                    ] || {
                      label: tx.type,
                      icon: DollarSign,
                      color: 'text-muted-foreground',
                    };
                    const statusInfo = statusConfig[
                      tx.status as keyof typeof statusConfig
                    ] || { label: tx.status, variant: 'default' as const };
                    const TypeIcon = typeInfo.icon;

                    return (
                      <div
                        key={tx.id}
                        className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b px-4 py-3 last:border-0"
                      >
                        <div>
                          <div className="font-medium font-mono text-sm">
                            {tx.id}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            User: {tx.user_id}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                          <span className={typeInfo.color}>
                            {typeInfo.label}
                          </span>
                        </div>
                        <div className="text-right font-medium">
                          {tx.type === 'refund' ? '-' : '+'}
                          {formatCurrency(tx.amount, tx.currency)}
                        </div>
                        <CanvaBadge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </CanvaBadge>
                        <div className="text-sm text-muted-foreground">
                          {formatRelativeDate(tx.created_at)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isLoading && filteredTransactions.length === 0 && (
                <div className="py-12 text-center">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    İşlem bulunamadı
                  </h3>
                  <p className="text-muted-foreground">
                    Arama kriterlerine uygun işlem yok
                  </p>
                </div>
              )}
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Bekleyen Ödemeler</CanvaCardTitle>
              <CanvaCardSubtitle>
                Kullanıcı çekim taleplerini inceleyin ve onaylayın
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPayouts.map((payout) => {
                    const statusInfo = statusConfig[
                      payout.status as keyof typeof statusConfig
                    ] || {
                      label: payout.status,
                      variant: 'default' as const,
                    };

                    return (
                      <div
                        key={payout.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {getInitials(payout.user_id)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{payout.id}</span>
                              <CanvaBadge variant={statusInfo.variant}>
                                {statusInfo.label}
                              </CanvaBadge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>User: {payout.user_id}</span>
                              <span>•</span>
                              <span>
                                {formatRelativeDate(payout.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {formatCurrency(payout.amount, payout.currency)}
                            </div>
                          </div>
                          {payout.status === 'pending' && (
                            <div className="flex gap-2">
                              <CanvaButton
                                size="sm"
                                variant="danger"
                                onClick={() => handleReject(payout.id)}
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Reddet
                              </CanvaButton>
                              <CanvaButton
                                size="sm"
                                variant="success"
                                onClick={() => handleApprove(payout.id)}
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Onayla
                              </CanvaButton>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isLoading && pendingPayouts.length === 0 && (
                <div className="py-12 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 dark:text-green-400" />
                  <h3 className="mt-4 text-lg font-semibold">
                    Bekleyen ödeme yok
                  </h3>
                  <p className="text-muted-foreground">
                    Tüm ödemeler işlenmiş durumda
                  </p>
                </div>
              )}
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

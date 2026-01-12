'use client';

/**
 * TravelMatch Escrow & Payment Operations
 * Tum odeme islemleri, escrow yonetimi ve finansal operasyonlar
 *
 * PayTR entegrasyonu, escrow sistemleri, iade yonetimi ve cuzdan islemleri
 */

import { useState } from 'react';
import {
  Lock,
  Unlock,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  Shield,
  FileText,
  MoreHorizontal,
  UserCheck,
  Ban,
  Send,
  Receipt,
  Building,
  AlertCircle,
  CheckCheck,
  Timer,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
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
import { formatCurrency, cn } from '@/lib/utils';
import { AdminAreaChart, CHART_COLORS } from '@/components/common/admin-chart';

// Escrow Stats
const escrowStats = {
  totalEscrow: 1245680,
  pendingRelease: 456780,
  releasedToday: 89450,
  refundedToday: 12300,
  activeTransactions: 234,
  avgEscrowDuration: 3.2, // gun
  disputeRate: 2.3,
  successRate: 97.7,
};

// Payment Stats
const paymentStats = {
  todayVolume: 845230,
  todayTransactions: 567,
  avgTransactionValue: 1491,
  successRate: 99.2,
  failedTransactions: 5,
  pendingKYC: 23,
  subscriptionRevenue: 234560,
  giftRevenue: 156780,
};

// Escrow Tiers Configuration
const escrowTiers = [
  {
    tier: 'Direct Pay',
    range: '0-30 USD',
    escrow: 'Yok',
    description: 'Dogrudan odeme, escrow yok',
    color: 'bg-gray-500',
  },
  {
    tier: 'Optional Escrow',
    range: '30-100 USD',
    escrow: 'Opsiyonel',
    description: 'Kullanici secimi ile escrow',
    color: 'bg-blue-500',
  },
  {
    tier: 'Mandatory Escrow',
    range: '100+ USD',
    escrow: 'Zorunlu',
    description: 'Proof ile serbest birakilir',
    color: 'bg-emerald-500',
  },
];

// Active Escrow Transactions
const activeEscrows = [
  {
    id: 'ESC-2024-001',
    sender: 'Ahmet K.',
    receiver: 'Ayse M.',
    amount: 2450,
    currency: 'TRY',
    moment: 'Kapadokya Balloon Tour',
    status: 'awaiting_proof',
    createdAt: '2024-01-08 14:30',
    expiresAt: '2024-01-15 14:30',
    proofStatus: 'pending',
    daysRemaining: 5,
  },
  {
    id: 'ESC-2024-002',
    sender: 'Mehmet S.',
    receiver: 'Zeynep A.',
    amount: 1800,
    currency: 'TRY',
    moment: 'Bosphorus Dinner Cruise',
    status: 'proof_submitted',
    createdAt: '2024-01-07 10:15',
    expiresAt: '2024-01-14 10:15',
    proofStatus: 'under_review',
    daysRemaining: 4,
  },
  {
    id: 'ESC-2024-003',
    sender: 'Can B.',
    receiver: 'Deniz K.',
    amount: 3200,
    currency: 'TRY',
    moment: 'Private Istanbul Tour',
    status: 'disputed',
    createdAt: '2024-01-05 16:45',
    expiresAt: '2024-01-12 16:45',
    proofStatus: 'rejected',
    daysRemaining: 2,
  },
  {
    id: 'ESC-2024-004',
    sender: 'Elif T.',
    receiver: 'Burak Y.',
    amount: 5600,
    currency: 'TRY',
    moment: 'Luxury Yacht Experience',
    status: 'ready_to_release',
    createdAt: '2024-01-06 09:00',
    expiresAt: '2024-01-13 09:00',
    proofStatus: 'verified',
    daysRemaining: 3,
  },
  {
    id: 'ESC-2024-005',
    sender: 'Ali R.',
    receiver: 'Selin G.',
    amount: 1200,
    currency: 'TRY',
    moment: 'Cooking Class Experience',
    status: 'awaiting_proof',
    createdAt: '2024-01-09 11:30',
    expiresAt: '2024-01-16 11:30',
    proofStatus: 'pending',
    daysRemaining: 6,
  },
];

// Recent Transactions
const recentTransactions = [
  {
    id: 'TXN-001',
    type: 'payment',
    user: 'Ahmet K.',
    amount: 2450,
    status: 'completed',
    method: 'saved_card',
    time: '5 dk once',
  },
  {
    id: 'TXN-002',
    type: 'payout',
    user: 'Ayse M.',
    amount: 1800,
    status: 'processing',
    method: 'bank_transfer',
    time: '12 dk once',
  },
  {
    id: 'TXN-003',
    type: 'refund',
    user: 'Can B.',
    amount: 650,
    status: 'completed',
    method: 'original_method',
    time: '23 dk once',
  },
  {
    id: 'TXN-004',
    type: 'subscription',
    user: 'Deniz K.',
    amount: 149,
    status: 'completed',
    method: 'saved_card',
    time: '35 dk once',
  },
  {
    id: 'TXN-005',
    type: 'payment',
    user: 'Elif T.',
    amount: 5600,
    status: 'completed',
    method: 'new_card',
    time: '42 dk once',
  },
  {
    id: 'TXN-006',
    type: 'payout',
    user: 'Burak Y.',
    amount: 3200,
    status: 'pending_kyc',
    method: 'bank_transfer',
    time: '1 saat once',
  },
];

// Pending Payouts
const pendingPayouts = [
  {
    id: 'PAY-001',
    user: 'Ayse M.',
    amount: 4560,
    bank: 'Garanti BBVA',
    iban: 'TR12...7890',
    kycStatus: 'verified',
    requestedAt: '2024-01-08',
  },
  {
    id: 'PAY-002',
    user: 'Mehmet S.',
    amount: 2340,
    bank: 'Isbank',
    iban: 'TR45...1234',
    kycStatus: 'verified',
    requestedAt: '2024-01-08',
  },
  {
    id: 'PAY-003',
    user: 'Zeynep A.',
    amount: 8900,
    bank: 'Akbank',
    iban: 'TR78...5678',
    kycStatus: 'pending',
    requestedAt: '2024-01-07',
  },
  {
    id: 'PAY-004',
    user: 'Can B.',
    amount: 1200,
    bank: 'Yapi Kredi',
    iban: 'TR90...9012',
    kycStatus: 'verified',
    requestedAt: '2024-01-07',
  },
];

// Chart Data
const dailyVolumeData = [
  { date: 'Pzt', volume: 685000, transactions: 456 },
  { date: 'Sal', volume: 720000, transactions: 489 },
  { date: 'Car', volume: 650000, transactions: 423 },
  { date: 'Per', volume: 890000, transactions: 578 },
  { date: 'Cum', volume: 945000, transactions: 612 },
  { date: 'Cmt', volume: 1120000, transactions: 723 },
  { date: 'Paz', volume: 845230, transactions: 567 },
];

export default function EscrowOperationsPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEscrow, setSelectedEscrow] = useState<
    (typeof activeEscrows)[0] | null
  >(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: string;
    escrow: (typeof activeEscrows)[0] | null;
  }>({
    open: false,
    action: '',
    escrow: null,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'awaiting_proof':
        return (
          <CanvaBadge
            variant="primary"
            className="bg-amber-500/10 text-amber-600 border-amber-500/30"
          >
            <Timer className="h-3 w-3 mr-1" />
            Proof Bekleniyor
          </CanvaBadge>
        );
      case 'proof_submitted':
        return (
          <CanvaBadge
            variant="primary"
            className="bg-blue-500/10 text-blue-600 border-blue-500/30"
          >
            <Eye className="h-3 w-3 mr-1" />
            Inceleniyor
          </CanvaBadge>
        );
      case 'ready_to_release':
        return (
          <CanvaBadge
            variant="primary"
            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Serbest Birakilabilir
          </CanvaBadge>
        );
      case 'disputed':
        return (
          <CanvaBadge
            variant="primary"
            className="bg-red-500/10 text-red-600 border-red-500/30"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Anlasmazlik
          </CanvaBadge>
        );
      case 'released':
        return (
          <CanvaBadge
            variant="primary"
            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
          >
            <Unlock className="h-3 w-3 mr-1" />
            Serbest
          </CanvaBadge>
        );
      case 'refunded':
        return (
          <CanvaBadge
            variant="primary"
            className="bg-gray-500/10 text-gray-600 border-gray-500/30"
          >
            <ArrowDownRight className="h-3 w-3 mr-1" />
            Iade Edildi
          </CanvaBadge>
        );
      default:
        return <CanvaBadge variant="primary">{status}</CanvaBadge>;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="h-4 w-4 text-emerald-500" />;
      case 'payout':
        return <Send className="h-4 w-4 text-blue-500" />;
      case 'refund':
        return <ArrowDownRight className="h-4 w-4 text-amber-500" />;
      case 'subscription':
        return <Receipt className="h-4 w-4 text-purple-500" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getTransactionStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <CanvaBadge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
            Tamamlandi
          </CanvaBadge>
        );
      case 'processing':
        return (
          <CanvaBadge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
            Isleniyor
          </CanvaBadge>
        );
      case 'pending_kyc':
        return (
          <CanvaBadge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">
            KYC Bekliyor
          </CanvaBadge>
        );
      case 'failed':
        return (
          <CanvaBadge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">
            Basarisiz
          </CanvaBadge>
        );
      default:
        return <CanvaBadge variant="primary">{status}</CanvaBadge>;
    }
  };

  const handleEscrowAction = (
    action: string,
    escrow: (typeof activeEscrows)[0],
  ) => {
    setActionDialog({ open: true, action, escrow });
  };

  return (
    <div className="admin-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Lock className="h-6 w-6 text-purple-500" />
            Escrow & Payment Operations
          </h1>
          <p className="text-muted-foreground">
            Tum odeme islemleri, escrow yonetimi ve finansal operasyonlar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CanvaButton variant="primary" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapor Indir
          </CanvaButton>
          <CanvaButton size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </CanvaButton>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
        {/* Escrow Stats */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Toplam Escrow
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-purple-600">
              {formatCurrency(escrowStats.totalEscrow, 'TRY')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{escrowStats.activeTransactions} aktif islem</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Serbest Birakilacak
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600">
              {formatCurrency(escrowStats.pendingRelease, 'TRY')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Ort. {escrowStats.avgEscrowDuration} gun</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Stats */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              Bugunun Hacmi
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              {formatCurrency(paymentStats.todayVolume, 'TRY')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>{paymentStats.todayTransactions} islem</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Basari Orani
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              %{paymentStats.successRate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-red-500">
              <XCircle className="h-3 w-3" />
              <span>{paymentStats.failedTransactions} basarisiz</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escrow Tiers Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Escrow Katmanlari</CardTitle>
          <CardDescription>
            PayTR entegrasyonu ile guvenli odeme sistemi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {escrowTiers.map((tier) => (
              <div
                key={tier.tier}
                className="flex items-start gap-3 p-4 rounded-lg bg-muted/50"
              >
                <div
                  className={cn(
                    'w-2 h-full min-h-[60px] rounded-full',
                    tier.color,
                  )}
                />
                <div>
                  <p className="font-medium">{tier.tier}</p>
                  <p className="text-sm text-muted-foreground">{tier.range}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tier.description}
                  </p>
                  <CanvaBadge variant="primary" className="mt-2 text-xs">
                    {tier.escrow}
                  </CanvaBadge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Genel Bakis</TabsTrigger>
          <TabsTrigger value="escrows">Aktif Escrow'lar</TabsTrigger>
          <TabsTrigger value="transactions">Islemler</TabsTrigger>
          <TabsTrigger value="payouts">Odemeleri Bekleyenler</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Volume Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Gunluk Islem Hacmi</CardTitle>
                <CardDescription>Son 7 gunluk odeme hacmi</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminAreaChart
                  data={dailyVolumeData}
                  xAxisKey="date"
                  height={250}
                  areas={[
                    {
                      dataKey: 'volume',
                      name: 'Hacim',
                      color: CHART_COLORS.primary,
                    },
                  ]}
                  formatter={(value, name) => [
                    formatCurrency(value as number, 'TRY'),
                    name,
                  ]}
                />
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Son Islemler</CardTitle>
                  <CanvaButton variant="ghost" size="sm">
                    Tumunu Gor
                  </CanvaButton>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-3">
                    {recentTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-background">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{tx.user}</p>
                            <p className="text-xs text-muted-foreground">
                              {tx.type} - {tx.method}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              'text-sm font-medium',
                              tx.type === 'refund'
                                ? 'text-amber-600'
                                : 'text-emerald-600',
                            )}
                          >
                            {tx.type === 'refund' ? '-' : '+'}
                            {formatCurrency(tx.amount, 'TRY')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Bugun Serbest
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(escrowStats.releasedToday, 'TRY')}
                    </p>
                  </div>
                  <Unlock className="h-8 w-8 text-emerald-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bugun Iade</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(escrowStats.refundedToday, 'TRY')}
                    </p>
                  </div>
                  <ArrowDownRight className="h-8 w-8 text-amber-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Abonelik</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(paymentStats.subscriptionRevenue, 'TRY')}
                    </p>
                  </div>
                  <Receipt className="h-8 w-8 text-purple-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/10 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Hediye Geliri
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(paymentStats.giftRevenue, 'TRY')}
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-pink-500/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Active Escrows Tab */}
        <TabsContent value="escrows" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Escrow ID, kullanici ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tum Durumlar</SelectItem>
                <SelectItem value="awaiting_proof">Proof Bekleniyor</SelectItem>
                <SelectItem value="proof_submitted">Inceleniyor</SelectItem>
                <SelectItem value="ready_to_release">
                  Serbest Birakilabilir
                </SelectItem>
                <SelectItem value="disputed">Anlasmazlik</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Escrow Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Escrow ID</TableHead>
                  <TableHead>Gonderici</TableHead>
                  <TableHead>Alici</TableHead>
                  <TableHead>Moment</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Kalan Gun</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEscrows.map((escrow) => (
                  <TableRow
                    key={escrow.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell className="font-mono text-sm">
                      {escrow.id}
                    </TableCell>
                    <TableCell>{escrow.sender}</TableCell>
                    <TableCell>{escrow.receiver}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {escrow.moment}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(escrow.amount, escrow.currency)}
                    </TableCell>
                    <TableCell>{getStatusBadge(escrow.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            escrow.daysRemaining <= 2
                              ? 'bg-red-500'
                              : escrow.daysRemaining <= 4
                                ? 'bg-amber-500'
                                : 'bg-emerald-500',
                          )}
                        />
                        <span
                          className={cn(
                            escrow.daysRemaining <= 2 &&
                              'text-red-600 font-medium',
                          )}
                        >
                          {escrow.daysRemaining} gun
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <CanvaButton variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </CanvaButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setSelectedEscrow(escrow)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Detay Gor
                          </DropdownMenuItem>
                          {escrow.status === 'ready_to_release' && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleEscrowAction('release', escrow)
                              }
                            >
                              <Unlock className="h-4 w-4 mr-2" />
                              Serbest Birak
                            </DropdownMenuItem>
                          )}
                          {escrow.status !== 'released' &&
                            escrow.status !== 'refunded' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleEscrowAction('refund', escrow)
                                }
                              >
                                <ArrowDownRight className="h-4 w-4 mr-2" />
                                Iade Et
                              </DropdownMenuItem>
                            )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleEscrowAction('dispute', escrow)
                            }
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Anlasmazlik Ac
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tum Islemler</CardTitle>
              <CardDescription>Odeme, payout ve iade islemleri</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Islem ID</TableHead>
                    <TableHead>Tur</TableHead>
                    <TableHead>Kullanici</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Yontem</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Zaman</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-sm">
                        {tx.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(tx.type)}
                          <span className="capitalize">{tx.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{tx.user}</TableCell>
                      <TableCell
                        className={cn(
                          'font-medium',
                          tx.type === 'refund'
                            ? 'text-amber-600'
                            : 'text-emerald-600',
                        )}
                      >
                        {tx.type === 'refund' ? '-' : '+'}
                        {formatCurrency(tx.amount, 'TRY')}
                      </TableCell>
                      <TableCell className="capitalize">
                        {tx.method.replace('_', ' ')}
                      </TableCell>
                      <TableCell>{getTransactionStatus(tx.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {tx.time}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bekleyen Odemeler</CardTitle>
                  <CardDescription>
                    KYC dogrulanmis kullanicilara odeme yapilacak
                  </CardDescription>
                </div>
                <CanvaButton size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Toplu Odeme Yap
                </CanvaButton>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Odeme ID</TableHead>
                    <TableHead>Kullanici</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Banka</TableHead>
                    <TableHead>IBAN</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Talep Tarihi</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-mono text-sm">
                        {payout.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payout.user}
                      </TableCell>
                      <TableCell className="font-medium text-emerald-600">
                        {formatCurrency(payout.amount, 'TRY')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {payout.bank}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payout.iban}
                      </TableCell>
                      <TableCell>
                        {payout.kycStatus === 'verified' ? (
                          <CanvaBadge className="bg-emerald-500/10 text-emerald-600">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Dogrulandi
                          </CanvaBadge>
                        ) : (
                          <CanvaBadge className="bg-amber-500/10 text-amber-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Bekliyor
                          </CanvaBadge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {payout.requestedAt}
                      </TableCell>
                      <TableCell>
                        <CanvaButton
                          size="sm"
                          variant={
                            payout.kycStatus === 'verified'
                              ? 'primary'
                              : 'secondary'
                          }
                          disabled={payout.kycStatus !== 'verified'}
                        >
                          {payout.kycStatus === 'verified'
                            ? 'Odeme Yap'
                            : 'KYC Bekliyor'}
                        </CanvaButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'release' && 'Escrow Serbest Birak'}
              {actionDialog.action === 'refund' && 'Escrow Iade Et'}
              {actionDialog.action === 'dispute' && 'Anlasmazlik Ac'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === 'release' &&
                `${formatCurrency(actionDialog.escrow?.amount || 0, 'TRY')} tutarindaki escrow'u ${actionDialog.escrow?.receiver} adli kullaniciya serbest birakmak istediginize emin misiniz?`}
              {actionDialog.action === 'refund' &&
                `${formatCurrency(actionDialog.escrow?.amount || 0, 'TRY')} tutarindaki escrow'u ${actionDialog.escrow?.sender} adli kullaniciya iade etmek istediginize emin misiniz?`}
              {actionDialog.action === 'dispute' &&
                'Bu escrow icin anlasmazlik sureci baslatilacaktir.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <CanvaButton
              variant="primary"
              onClick={() =>
                setActionDialog({ open: false, action: '', escrow: null })
              }
            >
              Iptal
            </CanvaButton>
            <CanvaButton
              variant={actionDialog.action === 'dispute' ? 'danger' : 'primary'}
              onClick={() => {
                // Handle action
                setActionDialog({ open: false, action: '', escrow: null });
              }}
            >
              {actionDialog.action === 'release' && 'Serbest Birak'}
              {actionDialog.action === 'refund' && 'Iade Et'}
              {actionDialog.action === 'dispute' && 'Anlasmazlik Ac'}
            </CanvaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

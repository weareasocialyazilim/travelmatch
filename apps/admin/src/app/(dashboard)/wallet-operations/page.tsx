'use client';

/**
 * TravelMatch Wallet & Payout Operations
 * Kullanici cuzdanlari, para cekme talepleri ve KYC yonetimi
 *
 * Tum finansal operasyonlar tek merkezden yonetilir
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
  Filter,
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
  PiggyBank,
  Receipt,
  AlertCircle,
  CheckCheck,
  Timer,
  Phone,
  Mail,
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
// Card components replaced with Canva versions
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { formatCurrency, cn } from '@/lib/utils';
import { AdminAreaChart, CHART_COLORS } from '@/components/common/admin-chart';

// Wallet Stats - Para PayTR havuzunda tutulmaktadır
const walletStats = {
  paytrPoolBalance: 2456780, // PayTR'da tutulan toplam bakiye
  pendingPayouts: 456780,
  processedToday: 89450,
  avgPayoutTime: 2.4, // saat
  kycPending: 156,
  kycApproved: 4521,
  kycRejected: 89,
  payoutSuccessRate: 99.2,
};

// Payout Requests - IBAN'lar maskelenmiş formatta (güvenlik için)
const payoutRequests = [
  {
    id: 'PAY-2024-001',
    user: {
      name: 'Ayse M.',
      email: 'ayse@email.com',
      avatar: null,
      phone: '+90 532 XXX XX XX',
    },
    amount: 4560,
    paytrBalance: 5200, // PayTR'daki bakiye
    bank: 'Garanti BBVA',
    ibanMasked: 'TR** **** **** **** **** **34 56', // Maskelenmiş IBAN
    kycStatus: 'verified',
    requestedAt: '2024-01-10 09:15',
    status: 'pending',
    priority: 'normal',
  },
  {
    id: 'PAY-2024-002',
    user: {
      name: 'Mehmet S.',
      email: 'mehmet@email.com',
      avatar: null,
      phone: '+90 533 XXX XX XX',
    },
    amount: 12340,
    paytrBalance: 15600,
    bank: 'Isbank',
    ibanMasked: 'TR** **** **** **** **** **78 90',
    kycStatus: 'verified',
    requestedAt: '2024-01-10 08:45',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'PAY-2024-003',
    user: {
      name: 'Zeynep A.',
      email: 'zeynep@email.com',
      avatar: null,
      phone: '+90 535 XXX XX XX',
    },
    amount: 8900,
    paytrBalance: 9200,
    bank: 'Akbank',
    ibanMasked: 'TR** **** **** **** **** **12 34',
    kycStatus: 'pending',
    requestedAt: '2024-01-10 08:00',
    status: 'blocked',
    priority: 'normal',
    blockReason: 'KYC dogrulama bekliyor',
  },
  {
    id: 'PAY-2024-004',
    user: {
      name: 'Can B.',
      email: 'can@email.com',
      avatar: null,
      phone: '+90 536 XXX XX XX',
    },
    amount: 3200,
    paytrBalance: 4500,
    bank: 'Yapi Kredi',
    ibanMasked: 'TR** **** **** **** **** **56 78',
    kycStatus: 'verified',
    requestedAt: '2024-01-10 07:30',
    status: 'processing',
    priority: 'normal',
  },
  {
    id: 'PAY-2024-005',
    user: {
      name: 'Deniz K.',
      email: 'deniz@email.com',
      avatar: null,
      phone: '+90 537 XXX XX XX',
    },
    amount: 25600,
    paytrBalance: 28900,
    bank: 'Ziraat Bankasi',
    ibanMasked: 'TR** **** **** **** **** **90 12',
    kycStatus: 'verified',
    requestedAt: '2024-01-09 16:45',
    status: 'pending',
    priority: 'urgent',
  },
];

// KYC Verification Queue
const kycQueue = [
  {
    id: 'KYC-001',
    user: { name: 'Ali R.', email: 'ali@email.com', avatar: null },
    documentType: 'tc_kimlik',
    submittedAt: '2024-01-10 10:30',
    status: 'pending',
    pendingAmount: 8900,
    aiScore: 92,
  },
  {
    id: 'KYC-002',
    user: { name: 'Selin G.', email: 'selin@email.com', avatar: null },
    documentType: 'pasaport',
    submittedAt: '2024-01-10 09:45',
    status: 'pending',
    pendingAmount: 5600,
    aiScore: 78,
  },
  {
    id: 'KYC-003',
    user: { name: 'Burak Y.', email: 'burak@email.com', avatar: null },
    documentType: 'ehliyet',
    submittedAt: '2024-01-10 09:00',
    status: 'under_review',
    pendingAmount: 12300,
    aiScore: 45,
    flags: ['low_quality', 'possible_manipulation'],
  },
];

// Top Wallet Balances
const topWallets = [
  {
    user: 'Ayse M.',
    balance: 45600,
    pendingPayout: 4560,
    totalEarned: 125000,
    rating: 4.9,
  },
  {
    user: 'Mehmet K.',
    balance: 38900,
    pendingPayout: 0,
    totalEarned: 98000,
    rating: 4.8,
  },
  {
    user: 'Zeynep A.',
    balance: 32100,
    pendingPayout: 8900,
    totalEarned: 87000,
    rating: 4.9,
  },
  {
    user: 'Can B.',
    balance: 28900,
    pendingPayout: 3200,
    totalEarned: 76000,
    rating: 4.7,
  },
  {
    user: 'Deniz K.',
    balance: 25600,
    pendingPayout: 25600,
    totalEarned: 65000,
    rating: 4.8,
  },
];

// Daily Payout Volume
const dailyPayoutData = [
  { date: 'Pzt', amount: 125000, count: 45 },
  { date: 'Sal', amount: 145000, count: 52 },
  { date: 'Car', amount: 112000, count: 38 },
  { date: 'Per', amount: 168000, count: 58 },
  { date: 'Cum', amount: 189000, count: 67 },
  { date: 'Cmt', amount: 156000, count: 54 },
  { date: 'Paz', amount: 89450, count: 32 },
];

export default function WalletOperationsPage() {
  const [selectedTab, setSelectedTab] = useState('payouts');
  const [selectedPayout, setSelectedPayout] = useState<
    (typeof payoutRequests)[0] | null
  >(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: string;
    item: (typeof payoutRequests)[0] | null;
  }>({
    open: false,
    action: '',
    item: null,
  });
  const [rejectReason, setRejectReason] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <CanvaBadge variant="warning" icon={<Timer className="h-3 w-3" />}>
            Bekliyor
          </CanvaBadge>
        );
      case 'processing':
        return (
          <CanvaBadge variant="info" icon={<RefreshCw className="h-3 w-3 animate-spin" />}>
            Isleniyor
          </CanvaBadge>
        );
      case 'completed':
        return (
          <CanvaBadge variant="success" icon={<CheckCircle2 className="h-3 w-3" />}>
            Tamamlandi
          </CanvaBadge>
        );
      case 'blocked':
        return (
          <CanvaBadge variant="danger" icon={<Ban className="h-3 w-3" />}>
            Engellendi
          </CanvaBadge>
        );
      case 'rejected':
        return (
          <CanvaBadge variant="danger" icon={<XCircle className="h-3 w-3" />}>
            Reddedildi
          </CanvaBadge>
        );
      default:
        return <CanvaBadge variant="secondary">{status}</CanvaBadge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <CanvaBadge variant="danger">Acil</CanvaBadge>;
      case 'high':
        return <CanvaBadge variant="warning">Yuksek</CanvaBadge>;
      default:
        return null;
    }
  };

  const getKycBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <CanvaBadge variant="success" icon={<UserCheck className="h-3 w-3" />}>
            Dogrulandi
          </CanvaBadge>
        );
      case 'pending':
        return (
          <CanvaBadge variant="warning" icon={<Clock className="h-3 w-3" />}>
            Bekliyor
          </CanvaBadge>
        );
      case 'rejected':
        return (
          <CanvaBadge variant="danger" icon={<XCircle className="h-3 w-3" />}>
            Reddedildi
          </CanvaBadge>
        );
      default:
        return <CanvaBadge variant="secondary">{status}</CanvaBadge>;
    }
  };

  const handlePayoutAction = (
    action: string,
    payout: (typeof payoutRequests)[0],
  ) => {
    setActionDialog({ open: true, action, item: payout });
  };

  return (
    <div className="admin-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-500" />
            Wallet & Payout Operations
          </h1>
          <p className="text-muted-foreground">
            Kullanici cuzdanlari, para cekme talepleri ve KYC yonetimi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CanvaButton variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapor
          </CanvaButton>
          <CanvaButton variant="primary" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </CanvaButton>
        </div>
      </div>

      {/* PayTR Info Banner */}
      <CanvaCard className="border-blue-500/30 bg-blue-500/5">
        <CanvaCardBody className="py-3">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Shield className="h-4 w-4" />
            <span className="font-medium">
              Tum odemeler PayTR uzerinden gerceklestirilmektedir. Banka hesap bilgileri sistemimizde saklanmaz.
            </span>
          </div>
        </CanvaCardBody>
      </CanvaCard>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
        <CanvaStatCard
          className="col-span-2"
          title="PayTR Havuz Bakiyesi"
          value={formatCurrency(walletStats.paytrPoolBalance, 'TRY')}
          description="PayTR'da tutulan toplam bakiye"
          icon={<PiggyBank className="h-5 w-5" />}
          trend="up"
          accentColor="emerald"
        />

        <CanvaStatCard
          className="col-span-2"
          title="Bekleyen Odemeler"
          value={formatCurrency(walletStats.pendingPayouts, 'TRY')}
          description={`${payoutRequests.filter((p) => p.status === 'pending').length} talep bekliyor`}
          icon={<Send className="h-5 w-5" />}
          accentColor="amber"
        />

        <CanvaStatCard
          title="Bugun Islenen"
          value={formatCurrency(walletStats.processedToday, 'TRY')}
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend="up"
        />

        <CanvaStatCard
          title="Ort. Sure"
          value={`${walletStats.avgPayoutTime} saat`}
          icon={<Clock className="h-5 w-5" />}
        />

        <CanvaStatCard
          title="KYC Bekleyen"
          value={walletStats.kycPending.toString()}
          icon={<Shield className="h-5 w-5" />}
          accentColor="amber"
        />

        <CanvaStatCard
          title="Basari Orani"
          value={`%${walletStats.payoutSuccessRate}`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend="up"
          accentColor="emerald"
        />
      </div>

      {/* Urgent Payouts Alert */}
      {payoutRequests.filter((p) => p.priority === 'urgent').length > 0 && (
        <CanvaCard className="border-red-500/30 bg-red-500/5">
          <CanvaCardHeader>
            <CanvaCardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Acil Odeme Talepleri (
              {payoutRequests.filter((p) => p.priority === 'urgent').length})
            </CanvaCardTitle>
          </CanvaCardHeader>
          <CanvaCardBody>
            <div className="space-y-2">
              {payoutRequests
                .filter((p) => p.priority === 'urgent')
                .map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {payout.user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{payout.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(payout.amount, 'TRY')}
                        </p>
                      </div>
                    </div>
                    <CanvaButton
                      size="sm"
                      variant="primary"
                      onClick={() => handlePayoutAction('approve', payout)}
                    >
                      Hemen Onayla
                    </CanvaButton>
                  </div>
                ))}
            </div>
          </CanvaCardBody>
        </CanvaCard>
      )}

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="payouts">Odeme Talepleri</TabsTrigger>
          <TabsTrigger value="kyc">KYC Dogrulama</TabsTrigger>
          <TabsTrigger value="wallets">Cuzdanlar</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
        </TabsList>

        {/* Payout Requests Tab */}
        <TabsContent value="payouts" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kullanici veya IBAN ara..."
                className="pl-9"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tum Durumlar</SelectItem>
                <SelectItem value="pending">Bekleyen</SelectItem>
                <SelectItem value="processing">Isleniyor</SelectItem>
                <SelectItem value="blocked">Engellenen</SelectItem>
              </SelectContent>
            </Select>
            <CanvaButton variant="ghost" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Toplu Odeme
            </CanvaButton>
          </div>

          {/* Payout Table */}
          <CanvaCard>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanici</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Banka / IBAN</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Talep Tarihi</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutRequests.map((payout) => (
                  <TableRow
                    key={payout.id}
                    className={cn(
                      payout.priority === 'urgent' && 'bg-red-500/5',
                      payout.priority === 'high' && 'bg-amber-500/5',
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {payout.user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{payout.user.name}</p>
                            {getPriorityBadge(payout.priority)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {payout.user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-emerald-600">
                        {formatCurrency(payout.amount, 'TRY')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Bakiye: {formatCurrency(payout.paytrBalance, 'TRY')}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{payout.bank}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {payout.ibanMasked.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getKycBadge(payout.kycStatus)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {payout.requestedAt}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(payout.status)}
                        {payout.blockReason && (
                          <p className="text-xs text-red-600">
                            {payout.blockReason}
                          </p>
                        )}
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
                            onClick={() => setSelectedPayout(payout)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Detay
                          </DropdownMenuItem>
                          {payout.status === 'pending' &&
                            payout.kycStatus === 'verified' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handlePayoutAction('approve', payout)
                                }
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Onayla
                              </DropdownMenuItem>
                            )}
                          {payout.status === 'pending' && (
                            <DropdownMenuItem
                              onClick={() =>
                                handlePayoutAction('reject', payout)
                              }
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reddet
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Phone className="h-4 w-4 mr-2" />
                            Kullaniciyi Ara
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Email Gonder
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CanvaCard>
        </TabsContent>

        {/* KYC Tab */}
        <TabsContent value="kyc" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <CanvaStatCard
              title="Bekleyen"
              value={walletStats.kycPending.toString()}
              icon={<Clock className="h-5 w-5" />}
              accentColor="amber"
              className="bg-amber-500/5 border-amber-500/30"
            />
            <CanvaStatCard
              title="Onaylanan"
              value={walletStats.kycApproved.toString()}
              icon={<CheckCircle2 className="h-5 w-5" />}
              accentColor="emerald"
              className="bg-emerald-500/5 border-emerald-500/30"
            />
            <CanvaStatCard
              title="Reddedilen"
              value={walletStats.kycRejected.toString()}
              icon={<XCircle className="h-5 w-5" />}
              accentColor="red"
              className="bg-red-500/5 border-red-500/30"
            />
          </div>

          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>KYC Dogrulama Kuyrugu</CanvaCardTitle>
              <CanvaCardSubtitle>
                Para cekme icin kimlik dogrulama bekleyenler
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="space-y-4">
                {kycQueue.map((kyc) => (
                  <div
                    key={kyc.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      kyc.aiScore < 60 && 'border-red-500/30 bg-red-500/5',
                      kyc.aiScore >= 60 &&
                        kyc.aiScore < 80 &&
                        'border-amber-500/30 bg-amber-500/5',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {kyc.user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{kyc.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {kyc.user.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <CanvaBadge variant="secondary" className="text-xs capitalize">
                              {kyc.documentType.replace('_', ' ')}
                            </CanvaBadge>
                            <span className="text-xs text-muted-foreground">
                              {kyc.submittedAt}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-muted-foreground">
                            AI Skoru:
                          </span>
                          <span
                            className={cn(
                              'font-bold',
                              kyc.aiScore >= 80
                                ? 'text-emerald-600'
                                : kyc.aiScore >= 60
                                  ? 'text-amber-600'
                                  : 'text-red-600',
                            )}
                          >
                            %{kyc.aiScore}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Bekleyen odeme:{' '}
                          <span className="font-medium text-amber-600">
                            {formatCurrency(kyc.pendingAmount, 'TRY')}
                          </span>
                        </p>
                        {kyc.flags && kyc.flags.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-end mb-2">
                            {kyc.flags.map((flag) => (
                              <CanvaBadge
                                key={flag}
                                variant="danger"
                                className="text-xs"
                              >
                                {flag.replace('_', ' ')}
                              </CanvaBadge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <CanvaButton size="sm" variant="ghost">
                            <Eye className="h-3 w-3 mr-1" />
                            Incele
                          </CanvaButton>
                          <CanvaButton size="sm" variant="success">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Onayla
                          </CanvaButton>
                          <CanvaButton size="sm" variant="danger">
                            <XCircle className="h-3 w-3 mr-1" />
                            Reddet
                          </CanvaButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Wallets Tab */}
        <TabsContent value="wallets" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-500" />
                En Yuksek Bakiyeli Cuzdanlar
              </CanvaCardTitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanici</TableHead>
                    <TableHead>Bakiye</TableHead>
                    <TableHead>Bekleyen Odeme</TableHead>
                    <TableHead>Toplam Kazanc</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topWallets.map((wallet, index) => (
                    <TableRow key={wallet.user}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm',
                              index === 0 && 'bg-amber-500',
                              index === 1 && 'bg-gray-400',
                              index === 2 && 'bg-orange-400',
                              index > 2 && 'bg-blue-500/50',
                            )}
                          >
                            {index + 1}
                          </div>
                          <span className="font-medium">{wallet.user}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-emerald-600">
                        {formatCurrency(wallet.balance, 'TRY')}
                      </TableCell>
                      <TableCell className="text-amber-600">
                        {formatCurrency(wallet.pendingPayout, 'TRY')}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(wallet.totalEarned, 'TRY')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-amber-500">★</span>
                          <span>{wallet.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <CanvaButton variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </CanvaButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Haftalik Odeme Hacmi</CanvaCardTitle>
              <CanvaCardSubtitle>Gunluk islem tutari ve adedi</CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <AdminAreaChart
                data={dailyPayoutData}
                xAxisKey="date"
                height={300}
                areas={[
                  {
                    dataKey: 'amount',
                    name: 'Tutar',
                    color: CHART_COLORS.trust,
                  },
                ]}
                formatter={(value, name) => [
                  formatCurrency(value as number, 'TRY'),
                  name,
                ]}
              />
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'approve' && 'Odeme Onayla'}
              {actionDialog.action === 'reject' && 'Odeme Reddet'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.item && (
                <>
                  {actionDialog.item.user.name} -{' '}
                  {formatCurrency(actionDialog.item.amount, 'TRY')}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {actionDialog.action === 'reject' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Red Sebebi</label>
              <Textarea
                placeholder="Red sebebini yazin..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <CanvaButton
              variant="ghost"
              onClick={() =>
                setActionDialog({ open: false, action: '', item: null })
              }
            >
              Iptal
            </CanvaButton>
            <CanvaButton
              variant={actionDialog.action === 'reject' ? 'danger' : 'success'}
              onClick={() =>
                setActionDialog({ open: false, action: '', item: null })
              }
            >
              {actionDialog.action === 'approve' && 'Onayla ve Gonder'}
              {actionDialog.action === 'reject' && 'Reddet'}
            </CanvaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

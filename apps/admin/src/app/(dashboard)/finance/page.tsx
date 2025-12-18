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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatRelativeDate, getInitials } from '@/lib/utils';

// Mock data
const mockTransactions = [
  {
    id: 't1',
    type: 'payment',
    amount: 1500,
    currency: 'TRY',
    status: 'completed',
    user: { id: 'u1', full_name: 'Ali Veli', avatar_url: null },
    description: 'Seyahat ödemesi',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 't2',
    type: 'payout',
    amount: 850,
    currency: 'TRY',
    status: 'pending',
    user: { id: 'u2', full_name: 'Ayşe Yılmaz', avatar_url: null },
    description: 'Kazanç çekimi',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 't3',
    type: 'refund',
    amount: 300,
    currency: 'TRY',
    status: 'completed',
    user: { id: 'u3', full_name: 'Mehmet Demir', avatar_url: null },
    description: 'İptal iadesi',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 't4',
    type: 'payment',
    amount: 2200,
    currency: 'TRY',
    status: 'failed',
    user: { id: 'u4', full_name: 'Zeynep Kara', avatar_url: null },
    description: 'Seyahat ödemesi',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
];

const mockPayouts = [
  {
    id: 'p1',
    amount: 2500,
    currency: 'TRY',
    status: 'pending',
    user: { id: 'u1', full_name: 'Ali Veli', avatar_url: null },
    bank_account: 'TR** **** **** **** **** 1234',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'p2',
    amount: 1800,
    currency: 'TRY',
    status: 'pending',
    user: { id: 'u2', full_name: 'Ayşe Yılmaz', avatar_url: null },
    bank_account: 'TR** **** **** **** **** 5678',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'p3',
    amount: 950,
    currency: 'TRY',
    status: 'approved',
    user: { id: 'u3', full_name: 'Mehmet Demir', avatar_url: null },
    bank_account: 'TR** **** **** **** **** 9012',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
];

const transactionTypeConfig = {
  payment: { label: 'Ödeme', icon: ArrowUpRight, color: 'text-green-600' },
  payout: { label: 'Çekim', icon: ArrowDownRight, color: 'text-blue-600' },
  refund: { label: 'İade', icon: ArrowDownRight, color: 'text-orange-600' },
  fee: { label: 'Komisyon', icon: DollarSign, color: 'text-purple-600' },
};

const statusConfig = {
  pending: { label: 'Bekliyor', variant: 'warning' as const },
  completed: { label: 'Tamamlandı', variant: 'success' as const },
  approved: { label: 'Onaylandı', variant: 'success' as const },
  processing: { label: 'İşleniyor', variant: 'info' as const },
  failed: { label: 'Başarısız', variant: 'error' as const },
  cancelled: { label: 'İptal', variant: 'secondary' as const },
};

export default function FinancePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const pendingPayoutsCount = mockPayouts.filter((p) => p.status === 'pending').length;
  const pendingPayoutsTotal = mockPayouts
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

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
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Rapor İndir
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(12450)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> dünden
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aylık Gelir</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(324500)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> geçen aydan
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen Ödemeler</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingPayoutsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Toplam {formatCurrency(pendingPayoutsTotal)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Bakiyesi</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(89750)}</div>
            <p className="text-xs text-muted-foreground">Kullanılabilir</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="payouts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payouts">
            Ödeme Onayları
            {pendingPayoutsCount > 0 && (
              <Badge variant="warning" className="ml-2">
                {pendingPayoutsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="transactions">İşlem Geçmişi</TabsTrigger>
        </TabsList>

        {/* Payouts Tab */}
        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Bekleyen Ödemeler</CardTitle>
              <CardDescription>
                Kullanıcı çekim taleplerini inceleyin ve onaylayın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPayouts.map((payout) => {
                  const statusInfo = statusConfig[payout.status as keyof typeof statusConfig];

                  return (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={payout.user.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(payout.user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{payout.user.full_name}</span>
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{payout.bank_account}</span>
                            <span>•</span>
                            <span>{formatRelativeDate(payout.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatCurrency(payout.amount)}
                          </div>
                        </div>
                        {payout.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <XCircle className="mr-1 h-4 w-4" />
                              Reddet
                            </Button>
                            <Button size="sm">
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Onayla
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>İşlem Geçmişi</CardTitle>
                  <CardDescription>
                    Tüm finansal işlemleri görüntüleyin
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Kullanıcı veya işlem ara..."
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

              {/* Transaction List */}
              <div className="rounded-md border">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
                  <div>Kullanıcı</div>
                  <div>Tür</div>
                  <div>Tutar</div>
                  <div>Durum</div>
                  <div>Tarih</div>
                </div>
                {mockTransactions.map((tx) => {
                  const typeInfo = transactionTypeConfig[tx.type as keyof typeof transactionTypeConfig];
                  const statusInfo = statusConfig[tx.status as keyof typeof statusConfig];
                  const TypeIcon = typeInfo.icon;

                  return (
                    <div
                      key={tx.id}
                      className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b px-4 py-3 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={tx.user.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(tx.user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{tx.user.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {tx.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                        <span className={typeInfo.color}>{typeInfo.label}</span>
                      </div>
                      <div className="text-right font-medium">
                        {tx.type === 'payment' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </div>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      <div className="text-sm text-muted-foreground">
                        {formatRelativeDate(tx.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

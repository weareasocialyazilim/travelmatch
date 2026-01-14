'use client';

import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  Target,
  Download,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import { formatCurrency, cn } from '@/lib/utils';
import { useRevenue } from '@/hooks/use-revenue';
import { CanvaButton } from '@/components/canva/CanvaButton';
import { exportToCSV, generateExportFilename } from '@/lib/export';
import { useToast } from '@/components/ui/use-toast';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardBody,
  CanvaStatCard,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';

export default function RevenuePage() {
  const [dateRange, setDateRange] = useState('12m');
  const { data, isLoading, error, refetch, isFetching } = useRevenue();
  const { toast } = useToast();

  // Error state
  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Veri Yüklenemedi
            </h2>
            <p className="text-muted-foreground mt-1">
              Gelir verileri alınamadı.
            </p>
          </div>
          <CanvaButton variant="primary" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Tekrar Dene
          </CanvaButton>
        </div>
      </div>
    );
  }

  const overview = data?.overview;
  const monthlyRevenue = data?.monthlyRevenue || [];
  const revenueByProduct = data?.revenueByProduct || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gelir Analitiği
          </h1>
          <p className="text-muted-foreground mt-1">
            Gelir metrikleri, tahminler ve fiyatlandırma optimizasyonu
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Son 30 gün</SelectItem>
              <SelectItem value="90d">Son 90 gün</SelectItem>
              <SelectItem value="12m">Son 12 ay</SelectItem>
              <SelectItem value="all">Tüm zamanlar</SelectItem>
            </SelectContent>
          </Select>
          <CanvaButton
            variant="primary"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={cn('h-4 w-4', isFetching && 'animate-spin')}
            />
            Yenile
          </CanvaButton>
          <CanvaButton
            variant="primary"
            disabled={isLoading || !data}
            onClick={() => {
              try {
                const exportData = monthlyRevenue.map((item) => ({
                  Ay: item.month,
                  Gelir: item.revenue,
                }));

                // Add product revenue if available
                if (revenueByProduct.length > 0) {
                  revenueByProduct.forEach((product) => {
                    exportData.push({
                      Ay: `Ürün: ${product.name}`,
                      Gelir: product.value,
                    });
                  });
                }

                exportToCSV(
                  exportData,
                  [
                    { header: 'Ay / Ürün', accessor: 'Ay' },
                    { header: 'Gelir (TRY)', accessor: 'Gelir' },
                  ],
                  generateExportFilename('gelir-raporu'),
                );

                toast({
                  title: 'Rapor indirildi',
                  description: 'Gelir raporu başarıyla indirildi.',
                });
              } catch (error) {
                toast({
                  title: 'Hata',
                  description: 'Rapor indirilemedi.',
                  variant: 'destructive',
                });
              }
            }}
          >
            <Download className="h-4 w-4" />
            Rapor İndir
          </CanvaButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <CanvaStatCard
          label="Toplam Gelir"
          value={
            isLoading
              ? '...'
              : formatCurrency(overview?.totalRevenue || 0, 'TRY')
          }
          icon={<DollarSign className="h-5 w-5" />}
          change={
            overview?.growthRate
              ? { value: overview.growthRate, label: 'büyüme' }
              : undefined
          }
        />
        <CanvaStatCard
          label="MRR"
          value={isLoading ? '...' : formatCurrency(overview?.mrr || 0, 'TRY')}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <CanvaStatCard
          label="ARR"
          value={isLoading ? '...' : formatCurrency(overview?.arr || 0, 'TRY')}
          icon={<Target className="h-5 w-5" />}
        />
        <CanvaStatCard
          label="Aktif Abonelik"
          value={
            isLoading
              ? '...'
              : (overview?.activeSubscriptions || 0).toLocaleString('tr-TR')
          }
          icon={<Users className="h-5 w-5" />}
        />
        <CanvaStatCard
          label="Ort. Abonelik"
          value={
            isLoading
              ? '...'
              : formatCurrency(overview?.avgSubscriptionValue || 0, 'TRY')
          }
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <CanvaCard>
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Büyüme
              </span>
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  (overview?.growthRate || 0) >= 0
                    ? 'bg-emerald-50'
                    : 'bg-red-50',
                )}
              >
                {(overview?.growthRate || 0) >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
            <div
              className={cn(
                'text-3xl font-bold mt-2',
                (overview?.growthRate || 0) >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400',
              )}
            >
              {isLoading
                ? '...'
                : `${(overview?.growthRate || 0) >= 0 ? '+' : ''}${overview?.growthRate || 0}%`}
            </div>
          </div>
        </CanvaCard>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="products">Ürün Bazlı</TabsTrigger>
          <TabsTrigger value="payments">Son Ödemeler</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Gelir Trendi</CanvaCardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Aylık gelir performansı
              </p>
            </CanvaCardHeader>
            <CanvaCardBody>
              {isLoading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500 dark:text-violet-400" />
                </div>
              ) : monthlyRevenue.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                      <YAxis
                        tickFormatter={(value) =>
                          `₺${(value / 1000).toFixed(0)}K`
                        }
                        stroke="#94a3b8"
                        fontSize={12}
                      />
                      <Tooltip
                        formatter={(value: number | undefined) => [
                          formatCurrency(value ?? 0, 'TRY'),
                          'Gelir',
                        ]}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        fill="url(#colorRevenue)"
                        name="Gelir"
                      />
                      <defs>
                        <linearGradient
                          id="colorRevenue"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8b5cf6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8b5cf6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                  <DollarSign className="h-12 w-12 mb-3" />
                  <p>Henüz gelir verisi yok</p>
                </div>
              )}
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Ürün Dağılımı</CanvaCardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Gelir kaynaklarının dağılımı
                </p>
              </CanvaCardHeader>
              <CanvaCardBody>
                {isLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500 dark:text-violet-400" />
                  </div>
                ) : revenueByProduct.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={
                            revenueByProduct as unknown as Record<
                              string,
                              unknown
                            >[]
                          }
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {revenueByProduct.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number | undefined) => [
                            formatCurrency(value ?? 0, 'TRY'),
                            '',
                          ]}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                    <DollarSign className="h-12 w-12 mb-3" />
                    <p>Henüz ürün verisi yok</p>
                  </div>
                )}
              </CanvaCardBody>
            </CanvaCard>

            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Ürün Performansı</CanvaCardTitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                {isLoading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500 dark:text-violet-400" />
                  </div>
                ) : revenueByProduct.length > 0 ? (
                  <div className="space-y-4">
                    {revenueByProduct.map((product) => {
                      const total = revenueByProduct.reduce(
                        (sum, p) => sum + p.value,
                        0,
                      );
                      const percentage =
                        total > 0
                          ? Math.round((product.value / total) * 100)
                          : 0;
                      return (
                        <div key={product.name} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: product.color }}
                              />
                              <span className="font-medium text-foreground">
                                {product.name}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {formatCurrency(product.value, 'TRY')}
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground text-right">
                            {percentage}% pay
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                    <DollarSign className="h-12 w-12 mb-3" />
                    <p>Henüz ürün verisi yok</p>
                  </div>
                )}
              </CanvaCardBody>
            </CanvaCard>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Son Ödemeler</CanvaCardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                En son tamamlanan ödemeler
              </p>
            </CanvaCardHeader>
            <CanvaCardBody className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500 dark:text-violet-400" />
                </div>
              ) : (data?.recentPayments?.length || 0) > 0 ? (
                <div className="divide-y divide-border">
                  {data?.recentPayments.slice(0, 10).map((payment) => (
                    <div
                      key={payment.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {payment.type === 'subscription'
                              ? 'Abonelik'
                              : payment.type === 'gift'
                                ? 'Hediye'
                                : 'Ödeme'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(payment.created_at).toLocaleString(
                              'tr-TR',
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">
                          {formatCurrency(
                            payment.amount,
                            payment.currency || 'TRY',
                          )}
                        </p>
                        <CanvaBadge variant="success" size="sm">
                          {payment.status}
                        </CanvaBadge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mb-3" />
                  <p>Henüz ödeme yok</p>
                </div>
              )}
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

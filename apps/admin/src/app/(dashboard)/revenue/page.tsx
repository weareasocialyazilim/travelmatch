'use client';

import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  Target,
  Calendar,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

// Mock data
const revenueOverview = {
  totalRevenue: 4850000,
  monthlyRecurring: 380000,
  avgRevenuePerUser: 38.8,
  lifetimeValue: 156,
  growthRate: 12.5,
  churnRate: 3.2,
};

const revenueByMonth = [
  { month: 'Oca', revenue: 320000, target: 300000, subscriptions: 8500 },
  { month: 'Şub', revenue: 340000, target: 320000, subscriptions: 9200 },
  { month: 'Mar', revenue: 380000, target: 350000, subscriptions: 10100 },
  { month: 'Nis', revenue: 360000, target: 380000, subscriptions: 9800 },
  { month: 'May', revenue: 420000, target: 400000, subscriptions: 11200 },
  { month: 'Haz', revenue: 450000, target: 420000, subscriptions: 12000 },
  { month: 'Tem', revenue: 480000, target: 450000, subscriptions: 12800 },
  { month: 'Ağu', revenue: 520000, target: 480000, subscriptions: 13500 },
  { month: 'Eyl', revenue: 490000, target: 500000, subscriptions: 13100 },
  { month: 'Eki', revenue: 530000, target: 520000, subscriptions: 14200 },
  { month: 'Kas', revenue: 580000, target: 550000, subscriptions: 15400 },
  { month: 'Ara', revenue: 380000, target: 580000, subscriptions: 10200 },
];

const revenueByProduct = [
  { name: 'Premium Aylık', value: 45, revenue: 2180000, color: '#3b82f6' },
  { name: 'Premium Yıllık', value: 25, revenue: 1210000, color: '#22c55e' },
  { name: 'Boost', value: 15, revenue: 730000, color: '#f59e0b' },
  { name: 'Super Like', value: 10, revenue: 485000, color: '#8b5cf6' },
  { name: 'Diğer', value: 5, revenue: 245000, color: '#6b7280' },
];

const cohortData = [
  { month: 'Oca', m0: 100, m1: 75, m2: 62, m3: 55, m4: 50, m5: 46, m6: 42 },
  { month: 'Şub', m0: 100, m1: 72, m2: 58, m3: 51, m4: 46, m5: 42, m6: null },
  { month: 'Mar', m0: 100, m1: 78, m2: 65, m3: 58, m4: 52, m5: null, m6: null },
  { month: 'Nis', m0: 100, m1: 74, m2: 60, m3: 53, m4: null, m5: null, m6: null },
  { month: 'May', m0: 100, m1: 76, m2: 63, m3: null, m4: null, m5: null, m6: null },
  { month: 'Haz', m0: 100, m1: 80, m2: null, m3: null, m4: null, m5: null, m6: null },
  { month: 'Tem', m0: 100, m1: null, m2: null, m3: null, m4: null, m5: null, m6: null },
];

const forecastData = [
  { month: 'Ara 24', actual: 580000, forecast: null },
  { month: 'Oca 25', actual: null, forecast: 620000 },
  { month: 'Şub 25', actual: null, forecast: 650000 },
  { month: 'Mar 25', actual: null, forecast: 690000 },
  { month: 'Nis 25', actual: null, forecast: 720000 },
  { month: 'May 25', actual: null, forecast: 780000 },
];

const pricingTiers = [
  {
    name: 'Premium Aylık',
    currentPrice: 149.99,
    suggestedPrice: 169.99,
    conversionRate: 4.2,
    suggestedConversion: 3.8,
    revenueImpact: '+8.5%',
  },
  {
    name: 'Premium Yıllık',
    currentPrice: 899.99,
    suggestedPrice: 999.99,
    conversionRate: 2.1,
    suggestedConversion: 1.9,
    revenueImpact: '+6.2%',
  },
  {
    name: 'Boost (24h)',
    currentPrice: 29.99,
    suggestedPrice: 34.99,
    conversionRate: 8.5,
    suggestedConversion: 7.2,
    revenueImpact: '+12.3%',
  },
];

export default function RevenuePage() {
  const [dateRange, setDateRange] = useState('12m');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gelir Analitiği</h1>
          <p className="text-muted-foreground">
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Gelir</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(revenueOverview.totalRevenue, 'TRY')}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              +{revenueOverview.growthRate}% büyüme
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MRR</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(revenueOverview.monthlyRecurring, 'TRY')}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Aylık tekrarlayan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ARPU</p>
                <p className="text-2xl font-bold">₺{revenueOverview.avgRevenuePerUser}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Kullanıcı başına</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">LTV</p>
                <p className="text-2xl font-bold">₺{revenueOverview.lifetimeValue}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Yaşam boyu değer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Büyüme</p>
                <p className="text-2xl font-bold text-green-600">
                  +{revenueOverview.growthRate}%
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Aylık</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Churn</p>
                <p className="text-2xl font-bold text-red-600">{revenueOverview.churnRate}%</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Aylık kayıp</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="products">Ürün Bazlı</TabsTrigger>
          <TabsTrigger value="forecast">Tahmin</TabsTrigger>
          <TabsTrigger value="pricing">Fiyatlandırma</TabsTrigger>
          <TabsTrigger value="cohort">Kohort Analizi</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gelir Trendi</CardTitle>
              <CardDescription>Aylık gelir ve hedef karşılaştırması</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value, 'TRY'), '']}
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stackId="1"
                      stroke="#e5e7eb"
                      fill="#f3f4f6"
                      name="Hedef"
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="2"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                      name="Gelir"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ürün Dağılımı</CardTitle>
                <CardDescription>Gelir kaynaklarının dağılımı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueByProduct}
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
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ürün Performansı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueByProduct.map((product) => (
                    <div key={product.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: product.color }}
                          />
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(product.revenue, 'TRY')}
                        </span>
                      </div>
                      <Progress value={product.value} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">
                        {product.value}% pay
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gelir Tahmini</CardTitle>
              <CardDescription>6 aylık gelir projeksiyonu (ML bazlı)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value, 'TRY'), '']} />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6' }}
                      name="Gerçekleşen"
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#22c55e"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#22c55e' }}
                      name="Tahmin"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-8 rounded bg-blue-500" />
                  <span className="text-sm text-muted-foreground">Gerçekleşen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-8 rounded border-2 border-dashed border-green-500" />
                  <span className="text-sm text-muted-foreground">Tahmin</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fiyat Optimizasyonu</CardTitle>
              <CardDescription>
                AI destekli fiyat önerileri ve potansiyel etki analizi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricingTiers.map((tier) => (
                  <div key={tier.name} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">{tier.name}</h3>
                      <Badge
                        variant={tier.revenueImpact.startsWith('+') ? 'default' : 'destructive'}
                      >
                        {tier.revenueImpact} gelir etkisi
                      </Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Mevcut Fiyat</p>
                        <p className="text-xl font-semibold">{formatCurrency(tier.currentPrice, 'TRY')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Önerilen Fiyat</p>
                        <p className="text-xl font-semibold text-green-600">
                          {formatCurrency(tier.suggestedPrice, 'TRY')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mevcut Dönüşüm</p>
                        <p className="text-xl font-semibold">%{tier.conversionRate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tahmini Dönüşüm</p>
                        <p className="text-xl font-semibold text-orange-600">
                          %{tier.suggestedConversion}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button size="sm">Fiyatı Uygula</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cohort Tab */}
        <TabsContent value="cohort" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kohort Analizi</CardTitle>
              <CardDescription>Aylık premium tutundurma oranları (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                        Kohort
                      </th>
                      <th className="p-2 text-center text-sm font-medium text-muted-foreground">
                        M0
                      </th>
                      <th className="p-2 text-center text-sm font-medium text-muted-foreground">
                        M1
                      </th>
                      <th className="p-2 text-center text-sm font-medium text-muted-foreground">
                        M2
                      </th>
                      <th className="p-2 text-center text-sm font-medium text-muted-foreground">
                        M3
                      </th>
                      <th className="p-2 text-center text-sm font-medium text-muted-foreground">
                        M4
                      </th>
                      <th className="p-2 text-center text-sm font-medium text-muted-foreground">
                        M5
                      </th>
                      <th className="p-2 text-center text-sm font-medium text-muted-foreground">
                        M6
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((row) => (
                      <tr key={row.month}>
                        <td className="p-2 text-sm font-medium">{row.month}</td>
                        {['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6'].map((col) => {
                          const value = row[col as keyof typeof row] as number | null;
                          if (value === null) {
                            return (
                              <td key={col} className="p-1">
                                <div className="flex h-10 w-full items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                                  -
                                </div>
                              </td>
                            );
                          }
                          const intensity = value / 100;
                          return (
                            <td key={col} className="p-1">
                              <div
                                className="flex h-10 w-full items-center justify-center rounded text-xs font-medium"
                                style={{
                                  backgroundColor: `rgba(34, 197, 94, ${intensity})`,
                                  color: intensity > 0.5 ? 'white' : 'inherit',
                                }}
                              >
                                {value}%
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

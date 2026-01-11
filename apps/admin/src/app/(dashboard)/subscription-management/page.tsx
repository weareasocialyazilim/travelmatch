'use client';

/**
 * TravelMatch Subscription & Revenue Management
 * Abonelik planlari, promo kodlari ve gelir yonetimi
 *
 * Free, Premium, Platinum tier yonetimi
 */

import { useState } from 'react';
import {
  Crown,
  Star,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Plus,
  Percent,
  Gift,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Award,
  Target,
  Sparkles,
  Copy,
  Trash2,
  ToggleLeft,
  ToggleRight,
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
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  AdminAreaChart,
  AdminBarChart,
  AdminLineChart,
  CHART_COLORS,
} from '@/components/common/admin-chart';

// Subscription Stats
const subscriptionStats = {
  totalSubscribers: 4521,
  premiumUsers: 3245,
  platinumUsers: 1276,
  freeUsers: 44231,
  mrr: 456780, // Monthly Recurring Revenue
  arr: 5481360, // Annual Recurring Revenue
  churnRate: 3.2,
  ltv: 2450, // Lifetime Value
  conversionRate: 9.27,
  upgrades: 234,
  downgrades: 45,
  cancellations: 89,
};

// Subscription Plans
const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'TRY',
    period: 'forever',
    users: 44231,
    features: ['Temel kesif', 'Aylik 3 mesaj', 'Standart destek'],
    color: 'bg-gray-500',
    active: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 149,
    currency: 'TRY',
    period: 'month',
    users: 3245,
    revenue: 483505,
    features: [
      'Sinirsiz kesif',
      'Sinirsiz mesaj',
      'Oncelikli destek',
      'Ozel rozetler',
      'Gelismis filtreler',
    ],
    color: 'bg-purple-500',
    active: true,
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: 299,
    currency: 'TRY',
    period: 'month',
    users: 1276,
    revenue: 381524,
    features: [
      'Premium ozellikleri',
      'VIP destek',
      'Ozel etkinlikler',
      'Counter offer',
      'Concierge hizmeti',
    ],
    color: 'bg-amber-500',
    active: true,
  },
];

// Promo Codes
const promoCodes = [
  {
    id: 'PROMO-001',
    code: 'WELCOME50',
    type: 'percentage',
    value: 50,
    minOrder: 0,
    usageLimit: 1000,
    usedCount: 456,
    perUserLimit: 1,
    validFrom: '2024-01-01',
    validUntil: '2024-01-31',
    isActive: true,
    targetPlan: 'premium',
  },
  {
    id: 'PROMO-002',
    code: 'PLATINUM30',
    type: 'percentage',
    value: 30,
    minOrder: 0,
    usageLimit: 500,
    usedCount: 123,
    perUserLimit: 1,
    validFrom: '2024-01-01',
    validUntil: '2024-02-28',
    isActive: true,
    targetPlan: 'platinum',
  },
  {
    id: 'PROMO-003',
    code: 'NEWYEAR2024',
    type: 'fixed',
    value: 100,
    minOrder: 149,
    usageLimit: 2000,
    usedCount: 1890,
    perUserLimit: 1,
    validFrom: '2024-01-01',
    validUntil: '2024-01-15',
    isActive: false,
    targetPlan: 'all',
  },
  {
    id: 'PROMO-004',
    code: 'INFLUENCER20',
    type: 'percentage',
    value: 20,
    minOrder: 0,
    usageLimit: 0, // unlimited
    usedCount: 234,
    perUserLimit: 0, // unlimited
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    isActive: true,
    targetPlan: 'all',
  },
];

// Recent Subscriptions
const recentSubscriptions = [
  {
    user: 'Ahmet K.',
    plan: 'premium',
    action: 'upgrade',
    from: 'free',
    amount: 149,
    date: '2024-01-10 14:30',
  },
  {
    user: 'Ayse M.',
    plan: 'platinum',
    action: 'upgrade',
    from: 'premium',
    amount: 150,
    date: '2024-01-10 13:45',
  },
  {
    user: 'Mehmet S.',
    plan: 'premium',
    action: 'new',
    from: null,
    amount: 149,
    date: '2024-01-10 12:15',
  },
  {
    user: 'Zeynep A.',
    plan: 'free',
    action: 'downgrade',
    from: 'premium',
    amount: -149,
    date: '2024-01-10 11:30',
  },
  {
    user: 'Can B.',
    plan: 'premium',
    action: 'renewal',
    from: 'premium',
    amount: 149,
    date: '2024-01-10 10:00',
  },
  {
    user: 'Deniz K.',
    plan: null,
    action: 'cancel',
    from: 'platinum',
    amount: 0,
    date: '2024-01-10 09:15',
  },
];

// Revenue by Plan (Weekly)
const revenueByPlanData = [
  { date: 'Pzt', premium: 45000, platinum: 32000 },
  { date: 'Sal', premium: 52000, platinum: 38000 },
  { date: 'Car', premium: 48000, platinum: 35000 },
  { date: 'Per', premium: 58000, platinum: 42000 },
  { date: 'Cum', premium: 65000, platinum: 48000 },
  { date: 'Cmt', premium: 72000, platinum: 54000 },
  { date: 'Paz', premium: 55000, platinum: 40000 },
];

// Conversion Funnel
const conversionFunnel = [
  { stage: 'Free Kullanici', count: 44231, rate: 100 },
  { stage: 'Premium Sayfasi Goruntuleyenler', count: 12456, rate: 28.2 },
  { stage: 'Odeme Sayfasina Gidenler', count: 5678, rate: 45.6 },
  { stage: 'Odeme Tamamlayanlar', count: 4521, rate: 79.6 },
];

// Churn Analysis
const churnReasons = [
  { reason: 'Fiyat yuksek', count: 34, percentage: 38 },
  { reason: 'Kullanmiyorum', count: 28, percentage: 31 },
  { reason: 'Baska alternatif', count: 15, percentage: 17 },
  { reason: 'Teknik sorunlar', count: 8, percentage: 9 },
  { reason: 'Diger', count: 4, percentage: 5 },
];

export default function SubscriptionManagementPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [promoDialog, setPromoDialog] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    targetPlan: 'all',
    usageLimit: 0,
    validUntil: '',
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'new':
        return (
          <CanvaBadge className="bg-emerald-500/10 text-emerald-600">
            <Plus className="h-3 w-3 mr-1" />
            Yeni
          </CanvaBadge>
        );
      case 'upgrade':
        return (
          <CanvaBadge className="bg-blue-500/10 text-blue-600">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Yukseltme
          </CanvaBadge>
        );
      case 'downgrade':
        return (
          <CanvaBadge className="bg-amber-500/10 text-amber-600">
            <ArrowDownRight className="h-3 w-3 mr-1" />
            Dusurme
          </CanvaBadge>
        );
      case 'renewal':
        return (
          <CanvaBadge className="bg-purple-500/10 text-purple-600">
            <RefreshCw className="h-3 w-3 mr-1" />
            Yenileme
          </CanvaBadge>
        );
      case 'cancel':
        return (
          <CanvaBadge className="bg-red-500/10 text-red-600">
            <XCircle className="h-3 w-3 mr-1" />
            Iptal
          </CanvaBadge>
        );
      default:
        return <CanvaBadge variant="primary">{action}</CanvaBadge>;
    }
  };

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case 'platinum':
        return (
          <CanvaBadge className="bg-amber-500 text-white">
            <Crown className="h-3 w-3 mr-1" />
            Platinum
          </CanvaBadge>
        );
      case 'premium':
        return (
          <CanvaBadge className="bg-purple-500 text-white">
            <Star className="h-3 w-3 mr-1" />
            Premium
          </CanvaBadge>
        );
      case 'free':
        return <CanvaBadge variant="primary">Free</CanvaBadge>;
      default:
        return <CanvaBadge variant="primary">-</CanvaBadge>;
    }
  };

  return (
    <div className="admin-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" />
            Subscription & Revenue Management
          </h1>
          <p className="text-muted-foreground">
            Abonelik planlari, promo kodlari ve gelir yonetimi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CanvaButton variant="primary" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Rapor
          </CanvaButton>
          <CanvaButton size="sm" onClick={() => setPromoDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Promo
          </CanvaButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
        <Card className="col-span-2 bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              MRR (Aylik Gelir)
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600">
              {formatCurrency(subscriptionStats.mrr, 'TRY')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-600 font-medium">+12.3%</span>
              <span className="text-muted-foreground">vs gecen ay</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Toplam Abone
            </CardDescription>
            <CardTitle className="text-xl font-bold">
              {subscriptionStats.totalSubscribers.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Donusum Orani
            </CardDescription>
            <CardTitle className="text-xl font-bold text-purple-600">
              %{subscriptionStats.conversionRate}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Churn Orani
            </CardDescription>
            <CardTitle className="text-xl font-bold text-amber-600">
              %{subscriptionStats.churnRate}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              LTV
            </CardDescription>
            <CardTitle className="text-xl font-bold">
              {formatCurrency(subscriptionStats.ltv, 'TRY')}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Subscription Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        {subscriptionPlans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              'relative overflow-hidden',
              plan.id === 'platinum' && 'border-amber-500/50',
              plan.id === 'premium' && 'border-purple-500/50',
            )}
          >
            <div
              className={cn('absolute top-0 left-0 w-full h-1', plan.color)}
            />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {plan.id === 'platinum' && (
                    <Crown className="h-5 w-5 text-amber-500" />
                  )}
                  {plan.id === 'premium' && (
                    <Star className="h-5 w-5 text-purple-500" />
                  )}
                  {plan.name}
                </CardTitle>
                <Switch checked={plan.active} />
              </div>
              <CardDescription>
                {plan.price > 0 ? (
                  <span className="text-2xl font-bold text-foreground">
                    {formatCurrency(plan.price, plan.currency)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{plan.period}
                    </span>
                  </span>
                ) : (
                  <span className="text-2xl font-bold text-foreground">
                    Ucretsiz
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-t border-b">
                <span className="text-sm text-muted-foreground">
                  Aktif Kullanici
                </span>
                <span className="font-bold">{plan.users.toLocaleString()}</span>
              </div>
              {plan.revenue && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Aylik Gelir
                  </span>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(plan.revenue, 'TRY')}
                  </span>
                </div>
              )}
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <CanvaButton variant="primary" className="w-full" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Plani Duzenle
              </CanvaButton>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Genel Bakis</TabsTrigger>
          <TabsTrigger value="promos">Promo Kodlari</TabsTrigger>
          <TabsTrigger value="activity">Aktivite</TabsTrigger>
          <TabsTrigger value="churn">Churn Analizi</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Bazli Gelir</CardTitle>
                <CardDescription>Haftalik abonelik geliri</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminAreaChart
                  data={revenueByPlanData}
                  xAxisKey="date"
                  height={250}
                  areas={[
                    {
                      dataKey: 'premium',
                      name: 'Premium',
                      color: CHART_COLORS.secondary,
                    },
                    {
                      dataKey: 'platinum',
                      name: 'Platinum',
                      color: CHART_COLORS.amber,
                    },
                  ]}
                  formatter={(value, name) => [
                    formatCurrency(value as number, 'TRY'),
                    name,
                  ]}
                />
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Donusum Hunisi</CardTitle>
                <CardDescription>Free'den Premium'a yolculuk</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionFunnel.map((stage, index) => (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium">{stage.stage}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {stage.count.toLocaleString()} ({stage.rate}%)
                        </span>
                      </div>
                      <Progress value={stage.rate} className="h-2" />
                    </div>
                  ))}
                </div>
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
                      Bugun Yukseltme
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {subscriptionStats.upgrades}
                    </p>
                  </div>
                  <ArrowUpRight className="h-8 w-8 text-emerald-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Bugun Dusurme
                    </p>
                    <p className="text-2xl font-bold text-amber-600">
                      {subscriptionStats.downgrades}
                    </p>
                  </div>
                  <ArrowDownRight className="h-8 w-8 text-amber-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/10 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bugun Iptal</p>
                    <p className="text-2xl font-bold text-red-600">
                      {subscriptionStats.cancellations}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ARR</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(subscriptionStats.arr, 'TRY')}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Promo Codes Tab */}
        <TabsContent value="promos" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Promo Kodlari</CardTitle>
                  <CardDescription>
                    Aktif ve gecmis promosyonlar
                  </CardDescription>
                </div>
                <CanvaButton size="sm" onClick={() => setPromoDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Promo
                </CanvaButton>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kod</TableHead>
                    <TableHead>Indirim</TableHead>
                    <TableHead>Hedef Plan</TableHead>
                    <TableHead>Kullanim</TableHead>
                    <TableHead>Gecerlilik</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-muted rounded font-mono text-sm">
                            {promo.code}
                          </code>
                          <CanvaButton
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </CanvaButton>
                        </div>
                      </TableCell>
                      <TableCell>
                        <CanvaBadge variant="primary">
                          {promo.type === 'percentage'
                            ? `%${promo.value}`
                            : formatCurrency(promo.value, 'TRY')}
                        </CanvaBadge>
                      </TableCell>
                      <TableCell>
                        {promo.targetPlan === 'all' ? (
                          <CanvaBadge variant="primary">Tumu</CanvaBadge>
                        ) : (
                          getPlanBadge(promo.targetPlan)
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {promo.usedCount}
                            </span>
                            <span className="text-muted-foreground">
                              / {promo.usageLimit || '∞'}
                            </span>
                          </div>
                          {promo.usageLimit > 0 && (
                            <Progress
                              value={(promo.usedCount / promo.usageLimit) * 100}
                              className="h-1"
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {promo.validFrom} - {promo.validUntil}
                      </TableCell>
                      <TableCell>
                        {promo.isActive ? (
                          <CanvaBadge className="bg-emerald-500/10 text-emerald-600">
                            Aktif
                          </CanvaBadge>
                        ) : (
                          <CanvaBadge variant="primary">Pasif</CanvaBadge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CanvaButton
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </CanvaButton>
                          <CanvaButton
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </CanvaButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Son Abonelik Aktiviteleri</CardTitle>
              <CardDescription>Yukseltme, dusurme ve iptaller</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSubscriptions.map((sub, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                        {sub.user
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="font-medium">{sub.user}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getActionBadge(sub.action)}
                          {sub.from && (
                            <>
                              <span className="text-xs text-muted-foreground">
                                {sub.from}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                →
                              </span>
                            </>
                          )}
                          {sub.plan && getPlanBadge(sub.plan)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          'font-medium',
                          sub.amount > 0
                            ? 'text-emerald-600'
                            : sub.amount < 0
                              ? 'text-red-600'
                              : 'text-muted-foreground',
                        )}
                      >
                        {sub.amount > 0 ? '+' : ''}
                        {sub.amount !== 0
                          ? formatCurrency(sub.amount, 'TRY')
                          : '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sub.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Churn Tab */}
        <TabsContent value="churn" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Iptal Sebepleri
              </CardTitle>
              <CardDescription>
                Kullanicilarin iptal sebepleri analizi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {churnReasons.map((reason) => (
                  <div key={reason.reason} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{reason.reason}</span>
                      <span className="text-muted-foreground">
                        {reason.count} kullanici (%{reason.percentage})
                      </span>
                    </div>
                    <Progress value={reason.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Promo Dialog */}
      <Dialog open={promoDialog} onOpenChange={setPromoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Promo Kodu</DialogTitle>
            <DialogDescription>Yeni promosyon kodu olusturun</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Promo Kodu</Label>
              <Input placeholder="PROMO2024" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Indirim Tipi</Label>
                <Select defaultValue="percentage">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Yuzde</SelectItem>
                    <SelectItem value="fixed">Sabit Tutar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Deger</Label>
                <Input type="number" placeholder="20" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Hedef Plan</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tum Planlar</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kullanim Limiti</Label>
                <Input type="number" placeholder="1000" />
              </div>
              <div className="space-y-2">
                <Label>Gecerlilik</Label>
                <Input type="date" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <CanvaButton
              variant="primary"
              onClick={() => setPromoDialog(false)}
            >
              Iptal
            </CanvaButton>
            <CanvaButton onClick={() => setPromoDialog(false)}>
              Olustur
            </CanvaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

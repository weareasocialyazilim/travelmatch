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
    color: 'bg-muted-foreground',
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
          <CanvaBadge variant="success" icon={<Plus className="h-3 w-3" />}>
            Yeni
          </CanvaBadge>
        );
      case 'upgrade':
        return (
          <CanvaBadge
            variant="info"
            icon={<ArrowUpRight className="h-3 w-3" />}
          >
            Yukseltme
          </CanvaBadge>
        );
      case 'downgrade':
        return (
          <CanvaBadge
            variant="warning"
            icon={<ArrowDownRight className="h-3 w-3" />}
          >
            Dusurme
          </CanvaBadge>
        );
      case 'renewal':
        return (
          <CanvaBadge
            variant="primary"
            icon={<RefreshCw className="h-3 w-3" />}
          >
            Yenileme
          </CanvaBadge>
        );
      case 'cancel':
        return (
          <CanvaBadge variant="error" icon={<XCircle className="h-3 w-3" />}>
            Iptal
          </CanvaBadge>
        );
      default:
        return <CanvaBadge>{action}</CanvaBadge>;
    }
  };

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case 'platinum':
        return (
          <CanvaBadge variant="warning" icon={<Crown className="h-3 w-3" />}>
            Platinum
          </CanvaBadge>
        );
      case 'premium':
        return (
          <CanvaBadge variant="primary" icon={<Star className="h-3 w-3" />}>
            Premium
          </CanvaBadge>
        );
      case 'free':
        return <CanvaBadge>Free</CanvaBadge>;
      default:
        return <CanvaBadge>-</CanvaBadge>;
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
          <CanvaButton
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Rapor
          </CanvaButton>
          <CanvaButton
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setPromoDialog(true)}
          >
            Yeni Promo
          </CanvaButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
        <CanvaStatCard
          className="col-span-2"
          label="MRR (Aylik Gelir)"
          value={formatCurrency(subscriptionStats.mrr, 'TRY')}
          change={{ value: 12.3, label: 'vs gecen ay' }}
          icon={<DollarSign className="h-4 w-4" />}
        />

        <CanvaStatCard
          label="Toplam Abone"
          value={subscriptionStats.totalSubscribers}
          icon={<Users className="h-4 w-4" />}
        />

        <CanvaStatCard
          label="Donusum Orani"
          value={`%${subscriptionStats.conversionRate}`}
          icon={<Target className="h-4 w-4" />}
        />

        <CanvaStatCard
          label="Churn Orani"
          value={`%${subscriptionStats.churnRate}`}
          icon={<AlertTriangle className="h-4 w-4" />}
        />

        <CanvaStatCard
          label="LTV"
          value={formatCurrency(subscriptionStats.ltv, 'TRY')}
          icon={<Award className="h-4 w-4" />}
        />
      </div>

      {/* Subscription Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        {subscriptionPlans.map((plan) => (
          <CanvaCard
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
            <CanvaCardHeader>
              <div className="flex items-center justify-between">
                <CanvaCardTitle className="flex items-center gap-2">
                  {plan.id === 'platinum' && (
                    <Crown className="h-5 w-5 text-amber-500" />
                  )}
                  {plan.id === 'premium' && (
                    <Star className="h-5 w-5 text-purple-500" />
                  )}
                  {plan.name}
                </CanvaCardTitle>
                <Switch checked={plan.active} />
              </div>
              <CanvaCardSubtitle>
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
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody className="space-y-4">
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
              <CanvaButton
                variant="outline"
                fullWidth
                size="sm"
                leftIcon={<Edit className="h-4 w-4" />}
              >
                Plani Duzenle
              </CanvaButton>
            </CanvaCardBody>
          </CanvaCard>
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
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Plan Bazli Gelir</CanvaCardTitle>
                <CanvaCardSubtitle>Haftalik abonelik geliri</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
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
              </CanvaCardBody>
            </CanvaCard>

            {/* Conversion Funnel */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Donusum Hunisi</CanvaCardTitle>
                <CanvaCardSubtitle>
                  Free'den Premium'a yolculuk
                </CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
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
              </CanvaCardBody>
            </CanvaCard>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <CanvaStatCard
              label="Bugun Yukseltme"
              value={subscriptionStats.upgrades}
              icon={<ArrowUpRight className="h-4 w-4" />}
            />

            <CanvaStatCard
              label="Bugun Dusurme"
              value={subscriptionStats.downgrades}
              icon={<ArrowDownRight className="h-4 w-4" />}
            />

            <CanvaStatCard
              label="Bugun Iptal"
              value={subscriptionStats.cancellations}
              icon={<XCircle className="h-4 w-4" />}
            />

            <CanvaStatCard
              label="ARR"
              value={formatCurrency(subscriptionStats.arr, 'TRY')}
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>
        </TabsContent>

        {/* Promo Codes Tab */}
        <TabsContent value="promos" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CanvaCardTitle>Promo Kodlari</CanvaCardTitle>
                  <CanvaCardSubtitle>
                    Aktif ve gecmis promosyonlar
                  </CanvaCardSubtitle>
                </div>
                <CanvaButton
                  size="sm"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => setPromoDialog(true)}
                >
                  Yeni Promo
                </CanvaButton>
              </div>
            </CanvaCardHeader>
            <CanvaCardBody>
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
                          <CanvaButton variant="ghost" size="xs" iconOnly>
                            <Copy className="h-3 w-3" />
                          </CanvaButton>
                        </div>
                      </TableCell>
                      <TableCell>
                        <CanvaBadge>
                          {promo.type === 'percentage'
                            ? `%${promo.value}`
                            : formatCurrency(promo.value, 'TRY')}
                        </CanvaBadge>
                      </TableCell>
                      <TableCell>
                        {promo.targetPlan === 'all' ? (
                          <CanvaBadge>Tumu</CanvaBadge>
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
                          <CanvaBadge variant="success">Aktif</CanvaBadge>
                        ) : (
                          <CanvaBadge>Pasif</CanvaBadge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CanvaButton variant="ghost" size="xs" iconOnly>
                            <Edit className="h-4 w-4" />
                          </CanvaButton>
                          <CanvaButton
                            variant="ghost"
                            size="xs"
                            iconOnly
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </CanvaButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Son Abonelik Aktiviteleri</CanvaCardTitle>
              <CanvaCardSubtitle>
                Yukseltme, dusurme ve iptaller
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
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
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Churn Tab */}
        <TabsContent value="churn" className="space-y-6">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Iptal Sebepleri
              </CanvaCardTitle>
              <CanvaCardSubtitle>
                Kullanicilarin iptal sebepleri analizi
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
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
            </CanvaCardBody>
          </CanvaCard>
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
            <CanvaButton variant="outline" onClick={() => setPromoDialog(false)}>
              Iptal
            </CanvaButton>
            <CanvaButton onClick={() => setPromoDialog(false)}>Olustur</CanvaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Clock,
  MapPin,
  Calendar,
  Users,
  Zap,
  Settings,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
  AlertTriangle,
} from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock pricing data
const pricingStats = {
  current_mrr: 125678,
  avg_arpu: 45.8,
  conversion_rate: 4.2,
  active_promos: 3,
};

const subscriptionPlans = [
  {
    id: '1',
    name: 'Basic',
    price_monthly: 0,
    price_yearly: 0,
    subscribers: 45678,
    revenue: 0,
    features: ['5 günlük swipe limiti', 'Temel eşleşme', 'Reklam gösterimi'],
    limits: {
      giftsPerMonth: 1,
      momentsPerMonth: 3,
      messagesPerDay: 20,
    },
  },
  {
    id: '2',
    name: 'Premium',
    price_monthly: 49.99,
    price_yearly: 399.99,
    subscribers: 12345,
    revenue: 617377,
    features: [
      'Sınırsız swipe',
      'Super Like x5/gün',
      'Reklamsız',
      'Kimin beğendiğini gör',
    ],
    limits: {
      giftsPerMonth: 10,
      momentsPerMonth: 15,
      messagesPerDay: -1, // unlimited
    },
  },
  {
    id: '3',
    name: 'Premium+',
    price_monthly: 99.99,
    price_yearly: 799.99,
    subscribers: 3456,
    revenue: 345543,
    features: [
      'Premium özellikleri',
      'Öne çıkarılma',
      'Mesaj önceliği',
      'Profil boost',
    ],
    limits: {
      giftsPerMonth: -1, // unlimited
      momentsPerMonth: -1, // unlimited
      messagesPerDay: -1, // unlimited
    },
  },
];

const dynamicRules = [
  {
    id: '1',
    name: 'Hafta Sonu Surge',
    trigger: 'Cuma-Pazar',
    adjustment: '+15%',
    status: 'active',
    impact: '+₺12,500 gelir',
  },
  {
    id: '2',
    name: 'Yeni Kullanıcı İndirimi',
    trigger: 'İlk 7 gün',
    adjustment: '-20%',
    status: 'active',
    impact: '+34% dönüşüm',
  },
  {
    id: '3',
    name: 'Düşük Aktivite Bölgesi',
    trigger: 'DAU < 1000',
    adjustment: '-10%',
    status: 'paused',
    impact: 'Test aşamasında',
  },
  {
    id: '4',
    name: 'Özel Gün Fiyatlaması',
    trigger: '14 Şubat',
    adjustment: '+25%',
    status: 'scheduled',
    impact: 'Planlandı',
  },
];

const regionalPricing = [
  {
    country: '🇹🇷 Türkiye',
    currency: 'TRY',
    basic: 0,
    premium: 49.99,
    premiumPlus: 99.99,
    ppp: 1.0,
  },
  {
    country: '🇺🇸 ABD',
    currency: 'USD',
    basic: 0,
    premium: 14.99,
    premiumPlus: 29.99,
    ppp: 1.0,
  },
  {
    country: '🇪🇺 Avrupa',
    currency: 'EUR',
    basic: 0,
    premium: 12.99,
    premiumPlus: 24.99,
    ppp: 0.95,
  },
  {
    country: '🇧🇷 Brezilya',
    currency: 'BRL',
    basic: 0,
    premium: 39.99,
    premiumPlus: 79.99,
    ppp: 0.65,
  },
  {
    country: '🇮🇳 Hindistan',
    currency: 'INR',
    basic: 0,
    premium: 499,
    premiumPlus: 999,
    ppp: 0.45,
  },
];

export default function PricingPage() {
  const [dynamicPricingEnabled, setDynamicPricingEnabled] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dinamik Fiyatlandırma
          </h1>
          <p className="text-muted-foreground">
            Fiyat kuralları ve bölgesel ayarlar
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={dynamicPricingEnabled}
              onCheckedChange={setDynamicPricingEnabled}
            />
            <Label>Dinamik Fiyatlandırma</Label>
          </div>
          <CanvaButton>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kural
          </CanvaButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <CanvaStatCard
          title="Aylık Gelir (MRR)"
          value={`₺${pricingStats.current_mrr.toLocaleString('tr-TR')}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend={{ value: 12, direction: 'up', label: 'geçen aya göre' }}
        />
        <CanvaStatCard
          title="Ortalama ARPU"
          value={`₺${pricingStats.avg_arpu}`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: 5, direction: 'up', label: 'geçen aya göre' }}
        />
        <CanvaStatCard
          title="Dönüşüm Oranı"
          value={`${pricingStats.conversion_rate}%`}
          icon={<Percent className="h-5 w-5" />}
          trend={{ value: 0.3, direction: 'up', label: 'geçen aya göre' }}
        />
        <CanvaStatCard
          title="Aktif Promosyon"
          value={pricingStats.active_promos.toString()}
          icon={<Zap className="h-5 w-5" />}
        />
      </div>

      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Abonelik Planları</TabsTrigger>
          <TabsTrigger value="dynamic">Dinamik Kurallar</TabsTrigger>
          <TabsTrigger value="regional">Bölgesel Fiyatlar</TabsTrigger>
          <TabsTrigger value="analytics">Fiyat Analitiği</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <CanvaCard key={plan.id}>
                <CanvaCardHeader>
                  <div className="flex items-center justify-between">
                    <CanvaCardTitle>{plan.name}</CanvaCardTitle>
                    <CanvaButton variant="ghost" size="sm" iconOnly>
                      <Edit className="h-4 w-4" />
                    </CanvaButton>
                  </div>
                  <CanvaCardSubtitle>
                    {plan.subscribers.toLocaleString('tr-TR')} abone
                  </CanvaCardSubtitle>
                </CanvaCardHeader>
                <CanvaCardBody>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">
                          ₺{plan.price_monthly}
                        </span>
                        <span className="text-muted-foreground">/ay</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        veya ₺{plan.price_yearly}/yıl
                      </p>
                    </div>
                    <div className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    {plan.revenue > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Bu ay gelir
                        </p>
                        <p className="text-lg font-bold">
                          ₺{plan.revenue.toLocaleString('tr-TR')}
                        </p>
                      </div>
                    )}
                    <div className="pt-4 border-t">
                      <Label className="text-sm text-muted-foreground">
                        Gifts/month
                      </Label>
                      <Input
                        type="number"
                        defaultValue={
                          plan.limits.giftsPerMonth === -1
                            ? ''
                            : plan.limits.giftsPerMonth
                        }
                        placeholder="Unlimited"
                        className="mt-1"
                      />
                    </div>
                    <CanvaButton className="w-full mt-4">
                      Save Changes
                    </CanvaButton>
                  </div>
                </CanvaCardBody>
              </CanvaCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dynamic" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Dinamik Fiyatlandırma Kuralları</CanvaCardTitle>
              <CanvaCardSubtitle>
                Otomatik fiyat ayarlaması kuralları
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kural Adı</TableHead>
                    <TableHead>Tetikleyici</TableHead>
                    <TableHead>Fiyat Ayarı</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Etki</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dynamicRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>{rule.trigger}</TableCell>
                      <TableCell>
                        <CanvaBadge
                          className={
                            rule.adjustment.startsWith('+')
                              ? 'bg-green-500'
                              : 'bg-red-500'
                          }
                        >
                          {rule.adjustment}
                        </CanvaBadge>
                      </TableCell>
                      <TableCell>
                        {rule.status === 'active' ? (
                          <CanvaBadge className="bg-green-500">
                            Aktif
                          </CanvaBadge>
                        ) : rule.status === 'paused' ? (
                          <CanvaBadge variant="default">
                            Duraklatıldı
                          </CanvaBadge>
                        ) : (
                          <CanvaBadge className="bg-blue-500">
                            Planlandı
                          </CanvaBadge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {rule.impact}
                      </TableCell>
                      <TableCell>
                        <CanvaButton variant="ghost" size="sm" iconOnly>
                          <Settings className="h-4 w-4" />
                        </CanvaButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Bölgesel Fiyatlandırma</CanvaCardTitle>
              <CanvaCardSubtitle>
                Ülkelere göre satın alma gücü paritesi (PPP) fiyatları
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ülke/Bölge</TableHead>
                    <TableHead>Para Birimi</TableHead>
                    <TableHead className="text-right">Basic</TableHead>
                    <TableHead className="text-right">Premium</TableHead>
                    <TableHead className="text-right">Premium+</TableHead>
                    <TableHead className="text-right">PPP Çarpanı</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionalPricing.map((region, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">
                        {region.country}
                      </TableCell>
                      <TableCell>{region.currency}</TableCell>
                      <TableCell className="text-right">
                        {region.basic === 0 ? 'Ücretsiz' : region.basic}
                      </TableCell>
                      <TableCell className="text-right">
                        {region.premium}
                      </TableCell>
                      <TableCell className="text-right">
                        {region.premiumPlus}
                      </TableCell>
                      <TableCell className="text-right">
                        <CanvaBadge variant="default">{region.ppp}x</CanvaBadge>
                      </TableCell>
                      <TableCell>
                        <CanvaButton variant="ghost" size="sm" iconOnly>
                          <Edit className="h-4 w-4" />
                        </CanvaButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Fiyat Elastikiyeti</CanvaCardTitle>
                <CanvaCardSubtitle>
                  Fiyat değişikliklerinin etkisi
                </CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Premium (%10 artış senaryosu)</span>
                    <span className="text-red-500 dark:text-red-400">-8% abone</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Premium (%10 düşüş senaryosu)</span>
                    <span className="text-green-500 dark:text-green-400">+15% abone</span>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Optimal fiyat noktası
                    </p>
                    <p className="text-2xl font-bold">₺44.99 - ₺54.99</p>
                  </div>
                </div>
              </CanvaCardBody>
            </CanvaCard>
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>A/B Test Sonuçları</CanvaCardTitle>
                <CanvaCardSubtitle>Aktif fiyat testleri</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        Premium Yıllık Fiyat Testi
                      </span>
                      <CanvaBadge className="bg-green-500">Aktif</CanvaBadge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">
                          Kontrol (₺399.99)
                        </p>
                        <p className="font-medium">3.2% dönüşüm</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Varyant (₺349.99)
                        </p>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          4.1% dönüşüm
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Güven aralığı: 95% | Varyant kazanıyor
                    </p>
                  </div>
                </div>
              </CanvaCardBody>
            </CanvaCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

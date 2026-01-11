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
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Aylık Gelir (MRR)
                </p>
                <p className="text-2xl font-bold">
                  ₺{pricingStats.current_mrr.toLocaleString('tr-TR')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              +12% geçen aya göre
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ortalama ARPU</p>
                <p className="text-2xl font-bold">₺{pricingStats.avg_arpu}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              +5% geçen aya göre
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dönüşüm Oranı</p>
                <p className="text-2xl font-bold">
                  {pricingStats.conversion_rate}%
                </p>
              </div>
              <Percent className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              +0.3% geçen aya göre
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Promosyon</p>
                <p className="text-2xl font-bold">
                  {pricingStats.active_promos}
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
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
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    <CanvaButton variant="ghost" size="sm" iconOnly>
                      <Edit className="h-4 w-4" />
                    </CanvaButton>
                  </div>
                  <CardDescription>
                    {plan.subscribers.toLocaleString('tr-TR')} abone
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dynamic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dinamik Fiyatlandırma Kuralları</CardTitle>
              <CardDescription>
                Otomatik fiyat ayarlaması kuralları
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bölgesel Fiyatlandırma</CardTitle>
              <CardDescription>
                Ülkelere göre satın alma gücü paritesi (PPP) fiyatları
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fiyat Elastikiyeti</CardTitle>
                <CardDescription>
                  Fiyat değişikliklerinin etkisi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Premium (%10 artış senaryosu)</span>
                    <span className="text-red-500">-8% abone</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Premium (%10 düşüş senaryosu)</span>
                    <span className="text-green-500">+15% abone</span>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Optimal fiyat noktası
                    </p>
                    <p className="text-2xl font-bold">₺44.99 - ₺54.99</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>A/B Test Sonuçları</CardTitle>
                <CardDescription>Aktif fiyat testleri</CardDescription>
              </CardHeader>
              <CardContent>
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
                        <p className="font-medium text-green-600">
                          4.1% dönüşüm
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Güven aralığı: 95% | Varyant kazanıyor
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

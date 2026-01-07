'use client';

import { useState } from 'react';
import {
  Gift,
  Plus,
  Tag,
  Users,
  Share2,
  TrendingUp,
  Calendar,
  Copy,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Percent,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { toast } from 'sonner';
import { formatDate, formatCurrency } from '@/lib/utils';

// Mock data
const mockPromoCodes = [
  {
    id: '1',
    code: 'YILBASI30',
    type: 'percentage',
    value: 30,
    description: 'Yılbaşı kampanyası - %30 indirim',
    status: 'active',
    usage: { current: 456, limit: 1000 },
    valid_from: '2024-12-15T00:00:00Z',
    valid_until: '2024-12-31T23:59:59Z',
    applicable_to: 'premium_subscription',
    revenue_impact: 68400,
  },
  {
    id: '2',
    code: 'HOSGELDIN',
    type: 'fixed',
    value: 50,
    description: 'Yeni kullanıcı indirimi',
    status: 'active',
    usage: { current: 3240, limit: null },
    valid_from: '2024-01-01T00:00:00Z',
    valid_until: null,
    applicable_to: 'first_purchase',
    revenue_impact: 162000,
  },
  {
    id: '3',
    code: 'PREMIUM50',
    type: 'percentage',
    value: 50,
    description: 'Premium abonelik %50 indirim',
    status: 'scheduled',
    usage: { current: 0, limit: 500 },
    valid_from: '2024-12-20T00:00:00Z',
    valid_until: '2024-12-25T23:59:59Z',
    applicable_to: 'premium_subscription',
    revenue_impact: 0,
  },
  {
    id: '4',
    code: 'BLACKFRIDAY',
    type: 'percentage',
    value: 40,
    description: 'Black Friday kampanyası',
    status: 'expired',
    usage: { current: 2800, limit: 5000 },
    valid_from: '2024-11-24T00:00:00Z',
    valid_until: '2024-11-27T23:59:59Z',
    applicable_to: 'all',
    revenue_impact: 420000,
  },
];

const mockReferrals = [
  {
    id: '1',
    referrer: 'Ahmet Y.',
    referrer_id: 'user_1',
    total_referrals: 24,
    successful_referrals: 18,
    pending_referrals: 6,
    total_earnings: 540,
    status: 'active',
  },
  {
    id: '2',
    referrer: 'Elif K.',
    referrer_id: 'user_2',
    total_referrals: 15,
    successful_referrals: 12,
    pending_referrals: 3,
    total_earnings: 360,
    status: 'active',
  },
  {
    id: '3',
    referrer: 'Mehmet A.',
    referrer_id: 'user_3',
    total_referrals: 8,
    successful_referrals: 5,
    pending_referrals: 3,
    total_earnings: 150,
    status: 'active',
  },
];

const promoStats = {
  totalCodes: 24,
  activeCodes: 8,
  totalUsage: 12450,
  totalRevenue: 650400,
  avgConversion: 23.5,
};

const referralStats = {
  totalReferrers: 4500,
  activeReferrers: 1200,
  totalReferrals: 8900,
  successRate: 67.2,
  totalPayout: 267000,
};

export default function PromosPage() {
  const [isCreatePromoOpen, setIsCreatePromoOpen] = useState(false);
  const [promoType, setPromoType] = useState<string>('percentage');

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant: 'default' | 'secondary' | 'outline' | 'destructive';
        label: string;
      }
    > = {
      active: { variant: 'default', label: 'Aktif' },
      scheduled: { variant: 'secondary', label: 'Zamanlandı' },
      expired: { variant: 'outline', label: 'Süresi Doldu' },
      disabled: { variant: 'destructive', label: 'Devre Dışı' },
    };
    const { variant, label } = variants[status] || {
      variant: 'outline',
      label: status,
    };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Kod kopyalandı');
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Promosyonlar & Referans
          </h1>
          <p className="text-muted-foreground">
            Promosyon kodları ve referans programını yönet
          </p>
        </div>
        <Dialog open={isCreatePromoOpen} onOpenChange={setIsCreatePromoOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Promosyon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Yeni Promosyon Kodu</DialogTitle>
              <DialogDescription>
                İndirim veya hediye için promosyon kodu oluşturun
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Promosyon Kodu</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    placeholder="YILBASI30"
                    className="uppercase"
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.info(`Önerilen kod: ${generateCode()}`)
                    }
                  >
                    Oluştur
                  </Button>
                </div>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>İndirim Tipi</Label>
                <Select value={promoType} onValueChange={setPromoType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      Yüzde İndirim (%)
                    </SelectItem>
                    <SelectItem value="fixed">Sabit İndirim (₺)</SelectItem>
                    <SelectItem value="free_trial">Ücretsiz Deneme</SelectItem>
                    <SelectItem value="gift">Hediye</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Value */}
              <div className="space-y-2">
                <Label htmlFor="value">Değer</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="value"
                    type="number"
                    placeholder={promoType === 'percentage' ? '30' : '50'}
                  />
                  <span className="text-muted-foreground">
                    {promoType === 'percentage' ? '%' : '₺'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Input id="description" placeholder="Kampanya açıklaması..." />
              </div>

              {/* Applicable To */}
              <div className="space-y-2">
                <Label>Geçerli Olduğu Ürün</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Ürünler</SelectItem>
                    <SelectItem value="premium_subscription">
                      Premium Abonelik
                    </SelectItem>
                    <SelectItem value="boost">Boost</SelectItem>
                    <SelectItem value="super_like">Super Like</SelectItem>
                    <SelectItem value="first_purchase">
                      İlk Satın Alma
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Usage Limit */}
              <div className="space-y-2">
                <Label htmlFor="limit">Kullanım Limiti (Opsiyonel)</Label>
                <Input
                  id="limit"
                  type="number"
                  placeholder="Sınırsız için boş bırakın"
                />
              </div>

              {/* Date Range */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Başlangıç Tarihi</Label>
                  <Input type="datetime-local" />
                </div>
                <div className="space-y-2">
                  <Label>Bitiş Tarihi</Label>
                  <Input type="datetime-local" />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreatePromoOpen(false)}
              >
                İptal
              </Button>
              <Button
                onClick={() => {
                  toast.success('Promosyon kodu oluşturuldu');
                  setIsCreatePromoOpen(false);
                }}
              >
                Oluştur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="promos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="promos">
            <Tag className="mr-2 h-4 w-4" />
            Promosyon Kodları
          </TabsTrigger>
          <TabsTrigger value="referrals">
            <Share2 className="mr-2 h-4 w-4" />
            Referans Programı
          </TabsTrigger>
        </TabsList>

        {/* Promo Codes Tab */}
        <TabsContent value="promos" className="space-y-6">
          {/* Promo Stats */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{promoStats.totalCodes}</p>
                  <p className="text-sm text-muted-foreground">Toplam Kod</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {promoStats.activeCodes}
                  </p>
                  <p className="text-sm text-muted-foreground">Aktif</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {promoStats.totalUsage.toLocaleString('tr-TR')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Toplam Kullanım
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    %{promoStats.avgConversion}
                  </p>
                  <p className="text-sm text-muted-foreground">Ort. Dönüşüm</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(promoStats.totalRevenue, 'TRY')}
                  </p>
                  <p className="text-sm text-muted-foreground">Toplam Gelir</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Promo Codes List */}
          <Card>
            <CardHeader>
              <CardTitle>Promosyon Kodları</CardTitle>
              <CardDescription>
                Aktif ve geçmiş promosyon kodları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPromoCodes.map((promo) => (
                  <div
                    key={promo.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        {promo.type === 'percentage' ? (
                          <Percent className="h-6 w-6 text-primary" />
                        ) : (
                          <DollarSign className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <code className="rounded bg-muted px-2 py-1 font-mono text-sm font-semibold">
                            {promo.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyCode(promo.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {getStatusBadge(promo.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {promo.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Gift className="h-3 w-3" />
                            {promo.type === 'percentage'
                              ? `%${promo.value}`
                              : `₺${promo.value}`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(promo.valid_from)}
                            {promo.valid_until &&
                              ` - ${formatDate(promo.valid_until)}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Usage Progress */}
                      <div className="w-32 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>
                            {promo.usage.current.toLocaleString('tr-TR')}
                          </span>
                          <span className="text-muted-foreground">
                            {promo.usage.limit
                              ? `/ ${promo.usage.limit.toLocaleString('tr-TR')}`
                              : '∞'}
                          </span>
                        </div>
                        {promo.usage.limit && (
                          <Progress
                            value={
                              (promo.usage.current / promo.usage.limit) * 100
                            }
                            className="h-1"
                          />
                        )}
                      </div>

                      {/* Revenue */}
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(promo.revenue_impact, 'TRY')}
                        </p>
                        <p className="text-xs text-muted-foreground">Gelir</p>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Detaylar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Kopyala
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-6">
          {/* Referral Stats */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {referralStats.totalReferrers.toLocaleString('tr-TR')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Toplam Referrer
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {referralStats.activeReferrers.toLocaleString('tr-TR')}
                  </p>
                  <p className="text-sm text-muted-foreground">Aktif</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {referralStats.totalReferrals.toLocaleString('tr-TR')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Toplam Referans
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    %{referralStats.successRate}
                  </p>
                  <p className="text-sm text-muted-foreground">Başarı Oranı</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(referralStats.totalPayout, 'TRY')}
                  </p>
                  <p className="text-sm text-muted-foreground">Toplam Ödeme</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Referrers */}
          <Card>
            <CardHeader>
              <CardTitle>En İyi Referrer\'lar</CardTitle>
              <CardDescription>
                En çok referans yapan kullanıcılar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReferrals.map((referral, index) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{referral.referrer}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {referral.total_referrals} referans
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {referral.successful_referrals} başarılı
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            {referral.pending_referrals} bekliyor
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(referral.total_earnings, 'TRY')}
                      </p>
                      <p className="text-xs text-muted-foreground">Kazanç</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Referral Program Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Referans Programı Ayarları</CardTitle>
              <CardDescription>
                Referans ödül ve kurallarını yapılandırın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Referrer Ödülü</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="30" className="w-24" />
                    <span className="text-muted-foreground">₺</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Referred Ödülü</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" defaultValue="20" className="w-24" />
                    <span className="text-muted-foreground">₺</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="font-medium">Abuse Detection</p>
                  <p className="text-sm text-muted-foreground">
                    Kötüye kullanım tespiti ve otomatik engelleme
                  </p>
                </div>
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Aktif
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

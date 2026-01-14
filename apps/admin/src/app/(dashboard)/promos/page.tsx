'use client';

import { useState, useMemo } from 'react';
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
  Clock,
  DollarSign,
  Percent,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { CanvaButton } from '@/components/canva/CanvaButton';
import { CanvaInput } from '@/components/canva/CanvaInput';
import { Label } from '@/components/ui/label';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
  CanvaCardBody,
  CanvaStatCard,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';
import { Input } from '@/components/ui/input';
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
import {
  usePromosPageData,
  useCreatePromo,
  useDeletePromo,
  useTogglePromo,
  useUpdateReferralSettings,
  type Referral,
} from '@/hooks/use-promos';

export default function PromosPage() {
  const [isCreatePromoOpen, setIsCreatePromoOpen] = useState(false);
  const [promoType, setPromoType] = useState<string>('percentage');
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoValue, setNewPromoValue] = useState('');
  const [newPromoDescription, setNewPromoDescription] = useState('');
  const [newPromoApplicableTo, setNewPromoApplicableTo] = useState('all');
  const [newPromoLimit, setNewPromoLimit] = useState('');

  // Referral program settings
  const [referrerReward, setReferrerReward] = useState('30');
  const [referredReward, setReferredReward] = useState('20');

  // Use combined hook for promos and referrals data
  const {
    data: pageData,
    isLoading,
    error,
    refetch,
    promos: promosState,
    referrals: referralsState,
  } = usePromosPageData();
  const createPromo = useCreatePromo();
  const deletePromo = useDeletePromo();
  const togglePromo = useTogglePromo();
  const updateReferralSettings = useUpdateReferralSettings();

  // Transform promo codes for display
  const promoCodes = useMemo(() => {
    return pageData.promoCodes.map((promo) => ({
      id: promo.id,
      code: promo.code,
      type: promo.discount_type,
      value: promo.discount_value,
      description: promo.description || '',
      status: promo.is_active ? 'active' : 'disabled',
      usage: {
        current: promo.usage_count || 0,
        limit: promo.usage_limit || null,
      },
      valid_from: promo.valid_from,
      valid_until: promo.valid_until || null,
      applicable_to: 'all',
      revenue_impact: 0,
    }));
  }, [pageData.promoCodes]);

  // Get stats from page data
  const stats = pageData.promoStats;

  // Get referrals from page data
  const referrals: Referral[] = pageData.referrals;
  const referralStats = pageData.referralStats;

  const handleCreatePromo = () => {
    createPromo.mutate(
      {
        code: newPromoCode.toUpperCase(),
        discount_type: promoType as 'percentage' | 'fixed' | 'free_shipping',
        discount_value: parseFloat(newPromoValue),
        description: newPromoDescription,
        usage_limit: newPromoLimit ? parseInt(newPromoLimit) : undefined,
        valid_from: new Date().toISOString(),
        is_active: true,
      },
      {
        onSuccess: () => {
          toast.success('Promosyon kodu oluşturuldu');
          setIsCreatePromoOpen(false);
          resetForm();
        },
        onError: (error) => {
          toast.error(error.message || 'Promo oluşturulamadı');
        },
      },
    );
  };

  const handleDeletePromo = (id: string) => {
    deletePromo.mutate(id, {
      onSuccess: () => {
        toast.success('Promosyon kodu silindi');
      },
      onError: () => {
        toast.error('Silme işlemi başarısız');
      },
    });
  };

  const resetForm = () => {
    setNewPromoCode('');
    setNewPromoValue('');
    setNewPromoDescription('');
    setNewPromoApplicableTo('all');
    setNewPromoLimit('');
    setPromoType('percentage');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant: 'primary' | 'default' | 'info' | 'error';
        label: string;
      }
    > = {
      active: { variant: 'primary', label: 'Aktif' },
      scheduled: { variant: 'default', label: 'Zamanlandı' },
      expired: { variant: 'info', label: 'Süresi Doldu' },
      disabled: { variant: 'error', label: 'Devre Dışı' },
    };
    const { variant, label } = variants[status] || {
      variant: 'info',
      label: status,
    };
    return <CanvaBadge variant={variant}>{label}</CanvaBadge>;
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

  const handleSaveReferralSettings = () => {
    if (!referrerReward || !referredReward) {
      toast.error('Odul degerleri bos olamaz');
      return;
    }

    const referrerValue = parseFloat(referrerReward);
    const referredValue = parseFloat(referredReward);

    if (
      isNaN(referrerValue) ||
      isNaN(referredValue) ||
      referrerValue < 0 ||
      referredValue < 0
    ) {
      toast.error('Gecerli odul degerleri girin');
      return;
    }

    updateReferralSettings.mutate(
      {
        referrerReward: referrerValue,
        referredReward: referredValue,
      },
      {
        onSuccess: () => {
          toast.success(
            `Referans ayarlari kaydedildi: Referrer ${referrerReward}TL, Referred ${referredReward}TL`,
          );
        },
        onError: (error) => {
          toast.error(error.message || 'Ayarlar kaydedilemedi');
        },
      },
    );
  };

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-muted rounded" />
          <div className="h-10 w-36 bg-muted rounded" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-muted rounded-lg" />
    </div>
  );

  // Error State Component
  const ErrorState = () => (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 dark:bg-red-500/20">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Bir hata oluştu
        </h2>
        <p className="text-muted-foreground max-w-md">
          Promosyon verileri yüklenemedi. Lütfen sayfayı yenileyin veya daha
          sonra tekrar deneyin.
        </p>
        <CanvaButton
          variant="primary"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Tekrar Dene
        </CanvaButton>
      </div>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border">
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Gift className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">
          Henüz promosyon yok
        </h3>
        <p className="text-sm text-muted-foreground">
          İlk promosyon kodunuzu oluşturarak başlayın.
        </p>
        <CanvaButton
          variant="primary"
          onClick={() => setIsCreatePromoOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Promosyon Oluştur
        </CanvaButton>
      </div>
    </div>
  );

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState />;

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
        <div className="flex gap-2">
          <CanvaButton
            variant="primary"
            onClick={() => refetch()}
            loading={isLoading}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Yenile
          </CanvaButton>
          <Dialog open={isCreatePromoOpen} onOpenChange={setIsCreatePromoOpen}>
            <DialogTrigger asChild>
              <CanvaButton
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Yeni Promosyon
              </CanvaButton>
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
                    <CanvaInput
                      id="code"
                      placeholder="YILBASI30"
                      className="uppercase"
                      value={newPromoCode}
                      onChange={(e) =>
                        setNewPromoCode(e.target.value.toUpperCase())
                      }
                    />
                    <CanvaButton
                      variant="primary"
                      onClick={() => {
                        const code = generateCode();
                        setNewPromoCode(code);
                        toast.info(`Kod oluşturuldu: ${code}`);
                      }}
                    >
                      Oluştur
                    </CanvaButton>
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
                      <SelectItem value="free_trial">
                        Ücretsiz Deneme
                      </SelectItem>
                      <SelectItem value="gift">Hediye</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Value */}
                <div className="space-y-2">
                  <Label htmlFor="value">Değer</Label>
                  <div className="flex items-center gap-2">
                    <CanvaInput
                      id="value"
                      type="number"
                      placeholder={promoType === 'percentage' ? '30' : '50'}
                      value={newPromoValue}
                      onChange={(e) => setNewPromoValue(e.target.value)}
                    />
                    <span className="text-muted-foreground">
                      {promoType === 'percentage' ? '%' : '₺'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <CanvaInput
                  label="Açıklama"
                  placeholder="Kampanya açıklaması..."
                  value={newPromoDescription}
                  onChange={(e) => setNewPromoDescription(e.target.value)}
                />

                {/* Applicable To */}
                <div className="space-y-2">
                  <Label>Geçerli Olduğu Ürün</Label>
                  <Select
                    value={newPromoApplicableTo}
                    onValueChange={setNewPromoApplicableTo}
                  >
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
                <CanvaInput
                  label="Kullanım Limiti (Opsiyonel)"
                  type="number"
                  placeholder="Sınırsız için boş bırakın"
                  value={newPromoLimit}
                  onChange={(e) => setNewPromoLimit(e.target.value)}
                />

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
                <CanvaButton
                  variant="primary"
                  onClick={() => setIsCreatePromoOpen(false)}
                >
                  İptal
                </CanvaButton>
                <CanvaButton
                  variant="primary"
                  onClick={handleCreatePromo}
                  disabled={!newPromoCode || !newPromoValue}
                  loading={createPromo.isPending}
                >
                  Oluştur
                </CanvaButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
            <CanvaStatCard
              label="Toplam Kod"
              value={stats.totalCodes}
              icon={<Tag className="h-4 w-4" />}
            />
            <CanvaStatCard
              label="Aktif"
              value={stats.activeCodes}
              icon={<CheckCircle className="h-4 w-4" />}
            />
            <CanvaStatCard
              label="Toplam Kullanım"
              value={stats.totalUsage.toLocaleString('tr-TR')}
              icon={<Users className="h-4 w-4" />}
            />
            <CanvaStatCard
              label="Ort. Dönüşüm"
              value={`%${stats.avgConversion}`}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <CanvaStatCard
              label="Toplam Gelir"
              value={formatCurrency(stats.totalRevenue, 'TRY')}
              icon={<DollarSign className="h-4 w-4" />}
            />
          </div>

          {/* Promo Codes List */}
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Promosyon Kodları</CanvaCardTitle>
              <CanvaCardSubtitle>
                Aktif ve geçmiş promosyon kodları
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="space-y-4">
                {promoCodes.map((promo) => (
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
                          <CanvaButton
                            variant="ghost"
                            size="xs"
                            iconOnly
                            aria-label="Kodu kopyala"
                            onClick={() => copyCode(promo.code)}
                          >
                            <Copy className="h-3 w-3" />
                          </CanvaButton>
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
                          <CanvaButton variant="ghost" size="sm" iconOnly>
                            <MoreHorizontal className="h-4 w-4" />
                          </CanvaButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            disabled
                            className="opacity-50 cursor-not-allowed"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Detaylar (Geliştiriliyor)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled
                            className="opacity-50 cursor-not-allowed"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Düzenle (Geliştiriliyor)
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => copyCode(promo.code)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Kopyala
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeletePromo(promo.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-6">
          {/* Referral Stats */}
          <div className="grid gap-4 md:grid-cols-5">
            <CanvaStatCard
              label="Toplam Referrer"
              value={referralStats.totalReferrers.toLocaleString('tr-TR')}
              icon={<Users className="h-4 w-4" />}
            />
            <CanvaStatCard
              label="Aktif"
              value={referralStats.activeReferrers.toLocaleString('tr-TR')}
              icon={<CheckCircle className="h-4 w-4" />}
            />
            <CanvaStatCard
              label="Toplam Referans"
              value={referralStats.totalReferrals.toLocaleString('tr-TR')}
              icon={<Share2 className="h-4 w-4" />}
            />
            <CanvaStatCard
              label="Başarı Oranı"
              value={`%${referralStats.successRate}`}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <CanvaStatCard
              label="Toplam Ödeme"
              value={formatCurrency(referralStats.totalPayout, 'TRY')}
              icon={<DollarSign className="h-4 w-4" />}
            />
          </div>

          {/* Top Referrers */}
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>En İyi Referrer'lar</CanvaCardTitle>
              <CanvaCardSubtitle>
                En çok referans yapan kullanıcılar
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="space-y-4">
                {referrals.map((referral, index) => (
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
            </CanvaCardBody>
          </CanvaCard>

          {/* Referral Program Settings */}
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Referans Programı Ayarları</CanvaCardTitle>
              <CanvaCardSubtitle>
                Referans ödül ve kurallarını yapılandırın
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Referrer Ödülü</Label>
                  <div className="flex items-center gap-2">
                    <CanvaInput
                      type="number"
                      value={referrerReward}
                      onChange={(e) => setReferrerReward(e.target.value)}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">₺</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Referred Ödülü</Label>
                  <div className="flex items-center gap-2">
                    <CanvaInput
                      type="number"
                      value={referredReward}
                      onChange={(e) => setReferredReward(e.target.value)}
                      className="w-24"
                    />
                    <span className="text-muted-foreground">₺</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Abuse Detection</p>
                  <p className="text-sm text-muted-foreground">
                    Kötüye kullanım tespiti ve otomatik engelleme
                  </p>
                </div>
                <CanvaBadge
                  variant="success"
                  icon={<CheckCircle className="h-3 w-3" />}
                >
                  Aktif
                </CanvaBadge>
              </div>
              <div className="flex justify-end">
                <CanvaButton
                  variant="primary"
                  onClick={handleSaveReferralSettings}
                  loading={updateReferralSettings.isPending}
                >
                  Ayarlari Kaydet
                </CanvaButton>
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  Megaphone,
  Plus,
  Mail,
  Bell,
  MessageSquare,
  TrendingUp,
  Users,
  Calendar,
  Play,
  Pause,
  BarChart3,
  Eye,
  Target,
  Clock,
  MoreHorizontal,
  Copy,
  Trash2,
  Edit,
  ChevronRight,
  CheckCircle,
  DollarSign,
  Loader2,
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
import {
  useCampaigns,
  useCreateCampaign,
  useUpdateCampaign,
} from '@/hooks/use-campaigns';

const campaignTypes = [
  {
    id: 'one_time',
    name: 'Tek Seferlik',
    description: 'Belirli tarihler arasında çalışır',
  },
  {
    id: 'recurring',
    name: 'Tekrarlayan',
    description: 'Haftalık/Aylık otomatik gönderim',
  },
  {
    id: 'automated',
    name: 'Otomatik',
    description: 'Tetikleyicilere göre çalışır',
  },
  {
    id: 'multi_channel',
    name: 'Çok Kanallı',
    description: 'Birden fazla kanal kombinasyonu',
  },
];

export default function CampaignsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignType, setNewCampaignType] = useState('email');

  // Use real API data
  const { data, isLoading, error } = useCampaigns({
    status: activeTab === 'all' ? undefined : activeTab,
  });
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  const campaigns = data?.campaigns || [];

  // Calculate stats from real data
  const overallStats = {
    totalCampaigns: data?.total || campaigns.length,
    activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
    totalReach: campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0),
    totalConversions: campaigns.reduce(
      (sum, c) => sum + (c.conversions || 0),
      0,
    ),
    totalRevenue: campaigns.reduce(
      (sum, c) => sum + ((c.budget || 0) - (c.spent || 0)),
      0,
    ),
    avgConversionRate:
      campaigns.length > 0
        ? (
            campaigns.reduce(
              (sum, c) =>
                sum +
                (c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0),
              0,
            ) / campaigns.length
          ).toFixed(1)
        : 0,
  };

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
      paused: { variant: 'outline', label: 'Duraklatıldı' },
      completed: { variant: 'outline', label: 'Tamamlandı' },
      draft: { variant: 'outline', label: 'Taslak' },
      cancelled: { variant: 'destructive', label: 'İptal' },
    };
    const { variant, label } = variants[status] || {
      variant: 'outline',
      label: status,
    };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getChannelIcon = (channel: string) => {
    const icons: Record<string, React.ReactNode> = {
      push: <Bell className="h-4 w-4" />,
      email: <Mail className="h-4 w-4" />,
      in_app: <MessageSquare className="h-4 w-4" />,
      social: <Users className="h-4 w-4" />,
      display: <Eye className="h-4 w-4" />,
    };
    return icons[channel] || <Megaphone className="h-4 w-4" />;
  };

  const getCampaignTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      one_time: 'Tek Seferlik',
      recurring: 'Tekrarlayan',
      automated: 'Otomatik',
      multi_channel: 'Çok Kanallı',
      email: 'E-posta',
      push: 'Push',
      social: 'Sosyal',
      display: 'Display',
    };
    return labels[type] || type;
  };

  const handleCreateCampaign = () => {
    if (!newCampaignName) {
      toast.error('Kampanya adı gerekli');
      return;
    }

    createCampaign.mutate(
      {
        name: newCampaignName,
        type: newCampaignType as 'email' | 'push' | 'social' | 'display',
        status: 'draft',
      },
      {
        onSuccess: () => {
          toast.success('Kampanya oluşturuldu');
          setIsCreateOpen(false);
          setNewCampaignName('');
        },
        onError: (error) => {
          toast.error(error.message || 'Kampanya oluşturulamadı');
        },
      },
    );
  };

  const handlePauseCampaign = (campaignId: string) => {
    updateCampaign.mutate(
      { id: campaignId, status: 'paused' },
      {
        onSuccess: () => {
          toast.success('Kampanya duraklatıldı');
        },
        onError: (error) => {
          toast.error(error.message || 'İşlem başarısız');
        },
      },
    );
  };

  const handleResumeCampaign = (campaignId: string) => {
    updateCampaign.mutate(
      { id: campaignId, status: 'active' },
      {
        onSuccess: () => {
          toast.success('Kampanya devam etti');
        },
        onError: (error) => {
          toast.error(error.message || 'İşlem başarısız');
        },
      },
    );
  };

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">Bir hata oluştu</h2>
          <p className="text-muted-foreground">
            Kampanyalar yüklenemedi. Lütfen tekrar deneyin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Kampanya Yönetimi
          </h1>
          <p className="text-muted-foreground">
            Pazarlama kampanyalarını oluştur, yönet ve performansı takip et
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kampanya
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Kampanya Oluştur</DialogTitle>
              <DialogDescription>
                Kampanya tipini ve detaylarını belirleyin
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Campaign Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Kampanya Adı</Label>
                <Input
                  id="name"
                  placeholder="Kampanya adını girin..."
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                />
              </div>

              {/* Campaign Type Selection */}
              <div className="space-y-2">
                <Label>Kampanya Tipi</Label>
                <Select
                  value={newCampaignType}
                  onValueChange={setNewCampaignType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">E-posta</SelectItem>
                    <SelectItem value="push">Push Bildirim</SelectItem>
                    <SelectItem value="social">Sosyal Medya</SelectItem>
                    <SelectItem value="display">Display</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Segment */}
              <div className="space-y-2">
                <Label>Hedef Segment</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Segment seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_users">Tüm Kullanıcılar</SelectItem>
                    <SelectItem value="free_users">Ücretsiz Üyeler</SelectItem>
                    <SelectItem value="premium_users">
                      Premium Üyeler
                    </SelectItem>
                    <SelectItem value="new_users">Yeni Üyeler</SelectItem>
                    <SelectItem value="inactive_users">
                      Pasif Kullanıcılar
                    </SelectItem>
                  </SelectContent>
                </Select>
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

              {/* Budget */}
              <div className="space-y-2">
                <Label>Bütçe (Opsiyonel)</Label>
                <Input type="number" placeholder="₺0" />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                İptal
              </Button>
              <Button
                onClick={handleCreateCampaign}
                disabled={createCampaign.isPending}
              >
                {createCampaign.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <ChevronRight className="mr-2 h-4 w-4" />
                Oluştur
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                ) : (
                  overallStats.totalCampaigns
                )}
              </p>
              <p className="text-sm text-muted-foreground">Toplam Kampanya</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {isLoading ? (
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                ) : (
                  overallStats.activeCampaigns
                )}
              </p>
              <p className="text-sm text-muted-foreground">Aktif</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                ) : (
                  `${(overallStats.totalReach / 1000).toFixed(0)}K`
                )}
              </p>
              <p className="text-sm text-muted-foreground">Toplam Erişim</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                ) : (
                  overallStats.totalConversions.toLocaleString('tr-TR')
                )}
              </p>
              <p className="text-sm text-muted-foreground">Dönüşüm</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                %{overallStats.avgConversionRate}
              </p>
              <p className="text-sm text-muted-foreground">Ort. Dönüşüm</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {isLoading ? (
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                ) : (
                  formatCurrency(
                    campaigns.reduce((sum, c) => sum + (c.spent || 0), 0),
                    'TRY',
                  )
                )}
              </p>
              <p className="text-sm text-muted-foreground">Harcama</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="active">Aktif</TabsTrigger>
          <TabsTrigger value="draft">Taslak</TabsTrigger>
          <TabsTrigger value="paused">Duraklatıldı</TabsTrigger>
          <TabsTrigger value="completed">Tamamlandı</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-12 text-center">
              <Megaphone className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                Kampanya bulunamadı
              </h3>
              <p className="text-muted-foreground">
                Yeni bir kampanya oluşturarak başlayın
              </p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Megaphone className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{campaign.name}</h3>
                          {getStatusBadge(campaign.status)}
                          <Badge variant="outline">
                            {getCampaignTypeLabel(campaign.type)}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(campaign.start_date)}
                            {campaign.end_date &&
                              ` - ${formatDate(campaign.end_date)}`}
                          </span>
                        </div>

                        {/* Budget Progress */}
                        {campaign.budget && campaign.budget > 0 && (
                          <div className="space-y-1 max-w-xs">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Bütçe
                              </span>
                              <span>
                                {formatCurrency(campaign.spent || 0, 'TRY')} /{' '}
                                {formatCurrency(campaign.budget, 'TRY')}
                              </span>
                            </div>
                            <Progress
                              value={
                                ((campaign.spent || 0) / campaign.budget) * 100
                              }
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Stats */}
                      {campaign.impressions > 0 && (
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-semibold">
                              {(campaign.impressions / 1000).toFixed(1)}K
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Görüntüleme
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">
                              {(
                                (campaign.clicks / campaign.impressions) *
                                100
                              ).toFixed(1)}
                              %
                            </p>
                            <p className="text-xs text-muted-foreground">CTR</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold">
                              {campaign.conversions.toLocaleString('tr-TR')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Dönüşüm
                            </p>
                          </div>
                        </div>
                      )}

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
                            Detayları Gör
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Analiz
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
                          {campaign.status === 'active' && (
                            <DropdownMenuItem
                              onClick={() => handlePauseCampaign(campaign.id)}
                            >
                              <Pause className="mr-2 h-4 w-4" />
                              Duraklat
                            </DropdownMenuItem>
                          )}
                          {campaign.status === 'paused' && (
                            <DropdownMenuItem
                              onClick={() => handleResumeCampaign(campaign.id)}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Devam Et
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

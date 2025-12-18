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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
const mockCampaigns = [
  {
    id: '1',
    name: 'Yılbaşı Premium Kampanyası',
    type: 'multi_channel',
    status: 'active',
    channels: ['push', 'email', 'in_app'],
    segment: 'free_users',
    start_date: '2024-12-15T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    goal: 'Conversion',
    budget: 5000,
    spent: 2340,
    stats: {
      reach: 45000,
      impressions: 128000,
      clicks: 8900,
      conversions: 456,
      revenue: 68400,
    },
  },
  {
    id: '2',
    name: 'Haftalık Moment Hatırlatma',
    type: 'recurring',
    status: 'active',
    channels: ['push'],
    segment: 'inactive_creators',
    start_date: '2024-12-01T00:00:00Z',
    end_date: null,
    goal: 'Engagement',
    budget: null,
    spent: 0,
    stats: {
      reach: 8500,
      impressions: 24000,
      clicks: 2100,
      conversions: 890,
      revenue: 0,
    },
  },
  {
    id: '3',
    name: 'Yeni Kullanıcı Onboarding',
    type: 'automated',
    status: 'active',
    channels: ['email', 'in_app'],
    segment: 'new_users',
    start_date: '2024-11-01T00:00:00Z',
    end_date: null,
    goal: 'Activation',
    budget: null,
    spent: 0,
    stats: {
      reach: 12400,
      impressions: 37200,
      clicks: 5600,
      conversions: 3200,
      revenue: 0,
    },
  },
  {
    id: '4',
    name: 'Kış Seyahati Kampanyası',
    type: 'one_time',
    status: 'scheduled',
    channels: ['push', 'email'],
    segment: 'all_users',
    start_date: '2024-12-20T10:00:00Z',
    end_date: '2024-12-25T23:59:59Z',
    goal: 'Awareness',
    budget: 3000,
    spent: 0,
    stats: null,
  },
  {
    id: '5',
    name: 'Black Friday Promosyonu',
    type: 'one_time',
    status: 'completed',
    channels: ['push', 'email', 'in_app'],
    segment: 'all_users',
    start_date: '2024-11-24T00:00:00Z',
    end_date: '2024-11-27T23:59:59Z',
    goal: 'Conversion',
    budget: 10000,
    spent: 8750,
    stats: {
      reach: 125000,
      impressions: 450000,
      clicks: 32000,
      conversions: 2800,
      revenue: 420000,
    },
  },
];

const campaignTypes = [
  { id: 'one_time', name: 'Tek Seferlik', description: 'Belirli tarihler arasında çalışır' },
  { id: 'recurring', name: 'Tekrarlayan', description: 'Haftalık/Aylık otomatik gönderim' },
  { id: 'automated', name: 'Otomatik', description: 'Tetikleyicilere göre çalışır' },
  { id: 'multi_channel', name: 'Çok Kanallı', description: 'Birden fazla kanal kombinasyonu' },
];

const overallStats = {
  totalCampaigns: 12,
  activeCampaigns: 3,
  totalReach: 245000,
  totalConversions: 7346,
  totalRevenue: 488400,
  avgConversionRate: 3.2,
};

export default function CampaignsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      active: { variant: 'default', label: 'Aktif' },
      scheduled: { variant: 'secondary', label: 'Zamanlandı' },
      paused: { variant: 'outline', label: 'Duraklatıldı' },
      completed: { variant: 'outline', label: 'Tamamlandı' },
      draft: { variant: 'outline', label: 'Taslak' },
    };
    const { variant, label } = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getChannelIcon = (channel: string) => {
    const icons: Record<string, React.ReactNode> = {
      push: <Bell className="h-4 w-4" />,
      email: <Mail className="h-4 w-4" />,
      in_app: <MessageSquare className="h-4 w-4" />,
    };
    return icons[channel];
  };

  const getCampaignTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      one_time: 'Tek Seferlik',
      recurring: 'Tekrarlayan',
      automated: 'Otomatik',
      multi_channel: 'Çok Kanallı',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kampanya Yönetimi</h1>
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
              {/* Campaign Type Selection */}
              <div className="space-y-2">
                <Label>Kampanya Tipi</Label>
                <div className="grid gap-4 md:grid-cols-2">
                  {campaignTypes.map((type) => (
                    <div
                      key={type.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 hover:border-primary hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Megaphone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{type.name}</p>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campaign Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Kampanya Adı</Label>
                <Input id="name" placeholder="Kampanya adını girin..." />
              </div>

              {/* Channels */}
              <div className="space-y-2">
                <Label>Kanallar</Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Bell className="h-4 w-4" />
                    Push Bildirim
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Mail className="h-4 w-4" />
                    E-posta
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    In-App Mesaj
                  </Button>
                </div>
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
                    <SelectItem value="premium_users">Premium Üyeler</SelectItem>
                    <SelectItem value="new_users">Yeni Üyeler</SelectItem>
                    <SelectItem value="inactive_users">Pasif Kullanıcılar</SelectItem>
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
              <Button onClick={() => { toast.success('Kampanya oluşturuldu'); setIsCreateOpen(false); }}>
                <ChevronRight className="mr-2 h-4 w-4" />
                Sonraki Adım
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
              <p className="text-2xl font-bold">{overallStats.totalCampaigns}</p>
              <p className="text-sm text-muted-foreground">Toplam Kampanya</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{overallStats.activeCampaigns}</p>
              <p className="text-sm text-muted-foreground">Aktif</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {(overallStats.totalReach / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-muted-foreground">Toplam Erişim</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {overallStats.totalConversions.toLocaleString('tr-TR')}
              </p>
              <p className="text-sm text-muted-foreground">Dönüşüm</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">%{overallStats.avgConversionRate}</p>
              <p className="text-sm text-muted-foreground">Ort. Dönüşüm</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(overallStats.totalRevenue, 'TRY')}
              </p>
              <p className="text-sm text-muted-foreground">Toplam Gelir</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="active">Aktif</TabsTrigger>
          <TabsTrigger value="scheduled">Zamanlandı</TabsTrigger>
          <TabsTrigger value="completed">Tamamlandı</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {mockCampaigns.map((campaign) => (
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
                        <Badge variant="outline">{getCampaignTypeLabel(campaign.type)}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {campaign.goal}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(campaign.start_date)}
                          {campaign.end_date && ` - ${formatDate(campaign.end_date)}`}
                        </span>
                      </div>

                      {/* Channels */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Kanallar:</span>
                        {campaign.channels.map((channel) => (
                          <Badge key={channel} variant="secondary" className="gap-1">
                            {getChannelIcon(channel)}
                            {channel === 'push' && 'Push'}
                            {channel === 'email' && 'E-posta'}
                            {channel === 'in_app' && 'In-App'}
                          </Badge>
                        ))}
                      </div>

                      {/* Budget Progress */}
                      {campaign.budget && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Bütçe</span>
                            <span>
                              {formatCurrency(campaign.spent, 'TRY')} / {formatCurrency(campaign.budget, 'TRY')}
                            </span>
                          </div>
                          <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Stats */}
                    {campaign.stats && (
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-semibold">
                            {(campaign.stats.reach / 1000).toFixed(1)}K
                          </p>
                          <p className="text-xs text-muted-foreground">Erişim</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">
                            {((campaign.stats.clicks / campaign.stats.impressions) * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">CTR</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">
                            {campaign.stats.conversions.toLocaleString('tr-TR')}
                          </p>
                          <p className="text-xs text-muted-foreground">Dönüşüm</p>
                        </div>
                        {campaign.stats.revenue > 0 && (
                          <div className="text-center">
                            <p className="font-semibold text-green-600">
                              {formatCurrency(campaign.stats.revenue, 'TRY')}
                            </p>
                            <p className="text-xs text-muted-foreground">Gelir</p>
                          </div>
                        )}
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
                          <DropdownMenuItem>
                            <Pause className="mr-2 h-4 w-4" />
                            Duraklat
                          </DropdownMenuItem>
                        )}
                        {campaign.status === 'paused' && (
                          <DropdownMenuItem>
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
          ))}
        </TabsContent>

        <TabsContent value="active">
          {mockCampaigns
            .filter((c) => c.status === 'active')
            .map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getCampaignTypeLabel(campaign.type)}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="scheduled">
          {mockCampaigns
            .filter((c) => c.status === 'scheduled')
            .map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Başlangıç: {formatDate(campaign.start_date)}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="completed">
          {mockCampaigns
            .filter((c) => c.status === 'completed')
            .map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <CheckCircle className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(campaign.start_date)} - {formatDate(campaign.end_date!)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {campaign.stats && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            {formatCurrency(campaign.stats.revenue, 'TRY')}
                          </span>
                        </div>
                      )}
                      {getStatusBadge(campaign.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

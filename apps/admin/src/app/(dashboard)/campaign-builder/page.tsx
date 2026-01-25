'use client';

/**
 * Notification Campaign Builder
 * Advanced campaign management for Push, In-App, Email, SMS
 * With A/B testing, scheduling, and targeting
 */

import { useState } from 'react';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Plus,
  Play,
  Pause,
  BarChart3,
  Users,
  Target,
  Calendar,
  Clock,
  Zap,
  Copy,
  Trash2,
  Edit,
  Eye,
  Send,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Globe,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Campaign stats
const campaignStats = {
  totalCampaigns: 47,
  activeCampaigns: 12,
  totalSent: 2847500,
  avgOpenRate: 34.2,
  avgClickRate: 8.7,
  avgConversionRate: 2.3,
};

// Channel stats
const channelStats = [
  {
    channel: 'Push',
    icon: Bell,
    sent: 1245000,
    delivered: 1198000,
    opened: 412000,
    clicked: 98000,
    color: 'bg-blue-500',
  },
  {
    channel: 'Email',
    icon: Mail,
    sent: 892000,
    delivered: 845000,
    opened: 287000,
    clicked: 78000,
    color: 'bg-green-500',
  },
  {
    channel: 'In-App',
    icon: Smartphone,
    sent: 456000,
    delivered: 456000,
    opened: 234000,
    clicked: 89000,
    color: 'bg-purple-500',
  },
  {
    channel: 'SMS',
    icon: MessageSquare,
    sent: 254500,
    delivered: 248000,
    opened: 198000,
    clicked: 45000,
    color: 'bg-orange-500',
  },
];

// Active campaigns
const activeCampaigns = [
  {
    id: 'camp-001',
    name: 'Yeni Yıl Kampanyası',
    channel: 'Push',
    status: 'active',
    audience: 125000,
    sent: 87500,
    opened: 32000,
    clicked: 8500,
    startDate: '2026-01-01',
    endDate: '2026-01-15',
    abTest: true,
  },
  {
    id: 'camp-002',
    name: 'Premium Upgrade Hatırlatma',
    channel: 'Email',
    status: 'active',
    audience: 45000,
    sent: 45000,
    opened: 18500,
    clicked: 4200,
    startDate: '2026-01-05',
    endDate: '2026-01-20',
    abTest: false,
  },
  {
    id: 'camp-003',
    name: 'İlk Rezervasyon Teşviki',
    channel: 'In-App',
    status: 'active',
    audience: 28000,
    sent: 28000,
    opened: 15400,
    clicked: 6700,
    startDate: '2026-01-08',
    endDate: '2026-01-25',
    abTest: true,
  },
  {
    id: 'camp-004',
    name: 'Doğrulama Hatırlatma SMS',
    channel: 'SMS',
    status: 'paused',
    audience: 12500,
    sent: 8200,
    opened: 7800,
    clicked: 2100,
    startDate: '2026-01-10',
    endDate: '2026-01-30',
    abTest: false,
  },
  {
    id: 'camp-005',
    name: 'Referral Programı Launch',
    channel: 'Push',
    status: 'scheduled',
    audience: 200000,
    sent: 0,
    opened: 0,
    clicked: 0,
    startDate: '2026-01-15',
    endDate: '2026-02-15',
    abTest: true,
  },
];

// Audience segments
const audienceSegments = [
  { id: 'seg-1', name: 'Tüm Kullanıcılar', count: 245000, icon: Users },
  { id: 'seg-2', name: 'Premium Üyeler', count: 45000, icon: Sparkles },
  { id: 'seg-3', name: 'Yeni Kayıtlar (7 gün)', count: 8500, icon: Zap },
  { id: 'seg-4', name: 'Inaktif (30+ gün)', count: 32000, icon: Clock },
  { id: 'seg-5', name: 'Host Kullanıcılar', count: 12000, icon: Globe },
  { id: 'seg-6', name: 'Yüksek Değer', count: 5600, icon: TrendingUp },
];

// Templates
const templates = [
  {
    id: 'tpl-1',
    name: 'Hoş Geldin Serisi',
    channel: 'Email',
    usage: 45000,
    openRate: 42.3,
  },
  {
    id: 'tpl-2',
    name: 'Rezervasyon Onayı',
    channel: 'Push',
    usage: 128000,
    openRate: 78.5,
  },
  {
    id: 'tpl-3',
    name: 'Ödeme Hatırlatma',
    channel: 'SMS',
    usage: 23000,
    openRate: 92.1,
  },
  {
    id: 'tpl-4',
    name: 'Yeni Özellik Duyurusu',
    channel: 'In-App',
    usage: 89000,
    openRate: 56.7,
  },
];

// A/B Test results
const abTests = [
  {
    id: 'ab-1',
    campaign: 'Yeni Yıl Kampanyası',
    variantA: { name: 'Emoji Başlık', sent: 43750, opened: 17500, rate: 40.0 },
    variantB: { name: 'Düz Başlık', sent: 43750, opened: 14500, rate: 33.1 },
    winner: 'A',
    confidence: 95.2,
  },
  {
    id: 'ab-2',
    campaign: 'İlk Rezervasyon Teşviki',
    variantA: { name: '%20 İndirim', sent: 14000, opened: 7200, rate: 51.4 },
    variantB: {
      name: 'Ücretsiz Deneme',
      sent: 14000,
      opened: 8200,
      rate: 58.6,
    },
    winner: 'B',
    confidence: 89.7,
  },
];

export default function CampaignBuilderPage() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('push');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <CanvaBadge className="bg-green-500/10 dark:bg-green-500/20 text-green-500 dark:text-green-400 border-green-500/20">
            <Play className="h-3 w-3 mr-1" />
            Aktif
          </CanvaBadge>
        );
      case 'paused':
        return (
          <CanvaBadge className="bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-500 dark:text-yellow-400 border-yellow-500/20">
            <Pause className="h-3 w-3 mr-1" />
            Duraklatıldı
          </CanvaBadge>
        );
      case 'scheduled':
        return (
          <CanvaBadge className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 dark:text-blue-400 border-blue-500/20">
            <Calendar className="h-3 w-3 mr-1" />
            Zamanlandı
          </CanvaBadge>
        );
      case 'completed':
        return (
          <CanvaBadge className="bg-muted text-muted-foreground border-border">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Tamamlandı
          </CanvaBadge>
        );
      default:
        return <CanvaBadge variant="default">{status}</CanvaBadge>;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'Push':
        return <Bell className="h-4 w-4" />;
      case 'Email':
        return <Mail className="h-4 w-4" />;
      case 'In-App':
        return <Smartphone className="h-4 w-4" />;
      case 'SMS':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kampanya Merkezi</h1>
          <p className="text-muted-foreground">
            Push, Email, In-App ve SMS kampanyaları yönetin
          </p>
        </div>
        <Dialog open={showNewCampaign} onOpenChange={setShowNewCampaign}>
          <DialogTrigger asChild>
            <CanvaButton>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Kampanya
            </CanvaButton>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Kampanya Oluştur</DialogTitle>
              <DialogDescription>
                Hedef kitlenize ulaşmak için yeni bir kampanya oluşturun
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Channel Selection */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { id: 'push', icon: Bell, label: 'Push' },
                  { id: 'email', icon: Mail, label: 'Email' },
                  { id: 'in-app', icon: Smartphone, label: 'In-App' },
                  { id: 'sms', icon: MessageSquare, label: 'SMS' },
                ].map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                      selectedChannel === channel.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50',
                    )}
                  >
                    <channel.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{channel.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Kampanya Adı</Label>
                <Input placeholder="Kampanya adını girin" />
              </div>

              <div className="space-y-2">
                <Label>Hedef Kitle</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Segment seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {audienceSegments.map((seg) => (
                      <SelectItem key={seg.id} value={seg.id}>
                        {seg.name} ({formatNumber(seg.count)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Başlık</Label>
                  <Input placeholder="Bildirim başlığı" />
                </div>
                <div className="space-y-2">
                  <Label>Zamanlama</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Hemen gönder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">Hemen Gönder</SelectItem>
                      <SelectItem value="scheduled">Zamanla</SelectItem>
                      <SelectItem value="recurring">Tekrarlayan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mesaj İçeriği</Label>
                <Textarea
                  placeholder="Bildirim mesajınızı yazın..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">A/B Testi</span>
                </div>
                <Switch />
              </div>
            </div>
            <DialogFooter>
              <CanvaButton
                variant="outline"
                onClick={() => setShowNewCampaign(false)}
              >
                İptal
              </CanvaButton>
              <CanvaButton>
                <Send className="h-4 w-4 mr-2" />
                Kampanya Oluştur
              </CanvaButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-6 gap-4">
        <CanvaStatCard
          label="Toplam Kampanya"
          value={campaignStats.totalCampaigns}
          icon={<Layers className="h-5 w-5 text-primary" />}
        />
        <CanvaStatCard
          label="Aktif"
          value={campaignStats.activeCampaigns}
          icon={<Play className="h-5 w-5 text-green-500 dark:text-green-400" />}
        />
        <CanvaStatCard
          label="Toplam Gönderim"
          value={formatNumber(campaignStats.totalSent)}
          icon={<Send className="h-5 w-5 text-blue-500 dark:text-blue-400" />}
        />
        <CanvaStatCard
          label="Ort. Açılma"
          value={`${campaignStats.avgOpenRate}%`}
          icon={
            <Eye className="h-5 w-5 text-purple-500 dark:text-purple-400" />
          }
        />
        <CanvaStatCard
          label="Ort. Tıklama"
          value={`${campaignStats.avgClickRate}%`}
          icon={
            <Target className="h-5 w-5 text-orange-500 dark:text-orange-400" />
          }
        />
        <CanvaStatCard
          label="Ort. Dönüşüm"
          value={`${campaignStats.avgConversionRate}%`}
          icon={
            <TrendingUp className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
          }
        />
      </div>

      {/* Channel Performance */}
      <div className="grid grid-cols-4 gap-4">
        {channelStats.map((channel) => (
          <CanvaCard key={channel.channel}>
            <CanvaCardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn('p-2 rounded-lg', channel.color + '/10')}>
                    <channel.icon
                      className={cn(
                        'h-5 w-5',
                        channel.color.replace('bg-', 'text-'),
                      )}
                    />
                  </div>
                  <CanvaCardTitle className="text-base">
                    {channel.channel}
                  </CanvaCardTitle>
                </div>
              </div>
            </CanvaCardHeader>
            <CanvaCardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Gönderildi</p>
                  <p className="font-semibold">{formatNumber(channel.sent)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Teslim</p>
                  <p className="font-semibold">
                    {formatNumber(channel.delivered)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Açıldı</p>
                  <p className="font-semibold">
                    {formatNumber(channel.opened)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tıklandı</p>
                  <p className="font-semibold">
                    {formatNumber(channel.clicked)}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Açılma Oranı</span>
                  <span className="font-medium">
                    {((channel.opened / channel.delivered) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={(channel.opened / channel.delivered) * 100}
                  className="h-1.5"
                />
              </div>
            </CanvaCardBody>
          </CanvaCard>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns">
            <Layers className="h-4 w-4 mr-2" />
            Kampanyalar
          </TabsTrigger>
          <TabsTrigger value="segments">
            <Users className="h-4 w-4 mr-2" />
            Segmentler
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Copy className="h-4 w-4 mr-2" />
            Şablonlar
          </TabsTrigger>
          <TabsTrigger value="ab-tests">
            <Layers className="h-4 w-4 mr-2" />
            A/B Testleri
          </TabsTrigger>
          <TabsTrigger value="automation">
            <Zap className="h-4 w-4 mr-2" />
            Otomasyon
          </TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <div className="flex items-center justify-between">
                <CanvaCardTitle>
                  Aktif ve Zamanlanmış Kampanyalar
                </CanvaCardTitle>
                <div className="flex gap-2">
                  <CanvaButton variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrele
                  </CanvaButton>
                </div>
              </div>
            </CanvaCardHeader>
            <CanvaCardBody>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kampanya</TableHead>
                    <TableHead>Kanal</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Hedef Kitle</TableHead>
                    <TableHead>Gönderildi</TableHead>
                    <TableHead>Açılma</TableHead>
                    <TableHead>Tıklama</TableHead>
                    <TableHead>Tarih Aralığı</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{campaign.name}</span>
                          {campaign.abTest && (
                            <CanvaBadge
                              variant="default"
                              className="text-xs bg-purple-500/10 dark:bg-purple-500/20 text-purple-500 dark:text-purple-400 border-purple-500/20"
                            >
                              A/B
                            </CanvaBadge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChannelIcon(campaign.channel)}
                          <span>{campaign.channel}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>{formatNumber(campaign.audience)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p>{formatNumber(campaign.sent)}</p>
                          <Progress
                            value={(campaign.sent / campaign.audience) * 100}
                            className="h-1 w-16"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {campaign.sent > 0
                          ? `${((campaign.opened / campaign.sent) * 100).toFixed(1)}%`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {campaign.opened > 0
                          ? `${((campaign.clicked / campaign.opened) * 100).toFixed(1)}%`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {campaign.startDate} → {campaign.endDate}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <CanvaButton variant="ghost" size="sm" iconOnly>
                            <BarChart3 className="h-4 w-4" />
                          </CanvaButton>
                          {campaign.status === 'active' ? (
                            <CanvaButton variant="ghost" size="sm" iconOnly>
                              <Pause className="h-4 w-4" />
                            </CanvaButton>
                          ) : (
                            <CanvaButton variant="ghost" size="sm" iconOnly>
                              <Play className="h-4 w-4" />
                            </CanvaButton>
                          )}
                          <CanvaButton variant="ghost" size="sm" iconOnly>
                            <Edit className="h-4 w-4" />
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

        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {audienceSegments.map((segment) => (
              <CanvaCard key={segment.id}>
                <CanvaCardBody className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <segment.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{segment.name}</p>
                        <p className="text-2xl font-bold">
                          {formatNumber(segment.count)}
                        </p>
                      </div>
                    </div>
                    <CanvaButton variant="outline" size="sm">
                      <Send className="h-3 w-3 mr-1" />
                      Kampanya
                    </CanvaButton>
                  </div>
                </CanvaCardBody>
              </CanvaCard>
            ))}
          </div>

          <CanvaCard>
            <CanvaCardHeader>
              <div className="flex items-center justify-between">
                <CanvaCardTitle>Özel Segment Oluştur</CanvaCardTitle>
                <CanvaButton>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Segment
                </CanvaButton>
              </div>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-medium">Davranış Bazlı</h4>
                  <p className="text-sm text-muted-foreground">
                    Son giriş, aktivite, tamamlanan rezervasyon sayısı
                  </p>
                </div>
                <div className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-medium">Demografik</h4>
                  <p className="text-sm text-muted-foreground">
                    Yaş, konum, dil tercihi, üyelik süresi
                  </p>
                </div>
                <div className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-medium">Değer Bazlı</h4>
                  <p className="text-sm text-muted-foreground">
                    Toplam harcama, LTV, abonelik tipi
                  </p>
                </div>
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <div className="flex items-center justify-between">
                <CanvaCardTitle>Mesaj Şablonları</CanvaCardTitle>
                <CanvaButton>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Şablon
                </CanvaButton>
              </div>
            </CanvaCardHeader>
            <CanvaCardBody>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Şablon Adı</TableHead>
                    <TableHead>Kanal</TableHead>
                    <TableHead>Kullanım</TableHead>
                    <TableHead>Açılma Oranı</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">
                        {template.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChannelIcon(template.channel)}
                          {template.channel}
                        </div>
                      </TableCell>
                      <TableCell>{formatNumber(template.usage)}</TableCell>
                      <TableCell>
                        <CanvaBadge
                          variant="default"
                          className={cn(
                            template.openRate > 70
                              ? 'bg-green-500/10 dark:bg-green-500/20 text-green-500 dark:text-green-400'
                              : template.openRate > 40
                                ? 'bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-500 dark:text-yellow-400'
                                : 'bg-red-500/10 dark:bg-red-500/20 text-red-500 dark:text-red-400',
                          )}
                        >
                          {template.openRate}%
                        </CanvaBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <CanvaButton variant="ghost" size="sm" iconOnly>
                            <Eye className="h-4 w-4" />
                          </CanvaButton>
                          <CanvaButton variant="ghost" size="sm" iconOnly>
                            <Copy className="h-4 w-4" />
                          </CanvaButton>
                          <CanvaButton variant="ghost" size="sm" iconOnly>
                            <Edit className="h-4 w-4" />
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

        {/* A/B Tests Tab */}
        <TabsContent value="ab-tests" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>A/B Test Sonuçları</CanvaCardTitle>
              <CanvaCardSubtitle>
                Kampanyalarınızın performansını karşılaştırın
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody className="space-y-6">
              {abTests.map((test) => (
                <div key={test.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{test.campaign}</h4>
                      <p className="text-sm text-muted-foreground">
                        Güven Düzeyi: {test.confidence}%
                      </p>
                    </div>
                    <CanvaBadge className="bg-green-500/10 dark:bg-green-500/20 text-green-500 dark:text-green-400 border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Kazanan: Varyant {test.winner}
                    </CanvaBadge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={cn(
                        'p-3 rounded-lg border-2',
                        test.winner === 'A'
                          ? 'border-green-500 bg-green-500/5'
                          : 'border-border',
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Varyant A</span>
                        <span className="text-sm text-muted-foreground">
                          {test.variantA.name}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Gönderildi</p>
                          <p className="font-semibold">
                            {formatNumber(test.variantA.sent)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Açıldı</p>
                          <p className="font-semibold">
                            {formatNumber(test.variantA.opened)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Oran</p>
                          <p className="font-semibold">{test.variantA.rate}%</p>
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'p-3 rounded-lg border-2',
                        test.winner === 'B'
                          ? 'border-green-500 bg-green-500/5'
                          : 'border-border',
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Varyant B</span>
                        <span className="text-sm text-muted-foreground">
                          {test.variantB.name}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Gönderildi</p>
                          <p className="font-semibold">
                            {formatNumber(test.variantB.sent)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Açıldı</p>
                          <p className="font-semibold">
                            {formatNumber(test.variantB.opened)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Oran</p>
                          <p className="font-semibold">{test.variantB.rate}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Otomatik Akışlar</CanvaCardTitle>
                <CanvaCardSubtitle>
                  Tetikleyici bazlı otomatik mesajlar
                </CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody className="space-y-3">
                {[
                  {
                    name: 'Hoş Geldin Serisi',
                    trigger: 'Yeni Kayıt',
                    status: 'active',
                    sent: 45000,
                  },
                  {
                    name: 'Sepet Terk Hatırlatma',
                    trigger: 'Checkout Terk',
                    status: 'active',
                    sent: 12500,
                  },
                  {
                    name: 'Re-Engagement',
                    trigger: '30 Gün İnaktif',
                    status: 'active',
                    sent: 8700,
                  },
                  {
                    name: 'Doğum Günü',
                    trigger: 'Doğum Günü',
                    status: 'paused',
                    sent: 3200,
                  },
                ].map((flow) => (
                  <div
                    key={flow.name}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          flow.status === 'active'
                            ? 'bg-green-500'
                            : 'bg-yellow-500',
                        )}
                      />
                      <div>
                        <p className="font-medium">{flow.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Tetikleyici: {flow.trigger}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatNumber(flow.sent)}</p>
                      <p className="text-xs text-muted-foreground">
                        gönderildi
                      </p>
                    </div>
                  </div>
                ))}
              </CanvaCardBody>
            </CanvaCard>

            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Zamanlama Ayarları</CanvaCardTitle>
                <CanvaCardSubtitle>
                  Optimal gönderim zamanları
                </CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody className="space-y-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Akıllı Zamanlama</span>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI, her kullanıcı için en uygun gönderim zamanını belirler
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">En İyi Saatler</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {['09:00', '12:00', '18:00', '21:00'].map((time) => (
                      <div
                        key={time}
                        className="p-2 text-center bg-primary/10 rounded text-sm font-medium"
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Frekans Limitleri</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Push:</span> Max
                      3/gün
                    </div>
                    <div className="p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">Email:</span> Max
                      2/hafta
                    </div>
                    <div className="p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">SMS:</span> Max
                      2/hafta
                    </div>
                    <div className="p-2 bg-muted/30 rounded">
                      <span className="text-muted-foreground">In-App:</span> Max
                      5/gün
                    </div>
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

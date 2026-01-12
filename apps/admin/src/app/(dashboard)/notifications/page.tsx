'use client';

import { useState } from 'react';
import {
  Bell,
  Send,
  Users,
  Clock,
  Target,
  BarChart3,
  Plus,
  Play,
  Pause,
  Trash2,
  Copy,
  Eye,
  Calendar,
  Filter,
  MoreHorizontal,
  Smartphone,
  CheckCircle,
  XCircle,
  TrendingUp,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import {
  useNotifications,
  useCreateNotification,
  useSendNotification,
} from '@/hooks/use-notifications';
import { Loader2, AlertTriangle } from 'lucide-react';

// Fallback mock data (will be replaced by API data when available)
const mockNotifications = [
  {
    id: '1',
    title: 'Yeni Eşleşme Fırsatı! 🎉',
    body: 'Yakınında 5 yeni gezgin seni bekliyor. Şimdi keşfet!',
    segment: 'active_users',
    status: 'sent',
    sent_at: '2024-12-18T10:00:00Z',
    stats: {
      sent: 12450,
      delivered: 11890,
      opened: 4520,
      clicked: 1230,
    },
  },
  {
    id: '2',
    title: "Premium'a Özel İndirim 💎",
    body: 'Sadece bugün! Premium üyeliğe %30 indirimle geç.',
    segment: 'free_users',
    status: 'scheduled',
    scheduled_for: '2024-12-19T12:00:00Z',
    stats: null,
  },
  {
    id: '3',
    title: 'Haftalık Moment Özeti',
    body: 'Bu hafta 1.2M görüntülenme aldın! İstatistiklerini gör.',
    segment: 'creators',
    status: 'draft',
    stats: null,
  },
];

const mockSegments = [
  { id: 'all', name: 'Tüm Kullanıcılar', count: 125000 },
  { id: 'active_users', name: 'Aktif Kullanıcılar (Son 7 gün)', count: 45000 },
  { id: 'inactive_users', name: 'Pasif Kullanıcılar (30+ gün)', count: 32000 },
  { id: 'free_users', name: 'Ücretsiz Üyeler', count: 98000 },
  { id: 'premium_users', name: 'Premium Üyeler', count: 27000 },
  { id: 'creators', name: 'İçerik Üreticileri', count: 8500 },
  { id: 'new_users', name: 'Yeni Üyeler (Son 7 gün)', count: 3200 },
];

const mockTemplates = [
  {
    id: '1',
    name: 'Hoş Geldin',
    title: "TravelMatch'e Hoş Geldin! 🌍",
    body: 'Seyahat arkadaşını bulmaya hazır mısın?',
  },
  {
    id: '2',
    name: 'Yeni Eşleşme',
    title: 'Yeni bir eşleşmen var! 💕',
    body: 'Biri seninle tanışmak istiyor. Şimdi gör!',
  },
  {
    id: '3',
    name: 'Moment Hatırlatma',
    title: 'Moment paylaş! 📸',
    body: 'Son seyahatinden fotoğraflar paylaşmayı unuttun mu?',
  },
  {
    id: '4',
    name: 'Premium Teklif',
    title: "Premium'u Dene 💎",
    body: 'Sınırsız beğeni ve özel özellikler seni bekliyor.',
  },
];

const mockCampaignStats = {
  totalSent: 156000,
  avgDeliveryRate: 95.4,
  avgOpenRate: 38.2,
  avgClickRate: 12.8,
};

export default function NotificationsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [abTestEnabled, setAbTestEnabled] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );

  // Use real API data
  const { data, isLoading, error } = useNotifications({ status: statusFilter });
  const createNotification = useCreateNotification();
  const sendNotification = useSendNotification();

  // Use API data if available, otherwise fall back to mock data
  const notifications = data?.campaigns || mockNotifications;

  const handleSend = () => {
    if (!notificationTitle || !notificationBody) {
      toast.error('Başlık ve içerik gerekli');
      return;
    }

    createNotification.mutate(
      {
        title: notificationTitle,
        message: notificationBody,
        type: 'push',
        target_audience: { segment: selectedSegment },
        status: 'sent',
      },
      {
        onSuccess: () => {
          toast.success('Bildirim başarıyla gönderildi');
          setIsCreateOpen(false);
          resetForm();
        },
        onError: (error) => {
          toast.error(error.message || 'Bildirim gönderilemedi');
        },
      },
    );
  };

  const handleSchedule = () => {
    toast.success('Bildirim zamanlandı');
    setIsCreateOpen(false);
    resetForm();
  };

  const handleSaveDraft = () => {
    toast.success('Taslak kaydedildi');
    setIsCreateOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNotificationTitle('');
    setNotificationBody('');
    setSelectedSegment('all');
    setScheduleEnabled(false);
    setAbTestEnabled(false);
  };

  const applyTemplate = (template: (typeof mockTemplates)[0]) => {
    setNotificationTitle(template.title);
    setNotificationBody(template.body);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: 'primary' | 'default' | 'info'; label: string }
    > = {
      sent: { variant: 'primary', label: 'Gönderildi' },
      scheduled: { variant: 'default', label: 'Zamanlandı' },
      draft: { variant: 'info', label: 'Taslak' },
      failed: { variant: 'info', label: 'Başarısız' },
    };
    const { variant, label } = variants[status] || {
      variant: 'info',
      label: status,
    };
    return <CanvaBadge variant={variant}>{label}</CanvaBadge>;
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
        <div className="h-10 w-36 bg-muted rounded" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-muted rounded-lg" />
    </div>
  );

  // Error State
  const ErrorState = () => (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Bir hata oluştu</h2>
        <p className="text-muted-foreground max-w-md">
          Bildirim verileri yüklenemedi. Lütfen tekrar deneyin.
        </p>
      </div>
    </div>
  );

  // Empty State
  const EmptyState = () => (
    <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-border">
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Bell className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">
          Henüz bildirim yok
        </h3>
        <p className="text-sm text-muted-foreground">
          İlk push bildiriminizi göndererek başlayın.
        </p>
        <CanvaButton variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Bildirim Oluştur
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
            Push Bildirimleri
          </h1>
          <p className="text-muted-foreground">
            Kullanıcılara push bildirim gönder ve performansı takip et
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <CanvaButton>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Bildirim
            </CanvaButton>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Push Bildirimi</DialogTitle>
              <DialogDescription>
                Kullanıcılara gönderilecek bildirimi oluşturun
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Templates */}
              <div>
                <Label>Hazır Şablon</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {mockTemplates.map((template) => (
                    <CanvaButton
                      key={template.id}
                      variant="primary"
                      size="sm"
                      onClick={() => applyTemplate(template)}
                    >
                      {template.name}
                    </CanvaButton>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlık</Label>
                  <CanvaInput
                    id="title"
                    placeholder="Bildirim başlığı..."
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    maxLength={65}
                  />
                  <p className="text-xs text-muted-foreground">
                    {notificationTitle.length}/65 karakter
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">İçerik</Label>
                  <Textarea
                    id="body"
                    placeholder="Bildirim içeriği..."
                    value={notificationBody}
                    onChange={(e) => setNotificationBody(e.target.value)}
                    rows={3}
                    maxLength={240}
                  />
                  <p className="text-xs text-muted-foreground">
                    {notificationBody.length}/240 karakter
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div>
                <Label>Önizleme</Label>
                <div className="mt-2 rounded-lg border bg-muted p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <Smartphone className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {notificationTitle || 'Bildirim başlığı'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notificationBody ||
                          'Bildirim içeriği burada görünecek...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Segment Selection */}
              <div className="space-y-2">
                <Label>Hedef Kitle</Label>
                <Select
                  value={selectedSegment}
                  onValueChange={setSelectedSegment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Segment seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSegments.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        {segment.name} ({segment.count.toLocaleString('tr-TR')}{' '}
                        kullanıcı)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Zamanla</Label>
                    <p className="text-sm text-muted-foreground">
                      Bildirimi ileri bir tarihte gönder
                    </p>
                  </div>
                  <Switch
                    checked={scheduleEnabled}
                    onCheckedChange={setScheduleEnabled}
                  />
                </div>

                {scheduleEnabled && (
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>Tarih</Label>
                      <CanvaInput type="date" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Saat</Label>
                      <CanvaInput type="time" />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>A/B Testi</Label>
                    <p className="text-sm text-muted-foreground">
                      Farklı varyasyonları test et
                    </p>
                  </div>
                  <Switch
                    checked={abTestEnabled}
                    onCheckedChange={setAbTestEnabled}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <CanvaButton variant="ghost" onClick={handleSaveDraft}>
                Taslak Kaydet
              </CanvaButton>
              {scheduleEnabled ? (
                <CanvaButton variant="primary" onClick={handleSchedule}>
                  <Clock className="mr-2 h-4 w-4" />
                  Zamanla
                </CanvaButton>
              ) : (
                <CanvaButton variant="primary" onClick={handleSend}>
                  <Send className="mr-2 h-4 w-4" />
                  Gönder
                </CanvaButton>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <CanvaStatCard
          title="Toplam Gönderim"
          value={mockCampaignStats.totalSent.toLocaleString('tr-TR')}
          icon={<Send className="h-5 w-5" />}
          accentColor="blue"
        />
        <CanvaStatCard
          title="Teslimat Oranı"
          value={`%${mockCampaignStats.avgDeliveryRate}`}
          icon={<CheckCircle className="h-5 w-5" />}
          accentColor="emerald"
          trend="up"
        />
        <CanvaStatCard
          title="Açılma Oranı"
          value={`%${mockCampaignStats.avgOpenRate}`}
          icon={<Eye className="h-5 w-5" />}
          accentColor="violet"
        />
        <CanvaStatCard
          title="Tıklama Oranı"
          value={`%${mockCampaignStats.avgClickRate}`}
          icon={<TrendingUp className="h-5 w-5" />}
          accentColor="amber"
        />
      </div>

      {/* Notifications List */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="sent">Gönderilen</TabsTrigger>
            <TabsTrigger value="scheduled">Zamanlanan</TabsTrigger>
            <TabsTrigger value="drafts">Taslaklar</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <CanvaInput placeholder="Ara..." className="w-64" />
            <CanvaButton variant="primary" size="sm" iconOnly>
              <Filter className="h-4 w-4" />
            </CanvaButton>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {mockNotifications.map((notification) => (
            <CanvaCard key={notification.id}>
              <CanvaCardBody className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Bell className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {getStatusBadge(notification.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.body}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {
                            mockSegments.find(
                              (s) => s.id === notification.segment,
                            )?.name
                          }
                        </span>
                        {notification.sent_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Gönderildi: {formatDate(notification.sent_at)}
                          </span>
                        )}
                        {notification.scheduled_for && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Zamanlandı: {formatDate(notification.scheduled_for)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {notification.stats && (
                      <div className="flex items-center gap-6 text-sm mr-4">
                        <div className="text-center">
                          <p className="font-semibold">
                            {notification.stats.sent.toLocaleString('tr-TR')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Gönderilen
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">
                            %
                            {(
                              (notification.stats.opened /
                                notification.stats.delivered) *
                              100
                            ).toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Açılma
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">
                            %
                            {(
                              (notification.stats.clicked /
                                notification.stats.delivered) *
                              100
                            ).toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tıklama
                          </p>
                        </div>
                      </div>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <CanvaButton variant="ghost" size="sm" iconOnly>
                          <MoreHorizontal className="h-4 w-4" />
                        </CanvaButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Detayları Gör
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Kopyala
                        </DropdownMenuItem>
                        {notification.status === 'scheduled' && (
                          <>
                            <DropdownMenuItem>
                              <Play className="mr-2 h-4 w-4" />
                              Şimdi Gönder
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pause className="mr-2 h-4 w-4" />
                              Duraklat
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CanvaCardBody>
            </CanvaCard>
          ))}
        </TabsContent>

        <TabsContent value="sent">
          {mockNotifications
            .filter((n) => n.status === 'sent')
            .map((notification) => (
              <Card key={notification.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {notification.body}
                      </p>
                    </div>
                    {getStatusBadge(notification.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="scheduled">
          {mockNotifications
            .filter((n) => n.status === 'scheduled')
            .map((notification) => (
              <Card key={notification.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {notification.body}
                      </p>
                    </div>
                    {getStatusBadge(notification.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="drafts">
          {mockNotifications
            .filter((n) => n.status === 'draft')
            .map((notification) => (
              <Card key={notification.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {notification.body}
                      </p>
                    </div>
                    {getStatusBadge(notification.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {/* Segments Overview */}
      <CanvaCard>
        <CanvaCardHeader>
          <CanvaCardTitle>Kullanıcı Segmentleri</CanvaCardTitle>
          <CanvaCardSubtitle>
            Hedef kitle segmentleri ve kullanıcı sayıları
          </CanvaCardSubtitle>
        </CanvaCardHeader>
        <CanvaCardBody>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {mockSegments.slice(0, 8).map((segment) => (
              <div
                key={segment.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{segment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {segment.count.toLocaleString('tr-TR')} kullanıcı
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CanvaCardBody>
      </CanvaCard>
    </div>
  );
}

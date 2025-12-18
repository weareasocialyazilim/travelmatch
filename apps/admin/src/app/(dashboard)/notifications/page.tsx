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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

// Mock data
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
    title: 'Premium\'a Özel İndirim 💎',
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
  { id: '1', name: 'Hoş Geldin', title: 'TravelMatch\'e Hoş Geldin! 🌍', body: 'Seyahat arkadaşını bulmaya hazır mısın?' },
  { id: '2', name: 'Yeni Eşleşme', title: 'Yeni bir eşleşmen var! 💕', body: 'Biri seninle tanışmak istiyor. Şimdi gör!' },
  { id: '3', name: 'Moment Hatırlatma', title: 'Moment paylaş! 📸', body: 'Son seyahatinden fotoğraflar paylaşmayı unuttun mu?' },
  { id: '4', name: 'Premium Teklif', title: 'Premium\'u Dene 💎', body: 'Sınırsız beğeni ve özel özellikler seni bekliyor.' },
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

  const handleSend = () => {
    toast.success('Bildirim başarıyla gönderildi');
    setIsCreateOpen(false);
    resetForm();
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

  const applyTemplate = (template: typeof mockTemplates[0]) => {
    setNotificationTitle(template.title);
    setNotificationBody(template.body);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
      sent: { variant: 'default', label: 'Gönderildi' },
      scheduled: { variant: 'secondary', label: 'Zamanlandı' },
      draft: { variant: 'outline', label: 'Taslak' },
      failed: { variant: 'outline', label: 'Başarısız' },
    };
    const { variant, label } = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Push Bildirimleri</h1>
          <p className="text-muted-foreground">
            Kullanıcılara push bildirim gönder ve performansı takip et
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Bildirim
            </Button>
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
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(template)}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlık</Label>
                  <Input
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
                <div className="mt-2 rounded-lg border bg-gray-50 p-4 dark:bg-gray-900">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <Smartphone className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {notificationTitle || 'Bildirim başlığı'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notificationBody || 'Bildirim içeriği burada görünecek...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Segment Selection */}
              <div className="space-y-2">
                <Label>Hedef Kitle</Label>
                <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Segment seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSegments.map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        {segment.name} ({segment.count.toLocaleString('tr-TR')} kullanıcı)
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
                  <Switch checked={scheduleEnabled} onCheckedChange={setScheduleEnabled} />
                </div>

                {scheduleEnabled && (
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>Tarih</Label>
                      <Input type="date" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Saat</Label>
                      <Input type="time" />
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
                  <Switch checked={abTestEnabled} onCheckedChange={setAbTestEnabled} />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleSaveDraft}>
                Taslak Kaydet
              </Button>
              {scheduleEnabled ? (
                <Button onClick={handleSchedule}>
                  <Clock className="mr-2 h-4 w-4" />
                  Zamanla
                </Button>
              ) : (
                <Button onClick={handleSend}>
                  <Send className="mr-2 h-4 w-4" />
                  Gönder
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockCampaignStats.totalSent.toLocaleString('tr-TR')}
                </p>
                <p className="text-sm text-muted-foreground">Toplam Gönderim</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">%{mockCampaignStats.avgDeliveryRate}</p>
                <p className="text-sm text-muted-foreground">Teslimat Oranı</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">%{mockCampaignStats.avgOpenRate}</p>
                <p className="text-sm text-muted-foreground">Açılma Oranı</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">%{mockCampaignStats.avgClickRate}</p>
                <p className="text-sm text-muted-foreground">Tıklama Oranı</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
            <Input placeholder="Ara..." className="w-64" />
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {mockNotifications.map((notification) => (
            <Card key={notification.id}>
              <CardContent className="p-6">
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
                      <p className="text-sm text-muted-foreground">{notification.body}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {mockSegments.find((s) => s.id === notification.segment)?.name}
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
                          <p className="font-semibold">{notification.stats.sent.toLocaleString('tr-TR')}</p>
                          <p className="text-xs text-muted-foreground">Gönderilen</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">
                            %{((notification.stats.opened / notification.stats.delivered) * 100).toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">Açılma</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold">
                            %{((notification.stats.clicked / notification.stats.delivered) * 100).toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">Tıklama</p>
                        </div>
                      </div>
                    )}
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
              </CardContent>
            </Card>
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
                      <p className="text-sm text-muted-foreground">{notification.body}</p>
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
                      <p className="text-sm text-muted-foreground">{notification.body}</p>
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
                      <p className="text-sm text-muted-foreground">{notification.body}</p>
                    </div>
                    {getStatusBadge(notification.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {/* Segments Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Segmentleri</CardTitle>
          <CardDescription>Hedef kitle segmentleri ve kullanıcı sayıları</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}

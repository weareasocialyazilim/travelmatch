'use client';

import { useState } from 'react';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  Copy,
  MoreHorizontal,
  Clock,
  Users,
  Mail,
  Bell,
  Ban,
  Gift,
  Shield,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Activity,
  ChevronRight,
  Settings,
  Filter,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

// Mock data
const mockRules = [
  {
    id: '1',
    name: 'Hoş Geldin E-postası',
    description: 'Yeni kullanıcılara otomatik hoş geldin e-postası gönder',
    status: 'active',
    trigger: 'user_signup',
    conditions: ['Kayıt tamamlandı'],
    actions: [
      'E-posta gönder: Hoş Geldin Şablonu',
      '3 gün sonra: Moment hatırlatma',
    ],
    executions: {
      total: 12450,
      success: 12380,
      failed: 70,
      lastRun: '2024-12-18T14:30:00Z',
    },
  },
  {
    id: '2',
    name: 'Pasif Kullanıcı Hatırlatma',
    description: '7 gündür giriş yapmayan kullanıcılara push bildirim gönder',
    status: 'active',
    trigger: 'scheduled',
    conditions: ['Son giriş > 7 gün', 'Bildirim izni var'],
    actions: ['Push bildirim gönder', 'Segment: pasif olarak işaretle'],
    executions: {
      total: 8900,
      success: 8750,
      failed: 150,
      lastRun: '2024-12-18T10:00:00Z',
    },
  },
  {
    id: '3',
    name: 'Fraud Tespit Aksiyonu',
    description: 'Yüksek risk skorlu hesapları otomatik askıya al',
    status: 'active',
    trigger: 'fraud_score_update',
    conditions: ['Fraud skoru > 80', 'Hesap yaşı < 7 gün'],
    actions: [
      'Hesabı askıya al',
      'Trust & Safety ekibine bildir',
      'E-posta gönder: Hesap askıda',
    ],
    executions: {
      total: 234,
      success: 230,
      failed: 4,
      lastRun: '2024-12-18T13:15:00Z',
    },
  },
  {
    id: '4',
    name: 'Premium Yenileme Hatırlatma',
    description:
      'Premium aboneliği sona ermek üzere olan kullanıcılara hatırlatma',
    status: 'active',
    trigger: 'scheduled',
    conditions: ['Premium üye', 'Abonelik bitiş < 7 gün'],
    actions: ['E-posta gönder: Yenileme hatırlatma', 'In-app mesaj göster'],
    executions: {
      total: 3400,
      success: 3380,
      failed: 20,
      lastRun: '2024-12-18T09:00:00Z',
    },
  },
  {
    id: '5',
    name: 'İlk Moment Ödülü',
    description: 'İlk momentini paylaşan kullanıcılara boost hediye et',
    status: 'paused',
    trigger: 'moment_created',
    conditions: ['Toplam moment sayısı = 1'],
    actions: ['1 adet ücretsiz boost ver', 'Tebrik bildirimi gönder'],
    executions: {
      total: 5600,
      success: 5580,
      failed: 20,
      lastRun: '2024-12-15T18:00:00Z',
    },
  },
];

const triggerTypes = [
  { id: 'user_signup', name: 'Kullanıcı Kaydı', icon: Users },
  { id: 'moment_created', name: 'Moment Paylaşıldı', icon: Activity },
  { id: 'match_created', name: 'Eşleşme Oluştu', icon: CheckCircle },
  { id: 'fraud_score_update', name: 'Fraud Skoru Güncellendi', icon: Shield },
  { id: 'payment_completed', name: 'Ödeme Tamamlandı', icon: Gift },
  { id: 'scheduled', name: 'Zamanlanmış', icon: Clock },
];

const actionTypes = [
  { id: 'send_email', name: 'E-posta Gönder', icon: Mail },
  { id: 'send_push', name: 'Push Bildirim Gönder', icon: Bell },
  { id: 'send_inapp', name: 'In-App Mesaj Gönder', icon: MessageSquare },
  { id: 'suspend_user', name: 'Kullanıcıyı Askıya Al', icon: Ban },
  { id: 'give_reward', name: 'Ödül Ver', icon: Gift },
  { id: 'add_to_segment', name: 'Segmente Ekle', icon: Users },
];

const executionStats = {
  totalRules: 12,
  activeRules: 8,
  totalExecutions: 45678,
  successRate: 98.7,
};

export default function AutomationPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { variant: 'default' | 'secondary' | 'outline'; label: string }
    > = {
      active: { variant: 'default', label: 'Aktif' },
      paused: { variant: 'secondary', label: 'Duraklatıldı' },
      draft: { variant: 'outline', label: 'Taslak' },
    };
    const { variant, label } = variants[status] || {
      variant: 'outline',
      label: status,
    };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTriggerIcon = (trigger: string) => {
    const triggerType = triggerTypes.find((t) => t.id === trigger);
    if (!triggerType) return <Zap className="h-4 w-4" />;
    const Icon = triggerType.icon;
    return <Icon className="h-4 w-4" />;
  };

  const getTriggerLabel = (trigger: string) => {
    const triggerType = triggerTypes.find((t) => t.id === trigger);
    return triggerType?.name || trigger;
  };

  const handleToggleRule = (ruleId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    toast.success(
      `Kural ${newStatus === 'active' ? 'aktifleştirildi' : 'duraklatıldı'}`,
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Otomasyon Kuralları
          </h1>
          <p className="text-muted-foreground">
            Otomatik iş akışları ve tetikleyici bazlı aksiyonlar
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kural
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Yeni Otomasyon Kuralı</DialogTitle>
              <DialogDescription>
                Tetikleyici, koşul ve aksiyon belirleyerek otomatik iş akışı
                oluşturun
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Rule Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Kural Adı</Label>
                <Input id="name" placeholder="Kural adını girin..." />
              </div>

              {/* Trigger Selection */}
              <div className="space-y-2">
                <Label>Tetikleyici</Label>
                <div className="grid gap-3 md:grid-cols-3">
                  {triggerTypes.map((trigger) => (
                    <div
                      key={trigger.id}
                      onClick={() => setSelectedTrigger(trigger.id)}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent ${
                        selectedTrigger === trigger.id
                          ? 'border-primary bg-primary/5'
                          : ''
                      }`}
                    >
                      <trigger.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {trigger.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-2">
                <Label>Koşullar</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Alan seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user_age">Kullanıcı Yaşı</SelectItem>
                        <SelectItem value="account_age">Hesap Yaşı</SelectItem>
                        <SelectItem value="total_moments">
                          Toplam Moment
                        </SelectItem>
                        <SelectItem value="subscription">
                          Abonelik Tipi
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Operatör" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eq">=</SelectItem>
                        <SelectItem value="gt">&gt;</SelectItem>
                        <SelectItem value="lt">&lt;</SelectItem>
                        <SelectItem value="contains">İçerir</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Değer" className="flex-1" />
                    <Button variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Label>Aksiyonlar</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  {actionTypes.map((action) => (
                    <div
                      key={action.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
                    >
                      <action.icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">{action.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                İptal
              </Button>
              <Button
                onClick={() => {
                  toast.success('Kural oluşturuldu');
                  setIsCreateOpen(false);
                }}
              >
                <ChevronRight className="mr-2 h-4 w-4" />
                Oluştur
              </Button>
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
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {executionStats.totalRules}
                </p>
                <p className="text-sm text-muted-foreground">Toplam Kural</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {executionStats.activeRules}
                </p>
                <p className="text-sm text-muted-foreground">Aktif Kural</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {executionStats.totalExecutions.toLocaleString('tr-TR')}
                </p>
                <p className="text-sm text-muted-foreground">Toplam Çalışma</p>
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
                <p className="text-2xl font-bold">
                  %{executionStats.successRate}
                </p>
                <p className="text-sm text-muted-foreground">Başarı Oranı</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="active">Aktif</TabsTrigger>
            <TabsTrigger value="paused">Duraklatıldı</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Input placeholder="Kural ara..." className="w-64" />
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {mockRules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      {getTriggerIcon(rule.trigger)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        {getStatusBadge(rule.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.description}
                      </p>

                      {/* Trigger & Conditions */}
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline" className="gap-1">
                          {getTriggerIcon(rule.trigger)}
                          {getTriggerLabel(rule.trigger)}
                        </Badge>
                        {rule.conditions.map((condition, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
                            {condition}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {rule.actions.map((action, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs"
                          >
                            <ChevronRight className="h-3 w-3" />
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Execution Stats */}
                    <div className="flex items-center gap-6 text-sm mr-4">
                      <div className="text-center">
                        <p className="font-semibold">
                          {rule.executions.total.toLocaleString('tr-TR')}
                        </p>
                        <p className="text-xs text-muted-foreground">Çalışma</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-600">
                          {(
                            (rule.executions.success / rule.executions.total) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                        <p className="text-xs text-muted-foreground">Başarı</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-muted-foreground text-xs">
                          {formatDate(rule.executions.lastRun)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Son Çalışma
                        </p>
                      </div>
                    </div>

                    {/* Toggle & Actions */}
                    <Switch
                      checked={rule.status === 'active'}
                      onCheckedChange={() =>
                        handleToggleRule(rule.id, rule.status)
                      }
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Kopyala
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Activity className="mr-2 h-4 w-4" />
                          Çalışma Geçmişi
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Ayarlar
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
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="active">
          {mockRules
            .filter((r) => r.status === 'active')
            .map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <Play className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{rule.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {rule.description}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(rule.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="paused">
          {mockRules
            .filter((r) => r.status === 'paused')
            .map((rule) => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                        <Pause className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{rule.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {rule.description}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(rule.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

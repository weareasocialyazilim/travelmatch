'use client';

import { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  UserX,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Search,
  Filter,
  MoreHorizontal,
  Flag,
  AlertCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { formatRelativeDate, getInitials, cn } from '@/lib/utils';

// Mock data for fraud detection
const mockSuspiciousUsers = [
  {
    id: 'su1',
    full_name: 'Şüpheli Hesap 1',
    email: 'suspicious1@fake.com',
    avatar_url: null,
    fraud_score: 85,
    risk_factors: ['Çoklu hesap', 'VPN kullanımı', 'Hızlı işlem'],
    status: 'under_review',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    last_activity: 'Para çekme talebi',
  },
  {
    id: 'su2',
    full_name: 'Bot Hesabı',
    email: 'bot123@temp.com',
    avatar_url: null,
    fraud_score: 92,
    risk_factors: ['Otomatik davranış', 'Sahte profil', 'Spam aktivite'],
    status: 'flagged',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    last_activity: 'Toplu mesaj gönderimi',
  },
  {
    id: 'su3',
    full_name: 'Dolandırıcı Şüphelisi',
    email: 'scammer@mail.com',
    avatar_url: null,
    fraud_score: 78,
    risk_factors: ['Şikayet geçmişi', 'Ödeme reddi'],
    status: 'under_review',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    last_activity: 'Yeni ödeme girişimi',
  },
];

const mockAutoBanRules = [
  {
    id: 'r1',
    name: 'Yüksek Fraud Skoru',
    description: 'Fraud skoru 90 üstü kullanıcıları otomatik askıya al',
    condition: 'fraud_score > 90',
    action: 'suspend',
    is_active: true,
    triggered_count: 23,
  },
  {
    id: 'r2',
    name: 'Spam Tespiti',
    description: '1 saat içinde 50+ mesaj gönderen kullanıcıları işaretle',
    condition: 'messages_per_hour > 50',
    action: 'flag',
    is_active: true,
    triggered_count: 156,
  },
  {
    id: 'r3',
    name: 'Çoklu Hesap',
    description: 'Aynı cihazdan 3+ hesap açılmasını engelle',
    condition: 'accounts_per_device > 3',
    action: 'block',
    is_active: true,
    triggered_count: 45,
  },
  {
    id: 'r4',
    name: 'VPN/Proxy Tespiti',
    description: "Bilinen VPN IP'lerinden giriş yapanları işaretle",
    condition: 'is_vpn = true',
    action: 'flag',
    is_active: false,
    triggered_count: 892,
  },
];

const mockAlerts = [
  {
    id: 'a1',
    type: 'critical',
    title: 'Anormal Ödeme Aktivitesi',
    description: 'Son 1 saatte 15 başarısız ödeme girişimi tespit edildi',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    acknowledged: false,
  },
  {
    id: 'a2',
    type: 'warning',
    title: 'Yeni Dolandırıcılık Raporu',
    description: 'Kullanıcı "Ali Veli" hakkında 3 yeni şikayet',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    acknowledged: false,
  },
  {
    id: 'a3',
    type: 'info',
    title: 'Otomatik Ban Tetiklendi',
    description: 'Bot hesabı tespit edildi ve otomatik olarak askıya alındı',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    acknowledged: true,
  },
];

const getFraudScoreColor = (score: number) => {
  if (score >= 80) return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  if (score >= 60) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30';
  if (score >= 40) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
  return 'text-green-600 bg-green-100 dark:bg-green-900/30';
};

const getAlertTypeConfig = (type: string) => {
  switch (type) {
    case 'critical':
      return {
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-100 dark:bg-red-900/30',
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        color: 'text-orange-600',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
      };
    default:
      return {
        icon: Flag,
        color: 'text-blue-600',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
      };
  }
};

export default function TrustSafetyPage() {
  const [selectedUser, setSelectedUser] = useState<
    (typeof mockSuspiciousUsers)[0] | null
  >(null);
  const [search, setSearch] = useState('');

  const unacknowledgedAlerts = mockAlerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trust & Safety</h1>
          <p className="text-muted-foreground">
            Fraud tespiti, risk analizi ve platform güvenliği
          </p>
        </div>
        <div className="flex gap-2">
          {unacknowledgedAlerts > 0 && (
            <Badge variant="error" className="h-8 px-3 text-sm">
              <AlertCircle className="mr-1 h-4 w-4" />
              {unacknowledgedAlerts} yeni uyarı
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fraud Skoru Ortalaması
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingDown className="mr-1 h-3 w-3" />
              -2.3 geçen haftadan
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Şüpheli Hesaplar
            </CardTitle>
            <UserX className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {mockSuspiciousUsers.length}
            </div>
            <p className="text-xs text-muted-foreground">İnceleme bekliyor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bu Ay Engellenen
            </CardTitle>
            <Ban className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12 geçen aydan
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Otomasyon Başarısı
            </CardTitle>
            <Zap className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-muted-foreground">
              Otomatik tespit oranı
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suspicious" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suspicious">
            <UserX className="mr-2 h-4 w-4" />
            Şüpheli Hesaplar
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Uyarılar
            {unacknowledgedAlerts > 0 && (
              <Badge variant="error" className="ml-2">
                {unacknowledgedAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Shield className="mr-2 h-4 w-4" />
            Otomasyon Kuralları
          </TabsTrigger>
        </TabsList>

        {/* Suspicious Users Tab */}
        <TabsContent value="suspicious">
          <Card>
            <CardHeader>
              <CardTitle>Şüpheli Hesap Listesi</CardTitle>
              <CardDescription>
                Yüksek fraud skoru veya şüpheli aktivite gösteren hesaplar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="İsim veya e-posta ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="flagged">İşaretlenen</SelectItem>
                    <SelectItem value="under_review">İncelenen</SelectItem>
                    <SelectItem value="cleared">Temiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* User List */}
              <div className="space-y-3">
                {mockSuspiciousUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            'absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                            getFraudScoreColor(user.fraud_score),
                          )}
                        >
                          {user.fraud_score}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.full_name}</span>
                          <Badge
                            variant={
                              user.status === 'flagged' ? 'error' : 'warning'
                            }
                          >
                            {user.status === 'flagged'
                              ? 'İşaretlendi'
                              : 'İnceleniyor'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {user.risk_factors.map((factor, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {factor}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Son aktivite: {user.last_activity} •{' '}
                          {formatRelativeDate(user.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        İncele
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            Temiz İşaretle
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-orange-600">
                            <Clock className="mr-2 h-4 w-4" />
                            Askıya Al
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Ban className="mr-2 h-4 w-4" />
                            Kalıcı Yasakla
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

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Güvenlik Uyarıları</CardTitle>
              <CardDescription>
                Sistem tarafından tespit edilen güvenlik olayları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAlerts.map((alert) => {
                  const config = getAlertTypeConfig(alert.type);
                  const AlertIcon = config.icon;

                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        'flex items-center justify-between rounded-lg border p-4',
                        alert.acknowledged && 'opacity-60',
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full',
                            config.bg,
                          )}
                        >
                          <AlertIcon className={cn('h-5 w-5', config.color)} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{alert.title}</span>
                            {!alert.acknowledged && (
                              <Badge variant="secondary">Yeni</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {alert.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeDate(alert.created_at)}
                          </p>
                        </div>
                      </div>
                      {!alert.acknowledged && (
                        <Button size="sm" variant="outline">
                          Onayla
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Otomasyon Kuralları</CardTitle>
                  <CardDescription>
                    Otomatik fraud tespiti ve önleme kuralları
                  </CardDescription>
                </div>
                <Button>
                  <Zap className="mr-2 h-4 w-4" />
                  Yeni Kural
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAutoBanRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full',
                          rule.is_active
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-gray-100 dark:bg-gray-900/30',
                        )}
                      >
                        <Shield
                          className={cn(
                            'h-5 w-5',
                            rule.is_active ? 'text-green-600' : 'text-gray-400',
                          )}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rule.name}</span>
                          <Badge
                            variant={
                              rule.action === 'block'
                                ? 'error'
                                : rule.action === 'suspend'
                                  ? 'warning'
                                  : 'secondary'
                            }
                          >
                            {rule.action === 'block'
                              ? 'Engelle'
                              : rule.action === 'suspend'
                                ? 'Askıya Al'
                                : 'İşaretle'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rule.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <code className="rounded bg-muted px-1">
                            {rule.condition}
                          </code>
                          <span className="mx-2">•</span>
                          {rule.triggered_count} kez tetiklendi
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`rule-${rule.id}`} className="text-sm">
                          {rule.is_active ? 'Aktif' : 'Pasif'}
                        </Label>
                        <Switch
                          id={`rule-${rule.id}`}
                          checked={rule.is_active}
                        />
                      </div>
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kullanıcı İncelemesi</DialogTitle>
            <DialogDescription>
              Şüpheli hesap detayları ve risk analizi
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl">
                    {getInitials(selectedUser.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedUser.full_name}
                  </h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
                <div className="ml-auto text-center">
                  <div
                    className={cn(
                      'inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold',
                      getFraudScoreColor(selectedUser.fraud_score),
                    )}
                  >
                    {selectedUser.fraud_score}
                  </div>
                  <p className="text-xs text-muted-foreground">Fraud Skoru</p>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="mb-2 font-medium">Risk Faktörleri</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.risk_factors.map((factor, i) => (
                    <Badge key={i} variant="outline">
                      <AlertTriangle className="mr-1 h-3 w-3 text-orange-500" />
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">
                    Hesap Oluşturma
                  </p>
                  <p className="font-medium">
                    {formatRelativeDate(selectedUser.created_at)}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm text-muted-foreground">Son Aktivite</p>
                  <p className="font-medium">{selectedUser.last_activity}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Kapat
            </Button>
            <Button variant="outline" className="text-orange-600">
              <Clock className="mr-2 h-4 w-4" />
              Askıya Al
            </Button>
            <Button variant="destructive">
              <Ban className="mr-2 h-4 w-4" />
              Yasakla
            </Button>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Temiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

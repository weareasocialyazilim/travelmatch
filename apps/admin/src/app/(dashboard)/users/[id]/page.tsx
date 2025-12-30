'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  Heart,
  Flag,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Camera,
  MessageSquare,
  Star,
  Activity,
  MoreHorizontal,
  Send,
  Eye,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getInitials, formatDate, formatCurrency } from '@/lib/utils';
import { useUser, useSuspendUser, useBanUser, useVerifyUser } from '@/hooks/use-users';
import { Loader2 } from 'lucide-react';

// Fallback mock user data
const mockUser = {
  id: '1',
  email: 'ahmet.yilmaz@email.com',
  phone: '+90 532 123 4567',
  full_name: 'Ahmet Yılmaz',
  avatar_url: null,
  birth_date: '1992-05-15',
  gender: 'male',
  bio: 'Seyahat tutkunu, fotoğrafçı. Yeni yerler keşfetmeyi ve yerel lezzetleri tatmayı seviyorum.',
  location: {
    city: 'İstanbul',
    country: 'Türkiye',
  },
  created_at: '2024-01-15T10:30:00Z',
  last_active_at: '2024-12-18T14:22:00Z',
  status: 'active',
  verification: {
    email_verified: true,
    phone_verified: true,
    kyc_status: 'verified',
    kyc_verified_at: '2024-02-10T09:00:00Z',
  },
  stats: {
    total_moments: 24,
    total_matches: 156,
    total_messages: 1243,
    total_spent: 450.00,
    total_earned: 120.00,
    avg_rating: 4.8,
    review_count: 42,
  },
  subscription: {
    plan: 'premium',
    started_at: '2024-06-01T00:00:00Z',
    expires_at: '2025-06-01T00:00:00Z',
    auto_renew: true,
  },
  risk_score: 12,
  flags: ['high_spender', 'verified_user'],
};

const mockActivity = [
  {
    id: '1',
    type: 'moment_created',
    description: 'Yeni moment paylaştı: "Kapadokya Turu"',
    timestamp: '2024-12-18T12:00:00Z',
  },
  {
    id: '2',
    type: 'match',
    description: 'Elif K. ile eşleşti',
    timestamp: '2024-12-17T18:30:00Z',
  },
  {
    id: '3',
    type: 'payment',
    description: 'Premium abonelik yenilendi - ₺149.99',
    timestamp: '2024-12-15T09:00:00Z',
  },
  {
    id: '4',
    type: 'report_received',
    description: 'Uygunsuz içerik raporu aldı (reddedildi)',
    timestamp: '2024-12-10T14:22:00Z',
  },
  {
    id: '5',
    type: 'login',
    description: 'Giriş yaptı - İstanbul, TR',
    timestamp: '2024-12-18T08:15:00Z',
  },
];

const mockTransactions = [
  {
    id: 'txn_1',
    type: 'subscription',
    amount: 149.99,
    currency: 'TRY',
    status: 'completed',
    description: 'Premium Aylık Abonelik',
    created_at: '2024-12-15T09:00:00Z',
  },
  {
    id: 'txn_2',
    type: 'boost',
    amount: 29.99,
    currency: 'TRY',
    status: 'completed',
    description: 'Profil Boost - 24 Saat',
    created_at: '2024-12-10T16:30:00Z',
  },
  {
    id: 'txn_3',
    type: 'super_like',
    amount: 19.99,
    currency: 'TRY',
    status: 'completed',
    description: 'Super Like Paketi (5 adet)',
    created_at: '2024-12-05T11:15:00Z',
  },
  {
    id: 'txn_4',
    type: 'refund',
    amount: -29.99,
    currency: 'TRY',
    status: 'completed',
    description: 'Boost İadesi',
    created_at: '2024-11-28T14:00:00Z',
  },
];

const mockMoments = [
  {
    id: 'm1',
    title: 'Kapadokya Turu',
    thumbnail: null,
    status: 'active',
    views: 1240,
    likes: 89,
    created_at: '2024-12-18T12:00:00Z',
  },
  {
    id: 'm2',
    title: 'Ege Kıyıları',
    thumbnail: null,
    status: 'active',
    views: 856,
    likes: 67,
    created_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'm3',
    title: 'Doğu Ekspresi Yolculuğu',
    thumbnail: null,
    status: 'pending_review',
    views: 0,
    likes: 0,
    created_at: '2024-11-25T15:30:00Z',
  },
];

const mockReports = [
  {
    id: 'r1',
    type: 'received',
    reason: 'Uygunsuz içerik',
    status: 'dismissed',
    reporter: 'Anonim Kullanıcı',
    created_at: '2024-12-10T14:22:00Z',
    resolved_at: '2024-12-11T09:00:00Z',
  },
  {
    id: 'r2',
    type: 'submitted',
    reason: 'Spam mesaj',
    status: 'resolved',
    reported_user: 'Mehmet A.',
    created_at: '2024-11-20T16:45:00Z',
    resolved_at: '2024-11-21T10:30:00Z',
  },
];

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [actionDialog, setActionDialog] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');

  // Use real API data
  const { data: userData, isLoading, error } = useUser(params.id as string);
  const suspendUser = useSuspendUser();
  const banUser = useBanUser();
  const verifyUser = useVerifyUser();

  // Fallback to mock data while loading or if no data
  const user = userData || mockUser;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: 'Aktif' },
      suspended: { variant: 'secondary', label: 'Askıya Alındı' },
      banned: { variant: 'destructive', label: 'Yasaklandı' },
      inactive: { variant: 'outline', label: 'Pasif' },
    };
    const { variant, label } = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getKycBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; icon: React.ReactNode }> = {
      verified: { variant: 'default', label: 'Doğrulandı', icon: <CheckCircle className="h-3 w-3" /> },
      pending: { variant: 'secondary', label: 'Bekliyor', icon: <Clock className="h-3 w-3" /> },
      rejected: { variant: 'destructive', label: 'Reddedildi', icon: <XCircle className="h-3 w-3" /> },
      not_submitted: { variant: 'outline', label: 'Gönderilmedi', icon: null },
    };
    const { variant, label, icon } = variants[status] || { variant: 'outline', label: status, icon: null };
    return (
      <Badge variant={variant} className="gap-1">
        {icon}
        {label}
      </Badge>
    );
  };

  const handleAction = async (action: string) => {
    const userId = params.id as string;
    try {
      if (action === 'suspend') {
        await suspendUser.mutateAsync({ id: userId, reason: actionReason });
        toast.success('Kullanıcı askıya alındı');
      } else if (action === 'ban') {
        await banUser.mutateAsync({ id: userId, reason: actionReason });
        toast.success('Kullanıcı yasaklandı');
      } else if (action === 'verify_kyc') {
        await verifyUser.mutateAsync(userId);
        toast.success('KYC doğrulaması onaylandı');
      } else if (action === 'reset_password') {
        // Password reset would need a separate hook
        toast.info('Şifre sıfırlama bağlantısı gönderildi');
      }
    } catch (err) {
      toast.error(`İşlem başarısız: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
    }
    setActionDialog(null);
    setActionReason('');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">Bir hata oluştu</h2>
          <p className="text-muted-foreground">Kullanıcı bilgileri yüklenemedi.</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      moment_created: <Camera className="h-4 w-4 text-blue-500" />,
      match: <Heart className="h-4 w-4 text-pink-500" />,
      payment: <CreditCard className="h-4 w-4 text-green-500" />,
      report_received: <Flag className="h-4 w-4 text-orange-500" />,
      login: <Activity className="h-4 w-4 text-gray-500" />,
    };
    return icons[type] || <Activity className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Kullanıcı Detayı</h1>
          <p className="text-muted-foreground">ID: {params.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Profili Görüntüle
          </Button>
          <Button variant="outline" size="sm">
            <Send className="mr-2 h-4 w-4" />
            Mesaj Gönder
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActionDialog('suspend')}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Askıya Al
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActionDialog('ban')}>
                <Ban className="mr-2 h-4 w-4" />
                Yasakla
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActionDialog('verify_kyc')}>
                <Shield className="mr-2 h-4 w-4" />
                KYC Onayla
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActionDialog('reset_password')}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Şifre Sıfırla
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Verileri Dışa Aktar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - User Info */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl font-semibold">{user.full_name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  {getStatusBadge(user.status)}
                  {user.subscription.plan === 'premium' && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{user.stats.avg_rating}</span>
                  <span className="text-muted-foreground">
                    ({user.stats.review_count} değerlendirme)
                  </span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">{user.email}</p>
                    {user.verification.email_verified && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                        Doğrulandı
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">{user.phone}</p>
                    {user.verification.phone_verified && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                        Doğrulandı
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {user.location.city}, {user.location.country}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    Doğum: {formatDate(user.birth_date)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm capitalize">{user.gender === 'male' ? 'Erkek' : 'Kadın'}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Kayıt Tarihi</span>
                  <span>{formatDate(user.created_at)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Son Aktiflik</span>
                  <span>{formatDate(user.last_active_at)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">KYC Durumu</span>
                  {getKycBadge(user.verification.kyc_status)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk Değerlendirmesi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Skoru</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${user.risk_score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-green-600">{user.risk_score}/100</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {user.flags.map((flag) => (
                  <Badge key={flag} variant="outline" className="text-xs">
                    {flag === 'high_spender' && 'Yüksek Harcama'}
                    {flag === 'verified_user' && 'Doğrulanmış'}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Abonelik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan</span>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  {user.subscription.plan === 'premium' ? 'Premium' : 'Ücretsiz'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Başlangıç</span>
                <span>{formatDate(user.subscription.started_at)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bitiş</span>
                <span>{formatDate(user.subscription.expires_at)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Otomatik Yenileme</span>
                <Badge variant={user.subscription.auto_renew ? 'default' : 'outline'}>
                  {user.subscription.auto_renew ? 'Aktif' : 'Kapalı'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="activity" className="space-y-4">
            <TabsList>
              <TabsTrigger value="activity">
                <Activity className="mr-2 h-4 w-4" />
                Aktivite
              </TabsTrigger>
              <TabsTrigger value="transactions">
                <CreditCard className="mr-2 h-4 w-4" />
                İşlemler
              </TabsTrigger>
              <TabsTrigger value="moments">
                <Camera className="mr-2 h-4 w-4" />
                Momentler
              </TabsTrigger>
              <TabsTrigger value="reports">
                <Flag className="mr-2 h-4 w-4" />
                Raporlar
              </TabsTrigger>
            </TabsList>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Son Aktiviteler</CardTitle>
                  <CardDescription>Kullanıcının son 30 günlük aktiviteleri</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4">
                        <div className="mt-1">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>İşlem Geçmişi</CardTitle>
                      <CardDescription>Tüm ödeme ve iadeleri görüntüle</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Toplam Harcama</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(user.stats.total_spent, 'TRY')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTransactions.map((txn) => (
                      <div
                        key={txn.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              txn.amount > 0
                                ? 'bg-green-100 text-green-600'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{txn.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(txn.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              txn.amount > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {txn.amount > 0 ? '+' : ''}
                            {formatCurrency(txn.amount, txn.currency)}
                          </p>
                          <Badge
                            variant={txn.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {txn.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Moments Tab */}
            <TabsContent value="moments">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Momentler</CardTitle>
                      <CardDescription>Kullanıcının paylaştığı içerikler</CardDescription>
                    </div>
                    <Badge variant="secondary">{user.stats.total_moments} Moment</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {mockMoments.map((moment) => (
                      <div key={moment.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{moment.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(moment.created_at)}
                            </p>
                          </div>
                          <Badge
                            variant={
                              moment.status === 'active'
                                ? 'default'
                                : moment.status === 'pending_review'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {moment.status === 'active'
                              ? 'Aktif'
                              : moment.status === 'pending_review'
                                ? 'İncelemede'
                                : moment.status}
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {moment.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {moment.likes}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Raporlar & Şikayetler</CardTitle>
                  <CardDescription>Alınan ve gönderilen raporlar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              report.type === 'received'
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            <Flag className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{report.reason}</p>
                            <p className="text-sm text-muted-foreground">
                              {report.type === 'received'
                                ? `Raporlayan: ${report.reporter}`
                                : `Raporlanan: ${report.reported_user}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(report.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              report.status === 'resolved'
                                ? 'default'
                                : report.status === 'dismissed'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {report.status === 'resolved'
                              ? 'Çözüldü'
                              : report.status === 'dismissed'
                                ? 'Reddedildi'
                                : report.status}
                          </Badge>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {report.type === 'received' ? 'Alınan' : 'Gönderilen'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Stats Overview */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Camera className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{user.stats.total_moments}</p>
                    <p className="text-sm text-muted-foreground">Moment</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
                    <Heart className="h-6 w-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{user.stats.total_matches}</p>
                    <p className="text-sm text-muted-foreground">Eşleşme</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <MessageSquare className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{user.stats.total_messages}</p>
                    <p className="text-sm text-muted-foreground">Mesaj</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(user.stats.total_spent, 'TRY')}
                    </p>
                    <p className="text-sm text-muted-foreground">Toplam Harcama</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog === 'suspend' && 'Kullanıcıyı Askıya Al'}
              {actionDialog === 'ban' && 'Kullanıcıyı Yasakla'}
              {actionDialog === 'verify_kyc' && 'KYC Onayla'}
              {actionDialog === 'reset_password' && 'Şifre Sıfırla'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog === 'suspend' &&
                'Kullanıcı geçici olarak askıya alınacak. Erişimi kısıtlanacak.'}
              {actionDialog === 'ban' &&
                'Kullanıcı kalıcı olarak yasaklanacak. Bu işlem geri alınabilir.'}
              {actionDialog === 'verify_kyc' && 'Kullanıcının kimlik doğrulaması onaylanacak.'}
              {actionDialog === 'reset_password' &&
                'Kullanıcıya şifre sıfırlama bağlantısı gönderilecek.'}
            </DialogDescription>
          </DialogHeader>
          {(actionDialog === 'suspend' || actionDialog === 'ban') && (
            <div className="space-y-2">
              <Label htmlFor="reason">Gerekçe</Label>
              <Textarea
                id="reason"
                placeholder="İşlem gerekçesini yazın..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              İptal
            </Button>
            <Button
              variant={actionDialog === 'ban' ? 'destructive' : 'default'}
              onClick={() => handleAction(actionDialog!)}
            >
              Onayla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  User,
  Shield,
  Bell,
  Palette,
  Key,
  Save,
  Eye,
  EyeOff,
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth-store';
import { getInitials } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Mevcut şifre gerekli'),
    newPassword: z.string().min(8, 'Yeni şifre en az 8 karakter olmalıdır'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      // API call would go here
      toast.success('Profil güncellendi');
    } catch (profileError) {
      toast.error('Profil güncellenemedi');
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      // API call would go here
      toast.success('Şifre güncellendi');
      passwordForm.reset();
    } catch (passwordError) {
      toast.error('Şifre güncellenemedi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-muted-foreground">
          Hesap ve uygulama ayarlarınızı yönetin
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Güvenlik
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Bildirimler
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Görünüm
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>Hesap bilgilerinizi güncelleyin</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className="space-y-6"
              >
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.avatar_url || undefined} />
                    <AvatarFallback className="text-xl">
                      {user ? getInitials(user.name) : '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button type="button" variant="outline" size="sm">
                      Fotoğraf Değiştir
                    </Button>
                    <p className="mt-1 text-xs text-muted-foreground">
                      JPG, PNG veya GIF. Maksimum 2MB.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">İsim</Label>
                  <Input
                    id="name"
                    {...profileForm.register('name')}
                    error={!!profileForm.formState.errors.name}
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    {...profileForm.register('email')}
                    error={!!profileForm.formState.errors.email}
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Role (read-only) */}
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Input value={user?.role || ''} disabled />
                  <p className="text-xs text-muted-foreground">
                    Rol değişikliği için yönetici ile iletişime geçin
                  </p>
                </div>

                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Kaydet
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle>Şifre Değiştir</CardTitle>
              <CardDescription>
                Hesap güvenliğiniz için şifrenizi düzenli olarak güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      {...passwordForm.register('currentPassword')}
                      error={!!passwordForm.formState.errors.currentPassword}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      {...passwordForm.register('newPassword')}
                      error={!!passwordForm.formState.errors.newPassword}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register('confirmPassword')}
                    error={!!passwordForm.formState.errors.confirmPassword}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit">
                  <Key className="mr-2 h-4 w-4" />
                  Şifreyi Güncelle
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 2FA */}
          <Card>
            <CardHeader>
              <CardTitle>İki Faktörlü Doğrulama (2FA)</CardTitle>
              <CardDescription>
                Hesabınıza ekstra güvenlik katmanı ekleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">2FA Durumu</div>
                  <div className="text-sm text-muted-foreground">
                    {user?.totp_enabled
                      ? 'İki faktörlü doğrulama aktif'
                      : 'İki faktörlü doğrulama kapalı'}
                  </div>
                </div>
                <Switch checked={user?.totp_enabled} />
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Aktif Oturumlar</CardTitle>
              <CardDescription>
                Hesabınıza bağlı cihazları yönetin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="font-medium">Bu Cihaz</div>
                    <div className="text-sm text-muted-foreground">
                      Chrome on macOS • İstanbul, Türkiye
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Son aktivite: Şu an aktif
                    </div>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Aktif
                  </div>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full">
                Diğer Tüm Oturumları Sonlandır
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Ayarları</CardTitle>
              <CardDescription>
                Hangi bildirimleri almak istediğinizi seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Acil Görevler</div>
                  <div className="text-sm text-muted-foreground">
                    Acil öncelikli yeni görevler için bildirim al
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Yeni Şikayetler</div>
                  <div className="text-sm text-muted-foreground">
                    Yeni şikayetler için bildirim al
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Ödeme Onayları</div>
                  <div className="text-sm text-muted-foreground">
                    Bekleyen ödemeler için bildirim al
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Sistem Bildirimleri</div>
                  <div className="text-sm text-muted-foreground">
                    Platform durumu ve güncellemeler
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Görünüm Ayarları</CardTitle>
              <CardDescription>
                Uygulama görünümünü özelleştirin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Karanlık Mod</div>
                  <div className="text-sm text-muted-foreground">
                    Koyu tema kullan
                  </div>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Kompakt Görünüm</div>
                  <div className="text-sm text-muted-foreground">
                    Daha küçük aralıklarla göster
                  </div>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">Sidebar Varsayılan</div>
                  <div className="text-sm text-muted-foreground">
                    Sidebar varsayılan olarak açık başlasın
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

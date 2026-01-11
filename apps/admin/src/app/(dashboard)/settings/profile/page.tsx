'use client';

/**
 * Profile Settings Page
 * Admin user profile management
 */

import { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Key,
  Bell,
  Eye,
  EyeOff,
  Save,
  Camera,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/stores/auth-store';
import { getInitials } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProfileSettingsPage() {
  const { user, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    securityAlerts: true,
    weeklyReport: false,
  });

  const handleSave = async () => {
    if (!user?.id) {
      toast.error('Kullanıcı bilgisi bulunamadı');
      return;
    }

    // Validate name
    if (!formData.name.trim()) {
      toast.error('Ad Soyad boş olamaz');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin-users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Güncelleme başarısız');
      }

      const data = await response.json();

      // Update the auth store with new user data
      setUser({
        ...user,
        name: data.admin.name,
      });

      toast.success('Profil başarıyla güncellendi');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Profil güncellenirken bir hata oluştu',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Profil Ayarları</h1>
        <p className="text-muted-foreground">
          Hesap bilgilerinizi ve güvenlik ayarlarınızı yönetin
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Kişisel Bilgiler
              </CardTitle>
              <CardDescription>
                Temel profil bilgilerinizi güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                    {user ? getInitials(user.name) : 'KT'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Fotoğraf Değiştir
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG veya GIF. Max 2MB.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Adınız"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Input
                    value={user?.role || 'Super Admin'}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Şifre Değiştir
              </CardTitle>
              <CardDescription>
                Hesap güvenliğiniz için güçlü bir şifre kullanın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Şifreniz en az 8 karakter, bir büyük harf, bir rakam ve bir özel
                karakter içermelidir.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Hesap Durumu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">İki Faktörlü Doğrulama</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Aktif
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Son Giriş</span>
                <span className="text-xs text-muted-foreground">
                  Bugün, 09:45
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Hesap Oluşturulma</span>
                <span className="text-xs text-muted-foreground">
                  1 Ocak 2026
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Bildirim Tercihleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">E-posta Bildirimleri</p>
                  <p className="text-xs text-muted-foreground">
                    Kritik uyarılar için
                  </p>
                </div>
                <Switch
                  checked={notifications.emailAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailAlerts: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Push Bildirimleri</p>
                  <p className="text-xs text-muted-foreground">
                    Tarayıcı bildirimleri
                  </p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      pushNotifications: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Güvenlik Uyarıları</p>
                  <p className="text-xs text-muted-foreground">
                    Şüpheli aktiviteler
                  </p>
                </div>
                <Switch
                  checked={notifications.securityAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      securityAlerts: checked,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Haftalık Rapor</p>
                  <p className="text-xs text-muted-foreground">
                    Özet e-postası
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) =>
                    setNotifications({
                      ...notifications,
                      weeklyReport: checked,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </div>
    </div>
  );
}

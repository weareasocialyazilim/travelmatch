'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Shield,
  MoreHorizontal,
  Edit,
  Key,
  UserX,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Eye,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { getInitials, formatDate } from '@/lib/utils';
import { getRoleDisplayName, getRoleBadgeColor } from '@/lib/permissions';
import type { AdminRole } from '@/types/admin';
import {
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
} from '@/hooks/use-admin-users';

const roles: { value: AdminRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'moderator', label: 'Moderatör' },
  { value: 'finance', label: 'Finans' },
  { value: 'marketing', label: 'Pazarlama' },
  { value: 'support', label: 'Destek' },
  { value: 'viewer', label: 'Görüntüleyici' },
];

export default function AdminUsersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole>('viewer');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [requires2FA, setRequires2FA] = useState(true);

  // Use real API data
  const { data, isLoading, error } = useAdminUsers();
  const createAdminMutation = useCreateAdminUser();
  const updateAdminMutation = useUpdateAdminUser();
  const deleteAdminMutation = useDeleteAdminUser();

  const admins = data?.admins || [];

  const handleCreateAdmin = () => {
    if (!newAdminName || !newAdminEmail) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    createAdminMutation.mutate(
      {
        name: newAdminName,
        email: newAdminEmail,
        role: selectedRole,
        requires_2fa: requires2FA,
      },
      {
        onSuccess: () => {
          toast.success('Admin kullanıcısı oluşturuldu');
          setIsCreateOpen(false);
          setNewAdminName('');
          setNewAdminEmail('');
          setSelectedRole('viewer');
          setRequires2FA(true);
        },
        onError: (error) => {
          toast.error(error.message || 'Admin oluşturulamadı');
        },
      }
    );
  };

  const handleDeactivate = (userId: string) => {
    updateAdminMutation.mutate(
      { id: userId, data: { is_active: false } },
      {
        onSuccess: () => {
          toast.success('Kullanıcı devre dışı bırakıldı');
        },
        onError: (error) => {
          toast.error(error.message || 'İşlem başarısız');
        },
      }
    );
  };

  const handleActivate = (userId: string) => {
    updateAdminMutation.mutate(
      { id: userId, data: { is_active: true } },
      {
        onSuccess: () => {
          toast.success('Kullanıcı aktifleştirildi');
        },
        onError: (error) => {
          toast.error(error.message || 'İşlem başarısız');
        },
      }
    );
  };

  const handleResetPassword = (userId: string) => {
    // This would need a separate API endpoint for password reset
    toast.success('Şifre sıfırlama e-postası gönderildi');
  };

  const handleReset2FA = (userId: string) => {
    updateAdminMutation.mutate(
      { id: userId, data: { totp_enabled: false } },
      {
        onSuccess: () => {
          toast.success('2FA sıfırlandı');
        },
        onError: (error) => {
          toast.error(error.message || 'İşlem başarısız');
        },
      }
    );
  };

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">Bir hata oluştu</h2>
          <p className="text-muted-foreground">Admin kullanıcıları yüklenemedi. Lütfen tekrar deneyin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Kullanıcıları</h1>
          <p className="text-muted-foreground">
            Admin paneline erişimi olan kullanıcıları yönetin
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Admin Kullanıcısı</DialogTitle>
              <DialogDescription>
                Admin paneline erişim yetkisi olan yeni kullanıcı oluşturun
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">İsim</Label>
                <Input
                  id="name"
                  placeholder="Ad Soyad"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@travelmatch.app"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AdminRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>2FA Zorunlu</Label>
                  <p className="text-sm text-muted-foreground">
                    İki faktörlü doğrulamayı zorunlu kıl
                  </p>
                </div>
                <Switch checked={requires2FA} onCheckedChange={setRequires2FA} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleCreateAdmin} disabled={createAdminMutation.isPending}>
                {createAdminMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : data?.total || admins.length}
                </p>
                <p className="text-sm text-muted-foreground">Toplam Admin</p>
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
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : admins.filter((u) => u.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : admins.filter((u) => u.totp_enabled).length}
                </p>
                <p className="text-sm text-muted-foreground">2FA Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    admins.filter((u) => {
                      if (!u.last_login_at) return false;
                      const lastLogin = new Date(u.last_login_at);
                      const today = new Date();
                      return today.getTime() - lastLogin.getTime() < 24 * 60 * 60 * 1000;
                    }).length
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Bugün Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Kullanıcıları</CardTitle>
          <CardDescription>Tüm admin kullanıcıları ve yetkileri</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>2FA</TableHead>
                  <TableHead>Son Giriş</TableHead>
                  <TableHead>Oluşturulma</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={admin.avatar_url || undefined} />
                          <AvatarFallback>{getInitials(admin.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{admin.name}</p>
                          <p className="text-sm text-muted-foreground">{admin.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(admin.role as AdminRole)}>
                        {getRoleDisplayName(admin.role as AdminRole)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.is_active ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Devre Dışı
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {admin.totp_enabled ? (
                        <Badge variant="outline" className="gap-1 text-green-600">
                          <Shield className="h-3 w-3" />
                          Aktif
                        </Badge>
                      ) : admin.requires_2fa ? (
                        <Badge variant="outline" className="gap-1 text-yellow-600">
                          <Clock className="h-3 w-3" />
                          Bekliyor
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-gray-500">
                          <XCircle className="h-3 w-3" />
                          Kapalı
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {admin.last_login_at ? formatDate(admin.last_login_at) : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(admin.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Detaylar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleResetPassword(admin.id)}>
                            <Key className="mr-2 h-4 w-4" />
                            Şifre Sıfırla
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReset2FA(admin.id)}>
                            <Shield className="mr-2 h-4 w-4" />
                            2FA Sıfırla
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {admin.is_active ? (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeactivate(admin.id)}
                              disabled={updateAdminMutation.isPending}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Devre Dışı Bırak
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleActivate(admin.id)}
                              disabled={updateAdminMutation.isPending}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Aktifleştir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && admins.length === 0 && (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Admin kullanıcısı bulunamadı</h3>
              <p className="text-muted-foreground">Yeni bir admin ekleyerek başlayın</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Rol Yetkileri</CardTitle>
          <CardDescription>Her rolün erişebildiği modüller</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <div key={role.value} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={getRoleBadgeColor(role.value)}>{role.label}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {admins.filter((u) => u.role === role.value).length} kullanıcı
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  {role.value === 'super_admin' && (
                    <p className="text-muted-foreground">Tüm yetkilere sahip</p>
                  )}
                  {role.value === 'manager' && (
                    <>
                      <p className="text-muted-foreground">• Kullanıcı yönetimi</p>
                      <p className="text-muted-foreground">• İçerik moderasyonu</p>
                      <p className="text-muted-foreground">• Finans görüntüleme</p>
                    </>
                  )}
                  {role.value === 'moderator' && (
                    <>
                      <p className="text-muted-foreground">• İçerik moderasyonu</p>
                      <p className="text-muted-foreground">• Şikayet yönetimi</p>
                    </>
                  )}
                  {role.value === 'finance' && (
                    <>
                      <p className="text-muted-foreground">• İşlem görüntüleme</p>
                      <p className="text-muted-foreground">• Ödeme yönetimi</p>
                      <p className="text-muted-foreground">• Raporlar</p>
                    </>
                  )}
                  {role.value === 'marketing' && (
                    <>
                      <p className="text-muted-foreground">• Analitik</p>
                      <p className="text-muted-foreground">• Kampanyalar</p>
                    </>
                  )}
                  {role.value === 'support' && (
                    <>
                      <p className="text-muted-foreground">• Kullanıcı desteği</p>
                      <p className="text-muted-foreground">• Şikayet yönetimi</p>
                    </>
                  )}
                  {role.value === 'viewer' && (
                    <p className="text-muted-foreground">Sadece görüntüleme</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

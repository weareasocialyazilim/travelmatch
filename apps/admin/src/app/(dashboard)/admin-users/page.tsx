'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Shield,
  Mail,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Key,
  UserX,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Eye,
  Copy,
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

// Mock data
const mockAdminUsers = [
  {
    id: '1',
    email: 'admin@travelmatch.app',
    name: 'Ahmet Yılmaz',
    avatar_url: null,
    role: 'super_admin' as AdminRole,
    is_active: true,
    requires_2fa: true,
    totp_enabled: true,
    last_login_at: '2024-12-18T14:30:00Z',
    created_at: '2024-01-15T10:00:00Z',
    created_by: null,
  },
  {
    id: '2',
    email: 'manager@travelmatch.app',
    name: 'Elif Kaya',
    avatar_url: null,
    role: 'manager' as AdminRole,
    is_active: true,
    requires_2fa: true,
    totp_enabled: true,
    last_login_at: '2024-12-18T12:00:00Z',
    created_at: '2024-02-20T09:00:00Z',
    created_by: '1',
  },
  {
    id: '3',
    email: 'moderator@travelmatch.app',
    name: 'Mehmet Demir',
    avatar_url: null,
    role: 'moderator' as AdminRole,
    is_active: true,
    requires_2fa: true,
    totp_enabled: false,
    last_login_at: '2024-12-17T16:45:00Z',
    created_at: '2024-03-10T11:00:00Z',
    created_by: '1',
  },
  {
    id: '4',
    email: 'finance@travelmatch.app',
    name: 'Ayşe Öztürk',
    avatar_url: null,
    role: 'finance' as AdminRole,
    is_active: true,
    requires_2fa: true,
    totp_enabled: true,
    last_login_at: '2024-12-18T10:15:00Z',
    created_at: '2024-04-05T14:00:00Z',
    created_by: '1',
  },
  {
    id: '5',
    email: 'support@travelmatch.app',
    name: 'Can Yıldız',
    avatar_url: null,
    role: 'support' as AdminRole,
    is_active: true,
    requires_2fa: false,
    totp_enabled: false,
    last_login_at: '2024-12-16T09:30:00Z',
    created_at: '2024-05-15T08:00:00Z',
    created_by: '2',
  },
  {
    id: '6',
    email: 'marketing@travelmatch.app',
    name: 'Zeynep Arslan',
    avatar_url: null,
    role: 'marketing' as AdminRole,
    is_active: false,
    requires_2fa: true,
    totp_enabled: false,
    last_login_at: '2024-11-20T14:00:00Z',
    created_at: '2024-06-01T10:00:00Z',
    created_by: '1',
  },
];

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

  const handleCreateAdmin = () => {
    toast.success('Admin kullanıcısı oluşturuldu');
    setIsCreateOpen(false);
  };

  const handleDeactivate = (userId: string) => {
    toast.success('Kullanıcı devre dışı bırakıldı');
  };

  const handleResetPassword = (userId: string) => {
    toast.success('Şifre sıfırlama e-postası gönderildi');
  };

  const handleReset2FA = (userId: string) => {
    toast.success('2FA sıfırlandı');
  };

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
                <Input id="name" placeholder="Ad Soyad" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" type="email" placeholder="admin@travelmatch.app" />
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
                <Switch defaultChecked />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleCreateAdmin}>Oluştur</Button>
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
                <p className="text-2xl font-bold">{mockAdminUsers.length}</p>
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
                  {mockAdminUsers.filter((u) => u.is_active).length}
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
                  {mockAdminUsers.filter((u) => u.totp_enabled).length}
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
                  {mockAdminUsers.filter((u) => {
                    const lastLogin = new Date(u.last_login_at);
                    const today = new Date();
                    return today.getTime() - lastLogin.getTime() < 24 * 60 * 60 * 1000;
                  }).length}
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
              {mockAdminUsers.map((admin) => (
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
                    <Badge className={getRoleBadgeColor(admin.role)}>
                      {getRoleDisplayName(admin.role)}
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
                      {formatDate(admin.last_login_at)}
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
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Devre Dışı Bırak
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>
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
                    {mockAdminUsers.filter((u) => u.role === role.value).length} kullanıcı
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

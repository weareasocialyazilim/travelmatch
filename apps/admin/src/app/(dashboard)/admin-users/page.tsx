'use client';

/**
 * Admin Kullanıcı Yönetim Paneli
 *
 * Özellikler:
 * - Admin kullanıcı listesi
 * - Yeni admin oluşturma
 * - Admin düzenleme/silme
 * - Rol yönetimi
 * - 2FA zorunluluk ayarı
 * - Aktif/Pasif durumu
 */

import { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldOff,
  Key,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  UserPlus,
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock,
} from 'lucide-react';
import { CanvaButton } from '@/components/canva/CanvaButton';
import { CanvaInput } from '@/components/canva/CanvaInput';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
  CanvaCardBody,
  CanvaStatCard,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { cn, formatRelativeDate, getInitials } from '@/lib/utils';
import {
  useAdminUsers,
  useCreateAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
} from '@/hooks/use-admin-users';

// Admin tipi tanımı - API ve mock data uyumlu
interface AdminUserData {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  role: string;
  is_active: boolean;
  requires_2fa: boolean;
  totp_enabled: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

// Rol tanımlamaları
const ROLES = [
  {
    value: 'super_admin',
    label: 'Süper Admin',
    color: 'bg-red-100 text-red-800',
    icon: ShieldCheck,
  },
  {
    value: 'manager',
    label: 'Yönetici',
    color: 'bg-purple-100 text-purple-800',
    icon: Shield,
  },
  {
    value: 'moderator',
    label: 'Moderatör',
    color: 'bg-blue-100 text-blue-800',
    icon: Users,
  },
  {
    value: 'finance',
    label: 'Finans',
    color: 'bg-green-100 text-green-800',
    icon: Key,
  },
  {
    value: 'marketing',
    label: 'Pazarlama',
    color: 'bg-orange-100 text-orange-800',
    icon: Mail,
  },
  {
    value: 'support',
    label: 'Destek',
    color: 'bg-cyan-100 text-cyan-800',
    icon: Users,
  },
  {
    value: 'viewer',
    label: 'İzleyici',
    color: 'bg-gray-100 text-gray-800',
    icon: Eye,
  },
];

const getRoleInfo = (role: string) => {
  return ROLES.find((r) => r.value === role) || ROLES[ROLES.length - 1];
};

// Mock data for development
const mockAdmins = [
  {
    id: '1',
    email: 'ceo@travelmatch.com',
    name: 'Ahmet Yılmaz',
    avatar_url: null,
    role: 'super_admin',
    is_active: true,
    requires_2fa: true,
    totp_enabled: true,
    last_login_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'manager@travelmatch.com',
    name: 'Zeynep Kaya',
    avatar_url: null,
    role: 'manager',
    is_active: true,
    requires_2fa: true,
    totp_enabled: true,
    last_login_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    created_at: '2024-02-15T00:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'moderator@travelmatch.com',
    name: 'Can Demir',
    avatar_url: null,
    role: 'moderator',
    is_active: true,
    requires_2fa: false,
    totp_enabled: false,
    last_login_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    created_at: '2024-03-01T00:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    email: 'finance@travelmatch.com',
    name: 'Elif Şahin',
    avatar_url: null,
    role: 'finance',
    is_active: true,
    requires_2fa: true,
    totp_enabled: false,
    last_login_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    created_at: '2024-04-01T00:00:00Z',
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    email: 'support@travelmatch.com',
    name: 'Mehmet Öz',
    avatar_url: null,
    role: 'support',
    is_active: false,
    requires_2fa: false,
    totp_enabled: false,
    last_login_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    created_at: '2024-05-01T00:00:00Z',
    updated_at: new Date().toISOString(),
  },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUserData | null>(
    null,
  );

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer',
    requires_2fa: false,
    password: '',
  });

  // API hooks
  const { data, isLoading, error, refetch } = useAdminUsers({
    search: search || undefined,
    role: roleFilter !== 'all' ? roleFilter : undefined,
    is_active: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const createAdmin = useCreateAdminUser();
  const updateAdmin = useUpdateAdminUser();
  const deleteAdmin = useDeleteAdminUser();

  // Use API data or fallback to mock
  const admins = data?.admins || mockAdmins;

  // Filter admins
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      !search ||
      admin.name.toLowerCase().includes(search.toLowerCase()) ||
      admin.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || admin.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? admin.is_active : !admin.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats
  const stats = {
    total: admins.length,
    active: admins.filter((a) => a.is_active).length,
    with2fa: admins.filter((a) => a.totp_enabled).length,
    superAdmins: admins.filter((a) => a.role === 'super_admin').length,
  };

  // Handlers
  const handleCreate = async () => {
    try {
      await createAdmin.mutateAsync({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        requires_2fa: formData.requires_2fa,
      });
      toast.success('Admin kullanıcı oluşturuldu');
      setIsCreateOpen(false);
      resetForm();
    } catch (err) {
      toast.error('Admin oluşturulamadı');
    }
  };

  const handleUpdate = async () => {
    if (!selectedAdmin) return;
    try {
      await updateAdmin.mutateAsync({
        id: selectedAdmin.id,
        data: {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          requires_2fa: formData.requires_2fa,
        },
      });
      toast.success('Admin güncellendi');
      setIsEditOpen(false);
      setSelectedAdmin(null);
      resetForm();
    } catch (err) {
      toast.error('Admin güncellenemedi');
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;
    try {
      await deleteAdmin.mutateAsync(selectedAdmin.id);
      toast.success('Admin silindi');
      setIsDeleteOpen(false);
      setSelectedAdmin(null);
    } catch (err) {
      toast.error('Admin silinemedi');
    }
  };

  const handleToggleStatus = async (admin: AdminUserData) => {
    try {
      await updateAdmin.mutateAsync({
        id: admin.id,
        data: { is_active: !admin.is_active },
      });
      toast.success(
        admin.is_active ? 'Admin pasifleştirildi' : 'Admin aktifleştirildi',
      );
    } catch (err) {
      toast.error('Durum değiştirilemedi');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'viewer',
      requires_2fa: false,
      password: '',
    });
  };

  const openEdit = (admin: AdminUserData) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      requires_2fa: admin.requires_2fa,
      password: '',
    });
    setIsEditOpen(true);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-48 bg-gray-100 rounded" />
        </div>
        <div className="h-10 w-36 bg-gray-200 rounded" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg" />
        ))}
      </div>
      <div className="h-96 bg-gray-100 rounded-lg" />
    </div>
  );

  // Error state
  const ErrorState = () => (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Bir hata oluştu</h2>
        <p className="text-gray-500 max-w-md">
          Admin kullanıcıları yüklenemedi. Lütfen tekrar deneyin.
        </p>
        <CanvaButton
          variant="primary"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Tekrar Dene
        </CanvaButton>
      </div>
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Users className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Henüz admin yok</h3>
        <p className="text-sm text-gray-500">
          İlk admin kullanıcınızı oluşturun.
        </p>
        <CanvaButton
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          Admin Oluştur
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
          <h1 className="text-3xl font-bold tracking-tight">Admin Yönetimi</h1>
          <p className="text-muted-foreground">
            Sistem yöneticilerini ekleyin, düzenleyin ve yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <CanvaButton
            variant="primary"
            onClick={() => refetch()}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Yenile
          </CanvaButton>
          <CanvaButton
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Yeni Admin
          </CanvaButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <CanvaStatCard
          label="Toplam Admin"
          value={stats.total}
          icon={<Users className="h-4 w-4" />}
        />
        <CanvaStatCard
          label="Aktif"
          value={stats.active}
          icon={<CheckCircle className="h-4 w-4" />}
          change={{
            value: Math.round((stats.active / stats.total) * 100),
            label: 'aktif',
          }}
        />
        <CanvaStatCard
          label="2FA Etkin"
          value={stats.with2fa}
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <CanvaStatCard
          label="Süper Admin"
          value={stats.superAdmins}
          icon={<Shield className="h-4 w-4" />}
        />
      </div>

      {/* Filters */}
      <CanvaCard padding="md">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <CanvaInput
              placeholder="Admin ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Roller</SelectItem>
              {ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Pasif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CanvaCard>

      {/* Admin List */}
      {filteredAdmins.length === 0 ? (
        <EmptyState />
      ) : (
        <CanvaCard>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>2FA</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Son Giriş</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => {
                const roleInfo = getRoleInfo(admin.role);
                const RoleIcon = roleInfo.icon;

                return (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={admin.avatar_url || undefined} />
                          <AvatarFallback className="bg-violet-100 text-violet-700">
                            {getInitials(admin.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{admin.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {admin.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <CanvaBadge
                        className={roleInfo.color}
                        icon={<RoleIcon className="h-3 w-3" />}
                      >
                        {roleInfo.label}
                      </CanvaBadge>
                    </TableCell>
                    <TableCell>
                      {admin.totp_enabled ? (
                        <CanvaBadge
                          variant="success"
                          icon={<ShieldCheck className="h-3 w-3" />}
                        >
                          Aktif
                        </CanvaBadge>
                      ) : admin.requires_2fa ? (
                        <CanvaBadge
                          variant="warning"
                          icon={<ShieldOff className="h-3 w-3" />}
                        >
                          Bekliyor
                        </CanvaBadge>
                      ) : (
                        <CanvaBadge
                          variant="primary"
                          icon={<ShieldOff className="h-3 w-3" />}
                        >
                          Kapalı
                        </CanvaBadge>
                      )}
                    </TableCell>
                    <TableCell>
                      {admin.is_active ? (
                        <CanvaBadge variant="success">Aktif</CanvaBadge>
                      ) : (
                        <CanvaBadge variant="error">Pasif</CanvaBadge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {admin.last_login_at
                          ? formatRelativeDate(admin.last_login_at)
                          : 'Hiç giriş yapmadı'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <CanvaButton variant="ghost" size="sm" iconOnly>
                            <MoreHorizontal className="h-4 w-4" />
                          </CanvaButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEdit(admin)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(admin)}
                          >
                            {admin.is_active ? (
                              <>
                                <Lock className="mr-2 h-4 w-4" />
                                Pasifleştir
                              </>
                            ) : (
                              <>
                                <Unlock className="mr-2 h-4 w-4" />
                                Aktifleştir
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Key className="mr-2 h-4 w-4" />
                            Şifre Sıfırla
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CanvaCard>
      )}

      {/* Create Admin Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Admin Oluştur</DialogTitle>
            <DialogDescription>
              Sisteme yeni bir admin kullanıcı ekleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <CanvaInput
              label="İsim"
              placeholder="Admin adı"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <CanvaInput
              label="E-posta"
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <CanvaInput
              label="Geçici Şifre"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              helperText="Kullanıcı ilk girişte şifresini değiştirecek"
            />
            <div className="flex items-center justify-between">
              <div>
                <Label>2FA Zorunlu</Label>
                <p className="text-sm text-muted-foreground">
                  Kullanıcı giriş için 2FA kurmalı
                </p>
              </div>
              <Switch
                checked={formData.requires_2fa}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requires_2fa: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <CanvaButton
              variant="primary"
              onClick={() => setIsCreateOpen(false)}
            >
              İptal
            </CanvaButton>
            <CanvaButton
              variant="primary"
              onClick={handleCreate}
              loading={createAdmin.isPending}
              disabled={!formData.name || !formData.email}
            >
              Oluştur
            </CanvaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Düzenle</DialogTitle>
            <DialogDescription>
              {selectedAdmin?.name} kullanıcısını düzenleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <CanvaInput
              label="İsim"
              placeholder="Admin adı"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <CanvaInput
              label="E-posta"
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>2FA Zorunlu</Label>
                <p className="text-sm text-muted-foreground">
                  Kullanıcı giriş için 2FA kurmalı
                </p>
              </div>
              <Switch
                checked={formData.requires_2fa}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requires_2fa: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <CanvaButton variant="primary" onClick={() => setIsEditOpen(false)}>
              İptal
            </CanvaButton>
            <CanvaButton
              variant="primary"
              onClick={handleUpdate}
              loading={updateAdmin.isPending}
            >
              Kaydet
            </CanvaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Admin Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedAdmin?.name}</strong> kullanıcısını silmek
              istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

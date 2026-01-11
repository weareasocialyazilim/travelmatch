'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
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
import { formatDate, formatCurrency, getInitials } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface User {
  id: string;
  display_name: string;
  full_name?: string;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
  is_suspended: boolean;
  is_banned: boolean;
  is_verified: boolean;
  kyc_status?: string;
  balance?: number;
  total_trips?: number;
  rating?: number;
  created_at: string;
  last_active_at?: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  pendingKYC: number;
  suspendedUsers: number;
}

const statusConfig = {
  active: { label: 'Aktif', variant: 'success' as const },
  suspended: { label: 'Askıya Alındı', variant: 'warning' as const },
  banned: { label: 'Yasaklandı', variant: 'error' as const },
  pending: { label: 'Beklemede', variant: 'secondary' as const },
};

const kycStatusConfig: Record<
  string,
  { label: string; variant: 'secondary' | 'warning' | 'success' | 'error' }
> = {
  not_started: { label: 'Başlamadı', variant: 'secondary' },
  pending: { label: 'Bekliyor', variant: 'warning' },
  verified: { label: 'Doğrulandı', variant: 'success' },
  rejected: { label: 'Reddedildi', variant: 'error' },
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 50;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (kycFilter === 'true') params.append('verified', 'true');
      if (kycFilter === 'false') params.append('verified', 'false');
      params.append('limit', limit.toString());
      params.append('offset', (page * limit).toString());

      const res = await fetch(`/api/users?${params}`);
      if (!res.ok) throw new Error('Kullanıcılar yüklenemedi');

      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      logger.error('Users fetch error', err);
      setError('Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, kycFilter, page]);

  const fetchStats = useCallback(async () => {
    try {
      // Fetch stats for the cards
      const [totalRes, activeRes, pendingKycRes, suspendedRes] =
        await Promise.all([
          fetch('/api/users?limit=1'),
          fetch('/api/users?status=active&limit=1'),
          fetch('/api/kyc?status=pending&limit=1'),
          fetch('/api/users?status=suspended&limit=1'),
        ]);

      const [totalData, activeData, pendingKycData, suspendedData] =
        await Promise.all([
          totalRes.json(),
          activeRes.json(),
          pendingKycRes.json(),
          suspendedRes.json(),
        ]);

      setStats({
        totalUsers: totalData.total || 0,
        activeUsers: activeData.total || 0,
        pendingKYC: pendingKycData.total || 0,
        suspendedUsers: suspendedData.total || 0,
      });
    } catch (err) {
      logger.error('Stats fetch error', err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(0);
      fetchUsers();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const getUserStatus = (user: User): keyof typeof statusConfig => {
    if (user.is_banned) return 'banned';
    if (user.is_suspended) return 'suspended';
    if (user.is_active) return 'active';
    return 'pending';
  };

  const getKycStatus = (user: User): string => {
    if (user.is_verified) return 'verified';
    if (user.kyc_status) return user.kyc_status;
    return 'not_started';
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Kullanıcılar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kullanıcılar</h1>
          <p className="text-muted-foreground">
            Platform kullanıcılarını yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Yenile
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Kullanıcı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalUsers?.toLocaleString('tr-TR') || '-'}
            </div>
            <p className="text-xs text-muted-foreground">Kayıtlı kullanıcı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Aktif Kullanıcı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeUsers?.toLocaleString('tr-TR') || '-'}
            </div>
            <p className="text-xs text-muted-foreground">Aktif hesaplar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">KYC Bekleyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingKYC || 0}</div>
            <p className="text-xs text-muted-foreground">Onay bekliyor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Askıya Alınan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.suspendedUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">Askıdaki hesaplar</p>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kullanıcı Listesi</CardTitle>
              <CardDescription>{total} kullanıcı bulundu</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="İsim veya e-posta ile ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="suspended">Askıya Alınmış</SelectItem>
                <SelectItem value="banned">Yasaklanmış</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={kycFilter}
              onValueChange={(v) => {
                setKycFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="KYC Durumu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm KYC</SelectItem>
                <SelectItem value="true">Doğrulanmış</SelectItem>
                <SelectItem value="false">Doğrulanmamış</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Table */}
          <div className="rounded-md border">
            <div className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
              <div>Kullanıcı</div>
              <div>E-posta</div>
              <div>Durum</div>
              <div>KYC</div>
              <div>Bakiye</div>
              <div>Puan</div>
              <div></div>
            </div>
            {users.map((user) => {
              const status = getUserStatus(user);
              const kycStatus = getKycStatus(user);
              return (
                <div
                  key={user.id}
                  className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto_auto] items-center gap-4 border-b px-4 py-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(
                          user.display_name || user.full_name || user.email,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        href={`/users/${user.id}`}
                        className="font-medium hover:underline"
                      >
                        {user.display_name || user.full_name || 'İsimsiz'}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {user.total_trips || 0} seyahat
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </div>
                  <Badge variant={statusConfig[status].variant}>
                    {statusConfig[status].label}
                  </Badge>
                  <Badge
                    variant={kycStatusConfig[kycStatus]?.variant || 'secondary'}
                  >
                    {kycStatusConfig[kycStatus]?.label || kycStatus}
                  </Badge>
                  <div className="text-sm font-medium">
                    {formatCurrency(user.balance || 0)}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-yellow-500">★</span>
                    {(user.rating || 0).toFixed(1)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/users/${user.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Detay Görüntüle
                        </Link>
                      </DropdownMenuItem>
                      {status === 'active' ? (
                        <DropdownMenuItem className="text-warning">
                          <Ban className="mr-2 h-4 w-4" />
                          Askıya Al
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-success">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aktif Et
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>

          {users.length === 0 && !loading && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Arama kriterlerine uygun kullanıcı bulunamadı
              </p>
            </div>
          )}

          {/* Pagination */}
          {total > limit && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {page * limit + 1} - {Math.min((page + 1) * limit, total)} /{' '}
                {total} kullanıcı
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * limit >= total}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

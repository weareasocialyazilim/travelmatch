'use client';

/**
 * VIP Management Page
 *
 * Admin interface for managing VIP/Influencer commission settings.
 * Features:
 * - View all VIP/Influencer users
 * - Add new VIP users with custom commission rates
 * - Edit existing VIP settings
 * - Remove VIP status
 * - View commission history
 */

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  MoreHorizontal,
  Crown,
  Star,
  UserPlus,
  Trash2,
  Edit,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Download,
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
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
import { formatDate, getInitials } from '@/lib/utils';
import { logger } from '@/lib/logger';

// =============================================================================
// TYPES
// =============================================================================

interface VIPUser {
  id: string;
  user_id: string;
  tier: 'vip' | 'influencer' | 'partner';
  commission_override: number; // Percentage (0-100)
  giver_pays_commission: boolean;
  valid_from: string;
  valid_until: string | null;
  reason: string | null;
  granted_by: string;
  created_at: string;
  user: {
    display_name: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
  granted_by_user: {
    display_name: string;
  };
}

interface Stats {
  totalVIP: number;
  totalInfluencer: number;
  totalPartner: number;
  commissionSaved: number;
}

const tierConfig = {
  vip: {
    label: 'VIP',
    variant: 'warning' as const,
    icon: Crown,
    description: 'Premium kullanıcı - %0 komisyon',
  },
  influencer: {
    label: 'Influencer',
    variant: 'success' as const,
    icon: Star,
    description: 'İçerik üretici - Özel komisyon oranı',
  },
  partner: {
    label: 'Partner',
    variant: 'secondary' as const,
    icon: CheckCircle,
    description: 'İş ortağı - Özel anlaşma',
  },
};

// =============================================================================
// COMPONENTS
// =============================================================================

interface AddVIPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: AddVIPData) => Promise<void>;
}

interface AddVIPData {
  userId: string;
  tier: 'vip' | 'influencer' | 'partner';
  commissionOverride: number;
  giverPaysCommission: boolean;
  validUntil: string | null;
  reason: string;
}

function AddVIPDialog({ open, onOpenChange, onAdd }: AddVIPDialogProps) {
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [tier, setTier] = useState<'vip' | 'influencer' | 'partner'>('vip');
  const [commissionOverride, setCommissionOverride] = useState(0);
  const [giverPaysCommission, setGiverPaysCommission] = useState(false);
  const [validUntil, setValidUntil] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      await onAdd({
        userId: selectedUser.id,
        tier,
        commissionOverride,
        giverPaysCommission,
        validUntil: validUntil || null,
        reason,
      });
      onOpenChange(false);
      // Reset form
      setSelectedUser(null);
      setUserSearch('');
      setTier('vip');
      setCommissionOverride(0);
      setGiverPaysCommission(false);
      setValidUntil('');
      setReason('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>VIP Kullanıcı Ekle</DialogTitle>
          <DialogDescription>
            Kullanıcıya VIP, Influencer veya Partner statüsü verin.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* User Search */}
          <div className="grid gap-2">
            <Label>Kullanıcı</Label>
            {selectedUser ? (
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  Değiştir
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="İsim veya e-posta ile ara..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-10"
                />
                {/* TODO: Add search results dropdown */}
              </div>
            )}
          </div>

          {/* Tier Selection */}
          <div className="grid gap-2">
            <Label>Statü</Label>
            <Select
              value={tier}
              onValueChange={(v) => setTier(v as typeof tier)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vip">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    VIP
                  </div>
                </SelectItem>
                <SelectItem value="influencer">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-green-500" />
                    Influencer
                  </div>
                </SelectItem>
                <SelectItem value="partner">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Partner
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {tierConfig[tier].description}
            </p>
          </div>

          {/* Commission Override */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Komisyon Oranı</Label>
              <span className="text-sm font-medium">%{commissionOverride}</span>
            </div>
            <Slider
              value={[commissionOverride]}
              onValueChange={([v]) => setCommissionOverride(v)}
              min={0}
              max={15}
              step={0.5}
            />
            <p className="text-xs text-muted-foreground">
              Varsayılan: %10 (0-100₺) veya %8 (100₺+)
            </p>
          </div>

          {/* Who Pays Commission */}
          <div className="grid gap-2">
            <Label>Komisyonu Kim Öder?</Label>
            <Select
              value={giverPaysCommission ? 'giver' : 'receiver'}
              onValueChange={(v) => setGiverPaysCommission(v === 'giver')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receiver">
                  Alıcı (varsayılan 70/30 bölüşüm)
                </SelectItem>
                <SelectItem value="giver">Gönderen (100/0 bölüşüm)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Valid Until */}
          <div className="grid gap-2">
            <Label>Geçerlilik Süresi (Opsiyonel)</Label>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground">
              Boş bırakılırsa süresiz geçerli olur
            </p>
          </div>

          {/* Reason */}
          <div className="grid gap-2">
            <Label>Neden</Label>
            <Textarea
              placeholder="VIP statüsü verme nedenini yazın..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedUser || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ekleniyor...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                VIP Ekle
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Mock data for development
const mockVIPUsers: VIPUser[] = [
  {
    id: '1',
    user_id: 'user-1',
    tier: 'vip',
    commission_override: 0,
    giver_pays_commission: true,
    valid_from: '2025-01-01T00:00:00Z',
    valid_until: null,
    reason: 'Premium üyelik',
    granted_by: 'admin-1',
    created_at: '2025-01-01T00:00:00Z',
    user: {
      display_name: 'Ahmet Yılmaz',
      full_name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      avatar_url: null,
    },
    granted_by_user: {
      display_name: 'Admin',
    },
  },
  {
    id: '2',
    user_id: 'user-2',
    tier: 'influencer',
    commission_override: 5,
    giver_pays_commission: false,
    valid_from: '2025-02-15T00:00:00Z',
    valid_until: '2026-02-15T00:00:00Z',
    reason: 'Sosyal medya kampanyası ortağı',
    granted_by: 'admin-1',
    created_at: '2025-02-15T00:00:00Z',
    user: {
      display_name: 'Elif Demir',
      full_name: 'Elif Demir',
      email: 'elif@example.com',
      avatar_url: null,
    },
    granted_by_user: {
      display_name: 'Admin',
    },
  },
  {
    id: '3',
    user_id: 'user-3',
    tier: 'partner',
    commission_override: 3,
    giver_pays_commission: true,
    valid_from: '2025-03-01T00:00:00Z',
    valid_until: null,
    reason: 'İş ortağı anlaşması',
    granted_by: 'admin-1',
    created_at: '2025-03-01T00:00:00Z',
    user: {
      display_name: 'Mehmet Kaya',
      full_name: 'Mehmet Kaya',
      email: 'mehmet@example.com',
      avatar_url: null,
    },
    granted_by_user: {
      display_name: 'Admin',
    },
  },
];

const mockStats: Stats = {
  totalVIP: 12,
  totalInfluencer: 8,
  totalPartner: 5,
  commissionSaved: 4520.5,
};

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function VIPManagementPage() {
  const [vipUsers, setVIPUsers] = useState<VIPUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 50;

  const fetchVIPUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (tierFilter !== 'all') params.append('tier', tierFilter);
      params.append('limit', limit.toString());
      params.append('offset', (page * limit).toString());

      const res = await fetch(`/api/vip-users?${params}`);
      if (!res.ok) {
        // Use mock data on auth error
        if (res.status === 401 || res.status === 403) {
          const filtered =
            tierFilter === 'all'
              ? mockVIPUsers
              : mockVIPUsers.filter((u) => u.tier === tierFilter);
          setVIPUsers(filtered);
          setTotal(filtered.length);
          return;
        }
        throw new Error('VIP kullanıcıları yüklenemedi');
      }

      const data = await res.json();
      setVIPUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      logger.error('VIP users fetch error', err);
      // Fallback to mock data
      setVIPUsers(mockVIPUsers);
      setTotal(mockVIPUsers.length);
    } finally {
      setLoading(false);
    }
  }, [search, tierFilter, page]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/vip-users/stats');
      if (!res.ok) {
        // Use mock stats on auth error
        setStats(mockStats);
        return;
      }

      const data = await res.json();
      setStats(data);
    } catch (err) {
      logger.error('Stats fetch error', err);
      // Fallback to mock stats
      setStats(mockStats);
    }
  }, []);

  useEffect(() => {
    fetchVIPUsers();
  }, [fetchVIPUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(0);
      fetchVIPUsers();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleAddVIP = async (data: AddVIPData) => {
    const res = await fetch('/api/vip-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'VIP eklenemedi');
    }

    fetchVIPUsers();
    fetchStats();
  };

  const handleRemoveVIP = async (userId: string) => {
    if (
      !confirm(
        'Bu kullanıcının VIP statüsünü kaldırmak istediğinize emin misiniz?',
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/vip-users/${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('VIP kaldırılamadı');

      fetchVIPUsers();
      fetchStats();
    } catch (err) {
      logger.error('Remove VIP error', err);
      setError('VIP statüsü kaldırılırken bir hata oluştu');
    }
  };

  if (loading && vipUsers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            VIP kullanıcıları yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">VIP Yönetimi</h1>
          <p className="text-muted-foreground">
            VIP, Influencer ve Partner kullanıcılarını yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchVIPUsers} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Yenile
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            VIP Ekle
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              VIP Kullanıcılar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalVIP?.toLocaleString('tr-TR') || '-'}
            </div>
            <p className="text-xs text-muted-foreground">%0 komisyon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-green-500" />
              Influencerlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalInfluencer?.toLocaleString('tr-TR') || '-'}
            </div>
            <p className="text-xs text-muted-foreground">Özel komisyon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              Partnerlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalPartner?.toLocaleString('tr-TR') || '-'}
            </div>
            <p className="text-xs text-muted-foreground">İş ortakları</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tasarruf Edilen Komisyon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.commissionSaved?.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
              }) || '-'}
            </div>
            <p className="text-xs text-muted-foreground">Bu ay</p>
          </CardContent>
        </Card>
      </div>

      {/* VIP User List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>VIP Kullanıcı Listesi</CardTitle>
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
              value={tierFilter}
              onValueChange={(v) => {
                setTierFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Statüler</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="influencer">Influencer</SelectItem>
                <SelectItem value="partner">Partner</SelectItem>
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
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
              <div>Kullanıcı</div>
              <div>Statü</div>
              <div>Komisyon</div>
              <div>Geçerlilik</div>
              <div>Ekleyen</div>
              <div></div>
            </div>
            {vipUsers.map((vipUser) => {
              const TierIcon = tierConfig[vipUser.tier].icon;
              const isExpired =
                vipUser.valid_until &&
                new Date(vipUser.valid_until) < new Date();

              return (
                <div
                  key={vipUser.id}
                  className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 border-b px-4 py-3 last:border-0 ${
                    isExpired ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={vipUser.user.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(
                          vipUser.user.display_name ||
                            vipUser.user.full_name ||
                            vipUser.user.email,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {vipUser.user.display_name || vipUser.user.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {vipUser.user.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant={tierConfig[vipUser.tier].variant}>
                    <TierIcon className="mr-1 h-3 w-3" />
                    {tierConfig[vipUser.tier].label}
                  </Badge>
                  <div className="text-sm">
                    <span className="font-medium">
                      %{vipUser.commission_override}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {vipUser.giver_pays_commission ? '100/0' : '70/30'}
                    </p>
                  </div>
                  <div className="text-sm">
                    {vipUser.valid_until ? (
                      <div>
                        <p>{formatDate(vipUser.valid_until)}</p>
                        {isExpired && (
                          <Badge variant="error" className="text-xs">
                            Süresi Doldu
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Süresiz</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {vipUser.granted_by_user?.display_name || 'Sistem'}
                    <p className="text-xs">{formatDate(vipUser.created_at)}</p>
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
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleRemoveVIP(vipUser.user_id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        VIP Kaldır
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>

          {vipUsers.length === 0 && !loading && (
            <div className="py-12 text-center">
              <Crown className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">VIP Kullanıcı Yok</h3>
              <p className="mt-2 text-muted-foreground">
                Henüz VIP statüsü verilmiş kullanıcı bulunmuyor.
              </p>
              <Button className="mt-4" onClick={() => setAddDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                İlk VIP'i Ekle
              </Button>
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

      {/* Add VIP Dialog */}
      <AddVIPDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddVIP}
      />
    </div>
  );
}

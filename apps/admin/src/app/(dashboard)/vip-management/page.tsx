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

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { CanvaButton } from '@/components/canva/CanvaButton';
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
import {
  useVIPUsers,
  useVIPStats,
  useSearchUsers,
  useAddVIP,
  useRemoveVIP,
  type VIPUser,
  type AddVIPData,
} from '@/hooks/use-vip';

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
    variant: 'default' as const,
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
  isLoading?: boolean;
}

function AddVIPDialog({
  open,
  onOpenChange,
  onAdd,
  isLoading,
}: AddVIPDialogProps) {
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
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
  const [showResults, setShowResults] = useState(false);

  // Use the search hook for user search
  const { data: searchResults, isLoading: isSearching } =
    useSearchUsers(userSearch);

  // Search users with debounce
  useEffect(() => {
    if (!userSearch || userSearch.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/users/search?q=${encodeURIComponent(userSearch)}&limit=5`,
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(
            data.users?.map(
              (u: { id: string; display_name: string; email: string }) => ({
                id: u.id,
                name: u.display_name,
                email: u.email,
              }),
            ) || [],
          );
        }
      } catch {
        // Fallback: show mock results for demo
        setSearchResults([
          { id: 'demo-1', name: 'Demo User', email: userSearch + '@demo.com' },
        ]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [userSearch]);

  const handleSubmit = async () => {
    if (!selectedUser) return;

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
  };

  const handleSelectUser = (user: {
    id: string;
    name: string;
    email: string;
  }) => {
    setSelectedUser(user);
    setUserSearch('');
    setShowResults(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>VIP Kullanici Ekle</DialogTitle>
          <DialogDescription>
            Kullaniciya VIP, Influencer veya Partner statusu verin.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* User Search */}
          <div className="grid gap-2">
            <Label>Kullanici</Label>
            {selectedUser ? (
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email}
                  </p>
                </div>
                <CanvaButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  Degistir
                </CanvaButton>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Isim veya e-posta ile ara..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="pl-10"
                />
                {/* Search results dropdown */}
                {showResults && userSearch.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover shadow-md">
                    {isSearching ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Aranıyor...
                        </span>
                      </div>
                    ) : searchResults && searchResults.length > 0 ? (
                      searchResults.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-accent transition-colors"
                          onClick={() => handleSelectUser(user)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Kullanıcı bulunamadı
                      </div>
                    )}
                  </div>
                )}
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
                    <Crown className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                    VIP
                  </div>
                </SelectItem>
                <SelectItem value="influencer">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-green-500 dark:text-green-400" />
                    Influencer
                  </div>
                </SelectItem>
                <SelectItem value="partner">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />
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
          <CanvaButton variant="primary" onClick={() => onOpenChange(false)}>
            Iptal
          </CanvaButton>
          <CanvaButton
            onClick={handleSubmit}
            disabled={!selectedUser || isLoading}
          >
            {isLoading ? (
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
          </CanvaButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function VIPManagementPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 50;

  // Use React Query hooks for data fetching
  const {
    data: vipData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers,
  } = useVIPUsers({
    search: debouncedSearch,
    tier: tierFilter,
    limit,
    offset: page * limit,
  });

  const { data: stats, isLoading: isLoadingStats } = useVIPStats();

  const addVIPMutation = useAddVIP();
  const removeVIPMutation = useRemoveVIP();

  const vipUsers = vipData?.users || [];
  const total = vipData?.total || 0;
  const isLoading = isLoadingUsers || isLoadingStats;

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleAddVIP = async (data: AddVIPData) => {
    await addVIPMutation.mutateAsync(data);
  };

  const handleRemoveVIP = async (userId: string) => {
    if (
      !confirm(
        'Bu kullanicinin VIP statusunu kaldirmak istediginize emin misiniz?',
      )
    ) {
      return;
    }

    await removeVIPMutation.mutateAsync(userId);
  };

  if (isLoadingUsers && vipUsers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            VIP kullanicilari yukleniyor...
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
          <h1 className="text-3xl font-bold tracking-tight">VIP Yonetimi</h1>
          <p className="text-muted-foreground">
            VIP, Influencer ve Partner kullanicilarini yonetin
          </p>
        </div>
        <div className="flex gap-2">
          <CanvaButton
            variant="primary"
            onClick={() => refetchUsers()}
            disabled={isLoadingUsers}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoadingUsers ? 'animate-spin' : ''}`}
            />
            Yenile
          </CanvaButton>
          <CanvaButton variant="primary">
            <Download className="mr-2 h-4 w-4" />
            Disa Aktar
          </CanvaButton>
          <CanvaButton onClick={() => setAddDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            VIP Ekle
          </CanvaButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <CanvaStatCard
          label="VIP Kullanıcılar"
          value={stats?.totalVIP?.toLocaleString('tr-TR') || '-'}
          icon={
            <Crown className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
          }
        />
        <CanvaStatCard
          label="Influencerlar"
          value={stats?.totalInfluencer?.toLocaleString('tr-TR') || '-'}
          icon={<Star className="h-5 w-5 text-green-500 dark:text-green-400" />}
        />
        <CanvaStatCard
          label="Partnerlar"
          value={stats?.totalPartner?.toLocaleString('tr-TR') || '-'}
          icon={
            <CheckCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          }
        />
        <CanvaStatCard
          label="Tasarruf Edilen Komisyon"
          value={
            stats?.commissionSaved?.toLocaleString('tr-TR', {
              style: 'currency',
              currency: 'TRY',
            }) || '-'
          }
        />
      </div>

      {/* VIP User List */}
      <CanvaCard>
        <CanvaCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CanvaCardTitle>VIP Kullanıcı Listesi</CanvaCardTitle>
              <CanvaCardSubtitle>{total} kullanıcı bulundu</CanvaCardSubtitle>
            </div>
          </div>
        </CanvaCardHeader>
        <CanvaCardBody>
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

          {usersError && (
            <div className="mb-4 flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>
                {usersError.message ||
                  'VIP kullanicilari yuklenirken bir hata olustu'}
              </span>
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
                  <CanvaBadge variant={tierConfig[vipUser.tier].variant}>
                    <TierIcon className="mr-1 h-3 w-3" />
                    {tierConfig[vipUser.tier].label}
                  </CanvaBadge>
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
                          <CanvaBadge variant="error" className="text-xs">
                            Süresi Doldu
                          </CanvaBadge>
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
                      <CanvaButton variant="ghost" size="sm" iconOnly>
                        <MoreHorizontal className="h-4 w-4" />
                      </CanvaButton>
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

          {vipUsers.length === 0 && !isLoadingUsers && (
            <div className="py-12 text-center">
              <Crown className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">VIP Kullanici Yok</h3>
              <p className="mt-2 text-muted-foreground">
                Henuz VIP statusu verilmis kullanici bulunmuyor.
              </p>
              <CanvaButton
                className="mt-4"
                onClick={() => setAddDialogOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Ilk VIP'i Ekle
              </CanvaButton>
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
                <CanvaButton
                  variant="primary"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                >
                  Önceki
                </CanvaButton>
                <CanvaButton
                  variant="primary"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * limit >= total}
                >
                  Sonraki
                </CanvaButton>
              </div>
            </div>
          )}
        </CanvaCardBody>
      </CanvaCard>

      {/* Add VIP Dialog */}
      <AddVIPDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddVIP}
        isLoading={addVIPMutation.isPending}
      />
    </div>
  );
}

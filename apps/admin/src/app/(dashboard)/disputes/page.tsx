'use client';

import { useState } from 'react';
import {
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  MessageSquare,
  Loader2,
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
import { toast } from 'sonner';
import { formatRelativeDate, getInitials } from '@/lib/utils';
import {
  useDisputes,
  useResolveDispute,
  useRejectDispute,
} from '@/hooks/use-disputes';

const statusConfig = {
  pending: { label: 'Açık', variant: 'error' as const },
  under_review: { label: 'İnceleniyor', variant: 'warning' as const },
  resolved: { label: 'Çözüldü', variant: 'success' as const },
  rejected: { label: 'Reddedildi', variant: 'default' as const },
};

const typeConfig = {
  scam: { label: 'Dolandırıcılık', color: 'text-red-600' },
  harassment: { label: 'Taciz', color: 'text-orange-600' },
  inappropriate: { label: 'Uygunsuz İçerik', color: 'text-yellow-600' },
  spam: { label: 'Spam', color: 'text-blue-600' },
  payment: { label: 'Ödeme', color: 'text-purple-600' },
  other: { label: 'Diğer', color: 'text-gray-600' },
};

export default function DisputesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Use real API data
  const { data, isLoading, error } = useDisputes({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const resolveDispute = useResolveDispute();
  const rejectDispute = useRejectDispute();

  const disputes = data?.disputes || [];

  // Client-side filtering for search and type
  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      search === '' ||
      dispute.requester?.display_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      dispute.responder?.display_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      dispute.description?.toLowerCase().includes(search.toLowerCase()) ||
      dispute.reason?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || dispute.reason === typeFilter;
    return matchesSearch && matchesType;
  });

  const pendingCount = disputes.filter((d) => d.status === 'pending').length;
  const underReviewCount = disputes.filter(
    (d) => d.status === 'under_review',
  ).length;

  const handleResolve = (disputeId: string) => {
    resolveDispute.mutate(
      { id: disputeId, resolution: 'Çözüme kavuşturuldu' },
      {
        onSuccess: () => {
          toast.success('Anlaşmazlık çözüldü olarak işaretlendi');
        },
        onError: (error) => {
          toast.error(error.message || 'Bir hata oluştu');
        },
      },
    );
  };

  const handleReject = (disputeId: string) => {
    rejectDispute.mutate(
      { id: disputeId, resolution: 'Şikayet geçersiz bulundu' },
      {
        onSuccess: () => {
          toast.success('Anlaşmazlık reddedildi');
        },
        onError: (error) => {
          toast.error(error.message || 'Bir hata oluştu');
        },
      },
    );
  };

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">Bir hata oluştu</h2>
          <p className="text-muted-foreground">
            Anlaşmazlıklar yüklenemedi. Lütfen tekrar deneyin.
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
          <h1 className="text-3xl font-bold tracking-tight">Anlaşmazlıklar</h1>
          <p className="text-muted-foreground">
            Kullanıcı şikayetlerini inceleyin ve çözümleyin
          </p>
        </div>
        <div className="flex gap-2">
          <CanvaBadge variant="error" className="h-8 px-3 text-sm">
            {pendingCount} açık
          </CanvaBadge>
          <CanvaBadge variant="warning" className="h-8 px-3 text-sm">
            {underReviewCount} inceleniyor
          </CanvaBadge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <CanvaStatCard
          title="Açık Şikayetler"
          value={isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : pendingCount}
          subtitle="Acil ilgi bekliyor"
          valueClassName="text-red-600"
        />
        <CanvaStatCard
          title="İncelenen"
          value={isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : underReviewCount}
          subtitle="Değerlendirme altında"
          valueClassName="text-yellow-600"
        />
        <CanvaStatCard
          title="Toplam"
          value={isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (data?.total || 0)}
          subtitle="Tüm anlaşmazlıklar"
        />
        <CanvaStatCard
          title="Ort. Çözüm Süresi"
          value="4.2"
          subtitle="saat"
        />
      </div>

      {/* Dispute List */}
      <CanvaCard>
        <CanvaCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CanvaCardTitle>Şikayet Listesi</CanvaCardTitle>
              <CanvaCardSubtitle>
                Tüm kullanıcı şikayetlerini görüntüleyin ve yönetin
              </CanvaCardSubtitle>
            </div>
          </div>
        </CanvaCardHeader>
        <CanvaCardBody>
          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı veya açıklama ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Açık</SelectItem>
                <SelectItem value="under_review">İnceleniyor</SelectItem>
                <SelectItem value="resolved">Çözüldü</SelectItem>
                <SelectItem value="rejected">Reddedildi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value="scam">Dolandırıcılık</SelectItem>
                <SelectItem value="harassment">Taciz</SelectItem>
                <SelectItem value="inappropriate">Uygunsuz İçerik</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="payment">Ödeme</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Table */}
          {!isLoading && (
            <div className="space-y-3">
              {filteredDisputes.map((dispute) => {
                const statusInfo =
                  statusConfig[dispute.status as keyof typeof statusConfig] ||
                  statusConfig.pending;
                const typeInfo =
                  typeConfig[dispute.reason as keyof typeof typeConfig] ||
                  typeConfig.other;

                return (
                  <div
                    key={dispute.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <AlertTriangle
                          className={`h-5 w-5 ${typeInfo.color}`}
                        />
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <span className={`font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          <CanvaBadge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </CanvaBadge>
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground line-clamp-1">
                          {dispute.description || dispute.reason}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span>Şikayet eden:</span>
                            <Avatar className="h-4 w-4">
                              <AvatarImage
                                src={dispute.requester?.avatar_url || undefined}
                              />
                              <AvatarFallback className="text-[8px]">
                                {getInitials(
                                  dispute.requester?.display_name ||
                                    'Bilinmiyor',
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {dispute.requester?.display_name || 'Bilinmiyor'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Hakkında:</span>
                            <Avatar className="h-4 w-4">
                              <AvatarImage
                                src={dispute.responder?.avatar_url || undefined}
                              />
                              <AvatarFallback className="text-[8px]">
                                {getInitials(
                                  dispute.responder?.display_name ||
                                    'Bilinmiyor',
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {dispute.responder?.display_name || 'Bilinmiyor'}
                            </span>
                          </div>
                          <span>{formatRelativeDate(dispute.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CanvaButton size="sm" variant="primary">
                        <Eye className="mr-1 h-4 w-4" />
                        İncele
                      </CanvaButton>
                      {(dispute.status === 'pending' ||
                        dispute.status === 'under_review') && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <CanvaButton size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </CanvaButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Kullanıcıya Mesaj
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => handleResolve(dispute.id)}
                              disabled={resolveDispute.isPending}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {resolveDispute.isPending
                                ? 'İşleniyor...'
                                : 'Çözüldü İşaretle'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-muted-foreground"
                              onClick={() => handleReject(dispute.id)}
                              disabled={rejectDispute.isPending}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              {rejectDispute.isPending
                                ? 'İşleniyor...'
                                : 'Reddet'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && filteredDisputes.length === 0 && (
            <div className="py-12 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-semibold">Şikayet bulunamadı</h3>
              <p className="text-muted-foreground">
                Arama kriterlerine uygun şikayet yok
              </p>
            </div>
          )}
        </CanvaCardBody>
      </CanvaCard>
    </div>
  );
}

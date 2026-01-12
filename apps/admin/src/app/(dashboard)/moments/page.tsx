'use client';

import { useState } from 'react';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatRelativeDate, getInitials } from '@/lib/utils';
import {
  useMoments,
  useApproveMoment,
  useRejectMoment,
} from '@/hooks/use-moments';

// Allowed URL protocols whitelist - defined as constant for security
const ALLOWED_PROTOCOLS = new Set(['https:', 'http:']);

/**
 * SafeImage Component - Prevents XSS by validating URLs before rendering
 *
 * Security measures:
 * 1. Type checking: Only accepts string URLs
 * 2. Length validation: Prevents buffer overflow attacks
 * 3. Protocol whitelist: Only allows http/https (blocks javascript:, data:, etc.)
 * 4. URL parsing: Validates URL structure
 * 5. Re-serialization: Returns parsed.href to ensure proper encoding
 */
function SafeImage({
  src,
  alt,
  className,
  fallback,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}) {
  // Validate URL at render time - completely isolated from state flow
  const validatedSrc = (() => {
    // Type guard
    if (!src || typeof src !== 'string') return null;

    // Length check
    const trimmed = src.trim();
    if (trimmed.length === 0 || trimmed.length > 2048) return null;

    try {
      // Parse and validate
      const parsed = new URL(trimmed);
      // Protocol whitelist check
      if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return null;
      // Return re-serialized URL (safe)
      return parsed.href;
    } catch (urlParseError) {
      return null;
    }
  })();

  if (!validatedSrc) {
    return fallback ? <>{fallback}</> : null;
  }

  // At this point, validatedSrc is guaranteed to be a safe http/https URL
  return <img src={validatedSrc} alt={alt} className={className} />;
}

// Legacy function kept for backward compatibility
function createSafeImageSrc(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) return '';
  try {
    const parsed = new URL(trimmed);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return '';
    return parsed.href;
  } catch (createUrlError) {
    return '';
  }
}

const statusConfig = {
  pending: { label: 'Bekliyor', variant: 'warning' as const, icon: Clock },
  approved: {
    label: 'Onaylandı',
    variant: 'success' as const,
    icon: CheckCircle,
  },
  rejected: { label: 'Reddedildi', variant: 'error' as const, icon: XCircle },
};

interface Moment {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_featured: boolean;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

export default function MomentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);

  // Use real API data
  const { data, isLoading, error } = useMoments({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const approveMoment = useApproveMoment();
  const rejectMoment = useRejectMoment();

  const moments = data?.moments || [];

  // Client-side filtering for search
  const filteredMoments = moments.filter((moment: Moment) => {
    const matchesSearch =
      search === '' ||
      moment.caption?.toLowerCase().includes(search.toLowerCase()) ||
      moment.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      moment.location?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const pendingCount = moments.filter(
    (m: Moment) => m.status === 'pending',
  ).length;

  const handleApprove = (momentId: string) => {
    approveMoment.mutate(momentId, {
      onSuccess: () => {
        toast.success('Moment onaylandı');
        setSelectedMoment(null);
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Bir hata oluştu');
      },
    });
  };

  const handleReject = (momentId: string) => {
    rejectMoment.mutate(
      { id: momentId, reason: 'İçerik politikalarına uygun değil' },
      {
        onSuccess: () => {
          toast.success('Moment reddedildi');
          setSelectedMoment(null);
        },
        onError: (error: Error) => {
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
            Momentler yüklenemedi. Lütfen tekrar deneyin.
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
          <h1 className="text-3xl font-bold tracking-tight">Momentler</h1>
          <p className="text-muted-foreground">
            Kullanıcı paylaşımlarını inceleyin ve yönetin
          </p>
        </div>
        <CanvaBadge variant="warning" className="h-8 px-3 text-sm">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            `${pendingCount} onay bekliyor`
          )}
        </CanvaBadge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <CanvaStatCard
          title="Toplam Moment"
          value={isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (data?.total || 0)}
          subtitle="Tüm momentler"
        />
        <CanvaStatCard
          title="Onay Bekleyen"
          value={isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : pendingCount}
          subtitle="İnceleme bekliyor"
          valueClassName="text-yellow-600"
        />
        <CanvaStatCard
          title="Onaylanan"
          value={isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : moments.filter((m: Moment) => m.status === 'approved').length}
          subtitle="Yayında"
          valueClassName="text-green-600"
        />
        <CanvaStatCard
          title="Reddedilen"
          value={isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : moments.filter((m: Moment) => m.status === 'rejected').length}
          subtitle="Bu dönem"
          valueClassName="text-red-600"
        />
      </div>

      {/* Moment List */}
      <CanvaCard>
        <CanvaCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CanvaCardTitle>İçerik Moderasyonu</CanvaCardTitle>
              <CanvaCardSubtitle>
                Paylaşımları inceleyin, onaylayın veya reddedin
              </CanvaCardSubtitle>
            </div>
          </div>
        </CanvaCardHeader>
        <CanvaCardBody>
          {/* Filters */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Başlık veya kullanıcı ara..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="pending">Bekleyen</SelectItem>
                <SelectItem value="approved">Onaylanan</SelectItem>
                <SelectItem value="rejected">Reddedilen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Grid */}
          {!isLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMoments.map((moment: Moment) => {
                const statusInfo =
                  statusConfig[moment.status as keyof typeof statusConfig] ||
                  statusConfig.pending;
                const StatusIcon = statusInfo.icon;
                // Avatar URL for user display
                const safeAvatarUrl = createSafeImageSrc(
                  moment.user?.avatar_url,
                );

                return (
                  <CanvaCard key={moment.id} className="overflow-hidden">
                    {/* Image - Using SafeImage component for XSS protection */}
                    <div className="relative aspect-video bg-muted">
                      <SafeImage
                        src={moment.media_url}
                        alt={moment.caption || 'Moment'}
                        className="h-full w-full object-cover"
                        fallback={
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        }
                      />
                      <div className="absolute right-2 top-2">
                        <CanvaBadge variant={statusInfo.variant}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusInfo.label}
                        </CanvaBadge>
                      </div>
                    </div>
                    <CanvaCardBody className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={safeAvatarUrl} />
                          <AvatarFallback className="text-xs">
                            {getInitials(moment.user?.full_name || 'Kullanıcı')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {moment.user?.full_name || 'Bilinmiyor'}
                        </span>
                      </div>
                      <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                        {moment.caption || 'Açıklama yok'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {moment.location || 'Konum belirtilmemiş'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeDate(moment.created_at)}
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <CanvaButton
                          size="sm"
                          variant="primary"
                          className="flex-1"
                          onClick={() => setSelectedMoment(moment)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          İncele
                        </CanvaButton>
                        {moment.status === 'pending' && (
                          <>
                            <CanvaButton
                              size="sm"
                              variant="primary"
                              className="flex-1"
                              onClick={() => handleApprove(moment.id)}
                              disabled={approveMoment.isPending}
                            >
                              {approveMoment.isPending ? (
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-1 h-4 w-4" />
                              )}
                              Onayla
                            </CanvaButton>
                            <CanvaButton
                              size="sm"
                              variant="danger"
                              onClick={() => handleReject(moment.id)}
                              disabled={rejectMoment.isPending}
                            >
                              {rejectMoment.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </CanvaButton>
                          </>
                        )}
                      </div>
                    </CanvaCardBody>
                  </CanvaCard>
                );
              })}
            </div>
          )}

          {!isLoading && filteredMoments.length === 0 && (
            <div className="py-12 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Moment bulunamadı</h3>
              <p className="text-muted-foreground">
                Arama kriterlerine uygun içerik yok
              </p>
            </div>
          )}
        </CanvaCardBody>
      </CanvaCard>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedMoment}
        onOpenChange={() => setSelectedMoment(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMoment?.caption || 'Moment Detayı'}
            </DialogTitle>
            <DialogDescription>
              {selectedMoment?.user?.full_name || 'Kullanıcı'} tarafından
              paylaşıldı
            </DialogDescription>
          </DialogHeader>
          {/* Dialog content with SafeImage for XSS protection */}
          <div className="space-y-4">
            <div className="aspect-video rounded-lg bg-muted overflow-hidden">
              <SafeImage
                src={selectedMoment?.media_url}
                alt={selectedMoment?.caption || 'Moment'}
                className="h-full w-full object-cover"
                fallback={
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                }
              />
            </div>
            <div>
              <h4 className="mb-1 font-medium">Açıklama</h4>
              <p className="text-muted-foreground">
                {selectedMoment?.caption || 'Açıklama yok'}
              </p>
            </div>
            <div>
              <h4 className="mb-1 font-medium">Konum</h4>
              <p className="text-muted-foreground">
                {selectedMoment?.location || 'Konum belirtilmemiş'}
              </p>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{selectedMoment?.likes_count || 0} beğeni</span>
              <span>{selectedMoment?.comments_count || 0} yorum</span>
              <span>{selectedMoment?.views_count || 0} görüntüleme</span>
            </div>
          </div>
          <DialogFooter>
            <CanvaButton
              variant="primary"
              onClick={() => setSelectedMoment(null)}
            >
              Kapat
            </CanvaButton>
            {selectedMoment?.status === 'pending' && (
              <>
                <CanvaButton
                  variant="danger"
                  onClick={() =>
                    selectedMoment && handleReject(selectedMoment.id)
                  }
                  disabled={rejectMoment.isPending}
                >
                  {rejectMoment.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Reddet
                </CanvaButton>
                <CanvaButton
                  onClick={() =>
                    selectedMoment && handleApprove(selectedMoment.id)
                  }
                  disabled={approveMoment.isPending}
                >
                  {approveMoment.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Onayla
                </CanvaButton>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

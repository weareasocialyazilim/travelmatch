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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { formatRelativeDate, getInitials } from '@/lib/utils';
import { useMoments, useApproveMoment, useRejectMoment } from '@/hooks/use-moments';

// Sanitize URL to prevent XSS attacks
function sanitizeMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return url;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

const statusConfig = {
  pending: { label: 'Bekliyor', variant: 'warning' as const, icon: Clock },
  approved: { label: 'Onaylandı', variant: 'success' as const, icon: CheckCircle },
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
    display_name: string;
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
      moment.user?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
      moment.location?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const pendingCount = moments.filter((m: Moment) => m.status === 'pending').length;

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
      }
    );
  };

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">Bir hata oluştu</h2>
          <p className="text-muted-foreground">Momentler yüklenemedi. Lütfen tekrar deneyin.</p>
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
        <Badge variant="warning" className="h-8 px-3 text-sm">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : `${pendingCount} onay bekliyor`}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Moment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : data?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">Tüm momentler</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Onay Bekleyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : pendingCount}
            </div>
            <p className="text-xs text-muted-foreground">İnceleme bekliyor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                moments.filter((m: Moment) => m.status === 'approved').length
              )}
            </div>
            <p className="text-xs text-muted-foreground">Yayında</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reddedilen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                moments.filter((m: Moment) => m.status === 'rejected').length
              )}
            </div>
            <p className="text-xs text-muted-foreground">Bu dönem</p>
          </CardContent>
        </Card>
      </div>

      {/* Moment List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>İçerik Moderasyonu</CardTitle>
              <CardDescription>
                Paylaşımları inceleyin, onaylayın veya reddedin
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Başlık veya kullanıcı ara..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
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
                const statusInfo = statusConfig[moment.status as keyof typeof statusConfig] || statusConfig.pending;
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={moment.id} className="overflow-hidden">
                    {/* Image */}
                    <div className="relative aspect-video bg-muted">
                      {sanitizeMediaUrl(moment.media_url) ? (
                        <img
                          src={sanitizeMediaUrl(moment.media_url)}
                          alt={moment.caption || 'Moment'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute right-2 top-2">
                        <Badge variant={statusInfo.variant}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={sanitizeMediaUrl(moment.user?.avatar_url)} />
                          <AvatarFallback className="text-xs">
                            {getInitials(moment.user?.display_name || 'Kullanıcı')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {moment.user?.display_name || 'Bilinmiyor'}
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedMoment(moment)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          İncele
                        </Button>
                        {moment.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
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
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(moment.id)}
                              disabled={rejectMoment.isPending}
                            >
                              {rejectMoment.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedMoment} onOpenChange={() => setSelectedMoment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMoment?.caption || 'Moment Detayı'}</DialogTitle>
            <DialogDescription>
              {selectedMoment?.user?.display_name || 'Kullanıcı'} tarafından paylaşıldı
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video rounded-lg bg-muted overflow-hidden">
              {sanitizeMediaUrl(selectedMoment?.media_url) ? (
                <img
                  src={sanitizeMediaUrl(selectedMoment?.media_url)}
                  alt={selectedMoment?.caption || 'Moment'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
                </div>
              )}
            </div>
            <div>
              <h4 className="mb-1 font-medium">Açıklama</h4>
              <p className="text-muted-foreground">{selectedMoment?.caption || 'Açıklama yok'}</p>
            </div>
            <div>
              <h4 className="mb-1 font-medium">Konum</h4>
              <p className="text-muted-foreground">{selectedMoment?.location || 'Konum belirtilmemiş'}</p>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{selectedMoment?.likes_count || 0} beğeni</span>
              <span>{selectedMoment?.comments_count || 0} yorum</span>
              <span>{selectedMoment?.views_count || 0} görüntüleme</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMoment(null)}>
              Kapat
            </Button>
            {selectedMoment?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => selectedMoment && handleReject(selectedMoment.id)}
                  disabled={rejectMoment.isPending}
                >
                  {rejectMoment.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Reddet
                </Button>
                <Button
                  onClick={() => selectedMoment && handleApprove(selectedMoment.id)}
                  disabled={approveMoment.isPending}
                >
                  {approveMoment.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Onayla
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

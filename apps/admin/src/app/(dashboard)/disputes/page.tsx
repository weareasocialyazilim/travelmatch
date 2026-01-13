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
  X,
  User,
  Calendar,
  Clock,
  FileText,
  Shield,
  Send,
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
import { Textarea } from '@/components/ui/textarea';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  scam: { label: 'Dolandırıcılık', color: 'text-red-600 dark:text-red-400' },
  harassment: { label: 'Taciz', color: 'text-orange-600 dark:text-orange-400' },
  inappropriate: {
    label: 'Uygunsuz İçerik',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  spam: { label: 'Spam', color: 'text-blue-600 dark:text-blue-400' },
  payment: { label: 'Ödeme', color: 'text-purple-600 dark:text-purple-400' },
  other: { label: 'Diğer', color: 'text-muted-foreground' },
};

const priorityConfig = {
  urgent: {
    label: 'Acil',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/10 dark:bg-red-500/20',
  },
  high: {
    label: 'Yüksek',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
  },
  medium: {
    label: 'Orta',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
  },
  low: { label: 'Düşük', color: 'text-muted-foreground', bg: 'bg-muted' },
};

interface Dispute {
  id: string;
  requester_id?: string;
  responder_id?: string;
  request_id?: string;
  reason: string;
  description?: string;
  status: 'pending' | 'under_review' | 'resolved' | 'rejected';
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  assigned_to?: string;
  resolution?: string;
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  resolved_by?: string;
  requester?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  responder?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

export default function DisputesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [adminMessage, setAdminMessage] = useState('');

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

  const openDetailModal = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setResolutionNote('');
    setAdminMessage('');
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedDispute(null);
    setResolutionNote('');
    setAdminMessage('');
  };

  const handleResolve = (disputeId: string, resolution?: string) => {
    resolveDispute.mutate(
      {
        id: disputeId,
        resolution: resolution || resolutionNote || 'Çözüme kavuşturuldu',
      },
      {
        onSuccess: () => {
          toast.success('Anlaşmazlık çözüldü olarak işaretlendi');
          closeDetailModal();
        },
        onError: (error) => {
          toast.error(error.message || 'Bir hata oluştu');
        },
      },
    );
  };

  const handleReject = (disputeId: string, resolution?: string) => {
    rejectDispute.mutate(
      {
        id: disputeId,
        resolution: resolution || resolutionNote || 'Şikayet geçersiz bulundu',
      },
      {
        onSuccess: () => {
          toast.success('Anlaşmazlık reddedildi');
          closeDetailModal();
        },
        onError: (error) => {
          toast.error(error.message || 'Bir hata oluştu');
        },
      },
    );
  };

  const handleSendMessage = () => {
    if (!adminMessage.trim()) {
      toast.error('Lütfen bir mesaj girin');
      return;
    }
    // In production, this would send a message to the user
    toast.success('Mesaj gönderildi');
    setAdminMessage('');
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
          label="Açık Şikayetler"
          value={
            isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              pendingCount
            )
          }
          change={{ value: 0, label: 'Acil ilgi bekliyor' }}
          icon={
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          }
        />
        <CanvaStatCard
          label="İncelenen"
          value={
            isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              underReviewCount
            )
          }
          change={{ value: 0, label: 'Değerlendirme altında' }}
          icon={
            <Eye className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          }
        />
        <CanvaStatCard
          label="Toplam"
          value={
            isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              data?.total || 0
            )
          }
          change={{ value: 0, label: 'Tüm anlaşmazlıklar' }}
          icon={<FileText className="h-5 w-5 text-muted-foreground" />}
        />
        <CanvaStatCard
          label="Ort. Çözüm Süresi"
          value="4.2 saat"
          change={{ value: -12, label: 'Geçen haftaya göre' }}
          icon={
            <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
          }
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
                      <CanvaButton
                        size="sm"
                        variant="primary"
                        onClick={() => openDetailModal(dispute)}
                      >
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
                              className="text-green-600 dark:text-green-400"
                              onClick={() =>
                                handleResolve(dispute.id, 'Çözüme kavuşturuldu')
                              }
                              disabled={resolveDispute.isPending}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {resolveDispute.isPending
                                ? 'İşleniyor...'
                                : 'Çözüldü İşaretle'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-muted-foreground"
                              onClick={() =>
                                handleReject(
                                  dispute.id,
                                  'Şikayet geçersiz bulundu',
                                )
                              }
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
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 dark:text-green-400" />
              <h3 className="mt-4 text-lg font-semibold">Şikayet bulunamadı</h3>
              <p className="text-muted-foreground">
                Arama kriterlerine uygun şikayet yok
              </p>
            </div>
          )}
        </CanvaCardBody>
      </CanvaCard>

      {/* Dispute Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Anlaşmazlık Detayı
            </DialogTitle>
          </DialogHeader>

          {selectedDispute && (
            <div className="space-y-6">
              {/* Status & Type Header */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${priorityConfig[selectedDispute.priority as keyof typeof priorityConfig]?.bg || 'bg-muted'}`}
                  >
                    <AlertTriangle
                      className={`h-5 w-5 ${typeConfig[selectedDispute.reason as keyof typeof typeConfig]?.color || 'text-muted-foreground'}`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold ${typeConfig[selectedDispute.reason as keyof typeof typeConfig]?.color || 'text-muted-foreground'}`}
                      >
                        {typeConfig[
                          selectedDispute.reason as keyof typeof typeConfig
                        ]?.label || selectedDispute.reason}
                      </span>
                      <CanvaBadge
                        variant={
                          statusConfig[
                            selectedDispute.status as keyof typeof statusConfig
                          ]?.variant || 'default'
                        }
                      >
                        {statusConfig[
                          selectedDispute.status as keyof typeof statusConfig
                        ]?.label || selectedDispute.status}
                      </CanvaBadge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      ID: {selectedDispute.id}
                    </p>
                  </div>
                </div>
                {selectedDispute.priority && (
                  <CanvaBadge
                    variant={
                      selectedDispute.priority === 'urgent'
                        ? 'error'
                        : selectedDispute.priority === 'high'
                          ? 'warning'
                          : 'default'
                    }
                  >
                    {priorityConfig[
                      selectedDispute.priority as keyof typeof priorityConfig
                    ]?.label || selectedDispute.priority}
                  </CanvaBadge>
                )}
              </div>

              {/* Users Involved */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <User className="h-4 w-4" />
                    Şikayet Eden
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedDispute.requester?.avatar_url || undefined}
                      />
                      <AvatarFallback>
                        {getInitials(
                          selectedDispute.requester?.display_name ||
                            'Bilinmiyor',
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {selectedDispute.requester?.display_name ||
                          'Bilinmiyor'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {selectedDispute.requester_id || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <User className="h-4 w-4" />
                    Şikayet Edilen
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedDispute.responder?.avatar_url || undefined}
                      />
                      <AvatarFallback>
                        {getInitials(
                          selectedDispute.responder?.display_name ||
                            'Bilinmiyor',
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {selectedDispute.responder?.display_name ||
                          'Bilinmiyor'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {selectedDispute.responder_id || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <FileText className="h-4 w-4" />
                  Açıklama
                </div>
                <p className="text-foreground">
                  {selectedDispute.description ||
                    selectedDispute.reason ||
                    'Açıklama yok'}
                </p>
              </div>

              {/* Timeline */}
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Calendar className="h-4 w-4" />
                  Zaman Çizelgesi
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Oluşturulma:</span>
                    <span>
                      {selectedDispute.created_at
                        ? new Date(selectedDispute.created_at).toLocaleString(
                            'tr-TR',
                          )
                        : '-'}
                    </span>
                  </div>
                  {selectedDispute.updated_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Son Güncelleme:
                      </span>
                      <span>
                        {new Date(selectedDispute.updated_at).toLocaleString(
                          'tr-TR',
                        )}
                      </span>
                    </div>
                  )}
                  {selectedDispute.resolved_at && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Çözülme:</span>
                      <span>
                        {new Date(selectedDispute.resolved_at).toLocaleString(
                          'tr-TR',
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution (if exists) */}
              {selectedDispute.resolution && (
                <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10 dark:bg-green-500/20">
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mb-3">
                    <CheckCircle className="h-4 w-4" />
                    Çözüm
                  </div>
                  <p className="text-foreground">
                    {selectedDispute.resolution}
                  </p>
                </div>
              )}

              {/* Admin Message Section */}
              {(selectedDispute.status === 'pending' ||
                selectedDispute.status === 'under_review') && (
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MessageSquare className="h-4 w-4" />
                    Kullanıcıya Mesaj Gönder
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Mesajınızı yazın..."
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      className="flex-1"
                      rows={2}
                    />
                    <CanvaButton variant="outline" onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </CanvaButton>
                  </div>
                </div>
              )}

              {/* Resolution Note Input */}
              {(selectedDispute.status === 'pending' ||
                selectedDispute.status === 'under_review') && (
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <FileText className="h-4 w-4" />
                    Çözüm Notu
                  </div>
                  <Textarea
                    placeholder="Çözüm notlarınızı yazın..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <CanvaButton variant="outline" onClick={closeDetailModal}>
                  Kapat
                </CanvaButton>
                {(selectedDispute.status === 'pending' ||
                  selectedDispute.status === 'under_review') && (
                  <>
                    <CanvaButton
                      variant="danger"
                      onClick={() => handleReject(selectedDispute.id)}
                      disabled={rejectDispute.isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {rejectDispute.isPending ? 'İşleniyor...' : 'Reddet'}
                    </CanvaButton>
                    <CanvaButton
                      variant="success"
                      onClick={() => handleResolve(selectedDispute.id)}
                      disabled={resolveDispute.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {resolveDispute.isPending
                        ? 'İşleniyor...'
                        : 'Çözüldü İşaretle'}
                    </CanvaButton>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

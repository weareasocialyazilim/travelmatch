'use client';

import { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Send,
  Paperclip,
  MoreHorizontal,
  Phone,
  Mail,
  ExternalLink,
  Timer,
  TrendingUp,
  TrendingDown,
  Inbox,
  Archive,
  RefreshCw,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatRelativeDate, getInitials, cn } from '@/lib/utils';
import {
  useSupport,
  useUpdateTicket,
  useSendMessage,
  type SupportTicket,
  type SupportMessage,
} from '@/hooks/use-support';
import { toast } from 'sonner';

// Fallback mock ticket data
const mockTickets = [
  {
    id: 'T-1234',
    subject: 'Ödeme işlemi tamamlanmadı',
    user: {
      id: 'u1',
      full_name: 'Ali Veli',
      email: 'ali@example.com',
      avatar_url: null,
    },
    status: 'open',
    priority: 'high',
    category: 'payment',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    messages: [
      {
        id: 'm1',
        sender: 'user',
        content:
          'Merhaba, dün yaptığım ödeme hala işlenmedi. 500 TL tutarında bir işlem yaptım ama bakiyemde görünmüyor.',
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: 'm2',
        sender: 'admin',
        content:
          'Merhaba Ali Bey, sorununuzu inceliyoruz. İşlem numaranızı paylaşabilir misiniz?',
        created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        admin_name: 'Destek Ekibi',
      },
      {
        id: 'm3',
        sender: 'user',
        content: 'İşlem numarası: TXN-789456123',
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
    ],
    sla_due: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'T-1235',
    subject: 'Hesabıma giriş yapamıyorum',
    user: {
      id: 'u2',
      full_name: 'Ayşe Yılmaz',
      email: 'ayse@example.com',
      avatar_url: null,
    },
    status: 'pending',
    priority: 'medium',
    category: 'account',
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    messages: [
      {
        id: 'm1',
        sender: 'user',
        content:
          'Şifremi değiştirdikten sonra hesabıma giriş yapamıyorum. "Geçersiz kimlik bilgileri" hatası alıyorum.',
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
    sla_due: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'T-1236',
    subject: 'İade talebim',
    user: {
      id: 'u3',
      full_name: 'Mehmet Demir',
      email: 'mehmet@example.com',
      avatar_url: null,
    },
    status: 'resolved',
    priority: 'low',
    category: 'refund',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    messages: [
      {
        id: 'm1',
        sender: 'user',
        content: 'Seyahat iptal oldu, ödeme iadem ne zaman yapılacak?',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: 'm2',
        sender: 'admin',
        content:
          'İade işleminiz başlatıldı. 3-5 iş günü içinde hesabınıza yansıyacaktır.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        admin_name: 'Finans Ekibi',
      },
    ],
    sla_due: null,
  },
];

const mockCannedResponses = [
  {
    id: 'c1',
    title: 'Ödeme Gecikmesi',
    content:
      'Merhaba, ödeme işleminiz inceleniyor. Bankalar arası transferlerde 1-3 iş günü gecikme olabilmektedir. İşleminizin durumunu takip ediyoruz.',
  },
  {
    id: 'c2',
    title: 'Şifre Sıfırlama',
    content:
      'Şifrenizi sıfırlamak için giriş sayfasındaki "Şifremi Unuttum" bağlantısını kullanabilirsiniz. E-posta adresinize sıfırlama linki gönderilecektir.',
  },
  {
    id: 'c3',
    title: 'İade Süreci',
    content:
      'İade talebiniz alınmıştır. İade işlemleri 3-5 iş günü içinde tamamlanmaktadır. İşlem tamamlandığında size bilgilendirme yapılacaktır.',
  },
];

const statusConfig = {
  open: { label: 'Açık', variant: 'error' as const, icon: AlertCircle },
  pending: { label: 'Bekliyor', variant: 'warning' as const, icon: Clock },
  resolved: {
    label: 'Çözüldü',
    variant: 'success' as const,
    icon: CheckCircle,
  },
};

const priorityConfig = {
  high: { label: 'Yüksek', color: 'text-red-600 dark:text-red-400' },
  medium: { label: 'Orta', color: 'text-yellow-600 dark:text-yellow-400' },
  low: { label: 'Düşük', color: 'text-green-600 dark:text-green-400' },
  urgent: { label: 'Acil', color: 'text-red-700 dark:text-red-300' },
};

const categoryConfig = {
  payment: 'Ödeme',
  account: 'Hesap',
  refund: 'İade',
  technical: 'Teknik',
  other: 'Diğer',
};

export default function SupportPage() {
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Use real API data
  const { data, isLoading, error, refetch } = useSupport({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const updateTicket = useUpdateTicket();
  const sendMessage = useSendMessage();

  // Track locally sent messages for immediate UI feedback
  const [localMessages, setLocalMessages] = useState<Record<string, SupportMessage[]>>({});

  // Use API data if available, otherwise fall back to mock data
  const tickets = useMemo(() => {
    if (data?.tickets && data.tickets.length > 0) {
      return data.tickets.map((ticket) => ({
        id: ticket.id,
        subject: ticket.subject,
        user: {
          id: ticket.user_id,
          full_name: ticket.profiles?.full_name || 'Bilinmeyen',
          email: ticket.profiles?.email || '',
          avatar_url: ticket.profiles?.avatar_url || null,
        },
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        messages: [],
        sla_due: null,
      }));
    }
    return mockTickets;
  }, [data?.tickets]);

  const cannedResponses = data?.cannedResponses || mockCannedResponses;
  const stats = data?.stats || { open: 0, pending: 0, resolved: 0, total: 0 };

  // Use a more flexible ticket type that works with both mock and API data
  type AnyTicket = (typeof mockTickets)[0] | SupportTicket;
  const [selectedTicket, setSelectedTicket] = useState<AnyTicket | null>(null);

  // Set initial selected ticket when data loads
  useMemo(() => {
    if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0] as AnyTicket);
    }
  }, [tickets, selectedTicket]);

  const openTickets =
    stats.open || tickets.filter((t) => t.status === 'open').length;
  const pendingTickets =
    stats.pending || tickets.filter((t) => t.status === 'pending').length;

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      ticket.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedTicket) {
      if (!replyText.trim()) {
        toast.error('Lütfen bir yanıt yazın');
      }
      return;
    }

    const ticketId = selectedTicket.id;
    const messageContent = replyText.trim();

    // Optimistically add the message to local state
    const newMessage: SupportMessage = {
      id: `local-${Date.now()}`,
      ticket_id: ticketId,
      sender: 'admin',
      content: messageContent,
      created_at: new Date().toISOString(),
      admin_name: 'Destek Ekibi',
    };

    setLocalMessages((prev) => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), newMessage],
    }));

    setReplyText('');

    // Send to API
    sendMessage.mutate(
      { ticketId, content: messageContent, adminName: 'Destek Ekibi' },
      {
        onSuccess: () => {
          toast.success('Yanıt gönderildi');
        },
        onError: () => {
          toast.error('Yanıt gönderilemedi, lütfen tekrar deneyin');
          // Remove the optimistically added message on error
          setLocalMessages((prev) => ({
            ...prev,
            [ticketId]: (prev[ticketId] || []).filter((m) => m.id !== newMessage.id),
          }));
        },
      },
    );
  };

  const handleResolveTicket = () => {
    if (!selectedTicket) return;
    updateTicket.mutate(
      { id: selectedTicket.id, status: 'resolved' },
      {
        onSuccess: () => {
          toast.success('Talep çözüldü olarak işaretlendi');
          refetch();
        },
        onError: () => {
          toast.error('İşlem başarısız oldu');
        },
      },
    );
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-muted rounded" />
          <div className="h-8 w-24 bg-muted rounded" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-[600px] bg-muted rounded-lg" />
        <div className="lg:col-span-2 h-[600px] bg-muted rounded-lg" />
      </div>
    </div>
  );

  // Error State
  const ErrorState = () => (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 dark:bg-red-500/20">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Bir hata oluştu</h2>
        <p className="text-muted-foreground max-w-md">
          Destek talepleri yüklenemedi. Lütfen tekrar deneyin.
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

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Destek Merkezi</h1>
          <p className="text-muted-foreground">
            Kullanıcı taleplerini yönetin ve çözümleyin
          </p>
        </div>
        <div className="flex gap-2">
          <CanvaButton
            variant="primary"
            size="sm"
            onClick={() => refetch()}
            loading={isLoading}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Yenile
          </CanvaButton>
          <CanvaBadge variant="error" size="lg">
            {openTickets} açık
          </CanvaBadge>
          <CanvaBadge variant="warning" size="lg">
            {pendingTickets} bekleyen
          </CanvaBadge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <CanvaStatCard
          label="Toplam Talepler"
          value="1,284"
          icon={<Inbox className="h-4 w-4" />}
          change={{ value: 12, label: 'Bu ay' }}
        />
        <CanvaStatCard
          label="Ortalama Yanıt Süresi"
          value="2.4 saat"
          icon={<Timer className="h-4 w-4" />}
          change={{ value: -30, label: 'dk geçen haftadan' }}
        />
        <CanvaStatCard
          label="Çözüm Oranı"
          value="94%"
          icon={<CheckCircle className="h-4 w-4" />}
          change={{ value: 2, label: 'geçen aydan' }}
        />
        <CanvaStatCard
          label="Müşteri Memnuniyeti"
          value="4.7/5"
          icon={<MessageSquare className="h-4 w-4" />}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ticket List */}
        <CanvaCard className="lg:col-span-1">
          <CanvaCardHeader>
            <div className="flex items-center justify-between">
              <CanvaCardTitle>Talepler</CanvaCardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-28 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="open">Açık</SelectItem>
                  <SelectItem value="pending">Bekleyen</SelectItem>
                  <SelectItem value="resolved">Çözüldü</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-2">
              <CanvaInput
                placeholder="Talep ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
                size="sm"
              />
            </div>
          </CanvaCardHeader>
          <CanvaCardBody className="p-0">
            <ScrollArea className="h-[500px]">
              {filteredTickets.map((ticket) => {
                const statusInfo =
                  statusConfig[ticket.status as keyof typeof statusConfig];
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={ticket.id}
                    className={cn(
                      'cursor-pointer border-b p-4 transition-colors hover:bg-accent/50',
                      selectedTicket?.id === ticket.id && 'bg-accent',
                    )}
                    onClick={() => setSelectedTicket(ticket as AnyTicket)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(ticket.user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {ticket.user.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ticket.id}
                          </p>
                        </div>
                      </div>
                      <CanvaBadge
                        variant={
                          statusInfo.variant === 'error'
                            ? 'error'
                            : statusInfo.variant === 'warning'
                              ? 'warning'
                              : 'success'
                        }
                        size="sm"
                        icon={<StatusIcon className="h-3 w-3" />}
                      >
                        {statusInfo.label}
                      </CanvaBadge>
                    </div>
                    <p className="mt-2 text-sm font-medium line-clamp-1">
                      {ticket.subject}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeDate(ticket.updated_at)}
                    </p>
                  </div>
                );
              })}
            </ScrollArea>
          </CanvaCardBody>
        </CanvaCard>

        {/* Ticket Detail */}
        <CanvaCard className="lg:col-span-2">
          {selectedTicket ? (
            <>
              <CanvaCardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CanvaCardTitle>{selectedTicket.subject}</CanvaCardTitle>
                      <CanvaBadge
                        variant={
                          statusConfig[
                            selectedTicket.status as keyof typeof statusConfig
                          ].variant === 'error'
                            ? 'error'
                            : statusConfig[
                                  selectedTicket.status as keyof typeof statusConfig
                                ].variant === 'warning'
                              ? 'warning'
                              : 'success'
                        }
                      >
                        {
                          statusConfig[
                            selectedTicket.status as keyof typeof statusConfig
                          ].label
                        }
                      </CanvaBadge>
                    </div>
                    <CanvaCardSubtitle>
                      {selectedTicket.id} •{' '}
                      {
                        categoryConfig[
                          selectedTicket.category as keyof typeof categoryConfig
                        ]
                      }{' '}
                      •{' '}
                      <span
                        className={
                          priorityConfig[
                            selectedTicket.priority as keyof typeof priorityConfig
                          ].color
                        }
                      >
                        {
                          priorityConfig[
                            selectedTicket.priority as keyof typeof priorityConfig
                          ].label
                        }{' '}
                        öncelik
                      </span>
                    </CanvaCardSubtitle>
                  </div>
                  <div className="flex gap-2">
                    <CanvaButton
                      size="sm"
                      variant="primary"
                      leftIcon={<Archive className="h-4 w-4" />}
                    >
                      Arşivle
                    </CanvaButton>
                    <CanvaButton
                      size="sm"
                      variant="success"
                      onClick={handleResolveTicket}
                      loading={updateTicket.isPending}
                      leftIcon={<CheckCircle className="h-4 w-4" />}
                    >
                      Çözüldü
                    </CanvaButton>
                  </div>
                </div>

                {/* User Info */}
                <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getInitials(
                          'user' in selectedTicket
                            ? selectedTicket.user.full_name
                            : selectedTicket.profiles?.full_name || 'Kullanıcı',
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {'user' in selectedTicket
                          ? selectedTicket.user.full_name
                          : selectedTicket.profiles?.full_name || 'Kullanıcı'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {'user' in selectedTicket
                          ? selectedTicket.user.email
                          : selectedTicket.profiles?.email || ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <CanvaButton size="sm" variant="ghost" iconOnly>
                      <Mail className="h-4 w-4" />
                    </CanvaButton>
                    <CanvaButton size="sm" variant="ghost" iconOnly>
                      <ExternalLink className="h-4 w-4" />
                    </CanvaButton>
                  </div>
                </div>
              </CanvaCardHeader>

              <Separator />

              {/* Messages */}
              <CanvaCardBody className="p-0">
                <ScrollArea className="h-[300px] p-4">
                  <div className="space-y-4">
                    {/* Combine original messages with locally sent messages */}
                    {[
                      ...('messages' in selectedTicket ? selectedTicket.messages : []),
                      ...(localMessages[selectedTicket.id] || []),
                    ]
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map(
                        (message: {
                          id: string;
                          sender: string;
                          content: string;
                          created_at: string;
                          admin_name?: string;
                        }) => (
                          <div
                            key={message.id}
                            className={cn(
                              'flex',
                              message.sender === 'admin'
                                ? 'justify-end'
                                : 'justify-start',
                            )}
                          >
                            <div
                              className={cn(
                                'max-w-[80%] rounded-2xl p-3',
                                message.sender === 'admin'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted',
                              )}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div
                                className={cn(
                                  'mt-1 flex items-center gap-2 text-xs',
                                  message.sender === 'admin'
                                    ? 'text-primary-foreground/70'
                                    : 'text-muted-foreground',
                                )}
                              >
                                {message.sender === 'admin' && message.admin_name && (
                                  <span>{message.admin_name}</span>
                                )}
                                <span>
                                  {formatRelativeDate(message.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                  </div>
                </ScrollArea>

                <Separator />

                {/* Reply Box */}
                <div className="p-4">
                  {/* Canned Responses */}
                  <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                    {cannedResponses.map((response) => (
                      <CanvaButton
                        key={response.id}
                        size="xs"
                        variant="primary"
                        className="shrink-0"
                        onClick={() => setReplyText(response.content)}
                      >
                        {response.title}
                      </CanvaButton>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <CanvaInput
                      placeholder="Yanıtınızı yazın..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply();
                        }
                      }}
                    />
                    <CanvaButton size="md" variant="ghost" iconOnly>
                      <Paperclip className="h-4 w-4" />
                    </CanvaButton>
                    <CanvaButton
                      variant="primary"
                      onClick={handleSendReply}
                      loading={sendMessage.isPending}
                      leftIcon={<Send className="h-4 w-4" />}
                    >
                      Gönder
                    </CanvaButton>
                  </div>
                </div>
              </CanvaCardBody>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div>
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  Talep Seçin
                </h3>
                <p className="text-muted-foreground">
                  Detayları görüntülemek için bir talep seçin
                </p>
              </div>
            </div>
          )}
        </CanvaCard>
      </div>
    </div>
  );
}

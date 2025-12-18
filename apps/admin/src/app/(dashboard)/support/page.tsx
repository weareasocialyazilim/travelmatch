'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

// Mock ticket data
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
        content: 'Merhaba, dün yaptığım ödeme hala işlenmedi. 500 TL tutarında bir işlem yaptım ama bakiyemde görünmüyor.',
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: 'm2',
        sender: 'admin',
        content: 'Merhaba Ali Bey, sorununuzu inceliyoruz. İşlem numaranızı paylaşabilir misiniz?',
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
        content: 'Şifremi değiştirdikten sonra hesabıma giriş yapamıyorum. "Geçersiz kimlik bilgileri" hatası alıyorum.',
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
        content: 'İade işleminiz başlatıldı. 3-5 iş günü içinde hesabınıza yansıyacaktır.',
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
    content: 'Merhaba, ödeme işleminiz inceleniyor. Bankalar arası transferlerde 1-3 iş günü gecikme olabilmektedir. İşleminizin durumunu takip ediyoruz.',
  },
  {
    id: 'c2',
    title: 'Şifre Sıfırlama',
    content: 'Şifrenizi sıfırlamak için giriş sayfasındaki "Şifremi Unuttum" bağlantısını kullanabilirsiniz. E-posta adresinize sıfırlama linki gönderilecektir.',
  },
  {
    id: 'c3',
    title: 'İade Süreci',
    content: 'İade talebiniz alınmıştır. İade işlemleri 3-5 iş günü içinde tamamlanmaktadır. İşlem tamamlandığında size bilgilendirme yapılacaktır.',
  },
];

const statusConfig = {
  open: { label: 'Açık', variant: 'error' as const, icon: AlertCircle },
  pending: { label: 'Bekliyor', variant: 'warning' as const, icon: Clock },
  resolved: { label: 'Çözüldü', variant: 'success' as const, icon: CheckCircle },
};

const priorityConfig = {
  high: { label: 'Yüksek', color: 'text-red-600' },
  medium: { label: 'Orta', color: 'text-yellow-600' },
  low: { label: 'Düşük', color: 'text-green-600' },
};

const categoryConfig = {
  payment: 'Ödeme',
  account: 'Hesap',
  refund: 'İade',
  technical: 'Teknik',
  other: 'Diğer',
};

export default function SupportPage() {
  const [selectedTicket, setSelectedTicket] = useState<typeof mockTickets[0] | null>(
    mockTickets[0]
  );
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const openTickets = mockTickets.filter((t) => t.status === 'open').length;
  const pendingTickets = mockTickets.filter((t) => t.status === 'pending').length;

  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      ticket.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    // API call would go here
    setReplyText('');
  };

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
          <Badge variant="error" className="h-8 px-3 text-sm">
            {openTickets} açık
          </Badge>
          <Badge variant="warning" className="h-8 px-3 text-sm">
            {pendingTickets} bekleyen
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Talepler</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">Bu ay</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Yanıt Süresi</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 saat</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingDown className="mr-1 h-3 w-3" />
              -30 dk geçen haftadan
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Çözüm Oranı</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +2% geçen aydan
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Müşteri Memnuniyeti</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7/5</div>
            <p className="text-xs text-muted-foreground">Ortalama puan</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ticket List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Talepler</CardTitle>
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
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Talep ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {filteredTickets.map((ticket) => {
                const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig];
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={ticket.id}
                    className={cn(
                      'cursor-pointer border-b p-4 transition-colors hover:bg-accent/50',
                      selectedTicket?.id === ticket.id && 'bg-accent'
                    )}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(ticket.user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{ticket.user.full_name}</p>
                          <p className="text-xs text-muted-foreground">{ticket.id}</p>
                        </div>
                      </div>
                      <Badge variant={statusInfo.variant} className="text-xs">
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
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
          </CardContent>
        </Card>

        {/* Ticket Detail */}
        <Card className="lg:col-span-2">
          {selectedTicket ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                      <Badge variant={statusConfig[selectedTicket.status as keyof typeof statusConfig].variant}>
                        {statusConfig[selectedTicket.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {selectedTicket.id} • {categoryConfig[selectedTicket.category as keyof typeof categoryConfig]} •{' '}
                      <span className={priorityConfig[selectedTicket.priority as keyof typeof priorityConfig].color}>
                        {priorityConfig[selectedTicket.priority as keyof typeof priorityConfig].label} öncelik
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Archive className="mr-1 h-4 w-4" />
                      Arşivle
                    </Button>
                    <Button size="sm">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Çözüldü
                    </Button>
                  </div>
                </div>

                {/* User Info */}
                <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getInitials(selectedTicket.user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedTicket.user.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedTicket.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <Separator />

              {/* Messages */}
              <CardContent className="p-0">
                <ScrollArea className="h-[300px] p-4">
                  <div className="space-y-4">
                    {selectedTicket.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex',
                          message.sender === 'admin' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[80%] rounded-lg p-3',
                            message.sender === 'admin'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div
                            className={cn(
                              'mt-1 flex items-center gap-2 text-xs',
                              message.sender === 'admin'
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            )}
                          >
                            {message.sender === 'admin' && (
                              <span>{(message as { admin_name?: string }).admin_name}</span>
                            )}
                            <span>{formatRelativeDate(message.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <Separator />

                {/* Reply Box */}
                <div className="p-4">
                  {/* Canned Responses */}
                  <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
                    {mockCannedResponses.map((response) => (
                      <Button
                        key={response.id}
                        size="sm"
                        variant="outline"
                        className="shrink-0 text-xs"
                        onClick={() => setReplyText(response.content)}
                      >
                        {response.title}
                      </Button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
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
                    <Button size="icon" variant="ghost">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleSendReply}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div>
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Talep Seçin</h3>
                <p className="text-muted-foreground">
                  Detayları görüntülemek için bir talep seçin
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

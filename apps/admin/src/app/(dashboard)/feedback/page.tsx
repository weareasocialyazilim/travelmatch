'use client';

import { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Bug,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  MoreHorizontal,
  ChevronUp,
  Users,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock feedback data
const feedbackStats = {
  total: 234,
  open: 89,
  in_progress: 45,
  completed: 78,
  rejected: 22,
  avg_satisfaction: 4.2,
};

const feedbackItems = [
  {
    id: '1',
    title: 'Karanlık mod desteği',
    description: 'Uygulama için karanlık tema seçeneği eklenebilir mi?',
    type: 'feature',
    status: 'in_progress',
    votes: 156,
    comments: 23,
    author: {
      name: 'Ahmet Y.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet',
    },
    created: '2024-12-10',
    tags: ['UI', 'Tema'],
  },
  {
    id: '2',
    title: 'Anlık bildirimler çalışmıyor',
    description: 'iOS 17 cihazlarda push bildirimler gelmiyor.',
    type: 'bug',
    status: 'open',
    votes: 89,
    comments: 45,
    author: {
      name: 'Fatma D.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatma',
    },
    created: '2024-12-15',
    tags: ['iOS', 'Bildirim', 'Kritik'],
  },
  {
    id: '3',
    title: 'Profil fotoğrafı kırpma aracı',
    description: 'Profil fotoğrafını yüklerken kırpma ve döndürme özelliği.',
    type: 'feature',
    status: 'completed',
    votes: 234,
    comments: 12,
    author: {
      name: 'Emre K.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emre',
    },
    created: '2024-11-20',
    tags: ['Profil', 'Medya'],
  },
  {
    id: '4',
    title: 'Seyahat planı paylaşımı',
    description: 'Planladığım seyahati takipçilerimle paylaşabilmek istiyorum.',
    type: 'idea',
    status: 'open',
    votes: 312,
    comments: 67,
    author: {
      name: 'Can Ö.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=can',
    },
    created: '2024-12-05',
    tags: ['Sosyal', 'Planlama'],
  },
  {
    id: '5',
    title: 'Uygulama yavaş açılıyor',
    description: 'Son güncellemeden sonra başlangıç süresi çok uzadı.',
    type: 'bug',
    status: 'in_progress',
    votes: 67,
    comments: 34,
    author: {
      name: 'Zeynep A.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep',
    },
    created: '2024-12-16',
    tags: ['Performans'],
  },
];

export default function FeedbackPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'feature':
        return (
          <Badge className="bg-blue-500">
            <Sparkles className="mr-1 h-3 w-3" />
            Özellik
          </Badge>
        );
      case 'bug':
        return (
          <Badge variant="destructive">
            <Bug className="mr-1 h-3 w-3" />
            Hata
          </Badge>
        );
      case 'idea':
        return (
          <Badge className="bg-purple-500">
            <Lightbulb className="mr-1 h-3 w-3" />
            Fikir
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline">Açık</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500">Devam Ediyor</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Tamamlandı</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Reddedildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredFeedback = feedbackItems.filter((item) => {
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Geri Bildirim Merkezi</h1>
          <p className="text-muted-foreground">Kullanıcı önerileri ve hata raporları</p>
        </div>
        <Button>
          <MessageSquare className="mr-2 h-4 w-4" />
          Yeni Geri Bildirim
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam</p>
                <p className="text-2xl font-bold">{feedbackStats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Açık</p>
                <p className="text-2xl font-bold">{feedbackStats.open}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Devam Eden</p>
                <p className="text-2xl font-bold">{feedbackStats.in_progress}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tamamlanan</p>
                <p className="text-2xl font-bold text-green-600">{feedbackStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reddedilen</p>
                <p className="text-2xl font-bold">{feedbackStats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Memnuniyet</p>
                <p className="text-2xl font-bold">{feedbackStats.avg_satisfaction}/5</p>
              </div>
              <ThumbsUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="features">Özellikler</TabsTrigger>
            <TabsTrigger value="bugs">Hatalar</TabsTrigger>
            <TabsTrigger value="ideas">Fikirler</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="open">Açık</SelectItem>
                <SelectItem value="in_progress">Devam Eden</SelectItem>
                <SelectItem value="completed">Tamamlanan</SelectItem>
                <SelectItem value="rejected">Reddedilen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {/* Feedback List */}
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronUp className="h-5 w-5" />
                      </Button>
                      <span className="font-bold text-lg">{item.votes}</span>
                      <span className="text-xs text-muted-foreground">oy</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">{item.title}</h3>
                            {getTypeBadge(item.type)}
                            {getStatusBadge(item.status)}
                          </div>
                          <p className="mt-1 text-muted-foreground">{item.description}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Detayları Gör</DropdownMenuItem>
                            <DropdownMenuItem>Durumu Değiştir</DropdownMenuItem>
                            <DropdownMenuItem>Yanıtla</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Reddet</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={item.author.avatar} />
                              <AvatarFallback>{item.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              {item.author.name}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {item.created}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {item.comments} yorum
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features">
          <p className="text-muted-foreground">Özellik istekleri burada listelenecek.</p>
        </TabsContent>
        <TabsContent value="bugs">
          <p className="text-muted-foreground">Hata raporları burada listelenecek.</p>
        </TabsContent>
        <TabsContent value="ideas">
          <p className="text-muted-foreground">Fikirler burada listelenecek.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

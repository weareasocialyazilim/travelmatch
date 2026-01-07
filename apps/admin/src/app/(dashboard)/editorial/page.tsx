'use client';

import { useState } from 'react';
import {
  BookOpen,
  Star,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Image,
  Video,
  FileText,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock editorial data
const featuredCollections = [
  {
    id: '1',
    title: 'Kış Tatili Rotaları 2025',
    description: 'Bu kışın en güzel kayak merkezleri ve sıcak destinasyonlar',
    cover: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=400',
    items: 24,
    views: 45600,
    status: 'published',
    featured: true,
    publishDate: '2024-12-15',
  },
  {
    id: '2',
    title: 'Romantik Kaçamaklar',
    description: 'Çiftler için özenle seçilmiş destinasyonlar',
    cover: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=400',
    items: 18,
    views: 32100,
    status: 'published',
    featured: true,
    publishDate: '2024-12-10',
  },
  {
    id: '3',
    title: 'Macera Seyahati Rehberi',
    description: 'Adrenalin tutkunları için ekstrem destinasyonlar',
    cover: 'https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=400',
    items: 32,
    views: 28500,
    status: 'draft',
    featured: false,
    publishDate: null,
  },
];

const editorialContent = [
  {
    id: '1',
    type: 'article',
    title: "İstanbul'un Gizli Hazineleri",
    author: 'Editör Ekibi',
    status: 'published',
    views: 12450,
    engagement: 8.5,
    publishDate: '2024-12-16',
  },
  {
    id: '2',
    type: 'guide',
    title: 'Bütçe Dostu Avrupa Turu',
    author: 'Seyahat Yazarı Elif',
    status: 'review',
    views: 0,
    engagement: 0,
    publishDate: null,
  },
  {
    id: '3',
    type: 'interview',
    title: 'Solo Gezgin Hikayesi: Deniz Yılmaz',
    author: 'İçerik Ekibi',
    status: 'published',
    views: 8900,
    engagement: 12.3,
    publishDate: '2024-12-14',
  },
  {
    id: '4',
    type: 'video',
    title: '48 Saat İzmir',
    author: 'Video Ekibi',
    status: 'processing',
    views: 0,
    engagement: 0,
    publishDate: null,
  },
];

const curatedMoments = [
  {
    id: '1',
    user: 'Ayşe K.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ayse',
    location: 'Kapadokya',
    image: 'https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?w=200',
    likes: 2340,
    featured: true,
    curatedBy: 'Editör Ali',
    curatedDate: '2024-12-17',
  },
  {
    id: '2',
    user: 'Mehmet D.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet',
    location: 'Antalya',
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=200',
    likes: 1890,
    featured: true,
    curatedBy: 'Editör Selin',
    curatedDate: '2024-12-16',
  },
  {
    id: '3',
    user: 'Zeynep S.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeyneps',
    location: 'Bodrum',
    image: 'https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?w=200',
    likes: 1560,
    featured: false,
    curatedBy: null,
    curatedDate: null,
  },
];

const contentCalendar = [
  {
    date: '2024-12-18',
    type: 'article',
    title: 'Yılbaşı Özel Rehberi',
    status: 'scheduled',
  },
  {
    date: '2024-12-20',
    type: 'collection',
    title: '2025 Trend Destinasyonları',
    status: 'scheduled',
  },
  {
    date: '2024-12-22',
    type: 'video',
    title: 'Yılsonu Özeti',
    status: 'draft',
  },
  {
    date: '2024-12-25',
    type: 'guide',
    title: 'Kış Kampı Rehberi',
    status: 'in_progress',
  },
];

export default function EditorialPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Yayında</Badge>;
      case 'draft':
        return <Badge variant="outline">Taslak</Badge>;
      case 'review':
        return <Badge className="bg-yellow-500">İnceleniyor</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">İşleniyor</Badge>;
      case 'scheduled':
        return <Badge className="bg-purple-500">Planlandı</Badge>;
      case 'in_progress':
        return <Badge className="bg-orange-500">Devam Ediyor</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'guide':
        return <BookOpen className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'interview':
        return <MessageSquare className="h-4 w-4" />;
      case 'collection':
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editorial</h1>
          <p className="text-muted-foreground">İçerik yönetimi ve küratörlük</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            İçerik Takvimi
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni İçerik
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam İçerik</p>
                <p className="text-2xl font-bold">156</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Bu Ay Görüntüleme
                </p>
                <p className="text-2xl font-bold">245K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Öne Çıkan</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ort. Engagement</p>
                <p className="text-2xl font-bold">8.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="collections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="collections">Koleksiyonlar</TabsTrigger>
          <TabsTrigger value="content">İçerikler</TabsTrigger>
          <TabsTrigger value="curated">Küratörlük</TabsTrigger>
          <TabsTrigger value="calendar">Yayın Takvimi</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Koleksiyon ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Koleksiyon
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {featuredCollections.map((collection) => (
              <Card key={collection.id} className="overflow-hidden">
                <div className="relative h-40">
                  <img
                    src={collection.cover}
                    alt={collection.title}
                    className="w-full h-full object-cover"
                  />
                  {collection.featured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      Öne Çıkan
                    </Badge>
                  )}
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{collection.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {collection.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{collection.items} içerik</span>
                      <span>
                        {collection.views.toLocaleString()} görüntüleme
                      </span>
                    </div>
                    {getStatusBadge(collection.status)}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Düzenle
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="İçerik ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="article">Makale</SelectItem>
                <SelectItem value="guide">Rehber</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="interview">Röportaj</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="published">Yayında</SelectItem>
                <SelectItem value="draft">Taslak</SelectItem>
                <SelectItem value="review">İnceleniyor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {editorialContent.map((content) => (
                  <div
                    key={content.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        {getTypeIcon(content.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{content.title}</h4>
                          {getStatusBadge(content.status)}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span>{content.author}</span>
                          {content.publishDate && (
                            <span>{content.publishDate}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {content.views > 0 && (
                        <>
                          <div className="text-right">
                            <p className="font-medium">
                              {content.views.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Görüntüleme
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{content.engagement}%</p>
                            <p className="text-xs text-muted-foreground">
                              Engagement
                            </p>
                          </div>
                        </>
                      )}
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Düzenle
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Küratörlük İçin Bekleyen Momentler</CardTitle>
              <CardDescription>
                Öne çıkarılabilecek kullanıcı içerikleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {curatedMoments.map((moment) => (
                  <Card key={moment.id} className="overflow-hidden">
                    <div className="relative h-48">
                      <img
                        src={moment.image}
                        alt={moment.location}
                        className="w-full h-full object-cover"
                      />
                      {moment.featured && (
                        <Badge className="absolute top-2 right-2 bg-yellow-500">
                          <Star className="h-3 w-3 mr-1" />
                          Öne Çıkan
                        </Badge>
                      )}
                    </div>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={moment.avatar} />
                          <AvatarFallback>{moment.user[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{moment.user}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {moment.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Heart className="h-4 w-4 text-red-500" />
                          {moment.likes.toLocaleString()}
                        </div>
                        {moment.featured ? (
                          <div className="text-xs text-muted-foreground">
                            {moment.curatedBy} • {moment.curatedDate}
                          </div>
                        ) : (
                          <Button size="sm">
                            <Star className="h-4 w-4 mr-1" />
                            Öne Çıkar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Küratörlük Kriterleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      criteria: 'Görsel Kalitesi',
                      weight: '30%',
                      status: 'active',
                    },
                    {
                      criteria: 'Engagement Oranı',
                      weight: '25%',
                      status: 'active',
                    },
                    { criteria: 'Özgünlük', weight: '20%', status: 'active' },
                    {
                      criteria: 'Topluluk Kuralları',
                      weight: '15%',
                      status: 'active',
                    },
                    {
                      criteria: 'Lokasyon Çeşitliliği',
                      weight: '10%',
                      status: 'active',
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm">{item.criteria}</span>
                      <Badge variant="outline">{item.weight}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Küratörlük İstatistikleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bu Hafta Öne Çıkarılan</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ort. Engagement Artışı</span>
                    <span className="font-medium text-green-500">+156%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Creator Memnuniyeti</span>
                    <span className="font-medium">4.8/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bekleyen İçerikler</span>
                    <span className="font-medium text-orange-500">45</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yayın Takvimi</CardTitle>
              <CardDescription>Planlanmış içerikler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentCalendar.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center w-16">
                        <p className="text-2xl font-bold">
                          {item.date.split('-')[2]}
                        </p>
                        <p className="text-xs text-muted-foreground">Aralık</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {item.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(item.status)}
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bu Hafta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4</div>
                <p className="text-sm text-muted-foreground">
                  planlanmış içerik
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bu Ay</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">18</div>
                <p className="text-sm text-muted-foreground">toplam içerik</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Boş Slotlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">7</div>
                <p className="text-sm text-muted-foreground">
                  doldurulması gereken
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  Calendar,
  PartyPopper,
  Gift,
  Sparkles,
  Clock,
  Users,
  TrendingUp,
  Plus,
  Play,
  Pause,
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  Target,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock events data
const eventStats = {
  active: 3,
  scheduled: 5,
  completed: 28,
  total_participants: 45678,
};

const events = [
  {
    id: '1',
    name: 'Yılbaşı Özel Kampanyası',
    type: 'seasonal',
    status: 'active',
    start_date: '2024-12-20',
    end_date: '2024-12-31',
    participants: 12456,
    target: 20000,
    budget: 50000,
    spent: 32000,
    rewards: '2x Puan',
    description: 'Yılbaşı süresince tüm eşleşmelerde 2 kat puan kazanın!',
  },
  {
    id: '2',
    name: 'Kış Seyahati Challenge',
    type: 'challenge',
    status: 'active',
    start_date: '2024-12-01',
    end_date: '2024-12-31',
    participants: 8934,
    target: 15000,
    budget: 30000,
    spent: 18000,
    rewards: 'Premium Rozet',
    description: '10 farklı kış destinasyonundan moment paylaşın.',
  },
  {
    id: '3',
    name: 'Sevgililer Günü Hazırlığı',
    type: 'seasonal',
    status: 'scheduled',
    start_date: '2025-02-01',
    end_date: '2025-02-14',
    participants: 0,
    target: 50000,
    budget: 100000,
    spent: 0,
    rewards: 'Özel Hediyeler',
    description: 'Sevgililer günü için özel kampanya.',
  },
  {
    id: '4',
    name: 'Referral Sprint',
    type: 'referral',
    status: 'active',
    start_date: '2024-12-15',
    end_date: '2024-12-22',
    participants: 3456,
    target: 5000,
    budget: 25000,
    spent: 15000,
    rewards: '₺100 Kredi',
    description: 'Her başarılı davet için ₺100 kredi.',
  },
  {
    id: '5',
    name: 'Kasım Black Friday',
    type: 'seasonal',
    status: 'completed',
    start_date: '2024-11-25',
    end_date: '2024-11-30',
    participants: 34567,
    target: 30000,
    budget: 75000,
    spent: 72000,
    rewards: '%50 İndirim',
    description: 'Premium üyeliklerde %50 indirim.',
  },
];

const upcomingDates = [
  { date: '14 Şubat', event: 'Sevgililer Günü', icon: '❤️' },
  { date: '8 Mart', event: 'Kadınlar Günü', icon: '💐' },
  { date: '23 Nisan', event: 'Ulusal Bayram', icon: '🇹🇷' },
  { date: '1 Mayıs', event: 'İşçi Bayramı', icon: '💪' },
  { date: '19 Mayıs', event: 'Gençlik Bayramı', icon: '🎉' },
];

export default function EventsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Aktif</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500">Planlandı</Badge>;
      case 'completed':
        return <Badge variant="secondary">Tamamlandı</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500">Duraklatıldı</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'seasonal':
        return <Badge variant="outline">Sezonluk</Badge>;
      case 'challenge':
        return <Badge variant="outline">Challenge</Badge>;
      case 'referral':
        return <Badge variant="outline">Referral</Badge>;
      case 'flash':
        return <Badge variant="outline">Flash</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Etkinlik Yönetimi
          </h1>
          <p className="text-muted-foreground">
            Kampanyalar ve sezonluk etkinlikler
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Etkinlik
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif</p>
                <p className="text-2xl font-bold text-green-600">
                  {eventStats.active}
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planlanmış</p>
                <p className="text-2xl font-bold">{eventStats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tamamlanan</p>
                <p className="text-2xl font-bold">{eventStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Toplam Katılımcı
                </p>
                <p className="text-2xl font-bold">
                  {eventStats.total_participants.toLocaleString('tr-TR')}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Events List */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Aktif</TabsTrigger>
              <TabsTrigger value="scheduled">Planlanmış</TabsTrigger>
              <TabsTrigger value="completed">Tamamlanan</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-4">
              {events
                .filter((e) => e.status === 'active')
                .map((event) => (
                  <Card key={event.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">
                              {event.name}
                            </h3>
                            {getStatusBadge(event.status)}
                            {getTypeBadge(event.type)}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {event.description}
                          </p>

                          {/* Progress */}
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Katılımcı Hedefi
                              </span>
                              <span className="font-medium">
                                {event.participants.toLocaleString('tr-TR')} /{' '}
                                {event.target.toLocaleString('tr-TR')}
                              </span>
                            </div>
                            <Progress
                              value={(event.participants / event.target) * 100}
                              className="h-2"
                            />
                          </div>

                          {/* Stats */}
                          <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Tarih</p>
                              <p className="font-medium">
                                {event.start_date} - {event.end_date}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Bütçe</p>
                              <p className="font-medium">
                                ₺{event.budget.toLocaleString('tr-TR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Harcanan</p>
                              <p className="font-medium">
                                ₺{event.spent.toLocaleString('tr-TR')}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Ödül</p>
                              <p className="font-medium">{event.rewards}</p>
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Detaylar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pause className="mr-2 h-4 w-4" />
                              Duraklat
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Kopyala
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Sonlandır
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="scheduled" className="space-y-4 mt-4">
              {events
                .filter((e) => e.status === 'scheduled')
                .map((event) => (
                  <Card key={event.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{event.name}</h3>
                            {getStatusBadge(event.status)}
                            {getTypeBadge(event.type)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.start_date} - {event.end_date}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm">
                            <Play className="mr-2 h-4 w-4" />
                            Başlat
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-4">
              {events
                .filter((e) => e.status === 'completed')
                .map((event) => (
                  <Card key={event.id} className="opacity-75">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{event.name}</h3>
                            {getStatusBadge(event.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.participants.toLocaleString('tr-TR')}{' '}
                            katılımcı
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ₺{event.spent.toLocaleString('tr-TR')} harcandı
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {event.end_date}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Upcoming Dates */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Önemli Tarihler
              </CardTitle>
              <CardDescription>Kampanya fırsatları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDates.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-medium">{item.event}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.date}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Planla
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Hızlı İstatistikler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Bu Ay Harcanan
                  </span>
                  <span className="font-medium">₺65,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Ortalama ROI
                  </span>
                  <span className="font-medium text-green-600">3.2x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    En Başarılı
                  </span>
                  <span className="font-medium">Black Friday</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Katılım Oranı
                  </span>
                  <span className="font-medium">24%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

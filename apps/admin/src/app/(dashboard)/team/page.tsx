'use client';

// Force dynamic rendering - this page has interactive components
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import {
  Users,
  Clock,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  Coffee,
  Laptop,
  Moon,
  Sun,
  BarChart3,
  Target,
  MessageSquare,
  Star,
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

// Mock team data
const teamStats = {
  total_members: 12,
  online_now: 5,
  tasks_completed_today: 47,
  avg_response_time: '4.2 min',
};

const teamMembers = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    role: 'manager',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet',
    status: 'online',
    shift: 'morning',
    tasks_today: 12,
    rating: 4.9,
    current_task: 'KYC onayları inceleniyor',
  },
  {
    id: '2',
    name: 'Fatma Demir',
    role: 'moderator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatma',
    status: 'online',
    shift: 'morning',
    tasks_today: 23,
    rating: 4.8,
    current_task: 'Moment moderasyonu',
  },
  {
    id: '3',
    name: 'Emre Kaya',
    role: 'support',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emre',
    status: 'online',
    shift: 'morning',
    tasks_today: 18,
    rating: 4.7,
    current_task: 'Destek talepleri',
  },
  {
    id: '4',
    name: 'Zeynep Arslan',
    role: 'finance',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep',
    status: 'away',
    shift: 'morning',
    tasks_today: 8,
    rating: 4.9,
    current_task: null,
  },
  {
    id: '5',
    name: 'Can Öztürk',
    role: 'moderator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=can',
    status: 'online',
    shift: 'afternoon',
    tasks_today: 15,
    rating: 4.6,
    current_task: 'Şikayet incelemeleri',
  },
  {
    id: '6',
    name: 'Elif Şahin',
    role: 'support',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elif',
    status: 'offline',
    shift: 'night',
    tasks_today: 0,
    rating: 4.8,
    current_task: null,
  },
];

const shifts = [
  {
    name: 'Sabah Vardiyası',
    time: '09:00 - 17:00',
    icon: Sun,
    members: 4,
    color: 'bg-yellow-100',
  },
  {
    name: 'Öğleden Sonra',
    time: '14:00 - 22:00',
    icon: Coffee,
    members: 3,
    color: 'bg-orange-100',
  },
  {
    name: 'Gece Vardiyası',
    time: '22:00 - 06:00',
    icon: Moon,
    members: 2,
    color: 'bg-indigo-100',
  },
];

const leaderboard = [
  { rank: 1, name: 'Fatma Demir', tasks: 156, rating: 4.8 },
  { rank: 2, name: 'Can Öztürk', tasks: 142, rating: 4.6 },
  { rank: 3, name: 'Emre Kaya', tasks: 138, rating: 4.7 },
  { rank: 4, name: 'Ahmet Yılmaz', tasks: 127, rating: 4.9 },
  { rank: 5, name: 'Zeynep Arslan', tasks: 98, rating: 4.9 },
];

export default function TeamPage() {
  const [selectedShift, setSelectedShift] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'manager':
        return <Badge className="bg-purple-500">Yönetici</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-500">Moderatör</Badge>;
      case 'support':
        return <Badge className="bg-green-500">Destek</Badge>;
      case 'finance':
        return <Badge className="bg-emerald-500">Finans</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const filteredMembers = teamMembers.filter(
    (m) => selectedShift === 'all' || m.shift === selectedShift,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ekip Merkezi</h1>
          <p className="text-muted-foreground">
            Ekip yönetimi ve performans takibi
          </p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Vardiya Planla
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Üye</p>
                <p className="text-2xl font-bold">{teamStats.total_members}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Şu An Çevrimiçi</p>
                <p className="text-2xl font-bold text-green-600">
                  {teamStats.online_now}
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Bugün Tamamlanan
                </p>
                <p className="text-2xl font-bold">
                  {teamStats.tasks_completed_today}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Ort. Yanıt Süresi
                </p>
                <p className="text-2xl font-bold">
                  {teamStats.avg_response_time}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shifts Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {shifts.map((shift) => (
          <Card key={shift.name} className={shift.color}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                    <shift.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{shift.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {shift.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{shift.members}</p>
                  <p className="text-sm text-muted-foreground">kişi</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Ekip Üyeleri</TabsTrigger>
          <TabsTrigger value="performance">Performans</TabsTrigger>
          <TabsTrigger value="schedule">Vardiya Takvimi</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {/* Filter */}
          <div className="flex items-center gap-4">
            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Vardiya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Vardiyalar</SelectItem>
                <SelectItem value="morning">Sabah</SelectItem>
                <SelectItem value="afternoon">Öğleden Sonra</SelectItem>
                <SelectItem value="night">Gece</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Team Members Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        {getRoleBadge(member.role)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      {member.rating}
                    </div>
                  </div>

                  {member.current_task && (
                    <div className="mt-4 rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Laptop className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Şu an:</span>
                      </div>
                      <p className="mt-1 text-sm font-medium">
                        {member.current_task}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Bugün</span>
                    <span className="font-medium">
                      {member.tasks_today} görev
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Mesaj
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      İstatistik
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Bu Hafta Liderlik Tablosu
                </CardTitle>
                <CardDescription>
                  En çok görev tamamlayan ekip üyeleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((item) => (
                    <div
                      key={item.rank}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            item.rank === 1
                              ? 'bg-yellow-100 text-yellow-600'
                              : item.rank === 2
                                ? 'bg-gray-100 text-gray-600'
                                : item.rank === 3
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {item.rank}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.tasks} görev
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{item.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Haftalık Hedefler
                </CardTitle>
                <CardDescription>Ekip performans hedefleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Görev Tamamlama
                      </span>
                      <span className="text-sm text-muted-foreground">
                        324 / 400
                      </span>
                    </div>
                    <Progress value={81} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      %81 tamamlandı
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Yanıt Süresi Hedefi
                      </span>
                      <span className="text-sm text-muted-foreground">
                        4.2 dk / 5 dk
                      </span>
                    </div>
                    <Progress value={92} className="h-2" />
                    <p className="mt-1 text-xs text-green-600">
                      Hedefin altında!
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Müşteri Memnuniyeti
                      </span>
                      <span className="text-sm text-muted-foreground">
                        4.7 / 5.0
                      </span>
                    </div>
                    <Progress value={94} className="h-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      %94 memnuniyet
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        İlk Yanıt Çözümü
                      </span>
                      <span className="text-sm text-muted-foreground">
                        68% / 75%
                      </span>
                    </div>
                    <Progress value={68} className="h-2" />
                    <p className="mt-1 text-xs text-orange-600">
                      Hedefe yaklaşılıyor
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vardiya Takvimi</CardTitle>
              <CardDescription>
                Bu hafta için planlanan vardiyalar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <div className="grid grid-cols-8 border-b">
                  <div className="p-3 font-medium text-muted-foreground"></div>
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(
                    (day) => (
                      <div key={day} className="p-3 text-center font-medium">
                        {day}
                      </div>
                    ),
                  )}
                </div>
                {shifts.map((shift) => (
                  <div
                    key={shift.name}
                    className="grid grid-cols-8 border-b last:border-0"
                  >
                    <div className="p-3 flex items-center gap-2">
                      <shift.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {shift.name.split(' ')[0]}
                      </span>
                    </div>
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="p-3 text-center">
                        <div className="flex -space-x-2 justify-center">
                          {teamMembers
                            .filter(
                              (m) =>
                                m.shift ===
                                shift.name.toLowerCase().split(' ')[0],
                            )
                            .slice(0, 3)
                            .map((m) => (
                              <Avatar
                                key={m.id}
                                className="h-6 w-6 border-2 border-background"
                              >
                                <AvatarImage src={m.avatar} />
                                <AvatarFallback className="text-xs">
                                  {m.name[0]}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  Trophy,
  Medal,
  Star,
  Target,
  Zap,
  Crown,
  Award,
  TrendingUp,
  Users,
  Gift,
  Plus,
  Edit,
  Eye,
  MoreHorizontal,
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock gamification data
const stats = {
  total_badges: 45,
  active_challenges: 8,
  total_points_distributed: 2456789,
  engaged_users: 15678,
};

const badges = [
  {
    id: '1',
    name: 'Kaşif',
    description: '10 farklı şehri ziyaret et',
    icon: '🌍',
    rarity: 'common',
    earned_by: 8934,
    criteria: { type: 'cities_visited', count: 10 },
  },
  {
    id: '2',
    name: 'Sosyal Kelebek',
    description: '50 farklı kişiyle eşleş',
    icon: '🦋',
    rarity: 'rare',
    earned_by: 3456,
    criteria: { type: 'matches', count: 50 },
  },
  {
    id: '3',
    name: 'Fotoğrafçı',
    description: '100 moment paylaş',
    icon: '📸',
    rarity: 'rare',
    earned_by: 2345,
    criteria: { type: 'moments', count: 100 },
  },
  {
    id: '4',
    name: 'Dünya Vatandaşı',
    description: '5 farklı kıtayı ziyaret et',
    icon: '✈️',
    rarity: 'epic',
    earned_by: 567,
    criteria: { type: 'continents', count: 5 },
  },
  {
    id: '5',
    name: 'Efsane',
    description: 'Tüm rozetleri topla',
    icon: '👑',
    rarity: 'legendary',
    earned_by: 23,
    criteria: { type: 'all_badges', count: 1 },
  },
];

const leaderboard = [
  {
    rank: 1,
    name: 'Ahmet Y.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet',
    points: 45678,
    badges: 32,
  },
  {
    rank: 2,
    name: 'Fatma D.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatma',
    points: 42345,
    badges: 28,
  },
  {
    rank: 3,
    name: 'Can Ö.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=can',
    points: 38901,
    badges: 25,
  },
  {
    rank: 4,
    name: 'Zeynep A.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep',
    points: 35678,
    badges: 23,
  },
  {
    rank: 5,
    name: 'Emre K.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emre',
    points: 32456,
    badges: 21,
  },
];

const challenges = [
  {
    id: '1',
    name: 'Kış Macerası',
    description: '5 kış destinasyonundan moment paylaş',
    reward: '500 Puan + Özel Rozet',
    participants: 2345,
    end_date: '2024-12-31',
    progress: 65,
    status: 'active',
  },
  {
    id: '2',
    name: 'Yılbaşı Eşleşmesi',
    description: 'Yılbaşı haftası 10 kişiyle eşleş',
    reward: '1000 Puan',
    participants: 5678,
    end_date: '2025-01-01',
    progress: 40,
    status: 'active',
  },
  {
    id: '3',
    name: 'Sosyal Paylaşımcı',
    description: '3 momenti sosyal medyada paylaş',
    reward: '200 Puan',
    participants: 1234,
    end_date: '2024-12-25',
    progress: 80,
    status: 'active',
  },
];

export default function GamificationPage() {
  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return <Badge variant="outline">Yaygın</Badge>;
      case 'rare':
        return <Badge className="bg-blue-500">Nadir</Badge>;
      case 'epic':
        return <Badge className="bg-purple-500">Epik</Badge>;
      case 'legendary':
        return <Badge className="bg-yellow-500">Efsanevi</Badge>;
      default:
        return <Badge variant="outline">{rarity}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Oyunlaştırma</h1>
          <p className="text-muted-foreground">
            Rozetler, puanlar ve liderlik tablosu
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Rozet
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Rozet</p>
                <p className="text-2xl font-bold">{stats.total_badges}</p>
              </div>
              <Medal className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Challenge</p>
                <p className="text-2xl font-bold">{stats.active_challenges}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dağıtılan Puan</p>
                <p className="text-2xl font-bold">
                  {(stats.total_points_distributed / 1000000).toFixed(1)}M
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Oyuncular</p>
                <p className="text-2xl font-bold">
                  {stats.engaged_users.toLocaleString('tr-TR')}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="badges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="badges">Rozetler</TabsTrigger>
          <TabsTrigger value="challenges">Challengelar</TabsTrigger>
          <TabsTrigger value="leaderboard">Liderlik Tablosu</TabsTrigger>
          <TabsTrigger value="rewards">Ödüller</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => (
              <Card key={badge.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-3xl">
                        {badge.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{badge.name}</h3>
                        {getRarityBadge(badge.rarity)}
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {badge.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Kazanan</span>
                    <span className="font-medium">
                      {badge.earned_by.toLocaleString('tr-TR')} kişi
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-lg">{challenge.name}</h3>
                      <Badge className="bg-green-500">Aktif</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {challenge.description}
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">İlerleme</span>
                        <span className="font-medium">
                          {challenge.progress}%
                        </span>
                      </div>
                      <Progress value={challenge.progress} className="h-2" />
                    </div>
                    <div className="mt-4 flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Gift className="h-4 w-4 text-muted-foreground" />
                        <span>{challenge.reward}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {challenge.participants.toLocaleString()} katılımcı
                        </span>
                      </div>
                      <div className="text-muted-foreground">
                        Bitiş: {challenge.end_date}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Düzenle
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Bu Ay En İyiler
              </CardTitle>
              <CardDescription>
                En çok puan toplayan kullanıcılar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((user) => (
                  <div
                    key={user.rank}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
                          user.rank === 1
                            ? 'bg-yellow-100 text-yellow-600'
                            : user.rank === 2
                              ? 'bg-gray-100 text-gray-600'
                              : user.rank === 3
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {user.rank}
                      </div>
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.badges} rozet
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="text-xl font-bold">
                        {user.points.toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ödül Kataloğu</CardTitle>
              <CardDescription>
                Puanlarla takas edilebilir ödüller
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { name: 'Premium 1 Hafta', points: 5000, icon: '⭐' },
                  { name: 'Özel Profil Çerçevesi', points: 2000, icon: '🖼️' },
                  { name: 'Boost x5', points: 1000, icon: '🚀' },
                  { name: 'Hediye Kartı ₺50', points: 10000, icon: '🎁' },
                  { name: 'Özel Emoji Paketi', points: 3000, icon: '😎' },
                  { name: 'VIP Rozeti', points: 15000, icon: '💎' },
                ].map((reward, i) => (
                  <div key={i} className="rounded-lg border p-4 text-center">
                    <div className="text-4xl mb-2">{reward.icon}</div>
                    <p className="font-medium">{reward.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {reward.points.toLocaleString()} puan
                    </p>
                    <Button size="sm" variant="outline" className="mt-3 w-full">
                      Düzenle
                    </Button>
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

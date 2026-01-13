'use client';

import { useState } from 'react';
import {
  Star,
  Users,
  TrendingUp,
  DollarSign,
  Eye,
  Heart,
  Award,
  Crown,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  Camera,
  Sparkles,
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

// Mock data
const creatorStats = {
  total_creators: 1247,
  verified_creators: 856,
  pending_applications: 42,
  total_earnings: 89450,
  avg_engagement: 4.8,
};

const creators = [
  {
    id: '1',
    name: 'Ayşe Yılmaz',
    username: '@ayse_travels',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ayse',
    tier: 'gold',
    followers: 45200,
    moments: 234,
    earnings: 12450,
    engagement: 5.2,
    verified: true,
    joined: '2024-01-15',
    status: 'active',
  },
  {
    id: '2',
    name: 'Mehmet Kaya',
    username: '@mehmet_adventures',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet',
    tier: 'platinum',
    followers: 89300,
    moments: 456,
    earnings: 28900,
    engagement: 6.1,
    verified: true,
    joined: '2023-08-20',
    status: 'active',
  },
  {
    id: '3',
    name: 'Zeynep Demir',
    username: '@zeynep_world',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep',
    tier: 'silver',
    followers: 12800,
    moments: 89,
    earnings: 3200,
    engagement: 4.5,
    verified: true,
    joined: '2024-06-10',
    status: 'active',
  },
  {
    id: '4',
    name: 'Can Öztürk',
    username: '@can_explorer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=can',
    tier: 'bronze',
    followers: 5400,
    moments: 45,
    earnings: 890,
    engagement: 3.8,
    verified: false,
    joined: '2024-09-01',
    status: 'active',
  },
];

const applications = [
  {
    id: 'app_1',
    name: 'Elif Arslan',
    username: '@elif_journey',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elif',
    followers: 8500,
    moments: 67,
    engagement: 4.2,
    applied_at: '2024-12-16',
    status: 'pending',
    notes: 'İstanbul ve Kapadokya içerikleri güçlü',
  },
  {
    id: 'app_2',
    name: 'Burak Şahin',
    username: '@burak_nomad',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=burak',
    followers: 12300,
    moments: 89,
    engagement: 5.1,
    applied_at: '2024-12-15',
    status: 'pending',
    notes: 'Avrupa seyahatleri odaklı',
  },
  {
    id: 'app_3',
    name: 'Selin Yıldız',
    username: '@selin_wanders',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=selin',
    followers: 3200,
    moments: 34,
    engagement: 3.5,
    applied_at: '2024-12-14',
    status: 'review',
    notes: 'Takipçi sayısı düşük ama içerik kalitesi iyi',
  },
];

const tierConfig = {
  bronze: { color: 'bg-amber-700', icon: Award, min: 0, max: 5000 },
  silver: { color: 'bg-gray-400', icon: Award, min: 5000, max: 25000 },
  gold: { color: 'bg-yellow-500', icon: Star, min: 25000, max: 100000 },
  platinum: { color: 'bg-purple-500', icon: Crown, min: 100000, max: Infinity },
};

export default function CreatorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  const getTierBadge = (tier: string) => {
    const config = tierConfig[tier as keyof typeof tierConfig];
    const Icon = config.icon;
    return (
      <CanvaBadge className={`${config.color} text-white`}>
        <Icon className="mr-1 h-3 w-3" />
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </CanvaBadge>
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Creator Program</h1>
          <p className="text-muted-foreground">
            İçerik üreticilerini yönet ve takip et
          </p>
        </div>
        <CanvaButton>
          <Sparkles className="mr-2 h-4 w-4" />
          Yeni Creator Ekle
        </CanvaButton>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <CanvaStatCard
          label="Toplam Creator"
          value={creatorStats.total_creators.toLocaleString('tr-TR')}
          icon={<Users className="h-6 w-6 text-blue-500 dark:text-blue-400" />}
        />
        <CanvaStatCard
          label="Onaylı"
          value={creatorStats.verified_creators}
          icon={<CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />}
        />
        <CanvaStatCard
          label="Bekleyen"
          value={creatorStats.pending_applications}
          icon={<Clock className="h-6 w-6 text-orange-500 dark:text-orange-400" />}
        />
        <CanvaStatCard
          label="Toplam Kazanç"
          value={`₺${creatorStats.total_earnings.toLocaleString('tr-TR')}`}
          icon={<DollarSign className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />}
        />
        <CanvaStatCard
          label="Ort. Etkileşim"
          value={`${creatorStats.avg_engagement}%`}
          icon={<TrendingUp className="h-6 w-6 text-pink-500 dark:text-pink-400" />}
        />
      </div>

      <Tabs defaultValue="creators" className="space-y-4">
        <TabsList>
          <TabsTrigger value="creators">Creatorlar</TabsTrigger>
          <TabsTrigger value="applications">
            Başvurular
            <CanvaBadge className="ml-2 bg-orange-500">
              {applications.length}
            </CanvaBadge>
          </TabsTrigger>
          <TabsTrigger value="tiers">Tier Sistemi</TabsTrigger>
          <TabsTrigger value="payouts">Ödemeler</TabsTrigger>
        </TabsList>

        <TabsContent value="creators" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Creator ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Tierlar</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Creators Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => (
              <CanvaCard key={creator.id}>
                <CanvaCardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={creator.avatar} />
                        <AvatarFallback>{creator.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{creator.name}</p>
                          {creator.verified && (
                            <CheckCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {creator.username}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <CanvaButton variant="ghost" size="sm" iconOnly>
                          <MoreHorizontal className="h-4 w-4" />
                        </CanvaButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Profili Görüntüle</DropdownMenuItem>
                        <DropdownMenuItem>Tier Değiştir</DropdownMenuItem>
                        <DropdownMenuItem>Mesaj Gönder</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Askıya Al
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4">{getTierBadge(creator.tier)}</div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{formatNumber(creator.followers)} takipçi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      <span>{creator.moments} moment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span>{creator.engagement}% etkileşim</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>₺{creator.earnings.toLocaleString('tr-TR')}</span>
                    </div>
                  </div>

                  <CanvaButton variant="primary" className="mt-4 w-full">
                    Detayları Gör
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </CanvaButton>
                </CanvaCardBody>
              </CanvaCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Creator Başvuruları</CanvaCardTitle>
              <CanvaCardSubtitle>İnceleme bekleyen başvurular</CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={app.avatar} />
                        <AvatarFallback>{app.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{app.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.username}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {app.notes}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right text-sm">
                        <p>{formatNumber(app.followers)} takipçi</p>
                        <p className="text-muted-foreground">
                          {app.moments} moment
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p>{app.engagement}% etkileşim</p>
                        <p className="text-muted-foreground">
                          {app.applied_at}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <CanvaButton size="sm" variant="primary">
                          <XCircle className="mr-1 h-4 w-4" />
                          Reddet
                        </CanvaButton>
                        <CanvaButton size="sm">
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Onayla
                        </CanvaButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(tierConfig).map(([tier, config]) => (
              <CanvaCard key={tier}>
                <CanvaCardHeader>
                  <div className="flex items-center justify-between">
                    <CanvaCardTitle className="capitalize">{tier}</CanvaCardTitle>
                    <div className={`rounded-full p-2 ${config.color}`}>
                      <config.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CanvaCardHeader>
                <CanvaCardBody>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Takipçi Aralığı
                      </p>
                      <p className="font-medium">
                        {formatNumber(config.min)} -{' '}
                        {config.max === Infinity
                          ? '∞'
                          : formatNumber(config.max)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Komisyon Payı
                      </p>
                      <p className="font-medium">
                        {tier === 'bronze'
                          ? '70%'
                          : tier === 'silver'
                            ? '75%'
                            : tier === 'gold'
                              ? '80%'
                              : '85%'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Özel Avantajlar
                      </p>
                      <ul className="mt-1 text-sm space-y-1">
                        {tier === 'platinum' && (
                          <>
                            <li>• Öncelikli destek</li>
                            <li>• Öne çıkarılma</li>
                            <li>• Özel etkinlikler</li>
                          </>
                        )}
                        {tier === 'gold' && (
                          <>
                            <li>• Öncelikli destek</li>
                            <li>• Haftalık öne çıkarılma</li>
                          </>
                        )}
                        {tier === 'silver' && <li>• Aylık öne çıkarılma</li>}
                        {tier === 'bronze' && <li>• Temel özellikler</li>}
                      </ul>
                    </div>
                  </div>
                </CanvaCardBody>
              </CanvaCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Ödeme Özeti</CanvaCardTitle>
              <CanvaCardSubtitle>Bu ayki creator ödemeleri</CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      Bekleyen Ödemeler
                    </p>
                    <p className="text-2xl font-bold">₺24,500</p>
                    <p className="text-sm text-muted-foreground">12 creator</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      Bu Ay Ödenen
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">₺89,450</p>
                    <p className="text-sm text-muted-foreground">45 creator</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      Sonraki Ödeme
                    </p>
                    <p className="text-2xl font-bold">3 gün</p>
                    <p className="text-sm text-muted-foreground">
                      21 Aralık 2024
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Bekleyen Ödemeler</h4>
                  {creators.slice(0, 3).map((creator) => (
                    <div
                      key={creator.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={creator.avatar} />
                          <AvatarFallback>{creator.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{creator.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {creator.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-medium">
                          ₺{(creator.earnings * 0.2).toLocaleString('tr-TR')}
                        </p>
                        <CanvaButton size="sm">Öde</CanvaButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

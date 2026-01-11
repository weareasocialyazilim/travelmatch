'use client';

/**
 * TravelMatch Discovery & Matching Analytics
 * Kesif ve eslestirme sistemi analitiği
 *
 * PostGIS konum analitiği, matching metrikleri, moment performansi
 */

import { useState } from 'react';
import {
  Heart,
  MapPin,
  Globe,
  Search,
  Target,
  TrendingUp,
  TrendingDown,
  Users,
  Camera,
  Clock,
  Star,
  BarChart3,
  Activity,
  Filter,
  Eye,
  Compass,
  Navigation,
  Map,
  RefreshCw,
  Zap,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminAreaChart, AdminBarChart, AdminLineChart, CHART_COLORS } from '@/components/common/admin-chart';
import { formatCurrency, cn } from '@/lib/utils';

// Discovery Stats
const discoveryStats = {
  totalMoments: 12456,
  activeMoments: 8934,
  discoveriesToday: 45678,
  matchesToday: 567,
  avgDiscoveryToMatch: 3.2, // gun
  conversionRate: 12.4, // % discovery to match
  avgSearchRadius: 32, // km
  popularCategory: 'Adventure',
};

// Geographic Hotspots
const geoHotspots = [
  { city: 'Istanbul', lat: 41.0082, lng: 28.9784, moments: 3456, discoveries: 15678, matches: 234, growth: 15.2 },
  { city: 'Antalya', lat: 36.8969, lng: 30.7133, moments: 1234, discoveries: 8456, matches: 156, growth: 22.3 },
  { city: 'Kapadokya', lat: 38.6431, lng: 34.8289, moments: 892, discoveries: 6234, matches: 123, growth: 35.4 },
  { city: 'Izmir', lat: 38.4237, lng: 27.1428, moments: 789, discoveries: 5123, matches: 98, growth: 18.5 },
  { city: 'Bodrum', lat: 37.0344, lng: 27.4305, moments: 654, discoveries: 4567, matches: 87, growth: 28.7 },
  { city: 'Fethiye', lat: 36.6214, lng: 29.1164, moments: 456, discoveries: 3456, matches: 67, growth: 25.1 },
];

// Category Performance
const categoryPerformance = [
  { category: 'Adventure', moments: 2345, discoveries: 12456, matches: 234, conversion: 15.8, avgPrice: 1850, growth: 22 },
  { category: 'Luxury', moments: 1234, discoveries: 8934, matches: 189, conversion: 18.2, avgPrice: 4500, growth: 15 },
  { category: 'Food', moments: 1890, discoveries: 9876, matches: 156, conversion: 12.4, avgPrice: 950, growth: 28 },
  { category: 'Nature', moments: 1567, discoveries: 7654, matches: 134, conversion: 11.8, avgPrice: 1200, growth: 18 },
  { category: 'Culture', moments: 1234, discoveries: 6543, matches: 112, conversion: 10.5, avgPrice: 780, growth: 12 },
  { category: 'Wellness', moments: 890, discoveries: 4567, matches: 89, conversion: 14.2, avgPrice: 2100, growth: 32 },
  { category: 'Romantic', moments: 678, discoveries: 3456, matches: 78, conversion: 16.8, avgPrice: 2800, growth: 25 },
];

// Discovery Funnel Data
const discoveryFunnel = [
  { stage: 'Kesif Sayfasi Gorunum', count: 125000, rate: 100 },
  { stage: 'Moment Tiklamasi', count: 45678, rate: 36.5 },
  { stage: 'Detay Gorunum', count: 23456, rate: 51.3 },
  { stage: 'Profil Inceleme', count: 12345, rate: 52.6 },
  { stage: 'Mesaj/Ilgi', count: 5678, rate: 46 },
  { stage: 'Hediye Gonderimi', count: 567, rate: 10 },
];

// Hourly Discovery Data
const hourlyDiscoveryData = [
  { hour: '00', discoveries: 1234, matches: 23 },
  { hour: '04', discoveries: 678, matches: 12 },
  { hour: '08', discoveries: 3456, matches: 45 },
  { hour: '12', discoveries: 5678, matches: 78 },
  { hour: '16', discoveries: 7890, matches: 98 },
  { hour: '20', discoveries: 9012, matches: 123 },
  { hour: '24', discoveries: 4567, matches: 67 },
];

// Weekly Trend
const weeklyTrendData = [
  { date: 'Pzt', discoveries: 38500, matches: 456, conversion: 11.8 },
  { date: 'Sal', discoveries: 42200, matches: 512, conversion: 12.1 },
  { date: 'Car', discoveries: 39800, matches: 478, conversion: 12.0 },
  { date: 'Per', discoveries: 48500, matches: 589, conversion: 12.1 },
  { date: 'Cum', discoveries: 52900, matches: 678, conversion: 12.8 },
  { date: 'Cmt', discoveries: 58400, matches: 756, conversion: 12.9 },
  { date: 'Paz', discoveries: 45678, matches: 567, conversion: 12.4 },
];

// Top Performing Moments
const topMoments = [
  { id: 'MOM-001', title: 'Hot Air Balloon Cappadocia', host: 'Ayse M.', category: 'Adventure', discoveries: 1234, matches: 45, conversion: 28.5, rating: 4.9 },
  { id: 'MOM-002', title: 'Bosphorus Luxury Dinner', host: 'Mehmet K.', category: 'Luxury', discoveries: 987, matches: 38, conversion: 25.2, rating: 4.8 },
  { id: 'MOM-003', title: 'Turkish Cooking Class', host: 'Zeynep A.', category: 'Food', discoveries: 876, matches: 32, conversion: 22.8, rating: 4.9 },
  { id: 'MOM-004', title: 'Paragliding Fethiye', host: 'Can B.', category: 'Adventure', discoveries: 765, matches: 28, conversion: 21.4, rating: 4.7 },
  { id: 'MOM-005', title: 'Private Yacht Tour', host: 'Deniz K.', category: 'Luxury', discoveries: 654, matches: 24, conversion: 20.8, rating: 4.8 },
];

// Search Filters Analysis
const searchFilters = [
  { filter: 'Kategori', usage: 78, topValue: 'Adventure' },
  { filter: 'Fiyat Araligi', usage: 65, topValue: '500-2000 TL' },
  { filter: 'Mesafe', usage: 54, topValue: '50 km' },
  { filter: 'Tarih', usage: 42, topValue: 'Bu hafta' },
  { filter: 'Cinsiyet', usage: 38, topValue: 'Tumu' },
  { filter: 'Dogrulanmis', usage: 35, topValue: 'Evet' },
];

export default function DiscoveryAnalyticsPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  return (
    <div className="admin-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Compass className="h-6 w-6 text-pink-500" />
            Discovery & Matching Analytics
          </h1>
          <p className="text-muted-foreground">
            Kesif ve eslestirme sistemi metrikleri - PostGIS tabanlı
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Son 24 Saat</SelectItem>
              <SelectItem value="7d">Son 7 Gun</SelectItem>
              <SelectItem value="30d">Son 30 Gun</SelectItem>
              <SelectItem value="90d">Son 90 Gun</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Camera className="h-3 w-3" />
              Toplam Moment
            </CardDescription>
            <CardTitle className="text-xl font-bold">
              {discoveryStats.totalMoments.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-600">{discoveryStats.activeMoments.toLocaleString()} aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              Bugun Kesif
            </CardDescription>
            <CardTitle className="text-xl font-bold text-blue-600">
              {discoveryStats.discoveriesToday.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Bugun Eslesme
            </CardDescription>
            <CardTitle className="text-xl font-bold text-pink-600">
              {discoveryStats.matchesToday}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Donusum
            </CardDescription>
            <CardTitle className="text-xl font-bold text-emerald-600">
              %{discoveryStats.conversionRate}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Ort. Sure
            </CardDescription>
            <CardTitle className="text-xl font-bold">
              {discoveryStats.avgDiscoveryToMatch} gun
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Navigation className="h-3 w-3" />
              Ort. Radius
            </CardDescription>
            <CardTitle className="text-xl font-bold">
              {discoveryStats.avgSearchRadius} km
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              En Populer
            </CardDescription>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              {discoveryStats.popularCategory}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Discovery Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-500" />
            Kesif Donusum Hunisi
          </CardTitle>
          <CardDescription>Kesiften eslemeye kullanici yolculugu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {discoveryFunnel.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium">{stage.stage}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {stage.count.toLocaleString()} ({stage.rate}%)
                  </span>
                </div>
                <Progress value={stage.rate} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Genel Bakis</TabsTrigger>
          <TabsTrigger value="geography">Cografya</TabsTrigger>
          <TabsTrigger value="categories">Kategoriler</TabsTrigger>
          <TabsTrigger value="moments">Top Momentler</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Hourly Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Saatlik Aktivite</CardTitle>
                <CardDescription>Kesif ve eslesme dagilimi</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminAreaChart
                  data={hourlyDiscoveryData}
                  xAxisKey="hour"
                  height={250}
                  areas={[
                    { dataKey: 'discoveries', name: 'Kesifler', color: CHART_COLORS.primary },
                    { dataKey: 'matches', name: 'Eslesmeler', color: CHART_COLORS.secondary },
                  ]}
                />
              </CardContent>
            </Card>

            {/* Search Filters Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-blue-500" />
                  Filtre Kullanimi
                </CardTitle>
                <CardDescription>En cok kullanilan arama filtreleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchFilters.map((filter) => (
                    <div key={filter.filter} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{filter.filter}</span>
                        <span className="text-muted-foreground">
                          %{filter.usage} - En populer: {filter.topValue}
                        </span>
                      </div>
                      <Progress value={filter.usage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Haftalik Trend</CardTitle>
              <CardDescription>Kesif ve eslesme trendi</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminLineChart
                data={weeklyTrendData}
                xAxisKey="date"
                height={300}
                lines={[
                  { dataKey: 'discoveries', name: 'Kesifler', color: CHART_COLORS.primary },
                  { dataKey: 'matches', name: 'Eslesmeler', color: CHART_COLORS.secondary },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-emerald-500" />
                Cografi Hotspotlar
              </CardTitle>
              <CardDescription>PostGIS tabanlı konum analitiği</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geoHotspots.map((spot, index) => (
                  <div key={spot.city} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white",
                        index === 0 && "bg-amber-500",
                        index === 1 && "bg-gray-400",
                        index === 2 && "bg-orange-400",
                        index > 2 && "bg-blue-500/50",
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {spot.city}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-8 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Moment</p>
                        <p className="font-bold">{spot.moments.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Kesif</p>
                        <p className="font-bold">{spot.discoveries.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Eslesme</p>
                        <p className="font-bold text-pink-600">{spot.matches}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Buyume</p>
                        <p className={cn("font-bold flex items-center gap-1", spot.growth > 0 ? "text-emerald-600" : "text-red-600")}>
                          {spot.growth > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {spot.growth}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kategori Performansi</CardTitle>
              <CardDescription>Kategori bazli kesif ve eslesme metrikleri</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Moment</TableHead>
                    <TableHead>Kesif</TableHead>
                    <TableHead>Eslesme</TableHead>
                    <TableHead>Donusum</TableHead>
                    <TableHead>Ort. Fiyat</TableHead>
                    <TableHead>Buyume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryPerformance.map((cat) => (
                    <TableRow key={cat.category}>
                      <TableCell className="font-medium">{cat.category}</TableCell>
                      <TableCell>{cat.moments.toLocaleString()}</TableCell>
                      <TableCell>{cat.discoveries.toLocaleString()}</TableCell>
                      <TableCell className="text-pink-600 font-medium">{cat.matches}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          cat.conversion >= 15 ? "bg-emerald-500/10 text-emerald-600" :
                          cat.conversion >= 12 ? "bg-blue-500/10 text-blue-600" :
                          "bg-amber-500/10 text-amber-600"
                        )}>
                          %{cat.conversion}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(cat.avgPrice, 'TRY')}</TableCell>
                      <TableCell>
                        <span className={cn("flex items-center gap-1", cat.growth > 0 ? "text-emerald-600" : "text-red-600")}>
                          {cat.growth > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {cat.growth}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Moments Tab */}
        <TabsContent value="moments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                En Iyi Performans Gosteren Momentler
              </CardTitle>
              <CardDescription>En yuksek donusum oranina sahip momentler</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Moment</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Kesif</TableHead>
                    <TableHead>Eslesme</TableHead>
                    <TableHead>Donusum</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topMoments.map((moment, index) => (
                    <TableRow key={moment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                            index === 0 && "bg-amber-500",
                            index === 1 && "bg-gray-400",
                            index === 2 && "bg-orange-400",
                            index > 2 && "bg-blue-500/50",
                          )}>
                            {index + 1}
                          </div>
                          <span className="font-medium">{moment.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{moment.host}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{moment.category}</Badge>
                      </TableCell>
                      <TableCell>{moment.discoveries.toLocaleString()}</TableCell>
                      <TableCell className="text-pink-600 font-medium">{moment.matches}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/10 text-emerald-600">%{moment.conversion}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          <span className="font-medium">{moment.rating}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

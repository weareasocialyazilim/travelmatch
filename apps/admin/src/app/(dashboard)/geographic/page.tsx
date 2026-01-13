'use client';

import { useState } from 'react';
import {
  Globe,
  MapPin,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Filter,
  Download,
  RefreshCw,
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

// Mock data
const countryStats = [
  {
    code: 'TR',
    name: 'Türkiye',
    users: 125000,
    activeUsers: 45000,
    revenue: 2450000,
    growth: 12.5,
    topCities: ['İstanbul', 'Ankara', 'İzmir', 'Antalya'],
  },
  {
    code: 'DE',
    name: 'Almanya',
    users: 28000,
    activeUsers: 12000,
    revenue: 890000,
    growth: 8.2,
    topCities: ['Berlin', 'München', 'Hamburg', 'Frankfurt'],
  },
  {
    code: 'GB',
    name: 'İngiltere',
    users: 22000,
    activeUsers: 9500,
    revenue: 720000,
    growth: 15.3,
    topCities: ['London', 'Manchester', 'Birmingham', 'Liverpool'],
  },
  {
    code: 'NL',
    name: 'Hollanda',
    users: 15000,
    activeUsers: 6200,
    revenue: 480000,
    growth: 22.1,
    topCities: ['Amsterdam', 'Rotterdam', 'Den Haag', 'Utrecht'],
  },
  {
    code: 'FR',
    name: 'Fransa',
    users: 12000,
    activeUsers: 4800,
    revenue: 360000,
    growth: -2.4,
    topCities: ['Paris', 'Lyon', 'Marseille', 'Nice'],
  },
];

const cityStats = [
  { name: 'İstanbul', users: 45000, revenue: 890000, growth: 15.2 },
  { name: 'Ankara', users: 22000, revenue: 420000, growth: 8.5 },
  { name: 'İzmir', users: 18000, revenue: 340000, growth: 12.1 },
  { name: 'Antalya', users: 15000, revenue: 380000, growth: 25.4 },
  { name: 'Berlin', users: 8000, revenue: 280000, growth: 10.2 },
  { name: 'London', users: 7500, revenue: 320000, growth: 18.3 },
  { name: 'Amsterdam', users: 5200, revenue: 180000, growth: 28.5 },
  { name: 'Paris', users: 4800, revenue: 150000, growth: -5.2 },
];

const regionDistribution = [
  { name: 'Avrupa', value: 75, color: '#3b82f6' },
  { name: 'Asya', value: 15, color: '#22c55e' },
  { name: 'Kuzey Amerika', value: 6, color: '#f59e0b' },
  { name: 'Diğer', value: 4, color: '#6b7280' },
];

const heatmapData = [
  {
    hour: '00:00',
    mon: 120,
    tue: 115,
    wed: 125,
    thu: 118,
    fri: 135,
    sat: 180,
    sun: 165,
  },
  {
    hour: '04:00',
    mon: 80,
    tue: 75,
    wed: 85,
    thu: 78,
    fri: 95,
    sat: 120,
    sun: 110,
  },
  {
    hour: '08:00',
    mon: 250,
    tue: 245,
    wed: 255,
    thu: 248,
    fri: 265,
    sat: 180,
    sun: 165,
  },
  {
    hour: '12:00',
    mon: 380,
    tue: 375,
    wed: 395,
    thu: 388,
    fri: 420,
    sat: 350,
    sun: 320,
  },
  {
    hour: '16:00',
    mon: 450,
    tue: 445,
    wed: 465,
    thu: 458,
    fri: 520,
    sat: 480,
    sun: 420,
  },
  {
    hour: '20:00',
    mon: 520,
    tue: 515,
    wed: 535,
    thu: 528,
    fri: 620,
    sat: 680,
    sun: 580,
  },
];

const overallStats = {
  totalCountries: 45,
  activeCountries: 28,
  totalCities: 320,
  activeCities: 185,
};

export default function GeographicPage() {
  const [selectedCountry, setSelectedCountry] = useState<string>('TR');
  const [dateRange, setDateRange] = useState('7d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coğrafi Analiz</h1>
          <p className="text-muted-foreground">
            Kullanıcı dağılımı ve bölgesel performans analizi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Son 7 gün</SelectItem>
              <SelectItem value="30d">Son 30 gün</SelectItem>
              <SelectItem value="90d">Son 90 gün</SelectItem>
              <SelectItem value="1y">Son 1 yıl</SelectItem>
            </SelectContent>
          </Select>
          <CanvaButton variant="primary" size="sm" iconOnly>
            <RefreshCw className="h-4 w-4" />
          </CanvaButton>
          <CanvaButton variant="primary">
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </CanvaButton>
        </div>
      </div>

      {/* Global Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <CanvaStatCard
          title="Ülke"
          value={overallStats.totalCountries.toString()}
          icon={<Globe className="h-5 w-5" />}
        />
        <CanvaStatCard
          title="Şehir"
          value={overallStats.totalCities.toString()}
          icon={<MapPin className="h-5 w-5" />}
        />
        <CanvaStatCard
          title="Toplam Kullanıcı"
          value={countryStats
            .reduce((sum, c) => sum + c.users, 0)
            .toLocaleString('tr-TR')}
          icon={<Users className="h-5 w-5" />}
        />
        <CanvaStatCard
          title="Toplam Gelir"
          value={formatCurrency(
            countryStats.reduce((sum, c) => sum + c.revenue, 0),
            'TRY',
          )}
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      <Tabs defaultValue="countries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="countries">
            <Globe className="mr-2 h-4 w-4" />
            Ülkeler
          </TabsTrigger>
          <TabsTrigger value="cities">
            <MapPin className="mr-2 h-4 w-4" />
            Şehirler
          </TabsTrigger>
          <TabsTrigger value="heatmap">
            <Activity className="mr-2 h-4 w-4" />
            Aktivite Haritası
          </TabsTrigger>
        </TabsList>

        {/* Countries Tab */}
        <TabsContent value="countries" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Country List */}
            <div className="lg:col-span-2">
              <CanvaCard>
                <CanvaCardHeader>
                  <CanvaCardTitle>Ülke Performansı</CanvaCardTitle>
                  <CanvaCardSubtitle>
                    Kullanıcı ve gelir bazlı ülke sıralaması
                  </CanvaCardSubtitle>
                </CanvaCardHeader>
                <CanvaCardBody>
                  <div className="space-y-4">
                    {countryStats.map((country, index) => (
                      <div
                        key={country.code}
                        className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors ${
                          selectedCountry === country.code
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-accent'
                        }`}
                        onClick={() => setSelectedCountry(country.code)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{country.name}</p>
                              <CanvaBadge variant="default">
                                {country.code}
                              </CanvaBadge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {country.users.toLocaleString('tr-TR')} kullanıcı
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatCurrency(country.revenue, 'TRY')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Gelir
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {country.growth > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500 dark:text-red-400" />
                            )}
                            <span
                              className={`text-sm font-medium ${
                                country.growth > 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {country.growth > 0 ? '+' : ''}
                              {country.growth}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CanvaCardBody>
              </CanvaCard>
            </div>

            {/* Region Distribution */}
            <div className="space-y-4">
              <CanvaCard>
                <CanvaCardHeader>
                  <CanvaCardTitle>Bölge Dağılımı</CanvaCardTitle>
                </CanvaCardHeader>
                <CanvaCardBody>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={regionDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {regionDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {regionDistribution.map((region) => (
                      <div
                        key={region.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: region.color }}
                          />
                          <span className="text-sm">{region.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {region.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CanvaCardBody>
              </CanvaCard>

              {/* Selected Country Details */}
              {selectedCountry && (
                <CanvaCard>
                  <CanvaCardHeader>
                    <CanvaCardTitle>
                      {
                        countryStats.find((c) => c.code === selectedCountry)
                          ?.name
                      }
                    </CanvaCardTitle>
                    <CanvaCardSubtitle>Detaylı bilgiler</CanvaCardSubtitle>
                  </CanvaCardHeader>
                  <CanvaCardBody className="space-y-4">
                    {(() => {
                      const country = countryStats.find(
                        (c) => c.code === selectedCountry,
                      );
                      if (!country) return null;
                      return (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Aktif Kullanıcı
                              </span>
                              <span className="font-medium">
                                {country.activeUsers.toLocaleString('tr-TR')}
                              </span>
                            </div>
                            <Progress
                              value={
                                (country.activeUsers / country.users) * 100
                              }
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground">
                              %
                              {(
                                (country.activeUsers / country.users) *
                                100
                              ).toFixed(1)}{' '}
                              aktivasyon
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">
                              Top Şehirler
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {country.topCities.map((city) => (
                                <CanvaBadge key={city} variant="default">
                                  {city}
                                </CanvaBadge>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </CanvaCardBody>
                </CanvaCard>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Cities Tab */}
        <TabsContent value="cities" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Şehir Performansı</CanvaCardTitle>
              <CanvaCardSubtitle>En aktif şehirler ve metrikleri</CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cityStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip
                      formatter={(value: number | undefined) => [
                        (value ?? 0).toLocaleString('tr-TR'),
                        'Kullanıcı',
                      ]}
                    />
                    <Bar dataKey="users" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CanvaCardBody>
          </CanvaCard>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cityStats.slice(0, 4).map((city) => (
              <CanvaCard key={city.name}>
                <CanvaCardBody>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{city.name}</h3>
                      <div className="flex items-center gap-1">
                        {city.growth > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 dark:text-red-400" />
                        )}
                        <span
                          className={`text-sm ${
                            city.growth > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {city.growth > 0 ? '+' : ''}
                          {city.growth}%
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Kullanıcı</p>
                        <p className="font-semibold">
                          {city.users.toLocaleString('tr-TR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gelir</p>
                        <p className="font-semibold">
                          {formatCurrency(city.revenue, 'TRY')}
                        </p>
                      </div>
                    </div>
                  </div>
                </CanvaCardBody>
              </CanvaCard>
            ))}
          </div>
        </TabsContent>

        {/* Heatmap Tab */}
        <TabsContent value="heatmap" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Aktivite Haritası</CanvaCardTitle>
              <CanvaCardSubtitle>
                Haftalık aktivite yoğunluğu (saat bazlı ortalama aktif
                kullanıcı)
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-sm font-medium text-muted-foreground">
                        Saat
                      </th>
                      <th className="p-2 text-center text-sm font-medium text-muted-foreground">
                        Pzt
                      </th>
                      <th className="p-2 text-center text-sm font-medium text-muted-foreground">
                        Sal
                      </th>
                      <th className="p-2 text-center text-sm font-medium text-muted-foreground">
                        Çar
                      </th>
                      <th className="p-2 text-center text-sm font-medium text-muted-foreground">
                        Per
                      </th>
                      <th className="p-2 text-center text-sm font-medium text-muted-foreground">
                        Cum
                      </th>
                      <th className="p-2 text-center text-sm font-medium text-muted-foreground">
                        Cmt
                      </th>
                      <th className="p-2 text-center text-sm font-medium text-muted-foreground">
                        Paz
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData.map((row) => (
                      <tr key={row.hour}>
                        <td className="p-2 text-sm font-medium">{row.hour}</td>
                        {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(
                          (day) => {
                            const value = row[
                              day as keyof typeof row
                            ] as number;
                            const maxValue = 680;
                            const intensity = value / maxValue;
                            return (
                              <td key={day} className="p-1">
                                <div
                                  className="flex h-10 w-full items-center justify-center rounded text-xs font-medium"
                                  style={{
                                    backgroundColor: `rgba(59, 130, 246, ${intensity})`,
                                    color:
                                      intensity > 0.5 ? 'white' : 'inherit',
                                  }}
                                >
                                  {value}
                                </div>
                              </td>
                            );
                          },
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

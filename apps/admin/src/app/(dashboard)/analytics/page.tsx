'use client';

import { useState } from 'react';
import {
  BarChart3,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Repeat,
  UserPlus,
  Clock,
  Map,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';

// Mock data for charts
const dailyActiveUsers = [
  { date: '12/12', dau: 3200, mau: 12500 },
  { date: '13/12', dau: 3450, mau: 12600 },
  { date: '14/12', dau: 3100, mau: 12700 },
  { date: '15/12', dau: 3800, mau: 12850 },
  { date: '16/12', dau: 4200, mau: 13000 },
  { date: '17/12', dau: 4500, mau: 13200 },
  { date: '18/12', dau: 4100, mau: 13400 },
];

const revenueData = [
  { date: '12/12', revenue: 12500, transactions: 89 },
  { date: '13/12', revenue: 15200, transactions: 102 },
  { date: '14/12', revenue: 11800, transactions: 78 },
  { date: '15/12', revenue: 18900, transactions: 134 },
  { date: '16/12', revenue: 22400, transactions: 156 },
  { date: '17/12', revenue: 19800, transactions: 142 },
  { date: '18/12', revenue: 24500, transactions: 178 },
];

const userAcquisition = [
  { source: 'Organik', value: 45, color: '#22c55e' },
  { source: 'Referral', value: 25, color: '#3b82f6' },
  { source: 'Sosyal Medya', value: 18, color: '#f59e0b' },
  { source: 'Reklam', value: 12, color: '#ef4444' },
];

const retentionData = [
  { day: 'Gün 1', rate: 100 },
  { day: 'Gün 3', rate: 72 },
  { day: 'Gün 7', rate: 58 },
  { day: 'Gün 14', rate: 45 },
  { day: 'Gün 30', rate: 38 },
  { day: 'Gün 60', rate: 32 },
  { day: 'Gün 90', rate: 28 },
];

const topCities = [
  { city: 'İstanbul', users: 4521, percentage: 35 },
  { city: 'Ankara', users: 2134, percentage: 17 },
  { city: 'İzmir', users: 1856, percentage: 14 },
  { city: 'Antalya', users: 1234, percentage: 10 },
  { city: 'Bursa', users: 987, percentage: 8 },
];

const contentStats = [
  { metric: 'Toplam Moment', value: '24,582', change: '+12%', trend: 'up' },
  { metric: 'Günlük Paylaşım', value: '342', change: '+8%', trend: 'up' },
  { metric: 'Ort. Etkileşim', value: '23.4', change: '-3%', trend: 'down' },
  { metric: 'Onay Oranı', value: '94%', change: '+2%', trend: 'up' },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analitik</h1>
          <p className="text-muted-foreground">
            Platform performansını ve kullanıcı davranışlarını izleyin
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Son 24 saat</SelectItem>
              <SelectItem value="7d">Son 7 gün</SelectItem>
              <SelectItem value="30d">Son 30 gün</SelectItem>
              <SelectItem value="90d">Son 90 gün</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Günlük Aktif Kullanıcı
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,521</div>
            <div className="flex items-center text-xs">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+12.5%</span>
              <span className="ml-1 text-muted-foreground">geçen haftadan</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Günlük Gelir</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(24500)}</div>
            <div className="flex items-center text-xs">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+23.7%</span>
              <span className="ml-1 text-muted-foreground">geçen haftadan</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dönüşüm Oranı</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <div className="flex items-center text-xs">
              <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
              <span className="text-red-600">-0.4%</span>
              <span className="ml-1 text-muted-foreground">geçen haftadan</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Retention (D7)
            </CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58%</div>
            <div className="flex items-center text-xs">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
              <span className="text-green-600">+5%</span>
              <span className="ml-1 text-muted-foreground">geçen aydan</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
          <TabsTrigger value="revenue">Gelir</TabsTrigger>
          <TabsTrigger value="content">İçerik</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* DAU/MAU Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Aktif Kullanıcılar</CardTitle>
                <CardDescription>DAU ve MAU trendi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyActiveUsers}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="dau"
                        name="DAU"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                      />
                      <Area
                        type="monotone"
                        dataKey="mau"
                        name="MAU"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.1}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Gelir</CardTitle>
                <CardDescription>Günlük gelir ve işlem sayısı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value, name) => [
                          name === 'revenue'
                            ? formatCurrency(value as number)
                            : value,
                          name === 'revenue' ? 'Gelir' : 'İşlem',
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="revenue"
                        name="Gelir"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* User Acquisition */}
            <Card>
              <CardHeader>
                <CardTitle>Kullanıcı Kazanımı</CardTitle>
                <CardDescription>Kaynak dağılımı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userAcquisition}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {userAcquisition.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {userAcquisition.map((item) => (
                    <div key={item.source} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">
                        {item.source} ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Retention Curve */}
            <Card>
              <CardHeader>
                <CardTitle>Retention Eğrisi</CardTitle>
                <CardDescription>Kullanıcı tutma oranları</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={retentionData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" unit="%" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: '#f59e0b' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Cities */}
            <Card>
              <CardHeader>
                <CardTitle>Popüler Şehirler</CardTitle>
                <CardDescription>Kullanıcı dağılımı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCities.map((city, index) => (
                    <div key={city.city} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {index + 1}.
                          </span>
                          <span>{city.city}</span>
                        </div>
                        <span className="font-medium">
                          {formatNumber(city.users)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${city.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Yeni Kayıtlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">234</div>
                <p className="text-xs text-muted-foreground">Bugün</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Aktif Oturumlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,847</div>
                <p className="text-xs text-muted-foreground">Şu an</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Ort. Oturum Süresi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.4 dk</div>
                <p className="text-xs text-muted-foreground">Bugün</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Churn Oranı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3%</div>
                <p className="text-xs text-muted-foreground">Bu ay</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Aylık Gelir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(324500)}
                </div>
                <p className="text-xs text-green-600">+18% geçen aydan</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ARPU</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(24.5)}</div>
                <p className="text-xs text-muted-foreground">
                  Kullanıcı başına
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">LTV</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(156)}</div>
                <p className="text-xs text-muted-foreground">
                  Yaşam boyu değer
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  İade Oranı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.8%</div>
                <p className="text-xs text-muted-foreground">Bu ay</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            {contentStats.map((stat) => (
              <Card key={stat.metric}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.metric}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="mr-1 h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {stat.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

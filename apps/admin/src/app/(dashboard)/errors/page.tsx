'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Bug,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  RefreshCw,
  Filter,
  Search,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

// Mock Sentry data
const errorStats = {
  total_errors_24h: 127,
  errors_change: -15,
  affected_users: 89,
  crash_free_rate: 99.2,
  unresolved: 23,
  releases: 5,
};

const errors = [
  {
    id: 'err_1',
    title: 'TypeError: Cannot read property "user" of undefined',
    culprit: 'src/screens/Profile/ProfileScreen.tsx',
    level: 'error',
    count: 45,
    users: 32,
    first_seen: '2024-12-15T10:30:00Z',
    last_seen: '2024-12-18T14:22:00Z',
    status: 'unresolved',
    platform: 'react-native',
    release: 'v1.2.3',
  },
  {
    id: 'err_2',
    title: 'NetworkError: Failed to fetch',
    culprit: 'src/lib/api/client.ts',
    level: 'error',
    count: 28,
    users: 21,
    first_seen: '2024-12-17T08:15:00Z',
    last_seen: '2024-12-18T13:45:00Z',
    status: 'unresolved',
    platform: 'react-native',
    release: 'v1.2.3',
  },
  {
    id: 'err_3',
    title: 'Error: Payment processing failed',
    culprit: 'supabase/functions/process-payment/index.ts',
    level: 'fatal',
    count: 12,
    users: 12,
    first_seen: '2024-12-18T09:00:00Z',
    last_seen: '2024-12-18T14:10:00Z',
    status: 'unresolved',
    platform: 'deno',
    release: 'v1.2.3',
  },
  {
    id: 'err_4',
    title: 'Warning: Each child in a list should have a unique "key" prop',
    culprit: 'src/components/MomentList.tsx',
    level: 'warning',
    count: 156,
    users: 78,
    first_seen: '2024-12-10T12:00:00Z',
    last_seen: '2024-12-18T14:20:00Z',
    status: 'ignored',
    platform: 'react-native',
    release: 'v1.2.2',
  },
  {
    id: 'err_5',
    title: 'RangeError: Maximum call stack size exceeded',
    culprit: 'src/hooks/useInfiniteScroll.ts',
    level: 'error',
    count: 8,
    users: 5,
    first_seen: '2024-12-18T11:30:00Z',
    last_seen: '2024-12-18T12:15:00Z',
    status: 'resolved',
    platform: 'react-native',
    release: 'v1.2.3',
  },
];

const releases = [
  {
    version: 'v1.2.3',
    date: '2024-12-15',
    errors: 85,
    crash_free: 99.1,
    status: 'active',
  },
  {
    version: 'v1.2.2',
    date: '2024-12-10',
    errors: 42,
    crash_free: 99.4,
    status: 'previous',
  },
  {
    version: 'v1.2.1',
    date: '2024-12-05',
    errors: 28,
    crash_free: 99.6,
    status: 'previous',
  },
];

export default function ErrorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'fatal':
        return <Badge variant="destructive">Fatal</Badge>;
      case 'error':
        return <Badge className="bg-red-500">Error</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Warning</Badge>;
      case 'info':
        return <Badge className="bg-blue-500">Info</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ignored':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const filteredErrors = errors.filter((error) => {
    if (levelFilter !== 'all' && error.level !== levelFilter) return false;
    if (statusFilter !== 'all' && error.status !== statusFilter) return false;
    if (
      searchQuery &&
      !error.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hata Takibi</h1>
          <p className="text-muted-foreground">
            Sentry entegrasyonu ile hata izleme
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            Sentry'de Aç
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24s Hata</p>
                <p className="text-2xl font-bold">
                  {errorStats.total_errors_24h}
                </p>
              </div>
              <Bug className="h-8 w-8 text-red-500" />
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
              <TrendingDown className="h-4 w-4" />
              {Math.abs(errorStats.errors_change)}% düşüş
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Etkilenen</p>
                <p className="text-2xl font-bold">
                  {errorStats.affected_users}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">kullanıcı</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Crash-Free</p>
                <p className="text-2xl font-bold text-green-600">
                  {errorStats.crash_free_rate}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">oturum oranı</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Çözülmemiş</p>
                <p className="text-2xl font-bold text-red-600">
                  {errorStats.unresolved}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">hata</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Release</p>
                <p className="text-2xl font-bold">{errorStats.releases}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">versiyon</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Son Hata</p>
                <p className="text-2xl font-bold">2dk</p>
              </div>
              <Clock className="h-8 w-8 text-gray-500" />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">önce</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Hatalar</TabsTrigger>
          <TabsTrigger value="releases">Releases</TabsTrigger>
          <TabsTrigger value="alerts">Alertler</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Hata ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Seviye" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="fatal">Fatal</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="unresolved">Çözülmemiş</SelectItem>
                <SelectItem value="resolved">Çözüldü</SelectItem>
                <SelectItem value="ignored">Yoksayıldı</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Errors Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Hata</TableHead>
                  <TableHead>Seviye</TableHead>
                  <TableHead className="text-right">Sayı</TableHead>
                  <TableHead className="text-right">Kullanıcı</TableHead>
                  <TableHead>Son Görülme</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredErrors.map((error) => (
                  <TableRow
                    key={error.id}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>{getStatusIcon(error.status)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium truncate max-w-md">
                          {error.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          {error.culprit}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getLevelBadge(error.level)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {error.count}
                    </TableCell>
                    <TableCell className="text-right">{error.users}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(error.last_seen).toLocaleString('tr-TR')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="releases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Release Geçmişi</CardTitle>
              <CardDescription>
                Son yayınlanan versiyonlar ve hata oranları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {releases.map((release) => (
                  <div
                    key={release.version}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{release.version}</p>
                        <p className="text-sm text-muted-foreground">
                          {release.date}
                        </p>
                      </div>
                      {release.status === 'active' && (
                        <Badge className="bg-green-500">Aktif</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Hatalar</p>
                        <p className="font-medium">{release.errors}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Crash-Free
                        </p>
                        <p className="font-medium text-green-600">
                          {release.crash_free}%
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Kuralları</CardTitle>
              <CardDescription>
                Hata bildirimleri için yapılandırılmış kurallar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium">Fatal Error Alert</p>
                      <p className="text-sm text-muted-foreground">
                        Fatal hata oluştuğunda anında bildir
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Aktif</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                      <TrendingUp className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Error Spike Alert</p>
                      <p className="text-sm text-muted-foreground">
                        Hata sayısı %50+ artarsa bildir
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Aktif</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">User Impact Alert</p>
                      <p className="text-sm text-muted-foreground">
                        100+ kullanıcı etkilenirse bildir
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Pasif</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

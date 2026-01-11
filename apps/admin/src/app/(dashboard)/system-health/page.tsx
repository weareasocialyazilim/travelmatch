'use client';

/**
 * Real-time System Health Dashboard
 * Comprehensive monitoring of all platform services and infrastructure
 */

import { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Wifi,
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Shield,
  Eye,
  TrendingUp,
  TrendingDown,
  Bell,
  ExternalLink,
  Circle,
  ChevronRight,
  BarChart3,
  Play,
  Pause,
  Settings,
  Terminal,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { AdminAreaChart, AdminLineChart } from '@/components/charts';
import { cn } from '@/lib/utils';

// System overview metrics
const systemOverview = {
  uptime: '99.97%',
  uptimeDays: 142,
  activeConnections: 12450,
  requestsPerSecond: 2847,
  avgLatency: 45,
  errorRate: 0.12,
};

// Service health status
const serviceHealth = [
  {
    name: 'API Gateway',
    status: 'healthy',
    uptime: 99.99,
    latency: 12,
    requests: 45000,
    errors: 2,
    region: 'EU-West',
  },
  {
    name: 'Supabase PostgreSQL',
    status: 'healthy',
    uptime: 99.98,
    latency: 8,
    requests: 128000,
    errors: 0,
    region: 'EU-West',
  },
  {
    name: 'Supabase Realtime',
    status: 'healthy',
    uptime: 99.95,
    latency: 25,
    requests: 89000,
    errors: 5,
    region: 'Global',
  },
  {
    name: 'ML Service (Python)',
    status: 'healthy',
    uptime: 99.92,
    latency: 145,
    requests: 23000,
    errors: 12,
    region: 'EU-West',
  },
  {
    name: 'Cloudflare CDN',
    status: 'healthy',
    uptime: 100,
    latency: 5,
    requests: 450000,
    errors: 0,
    region: 'Global',
  },
  {
    name: 'PayTR Gateway',
    status: 'degraded',
    uptime: 99.85,
    latency: 320,
    requests: 8500,
    errors: 45,
    region: 'TR',
  },
  {
    name: 'Twilio SMS',
    status: 'healthy',
    uptime: 99.97,
    latency: 85,
    requests: 12500,
    errors: 3,
    region: 'Global',
  },
  {
    name: 'SendGrid Email',
    status: 'healthy',
    uptime: 99.99,
    latency: 120,
    requests: 45000,
    errors: 1,
    region: 'Global',
  },
];

// Server metrics
const serverMetrics = {
  cpu: { current: 42, avg: 38, max: 78, cores: 8 },
  memory: { current: 68, avg: 62, max: 85, total: 32 },
  disk: { current: 45, avg: 42, max: 45, total: 500 },
  network: { in: 125, out: 340, total: 1000 },
};

// API endpoints performance
const apiEndpoints = [
  { endpoint: '/api/auth', method: 'POST', p50: 45, p95: 120, p99: 250, calls: 45000, errors: 12 },
  { endpoint: '/api/users', method: 'GET', p50: 32, p95: 85, p99: 180, calls: 128000, errors: 5 },
  { endpoint: '/api/moments', method: 'GET', p50: 55, p95: 145, p99: 320, calls: 89000, errors: 8 },
  { endpoint: '/api/reservations', method: 'POST', p50: 125, p95: 350, p99: 680, calls: 23000, errors: 23 },
  { endpoint: '/api/payments', method: 'POST', p50: 280, p95: 580, p99: 1200, calls: 8500, errors: 45 },
  { endpoint: '/api/chat', method: 'WS', p50: 15, p95: 45, p99: 85, calls: 450000, errors: 2 },
];

// Recent incidents
const recentIncidents = [
  {
    id: 'inc-001',
    title: 'PayTR Gateway Yavaşlama',
    status: 'investigating',
    severity: 'medium',
    startedAt: '10:45',
    duration: '25 dk',
    affected: 'Ödeme işlemleri',
  },
  {
    id: 'inc-002',
    title: 'ML Service Yüksek Latency',
    status: 'resolved',
    severity: 'low',
    startedAt: '09:12',
    duration: '12 dk',
    affected: 'AI özellikleri',
  },
  {
    id: 'inc-003',
    title: 'Database Connection Pool',
    status: 'resolved',
    severity: 'high',
    startedAt: 'Dün 22:30',
    duration: '8 dk',
    affected: 'Tüm servisler',
  },
];

// Real-time metrics data
const realtimeMetrics = [
  { time: '10:00', cpu: 35, memory: 62, requests: 2400 },
  { time: '10:05', cpu: 38, memory: 64, requests: 2650 },
  { time: '10:10', cpu: 42, memory: 65, requests: 2800 },
  { time: '10:15', cpu: 45, memory: 68, requests: 3100 },
  { time: '10:20', cpu: 41, memory: 67, requests: 2950 },
  { time: '10:25', cpu: 38, memory: 66, requests: 2700 },
  { time: '10:30', cpu: 42, memory: 68, requests: 2847 },
];

// Database stats
const databaseStats = {
  connections: { active: 45, idle: 155, max: 200 },
  queries: { perSecond: 4500, avgDuration: 8, slowQueries: 3 },
  storage: { used: 45.2, total: 100, tables: 142, indexes: 287 },
  replication: { lag: 0.5, status: 'healthy' },
};

export default function SystemHealthPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdated(new Date());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Sağlıklı
          </Badge>
        );
      case 'degraded':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Yavaşlama
          </Badge>
        );
      case 'down':
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Kesinti
          </Badge>
        );
      case 'investigating':
        return (
          <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
            <Eye className="h-3 w-3 mr-1" />
            İnceleniyor
          </Badge>
        );
      case 'resolved':
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Çözüldü
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-500">Kritik</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">Yüksek</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Orta</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Düşük</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sistem Sağlığı</h1>
          <p className="text-muted-foreground">
            Gerçek zamanlı altyapı ve servis izleme
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Otomatik Yenile</span>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Overall Status Banner */}
      <Card className="admin-card border-l-4 border-l-green-500 bg-green-500/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="font-semibold text-lg">Tüm Sistemler Operasyonel</p>
                <p className="text-sm text-muted-foreground">
                  {systemOverview.uptimeDays} gündür kesintisiz • Uptime: {systemOverview.uptime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-2xl font-bold">{systemOverview.activeConnections.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Aktif Bağlantı</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{systemOverview.requestsPerSecond.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">İstek/sn</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{systemOverview.avgLatency}ms</p>
                <p className="text-xs text-muted-foreground">Ort. Latency</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{systemOverview.errorRate}%</p>
                <p className="text-xs text-muted-foreground">Hata Oranı</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="admin-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-blue-500" />
                <span className="font-medium">CPU</span>
              </div>
              <span className="text-sm text-muted-foreground">{serverMetrics.cpu.cores} çekirdek</span>
            </div>
            <p className="text-3xl font-bold">{serverMetrics.cpu.current}%</p>
            <Progress value={serverMetrics.cpu.current} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Ort: {serverMetrics.cpu.avg}% | Max: {serverMetrics.cpu.max}%
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MemoryStick className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Bellek</span>
              </div>
              <span className="text-sm text-muted-foreground">{serverMetrics.memory.total}GB</span>
            </div>
            <p className="text-3xl font-bold">{serverMetrics.memory.current}%</p>
            <Progress
              value={serverMetrics.memory.current}
              className={cn(
                'h-2 mt-2',
                serverMetrics.memory.current > 80 ? '[&>div]:bg-red-500' : ''
              )}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ort: {serverMetrics.memory.avg}% | Max: {serverMetrics.memory.max}%
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-5 w-5 text-green-500" />
                <span className="font-medium">Disk</span>
              </div>
              <span className="text-sm text-muted-foreground">{serverMetrics.disk.total}GB</span>
            </div>
            <p className="text-3xl font-bold">{serverMetrics.disk.current}%</p>
            <Progress value={serverMetrics.disk.current} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {(serverMetrics.disk.total * serverMetrics.disk.current / 100).toFixed(0)}GB kullanımda
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Network className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Ağ</span>
              </div>
              <span className="text-sm text-muted-foreground">{serverMetrics.network.total}Mbps</span>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <p className="text-lg font-bold text-green-500">↓ {serverMetrics.network.in}</p>
                <p className="text-xs text-muted-foreground">Mbps gelen</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-500">↑ {serverMetrics.network.out}</p>
                <p className="text-xs text-muted-foreground">Mbps giden</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            Genel Bakış
          </TabsTrigger>
          <TabsTrigger value="services">
            <Server className="h-4 w-4 mr-2" />
            Servisler
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            Veritabanı
          </TabsTrigger>
          <TabsTrigger value="api">
            <Globe className="h-4 w-4 mr-2" />
            API Performans
          </TabsTrigger>
          <TabsTrigger value="incidents">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Olaylar
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Sistem Metrikleri</CardTitle>
                <CardDescription>Son 30 dakika</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminLineChart
                  data={realtimeMetrics}
                  xAxisKey="time"
                  series={[
                    { key: 'cpu', name: 'CPU %', color: '#3b82f6' },
                    { key: 'memory', name: 'Memory %', color: '#a855f7' },
                  ]}
                  height={250}
                />
              </CardContent>
            </Card>

            <Card className="admin-card">
              <CardHeader>
                <CardTitle>İstek Trafiği</CardTitle>
                <CardDescription>Dakika başına istek</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminAreaChart
                  data={realtimeMetrics}
                  xAxisKey="time"
                  series={[{ key: 'requests', name: 'İstek/dk', color: '#10b981' }]}
                  height={250}
                />
              </CardContent>
            </Card>
          </div>

          <Card className="admin-card">
            <CardHeader>
              <CardTitle>Aktif Olaylar</CardTitle>
            </CardHeader>
            <CardContent>
              {recentIncidents.filter((i) => i.status !== 'resolved').length > 0 ? (
                <div className="space-y-3">
                  {recentIncidents
                    .filter((i) => i.status !== 'resolved')
                    .map((incident) => (
                      <div
                        key={incident.id}
                        className="flex items-center justify-between p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="font-medium">{incident.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Başlangıç: {incident.startedAt} • {incident.duration} • {incident.affected}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(incident.severity)}
                          {getStatusBadge(incident.status)}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                  Aktif olay bulunmuyor
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card className="admin-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Servis Durumları</CardTitle>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Status Page
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servis</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead>İstek/saat</TableHead>
                    <TableHead>Hata</TableHead>
                    <TableHead>Region</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceHealth.map((service) => (
                    <TableRow key={service.name}>
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell>{getStatusBadge(service.status)}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            service.uptime >= 99.9 ? 'text-green-500' : 'text-yellow-500'
                          )}
                        >
                          {service.uptime}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'font-medium',
                            service.latency < 100
                              ? 'text-green-500'
                              : service.latency < 300
                              ? 'text-yellow-500'
                              : 'text-red-500'
                          )}
                        >
                          {service.latency}ms
                        </span>
                      </TableCell>
                      <TableCell>{service.requests.toLocaleString()}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            service.errors > 10 ? 'text-red-500' : 'text-muted-foreground'
                          )}
                        >
                          {service.errors}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{service.region}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Card className="admin-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Bağlantılar</span>
                </div>
                <p className="text-2xl font-bold">
                  {databaseStats.connections.active}/{databaseStats.connections.max}
                </p>
                <Progress
                  value={(databaseStats.connections.active / databaseStats.connections.max) * 100}
                  className="h-2 mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {databaseStats.connections.idle} boşta
                </p>
              </CardContent>
            </Card>

            <Card className="admin-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Sorgular</span>
                </div>
                <p className="text-2xl font-bold">{databaseStats.queries.perSecond}/sn</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Ort. süre: {databaseStats.queries.avgDuration}ms
                </p>
                <p className="text-xs text-red-500">
                  {databaseStats.queries.slowQueries} yavaş sorgu
                </p>
              </CardContent>
            </Card>

            <Card className="admin-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Depolama</span>
                </div>
                <p className="text-2xl font-bold">{databaseStats.storage.used}GB</p>
                <Progress
                  value={(databaseStats.storage.used / databaseStats.storage.total) * 100}
                  className="h-2 mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {databaseStats.storage.tables} tablo • {databaseStats.storage.indexes} index
                </p>
              </CardContent>
            </Card>

            <Card className="admin-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Replikasyon</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(databaseStats.replication.status)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Gecikme: {databaseStats.replication.lag}ms
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="admin-card">
            <CardHeader>
              <CardTitle>Yavaş Sorgular</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sorgu</TableHead>
                    <TableHead>Süre</TableHead>
                    <TableHead>Çağrı</TableHead>
                    <TableHead>Tablo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { query: 'SELECT * FROM moments WHERE...', duration: 450, calls: 234, table: 'moments' },
                    { query: 'UPDATE reservations SET...', duration: 320, calls: 89, table: 'reservations' },
                    { query: 'SELECT u.*, p.* FROM users...', duration: 280, calls: 567, table: 'users' },
                  ].map((q, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">{q.query}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            q.duration > 300 ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                          )}
                        >
                          {q.duration}ms
                        </Badge>
                      </TableCell>
                      <TableCell>{q.calls}</TableCell>
                      <TableCell>{q.table}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Performance Tab */}
        <TabsContent value="api" className="space-y-4">
          <Card className="admin-card">
            <CardHeader>
              <CardTitle>Endpoint Performansı</CardTitle>
              <CardDescription>Son 1 saat</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>P50</TableHead>
                    <TableHead>P95</TableHead>
                    <TableHead>P99</TableHead>
                    <TableHead>İstek</TableHead>
                    <TableHead>Hata</TableHead>
                    <TableHead>Hata %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiEndpoints.map((endpoint) => (
                    <TableRow key={endpoint.endpoint}>
                      <TableCell className="font-mono text-sm">{endpoint.endpoint}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{endpoint.method}</Badge>
                      </TableCell>
                      <TableCell className="text-green-500">{endpoint.p50}ms</TableCell>
                      <TableCell className="text-yellow-500">{endpoint.p95}ms</TableCell>
                      <TableCell
                        className={cn(
                          endpoint.p99 > 500 ? 'text-red-500' : 'text-orange-500'
                        )}
                      >
                        {endpoint.p99}ms
                      </TableCell>
                      <TableCell>{endpoint.calls.toLocaleString()}</TableCell>
                      <TableCell>{endpoint.errors}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            (endpoint.errors / endpoint.calls) * 100 > 0.5
                              ? 'text-red-500'
                              : 'text-muted-foreground'
                          )}
                        >
                          {((endpoint.errors / endpoint.calls) * 100).toFixed(2)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="space-y-4">
          <Card className="admin-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Olay Geçmişi</CardTitle>
                <Button>
                  <Bell className="h-4 w-4 mr-2" />
                  Olay Oluştur
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Olay</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Önem</TableHead>
                    <TableHead>Başlangıç</TableHead>
                    <TableHead>Süre</TableHead>
                    <TableHead>Etkilenen</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell className="font-medium">{incident.title}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                      <TableCell>{incident.startedAt}</TableCell>
                      <TableCell>{incident.duration}</TableCell>
                      <TableCell>{incident.affected}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Detay
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
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

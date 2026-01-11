'use client';

/**
 * Trust & Safety Hub
 * Comprehensive moderation center for content, users, and fraud detection
 */

import { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Flag,
  Ban,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  MessageSquare,
  Image,
  UserX,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  FileWarning,
  Activity,
  Lock,
  Unlock,
  RotateCcw,
  Zap,
  Brain,
  Camera,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronRight,
  MoreHorizontal,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Safety stats
const safetyStats = {
  pendingReports: 47,
  resolvedToday: 124,
  avgResolutionTime: '2.4h',
  fraudAttempts: 12,
  accountsSuspended: 8,
  contentRemoved: 156,
  aiDetectedThreats: 34,
  falsePositiveRate: 3.2,
};

// Report queue
const reportQueue = [
  {
    id: 'rep-001',
    type: 'content',
    category: 'Uygunsuz İçerik',
    reporter: { name: 'Ayşe K.', avatar: '/avatars/user1.jpg' },
    reported: { name: 'Mehmet Y.', avatar: '/avatars/user2.jpg' },
    contentType: 'image',
    priority: 'high',
    aiScore: 0.89,
    createdAt: '5 dk önce',
    status: 'pending',
  },
  {
    id: 'rep-002',
    type: 'user',
    category: 'Sahte Profil',
    reporter: { name: 'Can B.', avatar: '/avatars/user3.jpg' },
    reported: { name: 'Unknown User', avatar: null },
    contentType: 'profile',
    priority: 'high',
    aiScore: 0.94,
    createdAt: '12 dk önce',
    status: 'pending',
  },
  {
    id: 'rep-003',
    type: 'message',
    category: 'Spam',
    reporter: { name: 'Zeynep A.', avatar: '/avatars/user4.jpg' },
    reported: { name: 'Ali R.', avatar: '/avatars/user5.jpg' },
    contentType: 'chat',
    priority: 'medium',
    aiScore: 0.72,
    createdAt: '25 dk önce',
    status: 'pending',
  },
  {
    id: 'rep-004',
    type: 'fraud',
    category: 'Ödeme Dolandırıcılığı',
    reporter: { name: 'Sistem', avatar: null },
    reported: { name: 'Hasan K.', avatar: '/avatars/user6.jpg' },
    contentType: 'transaction',
    priority: 'critical',
    aiScore: 0.97,
    createdAt: '32 dk önce',
    status: 'pending',
  },
  {
    id: 'rep-005',
    type: 'content',
    category: 'Telif Hakkı',
    reporter: { name: 'Fatma S.', avatar: '/avatars/user7.jpg' },
    reported: { name: 'Emre T.', avatar: '/avatars/user8.jpg' },
    contentType: 'image',
    priority: 'low',
    aiScore: 0.45,
    createdAt: '1 saat önce',
    status: 'pending',
  },
];

// Suspended accounts
const suspendedAccounts = [
  {
    id: 'usr-001',
    name: 'Kaan M.',
    email: 'kaan.m***@gmail.com',
    reason: 'Çoklu Sahte Rapor',
    suspendedAt: '2026-01-10',
    duration: 'Kalıcı',
    reports: 5,
  },
  {
    id: 'usr-002',
    name: 'Deniz A.',
    email: 'deniz.***@hotmail.com',
    reason: 'Ödeme Dolandırıcılığı',
    suspendedAt: '2026-01-09',
    duration: 'Kalıcı',
    reports: 3,
  },
  {
    id: 'usr-003',
    name: 'Serkan Y.',
    email: 'serkan.***@gmail.com',
    reason: 'Spam Mesajlar',
    suspendedAt: '2026-01-08',
    duration: '30 gün',
    reports: 8,
  },
];

// Fraud patterns
const fraudPatterns = [
  {
    pattern: 'Çoklu Hesap',
    description: 'Aynı cihazdan birden fazla hesap',
    detected: 12,
    blocked: 11,
    trend: 'down',
  },
  {
    pattern: 'Sahte Proof',
    description: 'Manipüle edilmiş proof fotoğrafları',
    detected: 8,
    blocked: 7,
    trend: 'up',
  },
  {
    pattern: 'Chargeback Abuse',
    description: 'Kasıtlı geri ödeme talepleri',
    detected: 5,
    blocked: 4,
    trend: 'stable',
  },
  {
    pattern: 'Referral Fraud',
    description: 'Sahte referral zinciri',
    detected: 3,
    blocked: 3,
    trend: 'down',
  },
];

// AI moderation stats
const aiModerationStats = {
  totalScanned: 125000,
  flagged: 2340,
  autoRemoved: 890,
  falsePositives: 78,
  accuracy: 96.8,
  categories: [
    { name: 'Uygunsuz İçerik', count: 890, percentage: 38 },
    { name: 'Spam', count: 520, percentage: 22 },
    { name: 'Sahte Profil', count: 410, percentage: 18 },
    { name: 'Dolandırıcılık', count: 320, percentage: 14 },
    { name: 'Diğer', count: 200, percentage: 8 },
  ],
};

export default function SafetyHubPage() {
  const [activeTab, setActiveTab] = useState('queue');
  const [selectedReport, setSelectedReport] = useState<typeof reportQueue[0] | null>(
    null
  );

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Kritik
          </Badge>
        );
      case 'high':
        return (
          <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Yüksek
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Orta
          </Badge>
        );
      case 'low':
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Flag className="h-3 w-3 mr-1" />
            Düşük
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content':
        return <Image className="h-4 w-4 text-purple-500" />;
      case 'user':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'fraud':
        return <CreditCard className="h-4 w-4 text-red-500" />;
      default:
        return <Flag className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trust & Safety Hub</h1>
          <p className="text-muted-foreground">
            İçerik moderasyonu, kullanıcı güvenliği ve dolandırıcılık önleme
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Canlı İzleme
          </Button>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Güvenlik Raporu
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {safetyStats.fraudAttempts > 10 && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-500">Yüksek Dolandırıcılık Aktivitesi</p>
              <p className="text-sm text-muted-foreground">
                Son 24 saatte {safetyStats.fraudAttempts} dolandırıcılık girişimi tespit edildi
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-red-500/30 text-red-500">
            Detayları Gör
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="admin-card border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bekleyen Raporlar</p>
                <p className="text-3xl font-bold">{safetyStats.pendingReports}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ort. Çözüm: {safetyStats.avgResolutionTime}
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bugün Çözülen</p>
                <p className="text-3xl font-bold">{safetyStats.resolvedToday}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-green-500 mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>+18% dünden</span>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-card border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dolandırıcılık</p>
                <p className="text-3xl font-bold">{safetyStats.fraudAttempts}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {safetyStats.accountsSuspended} hesap askıya alındı
            </p>
          </CardContent>
        </Card>

        <Card className="admin-card border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI Tespitleri</p>
                <p className="text-3xl font-bold">{safetyStats.aiDetectedThreats}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              %{safetyStats.falsePositiveRate} yanlış pozitif
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="queue">
            <Flag className="h-4 w-4 mr-2" />
            Rapor Kuyruğu
            <Badge variant="secondary" className="ml-2">
              {safetyStats.pendingReports}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="ai-moderation">
            <Brain className="h-4 w-4 mr-2" />
            AI Moderasyon
          </TabsTrigger>
          <TabsTrigger value="fraud">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Dolandırıcılık
          </TabsTrigger>
          <TabsTrigger value="suspended">
            <Ban className="h-4 w-4 mr-2" />
            Askıya Alınanlar
          </TabsTrigger>
          <TabsTrigger value="policies">
            <Shield className="h-4 w-4 mr-2" />
            Politikalar
          </TabsTrigger>
        </TabsList>

        {/* Report Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          <Card className="admin-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bekleyen Raporlar</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Ara..." className="pl-9 w-[200px]" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Tipler</SelectItem>
                      <SelectItem value="content">İçerik</SelectItem>
                      <SelectItem value="user">Kullanıcı</SelectItem>
                      <SelectItem value="message">Mesaj</SelectItem>
                      <SelectItem value="fraud">Dolandırıcılık</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tip</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Raporlayan</TableHead>
                    <TableHead>Raporlanan</TableHead>
                    <TableHead>Öncelik</TableHead>
                    <TableHead>AI Skoru</TableHead>
                    <TableHead>Zaman</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportQueue.map((report) => (
                    <TableRow key={report.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(report.type)}
                          <span className="capitalize">{report.contentType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{report.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={report.reporter.avatar || ''} />
                            <AvatarFallback className="text-xs">
                              {report.reporter.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{report.reporter.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={report.reported.avatar || ''} />
                            <AvatarFallback className="text-xs">
                              {report.reported.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{report.reported.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={report.aiScore * 100}
                            className={cn(
                              'w-16 h-2',
                              report.aiScore > 0.8
                                ? '[&>div]:bg-red-500'
                                : report.aiScore > 0.5
                                ? '[&>div]:bg-yellow-500'
                                : '[&>div]:bg-green-500'
                            )}
                          />
                          <span className="text-sm font-medium">
                            {(report.aiScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {report.createdAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="İncele">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-500"
                            title="Onayla"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            title="Kaldır"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Ban className="h-4 w-4 mr-2" />
                                Hesabı Askıya Al
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Lock className="h-4 w-4 mr-2" />
                                Geçici Kısıtlama
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Profili Görüntüle
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Moderation Tab */}
        <TabsContent value="ai-moderation" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Card className="admin-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Eye className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {(aiModerationStats.totalScanned / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-muted-foreground">Taranan İçerik</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="admin-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Flag className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {(aiModerationStats.flagged / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-muted-foreground">İşaretlenen</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="admin-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{aiModerationStats.autoRemoved}</p>
                    <p className="text-xs text-muted-foreground">Otomatik Kaldırılan</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="admin-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{aiModerationStats.accuracy}%</p>
                    <p className="text-xs text-muted-foreground">Doğruluk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Kategori Dağılımı</CardTitle>
                <CardDescription>AI tarafından tespit edilen ihlaller</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiModerationStats.categories.map((cat) => (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{cat.name}</span>
                      <span className="font-medium">
                        {cat.count} ({cat.percentage}%)
                      </span>
                    </div>
                    <Progress value={cat.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="admin-card">
              <CardHeader>
                <CardTitle>AI Model Performansı</CardTitle>
                <CardDescription>Gerçek zamanlı model metrikleri</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    model: 'İçerik Sınıflandırma',
                    accuracy: 97.2,
                    latency: '45ms',
                    status: 'active',
                  },
                  {
                    model: 'Yüz Tespiti',
                    accuracy: 95.8,
                    latency: '120ms',
                    status: 'active',
                  },
                  {
                    model: 'Metin Analizi (Türkçe)',
                    accuracy: 94.5,
                    latency: '30ms',
                    status: 'active',
                  },
                  {
                    model: 'Dolandırıcılık Tespiti',
                    accuracy: 96.1,
                    latency: '85ms',
                    status: 'active',
                  },
                ].map((model) => (
                  <div
                    key={model.model}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div>
                        <p className="font-medium text-sm">{model.model}</p>
                        <p className="text-xs text-muted-foreground">
                          Latency: {model.latency}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-500 border-green-500/20"
                    >
                      {model.accuracy}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fraud Tab */}
        <TabsContent value="fraud" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Dolandırıcılık Kalıpları</CardTitle>
                <CardDescription>Son 30 günde tespit edilen pattern'ler</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {fraudPatterns.map((pattern) => (
                  <div
                    key={pattern.pattern}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{pattern.pattern}</p>
                      <p className="text-xs text-muted-foreground">
                        {pattern.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold">{pattern.detected}</p>
                        <p className="text-xs text-muted-foreground">tespit</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-500">
                          {pattern.blocked}
                        </p>
                        <p className="text-xs text-muted-foreground">engellendi</p>
                      </div>
                      {pattern.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      ) : pattern.trend === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      ) : (
                        <Activity className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="admin-card">
              <CardHeader>
                <CardTitle>Güvenlik Önlemleri</CardTitle>
                <CardDescription>Aktif koruma katmanları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    name: 'Device Fingerprinting',
                    status: 'active',
                    blocked: 234,
                  },
                  {
                    name: 'Velocity Limitleri',
                    status: 'active',
                    blocked: 567,
                  },
                  {
                    name: 'IP Reputation',
                    status: 'active',
                    blocked: 128,
                  },
                  {
                    name: 'Davranış Analizi',
                    status: 'active',
                    blocked: 89,
                  },
                  {
                    name: 'ML Fraud Scoring',
                    status: 'active',
                    blocked: 156,
                  },
                ].map((measure) => (
                  <div
                    key={measure.name}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="font-medium">{measure.name}</span>
                    </div>
                    <Badge variant="outline">
                      {measure.blocked} engelleme
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="admin-card">
            <CardHeader>
              <CardTitle>Son Dolandırıcılık Girişimleri</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zaman</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Detay</TableHead>
                    <TableHead>Risk Skoru</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      time: '10:45',
                      type: 'Chargeback',
                      user: 'user_87432',
                      detail: '$120 ödeme iptali',
                      risk: 0.92,
                      status: 'blocked',
                    },
                    {
                      time: '10:32',
                      type: 'Çoklu Hesap',
                      user: 'user_91234',
                      detail: 'Aynı cihazdan 3. hesap',
                      risk: 0.88,
                      status: 'blocked',
                    },
                    {
                      time: '10:15',
                      type: 'Sahte Proof',
                      user: 'user_45678',
                      detail: 'Manipüle edilmiş fotoğraf',
                      risk: 0.95,
                      status: 'blocked',
                    },
                  ].map((attempt, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{attempt.time}</TableCell>
                      <TableCell className="font-medium">{attempt.type}</TableCell>
                      <TableCell>{attempt.user}</TableCell>
                      <TableCell>{attempt.detail}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            attempt.risk > 0.9
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-yellow-500/10 text-yellow-500'
                          )}
                        >
                          {(attempt.risk * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          <Shield className="h-3 w-3 mr-1" />
                          Engellendi
                        </Badge>
                      </TableCell>
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

        {/* Suspended Accounts Tab */}
        <TabsContent value="suspended" className="space-y-4">
          <Card className="admin-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Askıya Alınan Hesaplar</CardTitle>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrele
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Sebep</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead>Süre</TableHead>
                    <TableHead>Raporlar</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suspendedAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {account.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{account.reason}</Badge>
                      </TableCell>
                      <TableCell>{account.suspendedAt}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            account.duration === 'Kalıcı'
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-yellow-500/10 text-yellow-500'
                          )}
                        >
                          {account.duration}
                        </Badge>
                      </TableCell>
                      <TableCell>{account.reports}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" title="İncele">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Askıyı Kaldır"
                            className="text-green-500"
                          >
                            <Unlock className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                title: 'İçerik Politikası',
                description: 'Fotoğraf, profil ve moment kuralları',
                icon: Image,
                rules: 12,
                lastUpdated: '2026-01-05',
              },
              {
                title: 'Davranış Politikası',
                description: 'Kullanıcı etkileşim kuralları',
                icon: Users,
                rules: 8,
                lastUpdated: '2026-01-03',
              },
              {
                title: 'Güvenlik Politikası',
                description: 'Hesap güvenliği ve doğrulama',
                icon: Shield,
                rules: 15,
                lastUpdated: '2026-01-08',
              },
              {
                title: 'Ödeme Politikası',
                description: 'Escrow ve geri ödeme kuralları',
                icon: CreditCard,
                rules: 10,
                lastUpdated: '2026-01-02',
              },
              {
                title: 'İletişim Politikası',
                description: 'Chat ve mesajlaşma kuralları',
                icon: MessageSquare,
                rules: 6,
                lastUpdated: '2026-01-04',
              },
              {
                title: 'Yaptırım Politikası',
                description: 'Ceza ve askıya alma prosedürleri',
                icon: Ban,
                rules: 9,
                lastUpdated: '2026-01-07',
              },
            ].map((policy) => (
              <Card key={policy.title} className="admin-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <policy.icon className="h-5 w-5 text-primary" />
                    </div>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-base">{policy.title}</CardTitle>
                  <CardDescription>{policy.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{policy.rules} kural</span>
                    <span className="text-muted-foreground">
                      Son: {policy.lastUpdated}
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

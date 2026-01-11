'use client';

/**
 * Fraud Investigation Hub
 * Derinlemesine dolandırıcılık soruşturma aracı
 * Linked accounts, transaction patterns, device fingerprints
 */

import { useState } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  Users,
  Link2,
  Smartphone,
  CreditCard,
  MapPin,
  Clock,
  Eye,
  Ban,
  Shield,
  Activity,
  TrendingUp,
  Fingerprint,
  Network,
  Globe,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Flag,
  Download,
  Share2,
  MessageSquare,
  DollarSign,
  Zap,
  Target,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
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
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// Fraud cases
const fraudCases = [
  {
    id: 'FRAUD-2024-001',
    type: 'multi_account',
    status: 'investigating',
    severity: 'critical',
    createdAt: '2024-01-11T10:30:00Z',
    assignedTo: 'Zeynep K.',
    primaryUser: {
      id: 'usr-12345',
      name: 'Ali Veli',
      email: 'ali***@gmail.com',
      riskScore: 92,
    },
    linkedAccounts: 5,
    totalAmount: 45200,
    description: 'Aynı device fingerprint ile 5 farklı hesap tespit edildi',
  },
  {
    id: 'FRAUD-2024-002',
    type: 'chargeback_abuse',
    status: 'open',
    severity: 'high',
    createdAt: '2024-01-11T09:15:00Z',
    assignedTo: null,
    primaryUser: {
      id: 'usr-67890',
      name: 'Mehmet A.',
      email: 'mehmet***@hotmail.com',
      riskScore: 78,
    },
    linkedAccounts: 1,
    totalAmount: 8500,
    description: 'Son 30 günde 4 chargeback talebi',
  },
  {
    id: 'FRAUD-2024-003',
    type: 'proof_manipulation',
    status: 'investigating',
    severity: 'high',
    createdAt: '2024-01-10T16:45:00Z',
    assignedTo: 'Ahmet B.',
    primaryUser: {
      id: 'usr-11111',
      name: 'Can Y.',
      email: 'can***@gmail.com',
      riskScore: 85,
    },
    linkedAccounts: 2,
    totalAmount: 12800,
    description: 'AI tarafından manipüle edilmiş proof fotoğrafı tespit edildi',
  },
];

// Investigation detail (for selected case)
const investigationDetail = {
  caseId: 'FRAUD-2024-001',
  timeline: [
    {
      time: '10:30',
      event: 'Case oluşturuldu',
      type: 'system',
      detail: 'AI fraud detection tarafından otomatik oluşturuldu',
    },
    {
      time: '10:35',
      event: 'Zeynep K. atandı',
      type: 'assignment',
      detail: 'Otomatik atama (yük dengeleme)',
    },
    {
      time: '10:42',
      event: 'Device analizi tamamlandı',
      type: 'analysis',
      detail: '5 hesap aynı device_fingerprint: df_a1b2c3d4e5',
    },
    {
      time: '11:15',
      event: 'IP analizi tamamlandı',
      type: 'analysis',
      detail: 'Tüm hesaplar aynı IP bloğundan (85.105.x.x)',
    },
  ],
  linkedUsers: [
    {
      id: 'usr-12345',
      name: 'Ali Veli',
      isPrimary: true,
      riskScore: 92,
      transactionCount: 23,
      totalVolume: 28500,
      createdAt: '2024-01-05',
    },
    {
      id: 'usr-22222',
      name: 'Ayşe K.',
      isPrimary: false,
      riskScore: 88,
      transactionCount: 12,
      totalVolume: 8200,
      createdAt: '2024-01-06',
    },
    {
      id: 'usr-33333',
      name: 'Fatma S.',
      isPrimary: false,
      riskScore: 85,
      transactionCount: 8,
      totalVolume: 4500,
      createdAt: '2024-01-07',
    },
    {
      id: 'usr-44444',
      name: 'Burak M.',
      isPrimary: false,
      riskScore: 79,
      transactionCount: 5,
      totalVolume: 2400,
      createdAt: '2024-01-08',
    },
    {
      id: 'usr-55555',
      name: 'Deniz A.',
      isPrimary: false,
      riskScore: 75,
      transactionCount: 3,
      totalVolume: 1600,
      createdAt: '2024-01-09',
    },
  ],
  sharedIndicators: [
    { type: 'device', value: 'iPhone 15 Pro (df_a1b2c3d4e5)', confidence: 100 },
    { type: 'ip', value: '85.105.42.x/24', confidence: 95 },
    { type: 'payment', value: 'Visa **** 4242', confidence: 100 },
    { type: 'behavior', value: 'Gift pattern similarity: 94%', confidence: 94 },
  ],
  transactions: [
    {
      id: 'txn-001',
      from: 'usr-12345',
      to: 'usr-99999',
      amount: 5200,
      type: 'gift',
      status: 'completed',
      date: '2024-01-10',
      suspicious: true,
    },
    {
      id: 'txn-002',
      from: 'usr-22222',
      to: 'usr-12345',
      amount: 3800,
      type: 'gift',
      status: 'completed',
      date: '2024-01-09',
      suspicious: true,
    },
    {
      id: 'txn-003',
      from: 'usr-33333',
      to: 'usr-12345',
      amount: 2500,
      type: 'gift',
      status: 'completed',
      date: '2024-01-08',
      suspicious: true,
    },
  ],
};

// Risk indicators
const riskIndicators = [
  {
    name: 'Multi-Account Detection',
    count: 12,
    trend: 'up',
    severity: 'critical',
  },
  { name: 'Chargeback Pattern', count: 8, trend: 'stable', severity: 'high' },
  { name: 'Proof Manipulation', count: 5, trend: 'down', severity: 'high' },
  { name: 'Velocity Abuse', count: 15, trend: 'up', severity: 'medium' },
  { name: 'Location Spoofing', count: 3, trend: 'down', severity: 'medium' },
];

export default function FraudInvestigationPage() {
  const [selectedCase, setSelectedCase] = useState<string | null>('FRAUD-2024-001');
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      investigating: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
      escalated: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    const labels = {
      open: 'Açık',
      investigating: 'Soruşturuluyor',
      resolved: 'Çözüldü',
      escalated: 'Eskale Edildi',
    };
    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-black',
      low: 'bg-blue-500 text-white',
    };
    return (
      <Badge className={styles[severity as keyof typeof styles]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fraud Soruşturma Merkezi</h1>
          <p className="text-muted-foreground">
            Derinlemesine dolandırıcılık analizi ve soruşturma
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Rapor
          </Button>
          <Button>
            <Flag className="h-4 w-4 mr-2" />
            Yeni Case
          </Button>
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="grid grid-cols-5 gap-4">
        {riskIndicators.map((indicator) => (
          <Card key={indicator.name} className="admin-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground truncate">
                  {indicator.name}
                </span>
                {indicator.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : indicator.trend === 'down' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />
                ) : (
                  <Activity className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold">{indicator.count}</p>
                {getSeverityBadge(indicator.severity)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Case List */}
        <Card className="admin-card col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Aktif Case'ler</CardTitle>
              <Badge variant="secondary">{fraudCases.length}</Badge>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Case ara..." className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {fraudCases.map((fraudCase) => (
              <div
                key={fraudCase.id}
                onClick={() => setSelectedCase(fraudCase.id)}
                className={cn(
                  'p-3 rounded-lg border cursor-pointer transition-colors',
                  selectedCase === fraudCase.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {fraudCase.id}
                  </span>
                  {getSeverityBadge(fraudCase.severity)}
                </div>
                <p className="font-medium text-sm mb-1">
                  {fraudCase.primaryUser.name}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {fraudCase.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  {getStatusBadge(fraudCase.status)}
                  <span className="text-xs text-muted-foreground">
                    {formatCurrency(fraudCase.totalAmount)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Case Detail */}
        <Card className="admin-card col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>{investigationDetail.caseId}</CardTitle>
                  {getSeverityBadge('critical')}
                  {getStatusBadge('investigating')}
                </div>
                <CardDescription>Multi-Account Fraud Ring</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Paylaş
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Aksiyon
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Ban className="h-4 w-4 mr-2" />
                      Tüm Hesapları Askıya Al
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <DollarSign className="h-4 w-4 mr-2" />
                      İşlemleri Dondur
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500">
                      <XCircle className="h-4 w-4 mr-2" />
                      Kalıcı Ban
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Özet</TabsTrigger>
                <TabsTrigger value="users">Bağlı Hesaplar</TabsTrigger>
                <TabsTrigger value="transactions">İşlemler</TabsTrigger>
                <TabsTrigger value="evidence">Kanıtlar</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Shared Indicators */}
                <div>
                  <h4 className="font-medium mb-3">Ortak İndikatörler</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {investigationDetail.sharedIndicators.map((indicator, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-muted/30 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {indicator.type === 'device' && (
                            <Smartphone className="h-4 w-4 text-blue-500" />
                          )}
                          {indicator.type === 'ip' && (
                            <Globe className="h-4 w-4 text-purple-500" />
                          )}
                          {indicator.type === 'payment' && (
                            <CreditCard className="h-4 w-4 text-green-500" />
                          )}
                          {indicator.type === 'behavior' && (
                            <Activity className="h-4 w-4 text-orange-500" />
                          )}
                          <span className="text-sm font-medium">
                            {indicator.value}
                          </span>
                        </div>
                        <Badge variant="outline">{indicator.confidence}%</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-red-500/10 text-center">
                    <p className="text-2xl font-bold text-red-500">5</p>
                    <p className="text-xs text-muted-foreground">Bağlı Hesap</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-500/10 text-center">
                    <p className="text-2xl font-bold text-orange-500">
                      {formatCurrency(45200)}
                    </p>
                    <p className="text-xs text-muted-foreground">Toplam Hacim</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-500/10 text-center">
                    <p className="text-2xl font-bold text-yellow-500">51</p>
                    <p className="text-xs text-muted-foreground">İşlem Sayısı</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/10 text-center">
                    <p className="text-2xl font-bold text-purple-500">6 gün</p>
                    <p className="text-xs text-muted-foreground">Ring Süresi</p>
                  </div>
                </div>

                {/* Investigation Notes */}
                <div>
                  <h4 className="font-medium mb-2">Soruşturma Notları</h4>
                  <Textarea
                    placeholder="Notlarınızı buraya ekleyin..."
                    className="min-h-[100px]"
                  />
                  <Button size="sm" className="mt-2">
                    Not Ekle
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="users">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Risk Skoru</TableHead>
                      <TableHead>İşlem</TableHead>
                      <TableHead>Hacim</TableHead>
                      <TableHead>Kayıt</TableHead>
                      <TableHead className="text-right">Aksiyon</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investigationDetail.linkedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {user.id}
                              </p>
                            </div>
                            {user.isPrimary && (
                              <Badge variant="outline" className="ml-2">
                                Primary
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={user.riskScore}
                              className={cn(
                                'w-16 h-2',
                                user.riskScore > 80
                                  ? '[&>div]:bg-red-500'
                                  : '[&>div]:bg-yellow-500'
                              )}
                            />
                            <span className="font-medium">{user.riskScore}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.transactionCount}</TableCell>
                        <TableCell>{formatCurrency(user.totalVolume)}</TableCell>
                        <TableCell>{user.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="transactions">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Gönderen</TableHead>
                      <TableHead>Alıcı</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Durum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {investigationDetail.transactions.map((txn) => (
                      <TableRow
                        key={txn.id}
                        className={cn(txn.suspicious && 'bg-red-500/5')}
                      >
                        <TableCell className="font-mono text-xs">
                          {txn.id}
                        </TableCell>
                        <TableCell>{txn.from}</TableCell>
                        <TableCell>{txn.to}</TableCell>
                        <TableCell>{formatCurrency(txn.amount)}</TableCell>
                        <TableCell>{txn.date}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{txn.status}</Badge>
                            {txn.suspicious && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="evidence">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Kanıt dosyaları yükleniyor...</p>
                </div>
              </TabsContent>

              <TabsContent value="timeline">
                <div className="space-y-4">
                  {investigationDetail.timeline.map((event, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-16 text-sm text-muted-foreground">
                        {event.time}
                      </div>
                      <div className="flex-1 pb-4 border-l-2 pl-4 relative">
                        <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary" />
                        <p className="font-medium">{event.event}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

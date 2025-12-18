'use client';

import { useState } from 'react';
import {
  ClipboardCheck,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Eye,
  MessageSquare,
  Phone,
  Search,
  Filter,
  Plus,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock QA data
const qaMetrics = {
  overallScore: 92,
  auditsCompleted: 156,
  issuesFound: 23,
  issuesResolved: 19,
  avgResolutionTime: '4.2 saat',
};

const mysteryShopperResults = [
  {
    id: '1',
    date: '2024-12-17',
    scenario: 'Yeni Kullanıcı Kayıt',
    agent: 'Elif Yılmaz',
    score: 95,
    duration: '3:24',
    issues: [],
    status: 'passed',
  },
  {
    id: '2',
    date: '2024-12-16',
    scenario: 'Premium Abonelik Sorunu',
    agent: 'Ahmet Demir',
    score: 78,
    duration: '8:45',
    issues: ['Yavaş yanıt', 'Prosedür hatası'],
    status: 'needs_improvement',
  },
  {
    id: '3',
    date: '2024-12-16',
    scenario: 'Eşleşme Şikayeti',
    agent: 'Zeynep Kara',
    score: 88,
    duration: '5:12',
    issues: ['Empati eksikliği'],
    status: 'passed',
  },
  {
    id: '4',
    date: '2024-12-15',
    scenario: 'Güvenlik İhlali Bildirimi',
    agent: 'Can Öztürk',
    score: 100,
    duration: '2:56',
    issues: [],
    status: 'excellent',
  },
];

const qualityAudits = [
  {
    id: '1',
    type: 'Destek Kalitesi',
    auditor: 'QA Team',
    date: '2024-12-17',
    score: 94,
    samples: 50,
    findings: 3,
    status: 'completed',
  },
  {
    id: '2',
    type: 'İçerik Moderasyonu',
    auditor: 'Compliance Team',
    date: '2024-12-16',
    score: 91,
    samples: 100,
    findings: 7,
    status: 'completed',
  },
  {
    id: '3',
    type: 'Ödeme İşlemleri',
    auditor: 'Finance Team',
    date: '2024-12-15',
    score: 98,
    samples: 200,
    findings: 1,
    status: 'completed',
  },
  {
    id: '4',
    type: 'Kullanıcı Deneyimi',
    auditor: 'UX Team',
    date: '2024-12-18',
    score: null,
    samples: 75,
    findings: null,
    status: 'in_progress',
  },
];

const agentPerformance = [
  {
    id: '1',
    name: 'Elif Yılmaz',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elif',
    role: 'Senior Support',
    avgScore: 96,
    audits: 24,
    trend: 'up',
    rank: 1,
  },
  {
    id: '2',
    name: 'Can Öztürk',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=can',
    role: 'Support Agent',
    avgScore: 94,
    audits: 18,
    trend: 'up',
    rank: 2,
  },
  {
    id: '3',
    name: 'Zeynep Kara',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep',
    role: 'Support Agent',
    avgScore: 89,
    audits: 22,
    trend: 'stable',
    rank: 3,
  },
  {
    id: '4',
    name: 'Ahmet Demir',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmetd',
    role: 'Junior Support',
    avgScore: 82,
    audits: 15,
    trend: 'down',
    rank: 4,
  },
];

export default function QACenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return <Badge className="bg-green-600">Mükemmel</Badge>;
      case 'passed':
        return <Badge className="bg-green-500">Başarılı</Badge>;
      case 'needs_improvement':
        return <Badge className="bg-yellow-500">Geliştirilmeli</Badge>;
      case 'failed':
        return <Badge variant="destructive">Başarısız</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Tamamlandı</Badge>;
      case 'in_progress':
        return <Badge variant="outline">Devam Ediyor</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500';
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-green-500';
    if (score >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QA Center</h1>
          <p className="text-muted-foreground">Kalite güvence ve denetim merkezi</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Denetim Planla
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Mystery Shop Başlat
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Genel Skor</p>
                <p className="text-2xl font-bold">{qaMetrics.overallScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Denetimler</p>
                <p className="text-2xl font-bold">{qaMetrics.auditsCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bulunan Sorunlar</p>
                <p className="text-2xl font-bold">{qaMetrics.issuesFound}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Çözülen</p>
                <p className="text-2xl font-bold">{qaMetrics.issuesResolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ort. Çözüm</p>
                <p className="text-2xl font-bold">{qaMetrics.avgResolutionTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mystery-shopper" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mystery-shopper">Mystery Shopper</TabsTrigger>
          <TabsTrigger value="audits">Denetimler</TabsTrigger>
          <TabsTrigger value="agents">Agent Performansı</TabsTrigger>
          <TabsTrigger value="reports">Raporlar</TabsTrigger>
        </TabsList>

        <TabsContent value="mystery-shopper" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Senaryo veya agent ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="excellent">Mükemmel</SelectItem>
                <SelectItem value="passed">Başarılı</SelectItem>
                <SelectItem value="needs_improvement">Geliştirilmeli</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mystery Shopper Sonuçları</CardTitle>
              <CardDescription>Gizli müşteri değerlendirmeleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mysteryShopperResults.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{result.scenario}</h4>
                        {getStatusBadge(result.status)}
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Agent: {result.agent}</span>
                        <span>Süre: {result.duration}</span>
                        <span>{result.date}</span>
                      </div>
                      {result.issues.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {result.issues.map((issue, i) => (
                            <Badge key={i} variant="outline" className="text-orange-500 border-orange-500">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                          {result.score}
                        </p>
                        <p className="text-xs text-muted-foreground">Skor</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Detay
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kalite Denetimleri</CardTitle>
              <CardDescription>Departman bazlı denetim sonuçları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityAudits.map((audit) => (
                  <div
                    key={audit.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{audit.type}</h4>
                        {getStatusBadge(audit.status)}
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Denetçi: {audit.auditor}</span>
                        <span>Örneklem: {audit.samples}</span>
                        <span>{audit.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {audit.score !== null && (
                        <div className="text-center">
                          <p className={`text-2xl font-bold ${getScoreColor(audit.score)}`}>
                            {audit.score}%
                          </p>
                          <p className="text-xs text-muted-foreground">Skor</p>
                        </div>
                      )}
                      {audit.findings !== null && (
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-500">{audit.findings}</p>
                          <p className="text-xs text-muted-foreground">Bulgu</p>
                        </div>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Rapor
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Denetim Takvimi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'Haftalık Destek Kalitesi', next: '2024-12-23', frequency: 'Haftalık' },
                    { type: 'Aylık Güvenlik Denetimi', next: '2025-01-01', frequency: 'Aylık' },
                    { type: 'Çeyreklik SOC 2 İncelemesi', next: '2025-01-15', frequency: 'Çeyreklik' },
                    { type: 'Yıllık ISO Denetimi', next: '2025-06-01', frequency: 'Yıllık' },
                  ].map((schedule, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{schedule.type}</p>
                        <p className="text-xs text-muted-foreground">{schedule.frequency}</p>
                      </div>
                      <Badge variant="outline">{schedule.next}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Açık Bulgular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { finding: 'Yanıt süresi SLA ihlali', priority: 'high', assignee: 'Support Team' },
                    { finding: 'Eksik dokümantasyon', priority: 'medium', assignee: 'QA Team' },
                    { finding: 'Eğitim güncellemesi gerekli', priority: 'low', assignee: 'HR Team' },
                  ].map((finding, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            finding.priority === 'high'
                              ? 'text-red-500'
                              : finding.priority === 'medium'
                                ? 'text-yellow-500'
                                : 'text-blue-500'
                          }`}
                        />
                        <div>
                          <p className="text-sm">{finding.finding}</p>
                          <p className="text-xs text-muted-foreground">{finding.assignee}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Çöz
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performans Sıralaması</CardTitle>
              <CardDescription>QA skorlarına göre agent performansı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentPerformance.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                          agent.rank === 1
                            ? 'bg-yellow-100 text-yellow-600'
                            : agent.rank === 2
                              ? 'bg-gray-100 text-gray-600'
                              : agent.rank === 3
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {agent.rank}
                      </div>
                      <Avatar>
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback>{agent.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className={`text-xl font-bold ${getScoreColor(agent.avgScore)}`}>
                          {agent.avgScore}%
                        </p>
                        <p className="text-xs text-muted-foreground">Ort. Skor</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold">{agent.audits}</p>
                        <p className="text-xs text-muted-foreground">Denetim</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {agent.trend === 'up' ? (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        ) : agent.trend === 'down' ? (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-gray-300" />
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        Profil
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kategori Bazlı Performans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { category: 'İletişim Becerisi', score: 94 },
                    { category: 'Problem Çözme', score: 89 },
                    { category: 'Ürün Bilgisi', score: 91 },
                    { category: 'Prosedür Takibi', score: 86 },
                    { category: 'Empati', score: 92 },
                  ].map((cat) => (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{cat.category}</span>
                        <span className="font-medium">{cat.score}%</span>
                      </div>
                      <Progress value={cat.score} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Koçluk Gerektiren Alanlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { area: 'Zor Müşteri Yönetimi', agents: 3, priority: 'high' },
                    { area: 'Teknik Sorun Çözümü', agents: 2, priority: 'medium' },
                    { area: 'Upselling Teknikleri', agents: 4, priority: 'low' },
                  ].map((area, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{area.area}</p>
                        <p className="text-xs text-muted-foreground">{area.agents} agent</p>
                      </div>
                      <Badge
                        variant={
                          area.priority === 'high'
                            ? 'destructive'
                            : area.priority === 'medium'
                              ? 'default'
                              : 'outline'
                        }
                      >
                        {area.priority === 'high' ? 'Acil' : area.priority === 'medium' ? 'Orta' : 'Düşük'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Eğitim Önerileri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { training: 'Aktif Dinleme', enrolled: 5, status: 'planned' },
                    { training: 'Premium Özellikleri', enrolled: 8, status: 'in_progress' },
                    { training: 'Kriz Yönetimi', enrolled: 3, status: 'completed' },
                  ].map((training, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{training.training}</p>
                        <p className="text-xs text-muted-foreground">{training.enrolled} kayıtlı</p>
                      </div>
                      {getStatusBadge(training.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hazır Raporlar</CardTitle>
                <CardDescription>İndirilebilir QA raporları</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Haftalık QA Özeti', date: '2024-12-17', format: 'PDF' },
                    { name: 'Aylık Performans Raporu', date: '2024-12-01', format: 'Excel' },
                    { name: 'Çeyreklik Denetim Raporu', date: '2024-10-01', format: 'PDF' },
                    { name: 'Mystery Shopper Analizi', date: '2024-12-15', format: 'PDF' },
                  ].map((report, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{report.name}</p>
                          <p className="text-xs text-muted-foreground">{report.date}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{report.format}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Özel Rapor Oluştur</CardTitle>
                <CardDescription>Filtrelere göre rapor oluşturun</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Rapor Tipi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">Agent Performansı</SelectItem>
                      <SelectItem value="audit">Denetim Sonuçları</SelectItem>
                      <SelectItem value="mystery">Mystery Shopper</SelectItem>
                      <SelectItem value="trend">Trend Analizi</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Zaman Aralığı" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Son 7 Gün</SelectItem>
                      <SelectItem value="month">Son 30 Gün</SelectItem>
                      <SelectItem value="quarter">Son Çeyrek</SelectItem>
                      <SelectItem value="year">Son Yıl</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Rapor Oluştur
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

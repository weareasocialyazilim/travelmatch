'use client';

import {
  Accessibility,
  Eye,
  Ear,
  Hand,
  Brain,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  FileText,
  RefreshCw,
  ExternalLink,
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock accessibility data
const wcagScore = {
  overall: 87,
  perceivable: 92,
  operable: 85,
  understandable: 88,
  robust: 83,
};

const issues = [
  {
    id: '1',
    severity: 'critical',
    title: 'Eksik alt text',
    description: 'Moment görsellerinde alternatif metin eksik',
    wcag: '1.1.1',
    affected: 234,
    status: 'open',
  },
  {
    id: '2',
    severity: 'major',
    title: 'Düşük renk kontrastı',
    description: 'Bazı butonlarda metin kontrastı yetersiz',
    wcag: '1.4.3',
    affected: 12,
    status: 'in_progress',
  },
  {
    id: '3',
    severity: 'minor',
    title: 'Klavye fokus göstergesi',
    description: 'Dropdown menülerde fokus görünür değil',
    wcag: '2.4.7',
    affected: 5,
    status: 'open',
  },
  {
    id: '4',
    severity: 'major',
    title: 'Form etiketleri eksik',
    description: 'Arama çubuğunda label eksik',
    wcag: '1.3.1',
    affected: 3,
    status: 'resolved',
  },
];

const features = [
  {
    category: 'Görme',
    icon: Eye,
    items: [
      { name: 'Ekran okuyucu desteği', status: 'complete' },
      { name: 'Yüksek kontrast modu', status: 'complete' },
      { name: 'Metin boyutu ayarı', status: 'complete' },
      { name: 'Alternatif metin', status: 'partial' },
    ],
  },
  {
    category: 'İşitme',
    icon: Ear,
    items: [
      { name: 'Video altyazıları', status: 'complete' },
      { name: 'Görsel bildirimler', status: 'complete' },
      { name: 'Sesli içerik transkripti', status: 'partial' },
    ],
  },
  {
    category: 'Motor',
    icon: Hand,
    items: [
      { name: 'Klavye navigasyonu', status: 'complete' },
      { name: 'Büyük dokunma alanları', status: 'complete' },
      { name: 'Tek elle kullanım', status: 'partial' },
      { name: 'Ses kontrolü', status: 'planned' },
    ],
  },
  {
    category: 'Bilişsel',
    icon: Brain,
    items: [
      { name: 'Basit dil kullanımı', status: 'complete' },
      { name: 'Tutarlı navigasyon', status: 'complete' },
      { name: 'Hata önleme', status: 'complete' },
      { name: 'Okuma modu', status: 'planned' },
    ],
  },
];

export default function AccessibilityPage() {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Kritik</Badge>;
      case 'major':
        return <Badge className="bg-orange-500">Major</Badge>;
      case 'minor':
        return <Badge className="bg-yellow-500">Minor</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'planned':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Erişilebilirlik</h1>
          <p className="text-muted-foreground">WCAG 2.1 uyumluluk takibi</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Rapor İndir
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Yeniden Tara
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Genel WCAG Skoru
                </p>
                <p className="text-4xl font-bold">{wcagScore.overall}%</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4" />
                  +5% geçen aya göre
                </p>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <Accessibility className="h-10 w-10 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Algılanabilir</p>
            <p className="text-2xl font-bold">{wcagScore.perceivable}%</p>
            <Progress value={wcagScore.perceivable} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Çalıştırılabilir</p>
            <p className="text-2xl font-bold">{wcagScore.operable}%</p>
            <Progress value={wcagScore.operable} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Anlaşılabilir</p>
            <p className="text-2xl font-bold">{wcagScore.understandable}%</p>
            <Progress value={wcagScore.understandable} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issues">Sorunlar</TabsTrigger>
          <TabsTrigger value="features">
            Erişilebilirlik Özellikleri
          </TabsTrigger>
          <TabsTrigger value="audit">Denetim Geçmişi</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Açık Erişilebilirlik Sorunları</CardTitle>
              <CardDescription>WCAG 2.1 ihlalleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-start justify-between rounded-lg border p-4"
                  >
                    <div className="flex gap-4">
                      {issue.status === 'resolved' ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <AlertTriangle
                          className={`h-5 w-5 mt-0.5 ${
                            issue.severity === 'critical'
                              ? 'text-red-500'
                              : issue.severity === 'major'
                                ? 'text-orange-500'
                                : 'text-yellow-500'
                          }`}
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{issue.title}</h4>
                          {getSeverityBadge(issue.severity)}
                          <Badge variant="outline">WCAG {issue.wcag}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {issue.description}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {issue.affected} etkilenen element
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={
                        issue.status === 'resolved' ? 'outline' : 'default'
                      }
                    >
                      {issue.status === 'resolved' ? 'Çözüldü' : 'Düzelt'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((category) => (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">{item.name}</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className="text-xs text-muted-foreground capitalize">
                            {item.status === 'complete'
                              ? 'Tamamlandı'
                              : item.status === 'partial'
                                ? 'Kısmi'
                                : 'Planlandı'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Denetim Geçmişi</CardTitle>
              <CardDescription>Son erişilebilirlik denetimleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: '2024-12-15', score: 87, issues: 4, fixed: 2 },
                  { date: '2024-12-01', score: 82, issues: 8, fixed: 6 },
                  { date: '2024-11-15', score: 78, issues: 12, fixed: 4 },
                  { date: '2024-11-01', score: 75, issues: 15, fixed: 3 },
                ].map((audit, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{audit.score}%</p>
                        <p className="text-xs text-muted-foreground">Skor</p>
                      </div>
                      <div>
                        <p className="font-medium">{audit.date}</p>
                        <p className="text-sm text-muted-foreground">
                          {audit.issues} sorun bulundu, {audit.fixed} düzeltildi
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Raporu Gör
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

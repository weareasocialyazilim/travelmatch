'use client';

import {
  Leaf,
  Recycle,
  Users,
  Heart,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Globe,
  Droplets,
  Zap,
  TreePine,
  Building,
  HandHeart,
  FileText,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock ESG data
const esgScores = {
  overall: 78,
  environmental: 72,
  social: 85,
  governance: 77,
  change: 5,
};

const environmentalMetrics = [
  {
    name: 'Karbon Ayak İzi',
    value: '1,234',
    unit: 'ton CO₂',
    target: '1,000',
    trend: 'down',
    progress: 81,
  },
  {
    name: 'Yenilenebilir Enerji',
    value: '68',
    unit: '%',
    target: '100',
    trend: 'up',
    progress: 68,
  },
  {
    name: 'Su Tüketimi',
    value: '45,678',
    unit: 'm³',
    target: '40,000',
    trend: 'down',
    progress: 88,
  },
  {
    name: 'Atık Geri Dönüşümü',
    value: '89',
    unit: '%',
    target: '95',
    trend: 'up',
    progress: 94,
  },
];

const socialInitiatives = [
  {
    title: 'Yerel Topluluk Desteği',
    description: '50+ yerel topluluğa bağış ve destek',
    impact: '₺2.5M',
    beneficiaries: '10,000+',
    status: 'active',
  },
  {
    title: 'Çeşitlilik & Kapsayıcılık',
    description: 'Çalışan çeşitliliği programları',
    impact: '%45 kadın liderlik',
    beneficiaries: '500+ çalışan',
    status: 'active',
  },
  {
    title: 'Sürdürülebilir Turizm Eğitimi',
    description: 'Kullanıcılara çevre bilinci eğitimi',
    impact: '25,000 kişi eğitildi',
    beneficiaries: '100+ destinasyon',
    status: 'active',
  },
  {
    title: 'Erişilebilirlik Programı',
    description: 'Engelli gezginler için özel destek',
    impact: '%100 WCAG uyumu',
    beneficiaries: '5,000+ kullanıcı',
    status: 'in_progress',
  },
];

const governanceMetrics = [
  { name: 'Veri Gizliliği Uyumu', score: 95, status: 'excellent' },
  { name: 'Etik İş Uygulamaları', score: 88, status: 'good' },
  { name: 'Şeffaflık Raporu', score: 82, status: 'good' },
  { name: 'Tedarik Zinciri Denetimi', score: 75, status: 'improving' },
  { name: 'Anti-Yolsuzluk Politikası', score: 92, status: 'excellent' },
];

const sustainabilityGoals = [
  {
    goal: 'Net Sıfır Karbon',
    target: 2030,
    progress: 45,
    description: '2030 yılına kadar net sıfır karbon emisyonu',
  },
  {
    goal: '%100 Yenilenebilir Enerji',
    target: 2027,
    progress: 68,
    description: 'Tüm operasyonlarda yenilenebilir enerji kullanımı',
  },
  {
    goal: 'Sıfır Atık',
    target: 2028,
    progress: 55,
    description: 'Ofis ve veri merkezlerinde sıfır atık hedefi',
  },
  {
    goal: 'Sürdürülebilir Seyahat',
    target: 2025,
    progress: 78,
    description: '%50 kullanıcının sürdürülebilir seçim yapması',
  },
];

export default function ESGPage() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'improving':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ESG Dashboard</h1>
          <p className="text-muted-foreground">Çevresel, Sosyal ve Yönetişim metrikleri</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            ESG Raporu
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Raporları İndir
          </Button>
        </div>
      </div>

      {/* ESG Scores */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-1 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Genel ESG Skoru</p>
                <p className="text-4xl font-bold text-green-600">{esgScores.overall}</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  +{esgScores.change} geçen çeyreğe göre
                </div>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-200">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                <TreePine className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Çevresel</p>
                <p className="text-2xl font-bold">{esgScores.environmental}</p>
              </div>
            </div>
            <Progress value={esgScores.environmental} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sosyal</p>
                <p className="text-2xl font-bold">{esgScores.social}</p>
              </div>
            </div>
            <Progress value={esgScores.social} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Building className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Yönetişim</p>
                <p className="text-2xl font-bold">{esgScores.governance}</p>
              </div>
            </div>
            <Progress value={esgScores.governance} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="environmental" className="space-y-4">
        <TabsList>
          <TabsTrigger value="environmental">Çevresel</TabsTrigger>
          <TabsTrigger value="social">Sosyal</TabsTrigger>
          <TabsTrigger value="governance">Yönetişim</TabsTrigger>
          <TabsTrigger value="goals">Sürdürülebilirlik Hedefleri</TabsTrigger>
        </TabsList>

        <TabsContent value="environmental" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {environmentalMetrics.map((metric) => (
              <Card key={metric.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">{metric.name}</h3>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{metric.value}</span>
                    <span className="text-muted-foreground">{metric.unit}</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Hedef: {metric.target} {metric.unit}</span>
                      <span className="font-medium">{metric.progress}%</span>
                    </div>
                    <Progress value={metric.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Recycle className="h-5 w-5 text-green-500" />
                Karbon Offset Projeleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Ağaçlandırma - Karadeniz', trees: '50,000', offset: '500 ton CO₂', status: 'active' },
                  { name: 'Rüzgar Enerjisi - Ege', capacity: '25 MW', offset: '300 ton CO₂', status: 'active' },
                  { name: 'Güneş Paneli - Akdeniz', capacity: '15 MW', offset: '200 ton CO₂', status: 'planned' },
                ].map((project, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <TreePine className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">{project.offset}</p>
                      </div>
                    </div>
                    <Badge className={project.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}>
                      {project.status === 'active' ? 'Aktif' : 'Planlandı'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {socialInitiatives.map((initiative, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <HandHeart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{initiative.title}</h3>
                        <p className="text-sm text-muted-foreground">{initiative.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Etki</p>
                      <p className="font-medium">{initiative.impact}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Faydalananlar</p>
                      <p className="font-medium">{initiative.beneficiaries}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Çalışan İstatistikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-bold">45%</p>
                  <p className="text-sm text-muted-foreground">Kadın Çalışan</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-bold">28%</p>
                  <p className="text-sm text-muted-foreground">Azınlık Grupları</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-bold">92%</p>
                  <p className="text-sm text-muted-foreground">Çalışan Memnuniyeti</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-3xl font-bold">4.8%</p>
                  <p className="text-sm text-muted-foreground">Turnover Oranı</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yönetişim Skorları</CardTitle>
              <CardDescription>Kurumsal yönetişim performansı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {governanceMetrics.map((metric) => (
                  <div key={metric.name} className="flex items-center gap-4">
                    <div className="w-48">
                      <span className="text-sm">{metric.name}</span>
                    </div>
                    <Progress value={metric.score} className="flex-1 h-3" />
                    <div className="flex items-center gap-2 w-32">
                      <span className="font-medium">{metric.score}%</span>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status === 'excellent' ? 'Mükemmel' : metric.status === 'good' ? 'İyi' : 'Gelişiyor'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Yönetim Kurulu Yapısı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bağımsız Üye Oranı</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Kadın Üye Oranı</span>
                    <span className="font-medium">40%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ortalama Deneyim</span>
                    <span className="font-medium">15 yıl</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Yıllık Toplantı</span>
                    <span className="font-medium">12</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uyumluluk Sertifikaları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'ISO 27001', status: 'Sertifikalı', expiry: '2025-06' },
                    { name: 'SOC 2 Type II', status: 'Sertifikalı', expiry: '2025-03' },
                    { name: 'GDPR', status: 'Uyumlu', expiry: '-' },
                    { name: 'KVKK', status: 'Uyumlu', expiry: '-' },
                  ].map((cert) => (
                    <div key={cert.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{cert.name}</span>
                      </div>
                      <Badge variant="outline">{cert.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {sustainabilityGoals.map((goal) => (
              <Card key={goal.goal}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{goal.goal}</h3>
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    </div>
                    <Badge variant="outline">{goal.target}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">İlerleme</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>UN Sürdürülebilir Kalkınma Hedefleri</CardTitle>
              <CardDescription>Desteklediğimiz SDG hedefleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-4">
                {[
                  { num: 8, name: 'İnsana Yakışır İş', color: 'bg-red-500' },
                  { num: 11, name: 'Sürdürülebilir Şehirler', color: 'bg-orange-500' },
                  { num: 12, name: 'Sorumlu Tüketim', color: 'bg-yellow-600' },
                  { num: 13, name: 'İklim Eylemi', color: 'bg-green-600' },
                  { num: 14, name: 'Sudaki Yaşam', color: 'bg-blue-500' },
                  { num: 17, name: 'Ortaklıklar', color: 'bg-blue-800' },
                ].map((sdg) => (
                  <div
                    key={sdg.num}
                    className={`${sdg.color} rounded-lg p-3 text-white text-center`}
                  >
                    <p className="text-2xl font-bold">{sdg.num}</p>
                    <p className="text-xs mt-1">{sdg.name}</p>
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

'use client';

import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Users,
  Star,
  DollarSign,
  Smartphone,
  Globe,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock competitive data
const competitors = [
  {
    id: '1',
    name: 'TravelMate',
    logo: '🧳',
    market_share: 35,
    rating: 4.5,
    downloads: '5M+',
    pricing: '₺79/ay',
    strengths: ['Güçlü marka', 'Geniş kullanıcı tabanı'],
    weaknesses: ['Yavaş yenilik', 'Eski arayüz'],
    threat_level: 'high',
  },
  {
    id: '2',
    name: 'WanderMatch',
    logo: '🌍',
    market_share: 22,
    rating: 4.3,
    downloads: '2M+',
    pricing: '₺59/ay',
    strengths: ['Düşük fiyat', 'Hızlı büyüme'],
    weaknesses: ['Az özellik', 'Zayıf destek'],
    threat_level: 'medium',
  },
  {
    id: '3',
    name: 'TripBuddy',
    logo: '✈️',
    market_share: 15,
    rating: 4.1,
    downloads: '1M+',
    pricing: '₺99/ay',
    strengths: ['Premium özellikler', 'B2B odaklı'],
    weaknesses: ['Yüksek fiyat', 'Dar hedef kitle'],
    threat_level: 'low',
  },
];

const marketMetrics = {
  totalMarketSize: '₺2.5B',
  ourShare: 18,
  shareChange: 3,
  ranking: 3,
  avgIndustryGrowth: 12,
  ourGrowth: 28,
};

const featureComparison = [
  { feature: 'Akıllı Eşleştirme', us: true, competitor1: true, competitor2: false, competitor3: false },
  { feature: 'Video Profiller', us: true, competitor1: false, competitor2: true, competitor3: false },
  { feature: 'Moment Paylaşımı', us: true, competitor1: true, competitor2: true, competitor3: true },
  { feature: 'Gerçek Zamanlı Chat', us: true, competitor1: true, competitor2: true, competitor3: true },
  { feature: 'Güvenlik Doğrulama', us: true, competitor1: true, competitor2: false, competitor3: true },
  { feature: 'AI Öneri Motoru', us: true, competitor1: false, competitor2: false, competitor3: false },
  { feature: 'Grup Seyahati', us: true, competitor1: false, competitor2: true, competitor3: false },
  { feature: 'Offline Mod', us: false, competitor1: true, competitor2: false, competitor3: false },
  { feature: 'Premium İçerik', us: true, competitor1: true, competitor2: false, competitor3: true },
  { feature: 'Creator Program', us: true, competitor1: false, competitor2: false, competitor3: false },
];

const marketTrends = [
  {
    trend: 'AI Destekli Eşleştirme',
    growth: '+45%',
    adoption: 62,
    status: 'leading',
    ourPosition: 'Lider',
  },
  {
    trend: 'Video İçerik',
    growth: '+78%',
    adoption: 45,
    status: 'growing',
    ourPosition: 'Takipçi',
  },
  {
    trend: 'Sürdürülebilir Seyahat',
    growth: '+34%',
    adoption: 28,
    status: 'emerging',
    ourPosition: 'İlk Hareket Eden',
  },
  {
    trend: 'Solo Gezgin Odağı',
    growth: '+56%',
    adoption: 52,
    status: 'growing',
    ourPosition: 'Lider',
  },
];

const swotAnalysis = {
  strengths: [
    'Yenilikçi AI eşleştirme algoritması',
    'Güçlü güvenlik altyapısı',
    'Aktif topluluk',
    'Çevik geliştirme ekibi',
  ],
  weaknesses: [
    'Düşük marka bilinirliği',
    'Sınırlı pazar erişimi',
    'Offline özellik eksikliği',
  ],
  opportunities: [
    'Büyüyen solo gezgin segmenti',
    'Sürdürülebilir turizm trendi',
    'B2B ortaklıkları',
    'Uluslararası genişleme',
  ],
  threats: [
    'Büyük oyuncuların pazara girişi',
    'Ekonomik belirsizlik',
    'Regülasyon değişiklikleri',
    'Veri gizliliği endişeleri',
  ],
};

export default function CompetitivePage() {
  const getThreatBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge variant="destructive">Yüksek Tehdit</Badge>;
      case 'medium':
        return <Badge className="bg-orange-500">Orta Tehdit</Badge>;
      case 'low':
        return <Badge className="bg-green-500">Düşük Tehdit</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rekabet Analizi</h1>
          <p className="text-muted-foreground">Pazar ve rakip takibi</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Verileri Güncelle
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pazar Büyüklüğü</p>
                <p className="text-2xl font-bold">{marketMetrics.totalMarketSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <PieChart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pazar Payımız</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{marketMetrics.ourShare}%</p>
                  <span className="text-sm text-green-500">+{marketMetrics.shareChange}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sıralama</p>
                <p className="text-2xl font-bold">#{marketMetrics.ranking}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sektör Büyüme</p>
                <p className="text-2xl font-bold">{marketMetrics.avgIndustryGrowth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-200">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bizim Büyüme</p>
                <p className="text-2xl font-bold text-green-600">{marketMetrics.ourGrowth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="competitors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="competitors">Rakipler</TabsTrigger>
          <TabsTrigger value="features">Özellik Karşılaştırma</TabsTrigger>
          <TabsTrigger value="trends">Pazar Trendleri</TabsTrigger>
          <TabsTrigger value="swot">SWOT Analizi</TabsTrigger>
        </TabsList>

        <TabsContent value="competitors" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {competitors.map((competitor) => (
              <Card key={competitor.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{competitor.logo}</span>
                      <div>
                        <CardTitle className="text-lg">{competitor.name}</CardTitle>
                        {getThreatBadge(competitor.threat_level)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Pazar Payı</p>
                        <p className="text-lg font-bold">{competitor.market_share}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-lg font-bold">{competitor.rating}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">İndirme</p>
                        <p className="text-lg font-bold">{competitor.downloads}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Fiyat</p>
                        <p className="text-lg font-bold">{competitor.pricing}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-xs font-medium text-green-600 mb-2">Güçlü Yönler</p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.strengths.map((s, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-red-600 mb-2">Zayıf Yönler</p>
                      <div className="flex flex-wrap gap-1">
                        {competitor.weaknesses.map((w, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {w}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pazar Payı Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'TravelMate', share: 35, color: 'bg-blue-500' },
                  { name: 'WanderMatch', share: 22, color: 'bg-green-500' },
                  { name: 'TravelMatch (Biz)', share: 18, color: 'bg-purple-500' },
                  { name: 'TripBuddy', share: 15, color: 'bg-orange-500' },
                  { name: 'Diğerleri', share: 10, color: 'bg-gray-400' },
                ].map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="w-32 text-sm">{item.name}</div>
                    <div className="flex-1">
                      <div className="h-6 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} flex items-center justify-end pr-2`}
                          style={{ width: `${item.share}%` }}
                        >
                          <span className="text-xs text-white font-medium">{item.share}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Özellik Karşılaştırma Matrisi</CardTitle>
              <CardDescription>Ana rakiplerle özellik karşılaştırması</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Özellik</th>
                      <th className="text-center py-3 px-4">
                        <span className="text-purple-600 font-bold">TravelMatch</span>
                      </th>
                      <th className="text-center py-3 px-4">TravelMate</th>
                      <th className="text-center py-3 px-4">WanderMatch</th>
                      <th className="text-center py-3 px-4">TripBuddy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureComparison.map((row) => (
                      <tr key={row.feature} className="border-b">
                        <td className="py-3 px-4 text-sm">{row.feature}</td>
                        <td className="text-center py-3 px-4">
                          {row.us ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {row.competitor1 ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {row.competitor2 ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {row.competitor3 ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Mevcut</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-300" />
                  <span>Yok</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rekabet Avantajlarımız</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { feature: 'AI Öneri Motoru', advantage: 'Tek biz' },
                    { feature: 'Creator Program', advantage: 'Tek biz' },
                    { feature: 'Video + AI', advantage: 'Kombine tek' },
                    { feature: 'Güvenlik + Doğrulama', advantage: 'En kapsamlı' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm font-medium">{item.feature}</span>
                      <Badge className="bg-purple-500">{item.advantage}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geliştirmemiz Gereken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { feature: 'Offline Mod', competitor: 'TravelMate', priority: 'high' },
                    { feature: 'Daha Geniş Dil Desteği', competitor: 'Tümü', priority: 'medium' },
                    { feature: 'Marka Bilinirliği', competitor: 'TravelMate', priority: 'high' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">{item.feature}</p>
                        <p className="text-xs text-muted-foreground">Lider: {item.competitor}</p>
                      </div>
                      <Badge variant={item.priority === 'high' ? 'destructive' : 'default'}>
                        {item.priority === 'high' ? 'Acil' : 'Orta'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {marketTrends.map((trend) => (
              <Card key={trend.trend}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium">{trend.trend}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500">{trend.growth} YoY</span>
                      </div>
                    </div>
                    <Badge
                      className={
                        trend.status === 'leading'
                          ? 'bg-green-500'
                          : trend.status === 'growing'
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                      }
                    >
                      {trend.status === 'leading'
                        ? 'Olgun'
                        : trend.status === 'growing'
                          ? 'Büyüyen'
                          : 'Yükselen'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sektör Adaptasyonu</span>
                      <span className="font-medium">{trend.adoption}%</span>
                    </div>
                    <Progress value={trend.adoption} className="h-2" />
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pozisyonumuz</span>
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      {trend.ourPosition}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gelecek Trendler</CardTitle>
              <CardDescription>Önümüzdeki 12-24 ay için tahminler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    trend: 'AR/VR Destinasyon Önizleme',
                    probability: 75,
                    impact: 'high',
                    timeline: '2025 Q2',
                  },
                  {
                    trend: 'Blockchain Tabanlı Kimlik Doğrulama',
                    probability: 45,
                    impact: 'medium',
                    timeline: '2025 Q4',
                  },
                  {
                    trend: 'Ses Tabanlı Arama',
                    probability: 85,
                    impact: 'medium',
                    timeline: '2025 Q1',
                  },
                  {
                    trend: 'Karbon Nötr Seyahat Sertifikası',
                    probability: 65,
                    impact: 'high',
                    timeline: '2025 Q3',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.trend}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Olasılık:</span>
                          <Progress value={item.probability} className="w-20 h-2" />
                          <span className="text-xs font-medium">{item.probability}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={item.impact === 'high' ? 'destructive' : 'default'}
                      >
                        {item.impact === 'high' ? 'Yüksek Etki' : 'Orta Etki'}
                      </Badge>
                      <Badge variant="outline">{item.timeline}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swot" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Güçlü Yönler (S)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {swotAnalysis.strengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Zayıf Yönler (W)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {swotAnalysis.weaknesses.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <TrendingUp className="h-5 w-5" />
                  Fırsatlar (O)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {swotAnalysis.opportunities.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <TrendingDown className="h-5 w-5" />
                  Tehditler (T)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {swotAnalysis.threats.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <TrendingDown className="h-4 w-4 text-orange-500 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Stratejik Öncelikler</CardTitle>
              <CardDescription>SWOT analizine dayalı aksiyon önerileri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium text-green-600 mb-3">S-O Stratejileri</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• AI'ı solo gezgin segmentinde derinleştir</li>
                    <li>• Sürdürülebilir seyahat özelliklerini öne çıkar</li>
                    <li>• B2B ortaklıkları için teknoloji avantajını kullan</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium text-blue-600 mb-3">W-O Stratejileri</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Marka bilinirliği için influencer kampanyaları</li>
                    <li>• Uluslararası pazarlar için offline mod geliştir</li>
                    <li>• Dil desteğini genişlet</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium text-orange-600 mb-3">S-T Stratejileri</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Güvenlik altyapısını pazarlama avantajına çevir</li>
                    <li>• KVKK/GDPR uyumunu vurgula</li>
                    <li>• Hızlı yenilik döngüsünü sürdür</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium text-red-600 mb-3">W-T Stratejileri</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Niş pazarlara odaklan (solo + sürdürülebilir)</li>
                    <li>• Maliyet optimizasyonu için ölçeklendirme</li>
                    <li>• Regülasyonları yakından takip et</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

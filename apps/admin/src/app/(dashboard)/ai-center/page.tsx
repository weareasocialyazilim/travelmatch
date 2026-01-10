'use client';

import { useState } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Target,
  Zap,
  BarChart3,
  Activity,
  Eye,
  RefreshCw,
  Settings,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatDate } from '@/lib/utils';

// Mock data - Gift Platform AI Stats
const moderationStats = {
  totalProcessed: 45678,
  proofsVerified: 38450,
  proofsRejected: 1234,
  pendingReview: 5994,
  accuracy: 97.8,
};

const contentQualityData = [
  { date: '12 Ara', score: 78 },
  { date: '13 Ara', score: 82 },
  { date: '14 Ara', score: 79 },
  { date: '15 Ara', score: 85 },
  { date: '16 Ara', score: 88 },
  { date: '17 Ara', score: 84 },
  { date: '18 Ara', score: 87 },
];

const churnPredictions = [
  {
    id: '1',
    user: 'Elif K.',
    risk: 'high',
    probability: 85,
    factors: [
      '7 gündür inaktif',
      'Son ayda 0 hediye gönderdi',
      'Premium iptal edildi',
    ],
    suggested_action: 'Hediye kampanyası e-postası gönder',
  },
  {
    id: '2',
    user: 'Mehmet Y.',
    risk: 'medium',
    probability: 62,
    factors: ['Aktivite düştü %50', 'Hiç moment oluşturmadı'],
    suggested_action: 'Push bildirim ile hatırlat',
  },
  {
    id: '3',
    user: 'Ayşe B.',
    risk: 'medium',
    probability: 58,
    factors: ['Bekleyen hediye kanıtı var', 'Son giriş 5 gün önce'],
    suggested_action: 'Kanıt yükleme hatırlatıcısı gönder',
  },
];

const ltvPredictions = [
  { segment: 'Platinum Gönderici', users: 2400, avgLTV: 2850, trend: 'up' },
  { segment: 'Pro Gönderici', users: 8200, avgLTV: 920, trend: 'up' },
  { segment: 'Starter Gönderici', users: 15000, avgLTV: 245, trend: 'stable' },
  { segment: 'Ücretsiz Kullanıcı', users: 45000, avgLTV: 35, trend: 'up' },
];

const anomalies = [
  {
    id: '1',
    type: 'proof_fraud',
    severity: 'critical',
    message: 'Sahte kanıt tespit edildi',
    details: '3 kullanıcı aynı fotoğrafı farklı momentler için yükledi',
    detected_at: '2024-12-18T14:30:00Z',
  },
  {
    id: '2',
    type: 'fraud_pattern',
    severity: 'critical',
    message: 'Potansiyel dolandırıcılık kümesi',
    details: '15 hesap benzer para çekme davranışı gösteriyor',
    detected_at: '2024-12-18T13:15:00Z',
  },
  {
    id: '3',
    type: 'gift_trend',
    severity: 'info',
    message: 'Yeni hediye trendi tespit edildi',
    details: '"Kapadokya Balon Turu" momentlerinde %180 artış',
    detected_at: '2024-12-18T12:00:00Z',
  },
];

const aiModels = [
  {
    id: 'proof_verification',
    name: 'Kanıt Doğrulama (KYC)',
    status: 'active',
    accuracy: 96.5,
    lastUpdated: '2024-12-15T00:00:00Z',
    processedToday: 8450,
  },
  {
    id: 'offer_analysis',
    name: 'Teklif Analizi',
    status: 'active',
    accuracy: 98.2,
    lastUpdated: '2024-12-18T00:00:00Z',
    processedToday: 15600,
  },
  {
    id: 'content_moderation',
    name: 'İçerik Moderasyonu',
    status: 'active',
    accuracy: 97.8,
    lastUpdated: '2024-12-15T00:00:00Z',
    processedToday: 12450,
  },
  {
    id: 'fraud_detection',
    name: 'Dolandırıcılık Tespiti',
    status: 'active',
    accuracy: 94.2,
    lastUpdated: '2024-12-10T00:00:00Z',
    processedToday: 8900,
  },
  {
    id: 'smart_notifications',
    name: 'Akıllı Bildirimler',
    status: 'active',
    accuracy: 88.5,
    lastUpdated: '2024-12-12T00:00:00Z',
    processedToday: 45000,
  },
  {
    id: 'moment_suggestions',
    name: 'Moment Önerileri',
    status: 'active',
    accuracy: 82.3,
    lastUpdated: '2024-12-18T00:00:00Z',
    processedToday: 28000,
  },
];

const contentDistribution = [
  { name: 'Kanıt Onaylandı', value: 84, color: '#22c55e' },
  { name: 'Kanıt Reddedildi', value: 3, color: '#ef4444' },
  { name: 'Manuel İnceleme', value: 13, color: '#f59e0b' },
];

export default function AICenterPage() {
  const [_selectedModel, _setSelectedModel] = useState<string | null>(null);

  const getSeverityBadge = (severity: string) => {
    const variants: Record<
      string,
      {
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        label: string;
      }
    > = {
      critical: { variant: 'destructive', label: 'Kritik' },
      warning: { variant: 'secondary', label: 'Uyarı' },
      info: { variant: 'outline', label: 'Bilgi' },
    };
    const { variant, label } = variants[severity] || {
      variant: 'outline',
      label: severity,
    };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getRiskBadge = (risk: string) => {
    const variants: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive'; color: string }
    > = {
      high: { variant: 'destructive', color: 'bg-red-500' },
      medium: { variant: 'secondary', color: 'bg-yellow-500' },
      low: { variant: 'default', color: 'bg-green-500' },
    };
    const { variant } = variants[risk] || {
      variant: 'default',
      color: 'bg-gray-500',
    };
    return (
      <Badge variant={variant}>
        {risk === 'high' ? 'Yüksek' : risk === 'medium' ? 'Orta' : 'Düşük'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            AI Command Center
          </h1>
          <p className="text-muted-foreground">
            Hediye doğrulama ve kanıt analizi için AI modelleri
          </p>
        </div>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Model Ayarları
        </Button>
      </div>

      {/* Proof Verification Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {moderationStats.totalProcessed.toLocaleString('tr-TR')}
                </p>
                <p className="text-sm text-muted-foreground">Toplam Kanıt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {moderationStats.proofsVerified.toLocaleString('tr-TR')}
                </p>
                <p className="text-sm text-muted-foreground">Doğrulanan</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {moderationStats.proofsRejected.toLocaleString('tr-TR')}
                </p>
                <p className="text-sm text-muted-foreground">Reddedilen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {moderationStats.pendingReview.toLocaleString('tr-TR')}
                </p>
                <p className="text-sm text-muted-foreground">
                  İnceleme Bekliyor
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  %{moderationStats.accuracy}
                </p>
                <p className="text-sm text-muted-foreground">Doğruluk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">
            <Brain className="mr-2 h-4 w-4" />
            AI Modeller
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <TrendingUp className="mr-2 h-4 w-4" />
            Tahminler
          </TabsTrigger>
          <TabsTrigger value="anomalies">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Anomaliler
          </TabsTrigger>
          <TabsTrigger value="quality">
            <BarChart3 className="mr-2 h-4 w-4" />
            Kanıt Kalitesi
          </TabsTrigger>
        </TabsList>

        {/* AI Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {aiModels.map((model) => (
              <Card key={model.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{model.name}</CardTitle>
                    <Badge
                      variant={
                        model.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {model.status === 'active' ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Doğruluk</span>
                      <span className="font-medium">%{model.accuracy}</span>
                    </div>
                    <Progress value={model.accuracy} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Bugün İşlenen</span>
                    <span className="font-medium">
                      {model.processedToday.toLocaleString('tr-TR')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Son Güncelleme
                    </span>
                    <span className="text-muted-foreground">
                      {formatDate(model.lastUpdated)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <Label htmlFor={`model-${model.id}`} className="text-sm">
                      Model Aktif
                    </Label>
                    <Switch id={`model-${model.id}`} defaultChecked />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          {/* Churn Predictions */}
          <Card>
            <CardHeader>
              <CardTitle>Churn Risk Tahminleri</CardTitle>
              <CardDescription>
                Ayrılma riski yüksek kullanıcılar ve önerilen aksiyonlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {churnPredictions.map((prediction) => (
                  <div
                    key={prediction.id}
                    className="flex items-start justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{prediction.user}</p>
                          {getRiskBadge(prediction.risk)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            Churn olasılığı: %{prediction.probability}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {prediction.factors.map((factor, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-2">
                        Önerilen Aksiyon
                      </p>
                      <Button size="sm" variant="outline">
                        <Zap className="mr-2 h-4 w-4" />
                        {prediction.suggested_action}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* LTV Predictions */}
          <Card>
            <CardHeader>
              <CardTitle>LTV Tahminleri</CardTitle>
              <CardDescription>
                Segment bazlı yaşam boyu değer tahminleri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ltvPredictions.map((segment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-40">
                        <p className="font-medium">{segment.segment}</p>
                        <p className="text-sm text-muted-foreground">
                          {segment.users.toLocaleString('tr-TR')} kullanıcı
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">₺{segment.avgLTV}</p>
                        <p className="text-xs text-muted-foreground">
                          Ort. LTV
                        </p>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full">
                        {segment.trend === 'up' && (
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        )}
                        {segment.trend === 'down' && (
                          <TrendingDown className="h-5 w-5 text-red-500" />
                        )}
                        {segment.trend === 'stable' && (
                          <Activity className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Anomali Tespiti</CardTitle>
                  <CardDescription>
                    Olağandışı davranışlar ve sistem uyarıları
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Yenile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {anomalies.map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className={`rounded-lg border p-4 ${
                      anomaly.severity === 'critical'
                        ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
                        : anomaly.severity === 'warning'
                          ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'
                          : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            anomaly.severity === 'critical'
                              ? 'bg-red-100'
                              : anomaly.severity === 'warning'
                                ? 'bg-yellow-100'
                                : 'bg-blue-100'
                          }`}
                        >
                          <AlertTriangle
                            className={`h-5 w-5 ${
                              anomaly.severity === 'critical'
                                ? 'text-red-600'
                                : anomaly.severity === 'warning'
                                  ? 'text-yellow-600'
                                  : 'text-blue-600'
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{anomaly.message}</p>
                            {getSeverityBadge(anomaly.severity)}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {anomaly.details}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Tespit: {formatDate(anomaly.detected_at)}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        İncele
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Quality Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Kanıt Doğruluk Trendi</CardTitle>
                <CardDescription>
                  Son 7 günlük ortalama doğrulama skoru
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={contentQualityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[60, 100]} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Content Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Kanıt Doğrulama Dağılımı</CardTitle>
                <CardDescription>AI doğrulama sonuçları</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contentDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {contentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-center gap-6">
                  {contentDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.name} ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

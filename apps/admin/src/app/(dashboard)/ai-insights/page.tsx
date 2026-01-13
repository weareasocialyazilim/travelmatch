'use client';

/**
 * TravelMatch AI/ML Insights Dashboard
 * Tum AI/ML modelleri performansi ve analizleri
 *
 * Proof verification, price prediction, recommendations, NLP ve daha fazlasi
 */

import { useState } from 'react';
import {
  Brain,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BarChart3,
  PieChart,
  Bot,
  MessageSquare,
  DollarSign,
  Users,
  Search,
  Shield,
  Sparkles,
  RefreshCw,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
  CanvaCardBody,
  CanvaStatCard,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';
import { CanvaButton } from '@/components/canva/CanvaButton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  AdminAreaChart,
  AdminBarChart,
  AdminLineChart,
  CHART_COLORS,
} from '@/components/common/admin-chart';
import { cn } from '@/lib/utils';

// AI Models Overview
const aiModels = [
  {
    id: 'proof_verification',
    name: 'Proof Verification',
    description: 'Kanit dogrulama ve gorsel analiz',
    status: 'active',
    accuracy: 94.7,
    latency: 234,
    requests_today: 1256,
    version: 'v3.2.1',
    lastTrained: '2024-01-05',
    features: [
      'Face Matching',
      'Landmark Detection',
      'EXIF Analysis',
      'Deepfake Detection',
    ],
  },
  {
    id: 'price_prediction',
    name: 'Price Prediction',
    description: 'Dinamik fiyat tahmini',
    status: 'active',
    accuracy: 87.3,
    latency: 89,
    requests_today: 3421,
    version: 'v2.8.0',
    lastTrained: '2024-01-08',
    features: ['Seasonal Pricing', 'Location Multipliers', 'Demand Analysis'],
  },
  {
    id: 'recommendation_engine',
    name: 'Recommendation Engine',
    description: 'Kisisellestirilmis oneriler',
    status: 'active',
    accuracy: 82.1,
    latency: 156,
    requests_today: 8934,
    version: 'v4.1.0',
    lastTrained: '2024-01-07',
    features: [
      'Collaborative Filtering',
      'Content-based',
      'Trending',
      'Similar Moments',
    ],
  },
  {
    id: 'turkish_nlp',
    name: 'Turkish NLP',
    description: 'Turkce dogal dil isleme',
    status: 'active',
    accuracy: 91.5,
    latency: 67,
    requests_today: 5678,
    version: 'v2.5.2',
    lastTrained: '2024-01-06',
    features: [
      'Sentiment Analysis',
      'Entity Extraction',
      'Content Moderation',
      'Hashtag Generation',
    ],
  },
  {
    id: 'chatbot',
    name: 'AI Chatbot',
    description: 'Yapay zeka sohbet asistani',
    status: 'active',
    accuracy: 78.5,
    latency: 345,
    requests_today: 2345,
    version: 'v3.0.0',
    lastTrained: '2024-01-04',
    features: [
      'Intent Detection',
      'Entity Extraction',
      'Quick Actions',
      'Multi-turn Conversations',
    ],
  },
  {
    id: 'fraud_detection',
    name: 'Fraud Detection',
    description: 'Dolandiricilik tespiti',
    status: 'active',
    accuracy: 99.2,
    latency: 45,
    requests_today: 12456,
    version: 'v5.0.1',
    lastTrained: '2024-01-09',
    features: [
      'Risk Scoring',
      'Pattern Detection',
      'Behavioral Analysis',
      'Real-time Alerts',
    ],
  },
  {
    id: 'forecasting',
    name: 'Demand Forecasting',
    description: 'Talep tahmini ve trend analizi',
    status: 'active',
    accuracy: 85.8,
    latency: 178,
    requests_today: 456,
    version: 'v1.9.0',
    lastTrained: '2024-01-03',
    features: [
      'Seasonal Trends',
      'Holiday Impact',
      'Category Analysis',
      'Capacity Planning',
    ],
  },
  {
    id: 'seo_hacker',
    name: 'SEO Auto-Pilot',
    description: 'Otonom SEO ve trend takibi',
    status: 'active',
    accuracy: 76.4,
    latency: 890,
    requests_today: 234,
    version: 'v1.2.0',
    lastTrained: '2024-01-02',
    features: [
      'Trend Tracking',
      'Keyword Injection',
      'Competitor Analysis',
      'Intent Analysis',
    ],
  },
];

// Model Performance History
const modelPerformanceData = [
  { date: 'Pzt', proof: 94, price: 86, rec: 81, nlp: 90, fraud: 99 },
  { date: 'Sal', proof: 95, price: 87, rec: 82, nlp: 91, fraud: 99 },
  { date: 'Car', proof: 93, price: 85, rec: 80, nlp: 89, fraud: 99 },
  { date: 'Per', proof: 96, price: 88, rec: 83, nlp: 92, fraud: 99 },
  { date: 'Cum', proof: 94, price: 87, rec: 82, nlp: 91, fraud: 99 },
  { date: 'Cmt', proof: 95, price: 88, rec: 84, nlp: 93, fraud: 99 },
  { date: 'Paz', proof: 94, price: 87, rec: 82, nlp: 91, fraud: 99 },
];

// Request Volume Data
const requestVolumeData = [
  { hour: '00', requests: 456 },
  { hour: '04', requests: 234 },
  { hour: '08', requests: 1234 },
  { hour: '12', requests: 2345 },
  { hour: '16', requests: 3456 },
  { hour: '20', requests: 2890 },
  { hour: '24', requests: 1234 },
];

// AI Insights Generated
const recentInsights = [
  {
    type: 'opportunity',
    title: 'Premium Donusum Firsati',
    description:
      '2,345 kullanici premium abonelige donusturulmeye uygun. Hedefli kampanya onerisi.',
    confidence: 89,
    impact: 'high',
    createdAt: '10 dk once',
  },
  {
    type: 'warning',
    title: 'Churn Riski Tespiti',
    description:
      '156 premium kullanicida 30 gun icinde iptal riski tespit edildi.',
    confidence: 76,
    impact: 'medium',
    createdAt: '25 dk once',
  },
  {
    type: 'trend',
    title: 'Kapadokya Trend Artisi',
    description:
      'Kapadokya momentlerinde %35 talep artisi. Fiyat optimizasyonu onerisi.',
    confidence: 94,
    impact: 'high',
    createdAt: '1 saat once',
  },
  {
    type: 'fraud',
    title: 'Supeli Hesap Tespiti',
    description: '3 hesapta potansiyel fraud davranisi tespit edildi.',
    confidence: 92,
    impact: 'critical',
    createdAt: '2 saat once',
  },
  {
    type: 'optimization',
    title: 'Fiyat Optimizasyonu',
    description:
      'Istanbul restoran momentlerinde %12 fiyat artisi potansiyeli.',
    confidence: 81,
    impact: 'medium',
    createdAt: '3 saat once',
  },
];

// A/B Test Results
const abTests = [
  {
    id: 'test-001',
    name: 'Premium Teklif Zamanlama',
    status: 'running',
    variants: ['Control', 'Day 3', 'Day 7'],
    winner: null,
    participants: 4567,
    conversions: { control: 3.2, day3: 4.8, day7: 3.9 },
    startDate: '2024-01-05',
    significance: 87,
  },
  {
    id: 'test-002',
    name: 'Oneri Algoritmasi',
    status: 'completed',
    variants: ['Collaborative', 'Hybrid'],
    winner: 'Hybrid',
    participants: 12345,
    conversions: { collaborative: 12.4, hybrid: 15.8 },
    startDate: '2024-01-01',
    significance: 96,
  },
];

// Chatbot Analytics
const chatbotStats = {
  totalConversations: 2345,
  avgMessages: 4.2,
  resolutionRate: 78.5,
  escalationRate: 21.5,
  avgResponseTime: 1.2,
  topIntents: [
    { intent: 'gift_recommendation', count: 678, success: 82 },
    { intent: 'payment_inquiry', count: 456, success: 91 },
    { intent: 'proof_help', count: 345, success: 76 },
    { intent: 'account_help', count: 234, success: 88 },
    { intent: 'dispute_support', count: 189, success: 65 },
  ],
};

export default function AIInsightsPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedModel, setSelectedModel] = useState<
    (typeof aiModels)[0] | null
  >(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <CanvaBadge className="bg-emerald-500/10 text-emerald-600">
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            Aktif
          </CanvaBadge>
        );
      case 'training':
        return (
          <CanvaBadge className="bg-blue-500/10 text-blue-600">
            <RotateCcw className="h-3 w-3 mr-1 animate-spin" />
            Egitiliyor
          </CanvaBadge>
        );
      case 'paused':
        return (
          <CanvaBadge className="bg-amber-500/10 text-amber-600">
            <Pause className="h-3 w-3 mr-1" />
            Durduruldu
          </CanvaBadge>
        );
      default:
        return <CanvaBadge variant="outline">{status}</CanvaBadge>;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-emerald-600';
    if (accuracy >= 80) return 'text-blue-600';
    if (accuracy >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <Lightbulb className="h-4 w-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'trend':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'fraud':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'optimization':
        return <Target className="h-4 w-4 text-purple-500" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'critical':
        return <CanvaBadge variant="destructive">Kritik</CanvaBadge>;
      case 'high':
        return (
          <CanvaBadge className="bg-amber-500/10 text-amber-600">
            Yuksek
          </CanvaBadge>
        );
      case 'medium':
        return <CanvaBadge variant="secondary">Orta</CanvaBadge>;
      default:
        return <CanvaBadge variant="outline">Dusuk</CanvaBadge>;
    }
  };

  return (
    <div className="admin-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6 text-cyan-500" />
            AI/ML Insights Dashboard
          </h1>
          <p className="text-muted-foreground">
            Tum yapay zeka modellerinin performansi ve analizleri
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CanvaButton variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Model Ayarlari
          </CanvaButton>
          <CanvaButton size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </CanvaButton>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-6">
        <CanvaCard>
          <CanvaCardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Toplam Model</p>
            <CanvaCardTitle className="text-2xl font-bold">
              {aiModels.length}
            </CanvaCardTitle>
          </CanvaCardHeader>
          <CanvaCardBody>
            <p className="text-xs text-emerald-600">
              {aiModels.filter((m) => m.status === 'active').length} aktif
            </p>
          </CanvaCardBody>
        </CanvaCard>

        <CanvaCard>
          <CanvaCardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Bugun Istek</p>
            <CanvaCardTitle className="text-2xl font-bold">
              {aiModels
                .reduce((acc, m) => acc + m.requests_today, 0)
                .toLocaleString()}
            </CanvaCardTitle>
          </CanvaCardHeader>
          <CanvaCardBody>
            <p className="text-xs text-muted-foreground">Tum modeller</p>
          </CanvaCardBody>
        </CanvaCard>

        <CanvaCard>
          <CanvaCardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Ort. Dogruluk</p>
            <CanvaCardTitle className="text-2xl font-bold text-emerald-600">
              %
              {(
                aiModels.reduce((acc, m) => acc + m.accuracy, 0) /
                aiModels.length
              ).toFixed(1)}
            </CanvaCardTitle>
          </CanvaCardHeader>
          <CanvaCardBody>
            <p className="text-xs text-muted-foreground">Tum modeller</p>
          </CanvaCardBody>
        </CanvaCard>

        <CanvaCard>
          <CanvaCardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Ort. Latency</p>
            <CanvaCardTitle className="text-2xl font-bold">
              {Math.round(
                aiModels.reduce((acc, m) => acc + m.latency, 0) /
                  aiModels.length,
              )}
              ms
            </CanvaCardTitle>
          </CanvaCardHeader>
          <CanvaCardBody>
            <p className="text-xs text-muted-foreground">Response time</p>
          </CanvaCardBody>
        </CanvaCard>

        <CanvaCard>
          <CanvaCardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">AI Insights</p>
            <CanvaCardTitle className="text-2xl font-bold">
              {recentInsights.length}
            </CanvaCardTitle>
          </CanvaCardHeader>
          <CanvaCardBody>
            <p className="text-xs text-amber-600">2 kritik</p>
          </CanvaCardBody>
        </CanvaCard>

        <CanvaCard>
          <CanvaCardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">A/B Tests</p>
            <CanvaCardTitle className="text-2xl font-bold">
              {abTests.length}
            </CanvaCardTitle>
          </CanvaCardHeader>
          <CanvaCardBody>
            <p className="text-xs text-blue-600">1 aktif</p>
          </CanvaCardBody>
        </CanvaCard>
      </div>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Modeller</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
          <TabsTrigger value="experiments">A/B Tests</TabsTrigger>
        </TabsList>

        {/* Models Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Model Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {aiModels.map((model) => (
              <CanvaCard
                key={model.id}
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => setSelectedModel(model)}
              >
                <CanvaCardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Brain className="h-5 w-5 text-cyan-500" />
                    {getStatusBadge(model.status)}
                  </div>
                  <CanvaCardTitle className="text-base">
                    {model.name}
                  </CanvaCardTitle>
                  <p className="text-xs text-muted-foreground">
                    {model.description}
                  </p>
                </CanvaCardHeader>
                <CanvaCardBody className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dogruluk</span>
                    <span
                      className={cn(
                        'font-bold',
                        getAccuracyColor(model.accuracy),
                      )}
                    >
                      %{model.accuracy}
                    </span>
                  </div>
                  <Progress value={model.accuracy} className="h-1" />

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground">Latency</p>
                      <p className="font-medium">{model.latency}ms</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground">Istek/Gun</p>
                      <p className="font-medium">
                        {model.requests_today.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {model.features.slice(0, 2).map((f) => (
                      <CanvaBadge key={f} variant="outline" className="text-xs">
                        {f}
                      </CanvaBadge>
                    ))}
                    {model.features.length > 2 && (
                      <CanvaBadge variant="outline" className="text-xs">
                        +{model.features.length - 2}
                      </CanvaBadge>
                    )}
                  </div>
                </CanvaCardBody>
              </CanvaCard>
            ))}
          </div>

          {/* Performance Chart */}
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Haftalik Model Performansi</CanvaCardTitle>
              <p className="text-sm text-muted-foreground">
                Ana modellerin dogruluk trendi
              </p>
            </CanvaCardHeader>
            <CanvaCardBody>
              <AdminLineChart
                data={modelPerformanceData}
                xAxisKey="date"
                height={300}
                lines={[
                  {
                    dataKey: 'proof',
                    name: 'Proof Verification',
                    color: CHART_COLORS.primary,
                  },
                  {
                    dataKey: 'price',
                    name: 'Price Prediction',
                    color: CHART_COLORS.secondary,
                  },
                  {
                    dataKey: 'rec',
                    name: 'Recommendations',
                    color: CHART_COLORS.trust,
                  },
                  {
                    dataKey: 'nlp',
                    name: 'Turkish NLP',
                    color: CHART_COLORS.amber,
                  },
                ]}
                yAxisFormatter={(value) => `%${value}`}
              />
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CanvaCard>
                <CanvaCardHeader>
                  <CanvaCardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    AI Uretimi Insights
                  </CanvaCardTitle>
                  <p className="text-sm text-muted-foreground">
                    Yapay zeka tarafindan tespit edilen firsatlar ve uyarilar
                  </p>
                </CanvaCardHeader>
                <CanvaCardBody>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {recentInsights.map((insight, index) => (
                        <div
                          key={index}
                          className={cn(
                            'p-4 rounded-lg border',
                            insight.type === 'opportunity' &&
                              'border-emerald-500/30 bg-emerald-500/5',
                            insight.type === 'warning' &&
                              'border-amber-500/30 bg-amber-500/5',
                            insight.type === 'trend' &&
                              'border-blue-500/30 bg-blue-500/5',
                            insight.type === 'fraud' &&
                              'border-red-500/30 bg-red-500/5',
                            insight.type === 'optimization' &&
                              'border-purple-500/30 bg-purple-500/5',
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getInsightIcon(insight.type)}
                              <span className="font-medium">
                                {insight.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getImpactBadge(insight.impact)}
                              <span className="text-xs text-muted-foreground">
                                {insight.createdAt}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {insight.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Target className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                %{insight.confidence} guven
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CanvaButton size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Detay
                              </CanvaButton>
                              <CanvaButton size="sm">Uygula</CanvaButton>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CanvaCardBody>
              </CanvaCard>
            </div>

            <div className="space-y-4">
              <CanvaCard>
                <CanvaCardHeader className="pb-3">
                  <CanvaCardTitle className="text-base">
                    Insight Dagilimi
                  </CanvaCardTitle>
                </CanvaCardHeader>
                <CanvaCardBody>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm">Firsatlar</span>
                      </div>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-sm">Uyarilar</span>
                      </div>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Trendler</span>
                      </div>
                      <span className="font-medium">15</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Fraud</span>
                      </div>
                      <span className="font-medium">3</span>
                    </div>
                  </div>
                </CanvaCardBody>
              </CanvaCard>

              <CanvaCard>
                <CanvaCardHeader className="pb-3">
                  <CanvaCardTitle className="text-base">
                    Istek Hacmi
                  </CanvaCardTitle>
                </CanvaCardHeader>
                <CanvaCardBody>
                  <AdminAreaChart
                    data={requestVolumeData}
                    xAxisKey="hour"
                    height={150}
                    areas={[
                      {
                        dataKey: 'requests',
                        name: 'Istekler',
                        color: CHART_COLORS.primary,
                      },
                    ]}
                  />
                </CanvaCardBody>
              </CanvaCard>
            </div>
          </div>
        </TabsContent>

        {/* Chatbot Tab */}
        <TabsContent value="chatbot" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-5">
            <CanvaCard>
              <CanvaCardHeader className="pb-2">
                <p className="text-sm text-muted-foreground">Konusma</p>
                <CanvaCardTitle className="text-xl">
                  {chatbotStats.totalConversations.toLocaleString()}
                </CanvaCardTitle>
              </CanvaCardHeader>
            </CanvaCard>
            <CanvaCard>
              <CanvaCardHeader className="pb-2">
                <p className="text-sm text-muted-foreground">Ort. Mesaj</p>
                <CanvaCardTitle className="text-xl">
                  {chatbotStats.avgMessages}
                </CanvaCardTitle>
              </CanvaCardHeader>
            </CanvaCard>
            <CanvaCard>
              <CanvaCardHeader className="pb-2">
                <p className="text-sm text-muted-foreground">Cozum Orani</p>
                <CanvaCardTitle className="text-xl text-emerald-600">
                  %{chatbotStats.resolutionRate}
                </CanvaCardTitle>
              </CanvaCardHeader>
            </CanvaCard>
            <CanvaCard>
              <CanvaCardHeader className="pb-2">
                <p className="text-sm text-muted-foreground">Escalation</p>
                <CanvaCardTitle className="text-xl text-amber-600">
                  %{chatbotStats.escalationRate}
                </CanvaCardTitle>
              </CanvaCardHeader>
            </CanvaCard>
            <CanvaCard>
              <CanvaCardHeader className="pb-2">
                <p className="text-sm text-muted-foreground">Yanit Suresi</p>
                <CanvaCardTitle className="text-xl">
                  {chatbotStats.avgResponseTime}s
                </CanvaCardTitle>
              </CanvaCardHeader>
            </CanvaCard>
          </div>

          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                Intent Performansi
              </CanvaCardTitle>
              <p className="text-sm text-muted-foreground">
                Chatbot intent tespit ve cozum oranlari
              </p>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="space-y-4">
                {chatbotStats.topIntents.map((intent) => (
                  <div
                    key={intent.intent}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium capitalize">
                          {intent.intent.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {intent.count} konusma
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          'font-bold',
                          intent.success >= 80
                            ? 'text-emerald-600'
                            : intent.success >= 70
                              ? 'text-amber-600'
                              : 'text-red-600',
                        )}
                      >
                        %{intent.success}
                      </p>
                      <p className="text-xs text-muted-foreground">cozum</p>
                    </div>
                  </div>
                ))}
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* A/B Tests Tab */}
        <TabsContent value="experiments" className="space-y-6">
          <div className="grid gap-6">
            {abTests.map((test) => (
              <CanvaCard key={test.id}>
                <CanvaCardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CanvaCardTitle className="flex items-center gap-2">
                        {test.name}
                        {test.status === 'running' ? (
                          <CanvaBadge className="bg-blue-500/10 text-blue-600">
                            <Activity className="h-3 w-3 mr-1 animate-pulse" />
                            Devam Ediyor
                          </CanvaBadge>
                        ) : (
                          <CanvaBadge className="bg-emerald-500/10 text-emerald-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Tamamlandi
                          </CanvaBadge>
                        )}
                      </CanvaCardTitle>
                      <p className="text-sm text-muted-foreground">
                        Baslama: {test.startDate} |{' '}
                        {test.participants.toLocaleString()} katilimci
                      </p>
                    </div>
                    {test.winner && (
                      <CanvaBadge className="bg-emerald-500 text-white">
                        Kazanan: {test.winner}
                      </CanvaBadge>
                    )}
                  </div>
                </CanvaCardHeader>
                <CanvaCardBody>
                  <div className="grid gap-4 md:grid-cols-3">
                    {Object.entries(test.conversions).map(([variant, rate]) => (
                      <div
                        key={variant}
                        className={cn(
                          'p-4 rounded-lg border',
                          test.winner ===
                            variant.charAt(0).toUpperCase() +
                              variant.slice(1) &&
                            'border-emerald-500 bg-emerald-500/5',
                        )}
                      >
                        <p className="font-medium capitalize">{variant}</p>
                        <p className="text-2xl font-bold mt-1">%{rate}</p>
                        <p className="text-sm text-muted-foreground">Donusum</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Istatistiksel anlamlilik: %{test.significance}
                      </span>
                    </div>
                    {test.status === 'running' && (
                      <CanvaButton size="sm" variant="outline">
                        Deneyi Bitir
                      </CanvaButton>
                    )}
                  </div>
                </CanvaCardBody>
              </CanvaCard>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

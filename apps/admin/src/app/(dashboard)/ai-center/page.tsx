'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Loader2,
  Bot,
  DollarSign,
  MessageSquare,
  FlaskConical,
  LineChart as LineChartIcon,
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
import { Skeleton } from '@/components/ui/skeleton';
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
  AreaChart,
  Area,
} from 'recharts';
import { formatDate } from '@/lib/utils';
import aiServiceAdmin, {
  type AIModelStats,
  type ModerationStats,
  type ChurnPrediction,
  type LTVPrediction,
  type Anomaly,
  type ContentQualityData,
  type ContentDistribution,
  type ABExperiment,
  type CategoryTrend,
} from '@/lib/ai-service';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

// Model icon mapping
const modelIcons: Record<string, React.ElementType> = {
  proof_verification: CheckCircle,
  price_prediction: DollarSign,
  turkish_nlp: MessageSquare,
  recommendation_engine: Target,
  chatbot: Bot,
  fraud_detection: AlertTriangle,
  forecasting: LineChartIcon,
};

export default function AICenterPage() {
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [models, setModels] = useState<AIModelStats[]>([]);
  const [moderationStats, setModerationStats] =
    useState<ModerationStats | null>(null);
  const [churnPredictions, setChurnPredictions] = useState<ChurnPrediction[]>(
    [],
  );
  const [ltvPredictions, setLtvPredictions] = useState<LTVPrediction[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [qualityTrend, setQualityTrend] = useState<ContentQualityData[]>([]);
  const [contentDistribution, setContentDistribution] = useState<
    ContentDistribution[]
  >([]);
  const [experiments, setExperiments] = useState<ABExperiment[]>([]);
  const [categoryTrends, setCategoryTrends] = useState<CategoryTrend[]>([]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const [
        modelsData,
        statsData,
        churnData,
        ltvData,
        anomaliesData,
        qualityData,
        distributionData,
        experimentsData,
        trendsData,
      ] = await Promise.all([
        aiServiceAdmin.getModelStats(),
        aiServiceAdmin.getModerationStats(),
        aiServiceAdmin.getChurnPredictions(),
        aiServiceAdmin.getLTVPredictions(),
        aiServiceAdmin.getAnomalies(),
        aiServiceAdmin.getContentQualityTrend(),
        aiServiceAdmin.getContentDistribution(),
        aiServiceAdmin.getExperiments(),
        aiServiceAdmin.getCategoryTrends(),
      ]);

      setModels(modelsData);
      setModerationStats(statsData);
      setChurnPredictions(churnData);
      setLtvPredictions(ltvData);
      setAnomalies(anomaliesData);
      setQualityTrend(qualityData);
      setContentDistribution(distributionData);
      setExperiments(experimentsData);
      setCategoryTrends(trendsData);
    } catch (error) {
      logger.error('Failed to fetch AI data:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    }
  }, []);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchData();
      setIsLoading(false);
    };
    load();
  }, [fetchData]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    toast.success('Veriler güncellendi');
  };

  // Toggle model status
  const handleToggleModel = async (modelId: string, active: boolean) => {
    try {
      await aiServiceAdmin.toggleModelStatus(modelId, active);
      setModels((prev) =>
        prev.map((m) =>
          m.id === modelId
            ? { ...m, status: active ? 'active' : 'inactive' }
            : m,
        ),
      );
      toast.success(`Model ${active ? 'aktif' : 'pasif'} edildi`);
    } catch {
      toast.error('Model durumu değiştirilemedi');
    }
  };

  // Resolve anomaly
  const handleResolveAnomaly = async (anomalyId: string) => {
    try {
      await aiServiceAdmin.resolveAnomaly(anomalyId);
      setAnomalies((prev) => prev.filter((a) => a.id !== anomalyId));
      toast.success('Anomali çözüldü olarak işaretlendi');
    } catch {
      toast.error('Anomali çözülemedi');
    }
  };

  // Helper functions
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
      { variant: 'default' | 'secondary' | 'destructive' }
    > = {
      high: { variant: 'destructive' },
      medium: { variant: 'secondary' },
      low: { variant: 'default' },
    };
    const { variant } = variants[risk] || { variant: 'default' };
    return (
      <Badge variant={variant}>
        {risk === 'high' ? 'Yüksek' : risk === 'medium' ? 'Orta' : 'Düşük'}
      </Badge>
    );
  };

  const getTrendBadge = (trend: string) => {
    if (trend === 'rising' || trend === 'up') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <TrendingUp className="mr-1 h-3 w-3" />
          Yükseliyor
        </Badge>
      );
    }
    if (trend === 'falling' || trend === 'down') {
      return (
        <Badge variant="destructive">
          <TrendingDown className="mr-1 h-3 w-3" />
          Düşüyor
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Activity className="mr-1 h-3 w-3" />
        Sabit
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Yenile
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Model Ayarları
          </Button>
        </div>
      </div>

      {/* Proof Verification Stats */}
      {moderationStats && (
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
                    %{moderationStats.accuracy.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">Doğruluk</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
          <TabsTrigger value="experiments">
            <FlaskConical className="mr-2 h-4 w-4" />
            A/B Testler
          </TabsTrigger>
          <TabsTrigger value="trends">
            <LineChartIcon className="mr-2 h-4 w-4" />
            Trendler
          </TabsTrigger>
          <TabsTrigger value="quality">
            <BarChart3 className="mr-2 h-4 w-4" />
            Kanıt Kalitesi
          </TabsTrigger>
        </TabsList>

        {/* AI Models Tab */}
        <TabsContent value="models" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {models.map((model) => {
              const IconComponent = modelIcons[model.id] || Brain;
              return (
                <Card key={model.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-base">
                          {model.name}
                        </CardTitle>
                      </div>
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
                        <span className="font-medium">
                          %{model.accuracy.toFixed(1)}
                        </span>
                      </div>
                      <Progress value={model.accuracy} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Bugün</span>
                        <p className="font-medium">
                          {model.processedToday.toLocaleString('tr-TR')}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Latency</span>
                        <p className="font-medium">{model.avgLatencyMs}ms</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Hata Oranı</span>
                      <span
                        className={
                          model.errorRate > 0.05
                            ? 'text-red-500'
                            : 'text-green-500'
                        }
                      >
                        %{(model.errorRate * 100).toFixed(2)}
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

                    <div className="flex items-center justify-between border-t pt-4">
                      <Label htmlFor={`model-${model.id}`} className="text-sm">
                        Model Aktif
                      </Label>
                      <Switch
                        id={`model-${model.id}`}
                        checked={model.status === 'active'}
                        onCheckedChange={(checked) =>
                          handleToggleModel(model.id, checked)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
                        {prediction.suggestedAction}
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
                        <p className="font-semibold">
                          ₺{segment.avgLTV.toLocaleString('tr-TR')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ort. LTV
                        </p>
                      </div>
                      {getTrendBadge(segment.trend)}
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
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Yenile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {anomalies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
                  <p>Aktif anomali bulunmuyor</p>
                </div>
              ) : (
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
                              Tespit: {formatDate(anomaly.detectedAt)}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveAnomaly(anomaly.id)}
                        >
                          Çözüldü
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Experiments Tab */}
        <TabsContent value="experiments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>A/B Test Yönetimi</CardTitle>
                  <CardDescription>
                    Aktif ve tamamlanmış deneyler
                  </CardDescription>
                </div>
                <Button>
                  <FlaskConical className="mr-2 h-4 w-4" />
                  Yeni Deney
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {experiments.map((exp) => (
                  <div key={exp.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{exp.name}</p>
                          <Badge
                            variant={
                              exp.status === 'running'
                                ? 'default'
                                : exp.status === 'completed'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {exp.status === 'running'
                              ? 'Çalışıyor'
                              : exp.status === 'completed'
                                ? 'Tamamlandı'
                                : 'Taslak'}
                          </Badge>
                        </div>
                        {exp.statisticalSignificance && (
                          <p className="text-sm text-muted-foreground mt-1">
                            İstatistiksel anlamlılık: %
                            {exp.statisticalSignificance.toFixed(1)}
                          </p>
                        )}
                      </div>
                      {exp.winner && (
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800"
                        >
                          Kazanan: {exp.winner}
                        </Badge>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      {exp.variants.map((variant, i) => (
                        <div
                          key={i}
                          className={`rounded-lg border p-3 ${
                            exp.winner === variant.name
                              ? 'border-green-500 bg-green-50'
                              : ''
                          }`}
                        >
                          <p className="font-medium">{variant.name}</p>
                          <div className="mt-2 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Trafik:
                              </span>
                              <span>%{variant.traffic}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Dönüşüm:
                              </span>
                              <span>
                                {variant.conversions.toLocaleString('tr-TR')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Oran:
                              </span>
                              <span className="font-medium">
                                %{variant.conversionRate.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Kategori Trendleri</CardTitle>
                <CardDescription>
                  Popüler hediye kategorileri ve değişimler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryTrends.map((trend, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{trend.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {trend.volume.toLocaleString('tr-TR')} hediye
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            trend.changePercent > 0
                              ? 'text-green-500'
                              : trend.changePercent < 0
                                ? 'text-red-500'
                                : ''
                          }
                        >
                          {trend.changePercent > 0 ? '+' : ''}
                          {trend.changePercent}%
                        </span>
                        {getTrendBadge(trend.trend)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Talep Tahmini</CardTitle>
                <CardDescription>
                  Önümüzdeki 7 günlük hediye talebi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={qualityTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stroke="#8b5cf6"
                        fill="#8b5cf680"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
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
                    <LineChart data={qualityTrend}>
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

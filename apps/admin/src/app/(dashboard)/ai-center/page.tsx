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
import { CanvaButton } from '@/components/canva/CanvaButton';
import { CanvaInput } from '@/components/canva/CanvaInput';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
  CanvaCardBody,
  CanvaStatCard,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';
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
        variant: 'primary' | 'default' | 'error' | 'info' | 'warning';
        label: string;
      }
    > = {
      critical: { variant: 'error', label: 'Kritik' },
      warning: { variant: 'warning', label: 'Uyarı' },
      info: { variant: 'info', label: 'Bilgi' },
    };
    const { variant, label } = variants[severity] || {
      variant: 'info',
      label: severity,
    };
    return <CanvaBadge variant={variant}>{label}</CanvaBadge>;
  };

  const getRiskBadge = (risk: string) => {
    const variants: Record<
      string,
      { variant: 'primary' | 'default' | 'error' }
    > = {
      high: { variant: 'error' },
      medium: { variant: 'default' },
      low: { variant: 'primary' },
    };
    const { variant } = variants[risk] || { variant: 'primary' };
    return (
      <CanvaBadge variant={variant}>
        {risk === 'high' ? 'Yüksek' : risk === 'medium' ? 'Orta' : 'Düşük'}
      </CanvaBadge>
    );
  };

  const getTrendBadge = (trend: string) => {
    if (trend === 'rising' || trend === 'up') {
      return (
        <CanvaBadge variant="primary" className="bg-green-100 text-green-800">
          <TrendingUp className="mr-1 h-3 w-3" />
          Yükseliyor
        </CanvaBadge>
      );
    }
    if (trend === 'falling' || trend === 'down') {
      return (
        <CanvaBadge variant="error">
          <TrendingDown className="mr-1 h-3 w-3" />
          Düşüyor
        </CanvaBadge>
      );
    }
    return (
      <CanvaBadge variant="primary">
        <Activity className="mr-1 h-3 w-3" />
        Sabit
      </CanvaBadge>
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
          <CanvaButton
            variant="primary"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Yenile
          </CanvaButton>
          <CanvaButton variant="primary">
            <Settings className="mr-2 h-4 w-4" />
            Model Ayarları
          </CanvaButton>
        </div>
      </div>

      {/* Proof Verification Stats */}
      {moderationStats && (
        <div className="grid gap-4 md:grid-cols-5">
          <CanvaStatCard
            title="Toplam Kanıt"
            value={moderationStats.totalProcessed.toLocaleString('tr-TR')}
            icon={Brain}
            color="blue"
          />
          <CanvaStatCard
            title="Doğrulanan"
            value={moderationStats.proofsVerified.toLocaleString('tr-TR')}
            icon={CheckCircle}
            color="green"
          />
          <CanvaStatCard
            title="Reddedilen"
            value={moderationStats.proofsRejected.toLocaleString('tr-TR')}
            icon={XCircle}
            color="red"
          />
          <CanvaStatCard
            title="İnceleme Bekliyor"
            value={moderationStats.pendingReview.toLocaleString('tr-TR')}
            icon={Eye}
            color="yellow"
          />
          <CanvaStatCard
            title="Doğruluk"
            value={`%${moderationStats.accuracy.toFixed(1)}`}
            icon={Target}
            color="purple"
          />
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
                <CanvaCard key={model.id}>
                  <CanvaCardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <CanvaCardTitle className="text-base">
                          {model.name}
                        </CanvaCardTitle>
                      </div>
                      <CanvaBadge
                        variant={
                          model.status === 'active' ? 'primary' : 'default'
                        }
                      >
                        {model.status === 'active' ? 'Aktif' : 'Pasif'}
                      </CanvaBadge>
                    </div>
                  </CanvaCardHeader>
                  <CanvaCardBody className="space-y-4">
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
                  </CanvaCardBody>
                </CanvaCard>
              );
            })}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          {/* Churn Predictions */}
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Churn Risk Tahminleri</CanvaCardTitle>
              <CanvaCardSubtitle>
                Ayrılma riski yüksek kullanıcılar ve önerilen aksiyonlar
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
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
                            <CanvaBadge
                              key={i}
                              variant="primary"
                              className="text-xs"
                            >
                              {factor}
                            </CanvaBadge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-2">
                        Önerilen Aksiyon
                      </p>
                      <CanvaButton size="sm" variant="primary">
                        <Zap className="mr-2 h-4 w-4" />
                        {prediction.suggestedAction}
                      </CanvaButton>
                    </div>
                  </div>
                ))}
              </div>
            </CanvaCardBody>
          </CanvaCard>

          {/* LTV Predictions */}
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>LTV Tahminleri</CanvaCardTitle>
              <CanvaCardSubtitle>
                Segment bazlı yaşam boyu değer tahminleri
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
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
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CanvaCardTitle>Anomali Tespiti</CanvaCardTitle>
                  <CanvaCardSubtitle>
                    Olağandışı davranışlar ve sistem uyarıları
                  </CanvaCardSubtitle>
                </div>
                <CanvaButton
                  variant="primary"
                  size="sm"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Yenile
                </CanvaButton>
              </div>
            </CanvaCardHeader>
            <CanvaCardBody>
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
                        <CanvaButton
                          size="sm"
                          variant="primary"
                          onClick={() => handleResolveAnomaly(anomaly.id)}
                        >
                          Çözüldü
                        </CanvaButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* A/B Experiments Tab */}
        <TabsContent value="experiments" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CanvaCardTitle>A/B Test Yönetimi</CanvaCardTitle>
                  <CanvaCardSubtitle>
                    Aktif ve tamamlanmış deneyler
                  </CanvaCardSubtitle>
                </div>
                <CanvaButton>
                  <FlaskConical className="mr-2 h-4 w-4" />
                  Yeni Deney
                </CanvaButton>
              </div>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="space-y-6">
                {experiments.map((exp) => (
                  <div key={exp.id} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{exp.name}</p>
                          <CanvaBadge
                            variant={
                              exp.status === 'running'
                                ? 'primary'
                                : exp.status === 'completed'
                                  ? 'default'
                                  : 'info'
                            }
                          >
                            {exp.status === 'running'
                              ? 'Çalışıyor'
                              : exp.status === 'completed'
                                ? 'Tamamlandı'
                                : 'Taslak'}
                          </CanvaBadge>
                        </div>
                        {exp.statisticalSignificance && (
                          <p className="text-sm text-muted-foreground mt-1">
                            İstatistiksel anlamlılık: %
                            {exp.statisticalSignificance.toFixed(1)}
                          </p>
                        )}
                      </div>
                      {exp.winner && (
                        <CanvaBadge
                          variant="primary"
                          className="bg-green-100 text-green-800"
                        >
                          Kazanan: {exp.winner}
                        </CanvaBadge>
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
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Kategori Trendleri</CanvaCardTitle>
                <CanvaCardSubtitle>
                  Popüler hediye kategorileri ve değişimler
                </CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
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
              </CanvaCardBody>
            </CanvaCard>

            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Talep Tahmini</CanvaCardTitle>
                <CanvaCardSubtitle>
                  Önümüzdeki 7 günlük hediye talebi
                </CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
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
              </CanvaCardBody>
            </CanvaCard>
          </div>
        </TabsContent>

        {/* Content Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Quality Trend */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Kanıt Doğruluk Trendi</CanvaCardTitle>
                <CanvaCardSubtitle>
                  Son 7 günlük ortalama doğrulama skoru
                </CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
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
              </CanvaCardBody>
            </CanvaCard>

            {/* Content Distribution */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Kanıt Doğrulama Dağılımı</CanvaCardTitle>
                <CanvaCardSubtitle>AI doğrulama sonuçları</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          contentDistribution as unknown as Record<
                            string,
                            unknown
                          >[]
                        }
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
              </CanvaCardBody>
            </CanvaCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

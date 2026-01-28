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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

// Environment banner component
function EnvironmentBanner() {
  const env = process.env.NEXT_PUBLIC_APP_ENV || 'production';
  const isProd = env === 'production';

  if (isProd) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-center text-sm font-medium ${
        env === 'staging'
          ? 'bg-yellow-500 text-yellow-950'
          : 'bg-red-500 text-white'
      }`}
    >
      {env === 'staging' ? (
        <>
          <AlertTriangle className="inline-block h-4 w-4 mr-2" />
          STAGING ENVIRONMENT - Test verisi kullanılıyor
        </>
      ) : (
        <>
          <AlertTriangle className="inline-block h-4 w-4 mr-2" />
          DEVELOPMENT ENVIRONMENT - Canlı veri yok
        </>
      )}
    </div>
  );
}

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

  // Confirmation dialog state for model toggles
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    model: AIModelStats | null;
    targetStatus: 'active' | 'inactive' | null;
  }>({
    open: false,
    model: null,
    targetStatus: null,
  });

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

  // Request confirmation for model toggle
  const requestModelToggle = (
    model: AIModelStats,
    targetStatus: 'active' | 'inactive',
  ) => {
    setConfirmDialog({ open: true, model, targetStatus });
  };

  // Execute confirmed model toggle
  const executeModelToggle = async () => {
    if (!confirmDialog.model || !confirmDialog.targetStatus) return;

    const modelId = confirmDialog.model.id;
    const active = confirmDialog.targetStatus === 'active';

    try {
      // Log AI decision for audit
      await aiServiceAdmin.logAIDecision({
        model_id: modelId,
        action: 'model_toggle',
        previous_status: confirmDialog.model.status,
        new_status: active ? 'active' : 'inactive',
        timestamp: new Date().toISOString(),
      });

      await aiServiceAdmin.toggleModelStatus(modelId, active);
      setModels((prev) =>
        prev.map((m) =>
          m.id === modelId
            ? { ...m, status: active ? 'active' : 'inactive' }
            : m,
        ),
      );
      toast.success(
        `Model ${active ? 'aktif' : 'pasif'} edildi - ${confirmDialog.model.name}`,
      );
    } catch {
      toast.error('Model durumu değiştirilemedi');
    } finally {
      setConfirmDialog({ open: false, model: null, targetStatus: null });
    }
  };

  // Toggle model status
  const handleToggleModel = (modelId: string, active: boolean) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) return;

    // Request confirmation before toggling
    requestModelToggle(model, active ? 'active' : 'inactive');
  };

  // Resolve anomaly
  const handleResolveAnomaly = async (anomalyId: string) => {
    try {
      await aiServiceAdmin.resolveAnomaly(anomalyId);
      setAnomalies((prev) => prev.filter((a) => a.id !== anomalyId));
      toast.success('Anomali çözüldü');
    } catch {
      toast.error('Anomali çözülemedi');
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<
      string,
      { variant: 'error' | 'warning' | 'info' | 'success'; label: string }
    > = {
      critical: { variant: 'error', label: 'Kritik' },
      high: { variant: 'error', label: 'Yüksek' },
      medium: { variant: 'warning', label: 'Orta' },
      low: { variant: 'info', label: 'Düşük' },
      resolved: { variant: 'success', label: 'Çözüldü' },
    };
    const { variant, label } = variants[severity] || {
      variant: 'info' as const,
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
        <CanvaBadge variant="success">
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
        <EnvironmentBanner />
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
      <EnvironmentBanner />

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
            label="Toplam Kanıt"
            value={moderationStats.totalProcessed.toLocaleString('tr-TR')}
            icon={<Brain className="h-4 w-4" />}
          />
          <CanvaStatCard
            label="Doğrulanan"
            value={moderationStats.proofsVerified.toLocaleString('tr-TR')}
            icon={<CheckCircle className="h-4 w-4" />}
          />
          <CanvaStatCard
            label="Reddedilen"
            value={moderationStats.proofsRejected.toLocaleString('tr-TR')}
            icon={<XCircle className="h-4 w-4" />}
          />
          <CanvaStatCard
            label="İnceleme Bekliyor"
            value={moderationStats.pendingReview.toLocaleString('tr-TR')}
            icon={<Eye className="h-4 w-4" />}
          />
          <CanvaStatCard
            label="Doğruluk"
            value={`%${moderationStats.accuracy.toFixed(1)}`}
            icon={<Target className="h-4 w-4" />}
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
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-green-500 dark:text-green-400'
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
              <CanvaCardTitle>Churn Tahminleri</CanvaCardTitle>
              <CanvaCardSubtitle>
                Ayrılma riski yüksek kullanıcılar
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="space-y-3">
                {churnPredictions.slice(0, 5).map((prediction) => (
                  <div
                    key={prediction.userId}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{prediction.userId}</p>
                        <p className="text-sm text-muted-foreground">
                          Son aktivite:{' '}
                          {formatDate(
                            prediction.lastActive || prediction.predictedAt,
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {(prediction.probability * 100).toFixed(0)}%
                      </span>
                      {getRiskBadge(prediction.riskLevel || prediction.risk)}
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
                Müşteri yaşam boyu değer tahminleri
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">
                    ${ltvPredictions[0]?.predictedLTV?.toFixed(0) || '0'}
                  </p>
                  <p className="text-sm text-muted-foreground">Ortalama LTV</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">
                    {ltvPredictions[0]?.confidenceLevel || 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Güven Seviyesi
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-2xl font-bold">
                    {ltvPredictions[0]?.predictedMonths || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tahmin Edilen Ay
                  </p>
                </div>
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Tespit Edilen Anomaliler</CanvaCardTitle>
              <CanvaCardSubtitle>
                AI tarafından tespit edilen anormal davranışlar
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              {anomalies.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Anomali tespit edilmedi
                </p>
              ) : (
                <div className="space-y-3">
                  {anomalies.map((anomaly) => (
                    <div
                      key={anomaly.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">{anomaly.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(
                              anomaly.timestamp || anomaly.detectedAt,
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(anomaly.severity)}
                        <CanvaButton
                          size="sm"
                          variant="outline"
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

        {/* Experiments Tab */}
        <TabsContent value="experiments" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>A/B Test Sonuçları</CanvaCardTitle>
              <CanvaCardSubtitle>
                Devam eden ve tamamlanan deneyler
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="space-y-3">
                {experiments.map((experiment) => (
                  <div
                    key={experiment.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{experiment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {experiment.description || 'A/B test deneyi'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {experiment.trend
                        ? getTrendBadge(experiment.trend)
                        : null}
                      <CanvaBadge
                        variant={
                          experiment.status === 'running'
                            ? 'success'
                            : 'default'
                        }
                      >
                        {experiment.status === 'running'
                          ? 'Aktif'
                          : 'Tamamlandı'}
                      </CanvaBadge>
                    </div>
                  </div>
                ))}
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Kanıt Kalitesi Trendi</CanvaCardTitle>
              <CanvaCardSubtitle>
                Son 7 gün içinde işlenen kanıtların kalite dağılımı
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={qualityTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString('tr-TR')
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) =>
                        new Date(date).toLocaleDateString('tr-TR')
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="verified"
                      stackId="1"
                      stroke="#22c55e"
                      fill="#22c55e"
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      stackId="1"
                      stroke="#eab308"
                      fill="#eab308"
                    />
                    <Area
                      type="monotone"
                      dataKey="rejected"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>
      </Tabs>

      {/* Model Toggle Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Model Durumu Değişikliği
            </DialogTitle>
            <DialogDescription>
              Bu işlem, platform davranışını önemli ölçüde etkileyebilir.
              {confirmDialog.model && (
                <div className="mt-3 space-y-2">
                  <div className="rounded-lg bg-muted p-3">
                    <span className="font-medium">Model:</span>{' '}
                    {confirmDialog.model.name}
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <span className="font-medium">Mevcut Durum:</span>{' '}
                    {confirmDialog.model.status === 'active'
                      ? 'Aktif'
                      : 'Pasif'}
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <span className="font-medium">Yeni Durum:</span>{' '}
                    {confirmDialog.targetStatus === 'active'
                      ? 'Aktif'
                      : 'Pasif'}
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <CanvaButton
              variant="ghost"
              onClick={() =>
                setConfirmDialog({
                  open: false,
                  model: null,
                  targetStatus: null,
                })
              }
            >
              İptal
            </CanvaButton>
            <CanvaButton
              variant={
                confirmDialog.targetStatus === 'inactive' ? 'danger' : 'primary'
              }
              onClick={executeModelToggle}
            >
              Onayla
            </CanvaButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

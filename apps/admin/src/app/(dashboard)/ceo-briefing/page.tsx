'use client';

/**
 * CEO Morning Briefing Dashboard
 * 5 saniyede şirketin durumunu göster
 * Her sabah 08:00'da email ile de gönderilir
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Users,
  Gift,
  Shield,
  Clock,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Calendar,
  Activity,
  Star,
  AlertCircle,
  ChevronRight,
  Download,
  Mail,
  RefreshCw,
  Flame,
  Crosshair,
  Bot,
  Lock,
} from 'lucide-react';
import { usePermission } from '@/hooks/use-permission';
import { useFounderDecisions } from '@/hooks/use-founder-decisions';
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
import { cn } from '@/lib/utils';
import { exportToCSV, generateExportFilename } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';

// Şirket sağlık skoru hesaplama
const calculateHealthScore = () => {
  const metrics = {
    revenue: { actual: 92, weight: 0.3 },
    growth: { actual: 88, weight: 0.2 },
    retention: { actual: 78, weight: 0.2 },
    safety: { actual: 95, weight: 0.15 },
    ops: { actual: 85, weight: 0.15 },
  };

  return Object.values(metrics).reduce(
    (sum, m) => sum + m.actual * m.weight,
    0,
  );
};

// North Star Metrik
const northStar = {
  name: 'Weekly Active Gifters',
  current: 8420,
  target: 10000,
  lastWeek: 7850,
  trend: 'up',
  percentToGoal: 84.2,
};

// Kritik KPI'lar
const criticalKPIs = [
  {
    name: 'Günlük GMV',
    value: '₺284,500',
    change: 12.5,
    trend: 'up',
    icon: DollarSign,
    status: 'healthy',
  },
  {
    name: 'Aktif Kullanıcı (DAU)',
    value: '45,200',
    change: 8.3,
    trend: 'up',
    icon: Users,
    status: 'healthy',
  },
  {
    name: 'Gift Tamamlanma',
    value: '87.2%',
    change: 2.1,
    trend: 'up',
    icon: Gift,
    status: 'healthy',
  },
  {
    name: 'Fraud Oranı',
    value: '0.32%',
    change: -15.2,
    trend: 'down',
    icon: Shield,
    status: 'healthy',
  },
];

// Acil dikkat gerektiren konular
const attentionItems = [
  {
    severity: 'high',
    title: 'PayTR Gateway Yavaşlama',
    description: 'Ortalama response time 320ms (normal: 85ms)',
    action: 'Engineering takip ediyor',
    time: '45 dk önce',
  },
  {
    severity: 'medium',
    title: '23 Bekleyen KYC Doğrulama',
    description: 'Yüksek değerli işlemler bekliyor',
    action: 'Ops ekibine atandı',
    time: '2 saat önce',
  },
  {
    severity: 'low',
    title: 'iOS App Store Review',
    description: 'v2.4.1 review bekliyor',
    action: 'Tahmini onay: 24 saat',
    time: '1 gün önce',
  },
];

// Haftalık hedefler
const weeklyGoals = [
  { name: 'Yeni Kullanıcı', current: 3420, target: 4000, unit: '' },
  { name: 'GMV', current: 1.85, target: 2.0, unit: 'M ₺' },
  { name: 'NPS Anketi', current: 48, target: 50, unit: '' },
  { name: 'Dispute Resolution', current: 92, target: 95, unit: '%' },
];

// Önemli olaylar
const todayEvents = [
  { time: '10:00', event: 'Haftalık Growth Review', type: 'meeting' },
  { time: '14:00', event: 'PayTR Entegrasyon Call', type: 'call' },
  { time: '16:00', event: 'Board Deck Final Review', type: 'deadline' },
];

// ═══════════════════════════════════════════════════════════════════════════
// FOUNDER-ONLY DATA (super_admin only - görünmez, bilinmez)
// ═══════════════════════════════════════════════════════════════════════════

// 🔥 Bugün SENİN kararın gerekenler (max 3)
const founderDecisions = [
  {
    id: 1,
    priority: 'critical',
    title: '₺180K Escrow: VIP kullanıcı dispute',
    description:
      'Ahmet K. (Premium) 48 saat içinde karar bekliyor. Fraud skoru düşük (%12), muhtemelen iletişim problemi.',
    deadline: 'Bugün 18:00',
    action: 'Onay/Red kararı',
    context: 'Bu kullanıcı 6 aydır aktif, toplam ₺450K GMV üretti.',
  },
  {
    id: 2,
    priority: 'high',
    title: 'Stripe rate artışı teklifi',
    description:
      'Stripe %2.4 → %2.9 teklif etti. Alternatif: iyzico %2.2 (entegrasyon 2 hafta)',
    deadline: 'Yarın COB',
    action: 'Kabul/Reddet/Pazarlık',
    context: 'Aylık ₺85K komisyon farkı yaratır.',
  },
];

// 🎯 Bu haftanın odak alanı
const founderFocus = {
  title: 'Premium Conversion Optimization',
  why: "DAU artıyor ama Premium conversion %9.2'de takılı. Potansiyel aylık ₺120K ek gelir.",
  metrics: [
    { label: 'Hedef', value: '%12 conversion' },
    { label: 'Şu an', value: '%9.27' },
    { label: 'Gap', value: '2,345 kullanıcı' },
  ],
  blockers: ['Pricing page UX zayıf', 'Trial süresi çok kısa (3 gün)'],
  nextAction: 'A/B test başlat: 7 gün trial vs 3 gün',
};

// 🧹 Sistem halletti (otomasyon özeti - son 24 saat)
const systemHandled = [
  {
    type: 'proof',
    count: 47,
    label: 'Proof otomatik onaylandı',
    savings: '~4 saat manuel iş',
  },
  {
    type: 'kyc',
    count: 23,
    label: 'KYC auto-verified',
    savings: '~2 saat manuel iş',
  },
  {
    type: 'fraud',
    count: 3,
    label: 'Fraud attempt blocked',
    savings: '₺12K potansiyel kayıp önlendi',
  },
  {
    type: 'support',
    count: 156,
    label: 'Chatbot çözümledi',
    savings: '~8 saat destek',
  },
  {
    type: 'dispute',
    count: 8,
    label: 'Auto-resolved (düşük risk)',
    savings: '~1 saat',
  },
];

export default function CEOBriefingPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isSending, setIsSending] = useState(false);
  const healthScore = calculateHealthScore();
  const { toast } = useToast();
  const { isSuperAdmin } = usePermission();

  // Founder Decision Loop
  const {
    isEnabled: isDecisionLoopEnabled,
    markAsReviewed,
    markAsDeferred,
    setAsFocus,
    isPending: isDecisionPending,
  } = useFounderDecisions();

  // Export briefing data to CSV
  const handleExportCSV = () => {
    try {
      const exportData = [
        {
          Kategori: 'Sağlık Skoru',
          Metrik: 'Şirket Sağlık Skoru',
          Değer: healthScore.toFixed(0),
          Durum:
            healthScore >= 85 ? 'İyi' : healthScore >= 70 ? 'Orta' : 'Kritik',
        },
        {
          Kategori: 'North Star',
          Metrik: northStar.name,
          Değer: northStar.current,
          Durum: `Hedefe ${northStar.percentToGoal}%`,
        },
        ...criticalKPIs.map((kpi) => ({
          Kategori: 'KPI',
          Metrik: kpi.name,
          Değer: kpi.value,
          Durum: `${kpi.change > 0 ? '+' : ''}${kpi.change}%`,
        })),
        ...weeklyGoals.map((goal) => ({
          Kategori: 'Haftalık Hedef',
          Metrik: goal.name,
          Değer: `${goal.current}${goal.unit}`,
          Durum: `Hedef: ${goal.target}${goal.unit}`,
        })),
      ];

      exportToCSV(
        exportData,
        [
          { header: 'Kategori', accessor: 'Kategori' },
          { header: 'Metrik', accessor: 'Metrik' },
          { header: 'Değer', accessor: 'Değer' },
          { header: 'Durum', accessor: 'Durum' },
        ],
        generateExportFilename('ceo-briefing'),
      );

      toast({
        title: 'Rapor indirildi',
        description: 'CEO Briefing raporu başarıyla indirildi.',
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Rapor indirilemedi.',
        variant: 'destructive',
      });
    }
  };

  // Print page as PDF
  const handlePrintPDF = () => {
    window.print();
    toast({
      title: 'PDF Hazırlanıyor',
      description: 'Yazdırma penceresi açıldı. PDF olarak kaydedin.',
    });
  };

  // Send email (mock - requires backend integration)
  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      // In production, this would call an API endpoint to send the email
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        title: 'Rapor gönderildi',
        description: 'CEO Briefing raporu email ile gönderildi.',
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Email gönderilemedi.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 85) return 'text-green-500 dark:text-green-400';
    if (score >= 70) return 'text-yellow-500 dark:text-yellow-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getHealthBg = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Günaydın 👋</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CanvaButton
            variant="ghost"
            size="sm"
            onClick={handleSendEmail}
            disabled={isSending}
          >
            <Mail
              className={cn('h-4 w-4 mr-2', isSending && 'animate-pulse')}
            />
            {isSending ? 'Gönderiliyor...' : 'Raporu Gönder'}
          </CanvaButton>
          <CanvaButton variant="ghost" size="sm" onClick={handlePrintPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF İndir
          </CanvaButton>
          <CanvaButton variant="ghost" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV İndir
          </CanvaButton>
          <CanvaButton
            variant="ghost"
            size="sm"
            onClick={() => setLastUpdated(new Date())}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {lastUpdated.toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </CanvaButton>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          FOUNDER-ONLY SECTION (super_admin only - sidebar'da yok, bilinmez)
          ═══════════════════════════════════════════════════════════════════════ */}
      {isSuperAdmin() && (
        <div className="space-y-4 p-4 rounded-xl bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-4 w-4 text-violet-500" />
            <span className="text-xs font-medium text-violet-500 uppercase tracking-wider">
              Sadece Sen Görüyorsun
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* 🔥 Bugün SENİN Kararın Gerekenler */}
            <CanvaCard className="admin-card border-red-500/30 bg-red-500/5">
              <CanvaCardHeader className="pb-2">
                <CanvaCardTitle className="flex items-center gap-2 text-base">
                  <Flame className="h-4 w-4 text-red-500" />
                  Bugün SENİN Kararın
                </CanvaCardTitle>
                <CanvaCardSubtitle className="text-xs">
                  {founderDecisions.length} karar bekliyor
                </CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody className="space-y-3">
                {founderDecisions.length === 0 ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Temiz! Karar bekleyen yok.
                    </p>
                  </div>
                ) : (
                  founderDecisions.map((decision) => (
                    <div
                      key={decision.id}
                      className={cn(
                        'p-3 rounded-lg border-l-4',
                        decision.priority === 'critical'
                          ? 'bg-red-500/10 border-l-red-500'
                          : 'bg-amber-500/10 border-l-amber-500',
                      )}
                    >
                      <p className="font-medium text-sm">{decision.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {decision.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {decision.deadline}
                        </span>
                        <CanvaBadge variant="default" className="text-xs">
                          {decision.action}
                        </CanvaBadge>
                      </div>
                      {decision.context && (
                        <p className="text-xs text-violet-500 mt-2 italic">
                          {decision.context}
                        </p>
                      )}
                      {/* Decision Loop Actions - Only visible when enabled */}
                      {isDecisionLoopEnabled && (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10">
                          <CanvaButton
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                            disabled={isDecisionPending}
                            onClick={() =>
                              markAsReviewed(
                                'ceo-briefing',
                                'fire',
                                `decision_${decision.id}`,
                              )
                            }
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Reviewed
                          </CanvaButton>
                          <CanvaButton
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                            disabled={isDecisionPending}
                            onClick={() =>
                              markAsDeferred(
                                'ceo-briefing',
                                'fire',
                                `decision_${decision.id}`,
                              )
                            }
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Defer
                          </CanvaButton>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CanvaCardBody>
            </CanvaCard>

            {/* 🎯 Bu Haftanın Odağı */}
            <CanvaCard className="admin-card border-blue-500/30 bg-blue-500/5">
              <CanvaCardHeader className="pb-2">
                <CanvaCardTitle className="flex items-center gap-2 text-base">
                  <Crosshair className="h-4 w-4 text-blue-500" />
                  Bu Hafta Odak
                </CanvaCardTitle>
                <CanvaCardSubtitle className="text-xs">
                  Tek şeye odaklan
                </CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-blue-600 dark:text-blue-400">
                      {founderFocus.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {founderFocus.why}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {founderFocus.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="text-center p-2 rounded bg-muted/50"
                      >
                        <p className="text-xs text-muted-foreground">
                          {m.label}
                        </p>
                        <p className="font-semibold text-sm">{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-500 mb-1">
                      Engelleyiciler:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {founderFocus.blockers.map((b, i) => (
                        <li key={i}>• {b}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-2 rounded bg-green-500/10 border border-green-500/30">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400">
                      → {founderFocus.nextAction}
                    </p>
                  </div>
                  {/* Set as Focus Button - Only visible when decision loop enabled */}
                  {isDecisionLoopEnabled && (
                    <div className="pt-2 border-t border-white/10">
                      <CanvaButton
                        variant="outline"
                        size="sm"
                        className="w-full h-7 text-xs border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                        disabled={isDecisionPending}
                        onClick={() =>
                          setAsFocus(
                            'ceo-briefing',
                            founderFocus.title
                              .toLowerCase()
                              .replace(/\s+/g, '_'),
                          )
                        }
                      >
                        <Crosshair className="h-3 w-3 mr-1" />
                        Bu Hafta Odağım Bu
                      </CanvaButton>
                    </div>
                  )}
                </div>
              </CanvaCardBody>
            </CanvaCard>

            {/* 🧹 Sistem Halletti */}
            <CanvaCard className="admin-card border-emerald-500/30 bg-emerald-500/5">
              <CanvaCardHeader className="pb-2">
                <CanvaCardTitle className="flex items-center gap-2 text-base">
                  <Bot className="h-4 w-4 text-emerald-500" />
                  Sistem Halletti
                </CanvaCardTitle>
                <CanvaCardSubtitle className="text-xs">
                  Son 24 saat otomasyon
                </CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <div className="space-y-2">
                  {systemHandled.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {item.count}
                        </span>
                        <span className="text-xs">{item.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.savings}
                      </span>
                    </div>
                  ))}
                  <div className="mt-3 p-2 rounded bg-emerald-500/20 text-center">
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Toplam ~15 saat manuel iş tasarrufu
                    </p>
                  </div>
                </div>
              </CanvaCardBody>
            </CanvaCard>
          </div>
        </div>
      )}

      {/* Şirket Sağlık Skoru + North Star */}
      <div className="grid grid-cols-3 gap-6">
        {/* Health Score */}
        <CanvaCard className="admin-card col-span-1 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CanvaCardBody className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Şirket Sağlık Skoru
            </p>
            <div className="relative inline-flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-muted/20"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${healthScore * 3.52} 352`}
                  className={getHealthColor(healthScore)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={cn(
                    'text-4xl font-bold',
                    getHealthColor(healthScore),
                  )}
                >
                  {healthScore.toFixed(0)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
              <span className="text-sm">Tüm sistemler operasyonel</span>
            </div>
          </CanvaCardBody>
        </CanvaCard>

        {/* North Star Metric */}
        <CanvaCard className="admin-card col-span-2">
          <CanvaCardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              <CanvaCardTitle>North Star: {northStar.name}</CanvaCardTitle>
            </div>
            <CanvaCardSubtitle>
              Haftalık hedef: {northStar.target.toLocaleString()}
            </CanvaCardSubtitle>
          </CanvaCardHeader>
          <CanvaCardBody>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-5xl font-bold">
                  {northStar.current.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {northStar.trend === 'up' ? (
                    <CanvaBadge className="bg-green-500/10 dark:bg-green-500/20 text-green-500 dark:text-green-400">
                      <ArrowUpRight className="h-3 w-3 mr-1" />+
                      {(
                        ((northStar.current - northStar.lastWeek) /
                          northStar.lastWeek) *
                        100
                      ).toFixed(1)}
                      %
                    </CanvaBadge>
                  ) : (
                    <CanvaBadge className="bg-red-500/10 dark:bg-red-500/20 text-red-500 dark:text-red-400">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      Düşüş
                    </CanvaBadge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    vs geçen hafta
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Hedefe ilerleme</span>
                  <span className="font-medium">
                    {northStar.percentToGoal}%
                  </span>
                </div>
                <Progress value={northStar.percentToGoal} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  Hedefe {northStar.target - northStar.current} kaldı
                </p>
              </div>
            </div>
          </CanvaCardBody>
        </CanvaCard>
      </div>

      {/* Kritik KPI'lar */}
      <div className="grid grid-cols-4 gap-4">
        {criticalKPIs.map((kpi) => (
          <CanvaCard key={kpi.name} className="admin-card">
            <CanvaCardBody className="p-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className="h-5 w-5 text-muted-foreground" />
                <CanvaBadge
                  variant="default"
                  className={cn(
                    kpi.trend === 'up' && kpi.name !== 'Fraud Oranı'
                      ? 'text-green-500 dark:text-green-400 bg-green-500/10 dark:bg-green-500/20'
                      : kpi.trend === 'down' && kpi.name === 'Fraud Oranı'
                        ? 'text-green-500 dark:text-green-400 bg-green-500/10 dark:bg-green-500/20'
                        : 'text-red-500 dark:text-red-400 bg-red-500/10 dark:bg-red-500/20',
                  )}
                >
                  {kpi.trend === 'up' ? '+' : ''}
                  {kpi.change}%
                </CanvaBadge>
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.name}</p>
            </CanvaCardBody>
          </CanvaCard>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Acil Dikkat */}
        <CanvaCard className="admin-card col-span-2">
          <CanvaCardHeader>
            <div className="flex items-center justify-between">
              <CanvaCardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Dikkat Gerektiren Konular
              </CanvaCardTitle>
              <CanvaBadge variant="default">
                {attentionItems.length} aktif
              </CanvaBadge>
            </div>
          </CanvaCardHeader>
          <CanvaCardBody className="space-y-3">
            {attentionItems.map((item, i) => (
              <div
                key={i}
                className={cn(
                  'p-3 rounded-lg border-l-4 flex items-start justify-between',
                  item.severity === 'high'
                    ? 'bg-red-500/5 dark:bg-red-500/10 border-l-red-500'
                    : item.severity === 'medium'
                      ? 'bg-yellow-500/5 dark:bg-yellow-500/10 border-l-yellow-500'
                      : 'bg-blue-500/5 dark:bg-blue-500/10 border-l-blue-500',
                )}
              >
                <div className="flex items-start gap-3">
                  {item.severity === 'high' ? (
                    <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5" />
                  ) : item.severity === 'medium' ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mt-0.5" />
                  ) : (
                    <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.action} • {item.time}
                    </p>
                  </div>
                </div>
                <CanvaButton variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </CanvaButton>
              </div>
            ))}
          </CanvaCardBody>
        </CanvaCard>

        {/* Bugünün Takvimi */}
        <CanvaCard className="admin-card">
          <CanvaCardHeader>
            <CanvaCardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Bugün
            </CanvaCardTitle>
          </CanvaCardHeader>
          <CanvaCardBody className="space-y-3">
            {todayEvents.map((event, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
              >
                <span className="text-sm font-mono font-medium w-12">
                  {event.time}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.event}</p>
                </div>
              </div>
            ))}
          </CanvaCardBody>
        </CanvaCard>
      </div>

      {/* Haftalık Hedefler */}
      <CanvaCard className="admin-card">
        <CanvaCardHeader>
          <CanvaCardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Bu Hafta Hedefler
          </CanvaCardTitle>
        </CanvaCardHeader>
        <CanvaCardBody>
          <div className="grid grid-cols-4 gap-6">
            {weeklyGoals.map((goal) => (
              <div key={goal.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{goal.name}</span>
                  <span className="font-medium">
                    {goal.current}
                    {goal.unit} / {goal.target}
                    {goal.unit}
                  </span>
                </div>
                <Progress
                  value={(goal.current / goal.target) * 100}
                  className={cn(
                    'h-2',
                    goal.current / goal.target >= 0.9
                      ? '[&>div]:bg-green-500'
                      : goal.current / goal.target >= 0.7
                        ? '[&>div]:bg-yellow-500'
                        : '[&>div]:bg-red-500',
                  )}
                />
              </div>
            ))}
          </div>
        </CanvaCardBody>
      </CanvaCard>

      {/* Quick Links */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Escrow Dashboard',
            href: '/escrow-operations',
            icon: DollarSign,
            count: 245,
          },
          {
            label: 'Proof Queue',
            href: '/proof-center',
            icon: CheckCircle2,
            count: 47,
          },
          {
            label: 'Safety Alerts',
            href: '/safety-hub',
            icon: Shield,
            count: 12,
          },
          {
            label: 'System Health',
            href: '/system-health',
            icon: Activity,
            count: null,
          },
        ].map((link) => (
          <Link key={link.label} href={link.href}>
            <CanvaCard className="admin-card hover:border-primary/50 cursor-pointer transition-colors h-full">
              <CanvaCardBody className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <link.icon className="h-5 w-5 text-primary" />
                  <span className="font-medium">{link.label}</span>
                </div>
                {link.count !== null && (
                  <CanvaBadge variant="default">{link.count}</CanvaBadge>
                )}
              </CanvaCardBody>
            </CanvaCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

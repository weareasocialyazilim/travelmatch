'use client';

/**
 * CEO Morning Briefing Dashboard
 * 5 saniyede şirketin durumunu göster
 * Her sabah 08:00'da email ile de gönderilir
 */

import { useState, useEffect } from 'react';
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
  BarChart3,
  Activity,
  Star,
  AlertCircle,
  ChevronRight,
  Download,
  Mail,
  RefreshCw,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

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

export default function CEOBriefingPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const healthScore = calculateHealthScore();

  const getHealthColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
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
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Raporu Gönder
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF İndir
          </Button>
          <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {lastUpdated.toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Button>
        </div>
      </div>

      {/* Şirket Sağlık Skoru + North Star */}
      <div className="grid grid-cols-3 gap-6">
        {/* Health Score */}
        <Card className="admin-card col-span-1 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 text-center">
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
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">Tüm sistemler operasyonel</span>
            </div>
          </CardContent>
        </Card>

        {/* North Star Metric */}
        <Card className="admin-card col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <CardTitle>North Star: {northStar.name}</CardTitle>
            </div>
            <CardDescription>
              Haftalık hedef: {northStar.target.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-5xl font-bold">
                  {northStar.current.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {northStar.trend === 'up' ? (
                    <Badge className="bg-green-500/10 text-green-500">
                      <ArrowUpRight className="h-3 w-3 mr-1" />+
                      {(
                        ((northStar.current - northStar.lastWeek) /
                          northStar.lastWeek) *
                        100
                      ).toFixed(1)}
                      %
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/10 text-red-500">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      Düşüş
                    </Badge>
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
          </CardContent>
        </Card>
      </div>

      {/* Kritik KPI'lar */}
      <div className="grid grid-cols-4 gap-4">
        {criticalKPIs.map((kpi) => (
          <Card key={kpi.name} className="admin-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className="h-5 w-5 text-muted-foreground" />
                <Badge
                  variant="outline"
                  className={cn(
                    kpi.trend === 'up' && kpi.name !== 'Fraud Oranı'
                      ? 'text-green-500 bg-green-500/10'
                      : kpi.trend === 'down' && kpi.name === 'Fraud Oranı'
                        ? 'text-green-500 bg-green-500/10'
                        : 'text-red-500 bg-red-500/10',
                  )}
                >
                  {kpi.trend === 'up' ? '+' : ''}
                  {kpi.change}%
                </Badge>
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Acil Dikkat */}
        <Card className="admin-card col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Dikkat Gerektiren Konular
              </CardTitle>
              <Badge variant="outline">{attentionItems.length} aktif</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {attentionItems.map((item, i) => (
              <div
                key={i}
                className={cn(
                  'p-3 rounded-lg border-l-4 flex items-start justify-between',
                  item.severity === 'high'
                    ? 'bg-red-500/5 border-l-red-500'
                    : item.severity === 'medium'
                      ? 'bg-yellow-500/5 border-l-yellow-500'
                      : 'bg-blue-500/5 border-l-blue-500',
                )}
              >
                <div className="flex items-start gap-3">
                  {item.severity === 'high' ? (
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  ) : item.severity === 'medium' ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  ) : (
                    <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
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
                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Bugünün Takvimi */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Bugün
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
        </Card>
      </div>

      {/* Haftalık Hedefler */}
      <Card className="admin-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Bu Hafta Hedefler
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

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
          <Card
            key={link.label}
            className="admin-card hover:border-primary/50 cursor-pointer transition-colors"
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <link.icon className="h-5 w-5 text-primary" />
                <span className="font-medium">{link.label}</span>
              </div>
              {link.count !== null && (
                <Badge variant="secondary">{link.count}</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

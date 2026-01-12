'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  MessageSquare,
  Heart,
  Camera,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  Server,
  Database,
  Globe,
  RefreshCw,
  Circle,
  ArrowUp,
  ArrowDown,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate } from '@/lib/utils';

// Mock real-time data
const systemHealth = {
  api: { status: 'healthy', latency: 45, uptime: 99.98 },
  database: { status: 'healthy', latency: 12, connections: 45 },
  cache: { status: 'healthy', hitRate: 94.2, memory: 68 },
  storage: { status: 'healthy', usage: 72, bandwidth: '1.2 GB/s' },
  cdn: { status: 'healthy', latency: 8, regions: 12 },
};

const realtimeMetrics = {
  activeUsers: 3247,
  activeUsersChange: 12.5,
  messagesPerMinute: 456,
  matchesPerMinute: 23,
  momentsPerMinute: 8,
  paymentsPerMinute: 4,
};

// Simulate activity feed
const generateActivity = () => {
  const types = [
    {
      type: 'user_signup',
      icon: Users,
      message: 'Yeni kullanıcı kaydı',
      color: 'text-blue-500',
    },
    {
      type: 'match',
      icon: Heart,
      message: 'Yeni eşleşme',
      color: 'text-pink-500',
    },
    {
      type: 'moment',
      icon: Camera,
      message: 'Yeni moment paylaşıldı',
      color: 'text-purple-500',
    },
    {
      type: 'message',
      icon: MessageSquare,
      message: 'Mesaj gönderildi',
      color: 'text-green-500',
    },
    {
      type: 'payment',
      icon: CreditCard,
      message: 'Ödeme alındı',
      color: 'text-emerald-500',
    },
    {
      type: 'report',
      icon: AlertTriangle,
      message: 'Şikayet oluşturuldu',
      color: 'text-orange-500',
    },
  ];
  const randomType = types[Math.floor(Math.random() * types.length)];
  return {
    id: Math.random().toString(36).substr(2, 9),
    ...randomType,
    timestamp: new Date().toISOString(),
    details: `User #${Math.floor(Math.random() * 10000)}`,
  };
};

export default function OpsCenterPage() {
  const [activities, setActivities] = useState<
    ReturnType<typeof generateActivity>[]
  >([]);
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time activity feed
  useEffect(() => {
    if (!isLive) return;

    const initialActivities = Array.from({ length: 20 }, generateActivity);
    setActivities(initialActivities);

    const interval = setInterval(() => {
      setActivities((prev) => {
        const newActivity = generateActivity();
        return [newActivity, ...prev.slice(0, 49)];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Operasyon Merkezi
          </h1>
          <p className="text-muted-foreground">
            Canlı sistem durumu ve aktivite akışı
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CanvaButton
            variant={isLive ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            <Circle
              className={`mr-2 h-2 w-2 ${isLive ? 'fill-red-500 text-red-500 animate-pulse' : 'fill-gray-500 text-gray-500'}`}
            />
            {isLive ? 'Canlı' : 'Duraklatıldı'}
          </CanvaButton>
          <CanvaButton variant="primary" size="sm" iconOnly>
            <RefreshCw className="h-4 w-4" />
          </CanvaButton>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Kullanıcı</p>
                <p className="text-2xl font-bold">
                  {realtimeMetrics.activeUsers.toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
              <ArrowUp className="h-4 w-4" />
              {realtimeMetrics.activeUsersChange}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mesaj/dk</p>
                <p className="text-2xl font-bold">
                  {realtimeMetrics.messagesPerMinute}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eşleşme/dk</p>
                <p className="text-2xl font-bold">
                  {realtimeMetrics.matchesPerMinute}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
                <Heart className="h-5 w-5 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Moment/dk</p>
                <p className="text-2xl font-bold">
                  {realtimeMetrics.momentsPerMinute}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Camera className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ödeme/dk</p>
                <p className="text-2xl font-bold">
                  {realtimeMetrics.paymentsPerMinute}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <CreditCard className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sistem Durumu</p>
                <p className="text-2xl font-bold text-green-600">Sağlıklı</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* System Health */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sistem Sağlığı</CardTitle>
              <CardDescription>Tüm servisler çalışıyor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(systemHealth).map(([key, data]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${getStatusColor(data.status)}`}
                    />
                    <div className="flex items-center gap-2">
                      {key === 'api' && (
                        <Server className="h-4 w-4 text-muted-foreground" />
                      )}
                      {key === 'database' && (
                        <Database className="h-4 w-4 text-muted-foreground" />
                      )}
                      {key === 'cache' && (
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      )}
                      {key === 'storage' && (
                        <Server className="h-4 w-4 text-muted-foreground" />
                      )}
                      {key === 'cdn' && (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium capitalize">{key}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {'latency' in data && <span>{data.latency}ms</span>}
                    {'uptime' in data && <span>{data.uptime}%</span>}
                    {'hitRate' in data && <span>{data.hitRate}%</span>}
                    {'usage' in data && <span>{data.usage}%</span>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Kaynak Kullanımı</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CPU</span>
                  <span className="font-medium">42%</span>
                </div>
                <Progress value={42} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bellek</span>
                  <span className="font-medium">68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Disk</span>
                  <span className="font-medium">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bant Genişliği</span>
                  <span className="font-medium">1.2 GB/s</span>
                </div>
                <Progress value={35} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Canlı Aktivite</CardTitle>
                <CardDescription>
                  Gerçek zamanlı platform aktivitesi
                </CardDescription>
              </div>
              {isLive && (
                <CanvaBadge variant="default" className="gap-1">
                  <Circle className="h-2 w-2 fill-red-500 text-red-500 animate-pulse" />
                  Canlı
                </CanvaBadge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                      index === 0 && isLive
                        ? 'bg-primary/5 border-primary/20'
                        : ''
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ${activity.color}`}
                    >
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.details}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleTimeString('tr-TR')}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

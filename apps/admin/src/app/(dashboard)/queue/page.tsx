'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Filter,
  Users,
  Image,
  AlertTriangle,
  DollarSign,
  RefreshCw,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatRelativeDate } from '@/lib/utils';

// Mock data for demonstration
const mockStats = {
  urgent: 5,
  pending: 12,
  completedToday: 47,
  platformHealth: 92,
};

const mockTasks = [
  {
    id: '1',
    type: 'kyc_verification',
    title: 'KYC Doğrulama Bekliyor',
    description: 'Kullanıcı Ali Veli kimlik doğrulaması için bekliyor',
    priority: 'urgent' as const,
    resource_type: 'users',
    resource_id: 'user-123',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: '2',
    type: 'payout_approval',
    title: 'Ödeme Onayı Gerekli',
    description: '₺2,500 tutarında ödeme onay bekliyor',
    priority: 'high' as const,
    resource_type: 'payouts',
    resource_id: 'payout-456',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '3',
    type: 'dispute_review',
    title: 'Şikayet İncelemesi',
    description: 'Kullanıcı dolandırıcılık şikayeti bildirdi',
    priority: 'high' as const,
    resource_type: 'disputes',
    resource_id: 'dispute-789',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '4',
    type: 'content_moderation',
    title: 'İçerik Onayı',
    description: 'Yeni paylaşılan moment inceleme bekliyor',
    priority: 'medium' as const,
    resource_type: 'moments',
    resource_id: 'moment-101',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '5',
    type: 'report_review',
    title: 'Şikayet Bildirimi',
    description: 'Uygunsuz içerik bildirimi yapıldı',
    priority: 'medium' as const,
    resource_type: 'reports',
    resource_id: 'report-202',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
];

const priorityConfig = {
  urgent: { label: 'Acil', color: 'bg-red-500', badge: 'error' as const },
  high: { label: 'Yüksek', color: 'bg-orange-500', badge: 'warning' as const },
  medium: { label: 'Orta', color: 'bg-yellow-500', badge: 'warning' as const },
  low: { label: 'Düşük', color: 'bg-green-500', badge: 'success' as const },
};

const typeConfig = {
  kyc_verification: { icon: Users, label: 'KYC', href: '/users' },
  payout_approval: { icon: DollarSign, label: 'Ödeme', href: '/finance' },
  dispute_review: {
    icon: AlertTriangle,
    label: 'Anlaşmazlık',
    href: '/disputes',
  },
  content_moderation: { icon: Image, label: 'İçerik', href: '/moments' },
  report_review: { icon: AlertCircle, label: 'Şikayet', href: '/disputes' },
};

export default function QueuePage() {
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredTasks = mockTasks.filter(
    (task) => priorityFilter === 'all' || task.priority === priorityFilter,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bugün ne yapmalıyım?
          </h1>
          <p className="text-muted-foreground">
            İş kuyruğundaki görevleri öncelik sırasına göre tamamlayın
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Yenile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acil</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.urgent}</div>
            <p className="text-xs text-muted-foreground">
              Hemen ilgilenilmesi gereken
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Sırada bekleyen görevler
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bugün Tamamlanan
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.completedToday}</div>
            <p className="text-xs text-muted-foreground">
              Başarıyla çözülen görevler
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Platform Sağlığı
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              %{mockStats.platformHealth}
            </div>
            <p className="text-xs text-muted-foreground">Sağlıklı çalışıyor</p>
          </CardContent>
        </Card>
      </div>

      {/* Task Queue */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>İş Kuyruğu</CardTitle>
              <CardDescription>
                Öncelik sırasına göre sıralanmış görevler
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="urgent">Acil</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="low">Düşük</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tümü ({mockTasks.length})</TabsTrigger>
              <TabsTrigger value="mine">Bana Atanan (3)</TabsTrigger>
              <TabsTrigger value="unassigned">Atanmamış (2)</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {filteredTasks.map((task) => {
                const typeInfo =
                  typeConfig[task.type as keyof typeof typeConfig];
                const priorityInfo = priorityConfig[task.priority];
                const TypeIcon = typeInfo?.icon || AlertCircle;

                return (
                  <div
                    key={task.id}
                    className={cn(
                      'flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50',
                      `priority-${task.priority}`,
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg',
                          'bg-muted',
                        )}
                      >
                        <TypeIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge variant={priorityInfo.badge}>
                            {priorityInfo.label}
                          </Badge>
                          <Badge variant="outline">{typeInfo?.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeDate(task.created_at)}
                        </p>
                      </div>
                    </div>
                    <Link href={`${typeInfo?.href}/${task.resource_id}`}>
                      <Button size="sm">
                        Çöz
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                );
              })}

              {filteredTasks.length === 0 && (
                <div className="py-12 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-4 text-lg font-semibold">Tebrikler!</h3>
                  <p className="text-muted-foreground">
                    Tüm görevler tamamlandı. Şimdilik yapılacak bir şey yok.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mine">
              <div className="py-8 text-center text-muted-foreground">
                Size atanan görevler burada görünecek
              </div>
            </TabsContent>

            <TabsContent value="unassigned">
              <div className="py-8 text-center text-muted-foreground">
                Atanmamış görevler burada görünecek
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

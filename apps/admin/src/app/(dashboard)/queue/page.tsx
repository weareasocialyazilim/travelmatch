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
  Loader2,
  ListTodo,
  Zap,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatRelativeDate } from '@/lib/utils';
import { useQueue, useCompleteTask } from '@/hooks/use-queue';
import { CanvaButton } from '@/components/canva/CanvaButton';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardBody,
  CanvaStatCard,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';

const priorityConfig = {
  urgent: { label: 'Acil', variant: 'error' as const },
  high: { label: 'Yüksek', variant: 'warning' as const },
  medium: { label: 'Orta', variant: 'info' as const },
  low: { label: 'Düşük', variant: 'success' as const },
};

const typeConfig: Record<
  string,
  { icon: typeof Users; label: string; href: string }
> = {
  kyc_verification: { icon: Users, label: 'KYC', href: '/users' },
  payout_approval: { icon: DollarSign, label: 'Ödeme', href: '/finance' },
  dispute_review: {
    icon: AlertTriangle,
    label: 'Anlaşmazlık',
    href: '/disputes',
  },
  content_moderation: { icon: Image, label: 'İçerik', href: '/moments' },
  report_review: { icon: AlertCircle, label: 'Şikayet', href: '/disputes' },
  general: { icon: ListTodo, label: 'Genel', href: '/queue' },
};

export default function QueuePage() {
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  const { data, isLoading, error, refetch, isFetching } = useQueue({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
  });

  const completeTask = useCompleteTask();

  const tasks = data?.tasks || [];
  const stats = data?.stats;

  // Error state
  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-500 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Veri Yüklenemedi
            </h2>
            <p className="text-muted-foreground mt-1">
              Görev listesi alınamadı.
            </p>
          </div>
          <CanvaButton variant="primary" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Tekrar Dene
          </CanvaButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bugün ne yapmalıyım?
          </h1>
          <p className="text-muted-foreground mt-1">
            İş kuyruğundaki görevleri öncelik sırasına göre tamamlayın
          </p>
        </div>
        <CanvaButton
          variant="primary"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          Yenile
        </CanvaButton>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <CanvaStatCard
          label="Acil"
          value={isLoading ? '...' : (stats?.urgent || 0).toString()}
          icon={<Zap className="h-5 w-5 text-red-500 dark:text-red-400" />}
        />
        <CanvaStatCard
          label="Bekleyen"
          value={isLoading ? '...' : (stats?.pending || 0).toString()}
          icon={
            <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />
          }
        />
        <CanvaStatCard
          label="Devam Eden"
          value={isLoading ? '...' : (stats?.inProgress || 0).toString()}
          icon={
            <ListTodo className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          }
        />
        <CanvaStatCard
          label="Tamamlanan"
          value={isLoading ? '...' : (stats?.completed || 0).toString()}
          icon={
            <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
          }
        />
      </div>

      {/* Overdue Warning */}
      {(stats?.overdue || 0) > 0 && (
        <CanvaCard className="border-l-4 border-l-red-500">
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {stats?.overdue} görev süresi geçmiş!
              </p>
              <p className="text-sm text-muted-foreground">
                Bu görevlere hemen dikkat etmeniz gerekiyor.
              </p>
            </div>
          </div>
        </CanvaCard>
      )}

      {/* Task Queue */}
      <CanvaCard>
        <CanvaCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CanvaCardTitle>İş Kuyruğu</CanvaCardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Öncelik sırasına göre sıralanmış görevler
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Öncelik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="urgent">Acil</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="low">Düşük</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="pending">Bekleyen</SelectItem>
                  <SelectItem value="in_progress">Devam Eden</SelectItem>
                  <SelectItem value="completed">Tamamlanan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CanvaCardHeader>
        <CanvaCardBody className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="px-6 pt-4">
              <TabsList>
                <TabsTrigger value="all">
                  Tümü ({stats?.total || 0})
                </TabsTrigger>
                <TabsTrigger value="urgent">
                  Acil ({stats?.urgent || 0})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Bekleyen ({stats?.pending || 0})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500 dark:text-violet-400" />
                </div>
              ) : tasks.length > 0 ? (
                <div className="divide-y divide-border">
                  {tasks.map((task) => {
                    const typeInfo =
                      typeConfig[task.type] || typeConfig.general;
                    const priorityInfo =
                      priorityConfig[
                        task.priority as keyof typeof priorityConfig
                      ] || priorityConfig.medium;
                    const TypeIcon = typeInfo.icon;

                    return (
                      <div
                        key={task.id}
                        className={cn(
                          'flex items-center justify-between px-6 py-4 hover:bg-muted transition-colors',
                          task.priority === 'urgent' &&
                            'border-l-4 border-l-red-500',
                          task.priority === 'high' &&
                            'border-l-4 border-l-amber-500',
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-xl',
                              task.priority === 'urgent' &&
                                'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400',
                              task.priority === 'high' &&
                                'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
                              task.priority === 'medium' &&
                                'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
                              task.priority === 'low' &&
                                'bg-muted text-foreground',
                            )}
                          >
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground">
                                {task.title}
                              </h4>
                              <CanvaBadge
                                variant={priorityInfo.variant}
                                size="sm"
                              >
                                {priorityInfo.label}
                              </CanvaBadge>
                              <CanvaBadge variant="primary" size="sm">
                                {typeInfo.label}
                              </CanvaBadge>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {task.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatRelativeDate(task.created_at)}
                              {task.assignee && (
                                <span>
                                  {' '}
                                  • Atanan: {task.assignee.full_name}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {task.status === 'pending' && (
                            <CanvaButton
                              variant="success"
                              size="sm"
                              onClick={() => completeTask.mutate(task.id)}
                              loading={completeTask.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Tamamla
                            </CanvaButton>
                          )}
                          <Link href={`${typeInfo.href}/${task.id}`}>
                            <CanvaButton variant="primary" size="sm">
                              Detay
                              <ArrowRight className="h-4 w-4" />
                            </CanvaButton>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Henüz görev yok
                  </h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    İş kuyruğu boş. Kullanıcı aktiviteleri (KYC talepleri, ödeme
                    istekleri, şikayetler) oluştuğunda burada görünecek.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="urgent" className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500 dark:text-violet-400" />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {tasks
                    .filter((t) => t.priority === 'urgent')
                    .map((task) => {
                      const typeInfo =
                        typeConfig[task.type] || typeConfig.general;
                      const TypeIcon = typeInfo.icon;

                      return (
                        <div
                          key={task.id}
                          className="flex items-center justify-between px-6 py-4 hover:bg-muted transition-colors border-l-4 border-l-red-500"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                              <TypeIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">
                                {task.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {formatRelativeDate(task.created_at)}
                              </p>
                            </div>
                          </div>
                          <CanvaButton variant="danger" size="sm">
                            Hemen Çöz
                            <ArrowRight className="h-4 w-4" />
                          </CanvaButton>
                        </div>
                      );
                    })}
                  {tasks.filter((t) => t.priority === 'urgent').length ===
                    0 && (
                    <div className="py-12 text-center">
                      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 dark:text-emerald-400" />
                      <p className="mt-4 text-muted-foreground">
                        Acil görev bulunmuyor.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-500 dark:text-violet-400" />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {tasks
                    .filter((t) => t.status === 'pending')
                    .map((task) => {
                      const typeInfo =
                        typeConfig[task.type] || typeConfig.general;
                      const priorityInfo =
                        priorityConfig[
                          task.priority as keyof typeof priorityConfig
                        ] || priorityConfig.medium;
                      const TypeIcon = typeInfo.icon;

                      return (
                        <div
                          key={task.id}
                          className="flex items-center justify-between px-6 py-4 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                              <TypeIcon className="h-5 w-5 text-foreground" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-foreground">
                                  {task.title}
                                </h4>
                                <CanvaBadge
                                  variant={priorityInfo.variant}
                                  size="sm"
                                >
                                  {priorityInfo.label}
                                </CanvaBadge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatRelativeDate(task.created_at)}
                              </p>
                            </div>
                          </div>
                          <CanvaButton
                            variant="primary"
                            size="sm"
                            onClick={() => completeTask.mutate(task.id)}
                          >
                            Başla
                            <ArrowRight className="h-4 w-4" />
                          </CanvaButton>
                        </div>
                      );
                    })}
                  {tasks.filter((t) => t.status === 'pending').length === 0 && (
                    <div className="py-12 text-center">
                      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 dark:text-emerald-400" />
                      <p className="mt-4 text-muted-foreground">
                        Bekleyen görev bulunmuyor.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CanvaCardBody>
      </CanvaCard>
    </div>
  );
}

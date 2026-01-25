'use client';

/**
 * Lovendo Chat & Messaging Analytics
 * Mesajlasma sisteminin analitigi ve izlenmesi
 *
 * Chat lock sistemi, E2E encryption, response metrikleri
 */

import { useState } from 'react';
import {
  MessageSquare,
  Lock,
  Unlock,
  Users,
  Clock,
  Shield,
  Eye,
  Send,
  AlertTriangle,
  BarChart3,
  Activity,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
  CanvaCardBody,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';
import { CanvaButton } from '@/components/canva/CanvaButton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AdminAreaChart,
  AdminLineChart,
  CHART_COLORS,
} from '@/components/common/admin-chart';
import { formatCurrency, cn } from '@/lib/utils';
import { useChatAnalytics } from '@/hooks/use-chat-analytics';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatAnalyticsPage() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const {
    chatStats,
    chatLockTiers,
    responseTimeData,
    hourlyMessageData,
    weeklyTrendData,
    activeConversations,
    flaggedMessages,
    isLoading,
    refresh,
  } = useChatAnalytics();

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'tier_3':
        return (
          <CanvaBadge className="bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
            Premium
          </CanvaBadge>
        );
      case 'tier_2':
        return (
          <CanvaBadge className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
            Standard
          </CanvaBadge>
        );
      default:
        return <CanvaBadge variant="default">Basic</CanvaBadge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <CanvaBadge className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Activity className="h-3 w-3 mr-1" />
            Aktif
          </CanvaBadge>
        );
      case 'idle':
        return (
          <CanvaBadge className="bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3 mr-1" />
            Beklemede
          </CanvaBadge>
        );
      default:
        return <CanvaBadge variant="default">{status}</CanvaBadge>;
    }
  };

  return (
    <div className="admin-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-purple-500 dark:text-purple-400" />
            Chat & Messaging Analytics
          </h1>
          <p className="text-muted-foreground">
            Mesajlasma sistemi metrikleri ve izleme
          </p>
        </div>
        <CanvaButton size="sm" onClick={refresh} disabled={isLoading}>
          <RefreshCw
            className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')}
          />
          {isLoading ? 'Yukleniyor...' : 'Yenile'}
        </CanvaButton>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
        <CanvaCard>
          <CanvaCardHeader className="pb-2">
            <CanvaCardSubtitle className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Bugun Mesaj
            </CanvaCardSubtitle>
            <CanvaCardTitle className="text-xl font-bold">
              {isLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                chatStats.messagestoday.toLocaleString()
              )}
            </CanvaCardTitle>
          </CanvaCardHeader>
        </CanvaCard>

        <CanvaCard>
          <CanvaCardHeader className="pb-2">
            <CanvaCardSubtitle className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Aktif Sohbet
            </CanvaCardSubtitle>
            <CanvaCardTitle className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {isLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                chatStats.activeToday.toLocaleString()
              )}
            </CanvaCardTitle>
          </CanvaCardHeader>
        </CanvaCard>

        <CanvaCard>
          <CanvaCardHeader className="pb-2">
            <CanvaCardSubtitle className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Ort. Yanit
            </CanvaCardSubtitle>
            <CanvaCardTitle className="text-xl font-bold">
              {isLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                `${chatStats.avgResponseTime} dk`
              )}
            </CanvaCardTitle>
          </CanvaCardHeader>
        </CanvaCard>

        <CanvaCard>
          <CanvaCardHeader className="pb-2">
            <CanvaCardSubtitle className="flex items-center gap-1">
              <Unlock className="h-3 w-3" />
              Chat Acilma
            </CanvaCardSubtitle>
            <CanvaCardTitle className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {isLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                `%${chatStats.chatLockRate}`
              )}
            </CanvaCardTitle>
          </CanvaCardHeader>
        </CanvaCard>

        <CanvaCard>
          <CanvaCardHeader className="pb-2">
            <CanvaCardSubtitle className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Mesaj/Sohbet
            </CanvaCardSubtitle>
            <CanvaCardTitle className="text-xl font-bold">
              {isLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                chatStats.avgMessagesPerConvo
              )}
            </CanvaCardTitle>
          </CanvaCardHeader>
        </CanvaCard>

        <CanvaCard>
          <CanvaCardHeader className="pb-2">
            <CanvaCardSubtitle className="flex items-center gap-1">
              <Send className="h-3 w-3" />
              Media
            </CanvaCardSubtitle>
            <CanvaCardTitle className="text-xl font-bold">
              {isLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                chatStats.mediaShared.toLocaleString()
              )}
            </CanvaCardTitle>
          </CanvaCardHeader>
        </CanvaCard>

        <CanvaCard className="col-span-2">
          <CanvaCardHeader className="pb-2">
            <CanvaCardSubtitle className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              E2E Sifreleme
            </CanvaCardSubtitle>
            <CanvaCardTitle className="text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              {isLoading ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <>
                  <Lock className="h-4 w-4" />%{chatStats.e2eEncrypted} Guvenli
                </>
              )}
            </CanvaCardTitle>
          </CanvaCardHeader>
        </CanvaCard>
      </div>

      {/* Chat Lock Tiers */}
      <CanvaCard>
        <CanvaCardHeader>
          <CanvaCardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            Chat Lock Sistemi Analizi
          </CanvaCardTitle>
          <CanvaCardSubtitle>Tier bazli chat acilma oranlari</CanvaCardSubtitle>
        </CanvaCardHeader>
        <CanvaCardBody>
          <div className="grid gap-4 md:grid-cols-3">
            {chatLockTiers.map((tier, index) => (
              <div
                key={tier.tier}
                className={cn(
                  'p-4 rounded-lg border',
                  index === 0 && 'bg-gray-500/5 dark:bg-gray-500/10',
                  index === 1 &&
                    'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/30',
                  index === 2 &&
                    'bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/30',
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{tier.tier}</h4>
                  {index === 0 ? (
                    <CanvaBadge variant="default">
                      <Lock className="h-3 w-3 mr-1" />
                      Kilitli
                    </CanvaBadge>
                  ) : (
                    <CanvaBadge
                      className={
                        index === 2
                          ? 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400'
                          : 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      }
                    >
                      <Unlock className="h-3 w-3 mr-1" />
                      Acilabilir
                    </CanvaBadge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {tier.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Toplam Islem</span>
                    <span className="font-medium">
                      {tier.conversions.toLocaleString()}
                    </span>
                  </div>
                  {tier.chatEligible > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Chat Uygun
                        </span>
                        <span className="font-medium">
                          {tier.chatEligible.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Chat Acildi
                        </span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {tier.chatUnlocked.toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-2 mt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Acilma Orani</span>
                          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            %{tier.unlockRate}
                          </span>
                        </div>
                        <Progress
                          value={tier.unlockRate}
                          className="h-2 mt-2"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CanvaCardBody>
      </CanvaCard>

      {/* Main Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Genel Bakis</TabsTrigger>
          <TabsTrigger value="active">Aktif Sohbetler</TabsTrigger>
          <TabsTrigger value="moderation">Moderasyon</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Hourly Volume */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Saatlik Mesaj Hacmi</CanvaCardTitle>
                <CanvaCardSubtitle>
                  Gun icindeki mesaj dagilimi
                </CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <AdminAreaChart
                  data={hourlyMessageData as any}
                  xAxisKey="hour"
                  height={250}
                  areas={[
                    {
                      dataKey: 'messages',
                      name: 'Mesajlar',
                      color: CHART_COLORS.primary,
                    },
                  ]}
                />
              </CanvaCardBody>
            </CanvaCard>

            {/* Response Time Distribution */}
            <CanvaCard>
              <CanvaCardHeader>
                <CanvaCardTitle>Yanit Suresi Dagilimi</CanvaCardTitle>
                <CanvaCardSubtitle>Host yanit sureleri</CanvaCardSubtitle>
              </CanvaCardHeader>
              <CanvaCardBody>
                <div className="space-y-4">
                  {responseTimeData.map((item) => (
                    <div key={item.range} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.range}</span>
                        <span className="text-muted-foreground">
                          {item.count.toLocaleString()} (%{item.percentage})
                        </span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CanvaCardBody>
            </CanvaCard>
          </div>

          {/* Weekly Trend */}
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle>Haftalik Trend</CanvaCardTitle>
              <CanvaCardSubtitle>Mesaj ve sohbet trendi</CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <AdminLineChart
                data={weeklyTrendData as any}
                xAxisKey="date"
                height={300}
                lines={[
                  {
                    dataKey: 'messages',
                    name: 'Mesajlar',
                    color: CHART_COLORS.primary,
                  },
                  {
                    dataKey: 'conversations',
                    name: 'Sohbetler',
                    color: CHART_COLORS.secondary,
                  },
                ]}
              />
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Active Conversations Tab */}
        <TabsContent value="active" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Sohbet ara..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tum Tier'lar</SelectItem>
                <SelectItem value="tier_3">Premium (100+ USD)</SelectItem>
                <SelectItem value="tier_2">Standard (30-100 USD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CanvaCard>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Katilimcilar</TableHead>
                  <TableHead>Moment</TableHead>
                  <TableHead>Hediye</TableHead>
                  <TableHead>Mesaj</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Son Aktivite</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeConversations.map((conv) => (
                  <TableRow key={conv.id}>
                    <TableCell className="font-mono text-sm">
                      {conv.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {conv.participants.join(' ↔ ')}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {conv.moment}
                    </TableCell>
                    <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(conv.giftAmount, 'TRY')}
                    </TableCell>
                    <TableCell>{conv.messages}</TableCell>
                    <TableCell>{getTierBadge(conv.tier)}</TableCell>
                    <TableCell>{getStatusBadge(conv.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {conv.lastActivity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CanvaCard>
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="space-y-4">
          <CanvaCard>
            <CanvaCardHeader>
              <CanvaCardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                Isaretlenen Mesajlar
              </CanvaCardTitle>
              <CanvaCardSubtitle>
                Otomatik moderasyon tarafindan tespit edilen mesajlar
              </CanvaCardSubtitle>
            </CanvaCardHeader>
            <CanvaCardBody>
              <div className="space-y-4">
                {flaggedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      msg.status === 'pending' &&
                        'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10',
                      msg.status === 'reviewing' &&
                        'border-blue-500/30 bg-blue-500/5 dark:bg-blue-500/10',
                      msg.status === 'actioned' && 'bg-muted/50',
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CanvaBadge variant="default" className="font-mono">
                            {msg.id}
                          </CanvaBadge>
                          <CanvaBadge
                            className={cn(
                              msg.reason === 'potential_spam' &&
                                'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
                              msg.reason === 'contact_sharing' &&
                                'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
                              msg.reason === 'inappropriate' &&
                                'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400',
                            )}
                          >
                            {msg.reason.replace(/_/g, ' ')}
                          </CanvaBadge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium">{msg.sender}</span> in{' '}
                          {msg.conversation}
                        </p>
                        <p className="text-sm italic bg-muted/50 p-2 rounded">
                          &quot;{msg.snippet}&quot;
                        </p>
                      </div>
                      <div className="text-right">
                        <CanvaBadge
                          variant={
                            msg.status === 'actioned' ? 'default' : 'primary'
                          }
                        >
                          {msg.status === 'pending' && 'Bekliyor'}
                          {msg.status === 'reviewing' && 'Inceleniyor'}
                          {msg.status === 'actioned' && 'Islem Yapildi'}
                        </CanvaBadge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {msg.flaggedAt}
                        </p>
                      </div>
                    </div>
                    {msg.status !== 'actioned' && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <CanvaButton size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Incele
                        </CanvaButton>
                        <CanvaButton size="sm" variant="danger">
                          Sil
                        </CanvaButton>
                        <CanvaButton size="sm" variant="outline">
                          Onayla
                        </CanvaButton>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

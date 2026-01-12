'use client';

/**
 * TravelMatch Chat & Messaging Analytics
 * Mesajlasma sisteminin analitiği ve izlenmesi
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
  TrendingUp,
  TrendingDown,
  Shield,
  Eye,
  EyeOff,
  Send,
  CheckCheck,
  AlertTriangle,
  BarChart3,
  Activity,
  Heart,
  Zap,
  RefreshCw,
  Search,
  Filter,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  AdminBarChart,
  AdminLineChart,
  CHART_COLORS,
} from '@/components/common/admin-chart';
import { formatCurrency, cn } from '@/lib/utils';

// Chat Stats Overview
const chatStats = {
  totalConversations: 12456,
  activeToday: 3421,
  messagestoday: 23456,
  avgResponseTime: 4.2, // dakika
  chatLockRate: 67.8, // % of eligible getting chat unlocked
  e2eEncrypted: 100, // tum mesajlar sifreli
  avgMessagesPerConvo: 12.3,
  mediaShared: 1234,
};

// Chat Lock Tiers Analysis
const chatLockTiers = [
  {
    tier: 'Tier 1 (0-30 USD)',
    description: 'Chat yok, toplu tesekkur',
    conversions: 45678,
    chatEligible: 0,
    chatUnlocked: 0,
    unlockRate: 0,
  },
  {
    tier: 'Tier 2 (30-100 USD)',
    description: 'Host onayı ile chat',
    conversions: 12345,
    chatEligible: 12345,
    chatUnlocked: 8234,
    unlockRate: 66.7,
  },
  {
    tier: 'Tier 3 (100+ USD)',
    description: 'Premium - Host onayı ile chat',
    conversions: 5678,
    chatEligible: 5678,
    chatUnlocked: 4123,
    unlockRate: 72.6,
  },
];

// Response Time Distribution
const responseTimeData = [
  { range: '0-1 dk', count: 2345, percentage: 32 },
  { range: '1-5 dk', count: 3456, percentage: 45 },
  { range: '5-15 dk', count: 1234, percentage: 16 },
  { range: '15-60 dk', count: 456, percentage: 5 },
  { range: '1+ saat', count: 123, percentage: 2 },
];

// Hourly Message Volume
const hourlyMessageData = [
  { hour: '00', messages: 456, conversations: 89 },
  { hour: '04', messages: 234, conversations: 45 },
  { hour: '08', messages: 1234, conversations: 234 },
  { hour: '12', messages: 2345, conversations: 456 },
  { hour: '16', messages: 3456, conversations: 678 },
  { hour: '20', messages: 4567, conversations: 890 },
  { hour: '24', messages: 2345, conversations: 456 },
];

// Weekly Trend Data
const weeklyTrendData = [
  { date: 'Pzt', messages: 18500, conversations: 2345, unlockRate: 65 },
  { date: 'Sal', messages: 21200, conversations: 2678, unlockRate: 67 },
  { date: 'Car', messages: 19800, conversations: 2456, unlockRate: 66 },
  { date: 'Per', messages: 24500, conversations: 3123, unlockRate: 68 },
  { date: 'Cum', messages: 28900, conversations: 3678, unlockRate: 70 },
  { date: 'Cmt', messages: 32400, conversations: 4123, unlockRate: 72 },
  { date: 'Paz', messages: 23456, conversations: 3421, unlockRate: 67 },
];

// Active Conversations (Monitored)
const activeConversations = [
  {
    id: 'CONV-001',
    participants: ['Ahmet K.', 'Ayse M.'],
    moment: 'Kapadokya Balloon Tour',
    giftAmount: 2450,
    messages: 24,
    lastActivity: '2 dk once',
    status: 'active',
    tier: 'tier_3',
  },
  {
    id: 'CONV-002',
    participants: ['Mehmet S.', 'Zeynep A.'],
    moment: 'Bosphorus Dinner',
    giftAmount: 1800,
    messages: 18,
    lastActivity: '5 dk once',
    status: 'active',
    tier: 'tier_2',
  },
  {
    id: 'CONV-003',
    participants: ['Can B.', 'Deniz K.'],
    moment: 'Istanbul Food Tour',
    giftAmount: 950,
    messages: 12,
    lastActivity: '12 dk once',
    status: 'active',
    tier: 'tier_2',
  },
  {
    id: 'CONV-004',
    participants: ['Elif T.', 'Burak Y.'],
    moment: 'Luxury Yacht',
    giftAmount: 5600,
    messages: 45,
    lastActivity: '1 saat once',
    status: 'idle',
    tier: 'tier_3',
  },
];

// Flagged Messages (Content Moderation)
const flaggedMessages = [
  {
    id: 'MSG-001',
    conversation: 'CONV-089',
    sender: 'User123',
    reason: 'potential_spam',
    snippet: 'Hey check out this external link...',
    flaggedAt: '10 dk once',
    status: 'pending',
  },
  {
    id: 'MSG-002',
    conversation: 'CONV-145',
    sender: 'User456',
    reason: 'contact_sharing',
    snippet: 'My phone number is +90...',
    flaggedAt: '25 dk once',
    status: 'reviewing',
  },
  {
    id: 'MSG-003',
    conversation: 'CONV-234',
    sender: 'User789',
    reason: 'inappropriate',
    snippet: '[Content removed]',
    flaggedAt: '1 saat once',
    status: 'actioned',
  },
];

export default function ChatAnalyticsPage() {
  const [selectedTab, setSelectedTab] = useState('overview');

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'tier_3':
        return (
          <Badge className="bg-purple-500/10 text-purple-600">Premium</Badge>
        );
      case 'tier_2':
        return <Badge className="bg-blue-500/10 text-blue-600">Standard</Badge>;
      default:
        return <Badge variant="outline">Basic</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600">
            <Activity className="h-3 w-3 mr-1" />
            Aktif
          </Badge>
        );
      case 'idle':
        return (
          <Badge className="bg-amber-500/10 text-amber-600">
            <Clock className="h-3 w-3 mr-1" />
            Beklemede
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="admin-content space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-purple-500" />
            Chat & Messaging Analytics
          </h1>
          <p className="text-muted-foreground">
            Mesajlasma sistemi metrikleri ve izleme
          </p>
        </div>
        <Button size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Bugun Mesaj
            </CardDescription>
            <CardTitle className="text-xl font-bold">
              {chatStats.messagestoday.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Aktif Sohbet
            </CardDescription>
            <CardTitle className="text-xl font-bold text-purple-600">
              {chatStats.activeToday.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Ort. Yanit
            </CardDescription>
            <CardTitle className="text-xl font-bold">
              {chatStats.avgResponseTime} dk
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Unlock className="h-3 w-3" />
              Chat Acilma
            </CardDescription>
            <CardTitle className="text-xl font-bold text-emerald-600">
              %{chatStats.chatLockRate}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Mesaj/Sohbet
            </CardDescription>
            <CardTitle className="text-xl font-bold">
              {chatStats.avgMessagesPerConvo}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Send className="h-3 w-3" />
              Media
            </CardDescription>
            <CardTitle className="text-xl font-bold">
              {chatStats.mediaShared.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              E2E Sifreleme
            </CardDescription>
            <CardTitle className="text-xl font-bold text-emerald-600 flex items-center gap-2">
              <Lock className="h-4 w-4" />%{chatStats.e2eEncrypted} Guvenli
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Chat Lock Tiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            Chat Lock Sistemi Analizi
          </CardTitle>
          <CardDescription>Tier bazli chat acilma oranlari</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {chatLockTiers.map((tier, index) => (
              <div
                key={tier.tier}
                className={cn(
                  'p-4 rounded-lg border',
                  index === 0 && 'bg-gray-500/5',
                  index === 1 && 'bg-blue-500/5 border-blue-500/30',
                  index === 2 && 'bg-purple-500/5 border-purple-500/30',
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{tier.tier}</h4>
                  {index === 0 ? (
                    <Badge variant="outline">
                      <Lock className="h-3 w-3 mr-1" />
                      Kilitli
                    </Badge>
                  ) : (
                    <Badge
                      className={
                        index === 2
                          ? 'bg-purple-500/10 text-purple-600'
                          : 'bg-blue-500/10 text-blue-600'
                      }
                    >
                      <Unlock className="h-3 w-3 mr-1" />
                      Acilabilir
                    </Badge>
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
                        <span className="font-medium text-emerald-600">
                          {tier.chatUnlocked.toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-2 mt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Acilma Orani</span>
                          <span className="text-lg font-bold text-emerald-600">
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
        </CardContent>
      </Card>

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
            <Card>
              <CardHeader>
                <CardTitle>Saatlik Mesaj Hacmi</CardTitle>
                <CardDescription>Gun icindeki mesaj dagilimi</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminAreaChart
                  data={hourlyMessageData}
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
              </CardContent>
            </Card>

            {/* Response Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Yanit Suresi Dagilimi</CardTitle>
                <CardDescription>Host yanit sureleri</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>

          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Haftalik Trend</CardTitle>
              <CardDescription>Mesaj ve sohbet trendi</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminLineChart
                data={weeklyTrendData}
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
            </CardContent>
          </Card>
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

          <Card>
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
                    <TableCell className="font-medium text-emerald-600">
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
          </Card>
        </TabsContent>

        {/* Moderation Tab */}
        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Isaretlenen Mesajlar
              </CardTitle>
              <CardDescription>
                Otomatik moderasyon tarafindan tespit edilen mesajlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flaggedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      msg.status === 'pending' &&
                        'border-amber-500/30 bg-amber-500/5',
                      msg.status === 'reviewing' &&
                        'border-blue-500/30 bg-blue-500/5',
                      msg.status === 'actioned' && 'bg-muted/50',
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono">
                            {msg.id}
                          </Badge>
                          <Badge
                            className={cn(
                              msg.reason === 'potential_spam' &&
                                'bg-amber-500/10 text-amber-600',
                              msg.reason === 'contact_sharing' &&
                                'bg-blue-500/10 text-blue-600',
                              msg.reason === 'inappropriate' &&
                                'bg-red-500/10 text-red-600',
                            )}
                          >
                            {msg.reason.replace(/_/g, ' ')}
                          </Badge>
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
                        <Badge
                          variant={
                            msg.status === 'actioned' ? 'outline' : 'default'
                          }
                        >
                          {msg.status === 'pending' && 'Bekliyor'}
                          {msg.status === 'reviewing' && 'Inceleniyor'}
                          {msg.status === 'actioned' && 'Islem Yapildi'}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {msg.flaggedAt}
                        </p>
                      </div>
                    </div>
                    {msg.status !== 'actioned' && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Incele
                        </Button>
                        <Button size="sm" variant="destructive">
                          Sil
                        </Button>
                        <Button size="sm" variant="outline">
                          Onayla
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

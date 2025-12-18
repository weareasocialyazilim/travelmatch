'use client';

import { useState } from 'react';
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Phone,
  Mail,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock customer success data
const npsData = {
  score: 42,
  promoters: 58,
  passives: 26,
  detractors: 16,
  responses: 1234,
  change: 5,
};

const satisfactionMetrics = [
  { category: 'Uygulama Deneyimi', score: 4.2, trend: 'up' },
  { category: 'Eşleşme Kalitesi', score: 3.8, trend: 'up' },
  { category: 'Müşteri Desteği', score: 4.5, trend: 'stable' },
  { category: 'Fiyat/Değer', score: 3.6, trend: 'down' },
  { category: 'Güvenlik', score: 4.7, trend: 'up' },
];

const atRiskUsers = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet',
    status: 'high_risk',
    reason: '30 gündür giriş yapmadı',
    ltv: 450,
    subscription: 'Premium',
    last_active: '2024-11-18',
  },
  {
    id: '2',
    name: 'Fatma Demir',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatma',
    status: 'medium_risk',
    reason: 'Olumsuz NPS yanıtı',
    ltv: 890,
    subscription: 'Premium+',
    last_active: '2024-12-15',
  },
  {
    id: '3',
    name: 'Can Öztürk',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=can',
    status: 'medium_risk',
    reason: 'İptal isteği gönderdi',
    ltv: 320,
    subscription: 'Premium',
    last_active: '2024-12-17',
  },
];

const recentFeedback = [
  {
    id: '1',
    user: 'Zeynep A.',
    type: 'promoter',
    score: 9,
    comment: 'Harika bir uygulama! Seyahat planlaması çok kolaylaştı.',
    date: '2024-12-17',
  },
  {
    id: '2',
    user: 'Emre K.',
    type: 'detractor',
    score: 4,
    comment: 'Eşleşme kalitesi düştü, daha az aktif kullanıcı var.',
    date: '2024-12-16',
  },
  {
    id: '3',
    user: 'Elif S.',
    type: 'passive',
    score: 7,
    comment: 'Genel olarak iyi ama fiyatlar biraz yüksek.',
    date: '2024-12-15',
  },
];

export default function CustomerSuccessPage() {
  const getRiskBadge = (status: string) => {
    switch (status) {
      case 'high_risk':
        return <Badge variant="destructive">Yüksek Risk</Badge>;
      case 'medium_risk':
        return <Badge className="bg-orange-500">Orta Risk</Badge>;
      case 'low_risk':
        return <Badge className="bg-yellow-500">Düşük Risk</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreIcon = (type: string) => {
    switch (type) {
      case 'promoter':
        return <ThumbsUp className="h-5 w-5 text-green-500" />;
      case 'detractor':
        return <ThumbsDown className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Müşteri Başarısı</h1>
          <p className="text-muted-foreground">NPS, memnuniyet ve risk analizi</p>
        </div>
        <Button>
          <Mail className="mr-2 h-4 w-4" />
          NPS Anketi Gönder
        </Button>
      </div>

      {/* NPS Score */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Promoter Score</p>
                <p className="text-5xl font-bold">{npsData.score}</p>
                <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  +{npsData.change} geçen aya göre
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{npsData.responses} yanıt</p>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <div className="flex-1 rounded-lg bg-green-100 p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{npsData.promoters}%</p>
                <p className="text-xs text-green-600">Destekçi</p>
              </div>
              <div className="flex-1 rounded-lg bg-gray-100 p-3 text-center">
                <p className="text-2xl font-bold text-gray-600">{npsData.passives}%</p>
                <p className="text-xs text-gray-600">Pasif</p>
              </div>
              <div className="flex-1 rounded-lg bg-red-100 p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{npsData.detractors}%</p>
                <p className="text-xs text-red-600">Eleştiren</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Satisfaction Metrics */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Memnuniyet Metrikleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {satisfactionMetrics.map((metric) => (
                <div key={metric.category} className="flex items-center gap-4">
                  <div className="w-36">
                    <span className="text-sm">{metric.category}</span>
                  </div>
                  <Progress value={metric.score * 20} className="flex-1 h-2" />
                  <div className="flex items-center gap-2 w-20">
                    <span className="font-medium">{metric.score}</span>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-gray-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="at-risk" className="space-y-4">
        <TabsList>
          <TabsTrigger value="at-risk">Risk Altındaki Kullanıcılar</TabsTrigger>
          <TabsTrigger value="feedback">NPS Yanıtları</TabsTrigger>
          <TabsTrigger value="outreach">Proaktif İletişim</TabsTrigger>
        </TabsList>

        <TabsContent value="at-risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Churn Riski Yüksek Kullanıcılar
              </CardTitle>
              <CardDescription>
                Proaktif müdahale gerektiren kullanıcılar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {atRiskUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name}</p>
                          {getRiskBadge(user.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.reason}</p>
                        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{user.subscription}</span>
                          <span>LTV: ₺{user.ltv}</span>
                          <span>Son aktif: {user.last_active}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Phone className="mr-2 h-4 w-4" />
                        Ara
                      </Button>
                      <Button size="sm">
                        <Mail className="mr-2 h-4 w-4" />
                        E-posta
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Son NPS Yanıtları</CardTitle>
              <CardDescription>Kullanıcı geri bildirimleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="flex items-start gap-4 rounded-lg border p-4"
                  >
                    {getScoreIcon(feedback.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{feedback.user}</p>
                        <Badge
                          className={
                            feedback.type === 'promoter'
                              ? 'bg-green-500'
                              : feedback.type === 'detractor'
                                ? 'bg-red-500'
                                : 'bg-gray-500'
                          }
                        >
                          {feedback.score}/10
                        </Badge>
                        <span className="text-xs text-muted-foreground">{feedback.date}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{feedback.comment}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Yanıtla
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outreach" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Planlanmış İletişimler</CardTitle>
                <CardDescription>Otomatik gönderilecek mesajlar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: 'Hoşgeldin Serisi',
                      trigger: 'Kayıt sonrası',
                      sent: 234,
                      opened: '68%',
                    },
                    {
                      title: 'Aktivasyon Hatırlatma',
                      trigger: '3 gün inaktif',
                      sent: 567,
                      opened: '42%',
                    },
                    {
                      title: 'Win-back Kampanyası',
                      trigger: '30 gün inaktif',
                      sent: 123,
                      opened: '28%',
                    },
                  ].map((campaign, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-medium">{campaign.title}</p>
                        <p className="text-sm text-muted-foreground">{campaign.trigger}</p>
                      </div>
                      <div className="text-right text-sm">
                        <p>{campaign.sent} gönderildi</p>
                        <p className="text-muted-foreground">{campaign.opened} açıldı</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Başarı Hedefleri</CardTitle>
                <CardDescription>Bu ay için hedefler</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">NPS Skoru</span>
                      <span className="text-sm font-medium">42 / 50</span>
                    </div>
                    <Progress value={84} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Churn Oranı</span>
                      <span className="text-sm font-medium">2.1% / 3%</span>
                    </div>
                    <Progress value={70} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">CSAT Skoru</span>
                      <span className="text-sm font-medium">4.2 / 4.5</span>
                    </div>
                    <Progress value={93} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

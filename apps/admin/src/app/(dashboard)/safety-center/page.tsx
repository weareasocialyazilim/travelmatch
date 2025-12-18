'use client';

import { useState } from 'react';
import {
  Siren,
  MapPin,
  Phone,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Globe,
  Radio,
  MessageSquare,
  Navigation,
  Bell,
  Eye,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock SOS data
const sosStats = {
  active_sos: 2,
  resolved_today: 8,
  avg_response_time: '3.2 min',
  travel_alerts: 5,
};

const activeSOS = [
  {
    id: 'sos_1',
    user: {
      name: 'Ayşe Yılmaz',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ayse',
      phone: '+90 532 XXX XX XX',
    },
    location: {
      lat: 41.0082,
      lng: 28.9784,
      address: 'Sultanahmet, İstanbul',
      country: 'Türkiye',
    },
    type: 'emergency',
    message: 'Acil yardım! Cüzdanım çalındı ve otelime dönemiyorum.',
    created_at: '2024-12-18T14:25:00Z',
    status: 'active',
    responder: null,
  },
  {
    id: 'sos_2',
    user: {
      name: 'John Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      phone: '+1 555 XXX XXXX',
    },
    location: {
      lat: 36.8969,
      lng: 30.7133,
      address: 'Kaleiçi, Antalya',
      country: 'Türkiye',
    },
    type: 'medical',
    message: 'Sağlık sorunu yaşıyorum, hastane lazım.',
    created_at: '2024-12-18T14:10:00Z',
    status: 'responding',
    responder: {
      name: 'Mehmet Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet',
    },
  },
];

const travelAlerts = [
  {
    id: 'alert_1',
    country: 'Mısır',
    flag: '🇪🇬',
    level: 'high',
    title: 'Güvenlik Uyarısı',
    description: 'Bazı bölgelerde sivil huzursuzluk riski',
    updated_at: '2024-12-17',
    affected_users: 23,
  },
  {
    id: 'alert_2',
    country: 'Tayland',
    flag: '🇹🇭',
    title: 'Hava Durumu Uyarısı',
    level: 'medium',
    description: 'Güney bölgelerinde muson yağmurları bekleniyor',
    updated_at: '2024-12-16',
    affected_users: 45,
  },
  {
    id: 'alert_3',
    country: 'İtalya',
    flag: '🇮🇹',
    level: 'low',
    title: 'Grev Uyarısı',
    description: 'Toplu taşıma grevleri planlanıyor',
    updated_at: '2024-12-15',
    affected_users: 67,
  },
];

const sosHistory = [
  {
    id: 'hist_1',
    user: 'Maria Garcia',
    type: 'emergency',
    location: 'Barcelona, İspanya',
    resolved_at: '2024-12-18T12:30:00Z',
    response_time: '2.5 min',
    resolution: 'Yerel polis ile iletişime geçildi',
  },
  {
    id: 'hist_2',
    user: 'Hans Mueller',
    type: 'lost',
    location: 'Kapadokya, Türkiye',
    resolved_at: '2024-12-18T10:15:00Z',
    response_time: '4.1 min',
    resolution: 'Otel ile iletişim sağlandı',
  },
  {
    id: 'hist_3',
    user: 'Sophie Chen',
    type: 'medical',
    location: 'Tokyo, Japonya',
    resolved_at: '2024-12-17T22:45:00Z',
    response_time: '1.8 min',
    resolution: 'Ambulans yönlendirildi',
  },
];

export default function SafetyCenterPage() {
  const [selectedSOS, setSelectedSOS] = useState<string | null>(null);

  const getAlertLevelBadge = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge variant="destructive">Yüksek</Badge>;
      case 'medium':
        return <Badge className="bg-orange-500">Orta</Badge>;
      case 'low':
        return <Badge className="bg-yellow-500">Düşük</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const getSOSTypeBadge = (type: string) => {
    switch (type) {
      case 'emergency':
        return <Badge variant="destructive">Acil Durum</Badge>;
      case 'medical':
        return <Badge className="bg-red-500">Sağlık</Badge>;
      case 'lost':
        return <Badge className="bg-orange-500">Kayıp</Badge>;
      case 'safety':
        return <Badge className="bg-yellow-500">Güvenlik</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getTimeSince = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} dk önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    return `${Math.floor(hours / 24)} gün önce`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Güvenlik Merkezi</h1>
          <p className="text-muted-foreground">SOS talepleri ve seyahat uyarıları</p>
        </div>
        <div className="flex items-center gap-2">
          {sosStats.active_sos > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2">
              <Radio className="h-4 w-4 text-red-600 animate-pulse" />
              <span className="font-medium text-red-600">
                {sosStats.active_sos} Aktif SOS
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={sosStats.active_sos > 0 ? 'border-red-500 bg-red-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif SOS</p>
                <p className={`text-2xl font-bold ${sosStats.active_sos > 0 ? 'text-red-600' : ''}`}>
                  {sosStats.active_sos}
                </p>
              </div>
              <Siren className={`h-8 w-8 ${sosStats.active_sos > 0 ? 'text-red-600 animate-pulse' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bugün Çözülen</p>
                <p className="text-2xl font-bold text-green-600">{sosStats.resolved_today}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ort. Yanıt Süresi</p>
                <p className="text-2xl font-bold">{sosStats.avg_response_time}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Seyahat Uyarıları</p>
                <p className="text-2xl font-bold">{sosStats.travel_alerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active SOS Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Siren className="h-5 w-5 text-red-600" />
                  Aktif SOS Talepleri
                </CardTitle>
                <CardDescription>Acil müdahale bekleyen talepler</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <History className="mr-2 h-4 w-4" />
                Geçmiş
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeSOS.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Shield className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-lg font-medium">Tüm Kullanıcılar Güvende</p>
                <p className="text-muted-foreground">Aktif SOS talebi bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeSOS.map((sos) => (
                  <div
                    key={sos.id}
                    className={`rounded-lg border-2 p-4 ${
                      sos.status === 'active'
                        ? 'border-red-500 bg-red-50'
                        : 'border-orange-300 bg-orange-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-white">
                          <AvatarImage src={sos.user.avatar} />
                          <AvatarFallback>{sos.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{sos.user.name}</p>
                            {getSOSTypeBadge(sos.type)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {sos.location.address}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getTimeSince(sos.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {sos.status === 'active' ? (
                          <Badge variant="destructive" className="animate-pulse">
                            Acil
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-500">Yanıtlanıyor</Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-white p-3">
                      <p className="text-sm">{sos.message}</p>
                    </div>

                    {sos.responder && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={sos.responder.avatar} />
                          <AvatarFallback>{sos.responder.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground">
                          {sos.responder.name} yanıtlıyor
                        </span>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Phone className="mr-2 h-4 w-4" />
                        Ara
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Mesaj
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Navigation className="mr-2 h-4 w-4" />
                        Konum
                      </Button>
                      {sos.status === 'active' && (
                        <Button size="sm" variant="secondary">
                          <Eye className="mr-2 h-4 w-4" />
                          Üstlen
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Travel Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Seyahat Uyarıları
            </CardTitle>
            <CardDescription>Aktif bölgesel uyarılar</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {travelAlerts.map((alert) => (
                  <div key={alert.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{alert.flag}</span>
                        <div>
                          <p className="font-medium">{alert.country}</p>
                          <p className="text-sm text-muted-foreground">{alert.title}</p>
                        </div>
                      </div>
                      {getAlertLevelBadge(alert.level)}
                    </div>
                    <p className="mt-2 text-sm">{alert.description}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {alert.affected_users} kullanıcı
                      </span>
                      <span>{alert.updated_at}</span>
                    </div>
                    <Button size="sm" variant="outline" className="mt-3 w-full">
                      <Bell className="mr-2 h-4 w-4" />
                      Kullanıcıları Bilgilendir
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* SOS History */}
      <Card>
        <CardHeader>
          <CardTitle>Son Çözülen Talepler</CardTitle>
          <CardDescription>Son 24 saatte çözülen SOS talepleri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sosHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">{item.user}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {item.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {getSOSTypeBadge(item.type)}
                  <div className="text-right text-sm">
                    <p className="font-medium">{item.response_time}</p>
                    <p className="text-muted-foreground">yanıt süresi</p>
                  </div>
                  <div className="text-right text-sm max-w-xs">
                    <p className="truncate">{item.resolution}</p>
                    <p className="text-muted-foreground">
                      {new Date(item.resolved_at).toLocaleTimeString('tr-TR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Edit,
  MessageSquare,
  Users,
  Calendar,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

// Mock data
const mockIncidents = [
  {
    id: 'INC-001',
    title: 'Ödeme sistemi gecikmesi',
    description: 'Stripe API yanıt süreleri normalin üzerinde',
    status: 'investigating',
    severity: 'major',
    affected_services: ['payments', 'subscriptions'],
    created_at: '2024-12-18T14:30:00Z',
    updated_at: '2024-12-18T15:00:00Z',
    resolved_at: null,
    assignee: 'Ahmet Y.',
    updates: [
      {
        id: 1,
        message: 'Sorun tespit edildi, Stripe ile iletişime geçildi',
        author: 'Ahmet Y.',
        created_at: '2024-12-18T14:45:00Z',
      },
      {
        id: 2,
        message: 'Stripe tarafında çalışmalar devam ediyor',
        author: 'Ahmet Y.',
        created_at: '2024-12-18T15:00:00Z',
      },
    ],
  },
  {
    id: 'INC-002',
    title: 'Push bildirimleri gönderilemiyor',
    description: 'FCM token yenileme sorunu',
    status: 'identified',
    severity: 'minor',
    affected_services: ['notifications'],
    created_at: '2024-12-18T12:00:00Z',
    updated_at: '2024-12-18T13:30:00Z',
    resolved_at: null,
    assignee: 'Elif K.',
    updates: [
      {
        id: 1,
        message: 'FCM token yenileme mekanizması güncelleniyor',
        author: 'Elif K.',
        created_at: '2024-12-18T13:30:00Z',
      },
    ],
  },
  {
    id: 'INC-003',
    title: 'Veritabanı bağlantı havuzu tükendi',
    description: 'Yoğun trafik nedeniyle bağlantı havuzu doldu',
    status: 'resolved',
    severity: 'critical',
    affected_services: ['api', 'database', 'auth'],
    created_at: '2024-12-17T22:00:00Z',
    updated_at: '2024-12-17T23:45:00Z',
    resolved_at: '2024-12-17T23:45:00Z',
    assignee: 'Mehmet D.',
    updates: [
      {
        id: 1,
        message: 'Sorun tespit edildi, bağlantı havuzu genişletiliyor',
        author: 'Mehmet D.',
        created_at: '2024-12-17T22:15:00Z',
      },
      {
        id: 2,
        message: "Bağlantı havuzu 100'den 200'e çıkarıldı",
        author: 'Mehmet D.',
        created_at: '2024-12-17T22:30:00Z',
      },
      {
        id: 3,
        message: 'Sistem normale döndü, izleme devam ediyor',
        author: 'Mehmet D.',
        created_at: '2024-12-17T23:45:00Z',
      },
    ],
    postmortem: {
      summary:
        'Beklenenden yüksek trafik nedeniyle veritabanı bağlantı havuzu doldu',
      root_cause: 'Connection pool boyutu yetersizdi',
      action_items: [
        'Bağlantı havuzu boyutunu artır',
        'Auto-scaling kuralları ekle',
        "Monitoring threshold'larını güncelle",
      ],
    },
  },
];

const incidentStats = {
  total: 24,
  active: 2,
  resolved: 22,
  avgResolutionTime: '2.4 saat',
  mttr: '1.8 saat',
};

export default function IncidentsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<
    (typeof mockIncidents)[0] | null
  >(null);

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        label: string;
        icon: React.ReactNode;
      }
    > = {
      investigating: {
        variant: 'destructive',
        label: 'İnceleniyor',
        icon: <AlertCircle className="h-3 w-3" />,
      },
      identified: {
        variant: 'secondary',
        label: 'Tespit Edildi',
        icon: <Eye className="h-3 w-3" />,
      },
      monitoring: {
        variant: 'outline',
        label: 'İzleniyor',
        icon: <Clock className="h-3 w-3" />,
      },
      resolved: {
        variant: 'default',
        label: 'Çözüldü',
        icon: <CheckCircle className="h-3 w-3" />,
      },
    };
    const { variant, label, icon } = variants[status] || {
      variant: 'outline',
      label: status,
      icon: null,
    };
    return (
      <Badge variant={variant} className="gap-1">
        {icon}
        {label}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      major: 'bg-orange-100 text-orange-800 border-orange-200',
      minor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      maintenance: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    const labels: Record<string, string> = {
      critical: 'Kritik',
      major: 'Büyük',
      minor: 'Küçük',
      maintenance: 'Bakım',
    };
    return (
      <Badge variant="outline" className={colors[severity]}>
        {labels[severity] || severity}
      </Badge>
    );
  };

  const handleCreateIncident = () => {
    toast.success('Olay oluşturuldu');
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Olay Yönetimi</h1>
          <p className="text-muted-foreground">
            Sistem olaylarını ve kesintileri yönetin
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Olay
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Yeni Olay Bildirimi</DialogTitle>
              <DialogDescription>
                Sistem olayı veya kesinti bildirin
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Başlık</Label>
                <Input id="title" placeholder="Olay başlığı" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  placeholder="Olayın detaylı açıklaması"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Önem Seviyesi</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Kritik</SelectItem>
                      <SelectItem value="major">Büyük</SelectItem>
                      <SelectItem value="minor">Küçük</SelectItem>
                      <SelectItem value="maintenance">Bakım</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Atama</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ahmet">Ahmet Y.</SelectItem>
                      <SelectItem value="elif">Elif K.</SelectItem>
                      <SelectItem value="mehmet">Mehmet D.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Etkilenen Servisler</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                  >
                    API
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                  >
                    Database
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                  >
                    Auth
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                  >
                    Payments
                  </Badge>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                  >
                    Notifications
                  </Badge>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleCreateIncident}>Olay Oluştur</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{incidentStats.total}</p>
              <p className="text-sm text-muted-foreground">Toplam Olay</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {incidentStats.active}
              </p>
              <p className="text-sm text-muted-foreground">Aktif</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {incidentStats.resolved}
              </p>
              <p className="text-sm text-muted-foreground">Çözüldü</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {incidentStats.avgResolutionTime}
              </p>
              <p className="text-sm text-muted-foreground">Ort. Çözüm Süresi</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{incidentStats.mttr}</p>
              <p className="text-sm text-muted-foreground">MTTR</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incidents List */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Aktif ({mockIncidents.filter((i) => i.status !== 'resolved').length}
            )
          </TabsTrigger>
          <TabsTrigger value="resolved">
            <CheckCircle className="mr-2 h-4 w-4" />
            Çözülmüş
          </TabsTrigger>
          <TabsTrigger value="all">Tümü</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {mockIncidents
            .filter((i) => i.status !== 'resolved')
            .map((incident) => (
              <Card key={incident.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          incident.severity === 'critical'
                            ? 'bg-red-100'
                            : incident.severity === 'major'
                              ? 'bg-orange-100'
                              : 'bg-yellow-100'
                        }`}
                      >
                        <AlertTriangle
                          className={`h-6 w-6 ${
                            incident.severity === 'critical'
                              ? 'text-red-600'
                              : incident.severity === 'major'
                                ? 'text-orange-600'
                                : 'text-yellow-600'
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">
                            {incident.id}
                          </span>
                          <h3 className="font-semibold">{incident.title}</h3>
                          {getStatusBadge(incident.status)}
                          {getSeverityBadge(incident.severity)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {incident.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {incident.assignee}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Başlangıç: {formatDate(incident.created_at)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {incident.affected_services.map((service) => (
                            <Badge
                              key={service}
                              variant="outline"
                              className="text-xs"
                            >
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Güncelleme Ekle
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setSelectedIncident(incident)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Detaylar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Çözüldü Olarak İşaretle
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Updates Timeline */}
                  {incident.updates.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <p className="text-sm font-medium mb-2">
                        Son Güncellemeler
                      </p>
                      <div className="space-y-2">
                        {incident.updates.slice(-2).map((update) => (
                          <div
                            key={update.id}
                            className="flex items-start gap-2 text-sm"
                          >
                            <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                            <div>
                              <p>{update.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {update.author} •{' '}
                                {formatDate(update.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          {mockIncidents
            .filter((i) => i.status === 'resolved')
            .map((incident) => (
              <Card key={incident.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-muted-foreground">
                            {incident.id}
                          </span>
                          <h3 className="font-semibold">{incident.title}</h3>
                          {getStatusBadge(incident.status)}
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            Çözüldü: {formatDate(incident.resolved_at!)}
                          </span>
                          <span>Süre: 1.75 saat</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedIncident(incident)}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Post-mortem
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="all">
          <p className="text-muted-foreground">
            Tüm olaylar burada listelenir...
          </p>
        </TabsContent>
      </Tabs>

      {/* Incident Detail Dialog */}
      <Dialog
        open={!!selectedIncident}
        onOpenChange={() => setSelectedIncident(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedIncident?.id} - {selectedIncident?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedIncident?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedIncident && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {getStatusBadge(selectedIncident.status)}
                {getSeverityBadge(selectedIncident.severity)}
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium">Güncelleme Geçmişi</p>
                <div className="space-y-3">
                  {selectedIncident.updates.map((update) => (
                    <div
                      key={update.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                      <div>
                        <p>{update.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {update.author} • {formatDate(update.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedIncident.postmortem && (
                <div className="rounded-lg border p-4 space-y-2">
                  <p className="text-sm font-medium">Post-mortem</p>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Özet:</strong>{' '}
                      {selectedIncident.postmortem.summary}
                    </p>
                    <p>
                      <strong>Kök Neden:</strong>{' '}
                      {selectedIncident.postmortem.root_cause}
                    </p>
                    <div>
                      <strong>Aksiyon Maddeleri:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {selectedIncident.postmortem.action_items.map(
                          (item, i) => (
                            <li key={i}>{item}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedIncident(null)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

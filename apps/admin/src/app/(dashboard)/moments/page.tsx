'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatRelativeDate, getInitials } from '@/lib/utils';

// Mock data
const mockMoments = [
  {
    id: '1',
    title: 'Paris Gezisi',
    description: 'Eyfel Kulesinde harika bir gün geçirdik!',
    location: 'Paris, Fransa',
    images: ['/placeholder-1.jpg'],
    status: 'pending',
    user: { id: 'u1', full_name: 'Ali Veli', avatar_url: null },
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: '2',
    title: 'Barcelona Plajları',
    description: 'Barceloneta sahilinde gün batımı',
    location: 'Barcelona, İspanya',
    images: ['/placeholder-2.jpg'],
    status: 'pending',
    user: { id: 'u2', full_name: 'Ayşe Yılmaz', avatar_url: null },
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: '3',
    title: 'Roma Tatili',
    description: 'Colosseum ve tarihi yerler',
    location: 'Roma, İtalya',
    images: ['/placeholder-3.jpg'],
    status: 'approved',
    user: { id: 'u3', full_name: 'Mehmet Demir', avatar_url: null },
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: '4',
    title: 'Amsterdam Kanalları',
    description: 'Bisiklet turu ile kanal gezisi',
    location: 'Amsterdam, Hollanda',
    images: ['/placeholder-4.jpg'],
    status: 'rejected',
    user: { id: 'u4', full_name: 'Zeynep Kara', avatar_url: null },
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    moderation_notes: 'Uygunsuz içerik tespit edildi',
  },
];

const statusConfig = {
  pending: { label: 'Bekliyor', variant: 'warning' as const, icon: Clock },
  approved: { label: 'Onaylandı', variant: 'success' as const, icon: CheckCircle },
  rejected: { label: 'Reddedildi', variant: 'error' as const, icon: XCircle },
};

export default function MomentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedMoment, setSelectedMoment] = useState<typeof mockMoments[0] | null>(null);

  const filteredMoments = mockMoments.filter((moment) => {
    const matchesSearch =
      moment.title.toLowerCase().includes(search.toLowerCase()) ||
      moment.user.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || moment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = mockMoments.filter((m) => m.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Momentler</h1>
          <p className="text-muted-foreground">
            Kullanıcı paylaşımlarını inceleyin ve yönetin
          </p>
        </div>
        <Badge variant="warning" className="h-8 px-3 text-sm">
          {pendingCount} onay bekliyor
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Moment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24,582</div>
            <p className="text-xs text-muted-foreground">+1,234 bu hafta</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Onay Bekleyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">İnceleme bekliyor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bugün Onaylanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">156</div>
            <p className="text-xs text-muted-foreground">Yayına alındı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reddedilen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">12</div>
            <p className="text-xs text-muted-foreground">Bu hafta</p>
          </CardContent>
        </Card>
      </div>

      {/* Moment List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>İçerik Moderasyonu</CardTitle>
              <CardDescription>
                Paylaşımları inceleyin, onaylayın veya reddedin
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Başlık veya kullanıcı ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="pending">Bekleyen</SelectItem>
                <SelectItem value="approved">Onaylanan</SelectItem>
                <SelectItem value="rejected">Reddedilen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMoments.map((moment) => {
              const statusInfo = statusConfig[moment.status as keyof typeof statusConfig];
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={moment.id} className="overflow-hidden">
                  {/* Image placeholder */}
                  <div className="relative aspect-video bg-muted">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <div className="absolute right-2 top-2">
                      <Badge variant={statusInfo.variant}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={moment.user.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {getInitials(moment.user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {moment.user.full_name}
                      </span>
                    </div>
                    <h3 className="font-semibold">{moment.title}</h3>
                    <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                      {moment.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {moment.location}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeDate(moment.created_at)}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setSelectedMoment(moment)}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        İncele
                      </Button>
                      {moment.status === 'pending' && (
                        <>
                          <Button size="sm" variant="default" className="flex-1">
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Onayla
                          </Button>
                          <Button size="sm" variant="destructive">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredMoments.length === 0 && (
            <div className="py-12 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Moment bulunamadı</h3>
              <p className="text-muted-foreground">
                Arama kriterlerine uygun içerik yok
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedMoment} onOpenChange={() => setSelectedMoment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMoment?.title}</DialogTitle>
            <DialogDescription>
              {selectedMoment?.user.full_name} tarafından paylaşıldı
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video rounded-lg bg-muted">
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
              </div>
            </div>
            <div>
              <h4 className="mb-1 font-medium">Açıklama</h4>
              <p className="text-muted-foreground">{selectedMoment?.description}</p>
            </div>
            <div>
              <h4 className="mb-1 font-medium">Konum</h4>
              <p className="text-muted-foreground">{selectedMoment?.location}</p>
            </div>
            {selectedMoment?.moderation_notes && (
              <div className="rounded-lg bg-destructive/10 p-3">
                <h4 className="mb-1 font-medium text-destructive">Moderasyon Notu</h4>
                <p className="text-sm text-destructive">{selectedMoment.moderation_notes}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMoment(null)}>
              Kapat
            </Button>
            {selectedMoment?.status === 'pending' && (
              <>
                <Button variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Reddet
                </Button>
                <Button>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Onayla
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

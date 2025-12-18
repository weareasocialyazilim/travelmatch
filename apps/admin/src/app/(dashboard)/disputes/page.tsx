'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  MessageSquare,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatRelativeDate, getInitials } from '@/lib/utils';

// Mock data
const mockDisputes = [
  {
    id: '1',
    type: 'scam',
    description: 'Kullanıcı ödeme aldıktan sonra hizmet vermedi',
    reporter: { id: 'r1', full_name: 'Ali Veli', avatar_url: null },
    reported: { id: 'rp1', full_name: 'Ahmet Yılmaz', avatar_url: null },
    status: 'open',
    evidence: ['screenshot1.jpg', 'chat_log.txt'],
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: '2',
    type: 'harassment',
    description: 'Kullanıcı uygunsuz mesajlar gönderdi',
    reporter: { id: 'r2', full_name: 'Ayşe Kara', avatar_url: null },
    reported: { id: 'rp2', full_name: 'Mehmet Demir', avatar_url: null },
    status: 'investigating',
    evidence: ['message_screenshot.jpg'],
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: '3',
    type: 'inappropriate',
    description: 'Profilde uygunsuz fotoğraf paylaşıldı',
    reporter: { id: 'r3', full_name: 'Zeynep Öz', avatar_url: null },
    reported: { id: 'rp3', full_name: 'Can Yıldız', avatar_url: null },
    status: 'resolved',
    evidence: [],
    resolution: 'Kullanıcı uyarıldı, içerik kaldırıldı',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '4',
    type: 'spam',
    description: 'Kullanıcı sürekli reklam içerikli mesaj gönderiyor',
    reporter: { id: 'r4', full_name: 'Deniz Ak', avatar_url: null },
    reported: { id: 'rp4', full_name: 'Reklam Hesabı', avatar_url: null },
    status: 'dismissed',
    evidence: [],
    resolution: 'Şikayet geçersiz bulundu',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

const statusConfig = {
  open: { label: 'Açık', variant: 'error' as const },
  investigating: { label: 'İnceleniyor', variant: 'warning' as const },
  resolved: { label: 'Çözüldü', variant: 'success' as const },
  dismissed: { label: 'Reddedildi', variant: 'secondary' as const },
};

const typeConfig = {
  scam: { label: 'Dolandırıcılık', color: 'text-red-600' },
  harassment: { label: 'Taciz', color: 'text-orange-600' },
  inappropriate: { label: 'Uygunsuz İçerik', color: 'text-yellow-600' },
  spam: { label: 'Spam', color: 'text-blue-600' },
  other: { label: 'Diğer', color: 'text-gray-600' },
};

export default function DisputesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredDisputes = mockDisputes.filter((dispute) => {
    const matchesSearch =
      dispute.reporter.full_name.toLowerCase().includes(search.toLowerCase()) ||
      dispute.reported.full_name.toLowerCase().includes(search.toLowerCase()) ||
      dispute.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;
    const matchesType = typeFilter === 'all' || dispute.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const openCount = mockDisputes.filter((d) => d.status === 'open').length;
  const investigatingCount = mockDisputes.filter((d) => d.status === 'investigating').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Anlaşmazlıklar</h1>
          <p className="text-muted-foreground">
            Kullanıcı şikayetlerini inceleyin ve çözümleyin
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="error" className="h-8 px-3 text-sm">
            {openCount} açık
          </Badge>
          <Badge variant="warning" className="h-8 px-3 text-sm">
            {investigatingCount} inceleniyor
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Açık Şikayetler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{openCount}</div>
            <p className="text-xs text-muted-foreground">Acil ilgi bekliyor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">İncelenen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{investigatingCount}</div>
            <p className="text-xs text-muted-foreground">Değerlendirme altında</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bu Hafta Çözülen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">28</div>
            <p className="text-xs text-muted-foreground">Başarıyla kapatıldı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ort. Çözüm Süresi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2</div>
            <p className="text-xs text-muted-foreground">saat</p>
          </CardContent>
        </Card>
      </div>

      {/* Dispute List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Şikayet Listesi</CardTitle>
              <CardDescription>
                Tüm kullanıcı şikayetlerini görüntüleyin ve yönetin
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı veya açıklama ara..."
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
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="open">Açık</SelectItem>
                <SelectItem value="investigating">İnceleniyor</SelectItem>
                <SelectItem value="resolved">Çözüldü</SelectItem>
                <SelectItem value="dismissed">Reddedildi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Türler</SelectItem>
                <SelectItem value="scam">Dolandırıcılık</SelectItem>
                <SelectItem value="harassment">Taciz</SelectItem>
                <SelectItem value="inappropriate">Uygunsuz İçerik</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="space-y-3">
            {filteredDisputes.map((dispute) => {
              const statusInfo = statusConfig[dispute.status as keyof typeof statusConfig];
              const typeInfo = typeConfig[dispute.type as keyof typeof typeConfig];

              return (
                <div
                  key={dispute.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <AlertTriangle className={`h-5 w-5 ${typeInfo.color}`} />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                      <p className="mb-2 text-sm text-muted-foreground line-clamp-1">
                        {dispute.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span>Şikayet eden:</span>
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-[8px]">
                              {getInitials(dispute.reporter.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{dispute.reporter.full_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>Hakkında:</span>
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-[8px]">
                              {getInitials(dispute.reported.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{dispute.reported.full_name}</span>
                        </div>
                        <span>{formatRelativeDate(dispute.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="mr-1 h-4 w-4" />
                      İncele
                    </Button>
                    {(dispute.status === 'open' || dispute.status === 'investigating') && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Kullanıcıya Mesaj
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-green-600">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Çözüldü İşaretle
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-muted-foreground">
                            <XCircle className="mr-2 h-4 w-4" />
                            Reddet
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredDisputes.length === 0 && (
            <div className="py-12 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-semibold">Şikayet bulunamadı</h3>
              <p className="text-muted-foreground">
                Arama kriterlerine uygun şikayet yok
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

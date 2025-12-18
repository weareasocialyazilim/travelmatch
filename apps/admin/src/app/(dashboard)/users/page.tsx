'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  Download,
  Plus,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate, formatCurrency, getInitials } from '@/lib/utils';

// Mock data
const mockUsers = [
  {
    id: '1',
    full_name: 'Ali Veli',
    email: 'ali@example.com',
    avatar_url: null,
    status: 'active',
    kyc_status: 'verified',
    balance: 1500,
    total_trips: 12,
    rating: 4.8,
    created_at: '2024-01-15T10:00:00Z',
    last_active_at: '2024-12-17T14:30:00Z',
  },
  {
    id: '2',
    full_name: 'Ayşe Yılmaz',
    email: 'ayse@example.com',
    avatar_url: null,
    status: 'active',
    kyc_status: 'pending',
    balance: 850,
    total_trips: 5,
    rating: 4.5,
    created_at: '2024-03-20T08:00:00Z',
    last_active_at: '2024-12-16T09:15:00Z',
  },
  {
    id: '3',
    full_name: 'Mehmet Demir',
    email: 'mehmet@example.com',
    avatar_url: null,
    status: 'suspended',
    kyc_status: 'verified',
    balance: 0,
    total_trips: 8,
    rating: 3.2,
    created_at: '2024-02-10T12:00:00Z',
    last_active_at: '2024-12-10T16:45:00Z',
  },
  {
    id: '4',
    full_name: 'Zeynep Kara',
    email: 'zeynep@example.com',
    avatar_url: null,
    status: 'active',
    kyc_status: 'not_started',
    balance: 200,
    total_trips: 2,
    rating: 5.0,
    created_at: '2024-06-05T14:00:00Z',
    last_active_at: '2024-12-17T11:20:00Z',
  },
];

const statusConfig = {
  active: { label: 'Aktif', variant: 'success' as const },
  suspended: { label: 'Askıya Alındı', variant: 'warning' as const },
  banned: { label: 'Yasaklandı', variant: 'error' as const },
  pending: { label: 'Beklemede', variant: 'secondary' as const },
};

const kycStatusConfig = {
  not_started: { label: 'Başlamadı', variant: 'secondary' as const },
  pending: { label: 'Bekliyor', variant: 'warning' as const },
  verified: { label: 'Doğrulandı', variant: 'success' as const },
  rejected: { label: 'Reddedildi', variant: 'error' as const },
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kullanıcılar</h1>
          <p className="text-muted-foreground">
            Platform kullanıcılarını yönetin
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Dışa Aktar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,847</div>
            <p className="text-xs text-muted-foreground">+234 bu ay</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aktif Kullanıcı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,421</div>
            <p className="text-xs text-muted-foreground">Son 30 günde</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">KYC Bekleyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Onay bekliyor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Askıya Alınan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Aktif olmayan</p>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kullanıcı Listesi</CardTitle>
              <CardDescription>
                Tüm kayıtlı kullanıcıları görüntüleyin ve yönetin
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
                placeholder="İsim veya e-posta ile ara..."
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
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="suspended">Askıya Alınmış</SelectItem>
                <SelectItem value="banned">Yasaklanmış</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <div className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
              <div>Kullanıcı</div>
              <div>E-posta</div>
              <div>Durum</div>
              <div>KYC</div>
              <div>Bakiye</div>
              <div>Puan</div>
              <div></div>
            </div>
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto_auto] items-center gap-4 border-b px-4 py-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      href={`/users/${user.id}`}
                      className="font-medium hover:underline"
                    >
                      {user.full_name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {user.total_trips} seyahat
                    </p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
                <Badge variant={statusConfig[user.status as keyof typeof statusConfig].variant}>
                  {statusConfig[user.status as keyof typeof statusConfig].label}
                </Badge>
                <Badge variant={kycStatusConfig[user.kyc_status as keyof typeof kycStatusConfig].variant}>
                  {kycStatusConfig[user.kyc_status as keyof typeof kycStatusConfig].label}
                </Badge>
                <div className="text-sm font-medium">
                  {formatCurrency(user.balance)}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-yellow-500">★</span>
                  {user.rating.toFixed(1)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/users/${user.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Detay Görüntüle
                      </Link>
                    </DropdownMenuItem>
                    {user.status === 'active' ? (
                      <DropdownMenuItem className="text-warning">
                        <Ban className="mr-2 h-4 w-4" />
                        Askıya Al
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="text-success">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Aktif Et
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Arama kriterlerine uygun kullanıcı bulunamadı
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  History,
  Search,
  Download,
  Eye,
  User,
  Settings,
  Shield,
  DollarSign,
  FileText,
  Clock,
  MapPin,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Calendar,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { CanvaButton } from '@/components/canva/CanvaButton';
import { CanvaInput } from '@/components/canva/CanvaInput';
import {
  CanvaCard,
  CanvaCardHeader,
  CanvaCardTitle,
  CanvaCardSubtitle,
  CanvaCardBody,
  CanvaStatCard,
} from '@/components/canva/CanvaCard';
import { CanvaBadge } from '@/components/canva/CanvaBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDate, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuditLogs } from '@/hooks/use-audit-logs';

const actionLabels: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  'user.ban': {
    label: 'Kullanıcı Yasaklama',
    color: 'bg-red-100 text-red-800',
    icon: Shield,
  },
  'user.unban': {
    label: 'Yasak Kaldırma',
    color: 'bg-green-100 text-green-800',
    icon: Shield,
  },
  'user.update': {
    label: 'Kullanıcı Güncelleme',
    color: 'bg-blue-100 text-blue-800',
    icon: User,
  },
  'user.delete': {
    label: 'Kullanıcı Silme',
    color: 'bg-red-100 text-red-800',
    icon: User,
  },
  'user.verify': {
    label: 'Kullanıcı Doğrulama',
    color: 'bg-green-100 text-green-800',
    icon: User,
  },
  'moment.approve': {
    label: 'Moment Onay',
    color: 'bg-green-100 text-green-800',
    icon: FileText,
  },
  'moment.reject': {
    label: 'Moment Red',
    color: 'bg-red-100 text-red-800',
    icon: FileText,
  },
  'moment.delete': {
    label: 'Moment Silme',
    color: 'bg-red-100 text-red-800',
    icon: FileText,
  },
  'transaction.approve': {
    label: 'İşlem Onay',
    color: 'bg-green-100 text-green-800',
    icon: DollarSign,
  },
  'transaction.refund': {
    label: 'İade İşlemi',
    color: 'bg-orange-100 text-orange-800',
    icon: DollarSign,
  },
  'settings.update': {
    label: 'Ayar Değişikliği',
    color: 'bg-purple-100 text-purple-800',
    icon: Settings,
  },
  'admin.create': {
    label: 'Admin Oluşturma',
    color: 'bg-blue-100 text-blue-800',
    icon: User,
  },
  'admin.update': {
    label: 'Admin Güncelleme',
    color: 'bg-blue-100 text-blue-800',
    icon: User,
  },
  'admin.delete': {
    label: 'Admin Silme',
    color: 'bg-red-100 text-red-800',
    icon: User,
  },
  'report.resolve': {
    label: 'Rapor Çözümleme',
    color: 'bg-green-100 text-green-800',
    icon: Shield,
  },
  'feature_flag.toggle': {
    label: 'Feature Flag Değişikliği',
    color: 'bg-purple-100 text-purple-800',
    icon: Settings,
  },
  'campaign.create': {
    label: 'Kampanya Oluşturma',
    color: 'bg-blue-100 text-blue-800',
    icon: FileText,
  },
  'campaign.update': {
    label: 'Kampanya Güncelleme',
    color: 'bg-blue-100 text-blue-800',
    icon: FileText,
  },
};

const roleLabels: Record<string, string> = {
  super_admin: 'Süper Admin',
  manager: 'Yönetici',
  moderator: 'Moderatör',
  finance: 'Finans',
  marketing: 'Pazarlama',
  support: 'Destek',
  viewer: 'İzleyici',
};

export default function AuditLogsPage() {
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use real API data
  const { data, isLoading, error, refetch } = useAuditLogs({
    action: actionFilter === 'all' ? undefined : actionFilter,
    limit: 100,
  });

  const logs = data?.logs || [];

  // Filter logs based on search
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === '' ||
      log.admin?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.admin?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Stats
  const todayLogs = logs.filter((log) => {
    const logDate = new Date(log.created_at);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  });

  const weekLogs = logs.filter((log) => {
    const logDate = new Date(log.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo;
  });

  const activeAdmins = new Set(todayLogs.map((log) => log.admin_id)).size;

  // Select all visible
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLogs(paginatedLogs.map((log) => log.id));
    } else {
      setSelectedLogs([]);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const dataToExport =
      selectedLogs.length > 0
        ? logs.filter((log) => selectedLogs.includes(log.id))
        : filteredLogs;

    const headers = [
      'Tarih',
      'Admin',
      'Email',
      'Aksiyon',
      'Kaynak',
      'IP Adresi',
    ];
    const rows = dataToExport.map((log) => [
      formatDate(log.created_at),
      log.admin?.name || 'Bilinmiyor',
      log.admin?.email || '-',
      actionLabels[log.action]?.label || log.action,
      log.resource_type ? `${log.resource_type}:${log.resource_id}` : '-',
      log.ip_address || '-',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`${dataToExport.length} kayıt CSV olarak indirildi`);
  };

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">Bir hata oluştu</h2>
          <p className="text-muted-foreground">
            Audit logları yüklenemedi. Lütfen tekrar deneyin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Tüm admin işlemlerinin detaylı kayıtları
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CanvaButton variant="primary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </CanvaButton>
          <CanvaButton variant="primary" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV İndir
          </CanvaButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugün</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                todayLogs.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">işlem kaydı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Hafta</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                weekLogs.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">işlem kaydı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Admin</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                activeAdmins
              )}
            </div>
            <p className="text-xs text-muted-foreground">bugün işlem yaptı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                data?.total || logs.length
              )}
            </div>
            <p className="text-xs text-muted-foreground">kayıt</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Admin, hedef veya işlem ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="İşlem Tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm İşlemler</SelectItem>
                {Object.entries(actionLabels).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedLogs.length > 0 && (
        <Card className="border-primary">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedLogs.length} kayıt seçildi
              </span>
              <div className="flex items-center gap-2">
                <CanvaButton
                  size="sm"
                  variant="primary"
                  onClick={handleExportCSV}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Seçilenleri İndir
                </CanvaButton>
                <CanvaButton
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedLogs([])}
                >
                  Seçimi Temizle
                </CanvaButton>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>İşlem Kayıtları</CardTitle>
          <CardDescription>{filteredLogs.length} kayıt bulundu</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        paginatedLogs.length > 0 &&
                        paginatedLogs.every((log) =>
                          selectedLogs.includes(log.id),
                        )
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>İşlem</TableHead>
                  <TableHead>Kaynak</TableHead>
                  <TableHead>IP Adresi</TableHead>
                  <TableHead className="text-right">Detay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log) => {
                  const actionInfo = actionLabels[log.action] || {
                    label: log.action,
                    color: 'bg-gray-100 text-gray-800',
                    icon: History,
                  };
                  const ActionIcon = actionInfo.icon;

                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedLogs.includes(log.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLogs([...selectedLogs, log.id]);
                            } else {
                              setSelectedLogs(
                                selectedLogs.filter((id) => id !== log.id),
                              );
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(log.created_at)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={log.admin?.avatar_url || undefined}
                            />
                            <AvatarFallback>
                              {getInitials(log.admin?.name || 'Admin')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {log.admin?.name || 'Bilinmiyor'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {log.admin?.email || '-'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <CanvaBadge
                          className={actionInfo.color}
                          variant="primary"
                        >
                          <ActionIcon className="mr-1 h-3 w-3" />
                          {actionInfo.label}
                        </CanvaBadge>
                      </TableCell>
                      <TableCell>
                        {log.resource_type ? (
                          <div>
                            <p className="text-sm">{log.resource_id}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.resource_type}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-mono">
                            {log.ip_address || '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <CanvaButton variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </CanvaButton>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>İşlem Detayı</DialogTitle>
                              <DialogDescription>
                                {formatDate(log.created_at)}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* Admin Info */}
                              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage
                                    src={log.admin?.avatar_url || undefined}
                                  />
                                  <AvatarFallback>
                                    {getInitials(log.admin?.name || 'Admin')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {log.admin?.name || 'Bilinmiyor'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {log.admin?.email}
                                  </p>
                                </div>
                              </div>

                              {/* Action */}
                              <div>
                                <h4 className="text-sm font-medium mb-2">
                                  İşlem
                                </h4>
                                <CanvaBadge
                                  className={actionInfo.color}
                                  variant="primary"
                                >
                                  <ActionIcon className="mr-1 h-3 w-3" />
                                  {actionInfo.label}
                                </CanvaBadge>
                              </div>

                              {/* Resource */}
                              {log.resource_type && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">
                                    Kaynak
                                  </h4>
                                  <div className="p-3 bg-muted/50 rounded-lg">
                                    <p className="text-sm">
                                      <span className="text-muted-foreground">
                                        Tip:
                                      </span>{' '}
                                      {log.resource_type}
                                    </p>
                                    <p className="text-sm">
                                      <span className="text-muted-foreground">
                                        ID:
                                      </span>{' '}
                                      <code className="font-mono">
                                        {log.resource_id}
                                      </code>
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Changes */}
                              {(log.old_value || log.new_value) && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">
                                    Değişiklikler
                                  </h4>
                                  <div className="p-3 bg-muted/50 rounded-lg text-sm font-mono">
                                    {log.old_value && (
                                      <div className="text-red-600">
                                        -{' '}
                                        {JSON.stringify(log.old_value, null, 2)}
                                      </div>
                                    )}
                                    {log.new_value && (
                                      <div className="text-green-600">
                                        +{' '}
                                        {JSON.stringify(log.new_value, null, 2)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Metadata */}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span>{log.ip_address || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Monitor className="h-4 w-4 text-muted-foreground" />
                                  <span className="truncate text-xs">
                                    {log.user_agent || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {!isLoading && filteredLogs.length === 0 && (
            <div className="py-12 text-center">
              <History className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Kayıt bulunamadı</h3>
              <p className="text-muted-foreground">
                Arama kriterlerine uygun audit log yok
              </p>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {(currentPage - 1) * itemsPerPage + 1} -{' '}
                {Math.min(currentPage * itemsPerPage, filteredLogs.length)} /{' '}
                {filteredLogs.length}
              </p>
              <div className="flex items-center gap-2">
                <CanvaButton
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </CanvaButton>
                <span className="text-sm">
                  {currentPage} / {totalPages}
                </span>
                <CanvaButton
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </CanvaButton>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

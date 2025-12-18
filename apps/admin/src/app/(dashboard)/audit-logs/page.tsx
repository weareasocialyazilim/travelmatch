'use client';

import { useState } from 'react';
import {
  History,
  Search,
  Filter,
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
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

// Audit log types
type AuditAction =
  | 'user.ban'
  | 'user.unban'
  | 'user.update'
  | 'user.delete'
  | 'user.verify'
  | 'moment.approve'
  | 'moment.reject'
  | 'moment.delete'
  | 'transaction.approve'
  | 'transaction.refund'
  | 'settings.update'
  | 'admin.create'
  | 'admin.update'
  | 'admin.delete'
  | 'report.resolve'
  | 'feature_flag.toggle'
  | 'campaign.create'
  | 'campaign.update';

interface AuditLog {
  id: string;
  action: AuditAction;
  admin: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  target?: {
    type: string;
    id: string;
    name?: string;
  };
  changes?: {
    field: string;
    old_value: string | number | boolean | null;
    new_value: string | number | boolean | null;
  }[];
  metadata?: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

// Mock data
const mockAuditLogs: AuditLog[] = [
  {
    id: 'log_1',
    action: 'user.ban',
    admin: {
      id: 'admin_1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet@travelmatch.app',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet',
      role: 'moderator',
    },
    target: { type: 'user', id: 'user_123', name: 'Spam Account' },
    changes: [
      { field: 'status', old_value: 'active', new_value: 'banned' },
      { field: 'ban_reason', old_value: null, new_value: 'Spam içerik paylaşımı' },
    ],
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'log_2',
    action: 'moment.approve',
    admin: {
      id: 'admin_2',
      name: 'Fatma Demir',
      email: 'fatma@travelmatch.app',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatma',
      role: 'moderator',
    },
    target: { type: 'moment', id: 'moment_456' },
    changes: [
      { field: 'status', old_value: 'pending', new_value: 'approved' },
    ],
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'log_3',
    action: 'transaction.refund',
    admin: {
      id: 'admin_3',
      name: 'Mehmet Kaya',
      email: 'mehmet@travelmatch.app',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet',
      role: 'finance',
    },
    target: { type: 'transaction', id: 'txn_789', name: '₺150.00 iade' },
    changes: [
      { field: 'status', old_value: 'completed', new_value: 'refunded' },
      { field: 'refund_amount', old_value: null, new_value: 150 },
    ],
    metadata: { reason: 'Müşteri talebi', ticket_id: 'ticket_123' },
    ip_address: '192.168.1.102',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'log_4',
    action: 'settings.update',
    admin: {
      id: 'admin_4',
      name: 'Zeynep Arslan',
      email: 'zeynep@travelmatch.app',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep',
      role: 'super_admin',
    },
    changes: [
      { field: 'max_daily_swipes', old_value: 50, new_value: 100 },
      { field: 'premium_price_monthly', old_value: 49.99, new_value: 59.99 },
    ],
    ip_address: '192.168.1.103',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'log_5',
    action: 'feature_flag.toggle',
    admin: {
      id: 'admin_4',
      name: 'Zeynep Arslan',
      email: 'zeynep@travelmatch.app',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep',
      role: 'super_admin',
    },
    target: { type: 'feature_flag', id: 'dark_mode', name: 'Dark Mode' },
    changes: [
      { field: 'enabled', old_value: false, new_value: true },
      { field: 'rollout_percentage', old_value: 0, new_value: 25 },
    ],
    ip_address: '192.168.1.103',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'log_6',
    action: 'admin.create',
    admin: {
      id: 'admin_4',
      name: 'Zeynep Arslan',
      email: 'zeynep@travelmatch.app',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep',
      role: 'super_admin',
    },
    target: { type: 'admin', id: 'admin_5', name: 'Yeni Moderatör' },
    changes: [
      { field: 'role', old_value: null, new_value: 'moderator' },
      { field: 'status', old_value: null, new_value: 'active' },
    ],
    ip_address: '192.168.1.103',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'log_7',
    action: 'user.verify',
    admin: {
      id: 'admin_1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet@travelmatch.app',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet',
      role: 'moderator',
    },
    target: { type: 'user', id: 'user_555', name: 'Premium Kullanıcı' },
    changes: [
      { field: 'is_verified', old_value: false, new_value: true },
      { field: 'verification_type', old_value: null, new_value: 'id_card' },
    ],
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'log_8',
    action: 'campaign.create',
    admin: {
      id: 'admin_6',
      name: 'Can Öztürk',
      email: 'can@travelmatch.app',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=can',
      role: 'marketing',
    },
    target: { type: 'campaign', id: 'camp_001', name: 'Yılbaşı Kampanyası' },
    changes: [
      { field: 'status', old_value: null, new_value: 'draft' },
      { field: 'budget', old_value: null, new_value: 50000 },
    ],
    ip_address: '192.168.1.104',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
];

const actionLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  'user.ban': { label: 'Kullanıcı Yasaklama', color: 'bg-red-100 text-red-800', icon: Shield },
  'user.unban': { label: 'Yasak Kaldırma', color: 'bg-green-100 text-green-800', icon: Shield },
  'user.update': { label: 'Kullanıcı Güncelleme', color: 'bg-blue-100 text-blue-800', icon: User },
  'user.delete': { label: 'Kullanıcı Silme', color: 'bg-red-100 text-red-800', icon: User },
  'user.verify': { label: 'Kullanıcı Doğrulama', color: 'bg-green-100 text-green-800', icon: User },
  'moment.approve': { label: 'Moment Onay', color: 'bg-green-100 text-green-800', icon: FileText },
  'moment.reject': { label: 'Moment Red', color: 'bg-red-100 text-red-800', icon: FileText },
  'moment.delete': { label: 'Moment Silme', color: 'bg-red-100 text-red-800', icon: FileText },
  'transaction.approve': { label: 'İşlem Onay', color: 'bg-green-100 text-green-800', icon: DollarSign },
  'transaction.refund': { label: 'İade İşlemi', color: 'bg-orange-100 text-orange-800', icon: DollarSign },
  'settings.update': { label: 'Ayar Değişikliği', color: 'bg-purple-100 text-purple-800', icon: Settings },
  'admin.create': { label: 'Admin Oluşturma', color: 'bg-blue-100 text-blue-800', icon: User },
  'admin.update': { label: 'Admin Güncelleme', color: 'bg-blue-100 text-blue-800', icon: User },
  'admin.delete': { label: 'Admin Silme', color: 'bg-red-100 text-red-800', icon: User },
  'report.resolve': { label: 'Rapor Çözümleme', color: 'bg-green-100 text-green-800', icon: Shield },
  'feature_flag.toggle': { label: 'Feature Flag Değişikliği', color: 'bg-purple-100 text-purple-800', icon: Settings },
  'campaign.create': { label: 'Kampanya Oluşturma', color: 'bg-blue-100 text-blue-800', icon: FileText },
  'campaign.update': { label: 'Kampanya Güncelleme', color: 'bg-blue-100 text-blue-800', icon: FileText },
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
  const [logs] = useState<AuditLog[]>(mockAuditLogs);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [adminFilter, setAdminFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const itemsPerPage = 10;

  // Get unique admins for filter
  const uniqueAdmins = Array.from(new Set(logs.map((log) => log.admin.id))).map((id) => {
    const log = logs.find((l) => l.admin.id === id);
    return log?.admin;
  });

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchQuery === '' ||
      log.admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesAdmin = adminFilter === 'all' || log.admin.id === adminFilter;

    return matchesSearch && matchesAction && matchesAdmin;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    const dataToExport = selectedLogs.length > 0
      ? logs.filter((log) => selectedLogs.includes(log.id))
      : filteredLogs;

    const headers = ['Tarih', 'Admin', 'Email', 'Rol', 'Aksiyon', 'Hedef', 'IP Adresi'];
    const rows = dataToExport.map((log) => [
      formatDate(log.created_at),
      log.admin.name,
      log.admin.email,
      roleLabels[log.admin.role] || log.admin.role,
      actionLabels[log.action]?.label || log.action,
      log.target?.name || log.target?.id || '-',
      log.ip_address,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`${dataToExport.length} kayıt CSV olarak indirildi`);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const dataToExport = selectedLogs.length > 0
      ? logs.filter((log) => selectedLogs.includes(log.id))
      : filteredLogs;

    // Create XML-based Excel file
    const headers = ['Tarih', 'Admin', 'Email', 'Rol', 'Aksiyon', 'Hedef', 'IP Adresi', 'Değişiklikler'];
    const rows = dataToExport.map((log) => [
      formatDate(log.created_at),
      log.admin.name,
      log.admin.email,
      roleLabels[log.admin.role] || log.admin.role,
      actionLabels[log.action]?.label || log.action,
      log.target?.name || log.target?.id || '-',
      log.ip_address,
      log.changes?.map((c) => `${c.field}: ${c.old_value} → ${c.new_value}`).join('; ') || '-',
    ]);

    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlContent += '<?mso-application progid="Excel.Sheet"?>\n';
    xmlContent += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
    xmlContent += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
    xmlContent += '<Worksheet ss:Name="Audit Logs">\n<Table>\n';

    // Header row
    xmlContent += '<Row>\n';
    headers.forEach((h) => {
      xmlContent += `<Cell><Data ss:Type="String">${h}</Data></Cell>\n`;
    });
    xmlContent += '</Row>\n';

    // Data rows
    rows.forEach((row) => {
      xmlContent += '<Row>\n';
      row.forEach((cell) => {
        xmlContent += `<Cell><Data ss:Type="String">${cell}</Data></Cell>\n`;
      });
      xmlContent += '</Row>\n';
    });

    xmlContent += '</Table>\n</Worksheet>\n</Workbook>';

    const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`${dataToExport.length} kayıt Excel olarak indirildi`);
  };

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
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
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
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">işlem kaydı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Hafta</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground">işlem kaydı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Admin</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">bugün işlem yaptı</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kritik İşlem</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">yasaklama/silme</p>
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
            <Select value={adminFilter} onValueChange={setAdminFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Admin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Adminler</SelectItem>
                {uniqueAdmins.map((admin) => (
                  <SelectItem key={admin?.id} value={admin?.id || ''}>
                    {admin?.name}
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
                <Button size="sm" variant="outline" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Seçilenleri CSV İndir
                </Button>
                <Button size="sm" variant="outline" onClick={handleExportExcel}>
                  <Download className="mr-2 h-4 w-4" />
                  Seçilenleri Excel İndir
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedLogs([])}>
                  Seçimi Temizle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>İşlem Kayıtları</CardTitle>
          <CardDescription>
            {filteredLogs.length} kayıt bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      paginatedLogs.length > 0 &&
                      paginatedLogs.every((log) => selectedLogs.includes(log.id))
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>İşlem</TableHead>
                <TableHead>Hedef</TableHead>
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
                            setSelectedLogs(selectedLogs.filter((id) => id !== log.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(log.created_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={log.admin.avatar} />
                          <AvatarFallback>
                            {log.admin.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{log.admin.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {roleLabels[log.admin.role] || log.admin.role}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={actionInfo.color} variant="secondary">
                        <ActionIcon className="mr-1 h-3 w-3" />
                        {actionInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {log.target ? (
                        <div>
                          <p className="text-sm">{log.target.name || log.target.id}</p>
                          <p className="text-xs text-muted-foreground">{log.target.type}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-mono">{log.ip_address}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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
                                <AvatarImage src={log.admin.avatar} />
                                <AvatarFallback>
                                  {log.admin.name.split(' ').map((n) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{log.admin.name}</p>
                                <p className="text-sm text-muted-foreground">{log.admin.email}</p>
                                <Badge variant="outline" className="mt-1">
                                  {roleLabels[log.admin.role] || log.admin.role}
                                </Badge>
                              </div>
                            </div>

                            {/* Action */}
                            <div>
                              <h4 className="text-sm font-medium mb-2">İşlem</h4>
                              <Badge className={actionInfo.color} variant="secondary">
                                <ActionIcon className="mr-1 h-3 w-3" />
                                {actionInfo.label}
                              </Badge>
                            </div>

                            {/* Target */}
                            {log.target && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Hedef</h4>
                                <div className="p-3 bg-muted/50 rounded-lg">
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">Tip:</span>{' '}
                                    {log.target.type}
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">ID:</span>{' '}
                                    <code className="font-mono">{log.target.id}</code>
                                  </p>
                                  {log.target.name && (
                                    <p className="text-sm">
                                      <span className="text-muted-foreground">İsim:</span>{' '}
                                      {log.target.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Changes */}
                            {log.changes && log.changes.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Değişiklikler</h4>
                                <ScrollArea className="h-[150px]">
                                  <div className="space-y-2">
                                    {log.changes.map((change, idx) => (
                                      <div
                                        key={idx}
                                        className="p-3 bg-muted/50 rounded-lg text-sm"
                                      >
                                        <p className="font-medium">{change.field}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-red-600 line-through">
                                            {change.old_value?.toString() || 'null'}
                                          </span>
                                          <span>→</span>
                                          <span className="text-green-600">
                                            {change.new_value?.toString() || 'null'}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            )}

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{log.ip_address}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate text-xs">{log.user_agent}</span>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                {(currentPage - 1) * itemsPerPage + 1} -{' '}
                {Math.min(currentPage * itemsPerPage, filteredLogs.length)} / {filteredLogs.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

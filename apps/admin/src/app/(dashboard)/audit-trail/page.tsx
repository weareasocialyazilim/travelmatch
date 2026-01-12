'use client';

/**
 * Comprehensive Audit Trail Viewer
 * Tüm admin aksiyonlarının takibi - GDPR/KVKK uyumlu
 */

import { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Activity,
  Eye,
  Edit,
  Trash2,
  Shield,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  ChevronDown,
  FileText,
  Settings,
  Users,
  Lock,
  Unlock,
  Ban,
  RefreshCw,
  ExternalLink,
  Copy,
  MoreHorizontal,
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Audit log entries
const auditLogs = [
  {
    id: 'audit-001',
    timestamp: '2024-01-11T11:45:23Z',
    admin: {
      id: 'adm-001',
      name: 'Kemal Y.',
      role: 'super_admin',
      avatar: null,
    },
    action: 'user.suspend',
    resource: { type: 'user', id: 'usr-12345', name: 'Ali Veli' },
    details: { reason: 'Fraud investigation', duration: 'indefinite' },
    ip: '85.105.42.123',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    changes: {
      before: { status: 'active', suspended_at: null },
      after: { status: 'suspended', suspended_at: '2024-01-11T11:45:23Z' },
    },
  },
  {
    id: 'audit-002',
    timestamp: '2024-01-11T11:30:15Z',
    admin: {
      id: 'adm-002',
      name: 'Zeynep K.',
      role: 'moderator',
      avatar: null,
    },
    action: 'proof.verify',
    resource: { type: 'proof', id: 'prf-67890', name: 'Proof #67890' },
    details: { verification_method: 'manual', confidence_override: true },
    ip: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
    changes: {
      before: { status: 'pending', verified_at: null },
      after: { status: 'verified', verified_at: '2024-01-11T11:30:15Z' },
    },
  },
  {
    id: 'audit-003',
    timestamp: '2024-01-11T11:15:42Z',
    admin: { id: 'adm-003', name: 'Ahmet B.', role: 'finance', avatar: null },
    action: 'escrow.release',
    resource: { type: 'escrow', id: 'esc-11111', name: 'Escrow ₺5,200' },
    details: { amount: 5200, currency: 'TRY', recipient: 'usr-99999' },
    ip: '10.0.0.52',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    changes: {
      before: { status: 'pending', released_at: null },
      after: { status: 'released', released_at: '2024-01-11T11:15:42Z' },
    },
  },
  {
    id: 'audit-004',
    timestamp: '2024-01-11T10:55:30Z',
    admin: {
      id: 'adm-001',
      name: 'Kemal Y.',
      role: 'super_admin',
      avatar: null,
    },
    action: 'admin.create',
    resource: { type: 'admin_user', id: 'adm-004', name: 'Elif T.' },
    details: { role: 'support', requires_2fa: true },
    ip: '85.105.42.123',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    changes: {
      before: null,
      after: {
        email: 'elif@travelmatch.com',
        role: 'support',
        is_active: true,
      },
    },
  },
  {
    id: 'audit-005',
    timestamp: '2024-01-11T10:30:18Z',
    admin: {
      id: 'adm-002',
      name: 'Zeynep K.',
      role: 'moderator',
      avatar: null,
    },
    action: 'moment.delete',
    resource: { type: 'moment', id: 'mom-22222', name: 'İstanbul Turu' },
    details: { reason: 'Inappropriate content', report_id: 'rep-55555' },
    ip: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
    changes: {
      before: { status: 'active', deleted_at: null },
      after: { status: 'deleted', deleted_at: '2024-01-11T10:30:18Z' },
    },
  },
  {
    id: 'audit-006',
    timestamp: '2024-01-11T10:15:05Z',
    admin: { id: 'adm-003', name: 'Ahmet B.', role: 'finance', avatar: null },
    action: 'refund.process',
    resource: { type: 'transaction', id: 'txn-33333', name: 'Refund ₺1,800' },
    details: { original_amount: 1800, refund_reason: 'Customer request' },
    ip: '10.0.0.52',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'failed',
    error: 'PayTR gateway timeout',
    changes: null,
  },
];

// Action categories
const actionCategories = [
  { key: 'user', label: 'Kullanıcı', icon: Users, count: 45 },
  { key: 'content', label: 'İçerik', icon: FileText, count: 89 },
  { key: 'payment', label: 'Ödeme', icon: DollarSign, count: 123 },
  { key: 'security', label: 'Güvenlik', icon: Shield, count: 34 },
  { key: 'system', label: 'Sistem', icon: Settings, count: 12 },
];

// Admin activity summary
const adminActivity = [
  {
    admin: 'Kemal Y.',
    role: 'super_admin',
    actions: 156,
    lastActive: '5 dk önce',
  },
  {
    admin: 'Zeynep K.',
    role: 'moderator',
    actions: 234,
    lastActive: '12 dk önce',
  },
  {
    admin: 'Ahmet B.',
    role: 'finance',
    actions: 89,
    lastActive: '1 saat önce',
  },
  { admin: 'Elif T.', role: 'support', actions: 45, lastActive: '30 dk önce' },
];

export default function AuditTrailPage() {
  const [selectedLog, setSelectedLog] = useState<(typeof auditLogs)[0] | null>(
    null,
  );
  const [filter, setFilter] = useState({
    admin: 'all',
    action: 'all',
    status: 'all',
    dateRange: '7d',
  });

  const getActionIcon = (action: string) => {
    if (action.includes('create'))
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (action.includes('delete'))
      return <Trash2 className="h-4 w-4 text-red-500" />;
    if (action.includes('update') || action.includes('edit'))
      return <Edit className="h-4 w-4 text-blue-500" />;
    if (action.includes('suspend') || action.includes('ban'))
      return <Ban className="h-4 w-4 text-orange-500" />;
    if (action.includes('verify') || action.includes('approve'))
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (action.includes('release') || action.includes('refund'))
      return <DollarSign className="h-4 w-4 text-purple-500" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'user.suspend': 'Kullanıcı Askıya Alındı',
      'user.ban': 'Kullanıcı Yasaklandı',
      'user.unsuspend': 'Askı Kaldırıldı',
      'proof.verify': 'Proof Doğrulandı',
      'proof.reject': 'Proof Reddedildi',
      'escrow.release': 'Escrow Serbest Bırakıldı',
      'escrow.refund': 'Escrow İade Edildi',
      'moment.delete': 'Moment Silindi',
      'moment.approve': 'Moment Onaylandı',
      'admin.create': 'Admin Oluşturuldu',
      'admin.update': 'Admin Güncellendi',
      'refund.process': 'İade İşlendi',
      'settings.update': 'Ayarlar Güncellendi',
    };
    return labels[action] || action;
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      super_admin: 'bg-purple-500/10 text-purple-500',
      manager: 'bg-blue-500/10 text-blue-500',
      moderator: 'bg-green-500/10 text-green-500',
      finance: 'bg-yellow-500/10 text-yellow-500',
      support: 'bg-orange-500/10 text-orange-500',
    };
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      manager: 'Manager',
      moderator: 'Moderator',
      finance: 'Finance',
      support: 'Support',
    };
    return (
      <CanvaBadge className={styles[role] || 'bg-muted text-muted-foreground'}>
        {labels[role] || role}
      </CanvaBadge>
    );
  };

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return {
      date: date.toLocaleDateString('tr-TR'),
      time: date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Trail</h1>
          <p className="text-muted-foreground">
            Tüm admin aksiyonlarının detaylı kaydı
          </p>
        </div>
        <div className="flex gap-2">
          <CanvaButton variant="ghost">
            <Download className="h-4 w-4 mr-2" />
            Export
          </CanvaButton>
          <CanvaButton variant="ghost">
            <Calendar className="h-4 w-4 mr-2" />
            Son 7 Gün
          </CanvaButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {actionCategories.map((cat) => (
          <CanvaCard key={cat.key} className="admin-card">
            <CanvaCardBody className="p-4">
              <div className="flex items-center justify-between">
                <cat.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{cat.count}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{cat.label}</p>
            </CanvaCardBody>
          </CanvaCard>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Main Log Table */}
        <CanvaCard className="admin-card col-span-3">
          <CanvaCardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CanvaCardTitle>Aksiyon Logları</CanvaCardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Ara..." className="pl-9 w-[200px]" />
                </div>
                <Select
                  value={filter.admin}
                  onValueChange={(v) => setFilter({ ...filter, admin: v })}
                >
                  <SelectTrigger className="w-[150px]">
                    <User className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Admin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Adminler</SelectItem>
                    <SelectItem value="adm-001">Kemal Y.</SelectItem>
                    <SelectItem value="adm-002">Zeynep K.</SelectItem>
                    <SelectItem value="adm-003">Ahmet B.</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filter.status}
                  onValueChange={(v) => setFilter({ ...filter, status: v })}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="success">Başarılı</SelectItem>
                    <SelectItem value="failed">Başarısız</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CanvaCardHeader>
          <CanvaCardBody>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zaman</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Aksiyon</TableHead>
                  <TableHead>Kaynak</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">Detay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => {
                  const ts = formatTimestamp(log.timestamp);
                  return (
                    <TableRow
                      key={log.id}
                      className={cn(
                        'cursor-pointer hover:bg-muted/50',
                        log.status === 'failed' && 'bg-red-500/5',
                      )}
                      onClick={() => setSelectedLog(log)}
                    >
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{ts.time}</p>
                          <p className="text-xs text-muted-foreground">
                            {ts.date}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs">
                              {log.admin.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {log.admin.name}
                            </p>
                            {getRoleBadge(log.admin.role)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className="text-sm">
                            {getActionLabel(log.action)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{log.resource.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {log.resource.id}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.status === 'success' ? (
                          <CanvaBadge className="bg-green-500/10 text-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Başarılı
                          </CanvaBadge>
                        ) : (
                          <CanvaBadge className="bg-red-500/10 text-red-500">
                            <XCircle className="h-3 w-3 mr-1" />
                            Başarısız
                          </CanvaBadge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <CanvaButton variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </CanvaButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CanvaCardBody>
        </CanvaCard>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Admin Activity */}
          <CanvaCard className="admin-card">
            <CanvaCardHeader className="pb-2">
              <CanvaCardTitle className="text-base">Admin Aktivitesi</CanvaCardTitle>
            </CanvaCardHeader>
            <CanvaCardBody className="space-y-3">
              {adminActivity.map((admin) => (
                <div
                  key={admin.admin}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {admin.admin.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{admin.admin}</p>
                      <p className="text-xs text-muted-foreground">
                        {admin.lastActive}
                      </p>
                    </div>
                  </div>
                  <CanvaBadge variant="secondary">{admin.actions}</CanvaBadge>
                </div>
              ))}
            </CanvaCardBody>
          </CanvaCard>

          {/* Selected Log Detail */}
          {selectedLog && (
            <CanvaCard className="admin-card">
              <CanvaCardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CanvaCardTitle className="text-base">Log Detayı</CanvaCardTitle>
                  <CanvaButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLog(null)}
                  >
                    <XCircle className="h-4 w-4" />
                  </CanvaButton>
                </div>
              </CanvaCardHeader>
              <CanvaCardBody className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">ID</p>
                  <p className="font-mono">{selectedLog.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">IP Adresi</p>
                  <p className="font-mono">{selectedLog.ip}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">User Agent</p>
                  <p className="text-xs break-all">{selectedLog.userAgent}</p>
                </div>
                {selectedLog.changes && (
                  <div>
                    <p className="text-muted-foreground mb-1">Değişiklikler</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-red-500/10">
                        <p className="font-medium text-red-500">Önceki</p>
                        <pre className="mt-1 overflow-auto">
                          {JSON.stringify(selectedLog.changes.before, null, 2)}
                        </pre>
                      </div>
                      <div className="p-2 rounded bg-green-500/10">
                        <p className="font-medium text-green-500">Sonraki</p>
                        <pre className="mt-1 overflow-auto">
                          {JSON.stringify(selectedLog.changes.after, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
                {selectedLog.error && (
                  <div className="p-2 rounded bg-red-500/10 text-red-500">
                    <p className="font-medium">Hata</p>
                    <p className="text-xs">{selectedLog.error}</p>
                  </div>
                )}
              </CanvaCardBody>
            </CanvaCard>
          )}
        </div>
      </div>
    </div>
  );
}

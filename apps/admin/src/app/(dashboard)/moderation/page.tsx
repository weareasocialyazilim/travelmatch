'use client';

/**
 * Content Moderation Admin Panel
 *
 * Manage moderation logs, blocked content, warnings, and dictionary.
 */

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Shield,
  Trash2,
  XCircle,
} from 'lucide-react';
import { getClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// =============================================================================
// Types
// =============================================================================

interface ModerationLog {
  id: string;
  user_id: string;
  content_type: string;
  severity: string;
  violations: Array<{ type: string; message: string }>;
  action_taken: string;
  created_at: string;
  user?: {
    full_name: string;
    username: string;
    email: string;
  };
}

interface BlockedContent {
  id: string;
  user_id: string;
  content_type: string;
  violation_reasons: string[];
  appeal_status: string;
  appeal_notes: string | null;
  created_at: string;
  user?: {
    full_name: string;
    username: string;
  };
}

interface UserWarning {
  id: string;
  user_id: string;
  warning_type: string;
  warning_level: number;
  details: string | null;
  expires_at: string | null;
  acknowledged: boolean;
  created_at: string;
  user?: {
    full_name: string;
    username: string;
  };
}

interface DictionaryWord {
  id: string;
  word: string;
  severity: string;
  category: string;
  is_regex: boolean;
  is_active: boolean;
  created_at: string;
}

interface ModerationStats {
  totalLogs: number;
  blockedToday: number;
  activeWarnings: number;
  pendingAppeals: number;
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

// =============================================================================
// Component
// =============================================================================

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [blockedContent, setBlockedContent] = useState<BlockedContent[]>([]);
  const [warnings, setWarnings] = useState<UserWarning[]>([]);
  const [dictionary, setDictionary] = useState<DictionaryWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // New word dialog
  const [showAddWord, setShowAddWord] = useState(false);
  const [newWord, setNewWord] = useState({
    word: '',
    severity: 'medium',
    category: 'profanity',
  });

  const supabase = getClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadLogs(),
        loadBlockedContent(),
        loadWarnings(),
        loadDictionary(),
      ]);
    } catch (error) {
      logger.error('Failed to load moderation data', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    const today = new Date().toISOString().split('T')[0];

    const [logsResult, blockedResult, warningsResult, appealsResult] =
      await Promise.all([
        supabase.from('moderation_logs').select('severity', { count: 'exact' }),
        supabase
          .from('moderation_logs')
          .select('id', { count: 'exact' })
          .eq('action_taken', 'blocked')
          .gte('created_at', today),
        supabase
          .from('user_moderation_warnings')
          .select('id', { count: 'exact' })
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`),
        supabase
          .from('blocked_content')
          .select('id', { count: 'exact' })
          .eq('appeal_status', 'pending'),
      ]);

    // Calculate severity breakdown
    const severityBreakdown = { critical: 0, high: 0, medium: 0, low: 0 };
    if (logsResult.data) {
      (logsResult.data as Array<{ severity: string }>).forEach((log) => {
        const severity = log.severity as keyof typeof severityBreakdown;
        if (severity in severityBreakdown) {
          severityBreakdown[severity]++;
        }
      });
    }

    setStats({
      totalLogs: logsResult.count || 0,
      blockedToday: blockedResult.count || 0,
      activeWarnings: warningsResult.count || 0,
      pendingAppeals: appealsResult.count || 0,
      severityBreakdown,
    });
  }

  async function loadLogs() {
    const { data, error } = await supabase
      .from('moderation_logs')
      .select(
        `
        *,
        user:profiles(full_name, username)
      `,
      )
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      logger.error('Failed to load logs', error);
      return;
    }

    setLogs((data as ModerationLog[]) || []);
  }

  async function loadBlockedContent() {
    const { data, error } = await supabase
      .from('blocked_content')
      .select(
        `
        *,
        user:profiles(full_name, username)
      `,
      )
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      logger.error('Failed to load blocked content', error);
      return;
    }

    setBlockedContent((data as BlockedContent[]) || []);
  }

  async function loadWarnings() {
    const { data, error } = await supabase
      .from('user_moderation_warnings')
      .select(
        `
        *,
        user:profiles(full_name, username)
      `,
      )
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      logger.error('Failed to load warnings', error);
      return;
    }

    setWarnings((data as UserWarning[]) || []);
  }

  async function loadDictionary() {
    const { data, error } = await supabase
      .from('moderation_dictionary')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to load dictionary', error);
      return;
    }

    setDictionary((data as DictionaryWord[]) || []);
  }

  async function handleApproveAppeal(id: string) {
    const { error } = await (supabase.from('blocked_content') as any)
      .update({
        appeal_status: 'approved',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      logger.error('Failed to approve appeal', error);
      return;
    }

    loadBlockedContent();
  }

  async function handleRejectAppeal(id: string) {
    const { error } = await (supabase.from('blocked_content') as any)
      .update({
        appeal_status: 'rejected',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      logger.error('Failed to reject appeal', error);
      return;
    }

    loadBlockedContent();
  }

  async function handleAddWord() {
    if (!newWord.word.trim()) return;

    const { error } = await (
      supabase.from('moderation_dictionary') as any
    ).insert({
      word: newWord.word.toLowerCase().trim(),
      severity: newWord.severity,
      category: newWord.category,
      is_regex: false,
      is_active: true,
    });

    if (error) {
      logger.error('Failed to add word', error);
      return;
    }

    setShowAddWord(false);
    setNewWord({ word: '', severity: 'medium', category: 'profanity' });
    loadDictionary();
  }

  async function handleToggleWord(id: string, isActive: boolean) {
    const { error } = await (supabase.from('moderation_dictionary') as any)
      .update({ is_active: !isActive })
      .eq('id', id);

    if (error) {
      logger.error('Failed to toggle word', error);
      return;
    }

    loadDictionary();
  }

  async function handleDeleteWord(id: string) {
    const { error } = await supabase
      .from('moderation_dictionary')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Failed to delete word', error);
      return;
    }

    loadDictionary();
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-muted-foreground';
    }
  }

  function getActionColor(action: string) {
    switch (action) {
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'allowed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'flagged':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'sanitized':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-muted text-foreground';
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchTerm ||
      log.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity =
      severityFilter === 'all' || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Moderation</h1>
          <p className="text-muted-foreground">
            Monitor and manage content moderation across the platform
          </p>
        </div>
        <CanvaButton onClick={loadData}>Refresh</CanvaButton>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CanvaStatCard
            title="Total Logs"
            value={stats.totalLogs.toString()}
            icon={FileText}
          />
          <CanvaStatCard
            title="Blocked Today"
            value={stats.blockedToday.toString()}
            icon={Ban}
          />
          <CanvaStatCard
            title="Active Warnings"
            value={stats.activeWarnings.toString()}
            icon={AlertTriangle}
          />
          <CanvaStatCard
            title="Pending Appeals"
            value={stats.pendingAppeals.toString()}
            icon={MessageSquare}
          />
        </div>
      )}

      {/* Severity Breakdown */}
      {stats && (
        <CanvaCard>
          <CanvaCardBody>
            <h3 className="mb-4 font-semibold">Severity Breakdown</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>Critical: {stats.severityBreakdown.critical}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500" />
                <span>High: {stats.severityBreakdown.high}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span>Medium: {stats.severityBreakdown.medium}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Low: {stats.severityBreakdown.low}</span>
              </div>
            </div>
          </CanvaCardBody>
        </CanvaCard>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <Shield className="mr-2 h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="blocked">
            <Ban className="mr-2 h-4 w-4" />
            Blocked Content
          </TabsTrigger>
          <TabsTrigger value="warnings">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Warnings
          </TabsTrigger>
          <TabsTrigger value="dictionary">
            <FileText className="mr-2 h-4 w-4" />
            Dictionary
          </TabsTrigger>
        </TabsList>

        {/* Moderation Logs */}
        <TabsContent value="overview" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CanvaCard>
            <CanvaCardBody className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Violations</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {log.user?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{log.user?.username || 'unknown'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <CanvaBadge variant="primary">
                          {log.content_type}
                        </CanvaBadge>
                      </TableCell>
                      <TableCell>
                        <CanvaBadge className={getSeverityColor(log.severity)}>
                          {log.severity}
                        </CanvaBadge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {log.violations?.slice(0, 2).map((v, i) => (
                            <CanvaBadge
                              key={i}
                              variant="primary"
                              className="text-xs"
                            >
                              {v.type}
                            </CanvaBadge>
                          ))}
                          {log.violations?.length > 2 && (
                            <CanvaBadge variant="primary" className="text-xs">
                              +{log.violations.length - 2}
                            </CanvaBadge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <CanvaBadge
                          className={getActionColor(log.action_taken)}
                        >
                          {log.action_taken}
                        </CanvaBadge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(log.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Blocked Content & Appeals */}
        <TabsContent value="blocked" className="space-y-4">
          <CanvaCard>
            <CanvaCardBody className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Reasons</TableHead>
                    <TableHead>Appeal Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedContent.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {item.user?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{item.user?.username || 'unknown'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <CanvaBadge variant="primary">
                          {item.content_type}
                        </CanvaBadge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.violation_reasons?.map((reason, i) => (
                            <CanvaBadge
                              key={i}
                              variant="primary"
                              className="text-xs"
                            >
                              {reason}
                            </CanvaBadge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <CanvaBadge
                          className={
                            item.appeal_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : item.appeal_status === 'approved'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : item.appeal_status === 'rejected'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  : 'bg-muted text-foreground'
                          }
                        >
                          {item.appeal_status}
                        </CanvaBadge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(item.created_at)}
                      </TableCell>
                      <TableCell>
                        {item.appeal_status === 'pending' && (
                          <div className="flex gap-2">
                            <CanvaButton
                              size="sm"
                              variant="primary"
                              onClick={() => handleApproveAppeal(item.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </CanvaButton>
                            <CanvaButton
                              size="sm"
                              variant="danger"
                              onClick={() => handleRejectAppeal(item.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </CanvaButton>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* User Warnings */}
        <TabsContent value="warnings" className="space-y-4">
          <CanvaCard>
            <CanvaCardBody className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Acknowledged</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warnings.map((warning) => (
                    <TableRow key={warning.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {warning.user?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{warning.user?.username || 'unknown'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <CanvaBadge variant="primary">
                          {warning.warning_type}
                        </CanvaBadge>
                      </TableCell>
                      <TableCell>
                        <CanvaBadge
                          className={
                            warning.warning_level === 3
                              ? 'bg-red-500'
                              : warning.warning_level === 2
                                ? 'bg-orange-500'
                                : 'bg-yellow-500'
                          }
                        >
                          Level {warning.warning_level}
                        </CanvaBadge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {warning.details || '-'}
                      </TableCell>
                      <TableCell>
                        {warning.acknowledged ? (
                          <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {warning.expires_at
                          ? formatDate(warning.expires_at)
                          : 'Never'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(warning.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>

        {/* Dictionary */}
        <TabsContent value="dictionary" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={showAddWord} onOpenChange={setShowAddWord}>
              <DialogTrigger asChild>
                <CanvaButton>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Word
                </CanvaButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Word</DialogTitle>
                  <DialogDescription>
                    Add a new word or pattern to the moderation dictionary.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Word/Pattern</label>
                    <Input
                      value={newWord.word}
                      onChange={(e) =>
                        setNewWord({ ...newWord, word: e.target.value })
                      }
                      placeholder="Enter word or pattern"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Severity</label>
                    <Select
                      value={newWord.severity}
                      onValueChange={(value) =>
                        setNewWord({ ...newWord, severity: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={newWord.category}
                      onValueChange={(value) =>
                        setNewWord({ ...newWord, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="profanity">Profanity</SelectItem>
                        <SelectItem value="hate_speech">Hate Speech</SelectItem>
                        <SelectItem value="violence">Violence</SelectItem>
                        <SelectItem value="spam">Spam</SelectItem>
                        <SelectItem value="pii_pattern">PII Pattern</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <CanvaButton
                    variant="ghost"
                    onClick={() => setShowAddWord(false)}
                  >
                    Cancel
                  </CanvaButton>
                  <CanvaButton variant="primary" onClick={handleAddWord}>
                    Add Word
                  </CanvaButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <CanvaCard>
            <CanvaCardBody className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Word/Pattern</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dictionary.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">{item.word}</TableCell>
                      <TableCell>
                        <CanvaBadge className={getSeverityColor(item.severity)}>
                          {item.severity}
                        </CanvaBadge>
                      </TableCell>
                      <TableCell>
                        <CanvaBadge variant="primary">
                          {item.category}
                        </CanvaBadge>
                      </TableCell>
                      <TableCell>
                        {item.is_regex ? (
                          <CanvaBadge variant="primary">Regex</CanvaBadge>
                        ) : (
                          <CanvaBadge variant="primary">Exact</CanvaBadge>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.is_active ? (
                          <CanvaBadge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Active
                          </CanvaBadge>
                        ) : (
                          <CanvaBadge className="bg-muted text-foreground">
                            Disabled
                          </CanvaBadge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(item.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <CanvaButton
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleToggleWord(item.id, item.is_active)
                            }
                          >
                            {item.is_active ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </CanvaButton>
                          <CanvaButton
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteWord(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </CanvaButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CanvaCardBody>
          </CanvaCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

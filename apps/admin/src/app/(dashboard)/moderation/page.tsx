'use client';

/**
 * Content Moderation Admin Panel
 *
 * Manage moderation logs, blocked content, warnings, and dictionary.
 * Features evidence panel with AI moderation details, PII detection, and decision rationale.
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  Eye,
  ExternalLink,
  Phone,
  Hash,
  Mail,
  AlertOctagon,
  Info,
  ChevronDown,
  ChevronUp,
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
  metadata?: Record<string, unknown>;
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

interface ThankYouEvent {
  id: string;
  moment_id: string;
  author_id: string;
  recipient_id: string | null;
  message: string;
  message_type: 'single' | 'bulk';
  moderation_status: 'approved' | 'flagged' | 'rejected' | 'pending_review';
  flagged_reason: string | null;
  created_at: string;
  author?: {
    full_name: string;
    avatar_url: string | null;
    username: string | null;
  };
  recipient?: {
    full_name: string;
    avatar_url: string | null;
    username: string | null;
  } | null;
  moment?: {
    id: string;
    title: string;
  } | null;
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

// Enhanced triage item with evidence
export interface TriageQueueItem {
  moment_id: string;
  title: string;
  user_id: string;
  username: string;
  media_url: string;
  created_at: string;
  is_approved: boolean;
  is_hidden: boolean;
  moderation_status: string;
  ai_moderation_score?: number;
  ai_moderation_labels?: string;
  ai_moderation_reasons?: string;
  ai_moderation_pii?: string;
  evidence?: {
    moderationLabels: Array<{
      name: string;
      parent: string;
      confidence: number;
      category: string;
      threshold: number;
    }>;
    detectedText: Array<{
      type: string;
      value: string;
    }>;
    processingMetadata: {
      timestamp: string;
      bucket: string;
      fileSize: number;
      aiModels: string[];
    };
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

function getSeverityColor(severity: string): string {
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

function getActionColor(action: string): string {
  switch (action) {
    case 'blocked':
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'approved':
    case 'auto_approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'pending_review':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'flagged':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    case 'sanitized':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-muted text-foreground';
  }
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'explicit':
      return <AlertOctagon className="h-3 w-3 text-red-500" />;
    case 'violence':
      return <AlertTriangle className="h-3 w-3 text-orange-500" />;
    case 'substances':
      return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
    case 'suggestive':
      return <Info className="h-3 w-3 text-blue-500" />;
    case 'pii':
      return <Eye className="h-3 w-3 text-purple-500" />;
    default:
      return <Hash className="h-3 w-3 text-gray-500" />;
  }
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function parseModerationLabels(
  labelsJson?: string,
): NonNullable<TriageQueueItem['evidence']>['moderationLabels'] {
  if (!labelsJson) return [];
  try {
    return JSON.parse(labelsJson);
  } catch {
    return [];
  }
}

function parsePiiData(
  piiJson?: string,
): Array<{ type: string; value: string }> {
  if (!piiJson) return [];
  try {
    return JSON.parse(piiJson);
  } catch {
    return [];
  }
}

function parseReasons(reasonsJson?: string): string[] {
  if (!reasonsJson) return [];
  try {
    return JSON.parse(reasonsJson);
  } catch {
    return [];
  }
}

// =============================================================================
// Evidence Panel Component
// =============================================================================

function EvidencePanel({ item }: { item: TriageQueueItem }) {
  const [expanded, setExpanded] = useState(false);
  const labels = parseModerationLabels(item.ai_moderation_labels);
  const pii = parsePiiData(item.ai_moderation_pii);
  const reasons = parseReasons(item.ai_moderation_reasons);

  const maxConfidence = Math.max(...labels.map((l) => l.confidence), 0);
  const threshold = labels[0]?.threshold || 90;

  return (
    <div className="mt-3 border-t pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        <span>AI Evidence {expanded ? '(Hide)' : '(Show)'}</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-4">
          {/* Decision Summary */}
          <div className="p-3 rounded-lg bg-muted/50">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Decision Rationale
            </h4>
            <div className="text-sm space-y-1">
              {reasons.length > 0 ? (
                reasons.map((reason, i) => (
                  <p key={i} className="text-muted-foreground">
                    - {reason}
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No specific reasons recorded
                </p>
              )}
            </div>
          </div>

          {/* Confidence Score */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span>Confidence</span>
                <span
                  className={
                    maxConfidence >= threshold
                      ? 'text-red-500'
                      : 'text-yellow-500'
                  }
                >
                  {Math.round(maxConfidence)}% / {threshold}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    maxConfidence >= threshold ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                  style={{
                    width: `${Math.min((maxConfidence / 100) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Moderation Labels */}
          {labels.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                DETECTED LABELS
              </h4>
              <div className="space-y-2">
                {labels.map((label, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(label.category)}
                      <div>
                        <p className="text-sm font-medium">{label.name}</p>
                        {label.parent && (
                          <p className="text-xs text-muted-foreground">
                            Parent: {label.parent}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {Math.round(label.confidence)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        threshold: {label.threshold}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PII Detection */}
          {pii.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Eye className="h-3 w-3" />
                DETECTED PII
              </h4>
              <div className="space-y-2">
                {pii.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded bg-purple-500/10 border border-purple-500/20"
                  >
                    {item.type === 'contact' && (
                      <Phone className="h-4 w-4 text-purple-500" />
                    )}
                    {item.type === 'url' && (
                      <ExternalLink className="h-4 w-4 text-purple-500" />
                    )}
                    {item.type === 'handle' && (
                      <Hash className="h-4 w-4 text-purple-500" />
                    )}
                    {item.type === 'email' && (
                      <Mail className="h-4 w-4 text-purple-500" />
                    )}
                    <span className="text-sm font-mono">{item.value}</span>
                    <CanvaBadge variant="primary" className="text-xs">
                      {item.type}
                    </CanvaBadge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Metadata */}
          <div className="text-xs text-muted-foreground">
            <p>Processed: {formatDate(item.created_at)}</p>
            <p>Status: {item.moderation_status}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState<
    'logs' | 'blocked' | 'warnings' | 'dictionary' | 'triage' | 'thank-you'
  >('triage');
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [blockedContent, setBlockedContent] = useState<BlockedContent[]>([]);
  const [warnings, setWarnings] = useState<UserWarning[]>([]);
  const [dictionary, setDictionary] = useState<DictionaryWord[]>([]);
  const [triageQueue, setTriageQueue] = useState<TriageQueueItem[]>([]);
  const [thankYouEvents, setThankYouEvents] = useState<ThankYouEvent[]>([]);
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

  // Admin session for audit logs
  const [adminId, setAdminId] = useState<string | null>(null);

  // Confirmation dialog state for irreversible actions
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'reject' | 'approve' | 'ban' | null;
    itemId: string | null;
    itemTitle: string;
    reason: string; // Required for moderation overrides
  }>({
    open: false,
    type: null,
    itemId: null,
    itemTitle: '',
    reason: '',
  });

  // GDPR access tracking
  const [gdprDialog, setGdprDialog] = useState<{
    open: boolean;
    userId: string | null;
    accessType: string | null;
  }>({
    open: false,
    userId: null,
    accessType: null,
  });

  const supabase = getClient();

  // Fetch admin ID on mount
  useEffect(() => {
    const fetchAdminId = async () => {
      try {
        const response = await fetch('/api/admin/me');
        if (response.ok) {
          const data = await response.json();
          setAdminId(data.id);
        }
      } catch (error) {
        logger.error('Failed to fetch admin ID', error);
      }
    };
    fetchAdminId();
  }, []);

  useEffect(() => {
    loadData();
    // loadData is stable - uses activeTab from closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      await Promise.all(
        [
          loadStats(),
          activeTab === 'logs' && loadLogs(),
          activeTab === 'blocked' && loadBlockedContent(),
          activeTab === 'warnings' && loadWarnings(),
          activeTab === 'dictionary' && loadDictionary(),
          activeTab === 'triage' && loadTriageQueue(),
          activeTab === 'thank-you' && loadThankYouEvents(),
        ].filter(Boolean),
      );
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
      .select('*, user:profiles(full_name, username)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      logger.error('Failed to load logs', error);
      return;
    }

    const normalizedLogs = (data ?? []).map((log) => {
      const violations = Array.isArray(log.violations)
        ? (log.violations as Array<{ type: string; message: string }>)
        : [];
      const metadata =
        log.metadata &&
        typeof log.metadata === 'object' &&
        !Array.isArray(log.metadata)
          ? (log.metadata as Record<string, unknown>)
          : undefined;
      const user =
        log.user && typeof log.user === 'object' && 'username' in log.user
          ? (log.user as {
              full_name: string;
              username: string;
              email?: string;
            })
          : undefined;

      return {
        ...log,
        created_at: log.created_at ?? new Date().toISOString(),
        violations,
        metadata,
        user,
      } as ModerationLog;
    });

    setLogs(normalizedLogs);
  }

  async function loadBlockedContent() {
    const { data, error } = await supabase
      .from('blocked_content')
      .select('*, user:profiles(full_name, username)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      logger.error('Failed to load blocked content', error);
      return;
    }

    const normalizedBlocked = (data ?? []).map((row) => {
      const user =
        row.user && typeof row.user === 'object' && 'username' in row.user
          ? (row.user as { full_name: string; username: string })
          : undefined;

      return {
        ...row,
        created_at: row.created_at ?? new Date().toISOString(),
        user,
      } as BlockedContent;
    });

    setBlockedContent(normalizedBlocked);
  }

  async function loadWarnings() {
    const { data, error } = await supabase
      .from('user_moderation_warnings')
      .select('*, user:profiles(full_name, username)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      logger.error('Failed to load warnings', error);
      return;
    }

    const normalizedWarnings = (data ?? []).map((row) => {
      const user =
        row.user && typeof row.user === 'object' && 'username' in row.user
          ? (row.user as { full_name: string; username: string })
          : undefined;

      return {
        ...row,
        created_at: row.created_at ?? new Date().toISOString(),
        user,
      } as UserWarning;
    });

    setWarnings(normalizedWarnings);
  }

  async function loadDictionary() {
    try {
      const { data, error } = await supabase
        .from('moderation_dictionary')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDictionary((data as DictionaryWord[]) || []);
    } catch (error) {
      logger.error('Failed to load dictionary', error);
      toast.error('Sözlük yüklenemedi');
    }
  }

  async function loadTriageQueue() {
    try {
      // Load moments pending review with moderation data
      const { data, error } = await (supabase as any)
        .from('moments')
        .select(
          `
          id,
          title,
          user_id,
          media_url,
          created_at,
          is_approved,
          is_hidden,
          moderation_status,
          ai_moderation_score,
          ai_moderation_labels,
          ai_moderation_reasons,
          ai_moderation_pii,
          profiles:user_id(username)
        `,
        )
        .in('moderation_status', ['pending_review', 'rejected'])
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const queueItems: TriageQueueItem[] = (data || []).map((item: any) => ({
        moment_id: item.id,
        title: item.title,
        user_id: item.user_id,
        username: item.profiles?.username || 'unknown',
        media_url: item.media_url,
        created_at: item.created_at,
        is_approved: item.is_approved,
        is_hidden: item.is_hidden,
        moderation_status: item.moderation_status,
        ai_moderation_score: item.ai_moderation_score,
        ai_moderation_labels: item.ai_moderation_labels,
        ai_moderation_reasons: item.ai_moderation_reasons,
        ai_moderation_pii: item.ai_moderation_pii,
      }));

      setTriageQueue(queueItems);
    } catch (error) {
      logger.error('Failed to load triage queue', error);
      toast.error('Bekleyen icerikler yuklenemedi');
    }
  }

  async function loadThankYouEvents() {
    try {
      const { data, error } = await (supabase as any)
        .from('thank_you_events')
        .select(
          `
          id,
          moment_id,
          author_id,
          recipient_id,
          message,
          message_type,
          moderation_status,
          flagged_reason,
          created_at,
          author:author_id(full_name, avatar_url, username),
          recipient:recipient_id(full_name, avatar_url, username),
          moment:moments(id, title)
        `,
        )
        .in('moderation_status', ['flagged', 'pending_review'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setThankYouEvents((data as ThankYouEvent[]) || []);
    } catch (error) {
      logger.error('Failed to load thank you events', error);
      toast.error('Tesekkuk etkinlikleri yuklenemedi');
    }
  }

  async function handleThankYouModeration(
    id: string,
    action: 'approve' | 'reject' | 'flag',
    reason?: string,
  ) {
    try {
      const response = await fetch('/api/thank-you/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, reason }),
      });

      if (!response.ok) throw new Error('Moderation failed');

      toast.success(
        action === 'approve'
          ? 'Teşekkür onaylandı'
          : action === 'reject'
            ? 'Teşekkür reddedildi'
            : 'Teşekkür işaretlendi',
      );

      // Reload the list
      loadThankYouEvents();
    } catch (error) {
      logger.error('Thank you moderation failed', error);
      toast.error('İşlem başarısız');
    }
  }

  async function handleApproveContent(momentId: string, reason?: string) {
    try {
      // Get current moderation status for audit log
      const { data: current } = await supabase
        .from('moments')
        .select('moderation_status, user_id')
        .eq('id', momentId)
        .single();

      const { error } = await supabase
        .from('moments')
        .update({
          is_approved: true,
          is_hidden: false,
          moderation_status: 'approved',
        })
        .eq('id', momentId);

      if (error) throw error;

      // Log admin override if AI previously rejected/pending_review
      if (
        current?.moderation_status &&
        ['rejected', 'pending_review'].includes(current.moderation_status) &&
        adminId
      ) {
        await supabase.from('admin_audit_logs').insert({
          admin_id: adminId,
          action: 'moderation_override',
          resource_type: 'moment',
          resource_id: momentId,
          old_value: current.moderation_status,
          new_value: 'approved',
          reason: reason || 'Admin manual approval',
          metadata: {
            timestamp: new Date().toISOString(),
            provider: 'manual',
          },
        });
      }

      toast.success('Icerik onaylandi ve yayina alindi');
      loadTriageQueue();
      loadStats();
    } catch (error) {
      logger.error('Failed to approve content', error);
      toast.error('Islem basarisiz');
    }
  }

  // Request confirmation for irreversible action
  function requestConfirmation(
    type: 'reject' | 'approve' | 'ban',
    itemId: string,
    itemTitle: string,
  ) {
    setConfirmDialog({
      open: true,
      type,
      itemId,
      itemTitle,
      reason: '',
    });
  }

  // Execute confirmed action
  async function confirmAction() {
    if (
      !confirmDialog.type ||
      !confirmDialog.itemId ||
      !confirmDialog.reason.trim()
    ) {
      toast.error('Karar gerekçesi zorunludur');
      return;
    }

    try {
      if (confirmDialog.type === 'reject') {
        await executeReject(confirmDialog.itemId, confirmDialog.reason);
      } else if (confirmDialog.type === 'approve') {
        await executeApprove(confirmDialog.itemId, confirmDialog.reason);
      }
    } catch (error) {
      logger.error('Failed to execute action', error);
    }

    setConfirmDialog({
      open: false,
      type: null,
      itemId: null,
      itemTitle: '',
      reason: '',
    });
  }

  async function executeApprove(momentId: string, reason: string) {
    try {
      const { data: current } = await supabase
        .from('moments')
        .select('moderation_status, user_id')
        .eq('id', momentId)
        .single();

      const { error } = await supabase
        .from('moments')
        .update({
          is_approved: true,
          is_hidden: false,
          moderation_status: 'approved',
        })
        .eq('id', momentId);

      if (error) throw error;

      if (
        current?.moderation_status &&
        ['rejected', 'pending_review'].includes(current.moderation_status) &&
        adminId
      ) {
        await supabase.from('admin_audit_logs').insert({
          admin_id: adminId,
          action: 'moderation_override',
          resource_type: 'moment',
          resource_id: momentId,
          old_value: current.moderation_status,
          new_value: 'approved',
          reason: reason || 'Admin manual approval',
          metadata: {
            timestamp: new Date().toISOString(),
            provider: 'manual',
          },
        });
      }

      toast.success('Icerik onaylandi ve yayina alindi');
      loadTriageQueue();
      loadStats();
    } catch (error) {
      logger.error('Failed to approve content', error);
      toast.error('Islem basarisiz');
    }
  }

  async function executeReject(momentId: string, reason: string) {
    try {
      const { data: current } = await supabase
        .from('moments')
        .select('moderation_status, user_id')
        .eq('id', momentId)
        .single();

      const { error } = await supabase
        .from('moments')
        .update({
          is_approved: false,
          is_hidden: true,
          moderation_status: 'rejected',
        })
        .eq('id', momentId);

      if (error) throw error;

      if (
        current?.moderation_status &&
        ['approved', 'pending_review'].includes(current.moderation_status) &&
        adminId
      ) {
        await supabase.from('admin_audit_logs').insert({
          admin_id: adminId,
          action: 'moderation_override',
          resource_type: 'moment',
          resource_id: momentId,
          old_value: current.moderation_status,
          new_value: 'rejected',
          reason: reason || 'Admin manual rejection',
          metadata: {
            timestamp: new Date().toISOString(),
            provider: 'manual',
          },
        });
      }

      toast.success('Icerik reddedildi (gizli tutuluyor)');
      loadTriageQueue();
    } catch (error) {
      logger.error('Failed to reject content', error);
      toast.error('Islem basarisiz');
    }
  }

  async function handleApproveAppeal(id: string) {
    const { error } = await supabase
      .from('blocked_content')
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
    const { error } = await supabase
      .from('blocked_content')
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

    const { error } = await supabase.from('moderation_dictionary').insert({
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
    const { error } = await supabase
      .from('moderation_dictionary')
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
            label="Total Logs"
            value={stats.totalLogs.toString()}
            icon={<FileText className="h-4 w-4" />}
          />
          <CanvaStatCard
            label="Blocked Today"
            value={stats.blockedToday.toString()}
            icon={<Ban className="h-4 w-4" />}
          />
          <CanvaStatCard
            label="Active Warnings"
            value={stats.activeWarnings.toString()}
            icon={<AlertTriangle className="h-4 w-4" />}
          />
          <CanvaStatCard
            label="Pending Appeals"
            value={stats.pendingAppeals.toString()}
            icon={<MessageSquare className="h-4 w-4" />}
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
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(
            value as
              | 'logs'
              | 'blocked'
              | 'warnings'
              | 'dictionary'
              | 'triage'
              | 'thank-you',
          )
        }
      >
        <TabsList>
          <TabsTrigger value="triage">
            <Shield className="mr-2 h-4 w-4" />
            Triage Queue
          </TabsTrigger>
          <TabsTrigger value="logs">
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
          <TabsTrigger value="thank-you">
            <MessageSquare className="mr-2 h-4 w-4" />
            Thank You
          </TabsTrigger>
        </TabsList>

        {/* Triage Queue Content */}
        <TabsContent value="triage" className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {triageQueue.length === 0 ? (
                <div className="col-span-full p-12 text-center text-muted-foreground border border-dashed rounded-lg">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-medium text-foreground">
                    All Caught Up!
                  </h3>
                  <p>No pending content requires moderation.</p>
                </div>
              ) : (
                triageQueue.map((item) => (
                  <div
                    key={item.moment_id}
                    className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md"
                  >
                    <div className="aspect-[9/16] w-full bg-muted/20 relative">
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                        Preview: {item.media_url}
                      </div>
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        Score: {item.ai_moderation_score ?? 'N/A'}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            by @{item.username}
                          </p>
                        </div>
                        <CanvaBadge
                          className={getActionColor(item.moderation_status)}
                        >
                          {item.moderation_status?.replace('_', ' ')}
                        </CanvaBadge>
                      </div>

                      {/* Quick reasons */}
                      {item.ai_moderation_reasons && (
                        <div className="mb-3">
                          {parseReasons(item.ai_moderation_reasons)
                            .slice(0, 2)
                            .map((reason, i) => (
                              <p
                                key={i}
                                className="text-xs text-muted-foreground truncate"
                              >
                                - {reason}
                              </p>
                            ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <CanvaButton
                          variant="secondary"
                          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() =>
                            requestConfirmation(
                              'reject',
                              item.moment_id,
                              item.title,
                            )
                          }
                        >
                          Reject
                        </CanvaButton>
                        <CanvaButton
                          variant="primary"
                          className="w-full"
                          onClick={() =>
                            requestConfirmation(
                              'approve',
                              item.moment_id,
                              item.title,
                            )
                          }
                        >
                          Approve
                        </CanvaButton>
                      </div>

                      {/* Evidence Panel */}
                      <EvidencePanel item={item} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Moderation Logs */}
        <TabsContent value="logs" className="space-y-4">
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

        {/* Thank You Events Moderation */}
        <TabsContent value="thank-you" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Teşekkür Moderasyonu</h3>
              <p className="text-sm text-muted-foreground">
                İşaretlenen teşekkür mesajlarını incele
              </p>
            </div>
            <CanvaButton variant="secondary" onClick={loadThankYouEvents}>
              Yenile
            </CanvaButton>
          </div>

          {thankYouEvents.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground border border-dashed rounded-lg">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium text-foreground">
                İşaretlenmiş Teşekkür Yok!
              </h3>
              <p>Şu anda incelenmesi gereken teşekkür mesajı yok.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {thankYouEvents.map((event) => (
                <CanvaCard key={event.id}>
                  <CanvaCardBody>
                    <div className="flex gap-4">
                      {/* Message Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CanvaBadge
                            className={
                              event.moderation_status === 'flagged'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }
                          >
                            {event.moderation_status}
                          </CanvaBadge>
                          <CanvaBadge variant="primary">
                            {event.message_type === 'single'
                              ? 'Bireysel'
                              : 'Toplu'}
                          </CanvaBadge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(event.created_at)}
                          </span>
                        </div>

                        <p className="text-sm mb-3 p-3 bg-muted/50 rounded-lg">
                          {event.message}
                        </p>

                        {/* Context */}
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Gönderen:</span>{' '}
                            {event.author?.full_name || 'Bilinmiyor'}
                          </div>
                          {event.recipient && (
                            <div>
                              <span className="font-medium">Alan:</span>{' '}
                              {event.recipient.full_name}
                            </div>
                          )}
                          {event.moment && (
                            <div>
                              <span className="font-medium">Moment:</span>{' '}
                              {event.moment.title}
                            </div>
                          )}
                        </div>

                        {/* Flagged reason */}
                        {event.flagged_reason && (
                          <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-sm">
                            <span className="font-medium text-orange-600 dark:text-orange-400">
                              İşaretlenme Nedeni:
                            </span>{' '}
                            {event.flagged_reason}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <CanvaButton
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            handleThankYouModeration(event.id, 'approve')
                          }
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Onayla
                        </CanvaButton>
                        <CanvaButton
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            handleThankYouModeration(
                              event.id,
                              'flag',
                              'Manual inceleme',
                            )
                          }
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          İşaretle
                        </CanvaButton>
                        <CanvaButton
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleThankYouModeration(
                              event.id,
                              'reject',
                              'Uygunsuz içerik',
                            )
                          }
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reddet
                        </CanvaButton>
                      </div>
                    </div>
                  </CanvaCardBody>
                </CanvaCard>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog for Irreversible Actions */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-lg rounded-xl border border-white/15 bg-[#0f0f0f] p-6 text-white shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                {confirmDialog.type === 'reject' && (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
                {confirmDialog.type === 'approve' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {confirmDialog.type === 'ban' && (
                  <Ban className="h-5 w-5 text-red-500" />
                )}
                {confirmDialog.type === 'reject'
                  ? 'Reddetmek istiyor musunuz?'
                  : confirmDialog.type === 'approve'
                    ? 'Onaylamak istiyor musunuz?'
                    : 'Bu işlemi gerçekleştirmek istiyor musunuz?'}
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-gray-400">
                Bu işlem geri alınamaz.
                {confirmDialog.itemTitle && (
                  <div className="mt-2 rounded-lg bg-white/5 p-3">
                    <span className="font-medium">İçerik:</span>{' '}
                    {confirmDialog.itemTitle}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>

            {/* Required Reason Field for Moderation Override */}
            <div className="mt-4 space-y-2">
              <Label
                htmlFor="moderation-reason"
                className="text-sm text-gray-300"
              >
                Karar Gerekçesi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="moderation-reason"
                placeholder="AI kararını neden geçersiz kıldığınızı açıklayın..."
                value={confirmDialog.reason}
                onChange={(e) =>
                  setConfirmDialog({ ...confirmDialog, reason: e.target.value })
                }
                className="min-h-[80px] bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500">
                KVKK uyumluluğu için gerekçe zorunludur.
              </p>
            </div>

            <DialogFooter className="mt-6 flex gap-2">
              <CanvaButton
                variant="ghost"
                onClick={() =>
                  setConfirmDialog({
                    open: false,
                    type: null,
                    itemId: null,
                    itemTitle: '',
                    reason: '',
                  })
                }
              >
                İptal
              </CanvaButton>
              <CanvaButton
                variant={
                  confirmDialog.type === 'reject' ||
                  confirmDialog.type === 'ban'
                    ? 'danger'
                    : 'primary'
                }
                onClick={confirmAction}
                disabled={!confirmDialog.reason.trim()}
              >
                {confirmDialog.type === 'reject'
                  ? 'Reddet'
                  : confirmDialog.type === 'approve'
                    ? 'Onayla'
                    : 'Devam Et'}
              </CanvaButton>
            </DialogFooter>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

/**
 * Mobile Health Inbox
 *
 * SAFE MODE Compliance:
 * - NO-NETWORK: 100% client-side parsing
 * - NO-DATABASE: No reads, no writes
 * - READ-ONLY: Just parsing pasted text
 *
 * Founder can paste diagnostics from mobile app and get triage recommendations.
 */

import { useState, useCallback } from 'react';
import {
  Smartphone,
  ClipboardPaste,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Cpu,
  Settings,
  Bug,
  Gauge,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MOBILE_HEALTH_INBOX_ENABLED,
  parseDiagnosticsSummary,
  TRIAGE_PRIORITY_COLORS,
  TRIAGE_PRIORITY_LABELS,
  type ParsedDiagnostics,
} from '@/config/mobile-health-inbox';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function MobileHealthInbox() {
  const [inputText, setInputText] = useState('');
  const [parsed, setParsed] = useState<ParsedDiagnostics | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRawInput, setShowRawInput] = useState(true);

  // Gate check
  if (!MOBILE_HEALTH_INBOX_ENABLED) {
    return null;
  }

  const handleParse = useCallback(() => {
    if (!inputText.trim()) return;
    const result = parseDiagnosticsSummary(inputText);
    setParsed(result);
    setShowRawInput(false);
  }, [inputText]);

  const handleClear = useCallback(() => {
    setInputText('');
    setParsed(null);
    setShowRawInput(true);
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
    } catch {
      // Clipboard access denied - user can paste manually
    }
  }, []);

  const getStatusIcon = (status: 'ok' | 'missing' | 'invalid' | null) => {
    if (status === 'ok')
      return <CheckCircle2 className="h-3 w-3 text-emerald-400" />;
    if (status === 'missing' || status === 'invalid')
      return <XCircle className="h-3 w-3 text-red-400" />;
    return <AlertTriangle className="h-3 w-3 text-slate-400" />;
  };

  return (
    <div className="mt-3 pt-3 border-t border-slate-700/50">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-300 transition-colors"
      >
        <span className="flex items-center gap-1">
          <Smartphone className="h-3 w-3" />
          Mobile Health Inbox
        </span>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="mt-2 space-y-2">
          {/* Input Area */}
          {showRawInput && (
            <div className="space-y-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste diagnostics summary from mobile app..."
                className="w-full h-24 px-2 py-1.5 text-xs bg-slate-800/50 border border-slate-700/50 rounded-lg resize-none placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
              />
              <div className="flex gap-2">
                <button
                  onClick={handlePaste}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <ClipboardPaste className="h-3 w-3" />
                  Paste
                </button>
                <button
                  onClick={handleParse}
                  disabled={!inputText.trim()}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded-lg transition-colors',
                    inputText.trim()
                      ? 'bg-violet-500/20 border border-violet-500/50 text-violet-400 hover:bg-violet-500/30'
                      : 'bg-slate-800/30 border border-slate-700/30 text-slate-500 cursor-not-allowed',
                  )}
                >
                  Parse
                </button>
              </div>
            </div>
          )}

          {/* Parsed Results */}
          {parsed && (
            <div className="space-y-3">
              {/* Triage Section */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  Triage
                </span>
                {parsed.triage.map((t, i) => {
                  const colors = TRIAGE_PRIORITY_COLORS[t.level];
                  return (
                    <div
                      key={i}
                      className={cn(
                        'p-2 rounded-lg border text-xs',
                        colors.bg,
                        colors.border,
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn('font-mono font-bold', colors.text)}
                        >
                          [{t.level}]
                        </span>
                        <span className={cn('text-[10px]', colors.text)}>
                          {TRIAGE_PRIORITY_LABELS[t.level]}
                        </span>
                      </div>
                      <p className="text-slate-300">{t.reason}</p>
                    </div>
                  );
                })}
              </div>

              {/* Build Info */}
              <div className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                  <Cpu className="h-3 w-3" />
                  Build Info
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <span className="text-slate-400">Version</span>
                  <span className="text-slate-200">
                    {parsed.buildInfo.version || 'N/A'}
                    {parsed.buildInfo.buildNumber &&
                      ` (${parsed.buildInfo.buildNumber})`}
                  </span>
                  <span className="text-slate-400">Platform</span>
                  <span className="text-slate-200">
                    {parsed.buildInfo.platform || 'N/A'}
                  </span>
                  <span className="text-slate-400">Device</span>
                  <span className="text-slate-200">
                    {parsed.buildInfo.device || 'Unknown'}
                  </span>
                  <span className="text-slate-400">Environment</span>
                  <span
                    className={cn(
                      'capitalize',
                      parsed.buildInfo.environment === 'production' &&
                        'text-emerald-400',
                      parsed.buildInfo.environment === 'staging' &&
                        'text-amber-400',
                      parsed.buildInfo.environment === 'development' &&
                        'text-blue-400',
                    )}
                  >
                    {parsed.buildInfo.environment || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Config Sanity */}
              <div className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                  <Settings className="h-3 w-3" />
                  Config Sanity
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Supabase URL</span>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(parsed.configSanity.supabaseUrl)}
                      <span className="text-slate-200">
                        {parsed.configSanity.supabaseUrl || 'N/A'}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Supabase Key</span>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(parsed.configSanity.supabaseKey)}
                      <span className="text-slate-200">
                        {parsed.configSanity.supabaseKey || 'N/A'}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Service Role Leak</span>
                    <span
                      className={cn(
                        'flex items-center gap-1',
                        parsed.configSanity.serviceRoleLeak
                          ? 'text-red-400'
                          : 'text-emerald-400',
                      )}
                    >
                      {parsed.configSanity.serviceRoleLeak ? (
                        <>
                          <XCircle className="h-3 w-3" />
                          DETECTED
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          None
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Auth State</span>
                    <span className="text-slate-200">
                      {parsed.configSanity.authState || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Errors */}
              <div className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                  <Bug className="h-3 w-3" />
                  Errors
                </div>
                <p
                  className={cn(
                    'text-xl font-bold',
                    parsed.errorCount >= 20 && 'text-red-400',
                    parsed.errorCount >= 5 &&
                      parsed.errorCount < 20 &&
                      'text-amber-400',
                    parsed.errorCount < 5 && 'text-emerald-400',
                  )}
                >
                  {parsed.errorCount}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    logged
                  </span>
                </p>
              </div>

              {/* Slow Screens */}
              {parsed.slowScreens.length > 0 && (
                <div className="p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                    <Gauge className="h-3 w-3" />
                    Top Slow Screens
                  </div>
                  <div className="space-y-1">
                    {parsed.slowScreens.map((screen) => (
                      <div
                        key={screen.screenName}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-300">
                          {screen.rank}. {screen.screenName}
                        </span>
                        <span
                          className={cn(
                            'font-mono',
                            screen.avgTtiMs > 2000 && 'text-red-400',
                            screen.avgTtiMs > 1000 &&
                              screen.avgTtiMs <= 2000 &&
                              'text-amber-400',
                            screen.avgTtiMs <= 1000 && 'text-emerald-400',
                          )}
                        >
                          {screen.avgTtiMs}ms
                          <span className="text-slate-500 ml-1">
                            ({screen.count}x)
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Meta */}
              {parsed.generatedAt && (
                <p className="text-[10px] text-slate-500 text-center">
                  Generated:{' '}
                  {new Date(parsed.generatedAt).toLocaleString('tr-TR')}
                </p>
              )}

              {/* Clear Button */}
              <button
                onClick={handleClear}
                className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-slate-400 hover:text-slate-300 bg-slate-800/30 border border-slate-700/30 rounded-lg hover:bg-slate-700/30 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Clear & New Report
              </button>
            </div>
          )}

          {/* NO-NETWORK Badge */}
          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-600">
            <span>●</span>
            NO-NETWORK | CLIENT-SIDE ONLY
          </div>
        </div>
      )}
    </div>
  );
}

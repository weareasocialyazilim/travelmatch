/**
 * Mobile Diagnostics Screen
 *
 * SAFE MODE Compliance:
 * - READ-ONLY: All data displayed, nothing written
 * - NO-NETWORK: Zero external API calls
 * - PII-SCRUBBED: All sensitive data masked
 * - HIDDEN ACCESS: Only visible via 7-tap gesture
 *
 * Features:
 * - Build info (version, platform, device)
 * - Config sanity check (Supabase, auth state)
 * - Error log (ring buffer, last 50)
 * - Performance snapshots (screen TTI)
 * - Copy to clipboard (PII-safe)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { useToast } from '@/context/ToastContext';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import {
  MOBILE_DIAGNOSTICS_ENABLED,
  type DiagnosticsErrorEntry,
} from '@/config/diagnostics';
import {
  getBuildInfo,
  getConfigSanity,
  getErrorLog,
  getTopSlowScreens,
  getDiagnosticsSummaryText,
  clearAllDiagnostics,
} from '@/utils/diagnosticsLogger';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type TabType = 'overview' | 'errors' | 'performance';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const StatusBadge: React.FC<{
  status: 'ok' | 'missing' | 'invalid' | boolean;
  label?: string;
}> = ({ status, label }) => {
  const isOk = status === 'ok' || status === true;
  const isMissing = status === 'missing' || status === false;

  return (
    <View
      style={[
        styles.statusBadge,
        isOk
          ? styles.statusOk
          : isMissing
            ? styles.statusError
            : styles.statusWarning,
      ]}
    >
      <MaterialCommunityIcons
        name={isOk ? 'check' : isMissing ? 'close' : 'alert'}
        size={12}
        color={
          isOk
            ? COLORS.mint
            : isMissing
              ? COLORS.feedback.error
              : COLORS.feedback.warning
        }
      />
      {label && (
        <Text
          style={[
            styles.statusText,
            isOk
              ? styles.statusTextOk
              : isMissing
                ? styles.statusTextError
                : styles.statusTextWarning,
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );
};

const SectionCard: React.FC<{
  title: string;
  icon: string;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <View style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <MaterialCommunityIcons
        name={icon as any}
        size={18}
        color={COLORS.brand.primary}
      />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const InfoRow: React.FC<{
  label: string;
  value: string | null;
  status?: 'ok' | 'missing' | 'invalid' | boolean;
}> = ({ label, value, status }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueContainer}>
      {status !== undefined && <StatusBadge status={status} />}
      <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
  </View>
);

const ErrorLogItem: React.FC<{ entry: DiagnosticsErrorEntry }> = ({
  entry,
}) => {
  const levelColors: Record<string, string> = {
    critical: COLORS.feedback.error,
    error: '#FF6B6B',
    warning: COLORS.feedback.warning,
    info: COLORS.brand.secondary,
  };

  const levelColor = levelColors[entry.level] || COLORS.softGray;
  const timestamp = new Date(entry.timestamp).toLocaleString('tr-TR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.errorItem}>
      <View style={styles.errorHeader}>
        <View
          style={[styles.levelBadge, { backgroundColor: levelColor + '20' }]}
        >
          <Text style={[styles.levelText, { color: levelColor }]}>
            {entry.level.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.errorTimestamp}>{timestamp}</Text>
      </View>
      <Text style={styles.errorMessage} numberOfLines={2}>
        {entry.message}
      </Text>
      <View style={styles.errorMeta}>
        <Text style={styles.errorSource}>{entry.source}</Text>
        {entry.screenName && (
          <Text style={styles.errorScreen}>@ {entry.screenName}</Text>
        )}
        {entry.code && <Text style={styles.errorCode}>[{entry.code}]</Text>}
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const DiagnosticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load data (memoized, refreshes on refreshKey change)
  // All hooks must be called before any conditional return
  const buildInfo = useMemo(() => getBuildInfo(), [refreshKey]);
  const configSanity = useMemo(() => getConfigSanity(), [refreshKey]);
  const errorLog = useMemo(() => getErrorLog(), [refreshKey]);
  const topSlowScreens = useMemo(() => getTopSlowScreens(5), [refreshKey]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleCopyToClipboard = useCallback(async () => {
    try {
      const summaryText = getDiagnosticsSummaryText();
      await Clipboard.setStringAsync(summaryText);
      showToast('Diagnostics copied to clipboard', 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  }, [showToast]);

  const handleClearLogs = useCallback(() => {
    clearAllDiagnostics();
    setRefreshKey((k) => k + 1);
    showToast('Diagnostics cleared', 'success');
  }, [showToast]);

  // Gate check - should not be accessible if disabled (AFTER all hooks)
  if (!MOBILE_DIAGNOSTICS_ENABLED) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.disabledContainer}>
          <MaterialCommunityIcons
            name="lock"
            size={48}
            color={COLORS.softGray}
          />
          <Text style={styles.disabledText}>Diagnostics disabled</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Overview Tab
  // ─────────────────────────────────────────────────────────────────────────
  const renderOverview = () => (
    <>
      {/* Build Info */}
      <SectionCard title="Build Info" icon="information">
        <InfoRow
          label="Version"
          value={`${buildInfo.appVersion} (${buildInfo.buildNumber || 'N/A'})`}
        />
        <InfoRow label="Platform" value={buildInfo.osVersion} />
        <InfoRow label="Device" value={buildInfo.deviceModel} />
        <InfoRow label="Environment" value={buildInfo.envName} />
        {buildInfo.commitHash && (
          <InfoRow
            label="Commit"
            value={buildInfo.commitHash.substring(0, 8)}
          />
        )}
      </SectionCard>

      {/* Config Sanity */}
      <SectionCard title="Config Sanity" icon="cog-outline">
        <InfoRow
          label="Supabase URL"
          value={configSanity.supabaseUrl}
          status={configSanity.supabaseUrl}
        />
        <InfoRow
          label="Supabase Key"
          value={configSanity.supabaseAnonKey}
          status={configSanity.supabaseAnonKey}
        />
        <InfoRow
          label="Service Role Leak"
          value={configSanity.serviceRoleKeyLeak ? 'DETECTED!' : 'None'}
          status={!configSanity.serviceRoleKeyLeak}
        />
        <InfoRow
          label="Auth State"
          value={configSanity.authState}
          status={
            configSanity.authState === 'logged_in'
              ? 'ok'
              : configSanity.authState === 'logged_out'
                ? 'missing'
                : 'invalid'
          }
        />
      </SectionCard>

      {/* Quick Stats */}
      <SectionCard title="Quick Stats" icon="chart-bar">
        <InfoRow label="Errors Logged" value={String(errorLog.length)} />
        <InfoRow
          label="Last Error"
          value={
            errorLog.length > 0
              ? new Date(
                  errorLog[errorLog.length - 1].timestamp,
                ).toLocaleString('tr-TR')
              : 'None'
          }
        />
        <InfoRow
          label="Slowest Screen"
          value={
            topSlowScreens.length > 0
              ? `${topSlowScreens[0].screenName} (${topSlowScreens[0].avgTtiMs}ms)`
              : 'N/A'
          }
        />
      </SectionCard>
    </>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Errors Tab
  // ─────────────────────────────────────────────────────────────────────────
  const renderErrors = () => (
    <>
      <View style={styles.tabHeader}>
        <Text style={styles.tabHeaderText}>
          {errorLog.length} error{errorLog.length !== 1 ? 's' : ''} logged
        </Text>
      </View>
      {errorLog.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={48}
            color={COLORS.mint}
          />
          <Text style={styles.emptyStateText}>No errors logged</Text>
        </View>
      ) : (
        [...errorLog]
          .reverse()
          .map((entry) => <ErrorLogItem key={entry.id} entry={entry} />)
      )}
    </>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Performance Tab
  // ─────────────────────────────────────────────────────────────────────────
  const renderPerformance = () => (
    <>
      <SectionCard title="Top 5 Slowest Screens" icon="speedometer-slow">
        {topSlowScreens.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="speedometer"
              size={48}
              color={COLORS.softGray}
            />
            <Text style={styles.emptyStateText}>No performance data yet</Text>
          </View>
        ) : (
          topSlowScreens.map((screen, index) => (
            <View key={screen.screenName} style={styles.perfRow}>
              <View style={styles.perfRank}>
                <Text style={styles.perfRankText}>{index + 1}</Text>
              </View>
              <View style={styles.perfInfo}>
                <Text style={styles.perfScreen}>{screen.screenName}</Text>
                <Text style={styles.perfMeta}>
                  {screen.count}x measurements
                </Text>
              </View>
              <View style={styles.perfTti}>
                <Text
                  style={[
                    styles.perfTtiValue,
                    screen.avgTtiMs > 1000 && styles.perfTtiSlow,
                    screen.avgTtiMs > 2000 && styles.perfTtiVerySlow,
                  ]}
                >
                  {screen.avgTtiMs}ms
                </Text>
              </View>
            </View>
          ))
        )}
      </SectionCard>

      <View style={styles.perfLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.mint }]} />
          <Text style={styles.legendText}>Good (&lt;1000ms)</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: COLORS.feedback.warning },
            ]}
          />
          <Text style={styles.legendText}>Slow (1-2s)</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: COLORS.feedback.error },
            ]}
          />
          <Text style={styles.legendText}>Very Slow (&gt;2s)</Text>
        </View>
      </View>
    </>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diagnostics</Text>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopyToClipboard}
        >
          <MaterialCommunityIcons
            name="content-copy"
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {(['overview', 'errors', 'performance'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.brand.primary}
          />
        }
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'errors' && renderErrors()}
        {activeTab === 'performance' && renderPerformance()}

        {/* Clear Button */}
        <TouchableOpacity style={styles.clearButton} onPress={handleClearLogs}>
          <MaterialCommunityIcons
            name="delete-outline"
            size={18}
            color={COLORS.feedback.error}
          />
          <Text style={styles.clearButtonText}>Clear All Diagnostics</Text>
        </TouchableOpacity>

        {/* NO-NETWORK Badge */}
        <View style={styles.noBadge}>
          <MaterialCommunityIcons
            name="wifi-off"
            size={14}
            color={COLORS.softGray}
          />
          <Text style={styles.noBadgeText}>NO-NETWORK | PII-SCRUBBED</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  copyButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Disabled state
  disabledContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  disabledText: {
    ...TYPOGRAPHY.body,
    color: COLORS.softGray,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.brand.primary + '30',
    borderWidth: 1,
    borderColor: COLORS.brand.primary,
  },
  tabText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  tabTextActive: {
    color: COLORS.brand.primary,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Section Card
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionContent: {
    gap: 8,
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255,255,255,0.6)',
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoValue: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusOk: {
    backgroundColor: COLORS.mint + '20',
  },
  statusError: {
    backgroundColor: COLORS.feedback.error + '20',
  },
  statusWarning: {
    backgroundColor: COLORS.feedback.warning + '20',
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '600',
  },
  statusTextOk: {
    color: COLORS.mint,
  },
  statusTextError: {
    color: COLORS.feedback.error,
  },
  statusTextWarning: {
    color: COLORS.feedback.warning,
  },

  // Tab Header
  tabHeader: {
    marginBottom: 12,
  },
  tabHeaderText: {
    ...TYPOGRAPHY.caption,
    color: 'rgba(255,255,255,0.6)',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyStateText: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255,255,255,0.4)',
  },

  // Error Item
  errorItem: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.feedback.error,
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  errorTimestamp: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  errorMessage: {
    ...TYPOGRAPHY.bodySmall,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  errorMeta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  errorSource: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.brand.secondary,
  },
  errorScreen: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  errorCode: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    fontFamily: 'monospace',
  },

  // Performance Row
  perfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  perfRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  perfRankText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  perfInfo: {
    flex: 1,
  },
  perfScreen: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  perfMeta: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  perfTti: {
    alignItems: 'flex-end',
  },
  perfTtiValue: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.mint,
  },
  perfTtiSlow: {
    color: COLORS.feedback.warning,
  },
  perfTtiVerySlow: {
    color: COLORS.feedback.error,
  },

  // Performance Legend
  perfLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },

  // Clear Button
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 16,
    backgroundColor: COLORS.feedback.error + '15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.feedback.error + '30',
  },
  clearButtonText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.feedback.error,
  },

  // NO-NETWORK Badge
  noBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
  },
  noBadgeText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
  },
});

export default withErrorBoundary(DiagnosticsScreen, {
  fallbackType: 'generic',
  displayName: 'DiagnosticsScreen',
});

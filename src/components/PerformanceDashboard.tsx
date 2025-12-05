/**
 * Performance Dashboard Component
 * Visual display of app performance metrics for development and debugging
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { PerformanceMonitor } from '../utils/performance';
import { logger } from '../utils/logger';

// Define metric type for filter and reduce
interface PerformanceMetricData {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status: 'good' | 'warning' | 'critical';
  icon: string;
  trend?: 'up' | 'down' | 'stable';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  status,
  icon,
  trend,
}) => {
  const statusColors = {
    good: COLORS.success || '#10B981',
    warning: COLORS.warning || '#F59E0B',
    critical: COLORS.error || '#EF4444',
  };

  const trendIcons = {
    up: 'trending-up',
    down: 'trending-down',
    stable: 'minus',
  };

  return (
    <View
      style={[styles.metricCard, { borderLeftColor: statusColors[status] }]}
    >
      <View style={styles.metricHeader}>
        <MaterialCommunityIcons
          name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={20}
          color={statusColors[status]}
        />
        <Text style={styles.metricTitle}>{title}</Text>
        {trend && (
          <MaterialCommunityIcons
            name={
              trendIcons[trend] as keyof typeof MaterialCommunityIcons.glyphMap
            }
            size={16}
            color={
              trend === 'up'
                ? COLORS.success
                : trend === 'down'
                ? COLORS.error
                : COLORS.textSecondary
            }
          />
        )}
      </View>
      <View style={styles.metricValue}>
        <Text style={[styles.metricValueText, { color: statusColors[status] }]}>
          {value}
        </Text>
        {unit && <Text style={styles.metricUnit}>{unit}</Text>}
      </View>
    </View>
  );
};

interface PerformanceDashboardProps {
  visible: boolean;
  onClose: () => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  visible,
  onClose,
}) => {
  const [fps, setFps] = useState<number>(60);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [apiLatency, setApiLatency] = useState<number>(0);
  const [screenLoadTime, setScreenLoadTime] = useState<number>(0);
  // Bundle size is displayed as a string for formatting
  const [_bundleSize, _setBundleSize] = useState<string>('--');
  const [metricsHistory, setMetricsHistory] = useState<
    Array<{ time: number; fps: number }>
  >([]);

  useEffect(() => {
    if (!visible) return;

    // Start FPS tracking
    const stopFpsTracking = PerformanceMonitor.trackFPS();

    // Update metrics every second
    const interval = setInterval(() => {
      // Get FPS average
      const avgFps = PerformanceMonitor.getAverageMetric('fps');
      if (avgFps !== null) {
        setFps(Math.round(avgFps));
        setMetricsHistory((prev) => [
          ...prev.slice(-30),
          { time: Date.now(), fps: Math.round(avgFps) },
        ]);
      }

      // Get memory usage
      // @ts-expect-error - performance.memory is non-standard
      if (performance.memory) {
        // @ts-expect-error - performance.memory types
        const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
        setMemoryUsage(Math.round((usedJSHeapSize / totalJSHeapSize) * 100));
      }

      // Get API latency average
      const metrics =
        PerformanceMonitor.getMetrics() as PerformanceMetricData[];
      const apiMetrics = metrics.filter((m: PerformanceMetricData) =>
        m.name.startsWith('api_latency_'),
      );
      if (apiMetrics.length > 0) {
        const avgLatency =
          apiMetrics.reduce(
            (sum: number, m: PerformanceMetricData) => sum + m.value,
            0,
          ) / apiMetrics.length;
        setApiLatency(Math.round(avgLatency));
      }

      // Get screen load time average
      const screenMetrics = metrics.filter((m: PerformanceMetricData) =>
        m.name.startsWith('screen_load_'),
      );
      if (screenMetrics.length > 0) {
        const avgLoad =
          screenMetrics.reduce(
            (sum: number, m: PerformanceMetricData) => sum + m.value,
            0,
          ) / screenMetrics.length;
        setScreenLoadTime(Math.round(avgLoad));
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      stopFpsTracking();
    };
  }, [visible]);

  const getStatus = useCallback(
    (metric: string, value: number): 'good' | 'warning' | 'critical' => {
      switch (metric) {
        case 'fps':
          if (value >= 55) return 'good';
          if (value >= 30) return 'warning';
          return 'critical';
        case 'memory':
          if (value <= 60) return 'good';
          if (value <= 80) return 'warning';
          return 'critical';
        case 'latency':
          if (value <= 500) return 'good';
          if (value <= 2000) return 'warning';
          return 'critical';
        case 'screenLoad':
          if (value <= 1000) return 'good';
          if (value <= 2000) return 'warning';
          return 'critical';
        default:
          return 'good';
      }
    },
    [],
  );

  const handleClearMetrics = useCallback(() => {
    PerformanceMonitor.clearMetrics();
    setMetricsHistory([]);
    logger.info('Performance metrics cleared');
  }, []);

  const handleExportMetrics = useCallback(() => {
    const metrics = PerformanceMonitor.getMetrics();
    const exportData = JSON.stringify(metrics, null, 2);
    logger.info('Metrics exported:', exportData);
    // In a real app, this would save to file or send to analytics
  }, []);

  // Simple bar chart for FPS history
  const renderFpsChart = () => {
    const maxFps = 60;
    const chartHeight = 80;
    const barWidth = (SCREEN_WIDTH - 80) / 30;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>FPS History (last 30 seconds)</Text>
        <View style={styles.chart}>
          {metricsHistory.map((data, index) => {
            const height = (data.fps / maxFps) * chartHeight;
            const color =
              data.fps >= 55
                ? COLORS.success || '#10B981'
                : data.fps >= 30
                ? COLORS.warning || '#F59E0B'
                : COLORS.error || '#EF4444';

            return (
              <View
                key={index}
                style={[
                  styles.chartBar,
                  {
                    width: barWidth - 2,
                    height,
                    backgroundColor: color,
                  },
                ]}
              />
            );
          })}
        </View>
        <View style={styles.chartLabels}>
          <Text style={styles.chartLabel}>60</Text>
          <Text style={styles.chartLabel}>30</Text>
          <Text style={styles.chartLabel}>0</Text>
        </View>
      </View>
    );
  };

  if (!__DEV__) {
    return null; // Only show in development
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚡ Performance Dashboard</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Metrics */}
          <View style={styles.metricsGrid}>
            <MetricCard
              title="FPS"
              value={fps}
              status={getStatus('fps', fps)}
              icon="speedometer"
              trend={
                fps >= 55
                  ? 'stable'
                  : fps >= metricsHistory[metricsHistory.length - 2]?.fps
                  ? 'up'
                  : 'down'
              }
            />
            <MetricCard
              title="Memory"
              value={memoryUsage}
              unit="%"
              status={getStatus('memory', memoryUsage)}
              icon="memory"
            />
            <MetricCard
              title="API Latency"
              value={apiLatency}
              unit="ms"
              status={getStatus('latency', apiLatency)}
              icon="access-point-network"
            />
            <MetricCard
              title="Screen Load"
              value={screenLoadTime}
              unit="ms"
              status={getStatus('screenLoad', screenLoadTime)}
              icon="monitor-screenshot"
            />
          </View>

          {/* FPS Chart */}
          {renderFpsChart()}

          {/* Device Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Info</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Platform</Text>
              <Text style={styles.infoValue}>
                {Platform.OS} {Platform.Version}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>JS Engine</Text>
              <Text style={styles.infoValue}>
                {(global as Record<string, unknown>).HermesInternal
                  ? 'Hermes'
                  : 'JavaScriptCore'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>React Native</Text>
              <Text style={styles.infoValue}>0.81.5</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dev Mode</Text>
              <Text style={styles.infoValue}>{__DEV__ ? 'Yes' : 'No'}</Text>
            </View>
          </View>

          {/* Performance Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Tips</Text>
            {fps < 30 && (
              <View style={styles.tip}>
                <MaterialCommunityIcons
                  name="alert"
                  size={16}
                  color={COLORS.error}
                />
                <Text style={styles.tipText}>
                  Low FPS detected. Check for heavy computations or animations.
                </Text>
              </View>
            )}
            {memoryUsage > 80 && (
              <View style={styles.tip}>
                <MaterialCommunityIcons
                  name="alert"
                  size={16}
                  color={COLORS.error}
                />
                <Text style={styles.tipText}>
                  High memory usage. Consider optimizing images and clearing
                  caches.
                </Text>
              </View>
            )}
            {apiLatency > 2000 && (
              <View style={styles.tip}>
                <MaterialCommunityIcons
                  name="alert"
                  size={16}
                  color={COLORS.warning}
                />
                <Text style={styles.tipText}>
                  Slow API responses. Check network conditions or server
                  performance.
                </Text>
              </View>
            )}
            {fps >= 55 && memoryUsage <= 60 && apiLatency <= 500 && (
              <View style={styles.tip}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={16}
                  color={COLORS.success}
                />
                <Text style={styles.tipText}>
                  All performance metrics are within healthy ranges! 🎉
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleClearMetrics}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.actionButtonText}>Clear Metrics</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleExportMetrics}
            >
              <MaterialCommunityIcons
                name="export"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.actionButtonText}>Export Data</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

/**
 * Floating Performance Button for quick access
 */
export const PerformanceButton: React.FC<{
  onPress: () => void;
}> = ({ onPress }) => {
  const [fps, setFps] = useState(60);

  useEffect(() => {
    if (!__DEV__) return;

    const interval = setInterval(() => {
      const avgFps = PerformanceMonitor.getAverageMetric('fps');
      if (avgFps !== null) {
        setFps(Math.round(avgFps));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!__DEV__) return null;

  const color = fps >= 55 ? '#10B981' : fps >= 30 ? '#F59E0B' : '#EF4444';

  return (
    <TouchableOpacity
      style={[styles.floatingButton, { borderColor: color }]}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <MaterialCommunityIcons name="speedometer" size={16} color={color} />
      <Text style={[styles.floatingButtonText, { color }]}>{fps}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metricTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  metricValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValueText: {
    fontSize: 28,
    fontWeight: '700',
  },
  metricUnit: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  chartContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 2,
  },
  chartBar: {
    borderRadius: 2,
  },
  chartLabels: {
    position: 'absolute',
    right: 16,
    top: 40,
    justifyContent: 'space-between',
    height: 80,
  },
  chartLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.gray?.[100] || '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default PerformanceDashboard;

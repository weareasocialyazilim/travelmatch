/**
 * Storybook Performance Testing Examples
 *
 * This file demonstrates how to test cursor pagination performance
 * vs offset pagination performance using Storybook controls.
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { usePagination } from '../hooks/usePagination';

// Mock data generator
const generateMockData = (count: number) => {
  const items = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    items.push({
      id: `item-${i}`,
      title: `Item ${i}`,
      created_at: new Date(now - i * 60000).toISOString(),
    });
  }
  return items;
};

// Simulate offset pagination (slow for large offsets)
const createOffsetFetcher = (totalItems: number) => {
  const allData = generateMockData(totalItems);

  return async (cursor?: string | null) => {
    const offset = cursor ? parseInt(cursor) : 0;
    const limit = 20;

    // Simulate O(n) performance penalty for offset
    const delay = Math.min(50 + offset * 2, 2000); // Max 2s delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    const items = allData.slice(offset, offset + limit);
    const hasMore = offset + limit < totalItems;

    return {
      data: items,
      meta: {
        next_cursor: hasMore ? String(offset + limit) : null,
        has_more: hasMore,
        count: items.length,
      },
    };
  };
};

// Simulate cursor pagination (fast regardless of position)
const createCursorFetcher = (totalItems: number) => {
  const allData = generateMockData(totalItems);

  return async (cursor?: string | null) => {
    const limit = 20;
    let startIndex = 0;

    // Consistent O(1) performance
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (cursor) {
      const { id } = JSON.parse(
        Buffer.from(cursor, 'base64').toString('utf-8'),
      );
      const itemId = parseInt(id.split('-')[1]);
      startIndex = itemId + 1;
    }

    const items = allData.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < totalItems;

    let nextCursor = null;
    if (hasMore && items.length > 0) {
      const lastItem = items[items.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({
          created_at: lastItem.created_at,
          id: lastItem.id,
        }),
      ).toString('base64');
    }

    return {
      data: items,
      meta: {
        next_cursor: nextCursor,
        has_more: hasMore,
        count: items.length,
      },
    };
  };
};

interface PerformanceTestProps {
  paginationType: 'offset' | 'cursor';
  totalItems: number;
}

const PerformanceTest = ({
  paginationType,
  totalItems,
}: PerformanceTestProps) => {
  const [loadTimes, setLoadTimes] = React.useState<number[]>([]);
  const startTimeRef = React.useRef<number>(0);

  const fetcher = React.useMemo(() => {
    return paginationType === 'offset'
      ? createOffsetFetcher(totalItems)
      : createCursorFetcher(totalItems);
  }, [paginationType, totalItems]);

  const { items, loadMore, hasMore, loading } = usePagination(fetcher, {
    limit: 20,
    autoLoad: true,
  });

  React.useEffect(() => {
    if (loading) {
      startTimeRef.current = Date.now();
    } else if (startTimeRef.current > 0) {
      const loadTime = Date.now() - startTimeRef.current;
      setLoadTimes((prev) => [...prev, loadTime]);
      startTimeRef.current = 0;
    }
  }, [loading]);

  const avgLoadTime =
    loadTimes.length > 0
      ? Math.round(loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length)
      : 0;

  const lastLoadTime = loadTimes[loadTimes.length - 1] || 0;

  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemSubtitle}>ID: {item.id}</Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.footerText}>Loading...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {paginationType === 'offset'
            ? 'Offset Pagination'
            : 'Cursor Pagination'}
        </Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Items Loaded</Text>
            <Text style={styles.statValue}>{items.length}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Last Load Time</Text>
            <Text
              style={[
                styles.statValue,
                lastLoadTime > 500 && { color: '#FF3B30' },
              ]}
            >
              {lastLoadTime}ms
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Avg Load Time</Text>
            <Text
              style={[
                styles.statValue,
                avgLoadTime > 500 && { color: '#FF3B30' },
              ]}
            >
              {avgLoadTime}ms
            </Text>
          </View>
        </View>

        <View style={styles.performanceNote}>
          <Text style={styles.noteTitle}>
            {paginationType === 'offset'
              ? '⚠️ O(n) Performance'
              : '✅ O(1) Performance'}
          </Text>
          <Text style={styles.noteText}>
            {paginationType === 'offset'
              ? 'Load time increases with each page (notice the delay growing)'
              : 'Consistent load time regardless of page position'}
          </Text>
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          if (hasMore && !loading) {
            loadMore();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  performanceNote: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  list: {
    padding: 8,
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    marginLeft: 8,
    color: '#666',
  },
});

const meta: Meta<typeof PerformanceTest> = {
  title: 'Performance/Pagination Comparison',
  component: PerformanceTest,
  argTypes: {
    paginationType: {
      control: { type: 'radio' },
      options: ['offset', 'cursor'],
    },
    totalItems: {
      control: { type: 'number', min: 50, max: 1000, step: 50 },
    },
  },
  args: {
    paginationType: 'cursor',
    totalItems: 500,
  },
};

export default meta;

type Story = StoryObj<typeof PerformanceTest>;

export const CursorPagination: Story = {
  args: {
    paginationType: 'cursor',
    totalItems: 500,
  },
};

export const OffsetPagination: Story = {
  args: {
    paginationType: 'offset',
    totalItems: 500,
  },
};

export const LargeDatasetCursor: Story = {
  args: {
    paginationType: 'cursor',
    totalItems: 1000,
  },
};

export const LargeDatasetOffset: Story = {
  args: {
    paginationType: 'offset',
    totalItems: 1000,
  },
};

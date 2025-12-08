import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { usePagination } from '../hooks/usePagination';

// Mock moment data
const generateMockMoment = (id: number, createdAt: Date) => ({
  id: `moment-${id}`,
  title: `Experience ${id}`,
  description: `Amazing travel experience #${id}`,
  price: Math.floor(Math.random() * 200) + 50,
  created_at: createdAt.toISOString(),
});

// Mock fetcher with cursor pagination
const createMockFetcher = (totalItems = 100) => {
  return async (cursor?: string | null) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const limit = 20;
    let startIndex = 0;

    if (cursor) {
      const { id } = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
      const momentId = parseInt(id.split('-')[1]);
      startIndex = momentId;
    }

    const items = [];
    const now = new Date();
    
    for (let i = startIndex; i < Math.min(startIndex + limit, totalItems); i++) {
      const createdAt = new Date(now.getTime() - i * 60000); // 1 minute apart
      items.push(generateMockMoment(i, createdAt));
    }

    const hasMore = startIndex + limit < totalItems;
    let nextCursor = null;

    if (hasMore && items.length > 0) {
      const lastItem = items[items.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({
          created_at: lastItem.created_at,
          id: lastItem.id,
        })
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

// Pagination list component
const PaginatedList = ({ totalItems = 100 }: { totalItems?: number }) => {
  const fetcher = React.useMemo(() => createMockFetcher(totalItems), [totalItems]);
  
  const { items, loadMore, refresh, hasMore, loading, error } = usePagination(
    fetcher,
    { limit: 20, autoLoad: true }
  );

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderItem = ({ item }: any) => (
    <View
      style={{
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: '#fff',
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
        {item.description}
      </Text>
      <Text style={{ fontSize: 12, color: '#999' }}>
        ${item.price} • {new Date(item.created_at).toLocaleTimeString()}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', fontSize: 16, marginBottom: 8 }}>Error</Text>
        <Text style={{ color: '#666', textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View
        style={{
          padding: 16,
          backgroundColor: '#007AFF',
          borderBottomWidth: 1,
          borderBottomColor: '#ddd',
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff' }}>
          Cursor Pagination Demo
        </Text>
        <Text style={{ fontSize: 14, color: '#fff', marginTop: 4 }}>
          {items.length} items loaded {hasMore && '• Scroll for more'}
        </Text>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
};

const meta: Meta<typeof PaginatedList> = {
  title: 'Hooks/usePagination',
  component: PaginatedList,
  argTypes: {
    totalItems: {
      control: { type: 'number', min: 10, max: 1000, step: 10 },
      defaultValue: 100,
    },
  },
  args: {
    totalItems: 100,
  },
};

export default meta;

type Story = StoryObj<typeof PaginatedList>;

export const Default: Story = {
  args: {
    totalItems: 100,
  },
};

export const SmallDataset: Story = {
  args: {
    totalItems: 25,
  },
};

export const LargeDataset: Story = {
  args: {
    totalItems: 500,
  },
};

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import supabaseDb from '@/services/supabaseDbService';
import { useAuth } from '@/context/AuthContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { Undo2 } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';

interface DeletedMoment {
  id: string;
  title: string;
  description: string;
  deleted_at: string;
}

export function DeletedMomentsScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: deletedMoments, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['deleted-moments', user?.id],
    queryFn: async () => {
      const result = await supabaseDb.moments.getDeleted(user!.id);
      if (result.error) throw result.error;
      return result.data as DeletedMoment[];
    },
    enabled: !!user?.id,
  });

  const restoreMutation = useMutation({
    mutationFn: async (momentId: string) => {
      const result = await supabaseDb.moments.restore(momentId);
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deleted-moments'] });
      queryClient.invalidateQueries({ queryKey: ['moments'] });
      queryClient.invalidateQueries({ queryKey: ['user-moments'] });
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Deleted Moments</Text>
        <Text style={styles.headerSubtitle}>
          Items are kept for 90 days before permanent deletion
        </Text>
      </View>

      {/* List */}
      <FlashList
        data={deletedMoments || []}
        estimatedItemSize={150}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        renderItem={({ item }: { item: DeletedMoment }) => (
          <View style={styles.momentItem}>
            <View style={styles.momentInfo}>
              <Text style={styles.momentTitle}>
                {item.title}
              </Text>
              <Text style={styles.momentDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.deletedInfo}>
                <Text style={styles.deletedText}>
                  Deleted {formatDistanceToNow(new Date(item.deleted_at))} ago
                </Text>
              </View>
            </View>

            {/* Restore Button */}
            <TouchableOpacity
              onPress={() => restoreMutation.mutate(item.id)}
              disabled={restoreMutation.isPending}
              style={styles.restoreButton}
            >
              <Undo2 size={16} color="white" />
              <Text style={styles.restoreButtonText}>Restore</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="delete-empty-outline"
            title="No deleted moments"
            description="Deleted moments will appear here and can be restored within 90 days"
            actionLabel="My Moments"
            onAction={() => navigation.navigate('MyMoments' as never)}
          />
        }
        contentContainerStyle={{
          paddingBottom: 16,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  momentItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  momentInfo: {
    flex: 1,
    paddingRight: 16,
  },
  momentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  momentDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  deletedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  deletedText: {
    fontSize: 12,
    color: COLORS.error,
  },
  restoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restoreButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

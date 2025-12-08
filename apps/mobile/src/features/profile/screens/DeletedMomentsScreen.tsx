import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseDb } from '@/services/supabaseDbService';
import { useAuth } from '@/context/AuthContext';
import { Undo2, Trash2 } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { useNavigation } from '@react-navigation/native';

export function DeletedMomentsScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: deletedMoments, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['deleted-moments', user?.id],
    queryFn: async () => {
      const result = await supabaseDb.moments.getDeleted(user!.id);
      if (result.error) throw result.error;
      return result.data;
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
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="p-4 border-b border-border bg-card">
        <Text className="text-2xl font-bold text-foreground">Deleted Moments</Text>
        <Text className="text-sm text-muted-foreground mt-1">
          Items are kept for 90 days before permanent deletion
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={deletedMoments || []}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        renderItem={({ item }) => (
          <View className="p-4 border-b border-border bg-card/50">
            <View className="flex-row justify-between items-start">
              {/* Moment Info */}
              <View className="flex-1 pr-4">
                <Text className="text-lg font-semibold text-foreground">
                  {item.title}
                </Text>
                <Text className="text-sm text-muted-foreground mt-1" numberOfLines={2}>
                  {item.description}
                </Text>
                <View className="flex-row items-center mt-2">
                  <Text className="text-xs text-destructive">
                    Deleted {formatDistanceToNow(new Date(item.deleted_at))} ago
                  </Text>
                </View>
              </View>

              {/* Restore Button */}
              <TouchableOpacity
                onPress={() => restoreMutation.mutate(item.id)}
                disabled={restoreMutation.isPending}
                className="px-4 py-2 bg-primary rounded-lg flex-row items-center gap-2"
              >
                <Undo2 size={16} color="white" />
                <Text className="text-white font-semibold text-sm">Restore</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="p-12 items-center justify-center">
            <Trash2 size={64} color="#9ca3af" />
            <Text className="text-xl font-semibold text-muted-foreground mt-6">
              No deleted moments
            </Text>
            <Text className="text-sm text-muted-foreground mt-2 text-center">
              Deleted moments will appear here and can be restored within 90 days
            </Text>
          </View>
        }
        contentContainerStyle={{
          flexGrow: 1,
        }}
      />
    </View>
  );
}

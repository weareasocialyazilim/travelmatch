/**
 * Example: Profile with Offline-First Caching
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ProfileSkeleton } from '../components/skeletons';
import { cacheKeys, CACHE_CONFIG, queryClient, optimisticUpdate } from '../services/offlineCache';
import { userService } from '../services/userService';

export function ProfileScreen({ userId }: { userId: string }) {
  // Query with offline support
  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: cacheKeys.profile(userId),
    queryFn: () => userService.getProfile(userId),
    staleTime: CACHE_CONFIG.profile.staleTime,
    cacheTime: CACHE_CONFIG.profile.cacheTime,
  });

  // Mutation with optimistic update
  const followMutation = useMutation({
    mutationFn: (userId: string) => userService.followUser(userId),
    
    // Optimistic update (update UI immediately)
    onMutate: async (userId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cacheKeys.profile(userId) });
      
      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(cacheKeys.profile(userId));
      
      // Optimistically update
      queryClient.setQueryData(cacheKeys.profile(userId), (old: any) => ({
        ...old,
        isFollowing: true,
        followerCount: old.followerCount + 1,
      }));
      
      return { previousProfile };
    },
    
    // Rollback on error
    onError: (err, userId, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(cacheKeys.profile(userId), context.previousProfile);
      }
    },
    
    // Refetch on success
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: cacheKeys.profile(userId) });
    },
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError) {
    return (
      <View style={styles.error}>
        <Text>Failed to load profile: {error.message}</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>{profile.name}</Text>
      <Button
        title={profile.isFollowing ? 'Following' : 'Follow'}
        onPress={() => followMutation.mutate(userId)}
        disabled={followMutation.isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    padding: 20,
    alignItems: 'center',
  },
});

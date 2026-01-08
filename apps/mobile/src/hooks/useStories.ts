/**
 * useStories Hook
 *
 * Fetches and manages user stories from the database.
 * Stories are time-limited content (24 hours) that users can post about their moments.
 *
 * Story Visibility Rules:
 * 1. Users you've interacted with (messaged/had conversations)
 * 2. Users nearby (based on location proximity)
 * 3. After 24 hours, story becomes a regular moment card in feed
 *
 * NO FOLLOW FEATURE - This is not a social media app
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { logger } from '@/utils/logger';
import * as Location from 'expo-location';

export interface StoryItem {
  id: string;
  imageUrl: string;
  videoUrl?: string;
  createdAt: string;
  expiresAt: string;
  viewCount: number;
  momentId?: string;
}

export interface UserStoryData {
  userId: string;
  userName: string;
  userAvatar: string;
  isNew: boolean;
  items: StoryItem[];
  distance?: number; // km - for nearby sorting
}

interface UseStoriesReturn {
  stories: UserStoryData[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  markAsViewed: (storyId: string) => Promise<void>;
}

// Default radius for nearby stories (in km)
const NEARBY_RADIUS_KM = 50;

/**
 * Calculate distance between two coordinates in km (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const useStories = (): UseStoriesReturn => {
  const [stories, setStories] = useState<UserStoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        setStories([]);
        return;
      }

      const userId = currentUser.user.id;

      // Get user's current location for nearby stories
      let userLocation: { latitude: number; longitude: number } | null = null;
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          userLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
        }
      } catch (locErr) {
        logger.debug('[useStories] Could not get location:', locErr);
      }

      // Stories expire after 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      // Step 1: Get users I've interacted with (had conversations)
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('participant_ids')
        .contains('participant_ids', [userId]);

      const interactedUserIds = new Set<string>();
      if (conversationsData) {
        for (const conv of conversationsData) {
          const participants = conv.participant_ids as string[];
          for (const pid of participants) {
            if (pid !== userId) {
              interactedUserIds.add(pid);
            }
          }
        }
      }

      // Step 2: Fetch active stories
      const { data: storiesData, error: fetchError } = await supabase
        .from('stories')
        .select(
          `
          id,
          user_id,
          image_url,
          video_url,
          created_at,
          expires_at,
          view_count,
          moment_id,
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            location
          )
        `,
        )
        .gte('expires_at', new Date().toISOString())
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // If stories table doesn't exist, return empty array gracefully
      if (fetchError?.code === 'PGRST205' || fetchError?.code === '42P01') {
        setStories([]);
        return;
      }

      if (fetchError) {
        throw fetchError;
      }

      // Step 3: Filter stories by interaction or proximity
      const userStoriesMap = new Map<string, UserStoryData>();

      for (const story of (storiesData as any[]) || []) {
        const profile = story.profiles;
        if (!profile) continue;

        const storyUserId = profile.id;

        // Skip own stories in the feed
        if (storyUserId === userId) continue;

        // Check if user is in interacted list
        const hasInteracted = interactedUserIds.has(storyUserId);

        // Check if user is nearby
        let distance: number | undefined;
        let isNearby = false;

        if (userLocation && profile.location) {
          try {
            const profileLocation =
              typeof profile.location === 'string'
                ? JSON.parse(profile.location)
                : profile.location;

            if (profileLocation.latitude && profileLocation.longitude) {
              distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                profileLocation.latitude,
                profileLocation.longitude,
              );
              isNearby = distance <= NEARBY_RADIUS_KM;
            }
          } catch {
            // Invalid location format, skip proximity check
          }
        }

        // Only include if interacted OR nearby
        if (!hasInteracted && !isNearby) continue;

        if (!userStoriesMap.has(storyUserId)) {
          userStoriesMap.set(storyUserId, {
            userId: storyUserId,
            userName: profile.full_name || 'Anonymous',
            userAvatar: profile.avatar_url || '',
            isNew: true,
            items: [],
            distance,
          });
        }

        const userStory = userStoriesMap.get(storyUserId)!;
        userStory.items.push({
          id: story.id,
          imageUrl: story.image_url,
          videoUrl: story.video_url,
          createdAt: story.created_at,
          expiresAt: story.expires_at,
          viewCount: story.view_count || 0,
          momentId: story.moment_id,
        });
      }

      // Step 4: Check which stories have been viewed
      const { data: viewedStories } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('user_id', userId);

      const viewedIds = new Set(
        ((viewedStories as any[]) || []).map((v) => v.story_id),
      );

      // Update isNew status
      for (const userStory of userStoriesMap.values()) {
        userStory.isNew = userStory.items.some(
          (item) => !viewedIds.has(item.id),
        );
      }

      // Sort: new stories first, then by proximity, then by most recent
      const sortedStories = Array.from(userStoriesMap.values()).sort((a, b) => {
        // New stories first
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;

        // Then by proximity (closer first)
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }

        // Then by most recent
        const aLatest = a.items[0]?.createdAt || '';
        const bLatest = b.items[0]?.createdAt || '';
        return bLatest.localeCompare(aLatest);
      });

      setStories(sortedStories);
    } catch (err) {
      const fetchError = err as Error;
      const errorCode = (err as any)?.code;
      if (errorCode !== 'PGRST205' && errorCode !== '42P01') {
        logger.error('[useStories] Error fetching stories:', fetchError);
        setError(fetchError);
      } else {
        setStories([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsViewed = useCallback(async (storyId: string) => {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      const { error: upsertError } = await supabase.from('story_views').upsert({
        story_id: storyId,
        user_id: currentUser.user.id,
        viewed_at: new Date().toISOString(),
      });

      if (upsertError?.code === 'PGRST205' || upsertError?.code === '42P01')
        return;
      if (upsertError) throw upsertError;

      // Update local state
      setStories((prev) =>
        prev.map((userStory) => ({
          ...userStory,
          items: userStory.items.map((item) =>
            item.id === storyId
              ? { ...item, viewCount: item.viewCount + 1 }
              : item,
          ),
        })),
      );
    } catch (err) {
      const errorCode = (err as any)?.code;
      if (errorCode !== 'PGRST205' && errorCode !== '42P01') {
        logger.error('[useStories] Error marking story as viewed:', err);
      }
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  return {
    stories,
    loading,
    error,
    refresh: fetchStories,
    markAsViewed,
  };
};

export default useStories;

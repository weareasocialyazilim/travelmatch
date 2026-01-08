/**
 * useStories Hook
 *
 * Fetches and manages user stories from the database.
 * Stories are time-limited content that users can post about their moments.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase';
import { logger } from '@/utils/logger';

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
}

interface UseStoriesReturn {
  stories: UserStoryData[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  markAsViewed: (storyId: string) => Promise<void>;
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

      // Fetch stories from users the current user follows, ordered by recency
      // Stories expire after 24 hours
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data, error: fetchError } = await supabase
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
          users:user_id (
            id,
            name,
            avatar_url
          )
        `,
        )
        .gte('expires_at', new Date().toISOString())
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false });

      // If stories table doesn't exist, return empty array gracefully (no error logging)
      if (fetchError?.code === 'PGRST205') {
        // Table doesn't exist yet - this is expected in some environments
        setStories([]);
        return;
      }

      if (fetchError) {
        throw fetchError;
      }

      // Group stories by user
      const userStoriesMap = new Map<string, UserStoryData>();

      for (const story of (data as any[]) || []) {
        const user = story.users;
        if (!user) continue;

        const userId = user.id;

        if (!userStoriesMap.has(userId)) {
          userStoriesMap.set(userId, {
            userId,
            userName: user.name || 'Anonymous',
            userAvatar: user.avatar_url || '',
            isNew: true, // Will be updated based on view status
            items: [],
          });
        }

        const userStory = userStoriesMap.get(userId)!;
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

      // Check which stories have been viewed
      const { data: viewedStories } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('user_id', currentUser.user.id);

      const viewedIds = new Set(
        ((viewedStories as any[]) || []).map((v) => v.story_id),
      );

      // Update isNew status
      for (const userStory of userStoriesMap.values()) {
        userStory.isNew = userStory.items.some(
          (item) => !viewedIds.has(item.id),
        );
      }

      // Sort: new stories first, then by most recent
      const sortedStories = Array.from(userStoriesMap.values()).sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;

        const aLatest = a.items[0]?.createdAt || '';
        const bLatest = b.items[0]?.createdAt || '';
        return bLatest.localeCompare(aLatest);
      });

      setStories(sortedStories);
    } catch (err) {
      const fetchError = err as Error;
      // Don't log error if it's just a missing table (PGRST205)
      const errorCode = (err as any)?.code;
      if (errorCode !== 'PGRST205') {
        logger.error('[useStories] Error fetching stories:', fetchError);
        setError(fetchError);
      } else {
        // Table doesn't exist - silently return empty
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

      // Silently ignore if table doesn't exist
      if (upsertError?.code === 'PGRST205') return;
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
      // Don't log PGRST205 errors (table not found)
      const errorCode = (err as any)?.code;
      if (errorCode !== 'PGRST205') {
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

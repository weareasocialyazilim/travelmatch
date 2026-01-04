/**
 * Stories Service
 *
 * MASTER Revizyonu: Stories artık bağımsız değil, Moment-linked olmalı.
 *
 * Kurallar:
 * 1. Her Story mutlaka bir Moment'a bağlı (moment_id ZORUNLU)
 * 2. 24 saat sonra otomatik expire (expires_at)
 * 3. Gizli profiller Stories'de görünmez
 * 4. "Hediye Et" butonu doğrudan Moment ödeme akışına gider
 *
 * @module services/storiesService
 */

import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

// ============================================
// Types
// ============================================

export interface StoryItem {
  id: string;
  imageUrl: string;
  videoUrl?: string;
  momentId: string;
  momentTitle: string;
  momentCategory: string;
  momentPrice: number;
  momentCurrency: string;
  createdAt: string;
  expiresAt: string;
  viewCount: number;
  location?: string;
  distance?: string;
}

export interface UserStory {
  id: string;
  name: string;
  avatar: string;
  hasStory: boolean;
  isNew: boolean;
  isVerified: boolean;
  trustScore: number;
  stories: StoryItem[];
}

export interface CreateStoryParams {
  momentId: string;
  imageUrl: string;
  videoUrl?: string;
}

// ============================================
// Stories Service
// ============================================

export const storiesService = {
  /**
   * Fetch active stories for Discover feed
   * Respects privacy settings - hidden profiles are excluded
   */
  async getActiveStories(): Promise<UserStory[]> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return [];
      }

      const now = new Date().toISOString();

      // Fetch non-expired stories with moment data
      // Exclude users with hidden profiles
      const { data, error } = await supabase
        .from('stories')
        .select(
          `
          id,
          image_url,
          video_url,
          moment_id,
          created_at,
          expires_at,
          view_count,
          user:profiles!user_id (
            id,
            name,
            avatar_url,
            is_verified,
            trust_score,
            profile_visibility
          ),
          moment:moments!moment_id (
            id,
            title,
            category,
            price,
            currency,
            location_name
          )
        `,
        )
        .gt('expires_at', now)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('[StoriesService] Fetch error:', error);
        throw error;
      }

      // Group by user and filter hidden profiles
      const userStoriesMap = new Map<string, UserStory>();

      for (const story of (data as any[]) || []) {
        const user = story.user;
        const moment = story.moment;

        // Skip if user has hidden profile
        if (!user || user.profile_visibility === 'hidden') continue;
        // Skip if no moment linked (enforce Moment-linked rule)
        if (!moment) continue;

        const userId = user.id;

        if (!userStoriesMap.has(userId)) {
          userStoriesMap.set(userId, {
            id: userId,
            name: user.name || 'Anonim',
            avatar: user.avatar_url || '',
            hasStory: true,
            isNew: true,
            isVerified: user.is_verified || false,
            trustScore: user.trust_score || 0,
            stories: [],
          });
        }

        const userStory = userStoriesMap.get(userId)!;
        userStory.stories.push({
          id: story.id,
          imageUrl: story.image_url,
          videoUrl: story.video_url,
          momentId: moment.id,
          momentTitle: moment.title || 'Anı',
          momentCategory: moment.category || 'experience',
          momentPrice: moment.price || 0,
          momentCurrency: moment.currency || 'TRY',
          createdAt: story.created_at,
          expiresAt: story.expires_at,
          viewCount: story.view_count || 0,
          location: moment.location_name,
        });
      }

      // Check viewed status
      const { data: viewedStories } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('user_id', currentUser.user.id);

      const viewedIds = new Set(
        ((viewedStories as any[]) || []).map((v) => v.story_id),
      );

      // Update isNew status and sort
      for (const userStory of userStoriesMap.values()) {
        userStory.isNew = userStory.stories.some(
          (item) => !viewedIds.has(item.id),
        );
      }

      // Sort: new stories first, then by recency
      return Array.from(userStoriesMap.values()).sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;

        const aLatest = a.stories[0]?.createdAt || '';
        const bLatest = b.stories[0]?.createdAt || '';
        return bLatest.localeCompare(aLatest);
      });
    } catch (error) {
      logger.error('[StoriesService] getActiveStories error:', error);
      return [];
    }
  },

  /**
   * Create a new story linked to a Moment
   * RULE: Story'ler mutlaka bir Moment'a bağlı olmalı
   */
  async createStory(params: CreateStoryParams): Promise<{ id: string } | null> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Not authenticated');
      }

      // Validate moment exists and belongs to user
      const { data: moment, error: momentError } = await supabase
        .from('moments')
        .select('id, user_id')
        .eq('id', params.momentId)
        .single();

      if (momentError || !moment) {
        throw new Error('Moment not found');
      }

      if (moment.user_id !== currentUser.user.id) {
        throw new Error('You can only create stories for your own moments');
      }

      // Calculate expiry (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { data, error } = await supabase
        .from('stories')
        .insert({
          user_id: currentUser.user.id,
          moment_id: params.momentId,
          image_url: params.imageUrl,
          video_url: params.videoUrl,
          expires_at: expiresAt.toISOString(),
          is_deleted: false,
        })
        .select('id')
        .single();

      if (error) {
        logger.error('[StoriesService] Create error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('[StoriesService] createStory error:', error);
      return null;
    }
  },

  /**
   * Mark a story as viewed
   */
  async markAsViewed(storyId: string): Promise<void> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      await supabase.from('story_views').upsert({
        story_id: storyId,
        user_id: currentUser.user.id,
        viewed_at: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('[StoriesService] markAsViewed error:', error);
    }
  },

  /**
   * Delete/expire own story
   */
  async deleteStory(storyId: string): Promise<boolean> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return false;

      const { error } = await supabase
        .from('stories')
        .update({ is_deleted: true })
        .eq('id', storyId)
        .eq('user_id', currentUser.user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('[StoriesService] deleteStory error:', error);
      return false;
    }
  },

  /**
   * Reply to story with gift offer
   * REFACTOR: "Mesaj at" yerine "Hediye Teklifi ile Yanıtla"
   */
  async replyWithGiftOffer(params: {
    storyId: string;
    momentId: string;
    recipientId: string;
    amount: number;
    message?: string;
  }): Promise<{ success: boolean; giftId?: string }> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error('Not authenticated');
      }

      // Create gift offer via gifts table
      const { data, error } = await supabase
        .from('gifts')
        .insert({
          sender_id: currentUser.user.id,
          recipient_id: params.recipientId,
          moment_id: params.momentId,
          amount: params.amount,
          currency: 'TRY',
          message: params.message,
          source: 'story_reply', // Track that this came from story
          status: 'pending',
        })
        .select('id')
        .single();

      if (error) throw error;

      // Record story interaction
      await supabase.from('story_interactions').insert({
        story_id: params.storyId,
        user_id: currentUser.user.id,
        interaction_type: 'gift_offer',
        gift_id: data.id,
      });

      return { success: true, giftId: data.id };
    } catch (error) {
      logger.error('[StoriesService] replyWithGiftOffer error:', error);
      return { success: false };
    }
  },
};

export default storiesService;

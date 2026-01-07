import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/routeParams';

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  isHost?: boolean;
}

type MomentCommentsRouteProp = RouteProp<RootStackParamList, 'MomentComments'>;

export const MomentCommentsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<MomentCommentsRouteProp>();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const { momentId, commentCount: initialCount = 0 } = route.params || {};

  // Fetch comments from API
  const fetchComments = useCallback(async () => {
    if (!momentId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('moment_comments')
        .select(
          `
          id,
          content,
          created_at,
          likes_count,
          user:users!user_id (
            id,
            full_name,
            avatar_url
          ),
          moment:moments!moment_id (
            host_id
          )
        `,
        )
        .eq('moment_id', momentId)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('Failed to fetch comments:', error);
        return;
      }

      // Transform data to Comment format
      type CommentItem = {
        id: string;
        content: string;
        created_at: string;
        likes_count: number;
        user: { id: string; full_name: string; avatar_url: string } | null;
        moment: { host_id: string } | null;
      };
      const transformedComments: Comment[] = (
        (data || []) as CommentItem[]
      ).map((item) => {
        const user = item.user;
        const moment = item.moment;
        const createdAt = new Date(item.created_at);
        const now = new Date();
        const diffMs = now.getTime() - createdAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        let timeStr = 'now';
        if (diffDays > 0) timeStr = `${diffDays}d`;
        else if (diffHours > 0) timeStr = `${diffHours}h`;
        else if (diffMins > 0) timeStr = `${diffMins}m`;

        return {
          id: item.id,
          user: user?.full_name || 'Unknown',
          avatar: user?.avatar_url || '',
          text: item.content,
          time: timeStr,
          likes: item.likes_count || 0,
          isHost: user?.id === moment?.host_id,
        };
      });

      setComments(transformedComments);
    } catch (error) {
      logger.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [momentId]);

  // Initial fetch
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (isMounted) {
        await fetchComments();
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [fetchComments]);

  const commentCount = comments.length || initialCount;

  const handleSend = async () => {
    if (!text.trim() || !momentId) return;

    const content = text.trim();
    setText(''); // Clear input immediately for better UX

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('User not authenticated');
        return;
      }

      // Optimistic update
      const tempComment: Comment = {
        id: `temp-${Date.now()}`,
        user: 'You',
        avatar: user.user_metadata?.avatar_url || '',
        text: content,
        time: 'now',
        likes: 0,
      };
      setComments((prev) => [...prev, tempComment]);

      // Post to API
      const { data, error } = await supabase
        .from('moment_comments')
        .insert({
          moment_id: momentId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to post comment:', error);
        // Revert optimistic update
        setComments((prev) => prev.filter((c) => c.id !== tempComment.id));
        return;
      }

      // Update temp comment with real ID
      setComments((prev) =>
        prev.map((c) =>
          c.id === tempComment.id
            ? { ...c, id: (data as { id: string }).id }
            : c,
        ),
      );
    } catch (error) {
      logger.error('Error posting comment:', error);
    }
  };

  const handleLike = async (commentId: string) => {
    // Optimistic update
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment,
      ),
    );

    try {
      // Call API to record the like
      const { error } = await (supabase.rpc as any)('increment_comment_likes', {
        comment_id: commentId,
      });

      if (error) {
        // Revert on error
        logger.error('Failed to like comment:', error);
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId
              ? { ...comment, likes: comment.likes - 1 }
              : comment,
          ),
        );
      }
    } catch (error) {
      logger.error('Error liking comment:', error);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentRow}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.bubble}>
        <View style={styles.bubbleHeader}>
          <Text style={styles.username}>{item.user}</Text>
          {item.isHost && (
            <View style={styles.hostBadge}>
              <Text style={styles.hostText}>HOST</Text>
            </View>
          )}
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
        <TouchableOpacity
          style={styles.likeRow}
          onPress={() => handleLike(item.id)}
        >
          <Ionicons name="heart-outline" size={14} color="#888" />
          <Text style={styles.likeCount}>{item.likes}</Text>
          <Text style={styles.replyText}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Comments ({commentCount})</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.brand.primary} />
        </View>
      ) : (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No comments yet. Be the first!
              </Text>
            </View>
          }
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100',
            }}
            style={styles.inputAvatar}
          />
          <TextInput
            style={styles.input}
            placeholder="Ask something..."
            placeholderTextColor="#666"
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Ionicons name="arrow-up" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    padding: 20,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 15,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  bubble: {
    flex: 1,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  username: {
    color: '#ccc',
    fontWeight: '600',
    fontSize: 13,
  },
  hostBadge: {
    backgroundColor: COLORS.brand.primary,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  hostText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'black',
  },
  time: {
    color: '#666',
    fontSize: 12,
  },
  commentText: {
    color: 'white',
    fontSize: 15,
    lineHeight: 20,
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  likeCount: {
    color: '#888',
    fontSize: 12,
  },
  replyText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 10,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: '#111',
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    color: 'white',
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  headerSpacer: {
    width: 24,
  },
});

export default MomentCommentsScreen;

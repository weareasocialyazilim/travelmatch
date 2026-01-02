import React, { useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
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

// Mock data - replace with API data
const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    user: 'Marc B.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100',
    text: 'Is there a dress code?',
    time: '2m',
    likes: 4,
  },
  {
    id: '2',
    user: 'Selin Y.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100',
    text: 'Yes, smart casual! 👔',
    time: '1m',
    likes: 12,
    isHost: true,
  },
];

type MomentCommentsRouteProp = RouteProp<RootStackParamList, 'MomentComments'>;

export const MomentCommentsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<MomentCommentsRouteProp>();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);

  const { momentId: _momentId, commentCount = comments.length } = route.params || {};

  const handleSend = () => {
    if (!text.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      user: 'You',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100',
      text: text.trim(),
      time: 'now',
      likes: 0,
    };

    setComments((prev) => [...prev, newComment]);
    setText('');
  };

  const handleLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
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

      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
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
            style={[
              styles.sendBtn,
              !text.trim() && styles.sendBtnDisabled,
            ]}
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

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { NavigationProp } from '@react-navigation/native';
import { useToast } from '@/context/ToastContext';
import { useConfirmation } from '@/context/ConfirmationContext';

interface ArchivedChat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  archivedAt: string;
  isVerified: boolean;
}

export const ArchivedChatsScreen: React.FC = () => {
    const { showToast } = useToast();
  const { showConfirmation } = useConfirmation();
const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [archivedChats, setArchivedChats] = useState<ArchivedChat[]>([
    {
      id: '1',
      name: 'Michael',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      lastMessage: 'It was nice meeting you!',
      archivedAt: '3 days ago',
      isVerified: true,
    },
    {
      id: '2',
      name: 'Sophie',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      lastMessage: 'Thanks for the recommendation!',
      archivedAt: '1 week ago',
      isVerified: false,
    },
  ]);

  const handleUnarchive = (id: string) => {
    Alert.alert(
      'Unarchive Chat',
      'This chat will be restored to your chats list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unarchive',
          onPress: () => {
            setArchivedChats((prev) => prev.filter((chat) => chat.id !== id));
            showToast('Chat has been restored to your chats.', 'success');
          },
        },
      ],
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Chat?',
      'This will permanently delete this conversation. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setArchivedChats((prev) => prev.filter((chat) => chat.id !== id));
            showToast('Chat has been permanently deleted.', 'info');
          },
        },
      ],
    );
  };

  const handleOpenChat = (chat: ArchivedChat) => {
    navigation.navigate('Chat', {
      otherUser: {
        id: chat.id,
        name: chat.name,
        avatar: chat.avatar,
        isVerified: chat.isVerified,
        type: 'traveler',
        role: 'Traveler',
        kyc: chat.isVerified ? 'Verified' : 'Unverified',
        location: 'Unknown',
      },
    });
  };

  const renderChat = (chat: ArchivedChat) => (
    <TouchableOpacity
      key={chat.id}
      style={styles.chatCard}
      onPress={() => handleOpenChat(chat)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: chat.avatar }} style={styles.avatar} />
        {chat.isVerified && (
          <View style={styles.verifiedBadge}>
            <MaterialCommunityIcons
              name="check-decagram"
              size={14}
              color={COLORS.primary}
            />
          </View>
        )}
      </View>
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{chat.name}</Text>
        <Text style={styles.chatMessage} numberOfLines={1}>
          {chat.lastMessage}
        </Text>
        <Text style={styles.chatDate}>Archived {chat.archivedAt}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.unarchiveButton}
          onPress={() => handleUnarchive(chat.id)}
        >
          <MaterialCommunityIcons
            name="archive-arrow-up"
            size={20}
            color={COLORS.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(chat.id)}
        >
          <MaterialCommunityIcons
            name="delete"
            size={20}
            color={COLORS.error}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Archived Chats</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {archivedChats.length > 0 ? (
          <>
            <Text style={styles.sectionInfo}>
              Archived chats are hidden from your main chats list. You can still
              access them here.
            </Text>
            {archivedChats.map(renderChat)}
          </>
        ) : (
          <EmptyState
            icon="archive-off-outline"
            title="No archived chats"
            description="Chats you archive will appear here. Long press on a chat to archive it."
            actionLabel="Go to Messages"
            onAction={() => navigation.navigate('Messages')}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionInfo: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 2,
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatName: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  chatMessage: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  chatDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  unarchiveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.errorRedLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default ArchivedChatsScreen;

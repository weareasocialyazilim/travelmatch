/**
 * ArchivedChatsScreen - Archived Conversations List
 *
 * UPDATED: Replaced Trip terminology with Moment terminology
 * - type: 'traveler' → type: 'moment_host' (Alıcı)
 * - role: 'Traveler' → role: 'Anı Sahibi'
 *
 * NOTE: This screen currently uses mock data as the backend
 * does not yet support archived conversations. Backend work needed:
 * 1. Add is_archived column to conversations table
 * 2. Implement archiveConversation API
 * 3. Add getArchivedConversations query
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { showAlert } from '@/stores/modalStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/ui/EmptyState';
import { HapticManager } from '@/services/HapticManager';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';
import { useToast } from '@/context/ToastContext';
import { useTranslation } from 'react-i18next';

interface ArchivedChat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  archivedAt: string;
  isVerified: boolean;
  /** Linked moment info for context */
  linkedMoment?: {
    id: string;
    title: string;
  };
}

export const ArchivedChatsScreen: React.FC = () => {
  const { showToast } = useToast();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation();

  // Archive feature planned for v1.1 - using placeholder data for now
  const [archivedChats, setArchivedChats] = useState<ArchivedChat[]>([
    {
      id: '1',
      name: 'Michael',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      lastMessage: 'Harika bir anıydı!',
      archivedAt: '3 gün önce',
      isVerified: true,
      linkedMoment: {
        id: 'm1',
        title: 'Kapadokya Balon Turu',
      },
    },
    {
      id: '2',
      name: 'Sophie',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      lastMessage: 'Öneri için teşekkürler!',
      archivedAt: '1 hafta önce',
      isVerified: false,
    },
  ]);

  const handleUnarchive = (id: string) => {
    HapticManager.buttonPress();
    showAlert({
      title: t('messages.archived.unarchiveTitle'),
      message: t('messages.archived.unarchiveMessage'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('messages.archived.unarchive'),
          onPress: () => {
            setArchivedChats((prev) => prev.filter((chat) => chat.id !== id));
            showToast(t('messages.archived.unarchiveSuccess'), 'success');
          },
        },
      ],
    });
  };

  const handleDelete = (id: string) => {
    HapticManager.destructiveAction();
    showAlert({
      title: t('messages.archived.deleteTitle'),
      message: t('messages.archived.deleteMessage'),
      buttons: [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            setArchivedChats((prev) => prev.filter((chat) => chat.id !== id));
            showToast(t('messages.archived.deleteSuccess'), 'info');
          },
        },
      ],
    });
  };

  const handleOpenChat = (chat: ArchivedChat) => {
    HapticManager.buttonPress();
    navigation.navigate('Chat', {
      otherUser: {
        id: chat.id,
        name: chat.name,
        avatar: chat.avatar,
        isVerified: chat.isVerified,
        type: 'local' as const,
        role: 'Local' as const,
        kyc: chat.isVerified ? 'Verified' : 'Pending',
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
              color={COLORS.brand.primary}
            />
          </View>
        )}
      </View>
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{chat.name}</Text>
        <Text style={styles.chatMessage} numberOfLines={1}>
          {chat.lastMessage}
        </Text>
        {/* Show linked moment if exists */}
        {chat.linkedMoment && (
          <View style={styles.momentTag}>
            <MaterialCommunityIcons
              name="star-circle-outline"
              size={12}
              color={COLORS.brand?.accent || COLORS.primary}
            />
            <Text style={styles.momentTagText} numberOfLines={1}>
              {chat.linkedMoment.title}
            </Text>
          </View>
        )}
        <Text style={styles.chatDate}>
          {t('messages.archived.archivedAt', { time: chat.archivedAt })}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.unarchiveButton}
          onPress={() => handleUnarchive(chat.id)}
        >
          <MaterialCommunityIcons
            name="archive-arrow-up"
            size={20}
            color={COLORS.brand.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(chat.id)}
        >
          <MaterialCommunityIcons
            name="delete"
            size={20}
            color={COLORS.feedback.error}
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
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('messages.archived.title')}</Text>
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
              {t('messages.archived.info')}
            </Text>
            {archivedChats.map(renderChat)}
          </>
        ) : (
          <EmptyState
            icon="archive-off-outline"
            title={t('messages.archived.empty')}
            description={t('messages.archived.emptyDescription')}
            actionLabel={t('messages.archived.goToMessages')}
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
    backgroundColor: COLORS.bg.primary,
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
    color: COLORS.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionInfo: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
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
    backgroundColor: COLORS.utility.white,
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
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  chatMessage: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  chatDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
  momentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  momentTagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.brand?.accent || COLORS.primary,
    fontWeight: '500',
    maxWidth: 120,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  unarchiveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.brand.primaryLight,
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
});

export default ArchivedChatsScreen;

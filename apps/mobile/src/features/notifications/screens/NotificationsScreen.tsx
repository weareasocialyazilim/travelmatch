import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLORS } from '@/constants/colors';
import { TYPE_SCALE, FONTS } from '@/constants/typography';

/**
 * Awwwards standardında Bildirim Merkezi.
 * Ipeksi liste yapısı ve neon durum göstergeleri.
 * Her bildirim bir "aktivite kartı" olarak tasarlandı.
 */

type NotificationType =
  | 'gift'
  | 'trust'
  | 'comment'
  | 'social'
  | 'system'
  | 'offer';

interface NotificationItem {
  id: string;
  type: NotificationType;
  user: string;
  title?: string;
  msg: string;
  time: string;
  read: boolean;
}

const NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'gift',
    user: 'Caner Öz',
    msg: 'sana bir Moment hediye etti!',
    time: '2dk önce',
    read: false,
  },
  {
    id: '2',
    type: 'trust',
    user: 'Sistem',
    msg: "Güven puanın 94'e yükseldi! 🎉",
    time: '1sa önce',
    read: false,
  },
  {
    id: '3',
    type: 'comment',
    user: 'Melis Yılmaz',
    msg: 'Momentine bir Trust Note bıraktı.',
    time: '3sa önce',
    read: true,
  },
  {
    id: '4',
    type: 'social',
    user: 'Selin Y.',
    msg: 'maceralarını takip etmeye başladı.',
    time: '5sa önce',
    read: true,
  },
  {
    id: '5',
    type: 'system',
    user: 'Sistem',
    msg: 'Doğrulanmış gezgin oldun! 🛡️',
    time: '1g önce',
    read: true,
  },
];

export const NotificationsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIconData = (type: NotificationType, isUnread: boolean) => {
    const baseColor = isUnread ? COLORS.brand.primary : COLORS.text.muted;

    switch (type) {
      case 'gift':
      case 'offer':
        return {
          name: 'gift' as const,
          color: isUnread ? COLORS.brand.primary : COLORS.text.muted,
          bg: isUnread
            ? 'rgba(245, 158, 11, 0.15)'
            : 'rgba(168, 162, 158, 0.1)',
        };
      case 'trust':
      case 'system':
        return {
          name: 'shield-check' as const,
          color: isUnread ? COLORS.trust.primary : COLORS.text.muted,
          bg: isUnread
            ? 'rgba(16, 185, 129, 0.15)'
            : 'rgba(168, 162, 158, 0.1)',
        };
      case 'comment':
        return {
          name: 'message-text' as const,
          color: isUnread ? COLORS.accent.primary : COLORS.text.muted,
          bg: isUnread
            ? 'rgba(20, 184, 166, 0.15)'
            : 'rgba(168, 162, 158, 0.1)',
        };
      case 'social':
        return {
          name: 'heart' as const,
          color: isUnread ? COLORS.brand.secondary : COLORS.text.muted,
          bg: isUnread
            ? 'rgba(236, 72, 153, 0.15)'
            : 'rgba(168, 162, 158, 0.1)',
        };
      default:
        return {
          name: 'bell' as const,
          color: baseColor,
          bg: 'rgba(168, 162, 158, 0.1)',
        };
    }
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: NotificationItem;
    index: number;
  }) => {
    const iconData = getIconData(item.type, !item.read);

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 80).springify()}
        layout={Layout.springify()}
        style={styles.notifWrapper}
      >
        <TouchableOpacity activeOpacity={0.8}>
          <GlassCard
            intensity={item.read ? 5 : 15}
            style={[styles.card, !item.read && styles.unreadCard]}
            padding={16}
            borderRadius={20}
            showBorder={true}
          >
            {/* Icon Container */}
            <View
              style={[styles.iconContainer, { backgroundColor: iconData.bg }]}
            >
              <MaterialCommunityIcons
                name={iconData.name}
                size={22}
                color={iconData.color}
              />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.message} numberOfLines={2}>
                <Text
                  style={[styles.userName, !item.read && styles.userNameUnread]}
                >
                  {item.user}
                </Text>{' '}
                {item.msg}
              </Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>

            {/* Unread Dot */}
            {!item.read && <View style={styles.unreadDot} />}
          </GlassCard>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Geri dön"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Bildirimler</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleMarkAllRead}
          style={styles.markReadButton}
          accessibilityLabel="Tümünü okundu olarak işaretle"
          accessibilityRole="button"
        >
          <Text style={styles.markReadText}>Tümünü Oku</Text>
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <EmptyState
          icon="bell-sleep-outline"
          title="Henüz Bildirim Yok"
          description="Harika bir şeyler olduğunda seni buradan haberdar edeceğiz."
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.display.bold,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  badge: {
    backgroundColor: COLORS.brand.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: FONTS.mono.medium,
    fontWeight: '600',
    color: COLORS.white,
  },
  markReadButton: {
    padding: 4,
  },
  markReadText: {
    color: COLORS.brand.primary,
    fontSize: 12,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  separator: {
    height: 12,
  },
  notifWrapper: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.border.light,
  },
  unreadCard: {
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  userName: {
    fontFamily: FONTS.body.bold,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  userNameUnread: {
    fontWeight: '800',
  },
  message: {
    ...TYPE_SCALE.body.small,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  time: {
    fontSize: 11,
    fontFamily: FONTS.mono.regular,
    color: COLORS.text.muted,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.brand.primary,
    marginLeft: 12,
  },
});

export default NotificationsScreen;

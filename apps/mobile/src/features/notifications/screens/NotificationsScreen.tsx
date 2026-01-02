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
import { COLORS } from '@/constants/colors';

const NOTIFICATIONS = [
  {
    id: '1',
    type: 'offer',
    title: 'New Offer Received! 🎁',
    body: 'Marc B. wants to gift you "Sunset Dinner". Check the details.',
    time: '2m ago',
    read: false,
  },
  {
    id: '2',
    type: 'social',
    title: 'New Connection',
    body: 'Selin Y. started following your adventures.',
    time: '1h ago',
    read: true,
  },
  {
    id: '3',
    type: 'system',
    title: 'Verification Approved',
    body: 'You are now a verified traveler! 🛡️ Enjoy the blue tick.',
    time: '5h ago',
    read: true,
  },
  {
    id: '4',
    type: 'offer',
    title: 'Moment Expiring Soon',
    body: 'Your "Coffee at Petra" request will expire in 2 hours.',
    time: '1d ago',
    read: true,
  },
];

type NotificationItem = typeof NOTIFICATIONS[0];

export const NotificationsScreen = ({ navigation: _navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'offer': return { name: 'gift', color: COLORS.brand.primary, bg: 'rgba(245, 158, 11, 0.1)' };
      case 'social': return { name: 'heart', color: COLORS.brand.secondary, bg: 'rgba(236, 72, 153, 0.1)' };
      case 'system': return { name: 'shield-check', color: '#00D4FF', bg: 'rgba(0, 212, 255, 0.1)' };
      default: return { name: 'bell', color: 'white', bg: 'rgba(255,255,255,0.1)' };
    }
  };

  const renderItem = ({ item, index }: { item: NotificationItem, index: number }) => {
    const iconData = getIcon(item.type);

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100)}
        layout={Layout.springify()}
        style={[styles.notificationCard, !item.read && styles.unreadCard]}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconData.bg }]}>
          <MaterialCommunityIcons name={iconData.name as any} size={24} color={iconData.color} />
        </View>

        <View style={styles.content}>
          <View style={styles.rowTop}>
             <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
             {!item.read && <View style={styles.dot} />}
          </View>
          <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerTop}>
          <Text style={styles.pageTitle}>Notifications</Text>
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
             <MaterialCommunityIcons name="bell-sleep" size={64} color="rgba(255,255,255,0.2)" />
             <Text style={styles.emptyText}>All caught up!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: COLORS.backgroundDark,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
  },
  markReadText: {
    color: COLORS.brand.primary,
    fontWeight: '600',
    fontSize: 14,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Bottom space
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  unreadCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  unreadTitle: {
    color: 'white',
    fontWeight: 'bold',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.brand.primary,
  },
  body: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: COLORS.text.secondary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
});

export default NotificationsScreen;

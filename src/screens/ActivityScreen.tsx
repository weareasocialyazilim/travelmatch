import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNav from '../components/BottomNav';
import { COLORS, CARD_SHADOW } from '../constants/colors';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type ActivityType = 'trust_loop' | 'gestures' | 'messages' | 'system';
type TabType = 'trust_loop' | 'gestures' | 'messages';
type RoleType = 'giver' | 'receiver';

interface ActivityItem {
  id: string;
  type: ActivityType;
  icon: IconName;
  iconColor: string;
  title: string;
  subtitle: string;
  time: string;
  emoji?: string;
  role?: RoleType;
  momentTitle?: string;
  actionText?: string;
  action?: () => void;
  gestureAmount?: number;
  gestureStatus?: 'waiting' | 'verified' | 'refunded';
  fromUser?: string;
  toUser?: string;
  isRead?: boolean;
}

interface TodayHighlights {
  proofsVerified: number;
  chatsUnlocked: number;
  newGestures: number;
  unreadNotifications: number;
}

interface UserSettings {
  isKYCCompleted: boolean;
}

interface TabUnreadCounts {
  messages: number;
  trust_loop: number;
  gestures: number;
}

const ActivityScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<TabType>('messages');
  const [userSettings, setUserSettings] = useState<UserSettings>({
    isKYCCompleted: true, // KYC onaylanmış, system mesajı gösterme
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = () => {
    setActivities([
      // Trust Loop Activities
      {
        id: '1',
        type: 'trust_loop',
        icon: 'check-circle-outline',
        iconColor: COLORS.mint,
        emoji: '✅',
        title: 'Proof verified · Chat unlocked',
        subtitle: 'Your connection with Anna is now open.',
        role: 'giver',
        momentTitle: 'Coffee at Soho Café',
        time: '2h ago',
        isRead: false
      },
      {
        id: '2',
        type: 'trust_loop',
        icon: 'timer-outline',
        iconColor: COLORS.softOrange,
        emoji: '⏳',
        title: 'Waiting for proof',
        subtitle: "We're waiting for Mehmet's proof to release your gesture.",
        role: 'giver',
        momentTitle: 'Street food tour in Kadıköy',
        time: '1d ago',
        isRead: true
      },
      {
        id: '3',
        type: 'trust_loop',
        icon: 'shield-lock-outline',
        iconColor: COLORS.mint,
        emoji: '🛡️',
        title: 'Your gift is in escrow',
        subtitle: 'Funds locked until proof is verified.',
        role: 'giver',
        momentTitle: 'Local pastry in Lisbon',
        time: '2d ago',
        isRead: true
      },
      {
        id: '4',
        type: 'trust_loop',
        icon: 'alert-circle-outline',
        iconColor: COLORS.softRed,
        emoji: '↩︎',
        title: 'Verification failed — refunded',
        subtitle: "Proof didn't meet requirements. Funds returned to your balance.",
        role: 'giver',
        momentTitle: 'Museum ticket in Berlin',
        time: '3d ago',
        isRead: true
      },
      
      // Gestures
      {
        id: '5',
        type: 'gestures',
        icon: 'gift-outline',
        iconColor: COLORS.mint,
        title: 'You received a gesture',
        subtitle: '$5 coffee gesture for "Morning at Karaköy Güllüoğlu"',
        fromUser: 'Anonymous supporter',
        gestureAmount: 5,
        gestureStatus: 'verified',
        time: '3h ago',
        isRead: true
      },
      {
        id: '6',
        type: 'gestures',
        icon: 'gift-outline',
        iconColor: COLORS.coral,
        title: 'You sent a gesture',
        subtitle: '$12 local meal gesture to Mira',
        toUser: 'Mira',
        gestureAmount: 12,
        gestureStatus: 'waiting',
        time: '5h ago',
        isRead: true
      },
      {
        id: '7',
        type: 'gestures',
        icon: 'gift-outline',
        iconColor: COLORS.mint,
        title: 'You received a gesture',
        subtitle: '$8 metro card gesture for "Istanbul Bosphorus tour"',
        fromUser: 'Kemal',
        gestureAmount: 8,
        gestureStatus: 'verified',
        time: '1d ago',
        isRead: true
      },
      
      // Messages
      {
        id: '8',
        type: 'messages',
        icon: 'message-outline',
        iconColor: COLORS.mint,
        title: 'Chat unlocked with Jessica',
        subtitle: 'Talk about your shared Paris moment.',
        time: '4d ago',
        isRead: true
      },
      {
        id: '9',
        type: 'messages',
        icon: 'message-text-outline',
        iconColor: COLORS.coral,
        title: 'New message from Ahmet',
        subtitle: '"Thank you again for the ferry ride!"',
        time: '1h ago',
        isRead: false
      },
      {
        id: '10',
        type: 'messages',
        icon: 'message-text-outline',
        iconColor: COLORS.coral,
        title: 'New message from Sarah',
        subtitle: '"Are you free this weekend?"',
        time: '30m ago',
        isRead: false
      },
      
      // System
      {
        id: '11',
        type: 'system',
        icon: 'shield-check-outline',
        iconColor: COLORS.softGray,
        title: 'Complete your KYC',
        subtitle: 'Verify your identity to unlock all features.',
        time: 'Nov 7',
        actionText: 'Verify now',
        isRead: true
      }
    ]);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const timeoutId = setTimeout(() => {
      loadActivities();
      setRefreshing(false);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  const tabs = [
    { id: 'messages' as TabType, label: 'Messages' },
    { id: 'trust_loop' as TabType, label: 'Trust Loop' },
    { id: 'gestures' as TabType, label: 'Gestures' },
  ];

  // Calculate unread counts dynamically based on isRead property (optimized with reduce)
  const tabUnreadCounts = useMemo((): TabUnreadCounts => {
    return activities.reduce((acc, activity) => {
      if (activity.isRead === false) {
        if (activity.type === 'messages') acc.messages++;
        else if (activity.type === 'trust_loop') acc.trust_loop++;
        else if (activity.type === 'gestures') acc.gestures++;
      }
      return acc;
    }, { messages: 0, trust_loop: 0, gestures: 0 } as TabUnreadCounts);
  }, [activities]);

  // Calculate today's highlights from actual activities (last 24 hours)
  const todayHighlights = useMemo((): TodayHighlights => {
    // In a real app, you'd filter by timestamp within last 24h
    // For now, we'll count specific types from recent activities
    const todayActivities = activities; // Filter by today's date in production
    
    const proofsVerified = todayActivities.filter(a => 
      a.type === 'trust_loop' && a.title.includes('Proof verified')
    ).length;
    
    const chatsUnlocked = todayActivities.filter(a => 
      (a.type === 'trust_loop' || a.type === 'messages') && a.title.includes('Chat unlocked')
    ).length;
    
    const newGestures = todayActivities.filter(a => 
      a.type === 'gestures' && a.title.includes('received')
    ).length;
    
    const unreadNotifications = tabUnreadCounts.messages + tabUnreadCounts.trust_loop + tabUnreadCounts.gestures;
    
    return {
      proofsVerified,
      chatsUnlocked,
      newGestures,
      unreadNotifications,
    };
  }, [activities, tabUnreadCounts]);

  const filteredActivities = useMemo(() => 
    activities.filter(a => a.type === selectedTab),
    [activities, selectedTab]
  );
  
  const systemActivities = useMemo(() => 
    activities.filter(a => a.type === 'system'),
    [activities]
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Activity</Text>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialCommunityIcons name="tune" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Today's Highlights */}
        <View style={styles.highlightsCard}>
          <View style={styles.highlightsHeader}>
            <MaterialCommunityIcons name="calendar-today" size={18} color={COLORS.text} />
            <Text style={styles.highlightsTitle}>Today's highlights</Text>
          </View>
          <Text style={styles.highlightsSubtitle}>
            {todayHighlights.proofsVerified} proof verified · {todayHighlights.chatsUnlocked} chat unlocked · {todayHighlights.newGestures} new gesture
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.filtersContainer}>
          {tabs.map(tab => {
            const unreadCount = tabUnreadCounts[tab.id];
            const isActive = selectedTab === tab.id;
            
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setSelectedTab(tab.id)}
              >
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {tab.label}
                </Text>
                {unreadCount > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                      {unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.mint} />
          }
        >
          {/* Selected Tab Activities */}
          <View style={styles.section}>
            {filteredActivities.map((activity, index) => (
              <View key={activity.id}>
                <ActivityRow activity={activity} />
                {index < filteredActivities.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>

          {filteredActivities.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="bell-sleep-outline" size={48} color={COLORS.softGray} />
              <Text style={styles.emptyTitle}>All clear</Text>
              <Text style={styles.emptyDescription}>No activity yet</Text>
            </View>
          )}

          {/* System Section (only show if KYC not completed and there are system activities) */}
          {!userSettings.isKYCCompleted && systemActivities.length > 0 && (
            <View style={styles.systemSection}>
              <Text style={styles.systemSectionTitle}>SYSTEM</Text>
              {systemActivities.map((activity, index) => (
                <View key={activity.id}>
                  <SystemRow activity={activity} />
                  {index < systemActivities.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>

      <BottomNav activeTab="Activity" />
    </View>
  );
};

const ActivityRow = ({ activity }: { activity: ActivityItem }) => {
  const getRoleBadge = (role?: RoleType) => {
    if (!role) return null;
    return (
      <View style={[styles.rolePill, role === 'giver' ? styles.rolePillGiver : styles.rolePillReceiver]}>
        <Text style={styles.rolePillText}>
          {role === 'giver' ? 'As Giver' : 'As Receiver'}
        </Text>
      </View>
    );
  };

  const getGestureStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const badgeConfig = {
      waiting: { label: 'Waiting for proof', color: COLORS.softOrange },
      verified: { label: 'Verified', color: COLORS.mint },
      refunded: { label: 'Refunded', color: COLORS.softRed },
    };

    const config = badgeConfig[status as keyof typeof badgeConfig];
    if (!config) return null;

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
        <Text style={[styles.statusBadgeText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.activityRow}>
      <View style={styles.iconDot}>
        <MaterialCommunityIcons name={activity.icon as IconName} size={20} color={activity.iconColor} />
      </View>
      
      <View style={styles.activityContent}>
        <View style={styles.activityTitleRow}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          {activity.emoji && <Text style={styles.activityEmoji}>{activity.emoji}</Text>}
        </View>
        
        {activity.role && activity.momentTitle && (
          <View style={styles.momentRow}>
            {getRoleBadge(activity.role)}
            <Text style={styles.momentTitle}>{activity.momentTitle}</Text>
          </View>
        )}
        
        <Text style={styles.activitySubtitle}>{activity.subtitle}</Text>
        
        {activity.gestureStatus && getGestureStatusBadge(activity.gestureStatus)}
        
        {activity.actionText && (
          <TouchableOpacity style={styles.actionLink} onPress={activity.action}>
            <Text style={styles.actionLinkText}>{activity.actionText}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.activityTime}>{activity.time}</Text>
    </View>
  );
};

const SystemRow = ({ activity }: { activity: ActivityItem }) => (
  <View style={styles.systemRow}>
    <View style={styles.systemIconDot}>
      <MaterialCommunityIcons name={activity.icon} size={20} color={activity.iconColor} />
    </View>
    
    <View style={styles.systemContent}>
      <Text style={styles.systemTitle}>{activity.title}</Text>
      <Text style={styles.systemSubtitle}>{activity.subtitle}</Text>
      {activity.actionText && (
        <TouchableOpacity style={styles.systemActionButton} onPress={activity.action}>
          <Text style={styles.systemActionButtonText}>{activity.actionText}</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={COLORS.mint} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
  },
  filterButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightsCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  highlightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  unreadBadge: {
    backgroundColor: COLORS.coral,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  highlightsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  highlightsSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
  },
  filterTabActive: {
    backgroundColor: COLORS.mint,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: COLORS.coral,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeActive: {
    backgroundColor: COLORS.white,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  tabBadgeTextActive: {
    color: COLORS.mint,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  iconDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(166, 229, 193, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  activityEmoji: {
    fontSize: 14,
  },
  momentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  rolePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  rolePillGiver: {
    backgroundColor: 'rgba(255, 169, 77, 0.15)',
  },
  rolePillReceiver: {
    backgroundColor: 'rgba(166, 229, 193, 0.15)',
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  momentTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  activitySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.softGray,
    marginTop: 2,
  },
  actionLink: {
    marginTop: 8,
  },
  actionLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mint,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 68,
    marginRight: 20,
  },
  systemSection: {
    marginTop: 32,
    marginBottom: 16,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  systemSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.softGray,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  systemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  systemIconDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(184, 180, 175, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemContent: {
    flex: 1,
  },
  systemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  systemSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  systemActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  systemActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mint,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default ActivityScreen;

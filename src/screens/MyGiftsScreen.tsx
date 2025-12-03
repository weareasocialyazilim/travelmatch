import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import EmptyState from '../components/EmptyState';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type MyGiftsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MyGifts'
>;

interface MyGiftsScreenProps {
  navigation: MyGiftsScreenNavigationProp;
}

interface Gift {
  id: string;
  title: string;
  recipient: string;
  location: string;
  status: 'verified' | 'pending';
  icon: IconName;
}

const GIFTS_DATA: Gift[] = [
  {
    id: '1',
    title: 'First Authentic Pizza in Naples',
    recipient: 'Anna K.',
    location: 'Naples, Italy',
    status: 'verified',
    icon: 'ticket-confirmation',
  },
  {
    id: '2',
    title: 'Sunrise Hot Air Balloon Ride',
    recipient: 'Ben C.',
    location: 'Cappadocia, Turkey',
    status: 'verified',
    icon: 'airplane',
  },
  {
    id: '3',
    title: 'Tango Class in Buenos Aires',
    recipient: 'Chloe D.',
    location: 'Buenos Aires, Argentina',
    status: 'pending',
    icon: 'music-note',
  },
];

export const MyGiftsScreen: React.FC<MyGiftsScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={'arrow-left' as IconName}
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Gifts</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total gifted</Text>
            <Text style={styles.statValue}>$250</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Moments completed</Text>
            <Text style={styles.statValue}>5</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Travelers helped</Text>
            <Text style={styles.statValue}>3</Text>
          </View>
        </View>

        {/* Gift List */}
        {GIFTS_DATA.length > 0 ? (
          <View style={styles.giftList}>
            {GIFTS_DATA.map((gift) => (
              <View
                key={gift.id}
                style={[
                  styles.giftCard,
                  gift.status === 'pending' && styles.giftCardPending,
                ]}
              >
                <View style={styles.giftContent}>
                  <View style={styles.giftIconContainer}>
                    <MaterialCommunityIcons
                      name={gift.icon}
                      size={24}
                      color={COLORS.textSecondary}
                    />
                  </View>
                  <View style={styles.giftInfo}>
                    <Text style={styles.giftTitle} numberOfLines={1}>
                      {gift.title}
                    </Text>
                    <Text style={styles.giftMeta} numberOfLines={2}>
                      For {gift.recipient} in {gift.location} •{' '}
                      {gift.status === 'verified' ? 'Approved' : 'Pending'}
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                {gift.status === 'verified' ? (
                  <View style={styles.statusBadgeVerified}>
                    <MaterialCommunityIcons
                      name={'check-decagram' as IconName}
                      size={16}
                      color="#008080"
                    />
                    <Text style={styles.statusBadgeTextVerified}>
                      Proof Received
                    </Text>
                  </View>
                ) : (
                  <View style={styles.statusBadgePending}>
                    <MaterialCommunityIcons
                      name={'clock-outline' as IconName}
                      size={16}
                      color="#F59E0B"
                    />
                    <Text style={styles.statusBadgeTextPending}>
                      Awaiting Proof
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="gift"
            title="No gifts yet"
            subtitle="When you send your first gift, it will appear here."
            illustrationType="no_gifts"
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 6,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  giftList: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  giftCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 16,
  },
  giftCardPending: {
    opacity: 0.7,
  },
  giftContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  giftIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftInfo: {
    flex: 1,
    paddingTop: 4,
  },
  giftTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  giftMeta: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  statusBadgeVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.tealTransparent20,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  statusBadgeTextVerified: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.teal,
  },
  statusBadgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.warningTransparent20,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  statusBadgeTextPending: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
  },
  emptyState: {
    paddingHorizontal: 32,
    paddingTop: 96,
    paddingBottom: 48,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTextContainer: {
    alignItems: 'center',
    maxWidth: 320,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

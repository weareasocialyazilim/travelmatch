import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import type { RootStackParamList } from '../navigation/AppNavigator';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface DisputeItem {
  id: string;
  title: string;
  amount: string;
  date: string;
  status: 'under-review' | 'awaiting-info' | 'resolved';
  imageUrl: string;
}

export const DisputeStatusScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const disputes: DisputeItem[] = [
    {
      id: '1',
      title: 'Tango in Buenos Aires',
      amount: '$75.00',
      date: 'Oct 26, 2023',
      status: 'under-review',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBkX4TpzG0grK7zRWHZoJPa3vkiDPPOLJuK8RIRimEFy2PG-zKBc-jmwm17R-fQ0GgaAYkG3Xo1mI4lxIauFAA8Da9L5oZ4Ar0nFuVwMasGr188FXy4G0GJIDdES3Rr8gzGZGZ7fC7C-bwE9IT5lpgLj54CM3L2OOFgKOduJeLu0PJaG0Kq9p0tzfzjDD3WhHtBtxm0EbkgMhho1JulB4Hf6-LymVM5Za2h-E7bPmVKoIMTm1q4lzio885Blvav1I3nytWQgXx82CiE',
    },
    {
      id: '2',
      title: 'Sunrise Hike in Bali',
      amount: '$50.00',
      date: 'Oct 22, 2023',
      status: 'awaiting-info',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCXrKOkOt37GEMfnZOOMn6nGyyXRAMoMDPoBkdwYJs30OMpZtv0Ree0jn9_6ZtHVThbWTvYNWuudPKhttHfHXknhmoOzfBplKXoQ1-x9sVXewUOZhJ4S-vQefAlWBr49mNliDGJQvKZAzCHogCQRtEvuQ-sOgfp81JeE3pICe03w7xKc6mOvl5dnUyCswgH61ZcPuT0FX_YGp9FMDPXGCQy7EZBEE7C8oMGIOmhyGbFF1-ukFac3VtlfPVq70eDJb_aiilrZSXzmAnv',
    },
    {
      id: '3',
      title: 'Kyoto Temple Tour',
      amount: '$120.00',
      date: 'Sep 15, 2023',
      status: 'resolved',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCXrKOkOt37GEMfnZOOMn6nGyyXRAMoMDPoBkdwYJs30OMpZtv0Ree0jn9_6ZtHVThbWTvYNWuudPKhttHfHXknhmoOzfBplKXoQ1-x9sVXewUOZhJ4S-vQefAlWBr49mNliDGJQvKZAzCHogCQRtEvuQ-sOgfp81JeE3pICe03w7xKc6mOvl5dnUyCswgH61ZcPuT0FX_YGp9FMDPXGCQy7EZBEE7C8oMGIOmhyGbFF1-ukFac3VtlfPVq70eDJb_aiilrZSXzmAnv',
    },
  ];

  const getStatusConfig = (status: DisputeItem['status']) => {
    switch (status) {
      case 'under-review':
        return {
          label: 'Under Review',
          color: COLORS.orange,
          backgroundColor: `${COLORS.orange}1A`,
          dotColor: COLORS.orange,
        };
      case 'awaiting-info':
        return {
          label: 'Awaiting More Info',
          color: COLORS.buttonPrimary,
          backgroundColor: `${COLORS.buttonPrimary}1A`,
          dotColor: COLORS.buttonPrimary,
        };
      case 'resolved':
        return {
          label: 'Resolved',
          color: COLORS.success,
          backgroundColor: `${COLORS.success}1A`,
          dotColor: COLORS.success,
        };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name={'arrow-left' as IconName}
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispute Status</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Disputes List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      >
        {disputes.map((dispute) => {
          const statusConfig = getStatusConfig(dispute.status);
          return (
            <TouchableOpacity
              key={dispute.id}
              style={styles.disputeCard}
              onPress={() => {
                // Navigate to dispute detail
              }}
            >
              <Image
                source={{ uri: dispute.imageUrl }}
                style={styles.disputeImage}
              />
              <View style={styles.disputeContent}>
                <View style={styles.disputeHeader}>
                  <Text style={styles.disputeTitle}>{dispute.title}</Text>
                  <Text style={styles.disputeAmount}>{dispute.amount}</Text>
                </View>
                <Text style={styles.disputeDate}>
                  Submitted: {dispute.date}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusConfig.backgroundColor },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: statusConfig.dotColor },
                    ]}
                  />
                  <Text
                    style={[styles.statusText, { color: statusConfig.color }]}
                  >
                    {statusConfig.label}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
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
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  disputeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  disputeImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: COLORS.gray[100],
  },
  disputeContent: {
    flex: 1,
    gap: 4,
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  disputeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  disputeAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  disputeDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

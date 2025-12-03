import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { RouteProp, NavigationProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '@/constants/colors';
import { logger } from '@/utils/logger';

type NotificationDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  'NotificationDetail'
>;

const NotificationDetailScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<NotificationDetailScreenRouteProp>();
  const { notificationId } = route.params;

  // Mock notification data - in real app, fetch based on notificationId
  const notification = {
    id: notificationId,
    time: '1d',
    title: "Proof approved for 'Galata coffee'",
    description: 'Funds have been released to your wallet.',
    proofImageUrl:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
    moment: {
      title: 'Istanbul Coffee',
      description: 'A moment in Istanbul',
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e',
    },
  };

  const handleOpenRelatedScreen = () => {
    // Navigate to related screen (ProofDetail, MomentDetail, etc.)
    navigation.navigate('ProofHistory', { momentId: 'mock-moment-id' });
  };

  const handleMarkAsRead = () => {
    // Mark notification as read and go back
    logger.info('Mark as read', { notificationId });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
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
        <Text style={styles.headerTitle}>Notification</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Card */}
        <View style={styles.notificationCard}>
          <View style={styles.notificationContent}>
            <Text style={styles.timeText}>{notification.time}</Text>
            <Text style={styles.titleText}>{notification.title}</Text>
            <Text style={styles.descriptionText}>
              {notification.description}
            </Text>
          </View>
          <Image
            source={{ uri: notification.proofImageUrl }}
            style={styles.proofImage}
            resizeMode="cover"
          />
        </View>

        {/* Moment Preview Card */}
        <View style={styles.momentCard}>
          <View style={styles.momentContent}>
            <View style={styles.momentInfo}>
              <Text style={styles.momentTitle}>
                {notification.moment.title}
              </Text>
              <Text style={styles.momentDescription}>
                {notification.moment.description}
              </Text>
            </View>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View moment</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: notification.moment.imageUrl }}
            style={styles.momentImage}
            resizeMode="cover"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleOpenRelatedScreen}
          >
            <Text style={styles.primaryButtonText}>Open related screen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleMarkAsRead}
          >
            <Text style={styles.secondaryButtonText}>Mark as read</Text>
          </TouchableOpacity>
        </View>
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
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginRight: 48,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  notificationCard: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  notificationContent: {
    flex: 2,
  },
  timeText: {
    fontSize: 14,
    color: COLORS.mintDark,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.mintDark,
    lineHeight: 20,
  },
  proofImage: {
    flex: 1,
    aspectRatio: 16 / 9,
    borderRadius: 12,
  },
  momentCard: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  momentContent: {
    flex: 2,
    justifyContent: 'space-between',
  },
  momentInfo: {
    gap: 4,
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  momentDescription: {
    fontSize: 14,
    color: COLORS.mintDark,
  },
  viewButton: {
    height: 32,
    backgroundColor: COLORS.mintBackground,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  momentImage: {
    flex: 1,
    aspectRatio: 16 / 9,
    borderRadius: 12,
  },
  actions: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  primaryButton: {
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  secondaryButton: {
    height: 40,
    backgroundColor: COLORS.mintBackground,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
});

export default NotificationDetailScreen;

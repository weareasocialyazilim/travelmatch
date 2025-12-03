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
import BottomNav from '../components/BottomNav';
import { logger } from '@/utils/logger';
import { COLORS } from '@/constants/colors';

type MomentPublishedScreenRouteProp = RouteProp<
  RootStackParamList,
  'MomentPublished'
>;

const MomentPublishedScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<MomentPublishedScreenRouteProp>();
  const { momentId } = route.params;

  // Mock moment data - in real app, fetch based on momentId
  const moment = {
    id: momentId,
    imageUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1',
  };

  const handleShare = () => {
    // Handle share functionality
    logger.info('Share moment', { momentId });
  };

  const handleViewMoments = () => {
    // Navigate to user's moments list
    navigation.navigate('Discover');
  };

  const handleExploreMoments = () => {
    // Navigate to explore/discover moments
    navigation.navigate('Discover');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Close Button */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.navigate('Discover')}
        >
          <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Moment Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: moment.imageUrl }}
            style={styles.momentImage}
            resizeMode="cover"
          />
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Your moment is live!</Text>
        <Text style={styles.description}>
          Your travel moment has been successfully published and is now visible
          to your supporters.
        </Text>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleShare}>
            <Text style={styles.primaryButtonText}>Share this moment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewMoments}
          >
            <Text style={styles.secondaryButtonText}>View my moments</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleExploreMoments}
          >
            <Text style={styles.secondaryButtonText}>
              Explore other moments
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav activeTab="Discover" />
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
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSpacer: {
    flex: 1,
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 2,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
  },
  momentImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  actions: {
    gap: 12,
    paddingBottom: 32,
  },
  primaryButton: {
    height: 40,
    backgroundColor: COLORS.orange,
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
    backgroundColor: COLORS.beigeLight,
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

export default MomentPublishedScreen;

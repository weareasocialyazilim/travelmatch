import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { RouteProp, NavigationProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants/colors';

type MomentPreviewScreenRouteProp = RouteProp<
  RootStackParamList,
  'MomentPreview'
>;

const { width: _SCREEN_WIDTH } = Dimensions.get('window');

const MomentPreviewScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<MomentPreviewScreenRouteProp>();
  const { momentId } = route.params;

  // Mock moment data - in real app, fetch based on momentId
  const moment = {
    id: momentId,
    title: 'Exploring the Ancient Ruins of Machu Picchu',
    description:
      "Embarking on a journey to the mystical city of Machu Picchu, I'm eager to uncover the secrets of this ancient civilization. Your support fuels this adventure, bringing me closer to the heart of the Andes.",
    date: '10/10/2024',
    amount: '$200',
    proofProtected: true,
    imageUrl: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1',
  };

  const handlePublish = () => {
    // Navigate to published success screen
    navigation.navigate('MomentPublished', { momentId });
  };

  const handleBackToEditing = () => {
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
        <Text style={styles.headerTitle}>Preview</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Moment Card */}
        <View style={styles.momentCard}>
          {/* Image */}
          <Image
            source={{ uri: moment.imageUrl }}
            style={styles.momentImage}
            resizeMode="cover"
          />

          {/* Content */}
          <View style={styles.momentContent}>
            <Text style={styles.momentTitle}>{moment.title}</Text>
            <View style={styles.momentDetails}>
              <Text style={styles.momentDescription}>{moment.description}</Text>
              <Text style={styles.momentMeta}>
                {moment.date} · {moment.amount}
                {moment.proofProtected && ' · ProofLoop Protected'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handlePublish}>
          <Text style={styles.primaryButtonText}>Looks good, publish</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBackToEditing}
        >
          <Text style={styles.secondaryButtonText}>Back to editing</Text>
        </TouchableOpacity>
      </View>
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
    padding: 16,
  },
  momentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  momentImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  momentContent: {
    padding: 16,
  },
  momentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  momentDetails: {
    gap: 8,
  },
  momentDescription: {
    fontSize: 16,
    color: COLORS.mintDark,
    lineHeight: 24,
  },
  momentMeta: {
    fontSize: 16,
    color: COLORS.mintDark,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    gap: 12,
  },
  primaryButton: {
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  secondaryButton: {
    height: 48,
    backgroundColor: COLORS.mintBackground,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});

export default MomentPreviewScreen;

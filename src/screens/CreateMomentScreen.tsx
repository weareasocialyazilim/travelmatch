import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, CARD_SHADOW } from '../constants/colors';
import { VALUES } from '../constants/values';
import { STRINGS } from '../constants/strings';
import { LAYOUT } from '../constants/layout';
import { useNavigation } from '@react-navigation/native';

interface Category {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface Place {
  name: string;
  address: string;
}

const CATEGORIES: Category[] = [
  { id: 'coffee', label: 'Coffee', icon: 'coffee' },
  { id: 'meal', label: 'Meal', icon: 'food' },
  { id: 'ticket', label: 'Ticket', icon: 'ticket' },
  { id: 'transport', label: 'Transport', icon: 'bus' },
  { id: 'experience', label: 'Experience', icon: 'star' },
  { id: 'other', label: 'Other', icon: 'dots-horizontal' },
];

const CreateMomentScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Form state
  const [photo, setPhoto] = useState<string>('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [place, setPlace] = useState<Place | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amount, setAmount] = useState('');
  const [story, setStory] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Memoized handlers
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleDateChange = useCallback((_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  }, []);

  const toggleCard = useCallback((cardId: string) => {
    setExpandedCard(prev => prev === cardId ? null : cardId);
  }, []);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(STRINGS.LABELS.PERMISSION_NEEDED, STRINGS.ERRORS.PHOTO_PERMISSION);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', STRINGS.ERRORS.PHOTO_SELECT);
    }
  };

  const escrowInfo = useMemo(() => {
    const amountNum = parseFloat(amount) || 0;
    
    if (amountNum <= VALUES.ESCROW_DIRECT_MAX) {
      return {
        icon: 'flash' as const,
        color: COLORS.primary,
        title: 'Direct Payment',
        description: '$0-$30: Instant transfer to you when someone gifts.',
      };
    } else if (amountNum <= VALUES.ESCROW_OPTIONAL_MAX) {
      return {
        icon: 'information-outline' as const,
        color: COLORS.softOrange,
        title: 'Giver Chooses',
        description: '$30-$100: Your supporter decides payment method.',
      };
    } else {
      return {
        icon: 'shield-check' as const,
        color: COLORS.success,
        title: 'Proof Required',
        description: '$100+: Escrow protected. Upload proof to receive funds.',
      };
    }
  }, [amount]);

  const isFormValid = useMemo(() => {
    return !!(title.trim() && selectedCategory && amount && parseFloat(amount) > 0);
  }, [title, selectedCategory, amount]);

  const handlePublish = () => {
    if (!title.trim()) {
      Alert.alert('Title required', STRINGS.ERRORS.TITLE_REQUIRED);
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Category required', STRINGS.ERRORS.CATEGORY_REQUIRED);
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Amount required', STRINGS.ERRORS.AMOUNT_REQUIRED);
      return;
    }

    Alert.alert('Success!', 'Your moment has been published', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share a Moment</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Photo Section */}
          <TouchableOpacity 
            style={styles.photoSection} 
            onPress={pickImage}
            activeOpacity={0.9}
          >
            {photo ? (
              <>
                <Image source={{ uri: photo }} style={styles.heroImage} />
                <View style={styles.photoOverlay}>
                  <MaterialCommunityIcons name="camera" size={32} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.photoOverlayText}>Change Photo</Text>
                </View>
              </>
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialCommunityIcons name="camera-plus" size={64} color={COLORS.textTertiary} />
                <Text style={styles.photoPlaceholderText}>Add a photo that tells your story</Text>
                <Text style={styles.photoPlaceholderSubtext}>Tap to choose from gallery</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Title Input - Overlay Style */}
          <View style={styles.titleSection}>
            <TextInput
              style={styles.titleInput}
              placeholder="Give your moment a title..."
              placeholderTextColor={COLORS.textTertiary}
              value={title}
              onChangeText={setTitle}
              maxLength={VALUES.TITLE_MAX_LENGTH}
              multiline
            />
            <Text style={styles.titleCounter}>{title.length}/{VALUES.TITLE_MAX_LENGTH}</Text>
          </View>

          {/* Category Chips - Horizontal Scroll */}
          <View style={styles.categorySection}>
            <Text style={styles.sectionLabel}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id && styles.categoryChipSelected
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons 
                    name={category.icon} 
                    size={20} 
                    color={selectedCategory === category.id ? COLORS.text : COLORS.textSecondary} 
                  />
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category.id && styles.categoryChipTextSelected
                  ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Details Cards */}
          <View style={styles.detailsSection}>
            {/* Location Card */}
            <TouchableOpacity 
              style={styles.detailCard}
              onPress={() => {
                setPlace({ name: 'Café Kitsuné', address: 'Paris, France' });
              }}
              activeOpacity={0.8}
            >
              <View style={styles.detailCardHeader}>
                <View style={styles.detailCardIcon}>
                  <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.detailCardContent}>
                  <Text style={styles.detailCardLabel}>Location</Text>
                  {place ? (
                    <View>
                      <Text style={styles.detailCardValue}>{place.name}</Text>
                      <Text style={styles.detailCardSubvalue}>{place.address}</Text>
                    </View>
                  ) : (
                    <Text style={styles.detailCardPlaceholder}>Choose a real place</Text>
                  )}
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textTertiary} />
              </View>
            </TouchableOpacity>

            {/* Date Card */}
            <TouchableOpacity 
              style={styles.detailCard}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <View style={styles.detailCardHeader}>
                <View style={styles.detailCardIcon}>
                  <MaterialCommunityIcons name="calendar" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.detailCardContent}>
                  <Text style={styles.detailCardLabel}>When</Text>
                  <Text style={styles.detailCardValue}>
                    {selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textTertiary} />
              </View>
            </TouchableOpacity>

            {/* Amount Card */}
            <View style={styles.detailCard}>
              <View style={styles.detailCardHeader}>
                <View style={styles.detailCardIcon}>
                  <MaterialCommunityIcons name="currency-usd" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.detailCardContent}>
                  <Text style={styles.detailCardLabel}>Amount</Text>
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0"
                      placeholderTextColor={COLORS.textTertiary}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="decimal-pad"
                      maxLength={6}
                    />
                  </View>
                </View>
              </View>
              
              {/* Escrow Info */}
              {amount && parseFloat(amount) > 0 && (
                <View style={[styles.escrowInfo, { borderColor: escrowInfo.color + '20' }]}>
                  <MaterialCommunityIcons 
                    name={escrowInfo.icon} 
                    size={18} 
                    color={escrowInfo.color} 
                  />
                  <View style={styles.escrowTextContainer}>
                    <Text style={[styles.escrowTitle, { color: escrowInfo.color }]}>
                      {escrowInfo.title}
                    </Text>
                    <Text style={styles.escrowDescription}>{escrowInfo.description}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Story Section - Optional */}
          <View style={styles.storySection}>
            <Text style={styles.sectionLabel}>
              Why this matters <Text style={styles.optionalLabel}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.storyInput}
              placeholder="Share the story behind this moment..."
              placeholderTextColor={COLORS.textTertiary}
              value={story}
              onChangeText={setStory}
              multiline
              numberOfLines={4}
              maxLength={VALUES.STORY_MAX_LENGTH}
              textAlignVertical="top"
            />
            <Text style={styles.storyCounter}>{story.length}/{VALUES.STORY_MAX_LENGTH}</Text>
          </View>

          {/* Live Preview */}
          {(photo || title || selectedCategory || amount) && (
            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>PREVIEW</Text>
              <View style={styles.previewCard}>
                {/* Preview Image */}
                {photo && (
                  <View style={styles.previewImageContainer}>
                    <Image source={{ uri: photo }} style={styles.previewImage} />
                
                    {/* User Badge */}
                    <View style={styles.userBadge}>
                      <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>Y</Text>
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>Your Name</Text>
                        <Text style={styles.userRole}>Traveler</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Preview Content */}
                <View style={styles.previewContent}>
                  <Text style={styles.previewTitle} numberOfLines={2}>
                    {title || 'Your moment title'}
                  </Text>
                  {story && (
                    <Text style={styles.previewStory} numberOfLines={3}>
                      {story}
                    </Text>
                  )}
                  {place && (
                    <Text style={styles.previewLocation}>
                      {place.name}
                    </Text>
                  )}

                  <View style={styles.previewDetails}>
                    {place && (
                      <View style={styles.previewDetailItem}>
                        <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.previewDetailText}>{place.name}</Text>
                      </View>
                    )}
                    <View style={styles.previewDetailItem}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.previewDetailText}>
                        {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                    {amount && (
                      <View style={styles.previewDetailItem}>
                        <MaterialCommunityIcons name="currency-usd" size={16} color={COLORS.textSecondary} />
                        <Text style={[styles.previewDetailText, styles.previewPrice]}>
                          {amount}
                        </Text>
                      </View>
                    )}
                  </View>

                {parseFloat(amount) >= VALUES.ESCROW_OPTIONAL_MAX && (
                  <View style={styles.previewProofBadge}>
                    <MaterialCommunityIcons name="shield-check" size={14} color="#5BC08A" />
                    <Text style={styles.previewProofText}>ProofLoop Protected</Text>
                  </View>
                )}
                </View>
              </View>
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Sticky Publish Button */}
        <View style={styles.publishSection}>
          {amount && parseFloat(amount) > 0 ? (
            <Text style={styles.publishHint}>
              {(() => {
                const amountNum = parseFloat(amount);
                if (amountNum <= VALUES.ESCROW_DIRECT_MAX) {
                  return 'Direct payment • Instant transfer';
                } else if (amountNum <= VALUES.ESCROW_OPTIONAL_MAX) {
                  return 'Your supporter decides payment method';
                } else {
                  return 'Escrow protected • Proof required';
                }
              })()}
            </Text>
          ) : (
            <Text style={styles.publishHint}>
              Enter amount to see payment terms
            </Text>
          )}
          <TouchableOpacity 
            style={[
              styles.publishButton,
              !isFormValid && styles.publishButtonDisabled
            ]}
            onPress={handlePublish}
            activeOpacity={0.8}
            disabled={!isFormValid}
          >
            <MaterialCommunityIcons name="check" size={20} color={COLORS.text} />
            <Text style={styles.publishButtonText}>Publish Moment</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowDatePicker(Platform.OS !== 'ios');
            if (date) setSelectedDate(date);
          }}
        />
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Photo Section
  photoSection: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.white,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoOverlayText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  photoPlaceholderText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  photoPlaceholderSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  // Title Section
  titleSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    minHeight: 60,
  },
  titleCounter: {
    fontSize: 12,
    color: COLORS.textTertiary,
    textAlign: 'right',
    marginTop: 8,
  },

  // Category Section
  categorySection: {
    paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: LAYOUT.borderRadius.full,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.filterPillActive,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  categoryChipTextSelected: {
    fontWeight: '600',
    color: COLORS.text,
  },

  // Details Section
  detailsSection: {
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    padding: 16,
    ...CARD_SHADOW,
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.filterPillActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCardContent: {
    flex: 1,
  },
  detailCardLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailCardValue: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  detailCardSubvalue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  detailCardPlaceholder: {
    fontSize: 15,
    color: COLORS.textTertiary,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 4,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    padding: 0,
  },
  escrowInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: LAYOUT.borderRadius.sm,
    borderWidth: 1,
  },
  escrowTextContainer: {
    flex: 1,
  },
  escrowTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  escrowDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },

  // Story Section
  storySection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionalLabel: {
    fontWeight: '400',
    color: COLORS.textTertiary,
  },
  storyInput: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    padding: 16,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 100,
    marginTop: 12,
    ...CARD_SHADOW,
  },
  storyCounter: {
    fontSize: 12,
    color: COLORS.textTertiary,
    textAlign: 'right',
    marginTop: 8,
  },

  // Preview Section
  previewSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  previewImageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
    paddingVertical: 6,
    paddingLeft: 6,
    borderRadius: LAYOUT.borderRadius.full,
    backgroundColor: COLORS.cardBackground,
    ...CARD_SHADOW,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  userInfo: {
    gap: 2,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  userRole: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  previewContent: {
    padding: 16,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 26,
  },
  previewLocation: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  previewStory: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  previewDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  previewDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewDetailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  previewPrice: {
    fontWeight: '600',
    color: COLORS.text,
  },
  previewProofBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.successLight,
    borderRadius: LAYOUT.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  previewProofText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },

  // Publish Section
  publishSection: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  publishHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  publishButton: {
    backgroundColor: COLORS.primary,
    borderRadius: LAYOUT.borderRadius.full,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  publishButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  publishButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },

  bottomSpacing: {
    height: 40,
  },
});

export default CreateMomentScreen;

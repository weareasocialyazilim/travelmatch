/**
 * LeaveTrustNoteBottomSheet
 *
 * Hediyeleşme tamamlandıktan sonra tarafların birbirine
 * "Güven Notu" bırakmasını sağlar. TrustJewelry (Rozet) sistemini besler.
 *
 * Features:
 * - 5 yıldız rating
 * - Pozitif/Negatif etiketler
 * - Opsiyonel yorum
 * - Anonim bırakma seçeneği
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, GRADIENTS } from '@/constants/colors';

interface TrustNoteUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

// Detailed note output (for gifts flow)
interface DetailedNoteOutput {
  rating: number;
  tags: string[];
  comment?: string;
  isAnonymous: boolean;
}

// Simple note output (for legacy/simple flows)
type SimpleNoteOutput = string;

interface LeaveTrustNoteBottomSheetProps {
  visible: boolean;
  onClose: () => void;

  // New API (detailed)
  user?: TrustNoteUser;
  giftTitle?: string;
  onSubmit?: (note: DetailedNoteOutput) => void;

  // Legacy API (simple text-only mode)
  /** @deprecated Use `user.name` instead */
  recipientName?: string;
  /** @deprecated Use `giftTitle` instead */
  momentTitle?: string;
  /** @deprecated Use `onSubmit` with DetailedNoteOutput instead */
  onSubmitSimple?: (note: SimpleNoteOutput) => void;

  // Mode control
  /** Use simple text-only mode (legacy behavior) */
  simpleMode?: boolean;
}

const POSITIVE_TAGS = [
  { id: 'friendly', label: 'Samimi 😊', icon: 'emoticon-happy-outline' },
  { id: 'punctual', label: 'Dakik ⏰', icon: 'clock-check-outline' },
  { id: 'generous', label: 'Cömert 🎁', icon: 'gift-outline' },
  { id: 'fun', label: 'Eğlenceli 🎉', icon: 'party-popper' },
  { id: 'respectful', label: 'Saygılı 🙏', icon: 'hand-heart' },
  {
    id: 'communicative',
    label: 'İletişimi İyi 💬',
    icon: 'message-text-outline',
  },
];

const NEGATIVE_TAGS = [
  { id: 'no_show', label: 'Gelmedi', icon: 'account-off-outline' },
  { id: 'late', label: 'Geç Kaldı', icon: 'clock-alert-outline' },
  { id: 'rude', label: 'Kaba', icon: 'emoticon-angry-outline' },
  { id: 'different', label: 'Farklı Kişi', icon: 'account-question-outline' },
];

export const LeaveTrustNoteBottomSheet: React.FC<
  LeaveTrustNoteBottomSheetProps
> = ({
  visible,
  user,
  giftTitle,
  onSubmit,
  onClose,
  // Legacy props
  recipientName,
  momentTitle,
  onSubmitSimple,
  simpleMode = false,
}) => {
  // Resolve props (legacy fallbacks)
  const displayName = user?.name || recipientName || 'Kullanıcı';
  const displayTitle = giftTitle || momentTitle || '';
  const isSimpleMode =
    simpleMode || (!user && (recipientName || momentTitle || onSubmitSimple));

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleRatingPress = useCallback((value: number) => {
    setRating(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleTagToggle = useCallback((tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const handleSubmit = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (isSimpleMode) {
      // Simple mode: just send the comment text
      onSubmitSimple?.(comment.trim());
    } else {
      // Detailed mode: send full rating data
      if (rating === 0) return;
      onSubmit?.({
        rating,
        tags: selectedTags,
        comment: comment.trim() || undefined,
        isAnonymous,
      });
    }
  }, [
    isSimpleMode,
    rating,
    selectedTags,
    comment,
    isAnonymous,
    onSubmit,
    onSubmitSimple,
  ]);

  const isPositiveRating = rating >= 4;
  const displayTags = isPositiveRating
    ? POSITIVE_TAGS
    : rating > 0
      ? NEGATIVE_TAGS
      : [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={styles.bottomSheet}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <View style={styles.handle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Güven Notu Bırak 💝</Text>
              <Text style={styles.subtitle}>
                Bu not, {displayName} için güven rozetlerini oluşturur
              </Text>
            </View>

            {/* User Card */}
            <View style={styles.userCard}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons
                    name="account"
                    size={32}
                    color={COLORS.text.secondary}
                  />
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{displayName}</Text>
                {displayTitle && (
                  <Text style={styles.giftTitle} numberOfLines={1}>
                    {displayTitle}
                  </Text>
                )}
              </View>
            </View>

            {/* Rating Stars */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionLabel}>Deneyimini Puanla</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => handleRatingPress(value)}
                    style={styles.starButton}
                  >
                    <MaterialCommunityIcons
                      name={value <= rating ? 'star' : 'star-outline'}
                      size={40}
                      color={
                        value <= rating
                          ? COLORS.brand.primary
                          : COLORS.border.default
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <Text style={styles.ratingText}>
                  {rating >= 5
                    ? 'Mükemmel! 🌟'
                    : rating >= 4
                      ? 'Çok İyi 😊'
                      : rating >= 3
                        ? 'İyi'
                        : rating >= 2
                          ? 'Orta'
                          : 'Kötü'}
                </Text>
              )}
            </View>

            {/* Tags */}
            {displayTags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={styles.sectionLabel}>
                  {isPositiveRating ? 'Ne Sevdin?' : 'Ne Oldu?'}
                </Text>
                <View style={styles.tagsGrid}>
                  {displayTags.map((tag) => (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.tagChip,
                        selectedTags.includes(tag.id) && styles.tagChipSelected,
                        !isPositiveRating &&
                          selectedTags.includes(tag.id) &&
                          styles.tagChipNegative,
                      ]}
                      onPress={() => handleTagToggle(tag.id)}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          selectedTags.includes(tag.id) &&
                            styles.tagTextSelected,
                        ]}
                      >
                        {tag.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Comment */}
            <View style={styles.commentSection}>
              <Text style={styles.sectionLabel}>Yorum (Opsiyonel)</Text>
              <TextInput
                style={styles.commentInput}
                multiline
                numberOfLines={3}
                placeholder="Deneyimini paylaş..."
                placeholderTextColor={COLORS.text.tertiary}
                value={comment}
                onChangeText={setComment}
                maxLength={300}
              />
              <Text style={styles.charCount}>{comment.length}/300</Text>
            </View>

            {/* Anonymous Toggle */}
            <TouchableOpacity
              style={styles.anonymousRow}
              onPress={() => setIsAnonymous(!isAnonymous)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={
                  isAnonymous ? 'checkbox-marked' : 'checkbox-blank-outline'
                }
                size={24}
                color={
                  isAnonymous ? COLORS.brand.primary : COLORS.text.secondary
                }
              />
              <View style={styles.anonymousText}>
                <Text style={styles.anonymousLabel}>Anonim Bırak</Text>
                <Text style={styles.anonymousDesc}>
                  İsmin görünmez, sadece puan ve etiketler gösterilir
                </Text>
              </View>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                rating === 0 && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={rating === 0}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={rating > 0 ? GRADIENTS.primary : ['#333', '#333']}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons
                  name="heart-plus"
                  size={20}
                  color={
                    rating > 0 ? COLORS.utility.black : COLORS.text.secondary
                  }
                />
                <Text
                  style={[
                    styles.submitText,
                    rating === 0 && styles.submitTextDisabled,
                  ]}
                >
                  Güven Notu Bırak
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Skip Link */}
            <TouchableOpacity style={styles.skipButton} onPress={onClose}>
              <Text style={styles.skipText}>Şimdilik Geç</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay40,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: COLORS.bg.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border.default,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.brand.primary}08`,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  giftTitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.brand.primary,
    marginTop: 8,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.border.default,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagChipSelected: {
    backgroundColor: `${COLORS.brand.primary}15`,
    borderColor: COLORS.brand.primary,
  },
  tagChipNegative: {
    backgroundColor: `${COLORS.feedback.error}15`,
    borderColor: COLORS.feedback.error,
  },
  tagText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  tagTextSelected: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  commentSection: {
    marginBottom: 20,
  },
  commentInput: {
    backgroundColor: `${COLORS.border.default}50`,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    textAlign: 'right',
    marginTop: 4,
  },
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
    paddingVertical: 8,
  },
  anonymousText: {
    flex: 1,
  },
  anonymousLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  anonymousDesc: {
    fontSize: 13,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.utility.black,
  },
  submitTextDisabled: {
    color: COLORS.text.secondary,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    color: COLORS.text.tertiary,
  },
});

export default LeaveTrustNoteBottomSheet;

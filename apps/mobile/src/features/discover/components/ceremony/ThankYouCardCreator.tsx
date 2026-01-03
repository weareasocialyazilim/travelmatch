/**
 * ThankYouCardCreator Component
 *
 * Builder for creating shareable thank you cards after proof verification.
 * Multiple templates, customizable message, and instant sharing.
 *
 * @example
 * ```tsx
 * <ThankYouCardCreator
 *   recipientName={gift.giverName}
 *   momentTitle={gift.momentTitle}
 *   proofPhotos={proofData.photos}
 *   onComplete={handleCardCreated}
 *   onSkip={handleSkip}
 * />
 * ```
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Haptics from 'expo-haptics';
import {
  CEREMONY_SIZES,
  CARD_TEMPLATES,
  type CardTemplate,
} from '@/constants/ceremony';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/spacing';
import { logger } from '@/utils/logger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(
  CEREMONY_SIZES.thankYouCard.width,
  SCREEN_WIDTH - 40,
);
const CARD_HEIGHT = CARD_WIDTH * 0.625;

interface ThankYouCardCreatorProps {
  /** Recipient name (gift giver) */
  recipientName: string;
  /** Moment title */
  momentTitle: string;
  /** Proof photos */
  proofPhotos: string[];
  /** Complete callback with card URL */
  onComplete: (cardUrl: string) => void;
  /** Skip callback */
  onSkip: () => void;
  /** Test ID */
  testID?: string;
}

export const ThankYouCardCreator: React.FC<ThankYouCardCreatorProps> = ({
  recipientName,
  momentTitle,
  proofPhotos,
  onComplete,
  onSkip,
  testID,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>(
    CARD_TEMPLATES[0],
  );
  const [message, setMessage] = useState(
    `${recipientName}, bu harika deneyim için teşekkürler! 💝`,
  );
  const [selectedPhoto, setSelectedPhoto] = useState(proofPhotos[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const viewShotRef = useRef<ViewShot>(null);
  const cardScale = useSharedValue(1);

  const handleTemplateSelect = (template: CardTemplate) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTemplate(template);
    cardScale.value = withSpring(1.02, {}, () => {
      cardScale.value = withSpring(1);
    });
  };

  const handlePhotoSelect = (photo: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPhoto(photo);
  };

  const generateCard = useCallback(async () => {
    if (!viewShotRef.current) return;

    setIsGenerating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Capture the card as image
      const uri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1,
      });

      // In real app: upload to Supabase and get URL
      // For now, just return the local URI
      onComplete(uri);
    } catch (error) {
      logger.error('Error generating card:', error);
      setIsGenerating(false);
    }
  }, [onComplete]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <View style={styles.container} testID={testID}>
      {/* Header */}
      <Animated.View entering={FadeIn} style={styles.header}>
        <Text style={styles.title}>Teşekkür Kartı Oluştur</Text>
        <Text style={styles.subtitle}>
          {recipientName}'a özel bir kart gönder
        </Text>
      </Animated.View>

      {/* Template selector */}
      <Animated.View entering={FadeInRight.delay(100)} style={styles.section}>
        <Text style={styles.sectionTitle}>Tema Seç</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templateList}
        >
          {CARD_TEMPLATES.map((template) => (
            <TouchableOpacity
              key={template.id}
              onPress={() => handleTemplateSelect(template)}
              style={[
                styles.templateButton,
                selectedTemplate.id === template.id &&
                  styles.templateButtonSelected,
              ]}
            >
              <LinearGradient
                colors={[...template.gradient] as [string, string, ...string[]]}
                style={styles.templatePreview}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Text
                style={[
                  styles.templateName,
                  selectedTemplate.id === template.id &&
                    styles.templateNameSelected,
                ]}
              >
                {template.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Photo selector (if multiple photos) */}
      {proofPhotos.length > 1 && (
        <Animated.View entering={FadeInRight.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>Fotoğraf Seç</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoList}
          >
            {proofPhotos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handlePhotoSelect(photo)}
                style={[
                  styles.photoButton,
                  selectedPhoto === photo && styles.photoButtonSelected,
                ]}
              >
                <Image source={{ uri: photo }} style={styles.photoThumbnail} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Card preview */}
      <Animated.View
        entering={FadeIn.delay(300)}
        style={[styles.cardPreviewContainer, cardAnimatedStyle]}
      >
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1 }}
          style={styles.cardPreview}
        >
          <LinearGradient
            colors={
              [...selectedTemplate.gradient] as [string, string, ...string[]]
            }
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Photo */}
            <View style={styles.cardPhotoContainer}>
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.cardPhoto}
                resizeMode="cover"
              />
              <View style={styles.cardPhotoOverlay} />
            </View>

            {/* Content */}
            <View style={styles.cardContent}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: selectedTemplate.textColor },
                ]}
              >
                {momentTitle}
              </Text>
              <Text
                style={[
                  styles.cardMessage,
                  { color: selectedTemplate.textColor },
                ]}
                numberOfLines={3}
              >
                {message}
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.brandContainer}>
                <MaterialCommunityIcons
                  name="heart"
                  size={12}
                  color={selectedTemplate.accentColor}
                />
                <Text
                  style={[
                    styles.brandText,
                    { color: selectedTemplate.accentColor },
                  ]}
                >
                  TravelMatch
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ViewShot>
      </Animated.View>

      {/* Message input */}
      <Animated.View entering={FadeIn.delay(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>Mesajın</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          multiline
          style={styles.messageInput}
          maxLength={150}
          placeholder="Teşekkür mesajını yaz..."
          placeholderTextColor={COLORS.textMuted}
        />
        <Text style={styles.charCount}>{message.length}/150</Text>
      </Animated.View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={onSkip}
          disabled={isGenerating}
        >
          <Text style={styles.skipButtonText}>Atla</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendButton, isGenerating && styles.sendButtonDisabled]}
          onPress={generateCard}
          disabled={isGenerating}
        >
          <LinearGradient
            colors={['#F59E0B', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sendButtonGradient}
          >
            {isGenerating ? (
              <Text style={styles.sendButtonText}>Oluşturuluyor...</Text>
            ) : (
              <>
                <MaterialCommunityIcons
                  name="send"
                  size={18}
                  color={COLORS.white}
                />
                <Text style={styles.sendButtonText}>Kartı Gönder</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xxs,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  templateList: {
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  templateButton: {
    alignItems: 'center',
    padding: SPACING.xs,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryMuted,
  },
  templatePreview: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  templateName: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: SPACING.xxs,
  },
  templateNameSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  photoList: {
    gap: SPACING.sm,
  },
  photoButton: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  photoButtonSelected: {
    borderColor: COLORS.primary,
  },
  photoThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  cardPreviewContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  cardPreview: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  cardPhotoContainer: {
    width: '40%',
    position: 'relative',
  },
  cardPhoto: {
    width: '100%',
    height: '100%',
  },
  cardPhotoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  cardContent: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  cardMessage: {
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.9,
  },
  cardFooter: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '600',
  },
  messageInput: {
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xxs,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: 'auto',
    paddingTop: SPACING.md,
  },
  skipButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: COLORS.surfaceMuted,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sendButton: {
    flex: 2,
    borderRadius: 25,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ThankYouCardCreator;

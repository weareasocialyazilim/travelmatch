/**
 * BulkThankYouScreen
 *
 * MASTER Revizyonu: Moment kapatıldığında tüm bağışçılara toplu teşekkür mesajı
 *
 * Kurallar:
 * 1. Host Moment'ı kapatınca bu ekran açılır
 * 2. Tier 1 (0-30$) bağışçıları SADECE bu ekranla teşekkür alır (chat yok)
 * 3. Tier 2+ zaten Like ile chat açıldıysa ayrıca teşekkür mesajı alabilir
 * 4. Host özelleştirilmiş mesaj yazabilir veya şablon kullanabilir
 * 5. Host 15 saniyelik "Şükran Videosu" çekebilir (OnlyFans tarzı Bulk)
 *
 * @screen BulkThankYouScreen
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { showAlert } from '@/stores/modalStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';
import {
  videoService,
  VIDEO_COMPRESSION_CONFIG,
} from '@/services/videoService';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp, RouteProp } from '@react-navigation/native';

// ============================================
// Types
// ============================================

interface Donor {
  id: string;
  name: string;
  avatar: string;
  totalAmount: number;
  giftCount: number;
  hasChatAccess: boolean; // Already liked for chat
}

interface BulkThankYouParams {
  momentId: string;
  momentTitle: string;
  donors: Donor[];
}

// ============================================
// Template Messages
// ============================================

const THANK_YOU_TEMPLATES = [
  {
    id: 'heartfelt',
    emoji: '❤️',
    label: 'Kalpten Teşekkür',
    message:
      'Bu muhteşem anıyı sizin desteğinizle gerçekleştirdim. Kalbimin en derinlerinden teşekkür ederim! 🙏',
  },
  {
    id: 'adventure',
    emoji: '🌟',
    label: 'Macera Teşekkürü',
    message:
      'Bu macera sizin sayenizde mümkün oldu! Her anı sizinle paylaştığım için çok mutluyum. Teşekkürler! ✨',
  },
  {
    id: 'simple',
    emoji: '🎁',
    label: 'Sade Teşekkür',
    message: 'Desteğiniz için çok teşekkür ederim! Bu anı hep hatırlayacağım.',
  },
  {
    id: 'grateful',
    emoji: '🙏',
    label: 'Minnettar',
    message:
      'Cömertliğiniz beni derinden etkiledi. Bu güzel anıyı sizin sayenizde yaşadım. Sonsuz teşekkürler!',
  },
];

// ============================================
// Main Component
// ============================================

export const BulkThankYouScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'BulkThankYou'>>();

  const { momentId, momentTitle, donors } = route.params as BulkThankYouParams;

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedDonors, setSelectedDonors] = useState<Set<string>>(
    new Set(donors.map((d) => d.id)),
  );

  // Video state - OnlyFans tarzı Bulk Thank You Video
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressAnimation = useRef(new Animated.Value(0)).current;

  // Calculate stats
  const stats = useMemo(() => {
    const selected = donors.filter((d) => selectedDonors.has(d.id));
    return {
      totalDonors: selected.length,
      totalAmount: selected.reduce((sum, d) => sum + d.totalAmount, 0),
      chatAccessCount: selected.filter((d) => d.hasChatAccess).length,
      bulkOnlyCount: selected.filter((d) => !d.hasChatAccess).length,
    };
  }, [donors, selectedDonors]);

  // Get final message
  const finalMessage = useMemo(() => {
    if (customMessage.trim()) return customMessage;
    const template = THANK_YOU_TEMPLATES.find((t) => t.id === selectedTemplate);
    return template?.message || '';
  }, [customMessage, selectedTemplate]);

  // Toggle donor selection
  const toggleDonor = useCallback((donorId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDonors((prev) => {
      const next = new Set(prev);
      if (next.has(donorId)) {
        next.delete(donorId);
      } else {
        next.add(donorId);
      }
      return next;
    });
  }, []);

  // Select template
  const selectTemplate = useCallback((templateId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTemplate(templateId);
    setCustomMessage('');
  }, []);

  // Record thank you video (15 seconds max)
  const handleRecordVideo = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showAlert({
          title: 'İzin Gerekli',
          message: 'Video çekmek için kamera izni gerekli.',
        });
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: VIDEO_COMPRESSION_CONFIG.maxDurationThankYou, // 15 seconds
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setIsCompressing(true);
        setCompressionProgress(0);

        // Animate progress bar
        Animated.timing(progressAnimation, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }).start();

        // Compress video with Master parameters
        const compressed = await videoService.compressVideo(
          asset.uri,
          (progress) => {
            setCompressionProgress(progress.progress);
            Animated.timing(progressAnimation, {
              toValue: progress.progress / 100,
              duration: 300,
              useNativeDriver: false,
            }).start();
          },
        );

        if (compressed.success) {
          setVideoUri(compressed.uri);
          setVideoThumbnail(compressed.thumbnailUri || null);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          showAlert({
            title: 'Hata',
            message: 'Video sıkıştırılamadı. Lütfen tekrar deneyin.',
          });
        }

        setIsCompressing(false);
      }
    } catch (error) {
      logger.error('[BulkThankYou] Video recording error:', error);
      setIsCompressing(false);
      showAlert({
        title: 'Hata',
        message: 'Video çekilemedi.',
      });
    }
  }, [progressAnimation]);

  // Remove recorded video
  const handleRemoveVideo = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVideoUri(null);
    setVideoThumbnail(null);
  }, []);

  // Send bulk thank you
  const handleSend = useCallback(async () => {
    if (!finalMessage.trim() && !videoUri) {
      showAlert({
        title: 'İçerik Gerekli',
        message: 'Lütfen bir teşekkür mesajı yazın veya video çekin.',
      });
      return;
    }

    if (selectedDonors.size === 0) {
      showAlert({
        title: 'Alıcı Seçin',
        message: 'Lütfen en az bir bağışçı seçin.',
      });
      return;
    }

    setIsSending(true);
    setUploadProgress(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      let videoUrl: string | null = null;

      // Upload video if exists
      if (videoUri) {
        setUploadProgress(10);

        // Get signed upload URL from Supabase Storage
        const fileName = `bulk-thank-you/${momentId}/${Date.now()}.mp4`;
        const { data: _uploadData, error: uploadError } = await supabase.storage
          .from('videos')
          .upload(fileName, {
            uri: videoUri,
            type: 'video/mp4',
            name: 'thank-you.mp4',
          } as any);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('videos')
          .getPublicUrl(fileName);

        videoUrl = urlData.publicUrl;
        setUploadProgress(50);
      }

      // Create bulk thank you records
      const thankYouRecords = Array.from(selectedDonors).map((donorId) => ({
        moment_id: momentId,
        sender_id: user.id,
        recipient_id: donorId,
        message: finalMessage || 'Teşekkür videosu gönderildi 🎬',
        video_url: videoUrl,
        type: videoUrl ? 'video_thank_you' : 'bulk_thank_you',
        created_at: new Date().toISOString(),
      }));

      setUploadProgress(70);

      const { error } = await supabase
        .from('thank_you_messages')
        .insert(thankYouRecords);

      if (error) throw error;

      setUploadProgress(85);

      // Update moment status to closed
      await supabase
        .from('moments')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
        })
        .eq('id', momentId);

      setUploadProgress(95);

      // Send push notifications to donors
      await supabase.functions.invoke('send-bulk-notifications', {
        body: {
          type: 'bulk_thank_you',
          recipientIds: Array.from(selectedDonors),
          title: 'Teşekkür Mesajı 🎁',
          body: `${momentTitle} için teşekkür mesajınız var!`,
          data: { momentId },
        },
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // MASTER: Clean up compressed video from device cache
      if (videoUri) {
        try {
          await videoService.cleanupTempFiles(videoUri);
          logger.info('[BulkThankYou] Video cache cleaned up successfully');
        } catch (cleanupError) {
          // Log but don't throw - cleanup failure shouldn't block success
          logger.warn('[BulkThankYou] Cache cleanup failed:', cleanupError);
        }
      }

      showAlert({
        title: 'Gönderildi! 🎉',
        message: `${selectedDonors.size} bağışçıya teşekkür mesajınız gönderildi.`,
        buttons: [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          },
        ],
      });
    } catch (error) {
      logger.error('[BulkThankYou] Send error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert({
        title: 'Hata',
        message: 'Mesajlar gönderilemedi. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsSending(false);
    }
  }, [finalMessage, selectedDonors, momentId, momentTitle, navigation]);

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
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Toplu Teşekkür 💌</Text>
          <Text style={styles.headerSubtitle}>{momentTitle}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalDonors}</Text>
            <Text style={styles.statLabel}>Bağışçı</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>${stats.totalAmount}</Text>
            <Text style={styles.statLabel}>Toplam</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.bulkOnlyCount}</Text>
            <Text style={styles.statLabel}>Sadece Mesaj</Text>
          </View>
        </View>

        {/* Info Banner for Tier 1 donors */}
        {stats.bulkOnlyCount > 0 && (
          <View style={styles.infoBanner}>
            <MaterialCommunityIcons
              name="information"
              size={20}
              color={COLORS.brand.primary}
            />
            <Text style={styles.infoBannerText}>
              {stats.bulkOnlyCount} bağışçı sadece bu mesajı alacak (30$ altı
              hediyeler için chat açılmaz)
            </Text>
          </View>
        )}

        {/* Donor Selection */}
        <Text style={styles.sectionTitle}>Alıcıları Seçin</Text>
        <View style={styles.donorList}>
          {donors.map((donor) => (
            <TouchableOpacity
              key={donor.id}
              style={[
                styles.donorItem,
                selectedDonors.has(donor.id) && styles.donorItemSelected,
              ]}
              onPress={() => toggleDonor(donor.id)}
            >
              <Image
                source={{ uri: donor.avatar }}
                style={styles.donorAvatar}
              />
              <View style={styles.donorInfo}>
                <Text style={styles.donorName}>{donor.name}</Text>
                <Text style={styles.donorStats}>
                  ${donor.totalAmount} · {donor.giftCount} hediye
                </Text>
              </View>
              {donor.hasChatAccess && (
                <View style={styles.chatBadge}>
                  <MaterialCommunityIcons
                    name="message-text"
                    size={12}
                    color={COLORS.mint}
                  />
                </View>
              )}
              <MaterialCommunityIcons
                name={
                  selectedDonors.has(donor.id)
                    ? 'checkbox-marked'
                    : 'checkbox-blank-outline'
                }
                size={24}
                color={
                  selectedDonors.has(donor.id)
                    ? COLORS.brand.primary
                    : COLORS.text.secondary
                }
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Template Selection */}
        <Text style={styles.sectionTitle}>Şablon Seçin</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templateList}
        >
          {THANK_YOU_TEMPLATES.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.templateCard,
                selectedTemplate === template.id && styles.templateCardSelected,
              ]}
              onPress={() => selectTemplate(template.id)}
            >
              <Text style={styles.templateEmoji}>{template.emoji}</Text>
              <Text style={styles.templateLabel}>{template.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Video Recording Section */}
        <Text style={styles.sectionTitle}>🎬 Video Teşekkür (Opsiyonel)</Text>
        <Text style={styles.videoSubtitle}>
          Destekçilerinize özel 15 saniyelik video mesajı gönderin
        </Text>

        {videoUri ? (
          <View style={styles.videoPreviewContainer}>
            {/* Video Thumbnail Preview */}
            {videoThumbnail && (
              <Image
                source={{ uri: videoThumbnail }}
                style={styles.videoThumbnail}
                resizeMode="cover"
              />
            )}

            {/* Overlay with Play Icon */}
            <View style={styles.videoOverlay}>
              <MaterialCommunityIcons
                name="play-circle"
                size={48}
                color="rgba(255,255,255,0.9)"
              />
            </View>

            {/* Remove Video Button */}
            <TouchableOpacity
              style={styles.removeVideoButton}
              onPress={handleRemoveVideo}
            >
              <MaterialCommunityIcons name="close" size={20} color="#FFF" />
            </TouchableOpacity>

            {/* Video Ready Badge */}
            <View style={styles.videoReadyBadge}>
              <MaterialCommunityIcons name="check" size={14} color="#FFF" />
              <Text style={styles.videoReadyText}>Video Hazır</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.recordVideoButton,
              isCompressing && styles.recordVideoButtonDisabled,
            ]}
            onPress={handleRecordVideo}
            disabled={isCompressing}
          >
            {isCompressing ? (
              <View style={styles.compressingContainer}>
                <ActivityIndicator color={COLORS.brand.primary} />
                <Text style={styles.compressingText}>
                  Sıkıştırılıyor... {Math.round(compressionProgress)}%
                </Text>
                {/* Compression Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        width: `${compressionProgress}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ) : (
              <>
                <LinearGradient
                  colors={[COLORS.brand.primary, '#FF6B9D']}
                  style={styles.recordIconGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons
                    name="video-plus"
                    size={28}
                    color="#FFF"
                  />
                </LinearGradient>
                <View style={styles.recordTextContainer}>
                  <Text style={styles.recordButtonText}>Video Çek</Text>
                  <Text style={styles.recordButtonSubtext}>
                    Max 15 saniye · Otomatik sıkıştırma
                  </Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Upload Progress (when sending) */}
        {isSending && uploadProgress > 0 && (
          <View style={styles.uploadProgressContainer}>
            <Text style={styles.uploadProgressLabel}>
              {uploadProgress < 50
                ? '📤 Video yükleniyor...'
                : uploadProgress < 85
                  ? '✉️ Mesajlar gönderiliyor...'
                  : '✅ Tamamlanıyor...'}
            </Text>
            <View style={styles.uploadProgressBarContainer}>
              <LinearGradient
                colors={[COLORS.brand.primary, COLORS.mint]}
                style={[
                  styles.uploadProgressBar,
                  { width: `${uploadProgress}%` },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.uploadProgressText}>
              Şu an {selectedDonors.size} destekçine ipeksi bir teşekkür
              gönderiliyor ✨
            </Text>
          </View>
        )}

        {/* Custom Message */}
        <Text style={styles.sectionTitle}>veya Kendi Mesajınızı Yazın</Text>
        <TextInput
          style={styles.messageInput}
          placeholder="Teşekkür mesajınızı buraya yazın..."
          placeholderTextColor={COLORS.text.secondary}
          multiline
          numberOfLines={4}
          value={customMessage}
          onChangeText={(text) => {
            setCustomMessage(text);
            if (text.trim()) setSelectedTemplate(null);
          }}
          maxLength={500}
        />
        <Text style={styles.charCount}>{customMessage.length}/500</Text>

        {/* Preview */}
        {finalMessage && (
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Önizleme</Text>
            <Text style={styles.previewMessage}>{finalMessage}</Text>
          </View>
        )}
      </ScrollView>

      {/* Send Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={isSending}
        >
          {isSending ? (
            <ActivityIndicator color={COLORS.utility.white} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="send"
                size={20}
                color={COLORS.utility.white}
              />
              <Text style={styles.sendButtonText}>
                {selectedDonors.size} Kişiye Gönder
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },

  // Stats Card
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border.default,
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.brand.primary + '10',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoBannerText: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.brand.primary,
  },

  // Section Title
  sectionTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
    marginTop: 8,
  },

  // Donor List
  donorList: {
    gap: 8,
    marginBottom: 20,
  },
  donorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  donorItemSelected: {
    borderColor: COLORS.brand.primary,
    backgroundColor: COLORS.brand.primary + '05',
  },
  donorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  donorInfo: {
    flex: 1,
  },
  donorName: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  donorStats: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  chatBadge: {
    backgroundColor: COLORS.mint + '20',
    padding: 6,
    borderRadius: 8,
    marginRight: 8,
  },

  // Template List
  templateList: {
    gap: 12,
    paddingVertical: 4,
    marginBottom: 20,
  },
  templateCard: {
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  templateCardSelected: {
    borderColor: COLORS.brand.primary,
    backgroundColor: COLORS.brand.primary + '05',
  },
  templateEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  templateLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
  },

  // Message Input
  messageInput: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    padding: 16,
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'right',
    marginTop: 4,
  },

  // Preview
  previewCard: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  previewLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  previewMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bg.primary,
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.brand.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.utility.white,
  },

  // Video Section Styles
  videoSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginBottom: 16,
    marginTop: -8,
  },
  videoPreviewContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeVideoButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    padding: 8,
  },
  videoReadyBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.mint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  videoReadyText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: '#FFF',
  },
  recordVideoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.brand.primary + '30',
    borderStyle: 'dashed',
    marginBottom: 20,
    gap: 16,
  },
  recordVideoButtonDisabled: {
    opacity: 0.8,
  },
  recordIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordTextContainer: {
    flex: 1,
  },
  recordButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  recordButtonSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  compressingContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  compressingText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.brand.primary,
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.bg.secondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.brand.primary,
    borderRadius: 3,
  },
  uploadProgressContainer: {
    backgroundColor: COLORS.brand.primary + '10',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  uploadProgressLabel: {
    ...TYPOGRAPHY.bodyMedium,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  uploadProgressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.bg.secondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  uploadProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
  uploadProgressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
});

export default BulkThankYouScreen;

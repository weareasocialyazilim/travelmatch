/**
 * ProofReviewScreen
 *
 * Screen for gift senders to review and approve/reject proof submissions.
 * When approved, releases escrow funds to the receiver.
 * When rejected, refunds escrow to the sender.
 */

import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { VALUES } from '@/constants/values';
import { TYPOGRAPHY } from '@/theme/typography';
import { supabase } from '@/config/supabase';
import { useToast } from '@/context/ToastContext';
import { logger } from '@/utils/logger';
import { showAlert } from '@/stores/modalStore';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProofReviewScreenProps = StackScreenProps<
  RootStackParamList,
  'ProofReview'
>;

export const ProofReviewScreen: React.FC<ProofReviewScreenProps> = ({
  navigation,
  route,
}) => {
  const {
    escrowId,
    giftId,
    receiverId,
    receiverName,
    receiverAvatar,
    momentTitle,
    amount,
    proofPhotos,
    proofDescription,
    proofSubmittedAt,
  } = route.params;

  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  const handleApprove = async () => {
    showAlert({
      title: 'Kanıtı Onayla',
      message: `${receiverName}'in kanıtını onaylamak istediğinize emin misiniz? Onayladığınızda ${amount} ₺ alıcıya aktarılacaktır.`,
      buttons: [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          style: 'default',
          onPress: async () => {
            setLoading(true);
            try {
              // Call release_escrow RPC function
              const { error: releaseError } = await supabase.rpc(
                'release_escrow',
                {
                  p_escrow_id: escrowId,
                },
              );

              if (releaseError) {
                throw new Error(
                  `Escrow serbest bırakılamadı: ${releaseError.message}`,
                );
              }

              // Send notification to receiver
              await supabase.from('notifications').insert({
                user_id: receiverId,
                type: 'proof_approved',
                title: 'Kanıtınız onaylandı! 🎉',
                body: `${momentTitle} için kanıtınız onaylandı ve ${amount} ₺ cüzdanınıza eklendi.`,
                data: {
                  escrow_id: escrowId,
                  gift_id: giftId,
                  amount,
                },
              });

              showToast('Kanıt onaylandı, para alıcıya aktarıldı', 'success');
              navigation.navigate('Success', { type: 'proof_approved' });
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'Onaylama sırasında hata oluştu';
              showToast(message, 'error');
              logger.error('Proof approval failed', error as Error);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    });
  };

  const handleReject = async () => {
    showAlert({
      title: 'Kanıtı Reddet',
      message: `${receiverName}'in kanıtını reddetmek istediğinize emin misiniz? Reddettiğinizde ${amount} ₺ size iade edilecektir.`,
      buttons: [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Reddet',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Call refund_escrow RPC function
              const { error: refundError } = await supabase.rpc(
                'refund_escrow',
                {
                  p_escrow_id: escrowId,
                },
              );

              if (refundError) {
                throw new Error(`İade yapılamadı: ${refundError.message}`);
              }

              // Send notification to receiver
              await supabase.from('notifications').insert({
                user_id: receiverId,
                type: 'proof_rejected',
                title: 'Kanıtınız reddedildi 😔',
                body: `${momentTitle} için kanıtınız reddedildi. Lütfen yeni bir kanıt yükleyin.`,
                data: {
                  escrow_id: escrowId,
                  gift_id: giftId,
                },
              });

              showToast('Kanıt reddedildi, ödeme iade edildi', 'info');
              navigation.goBack();
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'Red sırasında hata oluştu';
              showToast(message, 'error');
              logger.error('Proof rejection failed', error as Error);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    });
  };

  const handleExtendTime = async () => {
    showAlert({
      title: 'Süre Uzat',
      message: 'Alıcıya 7 gün daha süre vermek ister misiniz?',
      buttons: [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Uzat',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('escrow_transactions')
                .update({
                  expires_at: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000,
                  ).toISOString(),
                })
                .eq('id', escrowId);

              if (error) throw error;

              showToast('Süre 7 gün uzatıldı', 'success');
            } catch {
              showToast('Süre uzatılamadı', 'error');
            }
          },
        },
      ],
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kanıt İnceleme</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Receiver Info */}
        <View style={styles.receiverCard}>
          <Image
            source={{
              uri: receiverAvatar || '',
            }}
            style={styles.receiverAvatar}
          />
          <View style={styles.receiverInfo}>
            <Text style={styles.receiverName}>{receiverName}</Text>
            <Text style={styles.momentTitle}>{momentTitle}</Text>
          </View>
          <View style={styles.amountBadge}>
            <Text style={styles.amountText}>{amount} ₺</Text>
          </View>
        </View>

        {/* Photo Gallery */}
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Kanıt Fotoğrafları</Text>

          {/* Main Photo */}
          <View style={styles.mainPhotoContainer}>
            <Image
              source={{ uri: proofPhotos[selectedPhoto] }}
              style={styles.mainPhoto}
              resizeMode="cover"
            />
          </View>

          {/* Thumbnails */}
          {proofPhotos.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailScroll}
            >
              {proofPhotos.map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedPhoto(index)}
                  style={[
                    styles.thumbnail,
                    selectedPhoto === index && styles.thumbnailSelected,
                  ]}
                >
                  <Image
                    source={{ uri: photo }}
                    style={styles.thumbnailImage}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Description */}
        {proofDescription && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Açıklama</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{proofDescription}</Text>
            </View>
          </View>
        )}

        {/* Submitted Date */}
        <View style={styles.metaSection}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={18}
            color={COLORS.text.secondary}
          />
          <Text style={styles.metaText}>
            Gönderilme: {formatDate(proofSubmittedAt)}
          </Text>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={COLORS.feedback.info}
          />
          <Text style={styles.infoText}>
            Kanıtı onayladığınızda {amount} ₺ alıcının cüzdanına aktarılacaktır.
            Reddettiğinizde ise tutar size iade edilecektir.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.rejectButton, loading && styles.buttonDisabled]}
            onPress={handleReject}
            disabled={loading}
          >
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={COLORS.feedback.error}
            />
            <Text style={styles.rejectButtonText}>Reddet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.extendButton, loading && styles.buttonDisabled]}
            onPress={handleExtendTime}
            disabled={loading}
          >
            <MaterialCommunityIcons
              name="clock-plus-outline"
              size={20}
              color={COLORS.brand.primary}
            />
            <Text style={styles.extendButtonText}>Süre Uzat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.approveButton, loading && styles.buttonDisabled]}
            onPress={handleApprove}
            disabled={loading}
          >
            <LinearGradient
              colors={[COLORS.feedback.success, '#2E7D32']}
              style={styles.approveGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialCommunityIcons
                name="check"
                size={20}
                color={COLORS.utility.white}
              />
              <Text style={styles.approveButtonText}>
                {loading ? 'İşleniyor...' : 'Onayla'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 1.5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.padding * 2,
    paddingBottom: LAYOUT.padding * 4,
  },
  receiverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    ...VALUES.shadow,
    marginBottom: LAYOUT.padding * 2,
  },
  receiverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.border.default,
  },
  receiverInfo: {
    flex: 1,
    marginLeft: LAYOUT.padding,
  },
  receiverName: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  momentTitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  amountBadge: {
    backgroundColor: COLORS.feedback.success + '20',
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding / 2,
    borderRadius: VALUES.borderRadius,
  },
  amountText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.feedback.success,
  },
  photoSection: {
    marginBottom: LAYOUT.padding * 2,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: LAYOUT.padding,
  },
  mainPhotoContainer: {
    width: '100%',
    height: SCREEN_WIDTH - LAYOUT.padding * 4,
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
    backgroundColor: COLORS.border.default,
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
  },
  thumbnailScroll: {
    marginTop: LAYOUT.padding,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: LAYOUT.padding,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: COLORS.brand.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  descriptionSection: {
    marginBottom: LAYOUT.padding * 2,
  },
  descriptionCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    ...VALUES.shadow,
  },
  descriptionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  metaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.padding * 2,
  },
  metaText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.feedback.info + '15',
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    marginBottom: LAYOUT.padding * 2,
  },
  infoText: {
    flex: 1,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.primary,
    marginLeft: LAYOUT.padding,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: LAYOUT.padding,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.feedback.error + '15',
    paddingVertical: LAYOUT.padding * 1.5,
    paddingHorizontal: LAYOUT.padding,
    borderRadius: VALUES.borderRadius,
    flex: 1,
    gap: 6,
  },
  rejectButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.feedback.error,
  },
  extendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brand.primary + '15',
    paddingVertical: LAYOUT.padding * 1.5,
    paddingHorizontal: LAYOUT.padding,
    borderRadius: VALUES.borderRadius,
    flex: 1,
    gap: 6,
  },
  extendButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.brand.primary,
  },
  approveButton: {
    flex: 1.5,
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
  },
  approveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.padding * 1.5,
    gap: 6,
  },
  approveButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.utility.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default ProofReviewScreen;

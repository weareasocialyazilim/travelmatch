/**
 * EditMomentScreen - Edit existing moment
 *
 * Allows users to edit their own moments:
 * - Title
 * - Price
 * - Image (future)
 * - Status
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useMoments } from '@/hooks/useMoments';
import { logger } from '@/utils/logger';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';

type EditMomentScreenRouteProp = RouteProp<RootStackParamList, 'EditMoment'>;

interface EditMomentScreenProps {
  navigation: any;
  route: EditMomentScreenRouteProp;
}

export const EditMomentScreen = ({
  navigation,
  route,
}: EditMomentScreenProps) => {
  const insets = useSafeAreaInsets();
  const { momentId } = route.params;
  const { getMoment, updateMoment } = useMoments();

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form data
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [originalData, setOriginalData] = useState<{
    title: string;
    price: string;
  } | null>(null);

  // Fetch moment data on mount
  useEffect(() => {
    const fetchMoment = async () => {
      setIsLoading(true);
      try {
        const moment = await getMoment(momentId);
        if (moment) {
          setTitle(moment.title);
          setPrice(String(moment.pricePerGuest || moment.price || 0));
          setImage(moment.images?.[0] || moment.image || '');
          setOriginalData({
            title: moment.title,
            price: String(moment.pricePerGuest || moment.price || 0),
          });
        } else {
          Alert.alert('Hata', 'Moment bulunamadı', [
            { text: 'Tamam', onPress: () => navigation.goBack() },
          ]);
        }
      } catch (error) {
        logger.error('[EditMoment] Failed to fetch moment', {
          error,
          momentId,
        });
        Alert.alert('Hata', 'Moment yüklenemedi', [
          { text: 'Tamam', onPress: () => navigation.goBack() },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoment();
  }, [momentId, getMoment, navigation]);

  // Check if there are changes
  const hasChanges = useCallback(() => {
    if (!originalData) return false;
    return title !== originalData.title || price !== originalData.price;
  }, [title, price, originalData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!hasChanges()) {
      navigation.goBack();
      return;
    }

    // Validate
    if (!title.trim()) {
      Alert.alert('Hata', 'Başlık gerekli');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 1) {
      Alert.alert('Hata', 'Fiyat en az 1 olmalıdır');
      return;
    }

    setIsSaving(true);
    try {
      const updatedMoment = await updateMoment(momentId, {
        title: title.trim(),
        pricePerGuest: priceNum,
      });

      if (updatedMoment) {
        Alert.alert('Başarılı', 'Moment güncellendi', [
          { text: 'Tamam', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Hata', 'Moment güncellenemedi. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      logger.error('[EditMoment] Failed to update moment', { error, momentId });
      Alert.alert('Hata', 'Bir şeyler yanlış gitti. Lütfen tekrar deneyin.');
    } finally {
      setIsSaving(false);
    }
  }, [momentId, title, price, hasChanges, updateMoment, navigation]);

  // Handle close with unsaved changes check
  const handleClose = useCallback(() => {
    if (hasChanges()) {
      Alert.alert(
        'Değişiklikleri Kaydet?',
        'Kaydedilmemiş değişiklikleriniz var.',
        [
          { text: 'Vazgeç', style: 'cancel' },
          {
            text: 'Kaydetmeden Çık',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
          { text: 'Kaydet', onPress: handleSave },
        ],
      );
    } else {
      navigation.goBack();
    }
  }, [hasChanges, handleSave, navigation]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.brand.primary} />
        <Text style={styles.loadingText}>Moment yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={image ? { uri: image } : undefined}
        style={styles.bgImage}
        blurRadius={10}
      >
        <View style={styles.overlay} />

        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.iconBtn}
            disabled={isSaving}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Moment Düzenle</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.iconBtn}
            disabled={isSaving || !hasChanges()}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={COLORS.brand.primary} />
            ) : (
              <Ionicons
                name="checkmark"
                size={24}
                color={
                  hasChanges() ? COLORS.brand.primary : COLORS.text.secondary
                }
              />
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          {/* Image Preview */}
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <ImageBackground
                source={{ uri: image }}
                style={styles.imagePreview}
                imageStyle={styles.imagePreviewBorderRadius}
              >
                <TouchableOpacity style={styles.changePhotoBtn}>
                  <MaterialCommunityIcons
                    name="camera-flip"
                    size={24}
                    color="white"
                  />
                  <Text style={styles.changePhotoText}>Fotoğraf Değiştir</Text>
                </TouchableOpacity>
              </ImageBackground>
            </View>
          ) : null}

          <View style={styles.form}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>BAŞLIK</Text>
              <TextInput
                style={styles.inputTitle}
                value={title}
                onChangeText={setTitle}
                placeholderTextColor="rgba(255,255,255,0.5)"
                placeholder="Moment başlığı"
                maxLength={60}
                editable={!isSaving}
              />
            </View>

            {/* Price Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FİYAT (₺)</Text>
              <TextInput
                style={styles.inputPrice}
                value={price}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setPrice(numericValue);
                }}
                keyboardType="numeric"
                placeholderTextColor="rgba(255,255,255,0.5)"
                placeholder="0"
                maxLength={5}
                editable={!isSaving}
              />
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={COLORS.text.secondary}
              />
              <Text style={styles.infoText}>
                Başlık veya fiyat değişiklikleri anında yansır.
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              (!hasChanges() || isSaving) && styles.saveBtnDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasChanges() || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="black" />
            ) : (
              <Text style={styles.saveBtnText}>Değişiklikleri Kaydet</Text>
            )}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.text.secondary,
    marginTop: 16,
    fontSize: 14,
  },
  bgImage: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { flex: 1, padding: 24, justifyContent: 'space-between' },

  imagePreviewContainer: { alignItems: 'center', marginBottom: 30 },
  imagePreview: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  changePhotoBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changePhotoText: { color: 'white', fontWeight: '600' },

  form: { gap: 24 },
  inputGroup: { gap: 8 },
  label: {
    color: COLORS.brand.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  inputTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingBottom: 8,
  },
  inputPrice: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingBottom: 8,
  },

  infoBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoText: {
    color: COLORS.text.secondary,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },

  saveBtn: {
    backgroundColor: COLORS.brand.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
  imagePreviewBorderRadius: { borderRadius: 20 },
});

export default EditMomentScreen;

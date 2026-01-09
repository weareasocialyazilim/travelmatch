/**
 * LocationPermissionPrompt
 * Graceful degradation when location permission is denied
 * Provides manual city selection as fallback
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { HapticManager } from '@/services/HapticManager';
import { Linking } from 'react-native';
import { COLORS } from '@/constants/colors';

// Popular Turkish cities
const CITIES = [
  { id: '1', name: 'İstanbul', coords: { lat: 41.0082, lng: 28.9784 } },
  { id: '2', name: 'Ankara', coords: { lat: 39.9334, lng: 32.8597 } },
  { id: '3', name: 'İzmir', coords: { lat: 38.4192, lng: 27.1287 } },
  { id: '4', name: 'Antalya', coords: { lat: 36.8969, lng: 30.7133 } },
  { id: '5', name: 'Bursa', coords: { lat: 40.1885, lng: 29.061 } },
  { id: '6', name: 'Adana', coords: { lat: 37.0, lng: 35.3213 } },
  { id: '7', name: 'Gaziantep', coords: { lat: 37.0662, lng: 37.3833 } },
  { id: '8', name: 'Konya', coords: { lat: 37.8746, lng: 32.4932 } },
  { id: '9', name: 'Muğla', coords: { lat: 37.2153, lng: 28.3636 } },
  { id: '10', name: 'Bodrum', coords: { lat: 37.0344, lng: 27.4305 } },
];

interface LocationPermissionPromptProps {
  onCitySelect: (coords: { latitude: number; longitude: number }) => void;
  onRequestPermission: () => void;
}

export const LocationPermissionPrompt: React.FC<
  LocationPermissionPromptProps
> = ({ onCitySelect, onRequestPermission }) => {
  const [showCityPicker, setShowCityPicker] = useState(false);

  const handleCitySelect = (city: (typeof CITIES)[0]) => {
    HapticManager.primaryAction();
    onCitySelect({
      latitude: city.coords.lat,
      longitude: city.coords.lng,
    });
    setShowCityPicker(false);
  };

  const handleOpenSettings = async () => {
    HapticManager.buttonPress();
    await Linking.openSettings();
  };

  return (
    <View style={styles.container}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['rgba(255, 0, 153, 0.2)', 'rgba(204, 255, 0, 0.2)']}
          style={styles.iconGradient}
        >
          <Ionicons
            name="location-outline"
            size={48}
            color={COLORS.brand.secondary}
          />
        </LinearGradient>
      </View>

      {/* Title & Message */}
      <Text style={styles.title}>Konum İzni Kapalı</Text>
      <Text style={styles.message}>
        Yakınındaki anları keşfetmek için{'\n'}konum iznine ihtiyacımız var
      </Text>

      {/* Actions */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onRequestPermission}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.brand.secondary, COLORS.brand.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          <Ionicons name="location" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Konum İznini Aç</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setShowCityPicker(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryButtonText}>Şehir Seç</Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={COLORS.text.secondary}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tertiaryButton}
        onPress={handleOpenSettings}
        activeOpacity={0.8}
      >
        <Text style={styles.tertiaryButtonText}>Ayarları Aç</Text>
      </TouchableOpacity>

      {/* City Picker Modal */}
      <Modal
        visible={showCityPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCityPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCityPicker(false)}
        >
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Şehir Seç</Text>
              <TouchableOpacity onPress={() => setShowCityPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={CITIES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => handleCitySelect(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="location"
                    size={20}
                    color={COLORS.brand.secondary}
                  />
                  <Text style={styles.cityName}>{item.name}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.text.secondary}
                  />
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: COLORS.background.primary,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  primaryButton: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: COLORS.background.secondary,
    marginBottom: 12,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  tertiaryButton: {
    paddingVertical: 12,
  },
  tertiaryButtonText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  cityName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
});

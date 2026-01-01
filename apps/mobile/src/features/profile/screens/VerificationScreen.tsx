/**
 * VerificationScreen - User identity verification for building trust
 * Allows users to upload ID documents to get verified badge
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/constants/colors';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { NetworkGuard } from '@/components/NetworkGuard';

const VerificationScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [frontId, setFrontId] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      setFrontId(result.assets[0].uri);
    }
  };

  return (
    <NetworkGuard offlineMessage="Doğrulama için internet bağlantısı gerekli.">
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Get Verified</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons
              name="shield-account"
              size={80}
              color={COLORS.brand.primary}
            />
          </View>
          <Text style={styles.title}>Build Trust & Vibe Safely</Text>
          <Text style={styles.desc}>
            Verified users get 3x more matches and can host exclusive moments.
          </Text>

          <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
            {frontId ? (
              <Image source={{ uri: frontId }} style={styles.preview} />
            ) : (
              <View style={styles.placeholder}>
                <MaterialCommunityIcons
                  name="card-account-details-outline"
                  size={40}
                  color="rgba(255,255,255,0.5)"
                />
                <Text style={styles.uploadText}>Upload ID (Front)</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, !frontId && styles.disabledBtn]}
            disabled={!frontId}
          >
            <Text style={styles.submitText}>Submit for Review</Text>
          </TouchableOpacity>
        </View>
      </View>
    </NetworkGuard>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  heroIcon: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: `${COLORS.brand.primary}1A`,
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  desc: {
    color: COLORS.textOnDarkSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  uploadBox: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 40,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  uploadText: {
    color: COLORS.textOnDarkSecondary,
    fontWeight: '600',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: COLORS.brand.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#333',
  },
  submitText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
  },
});

export default withErrorBoundary(VerificationScreen, {
  fallbackType: 'generic',
  displayName: 'VerificationScreen',
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { showConfirmation, showToast } from '@/stores/modalStore';
import { userService } from '@/services/userService';

export const DeleteAccountScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const CONFIRMATION_KEY = 'DELETE';

  const handleDelete = () => {
    if (confirmText !== CONFIRMATION_KEY) return;
    Keyboard.dismiss();

    showConfirmation({
      title: 'Hesabını Sil',
      message:
        'Tüm anıların, mesajların ve cüzdan bakiyen kalıcı olarak silinecek. Bu işlem geri alınamaz.',
      confirmText: 'Sonsuza Dek Sil',
      cancelText: 'Vazgeç',
      destructive: true,
      onConfirm: async () => {
        setIsDeleting(true);

        try {
          // CRITICAL: Call backend service to delete all user data (KVKK/GDPR compliance)
          const { success, error } = await userService.deleteAccount();

          if (!success || error) {
            throw error || new Error('Account deletion failed');
          }

          // Success - user is already signed out by userService
          showToast({
            message: 'Hesabın başarıyla silindi',
            type: 'success',
          });

          // Navigate to onboarding
          navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding' as never }],
          });
        } catch (error) {
          setIsDeleting(false);
          showToast({
            message: 'Hesap silinemedi. Lütfen destekle iletişime geçin.',
            type: 'error',
          });
        }
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.warningBox}>
          <MaterialCommunityIcons
            name="alert-decagram"
            size={48}
            color="#FF4444"
          />
          <Text style={styles.warningTitle}>Warning: Irreversible Action</Text>
          <Text style={styles.warningDesc}>
            Deleting your account will remove all your moments, matches, chats,
            and wallet history. Any remaining balance in your wallet will be
            forfeited if not withdrawn.
          </Text>
        </View>

        <Text style={styles.label}>
          To confirm, type "{CONFIRMATION_KEY}" below:
        </Text>

        <TextInput
          style={styles.input}
          placeholder={CONFIRMATION_KEY}
          placeholderTextColor="#666"
          value={confirmText}
          onChangeText={setConfirmText}
          autoCapitalize="characters"
        />

        <TouchableOpacity
          style={[
            styles.deleteBtn,
            (confirmText !== CONFIRMATION_KEY || isDeleting) &&
              styles.disabledBtn,
          ]}
          disabled={confirmText !== CONFIRMATION_KEY || isDeleting}
          onPress={handleDelete}
        >
          {isDeleting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.deleteText}>Permanently Delete Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>I changed my mind, keep it.</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  headerSpacer: { width: 24 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { padding: 24, alignItems: 'center' },
  warningBox: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  warningTitle: {
    color: '#FF4444',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  warningDesc: { color: '#FF8888', textAlign: 'center', lineHeight: 22 },
  label: { color: 'white', fontSize: 16, marginBottom: 12 },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    height: 60,
    borderRadius: 12,
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 40,
  },
  deleteBtn: {
    width: '100%',
    backgroundColor: '#FF4444',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledBtn: { backgroundColor: '#333', opacity: 0.5 },
  deleteText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { padding: 12 },
  cancelText: { color: COLORS.text.secondary, fontWeight: '600' },
});

export default DeleteAccountScreen;
